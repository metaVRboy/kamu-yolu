import { z } from "zod";
import { prisma } from "@/lib/prisma";
import type { InlinedRequest, InlinedResponse } from "@google/genai";
import { gemini, GEMINI_MODEL } from "@/lib/gemini";
import { parseGeminiJson, toGeminiResponseSchema } from "@/lib/geminiSchema";
import { KONU_DAGILIMI } from "@/lib/kpssDenemeKonular";
import { DERS_LABEL, DUZEY_LABEL } from "@/lib/kpssDenemeSabitler";
import { geometriSekli, geometriSorunu, iklimGrafigi, IKLIM_ISTASYONLARI, IL_ADLARI, sutunGrafigi, sutunVerisiTutarli, turkiyeHaritasi, type GeometriSekli } from "@/lib/kpssGorsel";
import { SABLONLAR } from "@/lib/kpssSablon";
import type { DenemeDers, EducationLevel, Prisma } from "@/generated/prisma/client";

/**
 * Gece KPSS soru uretimi (Gemini Batch API, yari fiyat): her duzeyde havuzu en zayif konulara GECE_ADET soru ekler.
 * Her soru ayri bir istekle cevap anahtari gosterilmeden cozulur; cevap tutmazsa ya da tek
 * dogru sik yoksa atilir. Gorselli sorularda model SVG cizmez, yalniz veri verir (sekil koordinatlari,
 * grafik degerleri, il adlari, MGM istasyonu); veri tutarlilik kontrolunden gecer, gorsel kpssGorsel.ts
 * cizicileriyle cizilir ve dogrulayiciya gorselin metin tarifi verilir. Guncel Bilgiler uretilmez (eskiyen bilgi).
 */
export const GECE_ADET = 10;
// Konu basina havuz tavani: soru sayisi / denemedeki adet >= bu deger olan konuya uretilmez (sablonlar
// ve gonderilen sorularla dolan konular Gemini maliyetini sifira indirir).
const TAVAN_GUN = 30;
// Uretim ucuz Flash ile; dogrulama daha guclu Pro ile (Flash kendi hatalarini yakalayamadi:
// iki dogru sikli "hangisi yoktur" sorusu ve uydurma alinti testte gecmisti).
export const DOGRULAMA_MODEL = "gemini-pro-latest";
const HARF = ["A", "B", "C", "D", "E"];
const soruAlanlari = {
  soruMetni: z.string(),
  secenekler: z.array(z.string()).length(5),
  dogruCevap: z.number().int().min(0).max(4),
  aciklama: z.string(),
};
const ikiNokta = z.array(z.string()).length(2);
const aciSemasi = z.object({ tepe: z.string(), a: z.string(), b: z.string() });
const GORSEL_SEMASI = {
  geometri: z.object({
    noktalar: z.array(z.object({ ad: z.string(), x: z.number(), y: z.number() })),
    kenarlar: z.array(ikiNokta),
    kenarEtiketleri: z.array(z.object({ kenar: ikiNokta, metin: z.string() })),
    dikAcilar: z.array(aciSemasi),
    aciEtiketleri: z.array(aciSemasi.extend({ metin: z.string() })),
    eksen: z.boolean(),
  }),
  sutun: z.object({ baslik: z.string(), etiketler: z.array(z.string()), degerler: z.array(z.number()), max: z.number(), adim: z.number() }),
  iklim: z.object({ istasyon: z.enum(Object.keys(IKLIM_ISTASYONLARI) as [string, ...string[]]) }),
  harita: z.object({
    ilNoktalari: z.array(z.object({ etiket: z.string(), il: z.enum(IL_ADLARI as [string, ...string[]]) })),
    taraliIller: z.array(z.enum(IL_ADLARI as [string, ...string[]])),
  }),
};
type GorselTur = keyof typeof GORSEL_SEMASI;
// Gorselsiz istekte gorsel alani hic yok (responseSchema null tipini desteklemiyor).
const uretimSemasi = (tur?: GorselTur) => z.object({ sorular: z.array(z.object({ ...soruAlanlari, ...(tur ? { gorsel: GORSEL_SEMASI[tur] } : {}) })) });
const KontrolSchema = z.object({
  siklar: z.array(z.object({ dogruMu: z.boolean(), gerekce: z.string() })).length(5),
  cevap: z.number().int().min(0).max(4),
  gercekKisiyeAtif: z.boolean(),
  sorun: z.string(),
});

type Duzey = keyof typeof KONU_DAGILIMI;
type Hedef = { ders: DenemeDers; konu: string; adet: number; gorsel?: GorselTur };

const GEOMETRI_KONULARI = new Set(["Özel Üçgenler", "Dörtgenler ve Çokgenler", "Analitik Geometri", "Geometri", "Temel Geometri"]);
const GRAFIK_KONULARI = new Set(["Tablo ve Grafik", "Grafik Problemleri"]);

/** Konunun gorsel turu ve gorselli soru payi (gercek sinavdaki gibi; Sayisal Mantik metinle uretilir). */
function gorselTuru(ders: DenemeDers, konu: string): [GorselTur, number] | null {
  if (GEOMETRI_KONULARI.has(konu)) return ["geometri", 1];
  if (GRAFIK_KONULARI.has(konu)) return ["sutun", 1];
  if (ders === "COGRAFYA") return /iklim/i.test(konu) ? ["iklim", 0.4] : ["harita", 0.25];
  return null;
}

/** Havuzu konu agirligina gore en zayif (soru sayisi / denemedeki adet en dusuk) konular; gorselli pay eksikse gorselli. */
export async function hedefKonular(duzey: Duzey): Promise<Hedef[]> {
  const sorular = await prisma.denemeSoru.findMany({ where: { duzey }, select: { ders: true, konu: true, gorselSvg: true, geometri: true } });
  const adaylar = Object.entries(KONU_DAGILIMI[duzey]).flatMap(([ders, konular]) =>
    konular
      .filter(() => ders !== "GUNCEL")
      .map(([konu, adet]) => ({ ders: ders as DenemeDers, konu, adet, sayi: sorular.filter((s) => s.ders === ders && s.konu === konu).length }))
      // Sablonu olan konuyu kod bedava doldurur; tavandaki konu (sorulari ortalama TAVAN_GUN'de bir cikiyor) da uretilmez.
      .filter((a) => !SABLONLAR.some((s) => s.duzey === duzey && (s.ders ?? "MATEMATIK") === a.ders && s.konu === a.konu) && a.sayi / a.adet < TAVAN_GUN),
  );
  const secim = new Map<string, Hedef>();
  for (let i = 0; i < GECE_ADET && adaylar.length; i++) {
    const a = adaylar.reduce((m, x) => (x.sayi / x.adet < m.sayi / m.adet ? x : m));
    a.sayi++;
    const k = `${a.ders}|${a.konu}`;
    secim.set(k, { ders: a.ders, konu: a.konu, adet: (secim.get(k)?.adet ?? 0) + 1 });
  }
  return [...secim.values()].flatMap((h) => {
    const tur = gorselTuru(h.ders, h.konu);
    if (!tur) return [h];
    const konununki = sorular.filter((s) => s.ders === h.ders && s.konu === h.konu);
    const gorselli = konununki.filter((s) => s.gorselSvg || s.geometri).length;
    const g = Math.min(h.adet, Math.max(0, Math.ceil(tur[1] * (konununki.length + h.adet)) - gorselli));
    return [{ ...h, adet: h.adet - g }, { ...h, adet: g, gorsel: tur[0] }].filter((x) => x.adet > 0);
  });
}

const iklimVerisi = (i: string) => `sıcaklık (°C, Ocak→Aralık) ${IKLIM_ISTASYONLARI[i].sicaklik.join(" ")}; yağış (mm) ${IKLIM_ISTASYONLARI[i].yagis.join(" ")}`;

const GORSEL_TALIMATI: Record<GorselTur, string> = {
  geometri:
    "Her sorunun 'gorsel' alanı soruyla verilen şeklin verisidir. noktalar: şeklin köşe/noktaları ve koordinatları (y yukarı, " +
    "yaklaşık 0-10 aralığı; analitik geometride gerçek koordinatlar). kenarlar: çizilecek doğru parçaları. kenarEtiketleri: şekilde " +
    "kenar üzerine yazılan uzunluk ('6', '2x'). dikAcilar: dik açı işaretleri (tepe ve iki komşu nokta). aciEtiketleri: açı " +
    "ölçüsü ('40°', 'x'). Çizim gerçek ölçülerle tutarlı olmalı: sayısal uzunluklar koordinatlarla aynı oranda, 90° olan açılar " +
    "koordinatlarda da 90°. eksen yalnız analitik geometride true. Soru metni 'Şekilde' diye şekle atıf yapar; çözüm için gereken " +
    "her veri metinde ya da şekilde bulunur. Nokta adları büyük harf (A, B, C...).",
  sutun:
    "Her sorunun 'gorsel' alanı soruyla verilen tek serili sütun grafiğinin verisidir: baslik, etiketler (2-8 kısa etiket), " +
    "degerler, max ve adim. Değerler adim'in tam katı ve 0..max arasında, max adim'in katı ve max/adim en çok 10 (değerler ızgara " +
    "çizgilerinden tam okunsun). Soru metni 'Grafikte' diye grafiğe atıf yapar; değerleri metinde tekrar yazma.",
  iklim:
    "Her sorunun 'gorsel' alanı, soruyla verilen iklim grafiğinin merkezidir (istasyon). Grafik o merkezin MGM uzun yıllar aylık " +
    "ortalama sıcaklık ve yağışıyla çizilir; merkez adı grafikte yazmaz. Soru grafikten çıkarım ister (iklim tipi, yağış rejimi, " +
    "bitki örtüsü, hangi merkez olabileceği). Merkezin adını soru metninde verme. Veriler:\n" +
    Object.keys(IKLIM_ISTASYONLARI)
      .map((i) => `${i}: ${iklimVerisi(i)}`)
      .join("\n"),
  harita:
    "Her sorunun 'gorsel' alanı soruyla verilen Türkiye haritasıdır: ilNoktalari en çok 5 ilin merkezine etiketli nokta koyar " +
    "(etiket 'I', 'II', 'III', 'IV', 'V'), taraliIller haritada taranan illerdir (ikisinden biri boş olabilir). İl adları listedeki " +
    "yazımla aynı. Soru 'Haritada numaralanmış/taralı ...' diye haritaya atıf yapar; işaretli illerin adlarını soru metninde verme. " +
    "Komşu iki ili birlikte numaralandırma (noktalar üst üste biner).",
};

/** Gorsel verisini kontrol edip cizer; dogrulayiciya gidecek tarifle doner. Tutarsizsa null (soru atilir). */
export function gorseliCiz(tur: GorselTur, g: unknown): { svg: string; tarif: string } | null {
  if (tur === "geometri") {
    const s = GORSEL_SEMASI.geometri.parse(g) as GeometriSekli;
    if (geometriSorunu(s)) return null;
    const ac = (d: { tepe: string; a: string; b: string }) => `${d.a}${d.tepe}${d.b}`;
    return {
      svg: geometriSekli(s),
      tarif:
        `Şekil (koordinatlar yalnız noktaların konumunu anlatır, öğrenciye yazılmaz; uzunluk ölçmek için kullanma): ${s.noktalar.map((n) => `${n.ad}(${n.x}, ${n.y})`).join(", ")}. ` +
        `Çizili doğru parçaları: ${s.kenarlar.map((k) => k.join("")).join(", ")}. ` +
        `Kenar etiketleri: ${s.kenarEtiketleri.map((k) => `|${k.kenar.join("")}| = ${k.metin}`).join(", ") || "yok"}. ` +
        `Dik açılar: ${s.dikAcilar.map(ac).join(", ") || "yok"}. Açı etiketleri: ${s.aciEtiketleri.map((d) => `${ac(d)} = ${d.metin}`).join(", ") || "yok"}.` +
        (s.eksen ? " Koordinat eksenleri çizili." : ""),
    };
  }
  if (tur === "sutun") {
    const s = GORSEL_SEMASI.sutun.parse(g);
    if (!sutunVerisiTutarli(s)) return null;
    return {
      svg: sutunGrafigi(s.etiketler, s.degerler, s.max, s.adim, s.baslik),
      tarif: `Sütun grafiği "${s.baslik}" (y ekseni 0-${s.max}, ${s.adim}'er çizgi): ${s.etiketler.map((e, i) => `${e} = ${s.degerler[i]}`).join(", ")}.`,
    };
  }
  if (tur === "iklim") {
    const { istasyon } = GORSEL_SEMASI.iklim.parse(g);
    const v = IKLIM_ISTASYONLARI[istasyon];
    return { svg: iklimGrafigi(v.sicaklik, v.yagis), tarif: `Bir merkezin iklim grafiği (merkez adı yazmaz): aylık ortalama ${iklimVerisi(istasyon)}.` };
  }
  const s = GORSEL_SEMASI.harita.parse(g);
  const etiketler = s.ilNoktalari.map((n) => n.etiket.trim());
  if (!etiketler.length && !s.taraliIller.length) return null;
  if (etiketler.length > 5 || new Set(etiketler).size !== etiketler.length || etiketler.some((e) => !e)) return null;
  return {
    svg: turkiyeHaritasi({ ilNoktalari: s.ilNoktalari, taraliIller: s.taraliIller }),
    tarif:
      "Türkiye haritası (il adları ve sınırları yazmaz, öğrenci yalnız konumları görür)." +
      (s.ilNoktalari.length ? ` İşaretli noktalar: ${s.ilNoktalari.map((n) => `${n.etiket} = ${n.il} il merkezi`).join(", ")}.` : "") +
      (s.taraliIller.length ? ` Taralı iller: ${s.taraliIller.join(", ")}.` : ""),
  };
}

export type Aday = {
  duzey: Duzey;
  ders: DenemeDers;
  konu: string;
  soruMetni: string;
  secenekler: string[];
  dogruCevap: number;
  aciklama: string;
  // Gorselin ham verisi saklanir (SVG eklenirken yeniden cizilir; harita SVG'leri buyuk).
  gorsel: { tur: GorselTur; veri: unknown; tarif: string } | null;
};
export type UretimHedefi = Hedef & { duzey: Duzey; harfler: number[] };

export async function uretimIstegi(h: UretimHedefi): Promise<InlinedRequest> {
  const mevcut = await prisma.denemeSoru.findMany({
    where: { duzey: h.duzey, ders: h.ders, konu: h.konu },
    select: { soruMetni: true, secenekler: true, dogruCevap: true, aciklama: true, gorselSvg: true },
  });
  const benzer = mevcut.filter((m) => !!m.gorselSvg === !!h.gorsel);
  const ornekler = [...(benzer.length ? benzer : mevcut)].sort(() => Math.random() - 0.5).slice(0, 2);
  return {
    contents:
      `Düzey: KPSS ${DUZEY_LABEL[h.duzey]}. Ders: ${DERS_LABEL[h.ders]}. Konu: ${h.konu}.\n` +
      `${h.adet} yeni ${h.gorsel ? "görselli " : ""}soru yaz. Doğru cevaplar sırasıyla şu şıklarda olsun: ${h.harfler.map((i) => HARF[i]).join(", ")}.\n\n` +
      `Üslup ve zorluk için örnekler (bunları tekrar etme):\n${ornekler
        .map((o) => `---\n${o.soruMetni}\n${o.secenekler.map((s, i) => `${HARF[i]}) ${s}`).join("\n")}\nCevap: ${HARF[o.dogruCevap]}\nAçıklama: ${o.aciklama ?? ""}`)
        .join("\n")}\n\n` +
      `Havuzda zaten olan sorular (benzerini yazma):\n${mevcut.slice(0, 25).map((m) => `- ${m.soruMetni.replace(/\s+/g, " ").slice(0, 140)}`).join("\n")}`,
    config: {
      systemInstruction:
        "ÖSYM KPSS sınavı için özgün çoktan seçmeli soru yazarısın. Kurallar: Türkçe ve ÖSYM üslubunda yaz; gerçek ÖSYM sorularını " +
        "kopyalama. soruMetni parçayı/öncülleri VE soru kökünü içerir ve soru işaretiyle (?) biter. Her sorunun 5 şıkkı olur ve " +
        "yalnız BİR şık kesin doğrudur; çeldiriciler makul ama kesin yanlıştır. 'Hangisi yoktur / değildir / yanlıştır' türünde " +
        "diğer dört şıkkın gerçekten doğru olduğunu tek tek kontrol et. Şıklara 'A)' gibi harf yazma. Soru metnine soru numarası koyma. " +
        (h.gorsel ? "" : "Görsel, tablo ya da şekil gerektiren ifade koyma. ") +
        "Gerçek kişilere söz, alıntı ya da görüş atfetme. Bilgi soruları yalnız " +
        "kesin ve tartışmasız bilgiye dayanır; tarih, sayı ve isimlerden emin değilsen o soruyu yazma. Zorluk örneklerdeki düzeyde " +
        "olsun (çok adımlı, gerçek sınav kadar). Açıklama, doğru cevabın neden doğru olduğunu kısaca gösterir. " +
        "Matematik yazımı (sitede üst simge/kesir olarak çizilir): üs her zaman süslü parantezle 2^{x+1} ya da x^{2}; kök " +
        "√{x − 8}; bileşik kesir {pay|payda}; eksi işareti −. ^ işaretini parantezsiz ya da (…) ile yazma." +
        (h.gorsel ? `\n\n${GORSEL_TALIMATI[h.gorsel]}` : ""),
      responseMimeType: "application/json",
      responseSchema: toGeminiResponseSchema(uretimSemasi(h.gorsel)),
    },
  };
}

/** Uretim yanitindan gecerli adaylar: bicim, soru koku ve gorsel tutarliligi kontrolu. */
export function adaylariAyikla(h: UretimHedefi, metin: string): Aday[] {
  const parsed = uretimSemasi(h.gorsel).safeParse(parseGeminiJson(metin));
  if (!parsed.success) throw new Error(`${h.konu}: üretim yanıtı okunamadı`);
  return parsed.data.sorular.flatMap((s): Aday[] => {
    const temiz = { duzey: h.duzey, ders: h.ders, konu: h.konu, soruMetni: s.soruMetni.trim(), secenekler: s.secenekler.map((x) => x.trim()), dogruCevap: s.dogruCevap, aciklama: s.aciklama.trim() };
    if (temiz.soruMetni.length < 20 || !/\?\s*$/.test(temiz.soruMetni) || new Set(temiz.secenekler).size !== 5 || temiz.secenekler.some((x) => !x || /^[A-E]\)/.test(x))) return [];
    if (!h.gorsel) return [{ ...temiz, gorsel: null }];
    try {
      const veri = (s as { gorsel?: unknown }).gorsel;
      const g = gorseliCiz(h.gorsel, veri);
      return g ? [{ ...temiz, gorsel: { tur: h.gorsel, veri, tarif: g.tarif } }] : [];
    } catch {
      return []; // tanimsiz il vb.: cizilemeyen soru atilir
    }
  });
}

/** Cevap anahtari gosterilmeden, her sik ayri ayri degerlendirilerek cozdurme istegi. */
export function dogrulamaIstegi(a: Aday): InlinedRequest {
  return {
    contents:
      `KPSS ${DUZEY_LABEL[a.duzey]} / ${DERS_LABEL[a.ders]} sorusu:\n\n${a.gorsel ? `[Soruyla verilen görsel] ${a.gorsel.tarif}\n\n` : ""}` +
      `${a.soruMetni}\n\n${a.secenekler.map((x, i) => `${HARF[i]}) ${x}`).join("\n")}`,
    config: {
      systemInstruction:
        "Bu bir KPSS sorusu; titiz bir soru denetçisisin. Soruyu adım adım çöz, sonra her şıkkı AYRI AYRI değerlendir: siklar[i].dogruMu " +
        "o şık sorunun istediği cevapsa true. 'Hangisi yoktur/değildir/yanlıştır' türünde, diğer şıkların metinde gerçekten " +
        "bulunduğunu/doğru olduğunu tek tek kanıtla. cevap: doğru şıkkın indeksi (A=0 ... E=4). gercekKisiyeAtif: soruda gerçek " +
        "bir kişiye söz, alıntı ya da görüş atfediliyorsa true. sorun: soru kökü eksikse, bilgi yanlışsa, veri yetersizse ya da " +
        "birden fazla/hiç doğru şık varsa kısaca nedeni; yoksa boş. Soruyla bir görsel verildiyse tarifi başta yazar: yalnız öğrencinin " +
        "görselde görebileceği bilgiyi kullan; soru görselle çözülemiyorsa ya da görselle çelişiyorsa sorun yaz.",
      responseMimeType: "application/json",
      responseSchema: toGeminiResponseSchema(KontrolSchema),
    },
  };
}

/** Kabul: tam olarak bir sik "dogru" isaretli, o sik verilen cevap ve anahtarla ayni, gercek kisiye atif yok. */
export function dogrulandi(a: Aday, metin: string) {
  const k = KontrolSchema.safeParse(parseGeminiJson(metin));
  if (!k.success) return false;
  const dogrular = k.data.siklar.flatMap((x, i) => (x.dogruMu ? [i] : []));
  return dogrular.length === 1 && dogrular[0] === k.data.cevap && k.data.cevap === a.dogruCevap && !k.data.gercekKisiyeAtif && !k.data.sorun.trim();
}

// Batch yanitlari duz nesne gelir (.text getter'i yok): dusunce olmayan parcalar birlestirilir.
const yanitMetni = (r: InlinedResponse | undefined) =>
  r?.response?.candidates?.[0]?.content?.parts
    ?.filter((p) => !p.thought)
    .map((p) => p.text ?? "")
    .join("") ?? "";
/** Maliyet olcumu: dusunme tokenlari cikisa sayilir. */
const tokenlar = (yanitlar: InlinedResponse[]) =>
  yanitlar.reduce((t, r) => {
    const u = r.response?.usageMetadata;
    return { giris: t.giris + (u?.promptTokenCount ?? 0), cikis: t.cikis + (u?.candidatesTokenCount ?? 0) + (u?.thoughtsTokenCount ?? 0) };
  }, { giris: 0, cikis: 0 });

const SURUYOR = new Set(["JOB_STATE_QUEUED", "JOB_STATE_PENDING", "JOB_STATE_RUNNING", "JOB_STATE_UPDATING", "JOB_STATE_PAUSED"]);
const DUZEYLER: Duzey[] = ["LISANS", "ONLISANS", "LISE"];

/**
 * Cron'un her calismasi (2 saatte bir): biten batch islerini isler (uretim -> adaylar dogrulama isine,
 * dogrulama -> gecenler havuza), son uretim isi 23 saatten eskiyse yenisini gonderir.
 */
export async function topluDongu() {
  const ozet = { uretilen: 0, eklenen: 0, gonderilen: 0, hatalar: [] as string[], tokenlar: [] as { tur: string; giris: number; cikis: number }[] };
  for (const is of await prisma.kpssTopluIs.findMany({ where: { durum: "BEKLIYOR" }, orderBy: { olusturma: "asc" } })) {
    const job = await gemini.batches.get({ name: is.ad });
    if (SURUYOR.has(job.state ?? "")) continue;
    // Ust uste binen iki calisma ayni isi iki kez islemesin.
    if ((await prisma.kpssTopluIs.updateMany({ where: { id: is.id, durum: "BEKLIYOR" }, data: { durum: "ISLENIYOR" } })).count !== 1) continue;
    if (job.state !== "JOB_STATE_SUCCEEDED") {
      ozet.hatalar.push(`${is.tur} işi ${job.state}: ${job.error?.message ?? ""}`.slice(0, 200));
      await prisma.kpssTopluIs.update({ where: { id: is.id }, data: { durum: "HATA", bitis: new Date(), sonuc: { durum: job.state ?? null } } });
      continue;
    }
    const yanitlar = job.dest?.inlinedResponses ?? [];
    const t = tokenlar(yanitlar);
    ozet.tokenlar.push({ tur: is.tur, ...t });
    let sonuc: Record<string, number>;
    if (is.tur === "uretim") {
      const adaylar = (is.veri as unknown as UretimHedefi[]).flatMap((h, i) => {
        try {
          return adaylariAyikla(h, yanitMetni(yanitlar[i]));
        } catch (e) {
          ozet.hatalar.push(String(e).slice(0, 200));
          return [];
        }
      });
      ozet.uretilen += adaylar.length;
      if (adaylar.length) {
        const d = await gemini.batches.create({ model: DOGRULAMA_MODEL, src: adaylar.map(dogrulamaIstegi), config: { displayName: "kpss-dogrulama" } });
        await prisma.kpssTopluIs.create({ data: { ad: d.name!, tur: "dogrulama", veri: adaylar as unknown as Prisma.InputJsonValue } });
      }
      sonuc = { aday: adaylar.length };
    } else {
      const adaylar = is.veri as unknown as Aday[];
      let eklenen = 0;
      for (const [i, a] of adaylar.entries()) {
        if (!dogrulandi(a, yanitMetni(yanitlar[i]))) continue;
        if (await prisma.denemeSoru.findFirst({ where: { duzey: a.duzey, soruMetni: a.soruMetni }, select: { id: true } })) continue;
        await prisma.denemeSoru.create({
          data: {
            duzey: a.duzey as EducationLevel,
            ders: a.ders,
            konu: a.konu,
            soruMetni: a.soruMetni,
            secenekler: a.secenekler,
            dogruCevap: a.dogruCevap,
            aciklama: a.aciklama,
            gorselSvg: a.gorsel ? gorseliCiz(a.gorsel.tur, a.gorsel.veri)!.svg : null,
            geometri: GEOMETRI_KONULARI.has(a.konu),
            uretim: "gemini",
            sira: 99_999,
          },
        });
        eklenen++;
      }
      ozet.eklenen += eklenen;
      sonuc = { aday: adaylar.length, eklenen };
    }
    await prisma.kpssTopluIs.update({ where: { id: is.id }, data: { durum: "BITTI", bitis: new Date(), sonuc: { ...sonuc, ...t } } });
  }

  const son = await prisma.kpssTopluIs.findFirst({ where: { tur: "uretim" }, orderBy: { olusturma: "desc" }, select: { olusturma: true } });
  if (!son || Date.now() - son.olusturma.getTime() > 23 * 3600_000) {
    const hedefler: UretimHedefi[] = [];
    for (const duzey of DUZEYLER) {
      // Dogru sik harfleri dengeli dagilsin: bugune kadarki gemini sorulari uzerinden sirayla.
      let harf = await prisma.denemeSoru.count({ where: { duzey, uretim: "gemini" } });
      for (const h of await hedefKonular(duzey)) hedefler.push({ ...h, duzey, harfler: Array.from({ length: h.adet }, () => harf++ % 5) });
    }
    // Butun konular tavandaysa is gonderilmez (bos batch API'de hata verir).
    if (hedefler.length) {
      const u = await gemini.batches.create({ model: GEMINI_MODEL, src: await Promise.all(hedefler.map(uretimIstegi)), config: { displayName: "kpss-uretim" } });
      await prisma.kpssTopluIs.create({ data: { ad: u.name!, tur: "uretim", veri: hedefler as unknown as Prisma.InputJsonValue } });
      ozet.gonderilen = hedefler.reduce((t, h) => t + h.adet, 0);
    }
  }
  return ozet;
}

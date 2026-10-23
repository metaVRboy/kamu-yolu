import { z } from "zod";
import { prisma } from "@/lib/prisma";
import type { InlinedRequest, InlinedResponse } from "@google/genai";
import { gemini, GEMINI_MODEL } from "@/lib/gemini";
import { parseGeminiJson, toGeminiResponseSchema } from "@/lib/geminiSchema";
import { KONU_DAGILIMI } from "@/lib/kpssDenemeKonular";
import { DERS_LABEL, DUZEY_LABEL } from "@/lib/kpssDenemeSabitler";
import { geometriSekli, geometriSorunu, iklimGrafigi, IKLIM_ISTASYONLARI, IL_ADLARI, sutunGrafigi, sutunVerisiTutarli, turkiyeHaritasi, type GeometriSekli } from "@/lib/kpssGorsel";
import { KONTROL_MODEL, topluGonder, topluSonuc, YAZAR_MODEL, type SohbetIstegi } from "@/lib/openrouter";
import type { DenemeDers, EducationLevel, Prisma } from "@/generated/prisma/client";

/**
 * Gunluk KPSS soru uretimi: her duzeyde gunluk denemenin tum konulari icin (gercek sinav dagilimi x FAZLA) yeni soru
 * yazilir; boylece her gun 120 sorunun hepsi ilk kez cikar (Guncel Bilgiler guncelUret ile). Matematik de yazdirilir:
 * sablonlarin sayisi konu adedi kadar, her gun ayni kaliplar donerdi (dunku sorunun sayilari degismis hali secilmez);
 * sablonlar yedek havuz. Yazar ve dogrulayici DeepSeek V4.1 Flash, OpenRouter Batch API (yari fiyat); OpenRouter
 * gonderemezse o gece Gemini Batch (Flash yazar, Pro dogrular). Her soru ayri bir istekle cevap anahtari
 * gosterilmeden cozulur; cevap tutmazsa, tek dogru sik yoksa, dil hatasi varsa ya da cok kolaysa atilir.
 * Gorselli sorularda model SVG cizmez, yalniz veri verir; veri kontrol edilip kpssGorsel.ts ile cizilir.
 */
// Reddedilenler icin fazladan yazdirma (2026-10-23 tam hacim denemesi: adaylarin %72si kontrolden gecti).
const FAZLA = 1.4;
// Tek istekte en fazla bu kadar soru (uzun yanit kesilmesin).
const PARCA = 5;
// OpenRouter yokken (yedek yol) dogrulama Gemini Pro ile: Flash kendi sorularini fazla gecirdi (11/11).
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
  dilHatalari: z.string(),
  zorluk: z.number().int().min(1).max(5),
  sorun: z.string(),
});
const jsonSemasi = (s: z.ZodType) => JSON.stringify(z.toJSONSchema(s));

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

/**
 * Gunun uretim hedefleri: her konu icin denemedeki adet x FAZLA; gorselli pay ayri istek; istekler PARCA'lik.
 * Guncel Bilgiler burada degil (arama gerektirir, guncelUret).
 */
export function gunlukHedefler(duzey: Duzey): Hedef[] {
  const hedefler: Hedef[] = [];
  const parcala = (h: Omit<Hedef, "adet">, adet: number) => {
    for (let k = adet; k > 0; k -= PARCA) hedefler.push({ ...h, adet: Math.min(PARCA, k) });
  };
  for (const [ders, konular] of Object.entries(KONU_DAGILIMI[duzey]) as [DenemeDers, [string, number][]][]) {
    if (ders === "GUNCEL") continue;
    for (const [konu, adet] of konular) {
      const gerek = Math.round(adet * FAZLA);
      const tur = gorselTuru(ders, konu);
      const gorselli = tur ? Math.round(gerek * tur[1]) : 0;
      parcala({ ders, konu }, gerek - gorselli);
      if (tur) parcala({ ders, konu, gorsel: tur[0] }, gorselli);
    }
  }
  return hedefler;
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

// Ilk OpenRouter denemesinde sorular cok kolaydi (cevap = parcadaki cumle, sacma celdirici); bu talimatla
// DeepSeek'in 12 sorusu KPSS ayarinda cikti (2026-10-23).
const ZORLUK_TALIMATI =
  "KPSS ZORLUĞU (çok önemli): Paragraf soruları 5-8 cümlelik, soyut ya da eleştirel üsluplu parçalar olsun; doğru cevap " +
  "parçadaki bir cümlenin aynısı olmasın, yorum ve çıkarım gerektirsin. Çeldiriciler parçadaki kavramları kullanan, ilk bakışta " +
  "doğru görünen ama kesin yanlış ifadeler olsun; saçma ya da konuyla ilgisiz çeldirici yazma. Bilgi soruları öncüllü (I, II, III) " +
  "ya da kavramlar arası ilişki kuran türde olsun; tek adımlı ezber sorusu yazma. Mevzuat bilgisi güncel hâline göre olsun. " +
  "Yazım ve noktalamada TDK kurallarına uy; yabancı sözcük ya da bozuk Türkçe kullanma.";

/** Yazar istemi (saglayicidan bagimsiz): havuzdan 2 ornek + benzeri yazilmasin diye mevcut sorular. */
export async function uretimIstemi(h: UretimHedefi): Promise<SohbetIstegi> {
  const mevcut = await prisma.denemeSoru.findMany({
    where: { duzey: h.duzey, ders: h.ders, konu: h.konu },
    select: { soruMetni: true, secenekler: true, dogruCevap: true, aciklama: true, gorselSvg: true },
  });
  const benzer = mevcut.filter((m) => !!m.gorselSvg === !!h.gorsel);
  const ornekler = [...(benzer.length ? benzer : mevcut)].sort(() => Math.random() - 0.5).slice(0, 2);
  return {
    icerik:
      `Düzey: KPSS ${DUZEY_LABEL[h.duzey]}. Ders: ${DERS_LABEL[h.ders]}. Konu: ${h.konu}.\n` +
      `${h.adet} yeni ${h.gorsel ? "görselli " : ""}soru yaz. Doğru cevaplar sırasıyla şu şıklarda olsun: ${h.harfler.map((i) => HARF[i]).join(", ")}.\n\n` +
      `Üslup ve zorluk için örnekler (bunları tekrar etme):\n${ornekler
        .map((o) => `---\n${o.soruMetni}\n${o.secenekler.map((s, i) => `${HARF[i]}) ${s}`).join("\n")}\nCevap: ${HARF[o.dogruCevap]}\nAçıklama: ${o.aciklama ?? ""}`)
        .join("\n")}\n\n` +
      `Havuzda zaten olan sorular (benzerini yazma):\n${[...mevcut].sort(() => Math.random() - 0.5).slice(0, 25).map((m) => `- ${m.soruMetni.replace(/\s+/g, " ").slice(0, 140)}`).join("\n")}`,
    sistem:
      "ÖSYM KPSS sınavı için özgün çoktan seçmeli soru yazarısın. Kurallar: Türkçe ve ÖSYM üslubunda yaz; gerçek ÖSYM sorularını " +
      "kopyalama. soruMetni parçayı/öncülleri VE soru kökünü içerir ve soru işaretiyle (?) biter. Her sorunun 5 şıkkı olur ve " +
      "yalnız BİR şık kesin doğrudur; çeldiriciler makul ama kesin yanlıştır. 'Hangisi yoktur / değildir / yanlıştır' türünde " +
      "diğer dört şıkkın gerçekten doğru olduğunu tek tek kontrol et. Şıklara 'A)' gibi harf yazma. Soru metnine soru numarası koyma. " +
      (h.gorsel ? "" : "Görsel, tablo ya da şekil gerektiren ifade koyma. ") +
      "Gerçek kişilere söz, alıntı ya da görüş atfetme. Bilgi soruları yalnız " +
      "kesin ve tartışmasız bilgiye dayanır; tarih, sayı ve isimlerden emin değilsen o soruyu yazma. Açıklama, doğru cevabın neden " +
      "doğru olduğunu kısaca gösterir. Matematik yazımı (sitede üst simge/kesir olarak çizilir): üs her zaman süslü parantezle " +
      "2^{x+1} ya da x^{2}; kök √{x − 8}; bileşik kesir {pay|payda}; eksi işareti −. ^ işaretini parantezsiz ya da (…) ile yazma.\n\n" +
      ZORLUK_TALIMATI +
      (h.gorsel ? `\n\n${GORSEL_TALIMATI[h.gorsel]}` : ""),
  };
}

export const uretimIstegiOR = async (h: UretimHedefi): Promise<SohbetIstegi> => {
  const i = await uretimIstemi(h);
  return { ...i, sistem: `${i.sistem}\n\nYalnız bu JSON şemasına uyan JSON döndür, başka metin yazma: ${jsonSemasi(uretimSemasi(h.gorsel))}` };
};
const uretimIstegiGemini = async (h: UretimHedefi): Promise<InlinedRequest> => {
  const i = await uretimIstemi(h);
  return { contents: i.icerik, config: { systemInstruction: i.sistem, responseMimeType: "application/json", responseSchema: toGeminiResponseSchema(uretimSemasi(h.gorsel)) } };
};

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

// Dil ve zorluk alanlari 2026-10-23'te eklendi: dogrulayicilar yalniz dogruluga bakiyordu, bozuk Turkce ("océanı",
// "diplomasik") ve cok kolay sorular geciyordu. Zorluk esigi 2: gercek KPSS ayarindaki sorulara bile 2 verildi.
const KONTROL_TALIMATI =
  "Bu bir KPSS sorusu; titiz bir soru denetçisisin. Soruyu adım adım çöz, sonra her şıkkı AYRI AYRI değerlendir: siklar[i].dogruMu " +
  "o şık sorunun istediği cevapsa true. 'Hangisi yoktur/değildir/yanlıştır' türünde diğer şıkların gerçekten doğru olduğunu tek tek kanıtla. " +
  "cevap: doğru şıkkın indeksi (A=0 ... E=4). gercekKisiyeAtif: soruda gerçek bir kişiye söz, alıntı ya da görüş atfediliyorsa true. " +
  "dilHatalari: yazım, noktalama, dil bilgisi hataları, yabancı ya da uydurma sözcükler (yoksa boş). zorluk: gerçek ÖSYM KPSS sorusuna " +
  "göre 1 (çok kolay, cevap parçada aynen yazıyor ya da çeldiriciler saçma) ... 5 (çok zor). sorun: soru kökü eksikse, öncülde ya da " +
  "seçeneklerde bilgi yanlışsa, bilgi eskimişse (güncel mevzuata göre), veri yetersizse ya da birden fazla/hiç doğru şık varsa kısaca nedeni; " +
  "yoksa boş. Soruyla bir görsel verildiyse tarifi başta yazar: yalnız öğrencinin görselde görebileceği bilgiyi kullan; soru görselle " +
  "çözülemiyorsa ya da görselle çelişiyorsa sorun yaz.";

/** Cevap anahtari gosterilmeden, her sik ayri ayri degerlendirilerek cozdurme istemi. */
export function dogrulamaIstemi(a: Pick<Aday, "duzey" | "ders" | "soruMetni" | "secenekler" | "gorsel">): SohbetIstegi {
  return {
    icerik:
      `KPSS ${DUZEY_LABEL[a.duzey]} / ${DERS_LABEL[a.ders]} sorusu:\n\n${a.gorsel ? `[Soruyla verilen görsel] ${a.gorsel.tarif}\n\n` : ""}` +
      `${a.soruMetni}\n\n${a.secenekler.map((x, i) => `${HARF[i]}) ${x}`).join("\n")}`,
    sistem: KONTROL_TALIMATI,
  };
}
export const dogrulamaIstegiOR = (a: Aday): SohbetIstegi => {
  const i = dogrulamaIstemi(a);
  return { ...i, sistem: `${i.sistem}\n\nYalnız bu JSON şemasına uyan JSON döndür: ${jsonSemasi(KontrolSchema)}` };
};
const dogrulamaIstegiGemini = (a: Aday): InlinedRequest => {
  const i = dogrulamaIstemi(a);
  return { contents: i.icerik, config: { systemInstruction: i.sistem, responseMimeType: "application/json", responseSchema: toGeminiResponseSchema(KontrolSchema) } };
};

/** Kabul: tek dogru sik, o sik anahtarla ayni, gercek kisiye atif yok, dil hatasi yok, cok kolay degil, sorun yok. */
export function dogrulandi(a: Pick<Aday, "dogruCevap">, metin: string) {
  const k = KontrolSchema.safeParse(parseGeminiJson(metin));
  if (!k.success) return false;
  const dogrular = k.data.siklar.flatMap((x, i) => (x.dogruMu ? [i] : []));
  return (
    dogrular.length === 1 && dogrular[0] === k.data.cevap && k.data.cevap === a.dogruCevap && !k.data.gercekKisiyeAtif && !k.data.dilHatalari.trim() && k.data.zorluk >= 2 && !k.data.sorun.trim()
  );
}

const kelimeler = (s: { soruMetni: string; secenekler: string[] }) => new Set([s.soruMetni, ...s.secenekler].join(" ").toLocaleLowerCase("tr").match(/\p{L}{3,}/gu) ?? []);
/** Kelime kumesi benzerligi (Jaccard): havuzdaki bir soruyla %60'tan fazla ortak kelime = ayni sorunun benzeri. */
function benzerMi(a: Set<string>, b: Set<string>) {
  let ortak = 0;
  for (const k of a) if (b.has(k)) ortak++;
  return ortak / (a.size + b.size - ortak || 1) > 0.6;
}

/** Benzerini havuzda ya da ayni partide bulunan adaylari atar (ayni konu + duzey icinde). */
async function benzerleriAt(adaylar: Aday[]): Promise<Aday[]> {
  const havuz = new Map<string, Set<string>[]>();
  const kalan: Aday[] = [];
  for (const a of adaylar) {
    const k = `${a.duzey}|${a.konu}`;
    if (!havuz.has(k)) {
      const mevcut = await prisma.denemeSoru.findMany({ where: { duzey: a.duzey as EducationLevel, konu: a.konu }, select: { soruMetni: true, secenekler: true } });
      havuz.set(k, mevcut.map(kelimeler));
    }
    const ka = kelimeler(a);
    if (havuz.get(k)!.some((m) => benzerMi(ka, m))) continue;
    havuz.get(k)!.push(ka);
    kalan.push(a);
  }
  return kalan;
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
// OpenRouter batch kimlikleri "batch-" ile, Gemini'ninkiler "batches/" ile baslar.
const openRouterMu = (ad: string) => ad.startsWith("batch-");

/** Bir isin sonucu: metinler (istek sirasiyla) + maliyet bilgisi; suruyorsa null. */
async function isSonucu(ad: string): Promise<{ metinler: string[]; olcum: Record<string, number> } | { hata: string } | null> {
  if (openRouterMu(ad)) {
    const r = await topluSonuc(ad);
    if (r.durum === "suruyor") return null;
    return r.durum === "hata" ? { hata: r.mesaj } : { metinler: r.metinler, olcum: { maliyet: r.maliyet } };
  }
  const job = await gemini.batches.get({ name: ad });
  if (SURUYOR.has(job.state ?? "")) return null;
  if (job.state !== "JOB_STATE_SUCCEEDED") return { hata: `${job.state}: ${job.error?.message ?? ""}`.slice(0, 200) };
  const yanitlar = job.dest?.inlinedResponses ?? [];
  return { metinler: yanitlar.map(yanitMetni), olcum: tokenlar(yanitlar) };
}

/** Dogrulama isi: uretim hangi saglayicidaysa orada; OpenRouter gonderemezse Gemini. */
async function dogrulamaGonder(adaylar: Aday[], openRouter: boolean, hatalar: string[]) {
  if (openRouter) {
    try {
      return await topluGonder(KONTROL_MODEL, adaylar.map(dogrulamaIstegiOR));
    } catch (e) {
      hatalar.push(`OpenRouter doğrulama gönderilemedi, Gemini'ye geçildi: ${String(e).slice(0, 150)}`);
    }
  }
  const d = await gemini.batches.create({ model: DOGRULAMA_MODEL, src: adaylar.map(dogrulamaIstegiGemini), config: { displayName: "kpss-dogrulama" } });
  return d.name!;
}

/**
 * Cron'un her calismasi (2 saatte bir): biten batch islerini isler (uretim -> benzer olmayan adaylar dogrulamaya,
 * dogrulama -> gecenler havuza), son uretim isi 23 saatten eskiyse (ya da zorla) gunun hedeflerini gonderir.
 */
export async function topluDongu(zorla = false) {
  const ozet = { uretilen: 0, eklenen: 0, gonderilen: 0, hatalar: [] as string[], olcumler: [] as Record<string, number | string>[] };
  for (const is of await prisma.kpssTopluIs.findMany({ where: { durum: "BEKLIYOR" }, orderBy: { olusturma: "asc" } })) {
    // Saglayici 48 saatte bitirmediyse (OpenRouter en gec 24 saat soyler) is kapatilir; ertesi gun yenisi gider.
    const sonuc = (await isSonucu(is.ad)) ?? (Date.now() - is.olusturma.getTime() > 48 * 3600_000 ? { hata: "48 saatte bitmedi" } : null);
    if (!sonuc) continue;
    // Ust uste binen iki calisma ayni isi iki kez islemesin.
    if ((await prisma.kpssTopluIs.updateMany({ where: { id: is.id, durum: "BEKLIYOR" }, data: { durum: "ISLENIYOR" } })).count !== 1) continue;
    if ("hata" in sonuc) {
      ozet.hatalar.push(`${is.tur} işi ${sonuc.hata}`);
      await prisma.kpssTopluIs.update({ where: { id: is.id }, data: { durum: "HATA", bitis: new Date(), sonuc: { durum: sonuc.hata } } });
      continue;
    }
    ozet.olcumler.push({ tur: is.tur, ...sonuc.olcum });
    let ozetIs: Record<string, number>;
    if (is.tur === "uretim") {
      const ham = (is.veri as unknown as UretimHedefi[]).flatMap((h, i) => {
        try {
          return adaylariAyikla(h, sonuc.metinler[i] ?? "");
        } catch (e) {
          ozet.hatalar.push(String(e).slice(0, 200));
          return [];
        }
      });
      const adaylar = await benzerleriAt(ham);
      ozet.uretilen += adaylar.length;
      if (adaylar.length) {
        const ad = await dogrulamaGonder(adaylar, openRouterMu(is.ad), ozet.hatalar);
        await prisma.kpssTopluIs.create({ data: { ad, tur: "dogrulama", veri: adaylar as unknown as Prisma.InputJsonValue } });
      }
      ozetIs = { aday: ham.length, benzerAtilan: ham.length - adaylar.length };
    } else {
      const adaylar = is.veri as unknown as Aday[];
      const gecenler = adaylar.filter((a, i) => dogrulandi(a, sonuc.metinler[i] ?? ""));
      const varOlan = new Set(
        (await prisma.denemeSoru.findMany({ where: { soruMetni: { in: gecenler.map((a) => a.soruMetni) } }, select: { duzey: true, soruMetni: true } })).map((s) => `${s.duzey}|${s.soruMetni}`),
      );
      const yeni = gecenler.filter((a) => !varOlan.has(`${a.duzey}|${a.soruMetni}`));
      await prisma.denemeSoru.createMany({
        data: yeni.map((a) => ({
          duzey: a.duzey as EducationLevel,
          ders: a.ders,
          konu: a.konu,
          soruMetni: a.soruMetni,
          secenekler: a.secenekler,
          dogruCevap: a.dogruCevap,
          aciklama: a.aciklama,
          gorselSvg: a.gorsel ? gorseliCiz(a.gorsel.tur, a.gorsel.veri)!.svg : null,
          geometri: GEOMETRI_KONULARI.has(a.konu),
          uretim: openRouterMu(is.ad) ? "deepseek" : "gemini",
          sira: 99_999,
        })),
      });
      ozet.eklenen += yeni.length;
      ozetIs = { aday: adaylar.length, eklenen: yeni.length };
    }
    await prisma.kpssTopluIs.update({ where: { id: is.id }, data: { durum: "BITTI", bitis: new Date(), sonuc: { ...ozetIs, ...sonuc.olcum } } });
  }

  const son = await prisma.kpssTopluIs.findFirst({ where: { tur: "uretim" }, orderBy: { olusturma: "desc" }, select: { olusturma: true } });
  if (zorla || !son || Date.now() - son.olusturma.getTime() > 23 * 3600_000) {
    const hedefler: UretimHedefi[] = [];
    for (const duzey of DUZEYLER) {
      // Dogru sik harfleri dengeli dagilsin: bugune kadarki uretilen sorular uzerinden sirayla.
      let harf = await prisma.denemeSoru.count({ where: { duzey, uretim: { in: ["gemini", "deepseek"] } } });
      for (const h of gunlukHedefler(duzey)) hedefler.push({ ...h, duzey, harfler: Array.from({ length: h.adet }, () => harf++ % 5) });
    }
    if (hedefler.length) {
      let ad: string;
      try {
        ad = await topluGonder(YAZAR_MODEL, await Promise.all(hedefler.map(uretimIstegiOR)));
      } catch (e) {
        ozet.hatalar.push(`OpenRouter üretim gönderilemedi, Gemini'ye geçildi: ${String(e).slice(0, 150)}`);
        ad = (await gemini.batches.create({ model: GEMINI_MODEL, src: await Promise.all(hedefler.map(uretimIstegiGemini)), config: { displayName: "kpss-uretim" } })).name!;
      }
      await prisma.kpssTopluIs.create({ data: { ad, tur: "uretim", veri: hedefler as unknown as Prisma.InputJsonValue } });
      ozet.gonderilen = hedefler.reduce((t, h) => t + h.adet, 0);
    }
  }
  return ozet;
}

const GUNCEL_ADET = 8;
const GuncelSchema = z.object({ sorular: z.array(z.object(soruAlanlari)) });

/**
 * Gunluk Guncel Bilgiler sorulari (her duzeye ayni GUNCEL_ADET soru): Gemini Google aramasiyla son 3 ayin dogrulanmis
 * olaylarindan yazar, her soru ayrica aramayla kontrol edilir (uydurma/eskimis bilgi riski diger derslerden yuksek).
 * 23 saatte bir (basarisiz olsa da gunde bir deneme); arama Gemini 3'te ayda 5.000 istege kadar ucretsiz (gunde ~9 istek).
 */
export const GUNCEL_KAYNAK = "KPSS güncel soruları";

/** null: bugun zaten denendi (basarisiz deneme de sayilir; ScrapeRun kaydi cagiranda). */
export async function guncelUret(): Promise<{ eklenen: number; hata?: string } | null> {
  if (await prisma.scrapeRun.findFirst({ where: { sourceName: GUNCEL_KAYNAK, startedAt: { gt: new Date(Date.now() - 23 * 3600_000) } }, select: { id: true } })) return null;
  const bugun = new Intl.DateTimeFormat("tr-TR", { dateStyle: "long", timeZone: "Europe/Istanbul" }).format(new Date());
  const mevcut = await prisma.denemeSoru.findMany({ where: { ders: "GUNCEL", duzey: "LISANS" }, orderBy: { olusturmaTarihi: "desc" }, take: 40, select: { soruMetni: true } });
  const ara = { tools: [{ googleSearch: {} }], abortSignal: AbortSignal.timeout(110_000) };
  try {
    const r = await gemini.models.generateContent({
      model: GEMINI_MODEL,
      contents:
        `Bugün ${bugun}. Son 3 ayda Türkiye'de ve dünyada gerçekleşmiş, KPSS Güncel Bilgiler sorusu olabilecek ${GUNCEL_ADET} farklı olayı ` +
        "(uluslararası kuruluşlar, zirveler, anlaşmalar, ödüller, spor, bilim, kültür, Türkiye'deki önemli kurumsal gelişmeler) Google'da " +
        `doğrulayarak ${GUNCEL_ADET} soru yaz. Her bilgiyi en az bir güvenilir kaynakta doğrula; emin olmadığın olayı kullanma. ` +
        `Daha önce sorulanlar (tekrarlama):\n${mevcut.map((m) => `- ${m.soruMetni.slice(0, 120)}`).join("\n")}\n\n` +
        `5 şık, tek doğru; soru metni soru işaretiyle biter; şıklara harf yazma. Yalnız JSON döndür: ${jsonSemasi(GuncelSchema)}`,
      config: { ...ara, systemInstruction: "ÖSYM KPSS Güncel Bilgiler soru yazarısın. Siyasi görüş, parti ve tartışmalı konu sorma." },
    });
    const parsed = GuncelSchema.safeParse(parseGeminiJson(r.text));
    if (!parsed.success) return { eklenen: 0, hata: "Güncel: üretim yanıtı okunamadı" };
    const adaylar = parsed.data.sorular.filter((s) => /\?\s*$/.test(s.soruMetni.trim()) && new Set(s.secenekler).size === 5);
    const kontroller = await Promise.all(
      adaylar.map(async (s) => {
        const i = dogrulamaIstemi({ duzey: "LISANS", ders: "GUNCEL", soruMetni: s.soruMetni, secenekler: s.secenekler, gorsel: null });
        try {
          const k = await gemini.models.generateContent({
            model: GEMINI_MODEL,
            contents: i.icerik,
            config: { ...ara, systemInstruction: `${i.sistem} Bilgileri Google aramasıyla doğrula (bugün ${bugun}). Yalnız JSON döndür: ${jsonSemasi(KontrolSchema)}` },
          });
          return dogrulandi(s, k.text ?? "");
        } catch {
          return false;
        }
      }),
    );
    // Model dogru cevabi hep A'ya koyuyor (2026-10-23: 7/7): sorudan soruya A..E sirayla, dogru sik o yere tasinir.
    let harf = await prisma.denemeSoru.count({ where: { duzey: "LISANS", uretim: "guncel" } });
    const gecenler = adaylar
      .filter((_, i) => kontroller[i])
      .map((s) => {
        const hedef = harf++ % 5;
        const secenekler = [...s.secenekler];
        [secenekler[s.dogruCevap], secenekler[hedef]] = [secenekler[hedef], secenekler[s.dogruCevap]];
        return { ...s, secenekler, dogruCevap: hedef };
      });
    await prisma.denemeSoru.createMany({
      data: DUZEYLER.flatMap((duzey) =>
        gecenler.map((s) => ({ duzey: duzey as EducationLevel, ders: "GUNCEL" as const, konu: "Güncel Bilgiler", soruMetni: s.soruMetni.trim(), secenekler: s.secenekler.map((x) => x.trim()), dogruCevap: s.dogruCevap, aciklama: s.aciklama.trim(), uretim: "guncel", sira: 99_999 })),
      ),
    });
    return { eklenen: gecenler.length * DUZEYLER.length };
  } catch (e) {
    return { eklenen: 0, hata: `Güncel: ${String(e).slice(0, 200)}` };
  }
}

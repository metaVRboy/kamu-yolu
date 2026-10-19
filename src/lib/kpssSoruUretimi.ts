import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { gemini, GEMINI_MODEL } from "@/lib/gemini";
import { parseGeminiJson, toGeminiSchema } from "@/lib/geminiSchema";
import { KONU_DAGILIMI } from "@/lib/kpssDenemeKonular";
import { DERS_LABEL, DUZEY_LABEL } from "@/lib/kpssDenemeSabitler";
import type { DenemeDers, EducationLevel } from "@/generated/prisma/client";

/**
 * Gece KPSS soru uretimi (Gemini): her duzeyde havuzu en zayif konulara GECE_ADET soru ekler.
 * Her soru ayri bir cagriyla cevap anahtari gosterilmeden cozulur; cevap tutmazsa ya da tek
 * dogru sik yoksa atilir. Gorsel gereken konular (geometri, harita, grafik) ve Guncel Bilgiler
 * uretilmez: elle hazirlanan havuzdan doner (yanlis cizim / eskiyen bilgi riski).
 */
export const GECE_ADET = 10;
// Uretim ucuz Flash ile; dogrulama daha guclu Pro ile (Flash kendi hatalarini yakalayamadi:
// iki dogru sikli "hangisi yoktur" sorusu ve uydurma alinti testte gecmisti).
const DOGRULAMA_MODEL = "gemini-pro-latest";
const HARF = ["A", "B", "C", "D", "E"];
// Cagri basina sure siniri: uretim + dogrulama paralel, en kotu ~200 sn < route maxDuration 300 sn.
// Sinirsiz bir cagri uzayinca Vercel fonksiyonu olduruyor, ScrapeRun "RUNNING" kaliyordu (2026-10-18 gecesi).
const CAGRI_SURESI_MS = 100_000;

/** Cagri basina token sayaci (maliyet olcumu icin; dusunme tokenlari cikisa sayilir). */
export type TokenSayaci = { giris: number; cikis: number; dogrulamaGiris: number; dogrulamaCikis: number };
type Kullanim = { promptTokenCount?: number; candidatesTokenCount?: number; thoughtsTokenCount?: number } | undefined;
const say = (u: Kullanim) => ({ giris: u?.promptTokenCount ?? 0, cikis: (u?.candidatesTokenCount ?? 0) + (u?.thoughtsTokenCount ?? 0) });

const UretimSchema = z.object({
  sorular: z.array(
    z.object({
      soruMetni: z.string(),
      secenekler: z.array(z.string()).length(5),
      dogruCevap: z.number().int().min(0).max(4),
      aciklama: z.string(),
    }),
  ),
});
const KontrolSchema = z.object({
  siklar: z.array(z.object({ dogruMu: z.boolean(), gerekce: z.string() })).length(5),
  cevap: z.number().int().min(0).max(4),
  gercekKisiyeAtif: z.boolean(),
  sorun: z.string(),
});

type Duzey = keyof typeof KONU_DAGILIMI;
type Hedef = { ders: DenemeDers; konu: string; adet: number };

/** Havuzu konu agirligina gore en zayif (soru sayisi / denemedeki adet en dusuk) metin konulari. */
async function hedefKonular(duzey: Duzey): Promise<Hedef[]> {
  const sorular = await prisma.denemeSoru.findMany({ where: { duzey }, select: { ders: true, konu: true, gorselSvg: true, geometri: true } });
  const gorselli = new Set(sorular.filter((s) => s.gorselSvg || s.geometri).map((s) => `${s.ders}|${s.konu}`));
  const adaylar = Object.entries(KONU_DAGILIMI[duzey]).flatMap(([ders, konular]) =>
    konular
      .filter(([konu]) => ders !== "GUNCEL" && !gorselli.has(`${ders}|${konu}`))
      .map(([konu, adet]) => ({ ders: ders as DenemeDers, konu, adet, sayi: sorular.filter((s) => s.ders === ders && s.konu === konu).length })),
  );
  const secim = new Map<string, Hedef>();
  for (let i = 0; i < GECE_ADET && adaylar.length; i++) {
    const a = adaylar.reduce((m, x) => (x.sayi / x.adet < m.sayi / m.adet ? x : m));
    a.sayi++;
    const k = `${a.ders}|${a.konu}`;
    secim.set(k, { ders: a.ders, konu: a.konu, adet: (secim.get(k)?.adet ?? 0) + 1 });
  }
  return [...secim.values()];
}

async function konuIcinUret(duzey: Duzey, h: Hedef, hedefHarfler: number[], sayac: TokenSayaci) {
  const mevcut = await prisma.denemeSoru.findMany({
    where: { duzey, ders: h.ders, konu: h.konu },
    select: { soruMetni: true, secenekler: true, dogruCevap: true, aciklama: true },
  });
  const ornekler = [...mevcut].sort(() => Math.random() - 0.5).slice(0, 2);
  const res = await gemini.models.generateContent({
    model: GEMINI_MODEL,
    contents:
      `Düzey: KPSS ${DUZEY_LABEL[duzey]}. Ders: ${DERS_LABEL[h.ders]}. Konu: ${h.konu}.\n` +
      `${h.adet} yeni soru yaz. Doğru cevaplar sırasıyla şu şıklarda olsun: ${hedefHarfler.map((i) => HARF[i]).join(", ")}.\n\n` +
      `Üslup ve zorluk için örnekler (bunları tekrar etme):\n${ornekler
        .map((o) => `---\n${o.soruMetni}\n${o.secenekler.map((s, i) => `${HARF[i]}) ${s}`).join("\n")}\nCevap: ${HARF[o.dogruCevap]}\nAçıklama: ${o.aciklama ?? ""}`)
        .join("\n")}\n\n` +
      `Havuzda zaten olan sorular (benzerini yazma):\n${mevcut.slice(0, 25).map((m) => `- ${m.soruMetni.replace(/\s+/g, " ").slice(0, 140)}`).join("\n")}`,
    config: {
      systemInstruction:
        "ÖSYM KPSS sınavı için özgün çoktan seçmeli soru yazarısın. Kurallar: Türkçe ve ÖSYM üslubunda yaz; gerçek ÖSYM sorularını " +
        "kopyalama. soruMetni parçayı/öncülleri VE soru kökünü içerir ve soru işaretiyle (?) biter. Her sorunun 5 şıkkı olur ve " +
        "yalnız BİR şık kesin doğrudur; çeldiriciler makul ama kesin yanlıştır. 'Hangisi yoktur / değildir / yanlıştır' türünde " +
        "diğer dört şıkkın gerçekten doğru olduğunu tek tek kontrol et. Şıklara 'A)' gibi harf yazma. Soru metnine soru numarası, " +
        "görsel, tablo ya da şekil gerektiren ifade koyma. Gerçek kişilere söz, alıntı ya da görüş atfetme. Bilgi soruları yalnız " +
        "kesin ve tartışmasız bilgiye dayanır; tarih, sayı ve isimlerden emin değilsen o soruyu yazma. Zorluk örneklerdeki düzeyde " +
        "olsun (çok adımlı, gerçek sınav kadar). Açıklama, doğru cevabın neden doğru olduğunu kısaca gösterir.",
      responseMimeType: "application/json",
      responseJsonSchema: toGeminiSchema(UretimSchema),
      abortSignal: AbortSignal.timeout(CAGRI_SURESI_MS),
    },
  });
  const t = say(res.usageMetadata);
  sayac.giris += t.giris;
  sayac.cikis += t.cikis;
  const parsed = UretimSchema.safeParse(parseGeminiJson(res.text));
  if (!parsed.success) throw new Error(`${h.konu}: üretim yanıtı okunamadı`);
  return parsed.data.sorular.filter(
    (s) =>
      s.soruMetni.trim().length >= 20 &&
      /\?\s*$/.test(s.soruMetni) &&
      new Set(s.secenekler.map((x) => x.trim())).size === 5 &&
      s.secenekler.every((x) => x.trim() && !/^[A-E]\)/.test(x.trim())) &&
      !mevcut.some((m) => m.soruMetni.trim() === s.soruMetni.trim()),
  );
}

/**
 * Cevap anahtari gosterilmeden, her sik ayri ayri degerlendirilerek cozdurur. Kabul: tam olarak
 * bir sik "dogru" isaretli, o sik verilen cevap ve anahtarla ayni, gercek kisiye atif yok.
 */
async function dogrula(duzey: Duzey, ders: DenemeDers, s: { soruMetni: string; secenekler: string[]; dogruCevap: number }, sayac: TokenSayaci) {
  const res = await gemini.models.generateContent({
    model: DOGRULAMA_MODEL,
    contents: `KPSS ${DUZEY_LABEL[duzey]} / ${DERS_LABEL[ders]} sorusu:\n\n${s.soruMetni}\n\n${s.secenekler.map((x, i) => `${HARF[i]}) ${x}`).join("\n")}`,
    config: {
      systemInstruction:
        "Bu bir KPSS sorusu; titiz bir soru denetçisisin. Soruyu adım adım çöz, sonra her şıkkı AYRI AYRI değerlendir: siklar[i].dogruMu " +
        "o şık sorunun istediği cevapsa true. 'Hangisi yoktur/değildir/yanlıştır' türünde, diğer şıkların metinde gerçekten " +
        "bulunduğunu/doğru olduğunu tek tek kanıtla. cevap: doğru şıkkın indeksi (A=0 ... E=4). gercekKisiyeAtif: soruda gerçek " +
        "bir kişiye söz, alıntı ya da görüş atfediliyorsa true. sorun: soru kökü eksikse, bilgi yanlışsa, veri yetersizse ya da " +
        "birden fazla/hiç doğru şık varsa kısaca nedeni; yoksa boş.",
      responseMimeType: "application/json",
      responseJsonSchema: toGeminiSchema(KontrolSchema),
      abortSignal: AbortSignal.timeout(CAGRI_SURESI_MS),
    },
  });
  const t = say(res.usageMetadata);
  sayac.dogrulamaGiris += t.giris;
  sayac.dogrulamaCikis += t.cikis;
  const k = KontrolSchema.safeParse(parseGeminiJson(res.text));
  if (!k.success) return false;
  const dogrular = k.data.siklar.flatMap((x, i) => (x.dogruMu ? [i] : []));
  return dogrular.length === 1 && dogrular[0] === k.data.cevap && k.data.cevap === s.dogruCevap && !k.data.gercekKisiyeAtif && !k.data.sorun.trim();
}

/** Bir duzeyin gece uretimi: uretilen, dogrulanip eklenen ve hata sayilari. */
export async function duzeyIcinUret(duzey: Duzey) {
  const hedefler = await hedefKonular(duzey);
  // Dogru sik harfleri dengeli dagilsin: bugune kadarki gemini sorulari uzerinden sirayla.
  let harf = await prisma.denemeSoru.count({ where: { duzey, uretim: "gemini" } });
  const sayac: TokenSayaci = { giris: 0, cikis: 0, dogrulamaGiris: 0, dogrulamaCikis: 0 };
  const uretimler = await Promise.allSettled(
    hedefler.map((h) => konuIcinUret(duzey, h, Array.from({ length: h.adet }, () => harf++ % 5), sayac).then((sorular) => ({ h, sorular }))),
  );
  let uretilen = 0;
  let eklenen = 0;
  const hatalar: string[] = [];
  for (const u of uretimler) {
    if (u.status === "rejected") {
      hatalar.push(String(u.reason).slice(0, 200));
      continue;
    }
    const { h, sorular } = u.value;
    uretilen += sorular.length;
    const sonuclar = await Promise.allSettled(sorular.map((s) => dogrula(duzey, h.ders, s, sayac)));
    for (const [i, s] of sorular.entries()) {
      const r = sonuclar[i];
      if (r.status === "rejected") hatalar.push(String(r.reason).slice(0, 200));
      if (r.status !== "fulfilled" || !r.value) continue;
      await prisma.denemeSoru.create({
        data: { duzey: duzey as EducationLevel, ders: h.ders, konu: h.konu, soruMetni: s.soruMetni.trim(), secenekler: s.secenekler.map((x) => x.trim()), dogruCevap: s.dogruCevap, aciklama: s.aciklama.trim(), uretim: "gemini", sira: 99_999 },
      });
      eklenen++;
    }
  }
  return { duzey, hedef: hedefler.reduce((t, h) => t + h.adet, 0), uretilen, eklenen, hatalar, sayac };
}

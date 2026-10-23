/**
 * KPSS soru yazari / kontrolcu karsilastirmasi (veritabanina YAZMAZ). Her yazar ayni 12 Lisans hedefini ayni istemle (canlidaki uretimIstemi)
 * yazar; her soru + tuzak sorular (kpssTuzakSorular.ts) 3 kontrolcuden gecer. Maliyet: OpenRouter'in bildirdigi gercek
 * tutar, Gemini icin token x liste fiyati. Cikti: <klasor>/karsilastirma.json + .md
 * Calistirma: npx tsx --env-file=.env scripts/kpssYazarKarsilastir.ts <klasor>
 */
import { writeFileSync } from "node:fs";
import { z } from "zod";
import { gemini, GEMINI_MODEL } from "../src/lib/gemini";
import { parseGeminiJson } from "../src/lib/geminiSchema";
import { prisma } from "../src/lib/prisma";
import { DERS_LABEL, DUZEY_LABEL } from "../src/lib/kpssDenemeSabitler";
import { adaylariAyikla, DOGRULAMA_MODEL, uretimIstemi, type Aday, type UretimHedefi } from "../src/lib/kpssSoruUretimi";
import { TUZAKLAR } from "./kpssTuzakSorular";

const YAZARLAR = [
  "gemini:" + GEMINI_MODEL,
  "deepseek/deepseek-v4-flash",
  "deepseek/deepseek-v4.1-flash",
  "z-ai/glm-5.3",
  "qwen/qwen3.8-flash",
  "google/gemma-4-31b-it",
  "deepseek/deepseek-v4-pro",
];
const KONTROLCULER = ["gemini:" + GEMINI_MODEL, "gemini:" + DOGRULAMA_MODEL, "deepseek/deepseek-v4.1-flash"];
// $/milyon token (Google liste fiyati, toplu degil): maliyet tahmini icin.
const GEMINI_FIYAT: Record<string, [number, number]> = { [GEMINI_MODEL]: [0.75, 3.75], [DOGRULAMA_MODEL]: [2, 12] };
const HARF = ["A", "B", "C", "D", "E"];

const HEDEFLER: Omit<UretimHedefi, "harfler">[] = [
  { duzey: "LISANS", ders: "TURKCE", konu: "Paragraf", adet: 3 },
  { duzey: "LISANS", ders: "TURKCE", konu: "Cümlede Anlam", adet: 1 },
  { duzey: "LISANS", ders: "TURKCE", konu: "Sözel Mantık", adet: 1 },
  { duzey: "LISANS", ders: "TURKCE", konu: "Sözcük Türleri", adet: 1 },
  { duzey: "LISANS", ders: "TURKCE", konu: "Yazım Kuralları", adet: 1 },
  { duzey: "LISANS", ders: "TARIH", konu: "Osmanlı Siyasi Tarihi", adet: 1 },
  { duzey: "LISANS", ders: "TARIH", konu: "Kurtuluş Savaşı Hazırlık Dönemi", adet: 1 },
  { duzey: "LISANS", ders: "COGRAFYA", konu: "Beşeri Coğrafya", adet: 1 },
  { duzey: "LISANS", ders: "VATANDASLIK", konu: "Yürütme", adet: 1 },
  { duzey: "LISANS", ders: "MATEMATIK", konu: "Sayısal Mantık", adet: 1 },
];

const JSON_TALIMATI =
  '\n\nYalnız geçerli JSON döndür, başka metin yazma: {"sorular":[{"soruMetni":"...","secenekler":["...","...","...","...","..."],"dogruCevap":0,"aciklama":"..."}]} (dogruCevap 0-4 arası şık indeksi).';

const KontrolSchema = z.object({
  siklar: z.array(z.object({ dogruMu: z.boolean(), gerekce: z.string() })).length(5),
  cevap: z.number().int().min(0).max(4),
  gercekKisiyeAtif: z.boolean(),
  dilHatalari: z.string(),
  zorluk: z.number().int().min(1).max(5),
  sorun: z.string(),
});
const KONTROL_TALIMATI =
  "Bu bir KPSS sorusu; titiz bir soru denetçisisin. Soruyu adım adım çöz, sonra her şıkkı AYRI AYRI değerlendir: siklar[i].dogruMu " +
  "o şık sorunun istediği cevapsa true. 'Hangisi yoktur/değildir/yanlıştır' türünde diğer şıkların gerçekten doğru olduğunu tek tek kanıtla. " +
  "cevap: doğru şıkkın indeksi (A=0 ... E=4). gercekKisiyeAtif: soruda gerçek bir kişiye söz, alıntı ya da görüş atfediliyorsa true. " +
  "dilHatalari: yazım, noktalama, dil bilgisi hataları, yabancı ya da uydurma sözcükler (yoksa boş). zorluk: gerçek ÖSYM KPSS sorusuna " +
  "göre 1 (çok kolay, cevap parçada aynen yazıyor ya da çeldiriciler saçma) ... 5 (çok zor). sorun: soru kökü eksikse, öncülde ya da " +
  "seçeneklerde bilgi yanlışsa, bilgi eskimişse (2026 mevzuatına göre), veri yetersizse ya da birden fazla/hiç doğru şık varsa kısaca nedeni; yoksa boş." +
  '\n\nYalnız JSON döndür: {"siklar":[{"dogruMu":false,"gerekce":"..."} x5],"cevap":0,"gercekKisiyeAtif":false,"dilHatalari":"","zorluk":3,"sorun":""}';

type Karar = { gecti: boolean; neden: string; zorluk: number | null; dil: string; maliyet: number; ms: number };

async function sinirli<T, R>(ogeler: T[], es: number, fn: (o: T) => Promise<R>): Promise<R[]> {
  const sonuc: R[] = new Array(ogeler.length);
  let i = 0;
  await Promise.all(Array.from({ length: es }, async () => {
    while (i < ogeler.length) {
      const k = i++;
      sonuc[k] = await fn(ogeler[k]);
    }
  }));
  return sonuc;
}

/** Tek model cagrisi (OpenRouter ya da Gemini): metin + gercek/tahmini maliyet. */
async function cagir(model: string, sistem: string, icerik: string): Promise<{ metin: string; maliyet: number }> {
  if (model.startsWith("gemini:")) {
    const ad = model.slice(7);
    const r = await gemini.models.generateContent({ model: ad, contents: icerik, config: { systemInstruction: sistem, responseMimeType: "application/json", abortSignal: AbortSignal.timeout(240_000) } });
    const u = r.usageMetadata;
    const [gf, cf] = GEMINI_FIYAT[ad];
    return { metin: r.text ?? "", maliyet: ((u?.promptTokenCount ?? 0) * gf + ((u?.candidatesTokenCount ?? 0) + (u?.thoughtsTokenCount ?? 0)) * cf) / 1e6 };
  }
  for (let deneme = 0; ; deneme++) {
    const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: { Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`, "Content-Type": "application/json" },
      signal: AbortSignal.timeout(300_000),
      body: JSON.stringify({ model, messages: [{ role: "system", content: sistem }, { role: "user", content: icerik }], response_format: { type: "json_object" }, max_tokens: 16000, usage: { include: true } }),
    });
    const data = await res.json().catch(() => ({}));
    if ((res.status === 429 || res.status >= 500) && deneme < 2) {
      await new Promise((r) => setTimeout(r, 15_000));
      continue;
    }
    if (!res.ok) throw new Error(`${res.status} ${data.error?.message ?? ""}`.slice(0, 200));
    const metin: string = data.choices?.[0]?.message?.content ?? "";
    return { metin: metin.replace(/^[\s\S]*?(\{[\s\S]*\})[\s\S]*$/, "$1"), maliyet: data.usage?.cost ?? 0 };
  }
}

async function kontrolEt(model: string, a: Pick<Aday, "duzey" | "ders" | "soruMetni" | "secenekler" | "dogruCevap">): Promise<Karar> {
  const t0 = Date.now();
  try {
    const icerik = `KPSS ${DUZEY_LABEL[a.duzey]} / ${DERS_LABEL[a.ders]} sorusu:\n\n${a.soruMetni}\n\n${a.secenekler.map((x, i) => `${HARF[i]}) ${x}`).join("\n")}`;
    const r = await cagir(model, KONTROL_TALIMATI, icerik);
    const k = KontrolSchema.safeParse(parseGeminiJson(r.metin));
    if (!k.success) return { gecti: false, neden: "yanıt okunamadı", zorluk: null, dil: "", maliyet: r.maliyet, ms: Date.now() - t0 };
    const dogrular = k.data.siklar.flatMap((x, i) => (x.dogruMu ? [i] : []));
    const nedenler = [
      dogrular.length !== 1 && `${dogrular.length} doğru şık`,
      k.data.cevap !== a.dogruCevap && `cevap ${HARF[k.data.cevap]} (anahtar ${HARF[a.dogruCevap]})`,
      k.data.gercekKisiyeAtif && "gerçek kişiye atıf",
      k.data.dilHatalari.trim() && `dil: ${k.data.dilHatalari.trim()}`,
      k.data.zorluk < 3 && `zorluk ${k.data.zorluk}`,
      k.data.sorun.trim() && `sorun: ${k.data.sorun.trim()}`,
    ].filter(Boolean) as string[];
    return { gecti: !nedenler.length, neden: nedenler.join(" | ").slice(0, 400), zorluk: k.data.zorluk, dil: k.data.dilHatalari.trim(), maliyet: r.maliyet, ms: Date.now() - t0 };
  } catch (e) {
    return { gecti: false, neden: `HATA ${String(e).slice(0, 150)}`, zorluk: null, dil: "", maliyet: 0, ms: Date.now() - t0 };
  }
}

(async () => {
  const klasor = process.argv[2];
  if (!klasor) throw new Error("klasor gerekli");
  let harf = 0;
  const hedefler: UretimHedefi[] = HEDEFLER.map((h) => ({ ...h, harfler: Array.from({ length: h.adet }, () => harf++ % 5) }));
  const istekler = await Promise.all(hedefler.map(uretimIstemi));

  // 1) Yazarlar (her yazar kendi icinde 4 esanli istek).
  const yazilanlar = await Promise.all(
    YAZARLAR.map(async (yazar) => {
      let maliyet = 0;
      const hatalar: string[] = [];
      const t0 = Date.now();
      const parcalar = await sinirli(hedefler.map((h, i) => [h, i] as const), 4, async ([h, i]) => {
        try {
          const r = await cagir(yazar, istekler[i].sistem + JSON_TALIMATI, istekler[i].icerik);
          maliyet += r.maliyet;
          return adaylariAyikla(h, r.metin);
        } catch (e) {
          hatalar.push(`${h.konu}: ${String(e).slice(0, 160)}`);
          return [];
        }
      });
      console.log(`yazar ${yazar}: ${parcalar.flat().length} soru, ${maliyet.toFixed(4)} $, ${Math.round((Date.now() - t0) / 1000)} sn`);
      return { yazar, sorular: parcalar.flat(), maliyet, hatalar, sn: Math.round((Date.now() - t0) / 1000) };
    }),
  );

  // 2) Kontrol: yazilan her soru + tuzaklar, her kontrolcu.
  type Is = { kaynak: string; tuzak?: string | null; soru: Pick<Aday, "duzey" | "ders" | "konu" | "soruMetni" | "secenekler" | "dogruCevap" | "aciklama"> };
  const isler: Is[] = [
    ...yazilanlar.flatMap((y) => y.sorular.map((s) => ({ kaynak: y.yazar, soru: s }))),
    ...TUZAKLAR.map((t) => ({ kaynak: `tuzak:${t.ad}`, tuzak: t.kusur, soru: { duzey: "LISANS" as const, ...t } })),
  ];
  const kararlar = await sinirli(isler, 6, async (is) => Object.fromEntries(await Promise.all(KONTROLCULER.map(async (k) => [k, await kontrolEt(k, is.soru)] as const))));
  console.log(`kontrol bitti: ${isler.length} soru x ${KONTROLCULER.length}`);

  writeFileSync(`${klasor}/karsilastirma.json`, JSON.stringify({ yazilanlar: yazilanlar.map(({ sorular, ...y }) => ({ ...y, adet: sorular.length })), isler: isler.map((is, i) => ({ ...is, kararlar: kararlar[i] })) }, null, 1));

  // 3) Okunabilir rapor (benim inceleme listem).
  let md = "# KPSS yazar/kontrolcü karşılaştırması\n\n";
  for (const y of yazilanlar) md += `- ${y.yazar}: ${y.sorular.length} soru, ${y.maliyet.toFixed(4)} $, ${y.sn} sn${y.hatalar.length ? `, hatalar: ${y.hatalar.join("; ")}` : ""}\n`;
  isler.forEach((is, i) => {
    md += `\n### ${i + 1}. [${is.kaynak}] ${is.soru.ders} / ${is.soru.konu}${is.tuzak !== undefined ? ` — beklenen: ${is.tuzak ?? "TEMİZ"}` : ""}\n\n${is.soru.soruMetni}\n\n`;
    md += is.soru.secenekler.map((s, j) => `${HARF[j]}) ${s}${j === is.soru.dogruCevap ? "  ← anahtar" : ""}`).join("\n");
    md += `\n\nAçıklama: ${is.soru.aciklama}\n\n`;
    for (const [k, v] of Object.entries(kararlar[i])) md += `- ${k}: ${v.gecti ? "GEÇTİ" : "RED"} (zorluk ${v.zorluk ?? "-"})${v.neden ? ` — ${v.neden}` : ""}\n`;
  });
  writeFileSync(`${klasor}/karsilastirma.md`, md);
  await prisma.$disconnect();
})();

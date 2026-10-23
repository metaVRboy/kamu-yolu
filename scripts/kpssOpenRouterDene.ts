/**
 * Deneme (veritabanina YAZMAZ): OpenRouter ucretsiz modelleri KPSS sorusu yazar, Gemini Flash ve Pro ayri ayri kontrol eder.
 * Ayni hedefler ve ayni istem (kpssSoruUretimi.ts) kullanilir; rapor scratchpad'e markdown olarak yazilir.
 * Calistirma: npx tsx --env-file=.env --env-file=.env.prod scripts/kpssOpenRouterDene.ts <rapor.md>
 */
import { writeFileSync } from "node:fs";
import { gemini, GEMINI_MODEL } from "../src/lib/gemini";
import { prisma } from "../src/lib/prisma";
import { adaylariAyikla, dogrulamaIstegi, dogrulandi, DOGRULAMA_MODEL, hedefKonular, uretimIstegi, type Aday, type UretimHedefi } from "../src/lib/kpssSoruUretimi";

const MODELLER = ["google/gemma-4-31b-it:free", "nvidia/nemotron-3-ultra-550b-a55b:free", "thinkingmachines/inkling:free"];
const JSON_TALIMATI =
  '\n\nYalnız geçerli JSON döndür, başka metin yazma: {"sorular":[{"soruMetni":"...","secenekler":["...","...","...","...","..."],"dogruCevap":0,"aciklama":"..."}]} (dogruCevap 0-4 arası şık indeksi).';
const HARF = ["A", "B", "C", "D", "E"];

async function openRouter(model: string, sistem: string, icerik: string) {
  const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    headers: { Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`, "Content-Type": "application/json" },
    signal: AbortSignal.timeout(240_000),
    body: JSON.stringify({ model, messages: [{ role: "system", content: sistem }, { role: "user", content: icerik }], response_format: { type: "json_object" } }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(`${res.status} ${data.error?.message ?? ""}`.slice(0, 200));
  const metin: string = data.choices?.[0]?.message?.content ?? "";
  // Bazi modeller JSON'u ```json bloguna sarar.
  return { metin: metin.replace(/^[\s\S]*?(\{[\s\S]*\})[\s\S]*$/, "$1"), cikis: data.usage?.completion_tokens ?? 0 };
}

async function kontrol(model: string, a: Aday) {
  const istek = dogrulamaIstegi(a);
  try {
    const r = await gemini.models.generateContent({ model, contents: istek.contents!, config: { ...istek.config, abortSignal: AbortSignal.timeout(150_000) } });
    return { gecti: dogrulandi(a, r.text ?? ""), ham: (r.text ?? "").slice(0, 600) };
  } catch (e) {
    return { gecti: false, ham: `HATA ${String(e).slice(0, 150)}` };
  }
}

(async () => {
  const cikti = process.argv[2];
  if (!cikti) throw new Error("rapor yolu gerekli");
  // Gorselsiz Lisans hedefleri; her model ayni hedefleri ve ayni dogru-sik harflerini alir.
  let harf = 0;
  const hedefler: UretimHedefi[] = (await hedefKonular("LISANS")).filter((h) => !h.gorsel).map((h) => ({ ...h, duzey: "LISANS", harfler: Array.from({ length: h.adet }, () => harf++ % 5) }));
  const istekler = await Promise.all(hedefler.map(uretimIstegi));
  let rapor = `# OpenRouter ücretsiz model denemesi\n\nHedefler: ${hedefler.map((h) => `${h.konu} ×${h.adet}`).join(", ")}\n\n`;
  const ozet: string[] = [];

  for (const model of MODELLER) {
    const adaylar: Aday[] = [];
    let hata = 0;
    for (const [i, h] of hedefler.entries()) {
      try {
        const r = await openRouter(model, String(istekler[i].config?.systemInstruction) + JSON_TALIMATI, String(istekler[i].contents));
        adaylar.push(...adaylariAyikla(h, r.metin));
      } catch (e) {
        hata++;
        rapor += `> ${model} / ${h.konu}: ${String(e).slice(0, 200)}\n\n`;
      }
    }
    let flash = 0;
    let pro = 0;
    rapor += `## ${model}\n\nİstenen ${hedefler.reduce((t, h) => t + h.adet, 0)}, geçerli biçim ${adaylar.length}, istek hatası ${hata}\n\n`;
    for (const [i, a] of adaylar.entries()) {
      const [f, p] = await Promise.all([kontrol(GEMINI_MODEL, a), kontrol(DOGRULAMA_MODEL, a)]);
      flash += +f.gecti;
      pro += +p.gecti;
      rapor +=
        `### ${i + 1}. ${a.ders} / ${a.konu} — Flash: ${f.gecti ? "GEÇTİ" : "REDDETTİ"}, Pro: ${p.gecti ? "GEÇTİ" : "REDDETTİ"}\n\n` +
        `${a.soruMetni}\n\n${a.secenekler.map((s, j) => `${HARF[j]}) ${s}${j === a.dogruCevap ? "  ← anahtar" : ""}`).join("\n")}\n\nAçıklama: ${a.aciklama}\n\n` +
        `<details><summary>Flash</summary>\n\n${f.ham}\n</details>\n<details><summary>Pro</summary>\n\n${p.ham}\n</details>\n\n`;
    }
    ozet.push(`${model}: biçim ${adaylar.length}, Flash geçti ${flash}, Pro geçti ${pro}`);
  }
  writeFileSync(cikti, `${rapor}\n## Özet\n\n${ozet.map((s) => `- ${s}`).join("\n")}\n`);
  console.log(ozet.join("\n"));
  await prisma.$disconnect();
})();

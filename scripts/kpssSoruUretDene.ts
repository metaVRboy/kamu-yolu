/**
 * Gece KPSS soru uretimini elle bir duzey icin calistirir ve eklenen sorulari yazdirir (kalite kontrolu).
 * Calistirma: npx tsx scripts/kpssSoruUretDene.ts LISANS
 */
import "dotenv/config";
import { prisma } from "../src/lib/prisma";
import { duzeyIcinUret } from "../src/lib/kpssSoruUretimi";

async function main() {
  const duzey = (process.argv[2] ?? "LISANS") as "LISANS" | "ONLISANS" | "LISE";
  const once = new Date();
  const sonuc = await duzeyIcinUret(duzey);
  console.log(JSON.stringify({ ...sonuc, hatalar: sonuc.hatalar.slice(0, 5) }, null, 1));
  // $/milyon token: Flash 3.6 (indirimli 0,75/3,75 — 2027'de 1,5/7,5), Pro 2/12.
  const { giris, cikis, dogrulamaGiris, dogrulamaCikis } = sonuc.sayac;
  const flash = (g: number, c: number) => (g * 0.75 + c * 3.75) / 1e6;
  const pro = (g: number, c: number) => (g * 2 + c * 12) / 1e6;
  console.log(`Maliyet (bu duzey): uretim $${flash(giris, cikis).toFixed(4)} + dogrulama $${pro(dogrulamaGiris, dogrulamaCikis).toFixed(4)}`);
  const yeni = await prisma.denemeSoru.findMany({ where: { duzey, uretim: "gemini", olusturmaTarihi: { gte: once } } });
  for (const s of yeni) {
    console.log(`\n### ${s.ders} / ${s.konu}\n${s.soruMetni}\n${s.secenekler.map((x, i) => `${"ABCDE"[i]}) ${x}`).join("\n")}\nCevap: ${"ABCDE"[s.dogruCevap]} — ${s.aciklama}`);
  }
}

main().finally(() => prisma.$disconnect());

/**
 * KPSS soru uretiminin batch dongusunu elle calistirir: her dakika ilerletir, dogrulama isi bitince
 * eklenen sorulari ve maliyeti (olcumler) yazdirir (kalite kontrolu). Son uretim isi 23 saatten yeniyse yenisini gondermez.
 * Calistirma: npx tsx scripts/kpssSoruUretDene.ts [--zorla]  (--zorla: 23 saat kuralini atlayip yeni uretim gonderir)
 */
import "dotenv/config";
import { prisma } from "../src/lib/prisma";
import { topluDongu } from "../src/lib/kpssSoruUretimi";


async function main() {
  const once = new Date();
  let zorla = process.argv.includes("--zorla");
  for (;;) {
    const o = await topluDongu(zorla);
    zorla = false;
    if (o.gonderilen || o.uretilen || o.olcumler.length || o.hatalar.length) console.log(new Date().toISOString().slice(11, 19), JSON.stringify(o));
    if (o.olcumler.some((t) => t.tur === "dogrulama")) break;
    if (!(await prisma.kpssTopluIs.count({ where: { durum: "BEKLIYOR" } }))) break;
    await new Promise((r) => setTimeout(r, 60_000));
  }
  const yeni = await prisma.denemeSoru.findMany({ where: { uretim: { in: ["gemini", "deepseek"] }, olusturmaTarihi: { gte: once } } });
  console.log(`
EKLENEN: ${yeni.length}`);
  for (const s of yeni) {
    console.log(`\n### ${s.duzey} ${s.ders} / ${s.konu}${s.gorselSvg ? " [gorselli]" : ""}\n${s.soruMetni}\n${s.secenekler.map((x, i) => `${"ABCDE"[i]}) ${x}`).join("\n")}\nCevap: ${"ABCDE"[s.dogruCevap]} — ${s.aciklama}`);
  }
}

main().finally(() => prisma.$disconnect());

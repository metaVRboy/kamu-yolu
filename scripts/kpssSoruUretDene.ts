/**
 * KPSS soru uretiminin batch dongusunu elle calistirir: her dakika ilerletir, dogrulama isi bitince
 * eklenen sorulari ve maliyeti yazdirir (kalite kontrolu). Son uretim isi 23 saatten yeniyse yenisini gondermez.
 * Calistirma: npx tsx scripts/kpssSoruUretDene.ts
 */
import "dotenv/config";
import { prisma } from "../src/lib/prisma";
import { topluDongu } from "../src/lib/kpssSoruUretimi";

// $/milyon token, Batch API (standart fiyatin yarisi): Flash 3.6 0,375/1,875, Pro 1/6.
const FIYAT = { uretim: [0.375, 1.875], dogrulama: [1, 6] } as Record<string, [number, number]>;

async function main() {
  const once = new Date();
  for (;;) {
    const o = await topluDongu();
    if (o.gonderilen || o.uretilen || o.tokenlar.length || o.hatalar.length) console.log(new Date().toISOString().slice(11, 19), JSON.stringify(o));
    for (const t of o.tokenlar) console.log(`maliyet ${t.tur}: $${((t.giris * FIYAT[t.tur][0] + t.cikis * FIYAT[t.tur][1]) / 1e6).toFixed(4)}`);
    if (o.tokenlar.some((t) => t.tur === "dogrulama")) break;
    if (!(await prisma.kpssTopluIs.count({ where: { durum: "BEKLIYOR" } }))) break;
    await new Promise((r) => setTimeout(r, 60_000));
  }
  const yeni = await prisma.denemeSoru.findMany({ where: { uretim: "gemini", olusturmaTarihi: { gte: once } } });
  for (const s of yeni) {
    console.log(`\n### ${s.duzey} ${s.ders} / ${s.konu}${s.gorselSvg ? " [gorselli]" : ""}\n${s.soruMetni}\n${s.secenekler.map((x, i) => `${"ABCDE"[i]}) ${x}`).join("\n")}\nCevap: ${"ABCDE"[s.dogruCevap]} — ${s.aciklama}`);
  }
}

main().finally(() => prisma.$disconnect());

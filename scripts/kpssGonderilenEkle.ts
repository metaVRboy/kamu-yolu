/**
 * scripts/kpssDenemeSorular/gonderilen.ts'teki sorulari havuza ekler (yalniz ekler/gunceller, silmez).
 * Konu KONU_DAGILIMI'nda olmali; havuzda ayni metin varsa atlanir.
 * Calistirma: npx tsx scripts/kpssGonderilenEkle.ts [--yaz]  (bayraksiz: yalniz kontrol)
 */
import "dotenv/config";
import { prisma } from "../src/lib/prisma";
import { KONU_DAGILIMI } from "../src/lib/kpssDenemeKonular";
import { GONDERILEN } from "./kpssDenemeSorular/gonderilen";

const yaz = process.argv.includes("--yaz");

async function main() {
  for (const [duzey, sorular] of Object.entries(GONDERILEN) as [keyof typeof GONDERILEN, (typeof GONDERILEN)["LISANS"]][]) {
    let eklenen = 0;
    for (const [i, s] of sorular.entries()) {
      const etiket = `${duzey} #${i + 1} (${s.ders} / ${s.konu})`;
      if (!KONU_DAGILIMI[duzey][s.ders].some(([k]) => k === s.konu)) throw new Error(`${etiket}: konu dagilimda yok`);
      if (new Set(s.secenekler.map((x) => x.trim())).size !== 5 || s.dogruCevap < 0 || s.dogruCevap > 4) throw new Error(`${etiket}: sik/cevap hatali`);
      const ayni = await prisma.denemeSoru.findFirst({ where: { duzey, soruMetni: s.soruMetni }, select: { uretim: true } });
      if (ayni && ayni.uretim !== "gonderilen") {
        console.log(`${etiket}: havuzda zaten var (${ayni.uretim}), atlandi`);
        continue;
      }
      if (!yaz) continue;
      const veri = { ders: s.ders, konu: s.konu, secenekler: s.secenekler, dogruCevap: s.dogruCevap, aciklama: s.aciklama, gorselSvg: s.gorselSvg ?? null, geometri: !!s.geometri, grupId: s.grupId ? `gonderilen-${s.grupId}` : null };
      const g = await prisma.denemeSoru.updateMany({ where: { duzey, soruMetni: s.soruMetni, uretim: "gonderilen" }, data: veri });
      if (!g.count) await prisma.denemeSoru.create({ data: { ...veri, duzey, soruMetni: s.soruMetni, uretim: "gonderilen", sira: 50_000 + i } });
      eklenen++;
    }
    console.log(`${duzey}: ${sorular.length} soru, ${yaz ? `${eklenen} yazildi` : "kontrol tamam"}`);
  }
}

main().finally(() => prisma.$disconnect());

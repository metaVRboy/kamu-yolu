/**
 * KPSS deneme soru havuzunu veritabanina yazar. Ayni soru metninin tekrar
 * eklenmesini onlemek icin (duzey, soruMetni) zaten varsa atlanir - bu
 * sayede script birden fazla kez (yeni partiler eklendikce) guvenle
 * calistirilabilir.
 *
 * Calistirma: npx tsx scripts/kpssDenemeSoruSeed.ts
 */
import "dotenv/config";
import { prisma } from "../src/lib/prisma";
import { LISANS_SORULARI } from "./kpssDenemeSoruVerisi";

async function main() {
  let eklenen = 0;
  let atlanan = 0;
  for (const soru of LISANS_SORULARI) {
    const mevcut = await prisma.denemeSoru.findFirst({
      where: { duzey: "LISANS", soruMetni: soru.soruMetni },
      select: { id: true },
    });
    if (mevcut) {
      atlanan++;
      continue;
    }
    await prisma.denemeSoru.create({
      data: {
        duzey: "LISANS",
        ders: soru.ders,
        soruMetni: soru.soruMetni,
        secenekler: soru.secenekler,
        dogruCevap: soru.dogruCevap,
        aciklama: soru.aciklama,
      },
    });
    eklenen++;
  }
  console.log(`Bitti. ${eklenen} soru eklendi, ${atlanan} soru zaten vardi (atlandi).`);
  await prisma.$disconnect();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});

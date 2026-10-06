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
  // Her ders icin ayri bir sayac - dizideki yazim sirasi, gercek sinavdaki
  // konu sirasini (ör. geometri en sonda) birebir yansitir.
  const dersSirasi: Record<string, number> = {};
  for (const soru of LISANS_SORULARI) {
    const sira = (dersSirasi[soru.ders] ?? 0);
    dersSirasi[soru.ders] = sira + 1;

    const veri = {
      ders: soru.ders,
      grupId: soru.grupId ?? null,
      geometri: soru.geometri ?? false,
      gorselSvg: soru.gorselSvg ?? null,
      secenekler: soru.secenekler,
      dogruCevap: soru.dogruCevap,
      aciklama: soru.aciklama,
      sira,
    };
    const mevcut = await prisma.denemeSoru.findFirst({
      where: { duzey: "LISANS", soruMetni: soru.soruMetni },
      select: { id: true },
    });
    // Ayni metinli soru varsa id'si (ve kullanimSayisi) korunur, icerigi
    // (siklar, cevap, aciklama, sira...) veri dosyasiyla esitlenir.
    if (mevcut) {
      await prisma.denemeSoru.update({ where: { id: mevcut.id }, data: veri });
      atlanan++;
      continue;
    }
    await prisma.denemeSoru.create({ data: { duzey: "LISANS", soruMetni: soru.soruMetni, ...veri } });
    eklenen++;
  }
  // Veri dosyasindan cikarilan/yeniden yazilan sorular havuzda kalmasin -
  // havuz = veri dosyasi.
  const silinen = await prisma.denemeSoru.deleteMany({
    where: { duzey: "LISANS", soruMetni: { notIn: LISANS_SORULARI.map((s) => s.soruMetni) } },
  });
  console.log(`Bitti. ${eklenen} soru eklendi, ${atlanan} soru guncellendi, ${silinen.count} eski soru silindi.`);
  await prisma.$disconnect();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});

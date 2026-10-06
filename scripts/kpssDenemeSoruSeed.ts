/**
 * KPSS deneme soru havuzlarini (Lisans, Onlisans, Ortaogretim) veritabanina
 * yazar. Havuz = veri dosyasi: ayni metinli soru varsa id'si (ve
 * kullanimSayisi) korunup icerigi esitlenir, veri dosyasinda olmayanlar
 * silinir. Script birden fazla kez guvenle calistirilabilir.
 *
 * Calistirma: npx tsx scripts/kpssDenemeSoruSeed.ts
 */
import "dotenv/config";
import { prisma } from "../src/lib/prisma";
import type { EducationLevel } from "../src/generated/prisma/client";
import { LISANS_SORULARI, type SeedSoru } from "./kpssDenemeSoruVerisi";
import { ONLISANS_SORULARI } from "./kpssDenemeSoruVerisiOnlisans";
import { ORTAOGRETIM_SORULARI } from "./kpssDenemeSoruVerisiOrtaogretim";

const HAVUZLAR: [EducationLevel, SeedSoru[]][] = [
  ["LISANS", LISANS_SORULARI],
  ["ONLISANS", ONLISANS_SORULARI],
  ["LISE", ORTAOGRETIM_SORULARI],
];

async function havuzuYaz(duzey: EducationLevel, sorular: SeedSoru[]) {
  let eklenen = 0;
  let guncellenen = 0;
  // Her ders icin ayri sayac - dizideki yazim sirasi, gercek sinavdaki konu
  // sirasini (ör. geometri en sonda) birebir yansitir.
  const dersSirasi: Record<string, number> = {};
  for (const soru of sorular) {
    const sira = dersSirasi[soru.ders] ?? 0;
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
    const mevcut = await prisma.denemeSoru.findFirst({ where: { duzey, soruMetni: soru.soruMetni }, select: { id: true } });
    if (mevcut) {
      await prisma.denemeSoru.update({ where: { id: mevcut.id }, data: veri });
      guncellenen++;
    } else {
      await prisma.denemeSoru.create({ data: { duzey, soruMetni: soru.soruMetni, ...veri } });
      eklenen++;
    }
  }
  const silinen = await prisma.denemeSoru.deleteMany({
    where: { duzey, soruMetni: { notIn: sorular.map((s) => s.soruMetni) } },
  });
  console.log(`${duzey}: ${eklenen} eklendi, ${guncellenen} guncellendi, ${silinen.count} eski soru silindi.`);
}

async function main() {
  for (const [duzey, sorular] of HAVUZLAR) await havuzuYaz(duzey, sorular);
  await prisma.$disconnect();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});

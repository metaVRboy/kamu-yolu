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
import { LISANS_SORULARI, type SeedSoru } from "./kpssDenemeSoruVerisi";
import { ONLISANS_SORULARI } from "./kpssDenemeSoruVerisiOnlisans";
import { ORTAOGRETIM_SORULARI } from "./kpssDenemeSoruVerisiOrtaogretim";
import { KONU_DAGILIMI } from "./kpssDenemeKonular";

const HAVUZLAR: [keyof typeof KONU_DAGILIMI, SeedSoru[]][] = [
  ["LISANS", LISANS_SORULARI],
  ["ONLISANS", ONLISANS_SORULARI],
  ["LISE", ORTAOGRETIM_SORULARI],
];

/** Havuz konu dagilimina birebir uymali; sorular ders ici konu sirasina dizilir (stabil). */
function konuSirasinaDiz(duzey: keyof typeof KONU_DAGILIMI, sorular: SeedSoru[]) {
  const dagilim = KONU_DAGILIMI[duzey];
  for (const [ders, konular] of Object.entries(dagilim)) {
    for (const [konu, adet] of konular) {
      const sayi = sorular.filter((s) => s.ders === ders && s.konu === konu).length;
      if (sayi !== adet) throw new Error(`${duzey} ${ders} / ${konu}: ${sayi} soru (hedef ${adet})`);
    }
  }
  for (const s of sorular) {
    if (!dagilim[s.ders].some(([k]) => k === s.konu)) throw new Error(`${duzey} dagilimda olmayan konu: ${s.ders} / ${s.konu}`);
  }
  for (const grupId of new Set(sorular.map((s) => s.grupId).filter(Boolean))) {
    if (new Set(sorular.filter((s) => s.grupId === grupId).map((s) => s.konu)).size > 1) throw new Error(`${duzey} grup konulari farkli: ${grupId}`);
  }
  const sira = (s: SeedSoru) => dagilim[s.ders].findIndex(([k]) => k === s.konu);
  return [...sorular].sort((a, b) => sira(a) - sira(b));
}

async function havuzuYaz(duzey: keyof typeof KONU_DAGILIMI, hamSorular: SeedSoru[]) {
  const sorular = konuSirasinaDiz(duzey, hamSorular);
  let eklenen = 0;
  let guncellenen = 0;
  // Her ders icin ayri sayac - konu sirasi gercek sinavdaki sirayi (ör.
  // geometri en sonda) yansitir.
  const dersSirasi: Record<string, number> = {};
  for (const soru of sorular) {
    const sira = dersSirasi[soru.ders] ?? 0;
    dersSirasi[soru.ders] = sira + 1;
    const veri = {
      ders: soru.ders,
      grupId: soru.grupId ?? null,
      geometri: soru.geometri ?? false,
      konu: soru.konu ?? null,
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

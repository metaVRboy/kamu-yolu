/**
 * KPSS deneme soru havuzlarini (Lisans, Onlisans, Ortaogretim) veritabanina
 * yazar. Havuz = veri dosyalari (partiler): ayni metinli soru varsa id'si (ve
 * kullanimSayisi) korunup icerigi esitlenir; elle yazilmis olup dosyalarda
 * olmayanlar silinir. Gece Gemini'nin urettigi sorulara (uretim "gemini") dokunulmaz.
 * Script birden fazla kez guvenle calistirilabilir.
 *
 * Calistirma: npx tsx scripts/kpssDenemeSoruSeed.ts
 */
import "dotenv/config";
import { prisma } from "../src/lib/prisma";
import { LISANS_SORULARI, type SeedSoru } from "./kpssDenemeSoruVerisi";
import { ONLISANS_SORULARI } from "./kpssDenemeSoruVerisiOnlisans";
import { ORTAOGRETIM_SORULARI } from "./kpssDenemeSoruVerisiOrtaogretim";
import { EK_PARTILER } from "./kpssDenemeSorular";
import { KONU_DAGILIMI } from "../src/lib/kpssDenemeKonular";

// Her parti 120 soruluk tam bir deneme.
const HAVUZLAR: [keyof typeof KONU_DAGILIMI, SeedSoru[][]][] = [
  ["LISANS", [LISANS_SORULARI, ...EK_PARTILER.LISANS]],
  ["ONLISANS", [ONLISANS_SORULARI, ...EK_PARTILER.ONLISANS]],
  ["LISE", [ORTAOGRETIM_SORULARI, ...EK_PARTILER.LISE]],
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

async function havuzuYaz(duzey: keyof typeof KONU_DAGILIMI, partiler: SeedSoru[][]) {
  // Her parti ayri ayri tam dagilima uymali; sira parti icinde konu sirasi (parti * 1000 ofsetiyle).
  const sorular = partiler.flatMap((parti, p) => {
    const dersSirasi: Record<string, number> = {};
    return konuSirasinaDiz(duzey, parti).map((soru) => {
      const sira = dersSirasi[soru.ders] ?? 0;
      dersSirasi[soru.ders] = sira + 1;
      return { soru, sira: p * 1000 + sira };
    });
  });
  const metinler = new Set<string>();
  for (const { soru } of sorular) {
    if (metinler.has(soru.soruMetni)) throw new Error(`${duzey} ayni soru iki kez: ${soru.soruMetni.slice(0, 60)}`);
    metinler.add(soru.soruMetni);
  }
  let eklenen = 0;
  let guncellenen = 0;
  for (const { soru, sira } of sorular) {
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
    where: { duzey, uretim: "elle", soruMetni: { notIn: [...metinler] } },
  });
  console.log(`${duzey}: ${partiler.length} parti, ${eklenen} eklendi, ${guncellenen} guncellendi, ${silinen.count} eski soru silindi.`);
}

async function main() {
  for (const [duzey, sorular] of HAVUZLAR) await havuzuYaz(duzey, sorular);
  await prisma.$disconnect();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});

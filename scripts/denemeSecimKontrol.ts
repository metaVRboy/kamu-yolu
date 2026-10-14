/**
 * Bugunun denemesini (yoksa olusturarak) alir ve konu dagilimina, grup butunlugune uydugunu kontrol eder.
 * Calistirma: npx tsx scripts/denemeSecimKontrol.ts LISANS
 */
import "dotenv/config";
import assert from "node:assert";
import { prisma } from "../src/lib/prisma";
import { getBugununDenemesi, getDenemeSorulari } from "../src/lib/kpssDeneme";
import { KONU_DAGILIMI } from "../src/lib/kpssDenemeKonular";

async function main() {
  const duzey = (process.argv[2] ?? "LISANS") as keyof typeof KONU_DAGILIMI;
  const deneme = await getBugununDenemesi(duzey);
  const sorular = await getDenemeSorulari(deneme.soruIdler);
  assert.equal(sorular.length, 120);
  assert.equal(new Set(deneme.soruIdler).size, 120, "ayni soru iki kez");
  for (const [ders, konular] of Object.entries(KONU_DAGILIMI[duzey])) {
    for (const [konu, adet] of konular) {
      const n = sorular.filter((s) => s.ders === ders && s.konu === konu).length;
      if (n !== adet) console.log(`uyari: ${ders}/${konu} ${n}/${adet}`);
    }
  }
  // Ortak metinli gruplar bitisik olmali.
  for (const g of new Set(sorular.map((s) => s.grupId).filter(Boolean))) {
    const yerler = sorular.flatMap((s, i) => (s.grupId === g ? [i] : []));
    assert.equal(yerler.at(-1)! - yerler[0], yerler.length - 1, `grup bolunmus: ${g}`);
  }
  console.log(`${duzey} ${deneme.tarih.toISOString().slice(0, 10)}: 120 soru, gemini ${sorular.filter((s) => s.uretim === "gemini").length}, gruplar bitisik.`);
}

main().finally(() => prisma.$disconnect());

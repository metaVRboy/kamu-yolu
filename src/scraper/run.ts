import "dotenv/config";
import { existsSync, readFileSync, writeFileSync } from "fs";
import { join } from "path";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@/generated/prisma/client";
import { scrapeKariyerKapisi } from "./scrapeKariyerKapisi";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

// Normal tarama ~1-2 dk. 10 dk'yi gecerse bir yerde takilmistir: kaydi "zaman asimi"
// diye kapatip cik (yoksa gorev oldurulunce kayit RUNNING kalip "yarida kaldi" gorunuyordu).
const UST_SINIR_MS = 10 * 60_000;
setTimeout(async () => {
  console.error("Tarama 10 dakikayı aştı, durduruluyor.");
  await prisma.scrapeRun
    .updateMany({
      where: { sourceName: "Kariyer Kapısı", status: "RUNNING", startedAt: { gte: new Date(Date.now() - UST_SINIR_MS - 60_000) } },
      data: { status: "FAILED", finishedAt: new Date(), errorMessage: "Zaman aşımı: yerel tarama 10 dakikada bitmedi." },
    })
    .catch((err) => console.error(err));
  process.exit(1);
}, UST_SINIR_MS).unref();

// Gorev 10 dk'da bir calisir; her tarama saatinin (TR) ilk basarisina kadar dener, sonra
// sonraki saate kadar bekler (gunde 4 cekim). Son basari yerel dosyada: bos kontroller DB'yi uyandirmasin.
const TARAMA_SAATLERI = [9, 12, 15, 18];
const SON_BASARI_DOSYASI = join(process.cwd(), "logs", "kk-son-basari.txt");
const TR_MS = 3 * 3_600_000; // Turkiye UTC+3, yaz saati yok

/** Simdiden onceki en son tarama saati (TR). */
function sonTaramaSaati(an = Date.now()): Date {
  const tr = new Date(an + TR_MS);
  const saat = TARAMA_SAATLERI.findLast((s) => s <= tr.getUTCHours());
  const gun = Date.UTC(tr.getUTCFullYear(), tr.getUTCMonth(), tr.getUTCDate()) - (saat === undefined ? 86_400_000 : 0);
  return new Date(gun + (saat ?? TARAMA_SAATLERI.at(-1)!) * 3_600_000 - TR_MS);
}

async function main() {
  const sonBasari = existsSync(SON_BASARI_DOSYASI) ? new Date(readFileSync(SON_BASARI_DOSYASI, "utf8").trim()) : null;
  const hedef = sonTaramaSaati();
  if (sonBasari && sonBasari >= hedef) {
    console.log(`Güncel: son başarılı tarama ${sonBasari.toISOString()}, sıradaki saate kadar bekleniyor.`);
    return;
  }

  console.log("Kariyer Kapısı taraması başlıyor...");
  const summary = await scrapeKariyerKapisi(prisma);
  writeFileSync(SON_BASARI_DOSYASI, new Date().toISOString());

  console.log(`\n${summary.postingsFound} ilan bulundu.`);
  console.log(`Tamamlandı: ${summary.positionsProcessed} pozisyon işlendi.`);
  console.log(`${summary.staleDeactivated} eski ilan pasife alındı.`);
  console.log(
    `${summary.unmatchedCount} pozisyon bilinen bir bölümle eşleşmedi.`,
  );
  if (summary.unmatchedSamples.length > 0) {
    console.log("\nÖrnek eşleşmeyen metinler:");
    for (const t of summary.unmatchedSamples) {
      console.log(" -", t.replace(/\n/g, " "));
    }
  }
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

import "dotenv/config";
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

async function main() {
  console.log("Kariyer Kapısı taraması başlıyor...");
  const summary = await scrapeKariyerKapisi(prisma);

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

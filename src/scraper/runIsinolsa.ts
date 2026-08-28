import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@/generated/prisma/client";
import { scrapeIsinolsa } from "./scrapeIsinolsa";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("İşin Olsa taraması başlıyor...");
  const summary = await scrapeIsinolsa(prisma);

  console.log(`\n${summary.postingsFound} ilan bulundu.`);
  console.log(`Tamamlandı: ${summary.positionsProcessed} pozisyon işlendi.`);
  console.log(`${summary.staleDeactivated} eski ilan pasife alındı.`);
  console.log(
    `${summary.unmatchedCount} pozisyon bilinen bir bölümle eşleşmedi.`,
  );
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

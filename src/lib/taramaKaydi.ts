import { prisma } from "@/lib/prisma";

/**
 * Bir taramayi/arastirmayi ScrapeRun olarak kaydeder: admin "Taramalar" listesinde gorunur,
 * 24 saat basarisiz kalirsa alarm verir. postingsFound = eklenen kayit sayisi.
 */
export async function taramaKaydiyla<T extends { eklenen: number }>(sourceName: string, is: () => Promise<T>): Promise<T> {
  const run = await prisma.scrapeRun.create({ data: { sourceName, status: "RUNNING" } });
  try {
    const sonuc = await is();
    await prisma.scrapeRun.update({ where: { id: run.id }, data: { status: "SUCCESS", finishedAt: new Date(), postingsFound: sonuc.eklenen } });
    return sonuc;
  } catch (err) {
    await prisma.scrapeRun.update({ where: { id: run.id }, data: { status: "FAILED", finishedAt: new Date(), errorMessage: err instanceof Error ? err.message : String(err) } });
    throw err;
  }
}

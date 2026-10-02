import { prisma } from "@/lib/prisma";

/**
 * ÖSYM merkezi KPSS tercih kilavuzlarindaki kadro istatistikleri -
 * kaynak sitenin bot korumasi CANLI sunucu-tarafi istekleri
 * engelledigi icin, bu veri bir kerelik (scripts/kpssScrapeOneShot.ts
 * ile, normal bir IP'den) cekilip KpssBolum/KpssYillikAlim tablolarina
 * aktarildi. Burasi SADECE kendi veritabanimizdan okur.
 */
export type OgrenimDuzeyi = "LISANS" | "ONLISANS" | "LISE";

export type KpssBolum = { id: string; ad: string; ogrenimDuzeyi: OgrenimDuzeyi };

export async function getKpssBolumListesi(): Promise<KpssBolum[]> {
  const rows = await prisma.kpssBolum.findMany({
    select: { id: true, ad: true, ogrenimDuzeyi: true },
    orderBy: { ad: "asc" },
  });
  return rows as KpssBolum[];
}

export type KpssBolumVerisi = {
  yillikAlimlar: { yil: number; kontenjan: number }[];
  toplamKontenjan: number;
  minPuan: number | null;
  maxPuan: number | null;
};

export async function getKpssBolumVerisi(id: string): Promise<KpssBolumVerisi | null> {
  const bolum = await prisma.kpssBolum.findUnique({
    where: { id },
    include: { yillikAlimlar: { orderBy: { yil: "asc" } } },
  });
  if (!bolum) return null;

  return {
    yillikAlimlar: bolum.yillikAlimlar.map((y) => ({ yil: y.yil, kontenjan: y.kontenjan })),
    toplamKontenjan: bolum.toplamKontenjan,
    minPuan: bolum.minPuan,
    maxPuan: bolum.maxPuan,
  };
}

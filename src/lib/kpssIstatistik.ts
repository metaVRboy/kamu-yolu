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

/** KPSS yillik alim verisinin kapsadigi gercek yil araligi (secim kutulari ve varsayilan araligi belirlemek icin). */
export async function getKpssVeriAraligi(): Promise<{ ilkYil: number; sonYil: number }> {
  const agg = await prisma.kpssYillikAlim.aggregate({ _min: { yil: true }, _max: { yil: true } });
  return { ilkYil: agg._min.yil ?? 0, sonYil: agg._max.yil ?? 0 };
}

export type BolumSiralamaSatiri = { id: string; ad: string; ogrenimDuzeyi: OgrenimDuzeyi; toplam: number };

/**
 * Secilen yil araliginda (verilmezse verinin kapsadigi TUM yillarda)
 * bolume dusen TOPLAM kontenjani hesaplar.
 */
export async function getBolumSiralamasi(params: {
  baslangicYil?: number;
  bitisYil?: number;
  siralama: "cok" | "az";
  limit?: number;
}): Promise<BolumSiralamaSatiri[]> {
  const { ilkYil, sonYil } = await getKpssVeriAraligi();
  const baslangic = params.baslangicYil ?? ilkYil;
  const bitis = params.bitisYil ?? sonYil;

  const gruplar = await prisma.kpssYillikAlim.groupBy({
    by: ["bolumId"],
    where: { yil: { gte: baslangic, lte: bitis } },
    _sum: { kontenjan: true },
  });

  const anlamliGruplar = gruplar.filter((g) => (g._sum.kontenjan ?? 0) > 0);
  const bolumler = await prisma.kpssBolum.findMany({
    where: { id: { in: anlamliGruplar.map((g) => g.bolumId) } },
    select: { id: true, ad: true, ogrenimDuzeyi: true },
  });
  const bolumById = new Map(bolumler.map((b) => [b.id, b]));

  const satirlar: BolumSiralamaSatiri[] = anlamliGruplar
    .map((g) => {
      const b = bolumById.get(g.bolumId);
      if (!b) return null;
      return {
        id: b.id,
        ad: b.ad,
        ogrenimDuzeyi: b.ogrenimDuzeyi as OgrenimDuzeyi,
        toplam: g._sum.kontenjan ?? 0,
      };
    })
    .filter((s): s is BolumSiralamaSatiri => s !== null);

  satirlar.sort((a, b) => (params.siralama === "az" ? a.toplam - b.toplam : b.toplam - a.toplam));
  return params.limit ? satirlar.slice(0, params.limit) : satirlar;
}

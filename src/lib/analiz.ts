import { Prisma } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import { extractHeadcount } from "@/lib/postingDedupe";

export type BolumAnalizSatiri = {
  departmentId: string;
  name: string;
  slug: string;
  level: string;
  ilanSayisi: number;
  tahminiKontenjan: number;
};

/**
 * Bolume gore ilan sayisi ve (baslikta gecen sayilardan cikarilan, bu
 * yuzden "tahmini" olan) toplam kontenjani hesaplar. Sadece AKTIF
 * ilanlar degil - gecmis/suresi dolmus ilanlar da dahil, cunku bu bir
 * GECMIS DONEM analizi (mevcut ilan listeleme sayfalarindan farkli
 * olarak isActive filtresi UYGULANMAZ).
 */
export async function getBolumAnaliz(filters?: {
  baslangic?: Date;
  bitis?: Date;
}): Promise<BolumAnalizSatiri[]> {
  const where: Prisma.PostingWhereInput = { isDemo: false };
  if (filters?.baslangic || filters?.bitis) {
    where.publishedAt = {
      ...(filters.baslangic ? { gte: filters.baslangic } : {}),
      ...(filters.bitis ? { lte: filters.bitis } : {}),
    };
  }

  const postings = await prisma.posting.findMany({
    where,
    select: {
      title: true,
      departments: {
        select: { department: { select: { id: true, name: true, slug: true, level: true } } },
      },
    },
  });

  const map = new Map<string, BolumAnalizSatiri>();
  for (const p of postings) {
    const kontenjan = extractHeadcount(p.title) ?? 0;
    for (const { department: d } of p.departments) {
      const mevcut = map.get(d.id) ?? {
        departmentId: d.id,
        name: d.name,
        slug: d.slug,
        level: d.level,
        ilanSayisi: 0,
        tahminiKontenjan: 0,
      };
      mevcut.ilanSayisi += 1;
      mevcut.tahminiKontenjan += kontenjan;
      map.set(d.id, mevcut);
    }
  }

  return Array.from(map.values());
}

/** Sitenin veri topladigi gercek tarih araligi - "yillar" diye bir iddiada bulunmamak icin filtrenin sinirlarini bununla gosteririz. */
export async function getVeriAraligi(): Promise<{ ilk: Date | null; son: Date | null }> {
  const [ilk, son] = await Promise.all([
    prisma.posting.findFirst({
      where: { isDemo: false, publishedAt: { not: null } },
      orderBy: { publishedAt: "asc" },
      select: { publishedAt: true },
    }),
    prisma.posting.findFirst({
      where: { isDemo: false, publishedAt: { not: null } },
      orderBy: { publishedAt: "desc" },
      select: { publishedAt: true },
    }),
  ]);
  return { ilk: ilk?.publishedAt ?? null, son: son?.publishedAt ?? null };
}

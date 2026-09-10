import { prisma } from "@/lib/prisma";
import { normalize } from "@/lib/matching";

export async function getLatestHaberler(limit = 5) {
  return prisma.haber.findMany({ orderBy: { yayinTarihi: "desc" }, take: limit });
}

export async function getAllHaberler() {
  return prisma.haber.findMany({ orderBy: { yayinTarihi: "desc" } });
}

/**
 * Bir bolumun adi/aliaslariyla baslik+ozet metninde eslesen haberleri
 * dondurur - bolum sayfasinda "Ilgili Haberler" bolumu icin. Haber sayisi
 * az oldugu icin (yuzlerce degil) tumunu cekip bellekte filtrelemek yeterli.
 */
export async function getHaberlerForDepartment(
  department: { id: string; name: string },
  limit = 6,
) {
  const aliases = await prisma.departmentAlias.findMany({
    where: { departmentId: department.id },
    select: { alias: true },
  });
  const terimler = [department.name, ...aliases.map((a) => a.alias)].map(normalize);

  const haberler = await prisma.haber.findMany({ orderBy: { yayinTarihi: "desc" } });

  return haberler
    .filter((h) => {
      const metin = normalize(`${h.baslik} ${h.ozet}`);
      return terimler.some((t) => metin.includes(t));
    })
    .slice(0, limit);
}

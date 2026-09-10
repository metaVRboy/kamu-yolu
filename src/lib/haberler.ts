import { prisma } from "@/lib/prisma";

export async function getLatestHaberler(limit = 5) {
  return prisma.haber.findMany({ orderBy: { yayinTarihi: "desc" }, take: limit });
}

export async function getAllHaberler() {
  return prisma.haber.findMany({ orderBy: { yayinTarihi: "desc" } });
}

/**
 * Bir bolumle eslesen haberleri dondurur - bolum sayfasindaki "Ilgili
 * Haberler" bolumu icin. Eslesme, haber olusturulurken kaynagin TAM
 * metnine gore bir kez hesaplanip HaberDepartment tablosuna kaydedilir
 * (sadece kisa ozete bakmaz - ör. ozette gecmeyen ama haberin icinde
 * gecen "diyetisyen alimi" gibi bir ifadeyi de yakalar).
 */
export async function getHaberlerForDepartment(department: { id: string }, limit = 6) {
  return prisma.haber.findMany({
    where: { departments: { some: { departmentId: department.id } } },
    orderBy: { yayinTarihi: "desc" },
    take: limit,
  });
}

import { prisma } from "@/lib/prisma";
import { haberSuresiGectiMi } from "@/lib/haberYayin";

// Suresi gecen haberler silinmez (detay sayfasi uyariyla acik kalir), sadece
// listelerden cikarilir - bkz. haberYayin.ts. Filtre metin icindeki tarihlere
// de baktigi icin bellekte uygulanir; yeterli aday icin genis pencere cekilir.
const ADAY_PENCERESI = 300;

async function yayindakiler(where: Parameters<typeof prisma.haber.findMany>[0] = {}, limit?: number) {
  const adaylar = await prisma.haber.findMany({ ...where, orderBy: { yayinTarihi: "desc" }, take: ADAY_PENCERESI });
  const simdi = Date.now();
  const yayinda = adaylar.filter((h) => !haberSuresiGectiMi(h, simdi));
  return limit ? yayinda.slice(0, limit) : yayinda;
}

export async function getLatestHaberler(limit = 5) {
  return yayindakiler({}, limit);
}

/** Haberler sayfasi: suresi gecmemis tum haberler. */
export async function getYayindakiHaberler() {
  return yayindakiler();
}

/** Admin paneli: suresi gecenler dahil tum haberler. */
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
  return yayindakiler({ where: { departments: { some: { departmentId: department.id } } } }, limit);
}

/** Haberin kendi sayfasi (/haberler/[slug]) icin - iliskili bolumleriyle birlikte. */
export async function getHaberBySlug(slug: string) {
  return prisma.haber.findUnique({
    where: { slug },
    include: { departments: { include: { department: true } } },
  });
}

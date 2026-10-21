import { unstable_cache } from "next/cache";
import { prisma } from "@/lib/prisma";

const GUN_MS = 86_400_000;

/**
 * Uyenin bolumune eslesen ilanlardan gercek sayilar (bant, ana sayfa, profil ortak kaynagi):
 * yeni7 = son 7 gunde eklenen aktif ilan, yaklasan = son basvurusuna 3 gunden az kalan,
 * kacirilan30 = son 30 gunde eklenip son basvurusu gecmis ilan, aktif = su an basvurulabilir ilan.
 * Bolumu yoksa null (duzeye gore sayim yuzlerce ilan eder, "sana ozel" degildir).
 */
export async function kisiselOzet(departmentId: string | null) {
  if (!departmentId) return null;
  const simdi = new Date();
  const eslesen = { adminGizli: false, departments: { some: { departmentId } } };
  // isActive tek basina yetmez: son basvurusu gecmis ama henuz pasiflenmemis ilan "aktif" sayilmasin.
  const basvurulabilir = { ...eslesen, isActive: true, OR: [{ applicationEnd: null }, { applicationEnd: { gte: simdi } }] };
  const [bolum, yeni7, yaklasan, kacirilan30, aktif] = await Promise.all([
    prisma.department.findUnique({ where: { id: departmentId }, select: { name: true, slug: true } }),
    prisma.posting.count({ where: { ...basvurulabilir, createdAt: { gte: new Date(simdi.getTime() - 7 * GUN_MS) } } }),
    prisma.posting.count({ where: { ...eslesen, isActive: true, applicationEnd: { gte: simdi, lte: new Date(simdi.getTime() + 3 * GUN_MS) } } }),
    prisma.posting.count({ where: { ...eslesen, createdAt: { gte: new Date(simdi.getTime() - 30 * GUN_MS) }, applicationEnd: { lt: simdi } } }),
    prisma.posting.count({ where: basvurulabilir }),
  ]);
  return bolum && { bolumAdi: bolum.name, bolumSlug: bolum.slug, yeni7, yaklasan, kacirilan30, aktif };
}

export type KisiselOzet = NonNullable<Awaited<ReturnType<typeof kisiselOzet>>>;

/**
 * Bildirim zili (her 2 dk yoklanir) icin: bolume son 7 gunde eslesen acik ilan sayisi. Bolum basina 10 dk ortak
 * onbellek: ayni bolumdeki tum uyeler tek sorguyu paylasir (Neon compute'u yoklama basina sorgu yemesin).
 */
export const bolumHaftalikYeni = unstable_cache(
  async (departmentId: string) => {
    const simdi = new Date();
    return prisma.posting.count({
      where: {
        adminGizli: false,
        isActive: true,
        departments: { some: { departmentId } },
        createdAt: { gte: new Date(simdi.getTime() - 7 * GUN_MS) },
        OR: [{ applicationEnd: null }, { applicationEnd: { gte: simdi } }],
      },
    });
  },
  ["bolum-haftalik-yeni"],
  { revalidate: 600 },
);

/**
 * Bolum sayfasi istatistigi (gercek kayitlardan): son 30 gunde bu bolume eslesen ilan sayisi ve ilanlarin ortalama
 * acik kalma suresi (son 180 gun, baslangic + bitis tarihi olan en az 3 ilan yoksa null).
 */
export async function bolumIstatistigi(departmentId: string) {
  const simdi = Date.now();
  const eslesen = { adminGizli: false, departments: { some: { departmentId } } };
  const [son30, sureli] = await Promise.all([
    prisma.posting.count({ where: { ...eslesen, createdAt: { gte: new Date(simdi - 30 * GUN_MS) } } }),
    prisma.posting.findMany({
      where: { ...eslesen, createdAt: { gte: new Date(simdi - 180 * GUN_MS) }, applicationStart: { not: null }, applicationEnd: { not: null } },
      select: { applicationStart: true, applicationEnd: true },
    }),
  ]);
  const sureler = sureli.map((p) => (p.applicationEnd!.getTime() - p.applicationStart!.getTime()) / GUN_MS).filter((g) => g > 0 && g < 120);
  const ortalamaGun = sureler.length >= 3 ? Math.round(sureler.reduce((a, b) => a + b, 0) / sureler.length) : null;
  return { son30, ortalamaGun };
}

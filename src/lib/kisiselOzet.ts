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

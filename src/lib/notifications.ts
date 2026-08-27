import { prisma } from "@/lib/prisma";

export async function createBildirim(params: {
  userId: string;
  tur: string;
  baslik: string;
  icerik?: string | null;
  link?: string | null;
}) {
  return prisma.bildirim.create({
    data: {
      userId: params.userId,
      tur: params.tur,
      baslik: params.baslik,
      icerik: params.icerik ?? null,
      link: params.link ?? null,
    },
  });
}

export async function getOkunmamisBildirimSayisi(userId: string): Promise<number> {
  return prisma.bildirim.count({ where: { userId, okundu: false } });
}

export async function getBanaOzelBildirimler(userId: string, limit = 30) {
  return prisma.bildirim.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    take: limit,
  });
}

export async function getGenelDuyurular(limit = 30) {
  return prisma.duyuru.findMany({ orderBy: { createdAt: "desc" }, take: limit });
}

export async function markBildirimlerOkundu(userId: string) {
  await prisma.bildirim.updateMany({ where: { userId, okundu: false }, data: { okundu: true } });
}

/**
 * Yeni bir ilan belirli bolumlerle eslestiginde, o bolumu profilinde
 * secmis kullanicilara "bolumune uygun ilan" bildirimi olusturur.
 * Scraper, her ilanin bolum eslesmeleri kaydedildikten sonra cagirir.
 */
export async function notifyUsersForMatchedPosting(params: {
  postingTitle: string;
  departments: { departmentId: string; slug: string }[];
}) {
  if (params.departments.length === 0) return;

  const users = await prisma.user.findMany({
    where: { departmentId: { in: params.departments.map((d) => d.departmentId) } },
    select: { id: true, departmentId: true },
  });
  if (users.length === 0) return;

  const slugByDeptId = new Map(params.departments.map((d) => [d.departmentId, d.slug]));

  await prisma.bildirim.createMany({
    data: users.map((u) => ({
      userId: u.id,
      tur: "ILAN_ESLESME",
      baslik: "Bölümüne uygun yeni ilan",
      icerik: params.postingTitle,
      link: `/bolum/${slugByDeptId.get(u.departmentId!)}`,
    })),
  });
}

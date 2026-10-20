import { prisma } from "@/lib/prisma";
import { createBildirim } from "@/lib/notifications";
import { Prisma } from "@/generated/prisma/client";

const GUN_MS = 86_400_000;
/** Yeni uyeye hos geldin hediyesi (e-posta ve Google kaydi). */
export const KAYIT_HEDIYE_GUN = 3;

/**
 * Bedava Pro gunu verir (kayit, seri, davet). Ayni `neden` bir uyeye bir kez: ProHediye @@unique once yazilir,
 * paralel iki istekten yalniz biri gecer. Ucretsiz (ya da suresi dolmus) uye `gun` gunluk Pro olur; sureli Pro/Pro+
 * uyenin bitisi uzar; suresiz (admin verdigi) plana dokunulmaz. Verildiyse true.
 */
export async function proHediyeEt(userId: string, neden: string, gun: number, baslik: string): Promise<boolean> {
  try {
    await prisma.proHediye.create({ data: { userId, neden, gun } });
  } catch (e) {
    if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2002") return false;
    throw e;
  }
  const u = await prisma.user.findUnique({ where: { id: userId }, select: { abonelikPlani: true, abonelikBitis: true, askiyaAlindi: true } });
  if (!u || u.askiyaAlindi) return false;
  const simdi = Date.now();
  const aktifUcretli = u.abonelikPlani !== "UCRETSIZ" && (!u.abonelikBitis || u.abonelikBitis.getTime() > simdi);
  if (aktifUcretli && !u.abonelikBitis) return true; // suresiz plan: hediye kaydi yeter
  const bitis = new Date((aktifUcretli ? u.abonelikBitis!.getTime() : simdi) + gun * GUN_MS);
  await prisma.user.update({ where: { id: userId }, data: aktifUcretli ? { abonelikBitis: bitis } : { abonelikPlani: "PRO", abonelikBitis: bitis } });
  await createBildirim({ userId, tur: "PRO_HEDIYE", baslik, icerik: `${gun} gün Pro hesabına tanımlandı.`, link: "/profilim/abonelik" });
  return true;
}

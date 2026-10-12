import { createHash } from "crypto";
import { redirect } from "next/navigation";
import { getAktifOturumId, getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

/** Admin iki asamali dogrulamasi bir oturumda bu kadar gecerli; sonra kod tekrar istenir. */
export const ADMIN_DOGRULAMA_MS = 12 * 3_600_000;

export const kodOzeti = (kod: string) => createHash("sha256").update(kod).digest("hex");

/** Giris yapmis admin + bu oturumun admin dogrulamasi gecerli mi (oturumu olmayan eski cerez: hayir). */
export async function adminDurumu() {
  const user = await getCurrentUser();
  if (!user?.isAdmin) return { user, dogrulandi: false, oturumId: null };
  const oturumId = await getAktifOturumId();
  const oturum = oturumId ? await prisma.oturum.findUnique({ where: { id: oturumId }, select: { adminDogrulama: true } }) : null;
  const dogrulandi = !!oturum?.adminDogrulama && Date.now() - oturum.adminDogrulama.getTime() < ADMIN_DOGRULAMA_MS;
  return { user, dogrulandi, oturumId };
}

/** Admin sayfalari: giris yoksa girise, admin degilse ana sayfaya, kod dogrulanmamissa dogrulamaya. */
export async function adminSayfasi() {
  const { user, dogrulandi } = await adminDurumu();
  if (!user) redirect("/giris");
  if (!user.isAdmin) redirect("/");
  if (!dogrulandi) redirect("/admin-dogrula");
  return user;
}

/** Admin API'leri: admin degilse ya da bu oturumda kod dogrulanmamissa null (cagiran 403 doner). */
export async function adminApi() {
  const { user, dogrulandi } = await adminDurumu();
  return user?.isAdmin && dogrulandi ? user : null;
}

/** "2026-10-12T09:30" (datetime-local, Istanbul saati) -> Date. */
export function istanbulTarihi(yerel: string) {
  return new Date(`${yerel}:00+03:00`);
}

import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";

/** Admin sayfalari: giris yoksa girise, admin degilse ana sayfaya. */
export async function adminSayfasi() {
  const user = await getCurrentUser();
  if (!user) redirect("/giris");
  if (!user.isAdmin) redirect("/");
  return user;
}

/** Admin API'leri: admin degilse null (cagiran 403 doner). */
export async function adminApi() {
  const user = await getCurrentUser();
  return user?.isAdmin ? user : null;
}

/** "2026-10-12T09:30" (datetime-local, Istanbul saati) -> Date. */
export function istanbulTarihi(yerel: string) {
  return new Date(`${yerel}:00+03:00`);
}

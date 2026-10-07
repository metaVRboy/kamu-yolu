import { NextResponse } from "next/server";
import { createSession, getCurrentUser } from "@/lib/auth";
import { guvenlikEpostasi } from "@/lib/email";
import { prisma } from "@/lib/prisma";

/**
 * Bu cihaz disindaki tum oturumlari kapatir. tokenVersion artirildigi icin
 * listede gorunmeyen eski (oturum kaydi olmayan) cerezler de gecersiz olur;
 * bu cihaz icin yeni oturum acilir.
 */
export async function DELETE() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Giriş yapmalısınız." }, { status: 401 });

  const [guncel] = await prisma.$transaction([
    prisma.user.update({ where: { id: user.id }, data: { tokenVersion: { increment: 1 } } }),
    prisma.oturum.updateMany({ where: { userId: user.id, kapatildi: null }, data: { kapatildi: new Date() } }),
  ]);
  await createSession(guncel.id, guncel.tokenVersion);

  await guvenlikEpostasi(user.email, user.adSoyad, "diğer tüm cihazlardaki oturumların kapatıldı");
  return NextResponse.json({ ok: true });
}

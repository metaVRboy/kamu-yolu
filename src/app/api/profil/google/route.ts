import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { guvenlikEpostasi } from "@/lib/email";
import { prisma } from "@/lib/prisma";

/** Google baglantisini kaldirir. Sifresi olmayan hesapta kaldirilamaz, yoksa hesaba girilemez. */
export async function DELETE() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Giriş yapmalısınız." }, { status: 401 });
  if (!user.googleId) return NextResponse.json({ error: "Hesabına bağlı bir Google hesabı yok." }, { status: 400 });
  if (!user.passwordHash) {
    return NextResponse.json(
      { error: "Önce bir şifre belirlemelisin; aksi hâlde hesabına giriş yapamazsın." },
      { status: 400 },
    );
  }

  await prisma.user.update({ where: { id: user.id }, data: { googleId: null } });
  await guvenlikEpostasi(user.email, user.adSoyad, "Google hesabı bağlantısı kaldırıldı");
  return NextResponse.json({ ok: true });
}

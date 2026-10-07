import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

/** Tek bir oturumu (ör. kayip telefon) kapatir. Yalnizca kullanicinin kendi oturumlari. */
export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Giriş yapmalısınız." }, { status: 401 });

  const { id } = await params;
  const { count } = await prisma.oturum.updateMany({
    where: { id, userId: user.id, kapatildi: null },
    data: { kapatildi: new Date() },
  });
  if (!count) return NextResponse.json({ error: "Oturum bulunamadı." }, { status: 404 });
  return NextResponse.json({ ok: true });
}

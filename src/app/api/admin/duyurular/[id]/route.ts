import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { adminApi } from "@/lib/admin";
import { duyurulariYenile } from "@/lib/notifications";

/** Geri cek: duyuru kaydi kalir (gecmiste gorunur), kullanicilardan gizlenir. */
export async function PATCH(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!(await adminApi())) return NextResponse.json({ error: "Yetkiniz yok." }, { status: 403 });
  const { id } = await params;
  await prisma.duyuru.updateMany({ where: { id, geriCekildi: null }, data: { geriCekildi: new Date() } });
  duyurulariYenile();
  return NextResponse.json({ ok: true });
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!(await adminApi())) return NextResponse.json({ error: "Yetkiniz yok." }, { status: 403 });
  const { id } = await params;
  await prisma.duyuru.deleteMany({ where: { id } });
  duyurulariYenile();
  return NextResponse.json({ ok: true });
}

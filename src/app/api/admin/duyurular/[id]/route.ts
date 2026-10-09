import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { adminApi } from "@/lib/admin";
import { islemKaydet } from "@/lib/islemKaydi";
import { duyurulariYenile } from "@/lib/notifications";

const duyuruBasligi = async (id: string) => (await prisma.duyuru.findUnique({ where: { id }, select: { baslik: true } }))?.baslik;

/** Geri cek: duyuru kaydi kalir (gecmiste gorunur), kullanicilardan gizlenir. */
export async function PATCH(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const admin = await adminApi();
  if (!admin) return NextResponse.json({ error: "Yetkiniz yok." }, { status: 403 });
  const { id } = await params;
  await prisma.duyuru.updateMany({ where: { id, geriCekildi: null }, data: { geriCekildi: new Date() } });
  duyurulariYenile();
  await islemKaydet(admin, "bildirim.geri-cek", await duyuruBasligi(id), "/admin/bildirimler");
  return NextResponse.json({ ok: true });
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const admin = await adminApi();
  if (!admin) return NextResponse.json({ error: "Yetkiniz yok." }, { status: 403 });
  const { id } = await params;
  const baslik = await duyuruBasligi(id);
  await prisma.duyuru.deleteMany({ where: { id } });
  await islemKaydet(admin, "bildirim.sil", baslik, "/admin/bildirimler");
  duyurulariYenile();
  return NextResponse.json({ ok: true });
}

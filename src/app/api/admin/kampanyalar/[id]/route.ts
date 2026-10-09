import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { adminApi } from "@/lib/admin";
import { islemKaydet } from "@/lib/islemKaydi";
import { fiyatlariGuncelle } from "@/lib/fiyatlar";

const kampanyaAdi = async (id: string) => (await prisma.kampanya.findUnique({ where: { id }, select: { ad: true } }))?.ad;

/** Kampanyayi durdur / yeniden baslat. */
export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const admin = await adminApi();
  if (!admin) return NextResponse.json({ error: "Yetkiniz yok." }, { status: 403 });
  const parsed = z.object({ aktif: z.boolean() }).safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Geçersiz bilgiler." }, { status: 400 });
  const { id } = await params;
  await prisma.kampanya.updateMany({ where: { id }, data: { aktif: parsed.data.aktif } });
  fiyatlariGuncelle();
  await islemKaydet(admin, "kampanya.durum", `${await kampanyaAdi(id)} → ${parsed.data.aktif ? "açık" : "durduruldu"}`, "/admin/fiyatlar");
  return NextResponse.json({ ok: true });
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const admin = await adminApi();
  if (!admin) return NextResponse.json({ error: "Yetkiniz yok." }, { status: 403 });
  const { id } = await params;
  const ad = await kampanyaAdi(id);
  await prisma.kampanya.deleteMany({ where: { id } });
  await islemKaydet(admin, "kampanya.sil", ad, "/admin/fiyatlar");
  fiyatlariGuncelle();
  return NextResponse.json({ ok: true });
}

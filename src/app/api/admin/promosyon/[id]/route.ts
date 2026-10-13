import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { adminApi } from "@/lib/admin";
import { islemKaydet } from "@/lib/islemKaydi";

const kodAdi = async (id: string) => (await prisma.promosyonKodu.findUnique({ where: { id }, select: { kod: true } }))?.kod;

/** Kodu durdur / yeniden ac. */
export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const admin = await adminApi();
  if (!admin) return NextResponse.json({ error: "Yetkiniz yok." }, { status: 403 });
  const parsed = z.object({ aktif: z.boolean() }).safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Geçersiz bilgiler." }, { status: 400 });
  const { id } = await params;
  await prisma.promosyonKodu.updateMany({ where: { id }, data: { aktif: parsed.data.aktif } });
  await islemKaydet(admin, "promosyon.durum", `${await kodAdi(id)} → ${parsed.data.aktif ? "açık" : "durduruldu"}`, "/admin/promosyon");
  return NextResponse.json({ ok: true });
}

/** Kodu sil: kullananlarin acilan planlari aynen kalir. */
export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const admin = await adminApi();
  if (!admin) return NextResponse.json({ error: "Yetkiniz yok." }, { status: 403 });
  const { id } = await params;
  const kod = await kodAdi(id);
  await prisma.promosyonKodu.deleteMany({ where: { id } });
  await islemKaydet(admin, "promosyon.sil", kod, "/admin/promosyon");
  return NextResponse.json({ ok: true });
}

import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { adminApi } from "@/lib/admin";
import { fiyatlariGuncelle } from "@/lib/fiyatlar";

/** Kampanyayi durdur / yeniden baslat. */
export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!(await adminApi())) return NextResponse.json({ error: "Yetkiniz yok." }, { status: 403 });
  const parsed = z.object({ aktif: z.boolean() }).safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Geçersiz bilgiler." }, { status: 400 });
  const { id } = await params;
  await prisma.kampanya.updateMany({ where: { id }, data: { aktif: parsed.data.aktif } });
  fiyatlariGuncelle();
  return NextResponse.json({ ok: true });
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!(await adminApi())) return NextResponse.json({ error: "Yetkiniz yok." }, { status: 403 });
  const { id } = await params;
  await prisma.kampanya.deleteMany({ where: { id } });
  fiyatlariGuncelle();
  return NextResponse.json({ ok: true });
}

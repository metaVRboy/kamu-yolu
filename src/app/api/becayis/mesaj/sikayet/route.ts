import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

/** Alici, karsi tarafin mesajini admin incelemesine gonderir. */
export async function POST(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Giriş yapmalısınız." }, { status: 401 });
  const parsed = z.object({ mesajId: z.string().min(1) }).safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Geçersiz bilgiler." }, { status: 400 });

  const m = await prisma.becayisMesaj.findUnique({ where: { id: parsed.data.mesajId }, select: { gonderenId: true, konusmaKarsiId: true, talep: { select: { userId: true } } } });
  // Yalnizca sohbetin iki tarafindan biri, karsi tarafin mesajini sikayet edebilir.
  const tarafMi = m && (m.talep.userId === user.id || m.konusmaKarsiId === user.id);
  if (!m || !tarafMi || m.gonderenId === user.id) return NextResponse.json({ error: "Mesaj bulunamadı." }, { status: 404 });

  await prisma.becayisMesaj.updateMany({ where: { id: parsed.data.mesajId, sikayetEdildi: null }, data: { sikayetEdildi: new Date() } });
  return NextResponse.json({ ok: true });
}

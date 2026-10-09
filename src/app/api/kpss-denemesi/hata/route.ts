import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const bodySchema = z.object({ soruId: z.string().min(1), aciklama: z.string().trim().min(5, "Hatayı kısaca anlat (en az 5 harf).").max(1000) });

/** Cozum ekranindan "bu soruda hata var". Yalnizca bitirdigi denemedeki soruyu bildirebilir; ikinci bildirim ilkini gunceller. */
export async function POST(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Giriş yapmalısınız." }, { status: 401 });
  const parsed = bodySchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Geçersiz bilgiler." }, { status: 400 });
  const { soruId, aciklama } = parsed.data;

  const cozdu = await prisma.denemeKatilim.findFirst({
    where: { userId: user.id, bitisZamani: { not: null }, gunlukDeneme: { soruIdler: { has: soruId } } },
    select: { id: true },
  });
  if (!cozdu) return NextResponse.json({ error: "Bu soruyu içeren bir denemen yok." }, { status: 404 });

  await prisma.soruHataBildirimi.upsert({
    where: { soruId_userId: { soruId, userId: user.id } },
    create: { soruId, userId: user.id, aciklama },
    update: { aciklama, cozuldu: null, createdAt: new Date() },
  });
  return NextResponse.json({ ok: true });
}

import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { buHaftakiDenemeSayisi } from "@/lib/kpssDeneme";
import { getFiyatlar } from "@/lib/fiyatlar";
import { YUKSELTME_KAYNAKLARI, type YukseltmeKaynagi } from "@/lib/planlar";

/** Yukseltme penceresi verisi: gercek site sayilari + kullanicinin mevcut plani ve onceki talebi. */
export async function GET() {
  const user = await getCurrentUser();
  const [aktifIlan, haftalikDeneme, talep, fiyat] = await Promise.all([
    prisma.posting.count({ where: { isActive: true } }),
    buHaftakiDenemeSayisi(),
    user ? prisma.yukseltmeTalebi.findUnique({ where: { userId: user.id }, select: { plan: true, yillik: true } }) : null,
    getFiyatlar(),
  ]);
  return NextResponse.json({ girisli: !!user, plan: user?.abonelikPlani ?? null, talep, aktifIlan, haftalikDeneme, fiyat });
}

const bodySchema = z.object({
  plan: z.enum(["PRO", "PRO_PLUS"]),
  yillik: z.boolean(),
  kaynak: z.enum(YUKSELTME_KAYNAKLARI as [YukseltmeKaynagi, ...YukseltmeKaynagi[]]),
});

/** Odeme altyapisi gelene kadar "Acilinca haber ver": kullanici basina son tercih saklanir. */
export async function POST(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Giriş yapmalısınız." }, { status: 401 });

  const parsed = bodySchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Geçersiz bilgiler." }, { status: 400 });
  const { plan, yillik, kaynak } = parsed.data;
  // Zaten sahip oldugu (ya da daha ust) plani isteyemez.
  if (user.abonelikPlani === "PRO_PLUS" || user.abonelikPlani === plan) {
    return NextResponse.json({ error: "Bu plana zaten sahipsin." }, { status: 400 });
  }

  await prisma.yukseltmeTalebi.upsert({
    where: { userId: user.id },
    create: { userId: user.id, plan, yillik, kaynak },
    update: { plan, yillik, kaynak },
  });
  return NextResponse.json({ ok: true });
}

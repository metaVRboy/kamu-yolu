import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { adminApi } from "@/lib/admin";
import { fiyatlariGuncelle } from "@/lib/fiyatlar";
import { UCRETLI_PLANLAR } from "@/lib/planlar";

const fiyat = z.number().int().min(1).max(100_000);
const donemler = z.object({ aylik: fiyat, yillik: fiyat });
const bodySchema = z.object({ PRO: donemler, PRO_PLUS: donemler });

/** Liste fiyatlarini gunceller; sitedeki tum fiyatlar (sozlesmeler dahil) hemen yenilenir. */
export async function PUT(req: NextRequest) {
  if (!(await adminApi())) return NextResponse.json({ error: "Yetkiniz yok." }, { status: 403 });
  const parsed = bodySchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Fiyatlar 1 ile 100.000 TL arasında tam sayı olmalı." }, { status: 400 });

  await prisma.$transaction(
    UCRETLI_PLANLAR.map((plan) =>
      prisma.planFiyat.upsert({ where: { plan }, create: { plan, ...parsed.data[plan] }, update: parsed.data[plan] }),
    ),
  );
  fiyatlariGuncelle();
  return NextResponse.json({ ok: true });
}

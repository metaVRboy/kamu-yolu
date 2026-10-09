import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { bugunkuDurumlar, haftalikHak, sonDenemeler } from "@/lib/kpssDeneme";
import { DENEME_DUZEYLERI, TOPLAM_SORU } from "@/lib/kpssDenemeSabitler";

/** Mobil KPSS ana ekrani: sitedeki /kpss-denemesi verisi (duzey kartlari, haftalik hak, son denemeler). */
export async function GET() {
  const user = await getCurrentUser();
  const [havuz, durumlar, gecmis, hak] = await Promise.all([
    prisma.denemeSoru.groupBy({ by: ["duzey"], _count: { _all: true } }),
    user ? bugunkuDurumlar(user.id) : null,
    user ? sonDenemeler(user.id) : [],
    user ? haftalikHak(user.id, user.abonelikPlani) : null,
  ]);
  const sayi = new Map(havuz.map((h) => [h.duzey, h._count._all]));
  return NextResponse.json({
    plan: user?.abonelikPlani ?? null,
    hak,
    duzeyler: DENEME_DUZEYLERI.map((d) => ({ duzey: d, hazir: (sayi.get(d) ?? 0) >= TOPLAM_SORU, bugun: durumlar?.get(d) ?? null })),
    gecmis: gecmis.map((g) => ({ ...g, tarih: g.tarih.toISOString() })),
  });
}

import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { buHaftakiDenemeSayisi } from "@/lib/kpssDeneme";
import { getFiyatlar } from "@/lib/fiyatlar";
import { getPostingsForDepartment } from "@/lib/matching";
import { gunlukSayacArtir } from "@/lib/sayac";

const GUN_MS = 86_400_000;
/** Pencere gosterildi: gunluk sayac (kisisel veri yok). "Haber ver" talebi / gosterim = donusum orani. */
export async function POST() {
  await gunlukSayacArtir("tanitim-gosterim");
  return NextResponse.json({ ok: true });
}

/**
 * Periyodik tanitim penceresinin verisi. Tum sayilar gercek: kullanicinin bolumune uygun aktif
 * ilanlar (bu hafta yayimlanan / 7 gun icinde basvurusu biten), site geneli ilan, haftalik deneme
 * ve aktif becayis talebi sayisi. Uydurma yorum ya da kullanici sayisi yok.
 */
export async function GET() {
  const user = await getCurrentUser();
  const simdi = Date.now();
  const [aktifIlan, haftalikDeneme, becayisTalep, fiyat, bolum] = await Promise.all([
    prisma.posting.count({ where: { isActive: true } }),
    buHaftakiDenemeSayisi(),
    prisma.becayisTalep.count({ where: { isActive: true } }),
    getFiyatlar(),
    user?.departmentId ? prisma.department.findUnique({ where: { id: user.departmentId }, select: { id: true, name: true } }) : null,
  ]);
  const ilanlar = bolum ? await getPostingsForDepartment(bolum.id) : [];
  return NextResponse.json({
    plan: user?.abonelikPlani ?? null,
    aktifIlan,
    haftalikDeneme,
    becayisTalep,
    fiyat,
    bolum: bolum && {
      ad: bolum.name,
      aktif: ilanlar.length,
      buHafta: ilanlar.filter((p) => p.publishedAt && simdi - p.publishedAt.getTime() < 7 * GUN_MS).length,
      yakindaBiten: ilanlar.filter((p) => p.applicationEnd && p.applicationEnd.getTime() - simdi < 7 * GUN_MS).length,
    },
  });
}

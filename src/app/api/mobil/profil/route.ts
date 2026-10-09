import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { getPostingsForDepartment, getPostingsForLevel } from "@/lib/matching";
import { profilFotografiUrl } from "@/lib/profil";
import { LEVEL_LABEL } from "@/lib/labels";
import { PLAN_ADI } from "@/lib/planlar";
import { ilanKartlari } from "@/lib/mobil";

/** Mobil profil: sitedeki /profilim ozeti (kullanici, plani, ona uygun ilanlar). Giris yoksa { kullanici: null }. */
export async function GET() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ kullanici: null });
  const [bolum, foto, ilanlar] = await Promise.all([
    user.departmentId ? prisma.department.findUnique({ where: { id: user.departmentId }, select: { id: true, name: true, slug: true } }) : null,
    profilFotografiUrl(user.id),
    user.departmentId ? getPostingsForDepartment(user.departmentId) : user.educationLevel ? getPostingsForLevel(user.educationLevel) : Promise.resolve([]),
  ]);
  return NextResponse.json({
    kullanici: {
      adSoyad: user.adSoyad,
      email: user.email,
      plan: user.abonelikPlani,
      planAdi: PLAN_ADI[user.abonelikPlani],
      abonelikBitis: user.abonelikBitis?.toISOString() ?? null,
      fotografUrl: foto,
      bolum: bolum && { id: bolum.id, ad: bolum.name, slug: bolum.slug },
      duzey: user.educationLevel,
      duzeyAdi: user.educationLevel ? LEVEL_LABEL[user.educationLevel] : null,
    },
    kisiselIlanSayisi: ilanlar.length,
    kisiselIlanlar: await ilanKartlari(ilanlar.slice(0, 4)),
  });
}

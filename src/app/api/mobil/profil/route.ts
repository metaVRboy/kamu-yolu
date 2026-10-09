import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { getPostingsForDepartment, getPostingsForLevel } from "@/lib/matching";
import { profilFotografiUrl } from "@/lib/profil";
import { LEVEL_LABEL } from "@/lib/labels";
import { PLAN_ADI } from "@/lib/planlar";
import { ilanKartlari } from "@/lib/mobil";
import { getOkunmamisIlgilendiklerimSayisi, getOkunmamisMesajSayisi, getTaleplerim } from "@/lib/becayis";

/** Mobil profil: sitedeki /profilim (kullanici, becayis ozeti, okunmamislar, bana ozel ilanlar). Giris yoksa { kullanici: null }. */
export async function GET() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ kullanici: null });
  const [bolum, foto, ilanlar, taleplerim, okunmamisMesaj, okunmamisIlgilendiklerim] = await Promise.all([
    user.departmentId ? prisma.department.findUnique({ where: { id: user.departmentId }, select: { id: true, name: true, slug: true } }) : null,
    profilFotografiUrl(user.id),
    user.departmentId ? getPostingsForDepartment(user.departmentId) : user.educationLevel ? getPostingsForLevel(user.educationLevel) : Promise.resolve([]),
    getTaleplerim(user.id),
    getOkunmamisMesajSayisi(user.id),
    getOkunmamisIlgilendiklerimSayisi(user.id),
  ]);
  const aktifTalepler = taleplerim.filter((t) => t.isActive);
  const sonMesajlar = taleplerim
    .flatMap((t) => t.threads.flatMap((th) => th.mesajlar.map((m) => ({ id: m.id, karsiAdSoyad: th.karsiAdSoyad, mesaj: m.mesaj, createdAt: m.createdAt, okundu: m.okundu || m.gonderenId === user.id }))))
    .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
    .slice(0, 5);
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
    aktifTalepler: aktifTalepler.slice(0, 3).map((t) => ({ id: t.id, meslek: t.meslek, mevcutIl: t.mevcutIl, mevcutIlce: t.mevcutIlce })),
    sonMesajlar: sonMesajlar.map((m) => ({ id: m.id, karsiAdSoyad: m.karsiAdSoyad, mesaj: m.mesaj, okundu: m.okundu })),
    okunmamisMesaj,
    okunmamisIlgilendiklerim,
    kisiselIlanSayisi: ilanlar.length,
    kisiselIlanlar: await ilanKartlari(ilanlar.slice(0, 4)),
  });
}

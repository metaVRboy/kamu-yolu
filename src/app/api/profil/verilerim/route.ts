import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

/**
 * KVKK m.11 - "hakkimda hangi verileri tutuyorsunuz": kullanicinin tum
 * kisisel verisi tek JSON dosyasi olarak indirilir. Sifre ozeti ve oturum
 * surumu gibi guvenlik alanlari kisisel veri degil, disari verilmez.
 */
export async function GET() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Giriş yapmalısınız." }, { status: 401 });

  const [bolum, becayisTalepleri, gonderilenMesajlar, denemeler, bildirimler, oturumlar, fotograf] = await Promise.all([
    user.departmentId ? prisma.department.findUnique({ where: { id: user.departmentId }, select: { name: true } }) : null,
    prisma.becayisTalep.findMany({ where: { userId: user.id }, omit: { userId: true } }),
    prisma.becayisMesaj.findMany({ where: { gonderenId: user.id }, select: { talepId: true, mesaj: true, createdAt: true } }),
    prisma.denemeKatilim.findMany({
      where: { userId: user.id },
      select: {
        baslangicZamani: true,
        bitisZamani: true,
        dogruSayisi: true,
        yanlisSayisi: true,
        bosSayisi: true,
        puan: true,
        gunlukDeneme: { select: { duzey: true, tarih: true } },
      },
    }),
    prisma.bildirim.findMany({ where: { userId: user.id }, omit: { userId: true } }),
    prisma.oturum.findMany({ where: { userId: user.id }, omit: { userId: true } }),
    prisma.profilFotografi.findUnique({ where: { userId: user.id }, select: { guncellenme: true } }),
  ]);

  const veri = {
    olusturulma: new Date().toISOString(),
    aciklama: "Kamu Yolu'nda hesabınla ilişkili tüm kişisel veriler (6698 sayılı KVKK m.11).",
    hesap: {
      adSoyad: user.adSoyad,
      email: user.email,
      telefon: user.telefon,
      meslek: user.meslek,
      kurumTuru: user.kurumTuru,
      kamuCalisaniDegil: user.kamuCalisaniDegil,
      bolum: bolum?.name ?? null,
      ogrenimDuzeyi: user.educationLevel,
      abonelikPlani: user.abonelikPlani,
      googleHesabiBagli: !!user.googleId,
      sifreTanimli: !!user.passwordHash,
      kvkkOnayTarihi: user.kvkkOnayTarihi,
      kayitTarihi: user.createdAt,
      profilFotografiYuklenme: fotograf?.guncellenme ?? null,
    },
    becayisTalepleri,
    gonderilenBecayisMesajlari: gonderilenMesajlar,
    kpssDenemeleri: denemeler,
    bildirimler,
    oturumlar,
  };

  return new NextResponse(JSON.stringify(veri, null, 2), {
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Content-Disposition": `attachment; filename="kamuyolu-verilerim-${new Date().toISOString().slice(0, 10)}.json"`,
      "Cache-Control": "no-store",
    },
  });
}

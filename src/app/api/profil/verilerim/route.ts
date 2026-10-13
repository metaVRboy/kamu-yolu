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

  const [bolum, becayisTalepleri, gonderilenMesajlar, denemeler, bildirimler, oturumlar, fotograf, beklemeListesi, destekMesajlari, smsGonderimleri, soruBildirimleri] = await Promise.all([
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
    // Acik alan listesi: oturum tablosuna sonradan eklenen guvenlik alanlari (admin kod ozeti vb.) disari cikmasin.
    prisma.oturum.findMany({ where: { userId: user.id }, select: { id: true, cihaz: true, olusturma: true, sonGorulme: true, kapatildi: true } }),
    prisma.profilFotografi.findUnique({ where: { userId: user.id }, select: { guncellenme: true } }),
    prisma.yukseltmeTalebi.findUnique({ where: { userId: user.id }, select: { plan: true, yillik: true, kaynak: true, olusturma: true, guncelleme: true } }),
    prisma.destekMesaji.findMany({ where: { userId: user.id }, select: { konu: true, mesaj: true, yanit: true, createdAt: true, yanitlandi: true } }),
    prisma.smsGonderim.findMany({ where: { userId: user.id }, select: { telefon: true, metin: true, tur: true, durum: true, olusturma: true } }),
    prisma.soruHataBildirimi.findMany({ where: { userId: user.id }, select: { aciklama: true, createdAt: true } }),
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
      smsIlanBildirimi: user.smsIlanBildirimi,
      smsBecayisBildirimi: user.smsBecayisBildirimi,
      smsIzinTarihi: user.smsIzinTarihi,
      ticariIletiOnay: user.ticariIletiOnay,
      ticariIletiOnayTarihi: user.ticariIletiOnayTarihi,
      ticariIletiRetTarihi: user.ticariIletiRetTarihi,
      kayitKaynagi: user.kaynak,
      kayitTarihi: user.createdAt,
      profilFotografiYuklenme: fotograf?.guncellenme ?? null,
    },
    becayisTalepleri,
    gonderilenBecayisMesajlari: gonderilenMesajlar,
    kpssDenemeleri: denemeler,
    bildirimler,
    oturumlar,
    beklemeListesi,
    destekMesajlari,
    smsGonderimleri,
    soruHataBildirimleri: soruBildirimleri,
  };

  return new NextResponse(JSON.stringify(veri, null, 2), {
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Content-Disposition": `attachment; filename="kamuyolu-verilerim-${new Date().toISOString().slice(0, 10)}.json"`,
      "Cache-Control": "no-store",
    },
  });
}

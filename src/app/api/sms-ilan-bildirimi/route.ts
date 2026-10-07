import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { aktifProKosulu, sessizSaatMi, smsGonder, sonSmsSayisi } from "@/lib/sms";

export const maxDuration = 120;

const GUN_MS = 24 * 60 * 60 * 1000;
const GUNLUK_ILAN_SMS_SINIRI = 3;

function isAuthorized(req: NextRequest): boolean {
  const secret = process.env.CRON_SECRET ?? process.env.SCRAPE_SECRET;
  return !!secret && req.headers.get("authorization") === `Bearer ${secret}`;
}

/**
 * Taramalardan ~30 dk sonra calisir (vercel.json). Her Pro kullaniciya, son ilan
 * SMS'inden (ya da SMS iznini verdiginden) bu yana olusan "bolumune uygun ilan"
 * bildirimlerini TEK SMS'te toplar: 10 ilan = 10 degil 1 SMS. Gece gonderilmez,
 * kisi basi gunde en fazla 3 ilan SMS'i.
 */
export async function GET(req: NextRequest) {
  if (!isAuthorized(req)) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  if (sessizSaatMi()) return NextResponse.json({ ok: true, atlandi: "sessiz saat" });

  const kullanicilar = await prisma.user.findMany({
    where: { ...aktifProKosulu(), smsIlanBildirimi: true, telefonDogrulandi: { not: null }, telefon: { not: null } },
    select: { id: true, telefon: true, smsIzinTarihi: true },
  });

  let gonderilen = 0;
  for (const k of kullanicilar) {
    if ((await sonSmsSayisi(k.id, "ILAN", GUN_MS)) >= GUNLUK_ILAN_SMS_SINIRI) continue;
    const sonSms = await prisma.smsGonderim.findFirst({
      where: { userId: k.id, tur: "ILAN", kapsamSonu: { not: null } },
      orderBy: { olusturma: "desc" },
      select: { kapsamSonu: true },
    });
    // En gec: son SMS'in kapsadigi son bildirim, SMS izni, 24 saat once - izinden onceki ilanlar SMS'le gelmez.
    // Karsilastirma bildirimin kendi createdAt'iyle yapilir; SMS'in olusturma ani farkli saatten gelebilir.
    const baslangic = new Date(Math.max(sonSms?.kapsamSonu?.getTime() ?? 0, k.smsIzinTarihi?.getTime() ?? 0, Date.now() - GUN_MS));
    const yeni = await prisma.bildirim.aggregate({
      where: { userId: k.id, tur: "ILAN_ESLESME", createdAt: { gt: baslangic } },
      _count: true,
      _max: { createdAt: true },
    });
    const yeniIlan = yeni._count;
    if (!yeniIlan) continue;

    await smsGonder({
      userId: k.id,
      telefon: k.telefon!,
      tur: "ILAN",
      kapsamSonu: yeni._max.createdAt,
      // Link icermez: 1 Nisan 2026 BTK duzenlemesiyle SMS linklerine kisit geldi, kapsam netlesene kadar linksiz.
      metin: `Kamu Yolu: Bölümüne uygun ${yeniIlan} yeni ilan yayımlandı. Profilindeki Bana Özel İlanlar bölümüne göz at.`,
    });
    gonderilen++;
  }

  return NextResponse.json({ ok: true, aday: kullanicilar.length, gonderilen });
}

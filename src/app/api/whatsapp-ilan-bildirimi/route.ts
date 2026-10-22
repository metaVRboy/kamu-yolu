import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { aktifProKosulu, sessizSaatMi, sonMesajSayisi, whatsappGonder } from "@/lib/whatsapp";

export const maxDuration = 120;

const GUN_MS = 24 * 60 * 60 * 1000;
const GUNLUK_ILAN_MESAJ_SINIRI = 3;

function isAuthorized(req: NextRequest): boolean {
  const secret = process.env.CRON_SECRET ?? process.env.SCRAPE_SECRET;
  return !!secret && req.headers.get("authorization") === `Bearer ${secret}`;
}

/**
 * Taramalardan ~30 dk sonra calisir (vercel.json). Her Pro kullaniciya, son ilan
 * mesajindan (ya da WhatsApp iznini verdiginden) bu yana olusan "bolumune uygun ilan"
 * bildirimlerini TEK WhatsApp mesajinda toplar: 10 ilan = 10 degil 1 mesaj. Gece gonderilmez,
 * kisi basi gunde en fazla 3 ilan mesaji.
 */
export async function GET(req: NextRequest) {
  if (!isAuthorized(req)) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  if (sessizSaatMi()) return NextResponse.json({ ok: true, atlandi: "sessiz saat" });

  const kullanicilar = await prisma.user.findMany({
    where: { ...aktifProKosulu(), whatsappIlanBildirimi: true, telefonDogrulandi: { not: null }, telefon: { not: null } },
    select: { id: true, telefon: true, whatsappIzinTarihi: true },
  });

  let gonderilen = 0;
  for (const k of kullanicilar) {
    if ((await sonMesajSayisi(k.id, "ILAN", GUN_MS)) >= GUNLUK_ILAN_MESAJ_SINIRI) continue;
    const sonMesaj = await prisma.whatsappGonderim.findFirst({
      where: { userId: k.id, tur: "ILAN", kapsamSonu: { not: null } },
      orderBy: { olusturma: "desc" },
      select: { kapsamSonu: true },
    });
    // En gec: son mesajin kapsadigi son bildirim, WhatsApp izni, 24 saat once - izinden onceki ilanlar gelmez.
    // Karsilastirma bildirimin kendi createdAt'iyle yapilir; mesajin olusturma ani farkli saatten gelebilir.
    const baslangic = new Date(Math.max(sonMesaj?.kapsamSonu?.getTime() ?? 0, k.whatsappIzinTarihi?.getTime() ?? 0, Date.now() - GUN_MS));
    const yeni = await prisma.bildirim.aggregate({
      where: { userId: k.id, tur: "ILAN_ESLESME", createdAt: { gt: baslangic } },
      _count: true,
      _max: { createdAt: true },
    });
    const yeniIlan = yeni._count;
    if (!yeniIlan) continue;

    await whatsappGonder({ userId: k.id, telefon: k.telefon!, tur: "ILAN", kapsamSonu: yeni._max.createdAt, degerler: [String(yeniIlan)], yol: "profilim" });
    gonderilen++;
  }

  return NextResponse.json({ ok: true, aday: kullanicilar.length, gonderilen });
}

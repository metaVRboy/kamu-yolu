import { randomInt } from "crypto";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getCurrentUser } from "@/lib/auth";
import { gizliOzet } from "@/lib/authAbuse";
import { prisma } from "@/lib/prisma";
import { proAktifMi, sonMesajSayisi, telefonNormalize, whatsappGonder, whatsappTanimli } from "@/lib/whatsapp";

const KOD_GECERLILIK_DAKIKA = 10;
const YENIDEN_GONDERIM_BEKLEME_MS = 60 * 1000;
const GUNLUK_KOD_SINIRI = 5;

const bodySchema = z.object({ telefon: z.string().trim().min(10).max(20) });

/** Telefon dogrulama: numaraya WhatsApp'tan 6 haneli kod gonderir. Yalniz Pro (WhatsApp bildirimleri Pro ozelligi). */
export async function POST(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Giriş yapmalısınız." }, { status: 401 });
  if (!proAktifMi(user)) {
    return NextResponse.json({ error: "WhatsApp bildirimleri Pro üyelere özeldir." }, { status: 403 });
  }
  // Anahtarlar baglanana kadar mesaj gitmez; kodu gorebilecek tek kisi admin (test icin).
  if (!whatsappTanimli() && !user.isAdmin) {
    return NextResponse.json({ error: "WhatsApp bildirimlerini kuruyoruz. Çok yakında!" }, { status: 503 });
  }

  const parsed = bodySchema.safeParse(await req.json().catch(() => null));
  const telefon = parsed.success ? telefonNormalize(parsed.data.telefon) : null;
  if (!telefon) {
    return NextResponse.json({ error: "Geçerli bir cep telefonu numarası gir (ör. 0532 123 45 67)." }, { status: 400 });
  }

  const onceki = await prisma.telefonDogrulamaKodu.findUnique({ where: { userId: user.id } });
  if (onceki && Date.now() - onceki.createdAt.getTime() < YENIDEN_GONDERIM_BEKLEME_MS) {
    return NextResponse.json({ error: "Kod az önce gönderildi. Bir dakika sonra tekrar dene." }, { status: 429 });
  }
  if ((await sonMesajSayisi(user.id, "DOGRULAMA", 24 * 60 * 60 * 1000)) >= GUNLUK_KOD_SINIRI) {
    return NextResponse.json({ error: "Bugün için kod gönderme sınırına ulaştın. Yarın tekrar dene." }, { status: 429 });
  }

  const kod = randomInt(0, 1_000_000).toString().padStart(6, "0");
  const veri = { telefon, kod: gizliOzet("telefon-kodu", kod), deneme: 0, expiresAt: new Date(Date.now() + KOD_GECERLILIK_DAKIKA * 60 * 1000), createdAt: new Date() };
  await prisma.telefonDogrulamaKodu.upsert({ where: { userId: user.id }, update: veri, create: { userId: user.id, ...veri } });

  const gonderim = await whatsappGonder({ userId: user.id, telefon, tur: "DOGRULAMA", degerler: [kod] });
  if (gonderim.durum === "HATA") {
    return NextResponse.json({ error: "WhatsApp mesajı gönderilemedi. Lütfen biraz sonra tekrar dene." }, { status: 502 });
  }
  // Test modunda (saglayici yok) kod yalniz admine, ekranda gosterilmek uzere doner.
  return NextResponse.json({ ok: true, ...(gonderim.durum === "TEST" ? { testKodu: kod } : {}) });
}

import { randomInt } from "crypto";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { proAktifMi, smsGonder, smsSaglayiciTanimli, sonSmsSayisi, telefonNormalize } from "@/lib/sms";

const KOD_GECERLILIK_DAKIKA = 10;
const YENIDEN_GONDERIM_BEKLEME_MS = 60 * 1000;
const GUNLUK_KOD_SINIRI = 5;

const bodySchema = z.object({ telefon: z.string().trim().min(10).max(20) });

/** Telefon dogrulama: numaraya 6 haneli kod gonderir. Yalniz Pro (SMS bildirimleri Pro ozelligi). */
export async function POST(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Giriş yapmalısınız." }, { status: 401 });
  if (!proAktifMi(user)) {
    return NextResponse.json({ error: "SMS bildirimleri Pro üyelere özeldir." }, { status: 403 });
  }
  // Saglayici baglanana kadar SMS gitmez; kodu gorebilecek tek kisi admin (test icin).
  if (!smsSaglayiciTanimli() && !user.isAdmin) {
    return NextResponse.json({ error: "SMS altyapısı henüz hazır değil. Çok yakında!" }, { status: 503 });
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
  if ((await sonSmsSayisi(user.id, "DOGRULAMA", 24 * 60 * 60 * 1000)) >= GUNLUK_KOD_SINIRI) {
    return NextResponse.json({ error: "Bugün için kod gönderme sınırına ulaştın. Yarın tekrar dene." }, { status: 429 });
  }

  const kod = randomInt(0, 1_000_000).toString().padStart(6, "0");
  const veri = { telefon, kod, expiresAt: new Date(Date.now() + KOD_GECERLILIK_DAKIKA * 60 * 1000), createdAt: new Date() };
  await prisma.telefonDogrulamaKodu.upsert({ where: { userId: user.id }, update: veri, create: { userId: user.id, ...veri } });

  const gonderim = await smsGonder({
    userId: user.id,
    telefon,
    tur: "DOGRULAMA",
    metin: `Kamu Yolu doğrulama kodun: ${kod}. Bu kodu kimseyle paylaşma.`,
  });
  if (gonderim.durum === "HATA") {
    return NextResponse.json({ error: "SMS gönderilemedi. Lütfen biraz sonra tekrar dene." }, { status: 502 });
  }
  // Test modunda (saglayici yok) kod yalniz admine, ekranda gosterilmek uzere doner.
  return NextResponse.json({ ok: true, ...(gonderim.durum === "TEST" ? { testKodu: kod } : {}) });
}

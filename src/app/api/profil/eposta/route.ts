import { randomInt } from "crypto";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getCurrentUser, sifreyiTeyitEt } from "@/lib/auth";
import { sendEmail } from "@/lib/email";
import { prisma } from "@/lib/prisma";

const KOD_GECERLILIK_DAKIKA = 10;
const YENIDEN_GONDERIM_BEKLEME_SANIYE = 30;

const bodySchema = z.object({
  yeniEmail: z.string().trim().toLowerCase().email("Geçerli bir e-posta adresi gir."),
  sifre: z.string().optional(),
});

/** 1. adim: yeni adrese 6 haneli kod gonderir. Sifreli hesaplarda mevcut sifre istenir. */
export async function POST(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Giriş yapmalısınız." }, { status: 401 });

  const parsed = bodySchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Geçersiz bilgiler." }, { status: 400 });
  }
  const { yeniEmail, sifre } = parsed.data;
  if (yeniEmail === user.email) {
    return NextResponse.json({ error: "Bu zaten mevcut e-posta adresin." }, { status: 400 });
  }

  const sifreHatasi = await sifreyiTeyitEt(user, sifre);
  if (sifreHatasi) return NextResponse.json({ error: sifreHatasi }, { status: 400 });

  if (await prisma.user.findUnique({ where: { email: yeniEmail }, select: { id: true } })) {
    return NextResponse.json({ error: "Bu e-posta adresiyle zaten bir hesap var." }, { status: 409 });
  }

  const onceki = await prisma.epostaDegisiklikKodu.findUnique({ where: { userId: user.id } });
  if (onceki && Date.now() - onceki.createdAt.getTime() < YENIDEN_GONDERIM_BEKLEME_SANIYE * 1000) {
    return NextResponse.json({ error: "Kod az önce gönderildi. Biraz bekleyip tekrar dene." }, { status: 429 });
  }

  const kod = randomInt(0, 1_000_000).toString().padStart(6, "0");
  const veri = { yeniEmail, kod, expiresAt: new Date(Date.now() + KOD_GECERLILIK_DAKIKA * 60 * 1000), createdAt: new Date() };
  await prisma.epostaDegisiklikKodu.upsert({ where: { userId: user.id }, update: veri, create: { userId: user.id, ...veri } });

  try {
    await sendEmail({
      to: yeniEmail,
      subject: "Kamu Yolu — E-posta doğrulama kodu",
      html: `
        <p>Kamu Yolu hesabının e-posta adresini bu adresle değiştirmek için doğrulama kodun:</p>
        <p style="font-size: 28px; font-weight: bold; letter-spacing: 4px;">${kod}</p>
        <p>Bu kod ${KOD_GECERLILIK_DAKIKA} dakika geçerlidir. Bu isteği sen yapmadıysan bu e-postayı yok sayabilirsin.</p>
      `,
    });
  } catch (err) {
    console.error("E-posta değişikliği kodu gönderilemedi:", err);
    return NextResponse.json({ error: "Kod gönderilemedi. Lütfen tekrar dene." }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}

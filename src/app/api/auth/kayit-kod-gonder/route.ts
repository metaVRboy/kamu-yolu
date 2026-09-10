import { randomInt } from "crypto";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { hashPassword, isSessionConfigured } from "@/lib/auth";
import { sendEmail } from "@/lib/email";
import { passwordSchema } from "@/lib/authValidation";
import { verifyTurnstileToken } from "@/lib/turnstile";

const bodySchema = z.object({
  adSoyad: z.string().trim().min(2).max(100),
  email: z.string().trim().toLowerCase().email(),
  password: passwordSchema,
  kvkkOnay: z.literal(true, { message: "KVKK aydınlatma metnini onaylamalısınız." }),
  turnstileToken: z.string().nullable().optional(),
});

const KOD_GECERLILIK_DAKIKA = 2;
const YENIDEN_GONDERIM_BEKLEME_SANIYE = 30;

export async function POST(req: NextRequest) {
  if (!isSessionConfigured()) {
    console.error("SESSION_SECRET tanımlı değil — kayıt/giriş çalışamaz.");
    return NextResponse.json(
      { error: "Sunucu yapılandırma hatası. Lütfen daha sonra tekrar deneyin." },
      { status: 500 },
    );
  }

  const parsed = bodySchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Geçersiz bilgiler." },
      { status: 400 },
    );
  }
  const { adSoyad, email, password, turnstileToken } = parsed.data;

  if (!(await verifyTurnstileToken(turnstileToken))) {
    return NextResponse.json({ error: "İnsan doğrulaması başarısız. Lütfen tekrar deneyin." }, { status: 400 });
  }

  try {
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return NextResponse.json(
        { error: "Bu e-posta adresiyle zaten bir hesap var." },
        { status: 409 },
      );
    }

    const existingCode = await prisma.emailVerificationCode.findUnique({ where: { email } });
    if (existingCode && Date.now() - existingCode.createdAt.getTime() < YENIDEN_GONDERIM_BEKLEME_SANIYE * 1000) {
      return NextResponse.json(
        { error: "Kod az önce gönderildi. Lütfen biraz bekleyip tekrar dene." },
        { status: 429 },
      );
    }

    const code = randomInt(0, 1_000_000).toString().padStart(6, "0");
    const passwordHash = await hashPassword(password);
    const expiresAt = new Date(Date.now() + KOD_GECERLILIK_DAKIKA * 60 * 1000);

    await prisma.emailVerificationCode.upsert({
      where: { email },
      update: { code, adSoyad, passwordHash, kvkkOnayTarihi: new Date(), expiresAt, usedAt: null },
      create: { email, code, adSoyad, passwordHash, kvkkOnayTarihi: new Date(), expiresAt },
    });

    await sendEmail({
      to: email,
      subject: "Kamu Yolu — Doğrulama Kodu",
      html: `
        <p>Merhaba ${adSoyad},</p>
        <p>Kamu Yolu hesabını oluşturmak için doğrulama kodun:</p>
        <p style="font-size: 28px; font-weight: bold; letter-spacing: 4px;">${code}</p>
        <p>Bu kod ${KOD_GECERLILIK_DAKIKA} dakika geçerlidir. Bu isteği sen yapmadıysan bu e-postayı yok sayabilirsin.</p>
      `,
    });

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("Kayıt kodu gönderme hatası:", err);
    return NextResponse.json(
      { error: "Kod gönderilirken bir sorun oluştu. Lütfen tekrar deneyin." },
      { status: 500 },
    );
  }
}

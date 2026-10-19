import { randomInt } from "crypto";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { hashPassword, isSessionConfigured } from "@/lib/auth";
import { kacis, sendEmail } from "@/lib/email";
import { passwordSchema } from "@/lib/authValidation";
import { verifyTurnstileToken } from "@/lib/turnstile";
import { kaynakTemizle } from "@/lib/kaynak";
import { gizliOzet, gunlukHakKullan } from "@/lib/authAbuse";
import { Prisma } from "@/generated/prisma/client";

const bodySchema = z.object({
  // Yalniz harf: ad, herhangi bir adrese bizim alan adimizdan giden e-postaya yazilir (ad alaninda "itiraz: kotu.site" gibi oltalama).
  adSoyad: z.string().trim().min(2).max(100).regex(/^[\p{L} .'-]+$/u, "Ad soyad yalnızca harf içerebilir."),
  email: z.string().trim().toLowerCase().email(),
  password: passwordSchema,
  // Alan adi geriye uyumluluk icin kvkkOnay; anlami: Kullanim Kosullari kabulu + 18 yas beyani.
  kvkkOnay: z.literal(true, { message: "Kullanım Koşulları'nı kabul etmeli ve 18 yaşından büyük olmalısın." }),
  // Istege bagli; isaretlenmezse kampanya/duyuru iletisi gonderilmez.
  ticariIletiOnay: z.boolean().optional().default(false),
  // Kampanya kaynagi (utm vb.): izinli anahtarlarla kaynakTemizle suzer.
  kaynak: z.unknown().optional(),
  turnstileToken: z.string().nullable().optional(),
});

const KOD_GECERLILIK_DAKIKA = 10;
const YENIDEN_GONDERIM_BEKLEME_SANIYE = 60;
const GUNLUK_KOD_SINIRI = 10;

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
  const { adSoyad, email, password, ticariIletiOnay, turnstileToken } = parsed.data;
  const kaynak = kaynakTemizle(parsed.data.kaynak) ?? Prisma.DbNull;

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

    if (!(await gunlukHakKullan(`kayit:${email}`, GUNLUK_KOD_SINIRI))) {
      return NextResponse.json({ error: "Bu adrese bugün çok fazla kod gönderildi. Yarın tekrar dene." }, { status: 429 });
    }

    const code = randomInt(0, 1_000_000).toString().padStart(6, "0");
    const passwordHash = await hashPassword(password);
    const expiresAt = new Date(Date.now() + KOD_GECERLILIK_DAKIKA * 60 * 1000);
    const veri = { code: gizliOzet("kayit-kodu", code), deneme: 0, adSoyad, passwordHash, kvkkOnayTarihi: new Date(), ticariIletiOnay, kaynak, expiresAt };

    await prisma.emailVerificationCode.upsert({
      where: { email },
      // createdAt yenilenir: tekrar gonderim beklemesi (yukarida) son gonderime gore olculur.
      update: { ...veri, usedAt: null, createdAt: new Date() },
      create: { email, ...veri },
    });

    await sendEmail({
      to: email,
      subject: "Kamu Yolu — Doğrulama Kodu",
      html: `
        <p>Merhaba ${kacis(adSoyad)},</p>
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

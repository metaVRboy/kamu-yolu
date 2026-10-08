import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { askiMesaji, createSession, isSessionConfigured, verifyPassword } from "@/lib/auth";
import { clearFailures, getLockoutState, lockoutMessage, recordFailure } from "@/lib/authAbuse";
import { verifyTurnstileToken } from "@/lib/turnstile";

const bodySchema = z.object({
  email: z.string().trim().toLowerCase().email(),
  password: z.string().min(1),
  turnstileToken: z.string().nullable().optional(),
  beniHatirla: z.boolean().optional(),
});

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
    return NextResponse.json({ error: "Geçersiz bilgiler." }, { status: 400 });
  }
  const { email, password, turnstileToken, beniHatirla } = parsed.data;

  if (!(await verifyTurnstileToken(turnstileToken))) {
    return NextResponse.json({ error: "İnsan doğrulaması başarısız. Lütfen tekrar deneyin." }, { status: 400 });
  }

  const lockout = await getLockoutState(email);
  if (lockout.locked && lockout.lockedUntil) {
    return NextResponse.json({ error: lockoutMessage(lockout.lockedUntil) }, { status: 429 });
  }

  try {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user || !user.passwordHash) {
      await recordFailure(email);
      const mesaj = user && !user.passwordHash
        ? "Bu hesap Google ile oluşturulmuş. Lütfen \"Google ile Giriş Yap\" butonunu kullanın."
        : "E-posta veya şifre hatalı.";
      return NextResponse.json({ error: mesaj }, { status: 401 });
    }
    if (!(await verifyPassword(password, user.passwordHash))) {
      await recordFailure(email);
      return NextResponse.json(
        { error: "E-posta veya şifre hatalı." },
        { status: 401 },
      );
    }

    await clearFailures(email);
    if (user.askiyaAlindi) return NextResponse.json({ error: askiMesaji(user.askiNedeni) }, { status: 403 });
    await createSession(user.id, user.tokenVersion, beniHatirla ?? true);

    return NextResponse.json({ id: user.id, adSoyad: user.adSoyad, email: user.email });
  } catch (err) {
    console.error("Giriş hatası:", err);
    return NextResponse.json(
      { error: "Giriş sırasında bir sorun oluştu. Lütfen tekrar deneyin." },
      { status: 500 },
    );
  }
}

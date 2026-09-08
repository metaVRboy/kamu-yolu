import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { createSession } from "@/lib/auth";
import { clearFailures, getLockoutState, lockoutMessage, recordFailure } from "@/lib/authAbuse";

const bodySchema = z.object({
  email: z.string().trim().toLowerCase().email(),
  code: z.string().trim().length(6),
});

export async function POST(req: NextRequest) {
  const parsed = bodySchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Geçersiz bilgiler." }, { status: 400 });
  }
  const { email, code } = parsed.data;

  const abuseIdentifier = `email-verify:${email}`;
  const lockout = await getLockoutState(abuseIdentifier);
  if (lockout.locked && lockout.lockedUntil) {
    return NextResponse.json({ error: lockoutMessage(lockout.lockedUntil) }, { status: 429 });
  }

  const pending = await prisma.emailVerificationCode.findUnique({ where: { email } });
  if (!pending || pending.usedAt || pending.expiresAt < new Date()) {
    await recordFailure(abuseIdentifier);
    return NextResponse.json(
      { error: "Kodun süresi dolmuş. Lütfen yeni bir kod iste." },
      { status: 400 },
    );
  }
  if (pending.code !== code) {
    await recordFailure(abuseIdentifier);
    return NextResponse.json({ error: "Kod hatalı." }, { status: 400 });
  }
  await clearFailures(abuseIdentifier);

  try {
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return NextResponse.json(
        { error: "Bu e-posta adresiyle zaten bir hesap var." },
        { status: 409 },
      );
    }

    const user = await prisma.$transaction(async (tx) => {
      const created = await tx.user.create({
        data: {
          adSoyad: pending.adSoyad,
          email: pending.email,
          passwordHash: pending.passwordHash,
          kvkkOnayTarihi: pending.kvkkOnayTarihi,
        },
      });
      await tx.emailVerificationCode.delete({ where: { email } });
      return created;
    });

    await createSession(user.id, user.tokenVersion);

    return NextResponse.json({ id: user.id, adSoyad: user.adSoyad, email: user.email });
  } catch (err) {
    console.error("Kayıt doğrulama hatası:", err);
    return NextResponse.json(
      { error: "Hesap oluşturulurken bir sorun oluştu. Lütfen tekrar deneyin." },
      { status: 500 },
    );
  }
}

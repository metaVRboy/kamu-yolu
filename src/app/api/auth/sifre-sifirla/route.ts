import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { createSession, hashPassword, isSessionConfigured } from "@/lib/auth";
import { passwordSchema } from "@/lib/authValidation";

const bodySchema = z.object({
  token: z.string().min(1),
  password: passwordSchema,
});

export async function POST(req: NextRequest) {
  if (!isSessionConfigured()) {
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
  const { token, password } = parsed.data;

  const resetToken = await prisma.passwordResetToken.findUnique({ where: { token } });
  if (!resetToken || resetToken.usedAt || resetToken.expiresAt < new Date()) {
    return NextResponse.json(
      { error: "Bu bağlantının süresi dolmuş veya daha önce kullanılmış." },
      { status: 400 },
    );
  }

  const passwordHash = await hashPassword(password);

  await prisma.$transaction([
    prisma.user.update({ where: { id: resetToken.userId }, data: { passwordHash } }),
    prisma.passwordResetToken.update({ where: { id: resetToken.id }, data: { usedAt: new Date() } }),
  ]);

  await createSession(resetToken.userId);

  return NextResponse.json({ ok: true });
}

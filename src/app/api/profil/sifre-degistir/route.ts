import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { destroySession, getCurrentUser } from "@/lib/auth";
import { hashPassword, verifyPassword } from "@/lib/auth";
import { passwordSchema } from "@/lib/authValidation";
import { clearFailures, getLockoutState, lockoutMessage, recordFailure } from "@/lib/authAbuse";
import { prisma } from "@/lib/prisma";

const bodySchema = z
  .object({
    mevcutSifre: z.string().min(1, "Mevcut şifreni gir."),
    yeniSifre: passwordSchema,
    yeniSifreTekrar: z.string().min(1),
  })
  .refine((data) => data.yeniSifre === data.yeniSifreTekrar, {
    message: "Yeni şifreler birbiriyle eşleşmiyor.",
    path: ["yeniSifreTekrar"],
  });

export async function POST(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Giriş yapmalısınız." }, { status: 401 });

  const parsed = bodySchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Geçersiz bilgiler." },
      { status: 400 },
    );
  }

  const abuseIdentifier = `user:${user.id}`;
  const lockout = await getLockoutState(abuseIdentifier);
  if (lockout.locked && lockout.lockedUntil) {
    return NextResponse.json({ error: lockoutMessage(lockout.lockedUntil) }, { status: 429 });
  }

  const dogruMu = await verifyPassword(parsed.data.mevcutSifre, user.passwordHash);
  if (!dogruMu) {
    await recordFailure(abuseIdentifier);
    return NextResponse.json({ error: "Mevcut şifre yanlış." }, { status: 400 });
  }
  await clearFailures(abuseIdentifier);

  const passwordHash = await hashPassword(parsed.data.yeniSifre);
  // tokenVersion artirilir ve mevcut cerez silinir: sifre degisince bu
  // tarayicidaki ve baska her cihazdaki eski oturum aninda gecersiz olur,
  // kullanici yeni sifresiyle tekrar giris yapmak zorunda kalir.
  await prisma.user.update({
    where: { id: user.id },
    data: { passwordHash, tokenVersion: { increment: 1 } },
  });
  await destroySession();

  return NextResponse.json({ ok: true });
}

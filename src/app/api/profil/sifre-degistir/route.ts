import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getCurrentUser } from "@/lib/auth";
import { hashPassword, verifyPassword } from "@/lib/auth";
import { passwordSchema } from "@/lib/authValidation";
import { prisma } from "@/lib/prisma";

const bodySchema = z.object({
  mevcutSifre: z.string().min(1, "Mevcut şifreni gir."),
  yeniSifre: passwordSchema,
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

  const dogruMu = await verifyPassword(parsed.data.mevcutSifre, user.passwordHash);
  if (!dogruMu) {
    return NextResponse.json({ error: "Mevcut şifre yanlış." }, { status: 400 });
  }

  const passwordHash = await hashPassword(parsed.data.yeniSifre);
  await prisma.user.update({ where: { id: user.id }, data: { passwordHash } });

  return NextResponse.json({ ok: true });
}

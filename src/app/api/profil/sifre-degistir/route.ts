import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createSession, getCurrentUser, hashPassword, sifreyiTeyitEt } from "@/lib/auth";
import { passwordSchema } from "@/lib/authValidation";
import { guvenlikEpostasi } from "@/lib/email";
import { prisma } from "@/lib/prisma";

const bodySchema = z
  .object({
    // Yalniz Google ile acilmis (sifresiz) hesaplarda bos gelir: "sifre belirle".
    mevcutSifre: z.string().optional(),
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

  if (user.passwordHash && !parsed.data.mevcutSifre) {
    return NextResponse.json({ error: "Mevcut şifreni gir." }, { status: 400 });
  }
  const sifreHatasi = await sifreyiTeyitEt(user, parsed.data.mevcutSifre);
  if (sifreHatasi) {
    return NextResponse.json({ error: sifreHatasi === "Şifre yanlış." ? "Mevcut şifre yanlış." : sifreHatasi }, { status: 400 });
  }

  const passwordHash = await hashPassword(parsed.data.yeniSifre);
  // tokenVersion artar ve tum oturum kayitlari kapanir: diger cihazlardaki
  // oturumlar aninda gecersiz olur. Bu cihaz icin yeni oturum acilir.
  const [guncel] = await prisma.$transaction([
    prisma.user.update({ where: { id: user.id }, data: { passwordHash, tokenVersion: { increment: 1 } } }),
    prisma.oturum.updateMany({ where: { userId: user.id, kapatildi: null }, data: { kapatildi: new Date() } }),
  ]);
  await createSession(guncel.id, guncel.tokenVersion);

  await guvenlikEpostasi(user.email, user.adSoyad, user.passwordHash ? "şifren değiştirildi" : "hesabına şifre tanımlandı");
  return NextResponse.json({ ok: true });
}

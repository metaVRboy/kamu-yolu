import { randomBytes } from "crypto";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { sendEmail } from "@/lib/email";

const bodySchema = z.object({
  email: z.string().trim().toLowerCase().email(),
});

const TOKEN_GECERLILIK_SAAT = 1;

export async function POST(req: NextRequest) {
  const parsed = bodySchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Geçersiz e-posta." }, { status: 400 });
  }
  const { email } = parsed.data;

  // Hesap var mi yok mu bilgisini disari sizdirmamak icin, her durumda ayni
  // basarili mesaji donuyoruz; e-posta gonderimi yalnizca hesap varsa olur.
  const user = await prisma.user.findUnique({ where: { email } });

  if (user) {
    const token = randomBytes(32).toString("hex");
    const expiresAt = new Date(Date.now() + TOKEN_GECERLILIK_SAAT * 60 * 60 * 1000);

    await prisma.passwordResetToken.create({
      data: { token, userId: user.id, expiresAt },
    });

    const origin = req.headers.get("origin") ?? new URL(req.url).origin;
    const resetUrl = `${origin}/sifre-sifirla/${token}`;

    try {
      await sendEmail({
        to: user.email,
        subject: "Kamu Yolu — Şifre Sıfırlama",
        html: `
          <p>Merhaba ${user.adSoyad},</p>
          <p>Şifreni sıfırlamak için aşağıdaki bağlantıya tıkla. Bu bağlantı ${TOKEN_GECERLILIK_SAAT} saat geçerlidir.</p>
          <p><a href="${resetUrl}">${resetUrl}</a></p>
          <p>Bu isteği sen yapmadıysan bu e-postayı yok sayabilirsin.</p>
        `,
      });
    } catch (err) {
      console.error("Şifre sıfırlama e-postası gönderilemedi:", err);
    }
  }

  return NextResponse.json({
    ok: true,
    message: "Eğer bu e-posta ile bir hesap varsa, şifre sıfırlama bağlantısı gönderildi.",
  });
}

import { randomBytes } from "crypto";
import { after, NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { kacis, sendEmail } from "@/lib/email";
import { SITE_URL } from "@/lib/site";

const bodySchema = z.object({
  email: z.string().trim().toLowerCase().email(),
});

const TOKEN_GECERLILIK_SAAT = 1;
const YENIDEN_GONDERME_MS = 60_000;

export async function POST(req: NextRequest) {
  const parsed = bodySchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Geçersiz e-posta." }, { status: 400 });
  }
  const { email } = parsed.data;

  // Hesap var mi yok mu bilgisini disari sizdirmamak icin, her durumda ayni
  // basarili mesaji donuyoruz; e-posta gonderimi yalnizca hesap varsa olur.
  const user = await prisma.user.findUnique({ where: { email } });
  // Ayni hesaba dakikada en fazla bir baglanti (posta kutusu bombardimani, sinirsiz token satiri).
  const yakinda = user && (await prisma.passwordResetToken.count({ where: { userId: user.id, createdAt: { gt: new Date(Date.now() - YENIDEN_GONDERME_MS) } } }));

  if (user && !yakinda) {
    const token = randomBytes(32).toString("hex");
    const expiresAt = new Date(Date.now() + TOKEN_GECERLILIK_SAAT * 60 * 60 * 1000);

    await prisma.passwordResetToken.create({
      data: { token, userId: user.id, expiresAt },
    });

    // Alan adi istekten (Origin) alinmaz: saldirgan kendi alan adina giden bir sifirlama linki yollatabilirdi.
    const resetUrl = `${SITE_URL}/sifre-sifirla/${token}`;

    // Yanittan sonra gonderilir: yanit suresi hesabin var olup olmadigini ele vermesin.
    after(() =>
      sendEmail({
        to: user.email,
        subject: "Kamu Yolu — Şifre Sıfırlama",
        html: `
          <p>Merhaba ${kacis(user.adSoyad)},</p>
          <p>Şifreni sıfırlamak için aşağıdaki bağlantıya tıkla. Bu bağlantı ${TOKEN_GECERLILIK_SAAT} saat geçerlidir.</p>
          <p><a href="${resetUrl}">${resetUrl}</a></p>
          <p>Bu isteği sen yapmadıysan bu e-postayı yok sayabilirsin.</p>
        `,
      }).catch((err) => console.error("Şifre sıfırlama e-postası gönderilemedi:", err)),
    );
  }

  return NextResponse.json({
    ok: true,
    message: "Eğer bu e-posta ile bir hesap varsa, şifre sıfırlama bağlantısı gönderildi.",
  });
}

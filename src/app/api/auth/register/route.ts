import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { createSession, hashPassword, isSessionConfigured } from "@/lib/auth";
import { passwordSchema } from "@/lib/authValidation";

const bodySchema = z.object({
  adSoyad: z.string().trim().min(2).max(100),
  email: z.string().trim().toLowerCase().email(),
  password: passwordSchema,
  kvkkOnay: z.literal(true, { message: "KVKK aydınlatma metnini onaylamalısınız." }),
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
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Geçersiz bilgiler." },
      { status: 400 },
    );
  }
  const { adSoyad, email, password } = parsed.data;

  try {
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return NextResponse.json(
        { error: "Bu e-posta adresiyle zaten bir hesap var." },
        { status: 409 },
      );
    }

    const passwordHash = await hashPassword(password);
    const user = await prisma.user.create({
      data: { adSoyad, email, passwordHash, kvkkOnayTarihi: new Date() },
    });

    await createSession(user.id);

    return NextResponse.json({ id: user.id, adSoyad: user.adSoyad, email: user.email });
  } catch (err) {
    console.error("Kayıt hatası:", err);
    return NextResponse.json(
      { error: "Kayıt sırasında bir sorun oluştu. Lütfen tekrar deneyin." },
      { status: 500 },
    );
  }
}

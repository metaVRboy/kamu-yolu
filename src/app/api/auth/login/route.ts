import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { createSession, isSessionConfigured, verifyPassword } from "@/lib/auth";

const bodySchema = z.object({
  email: z.string().trim().toLowerCase().email(),
  password: z.string().min(1),
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
  const { email, password } = parsed.data;

  try {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user || !(await verifyPassword(password, user.passwordHash))) {
      return NextResponse.json(
        { error: "E-posta veya şifre hatalı." },
        { status: 401 },
      );
    }

    await createSession(user.id);

    return NextResponse.json({ id: user.id, adSoyad: user.adSoyad, email: user.email });
  } catch (err) {
    console.error("Giriş hatası:", err);
    return NextResponse.json(
      { error: "Giriş sırasında bir sorun oluştu. Lütfen tekrar deneyin." },
      { status: 500 },
    );
  }
}

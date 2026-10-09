import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { verifyTurnstileToken } from "@/lib/turnstile";
import { proAktifMi } from "@/lib/sms";
import { DESTEK_KONULARI } from "@/lib/destek";

const bodySchema = z.object({
  ad: z.string().trim().min(2, "Adını yaz.").max(100),
  email: z.string().trim().toLowerCase().email("Geçerli bir e-posta yaz."),
  konu: z.enum(DESTEK_KONULARI),
  mesaj: z.string().trim().min(10, "Mesajın en az 10 karakter olmalı.").max(4000),
  turnstileToken: z.string().nullable().optional(),
});

// Ayni kisiden (hesap ya da e-posta) 24 saatte en fazla bu kadar mesaj: kutu spamla dolmasin.
const GUNLUK_SINIR = 5;

export async function POST(req: NextRequest) {
  const parsed = bodySchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Geçersiz bilgiler." }, { status: 400 });
  const { ad, email, konu, mesaj, turnstileToken } = parsed.data;

  const user = await getCurrentUser();
  // Giris yapmamis ziyaretci bot olabilir; uyelerin hesabi zaten dogrulanmis.
  if (!user && !(await verifyTurnstileToken(turnstileToken))) {
    return NextResponse.json({ error: "İnsan doğrulaması başarısız. Lütfen tekrar deneyin." }, { status: 400 });
  }

  const sonGun = new Date(Date.now() - 86_400_000);
  const son24 = await prisma.destekMesaji.count({ where: { createdAt: { gte: sonGun }, OR: [{ email }, ...(user ? [{ userId: user.id }] : [])] } });
  if (son24 >= GUNLUK_SINIR) {
    return NextResponse.json({ error: "Bugün yeterince mesaj gönderdin; yanıtımızı bekle, gerekirse yarın tekrar yaz." }, { status: 429 });
  }

  await prisma.destekMesaji.create({
    data: { userId: user?.id ?? null, ad, email, konu, mesaj, plan: user && proAktifMi(user) ? user.abonelikPlani : "UCRETSIZ" },
  });
  return NextResponse.json({ ok: true });
}

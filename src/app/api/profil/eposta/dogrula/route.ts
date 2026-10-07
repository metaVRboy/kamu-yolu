import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getCurrentUser } from "@/lib/auth";
import { clearFailures, getLockoutState, lockoutMessage, recordFailure } from "@/lib/authAbuse";
import { guvenlikEpostasi } from "@/lib/email";
import { prisma } from "@/lib/prisma";

const bodySchema = z.object({ kod: z.string().trim().length(6, "Kod 6 haneli olmalı.") });

/** 2. adim: yeni adrese giden kod dogruysa e-posta guncellenir, eski adrese uyari gider. */
export async function POST(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Giriş yapmalısınız." }, { status: 401 });

  const parsed = bodySchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Geçersiz bilgiler." }, { status: 400 });
  }

  const kimlik = `email-change:${user.id}`;
  const kilit = await getLockoutState(kimlik);
  if (kilit.locked && kilit.lockedUntil) {
    return NextResponse.json({ error: lockoutMessage(kilit.lockedUntil) }, { status: 429 });
  }

  const bekleyen = await prisma.epostaDegisiklikKodu.findUnique({ where: { userId: user.id } });
  if (!bekleyen || bekleyen.expiresAt < new Date()) {
    return NextResponse.json({ error: "Kodun süresi dolmuş. Lütfen yeni bir kod iste." }, { status: 400 });
  }
  if (bekleyen.kod !== parsed.data.kod) {
    await recordFailure(kimlik);
    return NextResponse.json({ error: "Kod hatalı." }, { status: 400 });
  }
  await clearFailures(kimlik);

  try {
    await prisma.$transaction([
      prisma.user.update({ where: { id: user.id }, data: { email: bekleyen.yeniEmail } }),
      prisma.epostaDegisiklikKodu.delete({ where: { userId: user.id } }),
    ]);
  } catch {
    // Kod gonderildikten sonra ayni adresle baska biri kayit olmus olabilir (unique ihlali).
    return NextResponse.json({ error: "Bu e-posta adresiyle zaten bir hesap var." }, { status: 409 });
  }

  await guvenlikEpostasi(user.email, user.adSoyad, `e-posta adresin ${bekleyen.yeniEmail} olarak değiştirildi`);
  return NextResponse.json({ email: bekleyen.yeniEmail });
}

import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { createSession } from "@/lib/auth";
import { Prisma } from "@/generated/prisma/client";
import { DAVET_CEREZ, davetEdenId } from "@/lib/davet";
import { KAYIT_HEDIYE_GUN, proHediyeEt } from "@/lib/proHediye";
import { clearFailures, getLockoutState, gizliOzet, KOD_DENEME_HAKKI, lockoutMessage, recordFailure } from "@/lib/authAbuse";

const bodySchema = z.object({
  email: z.string().trim().toLowerCase().email(),
  code: z.string().trim().length(6),
});

export async function POST(req: NextRequest) {
  const parsed = bodySchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Geçersiz bilgiler." }, { status: 400 });
  }
  const { email, code } = parsed.data;

  const abuseIdentifier = `email-verify:${email}`;
  const lockout = await getLockoutState(abuseIdentifier);
  if (lockout.locked && lockout.lockedUntil) {
    return NextResponse.json({ error: lockoutMessage(lockout.lockedUntil) }, { status: 429 });
  }

  // Deneme hakki karsilastirmadan ONCE atomik dusulur: paralel yuzlerce tahmin de kod basina en fazla
  // KOD_DENEME_HAKKI kadar denenebilir. Bekleyen kod yokken hata sayilmaz (baskasinin kaydini kilitlemesin).
  const hak = await prisma.emailVerificationCode.updateMany({
    where: { email, usedAt: null, expiresAt: { gt: new Date() }, deneme: { lt: KOD_DENEME_HAKKI } },
    data: { deneme: { increment: 1 } },
  });
  const pending = hak.count ? await prisma.emailVerificationCode.findUnique({ where: { email } }) : null;
  if (!pending) {
    return NextResponse.json(
      { error: "Kodun süresi dolmuş ya da çok fazla hatalı deneme yapıldı. Lütfen yeni bir kod iste." },
      { status: 400 },
    );
  }
  if (pending.code !== gizliOzet("kayit-kodu", code)) {
    await recordFailure(abuseIdentifier);
    return NextResponse.json({ error: "Kod hatalı." }, { status: 400 });
  }
  await clearFailures(abuseIdentifier);

  try {
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return NextResponse.json(
        { error: "Bu e-posta adresiyle zaten bir hesap var." },
        { status: 409 },
      );
    }

    const davetEden = await davetEdenId(req.cookies.get(DAVET_CEREZ)?.value);
    const user = await prisma.$transaction(async (tx) => {
      const created = await tx.user.create({
        data: {
          adSoyad: pending.adSoyad,
          email: pending.email,
          passwordHash: pending.passwordHash,
          kvkkOnayTarihi: pending.kvkkOnayTarihi,
          ...(pending.ticariIletiOnay ? { ticariIletiOnay: true, ticariIletiOnayTarihi: pending.kvkkOnayTarihi } : {}),
          kaynak: pending.kaynak ?? Prisma.DbNull,
          davetEdenId: davetEden,
        },
      });
      await tx.emailVerificationCode.delete({ where: { email } });
      return created;
    });

    await proHediyeEt(user.id, "kayit", KAYIT_HEDIYE_GUN, `Hoş geldin: ${KAYIT_HEDIYE_GUN} gün Pro hediye`);
    await createSession(user.id, user.tokenVersion);

    return NextResponse.json({ id: user.id, adSoyad: user.adSoyad, email: user.email });
  } catch (err) {
    console.error("Kayıt doğrulama hatası:", err);
    return NextResponse.json(
      { error: "Hesap oluşturulurken bir sorun oluştu. Lütfen tekrar deneyin." },
      { status: 500 },
    );
  }
}

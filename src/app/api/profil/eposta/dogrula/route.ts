import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getCurrentUser } from "@/lib/auth";
import { clearFailures, getLockoutState, gizliOzet, KOD_DENEME_HAKKI, lockoutMessage, recordFailure } from "@/lib/authAbuse";
import { guvenlikEpostasi } from "@/lib/email";
import { prisma } from "@/lib/prisma";
import { adminDurumu } from "@/lib/admin";

const bodySchema = z.object({ kod: z.string().trim().length(6, "Kod 6 haneli olmalı.") });

/** 2. adim: yeni adrese giden kod dogruysa e-posta guncellenir, eski adrese uyari gider. */
export async function POST(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Giriş yapmalısınız." }, { status: 401 });
  // Admin e-postasi iki asamali dogrulama kodunun gittigi adres: kodu dogrulanmamis oturum degistiremez
  // (calinmis sifre/cerezle adresi degistirip kodu kendine aldirmak).
  if (user.isAdmin && !(await adminDurumu()).dogrulandi) {
    return NextResponse.json({ error: "Admin hesabının e-postasını değiştirmek için önce admin doğrulamasını yap." }, { status: 403 });
  }

  const parsed = bodySchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Geçersiz bilgiler." }, { status: 400 });
  }

  const kimlik = `email-change:${user.id}`;
  const kilit = await getLockoutState(kimlik);
  if (kilit.locked && kilit.lockedUntil) {
    return NextResponse.json({ error: lockoutMessage(kilit.lockedUntil) }, { status: 429 });
  }

  // Deneme hakki karsilastirmadan once atomik dusulur (paralel tahminler kod basina en fazla KOD_DENEME_HAKKI).
  const hak = await prisma.epostaDegisiklikKodu.updateMany({
    where: { userId: user.id, expiresAt: { gt: new Date() }, deneme: { lt: KOD_DENEME_HAKKI } },
    data: { deneme: { increment: 1 } },
  });
  const bekleyen = hak.count ? await prisma.epostaDegisiklikKodu.findUnique({ where: { userId: user.id } }) : null;
  if (!bekleyen) {
    return NextResponse.json({ error: "Kodun süresi dolmuş ya da çok fazla hatalı deneme yapıldı. Lütfen yeni bir kod iste." }, { status: 400 });
  }
  if (bekleyen.kod !== gizliOzet("eposta-kodu", parsed.data.kod)) {
    await recordFailure(kimlik);
    return NextResponse.json({ error: "Kod hatalı." }, { status: 400 });
  }
  await clearFailures(kimlik);

  try {
    await prisma.$transaction([
      prisma.user.update({ where: { id: user.id }, data: { email: bekleyen.yeniEmail } }),
      prisma.epostaDegisiklikKodu.delete({ where: { userId: user.id } }),
      // Eski adrese gitmis sifirlama baglantilari gecersiz olsun.
      prisma.passwordResetToken.deleteMany({ where: { userId: user.id } }),
    ]);
  } catch {
    // Kod gonderildikten sonra ayni adresle baska biri kayit olmus olabilir (unique ihlali).
    return NextResponse.json({ error: "Bu e-posta adresiyle zaten bir hesap var." }, { status: 409 });
  }

  await guvenlikEpostasi(user.email, user.adSoyad, `e-posta adresin ${bekleyen.yeniEmail} olarak değiştirildi`);
  return NextResponse.json({ email: bekleyen.yeniEmail });
}

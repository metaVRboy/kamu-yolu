import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getCurrentUser } from "@/lib/auth";
import { clearFailures, getLockoutState, gizliOzet, KOD_DENEME_HAKKI, lockoutMessage, recordFailure } from "@/lib/authAbuse";
import { prisma } from "@/lib/prisma";

const bodySchema = z.object({ kod: z.string().trim().length(6, "Kod 6 haneli olmalı.") });

/** Kod dogruysa numara profile yazilir ve dogrulanmis sayilir. */
export async function POST(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Giriş yapmalısınız." }, { status: 401 });

  const parsed = bodySchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Geçersiz bilgiler." }, { status: 400 });
  }

  const kimlik = `phone-verify:${user.id}`;
  const kilit = await getLockoutState(kimlik);
  if (kilit.locked && kilit.lockedUntil) {
    return NextResponse.json({ error: lockoutMessage(kilit.lockedUntil) }, { status: 429 });
  }

  // Deneme hakki karsilastirmadan once atomik dusulur (paralel tahminler kod basina en fazla KOD_DENEME_HAKKI).
  const hak = await prisma.telefonDogrulamaKodu.updateMany({
    where: { userId: user.id, expiresAt: { gt: new Date() }, deneme: { lt: KOD_DENEME_HAKKI } },
    data: { deneme: { increment: 1 } },
  });
  const bekleyen = hak.count ? await prisma.telefonDogrulamaKodu.findUnique({ where: { userId: user.id } }) : null;
  if (!bekleyen) {
    return NextResponse.json({ error: "Kodun süresi dolmuş ya da çok fazla hatalı deneme yapıldı. Lütfen yeni bir kod iste." }, { status: 400 });
  }
  if (bekleyen.kod !== gizliOzet("telefon-kodu", parsed.data.kod)) {
    await recordFailure(kimlik);
    return NextResponse.json({ error: "Kod hatalı." }, { status: 400 });
  }
  await clearFailures(kimlik);

  await prisma.$transaction([
    prisma.user.update({ where: { id: user.id }, data: { telefon: bekleyen.telefon, telefonDogrulandi: new Date() } }),
    prisma.telefonDogrulamaKodu.delete({ where: { userId: user.id } }),
  ]);
  return NextResponse.json({ telefon: bekleyen.telefon });
}

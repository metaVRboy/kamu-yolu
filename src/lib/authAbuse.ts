import { prisma } from "@/lib/prisma";

export { gizliOzet } from "@/lib/gizliOzet";

// Ilk birkac yanlis denemeye izin verilir (yazim hatasi vb.); esik asilinca
// kademeli bekleme suresi baslar.
const ALLOWED_FAILURES = 5;
const LOCKOUT_MINUTES = [1, 5, 30, 24 * 60];
const GUN_MS = 24 * 60 * 60 * 1000;

/** Bir dogrulama kodu en fazla bu kadar denenir; sonra olur, yeni kod istenir. */
export const KOD_DENEME_HAKKI = 5;

function lockoutMinutesFor(failCount: number): number {
  const idx = Math.min(failCount - ALLOWED_FAILURES - 1, LOCKOUT_MINUTES.length - 1);
  return LOCKOUT_MINUTES[Math.max(idx, 0)];
}

export type LockoutState = { locked: boolean; lockedUntil: Date | null };

export async function getLockoutState(identifier: string): Promise<LockoutState> {
  const record = await prisma.authAbuse.findUnique({ where: { identifier } });
  if (!record?.lockedUntil) return { locked: false, lockedUntil: null };
  const locked = record.lockedUntil > new Date();
  return { locked, lockedUntil: locked ? record.lockedUntil : null };
}

/**
 * Sayaci atomik artirir, yeni degeri doner. Oku-yaz degil: paralel istekler birbirinin sayimini
 * ezip kilidi atlatamasin. Son olaydan 24 saat gectiyse sayac sifirdan baslar.
 */
async function say(identifier: string): Promise<number> {
  await prisma.authAbuse.updateMany({ where: { identifier, lastFailAt: { lt: new Date(Date.now() - GUN_MS) } }, data: { failCount: 0 } });
  const { failCount } = await prisma.authAbuse.upsert({
    where: { identifier },
    update: { failCount: { increment: 1 }, lastFailAt: new Date() },
    create: { identifier, failCount: 1, lastFailAt: new Date() },
  });
  return failCount;
}

/** Basarisiz bir giris/sifre denemesinden sonra cagrilir. */
export async function recordFailure(identifier: string): Promise<LockoutState> {
  const failCount = await say(identifier);
  if (failCount <= ALLOWED_FAILURES) return { locked: false, lockedUntil: null };
  const lockedUntil = new Date(Date.now() + lockoutMinutesFor(failCount) * 60 * 1000);
  await prisma.authAbuse.update({ where: { identifier }, data: { lockedUntil } });
  return { locked: true, lockedUntil };
}

/** Basarili bir giris/sifre denemesinden sonra sayaci sifirlar. */
export async function clearFailures(identifier: string): Promise<void> {
  await prisma.authAbuse.deleteMany({ where: { identifier } });
}

/**
 * E-posta/WhatsApp gonderen uclar icin 24 saatlik tavan (posta kutusu bombardimani, Resend kotasi).
 * Hak varsa true; kullanim sayilir.
 */
export async function gunlukHakKullan(identifier: string, sinir: number): Promise<boolean> {
  return (await say(`gonderim:${identifier}`)) <= sinir;
}

export function lockoutMessage(lockedUntil: Date): string {
  const minutes = Math.max(1, Math.ceil((lockedUntil.getTime() - Date.now()) / 60000));
  return `Çok fazla başarısız deneme yapıldı. Lütfen ${minutes} dakika sonra tekrar deneyin.`;
}

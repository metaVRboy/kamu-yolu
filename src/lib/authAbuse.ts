import { prisma } from "@/lib/prisma";

// Ilk birkac yanlis denemeye izin verilir (yazim hatasi vb.); esik asilinca
// kademeli bekleme suresi baslar.
const ALLOWED_FAILURES = 5;
const LOCKOUT_MINUTES = [1, 5, 30, 24 * 60];

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

/** Basarisiz bir giris/sifre denemesinden sonra cagrilir. */
export async function recordFailure(identifier: string): Promise<LockoutState> {
  const existing = await prisma.authAbuse.findUnique({ where: { identifier } });
  const failCount = (existing?.failCount ?? 0) + 1;
  const lockedUntil =
    failCount > ALLOWED_FAILURES
      ? new Date(Date.now() + lockoutMinutesFor(failCount) * 60 * 1000)
      : null;

  await prisma.authAbuse.upsert({
    where: { identifier },
    update: { failCount, lockedUntil, lastFailAt: new Date() },
    create: { identifier, failCount, lockedUntil, lastFailAt: new Date() },
  });

  return { locked: !!lockedUntil, lockedUntil };
}

/** Basarili bir giris/sifre denemesinden sonra sayaci sifirlar. */
export async function clearFailures(identifier: string): Promise<void> {
  await prisma.authAbuse.deleteMany({ where: { identifier } });
}

export function lockoutMessage(lockedUntil: Date): string {
  const minutes = Math.max(1, Math.ceil((lockedUntil.getTime() - Date.now()) / 60000));
  return `Çok fazla başarısız deneme yapıldı. Lütfen ${minutes} dakika sonra tekrar deneyin.`;
}

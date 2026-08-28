import { randomUUID } from "crypto";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";

const VISITOR_COOKIE = "kamu_yolu_visitor";
const VISITOR_COOKIE_MAX_AGE = 60 * 60 * 24 * 365; // 1 yil

// Kademeli bekleme suresi (dakika): 1. ihlal, 2. ihlal, 3. ihlal, 4. ve
// sonrasi.
const LOCKOUT_MINUTES = [1, 5, 30, 24 * 60];

function lockoutMinutesFor(violationCount: number): number {
  const idx = Math.min(violationCount - 1, LOCKOUT_MINUTES.length - 1);
  return LOCKOUT_MINUTES[idx];
}

/** Ziyaretci kimligini cerezden okur, yoksa yeni bir tane olusturup yazar. */
export async function getOrCreateVisitorId(): Promise<string> {
  const cookieStore = await cookies();
  const existing = cookieStore.get(VISITOR_COOKIE)?.value;
  if (existing) return existing;

  const id = randomUUID();
  cookieStore.set(VISITOR_COOKIE, id, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: VISITOR_COOKIE_MAX_AGE,
  });
  return id;
}

export type LockoutState = { locked: boolean; lockedUntil: Date | null };

export async function getLockoutState(visitorId: string): Promise<LockoutState> {
  const record = await prisma.chatAbuse.findUnique({ where: { visitorId } });
  if (!record?.lockedUntil) return { locked: false, lockedUntil: null };
  const locked = record.lockedUntil > new Date();
  return { locked, lockedUntil: locked ? record.lockedUntil : null };
}

/** Konu disi bir mesaj tespit edildiginde cagrilir; ihlal sayisini artirip yeni bekleme suresini dondurur. */
export async function recordViolation(visitorId: string): Promise<LockoutState> {
  const existing = await prisma.chatAbuse.findUnique({ where: { visitorId } });
  const violationCount = (existing?.violationCount ?? 0) + 1;
  const lockedUntil = new Date(Date.now() + lockoutMinutesFor(violationCount) * 60 * 1000);

  await prisma.chatAbuse.upsert({
    where: { visitorId },
    update: { violationCount, lockedUntil, lastViolationAt: new Date() },
    create: { visitorId, violationCount, lockedUntil, lastViolationAt: new Date() },
  });

  return { locked: true, lockedUntil };
}

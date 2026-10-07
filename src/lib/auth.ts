import { cookies, headers } from "next/headers";
import { after } from "next/server";
import { SignJWT, jwtVerify } from "jose";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { clearFailures, getLockoutState, lockoutMessage, recordFailure } from "@/lib/authAbuse";

const SESSION_COOKIE = "kamu_yolu_session";
const SESSION_MAX_AGE_SECONDS = 60 * 60 * 24 * 30; // 30 gun
// "Son gorulme" her istekte yazilmasin; bu araliktan eskiyse guncellenir.
const SON_GORULME_ARALIGI_MS = 10 * 60 * 1000;

function getSecretKey() {
  const secret = process.env.SESSION_SECRET;
  if (!secret) throw new Error("SESSION_SECRET tanimli degil.");
  return new TextEncoder().encode(secret);
}

export function isSessionConfigured(): boolean {
  return !!process.env.SESSION_SECRET;
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10);
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

/** User-agent -> "Chrome · Windows". Ayarlar > Guvenlik'teki oturum listesi icin; kaba ama yeterli. */
export function cihazAdi(userAgent: string | null): string {
  const ua = userAgent ?? "";
  const tarayici = /Edg\//.test(ua)
    ? "Edge"
    : /OPR\/|Opera/.test(ua)
      ? "Opera"
      : /SamsungBrowser/.test(ua)
        ? "Samsung Internet"
        : /Firefox\//.test(ua)
          ? "Firefox"
          : /Chrome\/|CriOS/.test(ua)
            ? "Chrome"
            : /Safari\//.test(ua)
              ? "Safari"
              : "Bilinmeyen tarayıcı";
  const sistem = /Android/.test(ua)
    ? "Android"
    : /iPhone|iPad|iPod/.test(ua)
      ? "iOS"
      : /Windows/.test(ua)
        ? "Windows"
        : /Mac OS X|Macintosh/.test(ua)
          ? "macOS"
          : /Linux/.test(ua)
            ? "Linux"
            : "Bilinmeyen cihaz";
  return `${tarayici} · ${sistem}`;
}

export async function createSession(
  userId: string,
  tokenVersion: number,
  beniHatirla = true,
): Promise<void> {
  const oturum = await prisma.oturum.create({
    data: { userId, cihaz: cihazAdi((await headers()).get("user-agent")) },
  });
  const token = await new SignJWT({ userId, tokenVersion, oturumId: oturum.id })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${SESSION_MAX_AGE_SECONDS}s`)
    .sign(getSecretKey());

  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    // "Beni hatirla" isaretli degilse cerez icin maxAge verilmez - tarayici
    // kapatilinca cerez (dolayisiyla oturum) silinir. JWT'nin kendisi
    // yine de 30 gun gecerli kalir, bu sadece TARAYICIDA ne kadar
    // saklanacagini belirler.
    maxAge: beniHatirla ? SESSION_MAX_AGE_SECONDS : undefined,
  });
}

/** Cerezi siler ve bu cihazin oturum kaydini kapatir (cikis yap). */
export async function destroySession(): Promise<void> {
  const session = await getSessionPayload();
  if (session?.oturumId) {
    await prisma.oturum.updateMany({ where: { id: session.oturumId, kapatildi: null }, data: { kapatildi: new Date() } });
  }
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE);
}

type SessionPayload = { userId: string; tokenVersion: number; oturumId: string | null };

async function getSessionPayload(): Promise<SessionPayload | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;
  if (!token) return null;

  try {
    const { payload } = await jwtVerify(token, getSecretKey());
    if (typeof payload.userId !== "string" || typeof payload.tokenVersion !== "number") return null;
    // oturumId'siz cerezler bu ozellikten once acilmis oturumlardir; tokenVersion ile
    // gecerli kalir, "Diger tum cihazlardan cik" tokenVersion'i artirarak onlari da kapatir.
    const oturumId = typeof payload.oturumId === "string" ? payload.oturumId : null;
    return { userId: payload.userId, tokenVersion: payload.tokenVersion, oturumId };
  } catch {
    return null;
  }
}

/** Bu istegin oturum kaydinin id'si (oturum listesinde "Bu cihaz" isareti icin). */
export async function getAktifOturumId(): Promise<string | null> {
  return (await getSessionPayload())?.oturumId ?? null;
}

export async function getCurrentUser() {
  const session = await getSessionPayload();
  if (!session) return null;

  if (session.oturumId) {
    const oturum = await prisma.oturum.findUnique({ where: { id: session.oturumId }, include: { user: true } });
    // Oturum kapatilmis (cikis, uzaktan kapatma) ya da tokenVersion degismisse gecersiz.
    if (!oturum || oturum.kapatildi || oturum.userId !== session.userId || oturum.user.tokenVersion !== session.tokenVersion) {
      return null;
    }
    if (Date.now() - oturum.sonGorulme.getTime() > SON_GORULME_ARALIGI_MS) {
      after(() => prisma.oturum.update({ where: { id: oturum.id }, data: { sonGorulme: new Date() } }));
    }
    return planiGuncelle(oturum.user);
  }

  const user = await prisma.user.findUnique({ where: { id: session.userId } });
  // tokenVersion uyusmuyorsa (sifre degistirilmis, oturum baska bir yerden
  // dusurulmus) bu JWT artik gecersiz sayilir - suresi dolmamis olsa bile.
  if (!user || user.tokenVersion !== session.tokenVersion) return null;
  return planiGuncelle(user);
}

/** Admin panelden sureli verilen planin suresi dolduysa kullanici her yerde UCRETSIZ gorulur. */
function planiGuncelle<T extends { abonelikPlani: string; abonelikBitis: Date | null }>(user: T): T {
  return user.abonelikBitis && user.abonelikBitis.getTime() <= Date.now() ? { ...user, abonelikPlani: "UCRETSIZ" } : user;
}

export async function requireUser() {
  const user = await getCurrentUser();
  if (!user) throw new Error("UNAUTHORIZED");
  return user;
}

/**
 * Hassas islemlerden (e-posta degisikligi, hesap silme, sifre) once kimlik
 * yeniden dogrulanir. Sifresi olmayan (yalniz Google) hesaplarda sifre
 * istenmez - oturumun kendisi yeterli kabul edilir.
 */
export async function sifreyiTeyitEt(
  user: { id: string; passwordHash: string | null },
  sifre: string | undefined,
): Promise<string | null> {
  if (!user.passwordHash) return null;
  const kimlik = `user:${user.id}`;
  const kilit = await getLockoutState(kimlik);
  if (kilit.locked && kilit.lockedUntil) return lockoutMessage(kilit.lockedUntil);
  if (!sifre || !(await verifyPassword(sifre, user.passwordHash))) {
    await recordFailure(kimlik);
    return "Şifre yanlış.";
  }
  await clearFailures(kimlik);
  return null;
}

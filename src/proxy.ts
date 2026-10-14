import { NextResponse, type NextRequest } from "next/server";
import { hizSiniriAs } from "@/lib/hizSiniri";

// IP basina dakikalik istek sinirlari (/api). Bot taramasi, mesaj/kayit spami ve veritabani
// kotasini (Neon) tuketen asiri istekleri durdurur. Yazma 120: KPSS denemesinde her cevap bir
// POST, hizli isaretleyen ogrenci sinira takilip cevap kaybetmesin.
const SINIRLAR = { giris: 20, yazma: 120, okuma: 240 } as const;

/** Zamanlanmis gorevler (Vercel cron, yerel tarayici) gercek gizli anahtarla gelir; sinirdan muaf. */
function gorevMi(req: NextRequest): boolean {
  const gizliler = [process.env.CRON_SECRET, process.env.SCRAPE_SECRET].filter(Boolean);
  const auth = req.headers.get("authorization");
  const scrape = req.headers.get("x-scrape-secret");
  return gizliler.some((g) => auth === `Bearer ${g}` || scrape === g);
}

export function proxy(req: NextRequest) {
  // Bakim modunda tum sayfalar yalniz bakim mesajini gosterir; /giris acik kalir (admin girebilsin).
  if (req.nextUrl.pathname === "/giris") {
    const h = new Headers(req.headers);
    h.set("x-giris-sayfasi", "1");
    return NextResponse.next({ request: { headers: h } });
  }
  if (gorevMi(req)) return NextResponse.next();
  // Vercel istemcinin gercek IP'sini x-real-ip'e yazar (istemci bu basligi degistiremez).
  const ip = req.headers.get("x-real-ip") ?? req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "bilinmiyor";
  const okuma = req.method === "GET" || req.method === "HEAD";
  // /api/auth/me gibi okumalar siki giris kovasina girmesin; giris = giris/kayit/sifre POST'lari.
  const kova = okuma ? "okuma" : req.nextUrl.pathname.startsWith("/api/auth/") ? "giris" : "yazma";
  const { asti, kalanSn } = hizSiniriAs(`${kova}:${ip}`, SINIRLAR[kova]);
  if (!asti) return NextResponse.next();
  return NextResponse.json({ error: "Çok fazla istek gönderdin. Biraz bekleyip tekrar dene." }, { status: 429, headers: { "Retry-After": String(kalanSn) } });
}

export const config = { matcher: ["/api/:path*", "/giris"] };

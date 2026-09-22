import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import Image from "next/image";
import Link from "next/link";
import { UserRound } from "lucide-react";
import { getLastSuccessfulScrapeAt } from "@/lib/matching";
import { cn } from "@/lib/utils";
import { getCurrentUser } from "@/lib/auth";
import { SITE_URL } from "@/lib/site";
import { SiteMenu } from "@/components/SiteMenu";
import { HeaderNav } from "@/components/HeaderNav";
import { AdSlot } from "@/components/AdSlot";
import { NotificationBell } from "@/components/NotificationBell";
import { ProfileMenu } from "@/components/ProfileMenu";
import { PageTransition } from "@/components/PageTransition";
import { Toaster } from "@/components/ui/toast";
import { CerezBildirimi } from "@/components/CerezBildirimi";
import { ReklamEngelleyiciKontrol } from "@/components/ReklamEngelleyiciKontrol";
import "./globals.css";

// Site genelinde tek font: Inter. Baslik/govde ayrimi icin ayri bir serif
// kullanilmiyor - modern/duz gorunum icin her yerde ayni sans-serif.
const inter = Inter({ subsets: ["latin"], variable: "--font-sans" });

export const revalidate = 300;

// Mobil tarayicilarda (ozellikle iOS Safari) initial-scale belirtilmezse
// sayfa gecisleri arasinda yakinlastirma orani tutarsizlasip elemanlar
// oldugundan buyuk/kucuk gorunebiliyor - sabit bir olcek zorunlu kilinir.
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: "Kamu Yolu — Bölümüne Göre Kamu İlanları",
  description:
    "Mezun olduğun bölümü seç, o bölüme uygun ve bölüm şartı olmayan güncel kamu personeli/memur ilanlarını listele.",
};

export default async function RootLayout({ children }: LayoutProps<"/">) {
  const [lastScrapeAt, user] = await Promise.all([getLastSuccessfulScrapeAt(), getCurrentUser()]);

  return (
    <html lang="tr" className={cn("h-full antialiased", inter.variable, "font-sans")}>
      <body className="flex min-h-full flex-col bg-white text-foreground">
        <header className="sticky top-0 z-40 border-b border-border bg-white/90 backdrop-blur-xl">
          <div className="relative flex w-full items-center justify-between gap-4 px-4 py-3 sm:px-6">
            <div className="flex items-center gap-3">
              <SiteMenu />
              <Link href="/" className="shrink-0">
                <Image
                  src="/brand/kamu-yolu-logo.png"
                  alt="Kamu Yolu"
                  width={716}
                  height={537}
                  className="h-9 w-auto sm:h-10"
                  priority
                />
              </Link>
            </div>

            <div className="absolute left-1/2 top-1/2 hidden -translate-x-1/2 -translate-y-1/2 xl:block">
              <HeaderNav />
            </div>

            <div className="flex items-center gap-2">
              <NotificationBell isLoggedIn={!!user} />
              {user ? (
                <ProfileMenu adSoyad={user.adSoyad} abonelikPlani={user.abonelikPlani} />
              ) : (
                <Link
                  href="/giris"
                  className="flex h-9 items-center justify-center gap-1.5 rounded-lg border border-border bg-white px-2.5 text-sm font-medium text-slate-600 transition-colors hover:border-primary/30 hover:text-primary sm:px-4"
                >
                  <UserRound className="h-4 w-4 sm:hidden" />
                  <span className="hidden sm:inline">Giriş Yap</span>
                </Link>
              )}
            </div>
          </div>
        </header>

        <div className="mx-auto flex w-full max-w-[1600px] flex-1 items-start justify-center gap-4 px-2">
          <AdSlot side="left" />
          <main className="min-w-0 flex-1">
            <PageTransition>{children}</PageTransition>
          </main>
          <AdSlot side="right" />
        </div>

        <footer className="border-t border-border bg-slate-900 pt-12 pb-8 text-slate-300">
          <div className="mx-auto grid max-w-6xl gap-10 px-4 sm:grid-cols-[1.3fr_1fr_1fr] sm:px-6">
            <div>
              <p className="flex items-center gap-2 text-sm font-semibold text-white">
                <Image
                  src="/brand/kamu-yolu-emblem.png"
                  alt=""
                  width={16}
                  height={16}
                  className="h-4 w-4 brightness-0 invert"
                />
                Kamu Yolu
              </p>
              <p className="mt-3 max-w-sm text-sm text-slate-400">
                Mezun olduğun bölümü söyle, bakanlık, üniversite, hastane,
                belediye ve daha fazlasından bölümüne uygun ya da bölüm
                şartı olmayan güncel kamu ilanlarını bul.
              </p>
            </div>

            <div>
              <p className="text-xs font-semibold tracking-wide text-slate-200 uppercase">
                Sayfalar
              </p>
              <ul className="mt-3 space-y-2 text-sm text-slate-400">
                <li><Link href="/" className="hover:text-white">Ana Sayfa</Link></li>
                <li><Link href="/amacimiz" className="hover:text-white">Hakkımızda</Link></li>
                <li><Link href="/haberler" className="hover:text-white">Haberler</Link></li>
                <li><Link href="/kpss-puan-hesaplama" className="hover:text-white">KPSS Puan Hesaplama</Link></li>
                <li><Link href="/becayis" className="hover:text-white">Becayiş İlanları</Link></li>
                <li><Link href="/kvkk" className="hover:text-white">KVKK ve Kullanım Şartları</Link></li>
                <li><Link href="/cerez-politikasi" className="hover:text-white">Çerez Politikası</Link></li>
              </ul>
            </div>

            <div>
              <p className="text-xs font-semibold tracking-wide text-slate-200 uppercase">
                Öğrenim Düzeyine Göre
              </p>
              <ul className="mt-3 space-y-2 text-sm text-slate-400">
                <li><Link href="/seviye/lise" className="hover:text-white">Lise Mezunları</Link></li>
                <li><Link href="/seviye/onlisans" className="hover:text-white">Önlisans Mezunları</Link></li>
                <li><Link href="/seviye/lisans" className="hover:text-white">Lisans Mezunları</Link></li>
              </ul>
            </div>
          </div>

          <div className="mx-auto mt-10 max-w-6xl border-t border-white/10 px-4 pt-6 text-xs text-slate-500 sm:px-6">
            <p>
              Veriler otomatik ve periyodik olarak güncellenir. İlan
              detayları için lütfen kaynak kurumun ilan sayfasını esas alın.
            </p>
            <p className="mt-1">
              {lastScrapeAt
                ? `Veriler en son ${lastScrapeAt.toLocaleString("tr-TR", { dateStyle: "medium", timeStyle: "short" })} tarihinde güncellendi.`
                : "Veriler henüz otomatik güncelleme almadı."}
            </p>
          </div>
        </footer>
        <Toaster />
        <CerezBildirimi />
        <ReklamEngelleyiciKontrol />
      </body>
    </html>
  );
}

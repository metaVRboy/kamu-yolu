import type { Metadata } from "next";
import { Inter } from "next/font/google";
import Link from "next/link";
import { Landmark, UserRound } from "lucide-react";
import { getLastSuccessfulScrapeAt } from "@/lib/matching";
import { cn } from "@/lib/utils";
import { getCurrentUser } from "@/lib/auth";
import { SiteMenu } from "@/components/SiteMenu";
import { AdSlot } from "@/components/AdSlot";
import { NotificationBell } from "@/components/NotificationBell";
import { buttonVariants } from "@/components/ui/button";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" });

export const revalidate = 300;

export const metadata: Metadata = {
  title: "Kamu Yolu — Bölümüne Göre Kamu İlanları",
  description:
    "Mezun olduğun bölümü seç, o bölüme uygun ve bölüm şartı olmayan güncel kamu personeli/memur ilanlarını listele.",
};

export default async function RootLayout({ children }: LayoutProps<"/">) {
  const [lastScrapeAt, user] = await Promise.all([getLastSuccessfulScrapeAt(), getCurrentUser()]);

  return (
    <html lang="tr" className={cn("h-full antialiased", inter.variable, "font-sans")}>
      <body className="flex min-h-full flex-col bg-white text-foreground">
        <header className="sticky top-3 z-40 px-3 sm:top-4 sm:px-4">
          <div className="mx-auto flex max-w-6xl items-center justify-between rounded-2xl border border-primary/25 bg-primary/15 px-4 py-3 shadow-lg shadow-primary/10 backdrop-blur-xl sm:px-6">
            <div className="flex items-center gap-1.5">
              <SiteMenu />
              <Link href="/" className="flex items-center gap-2.5 pl-1">
                <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-sm">
                  <Landmark className="h-5 w-5" strokeWidth={2} />
                </span>
                <span className="text-lg font-semibold tracking-tight text-slate-900">
                  Kamu Yolu
                </span>
              </Link>
            </div>

            <div className="flex items-center gap-2">
              <NotificationBell isLoggedIn={!!user} />
              {user ? (
                <Link
                  href="/profilim"
                  className="flex items-center gap-1.5 rounded-xl px-2.5 py-1.5 text-sm font-medium text-slate-700 hover:bg-primary/10 hover:text-slate-900"
                >
                  <UserRound className="h-4 w-4" />
                  <span className="hidden sm:inline">{user.adSoyad.split(" ")[0]}</span>
                </Link>
              ) : (
                <Link href="/giris" className={buttonVariants({ size: "sm" })}>
                  Giriş Yap
                </Link>
              )}
            </div>
          </div>
        </header>

        <div className="mx-auto flex w-full max-w-[1600px] flex-1 items-start justify-center gap-4 px-2">
          <AdSlot side="left" />
          <main className="min-w-0 flex-1">{children}</main>
          <AdSlot side="right" />
        </div>

        <footer className="border-t border-border bg-slate-900 pt-12 pb-8 text-slate-300">
          <div className="mx-auto grid max-w-6xl gap-10 px-4 sm:grid-cols-[1.3fr_1fr_1fr] sm:px-6">
            <div>
              <p className="flex items-center gap-2 text-sm font-semibold text-white">
                <Landmark className="h-4 w-4" />
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
                <li><Link href="/bolum-ara" className="hover:text-white">Bölüme Göre Ara</Link></li>
                <li><Link href="/kpss-puan-hesaplama" className="hover:text-white">KPSS Puan Hesaplama</Link></li>
                <li><Link href="/becayis" className="hover:text-white">Becayiş İlanları</Link></li>
                <li><Link href="/kvkk" className="hover:text-white">KVKK ve Kullanım Şartları</Link></li>
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
      </body>
    </html>
  );
}

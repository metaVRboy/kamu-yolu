import type { Metadata } from "next";
import { Inter, Source_Serif_4 } from "next/font/google";
import Image from "next/image";
import Link from "next/link";
import { Repeat, Calculator, ListChecks } from "lucide-react";
import { getLastSuccessfulScrapeAt } from "@/lib/matching";
import { cn } from "@/lib/utils";
import { getCurrentUser } from "@/lib/auth";
import { SiteMenu } from "@/components/SiteMenu";
import { AdSlot } from "@/components/AdSlot";
import { NotificationBell } from "@/components/NotificationBell";
import { ProfileMenu } from "@/components/ProfileMenu";
import { buttonVariants } from "@/components/ui/button";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" });
const sourceSerif = Source_Serif_4({
  subsets: ["latin", "latin-ext"],
  variable: "--font-heading",
  weight: ["600", "700"],
});

export const revalidate = 300;

export const metadata: Metadata = {
  title: "Kamu Yolu — Bölümüne Göre Kamu İlanları",
  description:
    "Mezun olduğun bölümü seç, o bölüme uygun ve bölüm şartı olmayan güncel kamu personeli/memur ilanlarını listele.",
};

export default async function RootLayout({ children }: LayoutProps<"/">) {
  const [lastScrapeAt, user] = await Promise.all([getLastSuccessfulScrapeAt(), getCurrentUser()]);

  return (
    <html lang="tr" className={cn("h-full antialiased", inter.variable, sourceSerif.variable, "font-sans")}>
      <body className="flex min-h-full flex-col bg-white text-foreground">
        <header className="sticky top-3 z-40 px-3 sm:top-4 sm:px-4">
          <div className="relative mx-auto flex max-w-6xl items-center justify-between rounded-2xl border border-primary/25 bg-primary/15 px-4 py-3 shadow-lg shadow-primary/10 backdrop-blur-xl sm:px-6">
            <div className="flex items-center gap-1.5">
              <SiteMenu />
              <nav className="hidden items-center gap-1 xl:flex">
              <div className="group relative">
                <Link
                  href="/becayis"
                  className="flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-primary/10 hover:text-slate-900"
                >
                  <Repeat className="h-4 w-4" />
                  Becayiş İlanları
                </Link>
                <div className="absolute left-0 top-full z-50 w-48 pt-1 opacity-0 pointer-events-none transition-opacity group-hover:opacity-100 group-hover:pointer-events-auto">
                  <div className="overflow-hidden rounded-xl border border-primary/20 bg-white py-1.5 shadow-xl shadow-primary/10">
                    <Link
                      href="/becayis/talep-olustur"
                      className="block px-4 py-2 text-sm font-medium text-slate-700 hover:bg-primary/10 hover:text-slate-900"
                    >
                      Talep Oluştur
                    </Link>
                    <Link
                      href="/becayis/taleplerim"
                      className="block px-4 py-2 text-sm font-medium text-slate-700 hover:bg-primary/10 hover:text-slate-900"
                    >
                      Mevcut Taleplerim
                    </Link>
                  </div>
                </div>
              </div>

              <Link
                href="/kpss-puan-hesaplama"
                className="flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-primary/10 hover:text-slate-900"
              >
                <Calculator className="h-4 w-4" />
                KPSS Puan Hesaplama
              </Link>

              <div className="group relative">
                <Link
                  href="/ilanlar"
                  className="flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-primary/10 hover:text-slate-900"
                >
                  <ListChecks className="h-4 w-4" />
                  Aktif İlanlar
                </Link>
                <div className="absolute left-0 top-full z-50 w-56 pt-1 opacity-0 pointer-events-none transition-opacity group-hover:opacity-100 group-hover:pointer-events-auto">
                  <div className="overflow-hidden rounded-xl border border-primary/20 bg-white py-1.5 shadow-xl shadow-primary/10">
                    <Link
                      href="/seviye/lise"
                      className="block px-4 py-2 text-sm font-medium text-slate-700 hover:bg-primary/10 hover:text-slate-900"
                    >
                      Lise Mezunları İçin İlanlar
                    </Link>
                    <Link
                      href="/seviye/onlisans"
                      className="block px-4 py-2 text-sm font-medium text-slate-700 hover:bg-primary/10 hover:text-slate-900"
                    >
                      Önlisans Mezunları İçin İlanlar
                    </Link>
                    <Link
                      href="/seviye/lisans"
                      className="block px-4 py-2 text-sm font-medium text-slate-700 hover:bg-primary/10 hover:text-slate-900"
                    >
                      Lisans Mezunları İçin İlanlar
                    </Link>
                  </div>
                </div>
              </div>
              </nav>
            </div>

            <Link
              href="/"
              className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
            >
              <Image
                src="/brand/kamu-yolu-logo.png"
                alt="Kamu Yolu"
                width={716}
                height={537}
                className="h-11 w-auto sm:h-12"
                priority
              />
            </Link>

            <div className="flex items-center gap-2">
              <NotificationBell isLoggedIn={!!user} />
              {user ? (
                <ProfileMenu adSoyad={user.adSoyad} abonelikPlani={user.abonelikPlani} />
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
                <li><Link href="/amacimiz" className="hover:text-white">Amacımız</Link></li>
                <li><Link href="/haberler" className="hover:text-white">Haberler</Link></li>
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

import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import Image from "next/image";
import Link from "next/link";
import { getLastSuccessfulScrapeAt } from "@/lib/matching";
import { cn } from "@/lib/utils";
import { getCurrentUser } from "@/lib/auth";
import { profilFotografiUrl } from "@/lib/profil";
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
import { AuthModalProvider } from "@/components/AuthModal";
import { HeaderAuthButton } from "@/components/HeaderAuthButton";
import "./globals.css";

// Site genelinde tek font: Inter. Baslik/govde ayrimi icin ayri bir serif
// kullanilmiyor - modern/duz gorunum icin her yerde ayni sans-serif.
const inter = Inter({ subsets: ["latin"], variable: "--font-sans" });

const ADSENSE_CLIENT_ID = "ca-pub-2932226916873749";

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
  const fotografUrl = user ? await profilFotografiUrl(user.id) : null;

  return (
    <html lang="tr" className={cn("h-full antialiased", inter.variable, "font-sans")}>
      <body className="flex min-h-full flex-col text-foreground">
       <AuthModalProvider>
        {/* next/script (afterInteractive/beforeInteractive fark etmeksizin)
            src'yi ham HTML'de duz bir <script src=...> etiketi olarak degil,
            istemci tarafi bir yukleyici cagrisi icinde gomuyor - AdSense'in
            JS calistirmayan basit dogrulama/tarama araclari bunu Google'in
            istedigi kod olarak tanimayabiliyor. Bu yuzden burada bilerek
            duz/native bir <script> etiketi kullaniliyor (next/script degil). */}
        <script
          async
          src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${ADSENSE_CLIENT_ID}`}
          crossOrigin="anonymous"
        />
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
                <ProfileMenu adSoyad={user.adSoyad} abonelikPlani={user.abonelikPlani} fotografUrl={fotografUrl} isAdmin={user.isAdmin} />
              ) : (
                <HeaderAuthButton />
              )}
            </div>
          </div>
        </header>

        <div className="mx-auto flex w-full max-w-[1600px] flex-1 items-start justify-center gap-4 px-2">
          <AdSlot side="left" slotId="7192164037" />
          <main className="min-w-0 flex-1">
            <PageTransition>{children}</PageTransition>
          </main>
          <AdSlot side="right" slotId="3758342177" />
        </div>

        <footer className="relative overflow-hidden border-t border-primary/40 bg-slate-900 pt-14 pb-8 text-slate-300">
          <div aria-hidden className="pointer-events-none absolute inset-0">
            <div className="absolute -top-24 left-1/4 h-72 w-72 rounded-full bg-primary/20 blur-3xl" />
            <Image
              src="/brand/kamu-yolu-emblem.png"
              alt=""
              width={420}
              height={420}
              className="absolute -bottom-16 -right-16 h-[22rem] w-[22rem] opacity-[0.04] brightness-0 invert"
            />
          </div>

          <div className="relative mx-auto grid max-w-[1600px] gap-10 px-6 sm:px-10 lg:grid-cols-[1.4fr_1fr_1fr_1.1fr] lg:gap-16">
            <div>
              <p className="flex items-center gap-2.5 text-base font-semibold text-white">
                <Image
                  src="/brand/kamu-yolu-emblem.png"
                  alt=""
                  width={28}
                  height={28}
                  className="h-7 w-7 brightness-0 invert"
                />
                Kamu Yolu
              </p>
              <p className="mt-4 max-w-sm text-sm leading-relaxed text-slate-400">
                Mezun olduğun bölümü söyle, bakanlık, üniversite, hastane,
                belediye ve daha fazlasından bölümüne uygun ya da bölüm
                şartı olmayan güncel kamu ilanlarını bul.
              </p>
            </div>

            <div>
              <p className="text-xs font-semibold tracking-wide text-primary/70 uppercase">
                Sayfalar
              </p>
              <ul className="mt-4 space-y-2.5 text-sm text-slate-400">
                <li><Link href="/" className="transition-colors hover:text-white">Ana Sayfa</Link></li>
                <li><Link href="/amacimiz" className="transition-colors hover:text-white">Hakkımızda</Link></li>
                <li><Link href="/haberler" className="transition-colors hover:text-white">Haberler</Link></li>
                <li><Link href="/kpss-puan-hesaplama" className="transition-colors hover:text-white">KPSS Puan Hesaplama</Link></li>
                <li><Link href="/kpss-denemesi" className="transition-colors hover:text-white">KPSS Denemesi</Link></li>
                <li><Link href="/becayis" className="transition-colors hover:text-white">Becayiş İlanları</Link></li>
              </ul>
            </div>

            <div>
              <p className="text-xs font-semibold tracking-wide text-primary/70 uppercase">
                Öğrenim Düzeyine Göre
              </p>
              <ul className="mt-4 space-y-2.5 text-sm text-slate-400">
                <li><Link href="/seviye/lise" className="transition-colors hover:text-white">Lise Mezunları</Link></li>
                <li><Link href="/seviye/onlisans" className="transition-colors hover:text-white">Önlisans Mezunları</Link></li>
                <li><Link href="/seviye/lisans" className="transition-colors hover:text-white">Lisans Mezunları</Link></li>
              </ul>
              <p className="mt-6 text-xs font-semibold tracking-wide text-primary/70 uppercase">
                Yasal
              </p>
              <ul className="mt-4 space-y-2.5 text-sm text-slate-400">
                <li><Link href="/kvkk" className="transition-colors hover:text-white">KVKK &amp; Gizlilik</Link></li>
                <li><Link href="/kullanim-kosullari" className="transition-colors hover:text-white">Kullanım Koşulları</Link></li>
                <li><Link href="/cerez-politikasi" className="transition-colors hover:text-white">Çerez Politikası</Link></li>
                <li><Link href="/iade-politikasi" className="transition-colors hover:text-white">İade Politikası</Link></li>
                <li><Link href="/mesafeli-satis-sozlesmesi" className="transition-colors hover:text-white">Mesafeli Satış Sözleşmesi</Link></li>
                <li><Link href="/on-bilgilendirme-formu" className="transition-colors hover:text-white">Ön Bilgilendirme Formu</Link></li>
              </ul>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
              <p className="text-sm font-semibold text-white">Bölümünü aratmadın mı?</p>
              <p className="mt-1.5 text-sm text-slate-400">
                Sana uygun güncel kamu ilanlarını hemen bulalım.
              </p>
              <Link
                href="/"
                className="mt-4 inline-flex items-center gap-1.5 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
              >
                Bölüme Göre Ara
              </Link>
            </div>
          </div>

          <div className="relative mx-auto mt-10 max-w-[1600px] border-t border-white/10 px-6 pt-6 text-xs text-slate-500 sm:px-10">
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
       </AuthModalProvider>
      </body>
    </html>
  );
}

import { Suspense } from "react";
import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import { headers } from "next/headers";
import Image from "next/image";
import Link from "next/link";
import { getLastSuccessfulScrapeAt } from "@/lib/matching";
import { cn } from "@/lib/utils";
import { getCurrentUser } from "@/lib/auth";
import { gizliOzet } from "@/lib/gizliOzet";
import { profilFotografiUrl } from "@/lib/profil";
import { ILETISIM_ADRES, ILETISIM_EPOSTA, ILETISIM_TELEFON, SATICI, SATICI_BILGILERI_TAMAM, SITE_URL } from "@/lib/site";
import { SiteMenu } from "@/components/SiteMenu";
import { HeaderNav } from "@/components/HeaderNav";
import { NotificationBell } from "@/components/NotificationBell";
import { ProfileMenu } from "@/components/ProfileMenu";
import { PageTransition } from "@/components/PageTransition";
import { Toaster } from "@/components/ui/toast";
import { CerezOnayi } from "@/components/CerezOnayi";
import { YukseltmeTanitimi } from "@/components/YukseltmeTanitimi";
import { BekleyenTalepGonder, YukseltmeProvider } from "@/components/YukseltmePenceresi";
import { SATIS_ACIK } from "@/lib/planlar";
import { SayfaYuklemeCizgisi } from "@/components/SayfaYuklemeCizgisi";
import { AuthModalProvider } from "@/components/AuthModal";
import { SiteZemini } from "@/components/SiteZemini";
import { HeaderAuthButton } from "@/components/HeaderAuthButton";
import { GezinmeKaydi } from "@/components/GeriDonLinki";
import { DuyuruSeridi } from "@/components/DuyuruSeridi";
import { getSiteAyarlari } from "@/lib/siteAyarlari";
import { Wrench } from "lucide-react";
import "./globals.css";

// Site genelinde tek font: Inter. Baslik/govde ayrimi icin ayri bir serif
// kullanilmiyor - modern/duz gorunum icin her yerde ayni sans-serif.
const inter = Inter({ subsets: ["latin"], variable: "--font-sans" });

export const revalidate = 300;

// Mobil tarayicilarda (ozellikle iOS Safari) initial-scale belirtilmezse
// sayfa gecisleri arasinda yakinlastirma orani tutarsizlasip elemanlar
// oldugundan buyuk/kucuk gorunebiliyor - baslangic olcegi sabitlenir.
// maximumScale verilmez: parmakla yakinlastirmayi kapatmak erisilebilirlik ihlali.
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: "Kamu Yolu — Bölümüne Göre Kamu İlanları",
  description:
    "Mezun olduğun bölümü seç, o bölüme uygun ve bölüm şartı olmayan güncel kamu personeli/memur ilanlarını listele.",
  // Gorsel: app/opengraph-image.png (dosya kurali, tum sayfalara uygulanir).
  openGraph: { siteName: "Kamu Yolu", locale: "tr_TR", type: "website" },
  twitter: { card: "summary_large_image" },
};

export default async function RootLayout({ children }: LayoutProps<"/">) {
  // Footer'daki tarama saati yan bilgi: alinamazsa sayfa yine acilsin.
  const [lastScrapeAt, user, ayar] = await Promise.all([getLastSuccessfulScrapeAt().catch(() => null), getCurrentUser(), getSiteAyarlari()]);
  // Bakim modunda ziyaretciler her adreste yalniz bakim mesajini gorur (header, footer, reklam yok);
  // admin siteyi normal kullanir, /giris yalniz giris formuyla acik kalir. API'ler ve taramalar calisir.
  if (ayar.bakimModu && !user?.isAdmin) {
    // Isareti yalniz proxy koyar; deger gizli: istemci basligi kendisi gonderip bakimi atlatamaz.
    const girisSayfasi = (await headers()).get("x-giris-sayfasi") === gizliOzet("giris-sayfasi", "1");
    return (
      <html lang="tr" className={cn("h-full antialiased", inter.variable, "font-sans")}>
        <body className="flex min-h-full flex-col items-center justify-center px-4 py-10 text-foreground">
          {girisSayfasi ? (
            <AuthModalProvider>
              <YukseltmeProvider>
                <main className="w-full">{children}</main>
                <Toaster />
              </YukseltmeProvider>
            </AuthModalProvider>
          ) : (
            <main className="w-full max-w-lg rounded-3xl border border-primary/10 bg-white p-8 text-center shadow-sm">
              <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                <Wrench className="h-7 w-7" />
              </span>
              <h1 className="mt-4 text-2xl font-bold tracking-tight text-slate-900">Kısa bir bakımdayız</h1>
              <p className="mt-2 text-sm leading-relaxed text-slate-600">
                {ayar.bakimMesaji || "Kamu Yolu'nu daha iyi hale getirmek için kısa bir çalışma yapıyoruz. Lütfen biraz sonra tekrar dene."}
              </p>
            </main>
          )}
        </body>
      </html>
    );
  }
  const fotografUrl = user ? await profilFotografiUrl(user.id) : null;

  return (
    <html lang="tr" className={cn("h-full antialiased", inter.variable, "font-sans")}>
      <body className="flex min-h-full flex-col text-foreground">
       <AuthModalProvider linkleriYakala girisli={!!user}>
       <YukseltmeProvider>
        {ayar.seritMetni && <DuyuruSeridi metin={ayar.seritMetni} link={ayar.seritLink} tur={ayar.seritTur} />}
        {ayar.bakimModu && user?.isAdmin && (
          <p className="bg-amber-100 px-4 py-1.5 text-center text-xs font-semibold text-amber-900">
            Bakım modu açık: ziyaretçiler bakım sayfasını görüyor. <Link href="/admin/ayarlar" className="underline">Kapat</Link>
          </p>
        )}
        <header className="sticky top-0 z-40 border-b border-border bg-white/90 backdrop-blur-xl">
          <div className="relative flex w-full items-center justify-between gap-4 px-4 py-3 sm:px-6">
            <div className="flex items-center gap-3">
              <SiteMenu />
              <Link href="/" className="shrink-0">
                {/* Gosterim boyutu (en fazla ~53x40): 716px yazinca her sayfada 750-1080px'lik dosya iniyordu. */}
                <Image
                  src="/brand/kamu-yolu-logo.png"
                  alt="Kamu Yolu"
                  width={54}
                  height={40}
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
          {/* Gezinme baslayinca header'in alt kenarinda dolan ince cizgi (useSearchParams -> Suspense). */}
          <Suspense fallback={null}>
            <SayfaYuklemeCizgisi />
          </Suspense>
        </header>

        {/* Hareketli zemin (lekeler, altin yol, imlec isigi) tum sayfalarda icerigin arkasinda; overflow-x-clip: lekeler yatay kaydirma yaratmasin. */}
        <div data-yol-kok className="relative flex w-full flex-1 items-start justify-center overflow-x-clip">
          <SiteZemini />
          <main className="min-w-0 flex-1">
            <Suspense fallback={null}>
              <GezinmeKaydi />
            </Suspense>
            <PageTransition>{children}</PageTransition>
          </main>
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
                <li><Link href="/haberler" className="transition-colors hover:text-white">Duyurular</Link></li>
                <li><Link href="/kpss-puan-hesaplama" className="transition-colors hover:text-white">KPSS Puan Hesaplama</Link></li>
                <li><Link href="/kpss-denemesi" className="transition-colors hover:text-white">KPSS Denemesi</Link></li>
                <li><Link href="/becayis" className="transition-colors hover:text-white">Becayiş İlanları</Link></li>
                <li><Link href="/destek" className="transition-colors hover:text-white">İletişim ve Destek</Link></li>
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
                <li><Link href="/cerez-politikasi" className="transition-colors hover:text-white">Çerez Tercihleri</Link></li>
                {/* Satis sozlesmeleri satici bilgileri dolunca (sanal POS incelemesi) ya da satis acilinca yayina girer. */}
                {(SATIS_ACIK || SATICI_BILGILERI_TAMAM) && (
                  <>
                    <li><Link href="/iade-politikasi" className="transition-colors hover:text-white">İptal, İade ve Teslimat</Link></li>
                    <li><Link href="/mesafeli-satis-sozlesmesi" className="transition-colors hover:text-white">Mesafeli Satış Sözleşmesi</Link></li>
                    <li><Link href="/on-bilgilendirme-formu" className="transition-colors hover:text-white">Ön Bilgilendirme Formu</Link></li>
                  </>
                )}
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
            <p className="text-slate-400">
              Kamu Yolu bağımsız bir platformdur; hiçbir kamu kurumu, ÖSYM veya Kariyer Kapısı ile bağlantılı değildir.
              Başvurular yalnızca ilgili kurumun resmi kanallarından yapılır.
            </p>
            <p className="mt-1">
              Veriler otomatik ve periyodik olarak güncellenir. İlan
              detayları için lütfen kaynak kurumun ilan sayfasını esas alın.
            </p>
            {/* Kunye (5651 s. Kanun m.3, KVKK veri sorumlusu): sahis isletmesinde isletme sahibi. */}
            <p className="mt-1">
              Site sahibi ve veri sorumlusu: {SATICI.unvan} (şahıs işletmesi) · {ILETISIM_ADRES} · Tel:{" "}
              <a href={`tel:${ILETISIM_TELEFON.tel}`} className="underline hover:text-white">
                {ILETISIM_TELEFON.goster}
              </a>{" "}
              · E-posta:{" "}
              <a href={`mailto:${ILETISIM_EPOSTA}`} className="underline hover:text-white">
                {ILETISIM_EPOSTA}
              </a>
            </p>
            {/* E-ticaret kunyesi (6563 s. Kanun m.3): satici bilgileri dolunca gorunur. */}
            {SATICI_BILGILERI_TAMAM && (
              <p className="mt-1">
                Satıcı: {SATICI.unvan} · {SATICI.vergiDairesi} V.D. {SATICI.vergiNo}
                {SATICI.mersisNo && <> · MERSİS: {SATICI.mersisNo}</>}
                {SATICI.odaKaydi && <> · {SATICI.odaKaydi}</>}
              </p>
            )}
            {/* 5651 Yonetmeligi m.5/2: yer saglayicinin unvan ve adresi. */}
            <p className="mt-1">
              Yer sağlayıcı: Vercel Inc., 440 N Barranca Avenue #4133, Covina, CA 91723, ABD · Veritabanı: Neon, LLC (Databricks, Inc.),
              160 Spear Street, Suite 1300, San Francisco, CA 94105, ABD
            </p>
            <p className="mt-1">
              {lastScrapeAt
                ? `Veriler en son ${lastScrapeAt.toLocaleString("tr-TR", { dateStyle: "medium", timeStyle: "short", timeZone: "Europe/Istanbul" })} tarihinde güncellendi.`
                : "Veriler henüz otomatik güncelleme almadı."}
            </p>
          </div>
        </footer>
        <Toaster />
        <CerezOnayi />
        {user && <BekleyenTalepGonder />}
        {/* Periyodik Pro/Pro+ tanitimi: Pro+ uyeye hic konmaz. */}
        {user?.abonelikPlani !== "PRO_PLUS" && <YukseltmeTanitimi />}
       </YukseltmeProvider>
       </AuthModalProvider>
      </body>
    </html>
  );
}

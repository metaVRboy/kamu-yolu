import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { getLastSuccessfulScrapeAt } from "@/lib/matching";
import "./globals.css";

export const revalidate = 300;

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Kamu Yolu — Bölümüne Göre Kamu İlanları",
  description:
    "Mezun olduğun bölümü seç, o bölüme uygun ve bölüm şartı olmayan güncel kamu personeli/memur ilanlarını listele.",
};

export default async function RootLayout({ children }: LayoutProps<"/">) {
  const lastScrapeAt = await getLastSuccessfulScrapeAt();

  return (
    <html
      lang="tr"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-neutral-50 text-neutral-900">
        <header className="border-b border-neutral-200 bg-white">
          <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-4">
            <a href="/" className="text-lg font-semibold tracking-tight">
              Kamu Yolu
            </a>
            <nav className="text-sm text-neutral-600">
              <a href="/" className="hover:text-neutral-900">
                Bölüme Göre Ara
              </a>
            </nav>
          </div>
        </header>
        <main className="flex-1">{children}</main>
        <footer className="border-t border-neutral-200 bg-white py-6 text-center text-xs text-neutral-500">
          <p>
            Kamu Yolu — veriler otomatik ve periyodik olarak güncellenir. İlan
            detayları için lütfen kaynak kurumun ilan sayfasını esas alın.
          </p>
          <p className="mt-1">
            {lastScrapeAt
              ? `Veriler en son ${lastScrapeAt.toLocaleString("tr-TR", { dateStyle: "medium", timeStyle: "short" })} tarihinde güncellendi.`
              : "Veriler henüz otomatik güncelleme almadı."}
          </p>
        </footer>
      </body>
    </html>
  );
}

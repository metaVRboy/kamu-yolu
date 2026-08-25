import type { Metadata } from "next";
import { Inter } from "next/font/google";
import Link from "next/link";
import { Landmark } from "lucide-react";
import { getLastSuccessfulScrapeAt } from "@/lib/matching";
import { cn } from "@/lib/utils";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" });

export const revalidate = 300;

export const metadata: Metadata = {
  title: "Kamu Yolu — Bölümüne Göre Kamu İlanları",
  description:
    "Mezun olduğun bölümü seç, o bölüme uygun ve bölüm şartı olmayan güncel kamu personeli/memur ilanlarını listele.",
};

export default async function RootLayout({ children }: LayoutProps<"/">) {
  const lastScrapeAt = await getLastSuccessfulScrapeAt();

  return (
    <html lang="tr" className={cn("h-full antialiased", inter.variable, "font-sans")}>
      <body className="flex min-h-full flex-col bg-blue-50 text-foreground">
        <header className="sticky top-3 z-40 px-3 sm:top-4 sm:px-4">
          <div className="mx-auto flex max-w-6xl items-center justify-between rounded-2xl border border-primary/25 bg-primary/15 px-4 py-3 shadow-lg shadow-primary/10 backdrop-blur-xl sm:px-6">
            <Link href="/" className="flex items-center gap-2.5">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-sm">
                <Landmark className="h-5 w-5" strokeWidth={2} />
              </span>
              <span className="text-lg font-semibold tracking-tight text-slate-900">
                Kamu Yolu
              </span>
            </Link>
            <nav className="flex items-center gap-6 text-sm font-medium text-slate-700">
              <Link href="/" className="transition-colors hover:text-slate-900">
                Bölüme Göre Ara
              </Link>
            </nav>
          </div>
        </header>

        <main className="flex-1 bg-gradient-to-b from-blue-100 via-blue-50 to-white">
          {children}
        </main>

        <footer className="border-t border-border bg-slate-900 py-8 text-slate-300">
          <div className="mx-auto max-w-6xl px-4 text-center text-xs sm:px-6">
            <p className="flex items-center justify-center gap-2 text-sm font-medium text-white">
              <Landmark className="h-4 w-4" />
              Kamu Yolu
            </p>
            <p className="mt-3">
              Veriler otomatik ve periyodik olarak güncellenir. İlan
              detayları için lütfen kaynak kurumun ilan sayfasını esas alın.
            </p>
            <p className="mt-1 text-slate-400">
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

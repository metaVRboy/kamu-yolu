import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, ArrowUpRight, CalendarDays } from "lucide-react";
import { getHaberBySlug, getLatestHaberler } from "@/lib/haberler";
import { HaberGorsel } from "@/components/HaberGorsel";
import { HaberlerSection, isYeni } from "@/components/HaberlerSection";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export const revalidate = 300;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const haber = await getHaberBySlug(slug);
  if (!haber) return { title: "Haber Bulunamadı — Kamu Yolu" };

  return {
    title: `${haber.baslik} — Kamu Yolu`,
    description: haber.ozet,
    openGraph: {
      title: haber.baslik,
      description: haber.ozet,
      images: haber.gorselUrl ? [haber.gorselUrl] : undefined,
      type: "article",
      publishedTime: haber.yayinTarihi.toISOString(),
    },
  };
}

export default async function HaberDetayPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const haber = await getHaberBySlug(slug);
  if (!haber) notFound();

  const digerHaberler = (await getLatestHaberler(5))
    .filter((h) => h.id !== haber.id)
    .slice(0, 4);

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
      <Link
        href="/haberler"
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        Tüm haberler
      </Link>

      <div className="relative mt-4">
        <HaberGorsel
          src={haber.gorselUrl}
          alt={haber.baslik}
          logoMu={haber.gorselLogoMu}
          className="aspect-[16/9] w-full rounded-2xl"
        />
        {isYeni(haber.yayinTarihi.toISOString()) && (
          <Badge className="absolute right-3 top-3 border-transparent bg-red-600 text-white shadow">
            YENİ
          </Badge>
        )}
      </div>

      <h1 className="mt-6 font-sans text-2xl font-bold leading-tight tracking-tight text-slate-900 sm:text-3xl">
        {haber.baslik}
      </h1>

      <div className="mt-3 flex flex-wrap items-center gap-2">
        <span className="flex items-center gap-1.5 text-sm text-muted-foreground">
          <CalendarDays className="h-4 w-4" />
          {haber.yayinTarihi.toLocaleDateString("tr-TR", {
            day: "2-digit",
            month: "long",
            year: "numeric",
          })}
        </span>
        {haber.departments.map(({ department }) => (
          <Link key={department.id} href={`/bolum/${department.slug}`}>
            <Badge className="border-primary/15 bg-primary/10 font-normal text-primary hover:bg-primary/20">
              {department.name}
            </Badge>
          </Link>
        ))}
      </div>

      <p className="mt-6 text-base leading-relaxed text-slate-700">{haber.ozet}</p>

      {haber.kaynakUrl && (
        <a
          href={haber.kaynakUrl}
          target="_blank"
          rel="noopener noreferrer"
          className={cn(buttonVariants({ variant: "outline" }), "mt-6 border-primary/25")}
        >
          Haberin Kaynağını Gör
          <ArrowUpRight className="h-4 w-4" />
        </a>
      )}

      {digerHaberler.length > 0 && (
        <div className="mt-16">
          <HaberlerSection
            haberler={digerHaberler.map((h) => ({ ...h, yayinTarihi: h.yayinTarihi.toISOString() }))}
            baslik="Diğer Güncel Haberler"
            aciklama="Kamu personel alımları ve gündemdeki diğer gelişmeler."
          />
        </div>
      )}
    </div>
  );
}

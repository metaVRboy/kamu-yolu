import { getLatestPostings, getHomepageStats, getDepartmentPostingCounts } from "@/lib/matching";
import { getLatestHaberler } from "@/lib/haberler";
import { prisma } from "@/lib/prisma";
import { PostingCard } from "@/components/PostingCard";
import { DepartmentSearch } from "@/components/DepartmentSearch";
import { HaberlerSection } from "@/components/HaberlerSection";
import { ClosingCtaSection } from "@/components/HomeMarketingSections";

// Ilan verileri periyodik olarak degistigi icin sayfa build-time'da
// dondurulmamali; her birkac dakikada bir yeniden olusturulur.
export const revalidate = 300;

export default async function Home() {
  const [latestPostings, haberler, departmentRows, stats, postingCounts] = await Promise.all([
    getLatestPostings(6),
    getLatestHaberler(5),
    prisma.department.findMany({ select: { id: true, slug: true, name: true, level: true }, orderBy: { name: "asc" } }),
    getHomepageStats(),
    getDepartmentPostingCounts(),
  ]);

  const departments = departmentRows.map((d) => ({
    slug: d.slug,
    name: d.name,
    level: d.level,
    ilanSayisi: postingCounts.get(d.id) ?? 0,
  }));

  return (
    <div className="relative mx-auto max-w-6xl px-4 py-14 sm:px-6 sm:py-20">
      <div aria-hidden className="pointer-events-none absolute inset-x-0 -top-16 z-0 flex justify-center">
        <div className="h-72 w-[36rem] animate-wave-glow rounded-full bg-primary/25 blur-3xl" />
      </div>

      <section className="relative z-20 mx-auto max-w-3xl overflow-hidden rounded-3xl border border-primary/10 bg-primary/[0.04] p-8 text-center shadow-sm backdrop-blur-xl sm:p-12">
        <div aria-hidden className="pointer-events-none absolute inset-0">
          <div className="absolute -top-20 left-1/2 h-64 w-64 -translate-x-1/2 rounded-full bg-primary/10 blur-3xl" />
        </div>

        <h1 className="relative font-sans text-4xl font-semibold tracking-tight text-slate-900 sm:text-5xl">
          Mezun olduğun bölüme uygun{" "}
          <span className="italic text-primary">kamu ilanlarını</span> bul.
        </h1>
        <p className="mx-auto mt-3 max-w-2xl text-balance text-slate-600">
          Bölümünü seç, sana uygun güncel kamu ilanlarını hemen listeleyelim.
        </p>
        <div className="mt-6 flex justify-center">
          <DepartmentSearch departments={departments} />
        </div>

        <div className="mx-auto mt-10 grid max-w-lg grid-cols-3 divide-x divide-border border-t border-border pt-6">
          {[
            { label: "Aktif İlan", value: stats.postingCount },
            { label: "Kurum", value: stats.institutionCount },
            { label: "Bölüm", value: stats.departmentCount },
          ].map((stat) => (
            <div key={stat.label}>
              <p className="text-2xl font-bold text-primary sm:text-3xl">
                {stat.value.toLocaleString("tr-TR")}
              </p>
              <p className="mt-0.5 text-xs font-medium text-muted-foreground">{stat.label}</p>
            </div>
          ))}
        </div>
      </section>

      <div className="mt-16">
        <HaberlerSection
          haberler={haberler.map((h) => ({ ...h, yayinTarihi: h.yayinTarihi.toISOString() }))}
        />
      </div>

      <section className="mt-16">
        <div className="flex items-baseline justify-between">
          <div>
            <h2 className="font-sans text-xl font-semibold text-primary">
              Yeni Eklenen İlanlar
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Sisteme en son eklenen kamu ilanları.
            </p>
          </div>
        </div>
        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          {latestPostings.length === 0 && (
            <p className="text-sm text-muted-foreground">
              Henüz ilan bulunmuyor.
            </p>
          )}
          {latestPostings.map((posting) => (
            <PostingCard key={posting.id} posting={posting} />
          ))}
        </div>
      </section>

      <div className="mt-16">
        <ClosingCtaSection />
      </div>
    </div>
  );
}

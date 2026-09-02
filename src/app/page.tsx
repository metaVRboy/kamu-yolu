import { getLatestPostings, getHomepageStats } from "@/lib/matching";
import { getLatestHaberler } from "@/lib/haberler";
import { prisma } from "@/lib/prisma";
import { PostingCard } from "@/components/PostingCard";
import { DepartmentSearch } from "@/components/DepartmentSearch";
import { HaberlerSection } from "@/components/HaberlerSection";
import { ClosingCtaSection } from "@/components/HomeMarketingSections";
import { Badge } from "@/components/ui/badge";

// Ilan verileri periyodik olarak degistigi icin sayfa build-time'da
// dondurulmamali; her birkac dakikada bir yeniden olusturulur.
export const revalidate = 300;

export default async function Home() {
  const [latestPostings, haberler, departments, stats] = await Promise.all([
    getLatestPostings(6),
    getLatestHaberler(5),
    prisma.department.findMany({ select: { slug: true, name: true, level: true }, orderBy: { name: "asc" } }),
    getHomepageStats(),
  ]);

  return (
    <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6 sm:py-20">
      <section className="relative z-20 mx-auto max-w-3xl text-center">
        <Badge className="border-transparent bg-primary text-primary-foreground">
          Kamu personeli & memur ilanları
        </Badge>

        <h1 className="mt-5 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
          Mezun olduğun bölüme uygun kamu ilanlarını bul
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
            <h2 className="text-xl font-semibold text-foreground">
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

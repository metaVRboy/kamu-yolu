import { getLatestPostings, getHomepageStats, getDepartmentPostingCounts } from "@/lib/matching";
import { getYayindakiHaberler } from "@/lib/haberler";
import { BolumBasligi } from "@/components/BolumBasligi";
import { prisma } from "@/lib/prisma";
import { IlanVitrinKarti } from "@/components/IlanVitrinKarti";
import { kurumaGoreGrupla, kurumLogolari } from "@/lib/ilanVitrin";
import { DepartmentSearch } from "@/components/DepartmentSearch";
import { HaberlerSection } from "@/components/HaberlerSection";
import { HeroHaberCarousel } from "@/components/HeroHaberCarousel";
import { ClosingCtaSection } from "@/components/HomeMarketingSections";

// Ilan verileri periyodik olarak degistigi icin sayfa build-time'da
// dondurulmamali; her birkac dakikada bir yeniden olusturulur.
export const revalidate = 300;

export default async function Home() {
  const [latestPostings, haberler, departmentRows, stats, postingCounts] = await Promise.all([
    // Ayni kurumun toplu ilanlari tek kartta birlesecegi icin genis bir pencere cekilir.
    getLatestPostings(120),
    getYayindakiHaberler(),
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

  const ilanGruplari = kurumaGoreGrupla(latestPostings, 6);
  const ilanLogolari = await kurumLogolari(ilanGruplari.map((g) => g.ilk));

  const haberlerMapped = haberler.slice(0, 5).map((h) => ({ ...h, yayinTarihi: h.yayinTarihi.toISOString() }));

  return (
    <div className="relative mx-auto max-w-6xl px-4 py-14 sm:px-6 sm:py-20">
      <section className="relative z-20 grid gap-6 lg:grid-cols-[minmax(0,400px)_1fr] lg:items-stretch">
        {/* Isik yansimasi (box-shadow) bu disaridaki elemanda animasyonlu -
            asagidaki icerik/input ile ayni boyama baglamini paylasmiyor,
            aksi halde Safari'de input'un imleci yanlis konumda cizilebiliyor. */}
        <div className="animate-frame-glow relative rounded-3xl">
          <div className="relative flex h-full flex-col justify-center overflow-hidden rounded-3xl border border-primary/10 bg-white p-8 text-center shadow-sm backdrop-blur-xl sm:p-10">
            <div aria-hidden className="pointer-events-none absolute inset-0">
              <div className="absolute -top-20 left-1/2 h-64 w-64 -translate-x-1/2 rounded-full bg-primary/10 blur-3xl" />
            </div>

            <h1 className="relative font-sans text-2xl font-semibold tracking-tight text-slate-900 sm:text-3xl">
              Mezun olduğun bölüme uygun{" "}
              <span className="italic text-primary">kamu ilanlarını</span> bul.
            </h1>
            <p className="mx-auto mt-3 max-w-sm text-balance text-sm text-slate-600">
              Bölümünü seç, sana uygun güncel kamu ilanlarını hemen listeleyelim.
            </p>
            <div className="mt-6 flex justify-center">
              <DepartmentSearch departments={departments} />
            </div>

            <div className="mx-auto mt-8 grid w-full max-w-sm grid-cols-3 divide-x divide-border border-t border-border pt-5">
              {[
                { label: "Aktif İlan", value: stats.postingCount },
                { label: "Kurum", value: stats.institutionCount },
                { label: "Bölüm", value: stats.departmentCount },
              ].map((stat) => (
                <div key={stat.label}>
                  <p className="text-xl font-bold text-primary sm:text-2xl">
                    {stat.value.toLocaleString("tr-TR")}
                  </p>
                  <p className="mt-0.5 text-xs font-medium text-muted-foreground">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="min-h-[360px]">
          <HeroHaberCarousel haberler={haberlerMapped} />
        </div>
      </section>

      <div className="mt-16">
        <HaberlerSection haberler={haberlerMapped} etiket="Güncel" toplamSayi={haberler.length} />
      </div>

      <section className="mt-16">
        <BolumBasligi
          etiket="Yeni eklenenler"
          baslik="Yeni Eklenen İlanlar"
          aciklama="Sisteme en son eklenen kamu ilanları; aynı kurumun toplu ilanları tek kartta."
          tumuHref="/ilanlar"
          tumuEtiket="Tüm ilanlar"
          sayac={stats.postingCount}
        />
        <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {ilanGruplari.length === 0 && <p className="text-sm text-muted-foreground">Henüz ilan bulunmuyor.</p>}
          {ilanGruplari.map((grup) => (
            <IlanVitrinKarti key={grup.ilk.id} grup={grup} logoUrl={ilanLogolari.get(grup.ilk.institutionName) ?? null} />
          ))}
        </div>
      </section>

      <div className="mt-16">
        <ClosingCtaSection />
      </div>
    </div>
  );
}

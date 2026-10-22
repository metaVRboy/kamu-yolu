import { getLatestPostings, getHomepageStats, getDepartmentPostingCounts } from "@/lib/matching";
import { getYayindakiHaberler } from "@/lib/haberler";
import { BolumBasligi } from "@/components/BolumBasligi";
import { prisma } from "@/lib/prisma";
import { IlanVitrinKarti } from "@/components/IlanVitrinKarti";
import { kurumaGoreGrupla, kurumLogolari } from "@/lib/ilanVitrin";
import { DepartmentSearch } from "@/components/DepartmentSearch";
import { HaberlerSection } from "@/components/HaberlerSection";
import { HeroHaberCarousel } from "@/components/HeroHaberCarousel";
import { BizeUlasin } from "@/components/BizeUlasin";
import { DavetBandi, GunlukSerit, UyeProfilKarti } from "@/components/AnaSayfaUye";
import { SayacArtis } from "@/components/SayacArtis";
import Link from "next/link";
import { ArrowRight, Briefcase, Building2, GraduationCap } from "lucide-react";

// Ilan verileri periyodik olarak degistigi icin sayfa build-time'da
// dondurulmamali; her birkac dakikada bir yeniden olusturulur.
export const revalidate = 300;

// utm'li reklam linkleri tek adreste toplansin.
export const metadata = { alternates: { canonical: "/" } };

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

  // Bolum basina gercek aktif ilan sayisina gore (arama verisi tutulmuyor: "sik aranan" denmez).
  const populer = departments.filter((d) => d.ilanSayisi > 0).sort((a, b) => b.ilanSayisi - a.ilanSayisi);
  const enCok = populer[0]?.ilanSayisi ?? 1;

  const ilanGruplari = kurumaGoreGrupla(latestPostings, 6);
  const ilanLogolari = await kurumLogolari(ilanGruplari.map((g) => g.ilk));

  const haberlerMapped = haberler.slice(0, 5).map((h) => ({ ...h, yayinTarihi: h.yayinTarihi.toISOString() }));

  return (
    // Duzen H (2026-10-20): misafir = buyuk bolum aramasi + gunluk serit + ilanlar + duyurular; uye ayrica arama
    // yaninda profil karti ve davet bandi gorur (istemciden yuklenir, sayfa onbellekli kalir). Reklam alani yok.
    <div className="relative">
      <div className="relative mx-auto max-w-6xl px-4 pt-14 pb-14 sm:px-6 sm:pt-20 sm:pb-20">
        <section className="relative z-20 flex flex-wrap items-stretch gap-6">
          {/* Isik yansimasi (box-shadow) bu disaridaki elemanda animasyonlu -
              asagidaki icerik/input ile ayni boyama baglamini paylasmiyor,
              aksi halde Safari'de input'un imleci yanlis konumda cizilebiliyor. */}
          <div className="animate-frame-glow relative min-w-0 flex-[999_1_560px] rounded-3xl">
            {/* Kart kendi genisligine gore dizilir: uye gorunumunde (yaninda profil karti) tek sutun, misafirde
                genis kart sagda "en cok ilan" paneliyle. Sayilar gercek (aktif ilan, bolum basina ilan). */}
            {/* Kart tasmayi gosterir (bolum onerileri listesi kesilmesin); susler kendi katmaninda kirpilir. */}
            <div className="@container relative flex h-full flex-col justify-center rounded-3xl border border-primary/10 bg-white shadow-sm">
              <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden rounded-3xl">
                <div className="absolute -top-24 -left-16 h-72 w-72 rounded-full bg-primary/10 blur-3xl" />
                <div className="absolute -right-12 -bottom-28 h-72 w-72 rounded-full bg-indigo-400/10 blur-3xl" />
                <div className="absolute inset-0 [background-image:radial-gradient(rgba(37,99,235,0.13)_1px,transparent_1px)] [background-size:18px_18px] [mask-image:linear-gradient(to_bottom,black,transparent_65%)]" />
              </div>

              <div className="relative grid gap-8 p-7 sm:p-9 @4xl:grid-cols-[minmax(0,1fr)_17rem] @4xl:items-center">
                <div className="min-w-0">
                  <h1 className="font-sans text-[1.75rem] leading-tight font-bold tracking-tight text-balance text-slate-900 sm:text-4xl">
                    Mezun olduğun bölüme uygun{" "}
                    <span className="relative whitespace-nowrap text-primary">
                      kamu ilanlarını
                      <svg aria-hidden viewBox="0 0 200 12" preserveAspectRatio="none" className="absolute -bottom-1.5 left-0 h-2.5 w-full text-primary/30">
                        <path d="M2 9 C 50 2, 150 2, 198 8" stroke="currentColor" strokeWidth="4" fill="none" strokeLinecap="round" />
                      </svg>
                    </span>{" "}
                    bul.
                  </h1>
                  <p className="mt-3 max-w-lg text-[15px] leading-relaxed text-slate-600">
                    Bölümünü seç; başvurabileceğin güncel ilanları ve son başvuru tarihlerini tek listede gör.
                  </p>

                  <div className="mt-6">
                    <DepartmentSearch departments={departments} />
                  </div>

                  {/* Dar kartta (uye, telefon) en cok ilanli bolumler: sirali mini kartlar, gercek sayi ve goreli cubuk.
                      Genis kartta ayni bilgi sagdaki panelde. */}
                  <div className="mt-6 @4xl:hidden">
                    <p className="text-[11px] font-bold tracking-widest text-slate-500">EN ÇOK İLANI OLAN BÖLÜMLER</p>
                    <ol className="mt-2.5 grid grid-cols-2 gap-2.5 @xl:grid-cols-4">
                      {populer.slice(0, 4).map((d, i) => (
                        <li key={d.slug}>
                          <Link
                            href={`/bolum/${d.slug}`}
                            className="group flex h-full flex-col justify-between gap-2.5 rounded-2xl border border-slate-200/80 bg-white/90 p-3 shadow-[0_1px_2px_rgba(15,23,42,0.04)] transition-all hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-[0_8px_20px_-8px_rgba(37,99,235,0.3)]"
                          >
                            <span className="flex items-center justify-between gap-2">
                              <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-slate-900 text-[11px] font-bold text-white tabular-nums group-hover:bg-primary">{i + 1}</span>
                              <span className="text-sm font-bold text-slate-900 tabular-nums">
                                {d.ilanSayisi} <span className="text-xs font-medium text-slate-500">ilan</span>
                              </span>
                            </span>
                            <span className="line-clamp-2 text-[13px] leading-snug font-semibold text-slate-700 group-hover:text-primary">{d.name}</span>
                            <span className="block h-1 overflow-hidden rounded-full bg-slate-100">
                              <span className="block h-full rounded-full bg-gradient-to-r from-primary to-indigo-500" style={{ width: `${Math.round((d.ilanSayisi / enCok) * 100)}%` }} />
                            </span>
                          </Link>
                        </li>
                      ))}
                    </ol>
                  </div>

                  {/* Uye gorunumunde (yaninda profil karti, orta genislik) gizli: kart dolmasin, uye sayilari profil kartinda gorur. */}
                  <dl className="mt-7 grid grid-cols-3 gap-3 border-t border-slate-100 pt-5 @min-[600px]:@max-4xl:hidden @4xl:flex @4xl:gap-x-8">
                    {[
                      { label: "aktif ilan", value: stats.postingCount, ikon: Briefcase },
                      { label: "kurum", value: stats.institutionCount, ikon: Building2 },
                      { label: "bölüm", value: stats.departmentCount, ikon: GraduationCap },
                    ].map((stat) => (
                      <div key={stat.label} className="flex flex-col items-start gap-2 @4xl:flex-row @4xl:items-center @4xl:gap-3">
                        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                          <stat.ikon className="h-5 w-5" aria-hidden />
                        </span>
                        <div className="flex flex-col-reverse">
                          <dt className="mt-1 text-xs font-medium text-muted-foreground">{stat.label}</dt>
                          <dd className="text-xl leading-none font-bold text-slate-900 tabular-nums">
                            <SayacArtis deger={stat.value} />
                          </dd>
                        </div>
                      </div>
                    ))}
                  </dl>
                </div>

                <aside className="hidden rounded-2xl border border-primary/10 bg-white/85 p-5 shadow-sm backdrop-blur @4xl:block">
                  <p className="text-xs font-bold tracking-widest text-primary">EN ÇOK İLANI OLAN BÖLÜMLER</p>
                  <ul className="mt-4 space-y-3.5">
                    {populer.slice(0, 5).map((d) => (
                      <li key={d.slug}>
                        <Link href={`/bolum/${d.slug}`} className="group block">
                          <span className="flex items-baseline justify-between gap-2 text-sm">
                            <span className="truncate font-medium text-slate-700 group-hover:text-primary">{d.name}</span>
                            <span className="shrink-0 text-xs font-bold text-slate-900 tabular-nums">{d.ilanSayisi} ilan</span>
                          </span>
                          <span className="mt-1.5 block h-1.5 overflow-hidden rounded-full bg-primary/10">
                            <span className="block h-full rounded-full bg-gradient-to-r from-primary to-indigo-500" style={{ width: `${Math.round((d.ilanSayisi / enCok) * 100)}%` }} />
                          </span>
                        </Link>
                      </li>
                    ))}
                  </ul>
                  <Link href="/ilanlar" className="mt-5 inline-flex items-center gap-1 text-sm font-semibold text-primary hover:underline">
                    Tüm ilanlar
                    <ArrowRight className="h-4 w-4" aria-hidden />
                  </Link>
                </aside>
              </div>
            </div>
          </div>

          <UyeProfilKarti />
        </section>

        <GunlukSerit />

        {/* Kaydirilabilir haberler: duzen H'de kaldirilmisti, kullanici istedi (2026-10-22); tam genislik. */}
        {haberlerMapped.length > 0 && (
          <section aria-label="Güncel haberler" className="mt-6 h-[380px]">
            <HeroHaberCarousel haberler={haberlerMapped} />
          </section>
        )}

        <section className="mt-16">
          <BolumBasligi
            etiket="Yeni eklenenler"
            baslik="Yeni Eklenen İlanlar"
            aciklama="Sisteme en son eklenen kamu ilanları; aynı kurumun toplu ilanları tek kartta."
            tumuHref="/ilanlar"
            tumuEtiket="Tüm ilanlar"
            sayac={stats.postingCount}
          />
          <div data-yol-gecis className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {ilanGruplari.length === 0 && <p className="text-sm text-muted-foreground">Henüz ilan bulunmuyor.</p>}
            {ilanGruplari.map((grup) => (
              <IlanVitrinKarti key={grup.ilk.id} grup={grup} logoUrl={ilanLogolari.get(grup.ilk.institutionName) ?? null} />
            ))}
          </div>
        </section>

        <DavetBandi />

        <div className="mt-16">
          <HaberlerSection haberler={haberlerMapped} etiket="Güncel" toplamSayi={haberler.length} />
        </div>

        <div className="mt-16">
          <BizeUlasin />
        </div>
      </div>
    </div>
  );
}

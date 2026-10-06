import Link from "next/link";
import type { ReactNode } from "react";
import { Building2, ChevronRight, Hourglass, type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { MobilSabitBaslik } from "@/components/MobilSabitBaslik";

// Ogrenim duzeyine (ya da sayfaya) gore sag taraftaki dekoratif renk.
const TEMA = {
  LISANS: "from-indigo-500 to-violet-600",
  ONLISANS: "from-sky-500 to-blue-600",
  LISE: "from-emerald-500 to-teal-600",
  varsayilan: "from-blue-600 to-indigo-600",
} as const;

export type BaslikCipi = {
  etiket: string;
  ikon?: LucideIcon;
  href?: string;
  // aktif: secili filtre; vurgu: dikkat ceken (ör. yakinda bitenler)
  durum?: "aktif" | "vurgu";
};

/**
 * Sayfa ust basligi: breadcrumb, ikon karosu, baslik + aciklama, gercek
 * veriden hesaplanan bilgi cipleri ve aksiyonlar. Haber bolumu basligi ve
 * ilan kartlarindaki gorsel dili (nokta deseni + soluk buyuk ikon) tasir.
 */
export function SayfaBasligi({
  ikon: Ikon,
  breadcrumb = [],
  baslik,
  rozet,
  aciklama,
  cipler = [],
  aksiyonlar,
  tema = "varsayilan",
  mobilBaslik,
  filtreHedefi,
  kompakt = false,
}: {
  ikon: LucideIcon;
  breadcrumb?: { ad: string; href?: string }[];
  baslik: ReactNode;
  rozet?: ReactNode;
  aciklama?: ReactNode;
  cipler?: BaslikCipi[];
  aksiyonlar?: ReactNode;
  tema?: keyof typeof TEMA;
  // Verilirse mobilde baslik kaybolunca sabit ince cubukta gosterilir.
  mobilBaslik?: string;
  filtreHedefi?: string;
  // Profil/becayis alt sayfalari ve yasal metinler: desensiz, kucuk.
  kompakt?: boolean;
}) {
  return (
    <header
      className={cn(
        "relative overflow-hidden border border-primary/10 bg-white shadow-sm",
        kompakt ? "rounded-2xl p-5" : "rounded-3xl p-6 sm:p-8",
      )}
    >
      {/* Sag tarafta tema renginde soluk desenli alan - icerigin arkasinda kalir. */}
      <div aria-hidden className={cn("pointer-events-none absolute inset-y-0 right-0 hidden w-2/5", !kompakt && "sm:block")}>
        <div
          className={cn(
            "absolute inset-0 bg-gradient-to-l opacity-[0.14] [mask-image:linear-gradient(to_left,black_30%,transparent)]",
            TEMA[tema],
          )}
        />
        <div className="absolute inset-0 opacity-40 [background-image:radial-gradient(circle,rgb(99_102_241/0.35)_1px,transparent_1.5px)] [background-size:18px_18px] [mask-image:linear-gradient(to_left,black,transparent)]" />
        <Ikon className="absolute -right-8 -bottom-10 h-56 w-56 text-primary/[0.07]" strokeWidth={1.25} />
      </div>

      <div className="relative">
        {breadcrumb.length > 0 && (
          <nav aria-label="Sayfa konumu" className="mb-4 flex flex-wrap items-center gap-1 text-xs text-muted-foreground">
            {breadcrumb.map((b, i) => (
              <span key={b.ad} className="flex items-center gap-1">
                {i > 0 && <ChevronRight className="h-3 w-3" />}
                {b.href ? (
                  <Link href={b.href} className="hover:text-primary hover:underline">
                    {b.ad}
                  </Link>
                ) : (
                  <span className="font-medium text-slate-600">{b.ad}</span>
                )}
              </span>
            ))}
          </nav>
        )}

        <div className="flex items-start gap-4">
          <span
            className={cn(
              "flex shrink-0 items-center justify-center bg-gradient-to-br text-white shadow-lg shadow-primary/25",
              kompakt ? "h-10 w-10 rounded-xl" : "h-12 w-12 rounded-2xl",
              TEMA[tema],
            )}
          >
            <Ikon className={kompakt ? "h-5 w-5" : "h-6 w-6"} />
          </span>
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h1
                className={cn(
                  "font-sans font-bold tracking-tight text-slate-900",
                  kompakt ? "text-xl sm:text-2xl" : "text-2xl sm:text-3xl",
                )}
              >
                {baslik}
              </h1>
              {rozet}
            </div>
            {aciklama && <p className="mt-1.5 max-w-2xl text-sm text-muted-foreground">{aciklama}</p>}
          </div>
        </div>

        {cipler.length > 0 && (
          <div className="mt-5 flex flex-wrap gap-2">
            {cipler.map(({ etiket, ikon: CipIkon, href, durum }) => {
              const sinif = cn(
                "inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold transition-colors",
                durum === "aktif"
                  ? "border-primary bg-primary text-primary-foreground"
                  : durum === "vurgu"
                    ? "border-amber-300 bg-amber-50 text-amber-800"
                    : "border-primary/15 bg-slate-50 text-slate-700",
                href && "hover:border-primary/40 hover:shadow-sm",
              );
              const icerik = (
                <>
                  {CipIkon && <CipIkon className="h-3.5 w-3.5" />}
                  {etiket}
                </>
              );
              // Sayfa ici capa (#filtreler) duz <a>; filtre linkleri sayfayi en uste ziplatmaz.
              return href?.startsWith("#") ? (
                <a key={etiket} href={href} className={sinif}>
                  {icerik}
                </a>
              ) : href ? (
                <Link key={etiket} href={href} className={sinif} scroll={false}>
                  {icerik}
                </Link>
              ) : (
                <span key={etiket} className={sinif}>
                  {icerik}
                </span>
              );
            })}
          </div>
        )}

        {aksiyonlar && <div className="mt-5 flex flex-wrap items-center gap-2">{aksiyonlar}</div>}
      </div>
      {mobilBaslik && <MobilSabitBaslik baslik={mobilBaslik} filtreHedefi={filtreHedefi} />}
    </header>
  );
}

/** Ilan listesi sayfalari icin ortak cipler: aktif ilan, kurum sayisi, bu hafta biten (filtre). */
export function ilanCipleri(
  ilanlar: { institutionName: string }[],
  yakinda: { biteceklerSayisi: number; aktif: boolean; href: string },
): BaslikCipi[] {
  const kurumSayisi = new Set(ilanlar.map((i) => i.institutionName)).size;
  return [
    { etiket: `${ilanlar.length} aktif ilan` },
    { etiket: `${kurumSayisi} kurum`, ikon: Building2, href: "#filtreler" },
    ...(yakinda.biteceklerSayisi > 0
      ? [
          {
            etiket: yakinda.aktif ? "Yakında bitenler gösteriliyor ✕" : `${yakinda.biteceklerSayisi} ilan bu hafta bitiyor`,
            ikon: Hourglass,
            href: yakinda.href,
            durum: yakinda.aktif ? ("aktif" as const) : ("vurgu" as const),
          },
        ]
      : []),
  ];
}

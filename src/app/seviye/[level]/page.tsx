import { notFound } from "next/navigation";
import { GraduationCap } from "lucide-react";
import {
  getAvailableFiltersForLevel,
  getPostingsForLevel,
} from "@/lib/matching";
import { LEVEL_SLUG_TO_ENUM } from "@/lib/levels";
import { LEVEL_LABEL } from "@/lib/labels";
import { IlanVitrinKarti } from "@/components/IlanVitrinKarti";
import { kurumLogolari, tekIlanKartlari, yakindaFiltresi } from "@/lib/ilanVitrin";
import { ilanCipleri, SayfaBasligi } from "@/components/SayfaBasligi";
import { FilterBar } from "@/components/FilterBar";

export const revalidate = 300;

export default async function LevelResultsPage({
  params,
  searchParams,
}: {
  params: Promise<{ level: string }>;
  searchParams: Promise<{ kurum?: string; ilanTuru?: string; il?: string; bolumSarti?: string; yakinda?: string }>;
}) {
  const { level: levelSlug } = await params;
  const { kurum, ilanTuru, il, bolumSarti, yakinda } = await searchParams;

  const level = LEVEL_SLUG_TO_ENUM[levelSlug];
  if (!level) notFound();

  const departmentRequirement = bolumSarti === "var" || bolumSarti === "yok" ? bolumSarti : undefined;

  const [tumIlanlar, filterOptions] = await Promise.all([
    getPostingsForLevel(level, { institutionType: kurum, ilanTuru, il, departmentRequirement }),
    getAvailableFiltersForLevel(level),
  ]);
  const yakindaDurumu = yakindaFiltresi(tumIlanlar, `/seviye/${levelSlug}`, { kurum, ilanTuru, il, bolumSarti, yakinda });
  const postings = yakindaDurumu.gosterilen;
  const logolar = await kurumLogolari(postings);
  const duzey = LEVEL_LABEL[level] ?? level;

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <SayfaBasligi
        ikon={GraduationCap}
        breadcrumb={[{ ad: "Ana Sayfa", href: "/" }, { ad: `${duzey} Mezunları` }]}
        baslik={`${duzey} mezunları için ilanlar`}
        aciklama={`${duzey} mezunlarının başvurabileceği güncel kamu ilanları. Bazı ilanlar belirli bir bölüm mezunu olmayı şart koşar, bazıları koşmaz — her ilan kartında bunu ayrıca görebilirsin.`}
        cipler={ilanCipleri(tumIlanlar, yakindaDurumu)}
        mobilBaslik={`${duzey} mezunları ilanları`}
        filtreHedefi="#filtreler"
      />

      <div id="filtreler" className="mt-6 scroll-mt-32">
        <FilterBar options={filterOptions} />
      </div>

      <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {postings.length === 0 && (
          <div className="rounded-2xl border border-dashed border-primary/25 bg-primary/5 p-8 text-center text-sm text-muted-foreground sm:col-span-2 lg:col-span-3">
            Şu anda bu düzeyde aktif bir ilan bulunmuyor.
            Daha sonra tekrar kontrol edebilirsin.
          </div>
        )}
        {tekIlanKartlari(postings).map((grup) => (
          <IlanVitrinKarti
            key={grup.ilk.id}
            grup={grup}
            logoUrl={logolar.get(grup.ilk.institutionName) ?? null}
            nitelikOzeti
          />
        ))}
      </div>
    </div>
  );
}

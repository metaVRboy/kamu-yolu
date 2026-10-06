import { ClipboardList } from "lucide-react";
import { getAllActivePostings, getAvailableFiltersForAll } from "@/lib/matching";
import { IlanVitrinKarti } from "@/components/IlanVitrinKarti";
import { FilterBar } from "@/components/FilterBar";
import { duzgunHarf, kurumLogolari, tekIlanKartlari, yakindaFiltresi } from "@/lib/ilanVitrin";
import { ilanCipleri, SayfaBasligi } from "@/components/SayfaBasligi";

export const revalidate = 300;

export const metadata = {
  title: "Tüm İlanlar — Kamu Yolu",
  description: "Sistemdeki tüm güncel kamu personeli/memur ilanları.",
};

export default async function TumIlanlarPage({
  searchParams,
}: {
  searchParams: Promise<{ kurum?: string; ilanTuru?: string; il?: string; bolumSarti?: string; kurumAdi?: string; yakinda?: string }>;
}) {
  const { kurum, ilanTuru, il, bolumSarti, kurumAdi, yakinda } = await searchParams;
  const departmentRequirement = bolumSarti === "var" || bolumSarti === "yok" ? bolumSarti : undefined;

  const [tumIlanlar, filterOptions] = await Promise.all([
    getAllActivePostings({ institutionType: kurum, ilanTuru, il, departmentRequirement, kurumAdi }),
    getAvailableFiltersForAll(),
  ]);
  const yakindaDurumu = yakindaFiltresi(tumIlanlar, "/ilanlar", { kurum, ilanTuru, il, bolumSarti, kurumAdi, yakinda });
  const postings = yakindaDurumu.gosterilen;
  const logolar = await kurumLogolari(postings);
  // Kurum filtresi cipi: tiklayinca sadece kurumAdi kalkar, diger filtreler kalir.
  const kurumsuz = new URLSearchParams(
    Object.entries({ kurum, ilanTuru, il, bolumSarti, yakinda }).filter((e): e is [string, string] => !!e[1]),
  );
  const kurumsuzHref = `/ilanlar${kurumsuz.size ? `?${kurumsuz}` : ""}`;

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <SayfaBasligi
        ikon={ClipboardList}
        breadcrumb={[{ ad: "Ana Sayfa", href: "/" }, { ad: "Tüm İlanlar" }]}
        baslik="Tüm İlanlar"
        aciklama="Sistemdeki tüm güncel kamu personeli ve memur ilanları; her ilan kartında bölüm şartını ve son başvuru tarihini görebilirsin."
        cipler={[
          ...(kurumAdi ? [{ etiket: `Kurum: ${duzgunHarf(kurumAdi)} ✕`, href: kurumsuzHref, durum: "aktif" as const }] : []),
          ...ilanCipleri(tumIlanlar, yakindaDurumu),
        ]}
        mobilBaslik="Tüm İlanlar"
        filtreHedefi="#filtreler"
      />

      <div id="filtreler" className="mt-6 scroll-mt-32">
        <FilterBar options={filterOptions} />
      </div>

      <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {postings.length === 0 && (
          <div className="rounded-2xl border border-dashed border-primary/25 bg-primary/5 p-8 text-center text-sm text-muted-foreground sm:col-span-2 lg:col-span-3">
            Şu anda aktif bir ilan bulunmuyor. Daha sonra tekrar kontrol edebilirsin.
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

import Link from "next/link";
import { ArrowLeft, X } from "lucide-react";
import { getAllActivePostings, getAvailableFiltersForAll } from "@/lib/matching";
import { IlanVitrinKarti } from "@/components/IlanVitrinKarti";
import { FilterBar } from "@/components/FilterBar";
import { duzgunHarf, kurumLogolari, tekIlanKartlari } from "@/lib/ilanVitrin";

export const revalidate = 300;

export const metadata = {
  title: "Tüm İlanlar — Kamu Yolu",
  description: "Sistemdeki tüm güncel kamu personeli/memur ilanları.",
};

export default async function TumIlanlarPage({
  searchParams,
}: {
  searchParams: Promise<{ kurum?: string; ilanTuru?: string; il?: string; bolumSarti?: string; kurumAdi?: string }>;
}) {
  const { kurum, ilanTuru, il, bolumSarti, kurumAdi } = await searchParams;
  const departmentRequirement = bolumSarti === "var" || bolumSarti === "yok" ? bolumSarti : undefined;

  const [postings, filterOptions] = await Promise.all([
    getAllActivePostings({ institutionType: kurum, ilanTuru, il, departmentRequirement, kurumAdi }),
    getAvailableFiltersForAll(),
  ]);
  const logolar = await kurumLogolari(postings);

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <Link
        href="/"
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        Ana sayfaya dön
      </Link>

      <h1 className="mt-4 font-sans text-2xl font-bold tracking-tight text-primary sm:text-3xl">
        Tüm İlanlar
      </h1>
      <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
        Sistemdeki tüm güncel kamu personeli/memur ilanları ({postings.length} ilan).
      </p>

      {kurumAdi && (
        <Link
          href="/ilanlar"
          className="mt-4 inline-flex items-center gap-1.5 rounded-full border border-primary/20 bg-white px-3 py-1 text-sm font-medium text-primary hover:bg-primary/5"
        >
          Kurum: {duzgunHarf(kurumAdi)}
          <X className="h-3.5 w-3.5" />
        </Link>
      )}

      <div className="mt-6">
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

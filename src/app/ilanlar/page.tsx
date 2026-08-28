import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getAllActivePostings, getAvailableFiltersForAll } from "@/lib/matching";
import { PostingCard } from "@/components/PostingCard";
import { FilterBar } from "@/components/FilterBar";

export const revalidate = 300;

export const metadata = {
  title: "Tüm İlanlar — Kamu Yolu",
  description: "Sistemdeki tüm güncel kamu personeli/memur ilanları.",
};

export default async function TumIlanlarPage({
  searchParams,
}: {
  searchParams: Promise<{ kurum?: string; ilanTuru?: string; il?: string }>;
}) {
  const { kurum, ilanTuru, il } = await searchParams;

  const [postings, filterOptions] = await Promise.all([
    getAllActivePostings({ institutionType: kurum, ilanTuru, il }),
    getAvailableFiltersForAll(),
  ]);

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <Link
        href="/"
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        Ana sayfaya dön
      </Link>

      <h1 className="mt-4 text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
        Tüm İlanlar
      </h1>
      <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
        Sistemdeki tüm güncel kamu personeli/memur ilanları ({postings.length} ilan).
      </p>

      <div className="mt-6">
        <FilterBar options={filterOptions} />
      </div>

      <div className="mt-8 space-y-4">
        {postings.length === 0 && (
          <div className="rounded-2xl border border-dashed border-primary/25 bg-primary/5 p-8 text-center text-sm text-muted-foreground">
            Şu anda aktif bir ilan bulunmuyor. Daha sonra tekrar kontrol edebilirsin.
          </div>
        )}
        {postings.map((posting) => (
          <PostingCard key={posting.id} posting={posting} />
        ))}
      </div>
    </div>
  );
}

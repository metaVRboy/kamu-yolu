import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import {
  getAvailableFiltersForLevel,
  getPostingsForLevel,
} from "@/lib/matching";
import { LEVEL_SLUG_TO_ENUM } from "@/lib/levels";
import { LEVEL_LABEL } from "@/lib/labels";
import { PostingCard } from "@/components/PostingCard";
import { FilterBar } from "@/components/FilterBar";
import { Badge } from "@/components/ui/badge";

export const revalidate = 300;

export default async function LevelResultsPage({
  params,
  searchParams,
}: {
  params: Promise<{ level: string }>;
  searchParams: Promise<{ kurum?: string; ilanTuru?: string; il?: string }>;
}) {
  const { level: levelSlug } = await params;
  const { kurum, ilanTuru, il } = await searchParams;

  const level = LEVEL_SLUG_TO_ENUM[levelSlug];
  if (!level) notFound();

  const [postings, filterOptions] = await Promise.all([
    getPostingsForLevel(level, { institutionType: kurum, ilanTuru, il }),
    getAvailableFiltersForLevel(level),
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

      <div className="mt-4 flex flex-wrap items-center gap-3">
        <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
          {LEVEL_LABEL[level] ?? level} Mezunları İçin İlanlar
        </h1>
        <Badge variant="outline" className="border-primary/30 text-primary">
          {LEVEL_LABEL[level] ?? level}
        </Badge>
      </div>
      <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
        {(LEVEL_LABEL[level] ?? level)} mezunlarının başvurabileceği güncel kamu
        ilanları. Bazı ilanlar belirli bir bölüm mezunu olmayı şart koşar, bazıları
        koşmaz — her ilan kartında bunu ayrıca görebilirsin.
      </p>

      <div className="mt-6">
        <FilterBar options={filterOptions} />
      </div>

      <div className="mt-8 space-y-4">
        {postings.length === 0 && (
          <div className="rounded-2xl border border-dashed border-primary/25 bg-primary/5 p-8 text-center text-sm text-muted-foreground">
            Şu anda bu düzeyde aktif bir ilan bulunmuyor.
            Daha sonra tekrar kontrol edebilirsin.
          </div>
        )}
        {postings.map((posting) => (
          <PostingCard key={posting.id} posting={posting} />
        ))}
      </div>
    </div>
  );
}

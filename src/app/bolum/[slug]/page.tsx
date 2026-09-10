import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { prisma } from "@/lib/prisma";
import {
  getAvailableFiltersForDepartment,
  getPostingsForDepartment,
} from "@/lib/matching";
import { getHaberlerForDepartment } from "@/lib/haberler";
import { PostingCard } from "@/components/PostingCard";
import { FilterBar } from "@/components/FilterBar";
import { HaberlerSection } from "@/components/HaberlerSection";
import { Badge } from "@/components/ui/badge";
import { LEVEL_LABEL } from "@/lib/labels";

export const revalidate = 300;

export default async function DepartmentResultsPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ kurum?: string; ilanTuru?: string; il?: string }>;
}) {
  const { slug } = await params;
  const { kurum, ilanTuru, il } = await searchParams;

  const department = await prisma.department.findUnique({ where: { slug } });
  if (!department) notFound();

  const [postings, filterOptions, ilgiliHaberler] = await Promise.all([
    getPostingsForDepartment(department.id, {
      institutionType: kurum,
      ilanTuru,
      il,
    }),
    getAvailableFiltersForDepartment(department.id),
    getHaberlerForDepartment(department),
  ]);

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <Link
        href="/"
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        Farklı bir bölüm ara
      </Link>

      <div className="mt-4 flex flex-wrap items-center gap-3">
        <h1 className="font-sans text-2xl font-bold tracking-tight text-primary sm:text-3xl">
          {department.name} mezunları için ilanlar
        </h1>
        <Badge variant="outline" className="border-primary/30 text-primary">
          {LEVEL_LABEL[department.level] ?? department.level}
        </Badge>
        <Badge className="border-transparent bg-primary text-primary-foreground">
          {postings.length} İlan
        </Badge>
      </div>
      <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
        Bu bölüme özel şart koşan ilanlar ile bölüm şartı olmayan, öğrenim
        derecesine göre açılan ilanlar birlikte listelenir.
      </p>

      <div className="mt-6">
        <FilterBar options={filterOptions} />
      </div>

      <div className="mt-8 space-y-4">
        {postings.length === 0 && (
          <div className="rounded-2xl border border-dashed border-primary/25 bg-primary/5 p-8 text-center text-sm text-muted-foreground">
            Seçtiğin kriterlere uyan aktif bir ilan bulunmuyor. Filtreleri
            değiştirmeyi veya daha sonra tekrar kontrol etmeyi deneyebilirsin.
          </div>
        )}
        {postings.map((posting) => (
          <PostingCard key={posting.id} posting={posting} />
        ))}
      </div>

      {ilgiliHaberler.length > 0 && (
        <div className="mt-16">
          <HaberlerSection
            haberler={ilgiliHaberler.map((h) => ({ ...h, yayinTarihi: h.yayinTarihi.toISOString() }))}
            showAllLink={false}
            baslik="İlgili Haberler ve Duyurular"
            aciklama={`${department.name} ile ilgili gündemdeki haberler ve duyurular.`}
          />
        </div>
      )}
    </div>
  );
}

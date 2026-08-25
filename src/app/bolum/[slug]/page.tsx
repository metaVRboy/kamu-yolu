import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import {
  getAvailableFiltersForDepartment,
  getPostingsForDepartment,
} from "@/lib/matching";
import { PostingCard } from "@/components/PostingCard";
import { FilterBar } from "@/components/FilterBar";

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

  const [postings, filterOptions] = await Promise.all([
    getPostingsForDepartment(department.id, {
      institutionType: kurum,
      ilanTuru,
      il,
    }),
    getAvailableFiltersForDepartment(department.id),
  ]);

  return (
    <div className="mx-auto max-w-5xl px-4 py-10">
      <Link href="/" className="text-sm text-neutral-500 hover:text-neutral-800">
        ← Farklı bir bölüm ara
      </Link>

      <h1 className="mt-3 text-2xl font-bold text-neutral-900">
        {department.name} mezunları için ilanlar
      </h1>
      <p className="mt-1 text-sm text-neutral-500">
        Bu bölüme özel şart koşan ilanlar ile bölüm şartı olmayan, öğrenim
        derecesine göre açılan ilanlar birlikte listelenir.
      </p>

      <FilterBar options={filterOptions} />

      <div className="mt-8 space-y-4">
        {postings.length === 0 && (
          <p className="text-sm text-neutral-500">
            Seçtiğin kriterlere uyan aktif bir ilan bulunmuyor. Filtreleri
            değiştirmeyi veya daha sonra tekrar kontrol etmeyi deneyebilirsin.
          </p>
        )}
        {postings.map((posting) => (
          <PostingCard key={posting.id} posting={posting} />
        ))}
      </div>
    </div>
  );
}

import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Bell } from "lucide-react";
import { prisma } from "@/lib/prisma";
import {
  getAvailableFiltersForDepartment,
  getPostingsForDepartment,
} from "@/lib/matching";
import { getHaberlerForDepartment } from "@/lib/haberler";
import { getCurrentUser } from "@/lib/auth";
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
  searchParams: Promise<{ kurum?: string; ilanTuru?: string; il?: string; bolumSarti?: string }>;
}) {
  const { slug } = await params;
  const { kurum, ilanTuru, il, bolumSarti } = await searchParams;
  const departmentRequirement = bolumSarti === "var" || bolumSarti === "yok" ? bolumSarti : undefined;

  const department = await prisma.department.findUnique({ where: { slug } });
  if (!department) notFound();

  const [postings, filterOptions, ilgiliHaberler, user] = await Promise.all([
    getPostingsForDepartment(department.id, {
      institutionType: kurum,
      ilanTuru,
      il,
      departmentRequirement,
    }),
    getAvailableFiltersForDepartment(department.id),
    getHaberlerForDepartment(department),
    getCurrentUser(),
  ]);
  // SMS ile anlik ilan bildirimi Pro ozelligi (bkz. AbonelikPlanlari) - bu
  // yuzden Pro/Pro+ uyelere yukseltme kartini gostermiyoruz.
  const yukseltmeKartiGoster = user?.abonelikPlani !== "PRO" && user?.abonelikPlani !== "PRO_PLUS";

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      {yukseltmeKartiGoster && (
        <div className="mb-4 flex items-start gap-2.5 rounded-xl border border-primary/20 bg-primary/5 px-4 py-3 text-sm text-slate-700">
          <Bell className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
          <p>
            {department.name} ile ilgili yayınlanan ilanlardan anında haberdar olmak için{" "}
            <Link
              href={user ? "/profilim/abonelik" : "/kayit-ol"}
              className="font-semibold text-primary underline-offset-2 hover:underline"
            >
              üyeliğini yükselt
            </Link>
            {!user && (
              <>
                . Henüz hesabın yoksa{" "}
                <Link href="/kayit-ol" className="font-semibold text-primary underline-offset-2 hover:underline">
                  kayıt ol
                </Link>
              </>
            )}
            .
          </p>
        </div>
      )}

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
        Sadece bu bölüme özel şart koşan ilanlar listelenir.
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

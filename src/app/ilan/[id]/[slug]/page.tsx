import { notFound, permanentRedirect } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import { ArrowLeft, ArrowUpRight, Building2, CalendarClock, MapPin } from "lucide-react";
import { getPostingById } from "@/lib/matching";
import { slugify } from "@/lib/slug";
import { INSTITUTION_TYPE_LABEL, LEVEL_LABEL } from "@/lib/labels";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { buttonVariants } from "@/components/ui/button";

export const revalidate = 300;

type Params = { id: string; slug: string };

// Kariyer Kapisi gibi bazi kaynaklarda title zaten kurum adini icinde
// barindiriyor (ör. "... — HATAY MUSTAFA KEMAL ÜNİVERSİTESİ REKTÖRLÜĞÜ") -
// boyle durumda kurum adini ayrica eklemek "X — X" gibi tekrara yol aciyor.
function baslikKurumuIceriyorMu(title: string, institutionName: string): boolean {
  return title.toLocaleUpperCase("tr-TR").includes(institutionName.toLocaleUpperCase("tr-TR"));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>;
}): Promise<Metadata> {
  const { id } = await params;
  const posting = await getPostingById(id);
  if (!posting) return { title: "İlan Bulunamadı — Kamu Yolu" };

  const description = posting.departmentRequirementRaw
    ? posting.departmentRequirementRaw.slice(0, 155)
    : `${posting.institutionName} tarafından yayımlanan "${posting.title}" ilanının detaylarını Kamu Yolu'nda incele.`;

  const title = baslikKurumuIceriyorMu(posting.title, posting.institutionName)
    ? `${posting.title} | Kamu Yolu`
    : `${posting.title} — ${posting.institutionName} | Kamu Yolu`;

  return {
    title,
    description,
    alternates: { canonical: `/ilan/${id}/${slugify(posting.title)}` },
    // Demo/ornek veri arama sonuclarinda gercek ilan gibi indekslenmesin.
    robots: posting.isDemo ? { index: false, follow: false } : undefined,
  };
}

export default async function IlanDetayPage({
  params,
}: {
  params: Promise<Params>;
}) {
  const { id, slug } = await params;
  const posting = await getPostingById(id);
  if (!posting) notFound();

  // Google'in ayni ilani tek bir adreste gormesi (yinelenen icerik olmamasi)
  // ve URL'nin her zaman guncel basligi yansitmasi icin kanonik slug'a yonlendir.
  const canonicalSlug = slugify(posting.title);
  if (slug !== canonicalSlug) {
    permanentRedirect(`/ilan/${id}/${canonicalSlug}`);
  }

  const levels = posting.educationLevels.map((l) => LEVEL_LABEL[l] ?? l).join(", ");
  const illerLabel = posting.iller.length > 0 ? posting.iller.join(", ") : null;
  const bolumler = posting.departments.map((d) => d.department);

  const jobPostingLd = {
    "@context": "https://schema.org",
    "@type": "JobPosting",
    title: posting.title,
    description:
      posting.departmentRequirementRaw ??
      `${posting.institutionName} tarafından yayımlanan resmi kamu personeli ilanı.`,
    datePosted: (posting.publishedAt ?? posting.createdAt).toISOString(),
    ...(posting.applicationEnd ? { validThrough: posting.applicationEnd.toISOString() } : {}),
    hiringOrganization: { "@type": "Organization", name: posting.institutionName },
    jobLocation:
      posting.iller.length > 0
        ? posting.iller.map((il) => ({
            "@type": "Place",
            address: { "@type": "PostalAddress", addressRegion: il, addressCountry: "TR" },
          }))
        : [{ "@type": "Place", address: { "@type": "PostalAddress", addressCountry: "TR" } }],
    directApply: false,
  };

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
      <Link
        href="/ilanlar"
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        Tüm ilanlara dön
      </Link>

      <Card className="mt-4 gap-4 border-primary/20 bg-white p-6 shadow-sm">
        <div className="flex flex-wrap items-center gap-1.5 text-xs">
          <Badge className="gap-1 border-primary/15 bg-primary/10 font-normal text-primary">
            <Building2 className="h-3 w-3" />
            {INSTITUTION_TYPE_LABEL[posting.institutionType] ?? posting.institutionType}
          </Badge>
          {levels && (
            <Badge className="border-primary/15 bg-primary/10 font-normal text-primary">{levels}</Badge>
          )}
          {posting.ilanTuru && (
            <Badge className="border-primary/15 bg-primary/10 font-normal text-primary">{posting.ilanTuru}</Badge>
          )}
          {illerLabel && (
            <Badge className="gap-1 border-primary/15 bg-primary/10 font-normal text-primary">
              <MapPin className="h-3 w-3" />
              {illerLabel}
            </Badge>
          )}
          {!posting.isDepartmentRestricted && (
            <Badge className="border-transparent bg-emerald-100 font-normal text-emerald-700 hover:bg-emerald-100">
              Bölüm şartı yok
            </Badge>
          )}
          {!posting.isActive && (
            <Badge className="border-transparent bg-slate-200 font-normal text-slate-600 hover:bg-slate-200">
              Artık aktif değil
            </Badge>
          )}
          {posting.isDemo && (
            <Badge className="border-transparent bg-amber-100 font-medium text-amber-800 hover:bg-amber-100">
              ÖRNEK VERİ — gerçek ilan değildir
            </Badge>
          )}
        </div>

        <h1 className="text-2xl font-bold leading-snug text-foreground sm:text-3xl">{posting.title}</h1>
        {!baslikKurumuIceriyorMu(posting.title, posting.institutionName) && (
          <p className="-mt-2 text-sm text-muted-foreground">{posting.institutionName}</p>
        )}

        {posting.departmentRequirementRaw && (
          <div>
            <h2 className="text-sm font-semibold text-foreground">Aranan Nitelikler</h2>
            <p className="mt-1.5 whitespace-pre-line text-sm text-muted-foreground">
              {posting.departmentRequirementRaw}
            </p>
          </div>
        )}

        {bolumler.length > 0 && (
          <div>
            <h2 className="text-sm font-semibold text-foreground">Uygun Bölümler</h2>
            <div className="mt-1.5 flex flex-wrap gap-1.5">
              {bolumler.map((b) => (
                <Link key={b.slug} href={`/bolum/${b.slug}`}>
                  <Badge variant="outline" className="border-primary/25 text-primary hover:bg-primary/10">
                    {b.name}
                  </Badge>
                </Link>
              ))}
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 gap-2.5 border-t border-border/60 pt-4 text-sm sm:grid-cols-2">
          <span className="flex items-center gap-1.5 text-muted-foreground">
            <CalendarClock className="h-3.5 w-3.5" />
            {posting.applicationEnd
              ? `Son başvuru: ${posting.applicationEnd.toLocaleDateString("tr-TR")}`
              : "Son başvuru tarihi belirtilmemiş"}
          </span>
          {posting.applicationStart && (
            <span className="flex items-center gap-1.5 text-muted-foreground">
              <CalendarClock className="h-3.5 w-3.5" />
              Başvuru başlangıcı: {posting.applicationStart.toLocaleDateString("tr-TR")}
            </span>
          )}
        </div>

        <a
          href={posting.sourceUrl}
          target="_blank"
          rel="noopener noreferrer"
          className={buttonVariants({ className: "w-full sm:w-fit" })}
        >
          Resmi İlana Git ({posting.sourceName})
          <ArrowUpRight className="h-4 w-4" />
        </a>
      </Card>

      {!posting.isDemo && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jobPostingLd).replace(/</g, "\\u003c") }}
        />
      )}
    </div>
  );
}

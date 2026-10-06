import { notFound } from "next/navigation";
import Link from "next/link";
import { Bell, Building2, GraduationCap, Hourglass } from "lucide-react";
import { prisma } from "@/lib/prisma";
import {
  getAvailableFiltersForDepartment,
  getDepartmentPostingCounts,
  getPostingsForDepartment,
} from "@/lib/matching";
import { getHaberlerForDepartment } from "@/lib/haberler";
import { getCurrentUser } from "@/lib/auth";
import { IlanVitrinKarti } from "@/components/IlanVitrinKarti";
import { kurumLogolari, tekIlanKartlari, yakindaBitenler } from "@/lib/ilanVitrin";
import { SayfaBasligi } from "@/components/SayfaBasligi";
import { FarkliBolumAra } from "@/components/FarkliBolumAra";
import { LEVEL_SLUG_TO_ENUM } from "@/lib/levels";
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
  searchParams: Promise<{ kurum?: string; ilanTuru?: string; il?: string; bolumSarti?: string; yakinda?: string }>;
}) {
  const { slug } = await params;
  const { kurum, ilanTuru, il, bolumSarti, yakinda } = await searchParams;
  const departmentRequirement = bolumSarti === "var" || bolumSarti === "yok" ? bolumSarti : undefined;

  const department = await prisma.department.findUnique({ where: { slug } });
  if (!department) notFound();

  const [tumIlanlar, filterOptions, ilgiliHaberler, user, bolumSatirlari, bolumIlanSayilari] = await Promise.all([
    getPostingsForDepartment(department.id, {
      institutionType: kurum,
      ilanTuru,
      il,
      departmentRequirement,
    }),
    getAvailableFiltersForDepartment(department.id),
    getHaberlerForDepartment(department),
    getCurrentUser(),
    prisma.department.findMany({ select: { id: true, slug: true, name: true, level: true }, orderBy: { name: "asc" } }),
    getDepartmentPostingCounts(),
  ]);
  const bitecekler = yakindaBitenler(tumIlanlar);
  const postings = yakinda === "1" ? bitecekler : tumIlanlar;
  const kurumSayisi = new Set(tumIlanlar.map((p) => p.institutionName)).size;
  const bolumler = bolumSatirlari.map((d) => ({ slug: d.slug, name: d.name, level: d.level, ilanSayisi: bolumIlanSayilari.get(d.id) ?? 0 }));
  const seviyeSlug = Object.entries(LEVEL_SLUG_TO_ENUM).find(([, v]) => v === department.level)?.[0];
  // yakinda filtresini ac/kapa ederken diger filtreler korunur.
  const yakindaParam = new URLSearchParams(Object.entries({ kurum, ilanTuru, il, bolumSarti }).filter((e): e is [string, string] => !!e[1]));
  if (yakinda !== "1") yakindaParam.set("yakinda", "1");
  const yakindaHref = `/bolum/${slug}${yakindaParam.size ? `?${yakindaParam}` : ""}`;
  const logolar = await kurumLogolari(postings);
  // SMS ile anlik ilan bildirimi Pro ozelligi (bkz. AbonelikPlanlari) - bu
  // yuzden Pro/Pro+ uyelere yukseltme kartini gostermiyoruz.
  const yukseltmeKartiGoster = user?.abonelikPlani !== "PRO" && user?.abonelikPlani !== "PRO_PLUS";

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <SayfaBasligi
        ikon={GraduationCap}
        tema={department.level === "LISANS" || department.level === "ONLISANS" || department.level === "LISE" ? department.level : "varsayilan"}
        breadcrumb={[
          { ad: "Ana Sayfa", href: "/" },
          { ad: `${LEVEL_LABEL[department.level] ?? department.level} Mezunları`, href: seviyeSlug ? `/seviye/${seviyeSlug}` : undefined },
          { ad: department.name },
        ]}
        baslik={
          <>
            <span className="text-primary">{department.name}</span> mezunları için ilanlar
          </>
        }
        rozet={
          <Badge variant="outline" className="border-primary/30 text-primary">
            {LEVEL_LABEL[department.level] ?? department.level}
          </Badge>
        }
        aciklama="Sadece bu bölüme özel şart koşan güncel kamu ilanları listelenir."
        cipler={[
          { etiket: `${tumIlanlar.length} aktif ilan` },
          { etiket: `${kurumSayisi} kurum`, ikon: Building2, href: "#filtreler" },
          ...(bitecekler.length > 0
            ? [
                {
                  etiket: yakinda === "1" ? "Yakında bitenler gösteriliyor ✕" : `${bitecekler.length} ilan bu hafta bitiyor`,
                  ikon: Hourglass,
                  href: yakindaHref,
                  durum: yakinda === "1" ? ("aktif" as const) : ("vurgu" as const),
                },
              ]
            : []),
        ]}
        aksiyonlar={
          <>
            {yukseltmeKartiGoster && (
              <Link
                href={user ? "/profilim/abonelik" : "/kayit-ol"}
                className="inline-flex items-center gap-1.5 rounded-full bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground shadow-sm transition-colors hover:bg-primary/90"
              >
                <Bell className="h-4 w-4" />
                Yeni ilan çıkınca haber ver
              </Link>
            )}
            <FarkliBolumAra departments={bolumler} />
          </>
        }
        mobilBaslik={`${department.name} ilanları`}
        filtreHedefi="#filtreler"
      />

      <div id="filtreler" className="mt-6 scroll-mt-32">
        <FilterBar options={filterOptions} />
      </div>

      <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {postings.length === 0 && (
          <div className="rounded-2xl border border-dashed border-primary/25 bg-primary/5 p-8 text-center text-sm text-muted-foreground sm:col-span-2 lg:col-span-3">
            Seçtiğin kriterlere uyan aktif bir ilan bulunmuyor. Filtreleri
            değiştirmeyi veya daha sonra tekrar kontrol etmeyi deneyebilirsin.
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

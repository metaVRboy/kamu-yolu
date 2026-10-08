import Link from "next/link";
import { notFound } from "next/navigation";
import { ExternalLink } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { adminSayfasi } from "@/lib/admin";
import { slugify } from "@/lib/slug";
import { AdminBaslik, AdminKart } from "@/components/admin/AdminUI";
import { AdminIlanForm, AdminIlanIslem } from "@/components/admin/AdminIlanForm";

export const metadata = { title: "İlan düzenle — Admin" };

// Istanbul gunu, <input type="date"> bicimiyle (YYYY-MM-DD).
const GUN = new Intl.DateTimeFormat("en-CA", { timeZone: "Europe/Istanbul" });

export default async function AdminIlanDuzenlePage({ params }: { params: Promise<{ id: string }> }) {
  await adminSayfasi();
  const { id } = await params;
  const [ilan, bolumler] = await Promise.all([
    prisma.posting.findUnique({ where: { id }, include: { departments: { select: { departmentId: true, matchedAlias: true } } } }),
    prisma.department.findMany({ orderBy: { name: "asc" }, select: { id: true, name: true, level: true } }),
  ]);
  if (!ilan) notFound();

  return (
    <>
      <AdminBaslik
        baslik="İlan düzenle"
        aciklama={`${ilan.sourceName} · ${ilan.isActive ? "yayında" : ilan.adminGizli ? "gizli" : "pasif"}`}
        sag={
          <div className="flex flex-wrap gap-1.5">
            <Link href={`/ilan/${ilan.id}/${slugify(ilan.title)}`} target="_blank" className="rounded-lg border border-primary/15 px-2.5 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50">
              Sitede gör
            </Link>
            <a href={ilan.sourceUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 rounded-lg border border-primary/15 px-2.5 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50">
              Kaynak <ExternalLink className="h-3 w-3" />
            </a>
            {ilan.adminGizli ? <AdminIlanIslem ilanId={ilan.id} islem="goster" etiket="Göster" /> : <AdminIlanIslem ilanId={ilan.id} islem="gizle" etiket="Gizle" />}
            {ilan.adminDuzenledi && ilan.sourceName !== "Kamu Yolu" && <AdminIlanIslem ilanId={ilan.id} islem="taramaya-birak" etiket="Düzeltmemi bırak, tarama güncellesin" />}
          </div>
        }
      />

      <AdminKart>
        <AdminIlanForm
          ilanId={ilan.id}
          bolumler={bolumler}
          baslangic={{
            title: ilan.title,
            institutionName: ilan.institutionName,
            institutionType: ilan.institutionType,
            applicationEnd: ilan.applicationEnd ? GUN.format(ilan.applicationEnd) : null,
            educationLevels: ilan.educationLevels,
            isDepartmentRestricted: ilan.isDepartmentRestricted,
            departmentIds: ilan.departments.map((d) => d.departmentId),
          }}
        />
      </AdminKart>

      {ilan.departmentRequirementRaw && (
        <AdminKart baslik="Kaynaktaki ham nitelik metni" aciklama="Tarama bölümleri bu metinden çıkarır. Eşleşmeyen bölüm varsa Eşleştirme sayfasından eş anlamlı ifade ekleyebilirsin.">
          <p className="max-h-80 overflow-y-auto whitespace-pre-line text-sm text-slate-700">{ilan.departmentRequirementRaw}</p>
        </AdminKart>
      )}
    </>
  );
}

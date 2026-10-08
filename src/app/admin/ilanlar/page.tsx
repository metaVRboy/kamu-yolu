import Link from "next/link";
import { ExternalLink, Plus } from "lucide-react";
import type { Prisma } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import { adminSayfasi } from "@/lib/admin";
import { AdminBaslik, AdminKart } from "@/components/admin/AdminUI";
import { AdminIlanIslem } from "@/components/admin/AdminIlanForm";
import { INSTITUTION_TYPE_LABEL } from "@/lib/labels";
import { cn } from "@/lib/utils";

export const metadata = { title: "İlanlar — Admin" };

const SAYFA_BOYU = 30;
const TARIH = new Intl.DateTimeFormat("tr-TR", { day: "numeric", month: "short", year: "numeric", timeZone: "Europe/Istanbul" });
const FILTRELER = [
  ["aktif", "Yayında"],
  ["eslesmeyen", "Bölüm eşleşmeyen"],
  ["duzenlenen", "Elle düzenlenen"],
  ["gizli", "Gizlenen"],
  ["pasif", "Süresi dolan"],
  ["hepsi", "Tümü"],
] as const;
type Filtre = (typeof FILTRELER)[number][0];

function filtreKosulu(f: Filtre): Prisma.PostingWhereInput {
  if (f === "aktif") return { isActive: true };
  // Bolum sarti var ama hicbir bolume baglanamadi: kullanicilar bu ilani bolum sayfasinda goremez.
  if (f === "eslesmeyen") return { isActive: true, isDepartmentRestricted: true, departments: { none: {} } };
  if (f === "duzenlenen") return { adminDuzenledi: true };
  if (f === "gizli") return { adminGizli: true };
  if (f === "pasif") return { isActive: false, adminGizli: false };
  return {};
}

export default async function AdminIlanlarPage({ searchParams }: { searchParams: Promise<{ q?: string; filtre?: string; sayfa?: string }> }) {
  await adminSayfasi();
  const p = await searchParams;
  const q = p.q?.trim() ?? "";
  const filtre = (FILTRELER.some(([k]) => k === p.filtre) ? p.filtre : "aktif") as Filtre;
  const sayfa = Math.max(1, Number(p.sayfa) || 1);

  const where: Prisma.PostingWhereInput = {
    isDemo: false,
    ...filtreKosulu(filtre),
    ...(q && { OR: [{ title: { contains: q, mode: "insensitive" } }, { institutionName: { contains: q, mode: "insensitive" } }] }),
  };
  const [toplam, ilanlar] = await Promise.all([
    prisma.posting.count({ where }),
    prisma.posting.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (sayfa - 1) * SAYFA_BOYU,
      take: SAYFA_BOYU,
      select: {
        id: true,
        title: true,
        institutionName: true,
        institutionType: true,
        sourceName: true,
        sourceUrl: true,
        applicationEnd: true,
        isActive: true,
        adminGizli: true,
        adminDuzenledi: true,
        isDepartmentRestricted: true,
        _count: { select: { departments: true } },
      },
    }),
  ]);
  const sayfaSayisi = Math.max(1, Math.ceil(toplam / SAYFA_BOYU));
  const url = (ek: Record<string, string | number>) => {
    const s = new URLSearchParams({ ...(q && { q }), filtre, sayfa: "1", ...Object.fromEntries(Object.entries(ek).map(([k, v]) => [k, String(v)])) });
    return `/admin/ilanlar?${s.toString()}`;
  };

  return (
    <>
      <AdminBaslik
        baslik="İlanlar"
        aciklama="Hatalı ilanı düzelt, gizle ya da taramanın kaçırdığı ilanı elle ekle. Düzelttiğin ilanı tarama bir daha ezmez; gizlediğin ilan tarama tekrar bulsa da gizli kalır."
        sag={
          <Link href="/admin/ilanlar/yeni" className="inline-flex items-center gap-1.5 rounded-full bg-primary px-4 py-2 text-sm font-bold text-primary-foreground">
            <Plus className="h-4 w-4" /> Elle ilan ekle
          </Link>
        }
      />

      <AdminKart>
        <form className="flex flex-wrap gap-2">
          <input type="hidden" name="filtre" value={filtre} />
          <input name="q" defaultValue={q} placeholder="Başlık ya da kurum ara" className="h-10 min-w-56 flex-1 rounded-xl border border-primary/20 bg-white px-3 text-sm" />
          <button type="submit" className="h-10 rounded-xl bg-primary px-4 text-sm font-semibold text-primary-foreground">
            Ara
          </button>
        </form>
        <div className="mt-3 flex flex-wrap gap-1.5">
          {FILTRELER.map(([k, ad]) => (
            <Link
              key={k}
              href={url({ filtre: k })}
              className={cn("rounded-full border px-3 py-1 text-xs font-semibold", filtre === k ? "border-primary bg-primary text-primary-foreground" : "border-primary/15 text-slate-600 hover:bg-slate-50")}
            >
              {ad}
            </Link>
          ))}
        </div>

        <p className="mt-4 text-xs font-semibold text-muted-foreground">{toplam.toLocaleString("tr-TR")} ilan</p>
        <ul className="mt-2 divide-y divide-primary/10">
          {ilanlar.map((i) => (
            <li key={i.id} className="flex flex-wrap items-center justify-between gap-3 py-3">
              <div className="min-w-0 flex-1">
                <Link href={`/admin/ilanlar/${i.id}`} className="text-sm font-semibold text-slate-900 hover:text-primary">
                  {i.title}
                </Link>
                <p className="mt-0.5 flex flex-wrap items-center gap-1.5 text-xs text-muted-foreground">
                  {i.institutionName} · {INSTITUTION_TYPE_LABEL[i.institutionType]} · {i.sourceName}
                  {i.applicationEnd && <> · son gün {TARIH.format(i.applicationEnd)}</>}
                  {i.isDepartmentRestricted && <> · {i._count.departments} bölüm</>}
                  {i.adminGizli && <span className="rounded-full bg-red-100 px-2 py-0.5 font-bold text-red-700">gizli</span>}
                  {!i.adminGizli && !i.isActive && <span className="rounded-full bg-slate-100 px-2 py-0.5 font-bold text-slate-600">pasif</span>}
                  {i.adminDuzenledi && <span className="rounded-full bg-amber-50 px-2 py-0.5 font-bold text-amber-700">elle düzenlendi</span>}
                  {i.isActive && i.isDepartmentRestricted && i._count.departments === 0 && <span className="rounded-full bg-orange-100 px-2 py-0.5 font-bold text-orange-700">bölüm eşleşmedi</span>}
                </p>
              </div>
              <div className="flex items-center gap-1.5">
                <a href={i.sourceUrl} target="_blank" rel="noopener noreferrer" aria-label="Kaynak" className="rounded-lg border border-primary/15 p-1.5 text-slate-500 hover:bg-slate-50">
                  <ExternalLink className="h-3.5 w-3.5" />
                </a>
                <Link href={`/admin/ilanlar/${i.id}`} className="rounded-lg border border-primary/15 px-2.5 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50">
                  Düzenle
                </Link>
                {i.adminGizli ? <AdminIlanIslem ilanId={i.id} islem="goster" etiket="Göster" /> : <AdminIlanIslem ilanId={i.id} islem="gizle" etiket="Gizle" />}
              </div>
            </li>
          ))}
          {ilanlar.length === 0 && <li className="py-6 text-center text-sm text-muted-foreground">Sonuç yok.</li>}
        </ul>

        {sayfaSayisi > 1 && (
          <div className="mt-4 flex items-center justify-between text-sm">
            {sayfa > 1 ? <Link href={url({ sayfa: sayfa - 1 })} className="font-semibold text-primary">← Önceki</Link> : <span />}
            <span className="text-muted-foreground">
              {sayfa} / {sayfaSayisi}
            </span>
            {sayfa < sayfaSayisi ? <Link href={url({ sayfa: sayfa + 1 })} className="font-semibold text-primary">Sonraki →</Link> : <span />}
          </div>
        )}
      </AdminKart>
    </>
  );
}

import Link from "next/link";
import type { Prisma } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import { adminSayfasi } from "@/lib/admin";
import { aktifProKosulu, proAktifMi } from "@/lib/sms";
import { AdminBaslik, AdminKart } from "@/components/admin/AdminUI";
import { cn } from "@/lib/utils";

export const metadata = { title: "Üyeler — Admin" };

const SAYFA_BOYU = 30;
const TARIH = new Intl.DateTimeFormat("tr-TR", { day: "numeric", month: "short", year: "numeric", timeZone: "Europe/Istanbul" });
const FILTRELER = [
  ["hepsi", "Tümü"],
  ["ucretli", "Aktif ücretli"],
  ["ucretsiz", "Ücretsiz"],
  ["askida", "Askıda"],
  ["admin", "Adminler"],
] as const;
type Filtre = (typeof FILTRELER)[number][0];

function filtreKosulu(f: Filtre): Prisma.UserWhereInput {
  if (f === "ucretli") return aktifProKosulu();
  if (f === "ucretsiz") return { NOT: aktifProKosulu() };
  if (f === "askida") return { askiyaAlindi: { not: null } };
  if (f === "admin") return { isAdmin: true };
  return {};
}

export default async function AdminUyelerPage({ searchParams }: { searchParams: Promise<{ q?: string; filtre?: string; sayfa?: string }> }) {
  await adminSayfasi();
  const p = await searchParams;
  const q = p.q?.trim() ?? "";
  const filtre = (FILTRELER.some(([k]) => k === p.filtre) ? p.filtre : "hepsi") as Filtre;
  const sayfa = Math.max(1, Number(p.sayfa) || 1);

  const where: Prisma.UserWhereInput = {
    ...filtreKosulu(filtre),
    ...(q && { OR: [{ email: { contains: q, mode: "insensitive" } }, { adSoyad: { contains: q, mode: "insensitive" } }] }),
  };
  const [toplam, uyeler, talepDagilimi, kaynakDagilimi] = await Promise.all([
    prisma.user.count({ where }),
    prisma.user.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (sayfa - 1) * SAYFA_BOYU,
      take: SAYFA_BOYU,
      select: { id: true, adSoyad: true, email: true, abonelikPlani: true, abonelikBitis: true, isAdmin: true, askiyaAlindi: true, createdAt: true },
    }),
    // "Acilinca haber ver" talepleri: odeme acilinca e-posta listesi + hangi plana/butona ilgi var.
    prisma.yukseltmeTalebi.groupBy({ by: ["plan", "yillik"], _count: { _all: true } }),
    prisma.yukseltmeTalebi.groupBy({ by: ["kaynak"], _count: { _all: true }, orderBy: { _count: { kaynak: "desc" } } }),
  ]);
  const toplamTalep = talepDagilimi.reduce((t, d) => t + d._count._all, 0);
  const sayfaSayisi = Math.max(1, Math.ceil(toplam / SAYFA_BOYU));
  const url = (ek: Record<string, string | number>) => {
    const s = new URLSearchParams({ ...(q && { q }), filtre, sayfa: "1", ...Object.fromEntries(Object.entries(ek).map(([k, v]) => [k, String(v)])) });
    return `/admin/uyeler?${s.toString()}`;
  };

  return (
    <>
      <AdminBaslik baslik="Üyeler" aciklama="Üye ara, plan ver, askıya al, oturumlarını kapat. Ödeme altyapısı gelene kadar Pro / Pro+ buradan elle verilir." />

      <AdminKart baslik={`Yükseltme talepleri (açılınca haber ver) · ${toplamTalep}`}>
        <div className="flex flex-wrap gap-2 text-xs">
          {talepDagilimi.map((d) => (
            <span key={`${d.plan}-${d.yillik}`} className="rounded-full bg-primary/10 px-2.5 py-1 font-semibold text-primary">
              {d.plan === "PRO_PLUS" ? "Pro+" : "Pro"} · {d.yillik ? "yıllık" : "aylık"}: {d._count._all}
            </span>
          ))}
          {toplamTalep === 0 && <span className="text-muted-foreground">Henüz talep yok.</span>}
        </div>
        {kaynakDagilimi.length > 0 && (
          <p className="mt-2 text-xs text-muted-foreground">Geldiği yer: {kaynakDagilimi.map((k) => `${k.kaynak} (${k._count._all})`).join(", ")}</p>
        )}
      </AdminKart>

      <AdminKart>
        <form className="flex flex-wrap gap-2">
          <input type="hidden" name="filtre" value={filtre} />
          <input name="q" defaultValue={q} placeholder="E-posta ya da ad soyad ara" className="h-10 min-w-56 flex-1 rounded-xl border border-primary/20 bg-white px-3 text-sm" />
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

        <p className="mt-4 text-xs font-semibold text-muted-foreground">{toplam.toLocaleString("tr-TR")} üye</p>
        <ul className="mt-2 divide-y divide-primary/10">
          {uyeler.map((u) => {
            const ucretli = proAktifMi(u);
            return (
              <li key={u.id}>
                <Link href={`/admin/uyeler/${u.id}`} className="flex flex-wrap items-center justify-between gap-3 rounded-xl px-2 py-3 hover:bg-slate-50">
                  <span className="min-w-0">
                    <span className="flex flex-wrap items-center gap-1.5 text-sm font-semibold text-slate-900">
                      {u.adSoyad}
                      {ucretli && <span className="rounded-full bg-violet-100 px-2 py-0.5 text-[11px] font-bold text-violet-700">{u.abonelikPlani === "PRO_PLUS" ? "Pro+" : "Pro"}</span>}
                      {!ucretli && u.abonelikPlani !== "UCRETSIZ" && <span className="rounded-full bg-amber-50 px-2 py-0.5 text-[11px] font-bold text-amber-700">süresi doldu</span>}
                      {u.isAdmin && <span className="rounded-full bg-slate-900 px-2 py-0.5 text-[11px] font-bold text-white">admin</span>}
                      {u.askiyaAlindi && <span className="rounded-full bg-red-100 px-2 py-0.5 text-[11px] font-bold text-red-700">askıda</span>}
                    </span>
                    <span className="block truncate text-xs text-muted-foreground">{u.email}</span>
                  </span>
                  <span className="text-xs text-muted-foreground">{TARIH.format(u.createdAt)}</span>
                </Link>
              </li>
            );
          })}
          {uyeler.length === 0 && <li className="py-6 text-center text-sm text-muted-foreground">Sonuç yok.</li>}
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

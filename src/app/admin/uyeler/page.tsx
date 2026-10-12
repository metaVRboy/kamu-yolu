import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { adminSayfasi } from "@/lib/admin";
import { UYE_FILTRELERI, uyeFiltresiMi, uyeKosulu, uyeRozetleri } from "@/lib/adminUye";
import { AdminBaslik, AdminKart } from "@/components/admin/AdminUI";
import { AdminUyeListesi } from "@/components/admin/AdminUyeListesi";
import { cn } from "@/lib/utils";

export const metadata = { title: "Üyeler — Admin" };

const SAYFA_BOYU = 30;
const TARIH = new Intl.DateTimeFormat("tr-TR", { day: "numeric", month: "short", year: "numeric", timeZone: "Europe/Istanbul" });

export default async function AdminUyelerPage({ searchParams }: { searchParams: Promise<{ q?: string; filtre?: string; sayfa?: string }> }) {
  await adminSayfasi();
  const p = await searchParams;
  const q = p.q?.trim() ?? "";
  const filtre = uyeFiltresiMi(p.filtre) ? p.filtre : "hepsi";
  const sayfa = Math.max(1, Number(p.sayfa) || 1);

  const where = uyeKosulu(filtre, q);
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
          {UYE_FILTRELERI.map(([k, ad]) => (
            <Link
              key={k}
              href={url({ filtre: k })}
              className={cn("rounded-full border px-3 py-1 text-xs font-semibold", filtre === k ? "border-primary bg-primary text-primary-foreground" : "border-primary/15 text-slate-600 hover:bg-slate-50")}
            >
              {ad}
            </Link>
          ))}
        </div>

        {/* key: filtre/arama degisince secim sifirlansin ("filtredeki tumu" baska kumeye uygulanmasin). */}
        <AdminUyeListesi
          key={`${filtre}|${q}`}
          toplam={toplam}
          filtre={filtre}
          q={q}
          uyeler={uyeler.map((u) => ({ id: u.id, adSoyad: u.adSoyad, email: u.email, rozetler: uyeRozetleri(u), sag: TARIH.format(u.createdAt) }))}
        />

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

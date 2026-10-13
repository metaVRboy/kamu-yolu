import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { adminSayfasi } from "@/lib/admin";
import { UYE_FILTRELERI, uyeFiltresiMi, uyeKosulu, uyeRozetleri } from "@/lib/adminUye";
import { AdminBaslik, AdminKart } from "@/components/admin/AdminUI";
import { AdminUyeListesi } from "@/components/admin/AdminUyeListesi";
import { cn } from "@/lib/utils";

export const metadata = { title: "Üyeler — Admin" };

const SAYFA_BOYU = 30;
const OLCUM_GUN = 14;

/**
 * Reklam kampanyasi olcumu: gun gun yeni uye, tanitim penceresi gosterimi ve yeni bekleme listesi
 * talebi (Istanbul gunu); kayit kaynagina (utm_source, yoksa dis referrer) gore uye ve talep sayisi.
 */
async function kampanyaOlcumu() {
  const baslangic = new Date(Date.now() - OLCUM_GUN * 86_400_000);
  const [gunluk, gosterimler, kaynaklar] = await Promise.all([
    prisma.$queryRaw<{ gun: string; uye: bigint; talep: bigint }[]>`
      select to_char(g.gun, 'YYYY-MM-DD') as gun,
        (select count(*) from "User" u where (u."createdAt" at time zone 'UTC' at time zone 'Europe/Istanbul')::date = g.gun) as uye,
        (select count(*) from "YukseltmeTalebi" t where (t.olusturma at time zone 'UTC' at time zone 'Europe/Istanbul')::date = g.gun) as talep
      from generate_series((now() at time zone 'Europe/Istanbul')::date - ${OLCUM_GUN - 1}::int, (now() at time zone 'Europe/Istanbul')::date, interval '1 day') as g(gun)
      order by g.gun desc`,
    prisma.gunlukSayac.findMany({ where: { anahtar: "tanitim-gosterim", gun: { gte: baslangic } }, select: { gun: true, adet: true } }),
    prisma.$queryRaw<{ kaynak: string; uye: bigint; talep: bigint }[]>`
      select coalesce(u.kaynak->>'utm_source', u.kaynak->>'ref') as kaynak, count(*) as uye, count(t.id) as talep
      from "User" u left join "YukseltmeTalebi" t on t."userId" = u.id
      where u.kaynak is not null and u."createdAt" >= ${baslangic}
      group by 1 order by 2 desc limit 15`,
  ]);
  const gosterim = new Map(gosterimler.map((g) => [g.gun.toISOString().slice(0, 10), g.adet]));
  return {
    gunler: gunluk.map((g) => ({ gun: g.gun, uye: Number(g.uye), talep: Number(g.talep), gosterim: gosterim.get(g.gun) ?? 0 })),
    kaynaklar: kaynaklar.map((k) => ({ kaynak: k.kaynak ?? "(bilinmiyor)", uye: Number(k.uye), talep: Number(k.talep) })),
  };
}
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
  const olcum = await kampanyaOlcumu();
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
        <div className="mt-3 flex flex-wrap gap-3 text-xs font-semibold">
          <Link href={url({ filtre: "talep" })} className="text-primary hover:underline">
            Listedekileri gör
          </Link>
          {/* Duz <a>: dosya indirme (Link istemci gezinmesi yapmasin). */}
          <a href="/api/admin/bekleme-listesi" className="text-primary hover:underline">
            CSV indir
          </a>
        </div>
      </AdminKart>

      <AdminKart baslik="Kampanya ölçümü · son 14 gün">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs tabular-nums">
            <thead className="text-muted-foreground">
              <tr>
                <th className="py-1 pr-3 font-semibold">Gün</th>
                <th className="py-1 pr-3 font-semibold">Yeni üye</th>
                <th className="py-1 pr-3 font-semibold">Tanıtım gösterimi</th>
                <th className="py-1 pr-3 font-semibold">Yeni talep</th>
              </tr>
            </thead>
            <tbody>
              {olcum.gunler.map((g) => (
                <tr key={g.gun} className="border-t border-slate-100">
                  <td className="py-1 pr-3">{g.gun}</td>
                  <td className="py-1 pr-3">{g.uye}</td>
                  <td className="py-1 pr-3">{g.gosterim}</td>
                  <td className="py-1 pr-3">{g.talep}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="mt-3 text-xs text-muted-foreground">
          Üyelerin kaynağı (utm_source / dış site, son 14 gün):{" "}
          {olcum.kaynaklar.length ? olcum.kaynaklar.map((k) => `${k.kaynak} (${k.uye} üye, ${k.talep} talep)`).join(", ") : "henüz kaynaklı kayıt yok"}
        </p>
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

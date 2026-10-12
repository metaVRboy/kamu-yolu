import Link from "next/link";
import { Crown, Hourglass, Infinity as Sonsuz } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { adminSayfasi } from "@/lib/admin";
import { uyeKosulu, uyeRozetleri } from "@/lib/adminUye";
import { kalanGunSayisi } from "@/lib/ilanVitrin";
import { AdminBaslik, AdminKart, IstatistikKutusu } from "@/components/admin/AdminUI";
import { AdminUyeListesi } from "@/components/admin/AdminUyeListesi";

export const metadata = { title: "Pro+ aboneleri — Admin" };

const SAYFA_BOYU = 30;
const TARIH = new Intl.DateTimeFormat("tr-TR", { day: "numeric", month: "short", year: "numeric", timeZone: "Europe/Istanbul" });

/** Aktif Pro+ aboneleri: bitisi en yakin olan ustte (suresizler en sonda). */
export default async function AdminProPlusPage({ searchParams }: { searchParams: Promise<{ q?: string; sayfa?: string }> }) {
  await adminSayfasi();
  const p = await searchParams;
  const q = p.q?.trim() ?? "";
  const sayfa = Math.max(1, Number(p.sayfa) || 1);
  const where = uyeKosulu("proplus", q);
  const yediGun = new Date(Date.now() + 7 * 86_400_000);

  const [toplam, yakindaBitecek, suresiz, uyeler] = await Promise.all([
    prisma.user.count({ where }),
    prisma.user.count({ where: { AND: [where, { abonelikBitis: { lte: yediGun } }] } }),
    prisma.user.count({ where: { AND: [where, { abonelikBitis: null }] } }),
    prisma.user.findMany({
      where,
      orderBy: [{ abonelikBitis: { sort: "asc", nulls: "last" } }, { createdAt: "desc" }],
      skip: (sayfa - 1) * SAYFA_BOYU,
      take: SAYFA_BOYU,
      select: { id: true, adSoyad: true, email: true, abonelikPlani: true, abonelikBitis: true, isAdmin: true, askiyaAlindi: true },
    }),
  ]);
  const sayfaSayisi = Math.max(1, Math.ceil(toplam / SAYFA_BOYU));
  const url = (s: number) => `/admin/uyeler/pro-plus?${new URLSearchParams({ ...(q && { q }), sayfa: String(s) })}`;

  return (
    <>
      <AdminBaslik baslik="Pro+ aboneleri" aciklama="Aktif Pro+ üyeler; aboneliği en yakın bitecek olan en üstte. Seçip toplu süre uzatabilir ya da bildirim gönderebilirsin." />

      <div className="grid gap-3 sm:grid-cols-3">
        <IstatistikKutusu ikon={Crown} etiket="Aktif Pro+" deger={toplam} />
        <IstatistikKutusu ikon={Hourglass} etiket="7 gün içinde bitecek" deger={yakindaBitecek} uyari={yakindaBitecek > 0} />
        <IstatistikKutusu ikon={Sonsuz} etiket="Süresiz" deger={suresiz} />
      </div>

      <AdminKart>
        <form className="flex flex-wrap gap-2">
          <input name="q" defaultValue={q} placeholder="E-posta ya da ad soyad ara" className="h-10 min-w-56 flex-1 rounded-xl border border-primary/20 bg-white px-3 text-sm" />
          <button type="submit" className="h-10 rounded-xl bg-primary px-4 text-sm font-semibold text-primary-foreground">
            Ara
          </button>
        </form>

        <AdminUyeListesi
          key={q}
          toplam={toplam}
          filtre="proplus"
          q={q}
          uyeler={uyeler.map((u) => {
            const kalan = kalanGunSayisi(u.abonelikBitis);
            return {
              id: u.id,
              adSoyad: u.adSoyad,
              email: u.email,
              rozetler: [
                ...uyeRozetleri(u).filter((r) => r.ad !== "Pro+"),
                ...(kalan !== null && kalan <= 7 ? [{ ad: `${kalan} gün kaldı`, renk: "bg-red-50 text-red-700" }] : []),
              ],
              sag: u.abonelikBitis ? `bitiş ${TARIH.format(u.abonelikBitis)} · ${kalan} gün` : "süresiz",
            };
          })}
        />

        {sayfaSayisi > 1 && (
          <div className="mt-4 flex items-center justify-between text-sm">
            {sayfa > 1 ? <Link href={url(sayfa - 1)} className="font-semibold text-primary">← Önceki</Link> : <span />}
            <span className="text-muted-foreground">
              {sayfa} / {sayfaSayisi}
            </span>
            {sayfa < sayfaSayisi ? <Link href={url(sayfa + 1)} className="font-semibold text-primary">Sonraki →</Link> : <span />}
          </div>
        )}
      </AdminKart>
    </>
  );
}

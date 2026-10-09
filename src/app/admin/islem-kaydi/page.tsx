import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { adminSayfasi } from "@/lib/admin";
import { ISLEM_ADI } from "@/lib/islemKaydi";
import { AdminBaslik, AdminKart } from "@/components/admin/AdminUI";
import { cn } from "@/lib/utils";

export const metadata = { title: "İşlem kaydı — Admin" };

const SAYFA_BOYU = 50;
const TARIH = new Intl.DateTimeFormat("tr-TR", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit", timeZone: "Europe/Istanbul" });
const KATEGORILER = [
  ["", "Tümü"],
  ["uye", "Üyeler"],
  ["ilan", "İlanlar"],
  ["eslestirme", "Eşleştirme"],
  ["haber", "Haberler"],
  ["bildirim", "Bildirimler"],
  ["fiyat", "Fiyat"],
  ["kampanya", "Kampanya"],
  ["becayis", "Becayiş"],
  ["kpss", "KPSS"],
  ["destek", "Destek"],
  ["tarama", "Tarama"],
  ["ayar", "Ayarlar"],
] as const;

export default async function AdminIslemKaydiPage({ searchParams }: { searchParams: Promise<{ tur?: string; sayfa?: string }> }) {
  await adminSayfasi();
  const p = await searchParams;
  const tur = KATEGORILER.some(([k]) => k === p.tur) ? p.tur! : "";
  const sayfa = Math.max(1, Number(p.sayfa) || 1);
  const where = tur ? { islem: { startsWith: `${tur}.` } } : {};
  const [toplam, kayitlar] = await Promise.all([
    prisma.adminIslem.count({ where }),
    prisma.adminIslem.findMany({ where, orderBy: { createdAt: "desc" }, skip: (sayfa - 1) * SAYFA_BOYU, take: SAYFA_BOYU }),
  ]);
  const sayfaSayisi = Math.max(1, Math.ceil(toplam / SAYFA_BOYU));
  const url = (t: string, s = 1) => `/admin/islem-kaydi?${new URLSearchParams({ ...(t && { tur: t }), sayfa: String(s) })}`;

  return (
    <>
      <AdminBaslik baslik="İşlem kaydı" aciklama="Admin panelinde yapılan her değişiklik: kim, ne zaman, ne yaptı." />
      <AdminKart>
        <div className="flex flex-wrap gap-1.5">
          {KATEGORILER.map(([k, ad]) => (
            <Link
              key={k}
              href={url(k)}
              className={cn("rounded-full border px-3 py-1 text-xs font-semibold", tur === k ? "border-primary bg-primary text-primary-foreground" : "border-primary/15 text-slate-600 hover:bg-slate-50")}
            >
              {ad}
            </Link>
          ))}
        </div>
        <ul className="mt-4 divide-y divide-primary/10">
          {kayitlar.map((k) => (
            <li key={k.id} className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1 py-2.5 text-sm">
              <span className="min-w-0">
                <span className="font-semibold text-slate-900">{k.adminAdi}</span>{" "}
                <span className="text-slate-700">{ISLEM_ADI[k.islem as keyof typeof ISLEM_ADI] ?? k.islem}</span>
                {k.hedef && (
                  <>
                    {" · "}
                    {k.link ? (
                      <Link href={k.link} className="text-primary hover:underline">
                        {k.hedef}
                      </Link>
                    ) : (
                      <span className="text-muted-foreground">{k.hedef}</span>
                    )}
                  </>
                )}
              </span>
              <span className="shrink-0 text-xs text-muted-foreground">{TARIH.format(k.createdAt)}</span>
            </li>
          ))}
          {kayitlar.length === 0 && <li className="py-6 text-center text-sm text-muted-foreground">Kayıt yok.</li>}
        </ul>
        {sayfaSayisi > 1 && (
          <div className="mt-4 flex items-center justify-between text-sm">
            {sayfa > 1 ? <Link href={url(tur, sayfa - 1)} className="font-semibold text-primary">← Önceki</Link> : <span />}
            <span className="text-muted-foreground">
              {sayfa} / {sayfaSayisi}
            </span>
            {sayfa < sayfaSayisi ? <Link href={url(tur, sayfa + 1)} className="font-semibold text-primary">Sonraki →</Link> : <span />}
          </div>
        )}
      </AdminKart>
    </>
  );
}

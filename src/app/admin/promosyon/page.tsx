import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { adminSayfasi } from "@/lib/admin";
import { PLAN_ADI, indirimEtiketi } from "@/lib/planlar";
import { AdminBaslik, AdminKart } from "@/components/admin/AdminUI";
import { AdminPromosyonPanel } from "@/components/admin/AdminPromosyonPanel";

export const metadata = { title: "Promosyon kodları — Admin" };

const TARIH = new Intl.DateTimeFormat("tr-TR", { day: "numeric", month: "short", year: "numeric", timeZone: "Europe/Istanbul" });

/** Kod durumu sunucu saatiyle. */
function durumu(k: { aktif: boolean; bitis: Date | null; limit: number | null; kullanim: number }, simdi = Date.now()) {
  if ((k.bitis && k.bitis.getTime() <= simdi) || (k.limit != null && k.kullanim >= k.limit)) return "bitti" as const;
  return k.aktif ? ("aktif" as const) : ("durduruldu" as const);
}

export default async function AdminPromosyonPage() {
  await adminSayfasi();
  const [kodlar, kuponlar] = await Promise.all([
    prisma.promosyonKodu.findMany({ orderBy: { olusturma: "desc" }, take: 100 }),
    prisma.kampanya.findMany({ where: { kuponKodu: { not: null } }, orderBy: { olusturma: "desc" }, take: 50 }),
  ]);

  return (
    <>
      <AdminBaslik
        baslik="Promosyon kodları"
        aciklama="Üye kodu Aboneliğim sayfasına yazınca seçtiğin plan belirlediğin gün kadar açılır. Ödeme altyapısı gerekmez; reklam ve iş birliği kampanyalarında hemen kullanılabilir."
      />
      <AdminPromosyonPanel
        kodlar={kodlar.map((k) => ({
          id: k.id,
          kod: k.kod,
          ozet: `${PLAN_ADI[k.plan]} · ${k.gun} gün`,
          kullanim: k.limit ? `${k.kullanim} / ${k.limit}` : `${k.kullanim} / sınırsız`,
          sonTarih: k.bitis ? TARIH.format(k.bitis) : "süresiz",
          aktif: k.aktif,
          durum: durumu(k),
        }))}
      />
      <AdminKart baslik="İndirim kuponları" aciklama="Yüzde/tutar indirim veren kuponlar ödeme altyapısı gelince kullanılacak. Kampanya formunda kupon kodu girerek oluşturulur.">
        <ul className="divide-y divide-primary/10">
          {kuponlar.length === 0 && <li className="py-4 text-sm text-muted-foreground">Henüz indirim kuponu yok.</li>}
          {kuponlar.map((k) => (
            <li key={k.id} className="flex flex-wrap items-center gap-2 py-2.5 text-sm">
              <code className="rounded bg-slate-100 px-1.5 py-0.5 text-xs text-slate-700">{k.kuponKodu}</code>
              <span className="font-semibold text-slate-900">{k.ad}</span>
              <span className="rounded-full bg-rose-100 px-2 py-0.5 text-[11px] font-bold text-rose-700">{indirimEtiketi(k)}</span>
              <span className="text-xs text-muted-foreground">{TARIH.format(k.bitis)} bitiyor{!k.aktif && " · durduruldu"}</span>
            </li>
          ))}
        </ul>
        <Link href="/admin/fiyatlar" className="mt-3 inline-flex text-sm font-semibold text-primary hover:underline">
          Yeni indirim kuponu → Fiyat ve kampanyalar
        </Link>
      </AdminKart>
    </>
  );
}

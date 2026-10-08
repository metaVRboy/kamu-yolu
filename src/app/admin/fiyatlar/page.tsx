import { prisma } from "@/lib/prisma";
import { adminSayfasi } from "@/lib/admin";
import { getFiyatlar } from "@/lib/fiyatlar";
import { UCRETLI_PLANLAR, VARSAYILAN_FIYAT, indirimEtiketi, type UcretliPlan } from "@/lib/planlar";
import { AdminBaslik } from "@/components/admin/AdminUI";
import { AdminFiyatPanel, type KampanyaKaydi } from "@/components/admin/AdminFiyatPanel";

export const metadata = { title: "Fiyat ve kampanyalar — Admin" };

const TARIH = new Intl.DateTimeFormat("tr-TR", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit", timeZone: "Europe/Istanbul" });

/** Kampanya durumu sunucu saatiyle. */
function durumu(k: { aktif: boolean; kuponKodu: string | null; baslangic: Date; bitis: Date }, simdi = Date.now()): KampanyaKaydi["durum"] {
  if (k.bitis.getTime() <= simdi) return "bitti";
  if (!k.aktif) return "durduruldu";
  if (k.baslangic.getTime() > simdi) return "planlandi";
  return k.kuponKodu ? "kuponlu" : "aktif";
}

export default async function AdminFiyatlarPage() {
  await adminSayfasi();
  const [kayitlar, kampanyalar, { tablo, kampanya }] = await Promise.all([
    prisma.planFiyat.findMany(),
    prisma.kampanya.findMany({ orderBy: { olusturma: "desc" }, take: 50 }),
    getFiyatlar(),
  ]);
  const liste = Object.fromEntries(
    UCRETLI_PLANLAR.map((p) => {
      const k = kayitlar.find((r) => r.plan === p);
      return [p, { aylik: k?.aylik ?? VARSAYILAN_FIYAT[p].aylik, yillik: k?.yillik ?? VARSAYILAN_FIYAT[p].yillik }];
    }),
  ) as Record<UcretliPlan, { aylik: number; yillik: number }>;

  return (
    <>
      <AdminBaslik
        baslik="Fiyat ve kampanyalar"
        aciklama="Liste fiyatları sitenin her yerinde (plan kartları, yükseltme penceresi, sözleşmeler) anında güncellenir. Kuponsuz kampanyalar tarih aralığında sitede otomatik uygulanır; kuponlu olanlar ödeme altyapısı gelince kodla kullanılacak."
      />
      <AdminFiyatPanel
        liste={liste}
        sitedeki={tablo}
        aktifKampanya={kampanya?.ad ?? null}
        kampanyalar={kampanyalar.map((k) => ({
          id: k.id,
          ad: k.ad,
          indirim: indirimEtiketi(k),
          kapsam: `${k.planlar.map((p) => (p === "PRO" ? "Pro" : "Pro+")).join(", ")} · ${[k.aylik && "aylık", k.yillik && "yıllık"].filter(Boolean).join(" + ")}`,
          aralik: `${TARIH.format(k.baslangic)} → ${TARIH.format(k.bitis)}`,
          kuponKodu: k.kuponKodu,
          aktif: k.aktif,
          durum: durumu(k),
        }))}
      />
    </>
  );
}

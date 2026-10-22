import { getYayindakiHaberler } from "@/lib/haberler";
import { Newspaper } from "lucide-react";
import { HaberlerSection } from "@/components/HaberlerSection";
import { SayfaBasligi } from "@/components/SayfaBasligi";
import { sonGunlerdeYayinlanan } from "@/lib/haberYayin";

export const revalidate = 300;

// Haberler: kaynakli, yapay zeka destekli ozetler (her biri kaynagina baglanir; detaylar noindex).
export const metadata = {
  title: "Haberler — Kamu Yolu",
  description: "Kamu personel alımları, toplu alım duyuruları ve gündemdeki gelişmeler; her haber kaynağına bağlantılı.",
};

export default async function HaberlerPage() {
  const haberler = await getYayindakiHaberler();
  const buHafta = sonGunlerdeYayinlanan(haberler);

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <SayfaBasligi
        ikon={Newspaper}
        breadcrumb={[{ ad: "Ana Sayfa", href: "/" }, { ad: "Haberler" }]}
        baslik="Haberler"
        aciklama="Kamu personel alımları, toplu alım duyuruları ve gündemdeki gelişmeler. Haberler yapay zekâ desteğiyle özetlenir ve kaynağına bağlantı verir; resmî metin esastır. Başvuru süresi dolan haberler listeden otomatik kalkar."
        cipler={[
          { etiket: `${haberler.length} güncel haber` },
          ...(buHafta > 0 ? [{ etiket: `${buHafta} haber bu hafta eklendi`, durum: "vurgu" as const }] : []),
        ]}
        mobilBaslik="Haberler"
      />

      <HaberlerSection
        basliksiz
        haberler={haberler.map((h) => ({ ...h, yayinTarihi: h.yayinTarihi.toISOString() }))}
        showAllLink={false}
      />
    </div>
  );
}

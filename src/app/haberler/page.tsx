import { getYayindakiHaberler } from "@/lib/haberler";
import { Newspaper } from "lucide-react";
import { HaberlerSection } from "@/components/HaberlerSection";
import { SayfaBasligi } from "@/components/SayfaBasligi";
import { sonGunlerdeYayinlanan } from "@/lib/haberYayin";

export const revalidate = 300;

// "Duyurular": kamu alim duyurularinin kaynakli ozetleri; haber sitesi (5187) olarak konumlanmaz.
export const metadata = {
  title: "Kamu Alım Duyuruları — Kamu Yolu",
  description: "Kamu personel alımları ve toplu alım duyurularının kaynağına bağlantılı kısa özetleri.",
};

export default async function HaberlerPage() {
  const haberler = await getYayindakiHaberler();
  const buHafta = sonGunlerdeYayinlanan(haberler);

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <SayfaBasligi
        ikon={Newspaper}
        breadcrumb={[{ ad: "Ana Sayfa", href: "/" }, { ad: "Duyurular" }]}
        baslik="Kamu Alım Duyuruları"
        aciklama="Kamu personel alımı duyurularının yapay zekâ desteğiyle hazırlanmış kısa özetleri; her özet kaynağına bağlantı verir, resmî metin esastır. Başvuru süresi dolanlar listeden otomatik kalkar."
        cipler={[
          { etiket: `${haberler.length} güncel duyuru` },
          ...(buHafta > 0 ? [{ etiket: `${buHafta} duyuru bu hafta eklendi`, durum: "vurgu" as const }] : []),
        ]}
        mobilBaslik="Duyurular"
      />

      <HaberlerSection
        basliksiz
        haberler={haberler.map((h) => ({ ...h, yayinTarihi: h.yayinTarihi.toISOString() }))}
        showAllLink={false}
      />
    </div>
  );
}

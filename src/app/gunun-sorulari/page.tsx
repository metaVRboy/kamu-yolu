import { Flame, Gift, ListChecks } from "lucide-react";
import { getCurrentUser } from "@/lib/auth";
import { SayfaBasligi } from "@/components/SayfaBasligi";
import { GunlukSorular } from "@/components/GunlukSorular";
import { SERI_HEDIYE_GUN } from "@/lib/gunlukSorular";

export const metadata = {
  title: "Günün 5 KPSS Sorusu — Kamu Yolu",
  description: "Her gün Türkçe, Matematik, Tarih, Coğrafya ve Vatandaşlıktan birer KPSS sorusu. Çöz, cevabını ve açıklamasını hemen gör, serini büyüt.",
  alternates: { canonical: "/gunun-sorulari" },
};

export default async function GununSorulariPage() {
  const user = await getCurrentUser();
  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
      <SayfaBasligi
        ikon={Flame}
        breadcrumb={[{ ad: "Ana Sayfa", href: "/" }, { ad: "Günün Soruları" }]}
        baslik="Günün 5 Sorusu"
        aciklama="Her gün her dersten bir KPSS sorusu. Çöz, doğru cevabı ve açıklamasını hemen gör; her gün çözerek serini büyüt."
        cipler={[
          { etiket: "5 soru", ikon: ListChecks },
          { etiket: `${SERI_HEDIYE_GUN} gün seri = 1 gün Pro`, ikon: Gift, durum: "vurgu" },
        ]}
      />
      <GunlukSorular girisli={!!user} />
    </div>
  );
}

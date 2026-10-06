import { Calculator } from "lucide-react";
import { KpssCalculator } from "@/components/KpssCalculator";
import { SayfaBasligi } from "@/components/SayfaBasligi";

export const metadata = {
  title: "KPSS Puan Hesaplama Aracı — Kamu Yolu",
  description: "Puan türünü seç, doğru/yanlış sayılarını gir, netini hesapla.",
};

export default function KpssPuanHesaplamaPage() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-14 sm:px-6 sm:py-20">
      <SayfaBasligi
        ikon={Calculator}
        breadcrumb={[{ ad: "Ana Sayfa", href: "/" }, { ad: "KPSS Puan Hesaplama" }]}
        baslik="KPSS Puan Hesaplama Aracı"
        aciklama={
          <>
            <span className="text-destructive">*</span> Doldurulması zorunlu alanlar. Yanlış sayılarını boş bırakıp, doğru
            sayısı kutucuklarına netleri yazarak da hesaplama yapabilirsiniz.
          </>
        }
        cipler={[{ etiket: "5 sınav türü" }, { etiket: "4 yanlış 1 doğruyu götürür" }, { etiket: "Ücretsiz" }]}
      />

      <div className="mt-6">
        <KpssCalculator />
      </div>
    </div>
  );
}

import { Info } from "lucide-react";
import { KpssNetCalculator } from "@/components/KpssNetCalculator";

export const metadata = {
  title: "KPSS Net Hesaplama — Kamu Yolu",
  description: "Ders bazlı doğru/yanlış sayına göre KPSS netini hesapla.",
};

export default function KpssNetHesaplamaPage() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-14 sm:px-6 sm:py-20">
      <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
        KPSS Net Hesaplama
      </h1>
      <p className="mt-2 text-sm text-slate-600">
        Her ders için doğru ve yanlış sayını gir; net otomatik hesaplanır
        (doğru − yanlış/4).
      </p>

      <div className="mt-4 flex items-start gap-2 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
        <Info className="mt-0.5 h-4 w-4 shrink-0" />
        <p>
          Bu araç sadece net hesaplar. Kesin KPSS puanı, ÖSYM&apos;nin o
          döneme özel istatistiksel standart puan yöntemine (T puanı) göre
          belirlenir ve ancak resmi sonuç açıklamasıyla netleşir — bu yüzden
          burada bir puan tahmini göstermiyoruz.
        </p>
      </div>

      <div className="mt-8">
        <KpssNetCalculator />
      </div>
    </div>
  );
}

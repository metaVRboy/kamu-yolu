import { KpssCalculator } from "@/components/KpssCalculator";

export const metadata = {
  title: "KPSS Puan Hesaplama Aracı — Kamu Yolu",
  description: "Puan türünü seç, doğru/yanlış sayılarını gir, netini hesapla.",
};

export default function KpssPuanHesaplamaPage() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-14 sm:px-6 sm:py-20">
      <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
        KPSS Puan Hesaplama Aracı
      </h1>
      <p className="mt-2 text-sm text-slate-600">
        <span className="text-destructive">*</span> Doldurulması zorunlu
        alanlar. Yanlış sayılarını boş bırakıp, doğru sayısı kutucuklarına
        netleri yazarak da hesaplama yapabilirsiniz.
      </p>

      <div className="mt-6">
        <KpssCalculator />
      </div>
    </div>
  );
}

import { Suspense } from "react";
import { BarChart3, Landmark } from "lucide-react";
import { getBolumAnaliz, getVeriAraligi } from "@/lib/analiz";
import { getResmiIstihdamSerisi } from "@/lib/resmiIstihdamIstatistikleri";
import { AnalizFiltre } from "@/components/AnalizFiltre";
import { ResmiIstihdamGrafik } from "@/components/ResmiIstihdamGrafik";

export const metadata = { title: "Bölüm Bazlı Alım Analizi — Kamu Yolu" };

function gun(d: Date) {
  return d.toISOString().slice(0, 10);
}

function turkceTarih(d: Date) {
  return d.toLocaleDateString("tr-TR", { day: "numeric", month: "long", year: "numeric" });
}

export default async function AnalizPage({
  searchParams,
}: {
  searchParams: Promise<{ baslangic?: string; bitis?: string; sirala?: string }>;
}) {
  const { baslangic, bitis, sirala } = await searchParams;
  const { ilk, son } = await getVeriAraligi();

  const satirlar = await getBolumAnaliz({
    baslangic: baslangic ? new Date(baslangic) : undefined,
    bitis: bitis ? new Date(`${bitis}T23:59:59`) : undefined,
  });

  const siraliSatirlar = [...satirlar].sort((a, b) =>
    sirala === "az" ? a.ilanSayisi - b.ilanSayisi : b.ilanSayisi - a.ilanSayisi,
  );

  const toplamIlan = satirlar.reduce((t, s) => t + s.ilanSayisi, 0);
  const toplamKontenjan = satirlar.reduce((t, s) => t + s.tahminiKontenjan, 0);

  const resmiSeri = getResmiIstihdamSerisi();

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6">
      <div className="rounded-2xl border border-primary/20 bg-white p-4">
        <div className="flex items-center gap-2">
          <Landmark className="h-5 w-5 text-primary" />
          <h2 className="text-sm font-semibold text-slate-700">
            Türkiye Geneli Kamu İstihdamı (Resmi Kaynak)
          </h2>
        </div>
        <p className="mt-1 text-xs text-muted-foreground">
          Cumhurbaşkanlığı Strateji ve Bütçe Başkanlığı verilerine dayanır; bölüm/kurum kırılımı
          içermez, sadece Türkiye genelinde toplam kamu personeli sayısını gösterir.
        </p>
        <div className="mt-4">
          <ResmiIstihdamGrafik seri={resmiSeri} />
        </div>

        <details className="mt-4">
          <summary className="cursor-pointer text-xs font-medium text-primary hover:underline">
            Tablo olarak görüntüle
          </summary>
          <div className="mt-2 overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-primary/10 text-left text-xs text-muted-foreground">
                  <th className="py-1.5 pr-4 font-medium">Dönem</th>
                  <th className="py-1.5 pr-4 font-medium">Toplam Kamu Personeli</th>
                  <th className="py-1.5 pr-4 font-medium">Yıllık Net Artış</th>
                  <th className="py-1.5 font-medium">Kaynak</th>
                </tr>
              </thead>
              <tbody>
                {resmiSeri.map((s) => (
                  <tr key={s.yil} className="border-b border-primary/5 last:border-0">
                    <td className="py-1.5 pr-4 text-slate-800">
                      {s.yil} {s.donem}
                    </td>
                    <td className="py-1.5 pr-4 font-medium text-slate-900">
                      {s.toplamPersonel.toLocaleString("tr-TR")}
                    </td>
                    <td className="py-1.5 pr-4 text-slate-500">
                      {s.netArtis !== null ? `+${s.netArtis.toLocaleString("tr-TR")}` : "—"}
                    </td>
                    <td className="py-1.5 text-xs text-muted-foreground" title={s.kaynakDosya}>
                      SBB raporu
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </details>
      </div>

      <div className="mt-10 flex items-center gap-2">
        <BarChart3 className="h-6 w-6 text-primary" />
        <h1 className="text-2xl font-bold tracking-tight">Bölüm Bazlı İlan Analizi (Kamu Yolu Verisi)</h1>
      </div>
      {ilk && son && (
        <p className="mt-2 text-sm text-muted-foreground">
          Veri kapsamı: {turkceTarih(ilk)} – {turkceTarih(son)} arasında sitemizin taradığı ilanlar.
          Taramaya yakın zamanda başlandığı için ilanlar yoğunlukla güncel döneme aittir, yukarıdaki
          resmi istatistik gibi uzun yıllara yayılan bir arşiv değildir.
        </p>
      )}

      <div className="mt-6">
        <Suspense fallback={null}>
          <AnalizFiltre ilkTarih={ilk ? gun(ilk) : ""} sonTarih={son ? gun(son) : ""} />
        </Suspense>
      </div>

      <div className="mt-6 grid grid-cols-2 gap-4">
        <div className="rounded-2xl border border-primary/20 bg-white p-4">
          <p className="text-xs font-medium text-muted-foreground">Toplam ilan</p>
          <p className="mt-1 text-2xl font-bold text-slate-900">{toplamIlan}</p>
        </div>
        <div className="rounded-2xl border border-primary/20 bg-white p-4">
          <p className="text-xs font-medium text-muted-foreground">Tahmini toplam kontenjan</p>
          <p className="mt-1 text-2xl font-bold text-slate-900">{toplamKontenjan}</p>
          <p className="mt-1 text-[11px] text-muted-foreground">
            İlan başlıklarından sezgisel olarak çıkarılmıştır, kesin değildir.
          </p>
        </div>
      </div>

      <div className="mt-8 overflow-hidden rounded-2xl border border-primary/20 bg-white">
        <div className="flex items-center justify-between border-b border-primary/10 px-4 py-3">
          <h2 className="text-sm font-semibold text-slate-700">Bölümlere Göre Dağılım</h2>
          <div className="flex gap-1 text-xs">
            <a
              href={`?${new URLSearchParams({ ...(baslangic ? { baslangic } : {}), ...(bitis ? { bitis } : {}), sirala: "cok" }).toString()}`}
              className={`rounded-full px-2.5 py-1 font-medium ${sirala !== "az" ? "bg-primary/10 text-primary" : "text-slate-500 hover:text-primary"}`}
            >
              En çok
            </a>
            <a
              href={`?${new URLSearchParams({ ...(baslangic ? { baslangic } : {}), ...(bitis ? { bitis } : {}), sirala: "az" }).toString()}`}
              className={`rounded-full px-2.5 py-1 font-medium ${sirala === "az" ? "bg-primary/10 text-primary" : "text-slate-500 hover:text-primary"}`}
            >
              En az
            </a>
          </div>
        </div>

        {siraliSatirlar.length === 0 ? (
          <p className="p-6 text-sm text-muted-foreground">Seçilen aralıkta ilan bulunamadı.</p>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-primary/10 text-left text-xs text-muted-foreground">
                <th className="px-4 py-2 font-medium">Bölüm</th>
                <th className="px-4 py-2 font-medium">İlan Sayısı</th>
                <th className="px-4 py-2 font-medium">Tahmini Kontenjan</th>
              </tr>
            </thead>
            <tbody>
              {siraliSatirlar.map((s) => (
                <tr key={s.departmentId} className="border-b border-primary/5 last:border-0">
                  <td className="px-4 py-2.5 font-medium text-slate-800">{s.name}</td>
                  <td className="px-4 py-2.5 text-slate-700">{s.ilanSayisi}</td>
                  <td className="px-4 py-2.5 text-slate-500">{s.tahminiKontenjan}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

import type { ResmiIstihdamSatiri } from "@/lib/resmiIstihdamIstatistikleri";
import { YillikSutunGrafik } from "@/components/YillikSutunGrafik";

export function ResmiIstihdamGrafik({ seri }: { seri: ResmiIstihdamSatiri[] }) {
  const veriler = seri.map((s) => ({
    yil: s.yil,
    deger: s.toplamPersonel,
    isaretli: s.donem !== "Aralık sonu",
    ekTooltipSatirlari: [
      s.donem !== "Aralık sonu" ? `(${s.donem})` : "",
      s.netArtis !== null ? `+${s.netArtis.toLocaleString("tr-TR")} (yıllık net artış)` : "",
    ].filter(Boolean),
  }));

  return (
    <YillikSutunGrafik
      veriler={veriler}
      gridAdimi={1_000_000}
      bicim="milyon"
      isaretliAciklama="Kesikli çubuk, henüz yıl sonu raporu yayımlanmamış ara dönem verisidir."
    />
  );
}

"use client";

import { useEffect, useState } from "react";
import type { ResmiIstihdamSatiri } from "@/lib/resmiIstihdamIstatistikleri";

const GRID_ADIMI = 1_000_000;

function formatSayi(n: number) {
  return n.toLocaleString("tr-TR");
}

export function ResmiIstihdamGrafik({ seri }: { seri: ResmiIstihdamSatiri[] }) {
  const [yukseldi, setYukseldi] = useState(false);
  const [aktifIndex, setAktifIndex] = useState<number | null>(null);

  useEffect(() => {
    const zamanlayici = setTimeout(() => setYukseldi(true), 50);
    return () => clearTimeout(zamanlayici);
  }, []);

  const maxDeger = Math.max(...seri.map((s) => s.toplamPersonel));
  const tavan = Math.ceil(maxDeger / GRID_ADIMI) * GRID_ADIMI;
  const gridCizgileri = Array.from({ length: tavan / GRID_ADIMI + 1 }, (_, i) => i * GRID_ADIMI);
  const enYuksekIndex = seri.findIndex((s) => s.toplamPersonel === maxDeger);

  return (
    <div>
      <div className="relative h-64 pl-12">
        {gridCizgileri.map((deger) => (
          <div
            key={deger}
            className="absolute left-12 right-0 border-t border-slate-100"
            style={{ bottom: `${(deger / tavan) * 100}%` }}
          >
            <span className="absolute -left-12 -top-2 w-10 text-right text-[10px] text-muted-foreground">
              {(deger / 1_000_000).toLocaleString("tr-TR")}M
            </span>
          </div>
        ))}

        <div className="absolute inset-y-0 left-12 right-0 flex items-end gap-[2px]">
          {seri.map((s, i) => {
            const yuzde = (s.toplamPersonel / tavan) * 100;
            const araDonem = s.donem !== "Aralık sonu";
            const etiketliMi = i === enYuksekIndex || i === seri.length - 1;
            return (
              <div
                key={s.yil}
                className="group relative flex h-full flex-1 flex-col items-center justify-end"
                onMouseEnter={() => setAktifIndex(i)}
                onMouseLeave={() => setAktifIndex(null)}
                onFocus={() => setAktifIndex(i)}
                onBlur={() => setAktifIndex(null)}
                tabIndex={0}
              >
                {etiketliMi && (
                  <span className="mb-1 whitespace-nowrap text-[10px] font-medium text-slate-600">
                    {formatSayi(s.toplamPersonel)}
                  </span>
                )}
                <div
                  className={`w-full max-w-5 rounded-t ${
                    araDonem ? "border-2 border-dashed border-primary/60 bg-primary/20" : "bg-primary"
                  } transition-[height] duration-700 ease-out ${aktifIndex === i ? "brightness-110" : ""}`}
                  style={{
                    height: yukseldi ? `${yuzde}%` : "0%",
                    transitionDelay: `${i * 25}ms`,
                  }}
                />

                {aktifIndex === i && (
                  <div className="pointer-events-none absolute bottom-full z-10 mb-2 rounded-lg bg-slate-900 px-2.5 py-1.5 text-xs whitespace-nowrap text-white shadow-lg">
                    <p className="font-semibold">
                      {s.yil} {araDonem ? `(${s.donem})` : ""}
                    </p>
                    <p>{formatSayi(s.toplamPersonel)} personel</p>
                    {s.netArtis !== null && (
                      <p className="text-slate-300">+{formatSayi(s.netArtis)} (yıllık net artış)</p>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      <div className="mt-1 flex gap-[2px] pl-12">
        {seri.map((s) => (
          <span key={s.yil} className="flex-1 text-center text-[9px] text-muted-foreground">
            {String(s.yil).slice(2)}
          </span>
        ))}
      </div>

      <p className="mt-2 text-[11px] text-muted-foreground">
        Kesikli çubuk, henüz yıl sonu raporu yayımlanmamış ara dönem verisidir.
      </p>
    </div>
  );
}

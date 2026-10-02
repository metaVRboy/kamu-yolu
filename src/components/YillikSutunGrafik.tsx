"use client";

import { useEffect, useState } from "react";

export type YillikSutun = {
  yil: number;
  deger: number;
  /** Henuz tamamlanmamis/ara donem gibi normalden farkli bir degeri gorsel olarak ayirt eder. */
  isaretli?: boolean;
  /** Hover/focus tooltip'inde deger satirindan SONRA gosterilecek ek satirlar. */
  ekTooltipSatirlari?: string[];
};

/** Fonksiyonlar Server->Client sinirindan gecemedigi icin bicim bir enum olarak seciliyor. */
export type DegerBicimi = "milyon" | "sayi";

function formatDeger(n: number): string {
  return n.toLocaleString("tr-TR");
}

function formatEksen(n: number, bicim: DegerBicimi): string {
  if (bicim === "milyon") return `${(n / 1_000_000).toLocaleString("tr-TR")}M`;
  return n.toLocaleString("tr-TR");
}

/**
 * Tek seri, sifirdan yukselen animasyonlu sutun grafigi. Hem resmi
 * istihdam (milyonlar) hem KPSS bolum alim (onlarca/yuzlerce) verisi
 * icin kullanilir - olcekleri birbirinden COK farkli oldugundan ayni
 * grafikte tek eksende gosterilmezler (yaniltici olur), bunun yerine bu
 * bilesenin iki ayri orneklenmesiyle alt alta/yan yana gosterilir.
 */
export function YillikSutunGrafik({
  veriler,
  gridAdimi,
  bicim,
  isaretliAciklama,
}: {
  veriler: YillikSutun[];
  gridAdimi: number;
  /** Cubuk ustu etiket, tooltip ve eksen formatini belirler. */
  bicim: DegerBicimi;
  isaretliAciklama?: string;
}) {
  const [yukseldi, setYukseldi] = useState(false);
  const [aktifIndex, setAktifIndex] = useState<number | null>(null);

  useEffect(() => {
    const zamanlayici = setTimeout(() => setYukseldi(true), 50);
    return () => clearTimeout(zamanlayici);
  }, []);

  const maxDeger = Math.max(...veriler.map((s) => s.deger), gridAdimi);
  const tavan = Math.ceil(maxDeger / gridAdimi) * gridAdimi;
  const gridCizgileri = Array.from({ length: tavan / gridAdimi + 1 }, (_, i) => i * gridAdimi);
  const enYuksekIndex = veriler.reduce(
    (enIyi, s, i) => (s.deger > veriler[enIyi].deger ? i : enIyi),
    0,
  );

  return (
    <div>
      <div className="relative h-56 pl-14">
        {gridCizgileri.map((deger) => (
          <div
            key={deger}
            className="absolute left-14 right-0 border-t border-slate-100"
            style={{ bottom: `${(deger / tavan) * 100}%` }}
          >
            <span className="absolute -left-14 -top-2 w-12 text-right text-[10px] text-muted-foreground">
              {formatEksen(deger, bicim)}
            </span>
          </div>
        ))}

        <div className="absolute inset-y-0 left-14 right-0 flex items-end gap-[2px]">
          {veriler.map((s, i) => {
            const yuzde = (s.deger / tavan) * 100;
            const etiketliMi = i === enYuksekIndex || i === veriler.length - 1;
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
                    {formatDeger(s.deger)}
                  </span>
                )}
                <div
                  className={`w-full max-w-5 rounded-t ${
                    s.isaretli ? "border-2 border-dashed border-primary/60 bg-primary/20" : "bg-primary"
                  } transition-[height] duration-700 ease-out ${aktifIndex === i ? "brightness-110" : ""}`}
                  style={{
                    height: yukseldi ? `${yuzde}%` : "0%",
                    transitionDelay: `${i * 25}ms`,
                  }}
                />

                {aktifIndex === i && (
                  <div className="pointer-events-none absolute bottom-full z-10 mb-2 rounded-lg bg-slate-900 px-2.5 py-1.5 text-xs whitespace-nowrap text-white shadow-lg">
                    <p className="font-semibold">{s.yil}</p>
                    <p>{formatDeger(s.deger)}</p>
                    {s.ekTooltipSatirlari?.map((satir) => (
                      <p key={satir} className="text-slate-300">
                        {satir}
                      </p>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      <div className="mt-1 flex gap-[2px] pl-14">
        {veriler.map((s) => (
          <span key={s.yil} className="flex-1 text-center text-[9px] text-muted-foreground">
            {String(s.yil).slice(2)}
          </span>
        ))}
      </div>

      {isaretliAciklama && <p className="mt-2 text-[11px] text-muted-foreground">{isaretliAciklama}</p>}
    </div>
  );
}

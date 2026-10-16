"use client";

import { useEffect, useRef, useState } from "react";

const YOL_GENISLIK = 46;
// max-w-6xl (72rem); sayfa kapsayicilarinin ic dolgusu (px-6) yolun icerige yaklasmasini zaten engeller.
const ICERIK_GENISLIGI = 1152;

/**
 * Sitenin altin yolu: sayfadaki gercek konumlardan cizilir. Yol hep icerigin disindaki kenar boslugundan
 * iner, karsi kenara yalniz [data-yol-gecis] bloklarinin (sayfa basligi karti, opak kart izgaralari,
 * lacivert bant) arkasindan gecer; boylece hicbir yazinin ustune gelmez. Icerik genisligi: [data-yol-icerik]
 * (admin, max-w-7xl) yoksa sitenin standart max-w-6xl'i. Kenar boslugu yola yetmeyen ekranlarda cizilmez.
 */
export function YolCizimi() {
  const ref = useRef<SVGSVGElement>(null);
  const [cizim, setCizim] = useState<{ w: number; h: number; d: string } | null>(null);

  useEffect(() => {
    const kok = ref.current?.closest<HTMLElement>("[data-yol-kok]");
    if (!kok) return;
    const hesapla = () => {
      const k = kok.getBoundingClientRect();
      // Kart izgaralarinda yol ilk kartin ortasindan gecer (iki satirin ortasi satir boslugunda kalirdi).
      const gecisY = [...kok.querySelectorAll<HTMLElement>("[data-yol-gecis]")].map((e) => {
        const r = (e.tagName === "SECTION" || e.tagName === "HEADER" ? e : (e.firstElementChild ?? e)).getBoundingClientRect();
        return (r.top + r.bottom) / 2 - k.top;
      });
      const icerik = kok.querySelector<HTMLElement>("[data-yol-icerik]")?.getBoundingClientRect();
      const genislik = icerik?.width ?? Math.min(k.width, ICERIK_GENISLIGI);
      const bosluk = (k.width - genislik) / 2;
      if (bosluk < YOL_GENISLIK * 2) return setCizim(null);
      const sol = bosluk / 2;
      const sag = k.width - bosluk / 2;
      // Donusler ceyrek daire: yaricap = yolun ortasindan icerik kenarina uzaklik (yay tamamen kenar boslugunda).
      const R = bosluk / 2;
      const GIRIS_Y = 70;
      let x = sag;
      let y = -40;
      let d = `M ${sag} -40`;
      // Yer varsa sag kenardan yatay girip yayla asagi doner; ilk gecis cok yukaridaysa dogrudan ustten iner.
      if (!gecisY.length || gecisY[0] - R >= GIRIS_Y + R + 20) {
        d = `M ${k.width + 40} ${GIRIS_Y} L ${k.width} ${GIRIS_Y} A ${R} ${R} 0 0 0 ${sag} ${GIRIS_Y + R}`;
        y = GIRIS_Y + R;
      }
      for (const yc of gecisY) {
        const r = Math.min(R, yc - y);
        if (r < 12) continue;
        const yeniX = x === sag ? sol : sag;
        const yon = Math.sign(yeniX - x);
        // asagi -> yatay (yay), kartin arkasindan yatay, yatay -> asagi (yay)
        d += ` L ${x} ${yc - r} A ${r} ${r} 0 0 ${yon < 0 ? 1 : 0} ${x + yon * r} ${yc}`;
        d += ` L ${yeniX - yon * r} ${yc} A ${r} ${r} 0 0 ${yon < 0 ? 0 : 1} ${yeniX} ${yc + r}`;
        x = yeniX;
        y = yc + r;
      }
      d += ` L ${x} ${k.height + 40}`;
      setCizim({ w: k.width, h: k.height, d });
    };
    hesapla();
    const gozlem = new ResizeObserver(hesapla);
    gozlem.observe(kok);
    return () => gozlem.disconnect();
  }, []);

  return (
    <svg ref={ref} className="ana-yol absolute inset-0 h-full w-full" viewBox={cizim ? `0 0 ${cizim.w} ${cizim.h}` : undefined}>
      {cizim && (
        <>
          <path d={cizim.d} fill="none" stroke="rgba(198,163,95,0.32)" strokeWidth={YOL_GENISLIK} strokeLinecap="round" />
          <path className="ana-yol-serit" d={cizim.d} fill="none" stroke="#fff" strokeWidth="3" strokeDasharray="18 16" strokeLinecap="round" />
        </>
      )}
    </svg>
  );
}

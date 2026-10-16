"use client";

import { useEffect, useRef, useState } from "react";

const YOL_GENISLIK = 46;

/**
 * Ana sayfanin altin yolu: sayfadaki gercek konumlardan cizilir. Yol hep kenar boslugundan iner,
 * karsi kenara yalniz [data-yol-gecis] bloklarinin (opak kart izgaralari, lacivert bant) arkasindan
 * gecer; boylece hicbir yazinin ustune gelmez. Kenar boslugu yola yetmeyen ekranlarda cizilmez.
 */
export function YolCizimi() {
  const ref = useRef<SVGSVGElement>(null);
  const [cizim, setCizim] = useState<{ w: number; h: number; d: string } | null>(null);

  useEffect(() => {
    const kok = ref.current?.closest<HTMLElement>("[data-yol-kok]");
    if (!kok) return;
    const hesapla = () => {
      const k = kok.getBoundingClientRect();
      const gecisler = [...kok.querySelectorAll<HTMLElement>("[data-yol-gecis]")].map((e) => e.getBoundingClientRect());
      const izgara = kok.querySelector<HTMLElement>("[data-yol-gecis]:not(section)")?.getBoundingClientRect();
      if (!izgara || izgara.left - k.left < YOL_GENISLIK * 2) return setCizim(null);
      const sol = (izgara.left - k.left) / 2;
      const sag = izgara.right - k.left + (k.right - izgara.right) / 2;
      let x = sag;
      // Sag ust koseden kivrilarak girer.
      let d = `M ${k.width + 60} 40 C ${sag} 40, ${sag} 120, ${sag} 260`;
      for (const g of gecisler) {
        const y1 = g.top - k.top + g.height * 0.2;
        const y2 = g.bottom - k.top - g.height * 0.2;
        const ortaY = (y1 + y2) / 2;
        const yeniX = x === sag ? sol : sag;
        d += ` L ${x} ${y1} C ${x} ${ortaY}, ${yeniX} ${ortaY}, ${yeniX} ${y2}`;
        x = yeniX;
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

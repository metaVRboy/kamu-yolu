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
      const gecisler = [...kok.querySelectorAll<HTMLElement>("[data-yol-gecis]")].map((e) => e.getBoundingClientRect());
      const icerik = kok.querySelector<HTMLElement>("[data-yol-icerik]")?.getBoundingClientRect();
      const genislik = icerik?.width ?? Math.min(k.width, ICERIK_GENISLIGI);
      const bosluk = (k.width - genislik) / 2;
      if (bosluk < YOL_GENISLIK * 2) return setCizim(null);
      const sol = bosluk / 2;
      const sag = k.width - bosluk / 2;
      let x = sag;
      const araliklar = gecisler.map((g) => [g.top - k.top + g.height * 0.2, g.bottom - k.top - g.height * 0.2]);
      // Sag ust koseden kivrilarak girer; ilk gecis (orn. sayfa basligi karti) cok yukaridaysa
      // kivrimin yeri yok -> dogrudan ustten iner (yoksa yol geri yukari donup catallanir).
      const girisSonu = Math.min(260, araliklar[0]?.[0] ?? 260);
      let d = girisSonu < 180 ? `M ${sag} -40` : `M ${k.width + 60} 40 C ${sag} 40, ${sag} 120, ${sag} ${girisSonu}`;
      for (const [y1, y2] of araliklar) {
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

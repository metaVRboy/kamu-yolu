"use client";

import { useEffect, useRef, useState } from "react";

/** Ekrana girince 0'dan hedefe sayarak artan sayi. Sunucu gercek degeri basar; JS yoksa/"hareketi azalt"ta sabit kalir. */
export function SayacArtis({ deger }: { deger: number }) {
  const ref = useRef<HTMLSpanElement>(null);
  const [gosterilen, setGosterilen] = useState(deger);
  useEffect(() => {
    const el = ref.current;
    if (!el || matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let kare = 0;
    const gozlem = new IntersectionObserver(([g]) => {
      if (!g.isIntersecting) return;
      gozlem.disconnect();
      const bas = performance.now();
      const adim = (simdi: number) => {
        const x = Math.min(1, (simdi - bas) / 1200);
        setGosterilen(Math.round(deger * (1 - Math.pow(1 - x, 3))));
        if (x < 1) kare = requestAnimationFrame(adim);
      };
      kare = requestAnimationFrame(adim);
    });
    gozlem.observe(el);
    return () => {
      gozlem.disconnect();
      cancelAnimationFrame(kare);
    };
  }, [deger]);
  return <span ref={ref}>{gosterilen.toLocaleString("tr-TR")}</span>;
}

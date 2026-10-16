"use client";

import { useEffect, useRef } from "react";

/** Masaustunde imleci takip eden yumusak isik (zemin katmaninda). Dokunmatik ve "hareketi azalt"ta calismaz. */
export function ImlecIsigi() {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el || !matchMedia("(pointer: fine) and (prefers-reduced-motion: no-preference)").matches) return;
    let kare = 0;
    const hareket = (e: PointerEvent) => {
      cancelAnimationFrame(kare);
      kare = requestAnimationFrame(() => {
        const r = el.getBoundingClientRect();
        el.style.setProperty("--x", `${e.clientX - r.left}px`);
        el.style.setProperty("--y", `${e.clientY - r.top}px`);
        el.style.opacity = "1";
      });
    };
    window.addEventListener("pointermove", hareket, { passive: true });
    return () => {
      window.removeEventListener("pointermove", hareket);
      cancelAnimationFrame(kare);
    };
  }, []);
  return <div ref={ref} className="imlec-isigi absolute inset-0 opacity-0 transition-opacity duration-700" />;
}

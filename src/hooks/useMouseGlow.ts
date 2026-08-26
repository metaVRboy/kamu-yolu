"use client";

import { useCallback, useRef } from "react";

/**
 * Bir elemanin uzerinde mouse hareket ettikce, o elemanin --mx/--my CSS
 * degiskenlerini (yuzde cinsinden imlec konumu) gunceller. Bu degiskenler
 * radial-gradient tabanli "isik takip ediyor" efektlerinde kullanilir.
 * Performans icin React state yerine dogrudan DOM stiline yazar.
 */
export function useMouseGlow<T extends HTMLElement>() {
  const ref = useRef<T>(null);

  const onMouseMove = useCallback((e: React.MouseEvent<T>) => {
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    el.style.setProperty("--mx", `${x}%`);
    el.style.setProperty("--my", `${y}%`);
  }, []);

  return { ref, onMouseMove };
}

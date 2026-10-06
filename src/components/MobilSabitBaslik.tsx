"use client";

import { useEffect, useRef, useState } from "react";
import { SlidersHorizontal } from "lucide-react";

/**
 * Mobilde sayfa basligi ekrandan cikinca, site menusunun hemen altinda
 * ince bir sabit cubuk gosterir (baslik + filtrelere atla). Basligin en
 * altina yerlestirilen gorunmez nobetci elemani gozlenir.
 */
export function MobilSabitBaslik({ baslik, filtreHedefi }: { baslik: string; filtreHedefi?: string }) {
  const nobetci = useRef<HTMLDivElement>(null);
  const [ust, setUst] = useState<number | null>(null);

  useEffect(() => {
    const el = nobetci.current;
    if (!el) return;
    const gozlemci = new IntersectionObserver(([giris]) => {
      const gecildi = !giris.isIntersecting && giris.boundingClientRect.top < 0;
      const menu = document.querySelector("body > header, header.sticky");
      setUst(gecildi ? (menu?.getBoundingClientRect().height ?? 64) : null);
    });
    gozlemci.observe(el);
    return () => gozlemci.disconnect();
  }, []);

  return (
    <>
      <div ref={nobetci} aria-hidden className="h-px" />
      {ust !== null && (
        <div
          style={{ top: ust }}
          className="fixed inset-x-0 z-30 flex items-center justify-between gap-3 border-b border-primary/10 bg-white/95 px-4 py-2.5 shadow-sm backdrop-blur sm:hidden"
        >
          <p className="line-clamp-1 text-sm font-semibold text-slate-900">{baslik}</p>
          {filtreHedefi && (
            <a
              href={filtreHedefi}
              className="inline-flex shrink-0 items-center gap-1 rounded-full bg-primary px-3 py-1 text-xs font-semibold text-primary-foreground"
            >
              <SlidersHorizontal className="h-3.5 w-3.5" />
              Filtreler
            </a>
          )}
        </div>
      )}
    </>
  );
}

"use client";

import { useEffect, useRef, useState } from "react";
import { ChevronDown } from "lucide-react";
import { DepartmentSearch } from "@/components/DepartmentSearch";
import { cn } from "@/lib/utils";

type BolumSecenegi = { slug: string; name: string; level: string; ilanSayisi: number };

/**
 * Bolum sayfasinin konum satirindaki son oge ("Bilgisayar Programciligi ▾"):
 * tiklayinca bolum arama kutusu acilir. Basligin yuksekligini degistirmez -
 * panel icerigin ustunde acilir.
 */
export function BolumSecici({ aktifAd, departments }: { aktifAd: string; departments: BolumSecenegi[] }) {
  const [acik, setAcik] = useState(false);
  const kutu = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (!acik) return;
    const disariTik = (e: MouseEvent) => !kutu.current?.contains(e.target as Node) && setAcik(false);
    const esc = (e: KeyboardEvent) => e.key === "Escape" && setAcik(false);
    document.addEventListener("mousedown", disariTik);
    document.addEventListener("keydown", esc);
    return () => {
      document.removeEventListener("mousedown", disariTik);
      document.removeEventListener("keydown", esc);
    };
  }, [acik]);

  return (
    <span ref={kutu} className="relative">
      <button
        type="button"
        onClick={() => setAcik((a) => !a)}
        aria-expanded={acik}
        aria-label={`${aktifAd} - farklı bölüm seç`}
        className="inline-flex items-center gap-0.5 rounded-md font-medium text-slate-600 underline-offset-2 hover:text-primary hover:underline"
      >
        {aktifAd}
        <ChevronDown className={cn("h-3.5 w-3.5 transition-transform", acik && "rotate-180")} />
      </button>
      {acik && (
        <div className="absolute top-full left-0 z-40 mt-2 w-[min(26rem,calc(100vw-2rem))] rounded-2xl border border-primary/20 bg-white p-3 shadow-xl shadow-primary/10">
          <p className="mb-2 text-xs font-semibold text-slate-700">Farklı bir bölümün ilanlarına bak</p>
          <DepartmentSearch departments={departments} />
        </div>
      )}
    </span>
  );
}

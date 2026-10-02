"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";

const TUMU = "__tumu__";

export function BolumSiralamaFiltre({ ilkYil, sonYil }: { ilkYil: number; sonYil: number }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const baslangic = searchParams.get("siraBaslangic") ?? TUMU;
  const bitis = searchParams.get("siraBitis") ?? TUMU;
  const yillar = Array.from({ length: sonYil - ilkYil + 1 }, (_, i) => ilkYil + i);

  function guncelle(anahtar: "siraBaslangic" | "siraBitis", deger: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (deger === TUMU) params.delete(anahtar);
    else params.set(anahtar, deger);
    const query = params.toString();
    router.push(query ? `${pathname}?${query}` : pathname);
  }

  return (
    <div className="flex items-center gap-1.5 text-xs">
      <select
        value={baslangic}
        onChange={(e) => guncelle("siraBaslangic", e.target.value)}
        className="rounded-lg border border-primary/20 bg-white px-1.5 py-1 text-xs"
        aria-label="Başlangıç yılı"
      >
        <option value={TUMU}>Tümü</option>
        {yillar.map((y) => (
          <option key={y} value={y}>
            {y}
          </option>
        ))}
      </select>
      <span className="text-muted-foreground">–</span>
      <select
        value={bitis}
        onChange={(e) => guncelle("siraBitis", e.target.value)}
        className="rounded-lg border border-primary/20 bg-white px-1.5 py-1 text-xs"
        aria-label="Bitiş yılı"
      >
        <option value={TUMU}>Tümü</option>
        {yillar.map((y) => (
          <option key={y} value={y}>
            {y}
          </option>
        ))}
      </select>
    </div>
  );
}

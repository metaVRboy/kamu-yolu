"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";

export function AnalizFiltre({ ilkTarih, sonTarih }: { ilkTarih: string; sonTarih: string }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  function updateParam(key: string, value: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (value) params.set(key, value);
    else params.delete(key);
    const query = params.toString();
    router.push(query ? `${pathname}?${query}` : pathname);
  }

  const baslangic = searchParams.get("baslangic") ?? "";
  const bitis = searchParams.get("bitis") ?? "";
  const hasActiveFilters = baslangic || bitis;

  return (
    <div className="flex flex-wrap items-end gap-3 rounded-2xl border border-primary/20 bg-white p-3 shadow-sm">
      <label className="flex flex-col gap-1 text-xs font-medium text-slate-600">
        Başlangıç
        <input
          type="date"
          min={ilkTarih}
          max={sonTarih}
          value={baslangic}
          onChange={(e) => updateParam("baslangic", e.target.value)}
          className="rounded-lg border border-primary/20 px-2 py-1.5 text-sm"
        />
      </label>
      <label className="flex flex-col gap-1 text-xs font-medium text-slate-600">
        Bitiş
        <input
          type="date"
          min={ilkTarih}
          max={sonTarih}
          value={bitis}
          onChange={(e) => updateParam("bitis", e.target.value)}
          className="rounded-lg border border-primary/20 px-2 py-1.5 text-sm"
        />
      </label>

      {hasActiveFilters && (
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => router.push(pathname)}
          className="text-muted-foreground"
        >
          <X className="h-3.5 w-3.5" />
          Filtreleri temizle
        </Button>
      )}
    </div>
  );
}

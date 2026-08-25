"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { INSTITUTION_TYPE_LABEL } from "@/lib/labels";

export type FilterOptions = {
  institutionTypes: string[];
  ilanTurleri: string[];
  iller: string[];
};

const PARAM_KEYS = {
  institutionType: "kurum",
  ilanTuru: "ilanTuru",
  il: "il",
} as const;

export function FilterBar({ options }: { options: FilterOptions }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  function updateParam(key: string, value: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    const query = params.toString();
    router.push(query ? `${pathname}?${query}` : pathname);
  }

  const hasActiveFilters =
    searchParams.get(PARAM_KEYS.institutionType) ||
    searchParams.get(PARAM_KEYS.ilanTuru) ||
    searchParams.get(PARAM_KEYS.il);

  if (
    options.institutionTypes.length === 0 &&
    options.ilanTurleri.length === 0 &&
    options.iller.length === 0
  ) {
    return null;
  }

  return (
    <div className="mt-6 flex flex-wrap items-center gap-3">
      {options.institutionTypes.length > 1 && (
        <select
          className="rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm"
          value={searchParams.get(PARAM_KEYS.institutionType) ?? ""}
          onChange={(e) => updateParam(PARAM_KEYS.institutionType, e.target.value)}
        >
          <option value="">Tüm kurum türleri</option>
          {options.institutionTypes.map((type) => (
            <option key={type} value={type}>
              {INSTITUTION_TYPE_LABEL[type] ?? type}
            </option>
          ))}
        </select>
      )}

      {options.ilanTurleri.length > 1 && (
        <select
          className="rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm"
          value={searchParams.get(PARAM_KEYS.ilanTuru) ?? ""}
          onChange={(e) => updateParam(PARAM_KEYS.ilanTuru, e.target.value)}
        >
          <option value="">Tüm ilan türleri</option>
          {options.ilanTurleri.map((tur) => (
            <option key={tur} value={tur}>
              {tur}
            </option>
          ))}
        </select>
      )}

      {options.iller.length > 1 && (
        <select
          className="rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm"
          value={searchParams.get(PARAM_KEYS.il) ?? ""}
          onChange={(e) => updateParam(PARAM_KEYS.il, e.target.value)}
        >
          <option value="">Tüm iller</option>
          {options.iller.map((il) => (
            <option key={il} value={il}>
              {il}
            </option>
          ))}
        </select>
      )}

      {hasActiveFilters && (
        <button
          type="button"
          onClick={() => router.push(pathname)}
          className="text-sm text-neutral-500 underline hover:text-neutral-800"
        >
          Filtreleri temizle
        </button>
      )}
    </div>
  );
}

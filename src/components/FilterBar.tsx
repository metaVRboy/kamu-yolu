"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { X } from "lucide-react";
import { INSTITUTION_TYPE_LABEL } from "@/lib/labels";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";

export type FilterOptions = {
  institutionTypes: string[];
  ilanTurleri: string[];
  iller: string[];
};

const ALL = "__all__";

const PARAM_KEYS = {
  institutionType: "kurum",
  ilanTuru: "ilanTuru",
  il: "il",
} as const;

export function FilterBar({ options }: { options: FilterOptions }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  function updateParam(key: string, value: string | null) {
    const params = new URLSearchParams(searchParams.toString());
    if (value && value !== ALL) {
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
    <div className="flex flex-wrap items-center gap-3 rounded-2xl border border-primary/20 bg-white p-3 shadow-sm">
      {options.institutionTypes.length > 1 && (
        <Select
          value={searchParams.get(PARAM_KEYS.institutionType) ?? ALL}
          onValueChange={(v) => updateParam(PARAM_KEYS.institutionType, v)}
        >
          <SelectTrigger className="w-[180px] border-primary/20 bg-white">
            <SelectValue>
              {(v: string) =>
                v === ALL || !v
                  ? "Tüm kurum türleri"
                  : (INSTITUTION_TYPE_LABEL[v] ?? v)
              }
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL}>Tüm kurum türleri</SelectItem>
            {options.institutionTypes.map((type) => (
              <SelectItem key={type} value={type}>
                {INSTITUTION_TYPE_LABEL[type] ?? type}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}

      {options.ilanTurleri.length > 1 && (
        <Select
          value={searchParams.get(PARAM_KEYS.ilanTuru) ?? ALL}
          onValueChange={(v) => updateParam(PARAM_KEYS.ilanTuru, v)}
        >
          <SelectTrigger className="w-[200px] border-primary/20 bg-white">
            <SelectValue>
              {(v: string) => (v === ALL || !v ? "Tüm ilan türleri" : v)}
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL}>Tüm ilan türleri</SelectItem>
            {options.ilanTurleri.map((tur) => (
              <SelectItem key={tur} value={tur}>
                {tur}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}

      {options.iller.length > 1 && (
        <Select
          value={searchParams.get(PARAM_KEYS.il) ?? ALL}
          onValueChange={(v) => updateParam(PARAM_KEYS.il, v)}
        >
          <SelectTrigger className="w-[160px] border-primary/20 bg-white">
            <SelectValue>
              {(v: string) => (v === ALL || !v ? "Tüm iller" : v)}
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL}>Tüm iller</SelectItem>
            {options.iller.map((il) => (
              <SelectItem key={il} value={il}>
                {il}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}

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

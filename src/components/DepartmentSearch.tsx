"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Search } from "lucide-react";
import { LEVEL_LABEL } from "@/lib/labels";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

type DepartmentOption = {
  slug: string;
  name: string;
  level: string;
};

export function DepartmentSearch({
  departments,
}: {
  departments: DepartmentOption[];
}) {
  const [query, setQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const router = useRouter();

  const filtered = useMemo(() => {
    const q = query.trim().toLocaleLowerCase("tr-TR");
    if (!q) return departments.slice(0, 8);
    return departments
      .filter((d) => d.name.toLocaleLowerCase("tr-TR").includes(q))
      .slice(0, 20);
  }, [query, departments]);

  function goToDepartment(slug: string) {
    router.push(`/bolum/${slug}`);
  }

  return (
    <div className="relative mx-auto w-full max-w-xl">
      <div className="relative">
        <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          onBlur={() => setTimeout(() => setIsOpen(false), 150)}
          placeholder="Bölümünü yaz (ör. Bilgisayar Mühendisliği)"
          className="h-12 rounded-xl border-border/70 bg-white pl-11 text-base shadow-sm"
        />
      </div>
      {isOpen && filtered.length > 0 && (
        <ul className="absolute z-10 mt-2 max-h-80 w-full overflow-auto rounded-xl border border-border bg-white p-1 shadow-lg">
          {filtered.map((d) => (
            <li key={d.slug}>
              <button
                type="button"
                onMouseDown={() => goToDepartment(d.slug)}
                className="flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-sm hover:bg-primary/5"
              >
                <span>{d.name}</span>
                <Badge variant="secondary" className="font-normal">
                  {LEVEL_LABEL[d.level] ?? d.level}
                </Badge>
              </button>
            </li>
          ))}
        </ul>
      )}
      {isOpen && query && filtered.length === 0 && (
        <div className="absolute z-10 mt-2 w-full rounded-xl border border-border bg-white px-4 py-3 text-sm text-muted-foreground shadow-lg">
          Bölüm bulunamadı. Farklı bir isimle deneyin.
        </div>
      )}
    </div>
  );
}

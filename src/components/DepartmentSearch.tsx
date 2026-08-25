"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { LEVEL_LABEL } from "@/lib/labels";

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
    <div className="relative w-full max-w-xl">
      <input
        type="text"
        value={query}
        onChange={(e) => {
          setQuery(e.target.value);
          setIsOpen(true);
        }}
        onFocus={() => setIsOpen(true)}
        onBlur={() => setTimeout(() => setIsOpen(false), 150)}
        placeholder="Bölümünü yaz (ör. Bilgisayar Mühendisliği)"
        className="w-full rounded-lg border border-neutral-300 bg-white px-4 py-3 text-base shadow-sm outline-none focus:border-neutral-500"
      />
      {isOpen && filtered.length > 0 && (
        <ul className="absolute z-10 mt-1 max-h-80 w-full overflow-auto rounded-lg border border-neutral-200 bg-white shadow-lg">
          {filtered.map((d) => (
            <li key={d.slug}>
              <button
                type="button"
                onMouseDown={() => goToDepartment(d.slug)}
                className="flex w-full items-center justify-between px-4 py-2 text-left hover:bg-neutral-100"
              >
                <span>{d.name}</span>
                <span className="text-xs text-neutral-500">
                  {LEVEL_LABEL[d.level] ?? d.level}
                </span>
              </button>
            </li>
          ))}
        </ul>
      )}
      {isOpen && query && filtered.length === 0 && (
        <div className="absolute z-10 mt-1 w-full rounded-lg border border-neutral-200 bg-white px-4 py-3 text-sm text-neutral-500 shadow-lg">
          Bölüm bulunamadı. Farklı bir isimle deneyin.
        </div>
      )}
    </div>
  );
}

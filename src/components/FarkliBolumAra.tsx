"use client";

import { useState } from "react";
import { ArrowLeftRight, X } from "lucide-react";
import { DepartmentSearch } from "@/components/DepartmentSearch";

type BolumSecenegi = { slug: string; name: string; level: string; ilanSayisi: number };

/** Basliktaki "Farkli bolum ara" - sayfadan cikmadan arama kutusunu acar. */
export function FarkliBolumAra({ departments }: { departments: BolumSecenegi[] }) {
  const [acik, setAcik] = useState(false);
  return (
    <>
      <button
        type="button"
        onClick={() => setAcik((a) => !a)}
        aria-expanded={acik}
        className="inline-flex items-center gap-1.5 rounded-full border border-primary/20 bg-white px-4 py-2 text-sm font-semibold text-primary transition-colors hover:bg-primary/5"
      >
        {acik ? <X className="h-4 w-4" /> : <ArrowLeftRight className="h-4 w-4" />}
        {acik ? "Aramayı kapat" : "Farklı bölüm ara"}
      </button>
      {acik && (
        <div className="basis-full pt-2">
          <DepartmentSearch departments={departments} />
        </div>
      )}
    </>
  );
}

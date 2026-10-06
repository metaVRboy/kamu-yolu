"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { MENU, menuAktifMi, type MenuOgesi } from "@/components/HeaderNav";

// Mobilde (xl altinda) hamburger ile acilan, sayfanin USTUNDEN asagi
// dogru genisleyen menu - eskisi gibi ekranin YANINDAN acilan bir Sheet
// degil, header'in kendi acilir menu diliyle tutarli.
export function SiteMenu() {
  const [open, setOpen] = useState(false);

  return (
    <div className="xl:hidden">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label={open ? "Menüyü kapat" : "Menüyü aç"}
        aria-expanded={open}
        className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-700 transition-colors hover:bg-primary/10 hover:text-slate-900"
      >
        {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </button>

      {open && (
        <div className="absolute inset-x-0 top-full z-50 max-h-[calc(100dvh-4rem)] overflow-y-auto border-b border-border bg-white shadow-xl shadow-primary/10">
          <nav className="flex flex-col gap-1 p-3">
            <AkordeonListesi ogeler={MENU} kapat={() => setOpen(false)} ust />
          </nav>
        </div>
      )}
    </div>
  );
}

/** Bir menu seviyesi: `items`i olan oge akordeon gibi acilir; ic ice seviyeler ayni bilesenle cizilir. */
function AkordeonListesi({ ogeler, kapat, ust = false }: { ogeler: MenuOgesi[]; kapat: () => void; ust?: boolean }) {
  const pathname = usePathname();
  const [acik, setAcik] = useState<string | null>(null);
  const satir = (aktif: boolean) =>
    cn(
      "rounded-lg px-3 text-sm font-medium transition-colors",
      ust ? "py-2.5" : "py-2",
      aktif ? "bg-primary/10 text-primary" : cn(ust ? "text-slate-700" : "text-slate-600", "hover:bg-primary/10 hover:text-slate-900"),
    );

  return ogeler.map((oge) => {
    const aktif = menuAktifMi(oge, pathname);
    if (!oge.items) {
      return (
        <Link key={oge.label} href={oge.href!} onClick={kapat} className={satir(aktif)}>
          {oge.label}
        </Link>
      );
    }
    const acikMi = acik === oge.label;
    return (
      <div key={oge.label}>
        <button
          type="button"
          onClick={() => setAcik(acikMi ? null : oge.label)}
          aria-expanded={acikMi}
          className={cn("flex w-full items-center justify-between", satir(aktif))}
        >
          {oge.label}
          <ChevronDown className={cn("h-4 w-4 transition-transform", acikMi && "rotate-180")} />
        </button>
        {acikMi && (
          <div className="mt-1 ml-3 flex flex-col gap-1 border-l border-primary/15 pl-3">
            <AkordeonListesi ogeler={oge.items} kapat={kapat} />
          </div>
        )}
      </div>
    );
  });
}

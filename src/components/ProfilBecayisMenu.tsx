"use client";

import { useState } from "react";
import Link from "next/link";
import { ChevronDown, FilePlus2, Inbox, Repeat } from "lucide-react";
import { cn } from "@/lib/utils";

export function ProfilBecayisMenu({ okunmamisSayisi }: { okunmamisSayisi: number }) {
  const [open, setOpen] = useState(true);

  return (
    <div className="rounded-2xl border border-primary/15 bg-white/70 backdrop-blur-md">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between rounded-2xl px-4 py-3 text-left"
      >
        <span className="flex items-center gap-2 font-semibold text-slate-900">
          <Repeat className="h-4 w-4 text-primary" />
          Becayiş
        </span>
        <ChevronDown className={cn("h-4 w-4 text-muted-foreground transition-transform", open && "rotate-180")} />
      </button>

      {open && (
        <div className="space-y-1 px-2 pb-2">
          <Link
            href="/becayis/talep-olustur"
            className="flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm font-medium text-slate-700 transition-colors hover:bg-primary/10 hover:text-slate-900"
          >
            <FilePlus2 className="h-4 w-4" />
            Talep Oluştur
          </Link>
          <Link
            href="/becayis/taleplerim"
            className="flex items-center justify-between gap-2.5 rounded-xl px-3 py-2.5 text-sm font-medium text-slate-700 transition-colors hover:bg-primary/10 hover:text-slate-900"
          >
            <span className="flex items-center gap-2.5">
              <Inbox className="h-4 w-4" />
              Mevcut Taleplerim
            </span>
            {okunmamisSayisi > 0 && (
              <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-primary px-1.5 text-xs font-semibold text-primary-foreground">
                {okunmamisSayisi}
              </span>
            )}
          </Link>
        </div>
      )}
    </div>
  );
}

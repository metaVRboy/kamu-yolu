"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { PLAIN_LINKS, DROPDOWNS } from "@/components/HeaderNav";

// Mobilde (xl altinda) hamburger ile acilan, sayfanin USTUNDEN asagi
// dogru genisleyen menu - eskisi gibi ekranin YANINDAN acilan bir Sheet
// degil, header'in kendi acilir menu diliyle tutarli.
export function SiteMenu() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [openGroup, setOpenGroup] = useState<string | null>(null);

  function isActive(href: string) {
    return pathname === href || pathname.startsWith(`${href}/`);
  }

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
        <div className="absolute inset-x-0 top-full z-50 border-b border-border bg-white shadow-xl shadow-primary/10">
          <nav className="flex flex-col gap-1 p-3">
            {PLAIN_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                className={cn(
                  "rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                  isActive(link.href) ? "bg-primary/10 text-primary" : "text-slate-700 hover:bg-primary/10 hover:text-slate-900",
                )}
              >
                {link.label}
              </Link>
            ))}

            {DROPDOWNS.map((group) => {
              const isOpen = openGroup === group.label;
              return (
                <div key={group.href}>
                  <button
                    type="button"
                    onClick={() => setOpenGroup(isOpen ? null : group.label)}
                    className={cn(
                      "flex w-full items-center justify-between rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                      isActive(group.href) ? "bg-primary/10 text-primary" : "text-slate-700 hover:bg-primary/10 hover:text-slate-900",
                    )}
                  >
                    {group.label}
                    <ChevronDown className={cn("h-4 w-4 transition-transform", isOpen && "rotate-180")} />
                  </button>
                  {isOpen && (
                    <div className="ml-3 flex flex-col gap-1 border-l border-primary/15 pl-3">
                      {group.items.map((item) => (
                        <Link
                          key={item.href}
                          href={item.href}
                          onClick={() => setOpen(false)}
                          className="rounded-lg px-3 py-2 text-sm font-medium text-slate-600 transition-colors hover:bg-primary/10 hover:text-slate-900"
                        >
                          {item.label}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </nav>
        </div>
      )}
    </div>
  );
}

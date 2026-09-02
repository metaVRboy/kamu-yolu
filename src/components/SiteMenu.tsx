"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Menu,
  Home,
  GraduationCap,
  Calculator,
  Repeat,
  Target,
  Newspaper,
  ChevronDown,
  ListChecks,
} from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type FlatItem = { type: "link"; href: string; label: string; icon: typeof Home };
type GroupItem = {
  type: "group";
  label: string;
  icon: typeof Home;
  items: { href: string; label: string }[];
};

// Sitedeki sayfalar arttikca buraya yeni girdiler eklenecek.
const MENU_ITEMS: (FlatItem | GroupItem)[] = [
  { type: "link", href: "/", label: "Ana Sayfa", icon: Home },
  { type: "link", href: "/amacimiz", label: "Amacımız", icon: Target },
  { type: "link", href: "/haberler", label: "Haberler", icon: Newspaper },
  { type: "link", href: "/kpss-puan-hesaplama", label: "KPSS Puan Hesaplama", icon: Calculator },
  { type: "link", href: "/becayis", label: "Becayiş İlanları", icon: Repeat },
  {
    type: "group",
    label: "Aktif İlanlar",
    icon: ListChecks,
    items: [
      { href: "/ilanlar", label: "Tüm İlanlar" },
      { href: "/seviye/lise", label: "Lise Mezunları İçin İlanlar" },
      { href: "/seviye/onlisans", label: "Önlisans Mezunları İçin İlanlar" },
      { href: "/seviye/lisans", label: "Lisans Mezunları İçin İlanlar" },
    ],
  },
];

export function SiteMenu() {
  const [open, setOpen] = useState(false);
  const [openGroup, setOpenGroup] = useState<string | null>("Aktif İlanlar");

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger
        render={
          <Button
            variant="ghost"
            size="icon"
            aria-label="Menüyü aç"
            className="text-slate-700 hover:bg-primary/10 hover:text-slate-900"
          />
        }
      >
        <Menu className="h-5 w-5" />
      </SheetTrigger>
      <SheetContent side="left" className="w-72">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <Image src="/brand/kamu-yolu-emblem.png" alt="" width={32} height={32} className="h-8 w-8" />
            Kamu Yolu
          </SheetTitle>
        </SheetHeader>
        <nav className="flex flex-col gap-1 px-2">
          {MENU_ITEMS.map((item) => {
            if (item.type === "link") {
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setOpen(false)}
                  className="flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm font-medium text-slate-700 transition-colors hover:bg-primary/10 hover:text-slate-900"
                >
                  <item.icon className="h-4 w-4" />
                  {item.label}
                </Link>
              );
            }

            const isOpen = openGroup === item.label;
            return (
              <div key={item.label}>
                <button
                  type="button"
                  onClick={() => setOpenGroup(isOpen ? null : item.label)}
                  className="flex w-full items-center justify-between gap-2.5 rounded-xl px-3 py-2.5 text-sm font-medium text-slate-700 transition-colors hover:bg-primary/10 hover:text-slate-900"
                >
                  <span className="flex items-center gap-2.5">
                    <item.icon className="h-4 w-4" />
                    {item.label}
                  </span>
                  <ChevronDown className={cn("h-4 w-4 transition-transform", isOpen && "rotate-180")} />
                </button>
                {isOpen && (
                  <div className="ml-4 flex flex-col gap-1 border-l border-primary/15 pl-3">
                    {item.items.map((sub) => (
                      <Link
                        key={sub.href}
                        href={sub.href}
                        onClick={() => setOpen(false)}
                        className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-slate-600 transition-colors hover:bg-primary/10 hover:text-slate-900"
                      >
                        <GraduationCap className="h-3.5 w-3.5" />
                        {sub.label}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </nav>
      </SheetContent>
    </Sheet>
  );
}

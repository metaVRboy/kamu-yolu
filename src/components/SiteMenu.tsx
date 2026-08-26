"use client";

import Link from "next/link";
import { Menu, Landmark, Home, GraduationCap } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";

// Sitedeki sayfalar arttikca buraya yeni girdiler eklenecek.
const MENU_ITEMS = [
  { href: "/", label: "Ana Sayfa", icon: Home },
  { href: "/seviye/lise", label: "Lise Mezunları İçin İlanlar", icon: GraduationCap },
  { href: "/seviye/onlisans", label: "Önlisans Mezunları İçin İlanlar", icon: GraduationCap },
  { href: "/seviye/lisans", label: "Lisans Mezunları İçin İlanlar", icon: GraduationCap },
];

export function SiteMenu() {
  return (
    <Sheet>
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
          <SheetTitle className="flex items-center gap-2.5">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <Landmark className="h-4 w-4" />
            </span>
            Kamu Yolu
          </SheetTitle>
        </SheetHeader>
        <nav className="flex flex-col gap-1 px-2">
          {MENU_ITEMS.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm font-medium text-slate-700 transition-colors hover:bg-primary/10 hover:text-slate-900"
            >
              <item.icon className="h-4 w-4" />
              {item.label}
            </Link>
          ))}
        </nav>
      </SheetContent>
    </Sheet>
  );
}

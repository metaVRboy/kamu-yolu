"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BadgePercent, Bell, LayoutDashboard, MessageSquareText, Newspaper, Users } from "lucide-react";
import { cn } from "@/lib/utils";

const MENU = [
  { href: "/admin", ad: "Gösterge paneli", ikon: LayoutDashboard },
  { href: "/admin/bildirimler", ad: "Bildirimler", ikon: Bell },
  { href: "/admin/fiyatlar", ad: "Fiyat ve kampanyalar", ikon: BadgePercent },
  { href: "/admin/uyeler", ad: "Üyeler", ikon: Users },
  { href: "/admin/haberler", ad: "Haberler", ikon: Newspaper },
  { href: "/admin/sms", ad: "SMS kayıtları", ikon: MessageSquareText },
];

/** Admin yan menusu; dar ekranda ustte yatay kaydirilan sekmeler. */
export function AdminMenu() {
  const pathname = usePathname();
  return (
    <nav className="-mx-4 flex gap-1.5 overflow-x-auto px-4 pb-1 lg:sticky lg:top-24 lg:mx-0 lg:w-60 lg:shrink-0 lg:flex-col lg:self-start lg:overflow-visible lg:rounded-3xl lg:border lg:border-primary/10 lg:bg-white lg:p-3 lg:shadow-sm">
      <p className="hidden px-3 pt-1 pb-2 text-[11px] font-bold tracking-widest text-muted-foreground uppercase lg:block">Admin paneli</p>
      {MENU.map(({ href, ad, ikon: Ikon }) => {
        const aktif = href === "/admin" ? pathname === "/admin" : pathname.startsWith(href);
        return (
          <Link
            key={href}
            href={href}
            className={cn(
              "flex shrink-0 items-center gap-2.5 rounded-xl px-3 py-2 text-sm font-medium whitespace-nowrap transition-colors",
              aktif ? "bg-primary text-primary-foreground shadow-sm" : "bg-white text-slate-700 hover:bg-primary/10 lg:bg-transparent",
            )}
          >
            <Ikon className="h-4 w-4" />
            {ad}
          </Link>
        );
      })}
    </nav>
  );
}

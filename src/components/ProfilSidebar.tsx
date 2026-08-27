"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronDown, FilePlus2, Inbox, Repeat, UserRound } from "lucide-react";
import { cn } from "@/lib/utils";

type SidebarSection = {
  key: string;
  label: string;
  icon: typeof Repeat;
  items: { href: string; label: string; icon: typeof FilePlus2; badge?: number }[];
};

export function ProfilSidebar({ okunmamisMesajSayisi }: { okunmamisMesajSayisi: number }) {
  const pathname = usePathname();
  const [openSection, setOpenSection] = useState<string | null>("becayis");

  // Zamanla yeni basliklar eklendikce buraya yeni bir SidebarSection
  // girdisi eklemek yeterli olacak.
  const sections: SidebarSection[] = [
    {
      key: "becayis",
      label: "Becayiş",
      icon: Repeat,
      items: [
        { href: "/becayis/talep-olustur", label: "Talep Oluştur", icon: FilePlus2 },
        {
          href: "/becayis/taleplerim",
          label: "Mevcut Taleplerim",
          icon: Inbox,
          badge: okunmamisMesajSayisi,
        },
      ],
    },
  ];

  return (
    <nav className="space-y-2">
      <Link
        href="/profilim"
        className={cn(
          "flex items-center gap-2.5 rounded-xl border border-primary/15 bg-white/70 px-3.5 py-2.5 text-sm font-semibold backdrop-blur-md transition-colors",
          pathname === "/profilim" ? "text-primary" : "text-slate-800 hover:text-primary",
        )}
      >
        <UserRound className="h-4 w-4" />
        Profilim
      </Link>

      {sections.map((section) => {
        const open = openSection === section.key;
        return (
          <div key={section.key} className="rounded-xl border border-primary/15 bg-white/70 backdrop-blur-md">
            <button
              type="button"
              onClick={() => setOpenSection(open ? null : section.key)}
              className="flex w-full items-center justify-between rounded-xl px-3.5 py-2.5 text-left text-sm font-semibold text-slate-800"
            >
              <span className="flex items-center gap-2.5">
                <section.icon className="h-4 w-4 text-primary" />
                {section.label}
              </span>
              <ChevronDown className={cn("h-4 w-4 text-muted-foreground transition-transform", open && "rotate-180")} />
            </button>
            {open && (
              <div className="space-y-1 px-2 pb-2">
                {section.items.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      "flex items-center justify-between gap-2.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors hover:bg-primary/10 hover:text-slate-900",
                      pathname === item.href ? "bg-primary/10 text-primary" : "text-slate-700",
                    )}
                  >
                    <span className="flex items-center gap-2.5">
                      <item.icon className="h-3.5 w-3.5" />
                      {item.label}
                    </span>
                    {!!item.badge && (
                      <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-primary px-1.5 text-xs font-semibold text-primary-foreground">
                        {item.badge}
                      </span>
                    )}
                  </Link>
                ))}
              </div>
            )}
          </div>
        );
      })}
    </nav>
  );
}

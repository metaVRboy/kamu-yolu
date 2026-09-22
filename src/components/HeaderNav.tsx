"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

export const PLAIN_LINKS = [
  { href: "/", label: "Ana Sayfa" },
  { href: "/amacimiz", label: "Hakkımızda" },
  { href: "/haberler", label: "Haberler" },
  { href: "/kpss-puan-hesaplama", label: "KPSS Puan Hesaplama" },
];

export const DROPDOWNS = [
  {
    href: "/ilanlar",
    label: "Aktif İlanlar",
    items: [
      { href: "/ilanlar", label: "Tüm İlanlar" },
      { href: "/seviye/lise", label: "Lise Mezunları İçin İlanlar" },
      { href: "/seviye/onlisans", label: "Önlisans Mezunları İçin İlanlar" },
      { href: "/seviye/lisans", label: "Lisans Mezunları İçin İlanlar" },
    ],
  },
  {
    href: "/becayis",
    label: "Becayiş İlanları",
    items: [
      { href: "/becayis/talep-olustur", label: "Talep Oluştur" },
      { href: "/becayis/taleplerim", label: "Mevcut Taleplerim" },
      { href: "/becayis/ilgilendiklerim", label: "İlgilendiğim İlanlar" },
    ],
  },
];

const CLOSE_DELAY_MS = 150;

export function HeaderNav() {
  const pathname = usePathname();
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const [direction, setDirection] = useState<"left" | "right">("right");
  const [panelLeft, setPanelLeft] = useState(0);
  const lastIndexRef = useRef<number | null>(null);
  const navRef = useRef<HTMLDivElement>(null);
  const triggerRefs = useRef<(HTMLAnchorElement | null)[]>([]);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  function cancelClose() {
    if (closeTimer.current) {
      clearTimeout(closeTimer.current);
      closeTimer.current = null;
    }
  }

  function scheduleClose() {
    cancelClose();
    closeTimer.current = setTimeout(() => {
      setOpenIndex(null);
      lastIndexRef.current = null;
    }, CLOSE_DELAY_MS);
  }

  function handleTriggerEnter(index: number) {
    cancelClose();
    const prev = lastIndexRef.current;
    if (prev !== null && index !== prev) {
      setDirection(index > prev ? "right" : "left");
    }
    lastIndexRef.current = index;
    setOpenIndex(index);

    const trigger = triggerRefs.current[index];
    const nav = navRef.current;
    if (trigger && nav) {
      const navRect = nav.getBoundingClientRect();
      const triggerRect = trigger.getBoundingClientRect();
      setPanelLeft(triggerRect.left - navRect.left);
    }
  }

  function handlePlainEnter() {
    cancelClose();
    setOpenIndex(null);
    lastIndexRef.current = null;
  }

  function isActive(href: string) {
    return pathname === href || pathname.startsWith(`${href}/`);
  }

  return (
    <div ref={navRef} className="relative flex items-center gap-1">
      {PLAIN_LINKS.map((link) => (
        <Link
          key={link.href}
          href={link.href}
          onMouseEnter={handlePlainEnter}
          className={cn(
            "rounded-lg px-3 py-2 text-sm font-medium whitespace-nowrap transition-colors",
            isActive(link.href) ? "bg-primary/10 text-primary" : "text-slate-600 hover:text-primary",
          )}
        >
          {link.label}
        </Link>
      ))}

      {DROPDOWNS.map((group, index) => (
        <Link
          key={group.href}
          href={group.href}
          ref={(el) => {
            triggerRefs.current[index] = el;
          }}
          onMouseEnter={() => handleTriggerEnter(index)}
          className={cn(
            "flex items-center gap-1 rounded-lg px-3 py-2 text-sm font-medium whitespace-nowrap transition-colors",
            isActive(group.href) || openIndex === index
              ? "bg-primary/10 text-primary"
              : "text-slate-600 hover:text-primary",
          )}
        >
          {group.label}
          <ChevronDown className="h-3.5 w-3.5" />
        </Link>
      ))}

      {openIndex !== null && (
        <div
          className="absolute top-full z-50 pt-2 transition-[left] duration-200 ease-out"
          style={{ left: panelLeft }}
          onMouseEnter={cancelClose}
          onMouseLeave={scheduleClose}
        >
          <div
            key={openIndex}
            className={cn(
              "w-56 overflow-hidden rounded-2xl border border-primary/20 bg-white p-1.5 shadow-xl shadow-primary/10",
              direction === "right" ? "animate-menu-slide-right" : "animate-menu-slide-left",
            )}
          >
            {DROPDOWNS[openIndex].items.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="block rounded-lg px-3 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-primary/10 hover:text-slate-900"
              >
                {item.label}
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

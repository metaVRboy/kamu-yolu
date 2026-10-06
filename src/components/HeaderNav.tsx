"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronDown, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

export type MenuOgesi = { href?: string; label: string; items?: MenuOgesi[] };

// Ust menu, soldan saga gosterim sirasiyla. `items` olan oge acilir menudur;
// alt ogelerin de `items`i olabilir (ic ice acilir menu, ör. Ilanlar > Kamu Alim Ilanlari).
export const MENU: MenuOgesi[] = [
  { href: "/", label: "Ana Sayfa" },
  { href: "/amacimiz", label: "Hakkımızda" },
  { href: "/haberler", label: "Haberler" },
  {
    label: "KPSS",
    items: [
      { href: "/kpss-puan-hesaplama", label: "KPSS Puan Hesaplama" },
      { href: "/kpss-denemesi", label: "KPSS Denemesi" },
    ],
  },
  { href: "/analiz", label: "Alım Analizi" },
  {
    label: "İlanlar",
    items: [
      {
        href: "/ilanlar",
        label: "Kamu Alım İlanları",
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
          { href: "/becayis", label: "Tüm Becayiş İlanları" },
          { href: "/becayis/talep-olustur", label: "Talep Oluştur" },
          { href: "/becayis/taleplerim", label: "Mevcut Taleplerim" },
          { href: "/becayis/ilgilendiklerim", label: "İlgilendiğim İlanlar" },
        ],
      },
    ],
  },
];

/** Oge ya da altindaki herhangi bir sayfa aciksa aktif sayilir. */
export function menuAktifMi(oge: MenuOgesi, pathname: string): boolean {
  if (oge.href && (pathname === oge.href || (oge.href !== "/" && pathname.startsWith(`${oge.href}/`)))) return true;
  return oge.items?.some((alt) => menuAktifMi(alt, pathname)) ?? false;
}

const CLOSE_DELAY_MS = 150;
const PANEL_GENISLIK = 224; // w-56

export function HeaderNav() {
  const pathname = usePathname();
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const [direction, setDirection] = useState<"left" | "right">("right");
  const [panelLeft, setPanelLeft] = useState(0);
  // Sag kenara yakin menulerde ic ice panel ekrandan tasmasin diye sola acilir.
  const [altSola, setAltSola] = useState(false);
  const lastIndexRef = useRef<number | null>(null);
  const navRef = useRef<HTMLDivElement>(null);
  const triggerRefs = useRef<(HTMLElement | null)[]>([]);
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
      const triggerRect = trigger.getBoundingClientRect();
      setPanelLeft(triggerRect.left - nav.getBoundingClientRect().left);
      setAltSola(triggerRect.left + 2 * PANEL_GENISLIK + 16 > window.innerWidth);
    }
  }

  function handlePlainEnter() {
    cancelClose();
    setOpenIndex(null);
    lastIndexRef.current = null;
  }

  const acikGrup = openIndex !== null ? MENU[openIndex] : null;

  return (
    <div ref={navRef} className="relative flex items-center gap-1">
      {MENU.map((oge, index) => {
        const sinif = cn(
          "flex items-center gap-1 rounded-lg px-3 py-2 text-sm font-medium whitespace-nowrap transition-colors",
          menuAktifMi(oge, pathname) || openIndex === index ? "bg-primary/10 text-primary" : "text-slate-600 hover:text-primary",
        );
        if (!oge.items) {
          return (
            <Link key={oge.label} href={oge.href!} onMouseEnter={handlePlainEnter} className={sinif}>
              {oge.label}
            </Link>
          );
        }
        return (
          <button
            key={oge.label}
            type="button"
            ref={(el) => {
              triggerRefs.current[index] = el;
            }}
            onMouseEnter={() => handleTriggerEnter(index)}
            onClick={() => (openIndex === index ? setOpenIndex(null) : handleTriggerEnter(index))}
            aria-expanded={openIndex === index}
            className={sinif}
          >
            {oge.label}
            <ChevronDown className="h-3.5 w-3.5" />
          </button>
        );
      })}

      {acikGrup?.items && (
        <div
          className="absolute top-full z-50 pt-2 transition-[left] duration-200 ease-out"
          style={{ left: panelLeft }}
          onMouseEnter={cancelClose}
          onMouseLeave={scheduleClose}
        >
          <div
            key={openIndex}
            className={cn(
              "w-56 rounded-2xl border border-primary/20 bg-white p-1.5 shadow-xl shadow-primary/10",
              direction === "right" ? "animate-menu-slide-right" : "animate-menu-slide-left",
            )}
          >
            {acikGrup.items.map((item) =>
              item.items ? (
                // Ic ice menu: uzerine gelince (ya da klavyeyle odaklaninca) yan panel acilir.
                <div key={item.label} className="group/alt relative">
                  <Link
                    href={item.href!}
                    className={cn(
                      "flex items-center justify-between rounded-lg px-3 py-2 text-sm font-medium transition-colors group-hover/alt:bg-primary/10 group-hover/alt:text-slate-900",
                      menuAktifMi(item, pathname) ? "text-primary" : "text-slate-700",
                    )}
                  >
                    {item.label}
                    <ChevronRight className="h-3.5 w-3.5" />
                  </Link>
                  <div
                    className={cn(
                      "absolute -top-1.5 hidden group-focus-within/alt:block group-hover/alt:block",
                      altSola ? "right-full pr-2" : "left-full pl-2",
                    )}
                  >
                    <div className="w-56 rounded-2xl border border-primary/20 bg-white p-1.5 shadow-xl shadow-primary/10">
                      {item.items.map((alt) => (
                        <MenuLinki key={alt.href} oge={alt} />
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <MenuLinki key={item.href} oge={item} />
              ),
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function MenuLinki({ oge }: { oge: MenuOgesi }) {
  return (
    <Link
      href={oge.href!}
      className="block rounded-lg px-3 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-primary/10 hover:text-slate-900"
    >
      {oge.label}
    </Link>
  );
}

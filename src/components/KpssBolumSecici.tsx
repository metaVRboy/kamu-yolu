"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { sayfaYuklemesiniBaslat } from "@/components/SayfaYuklemeCizgisi";
import { Search, X } from "lucide-react";
import { LEVEL_LABEL } from "@/lib/labels";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import type { KpssBolum } from "@/lib/kpssIstatistik";

function normalizeTr(text: string): string {
  return text.trim().toLocaleLowerCase("tr-TR");
}

export function KpssBolumSecici({ bolumler, seciliAd }: { bolumler: KpssBolum[]; seciliAd?: string }) {
  const [query, setQuery] = useState(seciliAd ?? "");
  const [isOpen, setIsOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  // Acilir menuden secilen ama henuz "Ara"ya basilmamis bolum - aramayi
  // sadece kullanici butona basinca (veya Enter'a basinca) tetikleriz.
  const [taslakBolum, setTaslakBolum] = useState<KpssBolum | null>(null);
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const listRef = useRef<HTMLUListElement>(null);

  const filtered = useMemo(() => {
    const q = normalizeTr(query);
    if (!q) return bolumler.slice(0, 30);
    return bolumler.filter((b) => normalizeTr(b.ad).includes(q)).slice(0, 30);
  }, [query, bolumler]);

  const aranacakBolum =
    taslakBolum && normalizeTr(taslakBolum.ad) === normalizeTr(query)
      ? taslakBolum
      : bolumler.find((b) => normalizeTr(b.ad) === normalizeTr(query));

  useEffect(() => {
    if (activeIndex < 0) return;
    const item = listRef.current?.children[activeIndex] as HTMLElement | undefined;
    item?.scrollIntoView({ block: "nearest" });
  }, [activeIndex]);

  function bolumuSec(bolum: KpssBolum) {
    setQuery(bolum.ad);
    setTaslakBolum(bolum);
    setIsOpen(false);
    setActiveIndex(-1);
  }

  function ara(bolum: KpssBolum) {
    setQuery(bolum.ad);
    setTaslakBolum(bolum);
    setIsOpen(false);
    setActiveIndex(-1);
    const params = new URLSearchParams(searchParams.toString());
    params.set("bolum", bolum.id);
    // Sayfa basina ziplamasin; karne arama kutusunun hemen altinda acilir.
    sayfaYuklemesiniBaslat(`${pathname}?${params.toString()}`);
    router.push(`${pathname}?${params.toString()}`, { scroll: false });
  }

  function temizle() {
    setQuery("");
    setTaslakBolum(null);
    const params = new URLSearchParams(searchParams.toString());
    params.delete("bolum");
    const q = params.toString();
    sayfaYuklemesiniBaslat(q ? `${pathname}?${q}` : pathname);
    router.push(q ? `${pathname}?${q}` : pathname, { scroll: false });
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "ArrowDown" && isOpen && filtered.length > 0) {
      e.preventDefault();
      setActiveIndex((i) => (i + 1) % filtered.length);
    } else if (e.key === "ArrowUp" && isOpen && filtered.length > 0) {
      e.preventDefault();
      setActiveIndex((i) => (i <= 0 ? filtered.length - 1 : i - 1));
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (isOpen && filtered.length > 0) {
        const target = activeIndex >= 0 ? filtered[activeIndex] : filtered[0];
        if (target) ara(target);
        return;
      }
      if (aranacakBolum) ara(aranacakBolum);
    } else if (e.key === "Escape") {
      setIsOpen(false);
    }
  }

  return (
    <div className="flex w-full max-w-lg items-start gap-2">
      <div className="relative min-w-0 flex-1">
        <div className="relative">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setIsOpen(true);
              setActiveIndex(-1);
            }}
            onFocus={() => setIsOpen(true)}
            onBlur={() => setTimeout(() => setIsOpen(false), 150)}
            onKeyDown={handleKeyDown}
            role="combobox"
            aria-expanded={isOpen}
            placeholder="Bir bölüm seç (ör. Bilgisayar Mühendisliği)"
            className="h-11 rounded-xl border-primary/20 bg-white pl-10 pr-9 text-sm"
          />
          {seciliAd && (
            <button
              type="button"
              onClick={temizle}
              aria-label="Seçimi temizle"
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        {isOpen && filtered.length > 0 && (
          // Yuvarlatma (rounded) ve kaydirma (overflow-y-auto) AYRI katmanlarda:
          // native scrollbar (ozellikle Windows'ta) kendi koselerini
          // yuvarlamaz, ayni elemanda ikisi birlikte olursa sag ust/alt
          // kose "kesilmis" gibi gorunuyordu. Disaridaki kesin kirpiyor,
          // icerideki sadece kaydiriyor.
          <div className="absolute z-50 mt-2 w-full overflow-hidden rounded-2xl border border-primary/15 bg-white/95 shadow-lg backdrop-blur-xl">
            <ul ref={listRef} className="max-h-[26rem] overflow-y-auto p-1">
              {filtered.map((b, i) => (
                <li key={b.id}>
                  <button
                    type="button"
                    onMouseDown={(e) => {
                      e.preventDefault();
                      bolumuSec(b);
                    }}
                    onMouseEnter={() => setActiveIndex(i)}
                    className={`flex w-full items-center justify-between rounded-xl px-3 py-2 text-left text-sm hover:bg-primary/10 ${
                      i === activeIndex ? "bg-primary/10" : ""
                    }`}
                  >
                    <span>{b.ad}</span>
                    <Badge className="border-primary/15 bg-primary/10 font-normal text-primary">
                      {LEVEL_LABEL[b.ogrenimDuzeyi] ?? b.ogrenimDuzeyi}
                    </Badge>
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}
        {isOpen && query && filtered.length === 0 && (
          <div className="absolute z-50 mt-2 w-full rounded-2xl border border-primary/15 bg-white/95 px-4 py-3 text-sm text-muted-foreground shadow-lg">
            Bölüm bulunamadı.
          </div>
        )}
      </div>
      <button
        type="button"
        onClick={() => aranacakBolum && ara(aranacakBolum)}
        disabled={!aranacakBolum}
        className="h-11 shrink-0 rounded-xl bg-primary px-4 text-sm font-semibold text-primary-foreground hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-40"
      >
        Ara
      </button>
    </div>
  );
}

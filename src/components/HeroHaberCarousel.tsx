"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";
import { HaberGorsel } from "@/components/HaberGorsel";
import { Badge } from "@/components/ui/badge";
import { isYeni, type HaberItem } from "@/components/HaberlerSection";
import { cn } from "@/lib/utils";

const ROTATE_MS = 6000;

export function HeroHaberCarousel({ haberler }: { haberler: HaberItem[] }) {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (haberler.length <= 1 || paused) return;
    const timer = setInterval(() => {
      setIndex((i) => (i + 1) % haberler.length);
    }, ROTATE_MS);
    return () => clearInterval(timer);
  }, [haberler.length, paused]);

  if (haberler.length === 0) return null;

  const haber = haberler[index];

  return (
    <div
      className="group relative h-full min-h-[360px] overflow-hidden rounded-3xl shadow-sm"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <HaberGorsel
        key={haber.id}
        src={haber.gorselUrl}
        alt={haber.baslik}
        logoMu={haber.gorselLogoMu}
        className="absolute inset-0 h-full w-full"
      />
      <div aria-hidden className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/35 to-black/10" />

      <div className="absolute inset-x-0 bottom-0 flex flex-col gap-3 p-6 sm:p-8">
        {isYeni(haber.yayinTarihi) && (
          <Badge className="w-fit border-transparent bg-red-600 text-white shadow">YENİ</Badge>
        )}
        <h3 className="max-w-xl text-xl font-bold leading-snug text-white sm:text-2xl">
          {haber.baslik}
        </h3>
        <p className="line-clamp-2 max-w-xl text-sm text-white/80 sm:text-base">{haber.ozet}</p>
        <Link
          href={`/haberler/${haber.slug}`}
          className="mt-1 flex w-fit items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-semibold text-slate-900 shadow transition hover:bg-white/90"
        >
          Detayları İncele
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>

      {haberler.length > 1 && (
        <>
          <button
            type="button"
            aria-label="Önceki haber"
            onClick={() => setIndex((i) => (i - 1 + haberler.length) % haberler.length)}
            className="absolute left-3 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-black/40 text-white opacity-0 transition hover:bg-black/60 group-hover:opacity-100"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <button
            type="button"
            aria-label="Sonraki haber"
            onClick={() => setIndex((i) => (i + 1) % haberler.length)}
            className="absolute right-3 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-black/40 text-white opacity-0 transition hover:bg-black/60 group-hover:opacity-100"
          >
            <ChevronRight className="h-5 w-5" />
          </button>

          <div className="absolute bottom-3 right-4 flex gap-1.5">
            {haberler.map((item, i) => (
              <button
                key={item.id}
                type="button"
                aria-label={`${i + 1}. haber`}
                onClick={() => setIndex(i)}
                className={cn(
                  "h-1.5 w-5 rounded-full transition",
                  i === index ? "bg-white" : "bg-white/40",
                )}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}

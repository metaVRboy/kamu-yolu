"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";
import { HaberGorsel } from "@/components/HaberGorsel";
import { Badge } from "@/components/ui/badge";
import { isYeni, type HaberItem } from "@/components/HaberlerSection";
import { cn } from "@/lib/utils";

const ROTATE_MS = 6000;
const KAYDIRMA_ESIGI_PX = 50;

/**
 * Ana sayfa haber vitrini: haberler yan yana bir serit; gecislerde serit kayar.
 * Kesintisiz dongu icin seridin basina son haberin, sonuna ilk haberin kopyasi
 * eklenir ([son, 1..n, ilk]); kopyaya kayma bitince gecissiz olarak asil
 * haberin konumuna atlanir, boylece sondan basa da hep ayni yone kayar.
 */
export function HeroHaberCarousel({ haberler }: { haberler: HaberItem[] }) {
  const n = haberler.length;
  const [konum, setKonum] = useState(1); // seritteki slayt; 1..n asil haberler
  const [gecisli, setGecisli] = useState(true);
  const [paused, setPaused] = useState(false);
  const dokunmaX = useRef<number | null>(null);

  // Kopya slayttan sonra bir adim daha atilirsa (hareket azaltma acikken kayma
  // bitis olayi gelmez) dogrudan asil komsuya gecilir.
  const ileri = () => {
    setGecisli(true);
    setKonum((k) => (k >= n + 1 ? 2 : k + 1));
  };
  const geri = () => {
    setGecisli(true);
    setKonum((k) => (k <= 0 ? n - 1 : k - 1));
  };

  useEffect(() => {
    if (n <= 1 || paused) return;
    const timer = setInterval(ileri, ROTATE_MS);
    return () => clearInterval(timer);
    // ileri her render'da yeni; yalniz sayac/duraklatma degisince yeniden kurulur.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [n, paused]);

  // Kopyadan asil konuma gecissiz atladiktan sonra gecisi bir sonraki karede geri ac.
  useEffect(() => {
    if (gecisli) return;
    const kare = requestAnimationFrame(() => requestAnimationFrame(() => setGecisli(true)));
    return () => cancelAnimationFrame(kare);
  }, [gecisli]);

  if (n === 0) return null;

  const slaytlar = n > 1 ? [haberler[n - 1], ...haberler, haberler[0]] : haberler;
  const aktif = n > 1 ? (konum - 1 + n) % n : 0;

  function kaymaBitti() {
    if (konum === n + 1 || konum === 0) {
      setGecisli(false);
      setKonum(konum === 0 ? n : 1);
    }
  }

  return (
    <div
      className="group relative h-full min-h-[360px] overflow-hidden rounded-3xl shadow-sm"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onTouchStart={(e) => {
        dokunmaX.current = e.touches[0].clientX;
      }}
      onTouchEnd={(e) => {
        if (dokunmaX.current === null || n <= 1) return;
        const fark = e.changedTouches[0].clientX - dokunmaX.current;
        dokunmaX.current = null;
        if (fark <= -KAYDIRMA_ESIGI_PX) ileri();
        else if (fark >= KAYDIRMA_ESIGI_PX) geri();
      }}
    >
      <div
        className={cn("flex h-full", gecisli && "transition-transform duration-500 ease-out motion-reduce:transition-none")}
        style={{ transform: `translateX(-${(n > 1 ? konum : 0) * 100}%)` }}
        onTransitionEnd={(e) => e.target === e.currentTarget && kaymaBitti()}
      >
        {slaytlar.map((haber, i) => (
          // Kopya slaytlar ekran okuyucudan ve klavye sirasindan gizli; gorunen yalniz aktif haber.
          <div key={`${haber.id}-${i}`} className="relative h-full w-full shrink-0" aria-hidden={i !== konum} inert={i !== konum}>
            <HaberGorsel src={haber.gorselUrl} alt={haber.baslik} logoMu={haber.gorselLogoMu} hemenYukle className="absolute inset-0 h-full w-full" />
            <div aria-hidden className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/35 to-black/10" />

            <div className="absolute inset-x-0 bottom-0 flex flex-col gap-3 p-6 sm:p-8">
              {isYeni(haber.yayinTarihi) && (
                <Badge className="w-fit border-transparent bg-red-600 text-white shadow">YENİ</Badge>
              )}
              <h3 className="max-w-xl text-xl font-bold leading-snug text-white sm:text-2xl">{haber.baslik}</h3>
              <p className="line-clamp-2 max-w-xl text-sm text-white/80 sm:text-base">{haber.ozet}</p>
              <Link
                href={`/haberler/${haber.slug}`}
                className="mt-1 flex w-fit items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-semibold text-slate-900 shadow transition hover:bg-white/90"
              >
                Detayları İncele
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        ))}
      </div>

      {n > 1 && (
        <>
          <button
            type="button"
            aria-label="Önceki haber"
            onClick={geri}
            className="absolute left-3 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-black/40 text-white opacity-0 transition hover:bg-black/60 group-hover:opacity-100"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <button
            type="button"
            aria-label="Sonraki haber"
            onClick={ileri}
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
                onClick={() => {
                  setGecisli(true);
                  setKonum(i + 1);
                }}
                className={cn("h-1.5 w-5 rounded-full transition", i === aktif ? "bg-white" : "bg-white/40")}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}

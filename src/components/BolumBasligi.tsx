import type { CSSProperties } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

// Amblem sekli x soldan saga solma: iki maske katmaninin kesisimi, zemin rengi (bg-primary) gorunur.
const MASKE = "url(/brand/kamu-yolu-emblem.png), linear-gradient(to right, black 30%, transparent)";
const AMBLEM_MASKESI: CSSProperties = {
  maskImage: MASKE,
  WebkitMaskImage: MASKE,
  maskComposite: "intersect",
  WebkitMaskComposite: "source-in",
  maskSize: "contain, 100% 100%",
  WebkitMaskSize: "contain, 100% 100%",
  maskRepeat: "no-repeat",
  WebkitMaskRepeat: "no-repeat",
  maskPosition: "left center",
  WebkitMaskPosition: "left center",
};

/**
 * Sayfa ici bolum basligi (ana sayfa "Haberler", "Yeni Eklenen Ilanlar" vb.):
 * arkada baslik yuksekliginde, soldan saga kaybolan soluk Kamu Yolu amblemi;
 * etiket/baslik/aciklama amblemin tam ustune biner. Sagda sayacli "tumu" butonu.
 */
export function BolumBasligi({
  etiket,
  baslik,
  aciklama,
  tumuHref,
  tumuEtiket = "Tümünü gör",
  sayac,
}: {
  etiket?: string;
  baslik: string;
  aciklama?: string;
  tumuHref?: string;
  tumuEtiket?: string;
  sayac?: number;
}) {
  return (
    <div className="relative pb-5">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div className="flex items-stretch">
          {/* Amblem site mavisinde tek renk, soldan saga kaybolur; tam kayboldugu yerde dik cizgi yaziyi ayirir.
              ponytail: sabit kare boyut ~ yazi blogu yuksekligi; CSS esnetilen yukseklikten genislik turetemiyor. */}
          <span aria-hidden className="size-14 shrink-0 self-center bg-primary opacity-25 sm:size-24" style={AMBLEM_MASKESI} />
          <span aria-hidden className="w-[3px] shrink-0 rounded-full bg-gradient-to-b from-primary to-primary/40" />
          <div className="self-center py-1 pl-3 sm:pl-4">
            {etiket && (
              <p className="mb-1 inline-flex items-center gap-1.5 text-[11px] font-bold tracking-widest text-primary uppercase">
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
                </span>
                {etiket}
              </p>
            )}
            <h2 className="font-sans text-2xl font-bold tracking-tight text-slate-900 sm:text-[1.7rem]">{baslik}</h2>
            {aciklama && <p className="mt-1 max-w-xl text-sm text-muted-foreground">{aciklama}</p>}
          </div>
        </div>
        {tumuHref && (
          <Link
            href={tumuHref}
            className="group inline-flex shrink-0 items-center gap-2 rounded-full border border-primary/15 bg-white px-4 py-2 text-sm font-semibold text-primary shadow-sm transition-all hover:border-primary/40 hover:shadow-md"
          >
            {tumuEtiket}
            {sayac !== undefined && (
              <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-bold tabular-nums">{sayac}</span>
            )}
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
          </Link>
        )}
      </div>
      <div aria-hidden className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-primary/30 via-primary/10 to-transparent" />
    </div>
  );
}

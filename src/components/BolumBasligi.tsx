import Link from "next/link";
import { ArrowRight, type LucideIcon } from "lucide-react";

/**
 * Sayfa ici bolum basligi (ana sayfa "Haberler", "Yeni Eklenen Ilanlar" vb.):
 * gradyanli ikon karosu, canli etiket, baslik/aciklama ve sayacli "tumu" butonu.
 * SayfaBasligi ile ayni gorsel dili kullanir.
 */
export function BolumBasligi({
  ikon: Ikon,
  etiket,
  baslik,
  aciklama,
  tumuHref,
  tumuEtiket = "Tümünü gör",
  sayac,
}: {
  ikon: LucideIcon;
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
        <div className="flex items-start gap-4">
          <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-600 text-white shadow-lg shadow-primary/25">
            <Ikon className="h-6 w-6" />
          </span>
          <div>
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

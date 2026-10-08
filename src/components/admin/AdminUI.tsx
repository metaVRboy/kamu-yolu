import type { ReactNode } from "react";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

/** Admin sayfa basligi. */
export function AdminBaslik({ baslik, aciklama, sag }: { baslik: string; aciklama?: string; sag?: ReactNode }) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-3">
      <div>
        <h1 className="font-sans text-2xl font-bold tracking-tight text-slate-900">{baslik}</h1>
        {aciklama && <p className="mt-1 max-w-2xl text-sm text-muted-foreground">{aciklama}</p>}
      </div>
      {sag}
    </div>
  );
}

/** Admin icerik karti. */
export function AdminKart({ baslik, aciklama, children, className }: { baslik?: string; aciklama?: string; children: ReactNode; className?: string }) {
  return (
    <section className={cn("rounded-3xl border border-primary/10 bg-white p-5 shadow-sm sm:p-6", className)}>
      {baslik && <h2 className="font-sans text-base font-bold text-slate-900">{baslik}</h2>}
      {aciklama && <p className="mt-0.5 text-xs text-muted-foreground">{aciklama}</p>}
      <div className={cn(baslik && "mt-4")}>{children}</div>
    </section>
  );
}

/** Buyuk rakamli istatistik kutusu. */
export function IstatistikKutusu({
  ikon: Ikon,
  etiket,
  deger,
  alt,
  uyari = false,
}: {
  ikon: LucideIcon;
  etiket: string;
  deger: ReactNode;
  alt?: ReactNode;
  uyari?: boolean;
}) {
  return (
    <div className={cn("rounded-3xl border bg-white p-5 shadow-sm", uyari ? "border-red-200 bg-red-50/60" : "border-primary/10")}>
      <div className="flex items-center justify-between gap-2">
        <p className="text-xs font-semibold text-muted-foreground">{etiket}</p>
        <span className={cn("flex h-8 w-8 items-center justify-center rounded-xl", uyari ? "bg-red-100 text-red-600" : "bg-primary/10 text-primary")}>
          <Ikon className="h-4 w-4" />
        </span>
      </div>
      <p className="mt-2 font-sans text-3xl font-bold tracking-tight text-slate-900 tabular-nums">{deger}</p>
      {alt && <p className="mt-0.5 text-xs text-muted-foreground">{alt}</p>}
    </div>
  );
}

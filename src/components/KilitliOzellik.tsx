import type { ReactNode } from "react";
import { Crown, Lock } from "lucide-react";
import { YukseltButonu } from "@/components/YukseltmePenceresi";
import type { Plan, YukseltmeKaynagi } from "@/lib/planlar";
import { cn } from "@/lib/utils";

/**
 * Planin erisemedigi ozellik: icerik ekranda kalir ama bulanik ve tiklanamaz;
 * ustunde neyin acilacagi ve yukseltme secenekleri. Pro gerektiren ozellikte
 * Pro+ da sunulur (Pro'yu kapsar); Pro kullaniciya yalniz Pro+ gosterilir.
 * Onizlemeye gizli veri (dogru cevap vb.) KONULMAMALI - devtools'tan okunur.
 */
export function KilitliOzellik({
  mevcutPlan,
  gerekenPlan,
  baslik,
  ozellikler,
  children,
  kompakt = false,
  uzun = false,
  kaynak,
}: {
  mevcutPlan: Plan;
  gerekenPlan: "PRO" | "PRO_PLUS";
  /** Yukseltme penceresinin basligi ve vurgulanan karsilastirma satiri. */
  kaynak: YukseltmeKaynagi;
  baslik: string;
  ozellikler?: string[];
  children: ReactNode;
  kompakt?: boolean;
  /** Ekrandan uzun icerik: kart ortada kaybolmasin diye ustte yapisik durur. */
  uzun?: boolean;
}) {
  const proSecenegi = gerekenPlan === "PRO" && mevcutPlan === "UCRETSIZ";
  return (
    <div className="relative">
      <div aria-hidden inert className="pointer-events-none blur-[3px] select-none">
        {children}
      </div>
      <div className={cn("absolute inset-0 p-3", uzun ? "pt-10" : "flex items-center justify-center")}>
        <div
          className={cn(
            "mx-auto w-full max-w-md rounded-3xl border border-primary/20 bg-white/95 text-center shadow-xl shadow-primary/15 backdrop-blur-sm",
            kompakt ? "p-3" : "p-5",
            uzun && "sticky top-24",
          )}
        >
          <span className="mx-auto flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 text-primary">
            <Lock className="h-4 w-4" />
          </span>
          <p className={cn("mt-2 font-semibold text-slate-900", kompakt ? "text-sm" : "text-base")}>{baslik}</p>
          {ozellikler && ozellikler.length > 0 && (
            <ul className="mx-auto mt-2 max-w-sm space-y-1 text-left text-xs text-slate-600">
              {ozellikler.map((o) => (
                <li key={o} className="flex gap-1.5">
                  <span className="text-primary">•</span>
                  {o}
                </li>
              ))}
            </ul>
          )}
          <div className="mt-3 flex flex-wrap justify-center gap-2">
            {proSecenegi && (
              <YukseltButonu
                plan="PRO"
                kaynak={kaynak}
                className="inline-flex items-center gap-1.5 rounded-full bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary/90"
              >
                <Crown className="h-4 w-4" />
                Pro&apos;ya yükselt
              </YukseltButonu>
            )}
            <YukseltButonu
              plan="PRO_PLUS"
              kaynak={kaynak}
              className={cn(
                "inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-semibold",
                proSecenegi
                  ? "border border-violet-300 bg-violet-50 text-violet-700 hover:bg-violet-100"
                  : "bg-violet-600 text-white hover:bg-violet-700",
              )}
            >
              <Crown className="h-4 w-4" />
              Pro+&apos;ya yükselt
            </YukseltButonu>
          </div>
        </div>
      </div>
    </div>
  );
}

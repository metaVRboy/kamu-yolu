import Link from "next/link";
import { ArrowRight, BookOpen, GraduationCap, School } from "lucide-react";
import { DENEME_DUZEYLERI, DUZEY_LABEL, DUZEY_TEMA, SINAV_SURESI_DK, TOPLAM_SORU, type DenemeDuzeyi } from "@/lib/kpssDenemeSabitler";
import { cn } from "@/lib/utils";

const DUZEY_IKONU = { LISE: School, ONLISANS: BookOpen, LISANS: GraduationCap } as const;
// Yalniz sag yarida, duzey kartlarinin arkasindan gecer; soldaki yaziyla kesismez.
const YOL = "M 46 112 C 56 72, 72 84, 82 46 S 97 4, 106 -10";

/** Ana sayfanin ortasindaki koyu lacivert vurgu bandi: gunun KPSS denemelerine kisa yol. */
export function KpssBandi() {
  return (
    <section data-yol-gecis className="relative overflow-hidden bg-[#0f2340] py-14 text-white sm:py-16">
      <div aria-hidden className="pointer-events-none absolute inset-0">
        <div className="absolute -top-32 -left-24 h-96 w-96 rounded-full bg-[radial-gradient(circle,rgba(37,99,235,0.45),transparent_65%)]" />
        <div className="absolute -right-24 -bottom-40 h-[28rem] w-[28rem] rounded-full bg-[radial-gradient(circle,rgba(198,163,95,0.35),transparent_65%)]" />
        <svg className="absolute inset-0 hidden h-full w-full lg:block" viewBox="0 0 100 100" preserveAspectRatio="none">
          <path d={YOL} fill="none" stroke="rgba(198,163,95,0.22)" strokeWidth="34" strokeLinecap="round" vectorEffect="non-scaling-stroke" />
          <path className="ana-yol-serit" d={YOL} fill="none" stroke="rgba(255,255,255,0.45)" strokeWidth="2.5" strokeDasharray="16 14" vectorEffect="non-scaling-stroke" />
        </svg>
      </div>

      <div className="gorununce-belir relative mx-auto grid max-w-6xl items-center gap-8 px-4 sm:px-6 lg:grid-cols-[1fr_minmax(0,560px)]">
        <div>
          <p className="inline-flex items-center gap-2 text-[11px] font-bold tracking-[0.2em] text-[#e8cf96] uppercase">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#e8cf96] opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-[#c6a35f]" />
            </span>
            Her gün yeni deneme
          </p>
          <h2 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">Bugünün KPSS denemesi hazır.</h2>
          <p className="mt-3 max-w-md text-sm leading-relaxed text-slate-300 sm:text-base">
            Gerçek sınav formatında {TOPLAM_SORU} soru, {SINAV_SURESI_DK} dakika. Bitirdiğin an ders karnen, açıklamalı çözümlerin ve konu analizin hazır.
          </p>
        </div>

        <div className="grid gap-3 sm:grid-cols-3">
          {DENEME_DUZEYLERI.map((duzey) => {
            const d = duzey as DenemeDuzeyi;
            const Ikon = DUZEY_IKONU[d];
            return (
              <Link
                key={d}
                href={`/kpss-denemesi/${d.toLowerCase()}`}
                className="group rounded-2xl border border-white/10 bg-white/[0.06] p-4 backdrop-blur-sm transition-all duration-300 hover:-translate-y-1 hover:border-white/25 hover:bg-white/[0.1]"
              >
                <span className={cn("flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br text-white shadow-lg", DUZEY_TEMA[d].zemin)}>
                  <Ikon className="h-5 w-5" />
                </span>
                <p className="mt-3 font-semibold">{DUZEY_LABEL[d]}</p>
                <p className="text-xs text-slate-400">
                  {TOPLAM_SORU} soru · {SINAV_SURESI_DK} dk
                </p>
                <span className="mt-3 inline-flex items-center gap-1 text-sm font-semibold text-[#e8cf96]">
                  Başla <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </span>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}

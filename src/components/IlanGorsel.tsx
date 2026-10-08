"use client";

import { useState } from "react";
import { Briefcase, Building2, Castle, Factory, GraduationCap, HeartPulse, Landmark, type LucideIcon } from "lucide-react";

// Kurum turune gore renk + ikon - logo olmasa bile kart turunu anlatir.
const TEMA: Record<string, { zemin: string; ikon: LucideIcon }> = {
  UNIVERSITE: { zemin: "from-indigo-600 via-violet-600 to-purple-700", ikon: GraduationCap },
  BAKANLIK: { zemin: "from-blue-700 via-blue-600 to-sky-600", ikon: Landmark },
  HASTANE: { zemin: "from-emerald-600 via-teal-600 to-cyan-700", ikon: HeartPulse },
  BELEDIYE: { zemin: "from-amber-500 via-orange-500 to-rose-500", ikon: Building2 },
  MUZE: { zemin: "from-rose-600 via-pink-600 to-fuchsia-700", ikon: Castle },
  KIT: { zemin: "from-sky-700 via-cyan-700 to-teal-700", ikon: Factory },
  DIGER: { zemin: "from-slate-700 via-slate-600 to-blue-700", ikon: Briefcase },
};

/** Ilan karti kapak gorseli: kurum turu temali zemin + gercek kurum logosu (Wikipedia). */
// className: kart disinda (ör. ilan sayfasi ust bandi) farkli oran/yukseklik icin.
export function IlanGorsel({
  logoUrl,
  kurumTuru,
  kurumAdi,
  className = "aspect-[16/9]",
}: {
  logoUrl: string | null;
  kurumTuru: string;
  kurumAdi: string;
  className?: string;
}) {
  const [logoHatasi, setLogoHatasi] = useState(false);
  const { zemin, ikon: Ikon } = TEMA[kurumTuru] ?? TEMA.DIGER;
  const logoVar = logoUrl && !logoHatasi;

  return (
    <div className={`relative w-full overflow-hidden bg-gradient-to-br ${zemin} ${className}`}>
      {/* Hafif nokta deseni + buyuk soluk tur ikonu: duz renk zemini derinlestirir. */}
      <div
        aria-hidden
        className="absolute inset-0 opacity-20 [background-image:radial-gradient(circle,white_1px,transparent_1.5px)] [background-size:18px_18px]"
      />
      <Ikon aria-hidden className="absolute -right-6 -bottom-8 h-44 w-44 text-white/10" strokeWidth={1.25} />
      <div aria-hidden className="absolute -top-16 -left-10 h-48 w-48 rounded-full bg-white/15 blur-3xl" />

      <div className="absolute inset-0 flex items-center justify-center transition-transform duration-500 group-hover:scale-105">
        {logoVar ? (
          <div className="flex h-24 w-24 items-center justify-center rounded-2xl bg-white p-3 shadow-xl shadow-black/20 ring-4 ring-white/30">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={logoUrl}
              alt={`${kurumAdi} logosu`}
              onError={() => setLogoHatasi(true)}
              loading="lazy"
              referrerPolicy="no-referrer"
              className="max-h-full max-w-full object-contain"
            />
          </div>
        ) : (
          <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-white/15 ring-1 ring-white/30 backdrop-blur-sm">
            <Ikon className="h-10 w-10 text-white" />
          </div>
        )}
      </div>

      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/brand/kamu-yolu-logo.png"
        alt=""
        aria-hidden
        className="pointer-events-none absolute bottom-2 left-3 h-auto w-12 opacity-90 brightness-0 invert"
      />
    </div>
  );
}

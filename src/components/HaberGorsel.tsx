"use client";

import { useState } from "react";
import { Landmark } from "lucide-react";
import { cn } from "@/lib/utils";

// og:image URL'leri bilinmeyen/rastgele ucuncu taraf sitelerden geldigi
// icin (yuklenememe, hotlink korumasi vb.) yuklenemezse zarif bir simgeli
// yer tutucuya dusuyoruz. next/image, tumu farkli olan bu domainler icin
// pratik olmadigindan duz <img> kullaniliyor.
export function HaberGorsel({
  src,
  alt,
  logoMu = false,
  className = "aspect-[16/9] w-full rounded-xl",
}: {
  src: string | null;
  alt: string;
  logoMu?: boolean;
  // Varsayilan (kart icinde 16:9 kutu) disinda bir kaplama gerektiren
  // kullanimlar (ör. tam yukseklik dolduran hero carousel) icin.
  className?: string;
}) {
  const [hataVar, setHataVar] = useState(false);

  let content;
  if (!src || hataVar) {
    content = (
      <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-primary/15 via-primary/10 to-primary/5">
        <Landmark className="h-10 w-10 text-primary/40" />
      </div>
    );
  } else if (logoMu) {
    // Kurum logolari kucuk/kare/saydam oldugu icin tam kaplama yerine
    // ortalanmis ve dolgulu gosteriliyor - aksi halde cirkin gerilir/kirpilir.
    content = (
      <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-primary/10 to-primary/5 p-6">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={src}
          alt={alt}
          onError={() => setHataVar(true)}
          loading="lazy"
          referrerPolicy="no-referrer"
          className="max-h-full max-w-full object-contain"
        />
      </div>
    );
  } else {
    content = (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={src}
        alt={alt}
        onError={() => setHataVar(true)}
        loading="lazy"
        referrerPolicy="no-referrer"
        className="h-full w-full object-cover"
      />
    );
  }

  return (
    <div className={cn("relative overflow-hidden", className)}>
      {content}
      {/* Haber gorseli her zaman ucuncu taraf bir kaynaktan (haberin kendi
          sitesi/kurum logosu) geldigi icin - kendi markamizi belli etmek
          icin kucuk bir amblem damgasi eklenir. */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/brand/kamu-yolu-emblem.png"
        alt=""
        aria-hidden
        className="pointer-events-none absolute bottom-1.5 right-1.5 h-5 w-5 rounded bg-white/85 p-0.5 shadow-sm sm:h-6 sm:w-6"
      />
    </div>
  );
}

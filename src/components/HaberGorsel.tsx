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

  if (!src || hataVar) {
    return (
      <div className={cn("flex items-center justify-center bg-gradient-to-br from-primary/15 via-primary/10 to-primary/5", className)}>
        <Landmark className="h-10 w-10 text-primary/40" />
      </div>
    );
  }

  // Kurum logolari kucuk/kare/saydam oldugu icin tam kaplama yerine
  // ortalanmis ve dolgulu gosteriliyor - aksi halde cirkin gerilir/kirpilir.
  if (logoMu) {
    return (
      <div className={cn("flex items-center justify-center bg-gradient-to-br from-primary/10 to-primary/5 p-6", className)}>
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
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt={alt}
      onError={() => setHataVar(true)}
      loading="lazy"
      referrerPolicy="no-referrer"
      className={cn(className, "object-cover")}
    />
  );
}

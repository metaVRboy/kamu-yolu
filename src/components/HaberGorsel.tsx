"use client";

import { useState } from "react";
import { Landmark } from "lucide-react";

// og:image URL'leri bilinmeyen/rastgele ucuncu taraf sitelerden geldigi
// icin (yuklenememe, hotlink korumasi vb.) yuklenemezse zarif bir simgeli
// yer tutucuya dusuyoruz. next/image, tumu farkli olan bu domainler icin
// pratik olmadigindan duz <img> kullaniliyor.
export function HaberGorsel({
  src,
  alt,
  logoMu = false,
}: {
  src: string | null;
  alt: string;
  logoMu?: boolean;
}) {
  const [hataVar, setHataVar] = useState(false);

  if (!src || hataVar) {
    return (
      <div className="flex aspect-[16/9] w-full items-center justify-center rounded-xl bg-gradient-to-br from-primary/15 via-primary/10 to-primary/5">
        <Landmark className="h-10 w-10 text-primary/40" />
      </div>
    );
  }

  // Kurum logolari kucuk/kare/saydam oldugu icin tam kaplama yerine
  // ortalanmis ve dolgulu gosteriliyor - aksi halde cirkin gerilir/kirpilir.
  if (logoMu) {
    return (
      <div className="flex aspect-[16/9] w-full items-center justify-center rounded-xl bg-gradient-to-br from-primary/10 to-primary/5 p-6">
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
      className="aspect-[16/9] w-full rounded-xl object-cover"
    />
  );
}

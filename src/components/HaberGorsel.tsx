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
  markaGizli = false,
  hemenYukle = false,
}: {
  src: string | null;
  alt: string;
  logoMu?: boolean;
  // Varsayilan (kart icinde 16:9 kutu) disinda bir kaplama gerektiren
  // kullanimlar (ör. tam yukseklik dolduran hero carousel) icin.
  className?: string;
  // Kenar cubugu gibi cok kucuk onizlemelerde marka damgasi gorsele
  // sigmiyor/orantisiz kaliyor - bu durumlarda damga tamamen gizlenir.
  markaGizli?: boolean;
  // Carousel gibi ekran disinda bekleyip kayarak gelen gorseller: gecis aninda bos kare gorunmesin.
  hemenYukle?: boolean;
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
          loading={hemenYukle ? "eager" : "lazy"}
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
        loading={hemenYukle ? "eager" : "lazy"}
        referrerPolicy="no-referrer"
        className="h-full w-full object-cover"
      />
    );
  }

  return (
    <div className={cn("relative overflow-hidden", className)}>
      {content}
      {!markaGizli && (
        <>
          {/* Haber gorseli her zaman ucuncu taraf bir kaynaktan (haberin
              kendi sitesi/kurum logosu) geldigi icin - kendi markamizi
              belli etmek icin alt kenardan yukari dogru saydamlasan beyaz
              bir alan ve onun alt-ortasina hizali logo eklenir. */}
          <div
            aria-hidden
            className="pointer-events-none absolute inset-x-0 bottom-0 h-2/5 bg-gradient-to-t from-white via-white/70 to-transparent"
          />
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/brand/kamu-yolu-logo.png"
            alt=""
            aria-hidden
            className="pointer-events-none absolute bottom-[3%] left-1/2 h-auto w-[13%] min-w-[56px] max-w-[110px] -translate-x-1/2"
          />
        </>
      )}
    </div>
  );
}

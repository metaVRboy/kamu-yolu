"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";

const DOLGU_KELIME = new Set(["t.c.", "tc", "ve", "ile", "türkiye", "cumhuriyeti", "the", "of"]);

/** "Sağlık Bakanlığı" -> "SB", "Karayolları Genel Müdürlüğü" -> "KG"; kurum yoksa basliktan. */
function basHarfler(metin: string) {
  const kelimeler = metin
    .split(/\s+/)
    .filter((k) => k && !DOLGU_KELIME.has(k.toLocaleLowerCase("tr")) && /\p{L}/u.test(k));
  return kelimeler
    .slice(0, 2)
    .map((k) => k.match(/\p{L}/u)![0].toLocaleUpperCase("tr"))
    .join("");
}

/**
 * Gorseli olmayan haberin kapagi (soluk simge yerine): acik zeminde noktali doku ve silik amblem, ortada marka
 * gradyaninda monogram karosu, altinda kurum adi ve kategori. Kutu boyutuna gore olceklenir (kucuk onizlemede yalniz karo).
 */
function HaberKapak({ kurum, kategori, alt }: { kurum: string | null; kategori: string | null; alt: string }) {
  const ad = kurum?.trim() || null;
  return (
    <div role="img" aria-label={alt} className="@container relative flex h-full w-full items-center justify-center overflow-hidden bg-gradient-to-br from-slate-50 via-white to-blue-50">
      <div aria-hidden className="absolute inset-0 [background-image:radial-gradient(rgba(37,99,235,0.14)_1px,transparent_1px)] [background-size:16px_16px] [mask-image:radial-gradient(ellipse_at_center,black,transparent_75%)]" />
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src="/brand/kamu-yolu-emblem.png" alt="" aria-hidden className="pointer-events-none absolute -right-[8%] -bottom-[18%] w-[45%] opacity-[0.05]" />
      <div className="relative flex flex-col items-center gap-2 px-4 text-center @[14rem]:gap-3">
        <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-indigo-600 text-xs font-bold tracking-wide text-white shadow-[0_8px_20px_-6px_rgba(37,99,235,0.55)] ring-4 ring-white @[14rem]:h-14 @[14rem]:w-14 @[14rem]:rounded-2xl @[14rem]:text-lg @md:h-20 @md:w-20 @md:text-2xl">
          {basHarfler(ad ?? alt) || "KY"}
        </span>
        {ad && <span className="kapak-detay hidden max-w-[16rem] text-sm leading-snug font-semibold text-balance text-slate-800 @[14rem]:line-clamp-2 @md:text-base">{ad}</span>}
        {kategori && (
          <span className="kapak-detay hidden rounded-full border border-primary/15 bg-white/80 px-2.5 py-0.5 text-[11px] font-semibold tracking-wide text-primary uppercase @[14rem]:inline-block">
            {kategori}
          </span>
        )}
      </div>
    </div>
  );
}

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
  kurum = null,
  kategori = null,
}: {
  // Gorsel yoksa tipografik kapak: kurumun bas harfleri (monogram), kurum adi ve kategori.
  kurum?: string | null;
  kategori?: string | null;
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
    content = <HaberKapak kurum={kurum} kategori={kategori} alt={alt} />;
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
      {/* Tipografik kapak zaten bizim tasarimimiz: damga yalniz ucuncu taraf gorselinde. */}
      {!markaGizli && src && !hataVar && (
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

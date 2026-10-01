"use client";

import { useState } from "react";
import { Landmark } from "lucide-react";

/** Kucuk, kare kurum logosu/amblemi - ilan listesi yan onizlemeleri icin. */
export function KurumLogo({ src, alt }: { src: string | null; alt: string }) {
  const [hataVar, setHataVar] = useState(false);

  if (!src || hataVar) {
    return (
      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-primary/10">
        <Landmark className="h-5 w-5 text-primary/50" />
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
      className="h-12 w-12 shrink-0 rounded-lg border border-border bg-white object-contain p-1.5"
    />
  );
}

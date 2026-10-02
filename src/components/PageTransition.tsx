"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";

// key={pathname} sayesinde her yeni sayfada bu div yeniden mount edilir,
// boylece CSS animasyonu (asagidan yukariya kayarak belirme) her navigasyonda
// tekrar tetiklenir - ayni elemanin icerigi degismesiyle degil.
//
// Animasyon bitince "animate-page-fade-up" sinifi KALDIRILIYOR: class'taki
// transform (translateY), degeri sifir da olsa, bu div'i yeni bir stacking
// context yapiyor - bu da icerideki her position:absolute acilir menunun
// (ornegin bir kombo kutusu) footer gibi DISARIDAKI sonraki kardes
// elemanlarin UZERINE asla cikamamasina (sessizce kesilmesine) yol aciyordu.
// Transform kalkinca stacking context de kalkiyor, menu normal sekilde
// ust katmanda gorunuyor.
export function PageTransition({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [animasyonBitti, setAnimasyonBitti] = useState(false);
  return (
    <div
      key={pathname}
      className={animasyonBitti ? "" : "animate-page-fade-up"}
      onAnimationEnd={() => setAnimasyonBitti(true)}
    >
      {children}
    </div>
  );
}

"use client";

import { useEffect, useState } from "react";

export type OturumPlani = { girisli: false } | { girisli: true; plan: "UCRETSIZ" | "PRO" | "PRO_PLUS" };

let istek: Promise<OturumPlani> | null = null;

/**
 * Oturum degisti (giris, cikis, kayit, hesap silme): TAM sayfa yuklemesi. router.refresh yalniz sunucu parcalarini
 * yeniler; istemci onbellekleri (uye ozeti, plan, Pro bandi) ve layout'taki bilesen durumlari eski kullaniciyla
 * kalirdi (cikistan sonra ana sayfada profil karti gorunmeye devam ediyordu). Hedef yoksa ayni sayfa.
 */
export function oturumDegisti(hedef?: string) {
  if (hedef) window.location.assign(hedef);
  else window.location.reload();
}

/**
 * Onbellekli (ISR) sayfalarda ziyaretcinin oturum ve etkin plani: sayfa basina tek /api/auth/me istegi paylasilir.
 * Yuklenirken undefined.
 */
export function useOturumPlani(): OturumPlani | undefined {
  const [v, setV] = useState<OturumPlani>();
  useEffect(() => {
    istek ??= fetch("/api/auth/me")
      .then((r) => r.json())
      .then((d) => (d.user ? { girisli: true as const, plan: d.user.plan } : { girisli: false as const }))
      .catch(() => ({ girisli: false as const }));
    let iptal = false;
    istek.then((x) => !iptal && setV(x));
    return () => {
      iptal = true;
    };
  }, []);
  return v;
}

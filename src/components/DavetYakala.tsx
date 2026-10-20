"use client";

import { useEffect } from "react";
import { useSearchParams } from "next/navigation";

/**
 * Davet linkiyle (?davet=KOD) gelen ziyaretcinin kodunu 30 gun saklar; kayit (e-posta ya da Google) aninda
 * sunucu okur ve davet edeni baglar. Islevsel cerez: istenen hizmet (davet hediyesi) icin gerekli, olcum degil.
 */
export function DavetYakala() {
  const kod = useSearchParams().get("davet");
  useEffect(() => {
    if (!kod || !/^[A-Z2-9]{8}$/.test(kod)) return;
    document.cookie = `ky_davet=${kod}; max-age=${30 * 86400}; path=/; samesite=lax${location.protocol === "https:" ? "; secure" : ""}`;
  }, [kod]);
  return null;
}

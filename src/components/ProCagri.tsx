"use client";

import type { ReactNode } from "react";
import { useAuthModal } from "@/components/AuthModal";
import { YukseltButonu } from "@/components/YukseltmePenceresi";
import { useOturumPlani } from "@/lib/oturumIstemci";
import type { YukseltmeKaynagi } from "@/lib/planlar";
import { cn } from "@/lib/utils";

/**
 * Plana gore dogru cagri: misafire "ucretsiz uye ol", ucretsiz uyeye yukseltme, (gerekenPlan'a sahip) uyeye
 * `sahipIcerik` (bilgi; yoksa hicbir sey). Onbellekli sayfalarda kullanilir; plan yuklenene kadar bos.
 */
export function ProCagri({
  kaynak,
  gerekenPlan = "PRO",
  uyeEtiket,
  misafirEtiket = "Ücretsiz üye ol",
  sahipIcerik,
  className,
  ikon,
}: {
  kaynak: YukseltmeKaynagi;
  gerekenPlan?: "PRO" | "PRO_PLUS";
  uyeEtiket: string;
  misafirEtiket?: string;
  sahipIcerik?: ReactNode;
  className?: string;
  /** Etiketin onundeki ikon (tesvik kartlarinin ana butonu). */
  ikon?: ReactNode;
}) {
  const oturum = useOturumPlani();
  const authAc = useAuthModal();
  const sinif = cn("shrink-0 rounded-xl bg-primary px-4 py-2.5 text-sm font-bold text-primary-foreground hover:bg-primary/90", className);
  if (!oturum) return null;
  if (!oturum.girisli) {
    return (
      <button type="button" onClick={() => authAc("kayit")} className={sinif}>
        {ikon}
        {misafirEtiket}
      </button>
    );
  }
  const yeterli = oturum.plan === "PRO_PLUS" || (gerekenPlan === "PRO" && oturum.plan === "PRO");
  if (yeterli) return <>{sahipIcerik ?? null}</>;
  return (
    <YukseltButonu plan={gerekenPlan} kaynak={kaynak} className={sinif}>
      {ikon}
      {uyeEtiket}
    </YukseltButonu>
  );
}

/** Plana gore metin secimi (ayni kanca): cagri karti misafire ve uyeye farkli cumle soyler. */
export function usePlanaGore<T>(secenek: { misafir: T; ucretsiz: T; sahip: T }, gerekenPlan: "PRO" | "PRO_PLUS" = "PRO"): T | undefined {
  const oturum = useOturumPlani();
  if (!oturum) return undefined;
  if (!oturum.girisli) return secenek.misafir;
  const yeterli = oturum.plan === "PRO_PLUS" || (gerekenPlan === "PRO" && oturum.plan === "PRO");
  return yeterli ? secenek.sahip : secenek.ucretsiz;
}

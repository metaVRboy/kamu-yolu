"use client";

import { useEffect } from "react";
import { cn } from "@/lib/utils";

const ADSENSE_CLIENT_ID = "ca-pub-2932226916873749";

declare global {
  interface Window {
    adsbygoogle?: unknown[];
  }
}

/**
 * Reklam alani. AdSense panelinden manuel bir 160x600 reklam birimi
 * olusturulup slotId buraya verildiginde gercek reklam yuklenir; slotId
 * henuz yoksa (birim olusturulmadiysa) yer tutucu gosterilir.
 */
export function AdSlot({ side, slotId }: { side: "left" | "right"; slotId?: string }) {
  useEffect(() => {
    if (!slotId) return;
    try {
      (window.adsbygoogle = window.adsbygoogle || []).push({});
    } catch {
      // AdSense script henuz yuklenmemis/engellenmisse sessizce yok say -
      // ReklamEngelleyiciKontrol zaten ayri bir uyari gosteriyor.
    }
  }, [slotId]);

  return (
    <div className="sticky top-24 hidden h-[600px] w-[160px] shrink-0 2xl:block">
      {slotId ? (
        <ins
          className="adsbygoogle"
          style={{ display: "inline-block", width: "160px", height: "600px" }}
          data-ad-client={ADSENSE_CLIENT_ID}
          data-ad-slot={slotId}
        />
      ) : (
        <div
          className={cn(
            "flex h-full w-full flex-col items-center justify-center gap-2 rounded-2xl border border-primary/20 bg-primary/5 text-center",
          )}
        >
          <span className="text-[11px] font-medium uppercase tracking-wide text-primary/50">
            Reklam
          </span>
          <span className="text-[10px] text-primary/30">160 × 600</span>
        </div>
      )}
    </div>
  );
}

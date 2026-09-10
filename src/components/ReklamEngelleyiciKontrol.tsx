"use client";

import { useEffect, useState } from "react";

/**
 * Reklam engelleyici tespiti: coklu reklam engelleyicilerin (uBlock,
 * AdBlock Plus vb.) kozmetik filtrelerinin hedef aldigi bilinen sinif
 * adlarina sahip "yem" bir eleman DOM'a eklenir. Engelleyici bu elemani
 * gizlerse (display:none, boyutu 0 vb.) reklam engelleyici oldugu
 * anlasilir. Site reklam geliriyle ucretsiz tutuldugu icin engelleyici
 * kapatilmadan sitenin geri kalanina erisim engellenir.
 */
export function ReklamEngelleyiciKontrol() {
  const [durum, setDurum] = useState<"kontrol" | "temiz" | "engellendi">("kontrol");

  function kontrolEt() {
    const yem = document.createElement("div");
    yem.className = "adsbox ad-banner adsbygoogle advertisement ad-placement";
    yem.setAttribute("aria-hidden", "true");
    yem.style.cssText = "position:absolute;top:0;left:-9999px;width:2px;height:2px;";
    document.body.appendChild(yem);

    window.setTimeout(() => {
      const stil = window.getComputedStyle(yem);
      const gizlenmis =
        yem.offsetParent === null ||
        yem.offsetHeight === 0 ||
        stil.display === "none" ||
        stil.visibility === "hidden";
      document.body.removeChild(yem);
      setDurum(gizlenmis ? "engellendi" : "temiz");
    }, 300);
  }

  useEffect(() => {
    kontrolEt();
  }, []);

  if (durum !== "engellendi") return null;

  return (
    <div className="fixed inset-0 z-[999] flex items-center justify-center bg-slate-900/95 p-4 backdrop-blur-sm">
      <div className="max-w-sm rounded-2xl bg-white p-6 text-center shadow-2xl">
        <h2 className="font-sans text-lg font-bold text-primary">Reklam Engelleyici Tespit Edildi</h2>
        <p className="mt-2 text-sm text-slate-600">
          Kamu Yolu&apos;nu tamamen ücretsiz tutabilmemiz reklam gelirleriyle mümkün oluyor.
          Siteyi kullanmaya devam edebilmek için lütfen reklam engelleyicini kapat ve sayfayı
          yeniden dene.
        </p>
        <button
          type="button"
          onClick={() => {
            setDurum("kontrol");
            kontrolEt();
          }}
          className="mt-4 w-full rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-white hover:bg-primary/90"
        >
          Kapattım, Tekrar Dene
        </button>
      </div>
    </div>
  );
}

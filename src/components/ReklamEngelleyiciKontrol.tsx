"use client";

import { useEffect, useState } from "react";

/**
 * Reklam engelleyici tespiti iki yontemi birlikte kullanir - modern
 * engelleyiciler (ör. güncel uBlock Origin) sadece sinif adina gore
 * gizleme yapan basit "yem" elemanlari artik es geçebiliyor, bu yuzden
 * tek basina yeterli degil:
 *
 * 1) Bilinen bir reklam sunucusuna (Google AdSense yukleyicisi) gercek
 *    bir istek atilir - engelleyiciler agirlikli olarak bu TUR gercek
 *    reklam sunucusu isteklerini engelledigi icin bu yontem daha
 *    guvenilir. Istek engellenirse fetch reddedilir.
 * 2) Bilinen reklam sinif adlarina sahip bir "yem" eleman DOM'a eklenip
 *    gizlenip gizlenmedigine bakilir (daha eski/basit engelleyicileri
 *    yakalar).
 *
 * Ikisinden biri bile engellemeyi gosterirse reklam engelleyici aktif
 * kabul edilir.
 *
 * NOT: Daha once burada kendi alan adimizda barinan bir "/ads/" yolu da
 * kontrol ediliyordu - ama engelleyiciler genelde BILINEN reklam agi
 * alan adlarini/imzalarini engeller, uydurma bir ilk taraf yolunu degil;
 * bu kontrol hicbir engelleyici tarafindan tetiklenmiyordu ve kaldirildi.
 * Ayrica yem elemanina yanlislikla eklenen inline "display:block",
 * "!important" icermeyen gizleme kurallarini gecersiz kilarak Opera GX'in
 * yerlesik engelleyicisinde tespiti tamamen bozmustu - bu yuzden yem
 * elemaninin kendi "display" degeri kasitli olarak hic belirtilmiyor.
 */
async function agIstegiEngellendiMi(): Promise<boolean> {
  try {
    await fetch("https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js", {
      method: "HEAD",
      mode: "no-cors",
      cache: "no-store",
      // Yavas mobil baglantida 2 sn yanlis alarm veriyordu (engel yokken duvar cikiyordu).
      signal: AbortSignal.timeout(5000),
    });
    return false;
  } catch {
    return true;
  }
}

function yemElemaniGizliMi(): Promise<boolean> {
  return new Promise((resolve) => {
    const yem = document.createElement("div");
    yem.className = "adsbox ad-banner adsbygoogle advertisement ad-placement pub_300x250";
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
      resolve(gizlenmis);
    }, 400);
  });
}

const GECILDI_ANAHTAR = "kyReklamUyariGecildi";

export function ReklamEngelleyiciKontrol() {
  const [durum, setDurum] = useState<"kontrol" | "temiz" | "engellendi">("kontrol");

  const tespitEt = async () => {
    const [agEngellendi, yemGizli] = await Promise.all([agIstegiEngellendiMi(), yemElemaniGizliMi()]);
    return agEngellendi || yemGizli ? "engellendi" : "temiz";
  };

  function kontrolEt() {
    setDurum("kontrol");
    tespitEt().then(setDurum);
  }

  useEffect(() => {
    // Uyari bu oturumda gecildiyse tekrar sorma (siteyi kilitlemez, yalniz rica eder).
    try {
      if (sessionStorage.getItem(GECILDI_ANAHTAR)) return; // "kontrol" durumunda zaten hicbir sey cizilmez
    } catch {}
    tespitEt().then(setDurum);
  }, []);

  function devamEt() {
    try {
      sessionStorage.setItem(GECILDI_ANAHTAR, "1");
    } catch {}
    setDurum("temiz");
  }

  if (durum !== "engellendi") return null;

  // Sayfayi ortmeyen kucuk alt serit: tam ekran katman AdSense ("gezinmeyi engelleyen pop-up") ve
  // Google Ads/Search ("tum sayfayi kapatan interstitial") politikalarina aykiri.
  return (
    <div role="status" className="fixed inset-x-0 bottom-0 z-40 border-t border-amber-200 bg-amber-50/95 px-4 py-2.5 backdrop-blur sm:px-6">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-2 text-xs text-amber-900 sm:text-sm">
        <p>Reklam engelleyici açık görünüyor. Ücretsiz özellikleri reklam gelirleriyle sunuyoruz; istersen bu site için kapatabilirsin.</p>
        <div className="flex shrink-0 gap-2">
          <button type="button" onClick={kontrolEt} className="rounded-lg bg-amber-600 px-3 py-1 font-semibold text-white hover:bg-amber-700">
            Kapattım
          </button>
          <button type="button" onClick={devamEt} aria-label="Uyarıyı kapat" className="rounded-lg px-2 py-1 font-semibold hover:bg-amber-100">
            Kapat
          </button>
        </div>
      </div>
    </div>
  );
}

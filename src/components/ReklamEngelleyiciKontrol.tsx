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

  return (
    <div className="fixed inset-0 z-[999] flex items-center justify-center bg-slate-900/95 p-4 backdrop-blur-sm">
      <div className="max-w-sm rounded-2xl bg-white p-6 text-center shadow-2xl">
        <h2 className="font-sans text-lg font-bold text-primary">Reklam Engelleyici Tespit Edildi</h2>
        <p className="mt-2 text-sm text-slate-600">
          Kamu Yolu&apos;nun ücretsiz özelliklerini reklam gelirleriyle sunuyoruz. Bize destek
          olmak istersen reklam engelleyicini bu site için kapatabilirsin.
        </p>
        <button type="button" onClick={kontrolEt} className="mt-4 w-full rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-white hover:bg-primary/90">
          Kapattım, Tekrar Dene
        </button>
        <button type="button" onClick={devamEt} className="mt-2 w-full rounded-xl px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-100">
          Şimdilik devam et
        </button>
      </div>
    </div>
  );
}

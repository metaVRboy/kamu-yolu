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
 */
async function agIstegiEngellendiMi(): Promise<boolean> {
  try {
    await fetch("https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js", {
      method: "HEAD",
      mode: "no-cors",
      cache: "no-store",
      signal: AbortSignal.timeout(2000),
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

export function ReklamEngelleyiciKontrol() {
  const [durum, setDurum] = useState<"kontrol" | "temiz" | "engellendi">("kontrol");

  async function kontrolEt() {
    setDurum("kontrol");
    const [agEngellendi, yemGizli] = await Promise.all([agIstegiEngellendiMi(), yemElemaniGizliMi()]);
    setDurum(agEngellendi || yemGizli ? "engellendi" : "temiz");
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
        <button type="button" onClick={kontrolEt} className="mt-4 w-full rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-white hover:bg-primary/90">
          Kapattım, Tekrar Dene
        </button>
      </div>
    </div>
  );
}

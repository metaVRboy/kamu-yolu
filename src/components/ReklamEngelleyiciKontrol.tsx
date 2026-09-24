"use client";

import { useEffect, useState } from "react";

/**
 * Reklam engelleyici tespiti UC yontemi birlikte kullanir - hicbiri tek
 * basina guvenilir degil:
 *
 * 1) Google'in gercek AdSense yukleyicisine (adsbygoogle.js) istek atilir.
 *    SORUN: bircok guncel engelleyici (ör. uBlock Origin) bu dosyayi agdan
 *    tamamen engellemek yerine, siteleri bozmamak icin BOS/zararsiz bir
 *    "guduk" script ile degistirir (redirect) - yani istek BASARILI gorunur,
 *    engelleyici acikken bile. Bu yuzden tek basina yeterli degil.
 * 2) Kendi alan adimizda, acikca "reklam" gibi duran bir yolda (/ads/...)
 *    bos bir dosyaya istek atilir. Google'in dosyasinin aksine bunun icin
 *    ozel bir "guduk'e yonlendirme" istisnasi yoktur - engelleyicilerin
 *    URL desenine gore calisan genel kurallari (ör. "/ads/") bu dosyayi da
 *    yakalar, boylece 1. yontemin atlanabildigi durumlari kapatir.
 * 3) Bilinen reklam sinif adlarina sahip bir "yem" eleman DOM'a eklenip
 *    gizlenip gizlenmedigine bakilir (kozmetik/CSS tabanli engelleyicileri
 *    yakalar).
 *
 * Ucunden biri bile engellemeyi gosterirse reklam engelleyici aktif kabul
 * edilir.
 */
async function istekEngellendiMi(url: string, ayniKaynak: boolean): Promise<boolean> {
  try {
    const res = await fetch(url, {
      method: "GET",
      mode: ayniKaynak ? "cors" : "no-cors",
      cache: "no-store",
      signal: AbortSignal.timeout(2500),
    });
    // Ayni kaynaktaki istek gercek bir HTTP durum kodu doner - engelleyici
    // bunu agdan tamamen dusurmediyse bile 403/404 gibi bir sahte yanitla
    // degistirmis olabilir.
    if (ayniKaynak && !res.ok) return true;
    return false;
  } catch {
    return true;
  }
}

function yemElemaniGizliMi(): Promise<boolean> {
  return new Promise((resolve) => {
    // Gercek bir AdSense reklam biriminin markup'ini taklit eder (<ins
    // class="adsbygoogle">) - kozmetik filtre listeleri genellikle sinif
    // adindan cok bu tur gercekci reklam elemani desenlerini hedefler.
    const yem = document.createElement("ins");
    yem.className = "adsbox ad-banner adsbygoogle advertisement ad-placement pub_300x250";
    yem.setAttribute("aria-hidden", "true");
    yem.style.cssText =
      "display:block;position:absolute;top:0;left:-9999px;width:300px;height:250px;";
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
    const [googleEngellendi, kendiKaynakEngellendi, yemGizli] = await Promise.all([
      istekEngellendiMi("https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js", false),
      istekEngellendiMi("/ads/ad-banner.js", true),
      yemElemaniGizliMi(),
    ]);
    setDurum(googleEngellendi || kendiKaynakEngellendi || yemGizli ? "engellendi" : "temiz");
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

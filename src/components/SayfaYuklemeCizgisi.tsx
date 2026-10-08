"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname, useSearchParams } from "next/navigation";

const OLAY = "sayfa-yukleme-basla";
const EN_FAZLA_MS = 12_000; // gezinme hic tamamlanmazsa (hata vb.) cizgi takili kalmasin

/** Link olmayan yerlerde (router.push oncesi) cizgiyi baslatir; hedef zaten acik sayfaysa baslamaz. */
export function sayfaYuklemesiniBaslat(hedef: string) {
  window.dispatchEvent(new CustomEvent(OLAY, { detail: hedef }));
}

/** "/yol?a=1#x" -> "/yol?a=1" (karsilastirma anahtari; hash ayni sayfadir). */
function anahtar(url: URL) {
  return url.pathname + url.search;
}

/**
 * Header'in alt kenarinda ince ilerleme cizgisi: site ici gezinme baslayinca
 * hizla ~%90'a dolar, yeni sayfa (yol ya da sorgu degisince) gelince tamamlanip
 * solar. Ilerleme zamanlayicilari olay isleyicilerinde kurulur, effect'te degil.
 */
export function SayfaYuklemeCizgisi() {
  const pathname = usePathname();
  const aramalar = useSearchParams();
  const mevcut = pathname + (aramalar.size ? `?${aramalar.toString()}` : "");
  const [kayit, setKayit] = useState<{ baslangic: string; bitti: boolean } | null>(null);
  const [yuzde, setYuzde] = useState(0);
  const zamanlayici = useRef<ReturnType<typeof setInterval> | null>(null);

  // Yeni sayfa geldi: render sirasinda "bitti" olarak isaretle (React'in onerdigi
  // turetilmis durum deseni); solma bitince onTransitionEnd sifirlar.
  if (kayit && !kayit.bitti && mevcut !== kayit.baslangic) setKayit({ ...kayit, bitti: true });

  useEffect(() => {
    function sifirla() {
      if (zamanlayici.current) clearInterval(zamanlayici.current);
      zamanlayici.current = null;
      setKayit(null);
      setYuzde(0);
    }
    function baslat(hedef: URL) {
      const su = new URL(window.location.href);
      if (hedef.origin !== su.origin || anahtar(hedef) === anahtar(su)) return;
      if (zamanlayici.current) clearInterval(zamanlayici.current);
      const baslangicZamani = Date.now();
      setKayit({ baslangic: anahtar(su), bitti: false });
      setYuzde(8);
      zamanlayici.current = setInterval(() => {
        if (Date.now() - baslangicZamani > EN_FAZLA_MS) return sifirla();
        setYuzde((y) => y + (90 - y) * 0.12); // hizli baslar, %90'a yaklastikca yavaslar
      }, 200);
    }
    function tiklama(e: MouseEvent) {
      if (e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      const a = (e.target as Element | null)?.closest?.("a");
      if (!a || !a.href || a.hasAttribute("download") || (a.target && a.target !== "_self")) return;
      baslat(new URL(a.href));
    }
    function olay(e: Event) {
      baslat(new URL((e as CustomEvent<string>).detail, window.location.href));
    }
    // capture: Next Link'in preventDefault'undan once yakalanir.
    document.addEventListener("click", tiklama, true);
    window.addEventListener(OLAY, olay);
    return () => {
      document.removeEventListener("click", tiklama, true);
      window.removeEventListener(OLAY, olay);
      if (zamanlayici.current) clearInterval(zamanlayici.current);
    };
  }, []);

  if (!kayit) return null;
  return (
    <div
      aria-hidden
      onTransitionEnd={(e) => {
        if (e.propertyName === "opacity" && kayit.bitti) {
          if (zamanlayici.current) clearInterval(zamanlayici.current);
          zamanlayici.current = null;
          setKayit(null);
          setYuzde(0);
        }
      }}
      className="pointer-events-none absolute bottom-0 left-0 h-[2.5px] rounded-r-full bg-primary shadow-[0_0_10px_rgba(37,99,235,0.7)]"
      style={{
        width: `${kayit.bitti ? 100 : yuzde}%`,
        opacity: kayit.bitti ? 0 : 1,
        transition: kayit.bitti ? "width 200ms ease-out, opacity 300ms ease 200ms" : "width 200ms linear",
      }}
    />
  );
}

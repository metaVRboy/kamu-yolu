"use client";

import { useEffect } from "react";
import Link from "next/link";
import Script from "next/script";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { kaynakCerezeYaz, kaynakYakala, onayYaz, useCerezOnayi, type CerezTercihi } from "@/lib/olcum";

// Kimlikler Vercel ortam degiskeninden; tanimli olmayan arac hic yuklenmez.
const GA4 = process.env.NEXT_PUBLIC_GA4_ID;
const META = process.env.NEXT_PUBLIC_META_PIXEL_ID;
const TIKTOK = process.env.NEXT_PUBLIC_TIKTOK_PIXEL_ID;

/**
 * Cerez onayi (KVKK Cerez Rehberi, Temmuz 2025): rizaya bagli cerezler "ilk elde pasif"; esit
 * buyuklukte Reddet / Kabul et. Sitede reklam yok; tek rizali kategori olcum (kampanya kaynagi
 * cerezi + etkinse GA4/Meta/TikTok). Tercih Cerez Politikasi sayfasindan degistirilir, 12 ayda bir yeniden sorulur.
 */
export function CerezOnayi() {
  const tercih = useCerezOnayi();
  const yol = usePathname() ?? "";

  useEffect(() => {
    kaynakYakala();
  }, []);

  useEffect(() => {
    if (tercih?.olcum) kaynakCerezeYaz();
  }, [tercih]);

  if (tercih === undefined) return null;
  // Sifre sifirlama adresi gizli token tasir: ucuncu taraf olcum kodu o sayfada hic yuklenmez.
  if (tercih) return tercih.olcum && !yol.startsWith("/sifre-sifirla") ? <OlcumScriptleri /> : null;

  return (
    <div className="fixed inset-x-0 bottom-0 z-50 border-t border-primary/20 bg-white/95 px-4 py-3 shadow-2xl shadow-primary/10 backdrop-blur-xl sm:px-6">
      <div className="mx-auto flex max-w-6xl flex-col gap-2.5 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-xs leading-relaxed text-slate-700 sm:text-sm">
          Zorunlu çerezlerin yanında, izin verirsen hangi kampanyadan geldiğini ölçen çerezleri de kullanırız.{" "}
          <Link href="/cerez-politikasi" className="font-medium text-primary hover:underline">
            Çerez Politikası
          </Link>
        </p>
        {/* Iki buton ayni boyut ve gorunumde (rehber: esit derecede renk/buyukluk). */}
        <div className="grid shrink-0 grid-cols-2 gap-2">
          <Button type="button" size="sm" variant="outline" onClick={() => onayYaz({ olcum: false })}>
            Reddet
          </Button>
          <Button type="button" size="sm" variant="outline" onClick={() => onayYaz({ olcum: true })}>
            Kabul et
          </Button>
        </div>
      </div>
    </div>
  );
}

function OlcumScriptleri() {
  return (
    <>
      {GA4 && (
        <>
          <Script src={`https://www.googletagmanager.com/gtag/js?id=${GA4}`} strategy="afterInteractive" />
          <Script id="ga4" strategy="afterInteractive">
            {`window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments)}window.gtag=gtag;gtag('js',new Date());gtag('config','${GA4}');`}
          </Script>
        </>
      )}
      {META && (
        <Script id="meta-pixel" strategy="afterInteractive">
          {`!function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,document,'script','https://connect.facebook.net/en_US/fbevents.js');fbq('init','${META}');fbq('track','PageView');`}
        </Script>
      )}
      {TIKTOK && (
        <Script id="tiktok-pixel" strategy="afterInteractive">
          {`!function(w,d,t){w.TiktokAnalyticsObject=t;var ttq=w[t]=w[t]||[];ttq.methods=["page","track","identify","instances","debug","on","off","once","ready","alias","group","enableCookie","disableCookie"],ttq.setAndDefer=function(t,e){t[e]=function(){t.push([e].concat(Array.prototype.slice.call(arguments,0)))}};for(var i=0;i<ttq.methods.length;i++)ttq.setAndDefer(ttq,ttq.methods[i]);ttq.instance=function(t){for(var e=ttq._i[t]||[],n=0;n<ttq.methods.length;n++)ttq.setAndDefer(e,ttq.methods[n]);return e},ttq.load=function(e,n){var r="https://analytics.tiktok.com/i18n/pixel/events.js";ttq._i=ttq._i||{},ttq._i[e]=[],ttq._i[e]._u=r,ttq._t=ttq._t||{},ttq._t[e]=+new Date,ttq._o=ttq._o||{},ttq._o[e]=n||{};var o=d.createElement("script");o.type="text/javascript",o.async=!0,o.src=r+"?sdkid="+e+"&lib="+t;var a=d.getElementsByTagName("script")[0];a.parentNode.insertBefore(o,a)};ttq.load('${TIKTOK}');ttq.page()}(window,document,'ttq');`}
        </Script>
      )}
    </>
  );
}

/** Cerez Politikasi sayfasinda: verilen karari gorme ve degistirme. */
export function CerezTercihiDegistir() {
  const tercih = useCerezOnayi();
  if (tercih === undefined) return null;
  const sec = (olcum: boolean, simdiki?: CerezTercihi | null) => {
    onayYaz({ olcum });
    // Yuklenmis olcum kodu ancak sayfa yenilenince tamamen kalkar.
    if (simdiki?.olcum && !olcum) location.reload();
  };
  return (
    <div className="not-prose space-y-3 rounded-xl border border-primary/15 bg-primary/5 p-4">
      <p className="text-sm text-slate-700">
        {tercih ? (
          <>
            Şu anki tercihin: ölçüm çerezleri <strong>{tercih.olcum ? "açık" : "kapalı"}</strong>.
          </>
        ) : (
          "Henüz bir tercih yapmadın."
        )}
      </p>
      <div className="flex gap-2">
        <Button type="button" size="sm" variant="outline" onClick={() => sec(false, tercih)}>
          Ölçümü kapat
        </Button>
        <Button type="button" size="sm" variant="outline" onClick={() => sec(true, tercih)}>
          Ölçüme izin ver
        </Button>
      </div>
    </div>
  );
}

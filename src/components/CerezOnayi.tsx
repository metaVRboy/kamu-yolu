"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Script from "next/script";
import { Button } from "@/components/ui/button";
import { ReklamEngelleyiciKontrol } from "@/components/ReklamEngelleyiciKontrol";
import { kaynakCerezeYaz, kaynakYakala, onayYaz, useCerezOnayi, type CerezTercihi } from "@/lib/olcum";

// Kimlikler Vercel ortam degiskeninden; tanimli olmayan arac hic yuklenmez.
const GA4 = process.env.NEXT_PUBLIC_GA4_ID;
const META = process.env.NEXT_PUBLIC_META_PIXEL_ID;
const TIKTOK = process.env.NEXT_PUBLIC_TIKTOK_PIXEL_ID;

/**
 * Cerez onayi (KVKK Cerez Rehberi, Temmuz 2025): rizaya bagli cerezler "ilk elde pasif"; esit
 * buyuklukte Reddet / Tercihler / Kabul et; reklam ve olcum ayri secilir. Karar verilene kadar
 * AdSense istekleri layout'ta durdurulmus (pauseAdRequests) bekler; reklam reddedilirse hic istenmez.
 * Tercih Cerez Politikasi sayfasindan degistirilir, 12 ayda bir yeniden sorulur.
 */
export function CerezOnayi({ reklamsiz }: { reklamsiz: boolean }) {
  const tercih = useCerezOnayi();
  const [tercihlerAcik, setTercihlerAcik] = useState(false);

  useEffect(() => {
    kaynakYakala();
  }, []);

  useEffect(() => {
    if (tercih?.olcum) kaynakCerezeYaz();
    if (tercih?.reklam && !reklamsiz) (window.adsbygoogle = window.adsbygoogle || []).pauseAdRequests = 0;
  }, [tercih, reklamsiz]);

  if (tercih === undefined) return null;
  if (tercih) {
    return (
      <>
        {tercih.reklam && !reklamsiz && <ReklamEngelleyiciKontrol />}
        {tercih.olcum && <OlcumScriptleri />}
      </>
    );
  }

  return (
    <div className="fixed inset-x-0 bottom-0 z-50 border-t border-primary/20 bg-white/95 px-4 py-3 shadow-2xl shadow-primary/10 backdrop-blur-xl sm:px-6">
      <div className="mx-auto max-w-6xl">
        {tercihlerAcik ? (
          <TercihFormu kaydet={(t) => onayYaz(t)} />
        ) : (
          <div className="flex flex-col gap-2.5 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-xs leading-relaxed text-slate-700 sm:text-sm">
              Zorunlu çerezlerin yanında, izin verirsen reklam ve ziyaret ölçümü çerezleri de kullanırız.{" "}
              <Link href="/cerez-politikasi" className="font-medium text-primary hover:underline">
                Çerez Politikası
              </Link>
            </p>
            {/* Uc buton ayni boyut ve gorunumde (rehber: esit derecede renk/buyukluk). */}
            <div className="grid shrink-0 grid-cols-3 gap-2">
              <Button type="button" size="sm" variant="outline" onClick={() => onayYaz({ reklam: false, olcum: false })}>
                Reddet
              </Button>
              <Button type="button" size="sm" variant="outline" onClick={() => setTercihlerAcik(true)}>
                Tercihler
              </Button>
              <Button type="button" size="sm" variant="outline" onClick={() => onayYaz({ reklam: true, olcum: true })}>
                Kabul et
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

/** Kategori secimi: bantta "Tercihler" ve Cerez Politikasi sayfasinda ortak. */
function TercihFormu({ ilk, kaydet }: { ilk?: CerezTercihi | null; kaydet: (t: { reklam: boolean; olcum: boolean }) => void }) {
  const [reklam, setReklam] = useState(ilk?.reklam ?? false);
  const [olcum, setOlcum] = useState(ilk?.olcum ?? false);
  return (
    <div className="space-y-2 text-sm text-slate-700">
      <label className="flex items-start gap-2 opacity-70">
        <input type="checkbox" checked disabled className="mt-1 h-4 w-4" />
        <span>
          <strong>Zorunlu</strong> — oturum, güvenlik ve tercihlerinin hatırlanması. Kapatılamaz.
        </span>
      </label>
      <label className="flex items-start gap-2">
        <input type="checkbox" checked={reklam} onChange={(e) => setReklam(e.target.checked)} className="mt-1 h-4 w-4 accent-primary" />
        <span>
          <strong>Reklam</strong> — Google AdSense reklamları ve sıklık sınırı (üçüncü taraf, yurt dışı).
        </span>
      </label>
      <label className="flex items-start gap-2">
        <input type="checkbox" checked={olcum} onChange={(e) => setOlcum(e.target.checked)} className="mt-1 h-4 w-4 accent-primary" />
        <span>
          <strong>Ölçüm</strong> — hangi kampanyadan geldiğinin kaydı ve (etkinse) Google Analytics / reklam ölçüm pikselleri.
        </span>
      </label>
      <Button type="button" size="sm" onClick={() => kaydet({ reklam, olcum })}>
        Seçimimi kaydet
      </Button>
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
  const durum = (v?: boolean) => (v ? "açık" : "kapalı");
  return (
    <div className="not-prose space-y-3 rounded-xl border border-primary/15 bg-primary/5 p-4">
      <p className="text-sm text-slate-700">
        {tercih ? (
          <>
            Şu anki tercihin: reklam <strong>{durum(tercih.reklam)}</strong>, ölçüm <strong>{durum(tercih.olcum)}</strong>.
          </>
        ) : (
          "Henüz bir tercih yapmadın."
        )}
      </p>
      <TercihFormu
        key={JSON.stringify(tercih)}
        ilk={tercih}
        kaydet={(t) => {
          onayYaz(t);
          // Yuklenmis reklam/olcum kodu ancak sayfa yenilenince tamamen kalkar.
          if ((tercih?.reklam && !t.reklam) || (tercih?.olcum && !t.olcum)) location.reload();
        }}
      />
    </div>
  );
}

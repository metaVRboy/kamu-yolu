import { useSyncExternalStore } from "react";
import { KAYNAK_ANAHTARLARI, KAYNAK_CEREZ, kaynakCerezCoz, kaynakTemizle, type Kaynak } from "@/lib/kaynak";

/**
 * Tarayici tarafi olcum: cerez onayi, reklam/analitik olaylari ve kampanya kaynagi.
 * Reklam (AdSense) ve analitik (GA4, Meta, TikTok) yalnizca "kabul" sonrasi calisir (KVKK cerez rehberi).
 */
const ONAY_ANAHTARI = "kyCerezOnay";
const ONAY_OLAYI = "ky-cerez-onay";
export type CerezOnayi = "kabul" | "red";

function onayOku(): CerezOnayi | null {
  try {
    const v = localStorage.getItem(ONAY_ANAHTARI);
    return v === "kabul" || v === "red" ? v : null;
  } catch {
    return null;
  }
}

export function onayYaz(v: CerezOnayi) {
  try {
    localStorage.setItem(ONAY_ANAHTARI, v);
  } catch {}
  window.dispatchEvent(new Event(ONAY_OLAYI));
}

function onayAbone(cb: () => void) {
  window.addEventListener(ONAY_OLAYI, cb);
  window.addEventListener("storage", cb);
  return () => {
    window.removeEventListener(ONAY_OLAYI, cb);
    window.removeEventListener("storage", cb);
  };
}

/** undefined: sunucu/hidrasyon (henuz bilinmiyor), null: karar verilmedi. */
export function useCerezOnayi(): CerezOnayi | null | undefined {
  return useSyncExternalStore(onayAbone, onayOku, () => undefined);
}

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
    fbq?: (...args: unknown[]) => void;
    ttq?: { track: (ad: string, veri?: Record<string, unknown>) => void };
  }
}

/**
 * Donusum olayi: yuklu olan (onay verilmis) her araca gider; hicbiri yoksa sessizce gecer.
 * Onay varken araclar henuz yuklenmemisse (sayfa yeni acildi) birkac kez kisa aralikla yeniden dener.
 */
export function olay(ad: "sign_up" | "lead", veri?: Record<string, unknown>, deneme = 0) {
  if (!window.gtag && !window.fbq && !window.ttq) {
    if (onayOku() === "kabul" && deneme < 6) setTimeout(() => olay(ad, veri, deneme + 1), 500);
    return;
  }
  try {
    window.gtag?.("event", ad === "sign_up" ? "sign_up" : "generate_lead", veri);
    window.fbq?.("track", ad === "sign_up" ? "CompleteRegistration" : "Lead", veri);
    window.ttq?.track(ad === "sign_up" ? "CompleteRegistration" : "SubmitForm", veri);
  } catch {}
}

// Ilk ziyaretin kaynagi bellekte tutulur; cereze yalnizca onaydan sonra yazilir.
let ilkKaynak: Kaynak | null = null;

/** Ilk sayfa yuklenisinde bir kez: URL'deki kampanya parametreleri + dis referrer + giris sayfasi. */
export function kaynakYakala() {
  if (ilkKaynak) return;
  const p = new URLSearchParams(location.search);
  const ham: Record<string, string> = {};
  for (const k of KAYNAK_ANAHTARLARI) {
    const v = p.get(k);
    if (v) ham[k] = v;
  }
  try {
    const ref = document.referrer && new URL(document.referrer).host;
    if (ref && ref !== location.host) ham.ref = ref;
  } catch {}
  if (Object.keys(ham).length) ilkKaynak = kaynakTemizle({ ...ham, giris: location.pathname });
}

function cerezOku(): Kaynak | null {
  return kaynakCerezCoz(document.cookie.split("; ").find((c) => c.startsWith(`${KAYNAK_CEREZ}=`))?.slice(KAYNAK_CEREZ.length + 1));
}

/** Onay verildiginde: ilk temas kaynagini 30 gun saklar (varsa ustune yazmaz). */
export function kaynakCerezeYaz() {
  if (!ilkKaynak || cerezOku()) return;
  document.cookie = `${KAYNAK_CEREZ}=${encodeURIComponent(JSON.stringify(ilkKaynak))}; path=/; max-age=${30 * 86400}; samesite=lax; secure`;
}

/** Kayit istegine eklenecek kaynak: once cerez (onceki ziyaret), yoksa bu ziyaretin bellekteki kaydi. */
export function kaynakBilgisi(): Kaynak | null {
  return cerezOku() ?? ilkKaynak;
}

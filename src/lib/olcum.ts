import { useSyncExternalStore } from "react";
import { KAYNAK_ANAHTARLARI, KAYNAK_CEREZ, kaynakCerezCoz, kaynakTemizle, type Kaynak } from "@/lib/kaynak";

/**
 * Tarayici tarafi olcum: cerez onayi, reklam/analitik olaylari ve kampanya kaynagi.
 * Reklam (AdSense) ve analitik (GA4, Meta, TikTok) yalnizca "kabul" sonrasi calisir (KVKK cerez rehberi).
 */
const ONAY_ANAHTARI = "kyCerezOnay";
const ONAY_OLAYI = "ky-cerez-onay";
// KVKK Cerez Rehberi (2025): tercih suresiz degil, makul araliklarla yeniden sorulur.
const ONAY_GECERLILIK_MS = 365 * 86_400_000;
export const CEREZ_METNI_SURUMU = "2026-10-13";

/** Kategori bazli tercih: reklam (AdSense) ve olcum (kampanya kaynagi cerezi + GA4/Meta/TikTok). */
export type CerezTercihi = { reklam: boolean; olcum: boolean; zaman: number };

// useSyncExternalStore ayni ham deger icin ayni nesneyi bekler: ham metne gore onbellek.
let sonHam: string | null = null;
let sonTercih: CerezTercihi | null = null;

function onayOku(): CerezTercihi | null {
  let ham: string | null = null;
  try {
    ham = localStorage.getItem(ONAY_ANAHTARI);
  } catch {}
  if (ham === sonHam) return sonTercih;
  sonHam = ham;
  sonTercih = null;
  try {
    // Eski surum ("kabul"/"red") tum kategoriler icin tek karardi.
    const t = ham === "kabul" || ham === "red" ? { reklam: ham === "kabul", olcum: ham === "kabul", zaman: 0 } : ham ? (JSON.parse(ham) as CerezTercihi) : null;
    if (t && (t.zaman === 0 || Date.now() - t.zaman < ONAY_GECERLILIK_MS)) sonTercih = t;
  } catch {}
  return sonTercih;
}

export function onayYaz(secim: { reklam: boolean; olcum: boolean }) {
  try {
    localStorage.setItem(ONAY_ANAHTARI, JSON.stringify({ ...secim, zaman: Date.now() }));
  } catch {}
  window.dispatchEvent(new Event(ONAY_OLAYI));
  // Rizanin ispati veri sorumlusunda: karar sunucuda kayit altina alinir.
  fetch("/api/cerez-onay", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...secim, surum: CEREZ_METNI_SURUMU }) }).catch(() => {});
}

function onayAbone(cb: () => void) {
  window.addEventListener(ONAY_OLAYI, cb);
  window.addEventListener("storage", cb);
  return () => {
    window.removeEventListener(ONAY_OLAYI, cb);
    window.removeEventListener("storage", cb);
  };
}

/** undefined: sunucu/hidrasyon (henuz bilinmiyor), null: karar verilmedi veya suresi doldu. */
export function useCerezOnayi(): CerezTercihi | null | undefined {
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
    if (onayOku()?.olcum && deneme < 6) setTimeout(() => olay(ad, veri, deneme + 1), 500);
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

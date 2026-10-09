import { router, type Href } from "expo-router";
import * as WebBrowser from "expo-web-browser";
import { SITE } from "@/lib/api";

// Sitedeki yol → uygulamadaki ekran. Karsiligi olmayan yol (ve dis baglanti) tarayicida acilir.
const ESLEME: [RegExp, (m: RegExpMatchArray) => Href][] = [
  [/^\/$/, () => "/"],
  [/^\/ilan\/([^/]+)$/, (m) => ({ pathname: "/ilan/[id]", params: { id: m[1] } })],
  [/^\/haberler\/([^/]+)$/, (m) => ({ pathname: "/haber/[slug]", params: { slug: m[1] } })],
  [/^\/haberler$/, () => "/haberler"],
  [/^\/ilanlar$/, () => "/ilanlar"],
  [/^\/becayis$/, () => "/ilanlar"],
  [/^\/becayis\/(talep-olustur|taleplerim|ilgilendiklerim)$/, (m) => `/becayis/${m[1]}` as Href],
  [/^\/becayis\/([^/]+)$/, (m) => ({ pathname: "/becayis/[id]", params: { id: m[1] } })],
  [/^\/bolum\/([^/]+)$/, (m) => ({ pathname: "/liste", params: { kapsam: "bolum", deger: m[1] } })],
  [/^\/seviye\/([^/]+)$/, (m) => ({ pathname: "/liste", params: { kapsam: "seviye", deger: m[1] } })],
  [/^\/kpss-denemesi\/([^/]+)$/, (m) => ({ pathname: "/kpss/[duzey]", params: { duzey: m[1] } })],
  [/^\/kpss-denemesi$/, () => "/kpss"],
  [/^\/kpss-puan-hesaplama$/, () => "/kpss-puan"],
  [/^\/destek$/, () => "/destek"],
  [/^\/analiz$/, () => "/analiz"],
  [/^\/profilim\/abonelik$/, () => "/abonelik"],
  [/^\/profilim\/ayarlar$/, () => "/ayarlar"],
  [/^\/profilim$/, () => "/profil"],
];

export function siteLinkiAc(link: string) {
  const yol = link.startsWith(SITE) ? link.slice(SITE.length) || "/" : link;
  if (yol.startsWith("/")) {
    const temiz = yol.split(/[?#]/)[0];
    for (const [desen, hedef] of ESLEME) {
      const m = temiz.match(desen);
      if (m) return router.push(hedef(m));
    }
  }
  WebBrowser.openBrowserAsync(yol.startsWith("/") ? SITE + yol : yol);
}

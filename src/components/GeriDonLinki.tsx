"use client";

import { useEffect, useSyncExternalStore } from "react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { ArrowLeft } from "lucide-react";

const SIMDIKI = "kamuyolu:simdikiSayfa";
const ONCEKI = "kamuyolu:oncekiSayfa";

const oku = (anahtar: string) => {
  try {
    return sessionStorage.getItem(anahtar);
  } catch {
    return null;
  }
};

/** Layout'ta bir kez: site ici her gezinmede bir onceki sayfanin adresini (filtreleriyle) sekme oturumuna yazar. */
export function GezinmeKaydi() {
  const pathname = usePathname();
  const arama = useSearchParams().toString();
  useEffect(() => {
    const simdiki = arama ? `${pathname}?${arama}` : pathname;
    try {
      const onceki = sessionStorage.getItem(SIMDIKI);
      // Ayni sayfada yalniz filtre degisirse "onceki" degismez, guncel adres yazilir.
      if (onceki && onceki.split("?")[0] !== pathname) sessionStorage.setItem(ONCEKI, onceki);
      sessionStorage.setItem(SIMDIKI, simdiki);
    } catch {
      // Gizli sekme vb.: geri butonu yedek baglantiya duser.
    }
  }, [pathname, arama]);
  return null;
}

const SEVIYE_ADI: Record<string, string> = { lise: "Lise", onlisans: "Önlisans", lisans: "Lisans" };

/** Onceki sayfa bir liste sayfasiysa ona uygun etiket; degilse null. */
function listeEtiketi(yol: string, bolumler: { slug: string; name: string }[]): string | null {
  const [, ilk, ikinci] = yol.split("?")[0].split("/");
  if (ilk === "bolum") return `${bolumler.find((b) => b.slug === ikinci)?.name ?? "Bölüm"} ilanlarına dön`;
  if (ilk === "seviye") return `${SEVIYE_ADI[ikinci] ?? ""} mezunu ilanlarına dön`.trim();
  if (ilk === "ilanlar") return "Tüm ilanlara dön";
  if (ilk === "" && !ikinci) return "Ana sayfaya dön";
  if (ilk === "profilim") return "Profiline dön";
  return null;
}

/**
 * Ilan sayfasinin geri baglantisi: liste sayfasindan gelindiyse oraya geri doner
 * (router.back -> filtreler ve kaydirma konumu korunur); dogrudan gelindiyse
 * (Google, paylasilan link) sunucunun hesapladigi yedek sayfaya gider.
 */
export function GeriDonLinki({ yedekHref, yedekEtiket, bolumler }: { yedekHref: string; yedekEtiket: string; bolumler: { slug: string; name: string }[] }) {
  const router = useRouter();
  const onceki = useSyncExternalStore(
    () => () => {},
    () => oku(ONCEKI),
    () => null,
  );
  const etiket = onceki ? listeEtiketi(onceki, bolumler) : null;

  return (
    <Link
      href={etiket ? onceki! : yedekHref}
      onClick={(e) => {
        // Yeni sekmede acilan ilanda gecmis bos: geri yerine onceki listenin adresine gidilir.
        if (!etiket || window.history.length < 2) return;
        e.preventDefault();
        router.back();
      }}
      className="inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
    >
      <ArrowLeft className="h-3.5 w-3.5" />
      {etiket ?? yedekEtiket}
    </Link>
  );
}

// Sitedeki tarih bicimleri (tr-TR, Istanbul saati).
const UZUN = new Intl.DateTimeFormat("tr-TR", { day: "2-digit", month: "long", year: "numeric", timeZone: "Europe/Istanbul" });
const KISA = new Intl.DateTimeFormat("tr-TR", { day: "numeric", month: "short", timeZone: "Europe/Istanbul" });

export const tarihUzun = (iso: string) => UZUN.format(new Date(iso));
export const tarihKisa = (iso: string) => KISA.format(new Date(iso));
export const sayi = (n: number) => n.toLocaleString("tr-TR");

export const DUZEY_ADI: Record<string, string> = {
  LISANS: "Lisans",
  ONLISANS: "Önlisans",
  LISE: "Lise",
  ILKOGRETIM: "İlköğretim",
  YUKSEK_LISANS: "Yüksek Lisans",
};

/** Kalan gune gore rozet (sitedeki IlanVitrinKarti / kalanGunStili). */
export function kalanGunRozeti(kalan: number | null) {
  if (kalan === null) return { metin: "Belirtilmemiş", renk: "#475569", zemin: "#f1f5f9" };
  if (kalan < 0) return { metin: "Süresi doldu", renk: "#475569", zemin: "#f1f5f9" };
  if (kalan === 0) return { metin: "Son gün bugün", renk: "#b91c1c", zemin: "#fef2f2" };
  return {
    metin: `${kalan} gün kaldı`,
    renk: kalan <= 3 ? "#b91c1c" : kalan <= 7 ? "#b45309" : "#047857",
    zemin: kalan <= 3 ? "#fef2f2" : kalan <= 7 ? "#fffbeb" : "#ecfdf5",
  };
}

/**
 * Ziyaretcinin geldigi kaynak (reklam kampanyasi olcumu): ilk ziyaretteki utm_* / tiklama
 * kimlikleri, dis referrer ve giris sayfasi. Hem tarayicida (cerez/govde) hem sunucuda kullanilir;
 * istemciden gelen deger her zaman bu izinli anahtarlarla temizlenir.
 */
export const KAYNAK_ANAHTARLARI = ["utm_source", "utm_medium", "utm_campaign", "utm_content", "utm_term", "gclid", "fbclid", "ttclid", "ref", "giris"] as const;
export type Kaynak = Partial<Record<(typeof KAYNAK_ANAHTARLARI)[number], string>>;

export const KAYNAK_CEREZ = "ky_kaynak";

/** Bilinmeyen anahtarlari atar, degerleri 200 karakterle sinirlar; bossa null. */
export function kaynakTemizle(ham: unknown): Kaynak | null {
  if (!ham || typeof ham !== "object") return null;
  const sonuc: Kaynak = {};
  for (const k of KAYNAK_ANAHTARLARI) {
    const v = (ham as Record<string, unknown>)[k];
    if (typeof v === "string" && v.trim()) sonuc[k] = v.trim().slice(0, 200);
  }
  return Object.keys(sonuc).length ? sonuc : null;
}

/** Cerez degerini (encodeURIComponent'li JSON) cozer. */
export function kaynakCerezCoz(deger: string | undefined): Kaynak | null {
  if (!deger) return null;
  try {
    return kaynakTemizle(JSON.parse(decodeURIComponent(deger)));
  } catch {
    return null;
  }
}

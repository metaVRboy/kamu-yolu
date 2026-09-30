// Kamu ilan sitelerini (isinolsa.com, memurlar.net, secmeyemektarifleri.net)
// tarayan scraper'larin ortak kullandigi kucuk yardimcilar - her scraper
// kendi kopyasini tutmasin diye burada tek yerde.

const AY_ISIMLERI: Record<string, number> = {
  ocak: 1,
  şubat: 2,
  subat: 2,
  mart: 3,
  nisan: 4,
  mayıs: 5,
  mayis: 5,
  haziran: 6,
  temmuz: 7,
  ağustos: 8,
  agustos: 8,
  eylül: 9,
  eylul: 9,
  ekim: 10,
  kasım: 11,
  kasim: 11,
  aralık: 12,
  aralik: 12,
};

const HTML_ENTITIES: Record<string, string> = {
  "&#8211;": "–",
  "&#8212;": "—",
  "&#8216;": "'",
  "&#8217;": "'",
  "&#8220;": "“",
  "&#8221;": "”",
  "&amp;": "&",
  "&nbsp;": " ",
  "&quot;": '"',
};

export function decodeHtmlEntities(text: string): string {
  return text
    .replace(/&#8211;|&#8212;|&#8216;|&#8217;|&#8220;|&#8221;|&amp;|&nbsp;|&quot;/g, (m) => HTML_ENTITIES[m])
    .replace(/&#(\d+);/g, (_, code) => String.fromCharCode(Number(code)));
}

/**
 * "25 Eylül 2026" -> Date; parse edilemezse null. `endOfDay` true ise saat
 * 23:59:59 olarak donuliyor (ör. son basvuru tarihi gibi kullanimlar icin).
 */
export function parseTurkceTarih(text: string, endOfDay = false): Date | null {
  const match = text
    .trim()
    .toLocaleLowerCase("tr-TR")
    .match(/(\d{1,2})\s+([a-zçğıöşü]+)\s+(\d{4})/);
  if (!match) return null;
  const gun = Number(match[1]);
  const ay = AY_ISIMLERI[match[2]];
  const yil = Number(match[3]);
  if (!ay) return null;
  return endOfDay ? new Date(Date.UTC(yil, ay - 1, gun, 23, 59, 59)) : new Date(Date.UTC(yil, ay - 1, gun));
}

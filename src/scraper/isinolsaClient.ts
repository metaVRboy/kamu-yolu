const LISTE_URL = "https://www.isinolsa.com/guncel-kamu-ilanlari/";

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
};

function decodeHtmlEntities(text: string): string {
  return text
    .replace(/&#8211;|&#8212;|&#8216;|&#8217;|&#8220;|&#8221;|&amp;|&nbsp;/g, (m) => HTML_ENTITIES[m])
    .replace(/&#(\d+);/g, (_, code) => String.fromCharCode(Number(code)));
}

/** "28 Ağustos 2026" -> Date; parse edilemezse null. */
function parseTurkceTarih(text: string): Date | null {
  const match = text
    .trim()
    .toLocaleLowerCase("tr-TR")
    .match(/(\d{1,2})\s+([a-zçğıöşü]+)\s+(\d{4})/);
  if (!match) return null;
  const gun = Number(match[1]);
  const ay = AY_ISIMLERI[match[2]];
  const yil = Number(match[3]);
  if (!ay) return null;
  return new Date(Date.UTC(yil, ay - 1, gun));
}

export type IsinolsaIlan = {
  externalId: string;
  kurumAdi: string;
  baslik: string;
  detayUrl: string;
  applicationStart: Date | null;
  applicationEnd: Date | null;
};

/**
 * isinolsa.com/guncel-kamu-ilanlari/ sayfasini ceker ve satirlari
 * yapilandirilmis listeye cevirir. Sayfa duz HTML (JS gerektirmiyor).
 */
export async function fetchIsinolsaIlanlari(): Promise<IsinolsaIlan[]> {
  const res = await fetch(LISTE_URL, {
    headers: {
      "User-Agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36",
    },
  });
  if (!res.ok) throw new Error(`isinolsa.com yanit vermedi: ${res.status}`);
  const html = await res.text();

  const ilanlar: IsinolsaIlan[] = [];
  // Her satir bir sonraki "gki-satir" acilisina kadar surer; nested div
  // sayisi degiskenlik gosterebildigi icin (regex ile dengeli parantez
  // eslestirmek yerine) sayfayi bu isaretcilere gore boluyoruz.
  const bloklar = html.split(/<div class="gki-satir[^"]*">/).slice(1);

  for (const blok of bloklar) {
    const kurumMatch = blok.match(/class="gki-kurum">([^<]+)</);
    const baslikMatch = blok.match(
      /class="gki-baslik-ilan"><a href="([^"]+)">([^<]+)</,
    );
    const tarihMetinMatch = blok.match(/class="gki-tarih-metin">([^<]+)</);
    const bitisIsoMatch = blok.match(/data-tarih="(\d{4}-\d{2}-\d{2})"/);

    if (!kurumMatch || !baslikMatch) continue;

    const kurumAdi = decodeHtmlEntities(kurumMatch[1].trim());
    const detayUrl = baslikMatch[1].trim();
    const baslik = decodeHtmlEntities(baslikMatch[2].trim());

    let applicationStart: Date | null = null;
    let applicationEnd: Date | null = null;
    if (tarihMetinMatch) {
      const parcalar = tarihMetinMatch[1].split("-").map((p) => p.trim());
      if (parcalar[0]) applicationStart = parseTurkceTarih(parcalar[0]);
      if (parcalar[1]) applicationEnd = parseTurkceTarih(parcalar[1]);
    }
    if (bitisIsoMatch) {
      applicationEnd = new Date(`${bitisIsoMatch[1]}T23:59:59Z`);
    }

    // externalId, ilanin kendi sayfa yolundan turetilir (kalici ve benzersiz).
    const externalId = `isinolsa:${detayUrl.replace(/^https?:\/\/[^/]+/, "")}`;

    ilanlar.push({ externalId, kurumAdi, baslik, detayUrl, applicationStart, applicationEnd });
  }

  return ilanlar;
}

import { decodeHtmlEntities, parseTurkceTarih } from "./scraperUtils";

const LISTE_URL = "https://www.isinolsa.com/guncel-kamu-ilanlari/";

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

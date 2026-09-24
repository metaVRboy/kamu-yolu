const BASE_URL = "https://ilan.memurlar.net";

// Sadece GERCEK kamu istihdami kategorileri taranir - sitenin "Akademik
// Ilanlar (Vakif)" (ozel vakif universiteleri - kamu degil), "Ozel Okul
// Ilanlari", "Yatay Gecis", "Yurt Disi Burs/Prog." ve "Yuksek Lisans ve
// Doktora" (bunlar istihdam degil ogrenci/ogrenim ilani) kategorileri
// kasitli olarak DISARIDA birakildi.
export const MEMURLAR_KATEGORILER = [
  "4b-ilanlari",
  "akademik-ilanlar-devlet",
  "askeri-ilanlar",
  "daimi-isci-ilanlari",
  "engelli-ilanlari",
  "eski-hukumlu",
  "gecici-isci-ilanlari",
  "genel-ilanlar",
  "lakinma-ajansi", // sitenin kendi URL'sindeki yazim (dogrusu "kalkinma" olmali)
  "kpss-a-ilanlari",
  "kpss-b-ilanlari",
  "mahalli-ilanlari",
  "sydv-ilanlari",
  "terorle-mucadelede-yaralanan-isci",
  "yok-duyurulari",
] as const;

const HEADERS = {
  "User-Agent":
    "KamuYoluBot/0.1 (kamu ilanlarini bolume gore listeleyen acik kaynak proje; iletisim: emirhan.koc@sonayyatirim.com)",
};

const AY_ISIMLERI: Record<string, number> = {
  ocak: 1, şubat: 2, subat: 2, mart: 3, nisan: 4, mayıs: 5, mayis: 5,
  haziran: 6, temmuz: 7, ağustos: 8, agustos: 8, eylül: 9, eylul: 9,
  ekim: 10, kasım: 11, kasim: 11, aralık: 12, aralik: 12,
};

const HTML_ENTITIES: Record<string, string> = {
  "&#8211;": "–", "&#8212;": "—", "&#8216;": "'", "&#8217;": "'",
  "&#8220;": "“", "&#8221;": "”", "&amp;": "&", "&nbsp;": " ", "&quot;": '"',
};

function decodeHtmlEntities(text: string): string {
  return text
    .replace(/&#8211;|&#8212;|&#8216;|&#8217;|&#8220;|&#8221;|&amp;|&nbsp;|&quot;/g, (m) => HTML_ENTITIES[m])
    .replace(/&#(\d+);/g, (_, code) => String.fromCharCode(Number(code)));
}

/** "25 Eylül 2026" -> Date; parse edilemezse null. */
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
  return new Date(Date.UTC(yil, ay - 1, gun, 23, 59, 59));
}

// Sayfa "acildi/kapandi" etiketlerini dengeli sayarak <div class="detail">
// icerigini cikarir - regex ile ic ice div'leri dogru yakalamak guvenilir
// degil, bu yuzden basit bir derinlik sayaci kullanilir.
function extractBalancedDiv(html: string, openTagStart: number): string {
  const contentStart = html.indexOf(">", openTagStart) + 1;
  let depth = 1;
  let i = contentStart;
  while (depth > 0) {
    const nextOpen = html.indexOf("<div", i);
    const nextClose = html.indexOf("</div>", i);
    if (nextClose === -1) return html.slice(contentStart);
    if (nextOpen !== -1 && nextOpen < nextClose) {
      depth++;
      i = nextOpen + 4;
    } else {
      depth--;
      i = nextClose + 6;
    }
  }
  return html.slice(contentStart, i - 6);
}

function stripHtmlTags(html: string): string {
  return decodeHtmlEntities(
    html
      .replace(/<(script|style)[^>]*>[\s\S]*?<\/\1>/gi, "")
      .replace(/<br\s*\/?>/gi, "\n")
      .replace(/<\/(p|div|li|h[1-6])>/gi, "\n")
      .replace(/<[^>]+>/g, ""),
  )
    .replace(/[ \t]+/g, " ")
    .replace(/\n[ \t]+/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

/**
 * memurlar.net ISO-8859-9 (Turkce Latin-5) donuyor, UTF-8 degil - duz
 * res.text() Turkce karakterleri bozar, bu yuzden bayt duzeyinde
 * dogru kod sayfasiyla decode ediliyor.
 */
async function fetchDecoded(url: string): Promise<string> {
  const res = await fetch(url, { headers: HEADERS });
  if (!res.ok) throw new Error(`memurlar.net yanıt vermedi: ${res.status} (${url})`);
  const buf = await res.arrayBuffer();
  return new TextDecoder("iso-8859-9").decode(buf);
}

export type MemurlarIlanOzet = {
  id: string;
  slug: string;
  title: string;
};

async function fetchKategoriSayfasi(
  kategori: string,
  sayfa: number,
): Promise<{ items: MemurlarIlanOzet[]; sonrakiSayfaVar: boolean }> {
  const url =
    sayfa === 1
      ? `${BASE_URL}/kategori/${kategori}/?Expire=false`
      : `${BASE_URL}/kategori/${kategori}/${sayfa}.sayfa?Expire=false`;
  const html = await fetchDecoded(url);

  const items: MemurlarIlanOzet[] = [];
  const gorulen = new Set<string>();
  for (const m of html.matchAll(/href="\/ilan\/(\d+)\/([a-z0-9-]+)\.html"\s+title="([^"]+)"/g)) {
    const [, id, slug, title] = m;
    if (gorulen.has(id)) continue;
    gorulen.add(id);
    items.push({ id, slug, title: decodeHtmlEntities(title) });
  }

  const sonrakiSayfaVar = html.includes(`/${sayfa + 1}.sayfa?Expire=false`);
  return { items, sonrakiSayfaVar };
}

/** Bir kategorideki (sadece yayinda/aktif olan) tum ilan ozetlerini ceker. */
export async function fetchKategoriIlanlari(
  kategori: string,
  maxSayfa = 5,
): Promise<MemurlarIlanOzet[]> {
  const tumu: MemurlarIlanOzet[] = [];
  for (let sayfa = 1; sayfa <= maxSayfa; sayfa++) {
    const { items, sonrakiSayfaVar } = await fetchKategoriSayfasi(kategori, sayfa);
    tumu.push(...items);
    if (!sonrakiSayfaVar) break;
  }
  return tumu;
}

export type MemurlarIlanDetay = {
  title: string;
  kategori: string | null;
  kaynak: string | null;
  ilanGirisTarihi: Date | null;
  applicationEnd: Date | null;
  bodyText: string;
  imageUrl: string | null;
};

export function ilanDetayUrl(id: string, slug: string): string {
  return `${BASE_URL}/ilan/${id}/${slug}.html`;
}

export async function fetchIlanDetay(id: string, slug: string): Promise<MemurlarIlanDetay> {
  const html = await fetchDecoded(ilanDetayUrl(id, slug));

  const title = decodeHtmlEntities(html.match(/<h1 class="title">([^<]+)<\/h1>/)?.[1]?.trim() ?? "");
  const kategori = html.match(/<div class="breadcrumb">[\s\S]*?<a href="\/kategori\/[^"]+\/"[^>]*>([^<]+)<\/a>/)?.[1]?.trim() ?? null;
  const kaynakRaw = html.match(/Kaynak\s*:\s*([^<\n]+)/)?.[1]?.trim();
  const kaynak = kaynakRaw ? decodeHtmlEntities(kaynakRaw) : null;

  const girisIso = html.match(/İlan Giriş\s*:<time[^>]*datetime="([^"]+)"/)?.[1];
  const ilanGirisTarihi = girisIso ? new Date(girisIso) : null;

  const description = html.match(/<meta property="og:description" content="([^"]*)"/)?.[1] ?? "";
  const sonBasvuruMatch = description.match(/[Ss]on\s+ba[sş]vuru\s+tarihi\s+([^.]+)/);
  const applicationEnd = sonBasvuruMatch ? parseTurkceTarih(sonBasvuruMatch[1]) : null;

  const detailOpenTag = html.indexOf('<div class="detail">');
  const bodyText = detailOpenTag === -1 ? "" : stripHtmlTags(extractBalancedDiv(html, detailOpenTag));

  const imageUrl = html.match(/<meta property="og:image" content="([^"]+)"/)?.[1] ?? null;

  return { title, kategori, kaynak, ilanGirisTarihi, applicationEnd, bodyText, imageUrl };
}

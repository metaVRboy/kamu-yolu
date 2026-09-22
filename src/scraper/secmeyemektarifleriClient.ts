const LISTE_URL = "https://www.secmeyemektarifleri.net/category/memur-personel-alimi/";

// Sitenin kendi statik sayfalari (menu/footer linkleri) - makale degiller,
// ayni href="...slug/" title="..." desenine uyabildikleri icin disleniyor.
const STATIK_SAYFA_SLUGLARI = new Set([
  "ana-sayfa",
  "kunye",
  "iletisim",
  "hakkimizda",
  "kvkk-aydinlatma-metni",
  "gizlilik-politikasi",
  "cerez-politikasi",
  "haber-gonder",
  "trafik-durumu",
  "nobetci-eczaneler",
  "canli-sonuclar",
]);

export type SecmeyemektarifleriMakale = {
  externalId: string;
  baslik: string;
};

function decodeHtmlEntities(text: string): string {
  return text
    .replace(/&#8211;|&#8212;|&#8216;|&#8217;|&#8220;|&#8221;|&amp;|&nbsp;/g, (m) =>
      ({
        "&#8211;": "–",
        "&#8212;": "—",
        "&#8216;": "'",
        "&#8217;": "'",
        "&#8220;": "“",
        "&#8221;": "”",
        "&amp;": "&",
        "&nbsp;": " ",
      })[m] ?? m,
    )
    .replace(/&#(\d+);/g, (_, code) => String.fromCharCode(Number(code)));
}

/**
 * secmeyemektarifleri.net'in "Memur Personel Alımı" kategori sayfasini
 * ceker ve makale (slug + baslik) listesine cevirir. Sayfa duz HTML.
 * Ayni makale sayfada birden fazla yerde (son dakika seridi + ana liste)
 * gecebiliyor - slug'a gore tekillestirilir.
 */
export async function fetchSecmeyemektarifleriMakaleleri(): Promise<
  SecmeyemektarifleriMakale[]
> {
  const res = await fetch(LISTE_URL, {
    headers: {
      "User-Agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36",
    },
  });
  if (!res.ok) throw new Error(`secmeyemektarifleri.net yanit vermedi: ${res.status}`);
  const html = await res.text();

  const gorulenSlug = new Set<string>();
  const makaleler: SecmeyemektarifleriMakale[] = [];

  const regex = /https:\/\/www\.secmeyemektarifleri\.net\/([a-z0-9-]+)\/"\s*title="([^"]+)"/g;
  for (const match of html.matchAll(regex)) {
    const slug = match[1];
    if (STATIK_SAYFA_SLUGLARI.has(slug) || gorulenSlug.has(slug)) continue;
    gorulenSlug.add(slug);

    makaleler.push({
      externalId: `secmeyemektarifleri:${slug}`,
      baslik: decodeHtmlEntities(match[2].trim()),
    });
  }

  return makaleler;
}

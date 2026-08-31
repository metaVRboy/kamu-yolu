const OG_IMAGE_PATTERNS = [
  /<meta[^>]+property=["']og:image["'][^>]+content=["']([^"']+)["']/i,
  /<meta[^>]+content=["']([^"']+)["'][^>]+property=["']og:image["']/i,
  /<meta[^>]+name=["']twitter:image["'][^>]+content=["']([^"']+)["']/i,
  /<meta[^>]+content=["']([^"']+)["'][^>]+name=["']twitter:image["']/i,
];

/**
 * Bir haber sayfasinin kendi yayinladigi onizleme gorselini (og:image /
 * twitter:image meta etiketi) okur - sosyal medya paylasim onizlemesinde
 * gorunecek olanla ayni gorsel. Kurumun/haberin kendi belirledigi resmi
 * gorsel oldugu icin, sayfa icerigini kopyalamadan gorsel eklemenin en
 * guvenli yolu budur. Bulunamazsa null doner.
 */
export async function extractOgImage(pageUrl: string): Promise<string | null> {
  try {
    const res = await fetch(pageUrl, { signal: AbortSignal.timeout(8000) });
    if (!res.ok) return null;
    const html = await res.text();

    for (const pattern of OG_IMAGE_PATTERNS) {
      const match = html.match(pattern);
      if (match) {
        try {
          const resolved = new URL(match[1], pageUrl).toString();
          // .svg genelde bir haber fotografi degil, kurumun logosudur -
          // 16:9 bir foto alanina gerildiginde kotu gorunur.
          if (/\.svg(\?|$)/i.test(resolved)) continue;
          return resolved;
        } catch {
          continue;
        }
      }
    }
    return null;
  } catch {
    return null;
  }
}

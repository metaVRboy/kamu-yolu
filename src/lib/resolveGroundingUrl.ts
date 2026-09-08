/**
 * Gemini'nin Google Search grounding araci, kaynak olarak gercek site
 * URL'sini degil, vertexaisearch.cloud.google.com/grounding-api-redirect/...
 * seklinde bir yonlendirme linki doner (model de gercek URL'yi gormez, sadece
 * bu linki ve cikplak alan adini gorur). Bu linkleri kalici olarak sitede
 * saklamak/gostermek yerine, gercek/nihai kaynak URL'sini cozup onu
 * saklamamiz gerekir - hem kullaniciya dogru link gostermek hem de
 * isinolsa.com gibi kaynaklari eleyebilmek icin.
 */
// Gercek bir tarayici User-Agent'i olmadan bircok haber/kurum sitesi bot
// korumasi (Cloudflare vb.) devreye sokup istegi ana sayfaya yonlendiriyor -
// sonucta kaynakUrl olarak makale yerine site koku kaydediliyordu.
const BROWSER_HEADERS = {
  "User-Agent":
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36",
  "Accept-Language": "tr-TR,tr;q=0.9,en;q=0.8",
};

export async function resolveGroundingUrl(redirectUrl: string): Promise<string | null> {
  try {
    // Bilinmeyen/yavas ucuncu taraf siteler tum istegi bekletmesin diye
    // sinirli bir sure veriyoruz.
    const res = await fetch(redirectUrl, {
      redirect: "follow",
      signal: AbortSignal.timeout(8000),
      headers: BROWSER_HEADERS,
    });
    res.body?.cancel?.().catch(() => {});
    return res.url && /^https?:\/\//.test(res.url) ? res.url : null;
  } catch {
    return null;
  }
}

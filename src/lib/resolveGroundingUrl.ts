/**
 * Gemini'nin Google Search grounding araci, kaynak olarak gercek site
 * URL'sini degil, vertexaisearch.cloud.google.com/grounding-api-redirect/...
 * seklinde bir yonlendirme linki doner (model de gercek URL'yi gormez, sadece
 * bu linki ve cikplak alan adini gorur). Bu linkleri kalici olarak sitede
 * saklamak/gostermek yerine, gercek/nihai kaynak URL'sini cozup onu
 * saklamamiz gerekir - hem kullaniciya dogru link gostermek hem de
 * isinolsa.com gibi kaynaklari eleyebilmek icin.
 */
export async function resolveGroundingUrl(redirectUrl: string): Promise<string | null> {
  try {
    // Bilinmeyen/yavas ucuncu taraf siteler tum istegi bekletmesin diye
    // sinirli bir sure veriyoruz.
    const res = await fetch(redirectUrl, { redirect: "follow", signal: AbortSignal.timeout(8000) });
    res.body?.cancel?.().catch(() => {});
    return res.url && /^https?:\/\//.test(res.url) ? res.url : null;
  } catch {
    return null;
  }
}

// Yapay zeka botlari: egitim tarayicilari, kullanici adina sayfa ceken ajanlar ("kamuyolu.com'u kopyala"
// diyen birinin araci) ve YZ arama botlari. robots.txt'de tum siteden yasak, /api'de proxy reddeder.
export const YZ_BOTLARI = [
  "GPTBot", "ChatGPT-User", "OAI-SearchBot",
  "ClaudeBot", "Claude-User", "Claude-SearchBot", "anthropic-ai", "claude-web",
  "PerplexityBot", "Perplexity-User",
  "Google-Extended", "Applebot-Extended", "CCBot", "Bytespider",
  "meta-externalagent", "Meta-ExternalFetcher", "FacebookBot",
  "Amazonbot", "cohere-ai", "cohere-training-data-crawler", "Diffbot", "YouBot",
  "DuckAssistBot", "MistralAI-User", "AI2Bot", "Timpibot", "ImagesiftBot", "omgili", "PetalBot",
];

// Script/kazima araclari. Mobil uygulamanin kendi imzalari (Android okhttp, iOS CFNetwork) listede YOK.
const ARACLAR = [
  "curl", "wget", "python", "httpx", "aiohttp", "scrapy", "go-http-client", "node-fetch", "undici", "axios",
  "java/", "libwww", "headlesschrome", "puppeteer", "playwright", "postmanruntime", "insomnia", "httpie",
];

const IMZA = new RegExp([...YZ_BOTLARI, ...ARACLAR].map((s) => s.replace(/[.*+?^${}()|[\]\\/]/g, "\\$&")).join("|") + "|^node$", "i");

/**
 * /api'ye bot/script istegi mi. Sayfalari Vercel Firewall (Bot Protection) korur; mobil uygulama
 * dogrulama cozemedigi icin /api orada muaf, toplu JSON veri buradan cekilmesin. Bos imza da bot sayilir.
 * Imza taklit edilebilir: amac duz scriptleri ve kurala uyan YZ ajanlarini durdurmak, gerisine hiz siniri.
 */
export const botMu = (userAgent: string | null) => !userAgent || IMZA.test(userAgent);

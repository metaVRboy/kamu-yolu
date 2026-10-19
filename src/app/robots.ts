import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/site";

// Yapay zeka botlari tum siteden yasak: egitim tarayicilari, kullanici adina sayfa ceken ajanlar
// ("kamuyolu.com'u kopyala" diyen birinin araci) ve YZ arama botlari. Kurallara uyan araclar durur;
// uymayanlara karsi Vercel Firewall (AI Bots + Bot Protection) ve hiz siniri devrede.
// Google ve Bing arama botlari etkilenmez (SEO); Google-Extended yalniz Gemini egitimini kapatir.
const YZ_BOTLARI = [
  "GPTBot", "ChatGPT-User", "OAI-SearchBot",
  "ClaudeBot", "Claude-User", "Claude-SearchBot", "anthropic-ai", "claude-web",
  "PerplexityBot", "Perplexity-User",
  "Google-Extended", "Applebot-Extended", "CCBot", "Bytespider",
  "meta-externalagent", "Meta-ExternalFetcher", "FacebookBot",
  "Amazonbot", "cohere-ai", "cohere-training-data-crawler", "Diffbot", "YouBot",
  "DuckAssistBot", "MistralAI-User", "AI2Bot", "Timpibot", "ImagesiftBot", "omgili", "PetalBot",
];

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      { userAgent: YZ_BOTLARI, disallow: "/" },
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          "/api/",
          "/admin",
          "/profilim",
          "/giris",
          "/kayit-ol",
          "/sifremi-unuttum",
          "/sifre-sifirla",
          "/becayis/talep-olustur",
          "/becayis/taleplerim",
          "/becayis/ilgilendiklerim",
        ],
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}

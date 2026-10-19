import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/site";
import { YZ_BOTLARI } from "@/lib/botlar";

// Yapay zeka botlari tum siteden yasak. Kurallara uyan araclar durur; uymayanlara karsi Vercel Firewall
// (AI Bots + Bot Protection), /api'de proxy (botMu) ve hiz siniri devrede.
// Google ve Bing arama botlari etkilenmez (SEO); Google-Extended yalniz Gemini egitimini kapatir.

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

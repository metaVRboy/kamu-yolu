import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/site";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
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
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}

import type { NextConfig } from "next";

const isDev = process.env.NODE_ENV === "development";

// Betik yalniz kullandigimiz servislerden: GA4, Meta ve TikTok pikselleri (CerezOnayi), Turnstile. Yeni bir
// ucuncu taraf betik eklenirse buraya da yazilmali. 'unsafe-inline' kalir: nonce tum sayfalari dinamige
// cevirir (onbellek kalkar). Diger kazanclar: gomulme yasagi, object/base/form kilidi, https yukseltme.
const BETIK_KAYNAKLARI = "https://www.googletagmanager.com https://*.google-analytics.com https://connect.facebook.net https://analytics.tiktok.com https://challenges.cloudflare.com";
const CSP = [
  "default-src 'self'",
  `script-src 'self' 'unsafe-inline' ${BETIK_KAYNAKLARI}${isDev ? " 'unsafe-eval'" : ""}`,
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob: https:",
  "font-src 'self' data:",
  "connect-src 'self' https:",
  "frame-src https://challenges.cloudflare.com https://www.googletagmanager.com",
  "worker-src 'self' blob:",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'none'",
  ...(isDev ? [] : ["upgrade-insecure-requests"]),
].join("; ");

const GUVENLIK_BASLIKLARI = [
  { key: "Content-Security-Policy", value: CSP },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
];

const nextConfig: NextConfig = {
  poweredByHeader: false,
  async headers() {
    return [{ source: "/(.*)", headers: GUVENLIK_BASLIKLARI }];
  },
  async redirects() {
    return [
      // Bolum arama artik ana sayfanin kendisinde (hero) - ayri bir
      // sayfa olarak kaldirildi, eski/indexlenmis baglantilar ana
      // sayfaya yonlendirilsin.
      { source: "/bolum-ara", destination: "/", permanent: true },
    ];
  },
};

export default nextConfig;

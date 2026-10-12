import type { NextConfig } from "next";

const isDev = process.env.NODE_ENV === "development";

// Script kaynaklari genis tutuldu: AdSense calisirken bircok Google alan adindan betik yukler, sabit
// liste reklamlari sessizce bozar; nonce ise tum sayfalari dinamige cevirir (onbellek kalkar).
// Asil kazanc: baska siteye gomulme yasagi, object/base/form kilidi, http -> https yukseltme.
const CSP = [
  "default-src 'self'",
  `script-src 'self' 'unsafe-inline' https:${isDev ? " 'unsafe-eval'" : ""}`,
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob: https:",
  "font-src 'self' data:",
  "connect-src 'self' https:",
  "frame-src https:",
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

import type { NextConfig } from "next";

const nextConfig: NextConfig = {
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

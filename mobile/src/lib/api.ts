import { useCallback, useEffect, useState } from "react";

// Sitenin sunucusu. Gelistirmede yerel sunucu icin EXPO_PUBLIC_API_URL verilir.
export const SITE = process.env.EXPO_PUBLIC_API_URL ?? "https://www.kamuyolu.com";

export class ApiHatasi extends Error {
  constructor(
    mesaj: string,
    public durum: number,
  ) {
    super(mesaj);
  }
}

/**
 * Sitenin API'sine istek. Oturum, sitedeki gibi cerezle tasinir: React Native'in
 * fetch'i Set-Cookie'yi cihazin cerez deposunda saklar ve sonraki isteklere ekler.
 */
export async function api<T>(yol: string, secenek: { method?: string; govde?: unknown } = {}): Promise<T> {
  let res: Response;
  try {
    res = await fetch(SITE + yol, {
      method: secenek.method ?? (secenek.govde ? "POST" : "GET"),
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: secenek.govde === undefined ? undefined : JSON.stringify(secenek.govde),
      credentials: "include",
    });
  } catch {
    throw new ApiHatasi("İnternet bağlantısı yok gibi görünüyor. Bağlantını kontrol edip tekrar dene.", 0);
  }
  const veri = await res.json().catch(() => ({}));
  if (!res.ok) throw new ApiHatasi(veri.error ?? "Bir şeyler ters gitti, lütfen tekrar dene.", res.status);
  return veri as T;
}

/**
 * Ekran verisi: ilk yukleme, asagi cekip yenileme ve hata durumu. yol null ise istek atilmaz.
 * yenile(false): gorunur yenileme gostergesi olmadan (ekrana donunce) tazeler.
 */
export function useVeri<T>(yol: string | null) {
  const [veri, setVeri] = useState<T | null>(null);
  const [hata, setHata] = useState<string | null>(null);
  const [yenileniyor, setYenileniyor] = useState(false);
  const [surum, setSurum] = useState(0);

  useEffect(() => {
    if (!yol) return;
    let iptal = false;
    api<T>(yol)
      .then(
        (v) => {
          if (iptal) return;
          setVeri(v);
          setHata(null);
        },
        (e) => !iptal && setHata(e instanceof Error ? e.message : "Yüklenemedi."),
      )
      .finally(() => !iptal && setYenileniyor(false));
    return () => {
      iptal = true;
    };
  }, [yol, surum]);

  const yenile = useCallback((gosterge = true) => {
    if (gosterge) setYenileniyor(true);
    setSurum((s) => s + 1);
  }, []);

  return { veri, hata, yenileniyor, yenile };
}

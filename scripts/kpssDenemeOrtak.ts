/**
 * KPSS deneme soru verisi dosyalarinin (Lisans/Onlisans/Ortaogretim) ortak
 * parcalari: soru tipi ve gorsel yardimcilari (src/lib/kpssGorsel.ts).
 */

export type SeedSoru = {
  ders: "TURKCE" | "MATEMATIK" | "TARIH" | "COGRAFYA" | "VATANDASLIK" | "GUNCEL";
  soruMetni: string;
  // Ortak metinli (bir parca/bilgi + birden fazla soru) bloklarda kardes
  // sorulara ayni grupId verilir - "X-Y. sorular..." basligi METNE
  // GOMULMEZ, gercek sinav sirasina gore arayuzde dinamik hesaplanir.
  grupId?: string;
  geometri?: boolean;
  // Ders ici konu; sinav sonu konu analizinde kullanilir (ör. "Kesirler ve Ondalık Sayılar").
  konu?: string;
  // Ayni kaliptan (yalniz sayilari farkli) sorular: ayni denemeye ikisi girmez (DenemeSoru.sablon).
  sablon?: string;
  gorselSvg?: string;
  secenekler: [string, string, string, string, string];
  dogruCevap: number;
  aciklama: string;
};

// Gorsel cizicileri src/lib/kpssGorsel.ts'te (gece Gemini uretimi de ayni cizicileri kullanir).
export { turkiyeHaritasi, iklimGrafigi, sutunGrafigi, type HaritaNoktasi } from "../src/lib/kpssGorsel";

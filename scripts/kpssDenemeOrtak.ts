/**
 * KPSS deneme soru verisi dosyalarinin (Lisans/Onlisans/Ortaogretim) ortak
 * parcalari: soru tipi ve gercek veriyle cizilen gorsel yardimcilari.
 */
import { HARITA_VIEWBOX, projeksiyon, TURKIYE_SINIRI, GOLLER, IL_SINIRLARI } from "./turkiyeHaritaVerisi";

export type SeedSoru = {
  ders: "TURKCE" | "MATEMATIK" | "TARIH" | "COGRAFYA" | "VATANDASLIK" | "GUNCEL";
  soruMetni: string;
  // Ortak metinli (bir parca/bilgi + birden fazla soru) bloklarda kardes
  // sorulara ayni grupId verilir - "X-Y. sorular..." basligi METNE
  // GOMULMEZ, gercek sinav sirasina gore arayuzde dinamik hesaplanir.
  grupId?: string;
  geometri?: boolean;
  gorselSvg?: string;
  secenekler: [string, string, string, string, string];
  dogruCevap: number;
  aciklama: string;
};

export type HaritaNoktasi = { etiket: string; boylam: number; enlem: number };

/**
 * Gercek sinir verisiyle (Natural Earth, bkz. turkiyeHaritaVerisi.ts) Turkiye
 * haritasi: gercek boylam/enlemdeki numarali kirmizi noktalar ve/veya tarali iller.
 */
export function turkiyeHaritasi({ noktalar = [], taraliIller = [] }: { noktalar?: HaritaNoktasi[]; taraliIller?: string[] }) {
  const taraliYol = taraliIller
    .map((il) => {
      if (!IL_SINIRLARI[il]) throw new Error(`Harita verisinde il yok: ${il}`);
      return IL_SINIRLARI[il];
    })
    .join("");
  const isaretler = noktalar
    .map(({ etiket, boylam, enlem }) => {
      const [x, y] = projeksiyon(boylam, enlem);
      return `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="3.6" fill="#dc2626" stroke="#7f1d1d" stroke-width="0.8"/><text x="${(x + 5).toFixed(1)}" y="${(y - 4).toFixed(1)}" font-size="12" font-weight="700">${etiket}</text>`;
    })
    .join("");
  return (
    `<svg viewBox="${HARITA_VIEWBOX}" xmlns="http://www.w3.org/2000/svg" font-family="Arial, sans-serif" fill="#1e293b">` +
    `<defs><pattern id="tarali" patternUnits="userSpaceOnUse" width="4" height="4" patternTransform="rotate(45)"><line x1="0" y1="0" x2="0" y2="4" stroke="#1e293b" stroke-width="1.4"/></pattern></defs>` +
    `<path d="${TURKIYE_SINIRI}" fill="#e2e8f0" stroke="#1e293b" stroke-width="1.1" stroke-linejoin="round"/>` +
    (taraliYol ? `<path d="${taraliYol}" fill="url(#tarali)" stroke="#1e293b" stroke-width="0.6"/>` : "") +
    `<path d="${GOLLER}" fill="#7dd3fc" stroke="#1e293b" stroke-width="0.6"/>` +
    isaretler +
    `</svg>`
  );
}

const AY_HARFLERI = ["O", "Ş", "M", "N", "M", "H", "T", "A", "E", "E", "K", "A"];

/** Iki panelli iklim grafigi: ustte aylik ortalama sicaklik (cizgi), altta aylik ortalama yagis (sutun). */
export function iklimGrafigi(sicaklik: number[], yagis: number[]) {
  const sol = 44;
  const genislik = 360;
  const yukseklik = 110;
  const ayX = (i: number) => sol + (genislik * (i + 0.5)) / 12;
  const panel = (ust: number, min: number, max: number, adim: number, baslik: string, ciz: (y: (v: number) => number) => string) => {
    const y = (v: number) => ust + yukseklik - ((v - min) / (max - min)) * yukseklik;
    let s = `<text x="${sol}" y="${ust - 10}" font-size="12" font-weight="700">${baslik}</text>`;
    for (let v = min; v <= max; v += adim) {
      s += `<line x1="${sol}" y1="${y(v)}" x2="${sol + genislik}" y2="${y(v)}" stroke="#cbd5e1" stroke-width="0.7"/><text x="${sol - 6}" y="${y(v) + 4}" font-size="10" text-anchor="end" fill="#475569">${v}</text>`;
    }
    s += ciz(y);
    s += `<line x1="${sol}" y1="${ust + yukseklik}" x2="${sol + genislik}" y2="${ust + yukseklik}" stroke="#1e293b" stroke-width="1.2"/>`;
    return s + AY_HARFLERI.map((a, i) => `<text x="${ayX(i)}" y="${ust + yukseklik + 15}" font-size="10" text-anchor="middle" fill="#475569">${a}</text>`).join("");
  };
  const nokta = (y: (v: number) => number, v: number, i: number) => `${ayX(i).toFixed(1)},${y(v).toFixed(1)}`;
  // Kisi eksiye dusen istasyonlarda (Erzurum vb.) eksen 10'un katina kadar asagi uzar.
  const sicaklikPaneli = panel(28, Math.min(0, Math.floor(Math.min(...sicaklik) / 10) * 10), 30, 10, "Aylık ortalama sıcaklık (°C)", (y) =>
    `<polyline points="${sicaklik.map((v, i) => nokta(y, v, i)).join(" ")}" fill="none" stroke="#dc2626" stroke-width="2"/>` +
    sicaklik.map((v, i) => `<circle cx="${ayX(i).toFixed(1)}" cy="${y(v).toFixed(1)}" r="3" fill="#dc2626"/>`).join(""),
  );
  // Kurak istasyonlarda (Erzurum vb. <100 mm) sutunlar okunabilsin diye eksen 0-100'e iner.
  const yagisMax = Math.max(...yagis) <= 100 ? 100 : 300;
  const yagisPaneli = panel(196, 0, yagisMax, yagisMax === 100 ? 20 : 100, "Aylık ortalama yağış (mm)", (y) =>
    yagis.map((v, i) => `<rect x="${(ayX(i) - 10).toFixed(1)}" y="${y(v).toFixed(1)}" width="20" height="${(y(0) - y(v)).toFixed(1)}" fill="#2563eb"/>`).join(""),
  );
  return `<svg viewBox="0 0 420 340" xmlns="http://www.w3.org/2000/svg" font-family="Arial, sans-serif" fill="#1e293b">${sicaklikPaneli}${yagisPaneli}</svg>`;
}


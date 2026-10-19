/**
 * KPSS deneme sorularinin gorselleri: gercek veriyle cizilen harita ve iklim grafigi, veri tablosundan
 * sutun grafigi ve koordinatlardan geometri sekli. Elle yazilan partiler (scripts/) ve gece Gemini
 * uretimi ayni cizicileri kullanir; model SVG cizmez, yalniz veri verir.
 */
import { HARITA_VIEWBOX, projeksiyon, TURKIYE_SINIRI, GOLLER, IL_SINIRLARI } from "@/lib/turkiyeHaritaVerisi";

export type HaritaNoktasi = { etiket: string; boylam: number; enlem: number };

export const IL_ADLARI = Object.keys(IL_SINIRLARI);

/** Il sinirinin (projeksiyonlu) koseleri ortalamasi: haritada ilin icine dusen nokta. */
function ilMerkezi(il: string): [number, number] {
  const sayilar = (IL_SINIRLARI[il] ?? "").match(/-?\d+(\.\d+)?/g)?.map(Number) ?? [];
  if (sayilar.length < 2) throw new Error(`Harita verisinde il yok: ${il}`);
  let x = 0;
  let y = 0;
  for (let i = 0; i + 1 < sayilar.length; i += 2) {
    x += sayilar[i];
    y += sayilar[i + 1];
  }
  const n = Math.floor(sayilar.length / 2);
  return [x / n, y / n];
}

const isaret = (etiket: string, x: number, y: number) =>
  `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="3.6" fill="#dc2626" stroke="#7f1d1d" stroke-width="0.8"/><text x="${(x + 5).toFixed(1)}" y="${(y - 4).toFixed(1)}" font-size="12" font-weight="700" stroke="#fff" stroke-width="3" paint-order="stroke">${etiket}</text>`;

/**
 * Gercek sinir verisiyle (Natural Earth, bkz. turkiyeHaritaVerisi.ts) Turkiye haritasi: gercek
 * boylam/enlemdeki ya da il merkezindeki numarali kirmizi noktalar ve/veya tarali iller.
 */
export function turkiyeHaritasi({
  noktalar = [],
  ilNoktalari = [],
  taraliIller = [],
}: {
  noktalar?: HaritaNoktasi[];
  ilNoktalari?: { etiket: string; il: string }[];
  taraliIller?: string[];
}) {
  const taraliYol = taraliIller
    .map((il) => {
      if (!IL_SINIRLARI[il]) throw new Error(`Harita verisinde il yok: ${il}`);
      return IL_SINIRLARI[il];
    })
    .join("");
  const isaretler =
    noktalar.map(({ etiket, boylam, enlem }) => isaret(etiket, ...projeksiyon(boylam, enlem))).join("") +
    ilNoktalari.map(({ etiket, il }) => isaret(etiket, ...ilMerkezi(il))).join("");
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

/**
 * MGM uzun yillar aylik ortalamalari (Ocak -> Aralik): sicaklik (°C), toplam yagis (mm).
 * Kaynak: mgm.gov.tr "İllerimize Ait Genel İstatistik Verileri" (olcum donemleri 1927/1950-2025).
 */
export const IKLIM_ISTASYONLARI: Record<string, { sicaklik: number[]; yagis: number[] }> = {
  Antalya: { sicaklik: [10.1, 10.7, 12.9, 16.4, 20.7, 25.4, 28.6, 28.5, 25.3, 20.6, 15.6, 11.7], yagis: [225.5, 148.1, 90.8, 48.5, 33.3, 10.7, 4.7, 4.3, 16.7, 70.6, 127.7, 250.9] },
  Erzurum: { sicaklik: [-9.1, -7.6, -2.3, 5.4, 10.7, 14.9, 19.2, 19.6, 14.8, 8.2, 1.2, -5.7], yagis: [21.3, 25.3, 35.4, 55.1, 73.3, 48.2, 28.8, 17.5, 23.9, 46.9, 33.0, 21.8] },
  Rize: { sicaklik: [6.9, 6.8, 8.2, 11.7, 16.0, 20.4, 22.9, 23.3, 20.4, 16.5, 12.4, 8.8], yagis: [231.2, 186.1, 159.8, 97.6, 96.5, 133.9, 150.9, 193.1, 256.6, 293.8, 250.4, 241.8] },
  Konya: { sicaklik: [-0.1, 1.4, 5.6, 11.1, 15.8, 20.2, 23.6, 23.4, 18.9, 12.8, 6.6, 1.8], yagis: [37.3, 28.1, 29.2, 31.4, 43.4, 25.4, 7.6, 6.2, 13.6, 29.1, 32.1, 43.0] },
  İstanbul: { sicaklik: [6.8, 6.9, 8.5, 12.9, 17.6, 22.2, 24.7, 24.7, 21.2, 16.7, 12.6, 9.0], yagis: [88.8, 70.7, 62.3, 47.8, 32.9, 27.6, 22.1, 23.9, 39.7, 66.3, 78.1, 99.2] },
  Ankara: { sicaklik: [0.4, 1.8, 5.8, 11.3, 16.1, 20.1, 23.5, 23.6, 19.0, 13.2, 7.4, 2.6], yagis: [39.8, 34.7, 39.2, 42.3, 52.1, 36.8, 14.5, 12.5, 17.9, 26.9, 31.4, 44.1] },
  İzmir: { sicaklik: [8.9, 9.6, 11.7, 15.9, 20.8, 25.4, 28.0, 27.7, 23.8, 19.0, 14.4, 10.6], yagis: [134.5, 100.9, 74.2, 45.9, 30.9, 12.8, 4.2, 6.4, 15.5, 44.0, 92.3, 145.8] },
  Diyarbakır: { sicaklik: [1.8, 3.8, 8.4, 13.9, 19.3, 26.1, 31.0, 30.5, 25.1, 17.6, 9.8, 4.1], yagis: [68.3, 66.2, 66.6, 67.8, 43.8, 8.4, 1.4, 1.0, 5.7, 32.4, 55.1, 70.3] },
  Edirne: { sicaklik: [2.8, 4.5, 7.7, 12.9, 18.0, 22.4, 24.8, 24.6, 20.2, 14.5, 9.3, 4.7], yagis: [64.0, 51.4, 50.1, 48.7, 52.4, 46.1, 31.4, 22.9, 35.7, 56.7, 66.4, 70.5] },
  Van: { sicaklik: [-3.0, -2.4, 1.8, 7.9, 13.2, 18.3, 22.4, 22.3, 17.9, 11.4, 5.0, -0.3], yagis: [36.4, 33.2, 46.6, 54.9, 46.3, 17.9, 6.1, 5.7, 15.2, 46.6, 46.6, 37.8] },
  Trabzon: { sicaklik: [7.6, 7.3, 8.5, 11.8, 15.9, 20.3, 23.1, 23.5, 20.5, 16.7, 13.1, 9.6], yagis: [82.8, 64.2, 60.0, 57.0, 52.6, 52.2, 36.6, 47.8, 79.0, 113.4, 99.3, 85.3] },
  Adana: { sicaklik: [9.6, 10.6, 13.5, 17.6, 21.9, 25.7, 28.3, 28.8, 26.2, 21.8, 16.0, 11.3], yagis: [110.9, 87.6, 65.3, 51.3, 48.4, 21.8, 10.1, 9.2, 19.3, 42.7, 71.6, 124.8] },
};

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

/** Tek serili sutun grafigi; degerler `adim`in katlari secilir ki grafikten tam okunabilsin. */
export function sutunGrafigi(etiketler: string[], degerler: number[], max: number, adim: number, baslik: string) {
  const sol = 44;
  const genislik = 340;
  const ust = 34;
  const yukseklik = 170;
  const y = (v: number) => ust + yukseklik - (v / max) * yukseklik;
  const x = (i: number) => sol + (genislik * (i + 0.5)) / etiketler.length;
  let s = `<text x="${sol}" y="${ust - 14}" font-size="12" font-weight="700">${baslik}</text>`;
  for (let v = 0; v <= max; v += adim) {
    s += `<line x1="${sol}" y1="${y(v)}" x2="${sol + genislik}" y2="${y(v)}" stroke="#cbd5e1" stroke-width="0.7"/><text x="${sol - 6}" y="${y(v) + 4}" font-size="10" text-anchor="end" fill="#475569">${v}</text>`;
  }
  s += degerler.map((v, i) => `<rect x="${x(i) - 16}" y="${y(v)}" width="32" height="${y(0) - y(v)}" fill="#2563eb"/>`).join("");
  s += `<line x1="${sol}" y1="${y(0)}" x2="${sol + genislik}" y2="${y(0)}" stroke="#1e293b" stroke-width="1.2"/>`;
  s += etiketler.map((e, i) => `<text x="${x(i)}" y="${y(0) + 16}" font-size="11" text-anchor="middle" fill="#475569">${e}</text>`).join("");
  return `<svg viewBox="0 0 400 230" xmlns="http://www.w3.org/2000/svg" font-family="Arial, sans-serif" fill="#1e293b">${s}</svg>`;
}

/** Sutun grafigi verisi tutarli mi: degerler adimin kati, 0..max, max/adim en fazla 10. */
export function sutunVerisiTutarli(g: { etiketler: string[]; degerler: number[]; max: number; adim: number }) {
  return (
    g.etiketler.length >= 2 &&
    g.etiketler.length <= 8 &&
    g.etiketler.length === g.degerler.length &&
    g.adim > 0 &&
    g.max > 0 &&
    g.max % g.adim === 0 &&
    g.max / g.adim <= 10 &&
    g.degerler.every((v) => v >= 0 && v <= g.max && Number.isInteger(v / g.adim))
  );
}

// ---- Geometri: koordinatlardan sekil ----

export type GeometriSekli = {
  // Birim duzlemde (yaklasik 0-10) noktalar; y yukari.
  noktalar: { ad: string; x: number; y: number }[];
  // Cizilecek dogru parcalari (nokta adlariyla).
  kenarlar: [string, string][];
  // Kenar ortasina yazilan etiket ("6", "2x", "a+3").
  kenarEtiketleri: { kenar: [string, string]; metin: string }[];
  // Dik aci isareti: tepe ve iki komsu nokta.
  dikAcilar: { tepe: string; a: string; b: string }[];
  // Aci etiketi ("40°", "x"): tepe ve iki komsu nokta.
  aciEtiketleri: { tepe: string; a: string; b: string; metin: string }[];
  // Analitik geometri: koordinat eksenleri.
  eksen?: boolean;
};

const sayiyiAl = (metin: string) => {
  const m = metin.trim().match(/^(\d+(?:[.,]\d+)?)\s*(cm|m|birim)?$/);
  return m ? Number(m[1].replace(",", ".")) : null;
};

/**
 * Sekil kendi icinde tutarli mi: nokta adlari benzersiz ve var; sayisal kenar etiketleri cizilen
 * uzunluklarla ayni oranda (±%20); dik aci ±6°; sayisal aci etiketleri ±12°. Tutmazsa soru atilir
 * (yanlis cizilmis sekil ogrenciyi yaniltir). Dondurulen: sorun aciklamasi ya da null.
 */
export function geometriSorunu(s: GeometriSekli): string | null {
  const nok = new Map(s.noktalar.map((n) => [n.ad, n]));
  if (nok.size !== s.noktalar.length || nok.size < 2 || nok.size > 12) return "nokta adlari";
  const var_ = (ad: string) => nok.has(ad);
  const tumAdlar = [...s.kenarlar.flat(), ...s.kenarEtiketleri.flatMap((k) => k.kenar), ...s.dikAcilar.flatMap((d) => [d.tepe, d.a, d.b]), ...s.aciEtiketleri.flatMap((d) => [d.tepe, d.a, d.b])];
  if (!tumAdlar.every(var_)) return "tanimsiz nokta";
  if (!s.kenarlar.length) return "kenar yok";
  const uzunluk = ([a, b]: [string, string]) => Math.hypot(nok.get(a)!.x - nok.get(b)!.x, nok.get(a)!.y - nok.get(b)!.y);
  const aci = (tepe: string, a: string, b: string) => {
    const t = nok.get(tepe)!;
    const u = [nok.get(a)!.x - t.x, nok.get(a)!.y - t.y];
    const v = [nok.get(b)!.x - t.x, nok.get(b)!.y - t.y];
    const cos = (u[0] * v[0] + u[1] * v[1]) / (Math.hypot(u[0], u[1]) * Math.hypot(v[0], v[1]));
    return (Math.acos(Math.max(-1, Math.min(1, cos))) * 180) / Math.PI;
  };
  const oranlar = s.kenarEtiketleri.flatMap((k) => {
    const n = sayiyiAl(k.metin);
    return n ? [uzunluk(k.kenar) / n] : [];
  });
  if (oranlar.length >= 2) {
    const orta = [...oranlar].sort((a, b) => a - b)[Math.floor(oranlar.length / 2)];
    if (oranlar.some((o) => Math.abs(o / orta - 1) > 0.2)) return "kenar uzunluklari cizimle orantisiz";
  }
  for (const d of s.dikAcilar) if (Math.abs(aci(d.tepe, d.a, d.b) - 90) > 6) return `dik aci cizilmemis (${d.tepe})`;
  for (const d of s.aciEtiketleri) {
    const m = d.metin.trim().match(/^(\d+(?:[.,]\d+)?)\s*°$/);
    if (m && Math.abs(aci(d.tepe, d.a, d.b) - Number(m[1].replace(",", "."))) > 12) return `aci cizimle uyusmuyor (${d.tepe})`;
  }
  return null;
}

/** Koordinatlardan geometri sekli (sekil sayfaya sigacak bicimde olceklenir). */
export function geometriSekli(s: GeometriSekli) {
  const xs = s.noktalar.map((n) => n.x).concat(s.eksen ? [0] : []);
  const ys = s.noktalar.map((n) => n.y).concat(s.eksen ? [0] : []);
  const [minX, maxX, minY, maxY] = [Math.min(...xs), Math.max(...xs), Math.min(...ys), Math.max(...ys)];
  const G = 320;
  const Y = 240;
  const kenarBosluk = 34;
  const olcek = Math.min((G - 2 * kenarBosluk) / Math.max(maxX - minX, 1e-6), (Y - 2 * kenarBosluk) / Math.max(maxY - minY, 1e-6));
  // Sekil kutunun ortasina: sigan eksende artan bosluk iki yana bolunur.
  const ortaX = (G - 2 * kenarBosluk - (maxX - minX) * olcek) / 2;
  const ortaY = (Y - 2 * kenarBosluk - (maxY - minY) * olcek) / 2;
  const px = (x: number) => kenarBosluk + ortaX + (x - minX) * olcek;
  const py = (y: number) => Y - kenarBosluk - ortaY - (y - minY) * olcek;
  const nok = new Map(s.noktalar.map((n) => [n.ad, { x: px(n.x), y: py(n.y) }]));
  const merkez = { x: [...nok.values()].reduce((t, p) => t + p.x, 0) / nok.size, y: [...nok.values()].reduce((t, p) => t + p.y, 0) / nok.size };
  let svg = "";
  const ox = px(0);
  const oy = py(0);
  if (s.eksen) {
    svg +=
      `<line x1="8" y1="${oy.toFixed(1)}" x2="${G - 8}" y2="${oy.toFixed(1)}" stroke="#64748b" stroke-width="1"/><text x="${G - 10}" y="${(oy - 6).toFixed(1)}" font-size="11" fill="#64748b">x</text>` +
      `<line x1="${ox.toFixed(1)}" y1="${Y - 8}" x2="${ox.toFixed(1)}" y2="8" stroke="#64748b" stroke-width="1"/><text x="${(ox + 6).toFixed(1)}" y="16" font-size="11" fill="#64748b">y</text>` +
      // Orijinde adli bir nokta varsa (genelde "O") eksenin O'su ikinci kez yazilmaz.
      (s.noktalar.some((n) => n.x === 0 && n.y === 0) ? "" : `<text x="${(ox - 12).toFixed(1)}" y="${(oy + 14).toFixed(1)}" font-size="11" fill="#64748b">O</text>`);
  }
  for (const [a, b] of s.kenarlar) {
    const p = nok.get(a)!;
    const q = nok.get(b)!;
    svg += `<line x1="${p.x.toFixed(1)}" y1="${p.y.toFixed(1)}" x2="${q.x.toFixed(1)}" y2="${q.y.toFixed(1)}" stroke="#1e293b" stroke-width="1.6"/>`;
  }
  for (const d of s.dikAcilar) {
    const t = nok.get(d.tepe)!;
    const birim = (ad: string) => {
      const p = nok.get(ad)!;
      const l = Math.hypot(p.x - t.x, p.y - t.y) || 1;
      return { x: ((p.x - t.x) / l) * 10, y: ((p.y - t.y) / l) * 10 };
    };
    const u = birim(d.a);
    const v = birim(d.b);
    svg += `<path d="M${(t.x + u.x).toFixed(1)} ${(t.y + u.y).toFixed(1)} L${(t.x + u.x + v.x).toFixed(1)} ${(t.y + u.y + v.y).toFixed(1)} L${(t.x + v.x).toFixed(1)} ${(t.y + v.y).toFixed(1)}" fill="none" stroke="#1e293b" stroke-width="1.1"/>`;
  }
  for (const d of s.aciEtiketleri) {
    const t = nok.get(d.tepe)!;
    const yon = (ad: string) => {
      const p = nok.get(ad)!;
      const l = Math.hypot(p.x - t.x, p.y - t.y) || 1;
      return { x: (p.x - t.x) / l, y: (p.y - t.y) / l };
    };
    const u = yon(d.a);
    const v = yon(d.b);
    const ort = { x: u.x + v.x, y: u.y + v.y };
    const l = Math.hypot(ort.x, ort.y) || 1;
    svg += `<text x="${(t.x + (ort.x / l) * 22).toFixed(1)}" y="${(t.y + (ort.y / l) * 22 + 4).toFixed(1)}" font-size="12" text-anchor="middle" fill="#b91c1c">${d.metin}</text>`;
  }
  for (const k of s.kenarEtiketleri) {
    const p = nok.get(k.kenar[0])!;
    const q = nok.get(k.kenar[1])!;
    const o = { x: (p.x + q.x) / 2, y: (p.y + q.y) / 2 };
    // Etiket kenarin disina (sekil merkezinden uzaga) yazilir.
    const n = { x: -(q.y - p.y), y: q.x - p.x };
    const nl = Math.hypot(n.x, n.y) || 1;
    const isaretYon = (o.x - merkez.x) * n.x + (o.y - merkez.y) * n.y >= 0 ? 1 : -1;
    svg += `<text x="${(o.x + (isaretYon * n.x * 13) / nl).toFixed(1)}" y="${(o.y + (isaretYon * n.y * 13) / nl + 4).toFixed(1)}" font-size="12" text-anchor="middle">${k.metin}</text>`;
  }
  // Nokta etiketi, noktadan cikan cizgilerden (uc ya da ustunden gecen kenar, eksen) en uzak yone yazilir;
  // esitlikte sekil merkezinden disari.
  for (const [ad, p] of nok) {
    const yonler: number[] = [];
    for (const [a, b] of s.kenarlar) {
      const u = nok.get(a)!;
      const v = nok.get(b)!;
      for (const [q, r] of [[u, v], [v, u]]) {
        const l = Math.hypot(r.x - q.x, r.y - q.y) || 1;
        const t = ((p.x - q.x) * (r.x - q.x) + (p.y - q.y) * (r.y - q.y)) / (l * l);
        const uzaklik = Math.abs((p.x - q.x) * (r.y - q.y) - (p.y - q.y) * (r.x - q.x)) / l;
        if (uzaklik < 1 && t > -0.01 && t < 0.99) yonler.push(Math.atan2(r.y - p.y, r.x - p.x));
      }
    }
    if (s.eksen && Math.abs(p.y - oy) < 1) yonler.push(0, Math.PI);
    if (s.eksen && Math.abs(p.x - ox) < 1) yonler.push(Math.PI / 2, -Math.PI / 2);
    const disari = Math.atan2(p.y - merkez.y, p.x - merkez.x);
    const fark = (a: number, b: number) => Math.abs(Math.atan2(Math.sin(a - b), Math.cos(a - b)));
    let en = { aci: disari, puan: -Infinity };
    for (let i = 0; i < 16; i++) {
      const aci = (i * Math.PI) / 8;
      const puan = Math.min(Math.PI, ...yonler.map((y) => fark(aci, y))) + 0.3 * Math.cos(aci - disari);
      if (puan > en.puan) en = { aci, puan };
    }
    svg += `<circle cx="${p.x.toFixed(1)}" cy="${p.y.toFixed(1)}" r="2.2" fill="#1e293b"/><text x="${(p.x + Math.cos(en.aci) * 13).toFixed(1)}" y="${(p.y + Math.sin(en.aci) * 13 + 4).toFixed(1)}" font-size="13" font-weight="700" text-anchor="middle">${ad}</text>`;
  }
  return `<svg viewBox="0 0 ${G} ${Y}" xmlns="http://www.w3.org/2000/svg" font-family="Arial, sans-serif" fill="#1e293b">${svg}</svg>`;
}

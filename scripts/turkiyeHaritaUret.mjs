/**
 * KPSS deneme sorularindaki Turkiye haritalari icin GERCEK sinir verisini
 * (Natural Earth 10m, kamu mali) SVG path'lerine cevirir ve
 * scripts/turkiyeHaritaVerisi.ts dosyasini yazar.
 *
 * Kaynak dosyalar (bir klasore indirip yolunu arguman olarak verin):
 *   https://raw.githubusercontent.com/nvkelso/natural-earth-vector/master/geojson/ne_10m_admin_0_countries.geojson
 *   https://raw.githubusercontent.com/nvkelso/natural-earth-vector/master/geojson/ne_10m_admin_1_states_provinces.geojson
 *   https://raw.githubusercontent.com/nvkelso/natural-earth-vector/master/geojson/ne_10m_lakes.geojson
 *
 * Calistirma: node scripts/turkiyeHaritaUret.mjs <natural-earth-klasoru>
 */
import fs from "fs";
import path from "path";

const kaynak = process.argv[2];
const oku = (f) => JSON.parse(fs.readFileSync(path.join(kaynak, f), "utf8"));

// Esdikdortgen projeksiyon, 39° enlemde boylam daralmasi duzeltilmis.
const K = Math.cos((39 * Math.PI) / 180);
const OLCEK = 30;
const proje = ([boylam, enlem]) => [(boylam - 25.55) * K * OLCEK + 10, (42.2 - enlem) * OLCEK + 10];

function sadelestir(noktalar, tolerans) {
  if (noktalar.length < 3) return noktalar;
  const [ax, ay] = noktalar[0];
  const [bx, by] = noktalar[noktalar.length - 1];
  let enUzak = 0;
  let indeks = 0;
  for (let i = 1; i < noktalar.length - 1; i++) {
    const [px, py] = noktalar[i];
    const uzunluk = Math.hypot(bx - ax, by - ay);
    // Kapali halkada ilk = son nokta; o zaman dik uzaklik yerine ilk noktaya uzaklik.
    const d = uzunluk
      ? Math.abs((bx - ax) * (ay - py) - (ax - px) * (by - ay)) / uzunluk
      : Math.hypot(px - ax, py - ay);
    if (d > enUzak) [enUzak, indeks] = [d, i];
  }
  if (enUzak <= tolerans) return [noktalar[0], noktalar[noktalar.length - 1]];
  return [...sadelestir(noktalar.slice(0, indeks + 1), tolerans).slice(0, -1), ...sadelestir(noktalar.slice(indeks), tolerans)];
}

const alan = (n) => Math.abs(n.reduce((a, [x, y], i) => a + x * n[(i + 1) % n.length][1] - n[(i + 1) % n.length][0] * y, 0)) / 2;

function pathYaz(geometri, tolerans, enKucukAlan) {
  const poligonlar = geometri.type === "Polygon" ? [geometri.coordinates] : geometri.coordinates;
  return poligonlar
    .map((p) => sadelestir(p[0].map(proje), tolerans))
    .filter((n) => n.length > 3 && alan(n) >= enKucukAlan)
    .map((n) => "M" + n.map(([x, y]) => `${x.toFixed(1)} ${y.toFixed(1)}`).join("L") + "Z")
    .join("");
}

const TURKCE_AD = {
  Adiyaman: "Adıyaman", Agri: "Ağrı", Aydin: "Aydın", Balikesir: "Balıkesir", Diyarbakir: "Diyarbakır",
  Elazig: "Elazığ", Eskisehir: "Eskişehir", "Gümüshane": "Gümüşhane", "Iğdir": "Iğdır", Istanbul: "İstanbul",
  Izmir: "İzmir", "K. Maras": "Kahramanmaraş", Kinkkale: "Kırıkkale", Kirklareli: "Kırklareli", Kirsehir: "Kırşehir",
  Mugla: "Muğla", Mus: "Muş", Nevsehir: "Nevşehir", Nigde: "Niğde", Sanliurfa: "Şanlıurfa", Sirnak: "Şırnak",
  Tekirdag: "Tekirdağ", Usak: "Uşak", Zinguldak: "Zonguldak", "Çankiri": "Çankırı",
};
const GOLLER = ["Lake Van", "Lake Tuz", "Beyşehir", "Eğirdir", "Keban Baraji", "Ataturk Barajt"];

const turkiye = oku("ne_10m_admin_0_countries.geojson").features.find((f) => f.properties.ADM0_A3 === "TUR");
const iller = oku("ne_10m_admin_1_states_provinces.geojson")
  .features.filter((f) => f.properties.adm0_a3 === "TUR")
  .map((f) => [TURKCE_AD[f.properties.name] ?? f.properties.name, f.geometry])
  .sort(([a], [b]) => a.localeCompare(b, "tr"));
const goller = oku("ne_10m_lakes.geojson").features.filter((f) => GOLLER.includes(f.properties.name));

const cikti = `// scripts/turkiyeHaritaUret.mjs ile Natural Earth 10m (kamu mali) verisinden URETILDI - elle duzenlemeyin.
// Projeksiyon: x = (boylam - 25.55) * cos(39°) * ${OLCEK} + 10, y = (42.2 - enlem) * ${OLCEK} + 10

export const HARITA_VIEWBOX = "0 0 470 215";

export function projeksiyon(boylam: number, enlem: number): [number, number] {
  return [(boylam - 25.55) * ${K} * ${OLCEK} + 10, (42.2 - enlem) * ${OLCEK} + 10];
}

export const TURKIYE_SINIRI = "${pathYaz(turkiye.geometry, 0.35, 1.5)}";

export const GOLLER = "${goller.map((g) => pathYaz(g.geometry, 0.35, 1)).join("")}";

export const IL_SINIRLARI: Record<string, string> = {
${iller.map(([ad, g]) => `  "${ad}": "${pathYaz(g, 0.5, 1)}",`).join("\n")}
};
`;
fs.writeFileSync(new URL("./turkiyeHaritaVerisi.ts", import.meta.url), cikti);
console.log(`yazildi: ${iller.length} il, ${goller.length} gol, ${(cikti.length / 1024).toFixed(1)} KB`);

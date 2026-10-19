/**
 * Parametrik KPSS matematik sablonlari: kod sayilari secer, cevabi formulle hesaplar, celdiricileri
 * kuralla kurar. Model kullanilmaz (maliyet $0, cevap hesapla dogru). Sorular uretim "sablon" ve
 * sablon kimligiyle eklenir; ayni sablonun iki varyanti ayni denemeye girmez (kpssDeneme.ts).
 * Kontrol: npx tsx scripts/kpssSablonKontrol.ts
 */
import { prisma } from "@/lib/prisma";
import { geometriSekli, geometriSorunu, type GeometriSekli } from "@/lib/kpssGorsel";

type Uretilen = {
  metin: string;
  dogru: number;
  // Tipik hatalardan cikan yanlis cevaplar (once bunlar kullanilir), sonra dogru ± adim katlari.
  yanlislar?: number[];
  adim?: number;
  min?: number;
  max?: number;
  goster?: (v: number) => string;
  aciklama: string;
  sekil?: GeometriSekli;
};
export type Sablon = { id: string; duzey: "LISANS" | "ONLISANS" | "LISE"; konu: string; geometri?: boolean; uret: () => Uretilen | null };

const r = (a: number, b: number) => a + Math.floor(Math.random() * (b - a + 1));
const sec = <T,>(d: readonly T[]) => d[Math.floor(Math.random() * d.length)];
const ebob = (a: number, b: number): number => (b ? ebob(b, a % b) : Math.abs(a));
const ekok = (a: number, b: number) => (a / ebob(a, b)) * b;
const ust = (s: string) => [...s].map((c) => ({ "+": "⁺", "-": "⁻", x: "ˣ" })[c] ?? "⁰¹²³⁴⁵⁶⁷⁸⁹"[Number(c)] ?? c).join("");
const isaretli = (n: number) => (n > 0 ? ` + ${n}` : n < 0 ? ` − ${-n}` : "");
const us = (q: number) => ust(`x${q > 0 ? `+${q}` : q < 0 ? `-${-q}` : ""}`);
// Ondalik virgul ve gercek eksi isareti (−).
const ondalik = (v: number) => String(v).replace(".", ",").replace("-", "−");

const BIRLER = ["", "bir", "iki", "üç", "dört", "beş", "altı", "yedi", "sekiz", "dokuz"];
const ONLAR = ["", "on", "yirmi", "otuz", "kırk", "elli", "altmış", "yetmiş", "seksen", "doksan"];
/** Sayinin okunusunun son kelimesi (ek uyumu icin): 175 -> "beş", 30 -> "otuz", 600 -> "yüz". */
const sonKelime = (n: number) => {
  n = Math.abs(n);
  if (n === 0) return "sıfır";
  if (n % 10) return BIRLER[n % 10];
  if (n % 100) return ONLAR[(n % 100) / 10];
  return n % 1000 ? "yüz" : n % 1e6 ? "bin" : "milyon";
};
/** Sayiya kesme isaretiyle ek: ek(175, "dir") = "175'tir", ek(6, "in") = "6'nın", ek(30, "de") = "30'da", ek(2, "er") = "2'şer". */
export function ek(n: number, tur: "dir" | "in" | "de" | "er") {
  const k = sonKelime(n);
  const unlu = [...k].reverse().find((c) => "aeıioöuü".includes(c))!;
  const dort = "aı".includes(unlu) ? "ı" : "ei".includes(unlu) ? "i" : "ou".includes(unlu) ? "u" : "ü";
  const iki = "eiöü".includes(unlu) ? "e" : "a";
  const unluyleBiter = "aeıioöuü".includes(k.at(-1)!);
  const sert = "fstkçşhp".includes(k.at(-1)!);
  const ekMetni = { dir: `${sert ? "t" : "d"}${dort}r`, in: unluyleBiter ? `n${dort}n` : `${dort}n`, de: `${sert ? "t" : "d"}${iki}`, er: unluyleBiter ? `ş${iki}r` : `${iki}r` }[tur];
  return `${String(n).replace(".", ",")}'${ekMetni}`;
}

const kesirGoster = (p: number, q: number) => {
  const g = ebob(p, q);
  return q / g === 1 ? String(p / g) : `${p / g}/${q / g}`;
};

/**
 * 5 sik: dogru cevap hedef harfe gelecek kadar alttan/ustten yanlis secilir, siklar kucukten buyuge
 * (ÖSYM gibi). Yetmezse hedef kayar. Donus: siklar ve dogru indeks; olmazsa null.
 */
export function sikKur(u: Uretilen, hedef: number) {
  const adim = u.adim ?? 1;
  const goster = u.goster ?? ondalik;
  const aday = [...(u.yanlislar ?? []), ...[1, 2, 3, 4, 5, 6].flatMap((i) => [u.dogru - i * adim, u.dogru + i * adim])];
  // Ayni gorunen (6/12 ile 1/2 gibi) degerler tek sayilir.
  const gorulen = new Set([goster(u.dogru)]);
  const uygun = aday.filter((v) => {
    const e = goster(v);
    if (!e || gorulen.has(e) || v < (u.min ?? -Infinity) || v > (u.max ?? Infinity)) return false;
    gorulen.add(e);
    return true;
  });
  const alt = uygun.filter((v) => v < u.dogru);
  const ust_ = uygun.filter((v) => v > u.dogru);
  const altSayi = Math.max(4 - ust_.length, Math.min(hedef, alt.length));
  if (altSayi > alt.length || 4 - altSayi > ust_.length) return null;
  // Listedeki sira = oncelik (tipik hatalar once); secilenler sonra siralanir.
  const siklar = [...alt.slice(0, altSayi), u.dogru, ...ust_.slice(0, 4 - altSayi)].sort((a, b) => a - b);
  return { secenekler: siklar.map(goster), dogruCevap: siklar.indexOf(u.dogru) };
}

export const SABLONLAR: Sablon[] = [
  {
    id: "L-tk-ardisik-tek",
    duzey: "LISANS",
    konu: "Temel Kavramlar",
    uret: () => {
      const n = r(5, 8);
      const a = 2 * r(4, 30) + 1;
      const S = n * a + n * (n - 1);
      const enBuyuk = a + 2 * (n - 1);
      return {
        metin: `Ardışık ${n} tek sayının toplamı ${ek(S, "dir")}.\n\nBuna göre bu sayıların en büyüğü ile en küçüğünün toplamı kaçtır?`,
        dogru: a + enBuyuk,
        yanlislar: [enBuyuk, 2 * enBuyuk, 2 * a, a + enBuyuk + 2],
        adim: 2,
        min: 1,
        aciklama: `En küçük sayı a olsun: ${n}a + ${n * (n - 1)} = ${S} ⇒ a = ${a}. En büyük sayı ${a} + 2·${n - 1} = ${enBuyuk}; toplamları ${a + enBuyuk}.`,
      };
    },
  },
  {
    id: "L-tk-bolme-kalan",
    duzey: "LISANS",
    konu: "Temel Kavramlar",
    uret: () => {
      const e = sec([6, 8, 9]);
      const d = e * r(2, 3);
      const k = r(1, d - 1);
      const p = r(2, 7);
      const s = r(1, 9);
      const cevap = (p * k + s) % e;
      return {
        metin: `A doğal sayısının ${d} ile bölümünden kalan ${ek(k, "dir")}.\n\nBuna göre ${p}A + ${s} sayısının ${e} ile bölümünden kalan kaçtır?`,
        dogru: cevap,
        yanlislar: [(k + s) % e, (p * k) % e, (p * k + s) % d < e ? (p * k + s) % d : -1],
        min: 0,
        max: e - 1,
        aciklama: `A = ${d}m + ${k} ⇒ ${p}A + ${s} = ${p * d}m + ${p * k + s}. ${p * d}m, ${ek(e, "in")} katıdır; ${p * k + s} sayısının ${e} ile bölümünden kalan ${cevap}.`,
      };
    },
  },
  {
    id: "L-tk-ekok-karo",
    duzey: "LISANS",
    konu: "Temel Kavramlar",
    uret: () => {
      const a = r(4, 30);
      const b = r(4, 30);
      const L = ekok(a, b);
      const adet = (L / a) * (L / b);
      if (a === b || ebob(a, b) === 1 || adet < 6 || adet > 120) return null;
      return {
        metin: `Kısa kenarı ${Math.min(a, b)} cm, uzun kenarı ${Math.max(a, b)} cm olan dikdörtgen biçimindeki özdeş fayanslar aynı yönde, aralarında boşluk kalmayacak şekilde yan yana dizilerek kare biçiminde bir alan oluşturulacaktır.\n\nBuna göre en az kaç fayans gerekir?`,
        dogru: adet,
        yanlislar: [L / a + L / b, adet * 2, adet * 4],
        adim: Math.max(1, Math.round(adet / 8)),
        min: 2,
        aciklama: `Karenin kenarı ${a} ve ${ek(b, "in")} en küçük ortak katı olmalı: EKOK(${a}, ${b}) = ${L}. Fayans sayısı (${L}/${a})·(${L}/${b}) = ${L / a}·${L / b} = ${adet}.`,
      };
    },
  },
  {
    id: "L-rs-kesirli-denklem",
    duzey: "LISANS",
    konu: "Rasyonel ve Ondalık Sayılar",
    uret: () => {
      const [a, b, c] = [sec([2, 3, 4, 5, 6]), sec([3, 4, 6, 8, 9]), sec([4, 6, 8, 10, 12])];
      if (new Set([a, b, c]).size < 3) return null;
      const L = ekok(ekok(a, b), c);
      const x = L * r(1, 3);
      const N = x / a + x / b - x / c;
      if (N <= 0 || x > 360) return null;
      return {
        metin: `x/${a} + x/${b} − x/${c} = ${N}\n\nolduğuna göre x kaçtır?`,
        dogru: x,
        yanlislar: [x / 2, x + L / 2, N * c],
        adim: L >= 12 ? L / 2 : L,
        min: 1,
        aciklama: `Paydalar ${ek(L, "de")} eşitlenir: x(${L / a} + ${L / b} − ${L / c})/${L} = ${N} ⇒ ${L / a + L / b - L / c}x = ${N * L} ⇒ x = ${x}.`,
      };
    },
  },
  {
    id: "L-rs-ondalik-bolme",
    duzey: "LISANS",
    konu: "Rasyonel ve Ondalık Sayılar",
    uret: () => {
      const d = sec([2, 3, 4, 5, 6, 8, 9, 12, 15]);
      // Pay 0,n1 + 0,0n2 = T/100 (T iki basamakli, birler basamagi sifir degil).
      const k = r(Math.max(3, Math.ceil(11 / d)), Math.floor(99 / d));
      const T = k * d;
      const [n1, n2] = [Math.floor(T / 10), T % 10];
      if (!n2 || k > 40) return null;
      const yuzde = (v: number) => (v < 10 ? `0,0${v}` : `0,${v}`);
      return {
        metin: `{0,${n1} + ${yuzde(n2)}|${yuzde(d)}}\n\nişleminin sonucu kaçtır?`,
        dogru: k,
        yanlislar: [k * 10, (n1 + n2) / d, k / 10],
        min: 0.1,
        aciklama: `Pay ve payda 100 ile genişletilir: (${10 * n1} + ${n2}) / ${d} = ${T} / ${d} = ${k}.`,
      };
    },
  },
  {
    id: "L-be-aralik",
    duzey: "LISANS",
    konu: "Basit Eşitsizlikler",
    uret: () => {
      const [a, b] = [r(2, 3), r(1, 3)];
      const [x1, y1] = [-r(1, 5), -r(1, 5)];
      const [x2, y2] = [x1 + r(3, 8), y1 + r(3, 7)];
      const lo = a * x1 - b * y2;
      const hi = a * x2 - b * y1;
      const xs = (k: number) => (k === 1 ? "" : String(k));
      return {
        metin: `x ve y reel sayılar olmak üzere\n\n${ondalik(x1)} < x < ${x2}\n${ondalik(y1)} < y < ${y2}\n\nolduğuna göre ${xs(a)}x − ${xs(b)}y ifadesinin alabileceği kaç farklı tam sayı değeri vardır?`,
        dogru: hi - lo - 1,
        yanlislar: [hi - lo + 1, hi - lo, hi - lo - 2],
        min: 1,
        aciklama: `${xs(a)}x aralığı (${ondalik(a * x1)}, ${a * x2}), −${xs(b)}y aralığı (${ondalik(-b * y2)}, ${ondalik(-b * y1)}). Toplam: ${ondalik(lo)} < ${xs(a)}x − ${xs(b)}y < ${hi}; aradaki tam sayılar ${ondalik(lo + 1)}, ..., ${hi - 1}: ${hi - lo - 1} tane.`,
      };
    },
  },
  {
    id: "L-md-esitsizlik-toplam",
    duzey: "LISANS",
    konu: "Mutlak Değer",
    uret: () => {
      const [a, b, c] = [r(1, 3), r(1, 12), r(3, 12)];
      const coz = (kati: boolean) => {
        const xs: number[] = [];
        for (let x = -30; x <= 30; x++) if (kati ? Math.abs(a * x - b) < c : Math.abs(a * x - b) <= c) xs.push(x);
        return xs;
      };
      const xs = coz(true);
      if (xs.length < 2 || xs.length > 12) return null;
      const top = xs.reduce((t, x) => t + x, 0);
      const ax = a === 1 ? "x" : `${a}x`;
      return {
        metin: `|${ax} − ${b}| < ${c}\n\neşitsizliğini sağlayan x tam sayılarının toplamı kaçtır?`,
        dogru: top,
        yanlislar: [coz(false).reduce((t, x) => t + x, 0), xs.length, top - xs[0], top - xs[xs.length - 1]],
        aciklama: `−${c} < ${ax} − ${b} < ${c} ⇒ ${ondalik(b - c)} < ${ax} < ${b + c}. Sağlayan tam sayılar ${xs.map(ondalik).join(", ")}; toplamları ${ondalik(top)}.`,
      };
    },
  },
  {
    id: "L-us-ortak-carpan",
    duzey: "LISANS",
    konu: "Üslü Sayılar",
    uret: () => {
      const k = sec([2, 3]);
      const m = r(1, k === 2 ? 3 : 2);
      const x = r(1, k === 2 ? 5 : 3);
      const arti = Math.random() < 0.6;
      const N = k ** x * (k ** m + (arti ? 1 : -1));
      return {
        metin: `${k}${us(m)} ${arti ? "+" : "−"} ${k}${ust("x")} = ${N}\n\nolduğuna göre x kaçtır?`,
        dogru: x,
        min: 0,
        max: 9,
        aciklama: `${k}${ust("x")} ortak çarpan: ${k}${ust("x")}·(${k}${ust(String(m))} ${arti ? "+" : "−"} 1) = ${N} ⇒ ${k}${ust("x")} = ${k ** x} ⇒ x = ${x}.`,
      };
    },
  },
  {
    id: "L-us-taban-esitleme",
    duzey: "LISANS",
    konu: "Üslü Sayılar",
    uret: () => {
      const b = sec([2, 3]);
      const [u, v] = [r(1, b === 2 ? 4 : 2), r(1, b === 2 ? 4 : 2)];
      const [q, s] = [r(-3, 3), r(-3, 3)];
      if (u === v || (u * q - v * s) % (v - u)) return null;
      const x = (u * q - v * s) / (v - u);
      if (x === 0 || Math.abs(x) > 12) return null;
      return {
        metin: `${b ** u}${us(q)} = ${b ** v}${us(s)}\n\nolduğuna göre x kaçtır?`,
        dogru: x,
        yanlislar: [-x, x + 1, x - 1],
        aciklama: `Tabanlar ${b} yapılır: ${b ** u} = ${b}${ust(String(u))}, ${b ** v} = ${b}${ust(String(v))} ⇒ ${u === 1 ? "" : u}(x${isaretli(q)}) = ${v === 1 ? "" : v}(x${isaretli(s)}) ⇒ x = ${ondalik(x)}.`,
      };
    },
  },
  {
    id: "L-kok-toplama",
    duzey: "LISANS",
    konu: "Köklü Sayılar",
    uret: () => {
      const k = sec([2, 3, 5, 6, 7]);
      const [m1, m2, m3] = [r(1, 5), r(2, 6), r(1, 4)];
      const c = m1 + m2 - m3;
      if (new Set([m1, m2, m3]).size < 3 || c < 1) return null;
      const kok = (m: number) => `√${k * m * m}`;
      const goster = (v: number) => (v === 1 ? `√${k}` : `${v}√${k}`);
      return {
        metin: `${kok(m1)} + ${kok(m2)} − ${kok(m3)}\n\nişleminin sonucu kaçtır?`,
        dogru: c,
        yanlislar: [m1 + m2 + m3, m1 + m2, c + 2],
        min: 1,
        goster,
        aciklama: `${kok(m1)} = ${goster(m1)}, ${kok(m2)} = ${goster(m2)}, ${kok(m3)} = ${goster(m3)}; sonuç (${m1} + ${m2} − ${m3})√${k} = ${goster(c)}.`,
      };
    },
  },
  {
    id: "L-ca-kareler-toplami",
    duzey: "LISANS",
    konu: "Çarpanlara Ayırma",
    uret: () => {
      const fark = Math.random() < 0.5;
      const [a, b] = [r(2, 9), r(2, 20)];
      if (!fark && a * a < 4 * b) return null;
      const dogru = fark ? a * a + 2 * b : a * a - 2 * b;
      return {
        metin: `x ${fark ? "−" : "+"} y = ${a}\nx · y = ${b}\n\nolduğuna göre x² + y² toplamı kaçtır?`,
        dogru,
        yanlislar: [fark ? a * a - 2 * b : a * a + 2 * b, a * a + b, a * a - b, a * a],
        min: 1,
        aciklama: `(x ${fark ? "−" : "+"} y)² = x² + y² ${fark ? "−" : "+"} 2xy ⇒ ${a * a} = x² + y² ${fark ? "−" : "+"} ${2 * b} ⇒ x² + y² = ${dogru}.`,
      };
    },
  },
  {
    id: "L-dc-oranti",
    duzey: "LISANS",
    konu: "Denklem Çözme",
    uret: () => {
      const [p, q, s] = [r(2, 5), r(3, 7), r(4, 9)];
      const [al, be, ga] = [r(1, 3), r(1, 2), r(1, 2)];
      const kat = al * p + be * q - ga * s;
      const k = r(2, 6);
      if (new Set([p, q, s]).size < 3 || kat <= 0) return null;
      const t = (c: number, h: string) => (c === 1 ? h : `${c}${h}`);
      return {
        metin: `a/${p} = b/${q} = c/${s} ve ${t(al, "a")} + ${t(be, "b")} − ${t(ga, "c")} = ${k * kat}\n\nolduğuna göre a + b + c toplamı kaçtır?`,
        dogru: k * (p + q + s),
        yanlislar: [k * kat, (k + 1) * (p + q + s), (k - 1) * (p + q + s)],
        adim: p + q + s,
        min: 1,
        aciklama: `Ortak oran k: a = ${p}k, b = ${q}k, c = ${s}k. ${kat}k = ${k * kat} ⇒ k = ${k}; a + b + c = ${p + q + s}k = ${k * (p + q + s)}.`,
      };
    },
  },
  {
    id: "L-sp-kat-fark",
    duzey: "LISANS",
    konu: "Sayı Problemleri",
    uret: () => {
      const [x, m, d] = [r(4, 40), r(2, 6), r(1, 4)];
      const n = m + d;
      const p = r(2, 30);
      const q = x * d - p;
      if (q <= 0) return null;
      return {
        metin: `Bir sayının ${m} katının ${p} fazlası, aynı sayının ${n} katının ${q} eksiğine eşittir.\n\nBuna göre bu sayının ${m} katı kaçtır?`,
        dogru: m * x,
        yanlislar: [x, n * x, m * x + p],
        adim: m,
        min: 1,
        aciklama: `${m}x + ${p} = ${n}x − ${q} ⇒ ${d === 1 ? `x = ${x}` : `${d}x = ${p + q} ⇒ x = ${x}`}; ${m} katı ${m * x}.`,
      };
    },
  },
  {
    id: "L-yas-kat",
    duzey: "LISANS",
    konu: "Yaş Problemleri",
    uret: () => {
      const [kiz, n, k] = [r(4, 20), r(2, 12), sec([2, 3])];
      const anne = k * (kiz + n) - n;
      if (anne - kiz < 20 || anne > 70) return null;
      return {
        metin: `Bir anne ile kızının bugünkü yaşları toplamı ${ek(anne + kiz, "dir")}. ${n} yıl sonra annenin yaşı, kızının o zamanki yaşının ${k} katı olacaktır.\n\nBuna göre kızın bugünkü yaşı kaçtır?`,
        dogru: kiz,
        yanlislar: [kiz + n, (anne + kiz) / (k + 1)].filter(Number.isInteger),
        min: 1,
        aciklama: `Kız x, anne ${anne + kiz} − x yaşında: ${anne + kiz} − x + ${n} = ${k}(x + ${n}) ⇒ ${anne + kiz + n - k * n} = ${k + 1}x ⇒ x = ${kiz}.`,
      };
    },
  },
  {
    id: "L-hp-orta-nokta",
    duzey: "LISANS",
    konu: "Hareket Problemleri",
    uret: () => {
      const t = r(2, 5);
      const fark = sec([10, 20]);
      const v2 = 10 * r(4, 8);
      const v1 = v2 + fark;
      const x = (t * fark) / 2;
      const D = (v1 + v2) * t;
      return {
        metin: `A ve B kentlerinden aynı anda birbirine doğru hareket eden iki araçtan A'dan çıkanın hızı saatte ${v1} km, B'den çıkanınki saatte ${v2} km'dir. Araçlar karşılaştıklarında A'dan çıkan araç yolun orta noktasını ${x} km geçmiştir.\n\nBuna göre A ile B arası kaç km'dir?`,
        dogru: D,
        yanlislar: [D / 2, D + 2 * x, (v1 + v2) * (t - 1)],
        adim: v1 + v2,
        min: 10,
        aciklama: `Karşılaşmada A'dan çıkan B'den çıkandan 2·${x} = ${2 * x} km fazla yol almıştır; hız farkı ${fark} km/sa ⇒ süre ${t} saat. Yol (${v1} + ${v2})·${t} = ${D} km.`,
      };
    },
  },
  {
    id: "L-yz-zam-indirim",
    duzey: "LISANS",
    konu: "Yüzde-Kâr-Zarar ve Faiz Problemleri",
    uret: () => {
      const [a, b] = [sec([20, 25, 40, 50]), sec([10, 20, 25, 40])];
      const P = 200 * r(2, 20);
      const X = (P * ((100 + a) * (100 - b) - 10000)) / 10000;
      if (!X || !Number.isInteger(X)) return null;
      return {
        metin: `Bir ürünün fiyatına önce %${a} zam, ardından yeni fiyat üzerinden %${b} indirim uygulanmıştır. Ürünün son fiyatı ilk fiyatından ${Math.abs(X)} TL ${X > 0 ? "fazladır" : "azdır"}.\n\nBuna göre ürünün ilk fiyatı kaç TL'dir?`,
        dogru: P,
        yanlislar: [(Math.abs(X) * 100) / Math.abs(a - b) || 0, P + 200, P - 200].filter((v) => v > 0 && Number.isInteger(v)),
        adim: 200,
        min: 100,
        aciklama: `İlk fiyat x: x·${ondalik((100 + a) / 100)}·${ondalik((100 - b) / 100)} = ${ondalik(((100 + a) * (100 - b)) / 10000)}x. Fark ${ondalik(Math.abs(X / P))}x = ${Math.abs(X)} ⇒ x = ${P} TL.`,
      };
    },
  },
  {
    id: "L-km-iki-dil",
    duzey: "LISANS",
    konu: "Kümeler",
    uret: () => {
      const N = 10 * r(3, 6);
      const hic = r(2, 9);
      const birlesim = N - hic;
      const ikisi = r(2, 12);
      const A = r(ikisi + 3, birlesim - 3);
      const B = birlesim - A + ikisi;
      if (B <= ikisi + 2 || B > birlesim) return null;
      const dillerA = sec([["İngilizce", "Almanca"], ["Fransızca", "İspanyolca"], ["İngilizce", "Arapça"]] as const);
      return {
        metin: `${N} kişilik bir sınıfta ${dillerA[0]} bilen ${A}, ${dillerA[1]} bilen ${B} öğrenci vardır. Bu iki dilden hiçbirini bilmeyen ${hic} öğrenci olduğuna göre bu dillerden yalnızca birini bilen kaç öğrenci vardır?`,
        dogru: birlesim - ikisi,
        yanlislar: [birlesim, ikisi, A + B - hic, N - ikisi],
        adim: 2,
        min: 1,
        aciklama: `En az birini bilen ${N} − ${hic} = ${birlesim}. İkisini bilen ${A} + ${B} − ${birlesim} = ${ikisi}. Yalnızca birini bilen ${birlesim} − ${ikisi} = ${birlesim - ikisi}.`,
      };
    },
  },
  {
    id: "L-fn-ters",
    duzey: "LISANS",
    konu: "Bağıntı ve Fonksiyon",
    uret: () => {
      const [a, b, c, d] = [r(2, 3), r(-4, 4), r(2, 5), r(-6, 6)];
      const [i, j] = [r(1, 4), r(1, 4)];
      const k = b + a * i;
      const m = d + c * j;
      const fk = c * i + d;
      const ters = a * j + b;
      return {
        metin: `f(${a}x${isaretli(b)}) = ${c}x${isaretli(d)}\n\nolduğuna göre f(${k}) + f⁻¹(${m}) toplamı kaçtır?`,
        dogru: fk + ters,
        yanlislar: [fk + m, fk - ters, c * k + d + ters],
        aciklama: `${a}x${isaretli(b)} = ${k} ⇒ x = ${i}, f(${k}) = ${fk}. f⁻¹(${m}) = t ise f(t) = ${m}: ${c}x${isaretli(d)} = ${m} ⇒ x = ${j}, t = ${a}·${j}${isaretli(b)} = ${ters}. Toplam ${fk + ters}.`,
      };
    },
  },
  {
    id: "L-is-tanimli-islem",
    duzey: "LISANS",
    konu: "İşlem",
    uret: () => {
      const [p, q] = [r(1, 3), r(1, 3)];
      const art = Math.random() < 0.5;
      const f = (x: number, y: number) => p * x + q * y + (art ? x * y : -x * y);
      const [u, v, w] = [r(1, 4), r(1, 4), r(1, 3)];
      const ic = f(u, v);
      const dogru = f(ic, w);
      const kat = (c: number, h: string) => (c === 1 ? h : `${c}${h}`);
      return {
        metin: `Reel sayılar kümesinde ∆ işlemi\n\na ∆ b = ${kat(p, "a")} + ${kat(q, "b")} ${art ? "+" : "−"} ab\n\nbiçiminde tanımlanıyor.\n\nBuna göre (${u} ∆ ${v}) ∆ ${w} işleminin sonucu kaçtır?`,
        dogru,
        yanlislar: [f(u, f(v, w)), ic, f(w, ic)],
        aciklama: `${u} ∆ ${v} = ${ic}; ${ic} ∆ ${w} = ${dogru}.`,
      };
    },
  },
  {
    id: "L-ol-iki-renk",
    duzey: "LISANS",
    konu: "Olasılık",
    uret: () => {
      const [k, m] = [r(2, 7), r(2, 7)];
      const n = k + m;
      const tum = n * (n - 1);
      const etiket = new Map<number, string>();
      const ekle = (p: number, q = tum) => (etiket.set(p / q, kesirGoster(p, q)), p / q);
      const dogru = ekle(2 * k * m);
      const yanlislar = [ekle(k * m), ekle(k * (k - 1)), ekle(m * (m - 1)), ekle(tum - k * (k - 1)), ekle(k * (k - 1) + m * (m - 1)), ekle(k, n), ekle(m, n), ekle(2 * k * m, n * n), ekle(1, 2)];
      return {
        metin: `Bir torbada ${k} kırmızı ve ${m} mavi top vardır. Torbadan geri atılmamak üzere art arda iki top çekiliyor.\n\nÇekilen toplardan birinin kırmızı, diğerinin mavi olma olasılığı kaçtır?`,
        dogru,
        yanlislar,
        min: 0,
        max: 1,
        goster: (v) => etiket.get(v) ?? "",
        aciklama: `Kırmızı-mavi ya da mavi-kırmızı: 2·(${k}/${n})·(${m}/${n - 1}) = ${kesirGoster(2 * k * m, tum)}.`,
      };
    },
  },
  {
    id: "L-sm-dizi-dogrusal",
    duzey: "LISANS",
    konu: "Sayısal Mantık",
    uret: () => {
      const [k, c, a1] = [r(2, 3), r(-3, 4), r(1, 6)];
      const d = [a1];
      for (let i = 1; i < 6; i++) d.push(k * d[i - 1] + c);
      if (new Set(d).size < 6 || d[5] > 2000) return null;
      return {
        metin: `Aşağıdaki sayı dizisinde her terim, kendinden önceki terimden aynı kurala göre elde edilmektedir.\n\n${d.slice(0, 4).join(", ")}, ...\n\nBuna göre bu dizinin 6. terimi kaçtır?`,
        dogru: d[5],
        yanlislar: [d[4], 2 * d[4], d[5] + c, d[5] - c],
        adim: k * k,
        min: 1,
        aciklama: `Kural: her terim öncekinin ${k} katının ${c >= 0 ? `${c} fazlası` : `${-c} eksiği`}. 5. terim ${d[4]}, 6. terim ${d[5]}.`,
      };
    },
  },
  {
    id: "L-sm-dizi-ikinci-fark",
    duzey: "LISANS",
    konu: "Sayısal Mantık",
    uret: () => {
      const [a, p, q] = [r(1, 9), r(2, 6), r(1, 3)];
      const d = [a];
      for (let i = 1; i < 7; i++) d.push(d[i - 1] + p + (i - 1) * q);
      return {
        metin: `${d.slice(0, 5).join(", ")}, ...\n\nYukarıdaki sayı dizisinde ardışık terimler arasındaki fark düzenli olarak artmaktadır.\n\nBuna göre bu dizinin 7. terimi kaçtır?`,
        dogru: d[6],
        yanlislar: [d[5], d[6] + q, d[6] - q, d[5] + (d[4] - d[3])],
        adim: q,
        min: 1,
        aciklama: `Farklar ${p}, ${p + q}, ${p + 2 * q}, ... şeklinde ${ek(q, "er")} artar. 6. terim ${d[5]}, 7. terim ${d[5]} + ${p + 5 * q} = ${d[6]}.`,
      };
    },
  },
  {
    id: "L-geo-dik-ucgen-yukseklik",
    duzey: "LISANS",
    konu: "Özel Üçgenler",
    geometri: true,
    uret: () => {
      const [p, q] = sec([[1, 4], [4, 9], [2, 8], [9, 16], [3, 12], [4, 16], [1, 9], [8, 18], [5, 20], [2, 18], [9, 25], [6, 24]] as const);
      const h = Math.sqrt(p * q);
      const alan = ((p + q) * h) / 2;
      if (!Number.isInteger(alan)) return null;
      const [ps, qs] = Math.random() < 0.5 ? [p, q] : [q, p];
      return {
        metin: `Şekildeki ABC üçgeninde [AB] ⊥ [AC] ve [AH] ⊥ [BC]'dir. |BH| = ${ps} cm ve |HC| = ${qs} cm'dir.\n\nBuna göre ABC üçgeninin alanı kaç cm²'dir?`,
        dogru: alan,
        yanlislar: [(p + q) * h, ps * qs, alan + ps, alan - ps],
        adim: 3,
        min: 1,
        aciklama: `Öklid bağıntısı: |AH|² = |BH|·|HC| = ${p * q} ⇒ |AH| = ${h}. Alan = ${p + q}·${h}/2 = ${alan} cm².`,
        sekil: {
          noktalar: [{ ad: "A", x: ps, y: h }, { ad: "B", x: 0, y: 0 }, { ad: "C", x: p + q, y: 0 }, { ad: "H", x: ps, y: 0 }],
          kenarlar: [["A", "B"], ["A", "C"], ["B", "C"], ["A", "H"]],
          kenarEtiketleri: [{ kenar: ["B", "H"], metin: String(ps) }, { kenar: ["H", "C"], metin: String(qs) }],
          dikAcilar: [{ tepe: "A", a: "B", b: "C" }, { tepe: "H", a: "A", b: "C" }],
          aciEtiketleri: [],
        },
      };
    },
  },
  {
    id: "L-geo-ikizkenar-yamuk",
    duzey: "LISANS",
    konu: "Dörtgenler ve Çokgenler",
    geometri: true,
    uret: () => {
      const [e, h, c] = sec([[3, 4, 5], [4, 3, 5], [6, 8, 10], [8, 6, 10], [5, 12, 13], [12, 5, 13], [9, 12, 15]] as const);
      const a = r(2, 12);
      const b = a + 2 * e;
      const alan = ((a + b) * h) / 2;
      return {
        metin: `Şekildeki ABCD ikizkenar yamuğunda [DC] ∥ [AB], |DC| = ${a} cm, |AB| = ${b} cm ve |AD| = |BC| = ${c} cm'dir.\n\nBuna göre ABCD yamuğunun alanı kaç cm²'dir?`,
        dogru: alan,
        yanlislar: [(a + b) * h, ((a + b) * c) / 2, alan + a, alan - a].filter(Number.isInteger),
        adim: Math.max(2, h),
        min: 1,
        aciklama: `D ve C'den [AB]'ye inilen dikmeler tabanı ${e} + ${a} + ${e} parçalarına ayırır. Yükseklik √(${c}² − ${e}²) = ${h}. Alan = (${a} + ${b})·${h}/2 = ${alan} cm².`,
        sekil: {
          noktalar: [{ ad: "A", x: 0, y: 0 }, { ad: "B", x: b, y: 0 }, { ad: "C", x: e + a, y: h }, { ad: "D", x: e, y: h }],
          kenarlar: [["A", "B"], ["B", "C"], ["C", "D"], ["D", "A"]],
          kenarEtiketleri: [{ kenar: ["D", "C"], metin: String(a) }, { kenar: ["A", "B"], metin: String(b) }, { kenar: ["A", "D"], metin: String(c) }, { kenar: ["B", "C"], metin: String(c) }],
          dikAcilar: [],
          aciEtiketleri: [],
        },
      };
    },
  },
  {
    id: "L-ag-ucgen-alan",
    duzey: "LISANS",
    konu: "Analitik Geometri",
    geometri: true,
    uret: () => {
      const m = r(1, 4);
      const s = (m + 1) * r(2, 6);
      const y = (m * s) / (m + 1);
      const alan = (s * y) / 2;
      if (!Number.isInteger(alan)) return null;
      return {
        metin: `Dik koordinat düzleminde ${m === 1 ? "" : m}x − y = 0 ve x + y = ${s} doğruları ile x ekseninin sınırladığı üçgensel bölgenin alanı kaç birimkaredir?`,
        dogru: alan,
        yanlislar: [s * y, (s * (s / (m + 1))) / 2, alan + s / 2, alan - s / 2].filter((v) => Number.isInteger(v)),
        adim: s / 2,
        min: 1,
        aciklama: `Kesişim: x + ${m === 1 ? "" : m}x = ${s} ⇒ x = ${s / (m + 1)}, y = ${y}. x + y = ${s} doğrusu x eksenini (${s}, 0)'da keser. Alan = ${s}·${y}/2 = ${alan}.`,
      };
    },
  },
];

/** Sablondan bir soru: secenekler, dogru indeks, gorsel. 20 denemede kurulamazsa null. */
export function sablondanSoru(s: Sablon, hedef = r(0, 4)) {
  for (let i = 0; i < 20; i++) {
    const u = s.uret();
    if (!u) continue;
    if (u.sekil && geometriSorunu(u.sekil)) continue;
    const siklar = sikKur(u, hedef);
    if (!siklar) continue;
    return { soruMetni: u.metin, aciklama: u.aciklama, gorselSvg: u.sekil ? geometriSekli(u.sekil) : null, ...siklar };
  }
  return null;
}

// Gunde duzey basina eklenen sablon sorusu: en az varyanti olan sablonlardan.
const GUNLUK_SABLON = 12;

/** Gunluk sablon uretimi (cron): son 23 saatte eklenmisse bir sey yapmaz. Donus: eklenen soru sayisi. */
export async function sablonGunluk() {
  const son = await prisma.denemeSoru.findFirst({ where: { uretim: "sablon" }, orderBy: { olusturmaTarihi: "desc" }, select: { olusturmaTarihi: true } });
  if (son && Date.now() - son.olusturmaTarihi.getTime() < 23 * 3600_000) return 0;
  const sayilar = await prisma.denemeSoru.groupBy({ by: ["sablon"], where: { uretim: "sablon" }, _count: true });
  const varyant = (id: string) => sayilar.find((x) => x.sablon === id)?._count ?? 0;
  let eklenen = 0;
  for (const duzey of ["LISANS", "ONLISANS", "LISE"] as const) {
    const secilen = SABLONLAR.filter((s) => s.duzey === duzey)
      .map((s) => ({ s, n: varyant(s.id), r: Math.random() }))
      .sort((a, b) => a.n - b.n || a.r - b.r)
      .slice(0, GUNLUK_SABLON);
    for (const { s } of secilen) {
      const soru = sablondanSoru(s);
      if (!soru || (await prisma.denemeSoru.findFirst({ where: { duzey, soruMetni: soru.soruMetni }, select: { id: true } }))) continue;
      await prisma.denemeSoru.create({
        data: { duzey, ders: "MATEMATIK", konu: s.konu, geometri: !!s.geometri, uretim: "sablon", sablon: s.id, sira: 99_999, ...soru },
      });
      eklenen++;
    }
  }
  return eklenen;
}

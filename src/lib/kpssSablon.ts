/**
 * Parametrik KPSS sablonlari (matematik; cografyada il koordinati ve MGM istasyonu): kod sayilari secer, cevabi formulle hesaplar, celdiricileri
 * kuralla kurar. Model kullanilmaz (maliyet $0, cevap hesapla dogru). Sorular uretim "sablon" ve
 * sablon kimligiyle eklenir; ayni sablonun iki varyanti ayni denemeye girmez (kpssDeneme.ts).
 * Kontrol: npx tsx scripts/kpssSablonKontrol.ts
 */
import { prisma } from "@/lib/prisma";
import { geometriSekli, geometriSorunu, iklimGrafigi, sutunGrafigi, sutunVerisiTutarli, IKLIM_ISTASYONLARI, IL_ADLARI, ilKoordinati, turkiyeHaritasi, type GeometriSekli } from "@/lib/kpssGorsel";

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
  // Hazir cizilmis gorsel (harita, iklim grafigi).
  svg?: string;
};
export type Sablon = { id: string; duzey: "LISANS" | "ONLISANS" | "LISE"; ders?: "MATEMATIK" | "COGRAFYA"; konu: string; geometri?: boolean; uret: () => Uretilen | null };

const r = (a: number, b: number) => a + Math.floor(Math.random() * (b - a + 1));
const sec = <T,>(d: readonly T[]) => d[Math.floor(Math.random() * d.length)];
const ebob = (a: number, b: number): number => (b ? ebob(b, a % b) : Math.abs(a));
const ekok = (a: number, b: number) => (a / ebob(a, b)) * b;
// Us: KesirliMetin `^{...}` blogunu gercek ust simge olarak basar.
const ust = (s: string) => `^{${s.replace("-", "−")}}`;
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
/** Sayiya kesme isaretiyle ek: ek(175, "dir") = "175'tir", ek(6, "in") = "6'nın", ek(30, "de") = "30'da", ek(2, "er") = "2'şer", ek(30, "si") = "30'u", ek(60, "lik") = "60'lık". */
export function ek(n: number, tur: "dir" | "in" | "de" | "er" | "si" | "lik") {
  const k = sonKelime(n);
  const unlu = [...k].reverse().find((c) => "aeıioöuü".includes(c))!;
  const dort = "aı".includes(unlu) ? "ı" : "ei".includes(unlu) ? "i" : "ou".includes(unlu) ? "u" : "ü";
  const iki = "eiöü".includes(unlu) ? "e" : "a";
  const unluyleBiter = "aeıioöuü".includes(k.at(-1)!);
  const sert = "fstkçşhp".includes(k.at(-1)!);
  const ekMetni = { dir: `${sert ? "t" : "d"}${dort}r`, in: unluyleBiter ? `n${dort}n` : `${dort}n`, de: `${sert ? "t" : "d"}${iki}`, er: unluyleBiter ? `ş${iki}r` : `${iki}r`, si: unluyleBiter ? `s${dort}` : dort, lik: `l${dort}k` }[tur];
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
      // a = g·m, b = g·n (m, n aralarinda asal): EKOK = g·m·n, fayans sayisi m·n.
      const g = r(2, 6);
      const [m, n] = [r(2, 9), r(2, 9)];
      const [a, b] = [g * m, g * n];
      const L = ekok(a, b);
      const adet = (L / a) * (L / b);
      if (m === n || ebob(m, n) !== 1 || b > 40 || a > 40 || adet > 120) return null;
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

// ---- Cografya: il koordinatlarindan konum, MGM istasyonlarindan iklim ----

// Sablon kimligi on eki (LISANS ve LISE ikisi de L ile basladigi icin harf degil).
const ONEK: Record<Sablon["duzey"], string> = { LISANS: "L", ONLISANS: "O", LISE: "M" };

const ROMA = ["I", "II", "III", "IV", "V"];
const romaGoster = (v: number) => ROMA[v - 1] ?? "";

/** Haritada birbirinden uzak 5 il (noktalar ust uste binmesin) ve o illerin koordinati. */
function uzakIller() {
  for (let i = 0; i < 50; i++) {
    const iller = [...IL_ADLARI].sort(() => Math.random() - 0.5).slice(0, 5);
    const k = iller.map(ilKoordinati);
    const yakin = k.some((a, x) => k.some((b, y) => x < y && Math.hypot(a.boylam - b.boylam, a.enlem - b.enlem) < 2.2));
    if (!yakin) return iller.map((il, j) => ({ il, ...k[j] }));
  }
  return null;
}

type KonumSorusu = { kok: string; deger: (k: { boylam: number; enlem: number }) => number; aciklama: string };
const BOYLAM_SORULARI: KonumSorusu[] = [
  { kok: "21 Mart tarihinde Güneş'in ilk doğduğu merkez", deger: (k) => k.boylam, aciklama: "Güneş doğudan doğar; 21 Mart'ta gündüz süresi her yerde eşit olduğundan Güneş en doğudaki merkezde ilk doğar." },
  { kok: "yerel saati en ileri olan merkez", deger: (k) => k.boylam, aciklama: "Doğuya gidildikçe yerel saat ilerler; en doğudaki merkezin yerel saati en ileridir." },
  { kok: "yerel saati en geri olan merkez", deger: (k) => -k.boylam, aciklama: "Batıya gidildikçe yerel saat geri kalır; en batıdaki merkezin yerel saati en geridir." },
  { kok: "23 Eylül tarihinde Güneş'in en son battığı merkez", deger: (k) => -k.boylam, aciklama: "Güneş batıdan batar; ekinoks tarihinde en batıdaki merkezde en son batar." },
];
const ENLEM_SORULARI: KonumSorusu[] = [
  { kok: "21 Haziran tarihinde gündüz süresinin en uzun olduğu merkez", deger: (k) => k.enlem, aciklama: "21 Haziran'da Kuzey Yarım Küre'de kuzeye gidildikçe gündüz süresi uzar; en kuzeydeki merkezde en uzundur." },
  { kok: "21 Aralık tarihinde gündüz süresinin en uzun olduğu merkez", deger: (k) => -k.enlem, aciklama: "21 Aralık'ta Kuzey Yarım Küre'de güneye gidildikçe gündüz süresi uzar; en güneydeki merkezde en uzundur." },
  { kok: "Dünya'nın günlük hareketine bağlı çizgisel hızın en fazla olduğu merkez", deger: (k) => -k.enlem, aciklama: "Çizgisel hız Ekvator'dan kutuplara doğru azalır; Ekvator'a en yakın (en güneydeki) merkezde en fazladır." },
  { kok: "öğle vakti Güneş ışınlarının yere düşme açısının yıl boyunca en küçük olduğu merkez", deger: (k) => k.enlem, aciklama: "Kuzey Yarım Küre'de kuzeye gidildikçe Güneş ışınlarının geliş açısı küçülür; en kuzeydeki merkezde en küçüktür." },
];

const konumSablonu = (duzey: Sablon["duzey"], tur: "boylam" | "enlem"): Sablon => ({
  id: `${ONEK[duzey]}-cg-konum-${tur}`,
  duzey,
  ders: "COGRAFYA",
  konu: "Coğrafi Konum",
  uret: () => {
    const iller = uzakIller();
    if (!iller) return null;
    const soru = sec(tur === "boylam" ? BOYLAM_SORULARI : ENLEM_SORULARI);
    const degerler = iller.map(soru.deger);
    const enIyi = Math.max(...degerler);
    // Kenar payi: ikinci en iyi en az 0,7° geride (il merkezi yaklasik bir nokta).
    if ([...degerler].sort((a, b) => b - a)[1] > enIyi - 0.7) return null;
    const dogru = degerler.indexOf(enIyi) + 1;
    return {
      metin: `Aşağıdaki Türkiye haritasında beş merkez numaralandırılarak gösterilmiştir.\n\nBuna göre ${soru.kok} hangisidir?`,
      dogru,
      yanlislar: [1, 2, 3, 4, 5].filter((v) => v !== dogru),
      min: 1,
      max: 5,
      goster: romaGoster,
      aciklama: `${soru.aciklama} Bu merkez ${ROMA[dogru - 1]} numaralı noktadır (${iller[dogru - 1].il}).`,
      svg: turkiyeHaritasi({ ilNoktalari: iller.map((x, i) => ({ etiket: ROMA[i], il: x.il })) }),
    };
  },
});

// Her iklim bolgesinden en fazla bir sik: secenekler grafikten ayirt edilebilsin (Antalya/İzmir gibi
// ayni iklim tipindeki iki merkez ayni soruda yer almaz). Edirne (Ankara'ya), Trabzon (İstanbul'a) cok
// benzedigi icin yok.
const IKLIM_BOLGELERI = [["Antalya", "İzmir", "Adana"], ["Rize"], ["Konya", "Ankara", "Erzurum", "Van"], ["Diyarbakır"], ["İstanbul"]];

const iklimSablonu = (duzey: Sablon["duzey"]): Sablon => ({
  id: `${ONEK[duzey]}-cg-iklim-merkez`,
  duzey,
  ders: "COGRAFYA",
  konu: "İklim ve Bitki Örtüsü",
  uret: () => {
    const merkezler = IKLIM_BOLGELERI.map(sec).sort((a, b) => a.localeCompare(b, "tr"));
    const cevap = sec(merkezler);
    const v = IKLIM_ISTASYONLARI[cevap];
    const yillik = Math.round(v.yagis.reduce((t, x) => t + x, 0));
    return {
      metin: "Aşağıdaki grafikte bir merkezin uzun yıllar aylık ortalama sıcaklık ve yağış değerleri verilmiştir.\n\nBu grafik aşağıdaki merkezlerden hangisine ait olabilir?",
      dogru: merkezler.indexOf(cevap) + 1,
      yanlislar: [1, 2, 3, 4, 5],
      min: 1,
      max: 5,
      goster: (i) => merkezler[i - 1] ?? "",
      aciklama: `Grafik ${cevap} merkezine aittir (MGM uzun yıllar ortalaması): en soğuk ay ${ondalik(Math.min(...v.sicaklik))} °C, en sıcak ay ${ondalik(Math.max(...v.sicaklik))} °C, yıllık yağış yaklaşık ${yillik} mm; en yağışlı ay ${AYLAR[v.yagis.indexOf(Math.max(...v.yagis))]}, en kurak ay ${AYLAR[v.yagis.indexOf(Math.min(...v.yagis))]}.`,
      svg: iklimGrafigi(v.sicaklik, v.yagis),
    };
  },
});
const AYLAR = ["ocak", "şubat", "mart", "nisan", "mayıs", "haziran", "temmuz", "ağustos", "eylül", "ekim", "kasım", "aralık"];

SABLONLAR.push(...(["LISANS", "ONLISANS", "LISE"] as const).flatMap((d) => [konumSablonu(d, "boylam"), konumSablonu(d, "enlem"), iklimSablonu(d)]));

// ---- Onlisans / Ortaogretim matematik: uygun Lisans sablonlari o duzeyin konusuna uyarlanir + duzeye ozgu sablonlar ----

/** Lisans sablonu -> diger duzeylerdeki konu (konusu o duzeyde olmayanlar uyarlanmaz). */
export const LISANS_UYARLAMA: Record<string, Partial<Record<Sablon["duzey"], string>>> = {
  "L-tk-ardisik-tek": { ONLISANS: "Temel Kavramlar", LISE: "Temel Kavramlar" },
  "L-tk-bolme-kalan": { ONLISANS: "Sayılar ve EBOB-EKOK", LISE: "Temel Kavramlar" },
  "L-tk-ekok-karo": { ONLISANS: "Sayılar ve EBOB-EKOK", LISE: "Problemler" },
  "L-rs-kesirli-denklem": { ONLISANS: "Rasyonel ve Ondalık Sayılar", LISE: "Rasyonel Sayılar" },
  "L-rs-ondalik-bolme": { ONLISANS: "Rasyonel ve Ondalık Sayılar", LISE: "Rasyonel Sayılar" },
  "L-be-aralik": { LISE: "Matematiksel İlişkilerden Yararlanma" },
  "L-md-esitsizlik-toplam": { ONLISANS: "Mutlak Değer", LISE: "Matematiksel İlişkilerden Yararlanma" },
  "L-us-ortak-carpan": { ONLISANS: "Üslü Sayılar", LISE: "Üslü Sayılar" },
  "L-us-taban-esitleme": { ONLISANS: "Üslü Sayılar", LISE: "Üslü Sayılar" },
  "L-kok-toplama": { LISE: "Köklü Sayılar" },
  "L-ca-kareler-toplami": { ONLISANS: "Denklem Çözme", LISE: "Matematiksel İlişkilerden Yararlanma" },
  "L-dc-oranti": { ONLISANS: "Oran-Orantı", LISE: "Matematiksel İlişkilerden Yararlanma" },
  "L-sp-kat-fark": { ONLISANS: "Sayı Problemleri", LISE: "Problemler" },
  "L-yas-kat": { ONLISANS: "Yaş Problemleri", LISE: "Problemler" },
  "L-hp-orta-nokta": { ONLISANS: "Hareket Problemleri", LISE: "Problemler" },
  "L-yz-zam-indirim": { LISE: "Problemler" },
  "L-km-iki-dil": { ONLISANS: "Kümeler", LISE: "Matematiksel İlişkilerden Yararlanma" },
  "L-fn-ters": { ONLISANS: "Fonksiyonlar", LISE: "Matematiksel İlişkilerden Yararlanma" },
  "L-is-tanimli-islem": { LISE: "Matematiksel İlişkilerden Yararlanma" },
  "L-ol-iki-renk": { ONLISANS: "Olasılık", LISE: "Problemler" },
  "L-sm-dizi-dogrusal": { ONLISANS: "Sayısal Mantık", LISE: "Sayısal Mantık" },
  "L-sm-dizi-ikinci-fark": { ONLISANS: "Sayısal Mantık", LISE: "Sayısal Mantık" },
  "L-geo-dik-ucgen-yukseklik": { ONLISANS: "Geometri", LISE: "Temel Geometri" },
  "L-geo-ikizkenar-yamuk": { ONLISANS: "Geometri", LISE: "Temel Geometri" },
  "L-ag-ucgen-alan": { ONLISANS: "Geometri", LISE: "Temel Geometri" },
};
for (const s of SABLONLAR.filter((x) => x.duzey === "LISANS" && !x.ders)) {
  for (const [duzey, konu] of Object.entries(LISANS_UYARLAMA[s.id] ?? {}) as [Sablon["duzey"], string][]) {
    SABLONLAR.push({ ...s, id: s.id.replace(/^L-/, `${ONEK[duzey]}-`), duzey, konu });
  }
}

const PAYDA_EKI: Record<number, string> = { 2: "ikide", 3: "üçte", 4: "dörtte", 5: "beşte", 6: "altıda" };
const PAY_EKI: Record<number, string> = { 1: "birini", 2: "ikisini", 3: "üçünü", 4: "dördünü", 5: "beşini" };
/** 3/4 -> "dörtte üçünü" */
const kesirOku = (p: number, q: number) => `${PAYDA_EKI[q]} ${PAY_EKI[p]}`;

const faktoriyelSadelestirme = (duzey: Sablon["duzey"], konu: string): Sablon => ({
  id: `${ONEK[duzey]}-fk-sadelestirme`,
  duzey,
  konu,
  uret: () => {
    const n = r(3, 9);
    const fark = Math.random() < 0.5;
    const dogru = fark ? n * n : n * (n + 2);
    return {
      metin: `{${n + 1}! ${fark ? "−" : "+"} ${n}!|${n - 1}!}\n\nişleminin sonucu kaçtır?`,
      dogru,
      yanlislar: [n * (n + 1), (n + 1) * (n + 1), fark ? n * (n + 2) : n * n, n * n - 1],
      adim: n,
      min: 1,
      aciklama: `${n + 1}! = ${n + 1}·${n}·${n - 1}! ve ${n}! = ${n}·${n - 1}!. Pay ${n - 1}!·${n}·(${n + 1} ${fark ? "−" : "+"} 1) olur; ${n - 1}! sadeleşince ${n}·${fark ? n : n + 2} = ${dogru}.`,
    };
  },
});

const faktoriyelSifir: Sablon = {
  id: "O-fk-sondaki-sifir",
  duzey: "ONLISANS",
  konu: "Faktöriyel",
  uret: () => {
    const N = r(20, 130);
    const kuvvetler = [5, 25, 125].filter((k) => k <= N);
    const z = kuvvetler.reduce((t, k) => t + Math.floor(N / k), 0);
    return {
      metin: `${N}! sayısının sonunda kaç tane sıfır vardır?`,
      dogru: z,
      yanlislar: [Math.floor(N / 5), Math.floor(N / 10), z + 1, z - 1],
      min: 1,
      aciklama: `Sondaki her sıfır bir 2·5 çarpanından gelir; 5 çarpanları sayılır: ${kuvvetler.map((k) => `⌊${N}/${k}⌋`).join(" + ")} = ${kuvvetler.map((k) => Math.floor(N / k)).join(" + ")} = ${z}.`,
    };
  },
};

const kesirHarcama = (duzey: Sablon["duzey"], konu: string): Sablon => ({
  id: `${ONEK[duzey]}-kp-harcama`,
  duzey,
  konu,
  uret: () => {
    const [a, c] = [r(3, 5), r(3, 6)];
    const b = r(1, c - 1);
    if (ebob(b, c) !== 1) return null;
    const T = a * c * 10 * r(1, 8);
    const kalan1 = (T * (a - 1)) / a;
    const X = (kalan1 * (c - b)) / c;
    const [ad, adin] = sec([["Ali", "Ali'nin"], ["Elif", "Elif'in"], ["Mert", "Mert'in"], ["Zeynep", "Zeynep'in"]] as const);
    return {
      metin: `${ad}, harçlığının ${kesirOku(1, a)} kitaba, kalan paranın ${kesirOku(b, c)} yemeğe harcadığında geriye ${X} TL kalıyor.\n\nBuna göre ${adin} harçlığı kaç TL'dir?`,
      dogru: T,
      yanlislar: [kalan1, X * a, X * c, T + 10 * a * c].filter(Number.isInteger),
      adim: 10 * a * c,
      min: 1,
      aciklama: `Harçlık x olsun. Kitaptan sonra x·${kesirGoster(a - 1, a)} kalır; yemekten sonra x·${kesirGoster(a - 1, a)}·${kesirGoster(c - b, c)} = x·${kesirGoster((a - 1) * (c - b), a * c)} = ${X} ⇒ x = ${T} TL.`,
    };
  },
});

const havuz = (duzey: Sablon["duzey"], konu: string): Sablon => ({
  id: `${ONEK[duzey]}-hv-doldur-bosalt`,
  duzey,
  konu,
  uret: () => {
    const a = r(2, 12);
    const b = a + r(1, 12);
    const t = (a * b) / (b - a);
    if (!Number.isInteger(t) || t > 60) return null;
    return {
      metin: `Boş bir havuzu A musluğu tek başına ${a} saatte doldurmakta, B musluğu ise dolu havuzu ${b} saatte boşaltmaktadır.\n\nHavuz boşken iki musluk birlikte açılırsa havuz kaç saatte dolar?`,
      dogru: t,
      yanlislar: [a + b, b - a, (a * b) / (a + b), t + a, t - a].filter((v) => Number.isInteger(v) && v > 0),
      min: 1,
      aciklama: `A 1 saatte havuzun 1/${a} kadarını doldurur, B 1/${b} kadarını boşaltır. Birlikte 1/${a} − 1/${b} = 1/${t} ⇒ havuz ${t} saatte dolar.`,
    };
  },
});

// Sutun grafigi sorulari: degerler adimin kati (izgaradan tam okunur), sayilar grafikte, metinde yok.
const GRAFIK_ORNEKLERI = [
  { baslik: "Bir kırtasiyenin aylara göre defter satışı (adet)", etiketler: ["Ocak", "Şubat", "Mart", "Nisan", "Mayıs"], cumle: "bir kırtasiyenin aylara göre defter satış sayıları" },
  { baslik: "Bir fırının günlere göre ekmek satışı (adet)", etiketler: ["Pzt", "Salı", "Çrş", "Prş", "Cuma"], cumle: "bir fırının günlere göre ekmek satış sayıları" },
  { baslik: "Bir kütüphaneden aylara göre ödünç alınan kitap", etiketler: ["Ocak", "Şubat", "Mart", "Nisan", "Mayıs"], cumle: "bir kütüphaneden aylara göre ödünç alınan kitap sayıları" },
];
const grafikVerisi = () => {
  const g = sec(GRAFIK_ORNEKLERI);
  const adim = sec([10, 20, 25, 50]);
  const degerler = g.etiketler.map(() => adim * r(1, 8));
  const max = adim * Math.min(10, Math.max(...degerler) / adim + r(1, 2));
  const veri = { ...g, adim, degerler, max };
  return sutunVerisiTutarli(veri) ? veri : null;
};
const ciz = (v: NonNullable<ReturnType<typeof grafikVerisi>>) => sutunGrafigi(v.etiketler, v.degerler, v.max, v.adim, v.baslik);

const grafikSablonlari = (duzey: Sablon["duzey"], konu: string): Sablon[] => [
  {
    id: `${ONEK[duzey]}-gr-ortalama`,
    duzey,
    konu,
    uret: () => {
      const v = grafikVerisi();
      if (!v) return null;
      const top = v.degerler.reduce((t, x) => t + x, 0);
      if (top % v.degerler.length) return null;
      const ort = top / v.degerler.length;
      return {
        metin: `Aşağıdaki grafikte ${v.cumle} verilmiştir.\n\nBuna göre bu beş dönemdeki değerlerin ortalaması kaçtır?`,
        dogru: ort,
        yanlislar: [top, Math.max(...v.degerler) - Math.min(...v.degerler), ort + v.adim, ort - v.adim / 2],
        adim: v.adim,
        min: 1,
        aciklama: `Toplam ${v.degerler.join(" + ")} = ${top}; ortalama ${top}/${v.degerler.length} = ${ort}.`,
        svg: ciz(v),
      };
    },
  },
  {
    id: `${ONEK[duzey]}-gr-yuzde`,
    duzey,
    konu,
    uret: () => {
      const v = grafikVerisi();
      if (!v) return null;
      const top = v.degerler.reduce((t, x) => t + x, 0);
      // Yuzdesi tam sayi cikan donemlerden biri sorulur.
      const uygun = v.degerler.flatMap((d, j) => (Number.isInteger((100 * d) / top) ? [j] : []));
      if (!uygun.length) return null;
      const i = sec(uygun);
      const y = (100 * v.degerler[i]) / top;
      return {
        metin: `Aşağıdaki grafikte ${v.cumle} verilmiştir.\n\nBuna göre ${v.etiketler[i]} dönemindeki değer, beş dönemin toplamının yüzde kaçıdır?`,
        dogru: y,
        yanlislar: [v.degerler[i], y * 2, y + 5, y - 5].filter((x) => x > 0 && x < 100),
        adim: 5,
        min: 1,
        max: 99,
        aciklama: `Toplam ${top}; ${v.etiketler[i]} ${v.degerler[i]}. Oran ${v.degerler[i]}/${top} = %${y}.`,
        svg: ciz(v),
      };
    },
  },
  {
    id: `${ONEK[duzey]}-gr-artis`,
    duzey,
    konu,
    uret: () => {
      const v = grafikVerisi();
      if (!v) return null;
      const i = r(0, v.degerler.length - 2);
      const [a, b] = [v.degerler[i], v.degerler[i + 1]];
      const y = ((b - a) * 100) / a;
      if (b <= a || !Number.isInteger(y)) return null;
      return {
        metin: `Aşağıdaki grafikte ${v.cumle} verilmiştir.\n\nBuna göre ${v.etiketler[i]} döneminden ${v.etiketler[i + 1]} dönemine değer yüzde kaç artmıştır?`,
        dogru: y,
        yanlislar: [((b - a) * 100) / b, b - a, y + 10, y - 10].filter((x) => Number.isInteger(x) && x > 0),
        adim: 5,
        min: 1,
        aciklama: `Artış ${b} − ${a} = ${b - a}; ilk değere oranı ${b - a}/${a} = %${y}.`,
        svg: ciz(v),
      };
    },
  },
];

SABLONLAR.push(
  faktoriyelSadelestirme("ONLISANS", "Faktöriyel"),
  faktoriyelSadelestirme("LISE", "Temel Kavramlar"),
  faktoriyelSifir,
  kesirHarcama("ONLISANS", "Kesir Problemleri"),
  kesirHarcama("LISE", "Problemler"),
  havuz("ONLISANS", "İşçi ve Havuz Problemleri"),
  havuz("LISE", "Problemler"),
  ...grafikSablonlari("ONLISANS", "Grafik Problemleri"),
  ...grafikSablonlari("LISE", "Tablo ve Grafik"),
);

// ---- Ikinci kaliplar: tek sablonlu konulara farkli soru tipi (Lisans; uygunlari LISANS_UYARLAMA_2 ile diger duzeylere) ----

const ar = (a: number) => (a === 1 ? "" : String(a));
/** p/q sade kesir ya da tam sayi, eksi isaretiyle (−3/2). */
const sayiKesir = (p: number, q: number) => {
  const g = ebob(p, q);
  return q / g === 1 ? ondalik(p / g) : `${p < 0 ? "−" : ""}${Math.abs(p / g)}/${q / g}`;
};
const PISAGOR_ORTAK_KENAR: [number, number, number, number, number][] = [
  // [ortak dik kenar, kisa taban, kisa hipotenus, uzun taban, uzun hipotenus]
  [12, 5, 13, 9, 15], [12, 5, 13, 16, 20], [12, 9, 15, 16, 20], [8, 6, 10, 15, 17], [24, 7, 25, 10, 26], [24, 10, 26, 18, 30],
  [24, 7, 25, 18, 30], [15, 8, 17, 20, 25], [20, 15, 25, 21, 29], [40, 9, 41, 30, 50], [24, 18, 30, 32, 40], [12, 9, 15, 35, 37],
];
const DUZGUN_COKGEN = [5, 6, 8, 9, 10, 12, 15, 18, 20];
const MEVSIMLER = ["Kış", "İlkbahar", "Yaz", "Sonbahar", "Yıl boyunca eşit dağılır"];

SABLONLAR.push(
  {
    id: "L-be-tamsayi-toplam",
    duzey: "LISANS",
    konu: "Basit Eşitsizlikler",
    uret: () => {
      const [p, q] = [r(2, 3), r(1, 9)];
      const alt = r(-6, 4);
      const ust = alt + r(5, 14);
      const xs = (kati: boolean) => {
        const l: number[] = [];
        for (let x = -60; x <= 60; x++) if ((kati ? alt < p * x - q : alt <= p * x - q) && p * x - q <= ust) l.push(x);
        return l;
      };
      const l = xs(true);
      if (l.length < 2 || l.length > 9) return null;
      const top = l.reduce((t, x) => t + x, 0);
      return {
        metin: `${ondalik(alt)} < ${p}x − ${q} ≤ ${ust}\n\neşitsizliğini sağlayan x tam sayılarının toplamı kaçtır?`,
        dogru: top,
        yanlislar: [xs(false).reduce((t, x) => t + x, 0), l.length, top - l[l.length - 1], top + l[l.length - 1] + 1],
        aciklama: `Her tarafa ${q} eklenip taraflar ${p} ile bölünür: ${sayiKesir(alt + q, p)} < x ≤ ${sayiKesir(ust + q, p)}. Tam sayılar ${l.map(ondalik).join(", ")}; toplamları ${ondalik(top)}.`,
      };
    },
  },
  {
    id: "L-md-kok-carpim",
    duzey: "LISANS",
    konu: "Mutlak Değer",
    uret: () => {
      const p = r(1, 3);
      const x2 = r(-6, 4);
      const x1 = x2 + r(2, 10);
      if ((p * (x1 + x2)) % 2 || (p * (x1 - x2)) % 2) return null;
      const [q, c] = [(p * (x1 + x2)) / 2, (p * (x1 - x2)) / 2];
      if (q <= 0) return null;
      return {
        metin: `|${ar(p)}x − ${q}| = ${c}\n\ndenklemini sağlayan x değerlerinin çarpımı kaçtır?`,
        dogru: x1 * x2,
        yanlislar: [x1 + x2, -x1 * x2, x1 * x2 + p, x1 * x2 - p],
        aciklama: `${ar(p)}x − ${q} = ${c} ⇒ x = ${x1}; ${ar(p)}x − ${q} = −${c} ⇒ x = ${ondalik(x2)}. Çarpım ${ondalik(x1 * x2)}.`,
      };
    },
  },
  {
    id: "L-kok-kesirli",
    duzey: "LISANS",
    konu: "Köklü Sayılar",
    uret: () => {
      const m = sec([2, 3, 5, 6, 7]);
      const [k, n] = [r(1, 4), r(2, 5)];
      const goster = (v: number) => (v === 1 ? `√${m}` : `${v}√${m}`);
      return {
        metin: `{${k * m}|√${m}} + √${m * n * n}\n\nişleminin sonucu kaçtır?`,
        dogru: k + n,
        yanlislar: [k * n, k + n + 1, k + n - 1, k * m + n],
        min: 1,
        goster,
        aciklama: `{${k * m}|√${m}} ifadesinin paydası rasyonel yapılır: {${k * m}√${m}|${m}} = ${goster(k)}. √${m * n * n} = ${goster(n)}. Toplam ${goster(k + n)}.`,
      };
    },
  },
  {
    id: "L-ca-ters-toplam",
    duzey: "LISANS",
    konu: "Çarpanlara Ayırma",
    uret: () => {
      const k = r(3, 9);
      const kare = Math.random() < 0.5;
      const dogru = kare ? k * k - 2 : k * k - 4;
      return {
        metin: kare
          ? `x + {1|x} = ${k}\n\nolduğuna göre x² + {1|x²} ifadesinin değeri kaçtır?`
          : `x + {1|x} = ${k}\n\nolduğuna göre (x − {1|x})² ifadesinin değeri kaçtır?`,
        dogru,
        yanlislar: [k * k, k * k + 2, k * k - 1, kare ? k * k - 4 : k * k - 2, 2 * k],
        min: 1,
        aciklama: kare
          ? `(x + {1|x})² = x² + 2 + {1|x²} ⇒ ${k * k} = x² + {1|x²} + 2 ⇒ x² + {1|x²} = ${dogru}.`
          : `(x − {1|x})² = (x + {1|x})² − 4 = ${k * k} − 4 = ${dogru}.`,
      };
    },
  },
  {
    id: "L-dc-iki-denklem",
    duzey: "LISANS",
    konu: "Denklem Çözme",
    uret: () => {
      const [p, q] = [r(2, 7), r(2, 7)];
      const [x, y] = [r(1, 9), r(1, 9)];
      if (p === q || x === y) return null;
      const [A, B] = [p * x + q * y, q * x + p * y];
      return {
        metin: `${p}x + ${q}y = ${A}\n${q}x + ${p}y = ${B}\n\nolduğuna göre x + y toplamı kaçtır?`,
        dogru: x + y,
        yanlislar: [x * y, Math.abs(x - y), x + y + 1, x + y - 1, Math.abs(A - B)],
        min: 1,
        aciklama: `Denklemler taraf tarafa toplanır: ${p + q}x + ${p + q}y = ${A + B} ⇒ x + y = ${A + B}/${p + q} = ${x + y}.`,
      };
    },
  },
  {
    id: "L-yas-gecmis",
    duzey: "LISANS",
    konu: "Yaş Problemleri",
    uret: () => {
      const k1 = r(2, 3);
      const k2 = k1 + r(1, 3);
      const n = r(2, 12);
      const O = (n * (k2 - 1)) / (k2 - k1);
      const B = k1 * O;
      if (!Number.isInteger(O) || O - n < 1 || B > 75 || B - O < 20) return null;
      return {
        metin: `Bir babanın bugünkü yaşı, oğlunun yaşının ${k1} katıdır. ${n} yıl önce babanın yaşı, oğlunun o zamanki yaşının ${k2} katıydı.\n\nBuna göre babanın bugünkü yaşı kaçtır?`,
        dogru: B,
        yanlislar: [O, B - n, B + n, k2 * O],
        adim: k1,
        min: 1,
        aciklama: `Oğul x ise baba ${k1}x. ${n} yıl önce: ${k1}x − ${n} = ${k2}(x − ${n}) ⇒ ${ar(k2 - k1)}x = ${n * (k2 - 1)} ⇒ x = ${O}. Baba ${k1}·${O} = ${B}.`,
      };
    },
  },
  {
    id: "L-hp-yakalama",
    duzey: "LISANS",
    konu: "Hareket Problemleri",
    uret: () => {
      const v2 = 10 * r(4, 9);
      const v1 = v2 + 10 * r(1, 4);
      const t = r(2, 8);
      const d = (v1 - v2) * t;
      const ters = d / (v1 + v2);
      return {
        metin: `Aralarında ${d} km bulunan A ve B noktalarından aynı anda, A'dan B'ye doğru aynı yönde hareket eden iki araçtan A'dan çıkanın hızı saatte ${v1} km, B'den çıkanınki saatte ${v2} km'dir.\n\nA'dan çıkan araç, B'den çıkan aracı kaç saat sonra yakalar?`,
        dogru: t,
        yanlislar: [Number.isInteger(ters) ? ters : t + 2, t + 1, t - 1, Number.isInteger(d / v1) ? d / v1 : t + 3],
        min: 1,
        aciklama: `Aynı yönde giden araçlarda aradaki fark hız farkıyla kapanır: ${d} / (${v1} − ${v2}) = ${t} saat.`,
      };
    },
  },
  {
    id: "L-yz-kar-maliyet",
    duzey: "LISANS",
    konu: "Yüzde-Kâr-Zarar ve Faiz Problemleri",
    uret: () => {
      const k = sec([10, 20, 25, 40, 50, 60]);
      const x = 20 * r(5, 40);
      const Y = (x * (100 + k)) / 100;
      if (!Number.isInteger(Y)) return null;
      return {
        metin: `Bir satıcı, bir ürünü maliyetinin %${k} fazlasına, yani ${Y} TL'ye satmaktadır.\n\nBuna göre ürünün maliyeti kaç TL'dir?`,
        dogru: x,
        yanlislar: [(Y * (100 - k)) / 100, Y - k, x + 20, x - 20].filter(Number.isInteger),
        adim: 20,
        min: 1,
        aciklama: `Maliyet x: x·${ondalik((100 + k) / 100)} = ${Y} ⇒ x = ${x} TL. (Satış fiyatından %${k} düşmek yanlış olur: kâr maliyet üzerinden hesaplanır.)`,
      };
    },
  },
  {
    id: "L-km-alt-kume",
    duzey: "LISANS",
    konu: "Kümeler",
    uret: () => {
      const n = r(4, 7);
      const enAz = Math.random() < 0.5;
      const dogru = enAz ? 2 ** n - n - 1 : 2 ** (n - 1);
      return {
        metin: enAz
          ? `${n} elemanlı bir kümenin en az iki elemanlı alt kümelerinin sayısı kaçtır?`
          : `A = {${"abcdefg".slice(0, n).split("").join(", ")}} kümesinin alt kümelerinden kaç tanesinde a elemanı bulunur?`,
        dogru,
        yanlislar: [2 ** n, 2 ** n - 1, 2 ** n - n, enAz ? 2 ** (n - 1) : 2 ** n - n - 1, 2 ** (n - 2)],
        min: 1,
        aciklama: enAz
          ? `Tüm alt kümeler 2^{${n}} = ${2 ** n}. Boş küme (1) ve tek elemanlılar (${n}) çıkarılır: ${2 ** n} − 1 − ${n} = ${dogru}.`
          : `a elemanı sabit tutulur, kalan ${n - 1} eleman serbestçe seçilir: 2^{${n - 1}} = ${dogru}.`,
      };
    },
  },
  {
    id: "L-fn-bilesim",
    duzey: "LISANS",
    konu: "Bağıntı ve Fonksiyon",
    uret: () => {
      const [a, b, c, d] = [r(2, 4), r(-5, 5), r(2, 4), r(-5, 5)];
      const k = r(-3, 4);
      const f = (x: number) => a * x + b;
      const g = (x: number) => c * x + d;
      return {
        metin: `f(x) = ${a}x${isaretli(b)} ve g(x) = ${c}x${isaretli(d)}\n\nolduğuna göre (f∘g)(${ondalik(k)}) değeri kaçtır?`,
        dogru: f(g(k)),
        yanlislar: [g(f(k)), f(k) + g(k), f(k) * g(k), f(g(k)) + a],
        aciklama: `Önce g(${ondalik(k)}) = ${ondalik(g(k))}, sonra f(${ondalik(g(k))}) = ${ondalik(f(g(k)))}.`,
      };
    },
  },
  {
    id: "L-ol-iki-zar",
    duzey: "LISANS",
    konu: "Olasılık",
    uret: () => {
      const k = r(3, 11);
      const say = (t: number) => (t < 2 || t > 12 ? 0 : 6 - Math.abs(7 - t));
      const etiket = new Map<number, string>();
      const ekle = (p: number) => (etiket.set(p / 36, kesirGoster(p, 36)), p / 36);
      const dogru = ekle(say(k));
      return {
        metin: `İki zar birlikte atılıyor.\n\nÜst yüze gelen sayıların toplamının ${k} olma olasılığı kaçtır?`,
        dogru,
        yanlislar: [ekle(say(k) + 1), ekle(say(k) - 1 || 7), ekle(6), ekle(say(k) * 2), ekle(say(k + 2) || 9)].filter((v) => v > 0 && v < 1),
        min: 0,
        max: 1,
        goster: (v) => etiket.get(v) ?? "",
        aciklama: `36 eşit olası durumdan toplamı ${k} olanlar ${say(k)} tanedir: olasılık ${say(k)}/36 = ${kesirGoster(say(k), 36)}.`,
      };
    },
  },
  {
    id: "L-geo-ortak-dik-kenar",
    duzey: "LISANS",
    konu: "Özel Üçgenler",
    geometri: true,
    uret: () => {
      const [h, d1, h1, d2, h2] = sec(PISAGOR_ORTAK_KENAR);
      return {
        metin: `Şekildeki ABC üçgeninde [AB] ⊥ [BC]'dir. D noktası [BC] üzerinde olmak üzere |AD| = ${h1} cm, |BD| = ${d1} cm ve |DC| = ${d2 - d1} cm'dir.\n\nBuna göre |AC| kaç cm'dir?`,
        dogru: h2,
        yanlislar: [h1 + d2 - d1, h + d2 - d1, h2 + 1, h2 - 2, d2 + d1],
        min: 1,
        aciklama: `ABD dik üçgeninde |AB|² = ${h1}² − ${d1}² ⇒ |AB| = ${h}. |BC| = ${d1} + ${d2 - d1} = ${d2}. ABC dik üçgeninde |AC|² = ${h}² + ${d2}² ⇒ |AC| = ${h2} cm.`,
        sekil: {
          noktalar: [{ ad: "A", x: 0, y: h }, { ad: "B", x: 0, y: 0 }, { ad: "D", x: d1, y: 0 }, { ad: "C", x: d2, y: 0 }],
          kenarlar: [["A", "B"], ["B", "C"], ["A", "C"], ["A", "D"]],
          kenarEtiketleri: [{ kenar: ["A", "D"], metin: String(h1) }, { kenar: ["B", "D"], metin: String(d1) }, { kenar: ["D", "C"], metin: String(d2 - d1) }],
          dikAcilar: [{ tepe: "B", a: "A", b: "C" }],
          aciEtiketleri: [],
        },
      };
    },
  },
  {
    id: "L-geo-cokgen-kosegen",
    duzey: "LISANS",
    konu: "Dörtgenler ve Çokgenler",
    geometri: true,
    uret: () => {
      const n = sec(DUZGUN_COKGEN);
      const ic = 180 - 360 / n;
      const dogru = (n * (n - 3)) / 2;
      return {
        metin: `Bir iç açısının ölçüsü ${ic}° olan düzgün çokgenin köşegen sayısı kaçtır?`,
        dogru,
        yanlislar: [n, (n * (n - 1)) / 2, n * (n - 3), dogru - n, ((n + 1) * (n - 2)) / 2].filter(Number.isInteger),
        min: 1,
        aciklama: `Bir dış açı 180° − ${ic}° = ${360 / n}°; kenar sayısı 360/${360 / n} = ${n}. Köşegen sayısı n(n − 3)/2 = ${n}·${n - 3}/2 = ${dogru}.`,
      };
    },
  },
  {
    id: "L-ag-uzaklik-parametre",
    duzey: "LISANS",
    konu: "Analitik Geometri",
    geometri: true,
    uret: () => {
      const [dx, dy, d] = sec([[3, 4, 5], [4, 3, 5], [6, 8, 10], [8, 6, 10], [5, 12, 13], [12, 5, 13]] as const);
      const [x1, y2] = [r(-4, 3), r(-3, 6)];
      const x2 = x1 + dx;
      return {
        metin: `Dik koordinat düzleminde A(${ondalik(x1)}, a) ve B(${ondalik(x2)}, ${ondalik(y2)}) noktaları arasındaki uzaklık ${d} birimdir.\n\nBuna göre a'nın alabileceği değerlerin toplamı kaçtır?`,
        dogru: 2 * y2,
        yanlislar: [y2 + dy, y2 - dy, (y2 + dy) * (y2 - dy), 2 * y2 + dx],
        aciklama: `(${ondalik(x2)} − ${ondalik(x1)})² + (${ondalik(y2)} − a)² = ${d}² ⇒ (${ondalik(y2)} − a)² = ${dy * dy} ⇒ a = ${ondalik(y2 + dy)} veya a = ${ondalik(y2 - dy)}. Toplam ${ondalik(2 * y2)}.`,
      };
    },
  },
);

/** Ikinci kaliplarin diger duzeylerdeki konusu. */
Object.assign(LISANS_UYARLAMA, {
  "L-be-tamsayi-toplam": { LISE: "Matematiksel İlişkilerden Yararlanma" },
  "L-md-kok-carpim": { ONLISANS: "Mutlak Değer", LISE: "Matematiksel İlişkilerden Yararlanma" },
  "L-kok-kesirli": { LISE: "Köklü Sayılar" },
  "L-ca-ters-toplam": { ONLISANS: "Denklem Çözme", LISE: "Matematiksel İlişkilerden Yararlanma" },
  "L-dc-iki-denklem": { ONLISANS: "Denklem Çözme", LISE: "Matematiksel İlişkilerden Yararlanma" },
  "L-yas-gecmis": { ONLISANS: "Yaş Problemleri", LISE: "Problemler" },
  "L-hp-yakalama": { ONLISANS: "Hareket Problemleri", LISE: "Problemler" },
  "L-yz-kar-maliyet": { LISE: "Problemler" },
  "L-km-alt-kume": { ONLISANS: "Kümeler", LISE: "Matematiksel İlişkilerden Yararlanma" },
  "L-fn-bilesim": { ONLISANS: "Fonksiyonlar", LISE: "Matematiksel İlişkilerden Yararlanma" },
  "L-ol-iki-zar": { ONLISANS: "Olasılık", LISE: "Problemler" },
  "L-geo-ortak-dik-kenar": { ONLISANS: "Geometri", LISE: "Temel Geometri" },
  "L-geo-cokgen-kosegen": { ONLISANS: "Geometri", LISE: "Temel Geometri" },
  "L-ag-uzaklik-parametre": { ONLISANS: "Geometri", LISE: "Temel Geometri" },
});
for (const id of ["L-be-tamsayi-toplam", "L-md-kok-carpim", "L-kok-kesirli", "L-ca-ters-toplam", "L-dc-iki-denklem", "L-yas-gecmis", "L-hp-yakalama", "L-yz-kar-maliyet", "L-km-alt-kume", "L-fn-bilesim", "L-ol-iki-zar", "L-geo-ortak-dik-kenar", "L-geo-cokgen-kosegen", "L-ag-uzaklik-parametre"]) {
  const s = SABLONLAR.find((x) => x.id === id)!;
  for (const [duzey, konu] of Object.entries(LISANS_UYARLAMA[id]) as [Sablon["duzey"], string][]) SABLONLAR.push({ ...s, id: id.replace(/^L-/, `${ONEK[duzey]}-`), duzey, konu });
}

// Iklim grafiginden mevsimlik yagis: en yagisli mevsim ikincisinden en az %15 fazla olan istasyonlar sorulur.
const iklimMevsimSablonu = (duzey: Sablon["duzey"]): Sablon => ({
  id: `${ONEK[duzey]}-cg-iklim-mevsim`,
  duzey,
  ders: "COGRAFYA",
  konu: "İklim ve Bitki Örtüsü",
  uret: () => {
    const ist = sec(Object.keys(IKLIM_ISTASYONLARI));
    const y = IKLIM_ISTASYONLARI[ist].yagis;
    const mevsim = [y[11] + y[0] + y[1], y[2] + y[3] + y[4], y[5] + y[6] + y[7], y[8] + y[9] + y[10]];
    const sirali = [...mevsim].sort((a, b) => b - a);
    if (sirali[0] < sirali[1] * 1.15) return null;
    const dogru = mevsim.indexOf(sirali[0]) + 1;
    return {
      metin: "Aşağıdaki grafikte bir merkezin uzun yıllar aylık ortalama sıcaklık ve yağış değerleri verilmiştir.\n\nBu merkezde yağışlar en çok hangi mevsimde düşer?",
      dogru,
      yanlislar: [1, 2, 3, 4, 5],
      min: 1,
      max: 5,
      goster: (i) => MEVSIMLER[i - 1] ?? "",
      aciklama: `Mevsimlik toplamlar (MGM uzun yıllar, ${ist}): kış ${Math.round(mevsim[0])} mm, ilkbahar ${Math.round(mevsim[1])} mm, yaz ${Math.round(mevsim[2])} mm, sonbahar ${Math.round(mevsim[3])} mm. En yağışlı mevsim ${MEVSIMLER[dogru - 1].toLocaleLowerCase("tr")}.`,
      svg: iklimGrafigi(IKLIM_ISTASYONLARI[ist].sicaklik, y),
    };
  },
});
SABLONLAR.push(...(["LISANS", "ONLISANS", "LISE"] as const).map(iklimMevsimSablonu));



/** Sablondan bir soru: secenekler, dogru indeks, gorsel. 20 denemede kurulamazsa null. */
export function sablondanSoru(s: Sablon, hedef = r(0, 4)) {
  for (let i = 0; i < 20; i++) {
    const u = s.uret();
    if (!u) continue;
    if (u.sekil && geometriSorunu(u.sekil)) continue;
    const siklar = sikKur(u, hedef);
    if (!siklar) continue;
    return { soruMetni: u.metin, aciklama: u.aciklama, gorselSvg: u.svg ?? (u.sekil ? geometriSekli(u.sekil) : null), ...siklar };
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
        data: { duzey, ders: s.ders ?? "MATEMATIK", konu: s.konu, geometri: !!s.geometri, uretim: "sablon", sablon: s.id, sira: 99_999, ...soru },
      });
      eklenen++;
    }
  }
  return eklenen;
}

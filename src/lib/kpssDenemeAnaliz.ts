import type { DenemeDers } from "@/generated/prisma/client";
import { DERS_SIRASI } from "@/lib/kpssDenemeSabitler";

type AnalizSorusu = { id: string; ders: DenemeDers; konu: string | null; dogruCevap: number };
export type Sayim = { dogru: number; yanlis: number; bos: number };
export type KonuDurumu = "kirmizi" | "sari" | "yesil";

const net = ({ dogru, yanlis }: Sayim) => dogru - yanlis / 4;

function say(sorular: AnalizSorusu[], cevaplar: Record<string, number>): Sayim {
  const s = { dogru: 0, yanlis: 0, bos: 0 };
  for (const soru of sorular) {
    const verilen = cevaplar[soru.id];
    if (verilen === undefined) s.bos++;
    else if (verilen === soru.dogruCevap) s.dogru++;
    else s.yanlis++;
  }
  return s;
}

/** Ders karnesi: sinav sirasiyla her dersin dogru/yanlis/bos ve neti. */
export function dersKarnesi(sorular: AnalizSorusu[], cevaplar: Record<string, number>) {
  return DERS_SIRASI.map((ders) => {
    const sayim = say(sorular.filter((s) => s.ders === ders), cevaplar);
    return { ders, ...sayim, net: net(sayim), toplam: sayim.dogru + sayim.yanlis + sayim.bos };
  }).filter((d) => d.toplam > 0);
}

/**
 * Konu durumu (kullanicinin kurali):
 * - kirmizi: yanlis > dogru -> "gozden gecirmelisin"
 * - yesil: konunun butun sorulari dogru -> "eksigin gorunmuyor"
 * - sari: geri kalan her durum (yanlis = dogru, en az 1 yanlis, bos >= dogru ya da
 *   yanlis yok ama bos var) -> "biraz daha dikkatli olmalisin"
 */
export function konuDurumu({ dogru, yanlis, bos }: Sayim): KonuDurumu {
  if (yanlis > dogru) return "kirmizi";
  if (yanlis === 0 && bos === 0) return "yesil";
  return "sari";
}

const ONCELIK: Record<KonuDurumu, number> = { kirmizi: 0, sari: 1, yesil: 2 };

/**
 * Konu analizi: konusu etiketli sorular ders+konu bazinda gruplanir. Siralama:
 * once kirmizi, sonra sari, sonra yesil; esitlikte kayip orani (yanlis+bos)/toplam yuksek olan once.
 */
export function konuAnalizi(sorular: AnalizSorusu[], cevaplar: Record<string, number>) {
  const gruplar = new Map<string, { ders: DenemeDers; konu: string; sorular: AnalizSorusu[] }>();
  for (const s of sorular) {
    if (!s.konu) continue;
    const anahtar = `${s.ders}|${s.konu}`;
    const g = gruplar.get(anahtar) ?? { ders: s.ders, konu: s.konu, sorular: [] };
    g.sorular.push(s);
    gruplar.set(anahtar, g);
  }
  return [...gruplar.values()]
    .map(({ ders, konu, sorular: ks }) => {
      const sayim = say(ks, cevaplar);
      const toplam = ks.length;
      return { ders, konu, ...sayim, toplam, durum: konuDurumu(sayim), soruIdler: ks.map((s) => s.id) };
    })
    .sort((a, b) => ONCELIK[a.durum] - ONCELIK[b.durum] || (b.yanlis + b.bos) / b.toplam - (a.yanlis + a.bos) / a.toplam || b.toplam - a.toplam);
}

export type KonuSonucu = ReturnType<typeof konuAnalizi>[number];
export type DersSonucu = ReturnType<typeof dersKarnesi>[number];

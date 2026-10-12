// Bellek ici, sabit pencereli istek sayaci (src/proxy.ts kullanir).
// ponytail: sayac her sunucu orneginin kendi belleginde; ornekler arasi paylasilmaz. Dagitik
// saldirida yetmezse Vercel Firewall rate-limit kurali ya da paylasilan bir sayac (Redis) eklenir.
export const PENCERE_MS = 60_000;

const sayaclar = new Map<string, { adet: number; baslangic: number }>();
let sonTemizlik = 0;

/** anahtar (ör. "yazma:1.2.3.4") pencerede sinir'i astiysa asti=true ve pencerenin bitmesine kalan saniye. */
export function hizSiniriAs(anahtar: string, sinir: number, simdi = Date.now()): { asti: boolean; kalanSn: number } {
  if (simdi - sonTemizlik > PENCERE_MS) {
    for (const [k, v] of sayaclar) if (simdi - v.baslangic > PENCERE_MS) sayaclar.delete(k);
    sonTemizlik = simdi;
  }
  const s = sayaclar.get(anahtar);
  if (!s || simdi - s.baslangic > PENCERE_MS) {
    sayaclar.set(anahtar, { adet: 1, baslangic: simdi });
    return { asti: false, kalanSn: 0 };
  }
  s.adet++;
  return { asti: s.adet > sinir, kalanSn: Math.ceil((s.baslangic + PENCERE_MS - simdi) / 1000) };
}

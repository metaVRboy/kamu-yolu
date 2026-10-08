import { revalidatePath, revalidateTag, unstable_cache } from "next/cache";
import { prisma } from "@/lib/prisma";
import {
  UCRETLI_PLANLAR,
  VARSAYILAN_FIYAT,
  indirimEtiketi,
  indirimliFiyat,
  type Donem,
  type FiyatTablosu,
  type KampanyaOzeti,
  type UcretliPlan,
} from "@/lib/planlar";

const ETIKET = "fiyatlar";

// Fiyatlar ve otomatik (kuponsuz) kampanyalar seyrek degisir; her ziyaretci icin ayni sorgu
// paylasilir. Admin degisikliginde fiyatlariGuncelle() cache'i hemen bosaltir.
const hamVeri = unstable_cache(
  async () => {
    const [fiyatlar, kampanyalar] = await Promise.all([
      prisma.planFiyat.findMany(),
      prisma.kampanya.findMany({ where: { aktif: true, kuponKodu: null, bitis: { gt: new Date() } } }),
    ]);
    return { fiyatlar, kampanyalar };
  },
  [ETIKET],
  { tags: [ETIKET], revalidate: 300 },
);


/**
 * Sitede gosterilecek fiyatlar: her plan+donem icin o an gecerli en iyi otomatik kampanya
 * uygulanir. Kampanyanin baslangic/bitisi her istekte sunucu saatiyle degerlendirilir.
 */
export async function getFiyatlar(): Promise<{ tablo: FiyatTablosu; kampanya: KampanyaOzeti }> {
  const { fiyatlar, kampanyalar } = await hamVeri();
  const simdi = Date.now();
  // unstable_cache JSON'a cevirir: tarihler metin olarak gelir.
  const aktifler = kampanyalar.filter((k) => new Date(k.baslangic).getTime() <= simdi && new Date(k.bitis).getTime() > simdi);

  const tablo = {} as FiyatTablosu;
  let enIyi: { ad: string; bitis: number } | null = null;
  for (const plan of UCRETLI_PLANLAR) {
    const kayit = fiyatlar.find((f) => f.plan === plan);
    tablo[plan] = {} as FiyatTablosu[UcretliPlan];
    for (const donem of ["aylik", "yillik"] as Donem[]) {
      const liste = kayit ? kayit[donem] : VARSAYILAN_FIYAT[plan][donem];
      let odenecek = liste;
      let etiket: string | null = null;
      for (const k of aktifler) {
        if (!k.planlar.includes(plan) || !k[donem]) continue;
        const f = indirimliFiyat(liste, k);
        if (f < odenecek) {
          odenecek = f;
          etiket = indirimEtiketi(k);
          enIyi ??= { ad: k.ad, bitis: new Date(k.bitis).getTime() }; // sitede gosterilecek kampanya
        }
      }
      tablo[plan][donem] = { liste, odenecek, etiket };
    }
  }
  return { tablo, kampanya: enIyi && { ad: enIyi.ad, kalanMs: enIyi.bitis - simdi } };
}

/** Admin fiyat/kampanya degisikliginden sonra: cache'i ve fiyat gecen statik sayfalari yenile. */
export function fiyatlariGuncelle() {
  // Fiyat ticari/yasal bilgi: eski fiyat bir istek bile gosterilmesin (stale-while-revalidate degil).
  revalidateTag(ETIKET, { expire: 0 });
  for (const yol of ["/amacimiz", "/mesafeli-satis-sozlesmesi", "/on-bilgilendirme-formu"]) revalidatePath(yol);
}

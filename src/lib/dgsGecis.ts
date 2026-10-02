import { prisma } from "@/lib/prisma";
import { normalize } from "@/lib/matching";

export type DgsHedef = { lisansAdi: string; puanTuru: string };

/**
 * Bir onlisans bolumunden DGS ile hangi lisans bolumlerine gecilebilecegini
 * dondurur. ÖSYM'nin resmi 2026-DGS kilavuzu TABLO-2'sinden bir kerelik
 * aktarilan (scripts/dgsTabloScrapeOneShot.ts) gercek veridir.
 *
 * Esleme isim bazli: DgsGecis.onlisansAdi (ÖSYM kaynakli) ile KpssBolum.ad
 * (memurlar.net kaynakli) ayni ulusal "Alan Adi" sozlugunu kullandigi icin
 * normalde birebir ayni yazilir - normalize() ile kucuk farkliliklar
 * (buyuk/kucuk harf, Turkce karakter) tolere edilir.
 */
export async function getDgsHedefleri(onlisansAdi: string): Promise<DgsHedef[]> {
  // Once index'li tam eslesme (hizli, yaygin durum) - normalde isimler
  // ayni ulusal "Alan Adi" sozlugunden geldigi icin birebir eslesir.
  let satirlar = await prisma.dgsGecis.findMany({
    where: { onlisansAdi },
    select: { lisansAdi: true, puanTuru: true },
  });

  if (satirlar.length === 0) {
    // Tam eslesme yoksa (buyuk/kucuk harf vb. farkliliklar icin) tum
    // tabloyu normalize ederek tara.
    const hepsi = await prisma.dgsGecis.findMany({ select: { onlisansAdi: true, lisansAdi: true, puanTuru: true } });
    const norm = normalize(onlisansAdi);
    satirlar = hepsi.filter((h) => normalize(h.onlisansAdi) === norm);
  }

  const benzersiz = new Map<string, DgsHedef>();
  for (const s of satirlar) benzersiz.set(s.lisansAdi, { lisansAdi: s.lisansAdi, puanTuru: s.puanTuru });
  return Array.from(benzersiz.values()).sort((a, b) => a.lisansAdi.localeCompare(b.lisansAdi, "tr"));
}

import { Prisma } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import { findInstitutionImage } from "@/lib/findInstitutionImage";
import { haberFotografiBul } from "@/lib/haberFoto";

/**
 * Gorseli eksik ya da yalniz logo olan haberleri tamamlar (gunluk bakim): once konuya uygun telifsiz fotograf
 * (Unsplash), bulunamazsa gorseli bos olana kurum logosu. Haber olusturulurken gorsel bir kez aranir; o an hata olursa
 * kalici bos kaliyordu. En yeni `sinir` haber (Unsplash demo siniri saatte 50 istek: arama terimleri paylasilir).
 */
export async function eksikHaberGorselleriniDoldur(sinir = 20) {
  const haberler = await prisma.haber.findMany({
    where: { gorselKredi: { equals: Prisma.AnyNull } },
    select: { id: true, baslik: true, ozet: true, kategori: true, kurumAdi: true, gorselUrl: true },
    orderBy: { yayinTarihi: "desc" },
    take: sinir,
  });
  const fotoArama = new Map();
  const logolar = new Map<string, string | null>();
  let foto = 0;
  let logo = 0;
  for (const h of haberler) {
    const f = await haberFotografiBul(h, fotoArama);
    if (f) {
      await prisma.haber.update({ where: { id: h.id }, data: { gorselUrl: f.url, gorselLogoMu: false, gorselKredi: f.kredi } });
      foto++;
      continue;
    }
    if (h.gorselUrl || !h.kurumAdi) continue;
    if (!logolar.has(h.kurumAdi)) logolar.set(h.kurumAdi, await findInstitutionImage(h.kurumAdi));
    const l = logolar.get(h.kurumAdi);
    if (!l) continue;
    await prisma.haber.update({ where: { id: h.id }, data: { gorselUrl: l, gorselLogoMu: true } });
    logo++;
  }
  return { denenen: haberler.length, foto, logo };
}

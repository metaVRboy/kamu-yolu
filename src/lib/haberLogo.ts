import { prisma } from "@/lib/prisma";
import { findInstitutionImage } from "@/lib/findInstitutionImage";

/**
 * Logosu bos kalmis haberler icin kurum logosunu yeniden dener (gunluk bakim). Haber olusturulurken logo bir kez
 * aranir; o an Wikipedia hatasi olursa ya da bulucu adi eslestiremezse gorsel kalici bos kaliyordu. En yeni `sinir`
 * haber, ayni kurum bir kez sorulur.
 */
export async function eksikHaberLogolariniDoldur(sinir = 40) {
  const haberler = await prisma.haber.findMany({
    where: { gorselUrl: null, kurumAdi: { not: null } },
    select: { id: true, kurumAdi: true },
    orderBy: { yayinTarihi: "desc" },
    take: sinir,
  });
  const bulunan = new Map<string, string | null>();
  let dolan = 0;
  for (const h of haberler) {
    const kurum = h.kurumAdi!;
    if (!bulunan.has(kurum)) bulunan.set(kurum, await findInstitutionImage(kurum));
    const gorsel = bulunan.get(kurum);
    if (!gorsel) continue;
    await prisma.haber.update({ where: { id: h.id }, data: { gorselUrl: gorsel, gorselLogoMu: true } });
    dolan++;
  }
  return { denenen: haberler.length, dolan };
}

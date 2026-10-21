import { prisma } from "@/lib/prisma";
import { createBildirim } from "@/lib/notifications";
import { aktifProKosulu } from "@/lib/sms";
import { pushGonder } from "@/lib/push";
import { slugify } from "@/lib/slug";

/** Kurum adi karsilastirma anahtari: kucuk harf (tr), noktalama yok, tek bosluk. */
export function kurumNorm(ad: string) {
  return ad
    .toLocaleLowerCase("tr")
    .replace(/[^\p{L}\p{N}]+/gu, " ")
    .trim();
}

/**
 * Yeni ilan kaydedilince (tarama ve admin): kurumunu takip eden Pro uyelere site ve tarayici bildirimi. Eslesme:
 * ilanin kurum adi takip edilen adi icerir ("Hazine ve Maliye Bakanligi Gelir Idaresi Baskanligi" ⊃ "Gelir Idaresi
 * Baskanligi"). Ucretsiz uyenin takibi durur, bildirim gitmez (Pro'ya gecince gelir). Bildirilen uye sayisi doner.
 * ponytail: tum Pro takipleri bellekte suzulur; takip sayisi binleri asarsa kurumNorm uzerinde SQL LIKE'a gecilmeli.
 */
export async function kurumTakipBildir(ilan: { id: string; title: string; institutionName: string }) {
  const ilanNorm = kurumNorm(ilan.institutionName);
  const takipler = await prisma.kurumTakip.findMany({
    where: { user: aktifProKosulu() },
    select: { userId: true, kurumAdi: true, kurumNorm: true, user: { select: { pushAbonelikleri: true } } },
  });
  const eslesen = takipler.filter((t) => t.kurumNorm.length >= 4 && ilanNorm.includes(t.kurumNorm));
  const link = `/ilan/${ilan.id}/${slugify(ilan.title)}`;
  for (const t of eslesen) {
    const baslik = `Takip ettiğin kurumun ilanı yayımlandı: ${t.kurumAdi}`;
    await createBildirim({ userId: t.userId, tur: "KURUM_ILAN", baslik, icerik: ilan.title, link });
    await pushGonder(t.user.pushAbonelikleri, { baslik, govde: ilan.title, link });
  }
  return eslesen.length;
}

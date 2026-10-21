export const SITE_URL = "https://www.kamuyolu.com";

/**
 * Istemciden gelen donus hedefi (?sonra=): yalniz bu sitenin yolu, degilse null. startsWith("/") yetmez:
 * "/\kotu.site" ve "/<tab>/kotu.site" tarayicida baska siteye gider (girisin ardindan sahte sifre sayfasi).
 */
export function siteIciYol(hedef: string | null | undefined): string | null {
  if (!hedef?.startsWith("/")) return null;
  const u = new URL(hedef, "https://yerel.invalid");
  return u.origin === "https://yerel.invalid" ? u.pathname + u.search + u.hash : null;
}

/** Kurumsal e-posta (Google Workspace kutusu): site e-postalarinin gondereni ve yasal metinlerdeki iletisim adresi. */
export const ILETISIM_EPOSTA = "info@kamuyolu.com";

// Kunye (5651 Yon. m.5), satici adresi ve KVKK yazili basvuru adresi: vergi kaydindaki isyeri (faaliyet) adresi
// (ise baslama 19.10.2026). Ev adresi yayinlanmaz.
// Vergi levhasindaki is yeri adresiyle birebir (yasal sayfalar, kunye, sozlesmeler bu adresi kullanir).
export const ILETISIM_ADRES = "Büyükesat Mah. Koza 1 Cd. Sev Apt. No:153 İç Kapı No:8, Çankaya/Ankara";
export const ILETISIM_TELEFON = { goster: "0547 749 61 61", tel: "+905477496161" };

/**
 * Satici (sahis isletmesi) bilgileri: mesafeli satis sozlesmesi, on bilgilendirme formu, iade politikasi ve
 * footer kunyesi buradan beslenir. Sirket kurulunca vergi levhasindaki bilgilerle doldurulur; unvan ve vergi no
 * dolunca sozlesme sayfalari satis kapaliyken de yayina girer (sanal POS basvurusunda site incelenir).
 * mersisNo/ticaretSicilNo/odaKaydi: sahis isletmesi esnaf sicilindeyse bos kalabilir (o satir gosterilmez).
 */
export const SATICI: {
  unvan: string | null;
  vergiDairesi: string | null;
  vergiNo: string | null;
  mersisNo: string | null;
  ticaretSicilNo: string | null;
  odaKaydi: string | null;
  adres: string;
} = {
  // Sahis isletmesi (gercek usul, ise baslama 19.10.2026): unvan isletme sahibinin adi. TC kimlik no yayinlanmaz.
  unvan: "Emirhan Koç",
  vergiDairesi: "Ankara Cumhuriyet",
  vergiNo: "5671298061",
  mersisNo: null,
  ticaretSicilNo: null,
  odaKaydi: null,
  adres: ILETISIM_ADRES,
};

/** Odeme kurulusu (ornek: "iyzico — İyzi Ödeme ve Elektronik Para Hizmetleri A.Ş."); secilene kadar null. */
export const ODEME_KURULUSU: string | null = null;

/** Satici bilgileri sozlesmelerin yayina girmesine yetecek kadar dolu mu. */
export const SATICI_BILGILERI_TAMAM = Boolean(SATICI.unvan && SATICI.vergiDairesi && SATICI.vergiNo);

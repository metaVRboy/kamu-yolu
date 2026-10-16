export const SITE_URL = "https://www.kamuyolu.com";

/** Kurumsal e-posta (Google Workspace kutusu): site e-postalarinin gondereni ve yasal metinlerdeki iletisim adresi. */
export const ILETISIM_EPOSTA = "info@kamuyolu.com";

// Kunye (5651 Yon. m.5) ve KVKK yazili basvuru adresi: site sahibi gercek kisinin yerlesim yeri ve telefonu.
export const ILETISIM_ADRES = "İşçi Blokları Mah. Muhsin Yazıcıoğlu Cd. No:60 Kat:1 Daire:36, Çankaya/Ankara";
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
  unvan: null,
  vergiDairesi: null,
  vergiNo: null,
  mersisNo: null,
  ticaretSicilNo: null,
  odaKaydi: null,
  adres: ILETISIM_ADRES,
};

/** Odeme kurulusu (ornek: "iyzico — İyzi Ödeme ve Elektronik Para Hizmetleri A.Ş."); secilene kadar null. */
export const ODEME_KURULUSU: string | null = null;

/** Satici bilgileri sozlesmelerin yayina girmesine yetecek kadar dolu mu. */
export const SATICI_BILGILERI_TAMAM = Boolean(SATICI.unvan && SATICI.vergiDairesi && SATICI.vergiNo);

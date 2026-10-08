/** Ucretli planlarin fiyat ve ozellikleri: Aboneliğim sayfasi ve yukseltme penceresi ortak kaynak. */

export type UcretliPlan = "PRO" | "PRO_PLUS";
export type Plan = "UCRETSIZ" | UcretliPlan;

export const PLAN_ADI: Record<Plan, string> = { UCRETSIZ: "Standart", PRO: "Pro", PRO_PLUS: "Pro+" };

/** TL, KDV dahil. */
export const PLAN_FIYATI: Record<UcretliPlan, { aylik: number; yillik: number }> = {
  PRO: { aylik: 59, yillik: 529 },
  PRO_PLUS: { aylik: 79, yillik: 699 },
};

/** Kesirli tutarlar iki haneli ("1,30 TL"), tam sayilar yalin ("39 TL"). */
export const tl = (n: number) =>
  `${n.toLocaleString("tr-TR", Number.isInteger(n) ? {} : { minimumFractionDigits: 2, maximumFractionDigits: 2 })} TL`;

/** Yillik odemede 12 aylik fiyata gore tasarruf yuzdesi (tam sayi). */
export const yillikTasarruf = (p: UcretliPlan) => Math.round((1 - PLAN_FIYATI[p].yillik / (PLAN_FIYATI[p].aylik * 12)) * 100);

/** Yillikta her planda en az kac aylik ucret kazanilir ("3 ay bedava"). */
export const yillikBedavaAy = Math.floor(
  Math.min(...(Object.keys(PLAN_FIYATI) as UcretliPlan[]).map((p) => 12 - PLAN_FIYATI[p].yillik / PLAN_FIYATI[p].aylik)),
);

/** Yukseltme butonunun bulundugu yer: pencere basligi ve karsilastirmada vurgulanan satir buna gore. */
export type YukseltmeKaynagi =
  | "genel"
  | "rapor"
  | "gelisim"
  | "deneme-hakki"
  | "sms"
  | "bildirim"
  | "becayis-mesaj"
  | "becayis-talep"
  | "ozel-ilanlar"
  | "reklamsiz";

export const KAYNAK_METNI: Record<YukseltmeKaynagi, { baslik: string; alt: string }> = {
  genel: { baslik: "Kamu Yolu'nun tamamını aç", alt: "Bölümüne uygun ilanları ilk sen öğren, KPSS'ye her gün hazırlan." },
  rapor: { baslik: "Ders karneni ve çözümleri aç", alt: "Her dersteki netini ve her sorunun doğru cevabını, açıklamasıyla gör." },
  gelisim: { baslik: "Konu konu nerede olduğunu gör", alt: "Hangi konuyu çalışman gerektiğini ve önceki denemene göre gelişimini adım adım izle." },
  "deneme-hakki": { baslik: "Bu hafta durma, çözmeye devam et", alt: "Haftalık hakkın doldu; yükselt, KPSS hazırlığın yarıda kalmasın." },
  sms: { baslik: "Yeni ilanı herkesten önce öğren", alt: "Bölümüne uygun ilan çıktığı an telefonuna SMS gelsin." },
  bildirim: { baslik: "Önemli hiçbir şeyi kaçırma", alt: "Bölümüne uygun yeni ilan çıkınca ya da becayiş mesajı gelince anında haberin olsun." },
  "becayis-mesaj": { baslik: "Becayiş eşini bul, hemen yaz", alt: "Talep sahipleriyle site içinden doğrudan mesajlaş." },
  "becayis-talep": { baslik: "Becayiş talebini yayımla", alt: "Talebin herkese açık listelensin, yer değiştirmek isteyenler sana ulaşsın." },
  "ozel-ilanlar": { baslik: "Sana özel ilanları gör", alt: "Bölümüne ve öğrenim düzeyine uygun ilanlar tek listede." },
  reklamsiz: { baslik: "Reklamsız, odaklı bir deneyim", alt: "Hiç reklam görmeden ilanlara ve denemelere odaklan." },
};

/** Karsilastirma satirlari: true = var, false = yok, metin = plana gore deger. */
export const KARSILASTIRMA: { ozellik: string; kaynak?: YukseltmeKaynagi; degerler: Record<Plan, boolean | string> }[] = [
  { ozellik: "Tüm ilanlar ve bölüme göre arama", degerler: { UCRETSIZ: true, PRO: true, PRO_PLUS: true } },
  { ozellik: "Haftalık KPSS denemesi", kaynak: "deneme-hakki", degerler: { UCRETSIZ: "1", PRO: "3", PRO_PLUS: "Sınırsız" } },
  { ozellik: "Ders karnesi ve soru çözümleri", kaynak: "rapor", degerler: { UCRETSIZ: false, PRO: true, PRO_PLUS: true } },
  { ozellik: "Konu bazlı değerlendirme ve gelişim", kaynak: "gelisim", degerler: { UCRETSIZ: false, PRO: false, PRO_PLUS: true } },
  { ozellik: "Kişisel bildirimler", kaynak: "bildirim", degerler: { UCRETSIZ: false, PRO: true, PRO_PLUS: true } },
  { ozellik: "SMS ile anlık ilan bildirimi", kaynak: "sms", degerler: { UCRETSIZ: false, PRO: true, PRO_PLUS: true } },
  { ozellik: "Becayiş talebi oluşturma", kaynak: "becayis-talep", degerler: { UCRETSIZ: false, PRO: true, PRO_PLUS: true } },
  { ozellik: "Becayiş mesajlaşması", kaynak: "becayis-mesaj", degerler: { UCRETSIZ: false, PRO: true, PRO_PLUS: true } },
  { ozellik: "Bana özel ilanlar", kaynak: "ozel-ilanlar", degerler: { UCRETSIZ: false, PRO: true, PRO_PLUS: true } },
  { ozellik: "Reklamsız deneyim", kaynak: "reklamsiz", degerler: { UCRETSIZ: false, PRO: false, PRO_PLUS: true } },
  { ozellik: "Öncelikli destek", degerler: { UCRETSIZ: false, PRO: false, PRO_PLUS: true } },
];

export const YUKSELTME_KAYNAKLARI = Object.keys(KAYNAK_METNI) as YukseltmeKaynagi[];

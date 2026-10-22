/** Ucretli planlarin fiyat ve ozellikleri: Aboneliğim sayfasi ve yukseltme penceresi ortak kaynak. */

export type UcretliPlan = "PRO" | "PRO_PLUS";
export type Plan = "UCRETSIZ" | UcretliPlan;

export const PLAN_ADI: Record<Plan, string> = { UCRETSIZ: "Standart", PRO: "Pro", PRO_PLUS: "Pro+" };

export const UCRETLI_PLANLAR: UcretliPlan[] = ["PRO", "PRO_PLUS"];

/** Ucretsiz (Standart) planin maddeleri: Aboneliğim karti ve kayit paneli ortak kaynak. */
export const STANDART_OZELLIKLERI = [
  "Tüm ilanları görüntüleme",
  "Bölüm/seviyeye göre arama",
  "Becayiş ilanlarını görüntüleme",
  "Haftada toplam 1 KPSS denemesi (puan sonucu)",
];

/**
 * Sirket kurulup odeme altyapisi baglanana kadar false. Kapaliyken: kampanya/indirim ve ustu cizili
 * fiyat gosterilmez (hic satis yokken "eski fiyat" iddiasi yanilticidir), satis sozlesmesi sayfalari
 * yayinda olmaz, odeme vaatleri ("iptal et", "KDV dahil") gizlenir. Bkz. denetim 2026-10-13.
 */
export const SATIS_ACIK = false;

/**
 * Kampanya/duyuru (ticari elektronik ileti) onayi toplama. Ticari Ileti Yonetmeligi m.7/11-12: onay 3 is
 * gunu icinde IYS'ye kaydedilmezse gecersiz; IYS kaydi (vergi kaydi/sirket) yapilana kadar onay
 * istenmez, kutucuk ve ayar gizli kalir. Veritabani alanlari ve API duruyor.
 */
export const TICARI_ILETI_ACIK = false;

/**
 * Kurucu uye sozu (2026-10-20): satis acilmadan "Acilinca haber ver" listesine katilanlara (YukseltmeTalebi kaydi)
 * satis acilinca ILK AY bu yuzde indirim. Bir taahhut: odeme entegrasyonunda bu kayitlara uygulanmali.
 */
export const KURUCU_UYE_INDIRIM = 50;
export type Donem = "aylik" | "yillik";

/** Bir plan+donem fiyati (TL, KDV dahil): liste fiyati, kampanyali odenecek tutar ve kampanya etiketi. */
export type DonemFiyati = { liste: number; odenecek: number; etiket: string | null };
export type FiyatTablosu = Record<UcretliPlan, Record<Donem, DonemFiyati>>;
/** Sitede gosterilen aktif kampanya; kalanMs sunucuda hesaplanir (cihaz saatine guvenilmez). */
export type KampanyaOzeti = { ad: string; kalanMs: number } | null;

/** Fiyatlar admin panelden (PlanFiyat tablosu) yonetilir; tablo bossa bunlar kullanilir. */
export const VARSAYILAN_FIYAT: Record<UcretliPlan, Record<Donem, number>> = {
  PRO: { aylik: 59, yillik: 529 },
  PRO_PLUS: { aylik: 79, yillik: 699 },
};

/** Kesirli tutarlar iki haneli ("1,30 TL"), tam sayilar yalin ("39 TL"). */
export const tl = (n: number) =>
  `${n.toLocaleString("tr-TR", Number.isInteger(n) ? {} : { minimumFractionDigits: 2, maximumFractionDigits: 2 })} TL`;

/** Yillik odemede 12 aylik odemeye gore tasarruf yuzdesi (tam sayi, en az 0). */
export const yillikTasarruf = (f: Record<Donem, DonemFiyati>) =>
  Math.max(0, Math.round((1 - f.yillik.odenecek / (f.aylik.odenecek * 12)) * 100));

/** Yillikta her planda en az kac aylik ucret kazanilir ("3 ay bedava"). */
export const yillikBedavaAy = (t: FiyatTablosu) =>
  Math.max(0, Math.floor(Math.min(...UCRETLI_PLANLAR.map((p) => 12 - t[p].yillik.odenecek / t[p].aylik.odenecek))));

type Indirim = { yuzde: number | null; tutar: number | null };

/** Liste fiyatina indirim uygular (tam TL'ye yuvarlanir, 0'in altina inmez). */
export function indirimliFiyat(liste: number, k: Indirim) {
  if (k.yuzde) return Math.max(0, Math.round((liste * (100 - k.yuzde)) / 100));
  if (k.tutar) return Math.max(0, liste - k.tutar);
  return liste;
}

export const indirimEtiketi = (k: Indirim) => (k.yuzde ? `%${k.yuzde} indirim` : `${k.tutar} TL indirim`);

export const kalanSureMetni = (ms: number) =>
  ms >= 86_400_000 ? `${Math.ceil(ms / 86_400_000)} gün kaldı` : ms >= 3_600_000 ? `${Math.ceil(ms / 3_600_000)} saat kaldı` : "son saatler";

/** Yukseltme butonunun bulundugu yer: pencere basligi ve karsilastirmada vurgulanan satir buna gore. */
export type YukseltmeKaynagi =
  | "genel"
  | "rapor"
  | "gelisim"
  | "deneme-hakki"
  | "whatsapp"
  | "bildirim"
  | "becayis-mesaj"
  | "becayis-talep"
  | "ozel-ilanlar"
  // Periyodik tanitim penceresinin donusumlu mesajlari (hangisi daha cok "haber ver" aliyor olculur).
  | "tanitim-ilan"
  | "tanitim-kpss"
  | "tanitim-becayis"
  | "tanitim-proplus"
  // Baglilik paketi (2026-10-20): header bandi, kacirilan ilan uyarisi, ilan takip hatirlatmasi, zayif konu sayisi.
  | "bant"
  | "kacirilan"
  | "ilan-takip"
  | "zayif-konu"
  // Pro tesvikleri 2 (2026-10-21): seri dondurma, duyuru/kurum takibi.
  | "seri"
  | "duyuru-takip";

export const KAYNAK_METNI: Record<YukseltmeKaynagi, { baslik: string; alt: string }> = {
  genel: { baslik: "Kamu Yolu'nun tamamını aç", alt: "Bölümüne uygun ilanları ilk sen öğren, KPSS'ye her gün hazırlan." },
  rapor: { baslik: "Ders karneni ve çözümleri aç", alt: "Her dersteki netini ve her sorunun doğru cevabını, açıklamasıyla gör." },
  gelisim: { baslik: "Konu konu nerede olduğunu gör", alt: "Hangi konuyu çalışman gerektiğini ve önceki denemene göre gelişimini adım adım izle." },
  "deneme-hakki": { baslik: "Bu hafta durma, çözmeye devam et", alt: "Haftalık hakkın doldu; yükselt, KPSS hazırlığın yarıda kalmasın." },
  whatsapp: { baslik: "Yeni ilanı herkesten önce öğren", alt: "Bölümüne uygun ilan çıktığı an WhatsApp'tan mesaj gelsin." },
  bildirim: { baslik: "Önemli hiçbir şeyi kaçırma", alt: "Bölümüne uygun yeni ilan çıkınca ya da becayiş mesajı gelince anında haberin olsun." },
  "becayis-mesaj": { baslik: "Becayiş eşini bul, hemen yaz", alt: "Talep sahipleriyle site içinden doğrudan mesajlaş." },
  "becayis-talep": { baslik: "Becayiş talebini yayımla", alt: "Talebin herkese açık listelensin, yer değiştirmek isteyenler sana ulaşsın." },
  "ozel-ilanlar": { baslik: "Sana özel ilanları gör", alt: "Bölümüne ve öğrenim düzeyine uygun ilanlar tek listede." },
  "tanitim-ilan": { baslik: "Yeni ilanı herkesten önce öğren", alt: "Bölümüne uygun ilan çıktığı an WhatsApp, e-posta ve site bildirimiyle haberin olsun." },
  "tanitim-kpss": { baslik: "KPSS'ye her gün daha güçlü hazırlan", alt: "Ders karnen, soru çözümlerin ve gelişimin tek ekranda." },
  "tanitim-becayis": { baslik: "Becayiş eşini bul, hemen yaz", alt: "Talebini yayımla, ilgilenenlerle site içinden mesajlaş." },
  "tanitim-proplus": { baslik: "Sınırsız hazırlığa geç", alt: "Sınırsız deneme, konu bazlı değerlendirme ve öncelikli destek." },
  bant: { baslik: "Kamu Yolu'nun tamamını aç", alt: "Bölümüne uygun ilanları ilk sen öğren, KPSS'ye her gün hazırlan." },
  kacirilan: { baslik: "Bir daha ilan kaçırma", alt: "Bölümüne uygun yeni ilan çıktığı an haberin olsun." },
  "ilan-takip": { baslik: "Son başvuru gününü kaçırma", alt: "Takip ettiğin ilanların son başvurusuna 3 gün ve 1 gün kala hatırlatalım." },
  "zayif-konu": { baslik: "Eksik konularını gör", alt: "Hangi konuda zayıf olduğunu ve önce neye çalışman gerektiğini konu konu gör." },
  seri: { baslik: "Serini koru", alt: "Pro'da ayda 2 seri dondurma hakkın olur: bir gün kaçırsan da serin bozulmaz." },
  "duyuru-takip": { baslik: "İlanı ilk sen öğren", alt: "Takip ettiğin kurumun ilanı yayımlandığı an haberin olsun." },
};

/** Karsilastirma satirlari: true = var, false = yok, metin = plana gore deger. */
export const KARSILASTIRMA: { ozellik: string; kaynak?: YukseltmeKaynagi; degerler: Record<Plan, boolean | string> }[] = [
  { ozellik: "Tüm ilanlar ve bölüme göre arama", degerler: { UCRETSIZ: true, PRO: true, PRO_PLUS: true } },
  { ozellik: "Haftalık KPSS denemesi", kaynak: "deneme-hakki", degerler: { UCRETSIZ: "1", PRO: "3", PRO_PLUS: "Sınırsız" } },
  { ozellik: "Ders karnesi ve soru çözümleri", kaynak: "rapor", degerler: { UCRETSIZ: false, PRO: true, PRO_PLUS: true } },
  { ozellik: "Konu bazlı değerlendirme ve gelişim", kaynak: "gelisim", degerler: { UCRETSIZ: false, PRO: false, PRO_PLUS: true } },
  { ozellik: "Kişisel bildirimler", kaynak: "bildirim", degerler: { UCRETSIZ: false, PRO: true, PRO_PLUS: true } },
  { ozellik: "WhatsApp ve e-posta ile anlık ilan bildirimi", kaynak: "whatsapp", degerler: { UCRETSIZ: false, PRO: true, PRO_PLUS: true } },
  { ozellik: "Becayiş talebi oluşturma", kaynak: "becayis-talep", degerler: { UCRETSIZ: false, PRO: true, PRO_PLUS: true } },
  { ozellik: "Becayiş mesajlaşması", kaynak: "becayis-mesaj", degerler: { UCRETSIZ: false, PRO: true, PRO_PLUS: true } },
  { ozellik: "Bana özel ilanlar", kaynak: "ozel-ilanlar", degerler: { UCRETSIZ: false, PRO: true, PRO_PLUS: true } },
  { ozellik: "İlan ve kurum takibinde hatırlatma", kaynak: "duyuru-takip", degerler: { UCRETSIZ: false, PRO: true, PRO_PLUS: true } },
  { ozellik: "Seri dondurma (ayda 2)", kaynak: "seri", degerler: { UCRETSIZ: false, PRO: true, PRO_PLUS: true } },
  { ozellik: "Öncelikli destek", degerler: { UCRETSIZ: false, PRO: false, PRO_PLUS: true } },
];

export const YUKSELTME_KAYNAKLARI = Object.keys(KAYNAK_METNI) as YukseltmeKaynagi[];

// Sitedeki src/lib/planlar.ts (yukseltme penceresi metinleri ve fiyat yardimcilari).
import type { Plan } from "@/lib/kpss";

export type UcretliPlan = "PRO" | "PRO_PLUS";
export type DonemFiyati = { liste: number; odenecek: number; etiket: string | null };
export type FiyatTablosu = Record<UcretliPlan, Record<"aylik" | "yillik", DonemFiyati>>;

export const PLAN_ADI: Record<Plan, string> = { UCRETSIZ: "Standart", PRO: "Pro", PRO_PLUS: "Pro+" };

// Sitedeki TICARI_ILETI_ACIK ile ayni: IYS kaydina kadar kampanya/duyuru onayi istenmez (Ticari Ileti Yon. m.7/11).
export const TICARI_ILETI_ACIK = false;

export const tl = (n: number) => `${n.toLocaleString("tr-TR", Number.isInteger(n) ? {} : { minimumFractionDigits: 2, maximumFractionDigits: 2 })} TL`;
export const yillikTasarruf = (f: Record<"aylik" | "yillik", DonemFiyati>) => Math.max(0, Math.round((1 - f.yillik.odenecek / (f.aylik.odenecek * 12)) * 100));
export const yillikBedavaAy = (t: FiyatTablosu) =>
  Math.max(0, Math.floor(Math.min(...(["PRO", "PRO_PLUS"] as const).map((p) => 12 - t[p].yillik.odenecek / t[p].aylik.odenecek))));
export const kalanSureMetni = (ms: number) =>
  ms >= 86_400_000 ? `${Math.ceil(ms / 86_400_000)} gün kaldı` : ms >= 3_600_000 ? `${Math.ceil(ms / 3_600_000)} saat kaldı` : "son saatler";

export const KAYNAK_METNI: Record<string, { baslik: string; alt: string }> = {
  genel: { baslik: "Kamu Yolu'nun tamamını aç", alt: "Bölümüne uygun ilanları ilk sen öğren, KPSS'ye her gün hazırlan." },
  rapor: { baslik: "Ders karneni ve çözümleri aç", alt: "Her dersteki netini ve her sorunun doğru cevabını, açıklamasıyla gör." },
  gelisim: { baslik: "Konu konu nerede olduğunu gör", alt: "Hangi konuyu çalışman gerektiğini ve önceki denemene göre gelişimini adım adım izle." },
  "deneme-hakki": { baslik: "Bu hafta durma, çözmeye devam et", alt: "Haftalık hakkın doldu; yükselt, KPSS hazırlığın yarıda kalmasın." },
  whatsapp: { baslik: "Yeni ilanı herkesten önce öğren", alt: "Bölümüne uygun ilan çıktığı an WhatsApp'tan mesaj gelsin." },
  bildirim: { baslik: "Önemli hiçbir şeyi kaçırma", alt: "Bölümüne uygun yeni ilan çıkınca ya da becayiş mesajı gelince anında haberin olsun." },
  "becayis-mesaj": { baslik: "Becayiş eşini bul, hemen yaz", alt: "Talep sahipleriyle site içinden doğrudan mesajlaş." },
  "becayis-talep": { baslik: "Becayiş talebini yayımla", alt: "Talebin herkese açık listelensin, yer değiştirmek isteyenler sana ulaşsın." },
  "ozel-ilanlar": { baslik: "Sana özel ilanları gör", alt: "Bölümüne ve öğrenim düzeyine uygun ilanlar tek listede." },
  bant: { baslik: "Kamu Yolu'nun tamamını aç", alt: "Bölümüne uygun ilanları ilk sen öğren, KPSS'ye her gün hazırlan." },
  kacirilan: { baslik: "Bir daha ilan kaçırma", alt: "Bölümüne uygun yeni ilan çıktığı an haberin olsun." },
  "ilan-takip": { baslik: "Son başvuru gününü kaçırma", alt: "Takip ettiğin ilanların son başvurusuna 3 gün ve 1 gün kala hatırlatalım." },
  "zayif-konu": { baslik: "Eksik konularını gör", alt: "Hangi konuda zayıf olduğunu ve önce neye çalışman gerektiğini konu konu gör." },
  seri: { baslik: "Serini koru", alt: "Pro'da ayda 2 seri dondurma hakkın olur: bir gün kaçırsan da serin bozulmaz." },
  "duyuru-takip": { baslik: "İlanı ilk sen öğren", alt: "Takip ettiğin kurumun ilanı yayımlandığı an haberin olsun." },
};

export const KARSILASTIRMA: { ozellik: string; kaynak?: string; degerler: Record<Plan, boolean | string> }[] = [
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

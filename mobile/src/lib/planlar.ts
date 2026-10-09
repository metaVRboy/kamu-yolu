// Sitedeki src/lib/planlar.ts (yukseltme penceresi metinleri ve fiyat yardimcilari).
import type { Plan } from "@/lib/kpss";

export type UcretliPlan = "PRO" | "PRO_PLUS";
export type DonemFiyati = { liste: number; odenecek: number; etiket: string | null };
export type FiyatTablosu = Record<UcretliPlan, Record<"aylik" | "yillik", DonemFiyati>>;

export const PLAN_ADI: Record<Plan, string> = { UCRETSIZ: "Standart", PRO: "Pro", PRO_PLUS: "Pro+" };

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
  sms: { baslik: "Yeni ilanı herkesten önce öğren", alt: "Bölümüne uygun ilan çıktığı an telefonuna SMS gelsin." },
  bildirim: { baslik: "Önemli hiçbir şeyi kaçırma", alt: "Bölümüne uygun yeni ilan çıkınca ya da becayiş mesajı gelince anında haberin olsun." },
  "becayis-mesaj": { baslik: "Becayiş eşini bul, hemen yaz", alt: "Talep sahipleriyle site içinden doğrudan mesajlaş." },
  "becayis-talep": { baslik: "Becayiş talebini yayımla", alt: "Talebin herkese açık listelensin, yer değiştirmek isteyenler sana ulaşsın." },
  "ozel-ilanlar": { baslik: "Sana özel ilanları gör", alt: "Bölümüne ve öğrenim düzeyine uygun ilanlar tek listede." },
  reklamsiz: { baslik: "Reklamsız, odaklı bir deneyim", alt: "Hiç reklam görmeden ilanlara ve denemelere odaklan." },
};

export const KARSILASTIRMA: { ozellik: string; kaynak?: string; degerler: Record<Plan, boolean | string> }[] = [
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

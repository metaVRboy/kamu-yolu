// Istemci bilesenleri de kullanir (ornek mesaj): prisma iceren whatsapp.ts'ten ayri.

// WhatsApp yalniz kisiye ozel ilan + becayis bildirimi (kullanici karari 2026-10-22); DOGRULAMA numara icin sart.
export type MesajTuru = "DOGRULAMA" | "ILAN" | "BECAYIS";

/**
 * Meta onayli WhatsApp sablonlari (isletme baslatan mesaj serbest metin olamaz). scripts/whatsappKurulum.ts
 * bunlari Meta'da olusturur; `govde` hem sablon metni hem kayitta/test modunda gosterilen acik metin.
 * Fayda (UTILITY) sablonlarinda tek dinamik URL butonu var: SITE_URL/{{1}}, gonderirken `yol` verilir.
 * Kurallar: degisken govdenin basinda/sonunda olamaz; degerde satir sonu olamaz (degerTemizle).
 */
export const SABLONLAR = {
  // Dogrulama govdesini Meta hazir verir (kod + guvenlik uyarisi); buradaki yalniz kayit/test metni.
  DOGRULAMA: { ad: "kamuyolu_dogrulama", kategori: "AUTHENTICATION", govde: "{{1}} doğrulama kodunuzdur. Güvenliğiniz için bu kodu kimseyle paylaşmayın.", ornek: ["123456"] },
  // Ilk surum (kamuyolu_yeni_ilan, "Sana ozel ilanlarin...") Meta'ca PAZARLAMA sayildi (~10 kat pahali, siklik siniri,
  // ticari ileti riski). Bu surum kullanicinin actigi bildirimin islemsel bildirimi: bolum adi + kapatma yolu.
  ILAN: {
    ad: "kamuyolu_ilan_bildirimi",
    kategori: "UTILITY",
    govde: "Kamu Yolu ilan bildirimin: Takip ettiğin {{1}} bölümüne uygun {{2}} yeni ilan eklendi. Bu bildirimi hesap ayarlarından istediğin zaman kapatabilirsin.",
    ornek: ["Hemşirelik", "3"],
    buton: { metin: "İlanları gör", ornekYol: "profilim" },
  },
  BECAYIS: {
    ad: "kamuyolu_becayis_mesaji",
    kategori: "UTILITY",
    govde: "Becayiş talebinle ilgili yeni bir mesajın var. Yanıtlamak için Kamu Yolu'na gir.",
    ornek: [],
    buton: { metin: "Mesajı gör", ornekYol: "becayis/taleplerim" },
  },
} as const;

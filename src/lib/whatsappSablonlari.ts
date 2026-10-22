// Istemci bilesenleri de kullanir (ornek mesaj): prisma iceren whatsapp.ts'ten ayri.

// WhatsApp yalniz kisiye ozel ilan + becayis bildirimi (kullanici karari 2026-10-22); DOGRULAMA numara icin sart.
export type MesajTuru = "DOGRULAMA" | "ILAN" | "BECAYIS";

/**
 * Meta onayli WhatsApp sablonlari (isletme baslatan mesaj serbest metin olamaz). scripts/whatsappSablonlari.ts
 * bunlari Meta'da olusturur; `govde` hem sablon metni hem kayitta/test modunda gosterilen acik metin.
 * Fayda (UTILITY) sablonlarinda tek dinamik URL butonu var: SITE_URL/{{1}}, gonderirken `yol` verilir.
 * Kurallar: degisken govdenin basinda/sonunda olamaz; degerde satir sonu olamaz (degerTemizle).
 */
export const SABLONLAR = {
  // Dogrulama govdesini Meta hazir verir (kod + guvenlik uyarisi); buradaki yalniz kayit/test metni.
  DOGRULAMA: { ad: "kamuyolu_dogrulama", kategori: "AUTHENTICATION", govde: "{{1}} doğrulama kodunuzdur. Güvenliğiniz için bu kodu kimseyle paylaşmayın.", ornek: ["123456"] },
  ILAN: {
    ad: "kamuyolu_yeni_ilan",
    kategori: "UTILITY",
    govde: "Bölümüne uygun {{1}} yeni kamu ilanı yayımlandı. Sana özel ilanların Kamu Yolu profilinde.",
    ornek: ["3"],
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

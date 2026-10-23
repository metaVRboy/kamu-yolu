// Istemci bilesenleri de kullanir (ornek mesaj): prisma iceren whatsapp.ts'ten ayri.

// WhatsApp: yeni ilan bildirimi + takip edilen ilanin son basvuru hatirlatmasi + becayis mesaji; DOGRULAMA numara icin.
export type MesajTuru = "DOGRULAMA" | "ILAN" | "HATIRLATMA" | "BECAYIS";

/**
 * Meta onayli WhatsApp sablonlari (isletme baslatan mesaj serbest metin olamaz). scripts/whatsappKurulum.ts
 * bunlari Meta'da olusturur; `govde` hem sablon metni hem kayitta/test modunda gosterilen acik metin.
 * Fayda (UTILITY) sablonlarinda tek dinamik URL butonu var: SITE_URL/{{1}}, gonderirken `yol` verilir.
 * Kurallar: degisken govdenin basinda/sonunda olamaz; degerde satir sonu olamaz (degerTemizle).
 */
export const SABLONLAR = {
  // Dogrulama govdesini Meta hazir verir (kod + guvenlik uyarisi); buradaki yalniz kayit/test metni.
  DOGRULAMA: { ad: "kamuyolu_dogrulama", kategori: "AUTHENTICATION", govde: "{{1}} doğrulama kodunuzdur. Güvenliğiniz için bu kodu kimseyle paylaşmayın.", ornek: ["123456"] },
  // Kullanici karari: pazarlama OLMAYACAK, fayda (bilgilendirme). Meta iki metni pazarlama saydi (2026-10-23); bu ucuncu
  // metin "talebin uzerine" ile basliyor. Meta yine pazarlama derse gonderilmez: ilan-bildirimi sablonun Meta'daki
  // turunu sorar, UTILITY + APPROVED degilse WhatsApp atlanir (e-posta + site devam).
  ILAN: {
    ad: "kamuyolu_yeni_ilan_bildirimi",
    kategori: "UTILITY",
    govde: "Merhaba {{1}}, talebin üzerine Kamu Yolu ilan bildirimini gönderiyoruz: Takip ettiğin {{2}} bölümüne uygun {{3}} yeni ilan eklendi. Bu bildirimi hesap ayarlarından istediğin zaman kapatabilirsin.",
    ornek: ["Ayşe", "Hemşirelik", "3"],
    buton: { metin: "İlanları gör", ornekYol: "profilim" },
  },
  // Hesaba ozel hatirlatma (Meta'nin fayda ornegi: "odemeniz su tarihte..." hatirlatmasina benzer); yeni icerik duyurmaz.
  HATIRLATMA: {
    ad: "kamuyolu_son_basvuru_hatirlatma",
    kategori: "UTILITY",
    govde: "Hatırlatma: Kamu Yolu'nda takip ettiğin \"{{1}}\" ilanının son başvuru tarihi {{2}}. Kalan süre: {{3}} gün.",
    ornek: ["Sağlık Bakanlığı Sözleşmeli Personel Alımı", "26 Ekim 2026", "3"],
    buton: { metin: "İlana git", ornekYol: "ilan/ornek" },
  },
  BECAYIS: {
    ad: "kamuyolu_becayis_mesaji",
    kategori: "UTILITY",
    govde: "Becayiş talebinle ilgili yeni bir mesajın var. Yanıtlamak için Kamu Yolu'na gir.",
    ornek: [],
    buton: { metin: "Mesajı gör", ornekYol: "becayis/taleplerim" },
  },
} as const;

import { prisma } from "@/lib/prisma";

/** Kayit turleri ve panelde gorunen adlari. Anahtarin "kategori." oneki filtrelemede kullanilir. */
export const ISLEM_ADI = {
  "bildirim.yayinla": "Bildirim yayınladı",
  "bildirim.geri-cek": "Bildirimi geri çekti",
  "bildirim.sil": "Bildirimi sildi",
  "fiyat.guncelle": "Fiyatları güncelledi",
  "kampanya.olustur": "Kampanya oluşturdu",
  "kampanya.durum": "Kampanyayı açtı/kapattı",
  "kampanya.sil": "Kampanyayı sildi",
  "uye.plan": "Üye planını değiştirdi",
  "uye.askiya-al": "Üyeyi askıya aldı",
  "uye.askidan-cikar": "Üyeyi askıdan çıkardı",
  "uye.oturumlari-kapat": "Üyenin oturumlarını kapattı",
  "uye.admin": "Admin yetkisini değiştirdi",
  "ilan.ekle": "Elle ilan ekledi",
  "ilan.duzenle": "İlanı düzenledi",
  "ilan.gizle": "İlanı gizledi",
  "ilan.goster": "İlanı yeniden gösterdi",
  "ilan.taramaya-birak": "İlanı taramaya bıraktı",
  "eslestirme.ifade-ekle": "Eşleştirme ifadesi ekledi",
  "eslestirme.ifade-sil": "Eşleştirme ifadesi sildi",
  "eslestirme.bolum-ekle": "Yeni bölüm ekledi",
  "haber.ekle": "Haber ekledi",
  "haber.duzenle": "Haberi düzenledi",
  "haber.sil": "Haberi sildi",
  "tarama.calistir": "Taramayı elle çalıştırdı",
  "becayis.talep-kaldir": "Becayiş talebini yayından kaldırdı",
  "becayis.talep-sil": "Becayiş talebini sildi",
  "becayis.mesaj-sil": "Şikayet edilen mesajı sildi",
  "becayis.sikayet-yoksay": "Mesaj şikayetini yok saydı",
  "kpss.soru-duzenle": "KPSS sorusunu düzeltti",
  "kpss.bildirim-coz": "Soru hata bildirimini kapattı",
  "destek.yanitla": "Destek mesajını yanıtladı",
  "destek.kapat": "Destek mesajını kapattı",
  "ayar.guncelle": "Site ayarlarını güncelledi",
} as const;
export type IslemTuru = keyof typeof ISLEM_ADI;

/**
 * Admin isleminin kaydi. Kayit yazilamazsa asil islem geri alinmaz (yalniz loglanir):
 * yonetim islemini kayit tablosundaki bir sorun yuzunden durdurmak daha kotu.
 */
export async function islemKaydet(admin: { id: string; adSoyad: string }, islem: IslemTuru, hedef?: string, link?: string) {
  try {
    await prisma.adminIslem.create({ data: { adminId: admin.id, adminAdi: admin.adSoyad, islem, hedef: hedef?.slice(0, 300), link } });
  } catch (err) {
    console.error("Admin işlem kaydı yazılamadı:", err);
  }
}

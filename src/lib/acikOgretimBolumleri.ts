import { normalize } from "@/lib/matching";

/**
 * Anadolu Universitesi Acikogretim Fakultesi'nin güncel lisans/onlisans
 * program listesi (anadolu.edu.tr/acikogretim/turkiye-programlari) -
 * baska bir universitenin veya ozel/vakif acikogretiminin degil, SADECE
 * bu resmi/bilinen listedeki bolumler icin "Evet" denir; listede olmayan
 * bir bolum icin kesin "Hayir" iddia etmek yerine "bilinmiyor" donulur.
 */
const ACIK_OGRETIM_BOLUMLERI = [
  // Onlisans
  "Acil Durum ve Afet Yönetimi",
  "Aşçılık",
  "Bankacılık ve Sigortacılık",
  "Bilgisayar Programcılığı",
  "Büro Yönetimi ve Yönetici Asistanlığı",
  "Coğrafi Bilgi Sistemleri",
  "Dış Ticaret",
  "Emlak Yönetimi",
  "Engelli Bakımı ve Rehabilitasyon",
  "Fotoğrafçılık ve Kameramanlık",
  "Halkla İlişkiler ve Tanıtım",
  "İlahiyat",
  "İnsan Kaynakları Yönetimi",
  "İşletme Yönetimi",
  "Kültürel Miras ve Turizm",
  "Lojistik",
  "Marka İletişimi",
  "Medya ve İletişim",
  "Muhasebe ve Vergi Uygulamaları",
  "Sağlık Kurumları İşletmeciliği",
  "Sosyal Hizmetler",
  "Sosyal Medya Yöneticiliği",
  "Tarım Teknolojisi",
  "Tıbbi Dokümantasyon ve Sekreterlik",
  "Turizm ve Otel İşletmeciliği",
  "Veri Görselleştirme ve Bilgi Tasarımı",
  "Yapay Zeka Destekli Kodlama",
  "Yaşlı Bakımı",
  "Web Tasarımı ve Kodlama",
  // Lisans
  "Çalışma Ekonomisi ve Endüstri İlişkileri",
  "Felsefe",
  "Görsel İletişim Tasarımı",
  "Havacılık Yönetimi",
  "Halkla İlişkiler ve Reklamcılık",
  "İktisat",
  "İşletme",
  "Maliye",
  "Sağlık Yönetimi",
  "Sosyoloji",
  "Siyaset Bilimi ve Kamu Yönetimi",
  "Tarih",
  "Türk Dili ve Edebiyatı",
  "Uluslararası İlişkiler",
  "Uluslararası Ticaret ve Lojistik",
  "Yönetim Bilişim Sistemleri",
].map(normalize);

export function acikOgretimdeVarMi(bolumAdi: string): boolean {
  const norm = normalize(bolumAdi);
  return ACIK_OGRETIM_BOLUMLERI.some((a) => norm === a || norm.includes(a) || a.includes(norm));
}

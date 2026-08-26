// KPSS Puan Hesaplama Araci icin sabit yapi tanimlari.
// Puan turu basliklari, alan/ders isimleri ve soru sayilari kullanicinin
// paylastigi referans goruntulerden birebir alinmistir; bu isimler ve
// sayilar kullanicidan gizli/degistirilemez sekilde sabittir.

export type PuanTuruId = "LISANS" | "OABT" | "ONLISANS" | "ORTAOGRETIM" | "DHBT";

export type FieldConfig = {
  key: string;
  label: string;
  totalQuestions: number;
  required?: boolean;
};

export type PuanTuruConfig = {
  id: PuanTuruId;
  label: string;
  subtitle: string;
  hasYearSelect: boolean;
  hasAlanSelect: boolean;
  hasLevelSelect: boolean;
  fields: FieldConfig[];
  singleScoreField?: { key: string; label: string; hint: string };
};

export const SINAV_YILLARI = ["2025 KPSS", "2024 KPSS", "2023 KPSS"];

export const OABT_ALAN_SECENEKLERI = [
  "Alan Bilgisi Testine Girmedim",
  "Türkçe Öğretmenliği",
  "Matematik Öğretmenliği",
  "Fen Bilimleri Öğretmenliği",
  "Sosyal Bilgiler Öğretmenliği",
  "Sınıf Öğretmenliği",
  "Okul Öncesi Öğretmenliği",
  "İngilizce Öğretmenliği",
  "Rehberlik",
];

export const DHBT_DUZEY_SECENEKLERI = [
  { value: "P122", label: "Ortaöğretim (P122)" },
  { value: "P123", label: "Önlisans (P123)" },
  { value: "P124", label: "Lisans (P124)" },
];

export const PUAN_TURLERI: PuanTuruConfig[] = [
  {
    id: "LISANS",
    label: "Lisans",
    subtitle: "(P1 - P48)",
    hasYearSelect: true,
    hasAlanSelect: false,
    hasLevelSelect: false,
    fields: [
      { key: "gy", label: "Genel Yetenek", totalQuestions: 60, required: true },
      { key: "gk", label: "Genel Kültür", totalQuestions: 60, required: true },
      { key: "hukuk", label: "Hukuk", totalQuestions: 40 },
      { key: "iktisat", label: "İktisat", totalQuestions: 40 },
      { key: "isletme", label: "İşletme", totalQuestions: 40 },
      { key: "maliye", label: "Maliye", totalQuestions: 40 },
      { key: "muhasebe", label: "Muhasebe", totalQuestions: 40 },
      { key: "calisma_ekonomisi", label: "Çalışma Ekonomisi", totalQuestions: 40 },
      { key: "istatistik", label: "İstatistik", totalQuestions: 40 },
      { key: "kamu_yonetimi", label: "Kamu Yönetimi", totalQuestions: 40 },
      { key: "uluslararasi_iliskiler", label: "Uluslararası İlişkiler", totalQuestions: 40 },
    ],
  },
  {
    id: "OABT",
    label: "Öğretmenlik (ÖABT)",
    subtitle: "(P10, P120, P121)",
    hasYearSelect: true,
    hasAlanSelect: true,
    hasLevelSelect: false,
    fields: [
      { key: "gy", label: "Genel Yetenek", totalQuestions: 60, required: true },
      { key: "gk", label: "Genel Kültür", totalQuestions: 60, required: true },
      { key: "egitim_bilimleri", label: "Eğitim Bilimleri", totalQuestions: 80, required: true },
    ],
    singleScoreField: {
      key: "yds",
      label: "YDS",
      hint: "Varsa 100 üzerinden yabancı dil puanınızı giriniz",
    },
  },
  {
    id: "ONLISANS",
    label: "Önlisans",
    subtitle: "(P93)",
    hasYearSelect: false,
    hasAlanSelect: false,
    hasLevelSelect: false,
    fields: [
      { key: "gy", label: "Genel Yetenek", totalQuestions: 60, required: true },
      { key: "gk", label: "Genel Kültür", totalQuestions: 60, required: true },
    ],
  },
  {
    id: "ORTAOGRETIM",
    label: "Ortaöğretim",
    subtitle: "(P94)",
    hasYearSelect: false,
    hasAlanSelect: false,
    hasLevelSelect: false,
    fields: [
      { key: "gy", label: "Genel Yetenek", totalQuestions: 60, required: true },
      { key: "gk", label: "Genel Kültür", totalQuestions: 60, required: true },
    ],
  },
  {
    id: "DHBT",
    label: "Din Hizmetleri (DHBT)",
    subtitle: "(P122, P123, P124)",
    hasYearSelect: false,
    hasAlanSelect: false,
    hasLevelSelect: true,
    fields: [
      { key: "gy", label: "Genel Yetenek", totalQuestions: 60, required: true },
      { key: "gk", label: "Genel Kültür", totalQuestions: 60, required: true },
      { key: "dhbt1", label: "DHBT-1", totalQuestions: 20, required: true },
      { key: "dhbt2", label: "DHBT-2", totalQuestions: 20, required: true },
    ],
  },
];

export function netOf(correct: string, wrong: string): number {
  const c = Number(correct) || 0;
  const w = Number(wrong) || 0;
  return Math.max(0, c - w / 4);
}

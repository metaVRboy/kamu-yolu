import type { DenemeDers, EducationLevel } from "@/generated/prisma/client";

/**
 * Sabitler, client component'lerden de import edilebilsin diye
 * kpssDeneme.ts'ten (prisma/server-only kod icerir) AYRI bir dosyada.
 * Gercek KPSS formati (2026 ÖSYM kilavuzlari - Lisans/Onlisans/Ortaogretim
 * ucu de ayni yapida): 120 soru, 130 dakika.
 */
export const SINAV_SURESI_DK = 130;

export const DERS_DAGILIMI: Record<DenemeDers, number> = {
  TURKCE: 30,
  MATEMATIK: 30,
  TARIH: 27,
  COGRAFYA: 18,
  VATANDASLIK: 9,
  GUNCEL: 6,
};

// Gercek sinav kitapcigindaki sira: once Genel Yetenek (Turkce, Matematik),
// sonra Genel Kultur (Tarih, Cografya, Vatandaslik, Guncel).
export const DERS_SIRASI: DenemeDers[] = ["TURKCE", "MATEMATIK", "TARIH", "COGRAFYA", "VATANDASLIK", "GUNCEL"];

export const TOPLAM_SORU = Object.values(DERS_DAGILIMI).reduce((a, b) => a + b, 0);

export const DERS_LABEL: Record<DenemeDers, string> = {
  TURKCE: "Türkçe",
  MATEMATIK: "Matematik",
  TARIH: "Tarih",
  COGRAFYA: "Coğrafya",
  VATANDASLIK: "Vatandaşlık",
  GUNCEL: "Güncel Bilgiler",
};

// KPSS'de "Ortaogretim" diye gecer (gundelik dilde "Lise" denir ama resmi
// ad budur) - EducationLevel.LISE degerini bu ozellikte hep bu etiketle gosteriyoruz.
export const DUZEY_LABEL: Record<EducationLevel, string> = {
  ILKOGRETIM: "İlköğretim",
  LISE: "Ortaöğretim",
  ONLISANS: "Önlisans",
  LISANS: "Lisans",
  YUKSEK_LISANS: "Yüksek Lisans",
};

export const DENEME_DUZEYLERI: EducationLevel[] = ["LISE", "ONLISANS", "LISANS"];

export function gecerliDenemeDuzeyiMi(deger: string): deger is EducationLevel {
  return (DENEME_DUZEYLERI as string[]).includes(deger);
}

export type ExamSoru = { id: string; ders: DenemeDers; soruMetni: string; secenekler: string[] };

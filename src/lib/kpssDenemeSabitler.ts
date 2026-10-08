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

/**
 * Deneme sayfalarinda her duzeyin kendi renk tonu (site genelindeki duzey
 * renkleriyle ayni aile): Ortaogretim yesil-turkuaz, Onlisans gok mavisi, Lisans mor.
 */
export const DUZEY_TEMA = {
  LISE: { zemin: "from-emerald-500 to-teal-600", acik: "bg-emerald-50", metin: "text-emerald-700", kenar: "border-emerald-200", buton: "bg-emerald-600 hover:bg-emerald-700" },
  ONLISANS: { zemin: "from-sky-500 to-blue-600", acik: "bg-sky-50", metin: "text-sky-700", kenar: "border-sky-200", buton: "bg-sky-600 hover:bg-sky-700" },
  LISANS: { zemin: "from-violet-500 to-indigo-600", acik: "bg-violet-50", metin: "text-violet-700", kenar: "border-violet-200", buton: "bg-violet-600 hover:bg-violet-700" },
} as const satisfies Partial<Record<EducationLevel, Record<string, string>>>;

export type DenemeDuzeyi = keyof typeof DUZEY_TEMA;

/** Ders basina onerilen sure: 130 dakikanin soru sayisina orani (toplam 130). */
export const ONERILEN_SURE_DK: Record<DenemeDers, number> = {
  TURKCE: 32,
  MATEMATIK: 33,
  TARIH: 29,
  COGRAFYA: 19,
  VATANDASLIK: 10,
  GUNCEL: 7,
};

/** Derslerin sabit renkleri (sinav sonu karnesi ve ders dagilimi seridi). */
export const DERS_RENGI: Record<DenemeDers, string> = {
  TURKCE: "bg-rose-500",
  MATEMATIK: "bg-blue-500",
  TARIH: "bg-amber-500",
  COGRAFYA: "bg-emerald-500",
  VATANDASLIK: "bg-violet-500",
  GUNCEL: "bg-slate-500",
};

export function gecerliDenemeDuzeyiMi(deger: string): deger is EducationLevel {
  return (DENEME_DUZEYLERI as string[]).includes(deger);
}

export type ExamSoru = {
  id: string;
  ders: DenemeDers;
  soruMetni: string;
  // Ortak metinli (bir parca + birden fazla soru) bloklarda kardes sorular
  // ayni grupId'yi paylasir; "X-Y. sorular..." basligi METNE GOMULU DEGIL,
  // bu alan uzerinden gunun GERCEK soru sirasina gore dinamik hesaplanir.
  grupId: string | null;
  geometri: boolean;
  gorselSvg: string | null;
  secenekler: string[];
};

/**
 * Ortak metinli bir sorunun metni "ortak parca\n\nasil soru" seklinde
 * saklanir - numara SADECE son (asil soru) satirina eklenir, paylasilan
 * parcaya degil.
 */
export function soruMetniNumarali(soruMetni: string, numara: number): string {
  const parcalar = soruMetni.split("\n\n");
  const sonIndeks = parcalar.length - 1;
  parcalar[sonIndeks] = `${numara}. ${parcalar[sonIndeks]}`;
  return parcalar.join("\n\n");
}

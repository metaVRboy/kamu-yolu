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

export type ExamSoru = {
  id: string;
  ders: DenemeDers;
  soruMetni: string;
  // Ortak metinli (bir parca + birden fazla soru) bloklarda kardes sorular
  // ayni grupId'yi paylasir; "X-Y. sorular..." basligi METNE GOMULU DEGIL,
  // bu alan uzerinden gunun GERCEK soru sirasina gore dinamik hesaplanir.
  grupId: string | null;
  gorselSvg: string | null;
  secenekler: string[];
};

/**
 * Bir sorunun, ayni grupId'yi paylasan kardesleri icindeki 1-indexli soru
 * numarasini ve grubun tam araligini ("52-53" gibi) hesaplar. grupId yoksa
 * null doner (tekil soru, grup basligi gosterilmez).
 */
export type GrupAraligi = { bu: number; ilk: number; son: number };

export function grupAraligiHesapla(
  sorular: { id: string; grupId: string | null }[],
  soruId: string,
): GrupAraligi | null {
  const buIndeks = sorular.findIndex((s) => s.id === soruId);
  const grupId = sorular[buIndeks]?.grupId;
  if (!grupId) return null;
  const grupIndeksleri = sorular
    .map((s, i) => (s.grupId === grupId ? i : -1))
    .filter((i) => i >= 0);
  return {
    bu: buIndeks + 1,
    ilk: Math.min(...grupIndeksleri) + 1,
    son: Math.max(...grupIndeksleri) + 1,
  };
}

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

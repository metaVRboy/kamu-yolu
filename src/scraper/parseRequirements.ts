import { EducationLevel, InstitutionType } from "@/generated/prisma/enums";

/** Kariyer Kapisi ilan metinleri basit bir BBCode benzeri isaretleme kullanir. */
export function stripBbCode(text: string): string {
  return text
    .replace(/\[url=[^\]]*\]/gi, "")
    .replace(/\[\/?(justify|b|i|u|url|list)\]/gi, "")
    .replace(/\[\*\]/g, "- ")
    .replace(/\s+\n/g, "\n")
    .trim();
}

/**
 * Metinden ogrenim derecelerini kaba bir anahtar kelime eslesmesiyle cikarir.
 * Bu bir sezgiseldir; kesin olmayan durumlar ileride elle/daha iyi bir NLP ile
 * iyilestirilebilir.
 */
export function detectEducationLevels(rawText: string): EducationLevel[] {
  let text = rawText.toLocaleLowerCase("tr-TR");
  const levels: EducationLevel[] = [];

  if (/y[üu]ksek\s*lisans/.test(text)) {
    levels.push(EducationLevel.YUKSEK_LISANS);
    text = text.replace(/y[üu]ksek\s*lisans/g, "");
  }
  if (/[öo]n\s*lisans/.test(text)) {
    levels.push(EducationLevel.ONLISANS);
    text = text.replace(/[öo]n\s*lisans/g, "");
  }
  if (/\blisans\b/.test(text)) {
    levels.push(EducationLevel.LISANS);
  }
  if (/\blise\b|orta ?[öo]ğretim/.test(text)) {
    levels.push(EducationLevel.LISE);
  }
  if (/ilk[öo]ğretim|ilkokul|ortaokul/.test(text)) {
    levels.push(EducationLevel.ILKOGRETIM);
  }

  return levels;
}

// NOT: Kaynaktaki kurum adlari TAMAMEN BUYUK HARF ("ANKARA ÜNİVERSİTESİ").
// JS regex /i bayragi Turkce "İ" harfini dogru kucultmedigi icin
// (case-fold sonucu duz "i" ile eslesmiyor), once tr-TR locale ile kucult,
// sonra kucuk harfli desenlerle /i OLMADAN karsilastir.
const INSTITUTION_TYPE_PATTERNS: [RegExp, InstitutionType][] = [
  [/[üu]niversite/, InstitutionType.UNIVERSITE],
  [/bakanlığı$|bakanlığı /, InstitutionType.BAKANLIK],
  [/hastane|sağlık bilimleri|şehir hastanesi/, InstitutionType.HASTANE],
  [/belediye/, InstitutionType.BELEDIYE],
  [/m[üu]ze/, InstitutionType.MUZE],
  [/genel m[üu]d[üu]rl[üu]ğ[üu]|kurumu$|kurumu |başkanlığı$|başkanlığı /, InstitutionType.KIT],
];

export function detectInstitutionType(kurumAdi: string): InstitutionType {
  const normalized = kurumAdi.toLocaleLowerCase("tr-TR");
  for (const [pattern, type] of INSTITUTION_TYPE_PATTERNS) {
    if (pattern.test(normalized)) return type;
  }
  return InstitutionType.DIGER;
}

/**
 * Bilinen bir bolum adiyla eslesmeyen bir ilan metninin GERCEKTEN bolum
 * sarti tasimadigini (herkese acik oldugunu) anlamak icin kullanilir.
 * Sadece acikca "herhangi bir ... bolum/program/fakulte" turu genel ifadeler
 * veya cok kisa/salt ogrenim seviyesi belirten metinler "genel" sayilir.
 * Aksi halde (ör. "375 sayılı KHK eki (1) sayılı liste" gibi disarida bir
 * ek listeye atif yapan sozlesmeli bilisim personeli ilanlari) bolum sarti
 * olmadigini VARSAYMAK yanlis olur; bu yuzden "belirsiz" kabul edilip hicbir
 * bolume atanmaz (ama genel ilan akisindan gizlenmez).
 */
export function isGenericNoRestriction(text: string): boolean {
  const normalized = text.trim().toLocaleLowerCase("tr-TR");
  if (/herhangi\s+bir[^.]{0,60}(b[öo]l[üu]m|program|fak[üu]lte)/.test(normalized)) {
    return true;
  }
  if (/(d[öo]rt|4)\s*y[ıi]ll[ıi]k\s*fak[üu]ltelerin?\s*(herhangi|t[üu]m[üu]nde|hepsinde)/.test(normalized)) {
    return true;
  }
  // Sadece ogrenim seviyesini belirten cok kisa, ek sart icermeyen metinler
  if (normalized.length < 130 && /\b(lisans|[öo]nlisans|lise|ilk[öo]ğretim)\b/.test(normalized)) {
    return true;
  }
  return false;
}

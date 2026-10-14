import { EducationLevel, InstitutionType } from "@/generated/prisma/enums";
import { matchDepartmentsForText } from "@/lib/matching";

/**
 * Kariyer Kapisi ilan metinleri BBCode benzeri isaretleme kullanir. Belirli
 * etiketleri tek tek listelemek yerine (yeni bir etiket turu - ör. [size=..],
 * [color=..] - cikinca tekrar kirilir), [tag], [/tag] ve [tag=deger]
 * bicimindeki HERHANGI bir etiketi genel olarak temizler.
 */
export function stripBbCode(text: string): string {
  return text
    .replace(/\[\*\]/g, "- ")
    .replace(/\[\/?[a-zA-Z0-9]+(?:=[^\]]*)?\]/g, "")
    // Bazi kaynaklarda etiketin acan koseli parantezi kayboluyor, geriye
    // "=14pt%" gibi anlamsiz bir kalinti kaliyor - bunu da temizle.
    .replace(/=\d+pt%?/g, "")
    .replace(/[ \t]+\n/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
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
  // Duzey yazilmamis ama KPSS puan turu var: P93 onlisans, P94 ortaogretim KPSS'sidir.
  if (!levels.length && /\bp\s?93\b/.test(text)) levels.push(EducationLevel.ONLISANS);
  if (!levels.length && /\bp\s?94\b/.test(text)) levels.push(EducationLevel.LISE);

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
  if (/herhangi\s+bir[^.]{0,60}(b[öo]l[üu]m|program|fak[üu]lte|alan)/.test(normalized)) {
    return true;
  }
  for (const cumle of normalized.split(/[.;\n]/)) {
    // "Lise veya dengi okul mezunu olmak", "En az ortaöğretim (lise) ve dengi okul mezunu" - alan/bolum adi gecmiyorsa.
    if (/(lise|orta\s*[öo]ğretim)[^.]{0,40}\b(ve|veya)\s+dengi\b[^.]{0,30}mezun/.test(cumle) && !/alan[ıi]n|b[öo]l[üu]m|dal[ıi]n|program/.test(cumle)) {
      return true;
    }
    // "Fakülte veya en az dört yıllık yüksekokul mezunu olmak"
    if (/fak[üu]lte\s+(veya|ya da)\s+(en az\s+)?(d[öo]rt|4)\s+y[ıi]ll[ıi]k\s+y[üu]ksekokul\s+mezun/.test(cumle)) {
      return true;
    }
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

/**
 * Ham ilan metnini egitim seviyesi + bolum sarti acisindan siniflandirir.
 * Isci ilanlarinin (daimi/gecici) metni genelde sadece basvuru prosedurunu
 * anlatir - egitim seviyesi/bolum bilgisi icermez (asil kriterler Iskur'un
 * kendi sisteminde). Bu turde toplu iscii kadrolari pratikte neredeyse
 * hicbir zaman bolume ozel degildir ve taban seviyesi genelde
 * ortaogretimdir - metin bosken LISANS/kisitli varsaymak yerine bu daha
 * gercekci varsayilanlar kullanilir. Kariyer Kapisi ve Memurlar.Net
 * scraper'lari tarafindan ortak kullanilir.
 */
export async function classifyRequirementText(
  requirementText: string,
  isciIlaniMi: boolean,
  // Metinde bolum yoksa ve genel ilan da degilse cagrilir: ana ilan metni + ek PDF/gorsel tablolar.
  ekMetinGetir?: () => Promise<string>,
) {
  const levels = detectEducationLevels(requirementText);
  const educationLevels = levels.length > 0 ? levels : [isciIlaniMi ? EducationLevel.LISE : EducationLevel.LISANS];

  // Isci ilanlarinda OSYM listesi aranmaz (metin genelde belge/kosul listesi, bolum sarti yok).
  const secenek = { seviyeler: educationLevels, osym: !isciIlaniMi };
  let matches = await matchDepartmentsForText(requirementText, secenek);
  if (matches.length > 0 || isciIlaniMi || isGenericNoRestriction(requirementText)) {
    return { educationLevels, isDepartmentRestricted: matches.length > 0, matches, ekMetin: undefined };
  }

  // undefined = bakilamadi (hata): kayittaki ekMetin degismez, sonraki taramada yeniden denenir.
  let ekMetin: string | undefined;
  try {
    ekMetin = await ekMetinGetir?.();
  } catch (err) {
    console.error("İlan eki okunamadı:", err);
  }
  if (ekMetin) matches = await matchDepartmentsForText(requirementText, { ...secenek, ekMetin });
  return { educationLevels, isDepartmentRestricted: true, matches, ekMetin };
}

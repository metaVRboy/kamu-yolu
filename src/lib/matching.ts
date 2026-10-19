import { unstable_cache } from "next/cache";
import { Prisma } from "@/generated/prisma/client";
import type { EducationLevel } from "@/generated/prisma/enums";
import { prisma } from "@/lib/prisma";
import { slugify } from "@/lib/slug";
import { ilanIlleri } from "@/lib/iller";
import { LEVEL_LABEL } from "@/lib/labels";

export type PostingWithDepartments = Awaited<
  ReturnType<typeof getPostingsForDepartment>
>[number];

export type PostingFilters = {
  institutionType?: string;
  ilanTuru?: string;
  il?: string;
  departmentRequirement?: "var" | "yok";
  kurumAdi?: string;
};

/**
 * Tum bolumler icin, getPostingsForDepartment ile AYNI kurala gore (SADECE
 * o bolume acikca eslesmis ilanlar) esleşen aktif ilan sayisini tek
 * seferde hesaplar. Her bolum icin ayri sorgu atmak yerine tum aktif
 * eslesmeleri bir kez cekip bellekte sayar.
 */
export async function getDepartmentPostingCounts(): Promise<Map<string, number>> {
  const eslesmeler = await prisma.postingDepartment.findMany({
    where: { posting: { isActive: true } },
    select: { departmentId: true },
  });

  const counts = new Map<string, number>();
  for (const e of eslesmeler) {
    counts.set(e.departmentId, (counts.get(e.departmentId) ?? 0) + 1);
  }
  return counts;
}

function buildFilterWhere(filters?: PostingFilters): Prisma.PostingWhereInput {
  const where: Prisma.PostingWhereInput = {};
  if (filters?.institutionType) {
    where.institutionType = filters.institutionType as Prisma.PostingWhereInput["institutionType"];
  }
  if (filters?.ilanTuru) {
    where.ilanTuru = filters.ilanTuru;
  }
  if (filters?.kurumAdi) {
    where.institutionName = filters.kurumAdi;
  }
  if (filters?.departmentRequirement === "var") {
    where.isDepartmentRestricted = true;
  } else if (filters?.departmentRequirement === "yok") {
    where.isDepartmentRestricted = false;
  }
  return where;
}

/**
 * Il filtresi: ham konum metni ilce/kurum adi icerebildigi icin ("ANKARA / ÇANKAYA") SQL'de degil,
 * metinden cikarilan resmi il adlarina gore uygulanir. Il adi gecmeyen ilanlar ("TÜRKİYE GENELİ") eslesmez.
 */
function ileGore<T extends { iller: string[] }>(ilanlar: T[], il?: string): T[] {
  return il ? ilanlar.filter((p) => ilanIlleri(p.iller).includes(il)) : ilanlar;
}

/**
 * Bir bolum icin gosterilecek ilanlari getirir: SADECE o bolume acikca
 * eslesmis (PostingDepartment) ilanlar. Bolum sarti olmayan genel ilanlar
 * kasitli olarak DAHIL EDILMEZ - "X bolumu" arandiginda sadece o bolumle
 * ilgili ilanlarin listelenmesi icin.
 */
export async function getPostingsForDepartment(
  departmentId: string,
  filters?: PostingFilters,
) {
  const postings = await prisma.posting.findMany({
    where: {
      isActive: true,
      ...buildFilterWhere(filters),
      departments: { some: { departmentId } },
    },
    orderBy: [{ applicationEnd: "asc" }, { publishedAt: "desc" }],
    include: { departments: { include: { department: true } } },
  });

  return ileGore(postings, filters?.il);
}

/** Bir bolumun (filtre uygulanmadan once) sonuc kumesindeki mevcut filtre secenekleri. */
export async function getAvailableFiltersForDepartment(departmentId: string) {
  const postings = await prisma.posting.findMany({
    where: {
      isActive: true,
      departments: { some: { departmentId } },
    },
    select: { institutionType: true, ilanTuru: true, iller: true },
  });

  return summarizeFilters(postings);
}

function summarizeFilters(
  postings: { institutionType: string; ilanTuru: string | null; iller: string[] }[],
) {
  const institutionTypes = new Set<string>();
  const ilanTurleri = new Set<string>();
  const iller = new Set<string>();

  for (const p of postings) {
    institutionTypes.add(p.institutionType);
    if (p.ilanTuru) ilanTurleri.add(p.ilanTuru);
    for (const il of ilanIlleri(p.iller)) iller.add(il);
  }

  return {
    institutionTypes: Array.from(institutionTypes).sort(),
    ilanTurleri: Array.from(ilanTurleri).sort(),
    iller: Array.from(iller).sort((a, b) => a.localeCompare(b, "tr")),
  };
}

/**
 * Belirli bir ogrenim derecesindeki TUM aktif ilanlari getirir (bolum
 * sarti olan/olmayan farketmez). Sohbet asistaninin ve /seviye/[level]
 * sayfasinin ortak kaynagi.
 */
export async function getPostingsForLevel(
  level: EducationLevel,
  filters?: PostingFilters,
) {
  const postings = await prisma.posting.findMany({
    where: {
      isActive: true,
      educationLevels: { has: level },
      ...buildFilterWhere(filters),
    },
    orderBy: [{ applicationEnd: "asc" }, { publishedAt: "desc" }],
  });
  return ileGore(postings, filters?.il);
}

export async function getAvailableFiltersForLevel(level: EducationLevel) {
  const postings = await prisma.posting.findMany({
    where: {
      isActive: true,
      educationLevels: { has: level },
    },
    select: { institutionType: true, ilanTuru: true, iller: true },
  });

  return summarizeFilters(postings);
}

/** Sistemdeki TUM aktif ilanlar - "Tum Ilanlar" sayfasinin kaynagi. */
export async function getAllActivePostings(filters?: PostingFilters) {
  const postings = await prisma.posting.findMany({
    where: {
      isActive: true,
      ...buildFilterWhere(filters),
    },
    orderBy: [{ applicationEnd: "asc" }, { publishedAt: "desc" }],
  });
  return ileGore(postings, filters?.il);
}

export async function getAvailableFiltersForAll() {
  const postings = await prisma.posting.findMany({
    where: { isActive: true },
    select: { institutionType: true, ilanTuru: true, iller: true },
  });

  return summarizeFilters(postings);
}

// Her sayfanin footer'inda gosterilir (layout): her istekte sorgulanmasin, 5 dk paylasilir.
// unstable_cache JSON'a cevirdigi icin tarih metin olarak saklanip geri Date yapilir.
const sonBasariliTarama = unstable_cache(
  async () =>
    (await prisma.scrapeRun.findFirst({ where: { status: "SUCCESS" }, orderBy: { finishedAt: "desc" }, select: { finishedAt: true } }))?.finishedAt?.toISOString() ??
    null,
  ["son-basarili-tarama"],
  { revalidate: 300 },
);

export async function getLastSuccessfulScrapeAt(): Promise<Date | null> {
  const t = await sonBasariliTarama();
  return t ? new Date(t) : null;
}

export async function getPostingById(id: string) {
  // Admin'in gizledigi ilan dogrudan URL ile de acilmaz (sayfa, mobil, takvim, uygunluk hepsi buradan).
  return prisma.posting.findUnique({
    where: { id, adminGizli: false },
    include: {
      departments: { include: { department: { select: { name: true, slug: true } } } },
    },
  });
}

export async function getLatestPostings(limit = 12) {
  return prisma.posting.findMany({
    where: { isActive: true },
    orderBy: { publishedAt: "desc" },
    take: limit,
  });
}

// Ana sayfa sayaclari: tum aktif ilanlari tarar; reklam trafiginde her ziyarette degil 5 dk'da bir.
export const getHomepageStats = unstable_cache(
  async () => {
    const [postingCount, institutionCount, departmentCount] = await Promise.all([
      prisma.posting.count({ where: { isActive: true } }),
      prisma.posting
        .findMany({ where: { isActive: true }, select: { institutionName: true }, distinct: ["institutionName"] })
        .then((rows) => rows.length),
      prisma.department.count(),
    ]);
    return { postingCount, institutionCount, departmentCount };
  },
  ["ana-sayfa-sayaclari"],
  { revalidate: 300 },
);

/**
 * Bir ilanin ham "aranan nitelikler" metnini, bilinen bolum adi/alias'lariyla
 * karsilastirip eslesen bolumleri dondurur. Scraper pipeline'i tarafindan
 * her yeni ilan kaydedilirken cagrilir.
 */
// "Tarih" hem bir bolum adi hem de gunluk dilde "tarih/gun" anlaminda cok
// yaygin bir kelime - "yayimlandigi tarih itibariyle", "belirtilen tarih
// itibariyla" gibi butun ilanlarda gecebilen burokratik kaliplarda "tarih"
// TEK BASINA bir kelime olarak gecer (whole-word kontrolu bunu ayirt
// edemez). Bu kaliplar eslestirmeden once maskeleniyor; "Tarih bolumu",
// "Tarih ogretmenligi" gibi gercek eslesmeler etkilenmez.
const YANLIS_POZITIF_KALIPLARI = [
  /\btarih\s+itibar\p{L}*\b/gu,
  // Takvim tablolari: "Sınav Tarihi", "Başvuru Tarih", "Tarih: 12.10.2026"
  /\b(basvuru|sınav|ilan|yayın|yayım|son|baslangıc|bitis|sozlu|yazılı|mulakat|teslim|kayıt)\s+tarih\p{L}*/gu,
  /\btarih\s*:/gu,
  // "son müracaat tarih ve saatinden", "31/12/2008 tarih ve 27097 sayılı", dilekçe "Tarih İmza", fakulte adi
  /\btarih\s+ve\s+(saat|yer|sayı|\d)\p{L}*/gu,
  /\btarih\s+imza/gu,
  /\bdil ve tarih-cografya/gu,
  // "belge kontrolünün tarih aralığı"; "Makine Öğrenimi, Derin Öğrenme" (yapay zeka deneyimi, Makine bolumu degil)
  /\btarih\s+aralı\p{L}*/gu,
  /\bmakine\s+ogren\p{L}*/gu,
];

function maskFalsePositiveIdioms(normalized: string): string {
  let result = normalized;
  for (const pattern of YANLIS_POZITIF_KALIPLARI) {
    result = result.replace(pattern, "");
  }
  return result;
}

// seviye dolu = OSYM kurallariyla aranir (OSYM listesindeki ad ya da OSYM'den eklenmis bolum).
// duzey: bolumun ogrenim duzeyi (sitedeki tum bolumlerde dolu); ilanin kesin duzeyi disindakiler eslesmez.
type Terim = { norm: string; etiket: string; departmentId?: string; seviye?: EducationLevel; duzey?: EducationLevel; osym?: { ad: string; aliases: string[] } };

// OSYM listesindeki bolum adi olmayan kayitlar ve ilan metinlerinde bolum disi anlamla sik gecen tek kelimeler
// ("İngilizce dilinden YDS", "vesikalık fotoğraf", "muhasebe, finans" deneyimi).
// "İdari Bilimler" ilanlarda hep "İktisadi ve İdari Bilimler Fakültesi" icinde gecer (fakulte adi, bolum degil).
// "Yazılım Geliştirme" ilanlarda deneyim alani olarak geciyor ("yazılım geliştirme, sistem yönetimi...").
const OSYM_GECERSIZ = new Set(["diger", "bilinmeyen", "alan ayrımı olmayanlar", "idari bilimler", "yazılım gelistirme"]);
const GENEL_TEK_KELIME = new Set([
  "bilgisayar", "elektronik", "bankacılık", "havacılık", "edebiyat", "iletisim", "girisimcilik", "beslenme", "fotograf", "muhasebe",
  "performans", "ingilizce", "almanca", "fransızca", "arapca", "rusca", "italyanca", "ispanyolca", "japonca", "korece", "farsca",
]);
// Ilan metninde OSYM adi ancak bir sayimin parcasiysa bolum sayilir ("A, B ve C bölümlerinden mezun"):
// "İngilizce dilinden", "Veteriner Hekim", "İdari Bilimler Fakültesi", "Adalet Bakanlığı" boylece elenir.
// "... Tıbbi ve Aromatik Bitkiler ön lisans programlarının": duzey kelimesi de sayimin devami.
const SAYIM_DEVAMI = String.raw`(?=\s?(,|;|/|\)|\||-|$)|\s(ve|veya|ya da|ile|bolum\p{L}*|program\p{L}*|anabilim|mezun\p{L}*|alan\p{L}*|on ?lisans|lisans)(?![\p{L}\p{N}]))`;
// Ana ilan metninde sitedeki bolumler mezuniyet cumlelerinde, OSYM adlari yalniz bolum/program cumlelerinde
// aranir ("alan" yok: "siber guvenlik alaninda 7 yil deneyim" bolum sayilmasin).
const GENIS_BAGLAM = /bolum|program|mezun|fakulte|yuksekokul|brans/;
// Lise: "Hasta ve Yaşlı Hizmetleri alanı ve dallarından", "Ortaöğretim kurumlarının İnşaat Teknolojisi alanından".
// "alan" yalniz ortaogretim/lise cumlesinde ("siber guvenlik alaninda deneyim" bolum sayilmaz).
const DAR_BAGLAM = /bolum|program|dal(ı|lar)|(ortaogretim|lise|meslek lisesi)[^|]*\balan/;
// Ek metinde PDF tablodan okunan kisim (satirlar bolum listesi; cumle filtresi uygulanmaz).
export const TABLO_ISARETI = "§TABLO§";

// "YDS'den en az (D)... Ancak İngilizce öğretim yapan fakülte, bilgisayar programcılığı alanında MYO mezunu olanlar..."
// gibi yabanci dil muafiyeti cumlelerindeki bolum adlari bolum sarti degildir (2026-10-19: lisans ilani
// Bilgisayar Programcılığı'na baglaniyordu).
const DIL_SINAVI = /\b(yds|e-yds|yokdil|toefl|ielts|kpds|uds)\b|yabancı dil/;
const MUAFIYET = /\bancak\b|muaf|aranmaz|aranmayacak|sayılır/;
export function dilMuafiyetiniCikar(metin: string): string {
  return metin
    .split(/(?<=[.;\n])/)
    .filter((c) => {
      const n = normalize(c);
      return !(DIL_SINAVI.test(n) && MUAFIYET.test(n));
    })
    .join("");
}

// Ciplak liste ogesi bir kelimeden fazla bolume genisliyorsa ust sinir (genel kelimeler: "fen", "turk"...).
const CIPLAK_EN_FAZLA = 12;
const CIPLAK_DISI = new Set(["muhendislik", "fakulte", "bilim", "bilimler", "fen", "turk", "dil", "sosyal", "uygulamalı", "temel", "genel", "ilgili", "diger", "benzer", "muadil", "dengi", "egitim", "ogretmenlik", "yukarıda", "belirtilen", "asagıda", "en az", "lisans", "onlisans"]);

/**
 * Bolum cumlesindeki mezuniyet sayiminin ("X, Y ve Z bölümlerinden mezun") eslesmemis ogeleri (1-3 kelime).
 * Yalniz "mezun" gecen cumlede, ekli "bölümlerinden/programlarından" oncesinde ve en az iki ogeli bir
 * sayimda ("çalışma programı", "eğitim programları" bolum listesi degil).
 */
// butun: "ve/ile" ile bolunmus parcanin tum obegi ("elektronik ve haberlesme"); obek bir bolum adinin
// basiysa parcalar yerine obek kullanilir ("Tıbbi ve Aromatik Bitkiler" -> "tıbbi" olmasin).
export function ciplakOgeler(cumle: string): { oge: string; muhendislik: boolean; butun?: string }[] {
  if (!/mezun/.test(cumle)) return [];
  const ogeler: { oge: string; muhendislik: boolean; butun?: string }[] = [];
  for (const m of cumle.matchAll(/([^|]*?)\b(bolum|program)(ler|lar|un|ın|in)\p{L}*/gu)) {
    const kapsam = m[1].split(/fakulte\p{L}*|yuksekokul\p{L}*|okul\p{L}*|:|\(/u).pop() ?? "";
    // "Mühendislik fakültelerinin elektrik, ... bölümleri": sayim dogrudan muhendislik fakultesine bagli.
    // "mühendislik ve fen edebiyat fakültelerinin" de sayilir.
    const muhendislik = /muhendislik(\s+(ve|ile)\s+[\p{L} -]{2,30})?\s+fakulte\p{L}*\s*$/u.test(m[1].slice(0, m[1].length - kapsam.length));
    const virgulle = kapsam.split(/,|;|\/|\bveya\b|\bya da\b/u);
    if (virgulle.length < 2 && !/\bve\b|\bile\b/u.test(kapsam)) continue;
    for (const parca of virgulle) {
      const temiz = (x: string) => x.replace(/\b(yuksek lisans|on ?lisans|lisans|lise)\b/gu, " ").replace(/\s+/g, " ").trim();
      const altlar = parca.split(/\bve\b|\bile\b/u);
      const butun = altlar.length > 1 ? temiz(parca) : undefined;
      for (const ham of altlar) {
        const oge = temiz(ham);
        if (/^[\p{L}-]+( [\p{L}-]+){0,2}$/u.test(oge) && oge.length >= 4 && !CIPLAK_DISI.has(oge)) ogeler.push({ oge, muhendislik, butun });
      }
    }
  }
  return ogeler;
}

/** Ilan duzeyi (yuksek lisans lisans sayilir); bolumun duzeyi bu kumede degilse eslesmez. */
const duzeyKumesi = (seviyeler?: EducationLevel[]) =>
  new Set<EducationLevel>(seviyeler?.map((s) => (s === "YUKSEK_LISANS" ? "LISANS" : s)));

function bolumCumleleri(metin: string, baglam: RegExp): string {
  return metin
    .split(/[.;\n•]+/)
    .map((c) => maskFalsePositiveIdioms(normalize(c)))
    .filter((c) => baglam.test(c))
    .join(" | ");
}

function osymTerimleri(ad: string, seviye: EducationLevel): string[] {
  const parcalar = ad.split(/\s+\/\s+/).map((p) => p.replace(/\([^)]*\)/g, " ").replace(/\s+/g, " ").trim());
  const varyantlar = new Set(parcalar);
  // Lise: "Adalet - İnfaz ve Koruma Dalı" -> alan ("Adalet") ve dal ("İnfaz ve Koruma") ayri ayri da aranir.
  if (seviye === "LISE") {
    for (const p of parcalar) {
      const m = p.match(/^(.+?)\s+-\s+(.+?)\s+Dalı$/iu);
      if (m) varyantlar.add(m[1]).add(m[2]);
    }
  }
  return [...varyantlar].filter((t) => {
    const n = normalize(t);
    if (OSYM_GECERSIZ.has(n)) return false;
    return n.includes(" ") ? n.length >= 6 : n.length >= 8 && !GENEL_TEK_KELIME.has(n);
  });
}

// Sozluk: sitedeki bolumler + ifadeleri + OSYM KPSS bolum listesi (KpssBolum). Tarama boyunca tekrar tekrar
// sorgulanmasin diye kisa sure bellekte tutulur; yeni bolum eklenince sifirlanir.
let sozlukOnbellek: { zaman: number; terimler: Terim[]; kisaAdlar: Terim[] } | null = null;

async function sozluk(): Promise<{ terimler: Terim[]; kisaAdlar: Terim[] }> {
  if (sozlukOnbellek && Date.now() - sozlukOnbellek.zaman < 5 * 60_000) return sozlukOnbellek;
  const [bolumler, ifadeler, osym] = await Promise.all([
    prisma.department.findMany({ select: { id: true, name: true, osym: true, level: true } }),
    prisma.departmentAlias.findMany({ select: { departmentId: true, alias: true, department: { select: { osym: true, level: true } } } }),
    prisma.kpssBolum.findMany({ select: { ad: true, ogrenimDuzeyi: true } }),
  ]);
  const terimler: Terim[] = [
    ...bolumler.map((d) => ({ norm: normalize(d.name), etiket: d.name, departmentId: d.id, seviye: d.osym ? d.level : undefined, duzey: d.level })),
    ...ifadeler.map((a) => ({ norm: normalize(a.alias), etiket: a.alias, departmentId: a.departmentId, seviye: a.department.osym ? a.department.level : undefined, duzey: a.department.level })),
  ];
  const kisa: Terim[] = [];
  for (const k of osym) {
    const seviye = k.ogrenimDuzeyi as EducationLevel;
    // Metinde tek basina aranmayan kisa/genel tek kelimelik OSYM adlari ("Resim", "Bilgisayar"): yalniz
    // ciplak liste ogesi tam bu adsa kullanilir.
    const ad0 = k.ad.split(/\s+\/\s+/)[0].replace(/\([^)]*\)/g, " ").replace(/\s+/g, " ").trim();
    const n0 = normalize(ad0);
    if (!n0.includes(" ") && !OSYM_GECERSIZ.has(n0) && (n0.length < 8 || GENEL_TEK_KELIME.has(n0))) {
      kisa.push({ norm: n0, etiket: ad0, seviye, osym: { ad: ad0, aliases: [] } });
    }
    const varyantlar = osymTerimleri(k.ad, seviye);
    for (const v of varyantlar) {
      // Lise alan/dal adi kendi basina bolum olur; diger duzeylerde ilk yazilis ad, digerleri ifade.
      const ad = seviye === "LISE" ? v : varyantlar[0];
      terimler.push({ norm: normalize(v), etiket: v, seviye, osym: { ad, aliases: varyantlar.filter((x) => x !== ad) } });
    }
  }
  // Uzun terim once (sitedeki bolum ayni uzunluktaki OSYM adindan once): eslesen kisim silinir,
  // icindeki kisa ad ("Makine Mühendisliği" icindeki "Makine") ayrica eslesmez.
  terimler.sort((a, b) => b.norm.length - a.norm.length || Number(!!a.osym) - Number(!!b.osym));
  sozlukOnbellek = { zaman: Date.now(), terimler, kisaAdlar: kisa };
  return sozlukOnbellek;
}

/** Terimi metinde tam kelime olarak bulur ve siler; bulamazsa null. sayim: yalniz bir sayimin parcasiysa. */
function bulVeSil(metin: string, terim: string, sayim = false): string | null {
  if (!metin.includes(terim)) return null;
  const escaped = terim.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const desen = new RegExp(`(?<![\\p{L}\\p{N}])${escaped}(?![\\p{L}\\p{N}])${sayim ? SAYIM_DEVAMI : ""}`, "gu");
  const yeni = metin.replace(desen, " ");
  return yeni === metin ? null : yeni;
}

/**
 * Ilan metnini (ve varsa ek metni: ana ilan metni ya da okunmus ek sayfalar + PDF tablolar) bolum
 * sozluguyle eslestirir. Sitedeki bolumler ilan metninin tamaminda, ana metnin bolum cumlelerinde ve
 * tablolarda aranir. OSYM listesi (osym: true) yalniz ilanin ogrenim duzeyinde, bolum cumlelerinde/tablolarda
 * ve bir sayimin parcasiysa sayilir; eslesen OSYM bolumu sitede yoksa eklenir.
 */
export async function matchDepartmentsForText(
  rawText: string,
  // seviyeler: OSYM adlari icin (tahmini varsayilan olabilir). seviyeKesin: duzey metinden okundu; sitedeki
  // bolumler de yalniz bu duzeylerde eslesir (varsayilan duzeyle elenmesinler).
  secenek: { seviyeler?: EducationLevel[]; seviyeKesin?: boolean; ekMetin?: string | null; osym?: boolean } = {},
) {
  const { terimler, kisaAdlar } = await sozluk();
  rawText = dilMuafiyetiniCikar(rawText);
  const [anaEkHam = "", ...tablolar] = (secenek.ekMetin ?? "").split(TABLO_ISARETI);
  const anaEk = dilMuafiyetiniCikar(anaEkHam);
  // Tablo satir sonu bir sayim siniri: "Gıda Mühendisliği\nKPSS P3" -> "gıda muhendisligi | kpss p3".
  const tablo = tablolar.map((t) => maskFalsePositiveIdioms(normalize(t.replace(/\n/g, " | ")))).join(" | ");
  let tum = [maskFalsePositiveIdioms(normalize(rawText)), bolumCumleleri(anaEk, GENIS_BAGLAM), tablo].join(" | ");
  // OSYM adlari: cok kelimeliler bolum/program cumlelerinde ve tablolarda; tek kelimeliler ("Güvenlik",
  // "Seramik") yalniz PDF tablolarda ("güvenlik soruşturması", "milli güvenlik" metinde cok geciyor).
  let genis = [bolumCumleleri(rawText, DAR_BAGLAM), bolumCumleleri(anaEk, DAR_BAGLAM), tablo].join(" | ");
  let dar = tablo;
  const seviyeler = duzeyKumesi(secenek.seviyeler);
  const duzeyUygun = (t: Terim) => {
    if (t.seviye) return secenek.osym !== false && (!seviyeler.size || seviyeler.has(t.seviye));
    return !secenek.seviyeKesin || !t.duzey || !seviyeler.size || seviyeler.has(t.duzey);
  };
  // Ayni ad baska duzeyde de varsa (OSYM'de 123 ad hem lisans hem onlisans) uygun duzeydeki eslesir;
  // hicbir duzeyi uymayan ad metinden silinir ki icindeki kisa ad ("Bilgisayar") ayrica eslesmesin.
  const uygunAdlar = new Set(terimler.filter(duzeyUygun).map((t) => t.norm));

  // genel: ciplak kelime genislemesinden (tam ad degil); ilk turda yalniz bunlar varsa ek metin yine okunur.
  const matches = new Map<string, { departmentId: string; matchedAlias: string; genel?: boolean }>();
  const osymEslesen = new Map<string, NonNullable<Terim["osym"]> & { seviye: EducationLevel; genel?: boolean }>();
  const sil = (terim: string) => {
    tum = bulVeSil(tum, terim) ?? tum;
    genis = bulVeSil(genis, terim) ?? genis;
    dar = bulVeSil(dar, terim) ?? dar;
  };
  for (const t of terimler) {
    if (!duzeyUygun(t)) {
      // Yalniz tum'den: bolum cumlesinde kalsin ki asagida ciplak oge olarak ilanin duzeyine genisletilsin.
      if (!uygunAdlar.has(t.norm)) tum = bulVeSil(tum, t.norm) ?? tum;
      continue;
    }
    if (t.seviye) {
      // OSYM kurallari: bolum cumlesi/tablo, sayimin parcasi.
      if (bulVeSil(t.norm.includes(" ") ? genis : dar, t.norm, true) === null) continue;
    } else if (bulVeSil(tum, t.norm) === null) continue;
    sil(t.norm);
    if (t.departmentId) {
      if (!matches.has(t.departmentId)) matches.set(t.departmentId, { departmentId: t.departmentId, matchedAlias: t.etiket });
    } else if (t.osym) {
      osymEslesen.set(normalize(t.osym.ad), { ...t.osym, seviye: t.seviye! });
    }
  }

  // Ciplak kelimeler: "fakültelerinin bilgisayar, elektrik, mekatronik ... bölümlerinden" -> ilanin (tek, metinden
  // okunan) duzeyinde o kelimeyle baslayan tum bolumler (kullanici kurali 2026-10-19). Tam adlar yukarida
  // eslesip silindigi icin burada yalniz eslesmemis liste ogeleri kalir.
  const tekDuzey = seviyeler.size === 1 ? [...seviyeler][0] : undefined;
  if (tekDuzey && secenek.seviyeKesin && secenek.osym !== false) {
    for (const cumle of genis.split(" | ")) {
      const duzeyde = [...terimler, ...kisaAdlar].filter((t) => (t.seviye ?? t.duzey) === tekDuzey);
      const onekiyle = (o: string) => duzeyde.filter((t) => t.norm === o || t.norm.startsWith(`${o} `) || t.norm.startsWith(`${o}-`));
      const islenenObek = new Set<string>();
      for (const { oge: parca, muhendislik, butun } of ciplakOgeler(cumle)) {
        // "elektronik ve haberlesme" bir bolum adinin basiysa obek tek oge sayilir (parcalari degil).
        const obekAd = butun && onekiyle(butun).length ? butun : undefined;
        if (obekAd && islenenObek.has(obekAd)) continue;
        if (obekAd) islenenObek.add(obekAd);
        const oge = obekAd ?? parca;
        // Oge kendisi bir bolum adiysa ("Resim", "Seramik", "Pazarlama") yalniz o; degilse ("elektrik")
        // o kelimeyle baslayan tum bolumler.
        const tam = duzeyde.filter((t) => t.norm === oge);
        const onekli = onekiyle(oge).filter((t) => t.norm !== oge);
        // "Mühendislik fakültelerinin elektrik, elektronik ... bölümleri": o kelimenin mühendislik bolumleri
        // ("Elektronik" adli bolum olsa da Elektronik Mühendisliği kastedilir).
        const muhendisler = muhendislik ? onekli.filter((t) => t.norm.includes("muhendis")) : [];
        const adaylar = muhendisler.length ? muhendisler : tam.length ? tam : onekli;
        // Ust sinir benzersiz bolum sayisina: ayni bolum hem sitede (ad/ifade) hem OSYM adi olarak gecebilir.
        const siteAdlari = new Set(adaylar.filter((t) => t.departmentId).map((t) => t.norm));
        const benzersiz = new Set(adaylar.map((t) => (t.departmentId ? `d:${t.departmentId}` : siteAdlari.has(t.norm) ? null : `o:${t.norm}`)).filter(Boolean));
        if (!benzersiz.size || benzersiz.size > CIPLAK_EN_FAZLA) continue;
        for (const t of adaylar) {
          if (t.departmentId) {
            if (!matches.has(t.departmentId)) matches.set(t.departmentId, { departmentId: t.departmentId, matchedAlias: `${oge} (genel)`, genel: true });
          } else if (t.osym) {
            // Tam adla zaten eslesmisse "genel" isaretiyle ezilmesin.
            if (!osymEslesen.has(normalize(t.osym.ad))) osymEslesen.set(normalize(t.osym.ad), { ...t.osym, seviye: t.seviye!, genel: true });
          }
        }
      }
    }
  }

  for (const o of osymEslesen.values()) {
    // Deneme raporu (scripts/eslestirmeDene.ts) bolum eklemez: yeni bolum "osym:<ad>" sahte kimligiyle doner.
    if (process.env.BOLUM_EKLEME_KAPALI === "1") {
      // Gercek kayitla ayni kural: ad + duzey (baska duzeyde ayni ad "... (Lisans)" olarak eklenir).
      const var_ = await prisma.department.findFirst({
        where: { level: o.seviye, OR: [{ name: { equals: o.ad, mode: "insensitive" } }, { name: { equals: `${o.ad} (${LEVEL_LABEL[o.seviye] ?? o.seviye})`, mode: "insensitive" } }] },
        select: { id: true },
      });
      matches.set(var_?.id ?? `osym:${o.ad}`, { departmentId: var_?.id ?? `osym:${o.ad}`, matchedAlias: o.ad, genel: o.genel });
      continue;
    }
    const bolum = await createDepartmentFromResearch({ name: o.ad, level: o.seviye, aliases: o.aliases, osym: true });
    if (!matches.has(bolum.id)) matches.set(bolum.id, { departmentId: bolum.id, matchedAlias: `${o.ad} (ÖSYM)`, genel: o.genel });
  }
  if (osymEslesen.size) sozlukOnbellek = null;
  return Array.from(matches.values());
}

/**
 * Chatbot'un net (Claude tarafindan zaten temizlenmis, tek bir bolum adi
 * gibi kisa) bir sorguyu bizim bolum listemizle eslestirmesi icin kullanilir.
 * matchDepartmentsForText'ten farkli olarak burada TEK bir en iyi eslesme
 * arandigi ve girdi zaten kisa/net oldugu icin daha siki bir kural uygulanir:
 * kisa/genel bir bolum adinin (ör. "İşletme"), aslinda FARKLI ve daha
 * spesifik bir alanin (ör. "Gemi Makineleri İşletme Mühendisliği") icinde
 * sirf bir kelimesi ustuste geldigi icin yanlislikla eslesmesini onlemek
 * icin, eslesen terimin sorgunun buyuk kismini kapsamasi sart kosulur.
 */
export async function matchDepartmentForQuery(
  query: string,
): Promise<{ departmentId: string; matchedAlias: string } | null> {
  const normalizedQuery = normalize(query);
  if (!normalizedQuery) return null;

  const allDepartments = await prisma.department.findMany();
  const allAliases = await prisma.departmentAlias.findMany();

  for (const dept of allDepartments) {
    if (normalize(dept.name) === normalizedQuery) {
      return { departmentId: dept.id, matchedAlias: dept.name };
    }
  }
  for (const alias of allAliases) {
    if (normalize(alias.alias) === normalizedQuery) {
      return { departmentId: alias.departmentId, matchedAlias: alias.alias };
    }
  }

  const MIN_COVERAGE_RATIO = 0.6;
  const candidates = [
    ...allDepartments.map((d) => ({ departmentId: d.id, term: d.name })),
    ...allAliases.map((a) => ({ departmentId: a.departmentId, term: a.alias })),
  ];

  let best: { departmentId: string; matchedAlias: string; ratio: number } | null = null;
  for (const c of candidates) {
    const normTerm = normalize(c.term);
    if (!normTerm || !normalizedQuery.includes(normTerm)) continue;
    const ratio = normTerm.length / normalizedQuery.length;
    if (ratio < MIN_COVERAGE_RATIO) continue;
    if (!best || ratio > best.ratio) {
      best = { departmentId: c.departmentId, matchedAlias: c.term, ratio };
    }
  }

  return best ? { departmentId: best.departmentId, matchedAlias: best.matchedAlias } : null;
}

export function normalize(text: string): string {
  return text
    .toLocaleLowerCase("tr-TR")
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    // PDF/tablo satir kirilimlari ve "Elektrik - Elektronik" / "Elektrik–Elektronik" yazilislari tek bicime.
    .replace(/\s*[-–—]\s*/g, "-")
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * Turkce, eklemeli bir dil oldugu icin bir kelimeye dogrudan (bosluksuz)
 * ek gelebilir (ör. "tarih" + "inde" -> "tarihinde") - bu yuzden duz
 * ".includes()" ile alan/alias eslestirmesi yanlis pozitif uretebilir
 * ("tarih" bolumu, "21 eylul tarihinde" ifadesindeki "tarihinde" ile
 * eslesir). Bu, needle'in haystack icinde TAM KELIME (once/sonrasinda
 * harf/rakam olmayan) olarak gectigini kontrol eder.
 */
export function includesWholeWord(haystack: string, needle: string): boolean {
  if (!needle) return false;
  const escaped = needle.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const pattern = new RegExp(`(?<![\\p{L}\\p{N}])${escaped}(?![\\p{L}\\p{N}])`, "u");
  return pattern.test(haystack);
}

/**
 * Sohbet asistani, veritabaninda karsiligi olmayan bir bolumu internetten
 * arastirip ogrendiginde bunu kalici olarak eklemek icin kullanilir.
 * Ayni isimde bolum zaten varsa (ör. baska bir kullanicinin aninda once
 * eklemis olmasi) onu dondurur, ikinci kez olusturmaz.
 */
export async function createDepartmentFromResearch(input: {
  name: string;
  level: EducationLevel;
  aliases: string[];
  osym?: boolean;
}) {
  // Ayni ad baska duzeyde varsa (OSYM: "Bilişim Sistemleri ve Teknolojileri" hem lisans hem onlisans)
  // duzey adla ayrilir: "... (Lisans)"; duz ad ifade olarak eklenir. Eskiden var olan kayit donuyor,
  // lisans ilani onlisans bolumune baglaniyordu.
  const adaGore = await prisma.department.findFirst({ where: { name: { equals: input.name, mode: "insensitive" } } });
  if (adaGore?.level === input.level) return adaGore;
  const name = adaGore ? `${input.name} (${LEVEL_LABEL[input.level] ?? input.level})` : input.name;
  const slug = slugify(name);
  const existing = await prisma.department.findFirst({ where: { OR: [{ slug }, { name: { equals: name, mode: "insensitive" } }] } });
  if (existing) return existing;

  const uniqueAliases = Array.from(
    new Set(
      [...input.aliases, ...(adaGore ? [input.name] : [])]
        .map((a) => a.trim())
        .filter((a) => a && normalize(a) !== normalize(name)),
    ),
  );

  return prisma.department.create({
    data: {
      name,
      slug,
      level: input.level,
      osym: input.osym ?? false,
      aliases: { create: uniqueAliases.map((alias) => ({ alias })) },
    },
  });
}

/**
 * Yeni eklenen bir bolumu, mevcut aktif ilanlarin ham nitelik metinleriyle
 * geriye donuk olarak karsilastirip eslesenleri baglar. Boylece bolum
 * sohbet sirasinda "kesfedildiginde" halihazirda sistemde olan uygun
 * ilanlar da hemen gorunur hale gelir.
 */
export async function linkDepartmentToExistingPostings(
  departmentId: string,
): Promise<number> {
  const department = await prisma.department.findUniqueOrThrow({
    where: { id: departmentId },
    include: { aliases: true },
  });
  const terms = [department.name, ...department.aliases.map((a) => a.alias)];

  const postings = await prisma.posting.findMany({
    // Admin'in elle sectigi bolumlere dokunulmaz.
    where: { isActive: true, adminDuzenledi: false, departmentRequirementRaw: { not: null } },
    select: { id: true, departmentRequirementRaw: true, ekMetin: true, educationLevels: true },
  });
  sozlukOnbellek = null;

  let linked = 0;
  for (const posting of postings) {
    if (!posting.departmentRequirementRaw) continue;
    // Ilanin duzeyi bolumunkiyle uyusmali (lisans ilani onlisans bolumune baglanmasin).
    const duzeyler = duzeyKumesi(posting.educationLevels);
    if (duzeyler.size && !duzeyler.has(department.level)) continue;
    const raw = dilMuafiyetiniCikar(posting.departmentRequirementRaw);
    const [anaEkHam = "", ...tablolar] = (posting.ekMetin ?? "").split(TABLO_ISARETI);
    const anaEk = dilMuafiyetiniCikar(anaEkHam);
    const tablo = maskFalsePositiveIdioms(normalize(tablolar.join(" | ").replace(/\n/g, " | ")));
    // OSYM bolumu: yalniz bolum cumlelerinde/tablolarda ve bir sayimin parcasiysa (matchDepartmentsForText ile ayni kural).
    const normalizedText = department.osym
      ? [bolumCumleleri(raw, DAR_BAGLAM), bolumCumleleri(anaEk, DAR_BAGLAM), tablo].join(" | ")
      : [maskFalsePositiveIdioms(normalize(raw)), bolumCumleleri(anaEk, GENIS_BAGLAM), tablo].join(" | ");
    const matchedTerm = terms.find((t) => bulVeSil(normalizedText, normalize(t), department.osym) !== null);
    if (!matchedTerm) continue;

    await prisma.postingDepartment.upsert({
      where: {
        postingId_departmentId: { postingId: posting.id, departmentId },
      },
      update: {},
      create: { postingId: posting.id, departmentId, matchedAlias: matchedTerm },
    });
    linked++;
  }

  return linked;
}

/**
 * Ilan sayfasinin "Benzer ilanlar" bolumu: ayni bolume ya da ayni kuruma ait
 * diger aktif ilanlar, en yeniler once.
 */
export async function getBenzerIlanlar(ilan: { id: string; institutionName: string; departments: { departmentId: string }[] }, adet = 3) {
  const bolumIdleri = ilan.departments.map((d) => d.departmentId);
  return prisma.posting.findMany({
    where: {
      isActive: true,
      id: { not: ilan.id },
      OR: [
        ...(bolumIdleri.length ? [{ departments: { some: { departmentId: { in: bolumIdleri } } } }] : []),
        { institutionName: ilan.institutionName },
      ],
    },
    orderBy: { publishedAt: "desc" },
    take: adet,
  });
}

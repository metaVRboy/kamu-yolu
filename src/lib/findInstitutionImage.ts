import { unstable_cache } from "next/cache";

// Wikimedia, tanimlayici User-Agent olmayan istekleri daha siki kisitliyor.
const WIKI_ISTEK = { headers: { "User-Agent": "KamuYolu/1.0 (https://www.kamuyolu.com)" } };

/** Wikipedia istegi: 404 = gercekten yok (null); 429/5xx/ag hatasi = gecici (firlatir). */
async function wikiGetir(url: string): Promise<Response | null> {
  const res = await fetch(url, { ...WIKI_ISTEK, signal: AbortSignal.timeout(8000) });
  if (res.status === 404) return null;
  if (!res.ok) throw new Error(`Wikipedia ${res.status}`);
  return res;
}

async function ozetGorseliniGetir(baslik: string): Promise<string | null> {
  const res = await wikiGetir(`https://tr.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(baslik)}`);
  if (!res) return null;

  const data = (await res.json()) as {
    type?: string;
    thumbnail?: { source?: string };
    originalimage?: { source?: string };
  };
  // Anlam ayrimi sayfasinin gorseli yok ("Adalet Bakanligi" -> asil sayfa "Adalet Bakanligi (Turkiye)").
  if (data.type === "disambiguation") return null;
  return data.thumbnail?.source ?? data.originalimage?.source ?? null;
}

/**
 * Kurum adindan denenecek sayfa basliklari: tam ad, "T.C." ve parantez ayiklanmis ad, parantez icindeki kisaltma
 * (TUBITAK, KOSGEB), coklu kurum listesinde ilki; her biri ayrica "(Türkiye)" ekiyle (bakanliklar boyle).
 */
function baslikAdaylari(kurumAdi: string): string[] {
  const ilk = kurumAdi.split(/[,;]/)[0].replace(/^T\.?\s?C\.?\s+/i, "").trim();
  const parantezsiz = ilk.replace(/\s*\([^)]*\)\s*/g, " ").replace(/\s+/g, " ").trim();
  const kisaltma = ilk.match(/\(([^)]+)\)/)?.[1]?.trim();
  const temel = [...new Set([kurumAdi.trim(), ilk, parantezsiz, kisaltma].filter((x): x is string => !!x && x.length > 1))];
  return [...new Set(temel.flatMap((b) => [b, `${b} (Türkiye)`]))];
}

const JENERIK_KELIMELER = new Set([
  "t.c.",
  "tc",
  "üniversitesi",
  "universitesi",
  "bakanlığı",
  "bakanligi",
  "belediyesi",
  "belediye",
  "başkanlığı",
  "baskanligi",
  "genel",
  "müdürlüğü",
  "mudurlugu",
  "kurumu",
  "idaresi",
  "başkanı",
  "daire",
  "il",
  "ilçe",
]);

function anlamliKelimeler(metin: string): Set<string> {
  return new Set(
    metin
      .toLocaleLowerCase("tr-TR")
      .split(/[^a-zçğıöşü]+/i)
      .filter((k) => k.length > 2 && !JENERIK_KELIMELER.has(k)),
  );
}

const TUR_KELIMELERI = ["belediye", "üniversite", "bakanlığ", "müdürlüğ", "başkanlığ", "kurum", "hastane", "ajans", "müze"];

function turKelimeleriniAl(metin: string): Set<string> {
  const kucuk = metin.toLocaleLowerCase("tr-TR");
  return new Set(TUR_KELIMELERI.filter((k) => kucuk.includes(k)));
}

/** Tam baslik eslesmesi basarisiz olursa aramadaki ilk uygun sayfa basliklarini (en fazla 5) doner. */
async function yakinBasliklariBul(kurumAdi: string): Promise<string[]> {
  const res = await wikiGetir(
    `https://tr.wikipedia.org/w/api.php?action=query&list=search&srlimit=5&format=json&origin=*&srsearch=${encodeURIComponent(kurumAdi)}`,
  );
  if (!res) return [];
  const data = (await res.json()) as { query?: { search?: { title?: string }[] } };
  return (data.query?.search ?? []).map((s) => s.title).filter((b): b is string => !!b && uygunBaslik(kurumAdi, b));
}

function uygunBaslik(kurumAdi: string, bulunanBaslik: string): boolean {

  // Arama, kucuk/az bilinen kurumlar icin alakasiz bir sayfaya (ör.
  // belediye yerine ilin genel sayfasi) dusebiliyor - kurum adiyla en az
  // bir anlamli kelimesi ortusmuyorsa bu eslesmeyi reddediyoruz.
  const kurumKelimeleri = anlamliKelimeler(kurumAdi);
  const baslikKelimeleri = anlamliKelimeler(bulunanBaslik);
  const ortusuyorMu = [...kurumKelimeleri].some((k) => baslikKelimeleri.has(k));

  // Kurum adinda tur kelimesi (belediyesi, universitesi, bakanligi...) varsa
  // bulunan sayfada da olmali - "Bahce Belediyesi" aramasi "Bahce, Osmaniye"
  // ilce sayfasina dusup logo yerine ilce haritasini getiriyordu.
  const turKelimeleri = turKelimeleriniAl(kurumAdi);
  const baslikTurler = turKelimeleriniAl(bulunanBaslik);
  const turUyuyorMu = turKelimeleri.size === 0 || [...turKelimeleri].some((k) => baslikTurler.has(k));

  // Baslikta kurum adinda olmayan anlamli kelime varsa baska bir sayfadir: "Cumhurbaskanligi" aramasi
  // "Cumhurbaskanligi Turkiye Bisiklet Turu" logosunu getiriyordu.
  const fazlaKelimeYok = [...baslikKelimeleri].every((k) => kurumKelimeleri.has(k) || k === "türkiye");

  return ortusuyorMu && turUyuyorMu && fazlaKelimeYok;
}

async function gorselAra(kurumAdi: string): Promise<string | null> {
  // Once dogrudan baslik adaylari (anlam ayrimi atlanir, "(Türkiye)" denenir).
  for (const baslik of baslikAdaylari(kurumAdi)) {
    const gorsel = await ozetGorseliniGetir(baslik);
    if (gorsel) return gorsel;
  }
  // Model kurum adini Wikipedia basligiyla birebir yazmayabilir: aramadaki uygun sayfalari sirayla dene.
  const sade = baslikAdaylari(kurumAdi)[1] ?? kurumAdi;
  for (const baslik of await yakinBasliklariBul(sade)) {
    const gorsel = await ozetGorseliniGetir(baslik);
    if (gorsel) return gorsel;
  }
  return null;
}

/**
 * Bir kurum/kuruluş adiyla Wikipedia'da arama yapip, o sayfanin kendi
 * ozet gorselini (varsa) doner. Wikipedia/Wikimedia gorselleri acik
 * lisansli oldugu icin (Google Gorseller gibi rastgele, telif durumu
 * belirsiz bir fotograf kullanmaktan farkli olarak) ticari bir sitede
 * guvenle kullanilabilir. Sayfa veya gorsel bulunamazsa null doner.
 */
export async function findInstitutionImage(kurumAdi: string): Promise<string | null> {
  try {
    return await gorselAra(kurumAdi);
  } catch {
    return null;
  }
}

const gorselAraOnbellekli = unstable_cache(gorselAra, ["institution-image-v4"], { revalidate: 60 * 60 * 24 * 7 });

/**
 * findInstitutionImage'in onbellekli hali - ilanlar sayfalarda tekrar
 * tekrar ayni kurum adiyla gosterilebilir; Wikipedia'ya her render'da istek
 * atmamak icin 7 gun onbelleklenir (kurum logolari pratikte hic degismez).
 * Gecici hatalar (429, zaman asimi) firlatildigi icin onbellege GIRMEZ: o
 * render'da gorselsiz gosterilir, sonraki render'da tekrar denenir. Eskiden
 * hata da null olarak 7 gun onbellekte kalip logoyu bir hafta yok ediyordu.
 */
export async function findInstitutionImageCached(kurumAdi: string): Promise<string | null> {
  try {
    return await gorselAraOnbellekli(kurumAdi);
  } catch {
    return null;
  }
}

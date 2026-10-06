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
    thumbnail?: { source?: string };
    originalimage?: { source?: string };
  };
  return data.thumbnail?.source ?? data.originalimage?.source ?? null;
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

/** Tam baslik eslesmesi basarisiz olursa en yakin sayfa basligini bulur. */
async function enYakinBasligiBul(kurumAdi: string): Promise<string | null> {
  const res = await wikiGetir(
    `https://tr.wikipedia.org/w/api.php?action=query&list=search&srlimit=1&format=json&origin=*&srsearch=${encodeURIComponent(kurumAdi)}`,
  );
  if (!res) return null;

  const data = (await res.json()) as { query?: { search?: { title?: string }[] } };
  const bulunanBaslik = data.query?.search?.[0]?.title;
  if (!bulunanBaslik) return null;

  // Arama, kucuk/az bilinen kurumlar icin alakasiz bir sayfaya (ör.
  // belediye yerine ilin genel sayfasi) dusebiliyor - kurum adiyla en az
  // bir anlamli kelimesi ortusmuyorsa bu eslesmeyi reddediyoruz.
  const kurumKelimeleri = anlamliKelimeler(kurumAdi);
  const baslikKelimeleri = anlamliKelimeler(bulunanBaslik);
  const ortusuyorMu = [...kurumKelimeleri].some((k) => baslikKelimeleri.has(k));

  return ortusuyorMu ? bulunanBaslik : null;
}

async function gorselAra(kurumAdi: string): Promise<string | null> {
  const tamEslesme = await ozetGorseliniGetir(kurumAdi);
  if (tamEslesme) return tamEslesme;

  // Model bazen kurum adini Wikipedia'daki sayfa basligiyla birebir
  // ayni yazmayabilir (ör. "T.C. Adalet Bakanligi" vs "Adalet Bakanligi") -
  // arama ile en yakin sayfayi bulup tekrar dene.
  const enYakinBaslik = await enYakinBasligiBul(kurumAdi);
  if (!enYakinBaslik) return null;

  return ozetGorseliniGetir(enYakinBaslik);
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

const gorselAraOnbellekli = unstable_cache(gorselAra, ["institution-image-v2"], { revalidate: 60 * 60 * 24 * 7 });

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

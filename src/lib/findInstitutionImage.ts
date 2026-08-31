async function ozetGorseliniGetir(baslik: string): Promise<string | null> {
  const res = await fetch(
    `https://tr.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(baslik)}`,
    { signal: AbortSignal.timeout(8000) },
  );
  if (!res.ok) return null;

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
  const res = await fetch(
    `https://tr.wikipedia.org/w/api.php?action=query&list=search&srlimit=1&format=json&origin=*&srsearch=${encodeURIComponent(kurumAdi)}`,
    { signal: AbortSignal.timeout(8000) },
  );
  if (!res.ok) return null;

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

/**
 * Bir kurum/kuruluş adiyla Wikipedia'da arama yapip, o sayfanin kendi
 * ozet gorselini (varsa) doner. Wikipedia/Wikimedia gorselleri acik
 * lisansli oldugu icin (Google Gorseller gibi rastgele, telif durumu
 * belirsiz bir fotograf kullanmaktan farkli olarak) ticari bir sitede
 * guvenle kullanilabilir. Sayfa veya gorsel bulunamazsa null doner.
 */
export async function findInstitutionImage(kurumAdi: string): Promise<string | null> {
  try {
    const tamEslesme = await ozetGorseliniGetir(kurumAdi);
    if (tamEslesme) return tamEslesme;

    // Model bazen kurum adini Wikipedia'daki sayfa basligiyla birebir
    // ayni yazmayabilir (ör. "T.C. Adalet Bakanligi" vs "Adalet Bakanligi") -
    // arama ile en yakin sayfayi bulup tekrar dene.
    const enYakinBaslik = await enYakinBasligiBul(kurumAdi);
    if (!enYakinBaslik) return null;

    return await ozetGorseliniGetir(enYakinBaslik);
  } catch {
    return null;
  }
}

const GUN_MS = 24 * 60 * 60 * 1000;
const TARIHSIZ_YAYIN_GUNU = 30;
const AYLAR = ["ocak", "şubat", "mart", "nisan", "mayıs", "haziran", "temmuz", "ağustos", "eylül", "ekim", "kasım", "aralık"];

/**
 * Metinde gecen en gec takvim tarihini bulur ("14 Eylül 2026", "25 Ekim'de",
 * "14.09.2026"). Yilsiz tarihler haberin yayin yilina baglanir; yayindan
 * 60 gunden fazla once kaliyorsa ertesi yila sayilir. En gec tarih bazen
 * sinav tarihi olabilir - bu, haberi erken kaldirmak yerine biraz daha
 * uzun tutar (guvenli taraf).
 */
export function metindekiEnGecTarih(metin: string, yayinTarihi: Date): Date | null {
  const kucuk = metin.toLocaleLowerCase("tr-TR");
  const tarihler: Date[] = [];
  const ayDeseni = new RegExp(`(\\d{1,2})\\s+(${AYLAR.join("|")})(?:\\s+(\\d{4}))?`, "gu");
  for (const [, gun, ay, yil] of kucuk.matchAll(ayDeseni)) {
    let t = new Date(Date.UTC(Number(yil ?? yayinTarihi.getUTCFullYear()), AYLAR.indexOf(ay), Number(gun)));
    if (!yil && t.getTime() < yayinTarihi.getTime() - 60 * GUN_MS) t = new Date(Date.UTC(t.getUTCFullYear() + 1, t.getUTCMonth(), t.getUTCDate()));
    tarihler.push(t);
  }
  for (const [, gun, ay, yil] of kucuk.matchAll(/\b(\d{1,2})[./](\d{1,2})[./](\d{4})\b/g)) {
    if (Number(ay) >= 1 && Number(ay) <= 12) tarihler.push(new Date(Date.UTC(Number(yil), Number(ay) - 1, Number(gun))));
  }
  const gecerli = tarihler.filter((t) => Number.isFinite(t.getTime()));
  return gecerli.length ? new Date(Math.max(...gecerli.map((t) => t.getTime()))) : null;
}

type YayinBilgisi = {
  baslik: string;
  ozet: string;
  detaylar: unknown;
  basvuruBitis: Date | null;
  yayinTarihi: Date;
};

/** Son tarihi (kayitli ya da metinden okunan) gecmis haberi doner; o gun sonuna kadar gecerlidir. */
export function haberSuresiGectiMi(haber: YayinBilgisi, simdi = Date.now()): boolean {
  const bitis =
    haber.basvuruBitis ??
    metindekiEnGecTarih(`${haber.baslik} ${haber.ozet} ${haber.detaylar ? JSON.stringify(haber.detaylar) : ""}`, haber.yayinTarihi);
  // Yayin gununden onceki bir tarih son basvuru degil gecmise referanstir
  // (sonuc duyurusu, "26 Eylul'de baslayan surec" vb.) - 30 gun kuralina duser.
  const yayinGunu = Date.UTC(haber.yayinTarihi.getUTCFullYear(), haber.yayinTarihi.getUTCMonth(), haber.yayinTarihi.getUTCDate());
  if (bitis && bitis.getTime() >= yayinGunu) return bitis.getTime() + GUN_MS < simdi;
  // Tarih icermeyen duyurular (sonuc, takvim haberi vb.) 30 gun sonra kalkar.
  return simdi - haber.yayinTarihi.getTime() > TARIHSIZ_YAYIN_GUNU * GUN_MS;
}

/** Son `gun` gun icinde yayimlanan haber sayisi (baslik cipi icin). */
export function sonGunlerdeYayinlanan(haberler: { yayinTarihi: Date }[], gun = 7, simdi = Date.now()): number {
  return haberler.filter((h) => simdi - h.yayinTarihi.getTime() <= gun * GUN_MS).length;
}

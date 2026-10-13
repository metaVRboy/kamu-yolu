/**
 * Ilanin ham metni yalnizca kaynagi izin veriyorsa gosterilir. Memurlar.net kunyesinde
 * "izin alinmadan, kaynak gosterilerek dahi iktibas edilemez" diyor (FSEK Ek m.8 veri tabani
 * hakki + TTK m.55 haksiz rekabet riski): metin yalnizca icerde bolum eslestirmesi icin kullanilir,
 * sitede/mobilde/arama motoru verisinde gosterilmez. Kariyer Kapisi resmi kamu kaynagi, gosterilebilir.
 */
const METNI_GOSTERILMEYEN_KAYNAKLAR = new Set(["Memurlar.Net"]);

export const ilanMetniGosterilebilir = (p: { sourceName: string }) => !METNI_GOSTERILMEYEN_KAYNAKLAR.has(p.sourceName);

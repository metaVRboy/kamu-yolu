const TR_MAP: Record<string, string> = {
  ç: "c",
  Ç: "c",
  ğ: "g",
  Ğ: "g",
  ı: "i",
  I: "i",
  İ: "i",
  ö: "o",
  Ö: "o",
  ş: "s",
  Ş: "s",
  ü: "u",
  Ü: "u",
};

export function slugify(input: string): string {
  const normalized = input
    .split("")
    .map((ch) => TR_MAP[ch] ?? ch)
    .join("");

  return normalized
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/**
 * Haber sayfalari icin basliktan SEO-dostu, benzersiz bir slug uretir.
 * Ayni/benzer basliga sahip iki haber olabilecegi icin id'nin son
 * karakterleri sonuna eklenerek benzersizlik garanti edilir.
 */
export function buildHaberSlug(baslik: string, id: string): string {
  const taban = slugify(baslik);
  const ek = id.slice(-6);
  return taban ? `${taban}-${ek}` : ek;
}

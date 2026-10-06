import { findInstitutionImageCached } from "@/lib/findInstitutionImage";
import type { Posting } from "@/generated/prisma/client";

const KUCUK_KALAN = new Set(["ve", "ile", "veya", "için", "ya", "da", "de"]);

/**
 * Kaynaktan TAMAMI BUYUK HARF gelen basliklari okunur hale getirir:
 * "TAPU VE KADASTRO GENEL MÜDÜRLÜĞÜ" -> "Tapu ve Kadastro Genel Müdürlüğü".
 * Zaten karisik yazilmis kelimelere (DevOps) ve sesli harfsiz kisaltmalara
 * (BDDK, TRT) dokunulmaz.
 */
export function duzgunHarf(metin: string): string {
  return metin
    .trim()
    .replace(/\s+/g, " ")
    .split(" ")
    .map((kelime, i) => {
      if (kelime !== kelime.toLocaleUpperCase("tr-TR")) return kelime;
      const harfler = kelime.replace(/[^\p{L}]/gu, "");
      if (harfler.length > 1 && !/[AEIİOÖUÜ]/u.test(harfler)) return kelime;
      const kucuk = kelime.toLocaleLowerCase("tr-TR");
      if (i > 0 && KUCUK_KALAN.has(kucuk)) return kucuk;
      return kucuk.replace(/^([^\p{L}]*)(\p{L})/u, (_, on: string, ilk: string) => on + ilk.toLocaleUpperCase("tr-TR"));
    })
    .join(" ");
}

/** "UZMAN YARDIMCISI — KURUM ADI" -> "Uzman Yardımcısı" (kurum adi tekrari atilir). */
export function kadroAdi(baslik: string, kurumAdi: string): string {
  let kadro = baslik.split("—")[0].replace(/\s+/g, " ").trim();
  const kurum = kurumAdi.replace(/\s+/g, " ").trim().toLocaleUpperCase("tr-TR");
  if (kadro.toLocaleUpperCase("tr-TR").startsWith(kurum + " ")) kadro = kadro.slice(kurum.length + 1);
  return duzgunHarf(kadro);
}

/** Wikipedia aramasi icin: "TAPU VE KADASTRO GENEL MÜDÜRLÜĞÜ (TKGM)" -> "Tapu ve Kadastro Genel Müdürlüğü". */
export function aramaAdi(kurumAdi: string): string {
  return duzgunHarf(kurumAdi.replace(/\([^)]*\)/g, " "));
}

/** "ANKARA / ÇANKAYA" -> "Ankara / Çankaya"; tekrar eden ve kurum adini yineleyen parcalar atilir. */
export function konumMetni(iller: string[], kurumAdi: string): string | null {
  if (!iller.length) return null;
  const kurum = kurumAdi.trim().toLocaleUpperCase("tr-TR");
  const parcalar = [...new Set(iller[0].split("/").map((p) => p.trim()).filter(Boolean))].filter(
    (p) => p.toLocaleUpperCase("tr-TR") !== kurum,
  );
  if (!parcalar.length) return null;
  return duzgunHarf(parcalar.join(" / "));
}

const GUN_MS = 24 * 60 * 60 * 1000;

export type IlanVitrinGrubu = {
  ilk: Posting;
  ilanSayisi: number;
  kadroSayisi: number;
  yeni: boolean; // son 48 saatte yayimlandi
  kalanGun: number | null; // son basvuruya kalan gun
};

/**
 * Ayni kurumun ayni anda yayimladigi onlarca kadro ilani vitrinde kopya
 * kartlar gibi gorunuyordu - en yeni ilandan baslayarak kurum basina tek
 * grup olusturulur.
 */
export function kurumaGoreGrupla(ilanlar: Posting[], adet: number, simdi = Date.now()): IlanVitrinGrubu[] {
  const gruplar = new Map<string, { ilk: Posting; ilanlar: Posting[] }>();
  for (const ilan of ilanlar) {
    const anahtar = ilan.institutionName.trim().toLocaleUpperCase("tr-TR");
    const grup = gruplar.get(anahtar);
    if (grup) grup.ilanlar.push(ilan);
    else gruplar.set(anahtar, { ilk: ilan, ilanlar: [ilan] });
  }
  return [...gruplar.values()].slice(0, adet).map(({ ilk, ilanlar: g }) => ({
    ilk,
    ilanSayisi: g.length,
    kadroSayisi: new Set(g.map((i) => kadroAdi(i.title, i.institutionName).toLocaleLowerCase("tr-TR"))).size,
    ...zamanBilgisi(ilk, simdi),
  }));
}

/** Liste sayfalari: gruplama yok, her ilan kendi karti. */
export function tekIlanKartlari(ilanlar: Posting[], simdi = Date.now()): IlanVitrinGrubu[] {
  return ilanlar.map((ilk) => ({ ilk, ilanSayisi: 1, kadroSayisi: 1, ...zamanBilgisi(ilk, simdi) }));
}

function zamanBilgisi(ilan: Posting, simdi: number) {
  return {
    yeni: !!ilan.publishedAt && simdi - ilan.publishedAt.getTime() < 2 * GUN_MS,
    kalanGun: ilan.applicationEnd ? Math.ceil((ilan.applicationEnd.getTime() - simdi) / GUN_MS) : null,
  };
}

/**
 * Kartlardaki kurum logolari (kurum adi -> logo URL). Liste sayfalarinda
 * onlarca farkli kurum olabildigi icin Wikipedia'ya ayni anda en fazla 6
 * sorgu gider; arama once duzgun harfli, bulamazsa kaynaktaki ham adla yapilir.
 * Sayfa logo yuzunden beklemesin diye ~3 sn'lik butce asilinca yeni parti
 * baslatilmaz - kalan kurumlar bu render'da logosuz (tur ikonu) gosterilir;
 * bulunanlar 7 gun onbellekte kaldigi icin birkac ziyarette hepsi dolar.
 */
export async function kurumLogolari(ilanlar: Posting[], butceMs = 3000): Promise<Map<string, string | null>> {
  const adlar = [...new Set(ilanlar.map((i) => i.institutionName))];
  const logolar = new Map<string, string | null>();
  const kuyruk = [...adlar];
  const bitis = performance.now() + butceMs;
  // 6 isci kuyruktan sirayla ceker: yavas/takilan bir sorgu sadece bir isciyi
  // mesgul eder, digerleri devam eder.
  const isci = async () => {
    while (kuyruk.length && performance.now() < bitis) {
      const ad = kuyruk.shift()!;
      logolar.set(ad, (await findInstitutionImageCached(aramaAdi(ad))) ?? (await findInstitutionImageCached(ad)));
    }
  };
  // Butce dolunca beklenmez; yetismeyen sonuc bu render'a girmez ama arka
  // planda tamamlanirsa onbellege yazilir.
  await Promise.race([Promise.all(Array.from({ length: 6 }, isci)), new Promise((coz) => setTimeout(coz, butceMs))]);
  return new Map(logolar);
}

/** Son basvurusu bugunden itibaren `gun` gun icinde biten ilanlar. */
export function yakindaBitenler<T extends Pick<Posting, "applicationEnd">>(ilanlar: T[], gun = 7, simdi = Date.now()): T[] {
  return ilanlar.filter((i) => {
    if (!i.applicationEnd) return false;
    const kalan = i.applicationEnd.getTime() - simdi;
    return kalan >= -GUN_MS && kalan <= gun * GUN_MS;
  });
}

/**
 * Basliktaki "bu hafta bitiyor" filtresi: gosterilecek ilanlar ve filtreyi
 * ac/kapa eden link (sayfadaki diger filtre parametreleri korunur).
 */
export function yakindaFiltresi<T extends Pick<Posting, "applicationEnd">>(
  ilanlar: T[],
  yol: string,
  parametreler: Record<string, string | undefined>,
) {
  const bitecekler = yakindaBitenler(ilanlar);
  const aktif = parametreler.yakinda === "1";
  const q = new URLSearchParams(
    Object.entries(parametreler).filter((e): e is [string, string] => !!e[1] && e[0] !== "yakinda"),
  );
  if (!aktif) q.set("yakinda", "1");
  return { gosterilen: aktif ? bitecekler : ilanlar, biteceklerSayisi: bitecekler.length, aktif, href: `${yol}${q.size ? `?${q}` : ""}` };
}

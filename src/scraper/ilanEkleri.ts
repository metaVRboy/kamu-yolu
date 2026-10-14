import { gemini, GEMINI_MODEL } from "@/lib/gemini";
import { TABLO_ISARETI } from "@/lib/matching";
import { stripBbCode } from "./parseRequirements";

/**
 * Bolum listesi ilan metninde degil ekte duran ilanlar icin eslestirme metni toplar:
 * Kariyer Kapisi'nda "Tablo 1" gibi PDF baglantilari, Memurlar.Net'te resim olarak konan kadro tablolari.
 * Okunan metin yalniz bolum eslestirmesinde kullanilir (Posting.ekMetin), sitede gosterilmez.
 * Hata firlatir: cagiran ekMetin'i bos yazmaz, sonraki taramada yeniden denenir.
 */

const AZAMI_BAYT = 10 * 1024 * 1024;

async function indir(url: string): Promise<{ veri: Uint8Array; tur: string }> {
  // kariyerkapisi.gov.tr DNS'i ara ara bir kez cozulemiyor: bir kez daha dene.
  for (let deneme = 1; ; deneme++) {
    try {
      const res = await fetch(url, { signal: AbortSignal.timeout(20_000), headers: { "User-Agent": "KamuYoluBot/0.1 (iletisim: info@kamuyolu.com)" } });
      if (!res.ok) throw new Error(`${url} -> ${res.status}`);
      const veri = new Uint8Array(await res.arrayBuffer());
      if (veri.length > AZAMI_BAYT) throw new Error(`${url} çok büyük (${veri.length} bayt)`);
      return { veri, tur: res.headers.get("content-type") ?? "" };
    } catch (err) {
      if (deneme >= 2) throw err;
      await new Promise((r) => setTimeout(r, 1500));
    }
  }
}

async function pdfMetni(url: string): Promise<string> {
  const { veri } = await indir(url);
  const { getDocument } = await import("pdfjs-dist/legacy/build/pdf.mjs");
  const doc = await getDocument({ data: veri, verbosity: 0 }).promise;
  const sayfalar: string[] = [];
  for (let p = 1; p <= Math.min(doc.numPages, 20); p++) {
    const icerik = await (await doc.getPage(p)).getTextContent();
    sayfalar.push(icerik.items.map((i) => ("str" in i ? i.str + (i.hasEOL ? "\n" : " ") : "")).join(""));
  }
  await doc.cleanup();
  return sayfalar.join("\n");
}

/** Resim olarak konan ilan tablosunu Gemini ile metne cevirir (yalniz aktarim, yorum yok). */
async function gorselMetni(url: string): Promise<string> {
  const { veri, tur } = await indir(url);
  const res = await gemini.models.generateContent({
    model: GEMINI_MODEL,
    contents: [
      { inlineData: { mimeType: tur.startsWith("image/") ? tur : "image/jpeg", data: Buffer.from(veri).toString("base64") } },
      {
        text:
          "Bu görsel bir kamu personel alım ilanının sayfası ya da tablosu. İçindeki bütün yazıyı, tablo hücreleri dahil, " +
          "satır satır ve olduğu gibi Türkçe aktar. Özetleme, yorum ekleme, olmayan bir şey yazma; okunamayan yeri atla.",
      },
    ],
  });
  return res.text ?? "";
}

/** Ek metin bicimi: ana ilan metni, ardindan TABLO_ISARETI ile ayrilmis tablo metinleri (bkz. matchDepartmentsForText). */
const ekMetinOlustur = (anaMetin: string, tablolar: string[]) => [anaMetin, ...tablolar.filter((t) => t.trim())].join(TABLO_ISARETI);

/** Kariyer Kapisi ana ilan metnindeki (BBCode) PDF baglantilari: [url=...pdf]Tablo 1[/url]. */
export function kkPdfBaglantilari(anaMetinBbCode: string): { url: string; etiket: string }[] {
  return [...anaMetinBbCode.matchAll(/\[url=([^\]\s]+\.pdf)\]([\s\S]*?)\[\/url\]/gi)]
    .map((m) => ({ url: m[1].startsWith("http") ? m[1] : `https://kariyerkapisi.gov.tr${m[1].startsWith("/") ? "" : "/"}${m[1]}`, etiket: stripBbCode(m[2]) }))
    .slice(0, 6);
}

/**
 * Kariyer Kapisi pozisyonu icin ek metin. Pozisyon metni bir tabloya atif yapiyorsa ("Tablo 2'de belirtilen
 * bolumler") yalniz o tablonun PDF'i, yapmiyorsa ("ilan metninde yer alan bolumler") ana metin + tum PDF'ler.
 * Ayni ilanin pozisyonlari ayni PDF'leri paylastigi icin okunan PDF'ler onbellekte tutulur.
 */
export async function kkEkMetni(
  pozisyonMetni: string,
  anaMetinBbCode: string,
  pdfOnbellek: Map<string, Promise<string>>,
  anaMetniKat = true, // pozisyonsuz ilanda ana metin zaten ilan metnidir
): Promise<string> {
  // Pozisyon kendi mezuniyet sartini yaziyor ve disariya (tablo, ilan metni, ek) atif yapmiyorsa ana metne
  // dusulmez: cok pozisyonlu ilanda (ör. universite) diger pozisyonlarin bolumleri bu pozisyona baglanmasin.
  if (anaMetniKat && /mezun/iu.test(pozisyonMetni) && !/tablo|ilan metn|aşağıda|ekte|ekli|ek-?\s?\d|kılavuz/iu.test(pozisyonMetni)) return "";
  const baglantilar = kkPdfBaglantilari(anaMetinBbCode);
  const oku = (url: string) => {
    if (!pdfOnbellek.has(url)) pdfOnbellek.set(url, pdfMetni(url));
    return pdfOnbellek.get(url)!;
  };
  const tablolar = [...pozisyonMetni.matchAll(/tablo\s*[-–—]?\s*(\d+)/giu)].map((m) => m[1]);
  if (tablolar.length) {
    const secilen = baglantilar.filter((b) => tablolar.some((n) => new RegExp(`tablo\\s*[-–—_]?\\s*${n}(?!\\d)`, "iu").test(`${b.etiket} ${b.url}`)));
    if (secilen.length) return ekMetinOlustur("", await Promise.all(secilen.map((b) => oku(b.url))));
  }
  return ekMetinOlustur(anaMetniKat ? stripBbCode(anaMetinBbCode) : "", await Promise.all(baglantilar.map((b) => oku(b.url))));
}

/** Memurlar.Net ilan ekleri: ilan govdesindeki tablo gorselleri ve PDF belgeleri. */
export async function memurlarEkMetni(ekler: { gorseller: string[]; pdfler: string[] }): Promise<string> {
  const gorsel = [];
  for (const url of ekler.gorseller.slice(0, 6)) gorsel.push(await gorselMetni(url)); // sirayla: Gemini hiz siniri
  // ponytail: okunamayan PDF atlanir (yoksa her taramada gorseller yeniden okunur); kayip olursa admin elle baglar.
  const pdfler = await Promise.allSettled(ekler.pdfler.slice(0, 4).map(pdfMetni));
  for (const p of pdfler) if (p.status === "rejected") console.error("Memurlar.Net ek PDF okunamadı:", p.reason);
  // Okunan sayfalar tam ilan sayfasi (belge listesi, fotograf vb. dahil): tablo degil metin gibi, cumle filtresiyle aranir.
  return ekMetinOlustur([...gorsel, ...pdfler.map((p) => (p.status === "fulfilled" ? p.value : ""))].join("\n\n"), []);
}

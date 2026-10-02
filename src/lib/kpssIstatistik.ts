import { unstable_cache } from "next/cache";

/**
 * memurlar.net'in resmi bir API'si yok - bu, onlarin genel kullanima
 * acik "Kadro Istatistikleri" (KPSS Robot) sayfasinin HTML'ini parse
 * eder. Sayfa iso-8859-9 (Turkce Latin-1) kodlamasi kullaniyor, bu
 * yuzden metni UTF-8 varsayip okumak Turkce karakterleri bozar - once
 * ArrayBuffer olarak alip dogru kodlamayla decode ediyoruz.
 */
const KPSS_BASE = "https://kpss.memurlar.net/istatistik/unvan/default.aspx";

const OGRENIM_TIP_KODU = { lisans: "4", onlisans: "3", lise: "2" } as const;
export type OgrenimDuzeyi = keyof typeof OGRENIM_TIP_KODU;

export type KpssBolum = { id: string; ad: string; ogrenimDuzeyi: OgrenimDuzeyi };

async function fetchKpssSayfa(params: Record<string, string>): Promise<string> {
  const url = `${KPSS_BASE}?${new URLSearchParams(params).toString()}`;
  const res = await fetch(url, {
    headers: { "User-Agent": "Mozilla/5.0 (compatible; KamuYoluBot/1.0)" },
  });
  if (!res.ok) throw new Error(`KPSS istatistik sayfasi alinamadi: ${res.status}`);
  const buffer = await res.arrayBuffer();
  return new TextDecoder("iso-8859-9").decode(buffer);
}

function parseBolumSecenekleri(html: string, ogrenimDuzeyi: OgrenimDuzeyi): KpssBolum[] {
  const selectMatch = html.match(/<select name="Branch"[^>]*>([\s\S]*?)<\/select>/);
  if (!selectMatch) return [];

  const bolumler: KpssBolum[] = [];
  const optionRe = /<option value="([^"]+)">([^<]+)<\/option>/g;
  let m: RegExpExecArray | null;
  while ((m = optionRe.exec(selectMatch[1]))) {
    const [, id, ad] = m;
    if (!id) continue;
    bolumler.push({ id, ad: ad.trim(), ogrenimDuzeyi });
  }
  return bolumler;
}

async function getKpssBolumListesiUncached(): Promise<KpssBolum[]> {
  const duzeyler = Object.keys(OGRENIM_TIP_KODU) as OgrenimDuzeyi[];
  const sayfalar = await Promise.all(
    duzeyler.map((d) => fetchKpssSayfa({ Type: OGRENIM_TIP_KODU[d] })),
  );
  return duzeyler.flatMap((d, i) => parseBolumSecenekleri(sayfalar[i], d));
}

/** Bolum listesi (binlerce satir) nadiren degisir - haftada bir yenilenir. */
export const getKpssBolumListesi = unstable_cache(getKpssBolumListesiUncached, ["kpss-bolum-listesi"], {
  revalidate: 60 * 60 * 24 * 7,
});

type KpssSatir = { sinifi: string; sutunlar: string[] };

function parseTablo(html: string): KpssSatir[] {
  const tbodyMatch = html.match(/<tbody>([\s\S]*?)<\/tbody>/);
  if (!tbodyMatch) return [];

  const satirlar: KpssSatir[] = [];
  const rowRe = /<tr class="?(genel|\d{4})"?>([\s\S]*?)<\/tr>/g;
  let rowMatch: RegExpExecArray | null;
  while ((rowMatch = rowRe.exec(tbodyMatch[1]))) {
    const sutunlar: string[] = [];
    const tdRe = /<td[^>]*>([\s\S]*?)<\/td>/g;
    let tdMatch: RegExpExecArray | null;
    while ((tdMatch = tdRe.exec(rowMatch[2]))) {
      sutunlar.push(tdMatch[1].replace(/<[^>]+>/g, "").trim());
    }
    satirlar.push({ sinifi: rowMatch[1], sutunlar });
  }
  return satirlar;
}

function parsePuan(deger: string | undefined): number | null {
  if (!deger || /^-+$/.test(deger)) return null;
  const n = Number(deger);
  return Number.isFinite(n) ? n : null;
}

function parseKontenjan(deger: string | undefined): number {
  if (!deger || /^-+$/.test(deger)) return 0;
  const n = Number(deger.replace(/\./g, ""));
  return Number.isFinite(n) ? n : 0;
}

export type KpssBolumVerisi = {
  yillikAlimlar: { yil: number; kontenjan: number }[];
  toplamKontenjan: number;
  minPuan: number | null;
  maxPuan: number | null;
};

async function getKpssBolumVerisiUncached(
  bolumId: string,
  ogrenimDuzeyi: OgrenimDuzeyi,
): Promise<KpssBolumVerisi> {
  const html = await fetchKpssSayfa({ Type: OGRENIM_TIP_KODU[ogrenimDuzeyi], Branch: bolumId });
  const satirlar = parseTablo(html);

  const yilToplam = new Map<number, number>();
  for (const s of satirlar) {
    if (s.sinifi === "genel") continue;
    const yil = Number(s.sinifi);
    const kontenjan = parseKontenjan(s.sutunlar[2]);
    yilToplam.set(yil, (yilToplam.get(yil) ?? 0) + kontenjan);
  }

  // Ilk "genel" satiri (unvan sutunu bos olan) tum bolumun tum yillar
  // toplamidir - memurlar.net'in kendi yayinladigi ozet, biz ayrica
  // hesaplamiyoruz.
  const genelSatir = satirlar.find((s) => s.sinifi === "genel" && s.sutunlar[0] === "");

  return {
    yillikAlimlar: Array.from(yilToplam.entries())
      .map(([yil, kontenjan]) => ({ yil, kontenjan }))
      .sort((a, b) => a.yil - b.yil),
    toplamKontenjan: genelSatir ? parseKontenjan(genelSatir.sutunlar[2]) : 0,
    minPuan: genelSatir ? parsePuan(genelSatir.sutunlar[4]) : null,
    maxPuan: genelSatir ? parsePuan(genelSatir.sutunlar[5]) : null,
  };
}

/** Bir bolumun yillik alim verisi - gunde bir yenilenir (KPSS sonuclari siklikla degismez). */
export function getKpssBolumVerisi(bolumId: string, ogrenimDuzeyi: OgrenimDuzeyi) {
  return unstable_cache(
    () => getKpssBolumVerisiUncached(bolumId, ogrenimDuzeyi),
    ["kpss-bolum-verisi", bolumId, ogrenimDuzeyi],
    { revalidate: 60 * 60 * 24 },
  )();
}

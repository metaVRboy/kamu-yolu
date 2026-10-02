/**
 * TEK SEFERLIK veri aktarim script'i - Vercel'den CANLI cekilemiyor
 * (kaynak sitenin bot korumasi sunucu IP'lerini engelliyor), bu yuzden
 * normal bir IP'den (bu makineden) bir kerelik tüm bolumleri cekip
 * veritabanina kaydediyoruz. Veri durgun oldugundan tekrar calistirmaya
 * gerek yok - sadece kaynak site yapisi degisirse.
 *
 * Calistirma: npx tsx scripts/kpssScrapeOneShot.ts
 */
import "dotenv/config";
import { prisma } from "../src/lib/prisma";

const KPSS_BASE = "https://kpss.memurlar.net/istatistik/unvan/default.aspx";
const OGRENIM_TIP_KODU = { LISANS: "4", ONLISANS: "3", LISE: "2" } as const;
type OgrenimDuzeyi = keyof typeof OGRENIM_TIP_KODU;

async function fetchSayfa(params: Record<string, string>): Promise<string> {
  const url = `${KPSS_BASE}?${new URLSearchParams(params).toString()}`;
  const res = await fetch(url, {
    headers: { "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)" },
    signal: AbortSignal.timeout(15000),
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const buffer = await res.arrayBuffer();
  return new TextDecoder("iso-8859-9").decode(buffer);
}

type HamBolum = { kaynakId: string; ad: string; ogrenimDuzeyi: OgrenimDuzeyi };

function parseBolumSecenekleri(html: string, ogrenimDuzeyi: OgrenimDuzeyi): HamBolum[] {
  const selectMatch = html.match(/<select name="Branch"[^>]*>([\s\S]*?)<\/select>/);
  if (!selectMatch) return [];
  const bolumler: HamBolum[] = [];
  const optionRe = /<option value="([^"]+)">([^<]+)<\/option>/g;
  let m: RegExpExecArray | null;
  while ((m = optionRe.exec(selectMatch[1]))) {
    const [, kaynakId, ad] = m;
    if (!kaynakId) continue;
    bolumler.push({ kaynakId, ad: ad.trim(), ogrenimDuzeyi });
  }
  return bolumler;
}

type Satir = { sinifi: string; sutunlar: string[] };

function parseTablo(html: string): Satir[] {
  const tbodyMatch = html.match(/<tbody>([\s\S]*?)<\/tbody>/);
  if (!tbodyMatch) return [];
  const satirlar: Satir[] = [];
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

async function bolumVerisiCek(kaynakId: string, ogrenimDuzeyi: OgrenimDuzeyi) {
  const html = await fetchSayfa({ Type: OGRENIM_TIP_KODU[ogrenimDuzeyi], Branch: kaynakId });
  const satirlar = parseTablo(html);

  const yilToplam = new Map<number, number>();
  for (const s of satirlar) {
    if (s.sinifi === "genel") continue;
    const yil = Number(s.sinifi);
    yilToplam.set(yil, (yilToplam.get(yil) ?? 0) + parseKontenjan(s.sutunlar[2]));
  }
  const genelSatir = satirlar.find((s) => s.sinifi === "genel" && s.sutunlar[0] === "");

  return {
    yillikAlimlar: Array.from(yilToplam.entries()).map(([yil, kontenjan]) => ({ yil, kontenjan })),
    toplamKontenjan: genelSatir ? parseKontenjan(genelSatir.sutunlar[2]) : 0,
    minPuan: genelSatir ? parsePuan(genelSatir.sutunlar[4]) : null,
    maxPuan: genelSatir ? parsePuan(genelSatir.sutunlar[5]) : null,
  };
}

async function calisTopluHalde<T, R>(
  ogeler: T[],
  esZamanli: number,
  isle: (oge: T, index: number) => Promise<R>,
): Promise<void> {
  let sonrakiIndex = 0;
  async function isci() {
    while (sonrakiIndex < ogeler.length) {
      const index = sonrakiIndex++;
      await isle(ogeler[index], index);
    }
  }
  await Promise.all(Array.from({ length: esZamanli }, () => isci()));
}

async function main() {
  console.log("Bolum listeleri cekiliyor...");
  const duzeyler = Object.keys(OGRENIM_TIP_KODU) as OgrenimDuzeyi[];
  const sayfalar = await Promise.all(duzeyler.map((d) => fetchSayfa({ Type: OGRENIM_TIP_KODU[d] })));
  const hamBolumler = duzeyler.flatMap((d, i) => parseBolumSecenekleri(sayfalar[i], d));
  console.log(`Toplam ${hamBolumler.length} bolum bulundu.`);

  let tamamlanan = 0;
  let hatali = 0;

  await calisTopluHalde(hamBolumler, 8, async (b) => {
    const id = `${b.ogrenimDuzeyi}:${b.kaynakId}`;
    try {
      const veri = await bolumVerisiCek(b.kaynakId, b.ogrenimDuzeyi);
      await prisma.kpssBolum.upsert({
        where: { id },
        create: {
          id,
          ad: b.ad,
          ogrenimDuzeyi: b.ogrenimDuzeyi,
          toplamKontenjan: veri.toplamKontenjan,
          minPuan: veri.minPuan,
          maxPuan: veri.maxPuan,
        },
        update: {
          ad: b.ad,
          toplamKontenjan: veri.toplamKontenjan,
          minPuan: veri.minPuan,
          maxPuan: veri.maxPuan,
        },
      });
      for (const y of veri.yillikAlimlar) {
        await prisma.kpssYillikAlim.upsert({
          where: { bolumId_yil: { bolumId: id, yil: y.yil } },
          create: { bolumId: id, yil: y.yil, kontenjan: y.kontenjan },
          update: { kontenjan: y.kontenjan },
        });
      }
    } catch (e) {
      hatali++;
      console.error(`HATA: ${b.ad} (${id}) ->`, e instanceof Error ? e.message : e);
    }
    tamamlanan++;
    if (tamamlanan % 50 === 0) {
      console.log(`${tamamlanan}/${hamBolumler.length} tamamlandi (${hatali} hata)`);
    }
  });

  console.log(`Bitti. ${tamamlanan} bolum islendi, ${hatali} hata.`);
  await prisma.$disconnect();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});

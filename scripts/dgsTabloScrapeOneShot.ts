/**
 * TEK SEFERLIK: ÖSYM'nin resmi 2026-DGS kilavuzu TABLO-2'sini (onlisans ->
 * lisans dikey gecis eslesmeleri) PDF'in kendisinden (kullanicinin
 * Downloads'a koydugu dosya) parse eder.
 *
 * PDF'teki tablo, sutunlari BIRLESTIRILMIS (rowspan) hucrelerle cizildigi
 * icin duz metne dokulunce hangi onlisans satirinin hangi hedef grubuna
 * ait oldugu kaybolur. Bunu COZMEK icin METNE degil, PDF'in cizim
 * komutlarindaki GERCEK BLOK AYIRICI CIZGILERE bakiyoruz:
 *
 * Denendi ve BASARISIZ oldu: "ayni satirda hem sol hem sag metin var mi"
 * tekrar-sayisina (5/2/3) dayanan bir sezgisel - ardisik iki BAGIMSIZ
 * grup (ör. "3102 Aile Ekonomisi..." tek satirlik bir grup, hemen
 * ardindan gelen "1489 AKILLI ALTYAPILAR..." COK satirli baska bir
 * grup) birbirine YANLISLIKLA kaynastirabiliyordu, cunku ikisi de "hem
 * sol hem sag dolu" satirlarla basliyor ve aralarinda bu sezgisel bir
 * ayrim goremiyordu.
 *
 * GERCEK COZUM: PDF'te her blok sinirinda, tablo genislikte INCE bir
 * ayirici cizgi var - ama bu cizgi TEK bir dikdortgen degil, her sutun
 * genisliginde AYRI kucuk dikdortgen parcalari olarak ciziliyor (bu
 * yuzden "genislik>400" filtresiyle once kacirildi). Ayni y'deki tum
 * ince (yukseklik<1.5) parcalarin GENISLIKLERI TOPLANDIGINDA tablo
 * genisligine (~550pt) ulasiyorsa, o y bir GERCEK blok sinciridir.
 * Bu sinyal, page 1'deki TUM 7 bilinen (goz ile dogrulanmis) blok
 * sinirinda tam eslesti, blok ICI hicbir yanlis pozitif vermedi.
 *
 * Calistirma: npx tsx scripts/dgsTabloScrapeOneShot.ts
 *             DRY_RUN=1 npx tsx scripts/dgsTabloScrapeOneShot.ts   (sadece 1-3. sayfalari yazdirir, DB'ye dokunmaz)
 */
import "dotenv/config";
import fs from "fs";
import { getDocument, OPS } from "pdfjs-dist/legacy/build/pdf.mjs";
import { prisma } from "../src/lib/prisma";

const PDF_PATH =
  "C:/Users/emirh/Downloads/tablo-2-on-lisans-mezuniyet-alanlarina-gore-dikey-gecis-yapilabilecek-lisans-programlari-neb9zs-30102212.pdf";

// Ana TABLO-2 (onlisans -> lisans) bolumu bu sayfa araliginda; sonraki
// sayfalar ayri bir konu olan AOF (acikogretim) ozel gecis tablolaridir.
const ILK_SAYFA = 1;
const SON_SAYFA = 54;

const X = { kodMax: 50, adiMax: 270, hedefAdiMax: 500, hedefKoduMax: 545 };
const VERI_ALANI_UST_SINIR = 710; // bunun uzerindeki y'ler baslik satiridir

type Satir = { y: number; kod: string; adi: string; hedefAdi: string; hedefKodu: string; puanTuru: string };
type Grup = {
  onlisansKodlari: { kod: string; adi: string }[];
  hedefler: { adi: string; kod: string; puanTuru: string }[];
};

type PdfPage = Awaited<ReturnType<Awaited<ReturnType<typeof getDocument>["promise"]>["getPage"]>>;

async function sayfayiOku(page: PdfPage): Promise<{ satirlar: Satir[]; sinirYleri: number[] }> {
  const content = await page.getTextContent();
  const opList = await page.getOperatorList();

  // Blok sinir cizgileri: ayni y'deki ince parcalarin toplam genisligi tablo genisligine ulasiyor mu
  const incelerByY = new Map<string, number>();
  for (let i = 0; i < opList.fnArray.length; i++) {
    if (opList.fnArray[i] !== OPS.constructPath) continue;
    const mm = opList.argsArray[i][2];
    if (!mm) continue;
    const h = Math.abs(mm[3] - mm[1]);
    const w = Math.abs(mm[2] - mm[0]);
    if (h >= 1.5 || w <= 5) continue; // dikey noktali cizgi parcalarini (w kucuk) disla
    if (mm[1] >= VERI_ALANI_UST_SINIR) continue; // baslik alani
    const key = mm[1].toFixed(2);
    incelerByY.set(key, (incelerByY.get(key) ?? 0) + w);
  }
  const sinirYleri = [...incelerByY.entries()]
    .filter(([, toplamGenislik]) => toplamGenislik > 400)
    .map(([key]) => Number(key))
    .sort((a, b) => b - a);

  type Hucre = { y: number; x: number; str: string };
  const hucreler: Hucre[] = (content.items as { transform: number[]; str: string }[])
    .map((it): Hucre => ({ y: it.transform[5], x: it.transform[4], str: it.str }))
    .filter((h: Hucre) => h.str.trim() && h.y < VERI_ALANI_UST_SINIR && h.y > 60); // sayfa alt bilgisini (footer) disla

  const satirYleri: number[] = [];
  for (const h of hucreler) {
    if (!satirYleri.some((y) => Math.abs(y - h.y) < 1)) satirYleri.push(h.y);
  }
  satirYleri.sort((a, b) => b - a);

  const satirlar: Satir[] = [];
  for (const y of satirYleri) {
    const budaki = hucreler.filter((h) => Math.abs(h.y - y) < 1).sort((a, b) => a.x - b.x);
    const kod = budaki.filter((h) => h.x < X.kodMax).map((h) => h.str).join("").trim();
    const adi = budaki.filter((h) => h.x >= X.kodMax && h.x < X.adiMax).map((h) => h.str).join("").trim();
    const hedefAdi = budaki
      .filter((h) => h.x >= X.adiMax && h.x < X.hedefAdiMax)
      .map((h) => h.str)
      .join("")
      .trim();
    const hedefKodu = budaki
      .filter((h) => h.x >= X.hedefAdiMax && h.x < X.hedefKoduMax)
      .map((h) => h.str)
      .join("")
      .trim();
    const puanTuru = budaki.filter((h) => h.x >= X.hedefKoduMax).map((h) => h.str).join("").trim();
    if (kod || hedefAdi) satirlar.push({ y, kod, adi, hedefAdi, hedefKodu, puanTuru });
  }
  return { satirlar, sinirYleri };
}

/** Satirlari, aralarindaki gercek sinir cizgilerine gore gruplara boler. */
function gruplaBlok(satirlar: Satir[], sinirYleri: number[]): Grup[] {
  const gruplar: Grup[] = [];
  let mevcut: Satir[] = [];

  function kapat() {
    if (!mevcut.length) return;
    const g: Grup = { onlisansKodlari: [], hedefler: [] };
    for (const s of mevcut) {
      if (s.kod) g.onlisansKodlari.push({ kod: s.kod, adi: s.adi });
      if (s.hedefAdi) g.hedefler.push({ adi: s.hedefAdi, kod: s.hedefKodu, puanTuru: s.puanTuru });
    }
    gruplar.push(g);
    mevcut = [];
  }

  for (const s of satirlar) {
    // bu satirdan HEMEN once (yukarida) bir sinir cizgisi varsa yeni blok basliyor demektir
    const bukadarKapatilmaliMi = sinirYleri.some((sy) => sy < (mevcut.at(-1)?.y ?? Infinity) && sy > s.y);
    if (bukadarKapatilmaliMi) kapat();
    mevcut.push(s);
  }
  kapat();
  return gruplar;
}

async function main() {
  const dryRun = process.env.DRY_RUN === "1";
  const [dryIlk, drySon] = (process.env.DRY_RANGE ?? "1-3").split("-").map(Number);
  const ilkSayfa = dryRun ? dryIlk : ILK_SAYFA;
  const sonSayfa = dryRun ? drySon : SON_SAYFA;

  const dataBuf = new Uint8Array(fs.readFileSync(PDF_PATH));
  const doc = await getDocument({ data: dataBuf }).promise;
  console.log(`PDF yuklendi, ${doc.numPages} sayfa. ${ilkSayfa}-${sonSayfa} arasi isleniyor.`);

  const tumGruplar: Grup[] = [];
  for (let p = ilkSayfa; p <= sonSayfa; p++) {
    const page = await doc.getPage(p);
    const { satirlar, sinirYleri } = await sayfayiOku(page);
    const gruplar = gruplaBlok(satirlar, sinirYleri).filter(
      (g) => g.onlisansKodlari.length > 0 && g.hedefler.length > 0,
    );
    tumGruplar.push(...gruplar);
    if (p % 10 === 0) console.log(`${p} sayfa islendi, su ana kadar ${tumGruplar.length} grup.`);
  }

  console.log(`Toplam ${tumGruplar.length} grup bulundu.`);

  if (dryRun) {
    for (const g of tumGruplar) {
      console.log(
        g.onlisansKodlari.map((o) => `${o.kod} ${o.adi}`).join(" | "),
        "  ===>  ",
        g.hedefler.map((h) => `${h.adi}/${h.kod}/${h.puanTuru}`).join(" , "),
      );
    }
    return;
  }

  await prisma.dgsGecis.deleteMany({});
  let yazilan = 0;
  for (const g of tumGruplar) {
    for (const onlisans of g.onlisansKodlari) {
      for (const hedef of g.hedefler) {
        await prisma.dgsGecis.create({
          data: {
            onlisansKodu: onlisans.kod,
            onlisansAdi: onlisans.adi,
            lisansKodu: hedef.kod,
            lisansAdi: hedef.adi,
            puanTuru: hedef.puanTuru,
          },
        });
        yazilan++;
      }
    }
  }
  console.log(`Bitti. ${yazilan} satir yazildi.`);
  await prisma.$disconnect();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});

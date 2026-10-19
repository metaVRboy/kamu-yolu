import { prisma } from "@/lib/prisma";
import { bugununTarihi, getBugununDenemesi, kalipAnahtari } from "@/lib/kpssDeneme";

const DUZEYLER = ["LISANS", "ONLISANS", "LISE"] as const;
const GUN = 86_400_000;
// Uyari esikleri: dunku denemeyle ayni soru / ayni kalip (sayilari degismis hali) sayisi.
const ESIK_SORU = 3;
const ESIK_KALIP = 10;

export type TazelikSatiri = { duzey: (typeof DUZEYLER)[number]; toplam: number; ayniSoru: number; ayniKalip: number; son7Gun: number; ilkKez: number };

/**
 * Bugunun denemesi dunkunden ne kadar farkli: dunle ayni soru, dunku bir sorunun yalniz sayilari degismis hali
 * (ayni kalip), son 7 gunde cikmis soru ve hic cikmamis soru sayilari. Bugunun denemesi yoksa olusturulur.
 */
export async function tazelikRaporu(): Promise<TazelikSatiri[]> {
  const bugun = bugununTarihi();
  const satirlar: TazelikSatiri[] = [];
  for (const duzey of DUZEYLER) {
    const bugunku = await getBugununDenemesi(duzey);
    const gecmis = await prisma.gunlukDeneme.findMany({
      where: { duzey, tarih: { lt: bugun } },
      orderBy: { tarih: "desc" },
      select: { tarih: true, soruIdler: true },
    });
    const dun = gecmis.find((g) => g.tarih.getTime() === bugun.getTime() - GUN);
    const yediGun = new Set(gecmis.filter((g) => g.tarih.getTime() >= bugun.getTime() - 7 * GUN).flatMap((g) => g.soruIdler));
    const hepsi = new Set(gecmis.flatMap((g) => g.soruIdler));
    const dunIdler = new Set(dun?.soruIdler ?? []);
    const sorular = await prisma.denemeSoru.findMany({
      where: { id: { in: [...bugunku.soruIdler, ...dunIdler] } },
      select: { id: true, sablon: true, soruMetni: true, secenekler: true },
    });
    const kalip = new Map(sorular.map((s) => [s.id, kalipAnahtari(s)]));
    const dunKaliplar = new Set([...dunIdler].map((id) => kalip.get(id)));
    satirlar.push({
      duzey,
      toplam: bugunku.soruIdler.length,
      ayniSoru: bugunku.soruIdler.filter((id) => dunIdler.has(id)).length,
      ayniKalip: bugunku.soruIdler.filter((id) => !dunIdler.has(id) && dunKaliplar.has(kalip.get(id))).length,
      son7Gun: bugunku.soruIdler.filter((id) => yediGun.has(id)).length,
      ilkKez: bugunku.soruIdler.filter((id) => !hepsi.has(id)).length,
    });
  }
  return satirlar;
}

/** Raporu Taramalar sayfasina yazar; esik asilirsa FAILED (24 saat alarmi da buna bakar). */
export async function tazelikKaydet() {
  const baslangic = new Date();
  const satirlar = await tazelikRaporu();
  const asim = satirlar.filter((s) => s.ayniSoru > ESIK_SORU || s.ayniKalip > ESIK_KALIP);
  const ozet = satirlar.map((s) => `${s.duzey}: dünle aynı ${s.ayniSoru}, aynı kalıp ${s.ayniKalip}, son 7 günde çıkmış ${s.son7Gun}/${s.toplam}, ilk kez ${s.ilkKez}`).join(" · ");
  await prisma.scrapeRun.create({
    data: {
      sourceName: "KPSS deneme tazeliği",
      status: asim.length ? "FAILED" : "SUCCESS",
      startedAt: baslangic,
      finishedAt: new Date(),
      postingsFound: satirlar.reduce((t, s) => t + s.ayniSoru + s.ayniKalip, 0),
      errorMessage: (asim.length ? "Eşik aşıldı! " : "") + ozet,
    },
  });
  return satirlar;
}

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getResmiIstihdamSerisi } from "@/lib/resmiIstihdamIstatistikleri";
import { getBolumSiralamasi, getKpssBolumListesi, getKpssBolumVerisi, getKpssVeriAraligi, type OgrenimDuzeyi } from "@/lib/kpssIstatistik";
import { acikOgretimdeVarMi } from "@/lib/acikOgretimBolumleri";
import { getDgsHedefleri } from "@/lib/dgsGecis";
import { getPostingsForDepartment, normalize } from "@/lib/matching";
import { getHaberlerForDepartment } from "@/lib/haberler";

const DUZEYLER = ["LISE", "ONLISANS", "LISANS"];

/** Mobil alim analizi: sitedeki /analiz (SBB serisi, bolum karnesi, bolum siralamasi). */
export async function GET(req: NextRequest) {
  const p = req.nextUrl.searchParams;
  // Bolum secicinin listesi buyuk (~2 bin bolum): uygulama bir kez ayri ister.
  if (p.get("liste")) return NextResponse.json(await getKpssBolumListesi());
  const siraDuzey = p.get("siraDuzey");
  const [bolumler, aralik, siralama] = await Promise.all([
    getKpssBolumListesi(),
    getKpssVeriAraligi(),
    getBolumSiralamasi({
      baslangicYil: p.get("siraBaslangic") ? Number(p.get("siraBaslangic")) : undefined,
      bitisYil: p.get("siraBitis") ? Number(p.get("siraBitis")) : undefined,
      ogrenimDuzeyi: siraDuzey && DUZEYLER.includes(siraDuzey) ? (siraDuzey as OgrenimDuzeyi) : undefined,
      siralama: "cok",
    }),
  ]);

  const b = bolumler.find((x) => x.id === p.get("bolum"));
  let secili = null;
  if (b) {
    const [veri, duzeySiralamasi, departmanlar, dgs] = await Promise.all([
      getKpssBolumVerisi(b.id),
      // Karnedeki sira, bolumun kendi ogrenim duzeyindeki tum yillar toplamina gore.
      getBolumSiralamasi({ siralama: "cok", ogrenimDuzeyi: b.ogrenimDuzeyi }),
      prisma.department.findMany({ select: { id: true, name: true, slug: true } }),
      b.ogrenimDuzeyi === "ONLISANS" ? getDgsHedefleri(b.ad) : [],
    ]);
    const departman = departmanlar.find((d) => normalize(d.name) === normalize(b.ad)) ?? null;
    const [ilanlar, haberler] = departman ? await Promise.all([getPostingsForDepartment(departman.id), getHaberlerForDepartment(departman)]) : [[], []];
    const kendi = duzeySiralamasi.find((x) => x.id === b.id);
    secili = {
      ...b,
      yillik: (veri?.yillikAlimlar ?? []).map((y) => ({ yil: y.yil, kontenjan: y.kontenjan })),
      minPuan: veri?.minPuan ?? null,
      maxPuan: veri?.maxPuan ?? null,
      // Esit toplamli bolumler ayni sirayi paylasir.
      sira: kendi ? 1 + duzeySiralamasi.filter((x) => x.toplam > kendi.toplam).length : null,
      duzeyBolumSayisi: duzeySiralamasi.length,
      acikOgretim: acikOgretimdeVarMi(b.ad),
      dgs,
      departmanSlug: departman?.slug ?? null,
      aktifIlanSayisi: ilanlar.length,
      haberSayisi: haberler.length,
    };
  }

  return NextResponse.json({
    resmiSeri: getResmiIstihdamSerisi().map((s) => ({ yil: s.yil, donem: s.donem, toplamPersonel: s.toplamPersonel, netArtis: s.netArtis })),
    siralama,
    ilkYil: aralik.ilkYil,
    sonYil: aralik.sonYil,
    secili,
  });
}

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getDepartmentPostingCounts, getHomepageStats, getLatestPostings } from "@/lib/matching";
import { getYayindakiHaberler } from "@/lib/haberler";
import { kurumaGoreGrupla, kurumLogolari } from "@/lib/ilanVitrin";
import { haberKarti, ilanKarti } from "@/lib/mobil";

/** Mobil ana sayfa: sitedeki ana sayfanin verisi (istatistik, bolum arama listesi, haberler, kurum bazli yeni ilanlar). */
export async function GET() {
  const [latestPostings, haberler, bolumSatirlari, stats, ilanSayilari] = await Promise.all([
    getLatestPostings(120),
    getYayindakiHaberler(),
    prisma.department.findMany({ select: { id: true, slug: true, name: true, level: true }, orderBy: { name: "asc" } }),
    getHomepageStats(),
    getDepartmentPostingCounts(),
  ]);
  const gruplar = kurumaGoreGrupla(latestPostings, 6);
  const logolar = await kurumLogolari(gruplar.map((g) => g.ilk));
  return NextResponse.json({
    istatistik: { ilan: stats.postingCount, kurum: stats.institutionCount, bolum: stats.departmentCount },
    bolumler: bolumSatirlari.map((d) => ({ slug: d.slug, ad: d.name, duzey: d.level, ilanSayisi: ilanSayilari.get(d.id) ?? 0 })),
    haberler: haberler.slice(0, 5).map(haberKarti),
    haberSayisi: haberler.length,
    ilanlar: gruplar.map((g) => ilanKarti(g, logolar.get(g.ilk.institutionName) ?? null)),
  });
}

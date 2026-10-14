import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { duzeyIcinUret } from "@/lib/kpssSoruUretimi";

export const maxDuration = 300;

const KAYNAK = "KPSS soru üretimi";

/**
 * Gece KPSS soru uretimi (Vercel Cron): her duzeyde GECE_ADET soru uretip dogrular.
 * Taramalar sayfasinda gorunsun diye ScrapeRun kaydi tutar (postingsFound = uretilen,
 * positionsProcessed = eklenen); hicbir soru eklenemediyse ve hata varsa FAILED.
 */
export async function GET(req: NextRequest) {
  const sir = process.env.CRON_SECRET;
  if (!sir || req.headers.get("authorization") !== `Bearer ${sir}`) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  const run = await prisma.scrapeRun.create({ data: { sourceName: KAYNAK, status: "RUNNING" } });
  const sonuclar = await Promise.allSettled((["LISANS", "ONLISANS", "LISE"] as const).map(duzeyIcinUret));
  const ozet = sonuclar.map((s) => (s.status === "fulfilled" ? s.value : { hata: String(s.reason).slice(0, 300) }));
  const uretilen = ozet.reduce((t, o) => t + ("uretilen" in o ? o.uretilen : 0), 0);
  const eklenen = ozet.reduce((t, o) => t + ("eklenen" in o ? o.eklenen : 0), 0);
  const hatalar = ozet.flatMap((o) => ("hata" in o ? [o.hata] : o.hatalar));
  const basarisiz = eklenen === 0 && hatalar.length > 0;
  await prisma.scrapeRun.update({
    where: { id: run.id },
    data: {
      status: basarisiz ? "FAILED" : "SUCCESS",
      finishedAt: new Date(),
      postingsFound: uretilen,
      positionsProcessed: eklenen,
      unmatchedCount: uretilen - eklenen,
      errorMessage: hatalar.length ? hatalar.slice(0, 5).join(" | ").slice(0, 1000) : null,
    },
  });
  return NextResponse.json({ ok: !basarisiz, ozet }, { status: basarisiz ? 500 : 200 });
}

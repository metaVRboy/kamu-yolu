import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { topluDongu } from "@/lib/kpssSoruUretimi";

export const maxDuration = 300;

const KAYNAK = "KPSS soru üretimi";

/**
 * KPSS soru uretimi (Vercel Cron, 2 saatte bir): Gemini Batch islerini ilerletir (bkz. topluDongu).
 * Bir sey olduysa (is gonderildi/bitti ya da hata) Taramalar sayfasinda gorunsun diye ScrapeRun
 * kaydi tutar: postingsFound = dogrulamaya giden aday, positionsProcessed = eklenen. Bos calisma kaydedilmez.
 */
export async function GET(req: NextRequest) {
  const sir = process.env.CRON_SECRET;
  if (!sir || req.headers.get("authorization") !== `Bearer ${sir}`) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  const baslangic = new Date();
  let ozet;
  try {
    ozet = await topluDongu();
  } catch (e) {
    ozet = { uretilen: 0, eklenen: 0, gonderilen: 0, hatalar: [String(e).slice(0, 300)], tokenlar: [] };
  }
  const { uretilen, eklenen, gonderilen, hatalar, tokenlar } = ozet;
  if (!uretilen && !eklenen && !gonderilen && !hatalar.length && !tokenlar.length) return NextResponse.json({ ok: true, bos: true });
  const basarisiz = hatalar.length > 0 && !eklenen && !uretilen && !gonderilen;
  await prisma.scrapeRun.create({
    data: {
      sourceName: KAYNAK,
      status: basarisiz ? "FAILED" : "SUCCESS",
      startedAt: baslangic,
      finishedAt: new Date(),
      postingsFound: uretilen,
      positionsProcessed: eklenen,
      errorMessage: hatalar.length ? hatalar.slice(0, 5).join(" | ").slice(0, 1000) : null,
    },
  });
  return NextResponse.json({ ok: !basarisiz, ozet }, { status: basarisiz ? 500 : 200 });
}

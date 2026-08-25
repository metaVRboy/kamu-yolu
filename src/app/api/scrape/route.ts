import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { scrapeKariyerKapisi } from "@/scraper/scrapeKariyerKapisi";

export const maxDuration = 300;

function isAuthorized(req: NextRequest): boolean {
  const scrapeSecret = process.env.SCRAPE_SECRET;
  if (scrapeSecret && req.headers.get("x-scrape-secret") === scrapeSecret) {
    return true;
  }

  // Vercel Cron: GET + otomatik eklenen "Authorization: Bearer <CRON_SECRET>".
  // Vercel proje ayarlarinda CRON_SECRET tanimlanmissa bunu kullanir; yoksa
  // SCRAPE_SECRET ile de eslesebilir (ikisini ayni degere ayarlamak yeterli).
  const bearerSecret = process.env.CRON_SECRET ?? scrapeSecret;
  const auth = req.headers.get("authorization");
  if (bearerSecret && auth === `Bearer ${bearerSecret}`) return true;

  return false;
}

async function runScrape(req: NextRequest) {
  if (!isAuthorized(req)) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  try {
    const summary = await scrapeKariyerKapisi(prisma);
    return NextResponse.json({ ok: true, summary });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    const cause =
      err instanceof Error && err.cause instanceof Error
        ? err.cause.message
        : err instanceof Error
          ? err.cause
          : undefined;
    return NextResponse.json({ ok: false, error: message, cause }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  return runScrape(req);
}

// Vercel Cron istekleri GET olarak gelir.
export async function GET(req: NextRequest) {
  return runScrape(req);
}

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { fetchSecmeyemektarifleriMakaleleri } from "@/scraper/secmeyemektarifleriClient";
import { researchKamuAlimLeads } from "@/lib/kamuAlimLeadResearch";
import { haberleriEkleVeTekillestir } from "@/lib/haberDedupe";

export const maxDuration = 290;

// Tek calistirmada arastirilacak en fazla yeni lead sayisi - Gemini'ye tek
// seferde asiri buyuk bir liste vermemek ve maxDuration icinde kalmak icin.
const BATCH_SIZE = 12;

function isAuthorized(req: NextRequest): boolean {
  const secret = process.env.SCRAPE_SECRET;
  if (secret && req.headers.get("x-scrape-secret") === secret) return true;

  // Vercel Cron: GET + otomatik eklenen "Authorization: Bearer <CRON_SECRET>".
  const bearerSecret = process.env.CRON_SECRET ?? secret;
  const auth = req.headers.get("authorization");
  if (bearerSecret && auth === `Bearer ${bearerSecret}`) return true;

  return false;
}

async function runSecmeyemektarifleriHaberArastir(req: NextRequest) {
  if (!isAuthorized(req)) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  try {
    const makaleler = await fetchSecmeyemektarifleriMakaleleri();

    const islenenIdler = new Set(
      (
        await prisma.secmeyemektarifleriLeadIslendi.findMany({
          where: { externalId: { in: makaleler.map((m) => m.externalId) } },
          select: { externalId: true },
        })
      ).map((l) => l.externalId),
    );

    const yeniLeadler = makaleler
      .filter((m) => !islenenIdler.has(m.externalId))
      .slice(0, BATCH_SIZE)
      .map((m) => ({ externalId: m.externalId, baslik: m.baslik }));

    if (yeniLeadler.length === 0) {
      return NextResponse.json({
        ok: true,
        toplamLead: makaleler.length,
        yeniLead: 0,
        dogrulanan: 0,
        eklenenHaber: 0,
      });
    }

    const sonuclar = await researchKamuAlimLeads(yeniLeadler);

    const mevcutUrller = new Set(
      (await prisma.haber.findMany({ select: { kaynakUrl: true } }))
        .map((h) => h.kaynakUrl)
        .filter((u): u is string => !!u),
    );

    const yeniHaberler = sonuclar.filter(
      (s) => s.dogrulandi && s.resmiKaynakUrl && !mevcutUrller.has(s.resmiKaynakUrl),
    );

    const { eklenen, degistirilen } = await haberleriEkleVeTekillestir(
      yeniHaberler.map((s) => ({
        baslik: s.baslik!,
        ozet: s.ozet!,
        kaynakUrl: s.resmiKaynakUrl!,
        gorselUrl: s.gorselUrl,
        gorselLogoMu: s.gorselLogoMu,
        departmentIds: s.departmentIds,
      })),
    );

    // Denenen HER lead'i (dogrulanmis olsun olmasin) isaretle ki tekrar
    // tekrar arastirilmasin.
    await prisma.secmeyemektarifleriLeadIslendi.createMany({
      data: sonuclar.map((s) => ({ externalId: s.externalId, bulundu: s.dogrulandi })),
      skipDuplicates: true,
    });

    return NextResponse.json({
      ok: true,
      toplamLead: makaleler.length,
      yeniLead: yeniLeadler.length,
      dogrulanan: sonuclar.filter((s) => s.dogrulandi).length,
      eklenenHaber: eklenen,
      degistirilenHaber: degistirilen,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  return runSecmeyemektarifleriHaberArastir(req);
}

// Vercel Cron istekleri GET olarak gelir.
export async function GET(req: NextRequest) {
  return runSecmeyemektarifleriHaberArastir(req);
}

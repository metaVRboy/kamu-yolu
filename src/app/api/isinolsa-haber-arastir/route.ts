import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { fetchIsinolsaIlanlari } from "@/scraper/isinolsaClient";
import { researchIsinolsaLeads } from "@/lib/isinolsaHaberResearch";

export const maxDuration = 120;

// Tek calistirmada arastirilacak en fazla yeni lead sayisi - Claude'a tek
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

async function runIsinolsaHaberArastir(req: NextRequest) {
  if (!isAuthorized(req)) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  try {
    const ilanlar = await fetchIsinolsaIlanlari();

    const islenenIdler = new Set(
      (
        await prisma.isinolsaLeadIslendi.findMany({
          where: { externalId: { in: ilanlar.map((i) => i.externalId) } },
          select: { externalId: true },
        })
      ).map((l) => l.externalId),
    );

    const yeniLeadler = ilanlar
      .filter((i) => !islenenIdler.has(i.externalId))
      .slice(0, BATCH_SIZE)
      .map((i) => ({ externalId: i.externalId, kurumAdi: i.kurumAdi, baslik: i.baslik }));

    if (yeniLeadler.length === 0) {
      return NextResponse.json({
        ok: true,
        toplamLead: ilanlar.length,
        yeniLead: 0,
        dogrulanan: 0,
        eklenenHaber: 0,
      });
    }

    const sonuclar = await researchIsinolsaLeads(yeniLeadler);

    const mevcutUrller = new Set(
      (await prisma.haber.findMany({ select: { kaynakUrl: true } }))
        .map((h) => h.kaynakUrl)
        .filter((u): u is string => !!u),
    );

    const yeniHaberler = sonuclar.filter(
      (s) => s.dogrulandi && s.resmiKaynakUrl && !mevcutUrller.has(s.resmiKaynakUrl),
    );

    if (yeniHaberler.length > 0) {
      await prisma.haber.createMany({
        data: yeniHaberler.map((s) => ({
          baslik: s.baslik!,
          ozet: s.ozet!,
          kaynakUrl: s.resmiKaynakUrl!,
        })),
      });
    }

    // Denenen HER lead'i (dogrulanmis olsun olmasin) isaretle ki tekrar
    // tekrar arastirilmasin.
    await prisma.isinolsaLeadIslendi.createMany({
      data: sonuclar.map((s) => ({ externalId: s.externalId, bulundu: s.dogrulandi })),
      skipDuplicates: true,
    });

    return NextResponse.json({
      ok: true,
      toplamLead: ilanlar.length,
      yeniLead: yeniLeadler.length,
      dogrulanan: sonuclar.filter((s) => s.dogrulandi).length,
      eklenenHaber: yeniHaberler.length,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  return runIsinolsaHaberArastir(req);
}

// Vercel Cron istekleri GET olarak gelir.
export async function GET(req: NextRequest) {
  return runIsinolsaHaberArastir(req);
}

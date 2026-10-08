import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { adminApi } from "@/lib/admin";
import { fetchIsinolsaIlanlari } from "@/scraper/isinolsaClient";
import { fetchSecmeyemektarifleriMakaleleri } from "@/scraper/secmeyemektarifleriClient";
import { researchKamuAlimLeads, type KamuAlimLead } from "@/lib/kamuAlimLeadResearch";
import { haberleriEkleVeTekillestir } from "@/lib/haberDedupe";

export const maxDuration = 290;

// Her kaynaktan tek calistirmada arastirilacak en fazla yeni lead sayisi -
// Gemini'ye tek seferde asiri buyuk bir liste vermemek ve maxDuration
// icinde kalmak icin. Iki kaynak TEK Gemini cagrisinda birlikte
// arastirilir (bkz. asagisi) - googleSearch grounding istek basina
// ucretlendirildigi icin, ayri ayri iki cagri yerine tek cagri maliyeti
// yariya indirir.
const BATCH_SIZE_PER_KAYNAK = 8;

function isAuthorized(req: NextRequest): boolean {
  const secret = process.env.SCRAPE_SECRET;
  if (secret && req.headers.get("x-scrape-secret") === secret) return true;

  // Vercel Cron: GET + otomatik eklenen "Authorization: Bearer <CRON_SECRET>".
  const bearerSecret = process.env.CRON_SECRET ?? secret;
  const auth = req.headers.get("authorization");
  if (bearerSecret && auth === `Bearer ${bearerSecret}`) return true;

  return false;
}

async function runKamuAlimHaberArastir(req: NextRequest) {
  // Admin panelindeki "Şimdi araştır" butonu admin oturumuyla cagirir.
  if (!isAuthorized(req) && !(req.method === "POST" && (await adminApi()))) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  try {
    const [ilanlar, makaleler] = await Promise.all([
      fetchIsinolsaIlanlari(),
      fetchSecmeyemektarifleriMakaleleri(),
    ]);

    const [islenenIsinolsaIdler, islenenSecmeIdler] = await Promise.all([
      prisma.isinolsaLeadIslendi
        .findMany({
          where: { externalId: { in: ilanlar.map((i) => i.externalId) } },
          select: { externalId: true },
        })
        .then((rows) => new Set(rows.map((l) => l.externalId))),
      prisma.secmeyemektarifleriLeadIslendi
        .findMany({
          where: { externalId: { in: makaleler.map((m) => m.externalId) } },
          select: { externalId: true },
        })
        .then((rows) => new Set(rows.map((l) => l.externalId))),
    ]);

    const yeniIsinolsaLeadleri: KamuAlimLead[] = ilanlar
      .filter((i) => !islenenIsinolsaIdler.has(i.externalId))
      .slice(0, BATCH_SIZE_PER_KAYNAK)
      .map((i) => ({ externalId: i.externalId, kurumAdi: i.kurumAdi, baslik: i.baslik }));

    const yeniSecmeLeadleri: KamuAlimLead[] = makaleler
      .filter((m) => !islenenSecmeIdler.has(m.externalId))
      .slice(0, BATCH_SIZE_PER_KAYNAK)
      .map((m) => ({ externalId: m.externalId, baslik: m.baslik }));

    const tumYeniLeadler = [...yeniIsinolsaLeadleri, ...yeniSecmeLeadleri];

    if (tumYeniLeadler.length === 0) {
      return NextResponse.json({
        ok: true,
        toplamLead: ilanlar.length + makaleler.length,
        yeniLead: 0,
        dogrulanan: 0,
        eklenenHaber: 0,
      });
    }

    const sonuclar = await researchKamuAlimLeads(tumYeniLeadler);

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
        detay: s.detay,
      })),
    );

    // Denenen HER lead'i (dogrulanmis olsun olmasin) kendi kaynagininin
    // tablosunda isaretle ki tekrar tekrar arastirilmasin. ExternalId
    // onekine (isinolsa:/secmeyemektarifleri:) gore ayristiriliyor.
    const isinolsaSonuclari = sonuclar.filter((s) => s.externalId.startsWith("isinolsa:"));
    const secmeSonuclari = sonuclar.filter((s) => s.externalId.startsWith("secmeyemektarifleri:"));

    await Promise.all([
      prisma.isinolsaLeadIslendi.createMany({
        data: isinolsaSonuclari.map((s) => ({ externalId: s.externalId, bulundu: s.dogrulandi })),
        skipDuplicates: true,
      }),
      prisma.secmeyemektarifleriLeadIslendi.createMany({
        data: secmeSonuclari.map((s) => ({ externalId: s.externalId, bulundu: s.dogrulandi })),
        skipDuplicates: true,
      }),
    ]);

    return NextResponse.json({
      ok: true,
      toplamLead: ilanlar.length + makaleler.length,
      yeniLead: tumYeniLeadler.length,
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
  return runKamuAlimHaberArastir(req);
}

// Vercel Cron istekleri GET olarak gelir.
export async function GET(req: NextRequest) {
  return runKamuAlimHaberArastir(req);
}

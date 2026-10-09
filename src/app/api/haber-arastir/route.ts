import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { adminApi } from "@/lib/admin";
import { islemKaydet } from "@/lib/islemKaydi";
import { researchHaberler } from "@/lib/haberResearch";
import { haberleriEkleVeTekillestir } from "@/lib/haberDedupe";

export const maxDuration = 290;

function isAuthorized(req: NextRequest): boolean {
  const secret = process.env.SCRAPE_SECRET;
  if (secret && req.headers.get("x-scrape-secret") === secret) return true;

  // Vercel Cron: GET + otomatik eklenen "Authorization: Bearer <CRON_SECRET>".
  const bearerSecret = process.env.CRON_SECRET ?? secret;
  const auth = req.headers.get("authorization");
  if (bearerSecret && auth === `Bearer ${bearerSecret}`) return true;

  return false;
}

async function runHaberArastir(req: NextRequest) {
  // Admin panelindeki "Şimdi araştır" butonu admin oturumuyla cagirir.
  if (!isAuthorized(req)) {
    const admin = req.method === "POST" ? await adminApi() : null;
    if (!admin) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
    await islemKaydet(admin, "tarama.calistir", "Haber araştırması", "/admin/taramalar");
  }

  try {
    const bulunanlar = await researchHaberler();

    const mevcutUrller = new Set(
      (await prisma.haber.findMany({ select: { kaynakUrl: true } }))
        .map((h) => h.kaynakUrl)
        .filter((u): u is string => !!u),
    );

    const yeniler = bulunanlar.filter((h) => !mevcutUrller.has(h.kaynakUrl));
    const { eklenen, degistirilen } = await haberleriEkleVeTekillestir(yeniler);

    return NextResponse.json({
      ok: true,
      bulunan: bulunanlar.length,
      eklenen,
      degistirilen,
      atlanan: bulunanlar.length - yeniler.length,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  return runHaberArastir(req);
}

// Vercel Cron istekleri GET olarak gelir.
export async function GET(req: NextRequest) {
  return runHaberArastir(req);
}

import { NextResponse } from "next/server";
import { getAktifTalepler } from "@/lib/becayis";

/** Mobil becayis listesi: sitedeki /becayis. */
export async function GET() {
  const talepler = await getAktifTalepler();
  return NextResponse.json({
    ilSayisi: new Set(talepler.map((t) => t.mevcutIl)).size,
    talepler: talepler.map((t) => ({ id: t.id, meslek: t.meslek, kurumTuru: t.kurumTuru, mevcutIl: t.mevcutIl, mevcutIlce: t.mevcutIlce, istenenIller: t.istenenIller })),
  });
}

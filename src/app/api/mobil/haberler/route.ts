import { NextResponse } from "next/server";
import { getYayindakiHaberler } from "@/lib/haberler";
import { sonGunlerdeYayinlanan } from "@/lib/haberYayin";
import { haberKarti } from "@/lib/mobil";

export async function GET() {
  const haberler = await getYayindakiHaberler();
  return NextResponse.json({ buHafta: sonGunlerdeYayinlanan(haberler), haberler: haberler.map(haberKarti) });
}

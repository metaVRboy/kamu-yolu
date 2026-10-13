import { NextRequest, NextResponse } from "next/server";
import { suresiDolanYasalKayitlariSil } from "@/lib/yasalKayit";

/**
 * Gunluk bakim (Vercel Cron): saklama suresi dolan yasal kayitlari siler
 * (5651 trafik kaydi 2 yil, hesap silme kaydi 3 yil; sonra KVKK geregi tutulmaz).
 */
export async function GET(req: NextRequest) {
  const sir = process.env.CRON_SECRET;
  if (!sir || req.headers.get("authorization") !== `Bearer ${sir}`) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  const silinen = await suresiDolanYasalKayitlariSil();
  return NextResponse.json({ ok: true, silinen });
}

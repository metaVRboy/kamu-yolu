import { NextRequest, NextResponse } from "next/server";
import { suresiDolanYasalKayitlariSil } from "@/lib/yasalKayit";
import { tazelikKaydet } from "@/lib/kpssTazelik";

/**
 * Gunluk bakim (Vercel Cron, 04:00 TR): saklama suresi dolan yasal kayitlari siler (5651 trafik kaydi 2 yil,
 * hesap silme kaydi 3 yil; sonra KVKK geregi tutulmaz). Gunun KPSS denemelerini ilk ziyaretciden once
 * olusturur ve dunkulerden farkini (tazelik) Taramalar sayfasina yazar.
 */
export async function GET(req: NextRequest) {
  const sir = process.env.CRON_SECRET;
  if (!sir || req.headers.get("authorization") !== `Bearer ${sir}`) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  const silinen = await suresiDolanYasalKayitlariSil();
  const tazelik = await tazelikKaydet().catch((e) => String(e).slice(0, 300));
  return NextResponse.json({ ok: true, silinen, tazelik });
}

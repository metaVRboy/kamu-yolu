import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { getTalepDetay } from "@/lib/becayis";

/** Mobil becayis detayi: sitedeki /becayis/[id] (mesajlasma Pro; mesaj API'si de ayrica kontrol eder). */
export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const [talep, user] = await Promise.all([params.then(({ id }) => getTalepDetay(id)), getCurrentUser()]);
  if (!talep || !talep.isActive) return NextResponse.json({ error: "Talep bulunamadı." }, { status: 404 });
  return NextResponse.json({
    id: talep.id,
    meslek: talep.meslek,
    kurumTuru: talep.kurumTuru,
    mevcutIl: talep.mevcutIl,
    mevcutIlce: talep.mevcutIlce,
    istenenIller: talep.istenenIller,
    aciklama: talep.aciklama,
    sahipAd: talep.user.adSoyad,
    sahibi: user?.id === talep.userId,
  });
}

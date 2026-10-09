import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { getIlgilendiklerim } from "@/lib/becayis";

/** Mobil "Ilgilendigim Ilanlar": kullanicinin mesaj attigi baskasinin talepleri. */
export async function GET() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Giriş yapmalısınız." }, { status: 401 });
  const liste = await getIlgilendiklerim(user.id);
  return NextResponse.json({
    kullaniciId: user.id,
    talepler: liste.map((t) => ({
      id: t.id,
      meslek: t.meslek,
      mevcutIl: t.mevcutIl,
      mevcutIlce: t.mevcutIlce,
      istenenIller: t.istenenIller,
      isActive: t.isActive,
      ilanSahibiAdSoyad: t.ilanSahibiAdSoyad,
      okunmamisSayisi: t.okunmamisSayisi,
      mesajlar: t.mesajlar.map((m) => ({ id: m.id, gonderenId: m.gonderenId, mesaj: m.mesaj, createdAt: m.createdAt.toISOString(), sikayetEdildi: !!m.sikayetEdildi })),
    })),
  });
}

import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { getTaleplerim, karsilikliEslesmeler } from "@/lib/becayis";
import { proAktifMi } from "@/lib/sms";

/** Mobil "Mevcut Taleplerim": kullanicinin talepleri ve her talepteki sohbetler. */
export async function GET() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Giriş yapmalısınız." }, { status: 401 });
  const talepler = await getTaleplerim(user.id);
  const eslesmeler = await karsilikliEslesmeler(talepler, user.id);
  return NextResponse.json({
    kullaniciId: user.id,
    // Karsilikli eslesmeyi herkes gorur; mesaj atmak Pro (sitedeki gibi).
    pro: proAktifMi(user),
    talepler: talepler.map((t) => ({
      id: t.id,
      meslek: t.meslek,
      mevcutIl: t.mevcutIl,
      mevcutIlce: t.mevcutIlce,
      istenenIller: t.istenenIller,
      isActive: t.isActive,
      goruntulenme: t.goruntulenme,
      eslesmeler: eslesmeler.get(t.id) ?? [],
      threads: t.threads.map((th) => ({
        karsiId: th.karsiId,
        karsiAdSoyad: th.karsiAdSoyad,
        okunmamisSayisi: th.okunmamisSayisi,
        mesajlar: th.mesajlar.map((m) => ({ id: m.id, gonderenId: m.gonderenId, mesaj: m.mesaj, createdAt: m.createdAt.toISOString(), sikayetEdildi: !!m.sikayetEdildi })),
      })),
    })),
  });
}

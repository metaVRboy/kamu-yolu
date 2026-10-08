import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import {
  deleteTumBildirimler,
  getBanaOzelBildirimler,
  getGenelDuyurular,
  getOkunmamisBildirimSayisi,
} from "@/lib/notifications";
import { proAktifMi } from "@/lib/sms";

export async function GET() {
  const user = await getCurrentUser();
  // Kisisel bildirimler Pro; genel duyurular herkese. Ucretsizde eski kisisel
  // bildirimler de gonderilmez (panelde bulanik ornek gosterilir).
  const pro = !!user && proAktifMi(user);

  const [genel, banaOzel, okunmamisSayisi] = await Promise.all([
    getGenelDuyurular(),
    pro ? getBanaOzelBildirimler(user.id) : Promise.resolve([]),
    pro ? getOkunmamisBildirimSayisi(user.id) : Promise.resolve(0),
  ]);

  return NextResponse.json({ genel, banaOzel, okunmamisSayisi, plan: user?.abonelikPlani ?? null, banaOzelKilitli: !!user && !pro });
}

export async function DELETE() {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Giriş yapmalısınız." }, { status: 401 });
  }

  await deleteTumBildirimler(user.id);
  return NextResponse.json({ ok: true });
}

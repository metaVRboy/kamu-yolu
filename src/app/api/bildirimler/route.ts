import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { deleteTumBildirimler, getBanaOzelBildirimler, getOkunmamisBildirimSayisi, kullaniciDuyurulari } from "@/lib/notifications";
import { proAktifMi } from "@/lib/sms";

export async function GET() {
  const user = await getCurrentUser();
  // Kisisel bildirimler Pro; genel duyurular (hedefine uyanlar) herkese. Ucretsizde eski
  // kisisel bildirimler de gonderilmez (panelde bulanik ornek gosterilir).
  const pro = !!user && proAktifMi(user);

  const [duyurular, banaOzel, bildirimOkunmamis] = await Promise.all([
    kullaniciDuyurulari(user),
    pro ? getBanaOzelBildirimler(user.id) : Promise.resolve([]),
    pro ? getOkunmamisBildirimSayisi(user.id) : Promise.resolve(0),
  ]);
  // Zili en son actigindan sonra yayinlanan duyurular okunmamis sayilir (kirmizi nokta).
  const sonGorulme = user ? (user.duyuruGorulme ?? user.createdAt).getTime() : Infinity;
  const duyuruOkunmamis = duyurular.filter((d) => d.yayinZamani.getTime() > sonGorulme).length;

  return NextResponse.json({
    genel: duyurular.slice(0, 30).map((d) => ({ id: d.id, baslik: d.baslik, icerik: d.icerik, link: d.link, createdAt: d.yayinZamani })),
    banaOzel,
    okunmamisSayisi: bildirimOkunmamis + duyuruOkunmamis,
    plan: user?.abonelikPlani ?? null,
    banaOzelKilitli: !!user && !pro,
  });
}

export async function DELETE() {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Giriş yapmalısınız." }, { status: 401 });
  }

  await deleteTumBildirimler(user.id);
  return NextResponse.json({ ok: true });
}

import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { getFiyatlar } from "@/lib/fiyatlar";
import { kalanGunSayisi } from "@/lib/ilanVitrin";

const TARIH = new Intl.DateTimeFormat("tr-TR", { day: "numeric", month: "long", year: "numeric", timeZone: "Europe/Istanbul" });

/** Mobil "Aboneligim": sitedeki /profilim/abonelik. */
export async function GET() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Giriş yapmalısınız." }, { status: 401 });
  return NextResponse.json({
    plan: user.abonelikPlani, // getCurrentUser suresi dolani UCRETSIZ dondurur
    bitis: user.abonelikBitis ? TARIH.format(user.abonelikBitis) : null,
    kalanGun: kalanGunSayisi(user.abonelikBitis),
    otomatikYenileme: user.otomatikYenileme,
    fiyat: await getFiyatlar(),
  });
}

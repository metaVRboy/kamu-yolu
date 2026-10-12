import { NextResponse } from "next/server";
import { getCurrentUser, googleBaglaJetonu } from "@/lib/auth";

/**
 * Mobil uygulama: Google baglama tarayicida yapilir ve tarayicinin site oturumu yoktur.
 * Uygulama bu kisa omurlu (3 dk), yalniz "google-bagla" amacli jetonu alip
 * /api/auth/google?bagla=<jeton>&uygulama=1 adresini acar.
 */
export async function POST() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Giriş yapmalısınız." }, { status: 401 });
  return NextResponse.json({ kod: await googleBaglaJetonu(user.id, 180) });
}

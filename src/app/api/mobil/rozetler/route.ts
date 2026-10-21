import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { rozetDurumu } from "@/lib/rozetler";

/** Mobil "Rozetlerim" (sitedeki /profilim/rozetler): rozetler gercek kayitlardan hesaplanir. */
export async function GET() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Giriş yapmalısın." }, { status: 401 });
  const { rozetler } = await rozetDurumu(user);
  return NextResponse.json({ plan: user.abonelikPlani, rozetler: rozetler.map(({ id, ad, aciklama, renk, kazanildi }) => ({ id, ad, aciklama, renk, kazanildi })) });
}

import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import {
  deleteTumBildirimler,
  getBanaOzelBildirimler,
  getGenelDuyurular,
  getOkunmamisBildirimSayisi,
} from "@/lib/notifications";

export async function GET() {
  const user = await getCurrentUser();

  const [genel, banaOzel, okunmamisSayisi] = await Promise.all([
    getGenelDuyurular(),
    user ? getBanaOzelBildirimler(user.id) : Promise.resolve([]),
    user ? getOkunmamisBildirimSayisi(user.id) : Promise.resolve(0),
  ]);

  return NextResponse.json({ genel, banaOzel, okunmamisSayisi });
}

export async function DELETE() {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Giriş yapmalısınız." }, { status: 401 });
  }

  await deleteTumBildirimler(user.id);
  return NextResponse.json({ ok: true });
}

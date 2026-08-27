import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { getBanaOzelBildirimler, getGenelDuyurular, getOkunmamisBildirimSayisi } from "@/lib/notifications";

export async function GET() {
  const user = await getCurrentUser();

  const [genel, banaOzel, okunmamisSayisi] = await Promise.all([
    getGenelDuyurular(),
    user ? getBanaOzelBildirimler(user.id) : Promise.resolve([]),
    user ? getOkunmamisBildirimSayisi(user.id) : Promise.resolve(0),
  ]);

  return NextResponse.json({ genel, banaOzel, okunmamisSayisi });
}

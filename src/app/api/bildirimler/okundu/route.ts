import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { markBildirimlerOkundu } from "@/lib/notifications";

export async function POST() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Giriş yapmalısınız." }, { status: 401 });

  await markBildirimlerOkundu(user.id);
  return NextResponse.json({ ok: true });
}

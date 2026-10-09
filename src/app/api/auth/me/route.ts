import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { proAktifMi } from "@/lib/sms";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ user: null });
  return NextResponse.json({
    user: {
      id: user.id,
      adSoyad: user.adSoyad,
      email: user.email,
      isAdmin: user.isAdmin,
      // Uygulama icin etkin plan (suresi dolmus abonelik ucretsiz sayilir).
      plan: proAktifMi(user) ? user.abonelikPlani : "UCRETSIZ",
    },
  });
}

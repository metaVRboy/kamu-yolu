import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getCurrentUser } from "@/lib/auth";
import { DenemeHakkiDolduError, getBugununDenemesi, girisVeyaDevamEt } from "@/lib/kpssDeneme";
import { gecerliDenemeDuzeyiMi } from "@/lib/kpssDenemeSabitler";

const bodySchema = z.object({ duzey: z.string() });

export async function POST(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Giriş yapmalısınız." }, { status: 401 });
  }

  const parsed = bodySchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success || !gecerliDenemeDuzeyiMi(parsed.data.duzey)) {
    return NextResponse.json({ error: "Geçersiz düzey." }, { status: 400 });
  }

  try {
    const gunlukDeneme = await getBugununDenemesi(parsed.data.duzey);
    const katilim = await girisVeyaDevamEt(user.id, user.abonelikPlani, gunlukDeneme.id);
    return NextResponse.json({ katilimId: katilim.id });
  } catch (e) {
    if (e instanceof DenemeHakkiDolduError) return NextResponse.json({ error: e.message }, { status: 403 });
    return NextResponse.json({ error: e instanceof Error ? e.message : "Sınav başlatılamadı." }, { status: 500 });
  }
}

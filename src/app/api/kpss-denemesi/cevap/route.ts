import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getCurrentUser } from "@/lib/auth";
import { cevapKaydet } from "@/lib/kpssDeneme";

const bodySchema = z.object({
  katilimId: z.string().min(1),
  soruId: z.string().min(1),
  secenekIndex: z.number().int().min(0).max(4),
});

export async function POST(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Giriş yapmalısınız." }, { status: 401 });
  }

  const parsed = bodySchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Geçersiz bilgiler." }, { status: 400 });
  }

  try {
    await cevapKaydet(parsed.data.katilimId, user.id, parsed.data.soruId, parsed.data.secenekIndex);
    return NextResponse.json({ ok: true });
  } catch (e) {
    if (e instanceof Error && e.message === "UNAUTHORIZED") {
      return NextResponse.json({ error: "Yetkiniz yok." }, { status: 403 });
    }
    if (e instanceof Error && e.message === "SINAV_BITTI") {
      return NextResponse.json({ error: "Sınav süresi doldu veya bitirildi." }, { status: 409 });
    }
    return NextResponse.json({ error: "Cevap kaydedilemedi." }, { status: 500 });
  }
}

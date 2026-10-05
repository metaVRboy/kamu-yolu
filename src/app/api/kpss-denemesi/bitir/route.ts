import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getCurrentUser } from "@/lib/auth";
import { denemeyiBitir } from "@/lib/kpssDeneme";

const bodySchema = z.object({ katilimId: z.string().min(1) });

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
    await denemeyiBitir(parsed.data.katilimId, user.id);
    return NextResponse.json({ ok: true });
  } catch (e) {
    if (e instanceof Error && e.message === "UNAUTHORIZED") {
      return NextResponse.json({ error: "Yetkiniz yok." }, { status: 403 });
    }
    return NextResponse.json({ error: "Sınav bitirilemedi." }, { status: 500 });
  }
}

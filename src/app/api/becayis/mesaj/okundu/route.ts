import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getCurrentUser } from "@/lib/auth";
import { markThreadOkundu } from "@/lib/becayis";

const bodySchema = z.object({
  talepId: z.string().min(1),
  karsiId: z.string().min(1),
});

export async function POST(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Giriş yapmalısınız." }, { status: 401 });

  const parsed = bodySchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Geçersiz bilgiler." }, { status: 400 });
  }

  await markThreadOkundu(parsed.data.talepId, parsed.data.karsiId, user.id);
  return NextResponse.json({ ok: true });
}

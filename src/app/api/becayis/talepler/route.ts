import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getCurrentUser } from "@/lib/auth";
import { createTalep } from "@/lib/becayis";
import { TURKIYE_ILLERI } from "@/lib/iller";

const bodySchema = z.object({
  meslek: z.string().trim().min(2).max(80),
  kurumTuru: z.string().trim().max(80).optional(),
  mevcutIl: z.enum(TURKIYE_ILLERI),
  mevcutIlce: z.string().trim().max(60).optional(),
  istenenIller: z.array(z.enum(TURKIYE_ILLERI)).min(1).max(10),
  aciklama: z.string().trim().max(1000).optional(),
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

  const talep = await createTalep(user.id, parsed.data);
  return NextResponse.json({ id: talep.id });
}

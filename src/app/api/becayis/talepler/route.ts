import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getCurrentUser } from "@/lib/auth";
import { createTalep } from "@/lib/becayis";
import { TURKIYE_ILLERI } from "@/lib/iller";
import { KURUM_TURLERI, meslekSecenekleri } from "@/lib/kurumMeslek";

const bodySchema = z
  .object({
    kurumTuru: z.enum(KURUM_TURLERI as [string, ...string[]]),
    meslek: z.string().trim().min(2).max(80),
    mevcutIl: z.enum(TURKIYE_ILLERI),
    mevcutIlce: z.string().trim().max(60).optional(),
    istenenIller: z.array(z.enum(TURKIYE_ILLERI)).min(1).max(10),
    aciklama: z.string().trim().max(1000).optional(),
  })
  .refine((data) => meslekSecenekleri(data.kurumTuru).includes(data.meslek), {
    message: "Seçilen meslek, seçilen kurum türüyle uyuşmuyor.",
    path: ["meslek"],
  });

export async function POST(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Giriş yapmalısınız." }, { status: 401 });
  }

  const parsed = bodySchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Geçersiz bilgiler." },
      { status: 400 },
    );
  }

  const talep = await createTalep(user.id, parsed.data);
  return NextResponse.json({ id: talep.id });
}

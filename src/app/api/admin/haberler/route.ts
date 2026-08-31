import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const bodySchema = z.object({
  baslik: z.string().trim().min(2).max(160),
  ozet: z.string().trim().min(2).max(2000),
  kaynakUrl: z.string().trim().url().max(500).optional().or(z.literal("")),
  gorselUrl: z.string().trim().url().max(500).optional().or(z.literal("")),
});

export async function POST(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user?.isAdmin) {
    return NextResponse.json({ error: "Yetkiniz yok." }, { status: 403 });
  }

  const parsed = bodySchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Geçersiz bilgiler." },
      { status: 400 },
    );
  }

  const haber = await prisma.haber.create({
    data: {
      baslik: parsed.data.baslik,
      ozet: parsed.data.ozet,
      kaynakUrl: parsed.data.kaynakUrl || null,
      gorselUrl: parsed.data.gorselUrl || null,
    },
  });
  return NextResponse.json({ id: haber.id });
}

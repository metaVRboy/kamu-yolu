import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const bodySchema = z.object({ onay: z.boolean() });

/** Kampanya/duyuru (ticari elektronik ileti) onayi: her plan verebilir, istedigi an geri ceker. */
export async function PATCH(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Giriş yapmalısınız." }, { status: 401 });

  const parsed = bodySchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Geçersiz bilgiler." }, { status: 400 });

  const { onay } = parsed.data;
  const guncel = await prisma.user.update({
    where: { id: user.id },
    // Onay ve ret anlari ayri saklanir: geri cekilse de verilen onayin kaydi kalir.
    data: { ticariIletiOnay: onay, ...(onay ? { ticariIletiOnayTarihi: new Date() } : { ticariIletiRetTarihi: new Date() }) },
    select: { ticariIletiOnay: true },
  });
  return NextResponse.json(guncel);
}

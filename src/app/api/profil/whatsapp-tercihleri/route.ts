import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { proAktifMi } from "@/lib/whatsapp";

const bodySchema = z.object({
  whatsappIlanBildirimi: z.boolean().optional(),
  whatsappBecayisBildirimi: z.boolean().optional(),
});

/** WhatsApp bildirim tercihleri. Acmak icin Pro + dogrulanmis telefon gerekir; kapatmak her zaman serbest. */
export async function PATCH(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Giriş yapmalısınız." }, { status: 401 });

  const parsed = bodySchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Geçersiz bilgiler." }, { status: 400 });

  const aciliyor = parsed.data.whatsappIlanBildirimi === true || parsed.data.whatsappBecayisBildirimi === true;
  if (aciliyor && !proAktifMi(user)) {
    return NextResponse.json({ error: "WhatsApp bildirimleri Pro üyelere özeldir." }, { status: 403 });
  }
  if (aciliyor && !user.telefonDogrulandi) {
    return NextResponse.json({ error: "Önce telefon numaranı doğrulamalısın." }, { status: 400 });
  }

  const guncel = await prisma.user.update({
    where: { id: user.id },
    // Ilk acilis ani onay kaydi olarak saklanir.
    data: { ...parsed.data, ...(aciliyor && !user.whatsappIzinTarihi ? { whatsappIzinTarihi: new Date() } : {}) },
    select: { whatsappIlanBildirimi: true, whatsappBecayisBildirimi: true },
  });
  return NextResponse.json(guncel);
}

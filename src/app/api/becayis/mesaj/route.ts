import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getCurrentUser } from "@/lib/auth";
import { getTalepDetay, sendMesaj } from "@/lib/becayis";

const bodySchema = z.object({
  talepId: z.string().min(1),
  // Talep sahibi cevap verirken hangi konusmaya (hangi kullaniciya) cevap
  // verdigini belirtmek icin gonderir; talep sahibi olmayan biri icin bu
  // alan gerekmez (konusmaKarsi kendisi olur).
  konusmaKarsiId: z.string().min(1).optional(),
  mesaj: z.string().trim().min(1).max(2000),
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
  const { talepId, mesaj } = parsed.data;

  const talep = await getTalepDetay(talepId);
  if (!talep || !talep.isActive) {
    return NextResponse.json({ error: "Talep bulunamadı." }, { status: 404 });
  }

  const isSahibi = talep.userId === user.id;
  if (isSahibi && !parsed.data.konusmaKarsiId) {
    return NextResponse.json(
      { error: "Hangi konuşmaya cevap verdiğiniz belirtilmedi." },
      { status: 400 },
    );
  }

  const konusmaKarsiId = isSahibi ? parsed.data.konusmaKarsiId! : user.id;

  const created = await sendMesaj({
    talepId,
    gonderenId: user.id,
    konusmaKarsiId,
    mesaj,
  });

  return NextResponse.json({ id: created.id });
}

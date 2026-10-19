import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getAktifOturumId, getCurrentUser, googleBaglaJetonuCoz, googleHesabiBagla } from "@/lib/auth";

const bodySchema = z.object({ onay: z.string().min(1) });

/** Mobil Google baglamanin son adimi: onay jetonu yalniz onu baslatan uygulama oturumundan kabul edilir. */
export async function POST(req: NextRequest) {
  const user = await getCurrentUser();
  const oturumId = await getAktifOturumId();
  if (!user || !oturumId) return NextResponse.json({ error: "Giriş yapmalısınız." }, { status: 401 });
  const parsed = bodySchema.safeParse(await req.json().catch(() => null));
  const onay = parsed.success ? await googleBaglaJetonuCoz(parsed.data.onay, "google-bagla-onay") : null;
  if (!onay?.sub || onay.userId !== user.id || onay.oturumId !== oturumId) {
    return NextResponse.json({ error: "Bağlantı isteğinin süresi dolmuş. Lütfen tekrar dene." }, { status: 400 });
  }
  return NextResponse.json({ sonuc: await googleHesabiBagla(user.id, onay.sub) });
}

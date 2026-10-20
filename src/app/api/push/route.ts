import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// Tarayicinin PushSubscription.toJSON() ciktisi. endpoint yalniz https (tarayici push servisleri).
const abonelik = z.object({
  endpoint: z.string().url().startsWith("https://").max(1000),
  keys: z.object({ p256dh: z.string().min(1).max(200), auth: z.string().min(1).max(100) }),
});

/** Tarayici bildirimi aboneligi (izin verildikten sonra). Uye girisliyse uyeye baglanir. */
export async function POST(req: NextRequest) {
  const parsed = abonelik.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Geçersiz abonelik." }, { status: 400 });
  const user = await getCurrentUser();
  const { endpoint, keys } = parsed.data;
  await prisma.pushAbonelik.upsert({
    where: { endpoint },
    update: { p256dh: keys.p256dh, auth: keys.auth, userId: user?.id ?? null },
    create: { endpoint, p256dh: keys.p256dh, auth: keys.auth, userId: user?.id ?? null },
  });
  return NextResponse.json({ ok: true });
}

/** Bildirimleri kapat: endpoint'i bilen (yalniz o tarayici) silebilir. */
export async function DELETE(req: NextRequest) {
  const parsed = z.object({ endpoint: z.string().max(1000) }).safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Geçersiz istek." }, { status: 400 });
  await prisma.pushAbonelik.deleteMany({ where: { endpoint: parsed.data.endpoint } });
  return NextResponse.json({ ok: true });
}

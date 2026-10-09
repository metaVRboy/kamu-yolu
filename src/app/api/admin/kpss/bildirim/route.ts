import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { adminApi } from "@/lib/admin";
import { islemKaydet } from "@/lib/islemKaydi";

/** Bir sorunun acik hata bildirimlerini kapatir (duzeltildi ya da hata yok). */
export async function POST(req: NextRequest) {
  const admin = await adminApi();
  if (!admin) return NextResponse.json({ error: "Yetkiniz yok." }, { status: 403 });
  const parsed = z.object({ soruId: z.string().min(1) }).safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Geçersiz bilgiler." }, { status: 400 });

  const { count } = await prisma.soruHataBildirimi.updateMany({ where: { soruId: parsed.data.soruId, cozuldu: null }, data: { cozuldu: new Date() } });
  if (count === 0) return NextResponse.json({ error: "Açık bildirim yok." }, { status: 404 });
  await islemKaydet(admin, "kpss.bildirim-coz", `${count} bildirim`, `/admin/kpss/soru/${parsed.data.soruId}`);
  return NextResponse.json({ ok: true });
}

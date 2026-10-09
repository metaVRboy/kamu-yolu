import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { adminApi } from "@/lib/admin";
import { islemKaydet } from "@/lib/islemKaydi";
import { katilimlariYenidenPuanla } from "@/lib/kpssDeneme";

const metin = z.string().trim().min(1).max(5000);
const bodySchema = z.object({
  soruMetni: metin,
  secenekler: z.array(z.string().trim().min(1).max(1000)).length(5),
  dogruCevap: z.number().int().min(0).max(4),
  aciklama: z.string().trim().max(5000).nullable(),
  konu: z.string().trim().max(120).nullable(),
});

/** Soruyu duzelt. Dogru cevap degisirse bu soruyu iceren bitmis denemeler yeniden puanlanir. */
export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const admin = await adminApi();
  if (!admin) return NextResponse.json({ error: "Yetkiniz yok." }, { status: 403 });
  const parsed = bodySchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Geçersiz bilgiler." }, { status: 400 });
  const { id } = await params;
  const eski = await prisma.denemeSoru.findUnique({ where: { id }, select: { dogruCevap: true } });
  if (!eski) return NextResponse.json({ error: "Soru bulunamadı." }, { status: 404 });

  const b = parsed.data;
  await prisma.denemeSoru.update({ where: { id }, data: { ...b, aciklama: b.aciklama || null, konu: b.konu || null } });
  const yenidenPuanlanan = b.dogruCevap !== eski.dogruCevap ? await katilimlariYenidenPuanla(id) : 0;

  const cevap = (i: number) => String.fromCharCode(65 + i);
  await islemKaydet(
    admin,
    "kpss.soru-duzenle",
    `${b.soruMetni.slice(0, 60)}${b.dogruCevap !== eski.dogruCevap ? ` · cevap ${cevap(eski.dogruCevap)} → ${cevap(b.dogruCevap)} (${yenidenPuanlanan} deneme yeniden puanlandı)` : ""}`,
    `/admin/kpss/soru/${id}`,
  );
  return NextResponse.json({ ok: true, yenidenPuanlanan });
}

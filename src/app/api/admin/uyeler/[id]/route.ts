import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { islemKaydet } from "@/lib/islemKaydi";

const bodySchema = z.object({
  abonelikPlani: z.enum(["UCRETSIZ", "PRO", "PRO_PLUS"]),
  // "YYYY-MM-DD" ya da null (suresiz). Gun sonuna (Istanbul) kadar gecerli.
  abonelikBitis: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).nullable(),
});

/** Admin: odeme altyapisi gelene kadar planlar elle verilir. */
export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const admin = await getCurrentUser();
  if (!admin?.isAdmin) return NextResponse.json({ error: "Yetkiniz yok." }, { status: 403 });

  const parsed = bodySchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Geçersiz bilgiler." }, { status: 400 });
  const { abonelikPlani, abonelikBitis } = parsed.data;

  const bitis = abonelikPlani === "UCRETSIZ" || !abonelikBitis ? null : new Date(`${abonelikBitis}T23:59:59+03:00`);
  if (bitis && bitis.getTime() < Date.now()) {
    return NextResponse.json({ error: "Bitiş tarihi geçmişte olamaz." }, { status: 400 });
  }

  const { id } = await params;
  const guncel = await prisma.user
    .update({ where: { id }, data: { abonelikPlani, abonelikBitis: bitis }, select: { abonelikPlani: true, abonelikBitis: true, email: true } })
    .catch(() => null);
  if (!guncel) return NextResponse.json({ error: "Kullanıcı bulunamadı." }, { status: 404 });
  await islemKaydet(admin, "uye.plan", `${guncel.email} → ${abonelikPlani}${abonelikBitis ? ` (${abonelikBitis})` : ""}`, `/admin/uyeler/${id}`);
  return NextResponse.json({ abonelikPlani: guncel.abonelikPlani, abonelikBitis: guncel.abonelikBitis });
}

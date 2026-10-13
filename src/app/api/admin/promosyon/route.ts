import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { Prisma } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import { adminApi } from "@/lib/admin";
import { islemKaydet } from "@/lib/islemKaydi";
import { PLAN_ADI } from "@/lib/planlar";

const bodySchema = z.object({
  kod: z.string().trim().toUpperCase().regex(/^[A-Z0-9]{3,20}$/, "Kod 3-20 harf/rakam olmalı."),
  plan: z.enum(["PRO", "PRO_PLUS"]),
  gun: z.number().int().min(1, "Süre en az 1 gün.").max(365, "Süre en fazla 365 gün."),
  limit: z.number().int().min(1).nullable(),
  // "YYYY-MM-DD" ya da null (suresiz). Gun sonuna (Istanbul) kadar gecerli.
  bitis: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).nullable(),
});

export async function POST(req: NextRequest) {
  const admin = await adminApi();
  if (!admin) return NextResponse.json({ error: "Yetkiniz yok." }, { status: 403 });
  const parsed = bodySchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Geçersiz bilgiler." }, { status: 400 });
  const b = parsed.data;
  const bitis = b.bitis ? new Date(`${b.bitis}T23:59:59+03:00`) : null;
  if (bitis && bitis.getTime() < Date.now()) return NextResponse.json({ error: "Son kullanım tarihi geçmişte olamaz." }, { status: 400 });
  // Uye ileride tek kutuya kod yazacak: indirim kuponuyla ayni kod olmasin.
  if (await prisma.kampanya.findUnique({ where: { kuponKodu: b.kod }, select: { id: true } })) {
    return NextResponse.json({ error: "Bu kod bir indirim kuponunda kullanılıyor." }, { status: 409 });
  }

  try {
    await prisma.promosyonKodu.create({ data: { kod: b.kod, plan: b.plan, gun: b.gun, limit: b.limit, bitis, olusturanId: admin.id } });
  } catch (e) {
    if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2002") return NextResponse.json({ error: "Bu kod zaten var." }, { status: 409 });
    throw e;
  }
  await islemKaydet(admin, "promosyon.olustur", `${b.kod} → ${PLAN_ADI[b.plan]} ${b.gun} gün`, "/admin/promosyon");
  return NextResponse.json({ ok: true });
}

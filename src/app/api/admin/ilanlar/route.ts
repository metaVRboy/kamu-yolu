import { randomUUID } from "node:crypto";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { adminApi } from "@/lib/admin";
import { ilanFormSchema, ilanSayfalariniYenile, sonGun } from "@/lib/adminIlan";
import { notifyUsersForMatchedPosting } from "@/lib/notifications";
import { islemKaydet } from "@/lib/islemKaydi";

const bodySchema = ilanFormSchema.extend({ sourceUrl: z.string().trim().url("Geçerli bir ilan bağlantısı gir.").max(500) });

/** Elle ilan ekleme: tarama bulamadigi ilanlar icin. Tarama bu kayda dokunmaz (kaynak "Kamu Yolu"). */
export async function POST(req: NextRequest) {
  const admin = await adminApi();
  if (!admin) return NextResponse.json({ error: "Yetkiniz yok." }, { status: 403 });
  const parsed = bodySchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Geçersiz bilgiler." }, { status: 400 });
  const { departmentIds, applicationEnd, ...veri } = parsed.data;

  const bolumler = await prisma.department.findMany({ where: { id: { in: departmentIds } }, select: { id: true, slug: true } });
  const posting = await prisma.posting.create({
    data: {
      ...veri,
      externalId: `elle-${randomUUID()}`,
      sourceName: "Kamu Yolu",
      applicationEnd: sonGun(applicationEnd),
      publishedAt: new Date(),
      adminDuzenledi: true,
      departments: { create: bolumler.map((b) => ({ departmentId: b.id, matchedAlias: "admin" })) },
    },
  });
  // Yeni ilan: bolumune uyan (Pro) kullanicilara bildirim, taramadaki gibi.
  if (bolumler.length > 0) {
    await notifyUsersForMatchedPosting({ postingTitle: posting.title, departments: bolumler.map((b) => ({ departmentId: b.id, slug: b.slug })) });
  }
  ilanSayfalariniYenile();
  await islemKaydet(admin, "ilan.ekle", posting.title, `/admin/ilanlar/${posting.id}`);
  return NextResponse.json({ id: posting.id });
}

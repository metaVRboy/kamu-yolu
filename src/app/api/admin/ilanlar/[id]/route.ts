import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { adminApi } from "@/lib/admin";
import { islemKaydet } from "@/lib/islemKaydi";
import { ilanFormSchema, ilanSayfalariniYenile, sonGun } from "@/lib/adminIlan";

const bodySchema = z.union([
  z.object({ islem: z.enum(["gizle", "goster", "taramaya-birak"]) }),
  z.object({ duzenle: ilanFormSchema }),
]);

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const admin = await adminApi();
  if (!admin) return NextResponse.json({ error: "Yetkiniz yok." }, { status: 403 });
  const parsed = bodySchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Geçersiz bilgiler." }, { status: 400 });
  const { id } = await params;
  const ilan = await prisma.posting.findUnique({ where: { id }, select: { id: true, title: true, applicationEnd: true } });
  if (!ilan) return NextResponse.json({ error: "İlan bulunamadı." }, { status: 404 });
  const b = parsed.data;

  if ("islem" in b) {
    if (b.islem === "gizle") await prisma.posting.update({ where: { id }, data: { adminGizli: true, isActive: false } });
    // Gostermede suresi gecmis ilan aktiflesmez.
    if (b.islem === "goster") {
      const suresiGecti = !!ilan.applicationEnd && ilan.applicationEnd.getTime() < Date.now();
      await prisma.posting.update({ where: { id }, data: { adminGizli: false, isActive: !suresiGecti } });
    }
    // Admin duzeltmesini birak: sonraki tarama alanlari ve bolumleri yeniden hesaplar.
    if (b.islem === "taramaya-birak") await prisma.posting.update({ where: { id }, data: { adminDuzenledi: false } });
  } else {
    const { departmentIds, applicationEnd, ...veri } = b.duzenle;
    const bolumler = await prisma.department.findMany({ where: { id: { in: departmentIds } }, select: { id: true } });
    await prisma.$transaction([
      prisma.posting.update({ where: { id }, data: { ...veri, applicationEnd: sonGun(applicationEnd), adminDuzenledi: true } }),
      prisma.postingDepartment.deleteMany({ where: { postingId: id } }),
      prisma.postingDepartment.createMany({ data: bolumler.map((d) => ({ postingId: id, departmentId: d.id, matchedAlias: "admin" })) }),
    ]);
  }
  ilanSayfalariniYenile();
  await islemKaydet(admin, "islem" in b ? `ilan.${b.islem}` : "ilan.duzenle", "islem" in b ? ilan.title : b.duzenle.title, `/admin/ilanlar/${id}`);
  return NextResponse.json({ ok: true });
}

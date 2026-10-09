import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { Prisma } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import { adminApi } from "@/lib/admin";
import { ilanSayfalariniYenile } from "@/lib/adminIlan";
import { createDepartmentFromResearch, linkDepartmentToExistingPostings } from "@/lib/matching";
import { slugify } from "@/lib/slug";
import { islemKaydet } from "@/lib/islemKaydi";

const ifade = z.string().trim().min(2, "En az 2 harf.").max(150);
const bodySchema = z.discriminatedUnion("islem", [
  z.object({ islem: z.literal("alias-ekle"), departmentId: z.string().min(1), alias: ifade }),
  z.object({ islem: z.literal("alias-sil"), aliasId: z.string().min(1) }),
  z.object({ islem: z.literal("bolum-ekle"), name: ifade, level: z.enum(["LISE", "ONLISANS", "LISANS", "YUKSEK_LISANS"]), aliases: z.array(ifade).max(20) }),
]);

/** Bolum eslestirme kurallari: es anlamli ifade ekle/sil, yeni bolum ekle. Eklenen kural mevcut ilanlara hemen uygulanir. */
export async function POST(req: NextRequest) {
  const admin = await adminApi();
  if (!admin) return NextResponse.json({ error: "Yetkiniz yok." }, { status: 403 });
  const parsed = bodySchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Geçersiz bilgiler." }, { status: 400 });
  const b = parsed.data;

  let baglanan = 0;
  if (b.islem === "alias-ekle") {
    try {
      await prisma.departmentAlias.create({ data: { departmentId: b.departmentId, alias: b.alias } });
    } catch (e) {
      if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2002") return NextResponse.json({ error: "Bu ifade zaten var." }, { status: 409 });
      if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2003") return NextResponse.json({ error: "Bölüm bulunamadı." }, { status: 404 });
      throw e;
    }
    baglanan = await linkDepartmentToExistingPostings(b.departmentId);
    await islemKaydet(admin, "eslestirme.ifade-ekle", `"${b.alias}" (${baglanan} ilan)`, "/admin/eslestirme");
  } else if (b.islem === "alias-sil") {
    const alias = await prisma.departmentAlias.findUnique({ where: { id: b.aliasId } });
    if (!alias) return NextResponse.json({ error: "İfade bulunamadı." }, { status: 404 });
    // Yanlis ifadenin bagladigi ilanlar da cozulur (admin'in elle sectikleri haric).
    await prisma.$transaction([
      prisma.departmentAlias.delete({ where: { id: alias.id } }),
      prisma.postingDepartment.deleteMany({ where: { departmentId: alias.departmentId, matchedAlias: alias.alias, posting: { adminDuzenledi: false } } }),
    ]);
    await islemKaydet(admin, "eslestirme.ifade-sil", `"${alias.alias}"`, "/admin/eslestirme");
  } else {
    if (await prisma.department.findUnique({ where: { slug: slugify(b.name) }, select: { id: true } })) {
      return NextResponse.json({ error: "Bu bölüm zaten var; ifadeyi listeden ekle." }, { status: 409 });
    }
    const bolum = await createDepartmentFromResearch(b);
    baglanan = await linkDepartmentToExistingPostings(bolum.id);
    await islemKaydet(admin, "eslestirme.bolum-ekle", `${b.name} (${baglanan} ilan)`, "/admin/eslestirme");
  }
  ilanSayfalariniYenile();
  return NextResponse.json({ ok: true, baglanan });
}

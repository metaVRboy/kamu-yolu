import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { adminApi } from "@/lib/admin";

const bodySchema = z.discriminatedUnion("islem", [
  z.object({ islem: z.literal("askiya-al"), neden: z.string().trim().max(300).optional() }),
  z.object({ islem: z.literal("askidan-cikar") }),
  z.object({ islem: z.literal("oturumlari-kapat") }),
  z.object({ islem: z.literal("admin"), deger: z.boolean() }),
]);

/** Tum oturumlari dusurur: tokenVersion artar (eski JWT'ler gecersiz), Oturum kayitlari kapanir. */
async function oturumlariKapat(userId: string) {
  await prisma.$transaction([
    prisma.user.update({ where: { id: userId }, data: { tokenVersion: { increment: 1 } } }),
    prisma.oturum.updateMany({ where: { userId, kapatildi: null }, data: { kapatildi: new Date() } }),
  ]);
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const admin = await adminApi();
  if (!admin) return NextResponse.json({ error: "Yetkiniz yok." }, { status: 403 });
  const parsed = bodySchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Geçersiz işlem." }, { status: 400 });
  const { id } = await params;
  const b = parsed.data;

  // Admin kendini askiya alamaz / yetkisini kendisi kaldiramaz (panele erisim kaybolmasin).
  if (id === admin.id && (b.islem === "askiya-al" || (b.islem === "admin" && !b.deger))) {
    return NextResponse.json({ error: "Bu işlemi kendi hesabına uygulayamazsın." }, { status: 400 });
  }
  if (!(await prisma.user.findUnique({ where: { id }, select: { id: true } }))) {
    return NextResponse.json({ error: "Üye bulunamadı." }, { status: 404 });
  }

  if (b.islem === "askiya-al") {
    await prisma.user.update({ where: { id }, data: { askiyaAlindi: new Date(), askiNedeni: b.neden || null } });
    await oturumlariKapat(id);
  } else if (b.islem === "askidan-cikar") {
    await prisma.user.update({ where: { id }, data: { askiyaAlindi: null, askiNedeni: null } });
  } else if (b.islem === "oturumlari-kapat") {
    await oturumlariKapat(id);
  } else {
    await prisma.user.update({ where: { id }, data: { isAdmin: b.deger } });
  }
  return NextResponse.json({ ok: true });
}

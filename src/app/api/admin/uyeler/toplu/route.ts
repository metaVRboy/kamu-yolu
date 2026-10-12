import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { adminApi } from "@/lib/admin";
import { islemKaydet } from "@/lib/islemKaydi";
import { uyeFiltresiMi, uyeKosulu, type UyeFiltresi } from "@/lib/adminUye";

const PLAN_ADI = { UCRETSIZ: "Ücretsiz", PRO: "Pro", PRO_PLUS: "Pro+" } as const;

const bodySchema = z.object({
  // Ya secilen uyeler ya da filtre+aramaya uyan TUM uyeler (sayfalar arasi "tumunu sec").
  secim: z.union([
    z.object({ ids: z.array(z.string().min(1).max(40)).min(1).max(500) }),
    z.object({ filtre: z.string().refine(uyeFiltresiMi), q: z.string().trim().max(100) }),
  ]),
  islem: z.discriminatedUnion("islem", [
    z.object({
      islem: z.literal("plan"),
      abonelikPlani: z.enum(["UCRETSIZ", "PRO", "PRO_PLUS"]),
      abonelikBitis: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).nullable(),
    }),
    z.object({ islem: z.literal("askiya-al"), neden: z.string().trim().max(300).optional() }),
    z.object({ islem: z.literal("askidan-cikar") }),
    z.object({ islem: z.literal("oturumlari-kapat") }),
    z.object({
      islem: z.literal("bildirim"),
      baslik: z.string().trim().min(3).max(120),
      icerik: z.string().trim().max(500).optional(),
      link: z.union([z.literal(""), z.string().trim().max(300).regex(/^(\/|https:\/\/)/, "Bağlantı / ya da https:// ile başlamalı.")]).optional(),
    }),
  ]),
});

/** Admin: secilen uyelere tek seferde plan / askiya alma / oturum kapatma / site ici bildirim. */
export async function POST(req: NextRequest) {
  const admin = await adminApi();
  if (!admin) return NextResponse.json({ error: "Yetkiniz yok." }, { status: 403 });
  const parsed = bodySchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Geçersiz istek." }, { status: 400 });
  const { secim, islem: b } = parsed.data;

  const where = "ids" in secim ? { id: { in: secim.ids } } : uyeKosulu(secim.filtre as UyeFiltresi, secim.q);
  let ids = (await prisma.user.findMany({ where, select: { id: true } })).map((u) => u.id);
  // Admin kendini askiya alamaz, kendi oturumunu da toplu islemle dusurmez (panelden atilmasin).
  if (b.islem === "askiya-al" || b.islem === "oturumlari-kapat") ids = ids.filter((id) => id !== admin.id);
  if (ids.length === 0) return NextResponse.json({ error: "İşlem uygulanacak üye yok." }, { status: 400 });

  const hedef = { id: { in: ids } };
  const oturumKapat = [
    prisma.user.updateMany({ where: hedef, data: { tokenVersion: { increment: 1 } } }),
    prisma.oturum.updateMany({ where: { userId: { in: ids }, kapatildi: null }, data: { kapatildi: new Date() } }),
  ];
  let ozet: string;

  if (b.islem === "plan") {
    const bitis = b.abonelikPlani === "UCRETSIZ" || !b.abonelikBitis ? null : new Date(`${b.abonelikBitis}T23:59:59+03:00`);
    if (bitis && bitis.getTime() < Date.now()) return NextResponse.json({ error: "Bitiş tarihi geçmişte olamaz." }, { status: 400 });
    await prisma.user.updateMany({ where: hedef, data: { abonelikPlani: b.abonelikPlani, abonelikBitis: bitis } });
    ozet = `${PLAN_ADI[b.abonelikPlani]}${b.abonelikBitis && b.abonelikPlani !== "UCRETSIZ" ? ` (${b.abonelikBitis})` : ""}`;
  } else if (b.islem === "askiya-al") {
    await prisma.$transaction([prisma.user.updateMany({ where: hedef, data: { askiyaAlindi: new Date(), askiNedeni: b.neden || null } }), ...oturumKapat]);
    ozet = b.neden ? `neden: ${b.neden}` : "";
  } else if (b.islem === "askidan-cikar") {
    await prisma.user.updateMany({ where: hedef, data: { askiyaAlindi: null, askiNedeni: null } });
    ozet = "";
  } else if (b.islem === "oturumlari-kapat") {
    await prisma.$transaction(oturumKapat);
    ozet = "";
  } else {
    await prisma.bildirim.createMany({ data: ids.map((userId) => ({ userId, tur: "ADMIN", baslik: b.baslik, icerik: b.icerik || null, link: b.link || null })) });
    ozet = `“${b.baslik}”`;
  }

  await islemKaydet(admin, `uye.toplu-${b.islem}`, `${ids.length} üye${ozet ? ` · ${ozet}` : ""}`, "/admin/uyeler");
  return NextResponse.json({ ok: true, adet: ids.length });
}

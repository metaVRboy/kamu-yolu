import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { adminApi, istanbulTarihi } from "@/lib/admin";
import { DENEME_DUZEYLERI } from "@/lib/kpssDenemeSabitler";
import { islemKaydet } from "@/lib/islemKaydi";
import { duyurulariYenile, hedefKitleSayisi } from "@/lib/notifications";

const hedefSchema = z.discriminatedUnion("hedefTur", [
  z.object({ hedefTur: z.literal("HERKES"), hedefDeger: z.null().optional() }),
  z.object({ hedefTur: z.literal("PLAN"), hedefDeger: z.enum(["UCRETSIZ", "PRO", "PRO_PLUS"]) }),
  z.object({ hedefTur: z.literal("DUZEY"), hedefDeger: z.enum(DENEME_DUZEYLERI as [string, ...string[]]) }),
  z.object({ hedefTur: z.literal("BOLUM"), hedefDeger: z.string().min(1) }),
]);

const bodySchema = z.intersection(
  z.object({
    baslik: z.string().trim().min(2).max(120),
    icerik: z.string().trim().min(2).max(2000),
    // Site ici yol ("/kpss-denemesi") ya da https baglanti.
    link: z
      .string()
      .trim()
      .max(300)
      .regex(/^(\/(?!\/)|https:\/\/)/, "Bağlantı / ile ya da https:// ile başlamalı.")
      .nullable()
      .optional(),
    // "2026-10-12T09:30" (Istanbul); bos = hemen.
    yayinZamani: z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/)
      .nullable()
      .optional(),
  }),
  hedefSchema,
);

async function hedefGecerliMi(hedefTur: string, hedefDeger?: string | null) {
  if (hedefTur !== "BOLUM") return true;
  return !!(await prisma.department.findUnique({ where: { id: hedefDeger! }, select: { id: true } }));
}

/** Onizleme: secilen hedefin kac uyeye ulasacagi. */
export async function GET(req: NextRequest) {
  if (!(await adminApi())) return NextResponse.json({ error: "Yetkiniz yok." }, { status: 403 });
  const p = req.nextUrl.searchParams;
  const parsed = hedefSchema.safeParse({ hedefTur: p.get("hedefTur"), hedefDeger: p.get("hedefDeger") });
  if (!parsed.success) return NextResponse.json({ error: "Geçersiz hedef." }, { status: 400 });
  return NextResponse.json({ sayi: await hedefKitleSayisi(parsed.data.hedefTur, parsed.data.hedefDeger ?? null) });
}

export async function POST(req: NextRequest) {
  const admin = await adminApi();
  if (!admin) return NextResponse.json({ error: "Yetkiniz yok." }, { status: 403 });

  const parsed = bodySchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Geçersiz bilgiler." }, { status: 400 });
  }
  const { baslik, icerik, link, yayinZamani, hedefTur, hedefDeger } = parsed.data;
  if (!(await hedefGecerliMi(hedefTur, hedefDeger))) return NextResponse.json({ error: "Bölüm bulunamadı." }, { status: 400 });

  const zaman = yayinZamani ? istanbulTarihi(yayinZamani) : new Date();
  const duyuru = await prisma.duyuru.create({
    data: {
      baslik,
      icerik,
      link: link || null,
      hedefTur,
      hedefDeger: hedefDeger ?? null,
      yayinZamani: zaman,
      aliciSayisi: await hedefKitleSayisi(hedefTur, hedefDeger ?? null),
      olusturanId: admin.id,
    },
  });
  duyurulariYenile();
  await islemKaydet(admin, "bildirim.yayinla", baslik, "/admin/bildirimler");
  return NextResponse.json({ id: duyuru.id });
}

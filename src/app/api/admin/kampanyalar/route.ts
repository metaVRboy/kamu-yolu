import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { Prisma } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import { adminApi, istanbulTarihi } from "@/lib/admin";
import { fiyatlariGuncelle } from "@/lib/fiyatlar";

const yerelTarih = z.string().regex(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/);

const bodySchema = z
  .object({
    ad: z.string().trim().min(2).max(80),
    indirimTuru: z.enum(["yuzde", "tutar"]),
    deger: z.number().int().min(1),
    planlar: z.array(z.enum(["PRO", "PRO_PLUS"])).min(1, "En az bir plan seç."),
    aylik: z.boolean(),
    yillik: z.boolean(),
    baslangic: yerelTarih,
    bitis: yerelTarih,
    // Bos = sitede otomatik uygulanir; dolu = yalniz kodla (odeme gelince).
    kuponKodu: z
      .string()
      .trim()
      .toUpperCase()
      .regex(/^[A-Z0-9]{3,20}$/, "Kupon kodu 3-20 harf/rakam olmalı.")
      .nullable()
      .optional(),
  })
  .refine((b) => b.aylik || b.yillik, { message: "Aylık ya da yıllıktan en az birini seç." })
  .refine((b) => b.indirimTuru === "tutar" || b.deger <= 90, { message: "Yüzde indirim en fazla %90 olabilir." })
  .refine((b) => istanbulTarihi(b.bitis) > istanbulTarihi(b.baslangic), { message: "Bitiş, başlangıçtan sonra olmalı." });

export async function POST(req: NextRequest) {
  const admin = await adminApi();
  if (!admin) return NextResponse.json({ error: "Yetkiniz yok." }, { status: 403 });
  const parsed = bodySchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Geçersiz bilgiler." }, { status: 400 });
  const b = parsed.data;

  try {
    await prisma.kampanya.create({
      data: {
        ad: b.ad,
        yuzde: b.indirimTuru === "yuzde" ? b.deger : null,
        tutar: b.indirimTuru === "tutar" ? b.deger : null,
        planlar: b.planlar,
        aylik: b.aylik,
        yillik: b.yillik,
        baslangic: istanbulTarihi(b.baslangic),
        bitis: istanbulTarihi(b.bitis),
        kuponKodu: b.kuponKodu || null,
        olusturanId: admin.id,
      },
    });
  } catch (e) {
    if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2002") {
      return NextResponse.json({ error: "Bu kupon kodu zaten kullanılıyor." }, { status: 409 });
    }
    throw e;
  }
  fiyatlariGuncelle();
  return NextResponse.json({ ok: true });
}

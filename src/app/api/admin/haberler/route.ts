import { randomUUID } from "crypto";
import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { adminApi } from "@/lib/admin";
import { prisma } from "@/lib/prisma";
import { haberFormSchema } from "@/lib/haberler";
import { buildHaberSlug } from "@/lib/slug";
import { islemKaydet } from "@/lib/islemKaydi";

export async function POST(req: NextRequest) {
  const admin = await adminApi();
  if (!admin) return NextResponse.json({ error: "Yetkiniz yok." }, { status: 403 });

  const parsed = haberFormSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Geçersiz bilgiler." }, { status: 400 });
  }

  const id = randomUUID();
  const haber = await prisma.haber.create({
    data: {
      id,
      slug: buildHaberSlug(parsed.data.baslik, id),
      baslik: parsed.data.baslik,
      ozet: parsed.data.ozet,
      kaynakUrl: parsed.data.kaynakUrl || null,
      gorselUrl: parsed.data.gorselUrl || null,
    },
  });
  // Ana sayfa / haberler ISR (5 dk) beklemeden guncellensin.
  revalidatePath("/", "layout");
  await islemKaydet(admin, "haber.ekle", haber.baslik, "/admin/haberler");
  return NextResponse.json({ id: haber.id });
}

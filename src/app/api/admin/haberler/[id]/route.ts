import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { adminApi } from "@/lib/admin";
import { prisma } from "@/lib/prisma";
import { haberFormSchema } from "@/lib/haberler";
import { islemKaydet } from "@/lib/islemKaydi";

/** Haberi duzelt. Slug (URL) degismez, paylasilan baglantilar kirilmasin. */
export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const admin = await adminApi();
  if (!admin) return NextResponse.json({ error: "Yetkiniz yok." }, { status: 403 });
  const parsed = haberFormSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Geçersiz bilgiler." }, { status: 400 });
  }
  const { id } = await params;
  const eski = await prisma.haber.findUnique({ where: { id }, select: { gorselUrl: true } });
  if (!eski) return NextResponse.json({ error: "Haber bulunamadı." }, { status: 404 });

  const gorselUrl = parsed.data.gorselUrl || null;
  await prisma.haber.update({
    where: { id },
    data: {
      baslik: parsed.data.baslik,
      ozet: parsed.data.ozet,
      kaynakUrl: parsed.data.kaynakUrl || null,
      gorselUrl,
      // Elle degistirilen gorsel kurum logosu sayilmaz.
      ...(gorselUrl !== eski.gorselUrl && { gorselLogoMu: false }),
    },
  });
  revalidatePath("/", "layout");
  await islemKaydet(admin, "haber.duzenle", parsed.data.baslik, "/admin/haberler");
  return NextResponse.json({ ok: true });
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const admin = await adminApi();
  if (!admin) return NextResponse.json({ error: "Yetkiniz yok." }, { status: 403 });

  const { id } = await params;
  const silinen = await prisma.haber.delete({ where: { id } });
  await islemKaydet(admin, "haber.sil", silinen.baslik, "/admin/haberler");
  revalidatePath("/", "layout");
  return NextResponse.json({ ok: true });
}

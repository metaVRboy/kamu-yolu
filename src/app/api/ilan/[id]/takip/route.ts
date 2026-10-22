import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getPostingById } from "@/lib/matching";
import { proAktifMi } from "@/lib/whatsapp";

type Baglam = { params: Promise<{ id: string }> };

/** Ilan sayfasi onbellekli: dugme takip durumunu buradan okur. */
export async function GET(_req: Request, { params }: Baglam) {
  const user = await getCurrentUser();
  const { id } = await params;
  const takipte = user ? !!(await prisma.ilanTakip.findUnique({ where: { userId_postingId: { userId: user.id, postingId: id } }, select: { id: true } })) : false;
  return NextResponse.json({ girisli: !!user, takipte, pro: !!user && proAktifMi(user) }, { headers: { "Cache-Control": "private, no-store" } });
}

/** Ilan takibi herkese acik; son basvuru hatirlatmasi (3 gun ve 1 gun kala) Pro'da gider. */
export async function POST(_req: Request, { params }: Baglam) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Takip için giriş yapmalısın." }, { status: 401 });
  const { id } = await params;
  if (!(await getPostingById(id))) return NextResponse.json({ error: "İlan bulunamadı." }, { status: 404 });
  await prisma.ilanTakip.upsert({ where: { userId_postingId: { userId: user.id, postingId: id } }, update: {}, create: { userId: user.id, postingId: id } });
  return NextResponse.json({ takipte: true });
}

export async function DELETE(_req: Request, { params }: Baglam) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Giriş yapmalısın." }, { status: 401 });
  const { id } = await params;
  await prisma.ilanTakip.deleteMany({ where: { userId: user.id, postingId: id } });
  return NextResponse.json({ takipte: false });
}

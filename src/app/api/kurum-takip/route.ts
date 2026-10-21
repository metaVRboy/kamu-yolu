import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { kurumNorm } from "@/lib/kurumTakip";
import { proAktifMi } from "@/lib/sms";

const kurumSema = z.string().trim().min(3).max(200);

/** Duyuru sayfasi onbellekli: dugme takip durumunu buradan okur. ?kurum= */
export async function GET(req: NextRequest) {
  const user = await getCurrentUser();
  const kurum = kurumSema.safeParse(req.nextUrl.searchParams.get("kurum"));
  if (!kurum.success) return NextResponse.json({ error: "Geçersiz kurum." }, { status: 400 });
  const takipte = user
    ? !!(await prisma.kurumTakip.findUnique({ where: { userId_kurumNorm: { userId: user.id, kurumNorm: kurumNorm(kurum.data) } }, select: { id: true } }))
    : false;
  return NextResponse.json({ girisli: !!user, takipte, pro: !!user && proAktifMi(user) }, { headers: { "Cache-Control": "private, no-store" } });
}

const govde = z.object({ kurum: kurumSema });

/** Kurum takibi herkese acik; ilan yayimlaninca bildirim Pro'da (src/lib/kurumTakip.ts). Uye basina en fazla 30 kurum. */
export async function POST(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Takip için giriş yapmalısın." }, { status: 401 });
  const parsed = govde.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Geçersiz kurum." }, { status: 400 });
  const norm = kurumNorm(parsed.data.kurum);
  if ((await prisma.kurumTakip.count({ where: { userId: user.id } })) >= 30) {
    return NextResponse.json({ error: "En fazla 30 kurum takip edebilirsin." }, { status: 400 });
  }
  await prisma.kurumTakip.upsert({
    where: { userId_kurumNorm: { userId: user.id, kurumNorm: norm } },
    update: {},
    create: { userId: user.id, kurumAdi: parsed.data.kurum, kurumNorm: norm },
  });
  return NextResponse.json({ takipte: true });
}

export async function DELETE(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Giriş yapmalısın." }, { status: 401 });
  const parsed = govde.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Geçersiz kurum." }, { status: 400 });
  await prisma.kurumTakip.deleteMany({ where: { userId: user.id, kurumNorm: kurumNorm(parsed.data.kurum) } });
  return NextResponse.json({ takipte: false });
}

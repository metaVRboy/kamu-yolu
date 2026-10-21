import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { kadroAdi, duzgunHarf, kalanGunSayisi } from "@/lib/ilanVitrin";

/** Mobil "Takip Ettiğim İlanlar" (sitedeki /profilim/takip): son basvurusu en yakin once, suresi gecenler sonda. */
export async function GET() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Giriş yapmalısın." }, { status: 401 });
  const takipler = await prisma.ilanTakip.findMany({
    where: { userId: user.id, posting: { adminGizli: false } },
    select: { posting: { select: { id: true, title: true, institutionName: true, applicationEnd: true } } },
  });
  const simdi = Date.now();
  const sira = (d: Date | null) => d?.getTime() ?? Infinity;
  const ilanlar = takipler
    .map((t) => t.posting)
    .sort((a, b) => (sira(a.applicationEnd) < simdi ? 1 : 0) - (sira(b.applicationEnd) < simdi ? 1 : 0) || sira(a.applicationEnd) - sira(b.applicationEnd));
  return NextResponse.json({
    pro: user.abonelikPlani !== "UCRETSIZ",
    ilanlar: ilanlar.map((p) => ({
      id: p.id,
      kadro: kadroAdi(p.title, p.institutionName),
      kurum: duzgunHarf(p.institutionName),
      sonBasvuru: p.applicationEnd?.toISOString() ?? null,
      kalanGun: kalanGunSayisi(p.applicationEnd, simdi),
    })),
  });
}

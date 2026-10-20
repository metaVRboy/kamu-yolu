import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { DAVET_HEDIYE_GUN, DAVET_ODUL_SINIRI, davetKodu } from "@/lib/davet";
import { SITE_URL } from "@/lib/site";

/** Uyenin davet linki ve sonuclari (kod ilk istekte uretilir). */
export async function GET() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Giriş yapmalısın." }, { status: 401 });
  const [kod, katilan, odul] = await Promise.all([
    davetKodu(user.id),
    prisma.user.count({ where: { davetEdenId: user.id } }),
    prisma.proHediye.count({ where: { userId: user.id, neden: { startsWith: "davet:" } } }),
  ]);
  return NextResponse.json({
    link: `${SITE_URL}/?davet=${kod}`,
    katilan,
    odul,
    kazanilanGun: odul * DAVET_HEDIYE_GUN,
    kalanOdul: Math.max(0, DAVET_ODUL_SINIRI - odul),
  });
}

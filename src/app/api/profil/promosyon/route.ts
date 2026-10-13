import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { Prisma } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { PLAN_ADI } from "@/lib/planlar";

const SIRA = { UCRETSIZ: 0, PRO: 1, PRO_PLUS: 2 } as const;
const GUN_MS = 86_400_000;

class KodHatasi extends Error {}

/**
 * Uye promosyon kodunu kullanir: plan `gun` gun acilir. Ayni plan suresi devam ediyorsa uzerine eklenir.
 * Limit, kullanim sayacinin kosullu artirimiyla korunur (es zamanli iki istek limiti asamaz).
 * ponytail: daha alt ucretli plandan ust plana gecen uyenin kalan alt plan gunleri yanar; odeme gelince oranlama eklenir.
 */
export async function POST(req: NextRequest) {
  const user = await getCurrentUser(); // suresi dolan plani UCRETSIZ dondurur
  if (!user) return NextResponse.json({ error: "Giriş yapmalısınız." }, { status: 401 });
  const parsed = z.object({ kod: z.string().trim().toUpperCase().min(3).max(20) }).safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Kodu kontrol et." }, { status: 400 });

  try {
    const sonuc = await prisma.$transaction(async (tx) => {
      const kod = await tx.promosyonKodu.findUnique({ where: { kod: parsed.data.kod } });
      if (!kod || !kod.aktif || (kod.bitis && kod.bitis.getTime() <= Date.now())) throw new KodHatasi("Kod geçersiz ya da süresi dolmuş.");
      if (SIRA[user.abonelikPlani] > SIRA[kod.plan]) throw new KodHatasi(`Zaten daha üst bir planın (${PLAN_ADI[user.abonelikPlani]}) var.`);
      if (user.abonelikPlani === kod.plan && !user.abonelikBitis) throw new KodHatasi(`${PLAN_ADI[kod.plan]} planın zaten süresiz.`);

      if (await tx.promosyonKullanim.findUnique({ where: { kodId_userId: { kodId: kod.id, userId: user.id } }, select: { id: true } })) throw new KodHatasi("Bu kodu daha önce kullandın.");

      const artti = await tx.promosyonKodu.updateMany({ where: { id: kod.id, ...(kod.limit != null && { kullanim: { lt: kod.limit } }) }, data: { kullanim: { increment: 1 } } });
      if (!artti.count) throw new KodHatasi("Bu kodun kullanım hakkı doldu.");
      await tx.promosyonKullanim.create({ data: { kodId: kod.id, userId: user.id } });

      const baslangic = user.abonelikPlani === kod.plan ? Math.max(Date.now(), user.abonelikBitis!.getTime()) : Date.now();
      const bitis = new Date(baslangic + kod.gun * GUN_MS);
      await tx.user.update({ where: { id: user.id }, data: { abonelikPlani: kod.plan, abonelikBitis: bitis } });
      return { plan: kod.plan, gun: kod.gun, bitis };
    });
    return NextResponse.json(sonuc);
  } catch (e) {
    if (e instanceof KodHatasi) return NextResponse.json({ error: e.message }, { status: 400 });
    if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2002") return NextResponse.json({ error: "Bu kodu daha önce kullandın." }, { status: 409 });
    throw e;
  }
}

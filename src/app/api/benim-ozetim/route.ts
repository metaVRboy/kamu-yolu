import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { kisiselOzet } from "@/lib/kisiselOzet";
import { rozetDurumu } from "@/lib/rozetler";
import { profilFotografiUrl } from "@/lib/profil";
import { denemeSiralamasi } from "@/lib/kpssDeneme";
import { DUZEY_LABEL } from "@/lib/kpssDenemeSabitler";
import { PLAN_ADI } from "@/lib/planlar";

/**
 * Ana sayfanin uye parcalari (sayfa onbellekli kalir, bunlar istemciden yuklenir): profil karti, seri,
 * bolume ozel ilan sayilari ve son denemenin siralamasi. Misafirde { uye: null }.
 */
export async function GET() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ uye: null }, { headers: { "Cache-Control": "private, no-store" } });

  const [rozet, ozet, foto, sonDeneme] = await Promise.all([
    rozetDurumu(user),
    kisiselOzet(user.departmentId),
    profilFotografiUrl(user.id),
    prisma.denemeKatilim.findFirst({
      where: { userId: user.id, bitisZamani: { not: null } },
      orderBy: { bitisZamani: "desc" },
      select: { id: true, puan: true, gunlukDenemeId: true },
    }),
  ]);
  const siralama = sonDeneme ? await denemeSiralamasi(sonDeneme.gunlukDenemeId, sonDeneme.puan ?? 0, sonDeneme.id) : null;
  const kazanilan = rozet.rozetler.filter((r) => r.kazanildi);

  return NextResponse.json(
    {
      uye: {
        adSoyad: user.adSoyad,
        fotoUrl: foto,
        bolum: ozet?.bolumAdi ?? null,
        duzey: user.educationLevel ? DUZEY_LABEL[user.educationLevel] : null,
        plan: user.abonelikPlani,
        planAdi: PLAN_ADI[user.abonelikPlani],
        // Sureli Pro (hediye/deneme) icin kalan gun; sunucu saatiyle (cihaz saati kayik olabilir).
        planKalanGun:
          user.abonelikPlani !== "UCRETSIZ" && user.abonelikBitis ? Math.max(0, Math.ceil((user.abonelikBitis.getTime() - Date.now()) / 86_400_000)) : null,
        seri: rozet.seri,
        denemeSayisi: rozet.denemeSayisi,
        rozetSayisi: kazanilan.length,
        rozetler: kazanilan.slice(0, 3).map(({ id, ad, renk }) => ({ id, ad, renk })),
      },
      ozet,
      sonDeneme: sonDeneme && { puan: sonDeneme.puan, siralama },
    },
    { headers: { "Cache-Control": "private, no-store" } },
  );
}

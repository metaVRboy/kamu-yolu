import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { DENEME_DUZEYLERI } from "@/lib/kpssDenemeSabitler";
import { GecersizCevapError, cozumsuzSetSorulari, gunlukCevapla, gunlukDuzey, gununSeti, seriDurumu } from "@/lib/gunlukSorular";
import type { EducationLevel } from "@/generated/prisma/client";

/** ?duzey= verilmezse uyenin ogrenim duzeyi, misafirde Lisans. */
function duzeySec(istenen: string | null, uyeDuzeyi: EducationLevel | null | undefined): EducationLevel {
  return istenen && (DENEME_DUZEYLERI as string[]).includes(istenen) ? (istenen as EducationLevel) : gunlukDuzey(uyeDuzeyi);
}

/** Gunun 5 sorusu. Bugun cozmus uyeye cozumlu sonuc da doner (sayfayi yenileyince kaybolmasin). */
export async function GET(req: NextRequest) {
  const user = await getCurrentUser();
  const duzey = duzeySec(req.nextUrl.searchParams.get("duzey"), user?.educationLevel);
  const set = await gununSeti(duzey);
  const kayit = user ? await prisma.gunlukSoruCevap.findUnique({ where: { userId_tarih: { userId: user.id, tarih: set.tarih } } }) : null;
  if (user && kayit?.setId === set.id) {
    return NextResponse.json({ duzey, ...(await gunlukCevapla(duzey, kayit.cevaplar as Record<string, number>, user.id)), cozuldu: true });
  }
  return NextResponse.json({
    duzey,
    sorular: await cozumsuzSetSorulari(set.soruIdler),
    seri: user ? await seriDurumu(user.id) : null,
    // Bugun baska duzeyde cozduyse seri zaten sayildi; bu duzey yalniz alistirma.
    bugunBaskaDuzeyde: !!kayit,
    cozuldu: false,
  });
}

const govde = z.object({ duzey: z.enum(["LISE", "ONLISANS", "LISANS"]), cevaplar: z.record(z.string(), z.number().int()) });

export async function POST(req: NextRequest) {
  const parsed = govde.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Geçersiz cevap." }, { status: 400 });
  const user = await getCurrentUser();
  try {
    return NextResponse.json({ duzey: parsed.data.duzey, ...(await gunlukCevapla(parsed.data.duzey, parsed.data.cevaplar, user?.id ?? null)), cozuldu: true });
  } catch (e) {
    if (e instanceof GecersizCevapError) return NextResponse.json({ error: "Geçersiz cevap." }, { status: 400 });
    throw e;
  }
}

import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { deleteMesajlar, getTalepDetay, sendMesaj } from "@/lib/becayis";
import { proAktifMi } from "@/lib/whatsapp";

const SAATLIK_MESAJ = 30;

const bodySchema = z.object({
  talepId: z.string().min(1),
  // Talep sahibi cevap verirken hangi konusmaya (hangi kullaniciya) cevap
  // verdigini belirtmek icin gonderir; talep sahibi olmayan biri icin bu
  // alan gerekmez (konusmaKarsi kendisi olur).
  konusmaKarsiId: z.string().min(1).optional(),
  mesaj: z.string().trim().min(1).max(2000),
});

export async function POST(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Giriş yapmalısınız." }, { status: 401 });
  }

  const parsed = bodySchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Geçersiz bilgiler." }, { status: 400 });
  }
  const { talepId, mesaj } = parsed.data;

  const talep = await getTalepDetay(talepId);
  if (!talep || !talep.isActive) {
    return NextResponse.json({ error: "Talep bulunamadı." }, { status: 404 });
  }

  const isSahibi = talep.userId === user.id;
  // Arayuzdeki kilit tek basina yetmez: konusma baslatmak (talep sahibine yazmak)
  // Pro ozelligi, sunucuda da kontrol edilir. Talep sahibi gelen mesajlara cevap verebilir.
  if (!isSahibi && !proAktifMi(user)) {
    return NextResponse.json({ error: "Becayiş mesajlaşması Pro üyelik gerektirir." }, { status: 403 });
  }
  if (isSahibi && !parsed.data.konusmaKarsiId) {
    return NextResponse.json(
      { error: "Hangi konuşmaya cevap verdiğiniz belirtilmedi." },
      { status: 400 },
    );
  }

  const konusmaKarsiId = isSahibi ? parsed.data.konusmaKarsiId! : user.id;
  // Talep sahibi yalniz kendisine bu ilan icin yazmis birine cevap verebilir (yoksa id bilerek
  // herkese sohbet acar, Pro kilidini da atlar). Karsi taraf hesabini sildiyse gonderenId bosalir,
  // kosul yine saglanmaz.
  if (isSahibi && !(await prisma.becayisMesaj.findFirst({ where: { talepId, konusmaKarsiId, gonderenId: konusmaKarsiId }, select: { id: true } }))) {
    return NextResponse.json({ error: "Bu sohbet bulunamadı ya da karşı taraf hesabını silmiş." }, { status: 404 });
  }
  // Kullanici basina saatlik sinir: Pro hesapla tum ilanlara toplu mesaj (spam) atilmasin.
  if ((await prisma.becayisMesaj.count({ where: { gonderenId: user.id, createdAt: { gte: new Date(Date.now() - 3_600_000) } } })) >= SAATLIK_MESAJ) {
    return NextResponse.json({ error: "Bir saatte çok fazla mesaj gönderdin. Biraz sonra tekrar dene." }, { status: 429 });
  }

  const created = await sendMesaj({
    talepId,
    gonderenId: user.id,
    konusmaKarsiId,
    mesaj,
  });

  return NextResponse.json({ id: created.id });
}

const deleteSchema = z.object({
  talepId: z.string().min(1),
  // Verilirse tek bir sohbet, verilmezse talebe ait tum sohbetler silinir.
  konusmaKarsiId: z.string().min(1).optional(),
});

export async function DELETE(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Giriş yapmalısınız." }, { status: 401 });
  }

  const parsed = deleteSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Geçersiz bilgiler." }, { status: 400 });
  }
  const { talepId, konusmaKarsiId } = parsed.data;

  const talep = await getTalepDetay(talepId);
  if (!talep) {
    return NextResponse.json({ error: "Talep bulunamadı." }, { status: 404 });
  }

  const isSahibi = talep.userId === user.id;
  const yetkili = konusmaKarsiId ? isSahibi || konusmaKarsiId === user.id : isSahibi;
  if (!yetkili) {
    return NextResponse.json({ error: "Yetkiniz yok." }, { status: 403 });
  }

  await deleteMesajlar(talepId, konusmaKarsiId);
  return NextResponse.json({ ok: true });
}

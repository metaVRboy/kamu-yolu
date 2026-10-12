import { randomInt, timingSafeEqual } from "crypto";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { adminDurumu, kodOzeti } from "@/lib/admin";
import { sendEmail } from "@/lib/email";
import { islemKaydet } from "@/lib/islemKaydi";

const KOD_OMRU_MS = 10 * 60_000;
const YENIDEN_GONDERME_MS = 60_000;
const AZAMI_DENEME = 5;

const bodySchema = z.discriminatedUnion("islem", [
  z.object({ islem: z.literal("gonder") }),
  z.object({ islem: z.literal("dogrula"), kod: z.string().regex(/^\d{6}$/) }),
]);

/** Admin iki asamali dogrulama: e-postaya 6 haneli kod gonderir / kodu dogrulayip oturumu acar. */
export async function POST(req: NextRequest) {
  const { user, oturumId } = await adminDurumu();
  if (!user?.isAdmin) return NextResponse.json({ error: "Yetkiniz yok." }, { status: 403 });
  if (!oturumId) return NextResponse.json({ error: "Güvenlik için çıkış yapıp tekrar giriş yap." }, { status: 400 });
  const parsed = bodySchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Kod 6 haneli olmalı." }, { status: 400 });
  const simdi = Date.now();

  if (parsed.data.islem === "gonder") {
    const oturum = await prisma.oturum.findUnique({ where: { id: oturumId }, select: { adminKodBitis: true } });
    // Bitis - omur = gonderim ani; dakikada birden sik gonderme (posta kutusu spam'i).
    if (oturum?.adminKodBitis && oturum.adminKodBitis.getTime() - KOD_OMRU_MS + YENIDEN_GONDERME_MS > simdi) {
      return NextResponse.json({ error: "Yeni kod için 1 dakika bekle." }, { status: 429 });
    }
    const kod = randomInt(0, 1_000_000).toString().padStart(6, "0");
    await prisma.oturum.update({ where: { id: oturumId }, data: { adminKodOzeti: kodOzeti(kod), adminKodBitis: new Date(simdi + KOD_OMRU_MS), adminKodDeneme: 0 } });
    try {
      await sendEmail({
        to: user.email,
        subject: `Kamu Yolu admin giriş kodu: ${kod}`,
        html: `<p>Admin paneline giriş kodun: <b style="font-size:20px;letter-spacing:4px">${kod}</b></p><p>Kod 10 dakika geçerli. Bu girişi sen yapmadıysan şifreni hemen değiştir ve tüm oturumlarını kapat.</p>`,
      });
    } catch (err) {
      console.error("Admin kodu e-postası gönderilemedi:", err);
      return NextResponse.json({ error: "Kod e-postası gönderilemedi, biraz sonra tekrar dene." }, { status: 502 });
    }
    return NextResponse.json({ ok: true });
  }

  // Deneme hakki atomik dusulur (paralel isteklerle 5 sinirinin asilmasi engellenir).
  const hak = await prisma.oturum.updateMany({
    where: { id: oturumId, adminKodDeneme: { lt: AZAMI_DENEME }, adminKodBitis: { gt: new Date(simdi) }, adminKodOzeti: { not: null } },
    data: { adminKodDeneme: { increment: 1 } },
  });
  if (hak.count === 0) return NextResponse.json({ error: "Kodun süresi doldu ya da çok fazla deneme yapıldı. Yeni kod iste." }, { status: 400 });

  const oturum = await prisma.oturum.findUnique({ where: { id: oturumId }, select: { adminKodOzeti: true } });
  const beklenen = Buffer.from(oturum?.adminKodOzeti ?? "", "hex");
  const gelen = Buffer.from(kodOzeti(parsed.data.kod), "hex");
  if (beklenen.length !== gelen.length || !timingSafeEqual(beklenen, gelen)) {
    return NextResponse.json({ error: "Kod hatalı." }, { status: 400 });
  }
  await prisma.oturum.update({ where: { id: oturumId }, data: { adminDogrulama: new Date(), adminKodOzeti: null, adminKodBitis: null, adminKodDeneme: 0 } });
  await islemKaydet(user, "admin.dogrulama", user.email, "/admin");
  return NextResponse.json({ ok: true });
}

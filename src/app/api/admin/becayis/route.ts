import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { adminApi } from "@/lib/admin";
import { islemKaydet } from "@/lib/islemKaydi";
import { createBildirim } from "@/lib/notifications";

const bodySchema = z.discriminatedUnion("islem", [
  z.object({ islem: z.literal("talep-kaldir"), talepId: z.string().min(1), neden: z.string().trim().max(300).optional() }),
  z.object({ islem: z.literal("talep-sil"), talepId: z.string().min(1) }),
  z.object({ islem: z.literal("mesaj-sil"), mesajId: z.string().min(1) }),
  z.object({ islem: z.literal("sikayet-yoksay"), mesajId: z.string().min(1) }),
]);

export async function POST(req: NextRequest) {
  const admin = await adminApi();
  if (!admin) return NextResponse.json({ error: "Yetkiniz yok." }, { status: 403 });
  const parsed = bodySchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Geçersiz işlem." }, { status: 400 });
  const b = parsed.data;

  if (b.islem === "talep-kaldir" || b.islem === "talep-sil") {
    const talep = await prisma.becayisTalep.findUnique({ where: { id: b.talepId }, select: { userId: true, meslek: true, mevcutIl: true, user: { select: { email: true } } } });
    if (!talep) return NextResponse.json({ error: "Talep bulunamadı." }, { status: 404 });
    const ad = `${talep.meslek} · ${talep.mevcutIl} (${talep.user.email})`;
    if (b.islem === "talep-kaldir") {
      await prisma.becayisTalep.update({ where: { id: b.talepId }, data: { isActive: false } });
      await createBildirim({
        userId: talep.userId,
        tur: "BECAYIS_KALDIRILDI",
        baslik: "Becayiş talebin yayından kaldırıldı",
        icerik: b.neden || "Talebin kullanım koşullarına uymadığı için yayından kaldırıldı.",
        link: "/becayis/taleplerim",
      });
      await islemKaydet(admin, "becayis.talep-kaldir", ad + (b.neden ? ` — ${b.neden}` : ""), "/admin/becayis");
    } else {
      await prisma.becayisTalep.delete({ where: { id: b.talepId } });
      await islemKaydet(admin, "becayis.talep-sil", ad, "/admin/becayis");
    }
    revalidatePath("/becayis");
    return NextResponse.json({ ok: true });
  }

  const mesaj = await prisma.becayisMesaj.findUnique({ where: { id: b.mesajId }, select: { mesaj: true, gonderen: { select: { email: true } } } });
  if (!mesaj) return NextResponse.json({ error: "Mesaj bulunamadı." }, { status: 404 });
  const ozet = `"${mesaj.mesaj.slice(0, 80)}" (${mesaj.gonderen?.email ?? "silinmiş kullanıcı"})`;
  if (b.islem === "mesaj-sil") {
    await prisma.becayisMesaj.delete({ where: { id: b.mesajId } });
    await islemKaydet(admin, "becayis.mesaj-sil", ozet, "/admin/becayis");
  } else {
    await prisma.becayisMesaj.update({ where: { id: b.mesajId }, data: { sikayetIncelendi: new Date() } });
    await islemKaydet(admin, "becayis.sikayet-yoksay", ozet, "/admin/becayis");
  }
  return NextResponse.json({ ok: true });
}

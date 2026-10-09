import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { adminApi } from "@/lib/admin";
import { islemKaydet } from "@/lib/islemKaydi";
import { sendEmail } from "@/lib/email";
import { createBildirim } from "@/lib/notifications";
import { SITE_URL } from "@/lib/site";

const bodySchema = z.discriminatedUnion("islem", [
  z.object({ islem: z.literal("yanitla"), id: z.string().min(1), yanit: z.string().trim().min(2).max(5000) }),
  z.object({ islem: z.literal("kapat"), id: z.string().min(1) }),
]);

const kacis = (s: string) => s.replace(/[&<>"']/g, (c) => `&#${c.charCodeAt(0)};`);
const paragraf = (s: string) => kacis(s).replace(/\n/g, "<br>");

export async function POST(req: NextRequest) {
  const admin = await adminApi();
  if (!admin) return NextResponse.json({ error: "Yetkiniz yok." }, { status: 403 });
  const parsed = bodySchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Geçersiz bilgiler." }, { status: 400 });
  const b = parsed.data;

  const m = await prisma.destekMesaji.findUnique({ where: { id: b.id } });
  if (!m) return NextResponse.json({ error: "Mesaj bulunamadı." }, { status: 404 });

  if (b.islem === "kapat") {
    await prisma.destekMesaji.update({ where: { id: m.id }, data: { kapatildi: new Date() } });
    await islemKaydet(admin, "destek.kapat", `${m.konu} · ${m.email}`, "/admin/destek");
    return NextResponse.json({ ok: true });
  }

  // Misafirin tek kanali e-posta: gonderilemezse yanit "verildi" sayilmaz, admin tekrar dener.
  try {
    await sendEmail({
      to: m.email,
      subject: `Kamu Yolu destek: ${m.konu}`,
      html: `
        <p>Merhaba ${kacis(m.ad)},</p>
        <p>${paragraf(b.yanit)}</p>
        <p>Sevgiler,<br>Kamu Yolu ekibi</p>
        <hr>
        <p style="color:#64748b;font-size:13px">Senin mesajın:<br>${paragraf(m.mesaj)}</p>
        <p style="color:#64748b;font-size:13px">Yeni bir sorun için: <a href="${SITE_URL}/destek">${SITE_URL}/destek</a></p>
      `,
    });
  } catch (err) {
    console.error("Destek yanıtı gönderilemedi:", err);
    return NextResponse.json({ error: "E-posta gönderilemedi, yanıt kaydedilmedi. Biraz sonra tekrar dene." }, { status: 502 });
  }

  await prisma.destekMesaji.update({ where: { id: m.id }, data: { yanit: b.yanit, yanitlandi: new Date(), kapatildi: new Date() } });
  if (m.userId) {
    await createBildirim({ userId: m.userId, tur: "DESTEK_YANIT", baslik: "Destek mesajın yanıtlandı", icerik: b.yanit.slice(0, 120), link: "/destek" });
  }
  await islemKaydet(admin, "destek.yanitla", `${m.konu} · ${m.email}`, "/admin/destek");
  return NextResponse.json({ ok: true });
}

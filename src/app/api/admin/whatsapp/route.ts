import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { adminApi } from "@/lib/admin";
import { islemKaydet } from "@/lib/islemKaydi";
import { CEVAP_PENCERESI_MS, metinGonder, telefonMaskele, whatsappTanimli } from "@/lib/whatsapp";

const bodySchema = z.object({ telefon: z.string().regex(/^\+\d{10,15}$/), metin: z.string().trim().min(1).max(4000) });

/** Admin sohbet cevabi: yalniz kullanicinin son mesajindan sonraki 24 saatte (Meta kurali, sonrasi sablon ister). */
export async function POST(req: NextRequest) {
  const admin = await adminApi();
  if (!admin) return NextResponse.json({ error: "Yetkiniz yok." }, { status: 403 });
  const parsed = bodySchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Geçersiz bilgiler." }, { status: 400 });
  const { telefon, metin } = parsed.data;
  if (!whatsappTanimli()) return NextResponse.json({ error: "WhatsApp anahtarları tanımlı değil." }, { status: 503 });

  const son = await prisma.whatsappMesaj.findFirst({ where: { telefon, yon: "GELEN" }, orderBy: { olusturma: "desc" }, select: { olusturma: true, userId: true } });
  if (!son || Date.now() - son.olusturma.getTime() > CEVAP_PENCERESI_MS) {
    return NextResponse.json({ error: "Kullanıcının son mesajının üzerinden 24 saat geçti; Meta kuralı gereği serbest mesaj gönderilemez." }, { status: 400 });
  }

  let waId: string;
  try {
    waId = await metinGonder(telefon, metin);
  } catch (err) {
    return NextResponse.json({ error: `Gönderilemedi: ${String(err).slice(0, 200)}` }, { status: 502 });
  }
  await prisma.whatsappMesaj.create({ data: { telefon, userId: son.userId, yon: "GIDEN", metin, waId, durum: "GONDERILDI" } });
  await islemKaydet(admin, "whatsapp.cevap", telefonMaskele(telefon), "/admin/whatsapp");
  return NextResponse.json({ ok: true });
}

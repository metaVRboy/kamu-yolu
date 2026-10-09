import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const TARIH = new Intl.DateTimeFormat("tr-TR", { day: "numeric", month: "long", year: "numeric", timeZone: "Europe/Istanbul" });

/** Mobil "Iletisim ve Destek": uyenin onceki mesajlari (gonderim POST /api/destek). */
export async function GET() {
  const user = await getCurrentUser();
  const gecmis = user ? await prisma.destekMesaji.findMany({ where: { userId: user.id }, orderBy: { createdAt: "desc" }, take: 20 }) : [];
  return NextResponse.json({
    gecmis: gecmis.map((m) => ({
      id: m.id,
      konu: m.konu,
      tarih: TARIH.format(m.createdAt),
      mesaj: m.mesaj,
      yanit: m.yanit,
      yanitTarihi: m.yanitlandi ? TARIH.format(m.yanitlandi) : null,
      kapatildi: !!m.kapatildi,
    })),
  });
}

import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const EDUCATION_LEVELS = [
  "ILKOGRETIM",
  "LISE",
  "ONLISANS",
  "LISANS",
  "YUKSEK_LISANS",
] as const;

const bodySchema = z.object({
  telefon: z.string().trim().max(30).optional().nullable(),
  meslek: z.string().trim().max(80).optional().nullable(),
  kurumTuru: z.string().trim().max(80).optional().nullable(),
  kamuCalisaniDegil: z.boolean().optional(),
  departmentId: z.string().min(1).optional().nullable(),
  educationLevel: z.enum(EDUCATION_LEVELS).optional().nullable(),
});

export async function PATCH(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Giriş yapmalısınız." }, { status: 401 });

  const parsed = bodySchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Geçersiz bilgiler." }, { status: 400 });
  }

  // "Kamu çalışanı değilim" işaretliyse kurumTuru/meslek istemciden ne
  // gelirse gelsin gecersiz sayilir.
  const data = { ...parsed.data };
  if (data.kamuCalisaniDegil) {
    data.kurumTuru = null;
    data.meslek = null;
  }

  const updated = await prisma.user.update({
    where: { id: user.id },
    data,
  });

  return NextResponse.json({
    telefon: updated.telefon,
    meslek: updated.meslek,
    kurumTuru: updated.kurumTuru,
    kamuCalisaniDegil: updated.kamuCalisaniDegil,
    departmentId: updated.departmentId,
    educationLevel: updated.educationLevel,
  });
}

import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// Istemci fotoyu 256x256'ya kucultup gonderir; bu sinir ancak hileli istekleri durdurur.
const AZAMI_BAYT = 200 * 1024;

// Dosya imzasi (magic bytes) - data URL'deki tur etiketine guvenilmez.
const IMZALAR: { tur: string; uygun: (b: Buffer) => boolean }[] = [
  { tur: "image/jpeg", uygun: (b) => b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff },
  { tur: "image/png", uygun: (b) => b.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])) },
  { tur: "image/webp", uygun: (b) => b.subarray(0, 4).toString("ascii") === "RIFF" && b.subarray(8, 12).toString("ascii") === "WEBP" },
];

const bodySchema = z.object({ veri: z.string().regex(/^data:image\/(jpeg|png|webp);base64,[A-Za-z0-9+/=]+$/) });

export async function POST(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Giriş yapmalısınız." }, { status: 401 });

  const parsed = bodySchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Geçersiz görsel." }, { status: 400 });

  const bayt = Buffer.from(parsed.data.veri.split(",")[1], "base64");
  if (bayt.length > AZAMI_BAYT) return NextResponse.json({ error: "Görsel çok büyük." }, { status: 400 });
  const tur = IMZALAR.find((i) => i.uygun(bayt))?.tur;
  if (!tur) return NextResponse.json({ error: "Yalnızca JPEG, PNG veya WebP yükleyebilirsin." }, { status: 400 });

  const veri = new Uint8Array(bayt);
  const kayit = await prisma.profilFotografi.upsert({
    where: { userId: user.id },
    update: { veri, tur },
    create: { userId: user.id, veri, tur },
    select: { guncellenme: true },
  });
  return NextResponse.json({ url: `/api/profil/fotograf/${user.id}?v=${kayit.guncellenme.getTime()}` });
}

export async function DELETE() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Giriş yapmalısınız." }, { status: 401 });
  await prisma.profilFotografi.deleteMany({ where: { userId: user.id } });
  return NextResponse.json({ ok: true });
}

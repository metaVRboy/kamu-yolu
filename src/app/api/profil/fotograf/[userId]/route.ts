import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { fotografSurumu } from "@/lib/profil";

/** Profil fotografi. Yalniz guncel imzali ?v= ile; surum foto degisince degistigi icin uzun sure onbellekte kalabilir. */
export async function GET(req: NextRequest, { params }: { params: Promise<{ userId: string }> }) {
  const { userId } = await params;
  const foto = await prisma.profilFotografi.findUnique({ where: { userId } });
  if (!foto || req.nextUrl.searchParams.get("v") !== fotografSurumu(userId, foto.guncellenme)) return new Response(null, { status: 404 });
  return new Response(Buffer.from(foto.veri), {
    headers: {
      "Content-Type": foto.tur,
      // private: CDN'de kopya kalmasin (foto ya da hesap silinince KVKK).
      "Cache-Control": "private, max-age=31536000, immutable",
      "X-Content-Type-Options": "nosniff",
    },
  });
}

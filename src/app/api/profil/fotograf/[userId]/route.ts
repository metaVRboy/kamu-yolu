import { prisma } from "@/lib/prisma";

/** Profil fotografi. URL'deki ?v= surumu foto degisince degistigi icin uzun sure onbellekte kalabilir. */
export async function GET(_req: Request, { params }: { params: Promise<{ userId: string }> }) {
  const { userId } = await params;
  const foto = await prisma.profilFotografi.findUnique({ where: { userId } });
  if (!foto) return new Response(null, { status: 404 });
  return new Response(Buffer.from(foto.veri), {
    headers: {
      "Content-Type": foto.tur,
      "Cache-Control": "public, max-age=31536000, immutable",
      "X-Content-Type-Options": "nosniff",
    },
  });
}

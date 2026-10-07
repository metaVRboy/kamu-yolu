import { prisma } from "@/lib/prisma";

/** Kullanicinin profil fotografi URL'si (yoksa null). ?v= surumu tarayici onbellegini foto degisince bozar. */
export async function profilFotografiUrl(userId: string): Promise<string | null> {
  const foto = await prisma.profilFotografi.findUnique({ where: { userId }, select: { guncellenme: true } });
  return foto ? `/api/profil/fotograf/${userId}?v=${foto.guncellenme.getTime()}` : null;
}

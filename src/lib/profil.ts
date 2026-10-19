import { prisma } from "@/lib/prisma";
import { gizliOzet } from "@/lib/gizliOzet";

/**
 * ?v= foto surumunun HMAC'i: foto degisince onbellek bozulur, URL'yi bilmeyen (yalniz userId'yi bilen,
 * ör. becayis sohbetindeki karsi taraf) fotoyu cekemez; eski URL foto degisince/silinince calismaz.
 */
export const fotografSurumu = (userId: string, guncellenme: Date) => gizliOzet("profil-foto", `${userId}:${guncellenme.getTime()}`).slice(0, 32);

/** Kullanicinin profil fotografi URL'si (yoksa null). */
export async function profilFotografiUrl(userId: string): Promise<string | null> {
  const foto = await prisma.profilFotografi.findUnique({ where: { userId }, select: { guncellenme: true } });
  return foto ? `/api/profil/fotograf/${userId}?v=${fotografSurumu(userId, foto.guncellenme)}` : null;
}

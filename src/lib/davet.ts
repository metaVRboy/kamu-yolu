import { randomInt } from "crypto";
import { prisma } from "@/lib/prisma";
import { proHediyeEt } from "@/lib/proHediye";
import { Prisma } from "@/generated/prisma/client";

/** Davet linkiyle (?davet=KOD) gelen ziyaretcinin kodu: kayit aninda okunur (src/components/DavetYakala). */
export const DAVET_CEREZ = "ky_davet";
export const DAVET_HEDIYE_GUN = 7;
/** Bir uye davetle en fazla bu kadar hediye kazanir (sahte hesap uretip sinirsiz Pro toplanamasin). */
export const DAVET_ODUL_SINIRI = 10;

// Karisan harfler yok (0/O, 1/I/L): kod sesli okunup elle de yazilabilsin.
const ALFABE = "ABCDEFGHJKMNPQRSTUVWXYZ23456789";
export const davetKoduGecerli = (kod: string) => /^[A-Z2-9]{8}$/.test(kod);

/** Uyenin davet kodu; yoksa uretilir (cakisirsa yeniden denenir). */
export async function davetKodu(userId: string): Promise<string> {
  const u = await prisma.user.findUniqueOrThrow({ where: { id: userId }, select: { davetKodu: true } });
  if (u.davetKodu) return u.davetKodu;
  for (let i = 0; i < 5; i++) {
    const kod = Array.from({ length: 8 }, () => ALFABE[randomInt(ALFABE.length)]).join("");
    try {
      const g = await prisma.user.updateMany({ where: { id: userId, davetKodu: null }, data: { davetKodu: kod } });
      if (g.count) return kod;
      return (await prisma.user.findUniqueOrThrow({ where: { id: userId }, select: { davetKodu: true } })).davetKodu!;
    } catch (e) {
      if (!(e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2002")) throw e;
    }
  }
  throw new Error("Davet kodu üretilemedi.");
}

/** Kayit aninda cerezdeki koddan davet eden uyenin id'si (gecersiz/kendi kodu: null). */
export async function davetEdenId(kod: string | undefined | null): Promise<string | null> {
  if (!kod || !davetKoduGecerli(kod)) return null;
  return (await prisma.user.findUnique({ where: { davetKodu: kod }, select: { id: true } }))?.id ?? null;
}

/**
 * Davetli uye profilini tamamlayinca (bolum secince) iki tarafa da 1 hafta Pro. E-posta dogrulanmis olmasi zaten
 * kayit kosulu. Her davetli bir kez (ProHediye nedeni), davet eden en fazla DAVET_ODUL_SINIRI kez odul alir.
 */
export async function davetOdulunuVer(userId: string) {
  const u = await prisma.user.findUnique({ where: { id: userId }, select: { davetEdenId: true, departmentId: true } });
  if (!u?.davetEdenId || !u.departmentId) return;
  const kazanilan = await prisma.proHediye.count({ where: { userId: u.davetEdenId, neden: { startsWith: "davet:" } } });
  if (kazanilan >= DAVET_ODUL_SINIRI) return;
  const verildi = await proHediyeEt(userId, "davetli", DAVET_HEDIYE_GUN, "Davetle katıldın: 1 hafta Pro hediye");
  if (verildi) await proHediyeEt(u.davetEdenId, `davet:${userId}`, DAVET_HEDIYE_GUN, "Arkadaşın katıldı: 1 hafta Pro hediye");
}

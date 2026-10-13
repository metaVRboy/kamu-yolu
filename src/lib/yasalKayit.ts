import { createHmac } from "crypto";
import { headers } from "next/headers";
import { prisma } from "@/lib/prisma";

/**
 * Kanunen tutulmasi gereken islem kayitlari (YasalKayit):
 * - 5651 m.5/3 (yer saglayici trafik bilgisi): kullanici icerigi olusturma ve giris -> IP, zaman, kullanici. 2 yil.
 * - KVKK Silme Yonetmeligi m.7/3: hesap silme islemi kaydi. 3 yil.
 * Her satir sunucu sirriyla HMAC'lenir: sonradan degistirilmedigi gosterilebilir (butunluk).
 * Not: Vercel istemcinin kaynak portunu iletmiyor; kaydedilemiyor.
 */
export type YasalIslem = "giris" | "becayis-talep" | "becayis-mesaj" | "hesap-silindi" | "cerez-onay";

export const SAKLAMA_GUN: Record<YasalIslem, number> = {
  giris: 730,
  "becayis-talep": 730,
  "becayis-mesaj": 730,
  "hesap-silindi": 1095,
  // Cerez rizasinin ispati: tercih 12 ayda bir yenilenir, kayit 2 yil.
  "cerez-onay": 730,
};

export function yasalKayitOzeti(k: { zaman: Date; islem: string; userId: string | null; hedefId: string | null; ip: string | null; userAgent: string | null }) {
  return createHmac("sha256", process.env.SESSION_SECRET ?? "")
    .update([k.zaman.toISOString(), k.islem, k.userId ?? "", k.hedefId ?? "", k.ip ?? "", k.userAgent ?? ""].join("|"))
    .digest("hex");
}

/** Istek baglaminda cagrilir. Kayit yazilamazsa islemi bozmaz, yalniz loglar. */
export async function yasalKayitYaz(islem: YasalIslem, userId: string | null, hedefId: string | null = null) {
  try {
    const h = await headers();
    const ip = h.get("x-forwarded-for")?.split(",")[0]?.trim() || h.get("x-real-ip") || null;
    const userAgent = h.get("user-agent")?.slice(0, 300) ?? null;
    const zaman = new Date();
    await prisma.yasalKayit.create({
      data: { zaman, islem, userId, hedefId, ip, userAgent, ozet: yasalKayitOzeti({ zaman, islem, userId, hedefId, ip, userAgent }) },
    });
  } catch (err) {
    console.error("Yasal kayit yazilamadi:", islem, err);
  }
}

/** Saklama suresi dolan kayitlari siler (gunluk bakim cron'u). */
export async function suresiDolanYasalKayitlariSil() {
  let silinen = 0;
  for (const [islem, gun] of Object.entries(SAKLAMA_GUN)) {
    const r = await prisma.yasalKayit.deleteMany({ where: { islem, zaman: { lt: new Date(Date.now() - gun * 86_400_000) } } });
    silinen += r.count;
  }
  return silinen;
}

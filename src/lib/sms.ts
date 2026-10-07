import { prisma } from "@/lib/prisma";

export type SmsTuru = "DOGRULAMA" | "ILAN" | "BECAYIS";

/**
 * Turk cep telefonu numarasini "+905XXXXXXXXX" bicimine getirir; gecersizse null.
 * "0532 123 45 67", "532-123-4567", "+90 532 123 45 67", "905321234567" kabul edilir.
 */
export function telefonNormalize(girdi: string): string | null {
  const rakam = girdi.replace(/\D/g, "");
  const yerel = rakam.startsWith("90") && rakam.length === 12 ? rakam.slice(2) : rakam.startsWith("0") && rakam.length === 11 ? rakam.slice(1) : rakam;
  return /^5\d{9}$/.test(yerel) ? `+90${yerel}` : null;
}

/** "+905321234567" -> "0532 *** ** 67" (arayuzde ve loglarda maskeli gosterim). */
export function telefonMaskele(telefon: string): string {
  const y = telefon.replace(/^\+90/, "");
  return `0${y.slice(0, 3)} *** ** ${y.slice(8)}`;
}

/** Istanbul saatiyle 21:00-09:00 arasi bildirim SMS'i gonderilmez (dogrulama kodu haric). */
export function sessizSaatMi(an = new Date()): boolean {
  const saat = Number(new Intl.DateTimeFormat("en-GB", { hour: "2-digit", hourCycle: "h23", timeZone: "Europe/Istanbul" }).format(an));
  return saat < 9 || saat >= 21;
}

/** SMS saglayicisi ortam degiskeniyle secilir; tanimli degilse test modu (SMS gitmez, yalniz kayda yazilir). */
export function smsSaglayiciTanimli(): boolean {
  return !!process.env.SMS_SAGLAYICI;
}

/**
 * Tek giris noktasi: her SMS once SmsGonderim'e yazilir. Saglayici henuz
 * secilmedigi icin (SMS_SAGLAYICI bos) durum TEST olur ve hicbir SMS gitmez.
 * ponytail: saglayici secilince yalniz `saglayiciyaGonder` doldurulur.
 */
export async function smsGonder(params: { userId: string | null; telefon: string; metin: string; tur: SmsTuru; kapsamSonu?: Date | null }) {
  if (!smsSaglayiciTanimli()) {
    console.info(`[SMS TEST] ${params.tur} -> ${telefonMaskele(params.telefon)}: ${params.metin}`);
    return prisma.smsGonderim.create({ data: { ...params, durum: "TEST" } });
  }
  try {
    const saglayiciId = await saglayiciyaGonder(params.telefon, params.metin);
    return prisma.smsGonderim.create({ data: { ...params, durum: "GONDERILDI", saglayiciId } });
  } catch (err) {
    console.error("SMS gönderilemedi:", err);
    return prisma.smsGonderim.create({ data: { ...params, durum: "HATA", hata: String(err).slice(0, 500) } });
  }
}

async function saglayiciyaGonder(telefon: string, metin: string): Promise<string> {
  throw new Error(`SMS sağlayıcısı (${process.env.SMS_SAGLAYICI}) henüz bağlanmadı: ${telefon} / ${metin.length} karakter`);
}

/** Bu kullaniciya bu turde son `ms` icinde kac SMS kaydi olustu (limitler icin). */
export async function sonSmsSayisi(userId: string, tur: SmsTuru, ms: number): Promise<number> {
  return prisma.smsGonderim.count({ where: { userId, tur, olusturma: { gt: new Date(Date.now() - ms) } } });
}

/** Pro plani suresi dolmamis mi (admin panelden sureli verilebilir). */
export function proAktifMi(user: { abonelikPlani: string; abonelikBitis: Date | null }, an = Date.now()): boolean {
  return user.abonelikPlani !== "UCRETSIZ" && (!user.abonelikBitis || user.abonelikBitis.getTime() > an);
}

/** Prisma sorgulari icin: plani ucretsiz olmayan ve suresi dolmamis kullanicilar. */
export function aktifProKosulu(an = new Date()) {
  return { abonelikPlani: { not: "UCRETSIZ" as const }, OR: [{ abonelikBitis: null }, { abonelikBitis: { gt: an } }] };
}

/** "+905321234567" -> "0532 123 45 67" (kullanicinin kendi ekraninda okunur gosterim). */
export function telefonGoster(telefon: string): string {
  const y = telefon.replace(/^\+90/, "");
  return `0${y.slice(0, 3)} ${y.slice(3, 6)} ${y.slice(6, 8)} ${y.slice(8)}`;
}

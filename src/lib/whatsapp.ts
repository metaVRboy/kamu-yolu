import { prisma } from "@/lib/prisma";
import { SITE_URL } from "@/lib/site";
import { SABLONLAR, type MesajTuru } from "@/lib/whatsappSablonlari";

export { SABLONLAR, type MesajTuru };

const GRAPH = "https://graph.facebook.com/v25.0";

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

/** Istanbul saatiyle 21:00-09:00 arasi bildirim mesaji gonderilmez (dogrulama kodu haric). */
export function sessizSaatMi(an = new Date()): boolean {
  const saat = Number(new Intl.DateTimeFormat("en-GB", { hour: "2-digit", hourCycle: "h23", timeZone: "Europe/Istanbul" }).format(an));
  return saat < 9 || saat >= 21;
}

/** WhatsApp Cloud API anahtarlari tanimli degilse test modu (mesaj gitmez, yalniz kayda yazilir). */
export function whatsappTanimli(): boolean {
  return !!process.env.WHATSAPP_TOKEN && !!process.env.WHATSAPP_TELEFON_ID;
}

// Sablon degeri satir sonu/sekme ve 4'ten fazla bitisik bosluk iceremez (Meta reddeder).
const degerTemizle = (s: string) => s.replace(/\s+/g, " ").trim();

/**
 * Tek giris noktasi: her mesaj once WhatsappGonderim'e yazilir. Anahtarlar yoksa durum TEST olur, hicbir mesaj gitmez.
 * `degerler` govdedeki {{n}} sirasiyla; `yol` butonun SITE_URL'den sonraki kismi (bastaki "/" olmadan).
 */
export async function whatsappGonder(params: { userId: string | null; telefon: string; tur: MesajTuru; degerler?: string[]; yol?: string; kapsamSonu?: Date | null }) {
  const { degerler = [], yol, ...kayit } = params;
  const temiz = degerler.map(degerTemizle);
  const metin = SABLONLAR[params.tur].govde.replace(/\{\{(\d)\}\}/g, (_, n) => temiz[Number(n) - 1] ?? "");
  // Kayitta dogrulama kodu maskelenir: mesaj gecmisi kodu kalici tutmasin.
  const veri = { ...kayit, metin: params.tur === "DOGRULAMA" ? metin.replace(/\d{6}/g, "******") : metin };
  if (!whatsappTanimli()) {
    console.info(`[WHATSAPP TEST] ${params.tur} -> ${telefonMaskele(params.telefon)}: ${metin}${yol ? ` (${SITE_URL}/${yol})` : ""}`);
    return prisma.whatsappGonderim.create({ data: { ...veri, durum: "TEST" } });
  }
  try {
    const saglayiciId = await metayaGonder(params.telefon, params.tur, temiz, yol);
    return prisma.whatsappGonderim.create({ data: { ...veri, durum: "GONDERILDI", saglayiciId } });
  } catch (err) {
    console.error("WhatsApp mesajı gönderilemedi:", err);
    return prisma.whatsappGonderim.create({ data: { ...veri, durum: "HATA", hata: String(err).slice(0, 500) } });
  }
}

/**
 * Cloud API sablon mesaji. 200 = Meta kabul etti (teslim degil); teslim/okundu/hata sonradan webhook'la gelir
 * (/api/whatsapp/webhook, numarada WhatsApp yoksa HATA olur).
 */
async function metayaGonder(telefon: string, tur: MesajTuru, degerler: string[], yol?: string): Promise<string> {
  const metin = (text: string) => ({ type: "text", text });
  const components: object[] = degerler.length ? [{ type: "body", parameters: degerler.map(metin) }] : [];
  // Dogrulama: "kodu kopyala" butonu da kodu parametre olarak ister.
  if (tur === "DOGRULAMA") components.push({ type: "button", sub_type: "url", index: "0", parameters: [metin(degerler[0])] });
  else if (yol) components.push({ type: "button", sub_type: "url", index: "0", parameters: [metin(yol)] });
  return mesajGonder(telefon, { type: "template", template: { name: SABLONLAR[tur].ad, language: { code: "tr" }, components } });
}

/**
 * Admin cevabi: serbest metin yalniz kullanicinin son mesajindan sonraki 24 saatte gider (Meta kurali);
 * pencere kontrolu cagiranda. Basarida Meta mesaj kimligi (wamid).
 */
/** Kullanicinin son mesajindan sonra serbest metin cevap suresi (Meta musteri hizmeti penceresi). */
export const CEVAP_PENCERESI_MS = 24 * 3_600_000;

export function metinGonder(telefon: string, metin: string) {
  return mesajGonder(telefon, { type: "text", text: { body: metin } });
}

async function mesajGonder(telefon: string, icerik: object): Promise<string> {
  const res = await fetch(`${GRAPH}/${process.env.WHATSAPP_TELEFON_ID}/messages`, {
    method: "POST",
    headers: { Authorization: `Bearer ${process.env.WHATSAPP_TOKEN}`, "Content-Type": "application/json" },
    signal: AbortSignal.timeout(10_000),
    body: JSON.stringify({ messaging_product: "whatsapp", to: telefon.replace(/^\+/, ""), ...icerik }),
  });
  const data = await res.json().catch(() => null);
  const id = data?.messages?.[0]?.id;
  if (!res.ok || !id) throw new Error(`whatsapp ${data?.error?.code ?? res.status}: ${data?.error?.message ?? "yanıt okunamadı"}`);
  return String(id);
}

/** Bu kullaniciya bu turde son `ms` icinde kac mesaj kaydi olustu (limitler icin). */
export async function sonMesajSayisi(userId: string, tur: MesajTuru, ms: number): Promise<number> {
  return prisma.whatsappGonderim.count({ where: { userId, tur, olusturma: { gt: new Date(Date.now() - ms) } } });
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

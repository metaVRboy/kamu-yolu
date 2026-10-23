import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { kacis, sendEmail } from "@/lib/email";
import { SITE_URL } from "@/lib/site";
import { aktifProKosulu, sessizSaatMi, sonMesajSayisi, whatsappGonder } from "@/lib/whatsapp";

export const maxDuration = 120;

const GUN_MS = 24 * 60 * 60 * 1000;
const GUNLUK_ILAN_MESAJ_SINIRI = 3;
const EPOSTA_ILAN_SINIRI = 10;

function isAuthorized(req: NextRequest): boolean {
  const secret = process.env.CRON_SECRET ?? process.env.SCRAPE_SECRET;
  return !!secret && req.headers.get("authorization") === `Bearer ${secret}`;
}

/**
 * Taramalardan ~30 dk sonra calisir (vercel.json). Her Pro kullaniciya, son bildiriminden bu yana olusan "bolumune
 * uygun ilan" bildirimlerini kanal basina TEK iletide toplar (10 ilan = 1 mesaj): WhatsApp (izin + dogrulanmis
 * numara, gunde en fazla 3) ve e-posta (tercih acik). Site ici bildirim zaten olusturulmus durumda. Gece gonderilmez.
 * Her kanal kendi isaretinden (kapsamSonu / epostaIlanKapsam = bildirimin createdAt'i) yenileri sayar.
 */
export async function GET(req: NextRequest) {
  if (!isAuthorized(req)) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  if (sessizSaatMi()) return NextResponse.json({ ok: true, atlandi: "sessiz saat" });

  const whatsappKosulu = { whatsappIlanBildirimi: true, telefonDogrulandi: { not: null }, telefon: { not: null } };
  const kullanicilar = await prisma.user.findMany({
    // AND: aktifProKosulu de OR iceriyor, yayilsa biri digerini ezerdi.
    where: { AND: [aktifProKosulu(), { OR: [whatsappKosulu, { epostaIlanBildirimi: true }] }] },
    select: {
      id: true,
      email: true,
      adSoyad: true,
      telefon: true,
      telefonDogrulandi: true,
      whatsappIlanBildirimi: true,
      whatsappIzinTarihi: true,
      epostaIlanBildirimi: true,
      epostaIlanKapsam: true,
      department: { select: { name: true } },
    },
  });

  const yeniIlanlar = (userId: string, sonra: number) =>
    prisma.bildirim.findMany({
      where: { userId, tur: "ILAN_ESLESME", createdAt: { gt: new Date(Math.max(sonra, Date.now() - GUN_MS)) } },
      orderBy: { createdAt: "desc" },
      select: { icerik: true, createdAt: true },
    });

  let whatsapp = 0;
  let eposta = 0;
  // ponytail: kullanici basina sirali dongu; ~300 alicidan sonra maxDuration'a yaklasir. O zaman: e-posta Resend
  // batch (100/istek) + WhatsApp esanli havuz (Meta 80 mesaj/sn) ya da kuyruk.
  for (const k of kullanicilar) {
    if (k.whatsappIlanBildirimi && k.telefonDogrulandi && k.telefon && (await sonMesajSayisi(k.id, "ILAN", GUN_MS)) < GUNLUK_ILAN_MESAJ_SINIRI) {
      // Isaret yalniz Meta'nin kabul ettigi mesajdan: HATA (ör. gunluk alici siniri) olan ilanlar sonraki turda yeniden denenir.
      const sonMesaj = await prisma.whatsappGonderim.findFirst({
        where: { userId: k.id, tur: "ILAN", kapsamSonu: { not: null }, durum: { not: "HATA" } },
        orderBy: { olusturma: "desc" },
        select: { kapsamSonu: true },
      });
      // Izinden onceki ilanlar WhatsApp'tan gelmez.
      const yeni = await yeniIlanlar(k.id, Math.max(sonMesaj?.kapsamSonu?.getTime() ?? 0, k.whatsappIzinTarihi?.getTime() ?? 0));
      if (yeni.length) {
        await whatsappGonder({ userId: k.id, telefon: k.telefon, tur: "ILAN", kapsamSonu: yeni[0].createdAt, degerler: [k.department?.name ?? "seçtiğin", String(yeni.length)], yol: "profilim" });
        whatsapp++;
      }
    }

    if (k.epostaIlanBildirimi) {
      const yeni = await yeniIlanlar(k.id, k.epostaIlanKapsam?.getTime() ?? 0);
      if (!yeni.length) continue;
      try {
        await sendEmail({ to: k.email, subject: `Bölümüne uygun ${yeni.length} yeni ilan — Kamu Yolu`, html: ilanEpostasi(k.adSoyad, yeni.map((b) => b.icerik ?? "Yeni ilan")) });
        await prisma.user.update({ where: { id: k.id }, data: { epostaIlanKapsam: yeni[0].createdAt } });
        eposta++;
      } catch (err) {
        // Isaret ilerlemez: sonraki turda ayni ilanlar yeniden denenir.
        console.error("İlan e-postası gönderilemedi:", err);
      }
    }
  }

  return NextResponse.json({ ok: true, aday: kullanicilar.length, whatsapp, eposta });
}

function ilanEpostasi(adSoyad: string, basliklar: string[]) {
  const liste = basliklar
    .slice(0, EPOSTA_ILAN_SINIRI)
    .map((b) => `<li style="margin:4px 0">${kacis(b)}</li>`)
    .join("");
  const fazla = basliklar.length > EPOSTA_ILAN_SINIRI ? `<p>…ve ${basliklar.length - EPOSTA_ILAN_SINIRI} ilan daha.</p>` : "";
  return `
    <p>Merhaba ${kacis(adSoyad)},</p>
    <p>Bölümüne uygun yeni ilanlar yayımlandı:</p>
    <ul>${liste}</ul>${fazla}
    <p><a href="${SITE_URL}/profilim" style="display:inline-block;background:#2563eb;color:#fff;padding:10px 18px;border-radius:8px;text-decoration:none;font-weight:600">İlanları gör</a></p>
    <p style="color:#64748b;font-size:12px">Bu e-postayı Pro ilan bildirimlerin açık olduğu için aldın.
    <a href="${SITE_URL}/profilim/ayarlar/bildirimler">Bildirim ayarlarından</a> istediğin an kapatabilirsin.</p>
  `;
}

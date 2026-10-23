import { createHmac, timingSafeEqual } from "crypto";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

/**
 * Meta WhatsApp webhook'u (Meta uygulamasi > WhatsApp > Configuration'da bu adres + WHATSAPP_WEBHOOK_TOKEN).
 * GET: abonelik dogrulamasi. POST: imza (WHATSAPP_APP_SECRET) dogrulanir; gelen mesajlar admin sohbetine yazilir,
 * gonderdigimiz mesajlarin teslim/okundu/hata durumu guncellenir. Veritabani hatasinda 500 doner, Meta tekrar dener
 * (waId tekil: ayni mesaj iki kez yazilmaz); bozuk govde 200 ile yutulur (tekrar denemenin anlami yok).
 */
export function GET(req: NextRequest) {
  const p = req.nextUrl.searchParams;
  const token = process.env.WHATSAPP_WEBHOOK_TOKEN;
  if (token && p.get("hub.mode") === "subscribe" && p.get("hub.verify_token") === token) return new NextResponse(p.get("hub.challenge") ?? "");
  return NextResponse.json({ error: "forbidden" }, { status: 403 });
}

function imzaGecerli(govde: string, imza: string | null) {
  const sir = process.env.WHATSAPP_APP_SECRET;
  if (!sir || !imza?.startsWith("sha256=")) return false;
  const beklenen = Buffer.from(createHmac("sha256", sir).update(govde).digest("hex"));
  const gelen = Buffer.from(imza.slice(7));
  return beklenen.length === gelen.length && timingSafeEqual(beklenen, gelen);
}

type GelenMesaj = { from: string; id: string; timestamp: string; type: string; text?: { body: string }; button?: { text: string }; interactive?: { button_reply?: { title: string }; list_reply?: { title: string } } };
type WebhookGovdesi = { entry?: { changes?: { value?: { messages?: GelenMesaj[]; statuses?: Durum[] } }[] }[] };
type Durum = { id: string; status: "sent" | "delivered" | "read" | "failed"; errors?: { code: number; title: string; message?: string }[] };

const TUR_ADI: Record<string, string> = { image: "görsel", video: "video", audio: "ses kaydı", document: "belge", sticker: "çıkartma", location: "konum", contacts: "kişi kartı" };
// Webhook sirasiz gelebilir (okundu, teslimden once): durum yalniz ileri gider; HATA her durumu ezer.
const SIRA = { sent: ["GONDERILDI"], delivered: ["GONDERILDI", "TESLIM"], read: ["GONDERILDI", "TESLIM", "OKUNDU"] } as const;
const DURUM = { sent: "GONDERILDI", delivered: "TESLIM", read: "OKUNDU" } as const;

const mesajMetni = (m: GelenMesaj) =>
  m.text?.body ?? m.button?.text ?? m.interactive?.button_reply?.title ?? m.interactive?.list_reply?.title ?? `[${TUR_ADI[m.type] ?? m.type}]`;

export async function POST(req: NextRequest) {
  const govde = await req.text();
  if (!imzaGecerli(govde, req.headers.get("x-hub-signature-256"))) return NextResponse.json({ error: "imza" }, { status: 401 });

  let veri: WebhookGovdesi;
  try {
    veri = JSON.parse(govde);
  } catch {
    return NextResponse.json({ ok: true });
  }
  const degerler = (veri.entry ?? []).flatMap((e) => e.changes ?? []).map((c) => c.value ?? {});

  for (const m of degerler.flatMap((v) => v.messages ?? [])) {
    const telefon = `+${m.from}`;
    const uye = await prisma.user.findFirst({ where: { telefon, telefonDogrulandi: { not: null } }, select: { id: true } });
    await prisma.whatsappMesaj.createMany({
      data: [{ telefon, userId: uye?.id ?? null, yon: "GELEN", metin: mesajMetni(m).slice(0, 4000), waId: m.id, olusturma: new Date(Number(m.timestamp) * 1000) }],
      skipDuplicates: true,
    });
  }

  for (const d of degerler.flatMap((v) => v.statuses ?? [])) {
    if (d.status === "failed") {
      const hata = d.errors?.map((e) => `${e.code}: ${e.message ?? e.title}`).join("; ").slice(0, 500) ?? "failed";
      await prisma.whatsappGonderim.updateMany({ where: { saglayiciId: d.id }, data: { durum: "HATA", hata } });
      await prisma.whatsappMesaj.updateMany({ where: { waId: d.id }, data: { durum: "HATA", hata } });
    } else if (d.status in DURUM) {
      const once = [...SIRA[d.status]];
      await prisma.whatsappGonderim.updateMany({ where: { saglayiciId: d.id, durum: { in: once } }, data: { durum: DURUM[d.status] } });
      await prisma.whatsappMesaj.updateMany({ where: { waId: d.id, durum: { in: once } }, data: { durum: DURUM[d.status] } });
    }
  }
  return NextResponse.json({ ok: true });
}

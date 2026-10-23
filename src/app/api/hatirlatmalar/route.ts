import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createBildirim } from "@/lib/notifications";
import { aktifProKosulu, faydaSablonuOnayli, whatsappGonder } from "@/lib/whatsapp";
import { SABLONLAR } from "@/lib/whatsappSablonlari";
import { pushGonder } from "@/lib/push";
import { bugununTarihi } from "@/lib/kpssDeneme";
import { slugify } from "@/lib/slug";

export const maxDuration = 120;

const GUN_MS = 86_400_000;
const TARIH = new Intl.DateTimeFormat("tr-TR", { dateStyle: "long", timeZone: "Europe/Istanbul" });

function yetkili(req: NextRequest) {
  const secret = process.env.CRON_SECRET;
  return !!secret && req.headers.get("authorization") === `Bearer ${secret}`;
}

/**
 * Gunluk hatirlatmalar (vercel.json): ?tur=ilan 10:00 TR, takip edilen ilanlarin son basvurusuna 3 gun ve 1 gun
 * kala (Pro: site bildirimi + tarayici bildirimi + WhatsApp izni varsa WhatsApp; her esik bir kez). ?tur=seri 19:00 TR,
 * bugun gunun sorularini cozmemis tarayici bildirimi abonelerine hatirlatma. Sonuc Taramalar sayfasina yazilir.
 */
export async function GET(req: NextRequest) {
  if (!yetkili(req)) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const tur = req.nextUrl.searchParams.get("tur");
  const baslangic = new Date();
  try {
    const sonuc = tur === "seri" ? await seriHatirlat() : await ilanHatirlat();
    await prisma.scrapeRun.create({
      data: { sourceName: `Hatırlatmalar (${tur === "seri" ? "seri" : "ilan"})`, status: "SUCCESS", startedAt: baslangic, finishedAt: new Date(), postingsFound: sonuc.gonderilen, errorMessage: JSON.stringify(sonuc) },
    });
    return NextResponse.json({ ok: true, ...sonuc });
  } catch (e) {
    await prisma.scrapeRun.create({
      data: { sourceName: `Hatırlatmalar (${tur === "seri" ? "seri" : "ilan"})`, status: "FAILED", startedAt: baslangic, finishedAt: new Date(), errorMessage: String(e).slice(0, 500) },
    });
    throw e;
  }
}

async function ilanHatirlat() {
  const simdi = Date.now();
  let gonderilen = 0;
  // WhatsApp hatirlatmasi yalniz sablon Meta'da fayda olarak onayliysa (pazarlama ucreti odenmez); sabah 10:00, sessiz saat disi.
  const whatsappUygun = await faydaSablonuOnayli(SABLONLAR.HATIRLATMA.ad);
  for (const [alan, gun] of [["hatirlatma1", 1], ["hatirlatma3", 3]] as const) {
    const takipler = await prisma.ilanTakip.findMany({
      where: {
        [alan]: null,
        posting: { isActive: true, adminGizli: false, applicationEnd: { gte: new Date(simdi), lte: new Date(simdi + gun * GUN_MS) } },
        user: aktifProKosulu(),
      },
      include: {
        posting: { select: { id: true, title: true, institutionName: true, applicationEnd: true } },
        user: { select: { id: true, pushAbonelikleri: true, telefon: true, telefonDogrulandi: true, whatsappIlanBildirimi: true } },
      },
    });
    for (const t of takipler) {
      // Tek seferlik: paralel calisma ayni hatirlatmayi iki kez gondermesin (1 gun kala gonderilen 3 gun esigini de kapatir).
      const isaret = await prisma.ilanTakip.updateMany({ where: { id: t.id, [alan]: null }, data: alan === "hatirlatma1" ? { hatirlatma1: new Date(), hatirlatma3: new Date() } : { hatirlatma3: new Date() } });
      if (!isaret.count) continue;
      const kalan = Math.max(1, Math.ceil((t.posting.applicationEnd!.getTime() - simdi) / GUN_MS));
      const baslik = `Son başvuruya ${kalan} gün kaldı`;
      const link = `/ilan/${t.posting.id}/${slugify(t.posting.title)}`;
      await createBildirim({ userId: t.userId, tur: "ILAN_HATIRLATMA", baslik, icerik: t.posting.title, link });
      await pushGonder(t.user.pushAbonelikleri, { baslik, govde: t.posting.title, link });
      if (whatsappUygun && t.user.whatsappIlanBildirimi && t.user.telefonDogrulandi && t.user.telefon) {
        const tarih = TARIH.format(t.posting.applicationEnd!);
        await whatsappGonder({ userId: t.userId, telefon: t.user.telefon, tur: "HATIRLATMA", degerler: [t.posting.title.slice(0, 80), tarih, String(kalan)], yol: link.slice(1) });
      }
      gonderilen++;
    }
  }
  return { gonderilen };
}

async function seriHatirlat() {
  const cozenler = await prisma.gunlukSoruCevap.findMany({ where: { tarih: bugununTarihi() }, select: { userId: true } });
  const cozdu = new Set(cozenler.map((c) => c.userId));
  const abonelikler = (await prisma.pushAbonelik.findMany()).filter((a) => !a.userId || !cozdu.has(a.userId));
  const gonderilen = await pushGonder(abonelikler, {
    baslik: "Günün 5 sorusu seni bekliyor",
    govde: "Bugünün sorularını çöz, serini sürdür. 7 günde 1 gün Pro hediye.",
    link: "/gunun-sorulari",
  });
  return { aday: abonelikler.length, gonderilen };
}

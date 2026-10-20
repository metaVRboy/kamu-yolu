import webpush from "web-push";
import { prisma } from "@/lib/prisma";
import { ILETISIM_EPOSTA } from "@/lib/site";
import { VAPID_ACIK_ANAHTAR } from "@/lib/vapid";

export type PushIcerik = { baslik: string; govde: string; link: string };

let hazir = false;
function kur(): boolean {
  if (hazir) return true;
  const ozel = process.env.VAPID_PRIVATE_KEY;
  if (!ozel) return false;
  webpush.setVapidDetails(`mailto:${ILETISIM_EPOSTA}`, VAPID_ACIK_ANAHTAR, ozel);
  hazir = true;
  return true;
}

/**
 * Aboneliklere bildirim gonderir; tarayicinin iptal ettigi (404/410) abonelikler silinir.
 * Gonderilen sayisi doner (anahtar yoksa 0: is calisir ama bildirim gitmez, kayitta gorunur).
 */
export async function pushGonder(abonelikler: { id: string; endpoint: string; p256dh: string; auth: string }[], icerik: PushIcerik) {
  if (!kur()) return 0;
  let giden = 0;
  const olu: string[] = [];
  await Promise.all(
    abonelikler.map(async (a) => {
      try {
        await webpush.sendNotification({ endpoint: a.endpoint, keys: { p256dh: a.p256dh, auth: a.auth } }, JSON.stringify(icerik), { TTL: 6 * 3600 });
        giden++;
      } catch (e) {
        const kod = (e as { statusCode?: number }).statusCode;
        if (kod === 404 || kod === 410) olu.push(a.id);
        else console.error("Push gönderilemedi:", kod ?? e);
      }
    }),
  );
  if (olu.length) await prisma.pushAbonelik.deleteMany({ where: { id: { in: olu } } });
  return giden;
}

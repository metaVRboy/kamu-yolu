import { prisma } from "@/lib/prisma";
import { adminSayfasi } from "@/lib/admin";
import { hedefKitleSayisi } from "@/lib/notifications";
import { AdminBaslik } from "@/components/admin/AdminUI";
import { AdminBildirimPanel, type YayinKaydi } from "@/components/admin/AdminBildirimPanel";

export const metadata = { title: "Bildirimler — Admin" };

const TARIH = new Intl.DateTimeFormat("tr-TR", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit", timeZone: "Europe/Istanbul" });

/** Durum sunucu saatiyle hesaplanir (zamanlanmis mi, yayinda mi). */
function durumu(d: { geriCekildi: Date | null; yayinZamani: Date }, simdi = Date.now()): YayinKaydi["durum"] {
  if (d.geriCekildi) return "geri";
  return d.yayinZamani.getTime() > simdi ? "zamanli" : "yayinda";
}

export default async function AdminBildirimlerPage() {
  await adminSayfasi();
  const [duyurular, bolumler, herkes] = await Promise.all([
    prisma.duyuru.findMany({ orderBy: { yayinZamani: "desc" }, take: 60 }),
    prisma.department.findMany({ select: { id: true, name: true }, orderBy: { name: "asc" } }),
    hedefKitleSayisi("HERKES", null),
  ]);
  const bolumAdi = new Map(bolumler.map((b) => [b.id, b.name]));

  return (
    <>
      <AdminBaslik
        baslik="Bildirim yayınla"
        aciklama="Yayınladığın bildirimler zilin “Genel” sekmesinde, seçtiğin kitleye görünür ve okunmamışsa zilde kırmızı nokta çıkar. Herkese gidenleri giriş yapmamış ziyaretçiler de görür."
      />
      <AdminBildirimPanel
        herkesSayisi={herkes}
        bolumler={bolumler}
        kayitlar={duyurular.map((d) => ({
          id: d.id,
          baslik: d.baslik,
          icerik: d.icerik,
          link: d.link,
          hedef:
            d.hedefTur === "HERKES"
              ? "Herkes"
              : d.hedefTur === "BOLUM"
                ? `Bölüm: ${bolumAdi.get(d.hedefDeger ?? "") ?? "silinmiş bölüm"}`
                : `${d.hedefTur === "PLAN" ? "Plan" : "Düzey"}: ${d.hedefDeger}`,
          aliciSayisi: d.aliciSayisi,
          zaman: TARIH.format(d.yayinZamani),
          durum: durumu(d),
        }))}
      />
    </>
  );
}

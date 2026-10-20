import { NextResponse } from "next/server";
import { adminApi } from "@/lib/admin";
import { ILETISIM_EPOSTA, ILETISIM_TELEFON, SATICI } from "@/lib/site";

const ALAN_ADI = "kamuyolu.com";
const tarih = (iso: string) => new Date(iso).toLocaleDateString("tr-TR", { day: "2-digit", month: "2-digit", year: "numeric", timeZone: "Europe/Istanbul" });

/**
 * 5651 yer saglayici: BTK'ya her ayin ilk haftasinda yuklenen "Barindirilan Alan Adlari" CSV'si. BTK talimati:
 * baslik yok, satir basina 6 alan (alan adi, sahibi, telefon, e-posta, kayit tarihi, bitis tarihi), veride virgul yok.
 * Tarihler her indiriste alan adinin RDAP kaydindan: yenileme sonrasi bitis tarihi kendiliginden guncellenir.
 */
export async function GET() {
  if (!(await adminApi())) return NextResponse.json({ error: "Yetkisiz." }, { status: 403 });
  const rdap = await fetch(`https://rdap.verisign.com/com/v1/domain/${ALAN_ADI}`, { signal: AbortSignal.timeout(10_000), cache: "no-store" })
    .then((r) => (r.ok ? (r.json() as Promise<{ events: { eventAction: string; eventDate: string }[] }>) : null))
    .catch(() => null);
  const olay = (ad: string) => rdap?.events.find((e) => e.eventAction === ad)?.eventDate;
  const kayit = olay("registration");
  const bitis = olay("expiration");
  // Tarih alinamazsa yanlis dosya inmesin: BTK'ya eksik/eski tarih yuklenmesin.
  if (!kayit || !bitis) return NextResponse.json({ error: "Alan adı kayıt bilgisi alınamadı, biraz sonra tekrar dene." }, { status: 502 });
  const telefon = "0" + ILETISIM_TELEFON.tel.slice(-10);
  const satir = [ALAN_ADI, SATICI.unvan, telefon, ILETISIM_EPOSTA, tarih(kayit), tarih(bitis)].map((v) => String(v).replace(/[,;]/g, "-")).join(",");
  return new Response(satir + "\r\n", {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="Barindirilan Alan Adlari.csv"`,
    },
  });
}

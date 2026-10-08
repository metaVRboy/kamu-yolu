import { getPostingById } from "@/lib/matching";
import { duzgunHarf, kadroAdi } from "@/lib/ilanVitrin";
import { SITE_URL } from "@/lib/site";
import { slugify } from "@/lib/slug";

const ISTANBUL_GUNU = new Intl.DateTimeFormat("en-CA", { timeZone: "Europe/Istanbul" }); // YYYY-MM-DD

/** iCalendar metin alanlarinda virgul, noktali virgul, ters bolu ve satir sonu kacirilir. */
const ics = (s: string) => s.replace(/[\\;,]/g, (c) => `\\${c}`).replace(/\r?\n/g, "\\n");

/**
 * "Takvime ekle": son basvuru gununu tum gun etkinligi olarak .ics dosyasiyla verir
 * (Google/Apple/Outlook takvimi acar). Bir gun once hatirlatma icerir.
 */
export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const posting = await getPostingById(id);
  if (!posting?.applicationEnd) return new Response("Bu ilanın son başvuru tarihi yok.", { status: 404 });

  const gun = ISTANBUL_GUNU.format(posting.applicationEnd).replaceAll("-", "");
  const ertesi = ISTANBUL_GUNU.format(new Date(posting.applicationEnd.getTime() + 24 * 60 * 60 * 1000)).replaceAll("-", "");
  const kadro = kadroAdi(posting.title, posting.institutionName);
  const kurum = duzgunHarf(posting.institutionName);
  const sayfa = `${SITE_URL}/ilan/${id}/${slugify(posting.title)}`;
  const damga = new Date().toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");

  const govde = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Kamu Yolu//Ilan Takvimi//TR",
    "CALSCALE:GREGORIAN",
    "BEGIN:VEVENT",
    `UID:ilan-${id}@kamuyolu.com`,
    `DTSTAMP:${damga}`,
    `DTSTART;VALUE=DATE:${gun}`,
    `DTEND;VALUE=DATE:${ertesi}`,
    `SUMMARY:${ics(`Son başvuru: ${kadro} — ${kurum}`)}`,
    `DESCRIPTION:${ics(`Resmi ilan: ${posting.sourceUrl}\nKamu Yolu: ${sayfa}`)}`,
    `URL:${sayfa}`,
    "BEGIN:VALARM",
    "TRIGGER:-P1D",
    "ACTION:DISPLAY",
    `DESCRIPTION:${ics(`Yarın son başvuru günü: ${kadro}`)}`,
    "END:VALARM",
    "END:VEVENT",
    "END:VCALENDAR",
  ].join("\r\n");

  return new Response(govde, {
    headers: {
      "Content-Type": "text/calendar; charset=utf-8",
      "Content-Disposition": `attachment; filename="son-basvuru-${slugify(kadro)}.ics"`,
    },
  });
}

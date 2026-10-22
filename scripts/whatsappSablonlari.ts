/**
 * WhatsApp sablonlarini Meta'da olusturur (src/lib/whatsappSablonlari.ts) ve durumlarini listeler.
 * Calistirma: npx tsx --env-file=.env.prod scripts/whatsappSablonlari.ts            (olustur + listele)
 *             npx tsx --env-file=.env.prod scripts/whatsappSablonlari.ts --durum    (yalniz listele)
 * Gerekli: WHATSAPP_TOKEN, WHATSAPP_WABA_ID. Onay genelde dakikalar-saatler surer; APPROVED olmadan mesaj gitmez.
 */
import { SITE_URL } from "../src/lib/site";
import { SABLONLAR } from "../src/lib/whatsappSablonlari";

const GRAPH = "https://graph.facebook.com/v25.0";
const { WHATSAPP_TOKEN: token, WHATSAPP_WABA_ID: waba } = process.env;
if (!token || !waba)
  throw new Error("WHATSAPP_TOKEN ve WHATSAPP_WABA_ID gerekli");

async function graph(yol: string, govde?: object) {
  const res = await fetch(`${GRAPH}/${yol}`, {
    method: govde ? "POST" : "GET",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: govde && JSON.stringify(govde),
  });
  return { ok: res.ok, data: await res.json() };
}

(async () => {
  if (!process.argv.includes("--durum")) {
    for (const s of Object.values(SABLONLAR)) {
      const components =
        s.kategori === "AUTHENTICATION"
          ? [
              { type: "BODY", add_security_recommendation: true },
              { type: "FOOTER", code_expiration_minutes: 10 },
              {
                type: "BUTTONS",
                buttons: [{ type: "OTP", otp_type: "COPY_CODE" }],
              },
            ]
          : [
              {
                type: "BODY",
                text: s.govde,
                ...(s.ornek.length
                  ? { example: { body_text: [s.ornek] } }
                  : {}),
              },
              {
                type: "BUTTONS",
                buttons: [
                  {
                    type: "URL",
                    text: s.buton.metin,
                    url: `${SITE_URL}/{{1}}`,
                    example: [`${SITE_URL}/${s.buton.ornekYol}`],
                  },
                ],
              },
            ];
      const r = await graph(`${waba}/message_templates`, {
        name: s.ad,
        language: "tr",
        category: s.kategori,
        components,
      });
      console.log(
        s.ad,
        r.ok
          ? `gonderildi (${r.data.status})`
          : `HATA: ${r.data.error?.error_user_msg ?? r.data.error?.message}`,
      );
    }
  }

  const liste = await graph(
    `${waba}/message_templates?fields=name,status,category,rejected_reason&limit=50`,
  );
  for (const t of liste.data.data ?? [])
    console.log(
      `${t.name.padEnd(28)} ${t.status.padEnd(10)} ${t.category}${t.rejected_reason && t.rejected_reason !== "NONE" ? ` (${t.rejected_reason})` : ""}`,
    );
})();

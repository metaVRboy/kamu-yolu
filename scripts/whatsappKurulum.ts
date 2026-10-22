/**
 * WhatsApp Cloud API kurulumu (anahtarlar .env.prod'da; degerleri ekrana yazilmaz):
 *   npx tsx --env-file=.env.prod scripts/whatsappKurulum.ts durum            numara + sablon durumu
 *   npx tsx --env-file=.env.prod scripts/whatsappKurulum.ts kaydet           numarayi Cloud API'ye kaydet (WHATSAPP_PIN, 6 hane)
 *   npx tsx --env-file=.env.prod scripts/whatsappKurulum.ts sablonlar        src/lib/whatsappSablonlari.ts -> Meta (onay: dakikalar-saatler)
 *   npx tsx --env-file=.env.prod scripts/whatsappKurulum.ts test 05XXXXXXXXX dogrulama sablonu ile tek test mesaji
 * Gerekli: WHATSAPP_TOKEN, WHATSAPP_TELEFON_ID, WHATSAPP_WABA_ID.
 */
import { SITE_URL } from "../src/lib/site";
import { SABLONLAR } from "../src/lib/whatsappSablonlari";
import { telefonNormalize } from "../src/lib/whatsapp";

const GRAPH = "https://graph.facebook.com/v25.0";
const { WHATSAPP_TOKEN: token, WHATSAPP_TELEFON_ID: telefonId, WHATSAPP_WABA_ID: waba, WHATSAPP_PIN: pin } = process.env;
if (!token || !telefonId || !waba) throw new Error("WHATSAPP_TOKEN, WHATSAPP_TELEFON_ID ve WHATSAPP_WABA_ID gerekli");

async function graph(yol: string, govde?: object) {
  const res = await fetch(`${GRAPH}/${yol}`, {
    method: govde ? "POST" : "GET",
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    body: govde && JSON.stringify(govde),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(`${data.error?.code}: ${data.error?.error_user_msg ?? data.error?.message}`);
  return data;
}

const komutlar: Record<string, () => Promise<void>> = {
  async durum() {
    const n = await graph(`${telefonId}?fields=display_phone_number,verified_name,name_status,quality_rating,platform_type`);
    console.log(`Numara: ${n.display_phone_number} | Ad: ${n.verified_name} (${n.name_status}) | Kalite: ${n.quality_rating} | Kayit: ${n.platform_type}`);
    const liste = await graph(`${waba}/message_templates?fields=name,status,category,rejected_reason&limit=50`);
    for (const t of liste.data) console.log(`${t.name.padEnd(28)} ${t.status.padEnd(10)} ${t.category}${t.rejected_reason && t.rejected_reason !== "NONE" ? ` (${t.rejected_reason})` : ""}`);
  },

  // Panelden numara eklemek Cloud API kaydini tamamlamaz; iki adimli dogrulama PIN'i ile register gerekir.
  async kaydet() {
    if (!pin || !/^\d{6}$/.test(pin)) throw new Error("WHATSAPP_PIN (6 hane) .env.prod'a yazilmali");
    await graph(`${telefonId}/register`, { messaging_product: "whatsapp", pin });
    console.log("Numara Cloud API'ye kaydedildi.");
  },

  async sablonlar() {
    for (const s of Object.values(SABLONLAR)) {
      const components =
        s.kategori === "AUTHENTICATION"
          ? [
              { type: "BODY", add_security_recommendation: true },
              { type: "FOOTER", code_expiration_minutes: 10 },
              { type: "BUTTONS", buttons: [{ type: "OTP", otp_type: "COPY_CODE" }] },
            ]
          : [
              { type: "BODY", text: s.govde, ...(s.ornek.length ? { example: { body_text: [s.ornek] } } : {}) },
              { type: "BUTTONS", buttons: [{ type: "URL", text: s.buton.metin, url: `${SITE_URL}/{{1}}`, example: [`${SITE_URL}/${s.buton.ornekYol}`] }] },
            ];
      try {
        const r = await graph(`${waba}/message_templates`, { name: s.ad, language: "tr", category: s.kategori, components });
        console.log(`${s.ad}: gonderildi (${r.status})`);
      } catch (e) {
        console.log(`${s.ad}: HATA ${(e as Error).message}`);
      }
    }
  },

  // Kayit/istatistik tutmadan Meta'ya dogrudan: kurulum testi (uygulamadaki akis /profilim/ayarlar/bildirimler).
  async test() {
    const telefon = telefonNormalize(process.argv[3] ?? "");
    if (!telefon) throw new Error("Gecerli numara: test 05XXXXXXXXX");
    const kod = "123456";
    const r = await graph(`${telefonId}/messages`, {
      messaging_product: "whatsapp",
      to: telefon.slice(1),
      type: "template",
      template: {
        name: SABLONLAR.DOGRULAMA.ad,
        language: { code: "tr" },
        components: [
          { type: "body", parameters: [{ type: "text", text: kod }] },
          { type: "button", sub_type: "url", index: "0", parameters: [{ type: "text", text: kod }] },
        ],
      },
    });
    console.log(`Meta kabul etti: ${r.messages?.[0]?.id}. Telefonda "123456 doğrulama kodunuzdur" mesajini kontrol et.`);
  },
};

const komut = komutlar[process.argv[2] ?? "durum"];
if (!komut) throw new Error(`Komutlar: ${Object.keys(komutlar).join(", ")}`);
komut().catch((e) => {
  console.error("HATA", e.message);
  process.exit(1);
});

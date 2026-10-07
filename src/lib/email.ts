import { SITE_URL } from "@/lib/site";

export async function sendEmail(params: { to: string; subject: string; html: string }) {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) throw new Error("RESEND_API_KEY tanımlı değil.");

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: process.env.RESEND_FROM_EMAIL || "Kamu Yolu <onboarding@resend.dev>",
      to: params.to,
      subject: params.subject,
      html: params.html,
    }),
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`E-posta gönderilemedi (${res.status}): ${text}`);
  }
}

const kacis = (s: string) => s.replace(/[&<>"']/g, (c) => `&#${c.charCodeAt(0)};`);

/**
 * Hesapta guvenlikle ilgili bir degisiklik oldugunda (sifre, e-posta, Google
 * baglantisi, hesap silme) kullaniciya "bu sen miydin?" bildirimi. Gonderilemezse
 * islem geri alinmaz - yalnizca loglanir.
 */
export async function guvenlikEpostasi(to: string, adSoyad: string, olay: string) {
  try {
    await sendEmail({
      to,
      subject: "Kamu Yolu — Hesabında bir değişiklik yapıldı",
      html: `
        <p>Merhaba ${kacis(adSoyad)},</p>
        <p>Kamu Yolu hesabında az önce şu işlem yapıldı: <strong>${kacis(olay)}</strong>.</p>
        <p>Bu işlemi sen yaptıysan bir şey yapmana gerek yok. Sen yapmadıysan hemen
        <a href="${SITE_URL}/sifremi-unuttum">şifreni sıfırla</a> ve bize bildir.</p>
      `,
    });
  } catch (err) {
    console.error("Güvenlik e-postası gönderilemedi:", err);
  }
}

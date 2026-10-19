/**
 * Cloudflare Turnstile token'ini sunucu tarafinda dogrular. Kayit/giris
 * gibi kotu niyetli botlarin hedefi olabilecek uc noktalarda kullanilir.
 */
export async function verifyTurnstileToken(token: string | undefined | null): Promise<boolean> {
  if (!token) return false;

  const secret = process.env.TURNSTILE_SECRET_KEY;
  if (!secret) {
    // Canlida anahtar dusmusse kapali kal: yoksa giris/kayit sessizce bot korumasiz kalirdi.
    console.error("TURNSTILE_SECRET_KEY tanımlı değil.");
    return process.env.NODE_ENV !== "production";
  }

  try {
    const res = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({ secret, response: token }),
      signal: AbortSignal.timeout(8000),
    });
    const data = await res.json();
    return data.success === true;
  } catch {
    return false;
  }
}

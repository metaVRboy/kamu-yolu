import { NextRequest, NextResponse } from "next/server";
import { randomBytes } from "crypto";
import { SITE_URL } from "@/lib/site";
import { getCurrentUser, googleBaglaJetonu, googleBaglaJetonuCoz } from "@/lib/auth";

export const GOOGLE_CALLBACK_PATH = "/api/auth/google/callback";

/** Kullaniciyi Google'in kendi onay ekranina yonlendirir. */
export async function GET(req: NextRequest) {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  if (!clientId) {
    return NextResponse.redirect(`${SITE_URL}/giris?hata=google-yapilandirma`);
  }

  // CSRF korumasi: rastgele bir deger hem URL'ye hem kisa omurlu bir
  // cerezeye yazilir; callback'te ikisi birbirini dogrulamazsa istek
  // reddedilir.
  const state = randomBytes(16).toString("hex");
  const url = new URL("https://accounts.google.com/o/oauth2/v2/auth");
  url.searchParams.set("client_id", clientId);
  url.searchParams.set("redirect_uri", `${SITE_URL}${GOOGLE_CALLBACK_PATH}`);
  url.searchParams.set("response_type", "code");
  url.searchParams.set("scope", "openid email profile");
  url.searchParams.set("state", state);
  url.searchParams.set("prompt", "select_account");

  const res = NextResponse.redirect(url.toString());
  res.cookies.set("google_oauth_state", state, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 600,
  });
  const cerez = { httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "lax" as const, path: "/", maxAge: 600 };
  // Mobil uygulama girisi telefonun tarayicisinda baslatir; callback oturumu uygulamaya kodla dondurur.
  // Onceki yarim kalmis akisin cerezleri kalmasin (giris, baglamaya donusmesin).
  const uygulama = req.nextUrl.searchParams.get("uygulama") === "1";
  if (uygulama) res.cookies.set("google_oauth_uygulama", "1", cerez);
  else res.cookies.delete("google_oauth_uygulama");
  res.cookies.delete("google_oauth_bagla");

  // Baglama: kimlik /api/auth/google/bagla-kodu'ndan (sifre teyitli) alinan jetondan gelir; callback secilen
  // Google hesabini bu kullaniciya baglar (giris yapmaz). Sitede jeton bu tarayicinin oturumuyla eslesmeli:
  // saldirganin kendi jetonlu linkini acan kurbanin Google hesabi saldirgana baglanmasin. Uygulamada
  // tarayicinin oturumu yok; orada baglamayi uygulamanin kendi oturumu onaylar (bagla-onay).
  const bagla = req.nextUrl.searchParams.get("bagla");
  if (bagla) {
    const kimlik = await googleBaglaJetonuCoz(bagla);
    const ayniOturum = uygulama || (kimlik && (await getCurrentUser())?.id === kimlik.userId);
    if (!kimlik || !ayniOturum) return NextResponse.redirect(`${SITE_URL}/giris`);
    res.cookies.set("google_oauth_bagla", await googleBaglaJetonu(kimlik), cerez);
  }
  return res;
}

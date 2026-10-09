import { NextRequest, NextResponse } from "next/server";
import { randomBytes } from "crypto";
import { SITE_URL } from "@/lib/site";

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
  // Mobil uygulama girisi telefonun tarayicisinda baslatir; callback oturumu uygulamaya kodla dondurur.
  if (req.nextUrl.searchParams.get("uygulama") === "1") {
    res.cookies.set("google_oauth_uygulama", "1", { httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "lax", path: "/", maxAge: 600 });
  }
  return res;
}

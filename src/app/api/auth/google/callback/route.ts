import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createSession } from "@/lib/auth";
import { SITE_URL } from "@/lib/site";
import { GOOGLE_CALLBACK_PATH } from "../route";

type GoogleProfil = {
  sub: string;
  email?: string;
  email_verified?: boolean;
  name?: string;
};

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");
  const cookieState = req.cookies.get("google_oauth_state")?.value;

  const basarisizYonlendirme = NextResponse.redirect(`${SITE_URL}/giris?hata=google`);

  if (!code || !state || !cookieState || state !== cookieState) {
    return basarisizYonlendirme;
  }

  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  if (!clientId || !clientSecret) {
    return basarisizYonlendirme;
  }

  try {
    const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        code,
        client_id: clientId,
        client_secret: clientSecret,
        redirect_uri: `${SITE_URL}${GOOGLE_CALLBACK_PATH}`,
        grant_type: "authorization_code",
      }),
    });
    if (!tokenRes.ok) throw new Error(`Token degisimi basarisiz: ${tokenRes.status}`);
    const tokenData = (await tokenRes.json()) as { access_token: string };

    const profilRes = await fetch("https://www.googleapis.com/oauth2/v3/userinfo", {
      headers: { Authorization: `Bearer ${tokenData.access_token}` },
    });
    if (!profilRes.ok) throw new Error(`Profil alinamadi: ${profilRes.status}`);
    const profil = (await profilRes.json()) as GoogleProfil;

    if (!profil.email || !profil.email_verified) {
      return NextResponse.redirect(`${SITE_URL}/giris?hata=google-email`);
    }
    const email = profil.email.toLowerCase();

    let user = await prisma.user.findUnique({ where: { googleId: profil.sub } });
    if (!user) {
      // Ayni e-postayla sifreli bir hesap zaten varsa, mukerrer hesap
      // olusturmak yerine mevcut hesabi Google'a baglar.
      const mevcut = await prisma.user.findUnique({ where: { email } });
      user = mevcut
        ? await prisma.user.update({ where: { id: mevcut.id }, data: { googleId: profil.sub } })
        : await prisma.user.create({
            data: {
              email,
              googleId: profil.sub,
              adSoyad: profil.name || email.split("@")[0],
              // Google ile devam et butonunun altinda KVKK/Kullanim
              // Kosullari'nin gecerli oldugu acikca belirtilir - bu an
              // onay anidir.
              kvkkOnayTarihi: new Date(),
            },
          });
    }

    if (user.askiyaAlindi) return NextResponse.redirect(`${SITE_URL}/giris?hata=askida`);
    await createSession(user.id, user.tokenVersion);
    const res = NextResponse.redirect(`${SITE_URL}/profilim`);
    res.cookies.delete("google_oauth_state");
    return res;
  } catch (err) {
    console.error("Google OAuth hatası:", err);
    return basarisizYonlendirme;
  }
}

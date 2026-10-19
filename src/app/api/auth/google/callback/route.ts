import { after, NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { guvenlikEpostasi } from "@/lib/email";
import { createSession, googleBaglaJetonuCoz, googleBaglaOnayJetonu, googleHesabiBagla, uygulamaGirisKoduOlustur } from "@/lib/auth";
import { UYGULAMA_DONUS, UYGULAMA_GOOGLE_BAGLA } from "@/lib/uygulama";
import { SITE_URL } from "@/lib/site";
import { KAYNAK_CEREZ, kaynakCerezCoz } from "@/lib/kaynak";
import { Prisma } from "@/generated/prisma/client";
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

  // Uygulamadan baslatildiysa sonuc (kod ya da hata) uygulamaya doner, tarayicida kalmaz.
  const uygulama = req.cookies.get("google_oauth_uygulama")?.value === "1";
  const hataYonlendir = (hata: string) =>
    NextResponse.redirect(uygulama ? `${UYGULAMA_DONUS}?hata=${hata}` : `${SITE_URL}/giris?hata=${hata}`);
  const basarisizYonlendirme = hataYonlendir("google");

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

    // Baglama akisi (Ayarlar > Guvenlik): secilen Google hesabi oturumdaki kullaniciya baglanir, giris yapilmaz.
    // Uygulamada baglama burada yapilmaz: onay jetonu uygulamaya doner, uygulama kendi oturumuyla onaylar.
    const bagla = await googleBaglaJetonuCoz(req.cookies.get("google_oauth_bagla")?.value);
    if (bagla) {
      const res = NextResponse.redirect(
        uygulama
          ? `${UYGULAMA_GOOGLE_BAGLA}?onay=${encodeURIComponent(await googleBaglaOnayJetonu(bagla, profil.sub))}`
          : `${SITE_URL}/profilim/ayarlar/guvenlik?google=${await googleHesabiBagla(bagla.userId, profil.sub)}`,
      );
      for (const c of ["google_oauth_state", "google_oauth_bagla", "google_oauth_uygulama"]) res.cookies.delete(c);
      return res;
    }

    if (!profil.email || !profil.email_verified) {
      return hataYonlendir("google-email");
    }
    const email = profil.email.toLowerCase();

    let user = await prisma.user.findUnique({ where: { googleId: profil.sub } });
    let yeniKayit = false;
    if (!user) {
      // Ayni e-postayla sifreli bir hesap zaten varsa, mukerrer hesap
      // olusturmak yerine mevcut hesabi Google'a baglar.
      const mevcut = await prisma.user.findUnique({ where: { email } });
      // Kullanici bu hesabin Google baglantisini kaldirdiysa e-posta eslesmesiyle yeniden baglanmaz.
      if (mevcut?.googleBaglamaKapali) return hataYonlendir("google-bagli-degil");
      if (mevcut) after(() => guvenlikEpostasi(mevcut.email, mevcut.adSoyad, "hesabına bir Google hesabı bağlandı"));
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
              // Cerez yalnizca cerez onayi verildiyse yazilmistir (CerezOnayi).
              kaynak: kaynakCerezCoz(req.cookies.get(KAYNAK_CEREZ)?.value) ?? Prisma.DbNull,
            },
          });
      yeniKayit = !mevcut;
    }

    if (user.askiyaAlindi) return hataYonlendir("askida");
    let res: NextResponse;
    if (uygulama) {
      res = NextResponse.redirect(`${UYGULAMA_DONUS}?kod=${encodeURIComponent(await uygulamaGirisKoduOlustur(user.id))}`);
      res.cookies.delete("google_oauth_uygulama");
    } else {
      await createSession(user.id, user.tokenVersion);
      // ?yeni=1: profil sayfasi kayit donusumunu olcer ve bolum secimini ister.
      res = NextResponse.redirect(`${SITE_URL}/profilim${yeniKayit ? "?yeni=1" : ""}`);
    }
    res.cookies.delete("google_oauth_state");
    return res;
  } catch (err) {
    console.error("Google OAuth hatası:", err);
    return basarisizYonlendirme;
  }
}

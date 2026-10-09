import { NextResponse } from "next/server";
import { getAktifOturumId, getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { profilFotografiUrl } from "@/lib/profil";
import { proAktifMi, smsSaglayiciTanimli, telefonGoster } from "@/lib/sms";

const TARIH = new Intl.DateTimeFormat("tr-TR", { dateStyle: "long", timeStyle: "short", timeZone: "Europe/Istanbul" });
const OTURUM_OMRU_MS = 30 * 24 * 60 * 60 * 1000; // JWT suresi; daha eski oturumlar zaten gecersiz

/** Mobil ayarlar: sitedeki /profilim/ayarlar sekmelerinin (Hesap, Guvenlik, Bildirimler, Gizlilik) verisi. */
export async function GET() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Giriş yapmalısınız." }, { status: 401 });

  const [fotografUrl, oturumlar, aktifOturumId] = await Promise.all([
    profilFotografiUrl(user.id),
    prisma.oturum.findMany({
      where: { userId: user.id, kapatildi: null, olusturma: { gt: new Date(Date.now() - OTURUM_OMRU_MS) } },
      orderBy: { sonGorulme: "desc" },
    }),
    getAktifOturumId(),
  ]);
  const pro = proAktifMi(user);
  const telefonDogrulandi = !!user.telefonDogrulandi && !!user.telefon;

  return NextResponse.json({
    adSoyad: user.adSoyad,
    email: user.email,
    telefon: user.telefon,
    meslek: user.meslek,
    kurumTuru: user.kurumTuru,
    kamuCalisaniDegil: user.kamuCalisaniDegil,
    departmentId: user.departmentId,
    educationLevel: user.educationLevel,
    fotografUrl,
    uyelikTarihi: TARIH.format(user.createdAt),
    girisYontemleri: [user.passwordHash && "E-posta ve şifre", user.googleId && "Google"].filter(Boolean).join(", "),
    plan: user.abonelikPlani,
    sifreVar: !!user.passwordHash,
    googleBagli: !!user.googleId,
    oturumlar: oturumlar.map((o) => ({ id: o.id, cihaz: o.cihaz, olusturma: TARIH.format(o.olusturma), sonGorulme: TARIH.format(o.sonGorulme), buCihaz: o.id === aktifOturumId })),
    sms: {
      pro,
      // Saglayici baglanana kadar yalniz admin test edebilir (kod ekranda gosterilir).
      hazirDegil: !smsSaglayiciTanimli() && !user.isAdmin,
      dogrulanmisTelefon: telefonDogrulandi && user.telefon ? telefonGoster(user.telefon) : null,
      smsIlanBildirimi: user.smsIlanBildirimi,
      smsBecayisBildirimi: user.smsBecayisBildirimi,
    },
    kvkkOnayTarihi: user.kvkkOnayTarihi ? TARIH.format(user.kvkkOnayTarihi) : null,
  });
}

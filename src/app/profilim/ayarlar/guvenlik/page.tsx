import { redirect } from "next/navigation";
import { getAktifOturumId, getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { SifreDegistirForm } from "@/components/SifreDegistirForm";
import { AyarKarti, AyarlarSayfasi, tarihMetni } from "@/components/AyarlarSayfasi";
import { GoogleBaglantisi, OturumListesi } from "@/components/HesapAyarlari";

export const metadata = { title: "Güvenlik Ayarları — Kamu Yolu" };

const OTURUM_OMRU_MS = 30 * 24 * 60 * 60 * 1000; // JWT suresi; daha eski oturumlar zaten gecersiz

export default async function GuvenlikAyarlariPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/giris");

  const [oturumlar, aktifOturumId] = await Promise.all([
    prisma.oturum.findMany({
      // eslint-disable-next-line react-hooks/purity -- sunucu bileseni, istek basina bir kez calisir
      where: { userId: user.id, kapatildi: null, olusturma: { gt: new Date(Date.now() - OTURUM_OMRU_MS) } },
      orderBy: { sonGorulme: "desc" },
    }),
    getAktifOturumId(),
  ]);
  const sifreVar = !!user.passwordHash;

  return (
    <AyarlarSayfasi userId={user.id}>
      <AyarKarti baslik={sifreVar ? "Şifre değiştir" : "Şifre belirle"} aciklama="Şifren değişince diğer cihazlardaki oturumların kapanır; bu cihazda oturumun açık kalır.">
        <SifreDegistirForm sifreVar={sifreVar} />
      </AyarKarti>

      <AyarKarti baslik="Google hesabı">
        <GoogleBaglantisi bagli={!!user.googleId} sifreVar={sifreVar} />
      </AyarKarti>

      <AyarKarti baslik="Aktif oturumlar" aciklama="Hesabına giriş yapılmış tarayıcı ve cihazlar. Tanımadığın bir oturum görürsen kapat ve şifreni değiştir.">
        <OturumListesi
          oturumlar={oturumlar.map((o) => ({
            id: o.id,
            cihaz: o.cihaz,
            olusturma: tarihMetni(o.olusturma),
            sonGorulme: tarihMetni(o.sonGorulme),
            buCihaz: o.id === aktifOturumId,
          }))}
        />
      </AyarKarti>
    </AyarlarSayfasi>
  );
}

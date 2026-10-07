import Link from "next/link";
import { redirect } from "next/navigation";
import { Crown } from "lucide-react";
import { getCurrentUser } from "@/lib/auth";
import { proAktifMi, smsSaglayiciTanimli, telefonGoster } from "@/lib/sms";
import { AyarKarti, AyarlarSayfasi } from "@/components/AyarlarSayfasi";
import { SmsTercihleri, TelefonDogrulama } from "@/components/HesapAyarlari";

export const metadata = { title: "Bildirim Ayarları — Kamu Yolu" };

export default async function BildirimAyarlariPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/giris");

  if (!proAktifMi(user)) {
    return (
      <AyarlarSayfasi userId={user.id}>
        <AyarKarti baslik="SMS bildirimleri">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <p className="max-w-md text-sm text-slate-700">
              Bölümüne uygun yeni ilanları ve becayiş mesajlarını anında SMS ile almak <strong>Pro</strong> üyelere özeldir.
              Site içi bildirimlerin her üyelikte açık.
            </p>
            <Link
              href="/profilim/abonelik"
              className="inline-flex items-center gap-2 rounded-2xl bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground"
            >
              <Crown className="h-4 w-4" />
              Planları gör
            </Link>
          </div>
        </AyarKarti>
      </AyarlarSayfasi>
    );
  }

  // Saglayici baglanana kadar yalniz admin test edebilir (kod ekranda gosterilir).
  const hazirDegil = !smsSaglayiciTanimli() && !user.isAdmin;
  const dogrulandi = !!user.telefonDogrulandi && !!user.telefon;

  return (
    <AyarlarSayfasi userId={user.id}>
      {hazirDegil ? (
        <AyarKarti baslik="SMS bildirimleri">
          <p className="text-sm text-slate-700">SMS altyapımızı kuruyoruz. Çok yakında bu sayfadan telefonunu doğrulayıp SMS bildirimlerini açabileceksin.</p>
        </AyarKarti>
      ) : (
        <>
          <AyarKarti baslik="Telefon numarası" aciklama="SMS bildirimleri yalnızca doğrulanmış numarana gönderilir.">
            <TelefonDogrulama dogrulanmisTelefon={dogrulandi && user.telefon ? telefonGoster(user.telefon) : null} />
          </AyarKarti>
          <AyarKarti baslik="SMS bildirimleri" aciklama="Hangi bildirimlerin SMS ile gelmesini istediğini seç. Site içi bildirimler her zaman açık.">
            <SmsTercihleri
              telefonDogrulandi={dogrulandi}
              ilk={{ smsIlanBildirimi: user.smsIlanBildirimi, smsBecayisBildirimi: user.smsBecayisBildirimi }}
            />
          </AyarKarti>
        </>
      )}
    </AyarlarSayfasi>
  );
}

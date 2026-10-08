import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { KilitliOzellik } from "@/components/KilitliOzellik";
import { proAktifMi, smsSaglayiciTanimli, telefonGoster } from "@/lib/sms";
import { AyarKarti, AyarlarSayfasi } from "@/components/AyarlarSayfasi";
import { SmsTercihleri, TelefonDogrulama } from "@/components/HesapAyarlari";

export const metadata = { title: "Bildirim Ayarları — Kamu Yolu" };

export default async function BildirimAyarlariPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/giris");

  if (!proAktifMi(user)) {
    // Ekran ayni kalir, bulanik ve tiklanamaz (inert); API'ler de Pro kontrolu yapar.
    return (
      <AyarlarSayfasi userId={user.id}>
        <KilitliOzellik
          mevcutPlan={user.abonelikPlani}
          gerekenPlan="PRO"
          kaynak="sms"
          baslik="SMS bildirimleri Pro'da"
          ozellikler={[
            "Bölümüne uygun yeni ilan çıkınca anında SMS",
            "Becayiş talebine mesaj gelince SMS",
            "Site içi bildirimler her planda açık",
          ]}
        >
          <div className="space-y-6">
            <AyarKarti baslik="Telefon numarası" aciklama="SMS bildirimleri yalnızca doğrulanmış numarana gönderilir.">
              <TelefonDogrulama dogrulanmisTelefon={null} />
            </AyarKarti>
            <AyarKarti baslik="SMS bildirimleri" aciklama="Hangi bildirimlerin SMS ile gelmesini istediğini seç. Site içi bildirimler her zaman açık.">
              <SmsTercihleri telefonDogrulandi={false} ilk={{ smsIlanBildirimi: true, smsBecayisBildirimi: true }} />
            </AyarKarti>
          </div>
        </KilitliOzellik>
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

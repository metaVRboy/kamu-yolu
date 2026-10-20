import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { KilitliOzellik } from "@/components/KilitliOzellik";
import { proAktifMi, smsSaglayiciTanimli, telefonGoster } from "@/lib/sms";
import { TICARI_ILETI_ACIK } from "@/lib/planlar";
import { AyarKarti, AyarlarSayfasi } from "@/components/AyarlarSayfasi";
import { SmsTercihleri, TelefonDogrulama, TicariIletiTercihi } from "@/components/HesapAyarlari";
import { TarayiciBildirimi } from "@/components/TarayiciBildirimi";

export const metadata = { title: "Bildirim Ayarları — Kamu Yolu" };

export default async function BildirimAyarlariPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/giris");

  // Plan kilidinin disinda: kampanya/duyuru onayi her uyenin hakki. IYS kaydina kadar gizli (TICARI_ILETI_ACIK).
  const ticariIleti = TICARI_ILETI_ACIK && (
    <AyarKarti baslik="Kampanya ve duyurular" aciklama="Ticari elektronik ileti onayı; vermek zorunlu değildir.">
      <TicariIletiTercihi ilk={user.ticariIletiOnay} />
    </AyarKarti>
  );

  // Tarayici bildirimi herkese acik (gunun sorulari hatirlatmasi); ilan son gun hatirlatmasi Pro uyelere gider.
  const tarayici = (
    <AyarKarti baslik="Tarayıcı bildirimleri" aciklama="Bu cihazda: günün soruları hatırlatması ve (Pro) takip ettiğin ilanların son gün hatırlatması.">
      <TarayiciBildirimi />
    </AyarKarti>
  );

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
            "Kişisel site içi bildirimler de Pro ile açılır",
            "Genel duyurular her planda açık",
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
        {tarayici}
        {ticariIleti}
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
      {tarayici}
      {ticariIleti}
    </AyarlarSayfasi>
  );
}

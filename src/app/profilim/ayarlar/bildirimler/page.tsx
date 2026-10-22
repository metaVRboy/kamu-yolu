import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { KilitliOzellik } from "@/components/KilitliOzellik";
import { proAktifMi, whatsappTanimli, telefonGoster } from "@/lib/whatsapp";
import { TICARI_ILETI_ACIK } from "@/lib/planlar";
import { AyarKarti, AyarlarSayfasi } from "@/components/AyarlarSayfasi";
import { WhatsappTercihleri, TelefonDogrulama, TicariIletiTercihi } from "@/components/HesapAyarlari";
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
          kaynak="whatsapp"
          baslik="WhatsApp bildirimleri Pro'da"
          ozellikler={[
            "Bölümüne uygun yeni ilan çıkınca anında WhatsApp mesajı",
            "Becayiş talebine mesaj gelince WhatsApp mesajı",
            "Kişisel site içi bildirimler de Pro ile açılır",
            "Genel duyurular her planda açık",
          ]}
        >
          <div className="space-y-6">
            <AyarKarti baslik="Telefon numarası" aciklama="WhatsApp kullandığın numarayı gir; bildirimler yalnızca doğrulanmış numarana gönderilir.">
              <TelefonDogrulama dogrulanmisTelefon={null} />
            </AyarKarti>
            <AyarKarti baslik="WhatsApp bildirimleri" aciklama="Hangi bildirimlerin WhatsApp ile gelmesini istediğini seç. Site içi bildirimler her zaman açık.">
              <WhatsappTercihleri telefonDogrulandi={false} ilk={{ whatsappIlanBildirimi: true, whatsappBecayisBildirimi: true }} />
            </AyarKarti>
          </div>
        </KilitliOzellik>
        {tarayici}
        {ticariIleti}
      </AyarlarSayfasi>
    );
  }

  // Saglayici baglanana kadar yalniz admin test edebilir (kod ekranda gosterilir).
  const hazirDegil = !whatsappTanimli() && !user.isAdmin;
  const dogrulandi = !!user.telefonDogrulandi && !!user.telefon;

  return (
    <AyarlarSayfasi userId={user.id}>
      {hazirDegil ? (
        <AyarKarti baslik="WhatsApp bildirimleri">
          <p className="text-sm text-slate-700">WhatsApp bildirimlerini kuruyoruz. Çok yakında bu sayfadan telefonunu doğrulayıp WhatsApp bildirimlerini açabileceksin.</p>
        </AyarKarti>
      ) : (
        <>
          <AyarKarti baslik="Telefon numarası" aciklama="WhatsApp kullandığın numarayı gir; bildirimler yalnızca doğrulanmış numarana gönderilir.">
            <TelefonDogrulama dogrulanmisTelefon={dogrulandi && user.telefon ? telefonGoster(user.telefon) : null} />
          </AyarKarti>
          <AyarKarti baslik="WhatsApp bildirimleri" aciklama="Hangi bildirimlerin WhatsApp ile gelmesini istediğini seç. Site içi bildirimler her zaman açık.">
            <WhatsappTercihleri
              telefonDogrulandi={dogrulandi}
              ilk={{ whatsappIlanBildirimi: user.whatsappIlanBildirimi, whatsappBecayisBildirimi: user.whatsappBecayisBildirimi }}
            />
          </AyarKarti>
        </>
      )}
      {tarayici}
      {ticariIleti}
    </AyarlarSayfasi>
  );
}

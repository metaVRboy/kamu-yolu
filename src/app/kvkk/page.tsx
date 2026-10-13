import { ShieldCheck } from "lucide-react";
import { SayfaBasligi } from "@/components/SayfaBasligi";
import Link from "next/link";
import { ILETISIM_EPOSTA } from "@/lib/site";

export const metadata = {
  title: "KVKK Aydınlatma Metni ve Gizlilik Politikası — Kamu Yolu",
};

export default function KvkkPage() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-14 sm:px-6 sm:py-20">
      <SayfaBasligi
        kompakt
        ikon={ShieldCheck}
        baslik="KVKK Aydınlatma Metni ve Gizlilik Politikası"
      />

      <div className="prose prose-slate mt-6 max-w-none space-y-5 rounded-2xl border border-primary/10 bg-white p-6 shadow-sm sm:p-8 text-sm leading-relaxed text-slate-700">
        <section>
          <h2 className="font-sans text-base font-semibold text-primary">1. Veri Sorumlusu</h2>
          <p>
            Kamu Yolu (&quot;Site&quot;), 6698 sayılı Kişisel Verilerin Korunması Kanunu
            (&quot;KVKK&quot;) kapsamında, üyelik sırasında ve site kullanımı süresince elde
            edilen kişisel verilerinizi işbu metinde açıklanan amaç ve kapsamda işler.
          </p>
        </section>

        <section>
          <h2 className="font-sans text-base font-semibold text-primary">2. İşlenen Kişisel Veriler</h2>
          <ul className="list-disc pl-5">
            <li>Kimlik ve iletişim bilgileri: ad soyad, e-posta, (varsa) telefon numarası</li>
            <li>Mesleki bilgiler: meslek/unvan, çalışılan kurum türü, mezun olunan bölüm ve öğrenim düzeyi</li>
            <li>Becayiş modülü kapsamında oluşturduğunuz talep içeriği ve gönderdiğiniz/aldığınız mesajlar</li>
            <li>Bildirim tercihleriniz, gönderilen SMS kayıtları ve verdiğiniz/geri çektiğiniz onayların tarihleri</li>
            <li>Şifreniz geri döndürülemeyecek şekilde (hash&apos;lenerek) saklanır; site yöneticileri dahil kimse şifrenizi görüntüleyemez</li>
          </ul>
        </section>

        <section>
          <h2 className="font-sans text-base font-semibold text-primary">3. İşleme Amaçları</h2>
          <ul className="list-disc pl-5">
            <li>Üyelik oluşturma, oturum açma ve hesabınızı güvenli şekilde yönetme</li>
            <li>Becayiş taleplerinin yayınlanması ve kullanıcılar arası mesajlaşmanın sağlanması</li>
            <li>Mezun olduğunuz bölüme/öğrenim düzeyinize uygun yeni ilan çıktığında size bildirim gönderme</li>
            <li>
              Ayarlardan açtıysanız, doğrulanmış telefon numaranıza ilan ve becayiş mesajı bildirimlerini SMS ile iletme
              (abone olduğunuz hizmetin parçasıdır; dilediğiniz an kapatabilirsiniz)
            </li>
            <li>
              Yalnızca ayrıca onay verdiyseniz, kampanya, indirim ve duyurularımızı SMS ve e-posta ile iletme (ticari
              elektronik ileti)
            </li>
            <li>Sitenin hatalarını tespit etme, kötüye kullanımı önleme</li>
          </ul>
        </section>

        <section>
          <h2 className="font-sans text-base font-semibold text-primary">4. Verilerin Paylaşımı</h2>
          <p>
            Becayiş modülünde iletişim bilgileriniz (e-posta, telefon) diğer kullanıcılara
            <strong> hiçbir zaman doğrudan gösterilmez</strong>; ilgilenen kullanıcılar size yalnızca
            site içi mesaj kutusu üzerinden ulaşabilir. Kişisel verileriniz satılmaz; yasal zorunluluklar
            dışında yalnızca hizmeti sunabilmek için gereken ölçüde şu hizmet sağlayıcılarla paylaşılır:
            barındırma ve veritabanı (bulut sunucu sağlayıcısı), e-posta gönderim hizmeti (doğrulama kodları
            ve bildirimler için e-posta adresiniz) ve SMS gönderim hizmeti (SMS bildirimleri için telefon
            numaranız ve ileti metni). Bu sağlayıcıların bir kısmının sunucuları yurt dışında bulunabilir.
          </p>
        </section>

        <section>
          <h2 className="font-sans text-base font-semibold text-primary">5. Ticari Elektronik İleti Onayı</h2>
          <p>
            Kampanya, indirim ve duyuru içerikli SMS ve e-postalar, 6563 sayılı Elektronik Ticaretin
            Düzenlenmesi Hakkında Kanun uyarınca yalnızca önceden onay vermeniz halinde gönderilir. Onay
            vermek zorunlu değildir ve üyeliği etkilemez. Onayınızı{" "}
            <Link href="/profilim/ayarlar/bildirimler" className="font-medium text-primary underline">
              Ayarlar &gt; Bildirimler
            </Link>{" "}
            sayfasından istediğiniz an geri çekebilirsiniz. Hesap güvenliği (doğrulama kodu, şifre
            sıfırlama) e-postaları ile kendi açtığınız ilan ve mesaj bildirimleri bu onaydan bağımsızdır.
          </p>
        </section>

        <section>
          <h2 className="font-sans text-base font-semibold text-primary">6. Haklarınız</h2>
          <p>
            KVKK&apos;nın 11. maddesi uyarınca; verilerinizin işlenip işlenmediğini öğrenme, işlenmişse
            buna ilişkin bilgi talep etme, işlenme amacını öğrenme, yurt içinde/dışında aktarıldığı
            üçüncü kişileri bilme, eksik/yanlış işlenmişse düzeltilmesini isteme, silinmesini/yok
            edilmesini talep etme haklarına sahipsiniz. Bu haklarınızı kullanmak için {ILETISIM_EPOSTA}{" "}
            adresine e-posta gönderebilir ya da site üzerindeki iletişim imkanlarından bize ulaşabilirsiniz.
          </p>
        </section>

        <section>
          <h2 className="font-sans text-base font-semibold text-primary">7. Veri Güvenliği</h2>
          <p>
            Kişisel verileriniz, yetkisiz erişime, kayba veya kötüye kullanıma karşı makul teknik
            ve idari tedbirlerle korunur: şifreniz tersine çevrilemeyecek şekilde (hash&apos;lenerek)
            saklanır, veritabanı bağlantıları şifrelenir (SSL/TLS) ve sadece işin gerektirdiği
            kişilerin erişebileceği şekilde yetkilendirme uygulanır.
          </p>
        </section>

        <section>
          <h2 className="font-sans text-base font-semibold text-primary">8. Çerezler</h2>
          <p>
            Sitenin çalışması için gerekli çerezler ve kullanım tercihleri hakkında ayrıntılı bilgiyi{" "}
            <Link href="/cerez-politikasi" className="text-primary underline">
              Çerez Politikası
            </Link>{" "}
            sayfasında bulabilirsiniz. Sitenin genel kullanım kuralları ve sorumluluk sınırlamaları için{" "}
            <Link href="/kullanim-kosullari" className="text-primary underline">
              Kullanım Koşulları
            </Link>{" "}
            sayfasına bakınız.
          </p>
        </section>

        <p className="text-xs text-muted-foreground">
          Son güncelleme: bu metin genel bilgilendirme amaçlıdır ve site geliştikçe güncellenebilir.
        </p>
      </div>
    </div>
  );
}

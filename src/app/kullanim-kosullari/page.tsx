import { ScrollText } from "lucide-react";
import { SayfaBasligi } from "@/components/SayfaBasligi";
import { ILETISIM_EPOSTA, SATICI } from "@/lib/site";

export const metadata = {
  title: "Kullanım Koşulları — Kamu Yolu",
  description: "kamuyolu.com ve Kamu Yolu mobil uygulamasının kullanım kuralları, sorumluluk sınırları ve üyelik koşulları.",
};

export default function KullanimKosullariPage() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-14 sm:px-6 sm:py-20">
      <SayfaBasligi kompakt ikon={ScrollText} baslik="Kullanım Koşulları" />

      <div className="prose prose-slate mt-6 max-w-none space-y-5 rounded-2xl border border-primary/10 bg-white p-6 shadow-sm sm:p-8 text-sm leading-relaxed text-slate-700">
        <section>
          <h2 className="font-sans text-base font-semibold text-primary">1. Taraflar ve Kapsam</h2>
          <p>
            Bu Kullanım Koşulları (&quot;Koşullar&quot;), {SATICI.unvan} (şahıs işletmesi, {SATICI.vergiDairesi} V.D.{" "}
            {SATICI.vergiNo}; &quot;Kamu Yolu&quot;) tarafından işletilen
            kamuyolu.com internet sitesinin ve Kamu Yolu mobil uygulamasının (&quot;Site&quot;) kullanımına ilişkin
            kuralları düzenler. Siteye üye olan herkes (&quot;Kullanıcı&quot;) bu Koşulları kabul etmiş olur. İletişim:{" "}
            {ILETISIM_EPOSTA}.
          </p>
        </section>

        <section>
          <h2 className="font-sans text-base font-semibold text-primary">2. Hizmetin Niteliği</h2>
          <p>
            Kamu Yolu, kamu kurumları tarafından yayımlanan personel alım ilanlarını otomatik
            olarak derleyip kullanıcının mezun olduğu bölüme/öğrenim düzeyine göre listeleyen bir
            bilgilendirme platformudur. Site:
          </p>
          <ul className="list-disc pl-5">
            <li>
              <strong>Standart (ücretsiz)</strong> plan ile temel ilan arama, listeleme ve
              becayiş ilanlarını görüntüleme hizmeti sunar.
            </li>
            <li>
              <strong>Pro ve Pro+</strong> ücretli planlarıyla SMS ile ilan bildirimi, bölüme özel ilan
              listesi, becayiş talebi ve mesajlaşma, sınırsız deneme ve öncelikli destek gibi ek
              özellikler sunması planlanmaktadır. <strong>Ücretli planlar henüz satışta değildir</strong>;
              &quot;Açılınca haber ver&quot; seçeneği bir satın alma veya ön sipariş değil, yalnızca bilgilendirme
              talebidir. Satış başladığında ödeme, cayma ve iade koşulları ayrıca mesafeli satış
              sözleşmesiyle düzenlenecektir.
            </li>
          </ul>
          <p>
            Kamu Yolu bağımsız bir platformdur; hiçbir kamu kurumu, ÖSYM veya Kariyer Kapısı ile
            bağlantılı değildir. İlan verilerini kamu kurumlarının yayımladığı duyurulardan ve bu
            duyuruları yayımlayan sitelerden (ör. Kariyer Kapısı, Memurlar.net) otomatik olarak derler
            ve her ilanda kaynağını gösterir. Haber özetleri yapay zekâ desteğiyle hazırlanır.
            İlanların doğruluğu, güncelliği ve başvuru sonuçlarından ilgili kurum sorumludur;
            Kullanıcılar başvuru öncesinde kurumun resmî ilan metnini kontrol etmekle yükümlüdür.
          </p>
        </section>

        <section>
          <h2 className="font-sans text-base font-semibold text-primary">3. Üyelik ve Hesap Güvenliği</h2>
          <ul className="list-disc pl-5">
            <li>Üyelik için geçerli bir e-posta adresi gerekir ve e-posta doğrulaması zorunludur.</li>
            <li>Hesap bilgilerinizin (şifre dahil) gizliliğinden ve hesabınız üzerinden gerçekleşen tüm işlemlerden siz sorumlusunuz.</li>
            <li>Profilinizde paylaştığınız bölüm, öğrenim düzeyi ve diğer bilgilerin doğru ve güncel olması sizin sorumluluğunuzdadır.</li>
            <li>18 yaşından küçük kullanıcılar siteye üye olamaz.</li>
          </ul>
          {/* 6563 s. Kanun m.3: elektronik ortamda sozlesme kurulmadan once verilmesi gereken bilgiler. */}
          <p>
            <strong>Üyelik sözleşmesinin kurulması:</strong> Üyelik ücretsizdir ve Türkçe olarak kurulur. Adımlar: (1) kayıt formunu
            doldurup bu Koşulları kabul edersin; (2) e-posta adresine gönderilen 6 haneli kodu girersin; (3) kod doğrulanınca hesabın
            açılır. Kodu göndermeden önce formdaki bilgileri düzeltebilir, sonrasında ad, bölüm ve diğer bilgilerini Ayarlar&apos;dan
            değiştirebilirsin. Bu Koşulların güncel metni bu sayfada her zaman erişilebilir; kabul ettiğin tarih hesabında saklanır.
            Kişisel verilerin KVKK Aydınlatma Metni kapsamında işlenir.
          </p>
        </section>

        <section>
          <h2 className="font-sans text-base font-semibold text-primary">4. Becayiş Modülü ve Sorumluluk Reddi</h2>
          <p>
            Becayiş modülü, yer değiştirmek isteyen kamu çalışanları arasında iletişimi
            kolaylaştırmak amacıyla sunulan bir araçtır. Kamu Yolu:
          </p>
          <ul className="list-disc pl-5">
            <li>Kullanıcılar arasındaki becayiş görüşmelerine, anlaşmalarına veya sonuçlarına taraf değildir.</li>
            <li>Paylaşılan talep içeriğinin veya mesajların doğruluğunu garanti etmez.</li>
            <li>Becayiş sürecinin resmî onay/mevzuat şartlarını sağlayıp sağlamadığından sorumlu değildir; süreç tamamen ilgili kurumların kendi prosedürlerine tabidir.</li>
          </ul>
          <p>
            Becayiş ilanları ve mesajları kullanıcıların kendi içeriğidir; Kamu Yolu bu içerik bakımından yer sağlayıcıdır. Hukuka
            aykırı veya kişilik haklarını ihlal ettiğini düşündüğün bir içeriği ilan sayfasındaki &quot;Uygunsuz içeriği bildir&quot;
            bağlantısıyla, mesajları mesaj ekranındaki şikâyet seçeneğiyle ya da {ILETISIM_EPOSTA} adresine yazarak bildirebilirsin;
            bildirimler incelenir ve gerekirse içerik kaldırılır. 5651 sayılı Kanun gereği bu içerikleri oluşturduğunda IP adresi ve
            zaman bilgisi 2 yıl saklanır.
          </p>
        </section>

        <section>
          <h2 className="font-sans text-base font-semibold text-primary">5. Yasaklı Davranışlar</h2>
          <p>Aşağıdaki davranışlar kesinlikle yasaktır ve tespit edilmesi halinde hesabınız önceden bildirim yapılmaksızın askıya alınabilir veya kapatılabilir:</p>
          <ul className="list-disc pl-5">
            <li>Sahte, yanıltıcı veya başkasına ait kimlik/bilgi kullanmak</li>
            <li>Siteyi otomatik araçlarla (bot, scraper) aşırı yüklemek veya kötüye kullanmak</li>
            <li>
              Kamu Yolu&apos;nun yazılı izni olmadan sitedeki veya uygulama arayüzlerindeki (API) verileri otomatik
              araçlarla (bot, tarayıcı, yapay zeka ajanı vb.) toplamak, toplu olarak indirmek, kopyalamak ya da
              başka bir hizmette kullanmak; buna bölüm eşleştirmeleri, ilan derlemeleri, deneme soruları ve
              istatistikler dahildir</li>
            <li>Becayiş modülü veya mesajlaşma üzerinden taciz, dolandırıcılık veya reklam/spam içerikli mesaj göndermek</li>
            <li>Sitenin güvenlik önlemlerini aşmaya çalışmak</li>
          </ul>
        </section>

        <section>
          <h2 className="font-sans text-base font-semibold text-primary">6. Fikri Mülkiyet</h2>
          <p>
            Sitenin tasarımı, yazılımı, logosu, editoryal içerikleri (haberler, özetler), deneme
            soruları ve ilanların bölümlere göre sınıflandırılmasıyla oluşan veri tabanı Kamu
            Yolu&apos;na aittir ve izinsiz kopyalanamaz, çoğaltılamaz veya ticari amaçla
            kullanılamaz. İlan içerikleri ilgili kamu kurumlarına aittir; Kamu Yolu yalnızca
            kaynak gösterilerek bu bilgileri derler ve yönlendirir.
          </p>
        </section>

        <section>
          <h2 className="font-sans text-base font-semibold text-primary">7. Hizmetin Değişikliği ve Kesintiler</h2>
          <p>
            Kamu Yolu, hizmetin kapsamını, özelliklerini veya ücretli plan fiyatlarını önceden
            haber vererek değiştirme hakkını saklı tutar. Bakım, güncelleme veya kaynak
            kurumlardaki (ör. Kariyer Kapısı) teknik aksaklıklar nedeniyle hizmette geçici
            kesintiler yaşanabilir; bu durumlardan doğabilecek zararlardan Kamu Yolu sorumlu
            tutulamaz.
          </p>
        </section>

        <section>
          <h2 className="font-sans text-base font-semibold text-primary">8. Sorumluluğun Sınırlandırılması</h2>
          <p>
            Site &quot;olduğu gibi&quot; sunulur. Kamu Yolu, derlenen ilan/haber bilgilerinin
            kaynak kurumdaki değişiklikler nedeniyle güncelliğini yitirmesinden, üçüncü taraf
            sitelere yönlendirmelerden veya kullanıcılar arası becayiş iletişiminden doğabilecek
            doğrudan veya dolaylı zararlardan, yasaların izin verdiği azami ölçüde, sorumlu
            değildir.
          </p>
        </section>

        <section>
          <h2 className="font-sans text-base font-semibold text-primary">9. Yürürlük ve Değişiklik</h2>
          <p>
            Bu Koşullar yayınlandığı tarihten itibaren yürürlüğe girer. Kamu Yolu, Koşulları
            dilediği zaman güncelleyebilir; güncel sürüm her zaman bu sayfada yayınlanır.
            Değişiklik sonrası siteyi kullanmaya devam etmeniz güncel koşulları kabul ettiğiniz
            anlamına gelir.
          </p>
        </section>

        <section>
          <h2 className="font-sans text-base font-semibold text-primary">10. Uyuşmazlıkların Çözümü</h2>
          <p>
            Bu Koşullara Türkiye Cumhuriyeti hukuku uygulanır. Tüketici işlemlerinden doğan
            uyuşmazlıklarda, parasal sınırlar dahilinde Kullanıcının yerleşim yerindeki Tüketici
            Hakem Heyetleri ve Tüketici Mahkemeleri yetkilidir.
          </p>
        </section>

        <p className="text-xs text-muted-foreground">Son güncelleme: 19 Ekim 2026.</p>
      </div>
    </div>
  );
}

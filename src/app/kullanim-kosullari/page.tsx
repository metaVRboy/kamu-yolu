import Link from "next/link";

export const metadata = {
  title: "Kullanım Koşulları — Kamu Yolu",
};

function YerTutucu({ children }: { children: React.ReactNode }) {
  return (
    <mark className="rounded bg-amber-100 px-1.5 py-0.5 font-medium text-amber-800">
      {children}
    </mark>
  );
}

export default function KullanimKosullariPage() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-14 sm:px-6 sm:py-20">
      <h1 className="font-sans text-2xl font-bold tracking-tight text-primary sm:text-3xl">
        Kullanım Koşulları
      </h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Bu sayfa taslak niteliğindedir; <YerTutucu>sarı vurgulu</YerTutucu> alanlar şirket
        kuruluşu ve fiyatlandırma netleştikçe doldurulmalıdır.
      </p>

      <div className="prose prose-slate mt-6 max-w-none space-y-5 rounded-2xl border border-primary/10 bg-white p-6 shadow-sm sm:p-8 text-sm leading-relaxed text-slate-700">
        <section>
          <h2 className="font-sans text-base font-semibold text-primary">1. Taraflar ve Kapsam</h2>
          <p>
            Bu Kullanım Koşulları (&quot;Koşullar&quot;), <YerTutucu>[ŞİRKET UNVANI]</YerTutucu>{" "}
            (&quot;Kamu Yolu&quot; veya &quot;Site&quot;) tarafından işletilen
            kamuyolu.com internet sitesinin kullanımına ilişkin kuralları düzenler. Siteyi
            ziyaret eden, üye olan veya ücretli bir plana abone olan herkes
            (&quot;Kullanıcı&quot;) bu Koşulları kabul etmiş sayılır.
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
              <strong>Pro ve Pro+</strong> gibi ücretli planlarla; SMS ile anlık ilan bildirimi,
              bölüme özel öncelikli bildirim, becayiş modülünde site içi mesajlaşma ve reklamsız
              kullanım gibi ek özellikler sunabilir. Ücretli planların kapsamı ve fiyatları{" "}
              <Link href="/profilim/abonelik" className="text-primary underline">
                Aboneliğim
              </Link>{" "}
              sayfasında güncel olarak yayınlanır.
            </li>
          </ul>
          <p>
            Kamu Yolu, ilan verilerini kamuya açık resmi kaynaklardan (kurum/bakanlık siteleri,
            Resmî Gazete, Kariyer Kapısı vb.) otomatik olarak derler; ilanların doğruluğu,
            güncelliği veya başvuru sonuçlarından kaynak kurum sorumludur. Kullanıcılar başvuru
            öncesinde ilgili kurumun resmî ilan sayfasını kontrol etmekle yükümlüdür.
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
        </section>

        <section>
          <h2 className="font-sans text-base font-semibold text-primary">5. Yasaklı Davranışlar</h2>
          <p>Aşağıdaki davranışlar kesinlikle yasaktır ve tespit edilmesi halinde hesabınız önceden bildirim yapılmaksızın askıya alınabilir veya kapatılabilir:</p>
          <ul className="list-disc pl-5">
            <li>Sahte, yanıltıcı veya başkasına ait kimlik/bilgi kullanmak</li>
            <li>Siteyi otomatik araçlarla (bot, scraper) aşırı yüklemek veya kötüye kullanmak</li>
            <li>Becayiş modülü veya mesajlaşma üzerinden taciz, dolandırıcılık veya reklam/spam içerikli mesaj göndermek</li>
            <li>Sitenin güvenlik önlemlerini aşmaya çalışmak</li>
          </ul>
        </section>

        <section>
          <h2 className="font-sans text-base font-semibold text-primary">6. Fikri Mülkiyet</h2>
          <p>
            Sitenin tasarımı, yazılımı, logosu ve editoryal içerikleri (haberler, özetler) Kamu
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
            Bu Koşullardan doğabilecek uyuşmazlıklarda <YerTutucu>[ŞİRKET ADRESİNİN BULUNDUĞU İL]</YerTutucu>{" "}
            Mahkemeleri ve İcra Daireleri ile tüketici işlemleri bakımından ilgili Tüketici
            Hakem Heyetleri/Tüketici Mahkemeleri yetkilidir.
          </p>
        </section>

        <p className="text-xs text-muted-foreground">
          Son güncelleme: bu metin genel bilgilendirme amaçlıdır; ücretli abonelik satışı
          başlamadan önce bir hukuk danışmanı tarafından gözden geçirilmesi önerilir.
        </p>
      </div>
    </div>
  );
}

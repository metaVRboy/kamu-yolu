export const metadata = {
  title: "İade Politikası — Kamu Yolu",
};

function YerTutucu({ children }: { children: React.ReactNode }) {
  return (
    <mark className="rounded bg-amber-100 px-1.5 py-0.5 font-medium text-amber-800">
      {children}
    </mark>
  );
}

export default function IadePolitikasiPage() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-14 sm:px-6 sm:py-20">
      <h1 className="font-sans text-2xl font-bold tracking-tight text-primary sm:text-3xl">
        İade Politikası
      </h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Bu sayfa taslak niteliğindedir; <YerTutucu>sarı vurgulu</YerTutucu> alanlar şirket
        kuruluşu ve fiyatlandırma netleştikçe doldurulmalıdır.
      </p>

      <div className="prose prose-slate mt-6 max-w-none space-y-5 rounded-2xl border border-primary/10 bg-white p-6 shadow-sm sm:p-8 text-sm leading-relaxed text-slate-700">
        <section>
          <h2 className="font-sans text-base font-semibold text-primary">1. Kapsam</h2>
          <p>
            Bu politika, kamuyolu.com üzerinden satın alınan Pro ve Pro+ abonelik paketlerinin
            (&quot;Hizmet&quot;) iptal ve iade koşullarını düzenler. Standart (ücretsiz) plan
            kapsamında herhangi bir ücret alınmadığından bu politika Standart plan için
            uygulanmaz.
          </p>
        </section>

        <section>
          <h2 className="font-sans text-base font-semibold text-primary">2. Dijital Hizmetlerde Cayma Hakkı İstisnası</h2>
          <p>
            6502 sayılı Tüketicinin Korunması Hakkında Kanun ve Mesafeli Sözleşmeler
            Yönetmeliği&apos;nin 15. maddesi uyarınca; <strong>elektronik ortamda anında ifa
            edilen hizmetler ve anında teslim edilen gayrimaddi mallara</strong> (ör. dijital
            abonelik erişimi) ilişkin sözleşmelerde, tüketici hizmetin ifasına onay verip
            kullanmaya başladıktan sonra <strong>cayma hakkını kullanamaz</strong>.
          </p>
          <p>
            Abonelik satın alma adımında bu husus açıkça onayınıza sunulur. Onay vermeden önce
            hizmet başlatılmaz ve cayma hakkınız 14 gün süreyle saklı kalır.
          </p>
        </section>

        <section>
          <h2 className="font-sans text-base font-semibold text-primary">3. İptal ve İade Şartları</h2>
          <ul className="list-disc pl-5">
            <li>
              <strong>Hizmeti hiç kullanmadıysanız</strong> (Pro/Pro+&apos;a özel hiçbir özelliğe
              erişmediyseniz), satın alma tarihinden itibaren 14 gün içinde talep etmeniz
              halinde ücretiniz tam olarak iade edilir.
            </li>
            <li>
              <strong>Hizmeti kullanmaya başladıysanız</strong> (SMS bildirimi aldıysanız,
              reklamsız deneyimden faydalandıysanız vb.), yukarıdaki yasal istisna gereği iade
              talebiniz değerlendirmeye tabi olup otomatik olarak kabul edilmeyebilir.
            </li>
            <li>
              <strong>Teknik arıza</strong> nedeniyle satın aldığınız hizmeti hiç
              kullanamadıysanız, arızanın ispatı halinde ilgili dönem için ücret iadesi veya
              sonraki döneme mahsup yapılır.
            </li>
            <li>
              Yıllık planlarda, kullanılmayan ay sayısı oranında kısmi iade talebi ayrıca
              değerlendirilir.
            </li>
          </ul>
        </section>

        <section>
          <h2 className="font-sans text-base font-semibold text-primary">4. Aboneliğin İptali (Yenilenmemesi)</h2>
          <p>
            Otomatik yenilenen abonelikler, bir sonraki fatura döneminden en az 24 saat önce{" "}
            <YerTutucu>Aboneliğim</YerTutucu> sayfasından iptal edilerek durdurulabilir. İptal
            işlemi mevcut dönemi hemen sonlandırmaz; ödenen dönem sonuna kadar hizmetten
            faydalanmaya devam edersiniz, bir sonraki dönem için ücret tahsil edilmez.
          </p>
        </section>

        <section>
          <h2 className="font-sans text-base font-semibold text-primary">5. İade Süreci</h2>
          <p>
            Onaylanan iadeler, ödemenin yapıldığı yönteme (kredi/banka kartı vb.) iş bankaları
            ve ödeme kuruluşunun işlem sürelerine bağlı olarak genellikle{" "}
            <YerTutucu>[X] iş günü</YerTutucu> içinde yansıtılır. İade talepleriniz için{" "}
            <YerTutucu>[DESTEK E-POSTASI]</YerTutucu> adresinden bizimle iletişime
            geçebilirsiniz.
          </p>
        </section>

        <section>
          <h2 className="font-sans text-base font-semibold text-primary">6. Ödeme Kuruluşu</h2>
          <p>
            Ödemeleriniz <YerTutucu>[ÖDEME KURULUŞU ADI, ör. iyzico/PayTR]</YerTutucu> güvenli
            ödeme altyapısı üzerinden işlenir; kart bilgileriniz Kamu Yolu sunucularında
            saklanmaz.
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

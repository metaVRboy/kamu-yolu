export const metadata = {
  title: "Mesafeli Satış Sözleşmesi — Kamu Yolu",
};

function YerTutucu({ children }: { children: React.ReactNode }) {
  return (
    <mark className="rounded bg-amber-100 px-1.5 py-0.5 font-medium text-amber-800">
      {children}
    </mark>
  );
}

export default function MesafeliSatisSozlesmesiPage() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-14 sm:px-6 sm:py-20">
      <h1 className="font-sans text-2xl font-bold tracking-tight text-primary sm:text-3xl">
        Mesafeli Satış Sözleşmesi
      </h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Bu sayfa taslak niteliğindedir; <YerTutucu>sarı vurgulu</YerTutucu> alanlar şirket
        kuruluşu ve fiyatlandırma netleştikçe doldurulmalı, yayına alınmadan önce bir hukuk
        danışmanınca onaylanmalıdır.
      </p>

      <div className="prose prose-slate mt-6 max-w-none space-y-5 text-sm leading-relaxed text-slate-700">
        <section>
          <h2 className="font-sans text-base font-semibold text-primary">1. Taraflar</h2>
          <p>
            <strong>SATICI</strong>
          </p>
          <ul className="list-disc pl-5">
            <li>Unvan: <YerTutucu>[ŞİRKET UNVANI]</YerTutucu></li>
            <li>Adres: <YerTutucu>[AÇIK ADRES]</YerTutucu></li>
            <li>Vergi Dairesi / No: <YerTutucu>[VERGİ DAİRESİ VE NUMARASI]</YerTutucu></li>
            <li>MERSİS No: <YerTutucu>[MERSİS NUMARASI]</YerTutucu></li>
            <li>E-posta: <YerTutucu>[E-POSTA ADRESİ]</YerTutucu></li>
          </ul>
          <p>
            <strong>ALICI</strong>: kamuyolu.com üzerinden üye olup ücretli abonelik satın alan
            gerçek kişi (&quot;Tüketici/Kullanıcı&quot;).
          </p>
        </section>

        <section>
          <h2 className="font-sans text-base font-semibold text-primary">2. Sözleşmenin Konusu</h2>
          <p>
            İşbu sözleşmenin konusu, ALICI&apos;nın SATICI&apos;ya ait kamuyolu.com internet
            sitesi üzerinden elektronik ortamda siparişini verdiği aşağıda nitelikleri ve satış
            fiyatı belirtilen dijital abonelik hizmetinin satışı ve ifasına ilişkin olarak 6502
            sayılı Tüketicinin Korunması Hakkında Kanun ve Mesafeli Sözleşmeler Yönetmeliği
            hükümleri gereğince tarafların hak ve yükümlülüklerinin belirlenmesidir.
          </p>
        </section>

        <section>
          <h2 className="font-sans text-base font-semibold text-primary">3. Hizmetin Temel Nitelikleri ve Fiyatı</h2>
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr>
                <th className="border border-border bg-slate-50 p-2 text-left">Plan</th>
                <th className="border border-border bg-slate-50 p-2 text-left">Temel Özellikler</th>
                <th className="border border-border bg-slate-50 p-2 text-left">Fiyat (KDV Dahil)</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="border border-border p-2">Pro</td>
                <td className="border border-border p-2">
                  SMS ile anlık ilan bildirimi, bölüme özel bildirimler, becayiş modülünde site
                  içi mesajlaşma
                </td>
                <td className="border border-border p-2">39 TL / ay</td>
              </tr>
              <tr>
                <td className="border border-border p-2">Pro+</td>
                <td className="border border-border p-2">
                  Pro&apos;daki tüm özellikler, reklamsız kullanım, öncelikli destek
                </td>
                <td className="border border-border p-2">79 TL / ay</td>
              </tr>
            </tbody>
          </table>
          <p className="mt-2">
            Güncel fiyatlar ve kapsam her zaman{" "}
            <a href="/profilim/abonelik" className="text-primary underline">
              Aboneliğim
            </a>{" "}
            sayfasında yayınlanır; satın alma anındaki fiyat ve içerik esastır.
          </p>
        </section>

        <section>
          <h2 className="font-sans text-base font-semibold text-primary">4. Ödeme Şekli</h2>
          <p>
            Ödeme, <YerTutucu>[ÖDEME KURULUŞU ADI]</YerTutucu> aracılığıyla kredi kartı/banka
            kartı ile gerçekleştirilir. Abonelik, ALICI iptal etmediği sürece seçilen dönem
            (aylık/yıllık) sonunda otomatik olarak yenilenir ve kayıtlı ödeme yöntemine
            yansıtılır.
          </p>
        </section>

        <section>
          <h2 className="font-sans text-base font-semibold text-primary">5. Hizmetin İfası</h2>
          <p>
            Ödemenin onaylanmasının ardından abonelik, ALICI&apos;nın hesabında anında aktif
            hale gelir ve elektronik ortamda ifa edilmiş sayılır. Hizmet, fiziksel bir teslimat
            gerektirmez.
          </p>
        </section>

        <section>
          <h2 className="font-sans text-base font-semibold text-primary">6. Cayma Hakkı</h2>
          <p>
            Mesafeli Sözleşmeler Yönetmeliği&apos;nin 15/1-ğ maddesi uyarınca, ALICI&apos;nın
            onayı ile elektronik ortamda anında ifa edilen hizmetlerde (işbu dijital abonelik
            gibi) ALICI, hizmeti kullanmaya başladıktan sonra cayma hakkını kullanamaz. Hizmeti
            henüz kullanmaya başlamadıysanız, satın alma tarihinden itibaren 14 gün içinde cayma
            hakkınızı kullanabilirsiniz. Ayrıntılar için{" "}
            <a href="/iade-politikasi" className="text-primary underline">
              İade Politikası
            </a>{" "}
            sayfasına bakınız.
          </p>
        </section>

        <section>
          <h2 className="font-sans text-base font-semibold text-primary">7. Genel Hükümler</h2>
          <ul className="list-disc pl-5">
            <li>ALICI, sipariş vermeden önce bu sözleşmeyi ve Ön Bilgilendirme Formunu okuyup onayladığını kabul eder.</li>
            <li>SATICI, haklı bir nedenle hizmeti sunamayacak duruma gelirse ALICI&apos;yı bilgilendirip tahsil edilen bedeli iade eder.</li>
            <li>İşbu sözleşme, ALICI&apos;nın elektronik ortamda onay vermesiyle yürürlüğe girer.</li>
          </ul>
        </section>

        <section>
          <h2 className="font-sans text-base font-semibold text-primary">8. Uyuşmazlıkların Çözümü</h2>
          <p>
            İşbu sözleşmeden doğan uyuşmazlıklarda, Ticaret Bakanlığınca her yıl ilan edilen
            parasal sınırlar dahilinde ALICI&apos;nın yerleşim yerindeki veya SATICI&apos;nın
            işlem yaptığı Tüketici Hakem Heyetleri, bu sınırları aşan uyuşmazlıklarda ise
            Tüketici Mahkemeleri yetkilidir.
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

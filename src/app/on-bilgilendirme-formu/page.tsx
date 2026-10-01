export const metadata = {
  title: "Ön Bilgilendirme Formu — Kamu Yolu",
};

function YerTutucu({ children }: { children: React.ReactNode }) {
  return (
    <mark className="rounded bg-amber-100 px-1.5 py-0.5 font-medium text-amber-800">
      {children}
    </mark>
  );
}

export default function OnBilgilendirmeFormuPage() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-14 sm:px-6 sm:py-20">
      <h1 className="font-sans text-2xl font-bold tracking-tight text-primary sm:text-3xl">
        Ön Bilgilendirme Formu
      </h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Bu sayfa taslak niteliğindedir; <YerTutucu>sarı vurgulu</YerTutucu> alanlar şirket
        kuruluşu ve fiyatlandırma netleştikçe doldurulmalı, yayına alınmadan önce bir hukuk
        danışmanınca onaylanmalıdır.
      </p>

      <div className="prose prose-slate mt-6 max-w-none space-y-5 text-sm leading-relaxed text-slate-700">
        <p>
          6502 sayılı Tüketicinin Korunması Hakkında Kanun ve Mesafeli Sözleşmeler
          Yönetmeliği uyarınca, bir abonelik satın almadan önce aşağıdaki bilgiler size
          açıkça sunulur.
        </p>

        <section>
          <h2 className="font-sans text-base font-semibold text-primary">1. Satıcı Bilgileri</h2>
          <ul className="list-disc pl-5">
            <li>Unvan: <YerTutucu>[ŞİRKET UNVANI]</YerTutucu></li>
            <li>Adres: <YerTutucu>[AÇIK ADRES]</YerTutucu></li>
            <li>Telefon: <YerTutucu>[TELEFON]</YerTutucu></li>
            <li>E-posta: <YerTutucu>[E-POSTA ADRESİ]</YerTutucu></li>
            <li>MERSİS No: <YerTutucu>[MERSİS NUMARASI]</YerTutucu></li>
          </ul>
        </section>

        <section>
          <h2 className="font-sans text-base font-semibold text-primary">2. Hizmetin Temel Özellikleri</h2>
          <p>
            Satın aldığınız plan (Pro veya Pro+), kamuyolu.com üzerinde dijital bir abonelik
            hizmetidir ve fiziksel teslimat içermez. Her planın kapsadığı özellikler (SMS
            bildirimi, bölüme özel bildirim, becayiş mesajlaşması, reklamsız kullanım vb.) satın
            alma ekranında ve{" "}
            <a href="/profilim/abonelik" className="text-primary underline">
              Aboneliğim
            </a>{" "}
            sayfasında ayrıntılı olarak listelenir.
          </p>
        </section>

        <section>
          <h2 className="font-sans text-base font-semibold text-primary">3. Toplam Fiyat (Vergiler Dahil)</h2>
          <p>
            Seçtiğiniz plan ve dönem (aylık/yıllık) için ödeyeceğiniz toplam tutar, ödeme
            adımında KDV dahil olarak açıkça gösterilir. Güncel fiyatlar:{" "}
            <YerTutucu>[FİYAT - belirlenecek]</YerTutucu>
          </p>
        </section>

        <section>
          <h2 className="font-sans text-base font-semibold text-primary">4. Ödeme Şekli ve Yenileme</h2>
          <p>
            Ödeme, <YerTutucu>[ÖDEME KURULUŞU ADI]</YerTutucu> güvenli ödeme sayfası üzerinden
            kredi/banka kartı ile tek seferde tahsil edilir. Abonelik, siz iptal etmediğiniz
            sürece dönem sonunda otomatik olarak yenilenir ve aynı tutar yeniden tahsil edilir.
            İstediğiniz zaman{" "}
            <a href="/profilim/abonelik" className="text-primary underline">
              Aboneliğim
            </a>{" "}
            sayfasından iptal edebilirsiniz.
          </p>
        </section>

        <section>
          <h2 className="font-sans text-base font-semibold text-primary">5. Cayma Hakkı</h2>
          <p>
            Hizmeti kullanmaya başlamadan önce (onay anından itibaren) 14 gün içinde cayma
            hakkınızı kullanabilirsiniz. Hizmeti onaylayıp kullanmaya başladığınızda (ör. SMS
            bildirimi almaya başladığınızda), Mesafeli Sözleşmeler Yönetmeliği&apos;nin 15/1-ğ
            maddesi gereği cayma hakkınız sona erer. Ayrıntılar için{" "}
            <a href="/iade-politikasi" className="text-primary underline">
              İade Politikası
            </a>{" "}
            sayfasına bakınız.
          </p>
        </section>

        <section>
          <h2 className="font-sans text-base font-semibold text-primary">6. Şikayet ve Başvuru Yolları</h2>
          <p>
            Şikayetleriniz için öncelikle <YerTutucu>[DESTEK E-POSTASI]</YerTutucu> adresinden
            bizimle iletişime geçebilirsiniz. Çözülemeyen uyuşmazlıklarda, Ticaret Bakanlığınca
            ilan edilen parasal sınırlar dahilinde yerleşim yerinizdeki Tüketici Hakem Heyeti
            veya Tüketici Mahkemesine başvurabilirsiniz.
          </p>
        </section>

        <section>
          <h2 className="font-sans text-base font-semibold text-primary">7. Onay</h2>
          <p>
            Ödeme adımında bu formu ve{" "}
            <a href="/mesafeli-satis-sozlesmesi" className="text-primary underline">
              Mesafeli Satış Sözleşmesi&apos;ni
            </a>{" "}
            okuyup onayladığınızı beyan edersiniz. Onayınız olmadan ödeme işlemi tamamlanmaz.
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

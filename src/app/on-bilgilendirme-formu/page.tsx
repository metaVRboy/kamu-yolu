import Link from "next/link";
import { FileText } from "lucide-react";
import { SayfaBasligi } from "@/components/SayfaBasligi";
import { OnizlemeNotu, SaticiBilgileri, YasalBolum, odemeKurulusu, sozlesmeErisimi } from "@/components/YasalMetin";
import { getFiyatlar } from "@/lib/fiyatlar";
import { PLAN_ADI, UCRETLI_PLANLAR, tl } from "@/lib/planlar";
import { ILETISIM_EPOSTA } from "@/lib/site";

export const metadata = {
  title: "Ön Bilgilendirme Formu — Kamu Yolu",
};

// Mesafeli Sozlesmeler Yonetmeligi m.5'in saydigi bilgiler; satin alma adiminda sozlesmeden once onaylatilir.
export default async function OnBilgilendirmeFormuPage() {
  const { onizleme } = await sozlesmeErisimi();
  const { tablo } = await getFiyatlar();
  return (
    <div className="mx-auto max-w-2xl px-4 py-14 sm:px-6 sm:py-20">
      <SayfaBasligi kompakt ikon={FileText} baslik="Ön Bilgilendirme Formu" />
      {onizleme && <OnizlemeNotu />}

      <div className="prose prose-slate mt-6 max-w-none space-y-5 rounded-2xl border border-primary/10 bg-white p-6 text-sm leading-relaxed text-slate-700 shadow-sm sm:p-8">
        <p>
          6502 sayılı Tüketicinin Korunması Hakkında Kanun ve Mesafeli Sözleşmeler Yönetmeliği uyarınca, abonelik satın almadan önce aşağıdaki
          bilgiler size sunulur.
        </p>

        <YasalBolum baslik="1. Satıcı">
          <SaticiBilgileri />
        </YasalBolum>

        <YasalBolum baslik="2. Hizmetin Temel Nitelikleri">
          <p>
            Pro ve Pro+ planları kamuyolu.com üzerinde sunulan dijital abonelik hizmetleridir; fiziksel ürün veya teslimat içermez. Her planın
            özellikleri ödeme ekranında, Aboneliğim sayfasında ve{" "}
            <Link href="/mesafeli-satis-sozlesmesi" className="text-primary underline">
              Mesafeli Satış Sözleşmesi
            </Link>
            &apos;nin 3. maddesinde listelenir.
          </p>
        </YasalBolum>

        <YasalBolum baslik="3. Toplam Fiyat">
          <ul className="list-disc pl-5">
            {UCRETLI_PLANLAR.map((plan) => (
              <li key={plan}>
                {PLAN_ADI[plan]}: {tl(tablo[plan].aylik.liste)} / ay veya {tl(tablo[plan].yillik.liste)} / yıl
              </li>
            ))}
          </ul>
          <p>
            Fiyatlara KDV dahildir; teslimat veya ek masraf yoktur. Kampanya varsa ödeyeceğiniz toplam tutar ödeme ekranında açıkça gösterilir.
          </p>
        </YasalBolum>

        <YasalBolum baslik="4. Ödeme">
          <p>
            Ödeme, {odemeKurulusu()} güvenli ödeme sayfasında kredi/banka kartıyla, 3D Secure doğrulamalı olarak tek çekimde alınır. Kart
            bilgileriniz Kamu Yolu&apos;na ulaşmaz. Faturanız e-Arşiv fatura olarak e-posta adresinize gönderilir.
          </p>
        </YasalBolum>

        <YasalBolum baslik="5. Hizmetin İfası">
          <p>Ödeme onaylandığı anda abonelik hesabınızda etkinleşir ve size e-posta ile bildirilir. Teslimat süresi yoktur.</p>
        </YasalBolum>

        <YasalBolum baslik="6. Sözleşmenin Süresi, Yenileme ve Fesih">
          <p>
            Abonelik seçtiğiniz döneme (bir ay veya on iki ay) göre kurulur ve iptal etmediğiniz sürece dönem sonunda aynı süreyle otomatik
            yenilenir; yenileme bedeli kayıtlı kartınızdan tahsil edilir. Yıllık planda yenilemeden en az 7 gün önce e-posta ile hatırlatılırsınız.
            Aboneliğinizi istediğiniz an, ek ücret ödemeden Aboneliğim sayfasından iptal edebilirsiniz; ödediğiniz dönemin sonuna kadar hizmeti
            kullanmaya devam edersiniz. Asgari taahhüt süresi ve depozito yoktur.
          </p>
        </YasalBolum>

        <YasalBolum baslik="7. Cayma Hakkı">
          <p>
            Bu hizmet elektronik ortamda anında ifa edildiğinden ve ifasına onayınızla hemen başlandığından, Mesafeli Sözleşmeler
            Yönetmeliği&apos;nin 15. maddesi uyarınca <strong>cayma hakkınız bulunmamaktadır</strong>. Ödeme adımında bunu ayrıca onaylamanız
            istenir.
          </p>
          <p>
            Bununla birlikte, ücretli özelliklerin hiçbirini kullanmadıysanız satın alma tarihinden itibaren 14 gün içinde iade talep edebilirsiniz;
            ücretin tamamı iade edilir. Ayrıntılar:{" "}
            <Link href="/iade-politikasi" className="text-primary underline">
              İptal, İade ve Teslimat Koşulları
            </Link>
            .
          </p>
        </YasalBolum>

        <YasalBolum baslik="8. Dijital Hizmetin İşlevselliği ve Uyumluluk">
          <p>
            Hizmete güncel bir web tarayıcısı (Chrome, Safari, Edge, Firefox) ve internet bağlantısıyla erişilir; ek yazılım veya donanım gerekmez.
            Hesabınız kişiseldir, başkalarıyla paylaşılamaz.
          </p>
        </YasalBolum>

        <YasalBolum baslik="9. Şikâyet ve Başvuru Yolları">
          <p>
            Şikâyetleriniz için {ILETISIM_EPOSTA} adresine veya{" "}
            <Link href="/destek" className="text-primary underline">
              destek formuna
            </Link>{" "}
            yazabilirsiniz. Çözülemeyen uyuşmazlıklarda Ticaret Bakanlığınca ilan edilen parasal sınırlar dahilinde yerleşim yerinizdeki Tüketici
            Hakem Heyeti&apos;ne, sınırları aşan durumlarda Tüketici Mahkemesi&apos;ne başvurabilirsiniz.
          </p>
        </YasalBolum>

        <YasalBolum baslik="10. Onay">
          <p>
            Ödeme adımında bu formu ve Mesafeli Satış Sözleşmesi&apos;ni okuyup onayladığınızı beyan edersiniz; onayınız olmadan ödeme işlemi
            başlamaz. Onayladığınız metinler e-posta adresinize de gönderilir.
          </p>
        </YasalBolum>
      </div>
    </div>
  );
}

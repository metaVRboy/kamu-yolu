import Link from "next/link";
import { RotateCcw } from "lucide-react";
import { SayfaBasligi } from "@/components/SayfaBasligi";
import { OnizlemeNotu, YasalBolum, odemeKurulusu, sozlesmeErisimi } from "@/components/YasalMetin";
import { ILETISIM_EPOSTA } from "@/lib/site";

export const metadata = {
  title: "İptal, İade ve Teslimat Koşulları — Kamu Yolu",
};

export default async function IadePolitikasiPage() {
  const { onizleme } = await sozlesmeErisimi();
  return (
    <div className="mx-auto max-w-2xl px-4 py-14 sm:px-6 sm:py-20">
      <SayfaBasligi kompakt ikon={RotateCcw} baslik="İptal, İade ve Teslimat Koşulları" />
      {onizleme && <OnizlemeNotu />}

      <div className="prose prose-slate mt-6 max-w-none space-y-5 rounded-2xl border border-primary/10 bg-white p-6 text-sm leading-relaxed text-slate-700 shadow-sm sm:p-8">
        <YasalBolum baslik="1. Kapsam">
          <p>
            Bu koşullar kamuyolu.com üzerinden satın alınan Pro ve Pro+ aboneliklerinin teslimatını, iptalini ve iadesini düzenler. Standart plan
            ücretsiz olduğundan bu koşullar Standart plana uygulanmaz.
          </p>
        </YasalBolum>

        <YasalBolum baslik="2. Teslimat">
          <ul className="list-disc pl-5">
            <li>Satılan hizmet dijital bir aboneliktir; kargo, fiziksel ürün veya teslimat ücreti yoktur.</li>
            <li>
              Ödeme onaylandığı anda abonelik hesabınızda etkinleşir; Pro/Pro+ özellikleri hemen kullanılabilir. Hesabınızdaki plan rozeti ve size
              gönderilen onay e-postası teslimin kanıtıdır.
            </li>
            <li>
              Ödeme alındığı halde aboneliğiniz 1 saat içinde etkinleşmediyse {ILETISIM_EPOSTA} adresine yazın; sorun giderilir ya da ücretiniz iade
              edilir.
            </li>
          </ul>
        </YasalBolum>

        <YasalBolum baslik="3. Cayma Hakkı">
          <p>
            Mesafeli Sözleşmeler Yönetmeliği&apos;nin 15. maddesi uyarınca, elektronik ortamda anında ifa edilen ve onayınızla hemen başlatılan
            dijital hizmetlerde cayma hakkı bulunmaz. Ödeme adımında bu husus ayrıca onayınıza sunulur.
          </p>
        </YasalBolum>

        <YasalBolum baslik="4. İade Taahhüdümüz">
          <p>Yasal zorunluluk olmasa da aşağıdaki durumlarda ücretinizi iade ederiz:</p>
          <ul className="list-disc pl-5">
            <li>
              <strong>Hiç kullanılmayan abonelik:</strong> Satın alma tarihinden itibaren 14 gün içinde talep eder ve bu sürede Pro/Pro+&apos;a özel
              hiçbir özelliği kullanmamış olursanız (ör. ücretli KPSS denemesi çözmediyseniz, ders karnesi açmadıysanız, becayiş mesajı
              göndermediyseniz, WhatsApp bildirimi almadıysanız) ücretin tamamı iade edilir.
            </li>
            <li>
              <strong>Mükerrer veya hatalı tahsilat:</strong> Aynı abonelik için birden fazla ya da yanlış tutarda çekim yapıldıysa fazla tutar
              eksiksiz iade edilir.
            </li>
            <li>
              <strong>Hizmetin sunulamaması:</strong> Teknik bir sorun nedeniyle satın aldığınız hizmeti kullanamadıysanız, etkilenen süreye ait
              bedel iade edilir ya da aboneliğiniz o süre kadar uzatılır (tercih sizindir).
            </li>
          </ul>
          <p>
            Bu durumlar dışında, başlamış bir abonelik döneminin bedeli iade edilmez; aboneliğinizi iptal ederek sonraki dönemin ücretlendirilmesini
            durdurabilirsiniz.
          </p>
        </YasalBolum>

        <YasalBolum baslik="5. Aboneliğin İptali">
          <p>
            Aboneliğinizi istediğiniz an, ek ücret ödemeden{" "}
            <Link href="/profilim/abonelik" className="text-primary underline">
              Aboneliğim
            </Link>{" "}
            sayfasından iptal edebilirsiniz. İptal, içinde bulunduğunuz dönemi sonlandırmaz: ödediğiniz dönemin sonuna kadar hizmetten yararlanırsınız
            ve sonraki dönem için kartınızdan ücret alınmaz. Yenilemenin durması için iptalin yenileme tarihinden önce yapılması yeterlidir.
          </p>
        </YasalBolum>

        <YasalBolum baslik="6. İade Süreci">
          <ul className="list-disc pl-5">
            <li>
              İade talebinizi {ILETISIM_EPOSTA} adresine ya da{" "}
              <Link href="/destek" className="text-primary underline">
                destek formuna
              </Link>{" "}
              hesabınızın e-posta adresiyle yazın.
            </li>
            <li>Talebiniz en geç 3 iş günü içinde sonuçlandırılır ve size e-posta ile bildirilir.</li>
            <li>
              Onaylanan iade, {odemeKurulusu()} üzerinden ödemeyi yaptığınız karta yapılır. Tutarın hesabınıza yansıması bankanıza bağlı olarak
              genellikle 2–10 iş günü sürer.
            </li>
            <li>İade edilen abonelik iade anında sona erer.</li>
          </ul>
        </YasalBolum>
      </div>
    </div>
  );
}

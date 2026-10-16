import Link from "next/link";
import { FileSignature } from "lucide-react";
import { SayfaBasligi } from "@/components/SayfaBasligi";
import { OnizlemeNotu, SaticiBilgileri, YasalBolum, odemeKurulusu, sozlesmeErisimi } from "@/components/YasalMetin";
import { getFiyatlar } from "@/lib/fiyatlar";
import { KARSILASTIRMA, PLAN_ADI, UCRETLI_PLANLAR, tl } from "@/lib/planlar";
import { ILETISIM_EPOSTA } from "@/lib/site";

export const metadata = {
  title: "Mesafeli Satış Sözleşmesi — Kamu Yolu",
};

/** Planin ozellikleri karsilastirma tablosundan (Aboneliğim sayfasiyla ayni kaynak). */
const planOzellikleri = (plan: (typeof UCRETLI_PLANLAR)[number]) =>
  KARSILASTIRMA.filter((s) => s.degerler[plan]).map((s) => (typeof s.degerler[plan] === "string" ? `${s.ozellik}: ${s.degerler[plan]}` : s.ozellik));

export default async function MesafeliSatisSozlesmesiPage() {
  const { onizleme } = await sozlesmeErisimi();
  // Sozlesmede liste fiyati yazar (kampanya indirimi odeme adiminda ayrica gosterilir).
  const { tablo } = await getFiyatlar();
  return (
    <div className="mx-auto max-w-2xl px-4 py-14 sm:px-6 sm:py-20">
      <SayfaBasligi kompakt ikon={FileSignature} baslik="Mesafeli Satış Sözleşmesi" />
      {onizleme && <OnizlemeNotu />}

      <div className="prose prose-slate mt-6 max-w-none space-y-5 rounded-2xl border border-primary/10 bg-white p-6 text-sm leading-relaxed text-slate-700 shadow-sm sm:p-8">
        <YasalBolum baslik="1. Taraflar">
          <p>
            <strong>SATICI</strong>
          </p>
          <SaticiBilgileri />
          <p>
            <strong>ALICI</strong>: kamuyolu.com üzerinden üye olup ücretli abonelik satın alan gerçek kişi. ALICI&apos;nın ad soyad, e-posta ve
            fatura bilgileri sipariş anında üyelik hesabındaki ve ödeme adımında girdiği bilgilerdir.
          </p>
        </YasalBolum>

        <YasalBolum baslik="2. Sözleşmenin Konusu">
          <p>
            İşbu sözleşmenin konusu, ALICI&apos;nın kamuyolu.com sitesi üzerinden elektronik ortamda satın aldığı, nitelikleri ve satış fiyatı aşağıda
            belirtilen dijital abonelik hizmetinin satışı ve ifasına ilişkin olarak 6502 sayılı Tüketicinin Korunması Hakkında Kanun ve Mesafeli
            Sözleşmeler Yönetmeliği hükümleri gereğince tarafların hak ve yükümlülüklerinin belirlenmesidir.
          </p>
        </YasalBolum>

        <YasalBolum baslik="3. Hizmetin Temel Nitelikleri ve Fiyatı">
          <div className="not-prose space-y-3">
            {UCRETLI_PLANLAR.map((plan) => (
              <div key={plan} className="rounded-xl border border-slate-200 p-3">
                <p className="font-semibold text-slate-900">
                  {PLAN_ADI[plan]} — {tl(tablo[plan].aylik.liste)} / ay · {tl(tablo[plan].yillik.liste)} / yıl (KDV dahil)
                </p>
                <ul className="mt-1.5 list-disc pl-5 text-xs text-slate-600">
                  {planOzellikleri(plan).map((o) => (
                    <li key={o}>{o}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <p>
            Fiyatlara KDV dahildir; teslimat veya ek masraf yoktur. Kampanya varsa indirimli tutar ödeme adımında ayrıca gösterilir. Satın alma
            anında ödeme ekranında gösterilen plan, dönem ve toplam tutar esastır.
          </p>
        </YasalBolum>

        <YasalBolum baslik="4. Ödeme">
          <p>
            Ödeme, {odemeKurulusu()} altyapısıyla kredi kartı veya banka kartıyla, 3D Secure doğrulamalı olarak tek çekimde alınır. Kart
            bilgileri Kamu Yolu sunucularına ulaşmaz ve saklanmaz; ödeme kuruluşu tarafından işlenir. Ödemenin ardından ALICI&apos;nın e-posta
            adresine elektronik (e-Arşiv) fatura gönderilir.
          </p>
        </YasalBolum>

        <YasalBolum baslik="5. Abonelik Süresi, Yenileme ve İptal">
          <ul className="list-disc pl-5">
            <li>Aylık plan bir aylık, yıllık plan on iki aylık dönemler halinde sunulur; dönem, ödemenin onaylandığı an başlar.</li>
            <li>
              Abonelik, ALICI iptal etmedikçe dönem sonunda aynı süre ve o anki fiyatla otomatik yenilenir ve ödeme kuruluşunda kayıtlı karttan
              tahsil edilir. Yıllık planda yenilemeden en az 7 gün önce e-posta ile hatırlatma yapılır.
            </li>
            <li>
              ALICI aboneliğini dilediği an, ek ücret ödemeden{" "}
              <Link href="/profilim/abonelik" className="text-primary underline">
                Aboneliğim
              </Link>{" "}
              sayfasından iptal edebilir. İptal, içinde bulunulan dönemi sonlandırmaz: ALICI ödediği dönemin sonuna kadar hizmetten yararlanır,
              sonraki dönem için ücret alınmaz.
            </li>
            <li>
              Fiyat değişikliği, yürürlüğe girmeden en az 30 gün önce e-posta ile bildirilir ve yalnızca sonraki yenilemelere uygulanır; ALICI
              kabul etmezse yenilemeden önce iptal edebilir.
            </li>
          </ul>
        </YasalBolum>

        <YasalBolum baslik="6. Hizmetin İfası (Teslimi)">
          <p>
            Hizmet dijitaldir, fiziksel teslimat yoktur. Ödeme onaylandığı anda abonelik ALICI&apos;nın hesabında etkinleşir ve ALICI&apos;ya
            e-posta ile bildirilir. Hizmete güncel bir web tarayıcısı ve internet bağlantısıyla kamuyolu.com üzerinden erişilir.
          </p>
        </YasalBolum>

        <YasalBolum baslik="7. Cayma Hakkı">
          <p>
            Mesafeli Sözleşmeler Yönetmeliği&apos;nin 15. maddesi uyarınca, elektronik ortamda anında ifa edilen hizmetlerde ve tüketicinin onayıyla
            cayma süresi içinde ifasına başlanan hizmetlerde cayma hakkı kullanılamaz. ALICI, satın alma adımında hizmetin hemen başlamasına onay
            verdiğini ve bu nedenle cayma hakkının bulunmadığını bildiğini ayrıca onaylar.
          </p>
          <p>
            Buna rağmen SATICI, ücretli özelliklerin hiç kullanılmadığı durumlarda satın alma tarihinden itibaren 14 gün içinde yapılan taleplerde
            ücretin tamamını iade etmeyi taahhüt eder. Koşullar{" "}
            <Link href="/iade-politikasi" className="text-primary underline">
              İptal, İade ve Teslimat Koşulları
            </Link>{" "}
            sayfasındadır.
          </p>
        </YasalBolum>

        <YasalBolum baslik="8. Tarafların Yükümlülükleri">
          <ul className="list-disc pl-5">
            <li>ALICI, hesabını ve aboneliğini üçüncü kişilerle paylaşmaz; hizmeti Kullanım Koşulları&apos;na uygun kullanır.</li>
            <li>
              SATICI, hizmeti kesintisiz sunmaya özen gösterir; planlı bakımlar ve SATICI&apos;nın kontrolü dışındaki kesintiler (internet altyapısı,
              barındırma sağlayıcısı arızaları, mücbir sebepler) bu yükümlülüğün ihlali sayılmaz.
            </li>
            <li>
              SATICI, haklı bir nedenle hizmeti sunamayacak duruma gelirse ALICI&apos;ya bildirir ve kullanılmayan döneme ait bedeli en geç 14 gün
              içinde iade eder.
            </li>
            <li>
              İlan bilgileri kamu kurumlarının resmi kaynaklarından derlenir; başvurularda ilgili kurumun resmi ilanı esastır. Kamu Yolu bir kamu
              kurumu değildir.
            </li>
          </ul>
        </YasalBolum>

        <YasalBolum baslik="9. Kişisel Veriler">
          <p>
            ALICI&apos;nın kişisel verileri{" "}
            <Link href="/kvkk" className="text-primary underline">
              KVKK Aydınlatma Metni
            </Link>{" "}
            kapsamında işlenir.
          </p>
        </YasalBolum>

        <YasalBolum baslik="10. Uyuşmazlıkların Çözümü">
          <p>
            Şikâyetler için öncelikle {ILETISIM_EPOSTA} adresine başvurulabilir. Uyuşmazlıklarda, Ticaret Bakanlığınca her yıl ilan edilen parasal
            sınırlar dahilinde ALICI&apos;nın yerleşim yerindeki veya işlemin yapıldığı yerdeki Tüketici Hakem Heyetleri, bu sınırları aşan
            uyuşmazlıklarda Tüketici Mahkemeleri yetkilidir.
          </p>
        </YasalBolum>

        <YasalBolum baslik="11. Yürürlük">
          <p>
            ALICI, ödeme adımında Ön Bilgilendirme Formu&apos;nu ve işbu sözleşmeyi okuyup onayladığını elektronik ortamda beyan eder; sözleşme bu
            onay ve ödemenin tamamlanmasıyla kurulur. Sözleşme metni ALICI&apos;nın e-posta adresine gönderilir ve hesabından erişilebilir halde
            saklanır.
          </p>
        </YasalBolum>
      </div>
    </div>
  );
}

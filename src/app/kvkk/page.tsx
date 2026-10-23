import { ShieldCheck } from "lucide-react";
import { SayfaBasligi } from "@/components/SayfaBasligi";
import Link from "next/link";
import { ILETISIM_ADRES, ILETISIM_EPOSTA, ILETISIM_TELEFON, ODEME_KURULUSU, SATICI } from "@/lib/site";
import { SATIS_ACIK } from "@/lib/planlar";

export const metadata = {
  title: "KVKK Aydınlatma Metni ve Gizlilik Politikası — Kamu Yolu",
  description: "Kamu Yolu'nda hangi kişisel verilerin, hangi amaç ve hukuki sebeple işlendiği, kimlere aktarıldığı, ne kadar saklandığı ve KVKK kapsamındaki hakların.",
};

// Her satir: veri kategorisi -> amac -> hukuki sebep (KVKK m.5) -> saklama suresi. Metin koddaki
// gercek davranisla birebir olmali; davranis degisirse burasi da guncellenir.
const ISLEMELER: { veri: string; amac: string; sebep: string; sure: string }[] = [
  // Odeme/fatura verisi yalniz satis acikken islenir; metin gercek davranisla ayni kalsin diye kosullu.
  ...(SATIS_ACIK
    ? [
        {
          veri: "Ödeme ve fatura bilgileri: ad soyad, e-posta, fatura adresi, satın alınan plan, tutar, ödeme tarihi ve ödeme kuruluşunun işlem numarası (kart numarası Kamu Yolu'na hiç ulaşmaz)",
          amac: "Ödemenin alınması, aboneliğin başlatılması ve yenilenmesi, fatura düzenlenmesi, iade işlemleri",
          sebep: "Sözleşmenin ifası (m.5/2-c) ve hukuki yükümlülük (m.5/2-ç; Vergi Usul Kanunu, Türk Ticaret Kanunu)",
          sure: "Vergi ve ticaret mevzuatı gereği 10 yıl; hesap silinse de bu süre boyunca saklanır",
        },
      ]
    : []),
  {
    veri: "Ad soyad, e-posta, şifre özeti (şifrenin kendisi saklanmaz), Google hesabıyla girişte Google hesap kimliği",
    amac: "Üyelik oluşturma, giriş, hesap güvenliği ve hesapla ilgili bildirimler",
    sebep: "Sözleşmenin kurulması ve ifası (m.5/2-c)",
    sure: "Hesap açık kaldığı sürece; hesap silinince derhal",
  },
  {
    veri: "Mezun olunan bölüm, öğrenim düzeyi, meslek/unvan, kurum türü, profil fotoğrafı (isteğe bağlı)",
    amac: "Bölüme uygun ilanları eşleştirme, kişisel bildirimler, becayiş talepleri",
    sebep: "Sözleşmenin ifası (m.5/2-c)",
    sure: "Hesap açık kaldığı sürece",
  },
  {
    veri: "Telefon numarası ve gönderilen WhatsApp mesajı kayıtları (yalnızca WhatsApp bildirimini açanlarda)",
    amac: "Numara doğrulama ve açtığınız ilan / becayiş mesajı bildirimlerini WhatsApp ile iletme",
    sebep: "Sözleşmenin ifası (m.5/2-c)",
    sure: "Hesap açık kaldığı sürece; numara değişince doğrulama sıfırlanır",
  },
  {
    veri: "WhatsApp işletme numaramıza yazdığınız mesajlar, telefon numaranız ve size verdiğimiz cevaplar",
    amac: "Sorunuzun ya da talebinizin yanıtlanması",
    sebep: "Sözleşmenin kurulması/ifası ve meşru menfaat (m.5/2-c, m.5/2-f)",
    sure: "1 yıl; hesap silinince derhal",
  },
  {
    veri: "Becayiş talebi (meslek, mevcut il/ilçe, istenen iller, açıklama) ve becayiş mesajları",
    amac: "Talebin yayımlanması, kullanıcılar arası site içi mesajlaşma",
    sebep: "Sözleşmenin ifası (m.5/2-c)",
    sure: "Talep yayında kaldığı / hesap açık kaldığı sürece. Gönderdiğiniz mesajlar, karşı tarafın yazışma geçmişi olduğu için hesabınız silinse de onun kutusunda \"Silinmiş kullanıcı\" adıyla kalır",
  },
  {
    veri: "KPSS deneme cevapları, puan ve sonuçları; soru hata bildirimleri",
    amac: "Deneme sınavı, ders karnesi ve gelişim takibi",
    sebep: "Sözleşmenin ifası (m.5/2-c)",
    sure: "Hesap açık kaldığı sürece",
  },
  {
    veri: "Günün soruları cevapları, serisi ve seri dondurma günleri; takip ettiğiniz ilanlar ve kurumlar; bunlardan hesaplanan rozetler",
    amac: "Günlük çalışma takibi, seri ödülü (Pro günü), takip ettiğiniz ilanlar için son başvuru hatırlatması, takip ettiğiniz kurumun yeni ilanının bildirimi",
    sebep: "Sözleşmenin ifası (m.5/2-c)",
    sure: "Hesap açık kaldığı sürece; takip, ilanı takipten çıkarınca silinir",
  },
  {
    veri: "Davet bilgisi: davet kodunuz ve (davet linkiyle geldiyseniz) sizi davet eden üye",
    amac: "Davet hediyesinin (Pro günleri) iki tarafa tanımlanması",
    sebep: "Sözleşmenin ifası (m.5/2-c)",
    sure: "Hesap açık kaldığı sürece",
  },
  {
    veri: "Tarayıcı bildirimi aboneliği (tarayıcının verdiği bildirim adresi ve şifreleme anahtarları)",
    amac: "İzin verdiğiniz cihaza günün soruları ve (Pro) son başvuru hatırlatması gönderme",
    sebep: "Talebiniz üzerine sözleşmenin ifası (m.5/2-c)",
    sure: "Bildirimleri kapatana ya da tarayıcı aboneliği iptal edene kadar",
  },
  {
    veri: "Ücretli plan bekleme listesi (seçilen plan, dönem, talebin geldiği buton)",
    amac: "Ödeme altyapısı açıldığında talep ettiğiniz plan için size haber verme, talebi ölçme",
    sebep: "Sözleşmenin kurulmasından önce talebiniz üzerine yapılan işlem (m.5/2-c)",
    sure: "Listeden çıkana, plan satın alınana ya da hesap silinene kadar",
  },
  {
    veri: "Destek mesajları (ad, e-posta, konu, mesaj ve yanıtlar)",
    amac: "Destek taleplerinizi yanıtlama",
    sebep: "Sözleşmenin ifası (m.5/2-c) ve meşru menfaat (m.5/2-f)",
    sure: "Yanıt geçmişi olarak saklanır; hesap silinince ad ve e-posta çıkarılır",
  },
  {
    veri: "Oturum kayıtları (tarayıcı/cihaz türü, oturumun açılış ve son görülme zamanı)",
    amac: "Hesap güvenliği, açık oturumları görüp kapatabilmeniz",
    sebep: "Meşru menfaat (m.5/2-f)",
    sure: "Oturum kapatılana veya süresi (30 gün) dolana kadar",
  },
  {
    veri: "Trafik kayıtları: giriş yaptığınızda ve becayiş ilanı ya da mesajı oluşturduğunuzda IP adresi, tarayıcı bilgisi ve zaman",
    amac: "5651 sayılı Kanun'un yer sağlayıcılara yüklediği trafik bilgisi saklama yükümlülüğü; kötüye kullanımda failin tespiti",
    sebep: "Kanunlarda öngörülme ve hukuki yükümlülük (m.5/2-a, ç)",
    sure: "2 yıl; hesabınız silinse de bu süre boyunca saklanır, sonra otomatik silinir. Yalnızca yetkili mercilerin talebiyle paylaşılır",
  },
  {
    veri: "Hesap silme işleminin kaydı (hesap kimliği ve tarih; başka kişisel veri içermez)",
    amac: "Silme talebinin yerine getirildiğini ispat",
    sebep: "Hukuki yükümlülük (m.5/2-ç; Kişisel Verilerin Silinmesi Yönetmeliği m.7)",
    sure: "3 yıl",
  },
  {
    veri: "Kayıt kaynağı: siteye geldiğiniz reklam kampanyası bilgisi (utm parametreleri, tıklama kimliği), yönlendiren site ve giriş sayfası",
    amac: "Reklam kampanyalarının etkisini ölçme",
    sebep: "Meşru menfaat (m.5/2-f); tarayıcıda çerezle saklanması çerez onayınıza bağlıdır",
    sure: "Hesap açık kaldığı sürece",
  },
  {
    veri: "Bildirim ve ileti tercihleri, verdiğiniz/geri çektiğiniz onayların tarihleri",
    amac: "Tercihlerinizi uygulama ve onay kaydını tutma",
    sebep: "Hukuki yükümlülük (m.5/2-ç; 6563 sayılı Kanun) ve sözleşmenin ifası",
    sure: "Hesap açık kaldığı sürece",
  },
  {
    veri: "Ziyaret ölçümü çerezleri (kampanya kaynağı; etkinse Google Analytics, Meta ve TikTok pikselleri)",
    amac: "Ziyaret ve dönüşüm ölçümü",
    sebep: "Açık rıza (m.5/1) — çerez bildirimindeki \"Kabul et\" ile",
    sure: "Çerez Politikası'nda belirtilen sürelerce; onayınızı istediğiniz an geri alabilirsiniz",
  },
];

const ALICILAR: { kim: string; ne: string; ulke: string }[] = [
  { kim: "Vercel Inc.", ne: "Sitenin barındırılması ve çalıştırılması (sunucular Frankfurt'ta)", ulke: "ABD merkezli şirket" },
  { kim: "Neon, LLC (Databricks, Inc.)", ne: "Veritabanı (sunucular Frankfurt'ta)", ulke: "ABD merkezli şirket" },
  { kim: "Resend Inc.", ne: "E-posta gönderimi (doğrulama kodu, şifre sıfırlama, bildirimler)", ulke: "ABD" },
  { kim: "Google LLC", ne: "Google ile giriş, kurumsal e-posta ve — onay verirseniz ve etkinse — ziyaret ölçümü", ulke: "ABD" },
  { kim: "Cloudflare Inc.", ne: "Robot doğrulaması (Turnstile) için tarayıcı ve IP bilgisi", ulke: "ABD" },
  { kim: "Meta Platforms / TikTok", ne: "Yalnızca çerez onayı verirseniz ve ilgili piksel etkinse reklam ölçümü", ulke: "ABD / İrlanda" },
  { kim: "Meta Platforms (WhatsApp Business)", ne: "WhatsApp bildirimini açtıysanız telefon numaranız ve ileti metni (doğrulama kodu ve bildirim mesajları)", ulke: "İrlanda / ABD" },
  {
    kim: "Tarayıcınızın bildirim servisi (ör. Google, Mozilla, Apple)",
    ne: "Tarayıcı bildirimini açtıysanız bildirimin cihazınıza iletilmesi; içerik uçtan uca şifreli gider",
    ulke: "Tarayıcıya göre, çoğunlukla ABD",
  },
  ...(SATIS_ACIK
    ? [
        { kim: ODEME_KURULUSU ?? "Ödeme kuruluşu", ne: "Ücretli abonelik ödemesi; kart bilgilerinizi doğrudan ödeme kuruluşu işler", ulke: "Türkiye" },
        { kim: "e-Arşiv fatura hizmet sağlayıcısı ve Gelir İdaresi Başkanlığı", ne: "Fatura düzenlenmesi ve vergi bildirimi", ulke: "Türkiye" },
      ]
    : []),
];

export default function KvkkPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-14 sm:px-6 sm:py-20">
      <SayfaBasligi kompakt ikon={ShieldCheck} baslik="KVKK Aydınlatma Metni ve Gizlilik Politikası" />

      <div className="prose prose-slate mt-6 max-w-none space-y-6 rounded-2xl border border-primary/10 bg-white p-6 text-sm leading-relaxed text-slate-700 shadow-sm sm:p-8">
        <section>
          <h2 className="font-sans text-base font-semibold text-primary">1. Veri Sorumlusu</h2>
          <p>
            6698 sayılı Kişisel Verilerin Korunması Kanunu (&quot;KVKK&quot;) kapsamında veri sorumlusu, kamuyolu.com sitesini ve
            Kamu Yolu mobil uygulamasını (&quot;Kamu Yolu&quot;) şahıs işletmesi olarak işleten <strong>{SATICI.unvan}</strong>&apos;tur
            ({SATICI.vergiDairesi} V.D. {SATICI.vergiNo}). Adres:{" "}
            {ILETISIM_ADRES} · Telefon:{" "}
            <a href={`tel:${ILETISIM_TELEFON.tel}`} className="text-primary underline">
              {ILETISIM_TELEFON.goster}
            </a>{" "}
            · E-posta:{" "}
            <a href={`mailto:${ILETISIM_EPOSTA}`} className="text-primary underline">
              {ILETISIM_EPOSTA}
            </a>
            .
          </p>
          <p>
            Kişisel verileriniz; üye olurken ve siteyi kullanırken formlar, hesap ayarları ve mesajlaşma aracılığıyla sizden,
            Google ile girişte Google&apos;dan (ad, e-posta, hesap kimliği) ve tarayıcınızdan (çerezler, oturum bilgisi) otomatik
            yollarla toplanır.
          </p>
        </section>

        <section>
          <h2 className="font-sans text-base font-semibold text-primary">2. Hangi Verileri, Neden ve Ne Kadar Süre İşliyoruz?</h2>
          <div className="not-prose space-y-3">
            {ISLEMELER.map((i) => (
              <div key={i.veri} className="rounded-xl border border-slate-200 p-3">
                <p className="font-semibold text-slate-900">{i.veri}</p>
                <dl className="mt-1.5 grid gap-1 text-xs sm:grid-cols-[7rem_1fr]">
                  <dt className="font-semibold text-slate-500">Amaç</dt>
                  <dd>{i.amac}</dd>
                  <dt className="font-semibold text-slate-500">Hukuki sebep</dt>
                  <dd>{i.sebep}</dd>
                  <dt className="font-semibold text-slate-500">Saklama</dt>
                  <dd>{i.sure}</dd>
                </dl>
              </div>
            ))}
          </div>
          <p>
            Özel nitelikli kişisel veri (sağlık, din, siyasi görüş vb.) istemiyoruz; becayiş açıklamalarına bu tür bilgiler
            yazmamanızı rica ederiz. Hesabınızı silerseniz yukarıda aksi belirtilmeyen tüm verileriniz derhal silinir.
          </p>
        </section>

        <section>
          <h2 className="font-sans text-base font-semibold text-primary">3. Kimlerle Paylaşıyoruz?</h2>
          <p>
            Kişisel verileriniz satılmaz. Becayiş talebiniz herkese açık listelenir, ancak adınız kısaltılarak gösterilir (ör.
            &quot;Ayşe K.&quot;) ve iletişim bilgileriniz (e-posta, telefon) diğer kullanıcılara hiçbir zaman gösterilmez. Verileriniz
            yalnızca hizmeti sunabilmek için gereken ölçüde aşağıdaki hizmet sağlayıcılara ve kanunen yetkili kamu
            kurumlarına (talep halinde) aktarılır:
          </p>
          <ul className="list-disc pl-5">
            {ALICILAR.map((a) => (
              <li key={a.kim}>
                <strong>{a.kim}</strong> — {a.ne} ({a.ulke})
              </li>
            ))}
          </ul>
          <p>Bu sağlayıcıların bir kısmı yurt dışında yerleşik olduğundan, söz konusu paylaşım verilerin yurt dışına aktarılması niteliğindedir.</p>
        </section>

        <section>
          <h2 className="font-sans text-base font-semibold text-primary">4. Ticari Elektronik İleti</h2>
          <p>
            Şu anda kampanya, indirim veya tanıtım içerikli WhatsApp mesajı ya da e-posta (ticari elektronik ileti) gönderilmemektedir ve bunun
            için onay toplanmamaktadır. İleride gönderilmesi halinde, 6563 sayılı Kanun uyarınca önceden, ayrı ve isteğe bağlı onayınız
            alınacak ve İleti Yönetim Sistemi&apos;ne (İYS) kaydedilecektir. Hesap güvenliği e-postaları ile kendi açtığınız ilan ve mesaj
            bildirimleri ticari ileti değildir. Bekleme listesine katıldığınız plan için ödeme açıldığında yalnızca site ve uygulama
            içinde bildirim gösterilir.
          </p>
        </section>

        <section>
          <h2 className="font-sans text-base font-semibold text-primary">5. Haklarınız (KVKK m.11)</h2>
          <p>Veri sorumlusuna başvurarak:</p>
          <ul className="list-disc pl-5">
            <li>kişisel verilerinizin işlenip işlenmediğini öğrenme, işlenmişse buna ilişkin bilgi talep etme,</li>
            <li>işlenme amacını ve amacına uygun kullanılıp kullanılmadığını öğrenme,</li>
            <li>yurt içinde veya yurt dışında aktarıldığı üçüncü kişileri bilme,</li>
            <li>eksik veya yanlış işlenmişse düzeltilmesini isteme,</li>
            <li>KVKK m.7&apos;deki şartlar çerçevesinde silinmesini veya yok edilmesini isteme,</li>
            <li>düzeltme ve silme işlemlerinin, verilerin aktarıldığı üçüncü kişilere bildirilmesini isteme,</li>
            <li>münhasıran otomatik sistemlerle analiz edilmesi sonucu aleyhinize bir sonuç çıkmasına itiraz etme,</li>
            <li>kanuna aykırı işleme nedeniyle zarara uğramanız halinde zararın giderilmesini talep etme</li>
          </ul>
          <p>
            haklarına sahipsiniz. Taleplerinizi, sistemimizde kayıtlı e-posta adresinizden{" "}
            <a href={`mailto:${ILETISIM_EPOSTA}`} className="text-primary underline">
              {ILETISIM_EPOSTA}
            </a>{" "}
            adresine göndererek ya da ıslak imzalı dilekçeyle {ILETISIM_ADRES} adresine posta yoluyla iletebilirsiniz. Başvurunuz en geç 30 gün içinde ücretsiz olarak sonuçlandırılır. Verilerinizin
            bir kopyasını{" "}
            <Link href="/profilim/ayarlar/gizlilik" className="text-primary underline">
              Ayarlar &gt; Gizlilik ve KVKK
            </Link>{" "}
            sayfasından indirebilir, hesabınızı aynı sayfadan silebilirsiniz.
          </p>
        </section>

        <section>
          <h2 className="font-sans text-base font-semibold text-primary">6. Veri Güvenliği</h2>
          <p>
            Şifreler tersine çevrilemeyecek şekilde (hash&apos;lenerek) saklanır; site yöneticileri dahil kimse şifrenizi
            göremez. Tüm bağlantılar şifrelidir (TLS), yönetici paneline iki aşamalı doğrulamayla girilir ve verilere yalnızca
            işin gerektirdiği ölçüde erişilir.
          </p>
        </section>

        <section>
          <h2 className="font-sans text-base font-semibold text-primary">7. Çerezler</h2>
          <p>
            Hangi çerezleri kullandığımız ve onay tercihinizi nasıl değiştirebileceğiniz{" "}
            <Link href="/cerez-politikasi" className="text-primary underline">
              Çerez Politikası
            </Link>
            &apos;nda yer alır. Sitenin kullanım kuralları için{" "}
            <Link href="/kullanim-kosullari" className="text-primary underline">
              Kullanım Koşulları
            </Link>
            &apos;na bakınız.
          </p>
        </section>

        <p className="text-xs text-muted-foreground">Son güncelleme: 20 Ekim 2026.</p>
      </div>
    </div>
  );
}

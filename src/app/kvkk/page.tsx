import Link from "next/link";

export const metadata = {
  title: "KVKK Aydınlatma Metni ve Gizlilik Politikası — Kamu Yolu",
};

export default function KvkkPage() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-14 sm:px-6 sm:py-20">
      <h1 className="font-sans text-2xl font-bold tracking-tight text-primary sm:text-3xl">
        KVKK Aydınlatma Metni ve Gizlilik Politikası
      </h1>

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
            <li>Şifreniz geri döndürülemeyecek şekilde (hash&apos;lenerek) saklanır; site yöneticileri dahil kimse şifrenizi görüntüleyemez</li>
          </ul>
        </section>

        <section>
          <h2 className="font-sans text-base font-semibold text-primary">3. İşleme Amaçları</h2>
          <ul className="list-disc pl-5">
            <li>Üyelik oluşturma, oturum açma ve hesabınızı güvenli şekilde yönetme</li>
            <li>Becayiş taleplerinin yayınlanması ve kullanıcılar arası mesajlaşmanın sağlanması</li>
            <li>Mezun olduğunuz bölüme/öğrenim düzeyinize uygun yeni ilan çıktığında size bildirim gönderme</li>
            <li>Sitenin hatalarını tespit etme, kötüye kullanımı önleme</li>
          </ul>
        </section>

        <section>
          <h2 className="font-sans text-base font-semibold text-primary">4. Verilerin Paylaşımı</h2>
          <p>
            Becayiş modülünde iletişim bilgileriniz (e-posta, telefon) diğer kullanıcılara
            <strong> hiçbir zaman doğrudan gösterilmez</strong>; ilgilenen kullanıcılar size yalnızca
            site içi mesaj kutusu üzerinden ulaşabilir. Kişisel verileriniz, yasal zorunluluklar
            dışında üçüncü taraflarla paylaşılmaz veya satılmaz. Veriler, sitenin barındığı veritabanı
            altyapısında (bulut sunucu sağlayıcısı) saklanır.
          </p>
        </section>

        <section>
          <h2 className="font-sans text-base font-semibold text-primary">5. Haklarınız</h2>
          <p>
            KVKK&apos;nın 11. maddesi uyarınca; verilerinizin işlenip işlenmediğini öğrenme, işlenmişse
            buna ilişkin bilgi talep etme, işlenme amacını öğrenme, yurt içinde/dışında aktarıldığı
            üçüncü kişileri bilme, eksik/yanlış işlenmişse düzeltilmesini isteme, silinmesini/yok
            edilmesini talep etme haklarına sahipsiniz. Bu haklarınızı kullanmak için site üzerindeki
            iletişim imkanlarından bize ulaşabilirsiniz.
          </p>
        </section>

        <section>
          <h2 className="font-sans text-base font-semibold text-primary">6. Veri Güvenliği</h2>
          <p>
            Kişisel verileriniz, yetkisiz erişime, kayba veya kötüye kullanıma karşı makul teknik
            ve idari tedbirlerle korunur: şifreniz tersine çevrilemeyecek şekilde (hash&apos;lenerek)
            saklanır, veritabanı bağlantıları şifrelenir (SSL/TLS) ve sadece işin gerektirdiği
            kişilerin erişebileceği şekilde yetkilendirme uygulanır.
          </p>
        </section>

        <section>
          <h2 className="font-sans text-base font-semibold text-primary">7. Çerezler</h2>
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

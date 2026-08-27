export const metadata = {
  title: "KVKK Aydınlatma Metni ve Kullanım Şartları — Kamu Yolu",
};

export default function KvkkPage() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-14 sm:px-6 sm:py-20">
      <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
        KVKK Aydınlatma Metni ve Kullanım Şartları
      </h1>

      <div className="prose prose-slate mt-6 max-w-none space-y-5 text-sm leading-relaxed text-slate-700">
        <section>
          <h2 className="text-base font-semibold text-slate-900">1. Veri Sorumlusu</h2>
          <p>
            Kamu Yolu (&quot;Site&quot;), 6698 sayılı Kişisel Verilerin Korunması Kanunu
            (&quot;KVKK&quot;) kapsamında, üyelik sırasında ve site kullanımı süresince elde
            edilen kişisel verilerinizi işbu metinde açıklanan amaç ve kapsamda işler.
          </p>
        </section>

        <section>
          <h2 className="text-base font-semibold text-slate-900">2. İşlenen Kişisel Veriler</h2>
          <ul className="list-disc pl-5">
            <li>Kimlik ve iletişim bilgileri: ad soyad, e-posta, (varsa) telefon numarası</li>
            <li>Mesleki bilgiler: meslek/unvan, çalışılan kurum türü, mezun olunan bölüm ve öğrenim düzeyi</li>
            <li>Becayiş modülü kapsamında oluşturduğunuz talep içeriği ve gönderdiğiniz/aldığınız mesajlar</li>
            <li>Şifreniz geri döndürülemeyecek şekilde (hash&apos;lenerek) saklanır; site yöneticileri dahil kimse şifrenizi görüntüleyemez</li>
          </ul>
        </section>

        <section>
          <h2 className="text-base font-semibold text-slate-900">3. İşleme Amaçları</h2>
          <ul className="list-disc pl-5">
            <li>Üyelik oluşturma, oturum açma ve hesabınızı güvenli şekilde yönetme</li>
            <li>Becayiş taleplerinin yayınlanması ve kullanıcılar arası mesajlaşmanın sağlanması</li>
            <li>Mezun olduğunuz bölüme/öğrenim düzeyinize uygun yeni ilan çıktığında size bildirim gönderme</li>
            <li>Sitenin hatalarını tespit etme, kötüye kullanımı önleme</li>
          </ul>
        </section>

        <section>
          <h2 className="text-base font-semibold text-slate-900">4. Verilerin Paylaşımı</h2>
          <p>
            Becayiş modülünde iletişim bilgileriniz (e-posta, telefon) diğer kullanıcılara
            <strong> hiçbir zaman doğrudan gösterilmez</strong>; ilgilenen kullanıcılar size yalnızca
            site içi mesaj kutusu üzerinden ulaşabilir. Kişisel verileriniz, yasal zorunluluklar
            dışında üçüncü taraflarla paylaşılmaz veya satılmaz. Veriler, sitenin barındığı veritabanı
            altyapısında (bulut sunucu sağlayıcısı) saklanır.
          </p>
        </section>

        <section>
          <h2 className="text-base font-semibold text-slate-900">5. Haklarınız</h2>
          <p>
            KVKK&apos;nın 11. maddesi uyarınca; verilerinizin işlenip işlenmediğini öğrenme, işlenmişse
            buna ilişkin bilgi talep etme, işlenme amacını öğrenme, yurt içinde/dışında aktarıldığı
            üçüncü kişileri bilme, eksik/yanlış işlenmişse düzeltilmesini isteme, silinmesini/yok
            edilmesini talep etme haklarına sahipsiniz. Bu haklarınızı kullanmak için site üzerindeki
            iletişim imkanlarından bize ulaşabilirsiniz.
          </p>
        </section>

        <section>
          <h2 className="text-base font-semibold text-slate-900">6. Kullanım Şartları</h2>
          <ul className="list-disc pl-5">
            <li>Sitede paylaştığınız bilgilerin doğru ve güncel olmasından siz sorumlusunuz.</li>
            <li>Becayiş modülü yalnızca kamu personeli arasında iletişimi kolaylaştırmak amacıyla sunulur; Kamu Yolu, kullanıcılar arasında gerçekleşen becayiş sürecine taraf değildir ve sonucundan sorumlu tutulamaz.</li>
            <li>Sahte, yanıltıcı veya kötüye kullanım amaçlı içerik/ilan paylaşmak yasaktır; bu tür hesaplar bildirim üzerine kaldırılabilir.</li>
            <li>Hesabınızın güvenliğinden (şifrenizi gizli tutmaktan) siz sorumlusunuz.</li>
          </ul>
        </section>

        <p className="text-xs text-muted-foreground">
          Son güncelleme: bu metin genel bilgilendirme amaçlıdır ve site geliştikçe güncellenebilir.
        </p>
      </div>
    </div>
  );
}

export const metadata = {
  title: "Çerez Politikası — Kamu Yolu",
};

export default function CerezPolitikasiPage() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-14 sm:px-6 sm:py-20">
      <h1 className="font-sans text-2xl font-bold tracking-tight text-primary sm:text-3xl">
        Çerez Politikası
      </h1>

      <div className="prose prose-slate mt-6 max-w-none space-y-5 text-sm leading-relaxed text-slate-700">
        <section>
          <h2 className="font-sans text-base font-semibold text-primary">1. Çerez Nedir?</h2>
          <p>
            Çerezler, bir web sitesini ziyaret ettiğinizde tarayıcınıza kaydedilen küçük metin
            dosyalarıdır. Sitenin düzgün çalışmasını sağlamak, tercihlerinizi hatırlamak veya
            kullanım istatistikleri toplamak gibi amaçlarla kullanılabilirler.
          </p>
        </section>

        <section>
          <h2 className="font-sans text-base font-semibold text-primary">2. Şu Anda Kullandığımız Çerezler</h2>
          <p>Kamu Yolu şu anda yalnızca sitenin çalışması için zorunlu olan çerezleri kullanır:</p>
          <ul className="list-disc pl-5">
            <li>
              <strong>Oturum çerezi:</strong> Giriş yaptığınızda kimliğinizi doğrulamak ve
              oturumunuzu açık tutmak için kullanılır. Bu çerez olmadan hesabınıza giriş
              yapamazsınız.
            </li>
          </ul>
          <p className="mt-2">
            Bu zorunlu çerez için KVKK ve ilgili mevzuat uyarınca ayrıca onayınıza gerek
            duyulmaz; sitenin temel işlevi için gereklidir.
          </p>
        </section>

        <section>
          <h2 className="font-sans text-base font-semibold text-primary">3. İleride Eklenebilecek Çerezler</h2>
          <p>
            Sitenin gelişimine bağlı olarak ileride reklam gösterimi, kullanım analitiği veya
            benzer amaçlarla ek çerezler kullanılmaya başlanabilir. Böyle bir değişiklik
            olduğunda bu sayfa güncellenecek ve gerekli görülen durumlarda açık rızanız
            istenecektir.
          </p>
        </section>

        <section>
          <h2 className="font-sans text-base font-semibold text-primary">4. Çerezleri Nasıl Yönetebilirsiniz?</h2>
          <p>
            Tarayıcınızın ayarlarından çerezleri silebilir veya engelleyebilirsiniz. Ancak
            zorunlu oturum çerezini engellerseniz siteye giriş yapamazsınız.
          </p>
        </section>

        <p className="text-xs text-muted-foreground">
          Bu metin, sitenin çerez kullanımı değiştikçe güncellenecektir. Kişisel verilerinizin
          işlenmesi hakkında daha fazla bilgi için{" "}
          <a href="/kvkk" className="font-medium text-primary hover:underline">
            KVKK Aydınlatma Metni
          </a>
          &apos;ni inceleyebilirsiniz.
        </p>
      </div>
    </div>
  );
}

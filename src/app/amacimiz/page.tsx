import Link from "next/link";
import {
  ArrowRight,
  BadgeCheck,
  BarChart3,
  Bell,
  BookOpenCheck,
  Building2,
  CalendarPlus,
  Calculator,
  Check,
  Crown,
  Database,
  Eye,
  FileSearch,
  GraduationCap,
  HandCoins,
  Heart,
  Info,
  Layers,
  ListFilter,
  MessageCircle,
  MousePointerClick,
  Newspaper,
  Radar,
  Repeat,
  Search,
  ShieldCheck,
  Smartphone,
  Sparkles,
  Target,
  UserCheck,
  type LucideIcon,
} from "lucide-react";
import { DENEME_DUZEYLERI } from "@/lib/kpssDenemeSabitler";
import { getHomepageStats } from "@/lib/matching";
import { PLAN_ADI, PLAN_FIYATI, tl } from "@/lib/planlar";
import { SayfaBasligi } from "@/components/SayfaBasligi";
import { BolumBasligi } from "@/components/BolumBasligi";
import { YukseltButonu } from "@/components/YukseltmePenceresi";
import { cn } from "@/lib/utils";

export const revalidate = 300;

export const metadata = {
  title: "Hakkımızda — Kamu Yolu",
  description:
    "Kamu Yolu neden var, nasıl çalışır, verileri nereden alır: bölümüne uygun kamu ilanları, KPSS denemeleri, alım analizi ve becayiş tek yerde.",
};

const sayi = (n: number) => n.toLocaleString("tr-TR");

const ADIMLAR: { ikon: LucideIcon; baslik: string; metin: string }[] = [
  { ikon: Search, baslik: "Bölümünü seç", metin: "Ana sayfadaki arama kutusuna bölümünü yaz ya da lise, önlisans, lisans sayfalarından birini aç." },
  { ikon: Layers, baslik: "Uygun ilanları gör", metin: "Bölümüne özel açılan ilanlarla bölüm şartı aranmayan, öğrenim düzeyine uygun ilanlar tek listede." },
  { ikon: BadgeCheck, baslik: "Uygunluğunu kontrol et", metin: "İlan sayfasında bölümünün o ilan için uygun olup olmadığını, kalan günü ve aranan nitelikleri gör." },
  { ikon: MousePointerClick, baslik: "Kaynağından başvur", metin: "Başvurunu kurumun kendi kanalından yaparsın; biz yalnızca yolu kısaltırız, aracı olmayız." },
];

type Ozellik = { ikon: LucideIcon; baslik: string; metin: string; href: string; pro?: "Pro" | "Pro+" };

// Her grup kendi renginde; kartlar ilgili sayfaya gider.
const GRUPLAR: { ad: string; aciklama: string; renk: { rozet: string; ikon: string; kenar: string; zemin: string }; ozellikler: Ozellik[] }[] = [
  {
    ad: "İlan bulma",
    aciklama: "Sana uygun ilanı saniyeler içinde bul.",
    renk: { rozet: "bg-blue-100 text-blue-700", ikon: "bg-blue-600 text-white", kenar: "hover:border-blue-300", zemin: "from-blue-50" },
    ozellikler: [
      { ikon: Target, baslik: "Bölüme göre eşleştirme", metin: "Yalnızca senin bölümünün başvurabildiği ya da öğrenim düzeyi seninkine denk ve bölüm şartı aranmayan ilanlar ayrı ayrı listelenir.", href: "/" },
      { ikon: BadgeCheck, baslik: "Uygunluk kontrolü", metin: "Giriş yaptıysan ilan sayfası “Bölümün bu ilan için uygun” bilgisini doğrudan gösterir.", href: "/ilanlar" },
      { ikon: ListFilter, baslik: "Filtreler", metin: "Kurum türü, il, ilan türü ve bölüm şartına göre daralt; süresi geçen ilanlar listelenmez.", href: "/ilanlar" },
      { ikon: CalendarPlus, baslik: "Takvime ekle", metin: "Son başvuru tarihini tek tıkla takvimine ekle, bir gün önce hatırlatma al.", href: "/ilanlar" },
    ],
  },
  {
    ad: "KPSS hazırlık",
    aciklama: "Sınava gerçek formatta, her gün hazırlan.",
    renk: { rozet: "bg-violet-100 text-violet-700", ikon: "bg-violet-600 text-white", kenar: "hover:border-violet-300", zemin: "from-violet-50" },
    ozellikler: [
      { ikon: GraduationCap, baslik: "Günlük KPSS denemesi", metin: "Ortaöğretim, önlisans ve lisans için 120 soruluk, ÖSYM konu dağılımına uygun deneme.", href: "/kpss-denemesi" },
      { ikon: FileSearch, baslik: "Konu analizi raporu", metin: "Sınav sonunda ders karnen ve kırmızı, sarı, yeşil konu uyarılarıyla çalışma planın hazır.", href: "/kpss-denemesi", pro: "Pro" },
      { ikon: Calculator, baslik: "KPSS puan hesaplama", metin: "Doğru ve yanlış sayılarını gir, puanını hızlıca hesapla.", href: "/kpss-puan-hesaplama" },
      { ikon: BarChart3, baslik: "Alım analizi", metin: "Yıllara göre kamu istihdamı ve bölümüne KPSS ile kaç kadro açıldığını resmi verilerle gör.", href: "/analiz" },
    ],
  },
  {
    ad: "Takip",
    aciklama: "Önemli gelişmeyi kaçırma.",
    renk: { rozet: "bg-emerald-100 text-emerald-700", ikon: "bg-emerald-600 text-white", kenar: "hover:border-emerald-300", zemin: "from-emerald-50" },
    ozellikler: [
      { ikon: Newspaper, baslik: "Kamu haberleri", metin: "Alım duyuruları ve kamu personelini ilgilendiren haberler, kaynağıyla doğrulanarak yayımlanır.", href: "/haberler" },
      { ikon: Bell, baslik: "Bildirimler", metin: "Bölümüne uygun yeni ilan çıkınca ya da becayiş talebine mesaj gelince haberin olur.", href: "/profilim/ayarlar/bildirimler", pro: "Pro" },
      { ikon: Smartphone, baslik: "SMS ile anlık bildirim", metin: "Yeni ilanı telefonuna gelen SMS ile herkesten önce öğren.", href: "/profilim/ayarlar/bildirimler", pro: "Pro" },
      { ikon: UserCheck, baslik: "Bana özel ilanlar", metin: "Profilindeki bölüm ve öğrenim düzeyine uygun ilanlar tek listede.", href: "/profilim", pro: "Pro" },
    ],
  },
  {
    ad: "Becayiş",
    aciklama: "Yer değiştirmek isteyen kamu çalışanları için.",
    renk: { rozet: "bg-amber-100 text-amber-800", ikon: "bg-amber-500 text-white", kenar: "hover:border-amber-300", zemin: "from-amber-50" },
    ozellikler: [
      { ikon: Repeat, baslik: "Becayiş ilanları", metin: "Meslek ve ile göre yer değiştirme taleplerini incele.", href: "/becayis" },
      { ikon: Sparkles, baslik: "Talep oluştur", metin: "Kendi talebini birkaç adımda yayımla, ilgilenenleri gör.", href: "/becayis/talep-olustur", pro: "Pro" },
      { ikon: Heart, baslik: "İlgilendiklerim", metin: "Yazıştığın talepler ve konuşmaların tek yerde, okunmamış mesajlarla birlikte.", href: "/becayis/ilgilendiklerim" },
      { ikon: MessageCircle, baslik: "Site içi mesajlaşma", metin: "Talep sahibiyle telefon numarası paylaşmadan doğrudan yazış.", href: "/becayis", pro: "Pro" },
    ],
  },
];

const KAYNAKLAR: { ikon: LucideIcon; ad: string; metin: string }[] = [
  { ikon: Building2, ad: "Kariyer Kapısı", metin: "Devletin resmi kamu işe alım platformundaki ilanlar." },
  { ikon: Newspaper, ad: "Memurlar.net", metin: "Kurumların yayımladığı alım duyurularının derlendiği ilan sayfaları." },
  { ikon: BarChart3, ad: "Strateji ve Bütçe Başkanlığı", metin: "Alım Analizi'ndeki Türkiye geneli kamu istihdam istatistikleri." },
  { ikon: GraduationCap, ad: "ÖSYM KPSS tercih kılavuzları", metin: "Bölümlere göre yıllık KPSS kadro sayıları ve puan aralıkları." },
];

const ILKELER: { ikon: LucideIcon; baslik: string; metin: string }[] = [
  { ikon: HandCoins, baslik: "Temel kullanım ücretsiz", metin: "İlan arama, filtreler, haberler ve haftalık deneme her zaman ücretsiz." },
  { ikon: Eye, baslik: "Aracı değiliz", metin: "Başvuru almayız, başvuru için ücret istemeyiz; her ilanda kaynağına giden bağlantı vardır." },
  { ikon: Database, baslik: "Gerçek veri", metin: "Sayılar ve grafikler resmi kaynaklardan gelir, tahmin ya da uydurma rakam yok." },
  { ikon: ShieldCheck, baslik: "Gizliliğe saygı", metin: "Verilerin KVKK kapsamında işlenir; dilediğinde indirip hesabını silebilirsin." },
];

export default async function AmacimizPage() {
  const stats = await getHomepageStats();

  const canliSayilar: { deger: number; etiket: string; ikon: LucideIcon; yaklasik?: boolean }[] = [
    { deger: stats.postingCount, etiket: "aktif kamu ilanı", ikon: Radar },
    { deger: stats.institutionCount, etiket: "farklı kurum", ikon: Building2 },
    { deger: stats.departmentCount, etiket: "tanımlı bölüm", ikon: BookOpenCheck },
    // Her duzeyin her gun bir denemesi var: yilda duzey sayisi x 365.
    { deger: DENEME_DUZEYLERI.length * 365, etiket: "yılda KPSS denemesi", ikon: GraduationCap, yaklasik: true },
  ];

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <SayfaBasligi
        ikon={Info}
        breadcrumb={[{ ad: "Ana Sayfa", href: "/" }, { ad: "Hakkımızda" }]}
        baslik="Hakkımızda"
        aciklama="Kamu Yolu, kamuda çalışmak isteyenlerin ilan, sınav ve kariyer yolculuğunu tek yerde toplayan bağımsız bir platformdur."
        cipler={[
          { etiket: `${sayi(stats.postingCount)} aktif ilan` },
          { etiket: `${sayi(stats.institutionCount)} kurum` },
          { etiket: "Günde 4 kez güncellenir", durum: "vurgu" },
        ]}
      />

      {/* Neden varız */}
      <section className="mt-12 grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] lg:items-center">
        <div>
          <p className="text-xs font-bold tracking-widest text-primary uppercase">Neden varız</p>
          <h2 className="mt-2 font-sans text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
            Kamu ilanları dağınık. <span className="text-primary">Biz topluyoruz.</span>
          </h2>
          <div className="mt-5 space-y-4 text-base leading-relaxed text-slate-600">
            <p>
              Her kurum ilanını kendi kanalında duyuruyor. Hangi ilanın senin bölümüne uygun olduğunu anlamak için uzun nitelik
              metinlerini tek tek okumak, son başvuru tarihlerini akılda tutmak gerekiyor.
            </p>
            <p>
              Kamu Yolu&apos;nu bu yükü almak için kurduk: ilanları düzenli olarak toplar, bölümüne göre eşleştirir, süresi dolanları
              kaldırırız. Yanına KPSS denemeleri, alım analizi ve becayiş gibi kamu kariyerinin her adımına eşlik eden araçları ekledik.
            </p>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          {canliSayilar.map(({ deger, etiket, ikon: Ikon, yaklasik }, i) => (
            <div
              key={etiket}
              className={cn(
                "relative overflow-hidden rounded-3xl border border-primary/10 bg-white p-6 shadow-sm",
                i === 0 && "bg-gradient-to-br from-primary to-indigo-600 text-white",
              )}
            >
              <Ikon className={cn("h-6 w-6", i === 0 ? "text-white/80" : "text-primary")} />
              <p className={cn("mt-4 font-sans text-4xl font-bold tracking-tight tabular-nums", i !== 0 && "text-slate-900")}>
                {yaklasik && "~"}
                {sayi(deger)}
              </p>
              <p className={cn("mt-1 text-sm font-medium", i === 0 ? "text-white/85" : "text-muted-foreground")}>{etiket}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Nasil calisir */}
      <section className="mt-20">
        <BolumBasligi baslik="Nasıl çalışır?" aciklama="Bölümünü söyle, gerisini biz düzenleyelim." />
        <ol className="relative mt-8 grid gap-6 md:grid-cols-4">
          <span aria-hidden className="absolute top-7 right-[12%] left-[12%] hidden h-0.5 bg-gradient-to-r from-primary/40 via-primary/20 to-primary/40 md:block" />
          {ADIMLAR.map(({ ikon: Ikon, baslik, metin }, i) => (
            <li key={baslik} className="relative flex gap-4 md:flex-col md:items-center md:text-center">
              <span className="relative flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-white text-primary shadow-md ring-1 ring-primary/15">
                <Ikon className="h-6 w-6" />
                <span className="absolute -top-2 -right-2 flex h-6 w-6 items-center justify-center rounded-full bg-primary text-xs font-bold text-white">
                  {i + 1}
                </span>
              </span>
              <span>
                <span className="block font-semibold text-slate-900 md:mt-4">{baslik}</span>
                <span className="mt-1 block text-sm text-slate-600">{metin}</span>
              </span>
            </li>
          ))}
        </ol>
      </section>

      {/* Ozellikler */}
      <section className="mt-20">
        <BolumBasligi baslik="Sitede neler var?" aciklama="Dört başlıkta, kamu kariyerinin her adımı için araçlar. Kartlara tıklayıp hemen deneyebilirsin." />
        <div className="mt-8 grid gap-6 lg:grid-cols-2">
          {GRUPLAR.map((g) => (
            <div key={g.ad} className={cn("rounded-3xl border border-primary/10 bg-gradient-to-br to-white p-6 shadow-sm", g.renk.zemin)}>
              <div className="flex items-baseline justify-between gap-3">
                <h3 className="font-sans text-xl font-bold text-slate-900">{g.ad}</h3>
                <span className={cn("rounded-full px-2.5 py-0.5 text-xs font-semibold", g.renk.rozet)}>{g.ozellikler.length} özellik</span>
              </div>
              <p className="mt-1 text-sm text-slate-600">{g.aciklama}</p>
              <ul className="mt-5 grid gap-3 sm:grid-cols-2">
                {g.ozellikler.map(({ ikon: Ikon, baslik, metin, href, pro }) => (
                  <li key={baslik}>
                    <Link
                      href={href}
                      className={cn(
                        "group flex h-full flex-col rounded-2xl border border-white bg-white/90 p-4 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md",
                        g.renk.kenar,
                      )}
                    >
                      <span className="flex items-center justify-between">
                        <span className={cn("flex h-9 w-9 items-center justify-center rounded-xl", g.renk.ikon)}>
                          <Ikon className="h-4.5 w-4.5" />
                        </span>
                        {pro && (
                          <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2 py-0.5 text-[11px] font-bold text-amber-700">
                            <Crown className="h-3 w-3" />
                            {pro}
                          </span>
                        )}
                      </span>
                      <span className="mt-3 font-semibold text-slate-900">{baslik}</span>
                      <span className="mt-1 text-sm text-slate-600">{metin}</span>
                      <span className="mt-auto flex items-center gap-1 pt-3 text-xs font-semibold text-primary opacity-0 transition-opacity group-hover:opacity-100">
                        İncele <ArrowRight className="h-3.5 w-3.5" />
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      {/* Veriler nereden geliyor */}
      <section className="mt-20 overflow-hidden rounded-3xl border border-primary/10 bg-white shadow-sm">
        <div className="grid lg:grid-cols-[minmax(0,2fr)_minmax(0,3fr)]">
          <div className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-slate-800 to-primary p-8 text-white">
            <div aria-hidden className="absolute inset-0 opacity-15 [background-image:radial-gradient(circle,white_1px,transparent_1.5px)] [background-size:18px_18px]" />
            <div className="relative">
              <Radar className="h-8 w-8 text-sky-300" />
              <h2 className="mt-4 font-sans text-2xl font-bold tracking-tight">Veriler nereden geliyor?</h2>
              <p className="mt-3 text-sm leading-relaxed text-white/80">
                İlanları her gün saat 09.00, 12.00, 15.00 ve 18.00&apos;de otomatik olarak tarıyoruz. Yeni ilanlar eklenir, süresi geçenler
                listeden kalkar.
              </p>
              <p className="mt-3 text-sm leading-relaxed text-white/80">
                Haberler yapay zekâ ile araştırılır ve yayımlanmadan önce kaynak sayfasındaki metinle karşılaştırılarak doğrulanır.
              </p>
            </div>
          </div>
          <ul className="grid gap-px bg-slate-100 sm:grid-cols-2">
            {KAYNAKLAR.map(({ ikon: Ikon, ad, metin }) => (
              <li key={ad} className="flex gap-3 bg-white p-6">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <Ikon className="h-5 w-5" />
                </span>
                <span>
                  <span className="block font-semibold text-slate-900">{ad}</span>
                  <span className="mt-0.5 block text-sm text-slate-600">{metin}</span>
                </span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Planlar */}
      <section className="mt-20">
        <BolumBasligi baslik="Planlar" aciklama="Temel kullanım ücretsiz; daha fazlasını isteyenler için Pro ve Pro+." />
        <div className="mt-8 grid gap-4 md:grid-cols-3">
          {[
            { ad: PLAN_ADI.UCRETSIZ, fiyat: "Ücretsiz", maddeler: ["Tüm ilanlar, filtreler ve haberler", "Haftada toplam 1 KPSS denemesi", "Becayiş ilanlarını görüntüleme"], vurgu: false },
            {
              ad: PLAN_ADI.PRO,
              fiyat: `${tl(PLAN_FIYATI.PRO.aylik)} / ay`,
              maddeler: [
                "Haftada toplam 3 deneme ve sınav sonu rapor",
                "Kişisel bildirimler ve SMS ile anlık ilan bildirimi",
                "Becayiş talebi oluşturma ve mesajlaşma",
                "Bana özel ilanlar",
              ],
              vurgu: false,
            },
            {
              ad: PLAN_ADI.PRO_PLUS,
              fiyat: `${tl(PLAN_FIYATI.PRO_PLUS.aylik)} / ay`,
              maddeler: ["Sınırsız deneme ve konu gelişim takibi", "Reklamsız deneyim", "Öncelikli destek"],
              vurgu: true,
            },
          ].map((p) => (
            <div
              key={p.ad}
              className={cn(
                "rounded-3xl border bg-white p-6 shadow-sm",
                p.vurgu ? "border-violet-300 shadow-violet-500/10 ring-1 ring-violet-200" : "border-primary/10",
              )}
            >
              <p className="flex items-center gap-2 font-sans text-lg font-bold text-slate-900">
                {p.ad}
                {p.vurgu && <Crown className="h-4 w-4 text-amber-500" />}
              </p>
              <p className="mt-1 text-2xl font-bold text-slate-900">{p.fiyat}</p>
              <ul className="mt-4 space-y-2">
                {p.maddeler.map((m) => (
                  <li key={m} className="flex gap-2 text-sm text-slate-700">
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                    {m}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="mt-5 flex justify-center">
          <YukseltButonu className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-violet-600 to-fuchsia-600 px-6 py-3 text-sm font-bold text-white shadow-lg shadow-violet-600/25 transition-transform hover:scale-[1.02]">
            <Crown className="h-4 w-4" />
            Planları karşılaştır
          </YukseltButonu>
        </div>
      </section>

      {/* Ilkeler */}
      <section className="mt-20">
        <BolumBasligi baslik="İlkelerimiz" />
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {ILKELER.map(({ ikon: Ikon, baslik, metin }) => (
            <div key={baslik} className="rounded-3xl border border-primary/10 bg-white p-6 shadow-sm">
              <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                <Ikon className="h-5 w-5" />
              </span>
              <p className="mt-4 font-semibold text-slate-900">{baslik}</p>
              <p className="mt-1 text-sm text-slate-600">{metin}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Kapanis */}
      <section className="relative mt-20 overflow-hidden rounded-3xl bg-gradient-to-br from-primary via-indigo-600 to-blue-500 px-6 py-12 text-center text-white sm:px-12">
        <div aria-hidden className="absolute inset-0 opacity-20 [background-image:radial-gradient(circle,white_1px,transparent_1.5px)] [background-size:18px_18px]" />
        <div className="relative">
          <h2 className="font-sans text-3xl font-bold tracking-tight">Bölümünü seç, sana uygun ilanları gör.</h2>
          <p className="mx-auto mt-3 max-w-xl text-white/85">Şu an {sayi(stats.postingCount)} aktif kamu ilanı seni bekliyor. Kayıt olmadan da arayabilirsin.</p>
          <Link
            href="/"
            className="mt-6 inline-flex items-center gap-2 rounded-full bg-white px-6 py-3 text-sm font-bold text-primary shadow-lg transition-transform hover:scale-[1.02]"
          >
            <Search className="h-4 w-4" />
            Bölümüne göre ara
          </Link>
        </div>
      </section>
    </div>
  );
}

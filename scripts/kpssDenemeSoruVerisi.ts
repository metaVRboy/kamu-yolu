/**
 * KPSS deneme sinavi soru havuzu - Lisans duzeyi, ilk parti.
 * Her soru AI tarafindan ozgun olarak yazildi (gercek OSYM sorusu degildir).
 * secenekler: 5 sik (A-E sirayla), dogruCevap: 0-4 index.
 *
 * Turkce (30) ve Matematik (30) alt konu dagilimi, ÖSYM'nin resmi KPSS
 * Genel Yetenek konu dagilimina uygun hazirlandi:
 *  - Turkce: Paragraf 15, Sozel Mantik 4, Sozcukte Anlam 1, Cumlede Anlam 2,
 *    Sozcuk Turleri 1, Sozcukte Yapi 2, Cumlenin Ogeleri 1, Ses Bilgisi 1,
 *    Yazim Kurallari 1, Noktalama 1, Anlatim Bozuklugu 1 (toplam 30)
 *  - Matematik: Temel Kavramlar 2, Rasyonel Sayilar 2, Basit Esitsizlikler 1,
 *    Mutlak Deger 1, Uslu Sayilar 2, Koklu Sayilar 1, Carpanlara Ayirma 1,
 *    Oran-Oranti 1, Denklem Cozme 1, Problemler 6, Kumeler 1, Fonksiyonlar 1,
 *    Moduler Aritmetik 1, Permutasyon-Kombinasyon 1, Olasilik 1,
 *    Sayisal Mantik 3, Geometri 4 (toplam 30)
 */
export type SeedSoru = {
  ders: "TURKCE" | "MATEMATIK" | "TARIH" | "COGRAFYA" | "VATANDASLIK" | "GUNCEL";
  soruMetni: string;
  secenekler: [string, string, string, string, string];
  dogruCevap: number;
  aciklama: string;
};

export const LISANS_SORULARI: SeedSoru[] = [
  // ---- TÜRKÇE (30) ----

  // -- Paragraf (15) --
  {
    ders: "TURKCE",
    soruMetni:
      'Son yıllarda yapılan araştırmalar, düzenli uyku alışkanlığının yalnızca fiziksel sağlığı değil, zihinsel performansı da doğrudan etkilediğini ortaya koyuyor. Yeterince uyumayan bireylerde dikkat dağınıklığı, unutkanlık ve karar verme güçlüğü gibi sorunların daha sık görüldüğü belirlenmiş. Uzmanlar, günde yedi ile dokuz saat arasında kaliteli uyku almanın öğrenme kapasitesini artırdığını ve stres düzeyini düşürdüğünü vurguluyor. Bu nedenle başarılı bir gün geçirmek isteyenlerin önceliği, uyku düzenini sağlamak olmalıdır.\n\nBu parçanın ana düşüncesi aşağıdakilerden hangisidir?',
    secenekler: [
      "Stresin azaltılması için düzenli spor yapılmalıdır.",
      "Kaliteli ve yeterli uyku, zihinsel performansı olumlu etkiler.",
      "Unutkanlık yalnızca ileri yaşlarda görülen bir sorundur.",
      "Bilimsel araştırmalar her zaman güvenilir sonuçlar vermez.",
      "Günde dokuz saatten fazla uyumak zararlıdır.",
    ],
    dogruCevap: 1,
    aciklama: "Parça boyunca uykunun zihinsel performansla ilişkisi anlatılır; sonuç cümlesi de bunu doğrudan vurgular.",
  },
  {
    ders: "TURKCE",
    soruMetni:
      "Bal arıları, bir kovanda karmaşık bir iş bölümü içinde yaşar. İşçi arılar yiyecek toplama, kovanı temizleme ve larvaları besleme gibi görevleri üstlenirken, erkek arılar yalnızca kraliçeyle çiftleşmek amacıyla var olur. Kraliçe arı ise kovanın tek üreyen bireyi olarak günde binlerce yumurta bırakabilir. Bu düzenli iş bölümü sayesinde koloni, mevsimler boyunca varlığını sürdürebilir.\n\nBu parçadan aşağıdakilerin hangisi çıkarılamaz?",
    secenekler: [
      "İşçi arılar birden fazla görevi yerine getirir.",
      "Kraliçe arı kovandaki tek üreyen bireydir.",
      "Erkek arılar kovanın temizliğinden de sorumludur.",
      "Arı kolonisinde belirgin bir iş bölümü vardır.",
      "Kraliçe arı günde çok sayıda yumurta bırakabilir.",
    ],
    dogruCevap: 2,
    aciklama: "Parçaya göre erkek arılar yalnızca çiftleşme amacıyla vardır; temizlik işçi arılara aittir, bu yüzden C çıkarılamaz.",
  },
  {
    ders: "TURKCE",
    soruMetni:
      "Geri dönüşüm, atık malzemelerin yeniden işlenerek üretim sürecine kazandırılmasıdır. Cam, plastik, kâğıt ve metal gibi malzemelerin geri dönüştürülmesi hem doğal kaynakların tüketimini azaltır hem de enerji tasarrufu sağlar. Örneğin geri dönüştürülmüş bir alüminyum kutu, yeni bir kutu üretmek için gereken enerjinin yalnızca yüzde beşini kullanır. Bu da geri dönüşümün çevresel sürdürülebilirlik açısından ne kadar önemli olduğunu gösterir.\n\nBu parçaya en uygun başlık aşağıdakilerden hangisi olabilir?",
    secenekler: [
      "Alüminyumun Keşfi",
      "Geri Dönüşümün Önemi ve Faydaları",
      "Enerji Üretiminde Yeni Yöntemler",
      "Doğal Kaynakların Tükenme Riski",
      "Plastik Kullanımının Zararları",
    ],
    dogruCevap: 1,
    aciklama: "Parça baştan sona geri dönüşümün çevresel ve ekonomik faydalarını anlatır; en kapsayıcı başlık budur.",
  },
  {
    ders: "TURKCE",
    soruMetni:
      "Kitap okumak, bireyin hayal gücünü geliştirirken aynı zamanda kelime dağarcığını da zenginleştirir. Düzenli olarak kitap okuyan kişiler, karşılaştıkları yeni kavramları daha kolay anlamlandırabilir ve farklı bakış açıları kazanabilir. ----. Bu nedenle çocuklara küçük yaşlardan itibaren okuma alışkanlığı kazandırmak büyük önem taşır.\n\nBu parçada boş bırakılan yere aşağıdakilerden hangisi getirilmelidir?",
    secenekler: [
      "Televizyon izlemek de benzer faydalar sağlar.",
      "Üstelik okuma, başkalarını anlama (empati) becerisini de destekler.",
      "Oysa çoğu insan okumaktan hoşlanmaz.",
      "Fakat kitaplar oldukça pahalıdır.",
      "Ancak okumanın hiçbir zararı yoktur.",
    ],
    dogruCevap: 1,
    aciklama: "Boşluktan sonraki 'bu nedenle' bağlacı, okumanın faydalarının sıralanmaya devam ettiğini gösterir; B bu akışa uyar.",
  },
  {
    ders: "TURKCE",
    soruMetni:
      "Şehirlerde yeşil alanların azalması yalnızca hava kalitesini düşürmekle kalmıyor, aynı zamanda insanların ruh sağlığını da olumsuz etkiliyor. Parklarda vakit geçiren bireylerin stres düzeylerinin daha düşük olduğu, doğayla iç içe yaşayan toplumlarda depresyon oranlarının azaldığı pek çok çalışmada gösterilmiştir. Bu nedenle kentsel planlama yapılırken yeşil alanlara ayrılan payın artırılması, toplum sağlığı açısından stratejik bir öncelik olmalıdır.\n\nBu parçanın ana düşüncesi aşağıdakilerden hangisidir?",
    secenekler: [
      "Kentsel planlama yalnızca ekonomik kaygılarla yapılmalıdır.",
      "Yeşil alanlar toplum sağlığı için önemli olduğundan kentsel planlamada öncelik verilmelidir.",
      "Parklarda vakit geçirmek zaman kaybıdır.",
      "Depresyon yalnızca büyükşehirlerde görülen bir sorundur.",
      "Hava kalitesi insan sağlığını etkilemez.",
    ],
    dogruCevap: 1,
    aciklama: "Parça, yeşil alanların ruh sağlığına etkisinden yola çıkarak kentsel planlamada öncelik verilmesi gerektiği sonucuna ulaşır.",
  },
  {
    ders: "TURKCE",
    soruMetni:
      "Güneş enerjisi, yenilenebilir enerji kaynakları arasında en hızlı büyüyen alanlardan biridir. Güneş panellerinin maliyetinin son on yılda önemli ölçüde düşmesi, bu teknolojinin daha geniş kitlelere ulaşmasını sağlamıştır. Ayrıca güneş enerjisi, fosil yakıtların aksine sera gazı salımına neden olmadığından iklim değişikliğiyle mücadelede önemli bir rol üstlenmektedir. Ancak güneş panellerinin üretimi sırasında da bir miktar çevresel etki oluştuğu unutulmamalıdır.\n\nBu parçaya göre aşağıdakilerden hangisi söylenemez?",
    secenekler: [
      "Güneş panellerinin maliyeti zamanla azalmıştır.",
      "Güneş enerjisi iklim değişikliğiyle mücadelede rol oynar.",
      "Güneş panellerinin üretiminin hiçbir çevresel etkisi yoktur.",
      "Güneş enerjisi yenilenebilir bir kaynaktır.",
      "Fosil yakıtlar sera gazı salımına neden olur.",
    ],
    dogruCevap: 2,
    aciklama: "Parça, panel üretiminin bir miktar çevresel etkisi olduğunu açıkça belirtir; bu yüzden 'hiçbir etkisi yok' yargısı söylenemez.",
  },
  {
    ders: "TURKCE",
    soruMetni:
      "İnsan beyni yaklaşık 86 milyar nöron içerir ve bu nöronlar birbirleriyle trilyonlarca bağlantı kurar. Bu karmaşık ağ bir şehrin elektrik şebekesine benzetilebilir; nasıl ki şehirdeki her ev farklı hatlarla ana güç kaynağına bağlıysa beyindeki her nöron da sinapslar aracılığıyla diğer nöronlara bağlanarak bilgi akışını sağlar.\n\nBu parçada düşünceyi geliştirme yollarından öncelikle hangisine başvurulmuştur?",
    secenekler: ["Örnekleme", "Tanık gösterme", "Benzetme", "Karşıtlıklardan yararlanma", "Tanımlama"],
    dogruCevap: 2,
    aciklama: "Beynin şehir elektrik şebekesine benzetilmesi, açık bir benzetme (analoji) örneğidir.",
  },
  {
    ders: "TURKCE",
    soruMetni:
      "Yapay zekâ teknolojilerinin günlük hayata entegrasyonu hızla artıyor. Akıllı asistanlardan öneri sistemlerine kadar pek çok alanda karşımıza çıkan bu teknolojiler hayatımızı kolaylaştırırken bazı etik soruları da beraberinde getiriyor. Verilerimizin nasıl kullanıldığı, kararların ne ölçüde şeffaf olduğu gibi konular, teknolojinin gelişimi kadar tartışılması gereken başlıklar arasında yer almalı.\n\nYazarın bu parçadaki temel amacı aşağıdakilerden hangisidir?",
    secenekler: [
      "Yapay zekâ teknolojisinin tamamen durdurulması gerektiğini savunmak.",
      "Yapay zekânın faydalarının yanı sıra etik tartışmaların önemine dikkat çekmek.",
      "Akıllı asistanların teknik çalışma prensibini açıklamak.",
      "Veri güvenliği yasalarının tarihsel gelişimini anlatmak.",
      "Yapay zekânın hiçbir riski olmadığını kanıtlamak.",
    ],
    dogruCevap: 1,
    aciklama: "Yazar, yapay zekânın kolaylıklarını kabul etmekle birlikte etik tartışmaların da önemsenmesi gerektiğini vurgular.",
  },
  {
    ders: "TURKCE",
    soruMetni:
      "Deniz kaplumbağaları, yumurtlamak için doğdukları kumsala geri dönme eğilimindedir. Bilim insanları bu davranışın Dünya'nın manyetik alanını algılama yetenekleriyle ilişkili olduğunu düşünüyor. Yavru kaplumbağalar denize ulaştıktan sonra yıllarca açık okyanuslarda dolaşır, ancak üreme zamanı geldiğinde şaşırtıcı bir doğrulukla aynı kumsala dönerler.\n\nBu parça öncelikle hangi konu üzerinde durmaktadır?",
    secenekler: [
      "Kaplumbağaların beslenme alışkanlıkları",
      "Deniz kaplumbağalarının doğum kumsalına dönme davranışı",
      "Okyanuslardaki kirlilik sorunu",
      "Kaplumbağa türlerinin sınıflandırılması",
      "Dünya'nın manyetik alanının oluşumu",
    ],
    dogruCevap: 1,
    aciklama: "Parçanın tamamı, deniz kaplumbağalarının doğdukları kumsala geri dönme davranışı etrafında kurulmuştur.",
  },
  {
    ders: "TURKCE",
    soruMetni:
      "Bir şirketin uzun vadeli başarısı yalnızca sunduğu ürünün kalitesiyle değil, çalışanlarının motivasyonuyla da yakından ilişkilidir. Motivasyonu yüksek çalışanlar daha yaratıcı çözümler üretir ve değişen koşullara daha hızlı uyum sağlar. Bu nedenle yöneticilerin yalnızca finansal hedeflere değil, çalışan memnuniyetine de yatırım yapması gerekir.\n\nBu parçadan hareketle aşağıdakilerden hangisi söylenebilir?",
    secenekler: [
      "Ürün kalitesi şirket başarısında hiçbir rol oynamaz.",
      "Çalışan memnuniyeti, şirket başarısını etkileyen unsurlardan biridir.",
      "Finansal hedefler artık önemini tamamen yitirmiştir.",
      "Yaratıcı çözümler yalnızca yöneticilerden gelir.",
      "Motivasyon yalnızca maaş artışıyla sağlanabilir.",
    ],
    dogruCevap: 1,
    aciklama: "Parça, motivasyonun ve çalışan memnuniyetinin şirket başarısındaki rolünü vurgular; bu doğrudan B seçeneğini destekler.",
  },
  {
    ders: "TURKCE",
    soruMetni:
      "----. Bu yüzden bir dili öğrenmenin en etkili yollarından biri, o dilin konuşulduğu ortamda zaman geçirmektir. Günlük hayatta dili aktif olarak kullanmak, sözcükleri yalnızca ezberlemekten çok daha kalıcı bir öğrenme sağlar.\n\nBu parçanın başına aşağıdakilerden hangisi getirilmelidir?",
    secenekler: [
      "Dil öğrenimi yalnızca kitap okuyarak gerçekleşen bir süreçtir.",
      "Dil becerileri, pratik yapıldıkça gelişen ve pekişen bir yetenektir.",
      "Hiç kimse yetişkinlikte yeni bir dil öğrenemez.",
      "Dil öğrenmenin tek yolu sınavlara girmektir.",
      "Anadili öğrenmek, sonradan öğrenilen dillerden tamamen farksızdır.",
    ],
    dogruCevap: 1,
    aciklama: "Parçanın devamında pratik yapmanın önemi anlatılır; başa gelecek cümle bu fikri açan B seçeneğidir.",
  },
  {
    ders: "TURKCE",
    soruMetni:
      "Uzun süre oturarak çalışmak bel ve boyun ağrılarına yol açabileceği gibi dolaşım sistemini de olumsuz etkileyebilir. Uzmanlar, masa başında çalışanların her saat başı birkaç dakika ayağa kalkıp hareket etmelerini öneriyor. Kısa yürüyüşler ya da basit esneme hareketleri bile uzun vadede sağlık sorunlarının önüne geçmede etkili olabiliyor.\n\nBu parçada asıl anlatılmak istenen nedir?",
    secenekler: [
      "Masa başında çalışmak tamamen bırakılmalıdır.",
      "Düzenli kısa hareketler, oturarak çalışmanın olumsuz etkilerini azaltabilir.",
      "Yürüyüş yapmak yalnızca sporcular için faydalıdır.",
      "Boyun ağrıları yalnızca ileri yaşlarda görülür.",
      "Esneme hareketlerinin dolaşım sistemiyle ilgisi yoktur.",
    ],
    dogruCevap: 1,
    aciklama: "Parça, kısa hareketlerin oturarak çalışmanın olumsuz etkilerini azalttığını anlatır.",
  },
  {
    ders: "TURKCE",
    soruMetni:
      "Kahve, dünya genelinde en çok tüketilen içeceklerden biridir ve içerdiği kafein sayesinde uyanıklığı artırır. Ancak aşırı tüketildiğinde uyku düzenini bozabilir, kalp atışını hızlandırabilir ve kaygı düzeyini yükseltebilir. Uzmanlar, günde üç dört fincanı aşmayan ölçülü bir tüketimin çoğu yetişkin için güvenli kabul edildiğini belirtiyor.\n\nBu parçaya göre aşağıdakilerden hangisi yanlıştır?",
    secenekler: [
      "Kahvenin içeriğindeki kafein uyanıklığı artırır.",
      "Aşırı kahve tüketimi uyku düzenini bozabilir.",
      "Ölçülü kahve tüketimi çoğu yetişkin için güvenli kabul edilir.",
      "Kahve tüketiminin hiçbir olumsuz etkisi yoktur.",
      "Aşırı kahve tüketimi kalp atışını hızlandırabilir.",
    ],
    dogruCevap: 3,
    aciklama: "Parça, aşırı tüketimin olumsuz etkilerini açıkça sayar; bu nedenle 'hiçbir olumsuz etkisi yok' yargısı yanlıştır.",
  },
  {
    ders: "TURKCE",
    soruMetni:
      "Ahtapotlar, omurgasızlar arasında en zeki canlılardan biri olarak kabul edilir. Karmaşık problemleri çözebilir, kavanoz kapaklarını açabilir ve hatta bazı deneylerde basit araçlar kullanabildikleri gözlemlenmiştir. Üç kalbi ve mavi kanı olan bu canlılar, renk değiştirme yetenekleriyle de dikkat çeker.\n\nBu parçaya en uygun başlık aşağıdakilerden hangisidir?",
    secenekler: [
      "Denizlerin Kirlenmesi",
      "Ahtapotların Şaşırtıcı Zekâsı ve Özellikleri",
      "Omurgasızların Sınıflandırılması",
      "Renk Değiştiren Bitki Türleri",
      "Deniz Canlılarının Beslenme Şekli",
    ],
    dogruCevap: 1,
    aciklama: "Parça baştan sona ahtapotların zekâsını ve ilginç özelliklerini konu alır.",
  },
  {
    ders: "TURKCE",
    soruMetni:
      "Bir orkestrada onlarca müzisyen aynı anda farklı çalgılar çalar, ancak ortaya uyumlu bir eser çıkar. Bunun sırrı, her müzisyenin kendi payına düşen görevi en iyi şekilde yerine getirirken aynı zamanda şefin yönlendirmesine kulak vermesinde yatar. Bireysel yetenek önemlidir, fakat ortak bir hedefe hizmet eden uyum olmadan başarılı bir performans ortaya çıkmaz.\n\nBu parçadan hareketle aşağıdaki yargılardan hangisine ulaşılabilir?",
    secenekler: [
      "Orkestrada yalnızca şefin yeteneği önemlidir.",
      "Başarılı bir sonuç için bireysel yetenek kadar uyum da gereklidir.",
      "Müzisyenlerin bireysel yetenekleri hiçbir fark yaratmaz.",
      "Orkestra müziği diğer müzik türlerinden üstündür.",
      "Şefin yönlendirmesi olmadan da tam uyum sağlanabilir.",
    ],
    dogruCevap: 1,
    aciklama: "Parça, bireysel yetenek kadar uyumun da gerekli olduğunu vurgular; bu doğrudan B seçeneğiyle örtüşür.",
  },

  // -- Sözel Mantık (4) --
  {
    ders: "TURKCE",
    soruMetni:
      "Ali, Veli, Can ve Deniz'in boyları karşılaştırılıyor: Ali, Veli'den uzundur. Deniz, Ali'den uzundur. Can, Veli'den uzun fakat Ali'den kısadır. Buna göre boy sıralamasında en kısa olan kişi kimdir?",
    secenekler: ["Ali", "Veli", "Can", "Deniz", "Belirlenemez"],
    dogruCevap: 1,
    aciklama: "Verilenlerden Veli < Can < Ali < Deniz sıralaması çıkar; en kısa kişi Veli'dir.",
  },
  {
    ders: "TURKCE",
    soruMetni:
      "Ayşe, Burak ve Ceren'in meslekleri doktor, mühendis ve öğretmendir (sırasız, her biri farklı bir meslektedir). Ayşe doktor değildir. Burak mühendis değildir. Doktor olan kişi Ceren değildir. Buna göre Burak'ın mesleği nedir?",
    secenekler: ["Doktor", "Mühendis", "Öğretmen", "Hem doktor hem mühendis", "Belirlenemez"],
    dogruCevap: 0,
    aciklama: "Doktor, Ayşe ve Ceren olamayacağına göre doktor Burak'tır; bu, 'Burak mühendis değildir' ifadesiyle de çelişmez.",
  },
  {
    ders: "TURKCE",
    soruMetni: "Bir sayı dizisi şu şekilde ilerliyor: 3, 7, 15, 31, ... Bu diziye göre bir sonraki terim kaçtır?",
    secenekler: ["47", "55", "63", "71", "79"],
    dogruCevap: 2,
    aciklama: "Her terim bir öncekinin 2 katının 1 fazlasıdır (31×2+1=63): 3→7→15→31→63.",
  },
  {
    ders: "TURKCE",
    soruMetni:
      "Bir toplantı, Salı gününden iki gün sonra yapılacaktır. Toplantının yapılacağı günden bir gün sonra ise resmî tatil vardır. Buna göre resmî tatil haftanın hangi günündedir?",
    secenekler: ["Çarşamba", "Perşembe", "Cuma", "Cumartesi", "Pazar"],
    dogruCevap: 2,
    aciklama: "Salı'dan iki gün sonrası Perşembe'dir (toplantı günü); Perşembe'den bir gün sonrası Cuma'dır.",
  },

  // -- Sözcükte Anlam (1) --
  {
    ders: "TURKCE",
    soruMetni: '"Hukuk" sözcüğü aşağıdaki cümlelerin hangisinde terim anlamıyla kullanılmıştır?',
    secenekler: [
      "Onunla eski bir hukukumuz var.",
      "Hukuk Fakültesinden yeni mezun oldu.",
      "Komşuluk hukukuna uymalıyız.",
      "Aramızdaki dostluk hukuku bozulmasın.",
      "Yıllara dayanan bir hukukumuz vardı.",
    ],
    dogruCevap: 1,
    aciklama: '"Hukuk Fakültesi" ifadesinde hukuk, bir bilim dalının adı olarak terim anlamında kullanılmıştır; diğerlerinde "dostluk, bağ" anlamındadır.',
  },

  // -- Cümlede Anlam (2) --
  {
    ders: "TURKCE",
    soruMetni: "Aşağıdaki cümlelerin hangisi öznel bir yargı bildirir?",
    secenekler: [
      "Bu şehirde yılda ortalama 800 mm yağış düşer.",
      "Roman 300 sayfadan oluşuyor.",
      "Bence bu, yazarın en güzel eseri.",
      "Toplantı saat 10.00'da başladı.",
      "Türkiye'nin başkenti Ankara'dır.",
    ],
    dogruCevap: 2,
    aciklama: '"Bence" ifadesiyle kişisel görüş belirtildiği için bu cümle öznel (kanıtlanamaz) bir yargı taşır.',
  },
  {
    ders: "TURKCE",
    soruMetni: "Aşağıdaki cümlelerin hangisi şart (koşul) anlamı taşır?",
    secenekler: [
      "Çalışırsan başarırsın.",
      "Çalıştı ve başardı.",
      "Çalışmadığı hâlde başardı.",
      "Çalışırken müzik dinler.",
      "Çalışmak için erken kalktı.",
    ],
    dogruCevap: 0,
    aciklama: '"-sa/-se" şart ekiyle kurulan "Çalışırsan başarırsın" cümlesi koşul bildirir.',
  },

  // -- Sözcük Türleri (1) --
  {
    ders: "TURKCE",
    soruMetni: 'Aşağıdaki cümlelerin hangisinde "ile" sözcüğü bağlaç görevindedir?',
    secenekler: [
      "Kalemle yazı yazdı.",
      "Ahmet ile Mehmet okula gitti.",
      "Trenle şehre gitti.",
      "Bıçakla ekmek kesti.",
      "Arabayla geldi.",
    ],
    dogruCevap: 1,
    aciklama: '"Ahmet ile Mehmet" iki ismi bağladığı için "ile" burada bağlaç görevindedir; diğerlerinde araç bildiren çekim edatıdır.',
  },

  // -- Sözcükte Yapı (2) --
  {
    ders: "TURKCE",
    soruMetni: "Aşağıdaki sözcüklerden hangisi yapı bakımından türemiş sözcüktür?",
    secenekler: ["Kitaplık", "Çocuk", "Masa", "Kalem", "Deniz"],
    dogruCevap: 0,
    aciklama: '"Kitaplık" kök (kitap) ve yapım eki (-lık) içerdiği için türemiş sözcüktür; diğerleri basit (kök hâlinde) sözcüktür.',
  },
  {
    ders: "TURKCE",
    soruMetni: "Aşağıdaki sözcüklerden hangisi birleşik sözcüktür?",
    secenekler: ["Gözlük", "Başarı", "Hanımeli", "Kalemlik", "Sevgi"],
    dogruCevap: 2,
    aciklama: '"Hanımeli", "hanım" ve "eli" sözcüklerinin kalıplaşarak birleşmesiyle oluşmuş bir birleşik sözcüktür (bir bitki adı); diğerleri yapım ekiyle türemiştir.',
  },

  // -- Cümlenin Öğeleri (1) --
  {
    ders: "TURKCE",
    soruMetni: "Aşağıdaki cümlelerin hangisinde özne gizlidir (ayrıca belirtilmemiştir)?",
    secenekler: [
      "Çocuklar bahçede oynuyor.",
      "Yarın erken kalkacağım.",
      "Öğretmen sınıfa girdi.",
      "Ali kitabı okudu.",
      "Rüzgâr ağaçları sallıyor.",
    ],
    dogruCevap: 1,
    aciklama: '"Yarın erken kalkacağım" cümlesinde özne, fiildeki kişi ekinden anlaşılır (ben); ayrıca belirtilmediği için gizli öznedir.',
  },

  // -- Ses Bilgisi (1) --
  {
    ders: "TURKCE",
    soruMetni: 'Aşağıdaki cümlelerin hangisinde geçen sözcükte "ünlü düşmesi" (hece kaybı) görülür?',
    secenekler: [
      "Kitabı okudu.",
      "Burnunu sildi.",
      "Evine gitti.",
      "Gözünü kapattı.",
      "Kolunu kaldırdı.",
    ],
    dogruCevap: 1,
    aciklama: '"Burun" sözcüğü ek alırken ikinci hecedeki dar ünlü düşer: burun+u > burnu.',
  },

  // -- Yazım Kuralları (1) --
  {
    ders: "TURKCE",
    soruMetni: "Aşağıdaki cümlelerin hangisinde yazım yanlışı vardır?",
    secenekler: [
      "Yarın akşam size geleceğim.",
      "Bu konuda haklısın.",
      "Okula zamanında yetiş.",
      "Kitabı masanın üzerine bırakdı.",
      "Hava bugün çok soğuk.",
    ],
    dogruCevap: 3,
    aciklama: '"Bırakdı" yanlıştır; ünsüz benzeşmesi kuralınca "bırak-tı" > "bıraktı" olmalıdır.',
  },

  // -- Noktalama İşaretleri (1) --
  {
    ders: "TURKCE",
    soruMetni: "Noktalama işaretlerinin kullanımıyla ilgili aşağıdaki cümlelerin hangisinde yanlışlık vardır?",
    secenekler: [
      "Ali, Veli ve Ahmet geldi.",
      "Geldin mi?",
      "Ne kadar güzel bir manzara!",
      "Annem dedi ki, yarın misafirimiz var.",
      "Kitabı, defteri ve kalemi aldım.",
    ],
    dogruCevap: 3,
    aciklama: '"Dedi ki" den sonra virgül değil doğrudan aktarılan söz gelmeli; doğrusu "Annem dedi ki: Yarın misafirimiz var." biçimindedir.',
  },

  // -- Anlatım Bozuklukları (1) --
  {
    ders: "TURKCE",
    soruMetni: "Aşağıdaki cümlelerin hangisinde bir anlatım bozukluğu vardır?",
    secenekler: [
      "Bu kitabı okudum ve çok beğendim.",
      "Sınava hazırlanıyor ve ders çalışıyordu.",
      "Hem çalışkan hem de dürüst bir insandır.",
      "Dün akşam eve geç geldim.",
      "Yağmur yağıyor ve ıslanıyoruz.",
    ],
    dogruCevap: 1,
    aciklama: '"Sınava hazırlanıyor ve ders çalışıyordu" cümlesinde zaman uyumsuzluğu vardır (biri şimdiki, biri geçmiş zaman).',
  },

  // ---- MATEMATİK (30) ----

  // -- Temel Kavramlar (2) --
  {
    ders: "MATEMATIK",
    soruMetni: "240 sayısının kaç farklı asal çarpanı vardır?",
    secenekler: ["2", "3", "4", "5", "6"],
    dogruCevap: 1,
    aciklama: "240 = 2⁴×3×5 olduğundan farklı asal çarpanlar 2, 3 ve 5'tir; toplam 3 tanedir.",
  },
  {
    ders: "MATEMATIK",
    soruMetni: "İki basamaklı bir sayının birler basamağı 0 veya 5 ise bu sayı kesinlikle hangi sayıya tam bölünür?",
    secenekler: ["2", "3", "5", "9", "10"],
    dogruCevap: 2,
    aciklama: "Birler basamağı 0 veya 5 olan sayılar her zaman 5'e tam bölünür; 10'a bölünme yalnızca 0 ile bitenler için geçerlidir.",
  },

  // -- Rasyonel Sayılar (2) --
  {
    ders: "MATEMATIK",
    soruMetni: "3/4 ile 5/6 kesirlerinin toplamı kaçtır?",
    secenekler: ["8/10", "19/12", "15/10", "2/3", "7/12"],
    dogruCevap: 1,
    aciklama: "Ortak payda 12 alınırsa 3/4=9/12, 5/6=10/12; toplamları 19/12 olur.",
  },
  {
    ders: "MATEMATIK",
    soruMetni: "2/5 kesrinin ondalık gösterimi kaçtır?",
    secenekler: ["0,2", "0,25", "0,4", "0,5", "0,8"],
    dogruCevap: 2,
    aciklama: "2÷5 = 0,4.",
  },

  // -- Basit Eşitsizlikler (1) --
  {
    ders: "MATEMATIK",
    soruMetni: "2x - 3 < 7 eşitsizliğini sağlayan en büyük tam sayı x kaçtır?",
    secenekler: ["3", "4", "5", "6", "7"],
    dogruCevap: 1,
    aciklama: "2x < 10 ⟹ x < 5; bu eşitsizliği sağlayan en büyük tam sayı 4'tür.",
  },

  // -- Mutlak Değer (1) --
  {
    ders: "MATEMATIK",
    soruMetni: "|x - 3| = 5 denklemini sağlayan x değerlerinin toplamı kaçtır?",
    secenekler: ["2", "4", "6", "8", "10"],
    dogruCevap: 2,
    aciklama: "x-3=5 ⟹ x=8 veya x-3=-5 ⟹ x=-2; toplamları 8+(-2)=6'dır.",
  },

  // -- Üslü Sayılar (2) --
  {
    ders: "MATEMATIK",
    soruMetni: "2³ × 2⁴ işleminin sonucu kaçtır?",
    secenekler: ["64", "96", "128", "256", "512"],
    dogruCevap: 2,
    aciklama: "Üslü sayılarda çarpma kuralına göre 2³×2⁴=2⁷=128.",
  },
  {
    ders: "MATEMATIK",
    soruMetni: "(3²)³ işleminin sonucu kaçtır?",
    secenekler: ["81", "243", "512", "729", "972"],
    dogruCevap: 3,
    aciklama: "(3²)³ = 3⁶ = 729.",
  },

  // -- Köklü Sayılar (1) --
  {
    ders: "MATEMATIK",
    soruMetni: "√75 ifadesinin en sade biçimi aşağıdakilerden hangisidir?",
    secenekler: ["3√5", "5√3", "15√5", "25√3", "5√5"],
    dogruCevap: 1,
    aciklama: "75 = 25×3 olduğundan √75 = 5√3.",
  },

  // -- Çarpanlara Ayırma (1) --
  {
    ders: "MATEMATIK",
    soruMetni: "x² - 9 ifadesinin çarpanlarına ayrılmış hâli aşağıdakilerden hangisidir?",
    secenekler: ["(x-3)(x+3)", "(x-9)(x+1)", "(x-3)²", "(x+3)²", "(x-9)(x+9)"],
    dogruCevap: 0,
    aciklama: "İki kare farkı özdeşliğine göre x²-9 = (x-3)(x+3).",
  },

  // -- Oran-Orantı (1) --
  {
    ders: "MATEMATIK",
    soruMetni: "3 kalemin fiyatı 18 TL ise 7 kalemin fiyatı kaç TL'dir?",
    secenekler: ["36", "38", "40", "42", "44"],
    dogruCevap: 3,
    aciklama: "Bir kalem 18/3=6 TL; 7 kalem 7×6=42 TL.",
  },

  // -- Denklem Çözme (1) --
  {
    ders: "MATEMATIK",
    soruMetni: "3x - 5 = 16 denklemine göre x kaçtır?",
    secenekler: ["5", "6", "7", "8", "9"],
    dogruCevap: 2,
    aciklama: "3x = 21 ⟹ x = 7.",
  },

  // -- Problemler (6) --
  {
    ders: "MATEMATIK",
    soruMetni: "15 işçi bir işi 12 günde bitiriyor. Aynı işi 9 işçi kaç günde bitirir?",
    secenekler: ["15", "18", "20", "22", "25"],
    dogruCevap: 2,
    aciklama: "İşçi-gün sabittir: 15×12=180. 180÷9=20 gün.",
  },
  {
    ders: "MATEMATIK",
    soruMetni: "İki sayının toplamı 50, farkı 10'dur. Büyük sayı kaçtır?",
    secenekler: ["20", "25", "28", "30", "35"],
    dogruCevap: 3,
    aciklama: "Büyük sayı = (toplam+fark)/2 = (50+10)/2 = 30.",
  },
  {
    ders: "MATEMATIK",
    soruMetni: "Bir otomobil 120 km yolu 2 saatte aldığına göre hızı kaç km/saattir?",
    secenekler: ["40", "50", "60", "70", "80"],
    dogruCevap: 2,
    aciklama: "Hız = yol/zaman = 120/2 = 60 km/saat.",
  },
  {
    ders: "MATEMATIK",
    soruMetni: "240 km'lik yolu saatte 80 km hızla giden bir araç bu yolu kaç saatte tamamlar?",
    secenekler: ["2", "2,5", "3", "3,5", "4"],
    dogruCevap: 2,
    aciklama: "Zaman = yol/hız = 240/80 = 3 saat.",
  },
  {
    ders: "MATEMATIK",
    soruMetni: "Bir havuzu bir musluk tek başına 6 saatte, başka bir musluk tek başına 3 saatte dolduruyor. İki musluk birlikte açılırsa havuz kaç saatte dolar?",
    secenekler: ["1", "1,5", "2", "2,5", "3"],
    dogruCevap: 2,
    aciklama: "Saatlik doldurma oranları toplanır: 1/6 + 1/3 = 1/2; havuz 2 saatte dolar.",
  },
  {
    ders: "MATEMATIK",
    soruMetni: "Bir sayının yarısının 3 fazlası 18 olduğuna göre bu sayı kaçtır?",
    secenekler: ["24", "27", "30", "33", "36"],
    dogruCevap: 2,
    aciklama: "x/2 + 3 = 18 ⟹ x/2 = 15 ⟹ x = 30.",
  },

  // -- Kümeler (1) --
  {
    ders: "MATEMATIK",
    soruMetni: "A = {1,2,3,4,5} ve B = {3,4,5,6,7} kümeleri için A∩B kümesinin eleman sayısı kaçtır?",
    secenekler: ["2", "3", "4", "5", "6"],
    dogruCevap: 1,
    aciklama: "A∩B = {3,4,5} olduğundan eleman sayısı 3'tür.",
  },

  // -- Fonksiyonlar (1) --
  {
    ders: "MATEMATIK",
    soruMetni: "f(x) = 2x + 3 fonksiyonuna göre f(4) kaçtır?",
    secenekler: ["7", "8", "9", "10", "11"],
    dogruCevap: 4,
    aciklama: "f(4) = 2×4+3 = 11.",
  },

  // -- Modüler Aritmetik (1) --
  {
    ders: "MATEMATIK",
    soruMetni: "17 sayısının 5'e bölümünden kalan kaçtır?",
    secenekler: ["0", "1", "2", "3", "4"],
    dogruCevap: 2,
    aciklama: "17 = 3×5 + 2 olduğundan kalan 2'dir.",
  },

  // -- Permütasyon-Kombinasyon (1) --
  {
    ders: "MATEMATIK",
    soruMetni: "4 farklı kitap bir rafa yan yana kaç farklı şekilde dizilebilir?",
    secenekler: ["12", "16", "20", "24", "28"],
    dogruCevap: 3,
    aciklama: "4 farklı nesnenin sıralama sayısı 4! = 24'tür.",
  },

  // -- Olasılık (1) --
  {
    ders: "MATEMATIK",
    soruMetni: "Hileli olmayan bir zarın bir kez atılmasında çift sayı gelme olasılığı kaçtır?",
    secenekler: ["1/6", "1/3", "1/2", "2/3", "5/6"],
    dogruCevap: 2,
    aciklama: "Çift sayılar {2,4,6} olduğundan olasılık 3/6=1/2'dir.",
  },

  // -- Sayısal Mantık (3) --
  {
    ders: "MATEMATIK",
    soruMetni: "2, 6, 12, 20, 30, ... dizisinin bir sonraki terimi kaçtır?",
    secenekler: ["36", "40", "42", "44", "48"],
    dogruCevap: 2,
    aciklama: "Terimler n×(n+1) biçimindedir (1×2, 2×3, 3×4, ...); 6. terim 6×7=42'dir.",
  },
  {
    ders: "MATEMATIK",
    soruMetni: "Bir sayının 3 katının 2 fazlası, aynı sayının 2 katının 7 fazlasına eşittir. Bu sayı kaçtır?",
    secenekler: ["3", "4", "5", "6", "7"],
    dogruCevap: 2,
    aciklama: "3x+2 = 2x+7 ⟹ x = 5.",
  },
  {
    ders: "MATEMATIK",
    soruMetni: "A sayısı B'den 4 fazla, B sayısı C'den 3 fazladır. A+B+C=28 olduğuna göre C kaçtır?",
    secenekler: ["4", "5", "6", "7", "8"],
    dogruCevap: 2,
    aciklama: "B=C+3, A=B+4=C+7 olduğundan toplam: (C+7)+(C+3)+C = 3C+10 = 28 ⟹ C=6.",
  },

  // -- Geometri (4) --
  {
    ders: "MATEMATIK",
    soruMetni: "Bir dik üçgende dik kenarlar 6 cm ve 8 cm ise hipotenüs kaç cm'dir?",
    secenekler: ["9", "10", "12", "14", "16"],
    dogruCevap: 1,
    aciklama: "Pisagor teoremine göre hipotenüs = √(6²+8²) = √100 = 10 cm.",
  },
  {
    ders: "MATEMATIK",
    soruMetni: "Bir ikizkenar üçgende taban açılarından biri 50° ise tepe açısı kaç derecedir?",
    secenekler: ["60", "70", "80", "90", "100"],
    dogruCevap: 2,
    aciklama: "İkizkenar üçgende taban açıları eşittir (50°+50°=100°); tepe açısı 180°-100°=80°.",
  },
  {
    ders: "MATEMATIK",
    soruMetni: "Bir dikdörtgenin alanı 48 cm², kısa kenarı 6 cm ise uzun kenarı kaç cm'dir?",
    secenekler: ["6", "7", "8", "9", "10"],
    dogruCevap: 2,
    aciklama: "Uzun kenar = alan/kısa kenar = 48/6 = 8 cm.",
  },
  {
    ders: "MATEMATIK",
    soruMetni: "Yarıçapı 6 cm olan bir çemberin alanı kaç cm²'dir? (π=3 alınız)",
    secenekler: ["36", "54", "72", "108", "144"],
    dogruCevap: 3,
    aciklama: "Alan = π×r² = 3×36 = 108 cm².",
  },

  // ---- TARİH (27) ----
  {
    ders: "TARIH",
    soruMetni: "Türkiye Büyük Millet Meclisi (TBMM) hangi tarihte açılmıştır?",
    secenekler: ["19 Mayıs 1919", "23 Nisan 1920", "29 Ekim 1923", "20 Ocak 1921", "11 Ekim 1922"],
    dogruCevap: 1,
    aciklama: "TBMM 23 Nisan 1920'de Ankara'da açılmıştır.",
  },
  {
    ders: "TARIH",
    soruMetni: "Türkiye Cumhuriyeti hangi tarihte ilan edilmiştir?",
    secenekler: ["1 Kasım 1922", "24 Temmuz 1923", "29 Ekim 1923", "3 Mart 1924", "30 Ağustos 1922"],
    dogruCevap: 2,
    aciklama: "Cumhuriyet, 29 Ekim 1923'te ilan edilmiştir.",
  },
  {
    ders: "TARIH",
    soruMetni: "Lozan Barış Antlaşması hangi tarihte imzalanmıştır?",
    secenekler: ["11 Ekim 1922", "24 Temmuz 1923", "29 Ekim 1923", "20 Kasım 1922", "21 Haziran 1923"],
    dogruCevap: 1,
    aciklama: "Lozan Barış Antlaşması 24 Temmuz 1923'te imzalanmıştır.",
  },
  {
    ders: "TARIH",
    soruMetni: "Saltanat hangi tarihte kaldırılmıştır?",
    secenekler: ["1 Kasım 1922", "29 Ekim 1923", "3 Mart 1924", "11 Ekim 1922", "30 Ekim 1918"],
    dogruCevap: 0,
    aciklama: "Saltanat, TBMM kararıyla 1 Kasım 1922'de kaldırılmıştır.",
  },
  {
    ders: "TARIH",
    soruMetni: "Halifelik hangi tarihte kaldırılmıştır?",
    secenekler: ["1 Kasım 1922", "29 Ekim 1923", "3 Mart 1924", "20 Nisan 1924", "1 Kasım 1928"],
    dogruCevap: 2,
    aciklama: "Halifelik 3 Mart 1924'te kaldırılmıştır.",
  },
  {
    ders: "TARIH",
    soruMetni: "Mustafa Kemal Atatürk, Kurtuluş Savaşı'nın başlangıcı kabul edilen Samsun'a hangi tarihte çıkmıştır?",
    secenekler: ["19 Mayıs 1919", "23 Temmuz 1919", "4 Eylül 1919", "22 Haziran 1919", "15 Mayıs 1919"],
    dogruCevap: 0,
    aciklama: "Mustafa Kemal, 19 Mayıs 1919'da Samsun'a çıkmıştır.",
  },
  {
    ders: "TARIH",
    soruMetni: "Aşağıdakilerden hangisi Kurtuluş Savaşı'nda Yunan ordusunun geri çekilmeye başladığı dönüm noktası olan meydan muharebesidir?",
    secenekler: ["I. İnönü Muharebesi", "II. İnönü Muharebesi", "Sakarya Meydan Muharebesi", "Büyük Taarruz", "Çanakkale Muharebeleri"],
    dogruCevap: 2,
    aciklama: "Sakarya Meydan Muharebesi (1921) sonrası Yunan ordusu savunmaya ve geri çekilmeye yönelmiştir.",
  },
  {
    ders: "TARIH",
    soruMetni: "Büyük Taarruz hangi tarihte başlamıştır?",
    secenekler: ["23 Ağustos 1921", "26 Ağustos 1922", "30 Ağustos 1922", "9 Eylül 1922", "11 Ekim 1922"],
    dogruCevap: 1,
    aciklama: "Büyük Taarruz 26 Ağustos 1922'de başlamıştır.",
  },
  {
    ders: "TARIH",
    soruMetni: "Başkomutanlık Meydan Muharebesi (Dumlupınar Meydan Muharebesi) hangi tarihte kazanılmıştır?",
    secenekler: ["26 Ağustos 1922", "30 Ağustos 1922", "9 Eylül 1922", "11 Ekim 1922", "19 Mayıs 1919"],
    dogruCevap: 1,
    aciklama: "Başkomutanlık Meydan Muharebesi 30 Ağustos 1922'de kazanılmıştır; bu gün Zafer Bayramı olarak kutlanır.",
  },
  {
    ders: "TARIH",
    soruMetni: "İzmir, düşman işgalinden hangi tarihte kurtarılmıştır?",
    secenekler: ["26 Ağustos 1922", "30 Ağustos 1922", "9 Eylül 1922", "11 Ekim 1922", "24 Temmuz 1923"],
    dogruCevap: 2,
    aciklama: "İzmir 9 Eylül 1922'de kurtarılmıştır.",
  },
  {
    ders: "TARIH",
    soruMetni: "Mudanya Ateşkes (Mütarekesi) Antlaşması hangi tarihte imzalanmıştır?",
    secenekler: ["9 Eylül 1922", "11 Ekim 1922", "20 Kasım 1922", "24 Temmuz 1923", "1 Kasım 1922"],
    dogruCevap: 1,
    aciklama: "Mudanya Ateşkes Antlaşması 11 Ekim 1922'de imzalanmıştır.",
  },
  {
    ders: "TARIH",
    soruMetni: "Erzurum Kongresi hangi yıl toplanmıştır?",
    secenekler: ["1918", "1919", "1920", "1921", "1922"],
    dogruCevap: 1,
    aciklama: "Erzurum Kongresi 23 Temmuz - 7 Ağustos 1919 tarihleri arasında toplanmıştır.",
  },
  {
    ders: "TARIH",
    soruMetni: "Sivas Kongresi hangi tarihler arasında toplanmıştır?",
    secenekler: ["23 Temmuz - 7 Ağustos 1919", "4-11 Eylül 1919", "22 Haziran 1919", "28 Ocak 1920", "20 Ocak 1921"],
    dogruCevap: 1,
    aciklama: "Sivas Kongresi 4-11 Eylül 1919 tarihleri arasında toplanmıştır.",
  },
  {
    ders: "TARIH",
    soruMetni: "Kurtuluş Savaşı'nın hazırlık (örgütlenme) sürecinin başlangıcı kabul edilen genelge aşağıdakilerden hangisidir?",
    secenekler: ["Amasya Genelgesi", "Misak-ı Milli", "Teşkilat-ı Esasiye", "Sivas Kongresi Bildirisi", "Lozan Antlaşması"],
    dogruCevap: 0,
    aciklama: "22 Haziran 1919'da yayımlanan Amasya Genelgesi, milli mücadelenin örgütlenme sürecinin başlangıcı sayılır.",
  },
  {
    ders: "TARIH",
    soruMetni: "Misak-ı Millî (Millî Ant) hangi tarihte kabul edilmiştir?",
    secenekler: ["22 Haziran 1919", "4 Eylül 1919", "28 Ocak 1920", "23 Nisan 1920", "20 Ocak 1921"],
    dogruCevap: 2,
    aciklama: "Misak-ı Millî, son Osmanlı Mebuslar Meclisi'nce 28 Ocak 1920'de kabul edilmiştir.",
  },
  {
    ders: "TARIH",
    soruMetni: "TBMM'nin ilk anayasası olan Teşkilat-ı Esasiye Kanunu hangi tarihte kabul edilmiştir?",
    secenekler: ["23 Nisan 1920", "20 Ocak 1921", "29 Ekim 1923", "20 Nisan 1924", "1 Kasım 1922"],
    dogruCevap: 1,
    aciklama: "Teşkilat-ı Esasiye Kanunu 20 Ocak 1921'de kabul edilmiştir.",
  },
  {
    ders: "TARIH",
    soruMetni: "Türkiye Cumhuriyeti'nin ilk Cumhurbaşkanı kimdir?",
    secenekler: ["İsmet İnönü", "Mustafa Kemal Atatürk", "Celal Bayar", "Fevzi Çakmak", "Kazım Karabekir"],
    dogruCevap: 1,
    aciklama: "Cumhuriyet'in ilanıyla birlikte 29 Ekim 1923'te Mustafa Kemal Atatürk ilk Cumhurbaşkanı seçilmiştir.",
  },
  {
    ders: "TARIH",
    soruMetni: "Soyadı Kanunu hangi yıl kabul edilmiştir?",
    secenekler: ["1928", "1930", "1932", "1934", "1936"],
    dogruCevap: 3,
    aciklama: "Soyadı Kanunu 21 Haziran 1934'te kabul edilmiştir.",
  },
  {
    ders: "TARIH",
    soruMetni: "Türkiye'de kadınlara milletvekili seçme ve seçilme hakkı hangi yıl tanınmıştır?",
    secenekler: ["1930", "1933", "1934", "1935", "1938"],
    dogruCevap: 2,
    aciklama: "Kadınlara milletvekili seçme ve seçilme hakkı 5 Aralık 1934'te tanınmıştır.",
  },
  {
    ders: "TARIH",
    soruMetni: "Yeni Türk alfabesinin (Latin harflerinin) kabulü hangi yıl gerçekleşmiştir?",
    secenekler: ["1923", "1924", "1925", "1928", "1930"],
    dogruCevap: 3,
    aciklama: "Harf İnkılabı ile yeni Türk alfabesi 1 Kasım 1928'de kabul edilmiştir.",
  },
  {
    ders: "TARIH",
    soruMetni: "Mustafa Kemal Atatürk hangi tarihte vefat etmiştir?",
    secenekler: ["10 Kasım 1938", "19 Mayıs 1938", "29 Ekim 1938", "1 Kasım 1938", "23 Nisan 1938"],
    dogruCevap: 0,
    aciklama: "Atatürk, 10 Kasım 1938'de Dolmabahçe Sarayı'nda vefat etmiştir.",
  },
  {
    ders: "TARIH",
    soruMetni: "Osmanlı Devleti geleneksel olarak hangi yılda kurulmuş kabul edilir?",
    secenekler: ["1071", "1299", "1453", "1512", "1326"],
    dogruCevap: 1,
    aciklama: "Osmanlı Devleti'nin kuruluşu geleneksel olarak 1299 kabul edilir.",
  },
  {
    ders: "TARIH",
    soruMetni: "İstanbul'un fethi hangi tarihte, hangi padişah tarafından gerçekleştirilmiştir?",
    secenekler: [
      "1453, Fatih Sultan Mehmet",
      "1453, II. Bayezid",
      "1517, Yavuz Sultan Selim",
      "1389, I. Murad",
      "1402, Yıldırım Bayezid",
    ],
    dogruCevap: 0,
    aciklama: "İstanbul, 29 Mayıs 1453'te Fatih Sultan Mehmet tarafından fethedilmiştir.",
  },
  {
    ders: "TARIH",
    soruMetni: "Malazgirt Meydan Muharebesi hangi yıl, hangi Selçuklu hükümdarı önderliğinde kazanılmıştır?",
    secenekler: [
      "1071, Alparslan",
      "1176, II. Kılıçarslan",
      "1243, II. Gıyaseddin Keyhüsrev",
      "1040, Tuğrul Bey",
      "1299, Osman Bey",
    ],
    dogruCevap: 0,
    aciklama: "Malazgirt Meydan Muharebesi 1071'de Büyük Selçuklu Sultanı Alparslan önderliğinde kazanılmış, Anadolu'nun kapıları Türklere açılmıştır.",
  },
  {
    ders: "TARIH",
    soruMetni: "Osmanlı Devleti'nde ilan edilen Tanzimat Fermanı hangi yüzyılda gerçekleşmiştir?",
    secenekler: ["17. yüzyıl", "18. yüzyıl", "19. yüzyıl", "20. yüzyıl başı", "16. yüzyıl"],
    dogruCevap: 2,
    aciklama: "Tanzimat Fermanı 1839'da, 19. yüzyılda ilan edilmiştir.",
  },
  {
    ders: "TARIH",
    soruMetni: "Osmanlı'da ilk kez bir anayasanın (Kanun-i Esasi) ilan edildiği I. Meşrutiyet hangi yıl ilan edilmiştir?",
    secenekler: ["1839", "1856", "1876", "1908", "1909"],
    dogruCevap: 2,
    aciklama: "I. Meşrutiyet 1876'da ilan edilmiştir.",
  },
  {
    ders: "TARIH",
    soruMetni: "Osmanlı Devleti, I. Dünya Savaşı'na hangi yıl fiilen katılmıştır?",
    secenekler: ["1912", "1913", "1914", "1917", "1918"],
    dogruCevap: 2,
    aciklama: "Osmanlı Devleti, 1914 yılının sonlarında I. Dünya Savaşı'na katılmıştır.",
  },

  // ---- COĞRAFYA (18) ----
  {
    ders: "COGRAFYA",
    soruMetni: "Türkiye'nin nüfus bakımından en kalabalık ili aşağıdakilerden hangisidir?",
    secenekler: ["Ankara", "İzmir", "İstanbul", "Bursa", "Antalya"],
    dogruCevap: 2,
    aciklama: "İstanbul, Türkiye'nin en kalabalık ilidir.",
  },
  {
    ders: "COGRAFYA",
    soruMetni: "Türkiye'nin en yüksek dağı aşağıdakilerden hangisidir?",
    secenekler: ["Erciyes Dağı", "Uludağ", "Kaçkar Dağı", "Ağrı Dağı", "Nemrut Dağı"],
    dogruCevap: 3,
    aciklama: "5137 m yüksekliğindeki Ağrı Dağı, Türkiye'nin en yüksek dağıdır.",
  },
  {
    ders: "COGRAFYA",
    soruMetni: "Türkiye'nin sınırları içinde en uzun akan nehri aşağıdakilerden hangisidir?",
    secenekler: ["Fırat", "Sakarya", "Kızılırmak", "Yeşilırmak", "Dicle"],
    dogruCevap: 2,
    aciklama: "Kızılırmak, tamamı Türkiye sınırları içinde akan en uzun nehirdir.",
  },
  {
    ders: "COGRAFYA",
    soruMetni: "Türkiye'nin en büyük gölü aşağıdakilerden hangisidir?",
    secenekler: ["Tuz Gölü", "Beyşehir Gölü", "Eğirdir Gölü", "Van Gölü", "İznik Gölü"],
    dogruCevap: 3,
    aciklama: "Van Gölü, yüzölçümü bakımından Türkiye'nin en büyük gölüdür.",
  },
  {
    ders: "COGRAFYA",
    soruMetni: "Türkiye'nin kara sınırı komşusu olan ülke sayısı kaçtır?",
    secenekler: ["6", "7", "8", "9", "10"],
    dogruCevap: 2,
    aciklama: "Türkiye; Yunanistan, Bulgaristan, Gürcistan, Ermenistan, Azerbaycan (Nahçıvan), İran, Irak ve Suriye olmak üzere 8 ülkeyle kara sınırı komşusudur.",
  },
  {
    ders: "COGRAFYA",
    soruMetni: "Türkiye kaç coğrafi bölgeye ayrılmıştır?",
    secenekler: ["5", "6", "7", "8", "9"],
    dogruCevap: 2,
    aciklama: "Türkiye; Marmara, Ege, Akdeniz, İç Anadolu, Karadeniz, Doğu Anadolu ve Güneydoğu Anadolu olmak üzere 7 coğrafi bölgeye ayrılmıştır.",
  },
  {
    ders: "COGRAFYA",
    soruMetni: "Yazları sıcak ve kurak, kışları ılık ve yağışlı geçen iklim tipi Türkiye'de en belirgin biçimde hangi kıyılarda görülür?",
    secenekler: ["Karadeniz kıyıları", "Marmara kıyıları", "Akdeniz ve Ege kıyıları", "Doğu Anadolu", "İç Anadolu"],
    dogruCevap: 2,
    aciklama: "Akdeniz iklimi, Akdeniz ve Ege kıyılarında görülür; yazlar sıcak-kurak, kışlar ılık-yağışlıdır.",
  },
  {
    ders: "COGRAFYA",
    soruMetni: "Her mevsim yağışlı, yazları serin kışları ılıman geçen iklim tipi Türkiye'de hangi bölgede görülür?",
    secenekler: ["İç Anadolu", "Karadeniz Bölgesi", "Güneydoğu Anadolu", "Akdeniz Bölgesi", "Doğu Anadolu"],
    dogruCevap: 1,
    aciklama: "Karadeniz iklimi her mevsim yağışlıdır; yazlar serin, kışlar ise diğer iç kesimlere göre ılımandır.",
  },
  {
    ders: "COGRAFYA",
    soruMetni: "Yüzölçümü bakımından Türkiye'nin en büyük coğrafi bölgesi aşağıdakilerden hangisidir?",
    secenekler: ["Karadeniz Bölgesi", "İç Anadolu Bölgesi", "Doğu Anadolu Bölgesi", "Akdeniz Bölgesi", "Ege Bölgesi"],
    dogruCevap: 2,
    aciklama: "Doğu Anadolu Bölgesi, yüzölçümü bakımından Türkiye'nin en büyük bölgesidir.",
  },
  {
    ders: "COGRAFYA",
    soruMetni: "Yüzölçümü bakımından Türkiye'nin en küçük coğrafi bölgesi aşağıdakilerden hangisidir?",
    secenekler: ["Ege Bölgesi", "Marmara Bölgesi", "Güneydoğu Anadolu Bölgesi", "Akdeniz Bölgesi", "Karadeniz Bölgesi"],
    dogruCevap: 1,
    aciklama: "Marmara Bölgesi, yüzölçümü bakımından Türkiye'nin en küçük coğrafi bölgesidir.",
  },
  {
    ders: "COGRAFYA",
    soruMetni: "Türkiye Cumhuriyeti'nin başkenti aşağıdakilerden hangisidir?",
    secenekler: ["İstanbul", "İzmir", "Ankara", "Bursa", "Konya"],
    dogruCevap: 2,
    aciklama: "Türkiye'nin başkenti Ankara'dır (13 Ekim 1923'te başkent ilan edilmiştir).",
  },
  {
    ders: "COGRAFYA",
    soruMetni: "Fırat ve Dicle nehirleri birleşerek hangi körfeze dökülür?",
    secenekler: ["Basra Körfezi", "Kızıldeniz", "Umman Denizi", "Hazar Denizi", "Akabe Körfezi"],
    dogruCevap: 0,
    aciklama: "Fırat ve Dicle, Irak topraklarında birleşip Şattularab adıyla Basra Körfezi'ne dökülür.",
  },
  {
    ders: "COGRAFYA",
    soruMetni: "Türkiye'de nüfus yoğunluğunun en fazla olduğu coğrafi bölge aşağıdakilerden hangisidir?",
    secenekler: ["Ege Bölgesi", "Marmara Bölgesi", "Akdeniz Bölgesi", "Karadeniz Bölgesi", "İç Anadolu Bölgesi"],
    dogruCevap: 1,
    aciklama: "Sanayi ve İstanbul'un yoğun nüfusu nedeniyle Marmara Bölgesi en yüksek nüfus yoğunluğuna sahiptir.",
  },
  {
    ders: "COGRAFYA",
    soruMetni: "İstanbul Boğazı hangi iki denizi birbirine bağlar?",
    secenekler: [
      "Ege Denizi - Akdeniz",
      "Karadeniz - Marmara Denizi",
      "Marmara Denizi - Ege Denizi",
      "Akdeniz - Kızıldeniz",
      "Karadeniz - Ege Denizi",
    ],
    dogruCevap: 1,
    aciklama: "İstanbul Boğazı, Karadeniz ile Marmara Denizi'ni birbirine bağlar.",
  },
  {
    ders: "COGRAFYA",
    soruMetni: "Çanakkale Boğazı hangi iki denizi birbirine bağlar?",
    secenekler: [
      "Karadeniz - Marmara Denizi",
      "Marmara Denizi - Ege Denizi",
      "Ege Denizi - Akdeniz",
      "Akdeniz - Marmara Denizi",
      "Karadeniz - Ege Denizi",
    ],
    dogruCevap: 1,
    aciklama: "Çanakkale Boğazı, Marmara Denizi ile Ege Denizi'ni birbirine bağlar.",
  },
  {
    ders: "COGRAFYA",
    soruMetni: "Türkiye'nin en büyük adası aşağıdakilerden hangisidir?",
    secenekler: ["Bozcaada", "Marmara Adası", "Gökçeada", "Avşa Adası", "Büyükada"],
    dogruCevap: 2,
    aciklama: "Gökçeada, yüzölçümü bakımından Türkiye'nin en büyük adasıdır.",
  },
  {
    ders: "COGRAFYA",
    soruMetni: "Türkiye'de il sayısı kaçtır?",
    secenekler: ["73", "77", "79", "81", "83"],
    dogruCevap: 3,
    aciklama: "Türkiye'de 81 il bulunmaktadır.",
  },
  {
    ders: "COGRAFYA",
    soruMetni: "Denizden uzak, karasal iklim özellikleri nedeniyle yazları sıcak-kurak, kışları soğuk ve kar yağışlı geçen, yağışın en az olduğu bölgelerden biri aşağıdakilerden hangisidir?",
    secenekler: ["Karadeniz Bölgesi", "Marmara Bölgesi", "Ege Bölgesi", "İç Anadolu Bölgesi", "Akdeniz Bölgesi"],
    dogruCevap: 3,
    aciklama: "İç Anadolu Bölgesi karasal iklimin etkisiyle en az yağış alan bölgelerden biridir.",
  },

  // ---- VATANDAŞLIK (9) ----
  {
    ders: "VATANDASLIK",
    soruMetni: "Türkiye Cumhuriyeti Anayasası'na göre yasama yetkisi hangi organa aittir?",
    secenekler: [
      "Cumhurbaşkanlığı",
      "Türkiye Büyük Millet Meclisi",
      "Bakanlar Kurulu",
      "Anayasa Mahkemesi",
      "Yargıtay",
    ],
    dogruCevap: 1,
    aciklama: "Anayasa'nın 7. maddesine göre yasama yetkisi Türk Milleti adına TBMM'ye aittir.",
  },
  {
    ders: "VATANDASLIK",
    soruMetni: "Türkiye'de yargı yetkisi kimin/kimlerin adına kullanılır?",
    secenekler: ["Cumhurbaşkanı adına", "TBMM adına", "Türk Milleti adına", "Anayasa Mahkemesi adına", "Hükûmet adına"],
    dogruCevap: 2,
    aciklama: "Anayasa'nın 9. maddesine göre yargı yetkisi Türk Milleti adına bağımsız mahkemelerce kullanılır.",
  },
  {
    ders: "VATANDASLIK",
    soruMetni: "Türkiye Cumhuriyeti Anayasası'na göre Türkiye Devleti'nin şekli nedir?",
    secenekler: ["Monarşi", "Cumhuriyet", "Teokrasi", "Konfederasyon", "Federasyon"],
    dogruCevap: 1,
    aciklama: "Anayasa'nın 1. maddesine göre Türkiye Devleti bir Cumhuriyettir.",
  },
  {
    ders: "VATANDASLIK",
    soruMetni: "TBMM üyeleri kaç yılda bir yapılan seçimlerle belirlenir?",
    secenekler: ["3", "4", "5", "6", "7"],
    dogruCevap: 2,
    aciklama: "Türkiye Büyük Millet Meclisi seçimleri beş yılda bir yapılır.",
  },
  {
    ders: "VATANDASLIK",
    soruMetni: "Anayasa Mahkemesi öncelikle hangi görevi yerine getirir?",
    secenekler: [
      "Kanunların Anayasaya uygunluğunu denetlemek",
      "Yerel yönetimleri denetlemek",
      "Milletvekili seçimlerini yönetmek",
      "Bakanlar Kurulunu atamak",
      "Belediye bütçelerini onaylamak",
    ],
    dogruCevap: 0,
    aciklama: "Anayasa Mahkemesi'nin temel görevi, kanunların ve Cumhurbaşkanlığı kararnamelerinin Anayasaya uygunluğunu denetlemektir.",
  },
  {
    ders: "VATANDASLIK",
    soruMetni: "Türkiye'de milletvekili seçilebilmek için gereken asgari yaş Anayasa'ya göre kaçtır?",
    secenekler: ["18", "21", "25", "30", "35"],
    dogruCevap: 0,
    aciklama: "2017 Anayasa değişikliğiyle milletvekili seçilme yaşı 18'e indirilmiştir.",
  },
  {
    ders: "VATANDASLIK",
    soruMetni: "Seçme hakkı Türkiye'de kaç yaşını dolduran vatandaşlara tanınmıştır?",
    secenekler: ["16", "17", "18", "20", "21"],
    dogruCevap: 2,
    aciklama: "Anayasa'ya göre 18 yaşını dolduran her Türk vatandaşı seçme hakkına sahiptir.",
  },
  {
    ders: "VATANDASLIK",
    soruMetni: "Mahalli idareler (yerel yönetimler) aşağıdakilerden hangisini kapsamaz?",
    secenekler: ["İl özel idaresi", "Belediye", "Köy", "Bakanlık", "Büyükşehir belediyesi"],
    dogruCevap: 3,
    aciklama: "Bakanlıklar merkezi yönetime bağlıdır; il özel idaresi, belediye ve köy mahalli idare birimleridir.",
  },
  {
    ders: "VATANDASLIK",
    soruMetni: "Anayasa'ya göre temel hak ve hürriyetler hangi durumda sınırlandırılabilir?",
    secenekler: [
      "Hiçbir şekilde sınırlandırılamaz",
      "Sadece cumhurbaşkanı kararıyla",
      "Anayasada öngörülen sebeplere bağlı olarak kanunla",
      "Belediye meclisi kararıyla",
      "Herhangi bir yönetmelikle",
    ],
    dogruCevap: 2,
    aciklama: "Anayasa'nın 13. maddesine göre temel hak ve hürriyetler, ancak Anayasanın ilgili maddelerinde belirtilen sebeplere bağlı olarak ve kanunla sınırlanabilir.",
  },

  // ---- GÜNCEL BİLGİLER (6) ----
  {
    ders: "GUNCEL",
    soruMetni: "Türkiye, NATO'ya (Kuzey Atlantik Antlaşması Örgütü'ne) hangi yıl üye olmuştur?",
    secenekler: ["1945", "1949", "1952", "1960", "1987"],
    dogruCevap: 2,
    aciklama: "Türkiye, 1952 yılında NATO'ya üye olmuştur.",
  },
  {
    ders: "GUNCEL",
    soruMetni: "Birleşmiş Milletler (BM) hangi yıl kurulmuştur ve Türkiye bu kuruluşun kurucu üyelerinden midir?",
    secenekler: [
      "1920, kurucu üyesidir",
      "1945, kurucu üyesidir",
      "1952, kurucu üyesi değildir",
      "1961, kurucu üyesidir",
      "1945, kurucu üyesi değildir",
    ],
    dogruCevap: 1,
    aciklama: "Birleşmiş Milletler 1945'te kurulmuştur ve Türkiye kurucu üyelerinden biridir.",
  },
  {
    ders: "GUNCEL",
    soruMetni: "Türkiye Cumhuriyeti'nin resmi para birimi aşağıdakilerden hangisidir?",
    secenekler: ["Türk Lirası", "Osmanlı Lirası", "Euro", "Kuruş", "Altın Lira"],
    dogruCevap: 0,
    aciklama: "Türkiye'nin resmi para birimi Türk Lirasıdır.",
  },
  {
    ders: "GUNCEL",
    soruMetni: "Türkiye Cumhuriyeti Anayasası'na göre devletin resmi dili nedir?",
    secenekler: ["Osmanlıca", "Türkçe", "Arapça", "Kürtçe", "Farsça"],
    dogruCevap: 1,
    aciklama: "Anayasa'nın 3. maddesine göre Türkiye Devleti'nin dili Türkçedir.",
  },
  {
    ders: "GUNCEL",
    soruMetni: "Türkiye, Avrupa Birliği'ne (o dönemki adıyla Avrupa Ekonomik Topluluğu'na) tam üyelik başvurusunu hangi yıl yapmıştır?",
    secenekler: ["1963", "1976", "1987", "1999", "2005"],
    dogruCevap: 2,
    aciklama: "Türkiye, tam üyelik başvurusunu 1987 yılında yapmıştır.",
  },
  {
    ders: "GUNCEL",
    soruMetni: "Türkiye'nin de kurucu üyeleri arasında bulunduğu, 1949'da kurulan ve insan hakları, demokrasi alanlarında çalışan kuruluş aşağıdakilerden hangisidir?",
    secenekler: ["Avrupa Birliği", "Avrupa Konseyi", "NATO", "Birleşmiş Milletler", "D-8"],
    dogruCevap: 1,
    aciklama: "Avrupa Konseyi 1949'da kurulmuştur; Türkiye kurucu üyeleri arasındadır.",
  },
];

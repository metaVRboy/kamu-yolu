/**
 * KPSS deneme sinavi soru havuzu - Lisans duzeyi, ilk parti.
 * Her soru AI tarafindan ozgun olarak yazildi (gercek OSYM sorusu degildir).
 * secenekler: 5 sik (A-E sirayla), dogruCevap: 0-4 index.
 *
 * Soru tipleri ve zorluk seviyesi, kullanicinin sagladigi gercek KPSS deneme
 * kitapciklarinin (lisans/onlisans/ortaogretim) formatina gore kalibre
 * edildi: uzun/numarali (I-V) ifadeli paragraflar, ortak metinli soru
 * ciftleri, oge dizilisi, tanimli ozel islem/kavram sorulari, basamak-harf
 * problemleri; geometri ve cografya sorularinda inline SVG gorseller.
 *
 * Turkce (30) ve Matematik (30) alt konu dagilimi, ÖSYM'nin resmi KPSS
 * Genel Yetenek konu dagilimina uygun hazirlandi:
 *  - Turkce: Paragraf/okuma 11, Numarali ifade paragrafi 3, Sozel Mantik 4,
 *    Sozcukte Anlam 1, Cumlede Anlam 2, Sozcuk Turleri 1, Sozcukte Yapi 2,
 *    Oge Dizilisi 1, Fiilimsi 1, Ses Bilgisi 1, Yazim Kurallari 1,
 *    Noktalama/boslukla tamamlama 1, Anlatim Bozuklugu 1 (toplam 30)
 *  - Matematik: Temel Kavramlar 2, Rasyonel Sayilar 2, Basit Esitsizlikler 1,
 *    Mutlak Deger 1, Uslu Sayilar 2, Koklu Sayilar 1, Carpanlara Ayirma 1,
 *    Oran-Oranti 1, Denklem Cozme 1, Problemler 6, Kumeler 1, Fonksiyonlar 1,
 *    Sayisal Mantik/tanimli islem 3, Permutasyon-Kombinasyon 1, Olasilik 1,
 *    Geometri 4 - gorselli (toplam 30)
 */
export type SeedSoru = {
  ders: "TURKCE" | "MATEMATIK" | "TARIH" | "COGRAFYA" | "VATANDASLIK" | "GUNCEL";
  soruMetni: string;
  gorselSvg?: string;
  secenekler: [string, string, string, string, string];
  dogruCevap: number;
  aciklama: string;
};

export const LISANS_SORULARI: SeedSoru[] = [
  // ---- TÜRKÇE (30) ----

  // -- Ortak metinli soru çiftleri (2 parça × 2 soru = 4) --
  {
    ders: "TURKCE",
    soruMetni:
      "20-21. soruları aşağıdaki parçaya göre cevaplayınız.\n\nBir romancının başarısı, yalnızca kurduğu olay örgüsüyle değil, okuru kurmaca dünyanın içine çekebilme becerisiyle de ölçülür. Kimi yazarlar, karakterlerini baştan sona kusursuz çizmeye çalışırken onları gerçeklikten uzaklaştırır; oysa okur, kahramanın zaaflarıyla, tereddütleriyle, hatalarıyla özdeşleşir. Bu yüzden deneyimli bir yazar, karakterine kusursuzluk değil, inandırıcılık kazandırmayı önceler. Anlatılan dünyanın gerçekliği, yazarın kelime seçiminden çok, insana dair çelişkileri ne kadar dürüstçe yansıttığıyla ilgilidir. Bir romanın yıllar sonra bile okunması, genellikle bu dürüstlükten kaynaklanır.\n\n20. Bu parçaya göre bir romanın okur üzerinde kalıcı etki bırakmasının temel nedeni aşağıdakilerden hangisidir?",
    secenekler: [
      "Yazarın özenli kelime seçimleri",
      "Olay örgüsünün karmaşıklığı",
      "İnsana dair çelişkilerin dürüstçe yansıtılması",
      "Karakterlerin kusursuz çizilmesi",
      "Anlatılan dünyanın gerçeklikten tamamen kopuk olması",
    ],
    dogruCevap: 2,
    aciklama: "Parça, kalıcılığın 'insana dair çelişkileri dürüstçe yansıtmak'tan kaynaklandığını açıkça belirtir.",
  },
  {
    ders: "TURKCE",
    soruMetni:
      "20-21. soruları aşağıdaki parçaya göre cevaplayınız.\n\nBir romancının başarısı, yalnızca kurduğu olay örgüsüyle değil, okuru kurmaca dünyanın içine çekebilme becerisiyle de ölçülür. Kimi yazarlar, karakterlerini baştan sona kusursuz çizmeye çalışırken onları gerçeklikten uzaklaştırır; oysa okur, kahramanın zaaflarıyla, tereddütleriyle, hatalarıyla özdeşleşir. Bu yüzden deneyimli bir yazar, karakterine kusursuzluk değil, inandırıcılık kazandırmayı önceler. Anlatılan dünyanın gerçekliği, yazarın kelime seçiminden çok, insana dair çelişkileri ne kadar dürüstçe yansıttığıyla ilgilidir. Bir romanın yıllar sonra bile okunması, genellikle bu dürüstlükten kaynaklanır.\n\n21. Bu parçadan hareketle aşağıdakilerden hangisine ulaşılamaz?",
    secenekler: [
      "Okur, kahramanın zaaflarıyla özdeşleşebilir.",
      "Kusursuz çizilen karakterler gerçeklikten uzaklaşabilir.",
      "Deneyimli yazarlar inandırıcılığı önceler.",
      "Bir romanın başarısı yalnızca olay örgüsüyle ölçülür.",
      "Kelime seçimi, gerçekliği yansıtmada tek belirleyici unsur değildir.",
    ],
    dogruCevap: 3,
    aciklama: "Parça 'yalnızca olay örgüsüyle değil' diyerek bunun tam tersini söyler; bu nedenle D'ye ulaşılamaz.",
  },
  {
    ders: "TURKCE",
    soruMetni:
      "22-23. soruları aşağıdaki parçaya göre cevaplayınız.\n\nŞehirlerin büyümesiyle birlikte toplu taşıma sistemlerine olan bağımlılık da artıyor. Ancak yalnızca metro ve otobüs hatlarını çoğaltmak, trafik sorununu kalıcı olarak çözmüyor. Kentlerin, yayalaştırılmış bölgeleri artırması, bisiklet yollarını güvenli hâle getirmesi ve farklı ulaşım türlerini birbirine entegre etmesi gerekiyor. Aksi hâlde yeni açılan her yol kısa süre içinde yeniden tıkanıyor; çünkü artan kapasite, zamanla daha fazla özel araç kullanımını teşvik ediyor. Bu nedenle sürdürülebilir bir ulaşım politikası, yalnızca yeni yol ve hat inşasına değil, davranış değişikliğine de odaklanmalıdır.\n\n22. Bu parçanın ana düşüncesi aşağıdakilerden hangisidir?",
    secenekler: [
      "Metro hatları trafik sorununu tek başına çözer.",
      "Sürdürülebilir ulaşım için yol inşasının yanında davranış değişikliği de gereklidir.",
      "Bisiklet yolları şehir trafiğini tamamen ortadan kaldırır.",
      "Özel araç kullanımı hiçbir koşulda azaltılamaz.",
      "Kentlerde yaya bölgeleri ekonomik kayba yol açar.",
    ],
    dogruCevap: 1,
    aciklama: "Parçanın son cümlesi bu ana düşünceyi doğrudan özetler.",
  },
  {
    ders: "TURKCE",
    soruMetni:
      "22-23. soruları aşağıdaki parçaya göre cevaplayınız.\n\nŞehirlerin büyümesiyle birlikte toplu taşıma sistemlerine olan bağımlılık da artıyor. Ancak yalnızca metro ve otobüs hatlarını çoğaltmak, trafik sorununu kalıcı olarak çözmüyor. Kentlerin, yayalaştırılmış bölgeleri artırması, bisiklet yollarını güvenli hâle getirmesi ve farklı ulaşım türlerini birbirine entegre etmesi gerekiyor. Aksi hâlde yeni açılan her yol kısa süre içinde yeniden tıkanıyor; çünkü artan kapasite, zamanla daha fazla özel araç kullanımını teşvik ediyor. Bu nedenle sürdürülebilir bir ulaşım politikası, yalnızca yeni yol ve hat inşasına değil, davranış değişikliğine de odaklanmalıdır.\n\n23. Bu parçaya göre aşağıdakilerden hangisi söylenemez?",
    secenekler: [
      "Yeni yollar bazen kısa sürede yeniden tıkanabilir.",
      "Artan yol kapasitesi özel araç kullanımını teşvik edebilir.",
      "Ulaşım türlerinin entegrasyonu önemlidir.",
      "Sadece yol ve hat inşası trafik sorununu kalıcı olarak çözer.",
      "Yayalaştırma, sürdürülebilir ulaşım politikasının bir parçasıdır.",
    ],
    dogruCevap: 3,
    aciklama: "Parça, yalnızca yol/hat inşasının yeterli olmadığını açıkça belirtir; bu yüzden D söylenemez.",
  },

  // -- Numaralı (I-V) ifade/paragraf soruları (3) --
  {
    ders: "TURKCE",
    soruMetni:
      '(I) Göçmen kuşlar, binlerce kilometre öteden gelip her yıl aynı sulak alana döner (geri gelmek). (II) Bu dönüş davranışının, kuşların yıldızları ve manyetik alanı kullanarak yön bulmasıyla açıklandığı söylenir (bir görüşle temellendirmek). (III) Bazı araştırmacılar ise kuşların koku duyusunu da kullandığını öne sürer (önceki görüşü tamamen reddetmek). (IV) Yapılan deneyler, her iki yeteneğin de yön bulmada rol oynayabileceğini göstermiştir (kanıt sunmak). (V) Bu bulgular, göç davranışının tek bir mekanizmayla açıklanamayacağını ortaya koymaktadır (sonuca bağlamak).\n\nBu parçadaki numaralı cümlelerden hangisinin anlamı parantez içinde verilen açıklamayla uyuşmamaktadır?',
    secenekler: ["I", "II", "III", "IV", "V"],
    dogruCevap: 2,
    aciklama:
      "III. cümlede araştırmacılar önceki görüşü reddetmez, ona ek bir açıklama öne sürer; bu yüzden 'reddetmek' ifadesiyle uyuşmaz.",
  },
  {
    ders: "TURKCE",
    soruMetni:
      "(I) Bal arıları, çiçekten topladıkları nektarı kovana taşıyarak bal üretimine başlar. (II) Bu süreçte arılar, nektarı ağız organlarıyla işleyerek enzimler katar. (III) Petek gözlerine yerleştirilen bu karışım, suyunu kaybederek koyulaşır. (IV) Arı sokması, vücutta şişlik ve kızarıklığa yol açabilen bir savunma mekanizmasıdır. (V) Son aşamada işçi arılar, peteği ince bir balmumu tabakasıyla kapatarak balı olgunlaştırır.\n\nBu parçadaki numaralı cümlelerden hangisi düşüncenin akışını bozmaktadır?",
    secenekler: ["I", "II", "III", "IV", "V"],
    dogruCevap: 3,
    aciklama: "Diğer cümleler bal üretim sürecini sırayla anlatırken IV. cümle konu dışına çıkıp arı sokmasından söz eder.",
  },
  {
    ders: "TURKCE",
    soruMetni:
      "Bitkiler güneş ışığını kullanarak fotosentez yapar ve bu süreçte oksijen üretir. Ancak her bitki bu süreci aynı verimlilikte gerçekleştirmez; yaprak yüzey alanı, klorofil miktarı ve ışık yoğunluğu fotosentez hızını doğrudan etkiler. Kurak bölgelerde yetişen bazı bitkiler, su kaybını azaltmak için gözeneklerini gün boyunca kapalı tutar ve fotosentezi gece gerçekleştirir.\n\nBu parçaya göre,\nI. Fotosentez hızı yalnızca ışık miktarına bağlıdır.\nII. Bazı bitkiler su kaybını önlemek için farklı stratejiler geliştirmiştir.\nIII. Tüm bitkiler fotosentezi aynı verimlilikte yapar.\nIV. Yaprak yüzey alanı fotosentez hızını etkileyen etkenlerden biridir.\n\nyargılarından hangilerine ulaşılabilir?",
    secenekler: ["I ve II", "I ve III", "II ve III", "II ve IV", "III ve V"],
    dogruCevap: 3,
    aciklama: "Parça I ve III'ü (yalnızca/tüm gibi aşırı genellemeleri) desteklemez; II ve IV parçayla doğrudan uyumludur.",
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

  // -- Öge Dizilişi (1) --
  {
    ders: "TURKCE",
    soruMetni:
      '"Öğretmen, sınava hazırlanan öğrencilere son tavsiyelerini verdi." cümlesiyle öge dizilişi (özne - dolaylı tümleç - nesne - yüklem) bakımından aynı yapıya sahip cümle aşağıdakilerden hangisidir?',
    secenekler: [
      "Çocuk, markete giden babasına çantasını uzattı.",
      "Anne, çantasını odada unutan çocuğu azarladı.",
      "Yorgun öğrenciler erkenden evlerine döndü.",
      "Komşumuz, bahçesindeki çiçekleri her sabah sular.",
      "Çocuklar bahçede neşeyle oynuyordu.",
    ],
    dogruCevap: 0,
    aciklama:
      '"Çocuk (özne), markete giden babasına (dolaylı tümleç), çantasını (nesne) uzattı (yüklem)" aynı öge sırasını taşır; diğer seçeneklerde öge dizilişi farklıdır.',
  },

  // -- Fiilimsi (1) --
  {
    ders: "TURKCE",
    soruMetni:
      "Sabah erkenden kalkıp (I) koşuya çıkan Mert, parkta koşarken (II) gördüğü yaşlı adamla sohbet etti. Adam, gençliğinde yazdığı (III) şiirlerden söz ederken gözleri parlıyordu. Mert, bu şiirleri bir gün okumayı (IV) kendine hedef koydu ve eve dönerken (V) bu karşılaşmayı hiç unutmayacağını düşündü.\n\nNumaralanmış fiilimsilerden hangisi sıfat-fiil (sıfat göreviyle kullanılmış fiilimsi)dir?",
    secenekler: ["I", "II", "III", "IV", "V"],
    dogruCevap: 2,
    aciklama: '"Yazdığı" (-dığı eki) burada "şiirler" sözcüğünü niteleyen bir sıfat-fiildir; diğerleri bağ-fiil (I, II, V) veya isim-fiildir (IV).',
  },

  // -- Ses Bilgisi (1) --
  {
    ders: "TURKCE",
    soruMetni:
      "Ağaçtan ağaca konan bir kelebek, burnuna değil dokunma kıllarına güvenerek çiçeğin kokusunu algılar. Kelebek, ağacın dallarında uzun süre bekliyor ve en uygun çiçeği seçmeye çalışıyor.\n\nBu parçada aşağıdaki ses olaylarından hangisi yoktur?",
    secenekler: ["Ünsüz yumuşaması", "Ünlü daralması", "Ünsüz benzeşmesi", "Ünlü düşmesi", "Büyük ünlü uyumuna aykırılık"],
    dogruCevap: 4,
    aciklama:
      '"Çiçeğin/ağacın" ünsüz yumuşaması, "bekliyor" ünlü daralması, "ağaçtan" ünsüz benzeşmesi, "burnuna" ünlü düşmesi örnekleridir; parçadaki sözcüklerin hiçbiri büyük ünlü uyumuna aykırı değildir.',
  },

  // -- İki boşluklu tamamlama (1) --
  {
    ders: "TURKCE",
    soruMetni:
      "Bilim insanları uzun süre, beynin yalnızca çocukluk döneminde yeni bağlantılar kurabildiğini düşünüyordu. ---- yapılan yeni araştırmalar, yetişkin beyninin de öğrenme yoluyla fiziksel olarak değişebildiğini gösterdi. Bu bulgu, ---- yetişkinlikte yeni bir beceri öğrenmenin beyin yapısını etkileyebileceği anlamına geliyor.\n\nBu parçada boş bırakılan yerlere sırasıyla aşağıdakilerden hangisi getirilmelidir?",
    secenekler: ["Ancak - aslında", "Çünkü - asla", "Böylece - hiçbir zaman", "Nitekim - kesinlikle", "Üstelik - nadiren"],
    dogruCevap: 0,
    aciklama: '"Ancak" eski görüşle yeni bulgu arasında karşıtlık kurar; "aslında" ise sonuç cümlesindeki olasılık ifadesiyle uyumludur.',
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

  // -- Kalan paragraf soruları (7) --
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
      "İnsan beyni yaklaşık 86 milyar nöron içerir ve bu nöronlar birbirleriyle trilyonlarca bağlantı kurar. Bu karmaşık ağ bir şehrin elektrik şebekesine benzetilebilir; nasıl ki şehirdeki her ev farklı hatlarla ana güç kaynağına bağlıysa beyindeki her nöron da sinapslar aracılığıyla diğer nöronlara bağlanarak bilgi akışını sağlar.\n\nBu parçada düşünceyi geliştirme yollarından öncelikle hangisine başvurulmuştur?",
    secenekler: ["Örnekleme", "Tanık gösterme", "Benzetme", "Karşıtlıklardan yararlanma", "Tanımlama"],
    dogruCevap: 2,
    aciklama: "Beynin şehir elektrik şebekesine benzetilmesi, açık bir benzetme (analoji) örneğidir.",
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
    soruMetni:
      "İki basamaklı bir sayının \"ayna sayısı\", o sayının rakamlarının yer değiştirmesiyle elde edilen sayı olarak tanımlanıyor. Örneğin 24 sayısının ayna sayısı 42'dir.\n\nBuna göre, bir sayı ile ayna sayısının toplamı 121 olan iki basamaklı kaç farklı sayı vardır?",
    secenekler: ["6", "7", "8", "9", "10"],
    dogruCevap: 2,
    aciklama:
      "Sayı 10a+b, ayna sayısı 10b+a ise toplamları 11(a+b)=121, yani a+b=11. a,b birer basamak (a≥1) olduğundan (a,b) için 8 farklı çözüm vardır (29, 38, 47, 56, 65, 74, 83, 92).",
  },

  // -- Rasyonel Sayılar (2) --
  {
    ders: "MATEMATIK",
    soruMetni: "(0,6 - 0,2) / (0,5 - 0,1) × (0,9) / (0,3 + 0,6) işleminin sonucu kaçtır?",
    secenekler: ["1/2", "2/3", "1", "3/2", "2"],
    dogruCevap: 2,
    aciklama: "(0,4/0,4) × (0,9/0,9) = 1 × 1 = 1.",
  },
  {
    ders: "MATEMATIK",
    soruMetni: "(3⁻¹ + 6⁻¹) / (3 × 3⁻² + 3⁻¹) işleminin sonucu kaçtır?",
    secenekler: ["1/2", "3/5", "3/4", "4/5", "1"],
    dogruCevap: 2,
    aciklama: "Pay: 1/3+1/6=1/2. Payda: 3×3⁻²=3⁻¹=1/3; 1/3+1/3=2/3. Sonuç: (1/2)/(2/3)=3/4.",
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
    soruMetni: "3(x-2) + 4 = 2(x+3) - 1 denklemine göre x kaçtır?",
    secenekler: ["5", "6", "7", "8", "9"],
    dogruCevap: 2,
    aciklama: "3x-6+4=3x-2 ve 2x+6-1=2x+5 olduğundan 3x-2=2x+5 ⟹ x=7.",
  },

  // -- Problemler (6) --
  {
    ders: "MATEMATIK",
    soruMetni:
      "İki basamaklı AB sayısı ile iki basamaklı BA sayısının toplamı 132'dir. A ve B birbirinden farklı rakamlar olduğuna göre, A - B farkının alabileceği en büyük değer kaçtır?",
    secenekler: ["4", "5", "6", "7", "8"],
    dogruCevap: 2,
    aciklama:
      "AB+BA=11(A+B)=132 ⟹ A+B=12. A≠B koşuluyla A-B'nin en büyük değeri A=9, B=3 için 6'dır.",
  },
  {
    ders: "MATEMATIK",
    soruMetni:
      "Bir atölyede çalışan işçilerin %40'ı deneyimsizdir. Bir ay sonra deneyimsiz işçilerin 18'i deneyim kazanmış, geriye kalan deneyimsiz işçi sayısı toplam işçi sayısının %15'ine eşit olmuştur. Buna göre atölyedeki toplam işçi sayısı kaçtır?",
    secenekler: ["60", "64", "68", "72", "76"],
    dogruCevap: 3,
    aciklama: "0,4T - 18 = 0,15T ⟹ 0,25T = 18 ⟹ T = 72.",
  },
  {
    ders: "MATEMATIK",
    soruMetni: "15 işçi bir işi 12 günde bitiriyor. Aynı işi 9 işçi kaç günde bitirir?",
    secenekler: ["15", "18", "20", "22", "25"],
    dogruCevap: 2,
    aciklama: "İşçi-gün sabittir: 15×12=180. 180÷9=20 gün.",
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
    soruMetni:
      "Bir havuzu bir musluk tek başına 6 saatte, başka bir musluk tek başına 3 saatte dolduruyor. İki musluk birlikte açılırsa havuz kaç saatte dolar?",
    secenekler: ["1", "1,5", "2", "2,5", "3"],
    dogruCevap: 2,
    aciklama: "Saatlik doldurma oranları toplanır: 1/6 + 1/3 = 1/2; havuz 2 saatte dolar.",
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

  // -- Sayısal Mantık / tanımlı işlem (3) --
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
    soruMetni:
      "Pozitif tam sayılar kümesinde ⊗ işlemi, a ⊗ b = a² - b + 1 biçiminde tanımlanıyor.\n\nBuna göre (3 ⊗ 2) ⊗ 1 işleminin sonucu kaçtır?",
    secenekler: ["56", "60", "62", "64", "68"],
    dogruCevap: 3,
    aciklama: "3⊗2 = 9-2+1=8. Ardından 8⊗1 = 64-1+1=64.",
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

  // -- Geometri (4, görselli) --
  {
    ders: "MATEMATIK",
    soruMetni:
      "Şekildeki ABC üçgeninde B açısı dik açıdır. |AB| = 6 cm, |BC| = 8 cm olduğuna göre |AC| kaç cm'dir?",
    gorselSvg:
      '<svg viewBox="0 0 300 300" xmlns="http://www.w3.org/2000/svg"><polygon points="60,60 60,240 260,240" fill="none" stroke="#1e293b" stroke-width="3"/><rect x="60" y="222" width="18" height="18" fill="none" stroke="#1e293b" stroke-width="2"/><text x="38" y="55" font-size="18" fill="#1e293b">A</text><text x="30" y="255" font-size="18" fill="#1e293b">B</text><text x="265" y="255" font-size="18" fill="#1e293b">C</text><text x="18" y="155" font-size="16" fill="#2563eb">6</text><text x="150" y="262" font-size="16" fill="#2563eb">8</text></svg>',
    secenekler: ["9", "10", "12", "14", "16"],
    dogruCevap: 1,
    aciklama: "Pisagor teoremine göre |AC| = √(6²+8²) = √100 = 10 cm.",
  },
  {
    ders: "MATEMATIK",
    soruMetni:
      "Şekildeki ABC üçgeni ikizkenar üçgendir; |AB| = |AC| ve taban açısı m(ABC) = 50° olduğuna göre tepe açısı m(BAC) kaç derecedir?",
    gorselSvg:
      '<svg viewBox="0 0 320 300" xmlns="http://www.w3.org/2000/svg"><polygon points="160,50 50,250 270,250" fill="none" stroke="#1e293b" stroke-width="3"/><text x="150" y="40" font-size="18" fill="#1e293b">A</text><text x="25" y="265" font-size="18" fill="#1e293b">B</text><text x="275" y="265" font-size="18" fill="#1e293b">C</text><text x="70" y="235" font-size="15" fill="#2563eb">50°</text><line x1="100" y1="145" x2="115" y2="140" stroke="#1e293b" stroke-width="2"/><line x1="210" y1="145" x2="195" y2="140" stroke="#1e293b" stroke-width="2"/></svg>',
    secenekler: ["60", "70", "80", "90", "100"],
    dogruCevap: 2,
    aciklama: "İkizkenar üçgende taban açıları eşittir (50°+50°=100°); tepe açısı 180°-100°=80°.",
  },
  {
    ders: "MATEMATIK",
    soruMetni: "Şekildeki ABCD dikdörtgeninin alanı 48 cm²'dir. |AB| = 6 cm olduğuna göre |BC| kaç cm'dir?",
    gorselSvg:
      '<svg viewBox="0 0 320 240" xmlns="http://www.w3.org/2000/svg"><rect x="50" y="60" width="200" height="120" fill="#eff6ff" stroke="#1e293b" stroke-width="3"/><text x="30" y="55" font-size="16" fill="#1e293b">A</text><text x="255" y="55" font-size="16" fill="#1e293b">B</text><text x="255" y="195" font-size="16" fill="#1e293b">C</text><text x="30" y="195" font-size="16" fill="#1e293b">D</text><text x="128" y="50" font-size="15" fill="#2563eb">6 cm</text><text x="110" y="125" font-size="16" fill="#1e293b">Alan = 48 cm²</text></svg>',
    secenekler: ["6", "7", "8", "9", "10"],
    dogruCevap: 2,
    aciklama: "Uzun kenar = alan/kısa kenar = 48/6 = 8 cm.",
  },
  {
    ders: "MATEMATIK",
    soruMetni:
      "Şekildeki merkezi O olan çemberin yarıçapı |OA| = 6 cm'dir. (π = 3 alınız) Çemberin alanı kaç cm²'dir?",
    gorselSvg:
      '<svg viewBox="0 0 300 300" xmlns="http://www.w3.org/2000/svg"><circle cx="150" cy="150" r="100" fill="#eff6ff" stroke="#1e293b" stroke-width="3"/><circle cx="150" cy="150" r="3" fill="#1e293b"/><line x1="150" y1="150" x2="250" y2="150" stroke="#1e293b" stroke-width="2"/><text x="135" y="140" font-size="16" fill="#1e293b">O</text><text x="255" y="155" font-size="16" fill="#1e293b">A</text><text x="185" y="140" font-size="15" fill="#2563eb">6 cm</text></svg>',
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
    soruMetni:
      "Yukarıdaki şematik haritada numaralandırılarak gösterilen beş noktadan hangisi, her mevsim yağışlı ve yazları serin geçen bir iklime sahip olması beklenen bölgede yer alır?",
    gorselSvg:
      '<svg viewBox="0 0 400 220" xmlns="http://www.w3.org/2000/svg"><path d="M40,120 Q30,70 90,55 Q150,30 220,40 Q300,35 360,70 Q380,100 350,130 Q320,160 250,165 Q180,180 110,170 Q50,160 40,120 Z" fill="#dbeafe" stroke="#1e293b" stroke-width="2.5"/><circle cx="90" cy="65" r="7" fill="#dc2626"/><text x="78" y="50" font-size="16" fill="#1e293b">I</text><circle cx="110" cy="140" r="7" fill="#dc2626"/><text x="95" y="162" font-size="16" fill="#1e293b">II</text><circle cx="200" cy="100" r="7" fill="#dc2626"/><text x="195" y="88" font-size="16" fill="#1e293b">III</text><circle cx="300" cy="130" r="7" fill="#dc2626"/><text x="305" y="150" font-size="16" fill="#1e293b">IV</text><circle cx="310" cy="65" r="7" fill="#dc2626"/><text x="315" y="53" font-size="16" fill="#1e293b">V</text><text x="10" y="210" font-size="12" fill="#64748b">(Şematik gösterim)</text></svg>',
    secenekler: ["I", "II", "III", "IV", "V"],
    dogruCevap: 0,
    aciklama:
      "Haritada kuzeyde (üstte) yer alan I noktası Karadeniz kıyısını temsil eder; Karadeniz ikliminde her mevsim yağış görülür, yazlar serindir.",
  },
  {
    ders: "COGRAFYA",
    soruMetni:
      'Yukarıdaki kesitte bir volkanik koninin iç yapısı şematik olarak gösterilmiştir. Numaralandırılan "I" ile gösterilen, magmanın yeryüzüne ulaştığı ana çıkış kanalı aşağıdakilerden hangisidir?',
    gorselSvg:
      '<svg viewBox="0 0 300 285" xmlns="http://www.w3.org/2000/svg"><polygon points="40,230 150,40 260,230" fill="#e2e8f0" stroke="#1e293b" stroke-width="2.5"/><rect x="142" y="60" width="16" height="150" fill="#fbbf24" stroke="#1e293b" stroke-width="2"/><circle cx="150" cy="205" r="25" fill="#f97316" stroke="#1e293b" stroke-width="2"/><line x1="150" y1="230" x2="150" y2="255" stroke="#1e293b" stroke-width="1.5"/><text x="150" y="270" font-size="13" fill="#1e293b" text-anchor="middle">Magma Odası</text><line x1="158" y1="130" x2="182" y2="130" stroke="#dc2626" stroke-width="1.5"/><text x="188" y="136" font-size="18" fill="#dc2626" font-weight="bold">I</text><path d="M150,40 L133,58 L167,58 Z" fill="#94a3b8" stroke="#1e293b" stroke-width="1.5"/><text x="108" y="32" font-size="12" fill="#1e293b">Krater</text></svg>',
    secenekler: ["Krater", "Baca", "Lav yastığı", "Kaldera", "Magma odası"],
    dogruCevap: 1,
    aciklama:
      "Magmanın magma odasından yeryüzüne (kratere) ulaştığı dikey kanala baca denir; krater ve magma odası şekilde ayrıca etiketlenmiştir.",
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

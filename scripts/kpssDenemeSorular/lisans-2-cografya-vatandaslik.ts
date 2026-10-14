/**
 * KPSS Lisans 2. parti - Cografya (18) ve Vatandaslik (9).
 * Haritalar gercek sinir verisiyle, iklim grafigi MGM verisiyle; Anayasa
 * sorulari 2017 degisikligi sonrasi guncel metne (mevzuat.gov.tr) gore.
 */
import { type SeedSoru, turkiyeHaritasi, iklimGrafigi } from "../kpssDenemeOrtak";

export const SORULAR: SeedSoru[] = [
  // ---- COĞRAFYA (18) ----
  {
    ders: "COGRAFYA",
    konu: "Coğrafi Konum",
    soruMetni:
      "Türkiye'nin kuzeyindeki Sinop (yaklaşık 42° K) ile güneyindeki Anamur (yaklaşık 36° K) karşılaştırıldığında;\n\nI. 21 Haziran'da gündüz süresi Sinop'ta daha uzundur.\nII. Öğle vakti Güneş ışınlarının geliş açısı yıl boyunca Anamur'da daha büyüktür.\nIII. 21 Aralık'ta gece süresi Anamur'da daha uzundur.\nIV. Yerin dönüş hareketine bağlı çizgisel hız Anamur'da daha fazladır.\n\nifadelerinden hangileri doğrudur?",
    secenekler: ["I ve II", "I ve III", "II ve IV", "I, II ve IV", "II, III ve IV"],
    dogruCevap: 3,
    aciklama:
      "Kuzey Yarım Küre'de yaz gün dönümünde (21 Haziran) kuzeye gidildikçe gündüz uzar (I doğru), kış gün dönümünde (21 Aralık) ise gece uzar; bu nedenle 21 Aralık'ta gece Sinop'ta daha uzundur (III yanlış). İki merkez de Yengeç Dönencesi'nin kuzeyinde olduğundan güneydeki Anamur'da ışınlar yıl boyunca daha dik gelir (II doğru). Çizgisel hız Ekvator'dan kutuplara doğru azaldığından Anamur'da daha fazladır (IV doğru).",
  },
  {
    ders: "COGRAFYA",
    konu: "Coğrafi Konum",
    soruMetni:
      "Türkiye, 2016 yılından bu yana yıl boyunca 45° doğu meridyeninin yerel saatini (UTC+3) ulusal saat olarak kullanmaktadır.\n\nBuna göre Greenwich'te (0° meridyeni) yerel saat 08.00 iken Türkiye'deki ulusal saat ile yaklaşık 30° doğu meridyeni üzerinde bulunan Eskişehir'in yerel saati sırasıyla kaçtır?",
    secenekler: ["11.00 – 10.00", "10.00 – 11.00", "11.00 – 11.00", "12.00 – 10.00", "11.00 – 12.00"],
    dogruCevap: 0,
    aciklama:
      "Her 1° boylam farkı 4 dakikalık yerel saat farkı oluşturur ve doğudaki yerin saati ileridir. Ulusal saat 45° D'ye göre ayarlandığından 45 × 4 = 180 dakika (3 saat) ileridir: 08.00 + 3 = 11.00. Eskişehir'in yerel saati 30 × 4 = 120 dakika (2 saat) ileridir: 08.00 + 2 = 10.00.",
  },
  {
    ders: "COGRAFYA",
    konu: "Yer Şekilleri ve Su Varlığı",
    soruMetni: "Haritada numaralandırılarak gösterilen göllerden hangisi oluşumu bakımından diğerlerinden farklıdır?",
    gorselSvg: turkiyeHaritasi({
      noktalar: [
        { etiket: "I", boylam: 39.38, enlem: 38.49 }, // Hazar Golu
        { etiket: "II", boylam: 41.65, enlem: 40.67 }, // Tortum Golu
        { etiket: "III", boylam: 30.25, enlem: 40.71 }, // Sapanca Golu
        { etiket: "IV", boylam: 33.38, enlem: 38.73 }, // Tuz Golu
        { etiket: "V", boylam: 28.57, enlem: 40.17 }, // Uluabat Golu
      ],
    }),
    secenekler: ["I", "II", "III", "IV", "V"],
    dogruCevap: 1,
    aciklama:
      "I Hazar (Elazığ), III Sapanca (Sakarya), IV Tuz Gölü ve V Uluabat (Bursa) yer kabuğu hareketleriyle oluşan çukurlukların sularla dolmasıyla meydana gelmiş tektonik göllerdir. II numaralı Tortum Gölü (Erzurum) ise vadinin heyelan malzemesiyle tıkanmasıyla oluşmuş bir heyelan set gölüdür.",
  },
  {
    ders: "COGRAFYA",
    konu: "Yer Şekilleri ve Su Varlığı",
    soruMetni:
      "Türkiye'deki akarsuların hidroelektrik enerji potansiyelleri yüksek, ulaşıma elverişlilikleri ise düşüktür.\n\nBu iki durumun ortak nedeni aşağıdakilerden hangisidir?",
    secenekler: [
      "Rejimlerinin düzensiz olması",
      "Akarsuların çoğunun kapalı havzalarda sona ermesi",
      "Ortalama yükseltinin fazla olması nedeniyle yatak eğimlerinin yüksek olması",
      "Yağışların mevsimlere dağılışının farklı olması",
      "Karstik arazilerin geniş yer kaplaması",
    ],
    dogruCevap: 2,
    aciklama:
      "Türkiye'nin ortalama yükseltisi fazla ve engebesi yüksek olduğundan akarsu yataklarının eğimi fazladır. Eğim, akış hızını ve düşüş yüksekliğini artırarak hidroelektrik potansiyelini yükseltir; hızlı akış, şelaleler ve çağlayanlar ise ulaşımı engeller. Rejim düzensizliği ulaşımı zorlaştırsa da hidroelektrik potansiyelini artırmaz; diğer seçenekler ise iki durumu birlikte açıklamaz.",
  },
  {
    ders: "COGRAFYA",
    konu: "Yer Şekilleri ve Su Varlığı",
    soruMetni:
      "Aşağıdaki ovalardan hangisi, bir akarsuyun denize döküldüğü yerde taşıdığı alüvyonları biriktirmesiyle oluşmuş bir delta ovası değildir?",
    secenekler: ["Bafra Ovası", "Çarşamba Ovası", "Silifke Ovası", "Çukurova", "Muş Ovası"],
    dogruCevap: 4,
    aciklama:
      "Bafra (Kızılırmak), Çarşamba (Yeşilırmak), Silifke (Göksu) ve Çukurova (Seyhan ve Ceyhan) delta ovalarıdır. Muş Ovası ise denizden çok uzakta, Doğu Anadolu'da yer alan tektonik kökenli bir ovadır.",
  },
  {
    ders: "COGRAFYA",
    konu: "İklim ve Bitki Örtüsü",
    soruMetni:
      "Grafiklerde bir meteoroloji istasyonuna ait uzun yıllar aylık ortalama sıcaklık ve aylık ortalama yağış değerleri verilmiştir.\n\nBu istasyonla ilgili aşağıdakilerden hangisi söylenemez?",
    // MGM, Erzurum uzun yillar (1929-2025) aylik ortalamalari.
    gorselSvg: iklimGrafigi(
      [-9.1, -7.6, -2.3, 5.4, 10.7, 14.9, 19.2, 19.6, 14.8, 8.2, 1.2, -5.7],
      [21.3, 25.3, 35.4, 55.1, 73.3, 48.2, 28.8, 17.5, 23.9, 46.9, 33.0, 21.8],
    ),
    secenekler: [
      "Yıllık sıcaklık farkı fazladır ve karasallık belirgindir.",
      "En yağışlı mevsim ilkbahardır.",
      "Kış aylarında yağışlar büyük ölçüde kar şeklinde düşer.",
      "Yaz kuraklığına uyum sağlamış maki toplulukları yaygındır.",
      "Aylık ortalama sıcaklığın 0 °C'nin altında kaldığı dönem kış aylarıyla sınırlı değildir.",
    ],
    dogruCevap: 3,
    aciklama:
      "Grafik Erzurum'a aittir (MGM, 1929-2025). Ocak ile ağustos arasında yaklaşık 29 °C sıcaklık farkı vardır (A). İlkbahar toplamı yaklaşık 164 mm ile en yüksektir (B). Aralık-mart arası ortalamalar 0 °C'nin altında olduğundan kış yağışları kar şeklindedir (C) ve donlu dönem ilkbaharın ilk ayı marta da uzanır (E). Maki ise ılık ve yağışlı kışlı, sıcak ve kurak yazlı Akdeniz ikliminin bitki örtüsüdür; bu sert karasal iklimde görülmez.",
  },
  {
    ders: "COGRAFYA",
    konu: "İklim ve Bitki Örtüsü",
    soruMetni:
      "Haritada taralı olarak gösterilen illerde doğal bitki örtüsünün büyük ölçüde bozkır olmasının temel nedeni aşağıdakilerden hangisidir?",
    gorselSvg: turkiyeHaritasi({ taraliIller: ["Konya", "Aksaray", "Karaman", "Kırşehir", "Nevşehir"] }),
    secenekler: [
      "Yağışların az olması ve yaz kuraklığının uzun sürmesi",
      "Ortalama yükseltinin deniz seviyesine yakın olması",
      "Kış sıcaklıklarının yüksek olması",
      "Nemli deniz rüzgârlarının etkisinde kalınması",
      "Bakı etkisinin belirgin olması",
    ],
    dogruCevap: 0,
    aciklama:
      "Taralı iller (Konya, Aksaray, Karaman, Kırşehir, Nevşehir) İç Anadolu'dadır. Çevresi dağlarla çevrili bu alana nemli deniz rüzgârları ulaşamaz; yağış az, yaz kuraklığı uzun olduğundan ağaç gelişemez ve ilkbahar yağışlarıyla yeşerip yazın kuruyan otsu bozkır bitkileri yaygınlaşır. Yükselti deniz seviyesine yakın değildir, kışlar soğuktur.",
  },
  {
    ders: "COGRAFYA",
    konu: "İklim ve Bitki Örtüsü",
    soruMetni:
      "Türkiye'de özellikle ilkbahar sonu ve yaz başında, öğleden sonraları kısa süreli sağanak ve dolu şeklinde düşen \"kırkikindi\" yağışları görülür.\n\nBu yağışların en sık görüldüğü bölge ile oluşum türü aşağıdakilerin hangisinde birlikte verilmiştir?",
    secenekler: [
      "Karadeniz kıyıları – Orografik (yamaç)",
      "İç Anadolu – Konveksiyonel (yükselim)",
      "Ege kıyıları – Cephesel",
      "Akdeniz kıyıları – Orografik (yamaç)",
      "Marmara – Cephesel",
    ],
    dogruCevap: 1,
    aciklama:
      "İlkbahar sonunda gün içinde güçlü biçimde ısınan karalar üzerindeki nemli hava yükselir, soğuyup yoğunlaşarak öğleden sonra sağanak yağış bırakır. Konveksiyonel (yükselim) yağışı olan kırkikindiler en çok İç Anadolu'da görülür. Orografik yağış nemli havanın dağ yamacı boyunca yükselmesiyle, cephesel yağış ise sıcak ve soğuk hava kütlelerinin karşılaşmasıyla oluşur.",
  },
  {
    ders: "COGRAFYA",
    konu: "Toprak ve Doğal Çevre",
    soruMetni:
      "Konya'nın Karapınar ilçesinde geçmişte doğal bozkır örtüsünün sürülerek tarlaya dönüştürülmesi ve aşırı otlatma sonucu rüzgâr erozyonu şiddetlenmiş, hareketli kum tepeleri yerleşmeleri tehdit eder hâle gelmiştir. Bu sorun ağaçlandırma ve rüzgâr perdeleriyle büyük ölçüde kontrol altına alınmıştır.\n\nKarapınar'da rüzgâr erozyonunun şiddetlenmesinde aşağıdakilerden hangisinin etkisi en azdır?",
    secenekler: [
      "Yağışın az olması",
      "Doğal bitki örtüsünün tahrip edilmesi",
      "Arazinin düz ve rüzgâra açık olması",
      "Toprağın kuru ve gevşek olması",
      "Arazinin eğiminin fazla olması",
    ],
    dogruCevap: 4,
    aciklama:
      "Rüzgâr erozyonu; kurak iklim, seyrek ya da tahrip edilmiş bitki örtüsü, kuru ve gevşek toprak ile rüzgârın engelsiz estiği düz alanlarda şiddetlenir. Karapınar, Konya Ovası'nın düz bir kesimindedir. Eğimin fazla olması ise akarsu ve sel sularıyla oluşan su erozyonunu artıran bir etkendir; rüzgâr erozyonunda belirleyici değildir.",
  },
  {
    ders: "COGRAFYA",
    konu: "Beşeri Coğrafya",
    soruMetni: "Türkiye'de görülen köy altı (geçici veya sürekli) yerleşme tipleri ile yaygın oldukları yöreler eşleştirilmiştir.\n\nBu eşleştirmelerden hangisi yanlıştır?",
    secenekler: [
      "Mezra – Doğu ve Güneydoğu Anadolu",
      "Divan – Güneydoğu Anadolu",
      "Çiftlik – Çukurova",
      "Oba – Toros Dağları",
      "Yayla – Doğu Karadeniz",
    ],
    dogruCevap: 1,
    aciklama:
      "Divan, birkaç mahallenin bir araya gelmesiyle oluşan ve Batı Karadeniz'de (Kastamonu, Bartın, Sinop çevresi) görülen bir köy altı yerleşmesidir. Mezra Doğu ve Güneydoğu Anadolu'da, çiftlik Çukurova gibi geniş tarım alanlarında, oba Toroslardaki göçer topluluklarda, yayla ise özellikle Doğu Karadeniz'de yaygındır.",
  },
  {
    ders: "COGRAFYA",
    konu: "Beşeri Coğrafya",
    soruMetni:
      "Türkiye'de son yıllarda toplam doğurganlık hızı, nüfusun kendini yenileme düzeyi kabul edilen 2,1'in altına düşmüş; ortanca yaş ise sürekli yükselmektedir.\n\nBu eğilimin sürmesi durumunda;\n\nI. çalışma çağındaki nüfusun toplam nüfus içindeki oranının azalması,\nII. emeklilik ve sağlık harcamalarının artması,\nIII. ilkokul çağındaki nüfusun oranının artması,\nIV. yaşlı bakım hizmetlerine olan talebin artması\n\ndurumlarından hangilerinin ortaya çıkması beklenir?",
    secenekler: ["I ve III", "II ve III", "I, II ve IV", "II, III ve IV", "I, III ve IV"],
    dogruCevap: 2,
    aciklama:
      "Doğurganlığın düşmesi ve ortanca yaşın yükselmesi nüfusun yaşlandığını gösterir. Yaşlanan nüfusta zamanla çalışma çağındaki nüfusun oranı azalır (I), emeklilik ve sağlık harcamaları (II) ile yaşlı bakım hizmetlerine talep (IV) artar. Doğum sayısı azaldığından ilkokul çağındaki nüfusun oranı artmaz, azalır (III).",
  },
  {
    ders: "COGRAFYA",
    konu: "Beşeri Coğrafya",
    soruMetni: "Aşağıdaki şehir – gelişiminde öne çıkan ekonomik fonksiyon eşleştirmelerinden hangisi yanlıştır?",
    secenekler: [
      "Zonguldak – Taş kömürü madenciliği",
      "Mersin – Liman ve ticaret",
      "Kuşadası – Turizm",
      "Karabük – Demir-çelik sanayisi",
      "Kırıkkale – Bor madenciliği",
    ],
    dogruCevap: 4,
    aciklama:
      "Kırıkkale, Makine ve Kimya Endüstrisi tesisleri (savunma sanayisi) ile rafinerisiyle gelişmiştir; Türkiye'de bor yatakları ise Balıkesir, Eskişehir, Kütahya ve Bursa'da bulunur. Zonguldak taş kömürü madenciliği, Mersin liman ve ticaret, Kuşadası turizm, Karabük ise demir-çelik sanayisiyle gelişmiştir.",
  },
  {
    ders: "COGRAFYA",
    konu: "Tarım",
    soruMetni:
      "Türkiye'de çay tarımı, Rize başta olmak üzere Doğu Karadeniz'in kıyı kuşağında yoğunlaşmış ve bu alanın dışına yayılamamıştır.\n\nBu durumda çay bitkisinin;\n\nI. yıl boyunca bol ve düzenli yağış istemesi,\nII. kışların ılık geçmesini istemesi,\nIII. asidik (kireçsiz) toprakları sevmesi,\nIV. olgunlaşma döneminde yüksek sıcaklık ve kuraklık istemesi\n\nözelliklerinden hangileri etkili olmuştur?",
    secenekler: ["I, II ve III", "I ve IV", "II ve IV", "I, III ve IV", "II, III ve IV"],
    dogruCevap: 0,
    aciklama:
      "Çay; her mevsim bol yağış, ılık kışlar ve asidik topraklar ister. Bu koşulların bir arada bulunduğu tek alan Doğu Karadeniz kıyı kuşağıdır (I, II, III). Olgunlaşma döneminde yüksek sıcaklık ve kuraklık isteyen ürünler ise pamuk, tahıl gibi ürünlerdir; çay yaz kuraklığına dayanıksızdır (IV yanlış).",
  },
  {
    ders: "COGRAFYA",
    konu: "Madenler ve Enerji Kaynakları",
    soruMetni:
      "Haritada numaralandırılarak gösterilen yerlerdeki elektrik santrallerinden hangisinde elektrik, yenilenemeyen bir enerji kaynağından üretilir?",
    gorselSvg: turkiyeHaritasi({
      noktalar: [
        { etiket: "I", boylam: 38.76, enlem: 38.81 }, // Keban Baraji (Elazig)
        { etiket: "II", boylam: 28.86, enlem: 37.95 }, // Kizildere JES (Denizli)
        { etiket: "III", boylam: 28.14, enlem: 37.34 }, // Yatagan TES (Mugla)
        { etiket: "IV", boylam: 38.32, enlem: 37.48 }, // Ataturk Baraji (Sanliurfa-Adiyaman)
        { etiket: "V", boylam: 41.7, enlem: 41.17 }, // Deriner Baraji (Artvin)
      ],
    }),
    secenekler: ["I", "II", "III", "IV", "V"],
    dogruCevap: 2,
    aciklama:
      "I Keban (Fırat), IV Atatürk (Fırat) ve V Deriner (Çoruh) hidroelektrik; II Denizli'deki Kızıldere ise jeotermal santraldir ve bunlar yenilenebilir kaynak kullanır. III numaralı Muğla-Yatağan'daki santral, yenilenemeyen bir kaynak olan linyitle çalışan termik santraldir.",
  },
  {
    ders: "COGRAFYA",
    konu: "Madenler ve Enerji Kaynakları",
    soruMetni: "Türkiye'nin fosil enerji kaynaklarıyla ilgili aşağıdaki ifadelerden hangisi yanlıştır?",
    secenekler: [
      "Linyit, ülkemizde rezervi en fazla olan fosil yakıttır.",
      "Taş kömürü üretimi büyük ölçüde Zonguldak Havzası'nda yapılır.",
      "Doğal gaz ihtiyacının büyük bölümü ithalatla karşılanır.",
      "Ham petrol ihtiyacının tamamına yakını yurt içi üretimle karşılanır.",
      "Ham petrol üretimi büyük ölçüde Güneydoğu Anadolu Bölgesi'nde yapılır.",
    ],
    dogruCevap: 3,
    aciklama:
      "Türkiye'nin ham petrol üretimi (Batman, Adıyaman, Şırnak, Diyarbakır çevresi) tüketiminin küçük bir bölümünü karşılar; ihtiyacın büyük kısmı ithal edilir. Linyit en büyük rezerve sahip fosil yakıttır, taş kömürü Zonguldak Havzası'nda çıkarılır ve doğal gazın büyük bölümü ithal edilir.",
  },
  {
    ders: "COGRAFYA",
    konu: "Sanayi",
    soruMetni: "Aşağıdaki sanayi tesislerinden hangisinin kuruluş yeri seçiminde etkili olan temel faktör diğerlerinden farklıdır?",
    secenekler: [
      "Rize'deki çay fabrikaları",
      "İzmit'teki Tüpraş rafinerisi",
      "Seydişehir'deki alüminyum tesisleri",
      "Afyonkarahisar'daki mermer işleme tesisleri",
      "Konya'daki şeker fabrikası",
    ],
    dogruCevap: 1,
    aciklama:
      "Çay fabrikaları (yaş çay), Seydişehir alüminyum tesisleri (boksit), Afyonkarahisar mermer tesisleri (mermer yatakları) ve Konya şeker fabrikası (şeker pancarı) ham maddeye yakınlık esas alınarak kurulmuştur. İzmit'teki rafineri ise ham petrolün deniz yoluyla getirilebildiği bir kıyıda, ürünlerin en çok tüketildiği Marmara pazarına yakın kurulmuştur.",
  },
  {
    ders: "COGRAFYA",
    konu: "Ulaşım",
    soruMetni: "Aşağıdaki ulaşım yapılarından hangisi Asya ile Avrupa kıtalarını birbirine bağlamaz?",
    secenekler: ["Marmaray", "Avrasya Tüneli", "1915 Çanakkale Köprüsü", "Osmangazi Köprüsü", "Yavuz Sultan Selim Köprüsü"],
    dogruCevap: 3,
    aciklama:
      "Osmangazi Köprüsü, İzmit Körfezi üzerinde Kocaeli (Dilovası) ile Yalova (Altınova) arasında yer alır; iki yakası da Asya kıtasındadır. Marmaray, Avrasya Tüneli ve Yavuz Sultan Selim Köprüsü İstanbul Boğazı'nı, 1915 Çanakkale Köprüsü ise Çanakkale Boğazı'nı geçerek iki kıtayı birbirine bağlar.",
  },
  {
    ders: "COGRAFYA",
    konu: "Turizm",
    soruMetni: "UNESCO Dünya Mirası Listesi'nde yer alan aşağıdaki alanlardan hangisi Ege Bölgesi'nde bulunmaz?",
    secenekler: ["Göbeklitepe", "Efes", "Aphrodisias", "Hierapolis-Pamukkale", "Bergama (Pergamon)"],
    dogruCevap: 0,
    aciklama:
      "Göbeklitepe, Güneydoğu Anadolu Bölgesi'nde Şanlıurfa'dadır. Efes ve Bergama İzmir'de, Aphrodisias Aydın'da, Hierapolis-Pamukkale ise Denizli'de olup Ege Bölgesi'nde yer alır.",
  },

  // ---- VATANDAŞLIK (9) ----
  {
    ders: "VATANDASLIK",
    konu: "Hukuka Giriş",
    soruMetni: "Türk Medeni Kanunu'na göre aşağıdaki kişilerden hangisi tam ehliyetlidir?",
    secenekler: [
      "Akıl hastalığı nedeniyle kısıtlanmış, 20 yaşındaki Mehmet",
      "Ayırt etme gücüne sahip, evli olmayan 17 yaşındaki Can",
      "Kendi isteği ve velisinin rızasıyla mahkeme kararıyla ergin kılınmış, ayırt etme gücüne sahip 16 yaşındaki Ayşe",
      "Ayırt etme gücünü sürekli olarak yitirmiş 25 yaşındaki Zeynep",
      "Velisinin izniyle bir iş yerinde çalışan 14 yaşındaki Ali",
    ],
    dogruCevap: 2,
    aciklama:
      "TMK md. 10'a göre ayırt etme gücüne sahip ve kısıtlı olmayan her ergin kişinin fiil ehliyeti vardır. Erginlik 18 yaşın doldurulmasıyla başlar; evlenme ya da on beş yaşını dolduran küçüğün kendi isteği ve velisinin rızasıyla mahkeme kararıyla ergin kılınması da kişiyi ergin yapar (md. 11-12). Ayşe üç koşulu da taşır. Mehmet kısıtlı, Can ve Ali ergin değil, Zeynep ise ayırt etme gücünden yoksundur.",
  },
  {
    ders: "VATANDASLIK",
    konu: "Anayasa ve Genel Esaslar",
    soruMetni:
      "1982 Anayasası'nın 4. maddesine göre aşağıdakilerden hangisi değiştirilemeyecek ve değiştirilmesi teklif edilemeyecek hükümler arasında yer almaz?",
    secenekler: [
      "Devletin şeklinin Cumhuriyet olması",
      "Cumhuriyetin demokratik, laik ve sosyal bir hukuk devleti olması",
      "Devletin dilinin Türkçe olması",
      "Başkentin Ankara olması",
      "Egemenliğin kayıtsız şartsız Millete ait olması",
    ],
    dogruCevap: 4,
    aciklama:
      "4. madde; devlet şeklinin Cumhuriyet olduğuna ilişkin 1. madde, Cumhuriyetin niteliklerine ilişkin 2. madde ve ülke bütünlüğü, dil, bayrak, millî marş ve başkente ilişkin 3. madde hükümlerini değiştirilemez kılar. Egemenliğin kayıtsız şartsız Millete ait olduğu ise 6. maddede düzenlenmiştir ve 4. maddenin koruması kapsamında değildir.",
  },
  {
    ders: "VATANDASLIK",
    konu: "Yasama",
    soruMetni: "1982 Anayasası'na göre aşağıdakilerden hangisi tek başına milletvekili seçilmeye engel değildir?",
    secenekler: [
      "En az ilkokul mezunu olmamak",
      "Taksirli bir suçtan toplam iki yıl hapis cezasına hüküm giymiş olmak",
      "Kısıtlı olmak",
      "Askerlikle ilişiği olmak",
      "Kamu hizmetinden yasaklı olmak",
    ],
    dogruCevap: 1,
    aciklama:
      "Anayasa md. 76'ya göre en az ilkokul mezunu olmayanlar, kısıtlılar, askerlikle ilişiği olanlar, kamu hizmetinden yasaklılar ve taksirli suçlar hariç toplam bir yıl veya daha fazla hapis cezasına hüküm giymiş olanlar milletvekili seçilemez. Hapis cezası taksirli bir suçtan verilmişse süresi ne olursa olsun bu engel oluşmaz.",
  },
  {
    ders: "VATANDASLIK",
    konu: "Yasama",
    soruMetni: "1982 Anayasası'nın 2017 değişikliği sonrası hâline göre TBMM ve seçimlerle ilgili aşağıdakilerden hangisi yanlıştır?",
    secenekler: [
      "TBMM, üye tamsayısının salt çoğunluğuyla seçimlerin yenilenmesine karar verebilir.",
      "TBMM 600 milletvekilinden oluşur.",
      "TBMM ve Cumhurbaşkanlığı seçimleri beş yılda bir aynı günde yapılır.",
      "TBMM'nin seçimlerin yenilenmesine karar vermesi hâlinde TBMM genel seçimi ile Cumhurbaşkanlığı seçimi birlikte yapılır.",
      "Süresi biten milletvekili yeniden seçilebilir.",
    ],
    dogruCevap: 0,
    aciklama:
      "Anayasa md. 116'ya göre TBMM, salt çoğunlukla değil üye tamsayısının beşte üç çoğunluğuyla (360) seçimlerin yenilenmesine karar verebilir; bu hâlde TBMM ve Cumhurbaşkanlığı seçimleri birlikte yapılır. TBMM 600 milletvekilinden oluşur (md. 75); seçimler beş yılda bir aynı günde yapılır ve süresi biten milletvekili yeniden seçilebilir (md. 77).",
  },
  {
    ders: "VATANDASLIK",
    konu: "Yürütme",
    soruMetni: "1982 Anayasası'nın güncel hâline göre Cumhurbaşkanlığı seçimiyle ilgili aşağıdakilerden hangisi yanlıştır?",
    secenekler: [
      "Kırk yaşını doldurmuş ve yükseköğrenim yapmış olmak gerekir.",
      "Görev süresi beş yıldır; bir kimse en fazla iki defa Cumhurbaşkanı seçilebilir.",
      "En az yüz bin seçmen aday gösterebilir.",
      "Cumhurbaşkanı seçilen kişinin, varsa partisiyle ilişiği kesilir.",
      "Cumhurbaşkanı seçilen milletvekilinin TBMM üyeliği sona erer.",
    ],
    dogruCevap: 3,
    aciklama:
      "Cumhurbaşkanı seçilenin partisiyle ilişiğinin kesileceğine dair hüküm 2017 değişikliğiyle md. 101'den çıkarılmıştır; Cumhurbaşkanı partisinin üyesi olarak kalabilir. Kırk yaş ve yükseköğrenim şartı, beş yıllık görev süresi, en fazla iki dönem kuralı, yüz bin seçmenin aday gösterebilmesi ve seçilen milletvekilinin TBMM üyeliğinin sona ermesi md. 101'de yer alır.",
  },
  {
    ders: "VATANDASLIK",
    konu: "Yürütme",
    soruMetni:
      "Cumhurbaşkanlığı makamının, TBMM genel seçimlerine iki yıldan fazla süre varken ölüm nedeniyle boşaldığı varsayılsın.\n\n1982 Anayasası'na göre bu durumda;\n\nI. Kırk beş gün içinde Cumhurbaşkanı seçimi yapılır.\nII. Yenisi seçilene kadar Cumhurbaşkanı yardımcısı Cumhurbaşkanlığına vekâlet eder.\nIII. TBMM seçimi de Cumhurbaşkanı seçimiyle birlikte yenilenir.\nIV. Seçilen Cumhurbaşkanı TBMM seçim tarihine kadar görevine devam eder ve bu süre dönemden sayılmaz.\n\nifadelerinden hangileri doğrudur?",
    secenekler: ["I ve II", "I ve III", "I, II ve IV", "II, III ve IV", "I, II, III ve IV"],
    dogruCevap: 2,
    aciklama:
      "Anayasa md. 106'ya göre makam boşalırsa kırk beş gün içinde seçim yapılır ve yenisi seçilene kadar Cumhurbaşkanı yardımcısı vekâlet eder (I, II). TBMM seçimi ancak genel seçime bir yıl veya daha az kalmışsa birlikte yenilenir; bir yıldan fazla süre varken seçilen Cumhurbaşkanı TBMM seçim tarihine kadar görev yapar ve bu süre dönemden sayılmaz (IV doğru, III yanlış).",
  },
  {
    ders: "VATANDASLIK",
    konu: "İdari Yapı",
    soruMetni:
      "Bir ilin valisi, kanunun doğrudan kendisine tanıdığı bir yetkiye dayanarak ilindeki bir konuda Ankara'daki merkezî makamlara danışmadan karar almış ve bu kararı uygulatmıştır.\n\nValinin bu şekilde karar alabilmesi, merkezî idarenin aşağıdaki esaslarından hangisinin sonucudur?",
    secenekler: ["Hiyerarşi", "Yetki genişliği", "İdari vesayet", "Hizmet yönünden yerinden yönetim", "Yer yönünden yerinden yönetim"],
    dogruCevap: 1,
    aciklama:
      "Anayasa md. 126'ya göre illerin idaresi yetki genişliği esasına dayanır: merkezî idarenin taşradaki temsilcileri, merkeze sormadan kendi adlarına karar alabilir. Vali merkezî idarenin bir parçası olduğundan bu durum yerinden yönetim değildir; hiyerarşi üst makamın alt makam üzerindeki denetimini, idari vesayet ise merkezin yerinden yönetim kuruluşları üzerindeki denetimini ifade eder.",
  },
  {
    ders: "VATANDASLIK",
    konu: "İdari Yapı",
    soruMetni:
      "1982 Anayasası'na göre mahallî idarelerle ilgili;\n\nI. Seçimleri beş yılda bir yapılır.\nII. Seçilmiş organlarının organlık sıfatını kaybetmeleri konusundaki denetim yargı yoluyla olur.\nIII. Görevleriyle ilgili bir suç sebebiyle haklarında soruşturma açılan organlarını, İçişleri Bakanı geçici bir tedbir olarak kesin hükme kadar görevden uzaklaştırabilir.\nIV. Merkezî idare, mahallî idareler üzerinde hiyerarşi yetkisine sahiptir.\n\nifadelerinden hangileri doğrudur?",
    secenekler: ["I ve II", "I ve IV", "II ve III", "III ve IV", "I, II ve III"],
    dogruCevap: 4,
    aciklama:
      "I, II ve III ifadeleri Anayasa md. 127'de yer alır. Merkezî idarenin mahallî idareler üzerindeki yetkisi ise hiyerarşi değil, kanunda belirtilen esas ve usuller dâhilinde kullanılan idari vesayettir; hiyerarşi aynı tüzel kişilik içinde, merkezî idarenin kendi birimleri arasında söz konusudur.",
  },
  {
    ders: "VATANDASLIK",
    konu: "İdari Yapı",
    soruMetni: "Aşağıdakilerden hangisi merkezî idarenin başkent teşkilatında yer almaz?",
    secenekler: ["Kaymakamlık", "Cumhurbaşkanı", "Cumhurbaşkanı yardımcıları", "Bakanlıklar", "Millî Güvenlik Kurulu"],
    dogruCevap: 0,
    aciklama:
      "Merkezî idarenin başkent teşkilatı Cumhurbaşkanı, Cumhurbaşkanı yardımcıları, bakanlıklar ve Millî Güvenlik Kurulu gibi yardımcı kuruluşlardan oluşur. Kaymakamlık ise ilçede merkezî idareyi temsil eden taşra teşkilatı birimidir.",
  },
];

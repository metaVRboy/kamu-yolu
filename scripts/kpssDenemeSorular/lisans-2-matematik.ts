import { type SeedSoru } from "../kpssDenemeOrtak";

const OTOPARK =
  "Bir otoparkta ücretlendirme aşağıdaki kurallara göre yapılmaktadır:\n\n• İlk 1 saat veya daha kısa süre için 60 TL alınır.\n• İlk 1 saatten sonraki her yarım saat veya yarım saatten kısa süre için 20 TL eklenir.\n• 24 saati aşmayan bir kalış için alınan ücret 300 TL'yi geçemez.";

const DIZI =
  "a₁, a₂, a₃, … biçiminde devam eden bir sayı dizisinde 3. terimden itibaren her terim, kendinden önceki iki terimin toplamına eşittir. Bu dizide a₅ = 18 ve a₇ = 47'dir.";

export const SORULAR: SeedSoru[] = [
  // ---- MATEMATİK (30) ----
  {
    ders: "MATEMATIK",
    konu: "Temel Kavramlar",
    soruMetni:
      "A doğal sayısı 6 ile bölündüğünde 4, 8 ile bölündüğünde 6, 9 ile bölündüğünde 7 kalanını vermektedir.\n\nBuna göre A'nın alabileceği en küçük üç basamaklı değerin rakamları toplamı kaçtır?",
    secenekler: ["5", "6", "7", "8", "9"],
    dogruCevap: 2,
    aciklama:
      "Her bölmede kalan, bölenden 2 eksiktir; bu yüzden A + 2 sayısı 6, 8 ve 9'a tam bölünür. EKOK(6, 8, 9) = 72 olduğundan A = 72k − 2 biçimindedir: 70, 142, … En küçük üç basamaklı değer 142'dir; rakamları toplamı 1 + 4 + 2 = 7.",
  },
  {
    ders: "MATEMATIK",
    konu: "Temel Kavramlar",
    soruMetni: "x ve y pozitif tam sayılar olmak üzere\n\n12 · x = y³\n\nolduğuna göre x + y toplamının alabileceği en küçük değer kaçtır?",
    secenekler: ["12", "15", "18", "20", "24"],
    dogruCevap: 4,
    aciklama:
      "12 = 2² · 3 olduğundan 12x'in tam küp olması için x en az 2 · 3² = 18 olmalıdır. Bu durumda 12 · 18 = 216 = 6³ ⇒ y = 6. x + y = 18 + 6 = 24.",
  },
  {
    ders: "MATEMATIK",
    konu: "Temel Kavramlar",
    soruMetni:
      "Rakamlarının çarpımı, rakamlarının toplamına eşit olan doğal sayılara \"dengeli sayı\" denir. Örneğin 1124 sayısı dengelidir; çünkü 1 · 1 · 2 · 4 = 1 + 1 + 2 + 4 = 8'dir.\n\nBuna göre üç basamaklı kaç tane dengeli sayı vardır?",
    secenekler: ["2", "3", "4", "6", "9"],
    dogruCevap: 3,
    aciklama:
      "Rakamlardan biri 0 olursa çarpım 0, toplam ise pozitif olur; bu yüzden 0 kullanılamaz. a ≤ b ≤ c rakamları için abc = a + b + c denklemi incelenirse a = 1, b = 2 ⇒ 2c = 3 + c ⇒ c = 3 tek çözümdür (a = b = 1 veya a, b ≥ 2 durumlarında çözüm çıkmaz). 1, 2, 3 rakamlarıyla 3! = 6 farklı sayı yazılır.",
  },
  {
    ders: "MATEMATIK",
    konu: "Rasyonel ve Ondalık Sayılar",
    soruMetni: "{0,36|0,4} + {0,15|0,05} − {1,2|0,24}\n\nişleminin sonucu kaçtır?",
    secenekler: ["−1,1", "−0,9", "0,9", "1,1", "1,9"],
    dogruCevap: 0,
    aciklama: "{0,36|0,4} = {36|40} = 0,9; {0,15|0,05} = 3; {1,2|0,24} = 5. Sonuç 0,9 + 3 − 5 = −1,1.",
  },
  {
    ders: "MATEMATIK",
    konu: "Rasyonel ve Ondalık Sayılar",
    soruMetni: "x = 2/3, y = 5/7, z = 7/10\n\nolduğuna göre aşağıdaki sıralamalardan hangisi doğrudur?",
    secenekler: ["x < y < z", "x < z < y", "y < x < z", "z < x < y", "y < z < x"],
    dogruCevap: 1,
    aciklama:
      "Paydalar 210'da eşitlenirse x = 140/210, y = 150/210, z = 147/210 olur. Buna göre x < z < y'dir.",
  },
  {
    ders: "MATEMATIK",
    konu: "Basit Eşitsizlikler",
    soruMetni:
      "x ve y tam sayılar olmak üzere\n\n−4 < x < 3\n1 < y < 6\n\nolduğuna göre x² − y ifadesinin alabileceği en büyük değer ile en küçük değerin toplamı kaçtır?",
    secenekler: ["−5", "−2", "0", "2", "4"],
    dogruCevap: 3,
    aciklama:
      "x ∈ {−3, −2, −1, 0, 1, 2} ⇒ 0 ≤ x² ≤ 9; y ∈ {2, 3, 4, 5}. En büyük değer x = −3, y = 2 için 9 − 2 = 7; en küçük değer x = 0, y = 5 için 0 − 5 = −5. Toplam 7 + (−5) = 2.",
  },
  {
    ders: "MATEMATIK",
    konu: "Mutlak Değer",
    soruMetni: "|x − 2| + |x + 4| = 10\n\ndenklemini sağlayan x değerlerinin çarpımı kaçtır?",
    secenekler: ["−24", "−12", "−8", "8", "24"],
    dogruCevap: 0,
    aciklama:
      "x ≥ 2 için 2x + 2 = 10 ⇒ x = 4. −4 ≤ x < 2 için ifade 6'ya eşittir, çözüm yoktur. x < −4 için −2x − 2 = 10 ⇒ x = −6. Çarpım 4 · (−6) = −24.",
  },
  {
    ders: "MATEMATIK",
    konu: "Üslü Sayılar",
    soruMetni: "4ˣ = 3 olduğuna göre\n\n{8ˣ⁺¹|2ˣ}\n\nifadesinin değeri kaçtır?",
    secenekler: ["12", "18", "24", "27", "36"],
    dogruCevap: 2,
    aciklama: "{8ˣ⁺¹|2ˣ} = {2³ˣ⁺³|2ˣ} = 2²ˣ⁺³ = (2²)ˣ · 2³ = 4ˣ · 8 = 3 · 8 = 24.",
  },
  {
    ders: "MATEMATIK",
    konu: "Üslü Sayılar",
    soruMetni: "a = 2³⁰, b = 3²⁰, c = 5¹⁰\n\nolduğuna göre aşağıdaki sıralamalardan hangisi doğrudur?",
    secenekler: ["a < b < c", "a < c < b", "b < a < c", "b < c < a", "c < a < b"],
    dogruCevap: 4,
    aciklama: "Üsler 10'da eşitlenir: a = (2³)¹⁰ = 8¹⁰, b = (3²)¹⁰ = 9¹⁰, c = 5¹⁰. Tabanlar karşılaştırılırsa 5 < 8 < 9 ⇒ c < a < b.",
  },
  {
    ders: "MATEMATIK",
    konu: "Köklü Sayılar",
    soruMetni: "√(7 + 4√3) − √(7 − 4√3)\n\nişleminin sonucu kaçtır?",
    secenekler: ["2", "2√3", "4", "3√3", "4√3"],
    dogruCevap: 1,
    aciklama:
      "7 + 4√3 = (2 + √3)² ve 7 − 4√3 = (2 − √3)²'dir. 2 − √3 > 0 olduğundan ifade (2 + √3) − (2 − √3) = 2√3 olur.",
  },
  {
    ders: "MATEMATIK",
    konu: "Çarpanlara Ayırma",
    soruMetni: "a − b = 3\na · b = 5\n\nolduğuna göre a³ − b³ ifadesinin değeri kaçtır?",
    secenekler: ["54", "63", "72", "81", "90"],
    dogruCevap: 2,
    aciklama: "a³ − b³ = (a − b)³ + 3ab(a − b) = 3³ + 3 · 5 · 3 = 27 + 45 = 72.",
  },
  {
    ders: "MATEMATIK",
    konu: "Denklem Çözme",
    soruMetni: "{x|2} + {y|3} = 7\n{x|3} − {y|4} = −1\n\nolduğuna göre x + y toplamı kaçtır?",
    secenekler: ["12", "15", "16", "18", "20"],
    dogruCevap: 3,
    aciklama:
      "Paydalar eşitlenirse 3x + 2y = 42 ve 4x − 3y = −12 elde edilir. Birinci denklem 3, ikinci 2 ile çarpılıp toplanırsa 17x = 102 ⇒ x = 6; buradan 2y = 24 ⇒ y = 12. x + y = 18.",
  },
  {
    ders: "MATEMATIK",
    konu: "Sayı Problemleri",
    soruMetni:
      "Bir salondaki öğrenciler sıralara üçer üçer oturduğunda 4 öğrenci ayakta kalıyor. Öğrenciler dörder dörder oturduğunda ise 2 sıra tamamen boş kalıyor, bir sırada yalnızca 1 öğrenci oturuyor, diğer sıraların hepsi dolu oluyor.\n\nBuna göre salonda kaç öğrenci vardır?",
    secenekler: ["46", "49", "52", "55", "58"],
    dogruCevap: 1,
    aciklama:
      "Sıra sayısı n olsun. Üçer oturunca öğrenci sayısı 3n + 4'tür. Dörder oturunca n − 3 sıra dolu, bir sırada 1 öğrenci vardır: 4(n − 3) + 1. 3n + 4 = 4n − 11 ⇒ n = 15; öğrenci sayısı 3 · 15 + 4 = 49.",
  },
  {
    ders: "MATEMATIK",
    konu: "Yaş Problemleri",
    soruMetni:
      "Bir babanın bugünkü yaşı, iki çocuğunun bugünkü yaşları toplamının 3 katıdır. 6 yıl sonra babanın yaşı, çocuklarının o zamanki yaşları toplamının 2 katı olacaktır.\n\nBuna göre çocukların yaşları toplamı babanın yaşına eşit olduğunda baba kaç yaşında olur?",
    secenekler: ["70", "75", "80", "85", "90"],
    dogruCevap: 4,
    aciklama:
      "Çocukların yaşları toplamı c, babanın yaşı 3c olsun. 6 yıl sonra 3c + 6 = 2(c + 12) ⇒ c = 18, baba 54 yaşındadır. t yıl sonra 54 + t = 18 + 2t ⇒ t = 36; baba o zaman 54 + 36 = 90 yaşında olur. (Her yıl babanın yaşı 1, çocukların yaşları toplamı 2 artar.)",
  },
  {
    ders: "MATEMATIK",
    konu: "Hareket Problemleri",
    soruMetni:
      "Çevresi 600 metre olan dairesel bir pistte aynı noktadan aynı anda zıt yönlerde koşmaya başlayan iki koşucu 40 saniye sonra ilk kez karşılaşıyor. Bu koşucular aynı noktadan aynı anda aynı yönde koşmaya başlasaydı hızlı olan, yavaş olana 200 saniye sonra ilk kez yetişecekti.\n\nHızlar sabit olduğuna göre hızlı koşucunun hızı saniyede kaç metredir?",
    secenekler: ["6", "7", "8", "9", "10"],
    dogruCevap: 3,
    aciklama:
      "Hızlar v₁ > v₂ olsun. Zıt yönde: (v₁ + v₂) · 40 = 600 ⇒ v₁ + v₂ = 15. Aynı yönde hızlı olan bir tur fazla koşunca yetişir: (v₁ − v₂) · 200 = 600 ⇒ v₁ − v₂ = 3. Buradan v₁ = 9 m/sn.",
  },
  {
    ders: "MATEMATIK",
    konu: "Yüzde-Kâr-Zarar ve Faiz Problemleri",
    soruMetni:
      "Bir tüccar aldığı malın %40'ını %25 kârla, kalanını ise %10 zararla satmıştır. Tüccarın bu satışların tamamından elde ettiği kâr 480 TL'dir.\n\nBuna göre malın tamamının maliyeti kaç TL'dir?",
    secenekler: ["12.000", "14.400", "15.000", "16.000", "18.000"],
    dogruCevap: 0,
    aciklama:
      "Maliyet M olsun. Kâr: 0,40M · 0,25 = 0,10M; zarar: 0,60M · 0,10 = 0,06M. Net kâr 0,04M = 480 ⇒ M = 12.000 TL.",
  },
  {
    ders: "MATEMATIK",
    konu: "Yüzde-Kâr-Zarar ve Faiz Problemleri",
    soruMetni:
      "Bir kişi parasının yarısını yıllık %40 basit faiz oranıyla 9 aylığına, diğer yarısını yıllık %30 basit faiz oranıyla 1 yıllığına bankaya yatırmıştır. Süreler sonunda iki hesaptan toplam 5400 TL faiz almıştır.\n\nBuna göre bu kişinin bankaya yatırdığı paranın tamamı kaç TL'dir?",
    secenekler: ["15.000", "16.000", "18.000", "20.000", "24.000"],
    dogruCevap: 2,
    aciklama:
      "Para P olsun. Birinci faiz: (P/2) · 0,40 · (9/12) = 0,15P. İkinci faiz: (P/2) · 0,30 · 1 = 0,15P. Toplam 0,30P = 5400 ⇒ P = 18.000 TL.",
  },
  {
    ders: "MATEMATIK",
    konu: "Kümeler",
    soruMetni:
      "A ve B kümeleri için s(A) = 12, s(B) = 15 ve s(A ∪ B) = 21'dir.\n\nBuna göre B \\ A kümesinin alt küme sayısı, A \\ B kümesinin alt küme sayısının kaç katıdır?",
    secenekler: ["2", "3", "4", "8", "16"],
    dogruCevap: 3,
    aciklama:
      "s(A ∩ B) = 12 + 15 − 21 = 6. s(A \\ B) = 12 − 6 = 6, s(B \\ A) = 15 − 6 = 9. Alt küme sayıları 2⁶ = 64 ve 2⁹ = 512'dir; 512 / 64 = 8.",
  },
  {
    ders: "MATEMATIK",
    konu: "Bağıntı ve Fonksiyon",
    soruMetni:
      "Gerçek sayılarda tanımlı f ve g fonksiyonları\n\nf(x) = 3x − 2\ng(x) = {x + 4|2}\n\nbiçimindedir.\n\nBuna göre (f ∘ g⁻¹)(3) + (g ∘ f)(4) toplamı kaçtır?",
    secenekler: ["10", "11", "12", "13", "14"],
    dogruCevap: 1,
    aciklama:
      "g⁻¹(x) = 2x − 4 ⇒ g⁻¹(3) = 2 ve f(2) = 4. f(4) = 10 ve g(10) = 14/2 = 7. Toplam 4 + 7 = 11.",
  },
  {
    ders: "MATEMATIK",
    konu: "İşlem",
    soruMetni:
      "Gerçek sayılar kümesinde ∆ işlemi\n\na ∆ b = ab − a − b + 2\n\nbiçiminde tanımlanıyor.\n\n(2 ∆ x) ∆ 3 = 7\n\nolduğuna göre x kaçtır?",
    secenekler: ["2", "3", "4", "5", "6"],
    dogruCevap: 2,
    aciklama:
      "a ∆ b = (a − 1)(b − 1) + 1 biçiminde yazılabilir. 2 ∆ x = 1 · (x − 1) + 1 = x. x ∆ 3 = 2(x − 1) + 1 = 2x − 1 = 7 ⇒ x = 4.",
  },
  {
    ders: "MATEMATIK",
    konu: "Olasılık",
    soruMetni:
      "Hilesiz iki zar birlikte atılıyor. Üst yüze gelen sayıların çarpımının çift sayı olduğu bilinmektedir.\n\nBuna göre bu sayıların toplamının 7 olma olasılığı kaçtır?",
    secenekler: ["1/6", "2/9", "1/4", "2/7", "1/3"],
    dogruCevap: 1,
    aciklama:
      "36 durumdan çarpımın tek olduğu durumlar (iki zar da tek) 3 · 3 = 9'dur; çarpımın çift olduğu 27 durum vardır. Toplamı 7 olan 6 durumun her birinde bir zar tek, diğeri çift olduğundan altısının da çarpımı çifttir. Olasılık 6/27 = 2/9.",
  },
  {
    ders: "MATEMATIK",
    konu: "Sayısal Mantık",
    grupId: "l2-mat-otopark",
    soruMetni: `${OTOPARK}\n\nBu otoparka saat 09.40'ta giren bir araç saat 13.05'te çıktığına göre aracın sahibi kaç TL ödemiştir?`,
    secenekler: ["120", "130", "140", "150", "160"],
    dogruCevap: 4,
    aciklama:
      "Kalış süresi 3 saat 25 dakikadır. İlk 1 saat için 60 TL ödenir; kalan 2 saat 25 dakika, 4 tam yarım saat ve 25 dakikalık bir parçadan oluşur, yani 5 dilim · 20 TL = 100 TL. Toplam 160 TL.",
  },
  {
    ders: "MATEMATIK",
    konu: "Sayısal Mantık",
    grupId: "l2-mat-otopark",
    soruMetni: `${OTOPARK}\n\nBu otoparkta aracı için 220 TL ödeyen bir sürücünün aracı otoparkta en fazla kaç dakika kalmıştır?`,
    secenekler: ["240", "270", "285", "300", "330"],
    dogruCevap: 3,
    aciklama:
      "220 − 60 = 160 TL, 160 / 20 = 8 yarım saatlik dilime karşılık gelir. Süre ilk saatin üzerine 8 dilimi aşmamalıdır: en fazla 60 + 8 · 30 = 300 dakika.",
  },
  {
    ders: "MATEMATIK",
    konu: "Sayısal Mantık",
    grupId: "l2-mat-otopark",
    soruMetni: `${OTOPARK}\n\nBu otoparkta 5 saat 10 dakika kalan bir araç için ödenen ücret ile 9 saat kalan bir araç için ödenen ücret arasındaki fark kaç TL'dir?`,
    secenekler: ["60", "80", "100", "120", "140"],
    dogruCevap: 0,
    aciklama:
      "5 saat 10 dakika: ilk saatten sonra 4 saat 10 dakika kalır, 9 dilim ⇒ 60 + 9 · 20 = 240 TL. 9 saat: ilk saatten sonra 8 saat, 16 dilim ⇒ 60 + 320 = 380 TL olurdu, ancak üst sınır nedeniyle 300 TL ödenir. Fark 300 − 240 = 60 TL.",
  },
  {
    ders: "MATEMATIK",
    konu: "Sayısal Mantık",
    grupId: "l2-mat-dizi",
    soruMetni: `${DIZI}\n\nBuna göre dizinin ilk terimi olan a₁ kaçtır?`,
    secenekler: ["2", "3", "4", "5", "6"],
    dogruCevap: 1,
    aciklama:
      "a₇ = a₅ + a₆ ⇒ a₆ = 29. Geriye doğru: a₄ = a₆ − a₅ = 11, a₃ = a₅ − a₄ = 7, a₂ = a₄ − a₃ = 4, a₁ = a₃ − a₂ = 3.",
  },
  {
    ders: "MATEMATIK",
    konu: "Sayısal Mantık",
    grupId: "l2-mat-dizi",
    soruMetni: `${DIZI}\n\nBuna göre dizinin ilk 8 teriminin toplamı kaçtır?`,
    secenekler: ["119", "150", "176", "189", "195"],
    dogruCevap: 4,
    aciklama:
      "Dizinin terimleri 3, 4, 7, 11, 18, 29, 47, 76, … biçimindedir (a₈ = 29 + 47 = 76). İlk 8 terimin toplamı 3 + 4 + 7 + 11 + 18 + 29 + 47 + 76 = 195.",
  },
  {
    ders: "MATEMATIK",
    konu: "Sayısal Mantık",
    soruMetni:
      "Dijital bir saat, günün zamanını 00:00 ile 23:59 arasında saat ve dakika olarak dört rakamla göstermektedir. Örneğin saat 13:31'de ekrandaki rakamlar soldan sağa ve sağdan sola aynı biçimde okunmaktadır.\n\nBuna göre bir gün boyunca ekrandaki dört rakamın soldan sağa ve sağdan sola aynı okunduğu kaç farklı an vardır?",
    secenekler: ["12", "14", "16", "18", "24"],
    dogruCevap: 2,
    aciklama:
      "Saat ab ise dakika ba olmalıdır. Dakikanın onlar basamağı b en fazla 5 olabileceğinden saatin birler basamağı 0-5 arasındadır. a = 0 için 00-05 (6), a = 1 için 10-15 (6), a = 2 için 20-23 (4) saat uygundur. Toplam 6 + 6 + 4 = 16 an.",
  },
  // -- Geometri (3, görselli) --
  {
    ders: "MATEMATIK",
    konu: "Özel Üçgenler",
    geometri: true,
    soruMetni:
      "Şekildeki ABC üçgeninde m(ABC) = 45°, m(ACB) = 30° ve |AC| = 8 cm'dir.\n\nBuna göre ABC üçgeninin alanı kaç cm²'dir?",
    gorselSvg:
      '<svg viewBox="0 85 400 175" xmlns="http://www.w3.org/2000/svg" font-family="Arial, sans-serif" fill="#1e293b"><polygon points="30,230 357.8,230 150,110" fill="none" stroke="#1e293b" stroke-width="2.5"/><path d="M58,230 A28,28 0 0,0 49.8,210.2" fill="none" stroke="#1e293b" stroke-width="1.5"/><path d="M321.8,230 A36,36 0 0,1 326.6,212" fill="none" stroke="#1e293b" stroke-width="1.5"/><text x="144" y="102" font-size="15">A</text><text x="12" y="248" font-size="15">B</text><text x="362" y="248" font-size="15">C</text><text x="62" y="224" font-size="13" fill="#dc2626">45°</text><text x="286" y="224" font-size="13" fill="#dc2626">30°</text><text x="262" y="160" font-size="13" fill="#dc2626">8</text></svg>',
    secenekler: ["8 + 8√3", "8 + 4√3", "16 + 8√3", "12 + 4√3", "16√3"],
    dogruCevap: 0,
    aciklama:
      "A'dan [BC]'ye dikme [AH] çizilir. AHC üçgeni 30°-60°-90° üçgenidir: |AH| = 8/2 = 4, |HC| = 4√3. AHB üçgeni 45°-45°-90° üçgenidir: |BH| = |AH| = 4. |BC| = 4 + 4√3 ⇒ Alan = {(4 + 4√3) · 4|2} = 8 + 8√3 cm².",
  },
  {
    ders: "MATEMATIK",
    konu: "Dörtgenler ve Çokgenler",
    geometri: true,
    soruMetni:
      "Şekildeki ABCD paralelkenarında E noktası [BC] kenarının orta noktasıdır. [AE] doğru parçası ile [BD] köşegeni F noktasında kesişmektedir.\n\nTaralı BEF üçgeninin alanı 3 cm² olduğuna göre ABCD paralelkenarının alanı kaç cm²'dir?",
    gorselSvg:
      '<svg viewBox="0 60 360 180" xmlns="http://www.w3.org/2000/svg" font-family="Arial, sans-serif" fill="#1e293b"><polygon points="260,210 295,145 210,166.7" fill="#bfdbfe" stroke="none"/><polygon points="40,210 260,210 330,80 110,80" fill="none" stroke="#1e293b" stroke-width="2.5"/><line x1="40" y1="210" x2="295" y2="145" stroke="#1e293b" stroke-width="2"/><line x1="260" y1="210" x2="110" y2="80" stroke="#1e293b" stroke-width="2"/><text x="24" y="228" font-size="15">A</text><text x="262" y="228" font-size="15">B</text><text x="334" y="76" font-size="15">C</text><text x="96" y="76" font-size="15">D</text><text x="302" y="150" font-size="15">E</text><text x="206" y="188" font-size="15">F</text></svg>',
    secenekler: ["24", "27", "30", "32", "36"],
    dogruCevap: 4,
    aciklama:
      "Paralelkenarın alanı S olsun. [BE] ∥ [AD] ve |BE| = |AD|/2 olduğundan FBE ile FDA üçgenleri benzerdir (oran 1/2) ⇒ |FE| = |AE|/3. Alan(ABE) = S/4 (taban BC'nin yarısı, yükseklik aynı). Alan(BEF) = Alan(ABE)/3 = S/12 = 3 ⇒ S = 36 cm².",
  },
  {
    ders: "MATEMATIK",
    konu: "Analitik Geometri",
    geometri: true,
    soruMetni:
      "Dik koordinat düzleminde verilen şekildeki ABCD karesinin köşelerinden ikisi A(2, 0) ve B(6, 3) noktalarıdır.\n\nBuna göre C köşesinin apsisi ile ordinatının toplamı kaçtır?",
    gorselSvg:
      '<svg viewBox="0 10 320 255" xmlns="http://www.w3.org/2000/svg" font-family="Arial, sans-serif" fill="#1e293b"><line x1="10" y1="230" x2="300" y2="230" stroke="#1e293b" stroke-width="1.5"/><polygon points="300,230 292,226 292,234" fill="#1e293b"/><line x1="60" y1="255" x2="60" y2="20" stroke="#1e293b" stroke-width="1.5"/><polygon points="60,20 56,28 64,28" fill="#1e293b"/><text x="292" y="250" font-size="14">x</text><text x="68" y="28" font-size="14">y</text><text x="44" y="248" font-size="14">O</text><polygon points="110,230 210,155 135,55 35,130" fill="none" stroke="#1e293b" stroke-width="2.5"/><text x="96" y="250" font-size="14">A(2, 0)</text><text x="216" y="160" font-size="14">B(6, 3)</text><text x="130" y="47" font-size="15">C</text><text x="18" y="126" font-size="15">D</text></svg>',
    secenekler: ["10", "11", "12", "13", "15"],
    dogruCevap: 0,
    aciklama:
      "B'den x eksenine dikme inilirse kenarları 4 ve 3 olan bir dik üçgen oluşur. Karede [BC] ⊥ [AB] ve |BC| = |AB| olduğundan C'ye geçerken bu üçgen 90° döner: x'te 3 birim geri, y'de 4 birim yukarı. C = (6 − 3, 3 + 4) = (3, 7); 3 + 7 = 10.",
  },
];

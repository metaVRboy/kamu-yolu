/**
 * KPSS Önlisans 2. parti - Türkçe (30) + Matematik (30). Sıra KONU_DAGILIMI.ONLISANS ile aynı.
 * Matematik cevapları ve sözel mantık çözümleri betikle (tüm dizilişler taranarak) doğrulandı.
 */
import { type SeedSoru, sutunGrafigi } from "../kpssDenemeOrtak";

const ISIK =
  "Geceleri kentlerin üzerinde beliren turuncu parıltı, çoğumuza modern yaşamın sıradan bir parçası gibi gelir. Oysa gereğinden fazla ve yanlış yönlendirilmiş yapay ışık, bilim insanlarının “ışık kirliliği” adını verdiği ciddi bir sorundur. Kumsalda yumurtadan çıkan deniz kaplumbağası yavruları, denizin üzerindeki doğal parıltı yerine kıyıdaki otel ve yol ışıklarına yönelerek yollarını kaybedebilir. Geceleri göç eden bazı kuşlar da aydınlatılmış yüksek binaların çevresinde yönünü şaşırabilir. Sorun yalnızca hayvanları ilgilendirmez: Gece boyunca ışığa maruz kalmak, insanlarda uyku düzenini bozan etkenlerden biri olarak görülür. Işık kirliliğinin belki de en sevindirici yanı, çözümünün o kadar zor olmamasıdır. Işığı yalnızca gereken yere ve gereken saatlerde yönlendiren aydınlatmalar kullanmak, pek çok yerde gökyüzünü yeniden yıldızlarla doldurmaya yetebilir.";

const YEMEK =
  "Yemek, bir toplumun kimliğini en uzun süre koruyan ögelerden biridir. Başka bir ülkeye göç eden insanlar, zamanla o ülkenin dilini öğrenir, giyimini benimser, hatta kendi adlarını bile yeni çevrelerine uygun biçimde değiştirebilir; ama mutfaklarında annelerinden öğrendikleri tarifleri pişirmeyi çoğu zaman sürdürür. Bunun nedeni yalnızca damak alışkanlığı değildir. Bayram sofrasında hazırlanan bir tatlı, bir düğünde ikram edilen bir yemek, insana ait olduğu topluluğu ve geride bıraktığı yerleri hatırlatır. Yine de göçmen mutfakları olduğu gibi kalmaz. Yeni ülkede bulunamayan malzemelerin yerine yenileri konur, tarifler yerel damak zevkine göre değişir ve sonunda ne tamamen eskiye ne de tamamen yeniye benzeyen tatlar ortaya çıkar.";

const NOBET =
  "Aslı, Burak, Cansu, Doruk, Emre ve Fatma adlı altı görevli, pazartesiden cumartesiye kadar olan altı günde, her gün bir kişi olacak biçimde birer gün nöbet tutmaktadır. Nöbet çizelgesiyle ilgili şunlar bilinmektedir:\n- Cansu, Burak'ın nöbetinin hemen ertesi günü nöbet tutmaktadır.\n- Doruk, Emre'den daha önceki bir günde nöbet tutmaktadır.\n- Fatma pazartesi ve cumartesi günleri nöbet tutmamaktadır.\n- Aslı ile Emre art arda günlerde nöbet tutmamaktadır.\n- Aslı'nın nöbeti haftanın ilk üç gününden birinde değildir.\n- Doruk pazartesi günü nöbet tutmamaktadır.";

const FIDAN = "Bir fidanlığın ocak-mayıs aylarında sattığı fidan sayıları aşağıdaki sütun grafiğinde gösterilmiştir.";
const FIDAN_GRAFIGI = sutunGrafigi(["Ocak", "Şubat", "Mart", "Nisan", "Mayıs"], [40, 60, 30, 70, 50], 80, 10, "Satılan fidan sayısı");

const MAKINE =
  "Bir sayı makinesi, kendisine girilen pozitif tam sayı tek ise bu sayının 3 katının 1 fazlasını, çift ise yarısını çıktı olarak vermektedir. Makineden çıkan her sayı yeniden makineye girilmektedir.";

export const SORULAR: SeedSoru[] = [
  // ---- TÜRKÇE (30) ----
  {
    ders: "TURKCE",
    konu: "Sözcükte Anlam",
    soruMetni: "Aşağıdaki cümlelerin hangisinde “açık” sözcüğü “eksik, noksan” anlamında kullanılmıştır?",
    secenekler: [
      "Açık renkli perdeler odayı daha ferah gösteriyordu.",
      "Kapıyı açık bırakınca içeri soğuk hava doldu.",
      "Teknemiz açık denize çıkınca dalgalar büyüdü.",
      "Ay sonunda yapılan sayımda kasada iki yüz liralık açık çıktı.",
      "Herkese karşı açık davranan biri olduğu için sevilirdi.",
    ],
    dogruCevap: 3,
    aciklama:
      "D'de “açık çıkmak”, hesapta eksik bulunması demektir. A'da “rengi koyu olmayan”, B'de “kapalı olmayan”, C'de “kıyıdan uzak”, E'de “içten, bir şey saklamayan” anlamındadır.",
  },
  {
    ders: "TURKCE",
    konu: "Sözcükte Anlam",
    soruMetni: "Aşağıdaki cümlelerin hangisinde deyim, anlamına uygun bir bağlamda kullanılmamıştır?",
    secenekler: [
      "Yıllarca biriktirdiği parayı dolandırıcılara kaptırınca ağzı kulaklarına vardı.",
      "Kazandığı ödülü duyunca etekleri zil çaldı.",
      "Uyarılarımıza kulak asmadı, yine bildiğini okudu.",
      "Borçlarının altından kalkabilmek için gece gündüz çalıştı.",
      "Komşu çocuklarının bitmek bilmeyen gürültüsü sonunda canına tak etti.",
    ],
    dogruCevap: 0,
    aciklama:
      "“Ağzı kulaklarına varmak” çok sevinmek demektir; parasını dolandırıcılara kaptıran birinin durumuyla çelişir. Diğer deyimler (çok sevinmek, önemsememek, üstesinden gelmek, dayanamaz hâle gelmek) bağlama uygundur.",
  },
  {
    ders: "TURKCE",
    konu: "Cümlede Anlam",
    soruMetni: "Aşağıdaki cümlelerin hangisinde açıkça söylenmeyen ama cümleden çıkarılabilen bir yargı (örtülü anlam) vardır?",
    secenekler: [
      "Toplantı yarın saat üçte başlayacak.",
      "Çocuklar bahçede top oynuyor.",
      "Bu yıl kardeşim de üniversite sınavını kazandı.",
      "Yağmur yüzünden maç ertelendi.",
      "Kitabı bir haftada okuyup bitirdi.",
    ],
    dogruCevap: 2,
    aciklama:
      "C'deki “de” bağlacı, kardeşten başka birinin (konuşan ya da bir başkasının) da sınavı kazandığını sezdirir; bu örtülü anlamdır. Diğer cümleler yalnızca söylediklerini bildirir.",
  },
  {
    ders: "TURKCE",
    konu: "Sözcük Türleri",
    soruMetni: "Aşağıdaki cümlelerin hangisinde “ile” sözcüğü (ya da eki) bağlaç görevinde kullanılmıştır?",
    secenekler: [
      "Mektubu kurşun kalem ile yazmıştı.",
      "Arkadaşıyla saatlerce sohbet etti.",
      "Bu haberi büyük bir sevinç ile karşıladı.",
      "İstanbul'a trenle gitmeyi tercih etti.",
      "Annesi ile babası bu akşam tiyatroya gidecek.",
    ],
    dogruCevap: 4,
    aciklama:
      "E'de “ile” iki adı eş görevde bağlar ve yerine “ve” getirilebilir (Annesi ve babası); bağlaçtır. A ve D'de araç, B'de birliktelik, C'de durum bildirdiği için edattır.",
  },
  {
    ders: "TURKCE",
    konu: "Sözcükte Yapı",
    soruMetni: "Aşağıdaki cümlelerin hangisinde isimden fiil yapım eki almış bir sözcük vardır?",
    secenekler: [
      "Yorgun adımlarla eve döndü.",
      "Akşam olunca gökyüzü yavaş yavaş karardı.",
      "Yazdığı şiirleri defterine geçirdi.",
      "Sevgi dolu bakışlarla bizi süzdü.",
      "Okuldan dönünce ödevlerini yaptı.",
    ],
    dogruCevap: 1,
    aciklama:
      "“Kar-ar-dı” sözcüğünde “kara” adına “-r” isimden fiil yapım eki gelmiştir. A'daki “yorgun, adım”, D'deki “sevgi, dolu, bakış” fiilden isim; C'deki “geçir-” fiilden fiil türemiştir.",
  },
  {
    ders: "TURKCE",
    konu: "Cümlenin Ögeleri",
    soruMetni: "Aşağıdaki cümlelerin hangisinde dolaylı tümleç yoktur?",
    secenekler: [
      "Mektubu postaneden gönderdi.",
      "Çocuklar akşama kadar parkta oynadı.",
      "Bu haberi herkesten saklamıştı.",
      "Bayram tatilinde köydeki dedesini ziyaret etti.",
      "Annesine güzel bir hediye aldı.",
    ],
    dogruCevap: 3,
    aciklama:
      "D'de “Bayram tatilinde” zaman bildirdiği için zarf tümleci, “köydeki dedesini” belirtili nesnedir; dolaylı tümleç yoktur. A'da “postaneden”, B'de “parkta”, C'de “herkesten”, E'de “annesine” dolaylı tümleçtir.",
  },
  {
    ders: "TURKCE",
    konu: "Ses Bilgisi",
    soruMetni: "Aşağıdaki cümlelerin hangisinde hem ünlü düşmesi hem de ünsüz yumuşaması vardır?",
    secenekler: [
      "Kitabını okuduktan sonra fikrini açıkça söyledi.",
      "Ağzını açmadan sessizce dinledi.",
      "Ağacın dalları rüzgârda sallanıyordu.",
      "Oğlunun okulundaki törene katıldı.",
      "Dolabın kapağını açık bıraktı.",
    ],
    dogruCevap: 0,
    aciklama:
      "A'da “kitap → kitabı” ünsüz yumuşaması, “fikir → fikri” ünlü düşmesidir. B'de (ağzı) ve D'de (oğlu) yalnızca ünlü düşmesi; C'de (ağacın) ve E'de (dolabın, kapağı) yalnızca ünsüz yumuşaması vardır.",
  },
  {
    ders: "TURKCE",
    konu: "Yazım Kuralları",
    soruMetni: "Aşağıdaki cümlelerin hangisinde yazım yanlışı yapılmıştır?",
    secenekler: [
      "Doğu Anadolu'da kışlar uzun ve sert geçer.",
      "Haftaya cuma günü yeniden görüşelim.",
      "Bu konuda hiç bir açıklama yapmadan salondan ayrıldı.",
      "Saat on biri çeyrek geçe evden çıktı.",
      "Tatilde birçok eski dostuyla bir araya geldi.",
    ],
    dogruCevap: 2,
    aciklama:
      "“Hiçbir” bitişik yazılır. Bölge adı “Doğu Anadolu” büyük harfle, belirli bir tarih bildirmeyen gün adı “cuma” küçük harfle; “on bir”, “birçok” ve “bir araya” ise doğru yazılmıştır.",
  },
  {
    ders: "TURKCE",
    konu: "Noktalama İşaretleri",
    soruMetni: "Aşağıdaki cümlelerin hangisinde noktalama işareti yanlış kullanılmıştır?",
    secenekler: [
      "Eyvah, otobüsü kaçırdık!",
      "Sınava gelirken şunları yanınızda getirin: kimlik kartı, sınav giriş belgesi ve kurşun kalem.",
      "Kitap, defter ve kalemlerini çantasına yerleştirdi.",
      "Çocuk, annesini görünce sevinçle koşmaya başladı.",
      "Bu kitabı kimin yazdığını hâlâ hatırlayamıyorum?",
    ],
    dogruCevap: 4,
    aciklama:
      "E'de soru sözcüğü (kimin) bulunsa da cümle soru anlamı taşımaz; sonuna soru işareti değil nokta konmalıdır. A'da ünlemden sonra virgül, B'de açıklama öncesi iki nokta, C'de eş görevli sözcükler arasında ve D'de özneden sonra virgül doğru kullanılmıştır.",
  },
  {
    ders: "TURKCE",
    konu: "Anlatım Bozuklukları",
    soruMetni: "Aşağıdaki cümlelerin hangisinde anlatım bozukluğu vardır?",
    secenekler: [
      "Sınavdan önceki gece erkenden yatıp dinlendi.",
      "Ne ödevini yaptı ne de derslerine çalışmadı.",
      "Öğretmenimiz konuyu örneklerle açıklayınca herkes daha kolay anladı.",
      "Bu sorunun çözümü için hepimizin çaba göstermesi gerekiyor.",
      "Kardeşim hem resim yapmayı hem de müzik dinlemeyi çok sever.",
    ],
    dogruCevap: 1,
    aciklama:
      "“Ne… ne…” bağlacı cümleye olumsuzluk anlamı kattığı için yüklemin olumlu olması gerekir: “Ne ödevini yaptı ne de derslerine çalıştı.” B'de anlamca çelişki vardır.",
  },
  {
    ders: "TURKCE",
    konu: "Paragrafta Anlam",
    soruMetni:
      "Bir çalgıyı ustalıkla çalan müzisyeni dinlerken çoğumuz onun doğuştan gelen bir yeteneğe sahip olduğunu düşünürüz. Oysa sahnede birkaç dakikada izlediğimiz o kusursuz performansın ardında, kimsenin görmediği binlerce saatlik bir çalışma vardır. Aynı pasajı yüzlerce kez yinelemek, yanlışları tek tek ayıklamak ve bunu yıllarca sürdürmek, yeteneği olan herkesin göze alabileceği bir şey değildir. Bu yüzden yetenek bir başlangıç noktası olabilir; ama ustalığa giden yolu, o yolda sabırla yürüyenler tamamlar.\n\nBu parçada asıl anlatılmak istenen aşağıdakilerden hangisidir?",
    secenekler: [
      "Ustalık, yetenekten çok uzun soluklu ve sabırlı bir çalışmanın ürünüdür.",
      "Yeteneği olmayan biri hiçbir alanda başarılı olamaz.",
      "Müzisyenlerin sahne performansları çoğu zaman abartılır.",
      "Dinleyiciler müzisyenlerin çalışma süreçlerini merak eder.",
      "Yetenekli kişiler çalışmaya daha az ihtiyaç duyar.",
    ],
    dogruCevap: 0,
    aciklama:
      "Parça, kusursuz performansın ardında yıllarca süren sabırlı bir çalışma olduğunu ve yeteneğin yalnızca başlangıç noktası sayılabileceğini vurgular. E bu düşüncenin tersidir; B, C ve D'ye değinilmemiştir.",
  },
  {
    ders: "TURKCE",
    konu: "Paragrafta Anlam",
    soruMetni:
      "Damla sulama, suyu borular ve damlatıcılar aracılığıyla doğrudan bitkinin kök bölgesine ulaştıran bir yöntemdir. Salma sulamada tarlanın tamamı suyla kaplandığı için suyun önemli bir kısmı buharlaşarak ya da toprağın derinlerine sızarak kaybolur; damla sulamada ise bu kayıp büyük ölçüde önlenir. Yalnızca bitkinin dibi ıslandığından sıra aralarında yabancı otlar da daha az gelişir. Gübrenin sulama suyuna karıştırılarak verilebilmesi de üreticiye zaman kazandırır. Ne var ki sistemin ilk kurulum maliyeti, birçok küçük üreticinin bu yönteme geçmesini zorlaştırmaktadır.\n\nBu parçada damla sulamayla ilgili aşağıdakilerden hangisine değinilmemiştir?",
    secenekler: [
      "Su kaybını azalttığına",
      "Yabancı otların gelişimini sınırladığına",
      "Gübrelemeyi kolaylaştırdığına",
      "Kurulum maliyetinin yüksek olduğuna",
      "Ürün verimini artırdığına",
    ],
    dogruCevap: 4,
    aciklama:
      "Parçada suyun buharlaşma ve sızmayla kaybının önlendiği, yabancı otların daha az geliştiği, gübrenin suyla verilebildiği ve kurulum maliyetinin küçük üreticiyi zorladığı belirtilir; verime ilişkin bir bilgi yoktur.",
  },
  {
    ders: "TURKCE",
    konu: "Paragrafta Anlam",
    soruMetni:
      "(I) Deniz fenerleri yüzyıllar boyunca gemicilerin karanlıkta yollarını bulmalarına yardım etmiştir. (II) Her fener, çevresindeki fenerlerden ayırt edilebilmesi için kendine özgü bir yanıp sönme düzeniyle ışık verir. (III) Böylece gemiciler, gördükleri ışığın hangi fenere ait olduğunu anlayarak kıyıya göre konumlarını belirleyebilir. (IV) Fenerlerin büyük bölümü, kıyıdaki yüksek kayalıklar ya da küçük adacıklar üzerine inşa edilmiştir. (V) Bu düzenler denizcilik haritalarında da gösterildiğinden gemiciler, gördükleri ışıkları haritadaki bilgilerle karşılaştırabilir.\n\nBu parçada numaralanmış cümlelerden hangisi düşüncenin akışını bozmaktadır?",
    secenekler: ["I", "II", "III", "IV", "V"],
    dogruCevap: 3,
    aciklama:
      "Parça, fenerlerin kendine özgü ışık düzenleri sayesinde gemicilerin nasıl yön bulduğunu anlatır. IV. cümle fenerlerin nereye yapıldığından söz ederek konunun dışına çıkar; V. cümledeki “Bu düzenler” ifadesi de II. cümledeki yanıp sönme düzenlerine bağlanır.",
  },
  {
    ders: "TURKCE",
    konu: "Paragrafta Anlam",
    soruMetni:
      "(I) Kentlerde bisiklet kullanımını artırmak isteyen yönetimler işe genellikle bisiklet yolları yapmakla başlar. (II) Ancak yalnızca yol yapmak, insanları bisiklete bindirmeye yetmez. (III) Güvenli park yerleri, toplu taşımayla bağlantı ve iş yerlerinde duş gibi olanaklar da en az yollar kadar önemlidir. (IV) Bisikletin yaygınlaşması ise kent yaşamına pek çok yarar sağlar. (V) Trafik yoğunluğu ve hava kirliliği azalır, düzenli hareket eden kent sakinlerinin sağlığı da olumlu yönde etkilenir.\n\nBu parça iki paragrafa ayrılmak istense ikinci paragraf hangi cümleyle başlar?",
    secenekler: ["I", "II", "III", "IV", "V"],
    dogruCevap: 3,
    aciklama:
      "I-III. cümleler bisiklet kullanımını artırmak için yapılması gerekenleri, IV-V. cümleler ise bisikletin yaygınlaşmasının kente sağladığı yararları anlatır. Konu IV. cümlede değiştiği için ikinci paragraf bu cümleyle başlar.",
  },
  {
    ders: "TURKCE",
    konu: "Paragrafta Anlam",
    soruMetni:
      "Eleştiri, çoğu zaman bir eserin kusurlarını sıralamak olarak anlaşılır. Oysa iyi bir eleştirmen, eseri yerden yere vurmaktan çok onu okura yeniden tanıtan kişidir. Bir romanın gözden kaçan katmanlarını gösterir, yazarın neyi neden yaptığını sorgular, okurun kendi başına göremeyeceği bağlantıları kurar. Bu açıdan bakıldığında eleştirmenin asıl görevi ----\n\nBu parça, düşüncenin akışına göre aşağıdakilerden hangisiyle tamamlanmalıdır?",
    secenekler: [
      "eserin satış rakamlarını artırmaktır.",
      "eserin daha derinlikli okunmasının yolunu açmaktır.",
      "yazarın hatalarını eksiksiz biçimde ortaya koymaktır.",
      "okurun beğenisini kendi beğenisine uydurmaktır.",
      "yalnızca yeni çıkan kitapları değerlendirmektir.",
    ],
    dogruCevap: 1,
    aciklama:
      "Parçaya göre iyi eleştirmen gözden kaçan katmanları gösterir, okurun göremeyeceği bağlantıları kurar; yani eserin daha derin okunmasını sağlar. C, parçanın karşı çıktığı “kusur sıralama” anlayışıdır.",
  },
  {
    ders: "TURKCE",
    konu: "Paragrafta Anlam",
    soruMetni:
      "I. Yeni klorofil üretilmediği için yaprakta var olan klorofil de zamanla parçalanıp azalır.\nII. Sonbaharda günler kısalıp hava soğudukça ağaçların yapraklarında klorofil üretimi yavaşlar.\nIII. Klorofil azalınca yaprakta zaten bulunan ama yeşilin altında görünmeyen sarı ve turuncu renkler ortaya çıkar.\nIV. Böylece yaz boyunca yemyeşil olan ormanlar, birkaç hafta içinde bambaşka bir görünüm kazanır.\n\nBu cümlelerle anlamlı bir paragraf oluşturulduğunda sıralama aşağıdakilerden hangisi olur?",
    secenekler: ["I - II - III - IV", "II - III - I - IV", "II - I - III - IV", "IV - II - I - III", "II - I - IV - III"],
    dogruCevap: 2,
    aciklama:
      "Süreç, klorofil üretiminin yavaşlamasıyla (II) başlar; ardından var olan klorofil de azalır (I), bunun sonucunda sarı ve turuncu renkler görünür (III) ve “Böylece” ile genel sonuç bildirilir (IV): II - I - III - IV.",
  },
  {
    ders: "TURKCE",
    konu: "Paragrafta Anlam",
    soruMetni:
      "Arkeologlar bir kazı alanında yalnızca görkemli tapınakların ya da heykellerin peşinde değildir. Bir çöplükte bulunan kırık çanak çömlekler, hayvan kemikleri ya da yanmış tohumlar; o kentte yaşayanların ne yediği, kimlerle ticaret yaptığı ve nasıl bir gündelik hayat sürdüğü hakkında çoğu zaman bir saraydan daha fazla bilgi verir. Üstelik kazı bir kez yapıldığında toprak katmanlarının sırası geri dönülmez biçimde bozulur; bu yüzden her buluntunun yeri ve derinliği titizlikle kayda geçirilir.\n\nBu parçadan aşağıdakilerin hangisi çıkarılabilir?",
    secenekler: [
      "Gündelik yaşamın sıradan kalıntıları, geçmişi anlamada değerli ipuçları sunar.",
      "Tapınak ve heykeller arkeolojik açıdan önemsizdir.",
      "Kazı alanları kazıdan sonra eski hâline getirilebilir.",
      "Arkeologlar en çok çöplükleri kazmayı tercih eder.",
      "Yanmış tohumlar yalnızca o kentin iklimi hakkında bilgi verir.",
    ],
    dogruCevap: 0,
    aciklama:
      "Parçada çöplükteki kırık çanak çömlek, kemik ve tohumların gündelik yaşam hakkında çok şey anlattığı belirtilir. B aşırı genellemedir (“yalnızca … peşinde değildir”), C “geri dönülmez biçimde bozulur” ifadesiyle çelişir; D ve E'ye ilişkin bilgi yoktur.",
  },
  {
    ders: "TURKCE",
    konu: "Paragrafta Anlam",
    soruMetni:
      "Yeni bir alışkanlık kazanmak isteyen pek çok kişi işe büyük hedeflerle başlar: her gün bir saat spor yapmak, ayda dört kitap okumak gibi. ---- Oysa günde yalnızca on dakika yürüyüşle ya da birkaç sayfa okumayla başlayan kişi, küçük de olsa her gün başarma duygusunu yaşar ve bu duygu onu ertesi güne taşır. Zamanla süre kendiliğinden uzar, alışkanlık da yerleşir.\n\nBu parçada boş bırakılan yere düşüncenin akışına göre aşağıdakilerden hangisi getirilmelidir?",
    secenekler: [
      "Spor yapmak, zihinsel sağlığı da olumlu yönde etkiler.",
      "Kitap okuma oranları son yıllarda giderek düşmektedir.",
      "Ne var ki bu iddialı hedefler, ilk aksamada insanı kolayca vazgeçirebilir.",
      "Bu nedenle hedefler olabildiğince büyük tutulmalıdır.",
      "Alışkanlıklar genellikle çocukluk yıllarında kazanılır.",
    ],
    dogruCevap: 2,
    aciklama:
      "Boşluktan sonra “Oysa” ile küçük hedeflerin yararı anlatıldığına göre boşlukta büyük hedeflerin sakıncası belirtilmelidir. D bu karşıtlığı bozar; A, B ve E konunun dışındadır.",
  },
  {
    ders: "TURKCE",
    konu: "Paragrafta Anlam",
    soruMetni:
      "Bir dönem şehirlerimizin en işlek yerleri olan eski çarşılar bugün birer birer boşalıyor. Yerlerine yapılan alışveriş merkezleri kuşkusuz daha temiz ve daha düzenli. Ne var ki bu merkezlerin hangisine girseniz aynı mağazaları, aynı vitrinleri, aynı müzikleri buluyorsunuz; bir kentten ötekine geçtiğinizde nerede olduğunuzu anlamanız giderek zorlaşıyor. Oysa eski çarşıda bakırcının çekiç sesi, baharatçının kokusu, esnafın kendine özgü konuşması, o kente ait olmanın en canlı işaretleriydi.\n\nBu parçada yazarın yakındığı durum aşağıdakilerden hangisidir?",
    secenekler: [
      "Alışveriş merkezlerinin yeterince temiz olmaması",
      "Kentlerin alışveriş mekânlarının tek tipleşerek kendine özgülüğünü yitirmesi",
      "Eski çarşılardaki ürünlerin pahalı olması",
      "Esnafın müşterilere karşı ilgisiz davranması",
      "Kentlerde yeterli sayıda alışveriş merkezi bulunmaması",
    ],
    dogruCevap: 1,
    aciklama:
      "Yazar, her alışveriş merkezinde aynı mağaza ve vitrinlerin bulunmasından, bu yüzden kentlerin birbirine benzeyip kendine özgü işaretlerini yitirmesinden yakınır. A parçadaki “daha temiz” ifadesiyle çelişir; C, D ve E'ye değinilmemiştir.",
  },
  {
    ders: "TURKCE",
    konu: "Paragrafta Anlam",
    grupId: "o2-turkce-isik",
    soruMetni: `${ISIK}\n\nBu parçada ışık kirliliğinin aşağıdakilerden hangisi üzerindeki etkisine değinilmemiştir?`,
    secenekler: [
      "Deniz kaplumbağası yavrularının",
      "Göçmen kuşların",
      "İnsanların uyku düzeninin",
      "Bitkilerin çiçeklenme zamanının",
      "Gökyüzündeki yıldızların görünürlüğünün",
    ],
    dogruCevap: 3,
    aciklama:
      "Parçada kaplumbağa yavrularının ve göçmen kuşların yön şaşırmasından, insanların uyku düzeninden ve doğru aydınlatmayla gökyüzünün yeniden yıldızlarla dolabileceğinden söz edilir; bitkilerden hiç söz edilmez.",
  },
  {
    ders: "TURKCE",
    konu: "Paragrafta Anlam",
    grupId: "o2-turkce-isik",
    soruMetni: `${ISIK}\n\nBu parçaya göre ışık kirliliğiyle ilgili aşağıdakilerden hangisi söylenebilir?`,
    secenekler: [
      "Yalnızca deniz kıyısındaki kentlerde görülür.",
      "Etkileri yalnızca hayvanlarla sınırlıdır.",
      "Tüm gece aydınlatmalarının kaldırılmasıyla çözülebilir.",
      "Çözümü yüksek maliyetli teknolojiler gerektirir.",
      "Doğru planlanmış aydınlatmalarla büyük ölçüde azaltılabilir.",
    ],
    dogruCevap: 4,
    aciklama:
      "Son cümlede ışığı yalnızca gereken yere ve saatlere yönlendiren aydınlatmaların sorunu pek çok yerde çözmeye yetebileceği belirtilir. B ve D parçayla çelişir; C parçada önerilmez, A'ya ilişkin bilgi yoktur.",
  },
  {
    ders: "TURKCE",
    konu: "Paragrafta Anlam",
    grupId: "o2-turkce-isik",
    soruMetni: `${ISIK}\n\nBu parçada yazarın, ışık kirliliğinin çözümüne ilişkin tutumu aşağıdakilerden hangisidir?`,
    secenekler: [
      "Çözümün sanıldığı kadar zor olmadığını düşünerek iyimser bir tavır sergiler.",
      "Sorunun çözülemeyeceğini düşünerek karamsar bir tavır sergiler.",
      "Çözüm konusunda herhangi bir görüş bildirmez.",
      "Çözümü yalnızca bilim insanlarından bekler.",
      "Çözüm için kentlerin daha az nüfuslu bölgelere taşınmasını önerir.",
    ],
    dogruCevap: 0,
    aciklama:
      "Yazar, ışık kirliliğinin “en sevindirici yanı”nın çözümünün zor olmaması olduğunu söyler ve doğru aydınlatmanın yeterli olabileceğini belirtir; tutumu iyimserdir.",
  },
  {
    ders: "TURKCE",
    konu: "Paragrafta Anlam",
    grupId: "o2-turkce-yemek",
    soruMetni: `${YEMEK}\n\nBu parçaya göre göçmenlerin geleneksel yemeklerini pişirmeyi sürdürmelerinin nedenlerinden biri aşağıdakilerden hangisidir?`,
    secenekler: [
      "Yeni ülkede yemek malzemelerinin pahalı olması",
      "Yeni ülkenin mutfağını hiç beğenmemeleri",
      "Bu yemeklerin onlara ait oldukları topluluğu ve geride bıraktıkları yerleri hatırlatması",
      "Geleneksel tariflerin değiştirilmesinin hoş karşılanmaması",
      "Yeni ülkenin dilini öğrenememeleri",
    ],
    dogruCevap: 2,
    aciklama:
      "Parçada bu alışkanlığın yalnızca damak zevkinden kaynaklanmadığı, yemeğin insana ait olduğu topluluğu ve geride bıraktığı yerleri hatırlattığı belirtilir. E, göçmenlerin yeni dili öğrendiği bilgisiyle çelişir.",
  },
  {
    ders: "TURKCE",
    konu: "Paragrafta Anlam",
    grupId: "o2-turkce-yemek",
    soruMetni: `${YEMEK}\n\nBu parçaya göre göçmen mutfaklarıyla ilgili aşağıdakilerden hangisi söylenemez?`,
    secenekler: [
      "Yeni ülkede bulunamayan malzemelerin yerine başkaları kullanılabilir.",
      "Yeni ülkeye gelindikten sonra hiçbir değişikliğe uğramadan sürer.",
      "Yerel damak zevkinden etkilenebilir.",
      "Zamanla eskiyle yeninin karışımı tatlar ortaya çıkarabilir.",
      "Göçmenlerin kimliklerini korumalarına katkıda bulunabilir.",
    ],
    dogruCevap: 1,
    aciklama:
      "Parçada göçmen mutfaklarının “olduğu gibi kalmadığı”, malzemelerin ve tariflerin değiştiği açıkça belirtilir; B bu yargıyla çelişir. Diğer seçeneklerdeki yargılar parçada yer alır.",
  },
  {
    ders: "TURKCE",
    konu: "Paragrafta Anlam",
    grupId: "o2-turkce-yemek",
    soruMetni: `${YEMEK}\n\nBu parçada yemeğin, kimliği oluşturan öteki ögelerden farkı aşağıdakilerden hangisiyle ortaya konmuştur?`,
    secenekler: [
      "Yemeklerin yalnızca bayramlarda hazırlanmasıyla",
      "Göçmenlerin yeni ülkenin dilini öğrenmemesiyle",
      "Tariflerin yazılı kaynaklardan öğrenilmesiyle",
      "Yemek alışkanlığının yalnızca damak zevkine dayanmasıyla",
      "Dil, giyim ve adlar değişse bile yemek alışkanlıklarının daha uzun süre korunmasıyla",
    ],
    dogruCevap: 4,
    aciklama:
      "Parça, göçmenlerin dilini, giyimini, hatta adlarını değiştirebildiğini; ama tariflerini pişirmeyi sürdürdüğünü söyleyerek yemeğin kimliği en uzun süre koruyan öge olduğunu gösterir. D, “yalnızca damak alışkanlığı değildir” ifadesiyle çelişir.",
  },
  {
    ders: "TURKCE",
    konu: "Paragrafta Anlatım Biçimleri",
    soruMetni:
      "Kitap okumakla film izlemek arasında önemli bir fark vardır. Film, karakterlerin yüzünü, sesini, yaşadıkları evi hazır olarak önümüze koyar; izleyiciye düşen, sunulanı izlemektir. Kitapta ise aynı karakterin yüzünü, sesini, evini okur kendi zihninde kurar. Bu yüzden aynı romanı okuyan iki kişinin zihnindeki kahraman birbirine hiç benzemeyebilir; aynı filmi izleyen iki kişi ise aynı yüzü görür.\n\nBu parçada aşağıdaki düşünceyi geliştirme yollarından hangisi kullanılmıştır?",
    secenekler: ["Tanımlama", "Tanık gösterme", "Karşılaştırma", "Sayısal verilerden yararlanma", "Benzetme"],
    dogruCevap: 2,
    aciklama:
      "Parçada kitap okuma ile film izleme, okurun ve izleyicinin karakteri algılayış biçimleri bakımından birbiriyle karşılaştırılmıştır. Bir tanım, alıntı, sayısal veri ya da benzetme yoktur.",
  },
  {
    ders: "TURKCE",
    konu: "Sözel Mantık",
    grupId: "o2-turkce-mantik-nobet",
    soruMetni: `${NOBET}\n\nBuna göre aşağıdakilerden hangisi kesinlikle doğrudur?`,
    secenekler: [
      "Aslı perşembe günü nöbet tutar.",
      "Cansu salı günü nöbet tutar.",
      "Doruk çarşamba günü nöbet tutar.",
      "Emre cumartesi günü nöbet tutar.",
      "Fatma cuma günü nöbet tutar.",
    ],
    dogruCevap: 1,
    aciklama:
      "Koşulları sağlayan üç çizelge vardır (pazartesiden cumartesiye): Burak-Cansu-Doruk-Aslı-Fatma-Emre, Burak-Cansu-Doruk-Emre-Fatma-Aslı ve Burak-Cansu-Fatma-Aslı-Doruk-Emre. Üçünde de Burak pazartesi, Cansu salı günü nöbet tutar; diğer seçenekler en az bir çizelgede yanlıştır.",
  },
  {
    ders: "TURKCE",
    konu: "Sözel Mantık",
    grupId: "o2-turkce-mantik-nobet",
    soruMetni: `${NOBET}\n\nFatma çarşamba günü nöbet tutuyorsa cuma günü kim nöbet tutar?`,
    secenekler: ["Aslı", "Cansu", "Emre", "Doruk", "Fatma"],
    dogruCevap: 3,
    aciklama:
      "Üç olası çizelgeden yalnızca Burak-Cansu-Fatma-Aslı-Doruk-Emre sıralamasında Fatma çarşamba günüdür. Bu çizelgede cuma günü Doruk nöbet tutar.",
  },
  {
    ders: "TURKCE",
    konu: "Sözel Mantık",
    grupId: "o2-turkce-mantik-nobet",
    soruMetni: `${NOBET}\n\nEmre, Aslı'dan daha önceki bir günde nöbet tutuyorsa perşembe günü kim nöbet tutar?`,
    secenekler: ["Aslı", "Cansu", "Doruk", "Fatma", "Emre"],
    dogruCevap: 4,
    aciklama:
      "Emre'nin Aslı'dan önce olduğu tek çizelge Burak-Cansu-Doruk-Emre-Fatma-Aslı'dır. Bu çizelgede perşembe günü Emre nöbet tutar.",
  },
  {
    ders: "TURKCE",
    konu: "Sözel Mantık",
    grupId: "o2-turkce-mantik-nobet",
    soruMetni: `${NOBET}\n\nBuna göre aşağıdakilerden hangisi kesinlikle yanlıştır?`,
    secenekler: [
      "Aslı cuma günü nöbet tutar.",
      "Doruk çarşamba günü nöbet tutar.",
      "Emre perşembe günü nöbet tutar.",
      "Fatma çarşamba günü nöbet tutar.",
      "Aslı cumartesi günü nöbet tutar.",
    ],
    dogruCevap: 0,
    aciklama:
      "Üç olası çizelgede Aslı perşembe ya da cumartesi günü nöbet tutar; hiçbir çizelgede cuma günü nöbet tutmaz. B, C, D ve E en az bir çizelgede gerçekleşir.",
  },

  // ---- MATEMATİK (30) ----
  {
    ders: "MATEMATIK",
    konu: "Temel Kavramlar",
    soruMetni:
      "x, y ve z birbirinden farklı pozitif rakamlardır.\n\nx + y + z = 15\n\nolduğuna göre 3x + 2y − z ifadesinin alabileceği en büyük değer kaçtır?",
    secenekler: ["30", "32", "34", "36", "40"],
    dogruCevap: 3,
    aciklama:
      "z = 15 − x − y yazılırsa ifade 3x + 2y − 15 + x + y = 4x + 3y − 15 olur. x = 9 seçilirse y + z = 6 ve z ≥ 1, y ≠ z koşuluyla y en çok 5 olur: 36 + 15 − 15 = 36. x = 8 için en çok 32 + 18 − 15 = 35'tir. En büyük değer 36.",
  },
  {
    ders: "MATEMATIK",
    konu: "Sayılar ve EBOB-EKOK",
    soruMetni:
      "Bir okuldaki öğrenciler 12'şerli, 15'erli ve 18'erli gruplara ayrıldığında her seferinde 7 öğrenci artmaktadır.\n\nOkuldaki öğrenci sayısı 500'den fazla olduğuna göre en az kaçtır?",
    secenekler: ["367", "547", "727", "907", "1087"],
    dogruCevap: 1,
    aciklama:
      "Öğrenci sayısının 7 eksiği 12, 15 ve 18'e tam bölünür. EKOK(12, 15, 18) = 180 olduğundan sayı 180k + 7 biçimindedir: 187, 367, 547, … 500'den büyük en küçük değer 547'dir.",
  },
  {
    ders: "MATEMATIK",
    konu: "Sayılar ve EBOB-EKOK",
    soruMetni:
      "Kenar uzunlukları 84 m ve 60 m olan dikdörtgen biçimindeki bir bahçenin kenarlarına, her köşeye birer ağaç gelmek koşuluyla eşit aralıklarla ağaç dikilecektir.\n\nAralıklar tam sayı metre olduğuna göre en az kaç ağaç gerekir?",
    secenekler: ["16", "18", "20", "22", "24"],
    dogruCevap: 4,
    aciklama:
      "Köşelere ağaç geleceği için aralık hem 84'ü hem 60'ı bölmelidir; en az ağaç için aralık EBOB(84, 60) = 12 m seçilir. Kapalı bir çevrede ağaç sayısı çevre/aralık = 2(84 + 60)/12 = 24'tür.",
  },
  {
    ders: "MATEMATIK",
    konu: "Sayılar ve EBOB-EKOK",
    soruMetni:
      "A ve B birer rakam olmak üzere beş basamaklı 7A3B4 sayısı 36 ile tam bölünebilmektedir.\n\nBuna göre bu koşulu sağlayan kaç farklı 7A3B4 sayısı vardır?",
    secenekler: ["4", "5", "6", "7", "8"],
    dogruCevap: 2,
    aciklama:
      "36 = 4 · 9'dur. 4 ile bölünebilme için B4 sayısı 4'ün katı olmalı ⇒ B ∈ {0, 2, 4, 6, 8}. 9 ile bölünebilme için 7 + A + 3 + B + 4 = 14 + A + B, 9'un katı olmalı ⇒ A + B = 4 ya da 13. Çiftler: (4, 0), (2, 2), (0, 4), (9, 4), (7, 6), (5, 8) ⇒ 6 sayı.",
  },
  {
    ders: "MATEMATIK",
    konu: "Rasyonel ve Ondalık Sayılar",
    soruMetni: "{1/2 + 1/3|1/2 − 1/3} − {0,6|0,15}\n\nişleminin sonucu kaçtır?",
    secenekler: ["1", "2", "5", "6", "9"],
    dogruCevap: 0,
    aciklama: "1/2 + 1/3 = 5/6 ve 1/2 − 1/3 = 1/6 olduğundan ilk kesir 5'tir. {0,6|0,15} = {60|15} = 4. Sonuç 5 − 4 = 1.",
  },
  {
    ders: "MATEMATIK",
    konu: "Rasyonel ve Ondalık Sayılar",
    soruMetni: "a = 0,4 ve b = 0,25 olmak üzere\n\n{1|a} + {1|b} − {a|b}\n\nişleminin sonucu kaçtır?",
    secenekler: ["3,6", "4,1", "4,5", "4,9", "5,4"],
    dogruCevap: 3,
    aciklama: "{1|0,4} = 2,5; {1|0,25} = 4; {0,4|0,25} = {40|25} = 1,6. Sonuç 2,5 + 4 − 1,6 = 4,9.",
  },
  {
    ders: "MATEMATIK",
    konu: "Mutlak Değer",
    soruMetni: "x < 0 < y olmak üzere\n\n|x − y| + |y| − |x|\n\nifadesi aşağıdakilerden hangisine eşittir?",
    secenekler: ["2x", "2y", "−2x", "0", "2y − 2x"],
    dogruCevap: 1,
    aciklama: "x − y < 0 olduğundan |x − y| = y − x; |y| = y; x < 0 olduğundan |x| = −x. İfade (y − x) + y − (−x) = 2y olur.",
  },
  {
    ders: "MATEMATIK",
    konu: "Üslü Sayılar",
    soruMetni: "4ˣ = 9 olduğuna göre 2ˣ⁺¹ + 8ˣ ifadesinin değeri kaçtır?",
    secenekler: ["27", "30", "33", "36", "39"],
    dogruCevap: 2,
    aciklama: "4ˣ = (2ˣ)² = 9 ⇒ 2ˣ = 3. 2ˣ⁺¹ = 2 · 2ˣ = 6 ve 8ˣ = (2ˣ)³ = 27. Toplam 6 + 27 = 33.",
  },
  {
    ders: "MATEMATIK",
    konu: "Faktöriyel",
    soruMetni: "{10!|8! + 9!} işleminin sonucu kaçtır?",
    secenekler: ["8", "9", "10", "72", "90"],
    dogruCevap: 1,
    aciklama: "8! + 9! = 8! · (1 + 9) = 10 · 8! ve 10! = 10 · 9 · 8! olduğundan sonuç {10 · 9 · 8!|10 · 8!} = 9'dur.",
  },
  {
    ders: "MATEMATIK",
    konu: "Faktöriyel",
    soruMetni: "1! + 2! + 3! + … + 30!\n\ntoplamının 12 ile bölümünden kalan kaçtır?",
    secenekler: ["1", "3", "5", "7", "9"],
    dogruCevap: 4,
    aciklama: "4! = 24 olduğundan 4! ve sonraki bütün faktöriyeller 12'ye tam bölünür. Kalan yalnızca 1! + 2! + 3! = 1 + 2 + 6 = 9'dan gelir; 9 < 12 olduğundan kalan 9'dur.",
  },
  {
    ders: "MATEMATIK",
    konu: "Denklem Çözme",
    soruMetni: "2x + 3y = 19\n3x − y = 1\n\ndenklem sistemine göre x · y çarpımı kaçtır?",
    secenekler: ["10", "12", "14", "15", "18"],
    dogruCevap: 0,
    aciklama: "İkinci denklemden y = 3x − 1 bulunur. 2x + 3(3x − 1) = 19 ⇒ 11x = 22 ⇒ x = 2, y = 5. x · y = 10.",
  },
  {
    ders: "MATEMATIK",
    konu: "Oran-Orantı",
    soruMetni:
      "Bir torbadaki kırmızı, mavi ve yeşil bilyelerin sayıları sırasıyla 2, 3 ve 5 ile orantılıdır. Torbaya 6 kırmızı bilye eklendiğinde kırmızı bilye sayısının mavi bilye sayısına oranı {4|3} oluyor.\n\nBuna göre torbada başlangıçta kaç bilye vardır?",
    secenekler: ["20", "25", "30", "36", "40"],
    dogruCevap: 2,
    aciklama: "Bilye sayıları 2k, 3k, 5k olsun. {2k + 6|3k} = {4|3} ⇒ 6k + 18 = 12k ⇒ k = 3. Başlangıçta 2k + 3k + 5k = 10k = 30 bilye vardır.",
  },
  {
    ders: "MATEMATIK",
    konu: "Sayı Problemleri",
    soruMetni:
      "Bir sinema salonunda tam bilet 120 TL, öğrenci bileti 80 TL'dir. Bir seansta toplam 150 bilet satılmış ve 15.200 TL gelir elde edilmiştir.\n\nBuna göre bu seansta satılan öğrenci bileti sayısı, tam bilet sayısından kaç eksiktir?",
    secenekler: ["5", "10", "15", "20", "25"],
    dogruCevap: 1,
    aciklama:
      "Tam bilet sayısı t olsun; öğrenci bileti 150 − t'dir. 120t + 80(150 − t) = 15.200 ⇒ 40t = 3200 ⇒ t = 80. Öğrenci bileti 70 olduğundan fark 10'dur.",
  },
  {
    ders: "MATEMATIK",
    konu: "Kesir Problemleri",
    soruMetni:
      "Bir öğrenci okuduğu kitabın ilk gün {1|4}'ünü, ikinci gün ise kalan sayfaların {2|5}'ini okuyor. İkinci gün okuduğu sayfa sayısı, ilk gün okuduğundan 12 fazladır.\n\nBuna göre kitap kaç sayfadır?",
    secenekler: ["160", "200", "220", "240", "280"],
    dogruCevap: 3,
    aciklama:
      "Kitap x sayfa olsun. İlk gün {x|4} okunur, {3x|4} kalır; ikinci gün {2|5} · {3x|4} = {3x|10} okunur. {3x|10} − {x|4} = {x|20} = 12 ⇒ x = 240.",
  },
  {
    ders: "MATEMATIK",
    konu: "Yaş Problemleri",
    soruMetni:
      "İki kardeşin bugünkü yaşları toplamı 26'dır. 4 yıl önce büyük kardeşin yaşı, küçük kardeşin yaşının 2 katından 3 fazlaydı.\n\nBuna göre kaç yıl sonra büyük kardeşin yaşı, küçük kardeşin yaşının {4|3} katı olur?",
    secenekler: ["7", "9", "11", "13", "15"],
    dogruCevap: 4,
    aciklama:
      "Küçük kardeş k, büyük kardeş 26 − k yaşında olsun. 22 − k = 2(k − 4) + 3 ⇒ 3k = 27 ⇒ k = 9; büyük kardeş 17 yaşındadır. 3(17 + t) = 4(9 + t) ⇒ 51 + 3t = 36 + 4t ⇒ t = 15.",
  },
  {
    ders: "MATEMATIK",
    konu: "İşçi ve Havuz Problemleri",
    soruMetni:
      "Boş bir havuzu A musluğu tek başına 6 saatte, B musluğu tek başına 9 saatte doldurmaktadır. Havuzun dibindeki C musluğu ise dolu havuzu 12 saatte boşaltmaktadır. Üç musluk birlikte açıldıktan 4 saat sonra A musluğu kapatılıyor.\n\nBuna göre havuz, musluklar ilk açıldıktan kaç saat sonra dolar?",
    secenekler: ["10", "11", "12", "13", "14"],
    dogruCevap: 2,
    aciklama:
      "Üç musluk birlikte saatte {1|6} + {1|9} − {1|12} = {7|36}'sını doldurur; 4 saatte {28|36} dolar. Kalan {8|36}'yı B ve C birlikte saatte {1|9} − {1|12} = {1|36} hızla 8 saatte doldurur. Toplam 4 + 8 = 12 saat.",
  },
  {
    ders: "MATEMATIK",
    konu: "Hareket Problemleri",
    soruMetni:
      "Aralarında 360 km uzaklık bulunan A ve B kentlerinden, saatteki hızları 70 km ve 50 km olan iki araç aynı anda birbirine doğru hareket ediyor. Hızlı araç A'dan, yavaş araç B'den yola çıkmıştır.\n\nBuna göre yavaş araç, karşılaşmadan kaç saat sonra A kentine varır?",
    secenekler: ["3 saat 48 dakika", "4 saat", "4 saat 12 dakika", "4 saat 20 dakika", "4 saat 30 dakika"],
    dogruCevap: 2,
    aciklama:
      "Araçlar {360|70 + 50} = 3 saat sonra karşılaşır. Bu sürede hızlı araç 210 km yol almıştır; yavaş aracın A'ya kalan yolu 210 km'dir. {210|50} = 4,2 saat = 4 saat 12 dakika.",
  },
  {
    ders: "MATEMATIK",
    konu: "Kümeler",
    soruMetni:
      "A kümesi 20'den küçük asal sayıların, B kümesi ise 20'den küçük tek doğal sayıların kümesidir.\n\nBuna göre s(A − B) + s(B − A) toplamı kaçtır?",
    secenekler: ["4", "5", "6", "7", "8"],
    dogruCevap: 0,
    aciklama:
      "A = {2, 3, 5, 7, 11, 13, 17, 19}, B = {1, 3, 5, 7, 9, 11, 13, 15, 17, 19}. A − B = {2} ⇒ 1 eleman; B − A = {1, 9, 15} ⇒ 3 eleman. Toplam 4.",
  },
  {
    ders: "MATEMATIK",
    konu: "Kümeler",
    soruMetni:
      "Bir grupta futbol oynayan 20, basketbol oynayan 15 kişi vardır. Bu iki spordan yalnızca birini yapanların sayısı, her ikisini de yapanların sayısının 5 katıdır.\n\nGrupta bu sporlardan hiçbirini yapmayan 4 kişi olduğuna göre grup kaç kişidir?",
    secenekler: ["28", "30", "32", "34", "36"],
    dogruCevap: 3,
    aciklama:
      "Her iki sporu yapanlar x olsun. Yalnızca birini yapanlar (20 − x) + (15 − x) = 35 − 2x = 5x ⇒ x = 5. En az bir spor yapanlar 20 + 15 − 5 = 30; grup 30 + 4 = 34 kişidir.",
  },
  {
    ders: "MATEMATIK",
    konu: "Fonksiyonlar",
    soruMetni: "f(2x − 1) = 4x + 3 olduğuna göre f(a) = 21 eşitliğini sağlayan a değeri kaçtır?",
    secenekler: ["4", "5", "6", "7", "8"],
    dogruCevap: 4,
    aciklama: "2x − 1 = t denirse x = {t + 1|2} ve f(t) = 4 · {t + 1|2} + 3 = 2t + 5 olur. 2a + 5 = 21 ⇒ a = 8.",
  },
  {
    ders: "MATEMATIK",
    konu: "Olasılık",
    soruMetni:
      "Bir torbada 4 kırmızı ve 3 beyaz bilye vardır. Torbadan art arda ve geri atılmadan rastgele 2 bilye çekiliyor.\n\nÇekilen bilyelerin farklı renkte olma olasılığı kaçtır?",
    secenekler: ["2/7", "3/7", "4/7", "5/7", "6/7"],
    dogruCevap: 2,
    aciklama: "Önce kırmızı sonra beyaz: {4|7} · {3|6} = {2|7}; önce beyaz sonra kırmızı: {3|7} · {4|6} = {2|7}. Olasılık {2|7} + {2|7} = {4|7}.",
  },
  {
    ders: "MATEMATIK",
    konu: "Grafik Problemleri",
    grupId: "o2-mat-fidan",
    soruMetni: `${FIDAN}\n\nSatışların bir önceki aya göre en çok arttığı ay ile en çok azaldığı ayda satılan fidan sayılarının toplamı kaçtır?`,
    gorselSvg: FIDAN_GRAFIGI,
    secenekler: ["100", "110", "120", "130", "140"],
    dogruCevap: 0,
    aciklama:
      "Değişimler: şubat +20, mart −30, nisan +40, mayıs −20. En çok artış nisanda (70), en çok azalış martta (30) olmuştur. Toplam 70 + 30 = 100.",
  },
  {
    ders: "MATEMATIK",
    konu: "Grafik Problemleri",
    grupId: "o2-mat-fidan",
    soruMetni: `${FIDAN}\n\nOcak ve şubat aylarında tanesi 50 TL'ye satılan fidanların fiyatına mart ayı başında %20 zam yapılmış ve fiyat mayıs sonuna kadar değişmemiştir. Buna göre fidanlığın bu beş aydaki toplam satış geliri kaç TL'dir?`,
    gorselSvg: FIDAN_GRAFIGI,
    secenekler: ["12.500", "13.000", "13.500", "14.000", "15.000"],
    dogruCevap: 3,
    aciklama:
      "Ocak-şubat: (40 + 60) · 50 = 5000 TL. Zamlı fiyat 50 · 1,2 = 60 TL; mart-mayıs: (30 + 70 + 50) · 60 = 9000 TL. Toplam 14.000 TL.",
  },
  {
    ders: "MATEMATIK",
    konu: "Sayısal Mantık",
    grupId: "o2-mat-makine",
    soruMetni: `${MAKINE}\n\nBuna göre makineye ilk olarak 7 sayısı girildiğinde elde edilen 5. çıktı kaçtır?`,
    secenekler: ["17", "26", "34", "40", "52"],
    dogruCevap: 4,
    aciklama: "7 → 22 → 11 → 34 → 17 → 52. Beşinci çıktı 52'dir.",
  },
  {
    ders: "MATEMATIK",
    konu: "Sayısal Mantık",
    grupId: "o2-mat-makine",
    soruMetni: `${MAKINE}\n\nMakineye bir sayı girildiğinde elde edilen 3. çıktı 4 olduğuna göre makineye ilk girilen sayının alabileceği değerlerin toplamı kaçtır?`,
    secenekler: ["37", "41", "45", "49", "53"],
    dogruCevap: 1,
    aciklama:
      "4'ü veren sayılar 8 (çift) ve 1'dir (tek, 3 · 1 + 1 = 4). 8'i yalnızca 16, 1'i yalnızca 2 verir. 16'yı 32 ve 5, 2'yi yalnızca 4 verir. İlk sayı 32, 5 ya da 4 olabilir; toplam 41.",
  },
  {
    ders: "MATEMATIK",
    konu: "Sayısal Mantık",
    soruMetni:
      "Bir duvar saati her saat başında akrebin gösterdiği sayı kadar, her buçukta ise yalnızca bir kez çalmaktadır.\n\nBuna göre bu saat bir tam günde (24 saatte) toplam kaç kez çalar?",
    secenekler: ["180", "192", "204", "216", "228"],
    dogruCevap: 0,
    aciklama:
      "12 saatlik bir dönemde saat başlarında 1 + 2 + … + 12 = 78, buçuklarda 12 kez çalar; toplam 90. Bir günde iki dönem olduğundan 2 · 90 = 180.",
  },
  // -- Geometri (4, gorselli) --
  {
    ders: "MATEMATIK",
    konu: "Geometri",
    geometri: true,
    soruMetni:
      "Şekildeki ABC üçgeninde D noktası [AC] üzerindedir. |AB| = |BD| = |DC| ve m(BAC) = 70°'dir.\n\nBuna göre m(ABC) kaç derecedir?",
    gorselSvg:
      '<svg viewBox="0 0 360 280" xmlns="http://www.w3.org/2000/svg" font-family="Arial, sans-serif" fill="#1e293b"><polygon points="86,79 40,250 330,250" fill="none" stroke="#1e293b" stroke-width="2.5"/><line x1="40" y1="250" x2="185" y2="148.5" stroke="#1e293b" stroke-width="2"/><line x1="56" y1="162.6" x2="70" y2="166.4" stroke="#1e293b" stroke-width="2"/><line x1="108.5" y1="193.3" x2="116.5" y2="204.7" stroke="#1e293b" stroke-width="2"/><line x1="261.5" y1="193.3" x2="253.5" y2="204.7" stroke="#1e293b" stroke-width="2"/><text x="78" y="70" font-size="15">A</text><text x="22" y="266" font-size="15">B</text><text x="334" y="266" font-size="15">C</text><text x="188" y="140" font-size="15">D</text><text x="90" y="112" font-size="13" fill="#dc2626">70°</text><text x="66" y="243" font-size="13" fill="#2563eb">?</text></svg>',
    secenekler: ["70", "75", "80", "85", "90"],
    dogruCevap: 1,
    aciklama:
      "|AB| = |BD| olduğundan m(BDA) = m(BAD) = 70° ve m(ABD) = 40°'dir. |BD| = |DC| olduğundan m(DBC) = m(DCB) = y; BDC üçgeninin dış açısı m(BDA) = 2y = 70° ⇒ y = 35°. m(ABC) = 40° + 35° = 75°.",
  },
  {
    ders: "MATEMATIK",
    konu: "Geometri",
    geometri: true,
    soruMetni:
      "Şekildeki ABCD dikdörtgeninde |AB| = 12 cm ve |BC| = 8 cm'dir. E noktası [DC] üzerinde ve |DE| = 4 cm, F noktası ise [BC]'nin orta noktasıdır.\n\nBuna göre taralı AEF üçgeninin alanı kaç cm²'dir?",
    gorselSvg:
      '<svg viewBox="0 0 380 280" xmlns="http://www.w3.org/2000/svg" font-family="Arial, sans-serif" fill="#1e293b"><polygon points="40,240 140,40 340,140" fill="#dbeafe" stroke="#1e293b" stroke-width="2"/><rect x="40" y="40" width="300" height="200" fill="none" stroke="#1e293b" stroke-width="2.5"/><line x1="334" y1="190" x2="346" y2="190" stroke="#1e293b" stroke-width="2"/><line x1="334" y1="90" x2="346" y2="90" stroke="#1e293b" stroke-width="2"/><text x="24" y="258" font-size="15">A</text><text x="346" y="258" font-size="15">B</text><text x="346" y="36" font-size="15">C</text><text x="24" y="36" font-size="15">D</text><text x="134" y="32" font-size="15">E</text><text x="350" y="145" font-size="15">F</text><text x="86" y="32" font-size="13" fill="#dc2626">4</text><text x="182" y="262" font-size="13" fill="#dc2626">12</text><text x="22" y="145" font-size="13" fill="#dc2626">8</text></svg>',
    secenekler: ["32", "36", "38", "40", "44"],
    dogruCevap: 3,
    aciklama:
      "Dikdörtgenin alanı 96 cm²'dir. Dışarıda kalan üçgenler: ADE = {8 · 4|2} = 16, ECF = {8 · 4|2} = 16 (|EC| = 8, |CF| = 4), ABF = {12 · 4|2} = 24. Alan(AEF) = 96 − 16 − 16 − 24 = 40 cm².",
  },
  {
    ders: "MATEMATIK",
    konu: "Geometri",
    geometri: true,
    soruMetni:
      "Şekildeki ABC üçgeninde [DE] ∥ [BC], |AD| = 4 cm ve |DB| = 6 cm'dir. ADE üçgeninin alanı 8 cm²'dir.\n\nBuna göre taralı DBCE dörtgeninin alanı kaç cm²'dir?",
    gorselSvg:
      '<svg viewBox="0 0 340 270" xmlns="http://www.w3.org/2000/svg" font-family="Arial, sans-serif" fill="#1e293b"><polygon points="112,114 40,240 300,240 216,114" fill="#dbeafe"/><polygon points="160,30 40,240 300,240" fill="none" stroke="#1e293b" stroke-width="2.5"/><line x1="112" y1="114" x2="216" y2="114" stroke="#1e293b" stroke-width="2"/><text x="154" y="22" font-size="15">A</text><text x="22" y="256" font-size="15">B</text><text x="304" y="256" font-size="15">C</text><text x="94" y="112" font-size="15">D</text><text x="222" y="112" font-size="15">E</text><text x="122" y="74" font-size="13" fill="#dc2626">4</text><text x="62" y="182" font-size="13" fill="#dc2626">6</text></svg>',
    secenekler: ["26", "30", "34", "38", "42"],
    dogruCevap: 4,
    aciklama:
      "[DE] ∥ [BC] olduğundan ADE ile ABC benzerdir; benzerlik oranı |AD| : |AB| = {4|10} = {2|5}. Alanlar oranı {4|25} olduğundan Alan(ABC) = 8 · {25|4} = 50 cm². Alan(DBCE) = 50 − 8 = 42 cm².",
  },
  {
    ders: "MATEMATIK",
    konu: "Geometri",
    geometri: true,
    soruMetni:
      "Şekildeki ABCD karesinin bir kenarı 8 cm'dir. A ve C merkezli, yarıçapları 8 cm olan iki çeyrek çember çizilmiştir. (π = 3 alınız.)\n\nBuna göre taralı bölgenin alanı kaç cm²'dir?",
    gorselSvg:
      '<svg viewBox="0 0 320 290" xmlns="http://www.w3.org/2000/svg" font-family="Arial, sans-serif" fill="#1e293b"><path d="M260,240 A200,200 0 0,0 60,40 A200,200 0 0,0 260,240 Z" fill="#dbeafe" stroke="#1e293b" stroke-width="2"/><rect x="60" y="40" width="200" height="200" fill="none" stroke="#1e293b" stroke-width="2.5"/><text x="42" y="258" font-size="15">A</text><text x="266" y="258" font-size="15">B</text><text x="266" y="36" font-size="15">C</text><text x="42" y="36" font-size="15">D</text><text x="156" y="262" font-size="13" fill="#dc2626">8</text></svg>',
    secenekler: ["32", "36", "40", "44", "48"],
    dogruCevap: 0,
    aciklama:
      "Her çeyrek dairenin alanı {π · 8²|4} = {3 · 64|4} = 48 cm²'dir. İki çeyrek daire kareyi örter ve taralı bölge iki kez sayılır: 48 + 48 = 64 + taralı alan ⇒ taralı alan = 32 cm².",
  },
];

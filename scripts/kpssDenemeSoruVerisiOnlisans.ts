/**
 * KPSS deneme sinavi soru havuzu - Onlisans duzeyi, ilk parti (120 soru).
 * Her soru AI tarafindan ozgun olarak yazildi (gercek OSYM sorusu degildir).
 * Bicim ve zorluk, kullanicinin sagladigi gercek Onlisans KPSS kitapcigina
 * gore kalibre edildi: Turkce 1-19 tek soru, 20-26 ortak metinli paragraflar,
 * 27-30 sozel mantik; Matematik 31-52 islem/problem, 53-56 ortak bilgili
 * gruplar, 57-60 geometri (gorselli). Genel Kultur Lisans havuzundan farkli
 * konu/olaylarla; cografya gorselleri gercek veriyle (Natural Earth, MGM).
 */
import { iklimGrafigi, sutunGrafigi, turkiyeHaritasi, type SeedSoru } from "./kpssDenemeOrtak";

const UYKU =
  "Uykunun yalnızca bedenin dinlenmesi olduğunu düşünmek yaygın bir yanılgıdır. Araştırmalar, uyku sırasında beynin gün içinde edindiği bilgileri ayıklayıp önemli olanları kalıcı belleğe aktardığını gösteriyor. Bu nedenle sınav öncesinde uykusuz kalarak çalışan öğrenci, öğrendiklerinin bir bölümünü hatırlamakta zorlanabilir. Üstelik uykusuzluk dikkat süresini kısaltır, tepki süresini uzatır; uzun süre uykusuz kalan bir sürücünün dikkat düzeyinin alkollü bir sürücününkine benzeyebileceği belirtiliyor. Uzmanlar yetişkinler için gecede yedi ile dokuz saatlik uykuyu öneriyor; ama yalnızca sürenin değil, her gün düzenli saatlerde yatıp kalkmanın da en az o kadar önemli olduğunu vurguluyor.";

const PLASTIK =
  "Plastik; ucuz, hafif ve dayanıklı olduğu için yirminci yüzyılın mucize malzemesi olarak görüldü. Ne var ki onu bu kadar kullanışlı kılan dayanıklılık, bugün en büyük sorunun da kaynağı. Doğada yüzlerce yıl bozulmadan kalabilen plastik atıklar, zamanla gözle görülemeyecek kadar küçük parçacıklara ayrılarak denizlere, topraklara, oradan da besin zincirine karışıyor. Geri dönüşüm çoğu zaman bir çözüm olarak sunulsa da üretilen plastiğin ancak küçük bir bölümü geri dönüştürülebiliyor. Bu nedenle sorunun asıl çözümü, atığı sonradan toplamaktan çok tek kullanımlık plastik tüketimini baştan azaltmakta yatıyor.";

const EVLIYA =
  "Evliya Çelebi, XVII. yüzyılda kırk yılı aşkın bir süre boyunca Osmanlı topraklarını ve komşu ülkeleri dolaşmış, gördüklerini on ciltlik Seyahatname'sinde anlatmıştır. Eser; gezilen kentlerin yapılarını, çarşılarını, yemeklerini, giyim kuşamını, hatta oralarda konuşulan dillerden örnekleri içerdiği için bugün tarihçilerin, dil bilimcilerin ve mimarlık araştırmacılarının başvurduğu bir kaynaktır. Ne var ki Evliya Çelebi, anlattıklarını zaman zaman abartır; bir kentteki ev sayısını olduğundan fazla gösterir, duyduğu efsaneleri gerçekmiş gibi aktarır. Bu yüzden araştırmacılar Seyahatname'yi okurken onun verdiği bilgileri başka belgelerle karşılaştırmaya özen gösterir. Yine de bu abartılar eseri değersizleştirmez; tersine, yazarın canlı ve renkli anlatımı Seyahatname'yi yüzyıllar sonra bile zevkle okunan bir edebî metin hâline getirir.";

const APARTMAN =
  "Ali, Banu, Cem, Duygu ve Ece adlı beş kişi, beş katlı bir apartmanın her katında bir kişi olacak biçimde oturmaktadır. Katlar aşağıdan yukarıya doğru 1'den 5'e kadar numaralandırılmıştır. Bu kişilerin oturduğu katlarla ilgili bilinenler şunlardır:\n- Banu, Cem'in hemen bir üst katında oturmaktadır.\n- Ali en üst katta oturmamaktadır.\n- Duygu, Ece'den daha alt bir katta oturmaktadır.\n- Ece 3. katta, Cem ise 1. katta oturmamaktadır.\n- Ali ile Duygu ardışık katlarda oturmamaktadır.";

const DELTA_ISLEMI =
  "a ve b gerçek sayılar olmak üzere Δ işlemi;\na > b ise a Δ b = a² − a · b\na ≤ b ise a Δ b = b − a\nbiçiminde tanımlanıyor.";

const DEFTER =
  "Bir kırtasiyenin hafta içi beş günde sattığı defter sayıları aşağıdaki sütun grafiğinde gösterilmiştir.";
const DEFTER_GRAFIGI = sutunGrafigi(["Pazartesi", "Salı", "Çarşamba", "Perşembe", "Cuma"], [12, 18, 9, 15, 21], 24, 3, "Satılan defter sayısı");

export const ONLISANS_SORULARI: SeedSoru[] = [
  // ---- TÜRKÇE (30) ----
  {
    ders: "TURKCE",
    konu: "Sözcükte Anlam",
    soruMetni: "Aşağıdaki cümlelerin hangisinde “ağır” sözcüğü “ciddi, tehlikeli” anlamında kullanılmıştır?",
    secenekler: [
      "Bu valizi tek başına taşıyamayacak kadar ağır bulmuştu.",
      "Kazada ağır yaralanan sürücü hastaneye kaldırıldı.",
      "Yorgun olduğu için ağır adımlarla merdivenleri çıktı.",
      "Odaya yayılan ağır parfüm kokusu başını döndürmüştü.",
      "Konuşmasındaki ağır sözler herkesi kırmıştı.",
    ],
    dogruCevap: 1,
    aciklama:
      "B'de “ağır yaralanmak” ciddi, tehlikeli biçimde yaralanmak demektir. A'da “ağırlığı çok olan”, C'de “yavaş”, D'de “yoğun, keskin”, E'de “kırıcı, incitici” anlamındadır.",
  },
  {
    ders: "TURKCE",
    konu: "Sözcükte Anlam",
    soruMetni:
      "Bilim tarihinde nice buluş, araştırmacı aslında başka bir şeyin peşindeyken ---- ortaya çıkmıştır. Alexander Fleming'in, unuttuğu bakteri kaplarında üreyen küfün bakterileri öldürdüğünü fark ederek penisilini keşfetmesi de böyle bir ---- sonucudur.\n\nBu parçada boş bırakılan yerlere aşağıdakilerden hangisi sırasıyla getirilmelidir?",
    secenekler: [
      "planlanarak - çalışmanın",
      "bilinçli olarak - deneyin",
      "zorunlu olarak - ihtiyacın",
      "tesadüfen - rastlantının",
      "kolayca - çabanın",
    ],
    dogruCevap: 3,
    aciklama:
      "Araştırmacının başka bir şeyin peşindeyken buluş yapması, buluşun “tesadüfen” ortaya çıktığını gösterir; ikinci cümledeki örnek de bu durumu “rastlantının” sonucu olarak niteler.",
  },
  {
    ders: "TURKCE",
    konu: "Cümlede Anlam",
    soruMetni: "Aşağıdaki cümlelerin hangisinde gerçekleşmesi bir koşula bağlanmış bir yargı vardır?",
    secenekler: [
      "Hava kararmadan kampa dönmek istiyorduk.",
      "Biletleri erkenden aldığımız için ön sıralarda oturabildik.",
      "Konuşmasını bitirir bitirmez salondan ayrıldı.",
      "Kimseyi rahatsız etmemek için içeri sessizce girdi.",
      "Bu patikayı izlersen kısa sürede köye varırsın.",
    ],
    dogruCevap: 4,
    aciklama:
      "E'de köye kısa sürede varmak, patikayı izleme koşuluna bağlanmıştır (-se). A'da istek, B'de neden-sonuç, C'de zaman, D'de amaç-sonuç ilişkisi vardır.",
  },
  {
    ders: "TURKCE",
    konu: "Sözcükte Yapı",
    soruMetni: "Aşağıdaki sözcüklerden hangisi yapı bakımından ötekilerden farklıdır?",
    secenekler: ["gözlük", "yolcu", "kitaplar", "balıkçı", "sevgi"],
    dogruCevap: 2,
    aciklama: "“göz-lük”, “yol-cu”, “balık-çı” ve “sev-gi” sözcükleri yapım eki almış türemiş sözcüklerdir. “kitap-lar” ise yalnızca çekim eki (çoğul eki) almıştır; yapı bakımından basittir.",
  },
  {
    ders: "TURKCE",
    konu: "Ses Bilgisi",
    soruMetni: "Aşağıdaki cümlelerin hangisinde ünsüz yumuşaması yoktur?",
    secenekler: [
      "Kitabı masanın üstüne bırakıp çıktı.",
      "Ağacın gölgesinde biraz dinlendik.",
      "Rengi solmuş perdeleri değiştirdik.",
      "Saatini kontrol ettikten sonra dışarı çıktı.",
      "Dolabın kapağı yine kırılmıştı.",
    ],
    dogruCevap: 3,
    aciklama:
      "Kitap → kitabı, ağaç → ağacın, renk → rengi, dolap → dolabın ve kapak → kapağı sözcüklerinde ünsüz yumuşaması vardır. “Saat” sözcüğü ünlüyle başlayan ek aldığında yumuşamaz (saati); D'de ünsüz yumuşaması yoktur.",
  },
  {
    ders: "TURKCE",
    konu: "Yazım Kuralları",
    soruMetni: "Aşağıdaki cümlelerin hangisinde yazım yanlışı yapılmıştır?",
    secenekler: [
      "Sen de bizimle gelecek misin?",
      "Dün ki toplantıya ben de katılamadım.",
      "Öyle bir yorgunluk çökmüştü ki hemen uyudu.",
      "Bu kitabı da okudun mu?",
      "Evdeki eşyaları taşımaya başladık.",
    ],
    dogruCevap: 1,
    aciklama:
      "Sıfat yapan “-ki” eki kendinden önceki sözcüğe bitişik yazılır ve “dün” sözcüğüne geldiğinde ünlü uyumuna girer: “dünkü toplantı”. Diğer cümlelerde bağlaç olan “de”, “ki” ve soru eki “mi” doğru yazılmıştır.",
  },
  {
    ders: "TURKCE",
    konu: "Noktalama İşaretleri",
    soruMetni: "Aşağıdaki cümlelerin hangisinde kesme işaretinin (') kullanımı yanlıştır?",
    secenekler: [
      "Türkiye'nin en uzun akarsuyu Kızılırmak'tır.",
      "Kurtuluş Savaşı'nı anlatan belgeseli hep birlikte izledik.",
      "Kardeşim bu yıl Ankara Üniversitesi'ne kayıt yaptırdı.",
      "Atatürk'ün Nutuk'unu yeniden okumaya başladım.",
      "Yarışmayı 3'üncü sırada tamamladı.",
    ],
    dogruCevap: 2,
    aciklama:
      "Kurum, kuruluş ve kurul adlarına getirilen ekler kesme işaretiyle ayrılmaz: “Ankara Üniversitesine”. Özel adlara (Türkiye'nin, Kızılırmak'tır, Atatürk'ün), tarihî olay ve eser adlarına (Kurtuluş Savaşı'nı, Nutuk'unu) ve rakamla yazılan sayılara (3'üncü) getirilen ekler ise kesmeyle ayrılır.",
  },
  {
    ders: "TURKCE",
    konu: "Sözcük Türleri",
    soruMetni: "Aşağıdaki cümlelerin hangisinde “geç” sözcüğü zarf olarak kullanılmıştır?",
    secenekler: [
      "Geç saatlere kadar ders çalıştı.",
      "Karşıdan karşıya geç ve beni orada bekle.",
      "Geç bir kahvaltıdan sonra yola koyulduk.",
      "Köprüyü geçmek için uzun süre sıra bekledik.",
      "Otobüs bugün de geç geldi.",
    ],
    dogruCevap: 4,
    aciklama:
      "E'de “geç” sözcüğü “gelmek” eyleminin zamanını belirttiği için zarftır. A'da “saatler”, C'de “kahvaltı” adını nitelediğinden sıfat; B'de ve D'de ise “geçmek” eyleminin kendisidir.",
  },
  {
    ders: "TURKCE",
    konu: "Cümlenin Ögeleri",
    soruMetni:
      "“Yüzyıllık çınarın gölgesinde oturan yaşlılar, akşam ezanına kadar eski günleri konuştu.”\n\nBu cümlenin ögeleri sırasıyla aşağıdakilerin hangisinde verilmiştir?",
    secenekler: [
      "Özne - zarf tümleci - nesne - yüklem",
      "Dolaylı tümleç - özne - zarf tümleci - nesne - yüklem",
      "Özne - dolaylı tümleç - nesne - yüklem",
      "Zarf tümleci - özne - nesne - yüklem",
      "Özne - zarf tümleci - dolaylı tümleç - yüklem",
    ],
    dogruCevap: 0,
    aciklama:
      "“Yüzyıllık çınarın gölgesinde oturan yaşlılar” (kim konuştu?) öznedir; “akşam ezanına kadar” (ne zamana kadar?) zarf tümleci, “eski günleri” (neyi?) belirtili nesne, “konuştu” yüklemdir. “Gölgesinde” sözcüğü öznenin içindeki sıfat-fiil grubuna aittir, ayrı bir öge değildir.",
  },
  {
    ders: "TURKCE",
    konu: "Anlatım Bozuklukları",
    soruMetni: "Aşağıdaki cümlelerin hangisinde gereksiz sözcük kullanımından kaynaklanan bir anlatım bozukluğu vardır?",
    secenekler: [
      "Toplantıya katılanların hepsi önerimizi destekledi.",
      "Salonda yaklaşık elli kadar kişi bekliyordu.",
      "Bu konuda sizinle aynı görüşteyim.",
      "Bahçedeki ağaçlar bu yıl erken çiçek açtı.",
      "Yarın sabah erkenden yola çıkacağız.",
    ],
    dogruCevap: 1,
    aciklama: "“Yaklaşık” ve “kadar” sözcükleri aynı anlamı (tahmin) karşıladığından B'de biri gereksizdir.",
  },
  {
    ders: "TURKCE",
    konu: "Paragrafta Anlam",
    soruMetni:
      "Çocuklara kitap okumayı sevdirmenin yolu, okumayı onlara bir ödev gibi dayatmaktan geçmez. Ne zaman, ne kadar ve hangi kitabı okuyacağına kendisi karar veren çocuk, okumayı bir zorunluluk değil keşif olarak görür. Evde anne babasını elinde kitapla gören, kütüphaneye götürülen, okuduğu kitap üzerine sohbet edilen çocuk için kitap da oyuncakları gibi hayatın doğal bir parçası hâline gelir. Zorla okutulan sayfalar ise çoğu zaman çocuğu kitaptan uzaklaştırır.\n\nBu parçada asıl anlatılmak istenen aşağıdakilerden hangisidir?",
    secenekler: [
      "Çocuklar boş zamanlarını oyuncaklarıyla geçirmeyi kitap okumaya tercih eder.",
      "Okul kütüphaneleri çocuk kitapları açısından yetersizdir.",
      "Okuma sevgisi zorlamayla değil, özendirici bir ortam ve seçme özgürlüğüyle kazandırılır.",
      "Okuma ödevleri çocukların okuma alışkanlığını güçlendirir.",
      "Anne babalar çocuklarına her gün belirli sayıda sayfa okutmalıdır.",
    ],
    dogruCevap: 2,
    aciklama:
      "Parça, okumanın dayatılmasının çocuğu kitaptan uzaklaştırdığını; seçme özgürlüğü ve kitapla iç içe bir aile ortamının ise okumayı sevdirdiğini anlatır. D ve E parçadaki düşüncenin tersidir; A ve B'ye değinilmemiştir.",
  },
  {
    ders: "TURKCE",
    konu: "Paragrafta Anlam",
    soruMetni:
      "Bal arıları bir çiçek kaynağı bulduklarında kovana dönüp özel bir dans yapar. Bu dansta arının izlediği yolun güneşle yaptığı açı kaynağın yönünü, dansın süresi ise kaynağın kovana uzaklığını bildirir. Kovandaki diğer arılar, dans eden arının vücuduna sinen çiçek kokusundan da yararlanarak kaynağı kolayca bulur. Bilim insanları bu iletişim biçimini çözebilmek için onlarca yıl gözlem yapmıştır.\n\nBu parçada aşağıdakilerin hangisine değinilmemiştir?",
    secenekler: [
      "Arıların dansla bilgi aktardığına",
      "Dansın süresinin kaynağın uzaklığını gösterdiğine",
      "Kokunun kaynağı bulmayı kolaylaştırdığına",
      "Bu iletişimin uzun süren gözlemlerle çözüldüğüne",
      "Dansın yalnızca işçi arılarca yapıldığına",
    ],
    dogruCevap: 4,
    aciklama: "Parçada dansı hangi arıların yaptığına ilişkin bir bilgi yoktur; diğer seçeneklerdeki bilgiler parçada açıkça yer alır.",
  },
  {
    ders: "TURKCE",
    konu: "Paragrafta Anlam",
    soruMetni:
      "(I) Kahve, Osmanlı İstanbul'una XVI. yüzyılın ortalarında Yemen üzerinden gelmiştir. (II) Kısa sürede yaygınlaşan bu içecek, kahvehane adı verilen yeni bir toplumsal mekânın doğmasına yol açmıştır. (III) Kahvehaneler; insanların bir araya gelip sohbet ettiği, haber alışverişinde bulunduğu, meddahların hikâyelerinin dinlendiği yerlere dönüşmüştür. (IV) Kahve bitkisi, yetişebilmek için yıl boyunca ılık ve nemli bir iklime ihtiyaç duyar. (V) Bu yönüyle kahvehaneler, dönemin kültür hayatında âdeta birer okul işlevi görmüştür.\n\nBu parçada numaralanmış cümlelerden hangisi düşüncenin akışını bozmaktadır?",
    secenekler: ["I", "II", "III", "IV", "V"],
    dogruCevap: 3,
    aciklama:
      "Parça, kahvenin İstanbul'a gelişini ve kahvehanelerin toplumsal-kültürel işlevini anlatır. IV. cümle ise kahve bitkisinin iklim isteklerinden söz ederek konunun dışına çıkar; ayrıca V. cümledeki “bu yönüyle” ifadesi III. cümleye bağlanır.",
  },
  {
    ders: "TURKCE",
    konu: "Paragrafta Anlam",
    soruMetni:
      "(I) Eskiden kentlerde saatler yalnızca varlıklı ailelerin evlerinde bulunurdu. (II) Halk, günün vaktini camilerden okunan ezanlarla ya da meydanlardaki saat kulelerinin çanlarıyla öğrenirdi. (III) Bu yüzden saat kuleleri, kentin ortak zamanını belirleyen önemli yapılar sayılırdı. (IV) Bugün ise neredeyse herkesin cebinde, zamanı saniyesi saniyesine gösteren bir telefon bulunuyor. (V) Bu kolaylık, zamanı öğrenmeyi bireysel bir eyleme dönüştürdüğü gibi saat kulelerini de birer süs ögesine çevirdi.\n\nBu parça iki paragrafa ayrılmak istense ikinci paragraf hangi cümleyle başlar?",
    secenekler: ["I", "II", "III", "IV", "V"],
    dogruCevap: 3,
    aciklama:
      "I-III. cümleler geçmişte zamanın nasıl öğrenildiğini, IV-V. cümleler ise günümüzdeki durumu anlatır. “Bugün ise” ifadesiyle konu değiştiği için ikinci paragraf IV. cümleyle başlar.",
  },
  {
    ders: "TURKCE",
    konu: "Paragrafta Anlam",
    soruMetni:
      "Bir dili öğrenmek yalnızca kelime ve kural ezberlemek değildir. O dili konuşan toplumun mizahını, deyimlerini, gündelik alışkanlıklarını tanımadan yapılan çeviriler çoğu zaman kulağa yapay gelir. Bir deyimin sözlükteki karşılığını bilen biri, onun hangi durumda, kime karşı ve hangi tonda kullanıldığını bilmiyorsa ----\n\nBu parça, düşüncenin akışına göre aşağıdakilerden hangisiyle tamamlanmalıdır?",
    secenekler: [
      "o deyimi doğru yerde kullanması da pek mümkün olmaz.",
      "dil öğrenmeye daha erken yaşta başlamalıdır.",
      "sözlüklerin her zaman en güvenilir kaynak olduğunu bilmelidir.",
      "yabancı dilde roman okumaktan vazgeçmelidir.",
      "kelime ezberleme yöntemleriyle bu eksikliği kolayca giderir.",
    ],
    dogruCevap: 0,
    aciklama:
      "Parça, dilin kültürel bağlamı bilinmeden doğru kullanılamayacağını savunur. Deyimin kullanım bağlamını bilmeyen kişinin onu doğru yerde kullanamayacağı yargısı bu düşünceyi tamamlar; E ise parçanın tersini söyler.",
  },
  {
    ders: "TURKCE",
    konu: "Paragrafta Anlam",
    soruMetni:
      "I. Bu nedenle uzmanlar, egzersize başlamadan önce mutlaka ısınma hareketleri yapılmasını öneriyor.\nII. Isınmadan yapılan ani ve zorlayıcı hareketler, kaslarda ve eklemlerde sakatlanmalara yol açabiliyor.\nIII. Çünkü ısınma hareketleri, vücut sıcaklığını ve kaslara giden kan miktarını artırarak bedeni efora hazırlıyor.\nIV. Düzenli spor yapmak sağlığı korumanın en etkili yollarından biridir; ancak yanlış yapıldığında yarardan çok zarar getirebilir.\n\nBu cümlelerle anlamlı bir paragraf oluşturulduğunda sıralama aşağıdakilerden hangisi olur?",
    secenekler: ["IV - II - I - III", "II - IV - III - I", "IV - III - II - I", "III - I - IV - II", "II - I - IV - III"],
    dogruCevap: 0,
    aciklama:
      "Genel yargı içeren IV. cümle girişi oluşturur. II. cümle sporun yanlış yapılmasına örnek verir, I. cümle “Bu nedenle” ile bundan çıkan öneriyi bildirir, III. cümle de “Çünkü” ile bu önerinin gerekçesini açıklar: IV - II - I - III.",
  },
  {
    ders: "TURKCE",
    konu: "Paragrafta Anlatım Biçimleri",
    soruMetni:
      "Köyün girişindeki yaşlı çınarın gövdesi, beş kişinin el ele verse ancak sarabileceği kadar kalındı. Yosun tutmuş dallarından sarkan yapraklar, öğle güneşinde meydanın taş zeminine titrek gölgeler düşürüyordu. Ağacın dibindeki çeşmeden akan suyun şırıltısı, kahvehaneden yükselen tavla şakırtılarına karışıyordu.\n\nBu parçada ağırlıklı olarak kullanılan anlatım biçimi aşağıdakilerden hangisidir?",
    secenekler: ["Tartışma", "Açıklama", "Betimleme", "Öyküleme", "Karşılaştırma"],
    dogruCevap: 2,
    aciklama:
      "Parçada bir olay anlatılmaz; çınar, gölgeler, çeşme ve sesler görme ve işitme duyularına seslenen ayrıntılarla zihinde canlandırılır. Bu, betimleyici anlatımdır.",
  },
  {
    ders: "TURKCE",
    konu: "Paragrafta Anlam",
    soruMetni:
      "Bir şehrin gerçek yüzünü görmek isteyen gezgin, turistik rehberlerde yıldızla işaretlenmiş yerlerin dışına çıkmayı göze almalıdır. Müzeler, saraylar ve meydanlar elbette görülmeye değerdir; ancak bir kentin ruhu çoğu zaman mahalle aralarındaki fırında, sabah kahvaltısının yapıldığı küçük lokantada, çarşıdaki pazarlık seslerinde saklıdır. Programını dakikası dakikasına planlayan gezgin ise bu beklenmedik karşılaşmaların tadını kaçırır.\n\nBu parçadan aşağıdakilerin hangisi çıkarılabilir?",
    secenekler: [
      "Müzeler bir kentin ruhunu hiçbir biçimde yansıtmaz.",
      "Bir kenti anlamak için oradaki gündelik yaşamı tanımak önemlidir.",
      "Turistik rehberler gezginlere yanlış bilgi verir.",
      "Gezilerde herhangi bir plan yapmak gereksizdir.",
      "Mahalle fırınları turistlere özel hizmet sunar.",
    ],
    dogruCevap: 1,
    aciklama:
      "Yazar, kentin ruhunun mahalle fırını, lokanta ve çarşı gibi gündelik yaşam alanlarında saklı olduğunu söyler. A ve D parçadaki “elbette görülmeye değer”, “dakikası dakikasına” ifadelerini aşırı genelleştirir; C ve E'ye ilişkin bilgi yoktur.",
  },
  {
    ders: "TURKCE",
    konu: "Paragrafta Anlam",
    soruMetni:
      "(I) Fethiye'ye bağlı Kayaköy, 1923'teki nüfus mübadelesinin ardından boşalan bir yerleşimdir. (II) Yamaca kurulu yüzlerce taş evin yıkık duvarları, bugün de köyün eski büyüklüğünü gözler önüne serer. (III) Rum nüfusun ayrılmasından sonra köy bir daha eski canlılığına kavuşamamıştır. (IV) Bence gün batımında bu ıssız sokaklarda dolaşmak, insanın yaşayabileceği en hüzünlü deneyimlerden biridir. (V) Bölge bugün yerli ve yabancı turistlerin ziyaret ettiği yerler arasındadır.\n\nBu parçadaki numaralanmış cümlelerden hangisi kişisel bir yargı içermektedir?",
    secenekler: ["I", "II", "III", "IV", "V"],
    dogruCevap: 3,
    aciklama:
      "IV. cümle “bence” ve “en hüzünlü deneyim” ifadeleriyle yazarın kişisel duygu ve değerlendirmesini bildirir; doğruluğu kanıtlanamaz. Diğer cümleler gözlenebilir ya da belgelenebilir bilgiler içerir.",
  },
  {
    ders: "TURKCE",
    konu: "Paragrafta Anlam",
    grupId: "onl-turkce-uyku",
    soruMetni: `${UYKU}\n\nBu parçada uykuyla ilgili aşağıdakilerden hangisine değinilmemiştir?`,
    secenekler: [
      "Bellek üzerindeki etkisine",
      "Dikkat üzerindeki etkisine",
      "Yetişkinler için önerilen süresine",
      "Düzenli saatlerde uyumanın önemine",
      "Rüyaların hangi uyku evresinde görüldüğüne",
    ],
    dogruCevap: 4,
    aciklama:
      "Parçada uykunun belleğe ve dikkate etkisi, önerilen 7-9 saatlik süre ve düzenli yatıp kalkmanın önemi anlatılır; rüyalardan hiç söz edilmez.",
  },
  {
    ders: "TURKCE",
    konu: "Paragrafta Anlam",
    grupId: "onl-turkce-uyku",
    soruMetni: `${UYKU}\n\nBu parçaya göre sınavdan önceki gece uykusuz kalarak çalışmanın sakıncası aşağıdakilerden hangisidir?`,
    secenekler: [
      "Öğrenilen bilgilerin kalıcı belleğe aktarılmasının aksaması",
      "Öğrencinin tekrar yapacak zaman bulamaması",
      "Sınav süresinin öğrenciye yetmemesi",
      "Daha önce öğrenilen bütün bilgilerin silinmesi",
      "Uyku süresinin dokuz saati aşması",
    ],
    dogruCevap: 0,
    aciklama:
      "Parçaya göre beyin bilgileri uyku sırasında kalıcı belleğe aktarır; uykusuz kalan öğrenci bu nedenle öğrendiklerinin “bir bölümünü” hatırlamakta zorlanır. D, “bütün bilgiler” diyerek parçadaki yargıyı aşırı genelleştirir.",
  },
  {
    ders: "TURKCE",
    konu: "Paragrafta Anlam",
    grupId: "onl-turkce-plastik",
    soruMetni: `${PLASTIK}\n\nBu parçada plastiğin hangi özelliğinin hem bir üstünlük hem de bir sorun kaynağı olduğu vurgulanmaktadır?`,
    secenekler: ["Ucuzluğunun", "Dayanıklılığının", "Hafifliğinin", "Kolay şekil almasının", "Geri dönüştürülebilmesinin"],
    dogruCevap: 1,
    aciklama:
      "Parçada plastiği kullanışlı kılan dayanıklılığın, doğada yüzlerce yıl bozulmadan kalmasına yol açtığı için “en büyük sorunun da kaynağı” olduğu belirtilir.",
  },
  {
    ders: "TURKCE",
    konu: "Paragrafta Anlam",
    grupId: "onl-turkce-plastik",
    soruMetni: `${PLASTIK}\n\nBu parçadan aşağıdakilerden hangisi çıkarılamaz?`,
    secenekler: [
      "Plastik atıklar besin zincirine karışabilir.",
      "Plastik ilk yaygınlaştığı dönemde olumlu karşılanmıştır.",
      "Geri dönüşüm, plastik kirliliğini tek başına ortadan kaldırabilir.",
      "Plastik atıklar zamanla çok küçük parçacıklara ayrılabilir.",
      "Tek kullanımlık plastik tüketimini azaltmak sorunun çözümünde önemlidir.",
    ],
    dogruCevap: 2,
    aciklama:
      "Parçada üretilen plastiğin ancak küçük bir bölümünün geri dönüştürülebildiği ve asıl çözümün tüketimi azaltmak olduğu söylenir; geri dönüşümün sorunu tek başına çözebileceği yargısı parçayla çelişir.",
  },
  {
    ders: "TURKCE",
    konu: "Paragrafta Anlam",
    grupId: "onl-turkce-evliya",
    soruMetni: `${EVLIYA}\n\nBu parçaya göre araştırmacıların Seyahatname'deki bilgileri başka belgelerle karşılaştırmasının nedeni aşağıdakilerden hangisidir?`,
    secenekler: [
      "Yazarın anlattıklarında zaman zaman abartıya ve efsanelere yer vermesi",
      "Eserin on ciltten oluşan çok hacimli bir yapıt olması",
      "Eserde yalnızca Osmanlı topraklarının anlatılması",
      "Eserin edebî değerinin düşük bulunması",
      "Yazarın yalnızca mimariyle ilgilenmesi",
    ],
    dogruCevap: 0,
    aciklama:
      "Parçada Evliya Çelebi'nin ev sayılarını abarttığı, efsaneleri gerçekmiş gibi aktardığı belirtilir ve “Bu yüzden” araştırmacıların bilgileri başka belgelerle karşılaştırdığı söylenir. C ve E parçadaki bilgilerle çelişir.",
  },
  {
    ders: "TURKCE",
    konu: "Paragrafta Anlam",
    grupId: "onl-turkce-evliya",
    soruMetni: `${EVLIYA}\n\nBu parçada Seyahatname ile ilgili aşağıdakilerden hangisine değinilmemiştir?`,
    secenekler: [
      "Hangi bilim alanlarında kaynak olarak kullanıldığına",
      "Kaç ciltten oluştuğuna",
      "Anlatımının canlı olduğuna",
      "Hangi dillere çevrildiğine",
      "Gezilen yerlerin yemeklerine yer verdiğine",
    ],
    dogruCevap: 3,
    aciklama:
      "Parçada eserin on cilt olduğu, tarih, dil bilim ve mimarlık araştırmalarında kullanıldığı, yemeklere yer verdiği ve anlatımının canlı olduğu belirtilir; çevirilerinden söz edilmez.",
  },
  {
    ders: "TURKCE",
    konu: "Paragrafta Anlam",
    grupId: "onl-turkce-evliya",
    soruMetni: `${EVLIYA}\n\nBu parçada yazarın, Seyahatname'deki abartılara yönelik tutumu aşağıdakilerden hangisidir?`,
    secenekler: [
      "Abartılar nedeniyle eserin kaynak olarak kullanılmaması gerektiğini savunur.",
      "Abartıların yalnızca eserin ilk ciltlerinde bulunduğunu belirtir.",
      "Abartıları Evliya Çelebi'nin bilgisizliğine bağlar.",
      "Abartılara ilişkin herhangi bir değerlendirme yapmaz.",
      "Abartıların eseri değersizleştirmediğini, aksine okunurluğunu artırdığını düşünür.",
    ],
    dogruCevap: 4,
    aciklama:
      "Son cümlede abartıların eseri değersizleştirmediği, canlı ve renkli anlatımın Seyahatname'yi yüzyıllar sonra bile zevkle okunur kıldığı belirtilir.",
  },
  {
    ders: "TURKCE",
    konu: "Sözel Mantık",
    grupId: "onl-turkce-mantik-apartman",
    soruMetni: `${APARTMAN}\n\nBuna göre aşağıdakilerden hangisi kesinlikle yanlıştır?`,
    secenekler: [
      "Ece 2. katta oturur.",
      "Banu 5. katta oturur.",
      "Ali 2. katta oturur.",
      "Cem 4. katta oturur.",
      "Duygu 1. katta oturur.",
    ],
    dogruCevap: 2,
    aciklama:
      "Koşulları sağlayan üç yerleşim vardır (1. kattan 5. kata): Ali-Cem-Banu-Duygu-Ece, Duygu-Cem-Banu-Ali-Ece ve Duygu-Ece-Ali-Cem-Banu. Ali yalnızca 1., 3. veya 4. katta oturabilir; 2. katta oturamaz. Diğer seçenekler en az bir yerleşimde doğrudur.",
  },
  {
    ders: "TURKCE",
    konu: "Sözel Mantık",
    grupId: "onl-turkce-mantik-apartman",
    soruMetni: `${APARTMAN}\n\nEce 5. katta oturuyorsa aşağıdakilerden hangisi kesinlikle doğrudur?`,
    secenekler: [
      "Banu 3. katta oturur.",
      "Ali 1. katta oturur.",
      "Duygu 4. katta oturur.",
      "Ali 4. katta oturur.",
      "Duygu 1. katta oturur.",
    ],
    dogruCevap: 0,
    aciklama:
      "Ece 5. kattayken iki yerleşim mümkündür: Ali-Cem-Banu-Duygu-Ece ve Duygu-Cem-Banu-Ali-Ece. İkisinde de Cem 2., Banu 3. kattadır; Ali ile Duygu'nun katları kesin değildir.",
  },
  {
    ders: "TURKCE",
    konu: "Sözel Mantık",
    grupId: "onl-turkce-mantik-apartman",
    soruMetni: `${APARTMAN}\n\nAli, Duygu'dan daha alt bir katta oturuyorsa 4. katta kim oturur?`,
    secenekler: ["Ali", "Duygu", "Cem", "Banu", "Ece"],
    dogruCevap: 1,
    aciklama:
      "Üç olası yerleşimden yalnızca Ali-Cem-Banu-Duygu-Ece sıralamasında Ali, Duygu'dan daha alt kattadır. Bu yerleşimde 4. katta Duygu oturur.",
  },
  {
    ders: "TURKCE",
    konu: "Sözel Mantık",
    grupId: "onl-turkce-mantik-apartman",
    soruMetni: `${APARTMAN}\n\nCem 4. katta oturuyorsa 2. katta kim oturur?`,
    secenekler: ["Ali", "Banu", "Cem", "Duygu", "Ece"],
    dogruCevap: 4,
    aciklama:
      "Cem 4. kattaysa Banu 5. kattadır. Kalan 1-3. katlara Ali, Duygu ve Ece yerleşir; Ece 3. katta olamaz, Duygu Ece'nin altında olmalı ve Ali ile Duygu ardışık olamaz. Tek yerleşim Duygu-Ece-Ali-Cem-Banu'dur; 2. katta Ece oturur.",
  },

  // ---- MATEMATİK (30) ----
  {
    ders: "MATEMATIK",
    konu: "Rasyonel ve Ondalık Sayılar",
    soruMetni: "(0,9/0,03 − 0,4/0,08) · (3/5 − 2/5)\n\nişleminin sonucu kaçtır?",
    secenekler: ["3", "4", "5", "6", "7"],
    dogruCevap: 2,
    aciklama: "0,9/0,03 = 30 ve 0,4/0,08 = 5 olduğundan parantez içi 25'tir. 3/5 − 2/5 = 1/5. Sonuç 25 · 1/5 = 5.",
  },
  {
    ders: "MATEMATIK",
    konu: "Rasyonel ve Ondalık Sayılar",
    soruMetni: "{2/3 + 1/6|1 − 1/6} + {3/4|3/8}\n\nişleminin sonucu kaçtır?",
    secenekler: ["3", "7/2", "4", "9/2", "5"],
    dogruCevap: 0,
    aciklama: "2/3 + 1/6 = 5/6 ve 1 − 1/6 = 5/6 olduğundan ilk bölüm 1'dir. {3/4|3/8} = 3/4 · 8/3 = 2. Sonuç 1 + 2 = 3.",
  },
  {
    ders: "MATEMATIK",
    konu: "Üslü Sayılar",
    soruMetni: "3ˣ⁺¹ + 3ˣ = 108 olduğuna göre 2ˣ⁺¹ kaçtır?",
    secenekler: ["4", "8", "12", "16", "32"],
    dogruCevap: 3,
    aciklama: "3ˣ⁺¹ + 3ˣ = 3 · 3ˣ + 3ˣ = 4 · 3ˣ = 108 ⇒ 3ˣ = 27 ⇒ x = 3. Buna göre 2ˣ⁺¹ = 2⁴ = 16.",
  },
  {
    ders: "MATEMATIK",
    konu: "Faktöriyel",
    soruMetni: "{8! − 7!|6!} işleminin sonucu kaçtır?",
    secenekler: ["42", "49", "56", "63", "72"],
    dogruCevap: 1,
    aciklama: "8! = 8 · 7! olduğundan 8! − 7! = 7! · (8 − 1) = 7 · 7!. 7! = 7 · 6! ⇒ pay = 49 · 6!. Sonuç 49'dur.",
  },
  {
    ders: "MATEMATIK",
    konu: "Faktöriyel",
    soruMetni: "n bir doğal sayı olmak üzere {(n + 2)!|n!} = 42 olduğuna göre n kaçtır?",
    secenekler: ["1", "2", "3", "4", "5"],
    dogruCevap: 4,
    aciklama: "{(n + 2)!|n!} = (n + 2)(n + 1) = 42 = 7 · 6 ⇒ n + 1 = 6 ⇒ n = 5.",
  },
  {
    ders: "MATEMATIK",
    konu: "Sayılar ve EBOB-EKOK",
    soruMetni:
      "A ve B birbirinden farklı rakamlar olmak üzere 5AB ve AB5 üç basamaklı sayılardır.\n\n5AB − AB5 = 252 olduğuna göre A + B toplamı kaçtır?",
    secenekler: ["7", "8", "9", "10", "11"],
    dogruCevap: 2,
    aciklama:
      "5AB = 500 + 10A + B ve AB5 = 100A + 10B + 5'tir. Fark 495 − 90A − 9B = 252 ⇒ 90A + 9B = 243 ⇒ 10A + B = 27 ⇒ A = 2, B = 7. Kontrol: 527 − 275 = 252. A + B = 9.",
  },
  {
    ders: "MATEMATIK",
    konu: "Denklem Çözme",
    soruMetni: "{x + 1|3} − {x − 2|4} = 2 olduğuna göre x kaçtır?",
    secenekler: ["14", "16", "18", "20", "22"],
    dogruCevap: 0,
    aciklama: "Eşitliğin iki yanı 12 ile çarpılır: 4(x + 1) − 3(x − 2) = 24 ⇒ 4x + 4 − 3x + 6 = 24 ⇒ x + 10 = 24 ⇒ x = 14.",
  },
  {
    ders: "MATEMATIK",
    konu: "Temel Kavramlar",
    soruMetni:
      "a çift, b tek doğal sayı ve b · c çarpımı çift sayıdır.\n\nBuna göre;\nI. a + c\nII. b + c\nIII. a · b + b + c\nifadelerinden hangileri her zaman tek sayıdır?",
    secenekler: ["Yalnız I", "Yalnız II", "I ve II", "I ve III", "II ve III"],
    dogruCevap: 4,
    aciklama:
      "b tek ve b · c çift olduğundan c çifttir. I: çift + çift = çift. II: tek + çift = tek. III: a · b çift, b tek, c çift olduğundan toplam tektir. Her zaman tek olanlar II ve III'tür.",
  },
  {
    ders: "MATEMATIK",
    konu: "Mutlak Değer",
    soruMetni: "|x − 2| ≤ 3 eşitsizliğini sağlayan x tam sayılarının toplamı kaçtır?",
    secenekler: ["12", "14", "15", "18", "21"],
    dogruCevap: 1,
    aciklama: "|x − 2| ≤ 3 ⇒ −3 ≤ x − 2 ≤ 3 ⇒ −1 ≤ x ≤ 5. Tam sayılar −1, 0, 1, 2, 3, 4, 5 olup toplamları 14'tür.",
  },
  {
    ders: "MATEMATIK",
    konu: "Sayılar ve EBOB-EKOK",
    soruMetni:
      "Uzunlukları 48 cm, 72 cm ve 120 cm olan üç ip, hiç artmayacak biçimde eşit uzunlukta ve mümkün olan en uzun parçalara kesilecektir.\n\nBuna göre toplam kaç parça ip elde edilir?",
    secenekler: ["6", "8", "9", "10", "12"],
    dogruCevap: 3,
    aciklama: "Parça uzunluğu EBOB(48, 72, 120) = 24 cm olmalıdır. Parça sayısı 48/24 + 72/24 + 120/24 = 2 + 3 + 5 = 10.",
  },
  {
    ders: "MATEMATIK",
    konu: "Oran-Orantı",
    soruMetni:
      "Bir sınıfta kız öğrenci sayısının erkek öğrenci sayısına oranı 3/5'tir. Sınıfa 4 kız öğrenci daha katıldığında kız ve erkek öğrenci sayıları eşit oluyor.\n\nBuna göre sınıfın başlangıçtaki mevcudu kaçtır?",
    secenekler: ["16", "18", "20", "24", "32"],
    dogruCevap: 0,
    aciklama: "Kızlar 3k, erkekler 5k olsun. 3k + 4 = 5k ⇒ k = 2. Başlangıçta 6 kız ve 10 erkek, toplam 16 öğrenci vardır.",
  },
  {
    ders: "MATEMATIK",
    konu: "Sayı Problemleri",
    soruMetni:
      "Ali'nin elma sayısı, Ayşe'nin elma sayısının 3 katının 4 eksiğidir. Ayşe, Ali'ye 6 elma verirse Ali'nin elma sayısı Ayşe'nin elma sayısının 8 katı oluyor.\n\nBuna göre Ali'nin başlangıçta kaç elması vardır?",
    secenekler: ["20", "23", "26", "29", "32"],
    dogruCevap: 2,
    aciklama: "Ayşe'nin elma sayısı a olsun; Ali'nin 3a − 4'tür. 3a − 4 + 6 = 8(a − 6) ⇒ 3a + 2 = 8a − 48 ⇒ a = 10. Ali'nin elma sayısı 3 · 10 − 4 = 26.",
  },
  {
    ders: "MATEMATIK",
    konu: "Yaş Problemleri",
    soruMetni:
      "Bir babanın bugünkü yaşı oğlunun yaşının 4 katıdır. 6 yıl sonra babanın yaşı, oğlunun o zamanki yaşının 2 katından 12 fazla olacaktır.\n\nBuna göre baba ile oğlunun bugünkü yaşları toplamı kaçtır?",
    secenekler: ["30", "35", "40", "42", "45"],
    dogruCevap: 4,
    aciklama: "Oğlun yaşı x olsun. 4x + 6 = 2(x + 6) + 12 ⇒ 4x + 6 = 2x + 24 ⇒ x = 9. Baba 36 yaşındadır; toplam 9 + 36 = 45.",
  },
  {
    ders: "MATEMATIK",
    konu: "İşçi ve Havuz Problemleri",
    soruMetni:
      "Bir işi Ahmet tek başına 6 günde, Burak tek başına 12 günde, Can ise tek başına 12 günde bitirebilmektedir. Ahmet ile Burak birlikte 2 gün çalıştıktan sonra işin kalanını Can tek başına bitiriyor.\n\nBuna göre Can kaç gün çalışmıştır?",
    secenekler: ["4", "6", "8", "9", "10"],
    dogruCevap: 1,
    aciklama: "Ahmet ile Burak bir günde 1/6 + 1/12 = 1/4'ünü yapar; 2 günde işin 1/2'si biter. Kalan 1/2'yi günde 1/12'sini yapan Can {1/2|1/12} = 6 günde bitirir.",
  },
  {
    ders: "MATEMATIK",
    konu: "Hareket Problemleri",
    soruMetni:
      "A kentinden B kentine saatte 60 km sabit hızla giden bir araç, saatte 75 km sabit hızla gitseydi B kentine 1 saat erken varacaktı.\n\nBuna göre A ile B kentleri arası kaç km'dir?",
    secenekler: ["150", "200", "240", "300", "360"],
    dogruCevap: 3,
    aciklama: "Yol d olsun: d/60 − d/75 = 1 ⇒ {5d − 4d|300} = 1 ⇒ d = 300 km. Kontrol: 300/60 = 5 saat, 300/75 = 4 saat.",
  },
  {
    ders: "MATEMATIK",
    konu: "Kesir Problemleri",
    soruMetni: "Bir öğrenci harçlığının 1/3'ünü kitaba, kalan paranın 1/4'ünü yemeğe harcıyor. Geriye 150 TL kaldığına göre öğrencinin harçlığı kaç TL'dir?",
    secenekler: ["240", "270", "300", "360", "450"],
    dogruCevap: 2,
    aciklama: "Harçlık x olsun. Kitaptan sonra 2x/3 kalır; bunun 1/4'ü olan x/6 yemeğe gider. Kalan: 2x/3 − x/6 = x/2 = 150 ⇒ x = 300 TL.",
  },
  {
    ders: "MATEMATIK",
    konu: "Kümeler",
    soruMetni: "A ve B kümeleri için s(A) = 12, s(B) = 9 ve s(A ∩ B) = 4'tür.\n\nBuna göre s(A ∪ B) − s(A − B) farkı kaçtır?",
    secenekler: ["9", "10", "11", "12", "13"],
    dogruCevap: 0,
    aciklama: "s(A ∪ B) = 12 + 9 − 4 = 17; s(A − B) = 12 − 4 = 8. Fark 17 − 8 = 9'dur (bu fark aslında s(B)'ye eşittir).",
  },
  {
    ders: "MATEMATIK",
    konu: "Kümeler",
    soruMetni:
      "Bir sınıfta İngilizce bilen 18, Almanca bilen 12 öğrenci vardır. Her iki dili de bilen 5 öğrenci, bu dillerden hiçbirini bilmeyen ise 7 öğrenci bulunmaktadır.\n\nBuna göre sınıf mevcudu kaçtır?",
    secenekler: ["25", "27", "28", "30", "32"],
    dogruCevap: 4,
    aciklama: "En az bir dil bilenler 18 + 12 − 5 = 25 kişidir. Hiçbirini bilmeyen 7 kişi eklenince mevcut 32 olur.",
  },
  {
    ders: "MATEMATIK",
    konu: "Fonksiyonlar",
    soruMetni: "f(x) = 2x + 1 ve g(x) = 3x − 2 fonksiyonları veriliyor.\n\nBuna göre (g ∘ f)(2) değeri kaçtır?",
    secenekler: ["11", "13", "15", "17", "19"],
    dogruCevap: 1,
    aciklama: "(g ∘ f)(2) = g(f(2)). f(2) = 2 · 2 + 1 = 5; g(5) = 3 · 5 − 2 = 13.",
  },
  {
    ders: "MATEMATIK",
    konu: "Sayılar ve EBOB-EKOK",
    soruMetni: "Rakamlarının çarpımı, rakamlarının toplamının 2 katına eşit olan iki basamaklı doğal sayıların toplamı kaçtır?",
    secenekler: ["99", "107", "136", "143", "170"],
    dogruCevap: 3,
    aciklama:
      "Sayı ab olsun: a · b = 2(a + b) ⇒ ab − 2a − 2b + 4 = 4 ⇒ (a − 2)(b − 2) = 4. Rakam koşuluyla (a − 2, b − 2) = (1, 4), (2, 2), (4, 1) ⇒ sayılar 36, 44 ve 63'tür. Toplam 143.",
  },
  {
    ders: "MATEMATIK",
    konu: "Sayısal Mantık",
    soruMetni: "Belirli bir kurala göre oluşturulan\n\n3, 4, 7, 11, 18, 29, …\n\nsayı dizisinin 8. terimi kaçtır?",
    secenekler: ["76", "78", "81", "85", "94"],
    dogruCevap: 0,
    aciklama: "Üçüncü terimden itibaren her terim kendinden önceki iki terimin toplamıdır (3 + 4 = 7, 4 + 7 = 11, …). 7. terim 18 + 29 = 47, 8. terim 29 + 47 = 76'dır.",
  },
  {
    ders: "MATEMATIK",
    konu: "Olasılık",
    soruMetni: "Hileli olmayan iki zar birlikte atılıyor.\n\nZarların üst yüzüne gelen sayıların toplamının 8 olma olasılığı kaçtır?",
    secenekler: ["1/9", "1/12", "5/36", "1/6", "7/36"],
    dogruCevap: 2,
    aciklama: "Toplamı 8 olan durumlar (2,6), (3,5), (4,4), (5,3), (6,2) olmak üzere 5 tanedir. Tüm durumlar 36 olduğundan olasılık 5/36.",
  },
  {
    ders: "MATEMATIK",
    konu: "Sayısal Mantık",
    grupId: "onl-mat-delta",
    soruMetni: `${DELTA_ISLEMI}\n\nBuna göre (5 Δ 2) + (2 Δ 5) işleminin sonucu kaçtır?`,
    secenekler: ["12", "14", "15", "16", "18"],
    dogruCevap: 4,
    aciklama: "5 > 2 olduğundan 5 Δ 2 = 5² − 5 · 2 = 15. 2 ≤ 5 olduğundan 2 Δ 5 = 5 − 2 = 3. Toplam 15 + 3 = 18.",
  },
  {
    ders: "MATEMATIK",
    konu: "Sayısal Mantık",
    grupId: "onl-mat-delta",
    soruMetni: `${DELTA_ISLEMI}\n\nBuna göre x Δ 3 = 10 eşitliğini sağlayan x değerlerinin toplamı kaçtır?`,
    secenekler: ["−7", "−2", "2", "5", "12"],
    dogruCevap: 1,
    aciklama:
      "x > 3 ise x² − 3x = 10 ⇒ (x − 5)(x + 2) = 0; koşulu sağlayan x = 5'tir (−2 > 3 değildir). x ≤ 3 ise 3 − x = 10 ⇒ x = −7. Toplam 5 + (−7) = −2.",
  },
  {
    ders: "MATEMATIK",
    konu: "Grafik Problemleri",
    grupId: "onl-mat-defter",
    soruMetni: `${DEFTER}\n\nKırtasiye cumartesi günü de satış yaptığında altı günlük ortalama satış 16 defter olduğuna göre cumartesi günü kaç defter satılmıştır?`,
    gorselSvg: DEFTER_GRAFIGI,
    secenekler: ["15", "18", "19", "21", "24"],
    dogruCevap: 3,
    aciklama: "Grafiğe göre beş günde 12 + 18 + 9 + 15 + 21 = 75 defter satılmıştır. Altı günlük toplam 6 · 16 = 96 olduğundan cumartesi 96 − 75 = 21 defter satılmıştır.",
  },
  {
    ders: "MATEMATIK",
    konu: "Grafik Problemleri",
    grupId: "onl-mat-defter",
    soruMetni: `${DEFTER}\n\nDefterin satış fiyatı pazartesi, salı ve çarşamba günleri 25 TL; perşembe ve cuma günleri 30 TL olduğuna göre bu beş günde defter satışından elde edilen toplam gelir kaç TL'dir?`,
    gorselSvg: DEFTER_GRAFIGI,
    secenekler: ["1875", "1950", "2055", "2160", "2250"],
    dogruCevap: 2,
    aciklama: "Pazartesi-çarşamba: (12 + 18 + 9) · 25 = 975 TL. Perşembe-cuma: (15 + 21) · 30 = 1080 TL. Toplam 975 + 1080 = 2055 TL.",
  },
  // -- Geometri (4, gorselli) --
  {
    ders: "MATEMATIK",
    konu: "Geometri",
    geometri: true,
    soruMetni:
      "Şekildeki ABC üçgeninde D noktası [AC] üzerindedir. m(BAC) = 40°, m(ABD) = 35° ve m(ACB) = 50°'dir.\n\nBuna göre m(DBC) kaç derecedir?",
    gorselSvg:
      '<svg viewBox="0 0 340 270" xmlns="http://www.w3.org/2000/svg" font-family="Arial, sans-serif" fill="#1e293b"><polygon points="150,30 40,240 300,240" fill="none" stroke="#1e293b" stroke-width="2.5"/><line x1="40" y1="240" x2="232.5" y2="145.5" stroke="#1e293b" stroke-width="2"/><text x="144" y="22" font-size="15">A</text><text x="22" y="256" font-size="15">B</text><text x="304" y="256" font-size="15">C</text><text x="238" y="142" font-size="15">D</text><text x="138" y="66" font-size="13" fill="#dc2626">40°</text><text x="76" y="212" font-size="13" fill="#dc2626">35°</text><text x="258" y="232" font-size="13" fill="#dc2626">50°</text><text x="104" y="234" font-size="13" fill="#2563eb">?</text></svg>',
    secenekler: ["55", "60", "65", "70", "75"],
    dogruCevap: 0,
    aciklama:
      "ABD üçgeninde dış açı kuralıyla m(BDC) = m(BAD) + m(ABD) = 40° + 35° = 75°. DBC üçgeninde m(DBC) = 180° − 75° − 50° = 55°.",
  },
  {
    ders: "MATEMATIK",
    konu: "Geometri",
    geometri: true,
    soruMetni: "Şekilde ABCD bir kare, ABE ise karenin içinde kalan bir eşkenar üçgendir.\n\nBuna göre m(EDC) kaç derecedir?",
    gorselSvg:
      '<svg viewBox="0 0 320 290" xmlns="http://www.w3.org/2000/svg" font-family="Arial, sans-serif" fill="#1e293b"><rect x="60" y="40" width="200" height="200" fill="none" stroke="#1e293b" stroke-width="2.5"/><polygon points="60,240 260,240 160,66.8" fill="#dbeafe" stroke="#1e293b" stroke-width="2"/><line x1="60" y1="40" x2="160" y2="66.8" stroke="#1e293b" stroke-width="2"/><text x="42" y="258" font-size="15">A</text><text x="266" y="258" font-size="15">B</text><text x="266" y="36" font-size="15">C</text><text x="42" y="36" font-size="15">D</text><text x="154" y="90" font-size="15">E</text><text x="84" y="58" font-size="13" fill="#2563eb">?</text></svg>',
    secenekler: ["30", "25", "22,5", "20", "15"],
    dogruCevap: 4,
    aciklama:
      "|AD| = |AB| = |AE| olduğundan ADE ikizkenar üçgendir. m(DAE) = 90° − 60° = 30° ⇒ m(ADE) = {180° − 30°|2} = 75°. m(EDC) = 90° − 75° = 15°.",
  },
  {
    ders: "MATEMATIK",
    konu: "Geometri",
    geometri: true,
    soruMetni:
      "Şekildeki ABC dik üçgeninde [AB] ⊥ [BC], |AC| = 10 cm ve |AB| = 6 cm'dir. D noktası [BC]'nin orta noktasıdır.\n\nBuna göre ABD üçgeninin alanı kaç cm²'dir?",
    gorselSvg:
      '<svg viewBox="0 0 340 280" xmlns="http://www.w3.org/2000/svg" font-family="Arial, sans-serif" fill="#1e293b"><polygon points="60,60 60,240 180,240" fill="#dbeafe"/><polygon points="60,60 60,240 300,240" fill="none" stroke="#1e293b" stroke-width="2.5"/><line x1="60" y1="60" x2="180" y2="240" stroke="#1e293b" stroke-width="2"/><polyline points="60,226 74,226 74,240" fill="none" stroke="#1e293b" stroke-width="1.5"/><text x="50" y="52" font-size="15">A</text><text x="42" y="258" font-size="15">B</text><text x="304" y="258" font-size="15">C</text><text x="174" y="260" font-size="15">D</text><text x="38" y="154" font-size="13" fill="#dc2626">6</text><text x="186" y="140" font-size="13" fill="#dc2626">10</text></svg>',
    secenekler: ["10", "12", "15", "18", "24"],
    dogruCevap: 1,
    aciklama: "Pisagor bağıntısıyla |BC|² = 10² − 6² = 64 ⇒ |BC| = 8 cm, |BD| = 4 cm. Alan(ABD) = {6 · 4|2} = 12 cm².",
  },
  {
    ders: "MATEMATIK",
    konu: "Geometri",
    geometri: true,
    soruMetni:
      "Taban ayrıtları 8 cm ve 6 cm olan dikdörtgenler prizması biçimindeki bir kapta 4 cm yüksekliğinde su vardır. Bu suyun tamamı, taban ayrıtları 4 cm olan kare dik prizma biçimindeki boş bir kaba boşaltılıyor.\n\nBuna göre ikinci kaptaki suyun yüksekliği kaç cm olur?",
    gorselSvg:
      '<svg viewBox="0 0 420 270" xmlns="http://www.w3.org/2000/svg" font-family="Arial, sans-serif" fill="#1e293b"><rect x="20" y="160" width="160" height="80" fill="#7dd3fc"/><polygon points="180,240 228,204 228,124 180,160" fill="#38bdf8"/><polygon points="20,160 180,160 228,124 68,124" fill="#bae6fd"/><rect x="20" y="100" width="160" height="140" fill="none" stroke="#1e293b" stroke-width="2"/><polygon points="20,100 68,64 228,64 180,100" fill="none" stroke="#1e293b" stroke-width="2"/><polyline points="180,240 228,204 228,64" fill="none" stroke="#1e293b" stroke-width="2"/><text x="96" y="258" font-size="13" fill="#dc2626">8</text><text x="210" y="234" font-size="13" fill="#dc2626">6</text><text x="6" y="205" font-size="13" fill="#dc2626">4</text><rect x="290" y="40" width="80" height="200" fill="none" stroke="#1e293b" stroke-width="2"/><polygon points="290,40 314,22 394,22 370,40" fill="none" stroke="#1e293b" stroke-width="2"/><polyline points="370,240 394,222 394,22" fill="none" stroke="#1e293b" stroke-width="2"/><text x="326" y="258" font-size="13" fill="#dc2626">4</text><text x="386" y="242" font-size="13" fill="#dc2626">4</text></svg>',
    secenekler: ["6", "8", "10", "12", "16"],
    dogruCevap: 3,
    aciklama: "Suyun hacmi 8 · 6 · 4 = 192 cm³'tür. İkinci kabın taban alanı 4 · 4 = 16 cm² olduğundan su yüksekliği 192/16 = 12 cm olur.",
  },

  // ---- TARİH (27) ----
  {
    ders: "TARIH",
    konu: "İlk Türk-İslam Kültür ve Medeniyeti",
    soruMetni: "Karahanlılar döneminde Kaşgarlı Mahmud tarafından, Araplara Türkçeyi öğretmek ve Türkçenin Arapça kadar zengin bir dil olduğunu göstermek amacıyla yazılan eser aşağıdakilerden hangisidir?",
    secenekler: ["Atabetü'l-Hakayık", "Divanü Lügati't-Türk", "Kutadgu Bilig", "Siyasetname", "Divan-ı Hikmet"],
    dogruCevap: 1,
    aciklama: "Divanü Lügati't-Türk (1072-1074), Kaşgarlı Mahmud'un Araplara Türkçeyi öğretmek amacıyla yazdığı ilk Türkçe sözlüktür. Kutadgu Bilig Yusuf Has Hacib'in, Atabetü'l-Hakayık Edip Ahmet Yükneki'nin, Divan-ı Hikmet Ahmet Yesevi'nin, Siyasetname ise Büyük Selçuklu veziri Nizamülmülk'ün eseridir.",
  },
  {
    ders: "TARIH",
    konu: "Osmanlı Kültür ve Medeniyeti",
    soruMetni: "Osmanlı Devleti'nde Divan-ı Hümayun'da dış işlerinden sorumlu olan; görevi XIX. yüzyılda Hariciye Nazırlığına dönüştürülen görevli aşağıdakilerden hangisidir?",
    secenekler: ["Defterdar", "Nişancı", "Kazasker", "Reisülküttap", "Kaptan-ı Derya"],
    dogruCevap: 3,
    aciklama: "Reisülküttap, Divan-ı Hümayun kâtiplerinin başıdır ve dış yazışmalarla antlaşmaların hazırlanmasından sorumludur; II. Mahmud döneminde görevi Hariciye Nazırlığına dönüştürülmüştür. Defterdar mali işlere, nişancı padişah tuğrasına ve tapu kayıtlarına, kazasker adalet ve eğitim işlerine bakardı.",
  },
  {
    ders: "TARIH",
    konu: "İslamiyet Öncesi Türk Kültür ve Medeniyeti",
    soruMetni:
      "İslamiyet öncesi Türk devletlerinde hükümdarın başkanlığında; hatun, hanedan üyeleri, boy beyleri ve ileri gelen devlet adamlarının katılımıyla toplanan, savaş, barış ve tahta geçiş gibi önemli devlet işlerinin görüşüldüğü meclis aşağıdakilerden hangisidir?",
    secenekler: ["Kurultay (Toy)", "Divan-ı Hümayun", "Ahilik", "Lonca", "Encümen-i Daniş"],
    dogruCevap: 0,
    aciklama:
      "Kurultay (Toy), İslamiyet öncesi Türk devletlerinde önemli devlet işlerinin görüşüldüğü danışma meclisidir. Divan-ı Hümayun Osmanlı'ya; Ahilik ve lonca esnaf teşkilatlarına; Encümen-i Daniş Tanzimat dönemi bilim kuruluna aittir.",
  },
  {
    ders: "TARIH",
    konu: "İlk Türk-İslam Devletleri",
    soruMetni:
      "751'de Abbasiler ile Çin arasında yapılan Talas Savaşı'nda Karlukların Abbasilerin yanında yer alması, savaşın sonucunu belirlemiştir.\n\nAşağıdakilerden hangisi Talas Savaşı'nın sonuçlarından biri değildir?",
    secenekler: [
      "Türklerin İslamiyet'e geçişinin hızlanması",
      "Kâğıt yapım tekniğinin İslam dünyasına geçmesi",
      "Çin'in Orta Asya'daki ilerleyişinin durması",
      "Türk-Arap ilişkilerinin olumlu yönde gelişmesi",
      "Anadolu'nun kapılarının Türklere açılması",
    ],
    dogruCevap: 4,
    aciklama:
      "Anadolu'nun kapılarının Türklere açılması, 1071 Malazgirt Meydan Muharebesi'nin sonucudur. Diğer seçenekler Talas Savaşı'nın bilinen sonuçlarıdır.",
  },
  {
    ders: "TARIH",
    konu: "İnkılap Tarihi",
    soruMetni: "Aşağıdakilerden hangisi hukuk alanında yapılan inkılaplardan biridir?",
    secenekler: ["Şapka Kanunu'nun kabulü", "Tevhid-i Tedrisat Kanunu'nun kabulü", "Türk Medeni Kanunu'nun kabulü", "Harf İnkılabı", "Ölçüler Kanunu'nun kabulü"],
    dogruCevap: 2,
    aciklama: "Türk Medeni Kanunu (1926), aile ve kişiler hukukunu laik esaslara göre düzenleyen hukuk inkılabıdır. Şapka Kanunu ve Ölçüler Kanunu toplumsal hayata, Tevhid-i Tedrisat ve Harf İnkılabı ise eğitim ve kültür alanına yöneliktir.",
  },
  {
    ders: "TARIH",
    konu: "İlk Türk-İslam Kültür ve Medeniyeti",
    soruMetni:
      "Karahanlılar döneminde Yusuf Has Hacip tarafından yazılıp Tabgaç Buğra Han'a sunulan; “mutluluk veren bilgi” anlamına gelen ve ideal devlet yönetimine ilişkin öğütler içeren eser aşağıdakilerden hangisidir?",
    secenekler: ["Atabetü'l-Hakayık", "Divan-ı Hikmet", "Kutadgu Bilig", "Siyasetname", "Divan-ı Lügati't-Türk"],
    dogruCevap: 2,
    aciklama:
      "Kutadgu Bilig, Türk-İslam edebiyatının ilk siyasetnamesi kabul edilir. Atabetü'l-Hakayık Edip Ahmet Yükneki'nin, Divan-ı Hikmet Hoca Ahmet Yesevi'nin, Siyasetname Nizamülmülk'ün, Divan-ı Lügati't-Türk Kaşgarlı Mahmut'un eseridir.",
  },
  {
    ders: "TARIH",
    konu: "İnkılap Tarihi",
    soruMetni: "3 Mart 1924'te halifeliğin kaldırılmasıyla aynı gün kabul edilen ve bütün eğitim-öğretim kurumlarını Maarif Vekâletine (Millî Eğitim Bakanlığı) bağlayan düzenleme aşağıdakilerden hangisidir?",
    secenekler: ["Tevhid-i Tedrisat Kanunu", "Tekke ve zaviyelerin kapatılması", "Şapka Kanunu", "Soyadı Kanunu", "Harf İnkılabı"],
    dogruCevap: 0,
    aciklama: "Tevhid-i Tedrisat (Öğretim Birliği) Kanunu, halifeliğin ve Şer'iye ve Evkaf Vekâletinin kaldırılmasıyla aynı gün (3 Mart 1924) kabul edilmiştir. Tekke ve zaviyelerin kapatılması ile Şapka Kanunu 1925'te, Harf İnkılabı 1928'de, Soyadı Kanunu 1934'te gerçekleşmiştir.",
  },
  {
    ders: "TARIH",
    konu: "Osmanlı Kuruluş ve Yükselme",
    soruMetni: "Aşağıdakilerden hangisi İstanbul'un fethinin (1453) sonuçlarından biri değildir?",
    secenekler: [
      "Bizans İmparatorluğu'nun yıkılması",
      "Osmanlı'nın Anadolu ve Rumeli toprakları arasında bütünlüğün sağlanması",
      "Boğazların denetiminin Osmanlı Devleti'ne geçmesi",
      "Orta Çağ'ın sona erip Yeni Çağ'ın başlaması",
      "Osmanlıların Rumeli'ye ilk kez geçmesi",
    ],
    dogruCevap: 4,
    aciklama: "Osmanlılar Rumeli'ye ilk kez Orhan Bey döneminde Çimpe Kalesi'nin alınmasıyla (1353) geçmiştir. Diğer seçenekler İstanbul'un fethinin sonuçlarıdır.",
  },
  {
    ders: "TARIH",
    konu: "İnkılap Tarihi",
    soruMetni: "Cumhuriyetin ilk yıllarında köylünün vergi yükünü hafifletmek ve tarımsal üretimi artırmak amacıyla 1925'te kaldırılan vergi aşağıdakilerden hangisidir?",
    secenekler: ["Cizye", "Aşar", "Avarız", "İspençe", "Haraç"],
    dogruCevap: 1,
    aciklama: "Ürünün belirli bir oranında alınan aşar (öşür) vergisi 1925'te kaldırılmıştır. Bu karar, nüfusun büyük bölümünü oluşturan köylüyü rahatlatmayı ve tarımı canlandırmayı amaçlar.",
  },
  {
    ders: "TARIH",
    konu: "Osmanlı Kültür ve Medeniyeti",
    soruMetni:
      "Osmanlı Devleti'nde Hristiyan ailelerin erkek çocuklarının belirli aralıklarla toplanarak Türk-İslam kültürüyle yetiştirildiği; bu çocukların yeteneklerine göre Kapıkulu ocaklarında ya da saray hizmetinde görevlendirildiği sistem aşağıdakilerden hangisidir?",
    secenekler: ["Pençik", "İltizam", "Tımar", "Devşirme", "Müsadere"],
    dogruCevap: 3,
    aciklama:
      "Bu sistem devşirmedir. Pençik savaş esirlerinin beşte birinin devlete ayrılması, iltizam vergi toplama hakkının satılması, tımar dirlik sistemi, müsadere ise devlet görevlisinin mallarına el konulmasıdır.",
  },
  {
    ders: "TARIH",
    konu: "Osmanlı Kültür ve Medeniyeti",
    soruMetni:
      "Osmanlı Devleti'nde uygulanan tımar sisteminin;\nI. hazineden para harcanmadan büyük bir atlı asker gücünün beslenmesi,\nII. tarımsal üretimin denetim altında tutulması ve sürekliliğinin sağlanması,\nIII. taşrada güvenlik ve asayişin korunması,\nIV. merkezî hazineye peşin ve yüksek nakit gelir sağlanması\nyararlarından hangileri devlete sağladığı katkılar arasında gösterilebilir?",
    secenekler: ["I ve II", "I ve IV", "II ve IV", "I, II ve III", "II, III ve IV"],
    dogruCevap: 3,
    aciklama:
      "Tımar sisteminde vergiyi toplayan sipahi bu gelirle atlı asker besler, toprağın işlenmesini ve köylünün güvenliğini denetler. Hazineye peşin nakit gelir sağlayan uygulama ise tımar değil iltizamdır.",
  },
  {
    ders: "TARIH",
    konu: "Osmanlı Gerileme (XVIII. yy)",
    soruMetni:
      "Osmanlı Devleti, Belgrat Antlaşması'nda (1739) arabuluculuk yapan Fransa'ya 1740'ta tanıdığı kapitülasyonları sürekli hâle getirmiştir. Böylece bu ayrıcalıkların her padişah değişiminde yenilenmesi gereği ortadan kalkmıştır.\n\nBu gelişmenin uzun vadeli sonucu aşağıdakilerden hangisidir?",
    secenekler: [
      "Osmanlı'nın Avrupa'da yeni topraklar kazanması",
      "Osmanlı ekonomisinin zamanla yabancı devletlerin etkisi altına girmesine zemin hazırlanması",
      "Fransa ile ilişkilerin tamamen kesilmesi",
      "Osmanlı donanmasının Akdeniz'de üstünlük kurması",
      "Lonca teşkilatının yabancı mallar karşısında güçlenmesi",
    ],
    dogruCevap: 1,
    aciklama:
      "Sürekli hâle gelen kapitülasyonlar yabancı tüccarlara gümrük ve vergi ayrıcalıkları sağlamış; yerli üretici ve esnafın rekabet gücünü azaltarak Osmanlı ekonomisinin yabancıların etkisine girmesine yol açmıştır.",
  },
  {
    ders: "TARIH",
    konu: "Osmanlı Duraklama (XVII. yy)",
    soruMetni:
      "II. Viyana Kuşatması'nın (1683) başarısızlıkla sonuçlanmasından sonra Kutsal İttifak devletleriyle yapılan uzun savaşların ardından imzalanan; Osmanlı Devleti'nin ilk kez büyük çapta toprak kaybettiği antlaşma aşağıdakilerden hangisidir?",
    secenekler: ["Zitvatorok", "Pasarofça", "Karlofça", "Küçük Kaynarca", "İstanbul"],
    dogruCevap: 2,
    aciklama:
      "Karlofça Antlaşması (1699) ile Macaristan'ın büyük bölümü Avusturya'ya, Mora Venedik'e, Podolya Lehistan'a bırakılmış; Osmanlı ilk kez büyük çapta toprak kaybetmiştir. Bu antlaşma Duraklama Dönemi'nin sonu kabul edilir.",
  },
  {
    ders: "TARIH",
    konu: "Osmanlı Kültür ve Medeniyeti",
    soruMetni:
      "III. Selim döneminde Avrupa tarzında eğitilerek Yeniçeri Ocağı'na alternatif olarak kurulan; Kabakçı Mustafa İsyanı sonucunda kaldırılan ordu aşağıdakilerden hangisidir?",
    secenekler: ["Nizam-ı Cedid", "Asakir-i Mansure-i Muhammediye", "Sekban-ı Cedid", "Kuva-yı Seyyare", "Kapıkulu Süvarileri"],
    dogruCevap: 0,
    aciklama:
      "Nizam-ı Cedid ordusu III. Selim tarafından kurulmuş, 1807'deki Kabakçı Mustafa İsyanı ile kaldırılmıştır. Sekban-ı Cedid ve Asakir-i Mansure-i Muhammediye II. Mahmut döneminde kurulmuştur.",
  },
  {
    ders: "TARIH",
    konu: "Osmanlı Dağılma (XIX. yy)",
    soruMetni: "Aşağıdakilerden hangisi Tanzimat Fermanı (1839) ile getirilen düzenlemelerden biri değildir?",
    secenekler: [
      "Herkesin can, mal ve namus güvenliğinin devlet güvencesine alınması",
      "Vergilerin herkesin gelirine göre alınması",
      "Kimsenin yargılanmadan cezalandırılmaması",
      "Askerlik hizmetinin düzenli ve belirli bir süreye bağlanması",
      "Meclis-i Mebusan'ın açılarak halkın yönetime katılması",
    ],
    dogruCevap: 4,
    aciklama: "Meclis-i Mebusan, 1876'da Kanun-i Esasi ile kurulmuştur (I. Meşrutiyet). Diğer seçenekler Tanzimat Fermanı'nın hükümleridir.",
  },
  {
    ders: "TARIH",
    konu: "Çağdaş Türk ve Dünya Tarihi",
    soruMetni: "Türkiye, Kuzey Atlantik Antlaşması Örgütüne (NATO) hangi yıl üye olmuştur?",
    secenekler: ["1945", "1947", "1949", "1950", "1952"],
    dogruCevap: 4,
    aciklama: "NATO 1949'da kurulmuş, Türkiye ve Yunanistan 18 Şubat 1952'de örgüte üye olmuştur. Türkiye'nin Kore Savaşı'na (1950) asker göndermesi bu üyeliğin önünü açmıştır.",
  },
  {
    ders: "TARIH",
    konu: "XX. Yüzyılda Osmanlı",
    soruMetni: "Aşağıdakilerden hangisi Balkan Savaşları'nın (1912-1913) sonuçlarından biri değildir?",
    secenekler: [
      "Osmanlı Devleti'nin Rumeli topraklarının büyük bölümünü kaybetmesi",
      "Arnavutluk'un bağımsızlığını ilan etmesi",
      "Kırım'ın Osmanlı Devleti'nden ayrılması",
      "Edirne'nin II. Balkan Savaşı'nda geri alınması",
      "Balkanlardan Anadolu'ya yoğun bir göç dalgasının yaşanması",
    ],
    dogruCevap: 2,
    aciklama: "Kırım, 1774 Küçük Kaynarca Antlaşması ile Osmanlı'dan ayrılmış ve 1783'te Rusya'ya katılmıştır. Diğer seçenekler Balkan Savaşları'nın sonuçlarıdır.",
  },
  {
    ders: "TARIH",
    konu: "Millî Mücadele",
    soruMetni:
      "Kuvayımilliye birlikleri ile ilgili;\nI. Düzenli ordu kurulana kadar düşman ilerleyişini yavaşlatmıştır.\nII. Yerel ve bölgesel nitelikte örgütlenmiştir.\nIII. Merkezî bir komuta altında, tek elden yönetilmiştir.\nifadelerinden hangileri doğrudur?",
    secenekler: ["Yalnız I", "I ve II", "I ve III", "II ve III", "I, II ve III"],
    dogruCevap: 1,
    aciklama:
      "Kuvayımilliye birlikleri bölgesel olarak örgütlenmiş, düzenli ordu kurulana kadar düşmanı oyalamıştır. Birlikler dağınık ve bağımsız hareket ettiğinden merkezî bir komutaya sahip değildi; bu eksiklik düzenli orduya geçişin nedenlerinden biridir.",
  },
  {
    ders: "TARIH",
    konu: "Millî Mücadele",
    soruMetni:
      "Manda ve himayenin kesin olarak reddedildiği; bütün yerel cemiyetlerin “Anadolu ve Rumeli Müdafaa-i Hukuk Cemiyeti” adıyla tek çatı altında birleştirildiği ve İrade-i Milliye gazetesinin çıkarılmasına karar verilen kongre aşağıdakilerden hangisidir?",
    secenekler: ["Erzurum Kongresi", "Balıkesir Kongresi", "Alaşehir Kongresi", "Sivas Kongresi", "Pozantı Kongresi"],
    dogruCevap: 3,
    aciklama:
      "Bu kararlar Sivas Kongresi'nde (4-11 Eylül 1919) alınmıştır. Ulusal nitelikteki bu kongrede Temsil Heyeti'nin yetkisi de bütün yurdu temsil edecek biçimde genişletilmiştir.",
  },
  {
    ders: "TARIH",
    konu: "Millî Mücadele",
    soruMetni:
      "Son Osmanlı Mebusan Meclisi'nde kabul edilen; Mondros Ateşkesi imzalandığı sırada Türk askerinin savunduğu sınırlar içindeki toprakların bölünmez bir bütün olduğunu ilan eden ve kapitülasyonları reddeden kararlar aşağıdakilerden hangisidir?",
    secenekler: ["Misak-ı Millî", "Amasya Genelgesi", "Amasya Görüşmeleri", "Havza Genelgesi", "Teşkilat-ı Esasiye Kanunu"],
    dogruCevap: 0,
    aciklama:
      "Misak-ı Millî (Ulusal Ant), 28 Ocak 1920'de son Osmanlı Mebusan Meclisi'nde kabul edilmiştir. İtilaf Devletleri bu kararlara tepki olarak 16 Mart 1920'de İstanbul'u resmen işgal etmiştir.",
  },
  {
    ders: "TARIH",
    konu: "Millî Mücadele",
    soruMetni: "Aşağıdaki gelişmelerden hangisi I. İnönü Muharebesi'nin (Ocak 1921) kazanılmasından sonra gerçekleşmemiştir?",
    secenekler: [
      "Sevr Antlaşması'nın imzalanması",
      "İtilaf Devletleri'nin Londra Konferansı'na TBMM'yi de davet etmesi",
      "Sovyet Rusya ile Moskova Antlaşması'nın imzalanması",
      "İstiklal Marşı'nın kabul edilmesi",
      "Teşkilat-ı Esasiye Kanunu'nun kabul edilmesi",
    ],
    dogruCevap: 0,
    aciklama:
      "Sevr Antlaşması 10 Ağustos 1920'de, yani I. İnönü'den önce imzalanmıştır. Teşkilat-ı Esasiye (20 Ocak 1921), Londra Konferansı (Şubat-Mart 1921), İstiklal Marşı (12 Mart 1921) ve Moskova Antlaşması (16 Mart 1921) muharebeden sonradır.",
  },
  {
    ders: "TARIH",
    konu: "Çağdaş Türk ve Dünya Tarihi",
    soruMetni: "1947'de ilan edilen; Sovyet yayılmacılığına karşı Türkiye ve Yunanistan'a ABD tarafından askerî ve ekonomik yardım yapılmasını öngören doktrin aşağıdakilerden hangisidir?",
    secenekler: ["Marshall Planı", "Eisenhower Doktrini", "Monroe Doktrini", "Nixon Doktrini", "Truman Doktrini"],
    dogruCevap: 4,
    aciklama: "Truman Doktrini (1947), Sovyetler Birliği'nin baskısı altındaki Türkiye ve Yunanistan'a askerî ve ekonomik yardımı öngörür. Marshall Planı (1948) Avrupa'nın ekonomik kalkınmasına, Eisenhower Doktrini (1957) Orta Doğu'ya yöneliktir.",
  },
  {
    ders: "TARIH",
    konu: "İnkılap Tarihi",
    soruMetni:
      "İtilaf Devletleri'nin Lozan Barış Konferansı'na hem İstanbul hükümetini hem de TBMM hükümetini davet etmesi, ikili bir görüntü oluşmasına neden olmuştur. TBMM bu durumu ortadan kaldırmak için 1 Kasım 1922'de önemli bir karar almıştır.\n\nBu karar aşağıdakilerden hangisidir?",
    secenekler: [
      "Cumhuriyetin ilan edilmesi",
      "Halifeliğin kaldırılması",
      "Tevhid-i Tedrisat Kanunu'nun kabulü",
      "Saltanatın kaldırılması",
      "Şer'iye ve Evkaf Vekâletinin kaldırılması",
    ],
    dogruCevap: 3,
    aciklama: "TBMM, 1 Kasım 1922'de saltanatı kaldırmış; böylece İstanbul hükümetinin varlığı sona ermiş ve Lozan'a yalnızca TBMM temsilcileri katılmıştır.",
  },
  {
    ders: "TARIH",
    konu: "İnkılap Tarihi",
    soruMetni: "Aşağıdaki inkılap - Atatürk ilkesi eşleştirmelerinden hangisi yanlıştır?",
    secenekler: [
      "Saltanatın kaldırılması - Cumhuriyetçilik",
      "Türk Medeni Kanunu'nun kabulü - Laiklik",
      "Halifeliğin kaldırılması - Devletçilik",
      "Türk Tarih Kurumu'nun kurulması - Milliyetçilik",
      "Aşar vergisinin kaldırılması - Halkçılık",
    ],
    dogruCevap: 2,
    aciklama:
      "Halifeliğin kaldırılması din ve devlet işlerinin ayrılmasını amaçladığından laiklik ve cumhuriyetçilik ilkeleriyle ilgilidir. Devletçilik ise ekonomik alanla (ör. Birinci Beş Yıllık Sanayi Planı) ilgilidir.",
  },
  {
    ders: "TARIH",
    konu: "Atatürk Dönemi İç ve Dış Politika",
    soruMetni:
      "1925'te Doğu Anadolu'da başlayan; bastırılması amacıyla Takrir-i Sükûn Kanunu'nun çıkarılmasına ve Terakkiperver Cumhuriyet Fırkası'nın kapatılmasına yol açan ayaklanma aşağıdakilerden hangisidir?",
    secenekler: ["Menemen Olayı", "Şeyh Sait İsyanı", "Ağrı İsyanı", "Çerkez Ethem İsyanı", "Kubilay Olayı"],
    dogruCevap: 1,
    aciklama: "Şeyh Sait İsyanı (1925) üzerine Takrir-i Sükûn Kanunu çıkarılmış ve isyanla ilişkilendirilen Terakkiperver Cumhuriyet Fırkası kapatılmıştır. Menemen (Kubilay) Olayı 1930'da yaşanmıştır.",
  },
  {
    ders: "TARIH",
    konu: "Çağdaş Türk ve Dünya Tarihi",
    soruMetni: "Türkiye'nin 1950'de Birleşmiş Milletler kararı doğrultusunda asker göndererek katıldığı savaş aşağıdakilerden hangisidir?",
    secenekler: ["Vietnam Savaşı", "Kore Savaşı", "Körfez Savaşı", "Arap-İsrail Savaşı", "Afganistan Savaşı"],
    dogruCevap: 1,
    aciklama: "Türkiye, BM kararıyla Kore Savaşı'na (1950-1953) tugay düzeyinde asker göndermiştir. Bu katılım, Türkiye'nin 1952'de NATO'ya üye olmasında etkili olmuştur.",
  },
  {
    ders: "TARIH",
    konu: "Çağdaş Türk ve Dünya Tarihi",
    soruMetni: "1955'te Türkiye, Irak, İngiltere, İran ve Pakistan arasında kurulan; 1959'da Irak'ın ayrılmasıyla CENTO adını alan savunma örgütü aşağıdakilerden hangisidir?",
    secenekler: ["Sadabat Paktı", "Balkan Paktı", "Varşova Paktı", "Bağdat Paktı", "Balkan Antantı"],
    dogruCevap: 3,
    aciklama: "Bağdat Paktı 1955'te kurulmuş, Irak'ın 1959'da ayrılmasıyla Merkezî Antlaşma Teşkilatı (CENTO) adını almıştır. Sadabat Paktı (1937) ve Balkan Antantı (1934) Atatürk dönemine, Balkan Paktı (1953) Türkiye-Yunanistan-Yugoslavya ittifakına aittir.",
  },

  // ---- COĞRAFYA (18) ----
  {
    ders: "COGRAFYA",
    konu: "Coğrafi Konum",
    soruMetni: "Aşağıdakilerden hangisi Türkiye'nin özel (göreceli) konumunun bir sonucu değildir?",
    secenekler: [
      "Boğazlar sayesinde Karadeniz ile Akdeniz arasında geçiş noktası olması",
      "Enerji nakil hatlarının güzergâhında bulunması",
      "Kuzeyden güneye gidildikçe genel olarak sıcaklığın artması",
      "Üç tarafının denizlerle çevrili olması",
      "Ortalama yükseltisinin fazla olması",
    ],
    dogruCevap: 2,
    aciklama:
      "Kuzeyden güneye gidildikçe sıcaklığın artması, Türkiye'nin Kuzey Yarım Küre'deki enlem konumuyla, yani matematik (mutlak) konumuyla ilgilidir. Boğazlar, enerji hatları, denizlerle çevrili olma ve yükselti ise özel konum özellikleridir.",
  },
  {
    ders: "COGRAFYA",
    konu: "Fiziki Özellikler",
    soruMetni:
      "Konya'nın Karapınar ilçesi, rüzgâr erozyonunun en etkili olduğu yerlerden biridir; burada kum tepeleri (kumullar) oluşmuş ve uzun yıllar ağaçlandırma ile rüzgâr perdesi çalışmaları yapılmıştır.\n\nKarapınar'da rüzgâr erozyonunun etkili olmasında aşağıdakilerden hangisinin payı yoktur?",
    secenekler: [
      "Akarsu ağının sık olması",
      "Yağışların az olması",
      "Doğal bitki örtüsünün cılız olması",
      "Toprakların gevşek ve kumlu olması",
      "Aşırı otlatma ve yanlış tarım uygulamaları",
    ],
    dogruCevap: 0,
    aciklama:
      "Rüzgâr erozyonu kurak, bitki örtüsü zayıf ve toprağı gevşek alanlarda etkilidir. Akarsu ağının sık olması nemli bir ortamı gösterir ve rüzgâr erozyonunu artırmaz.",
  },
  {
    ders: "COGRAFYA",
    konu: "Fiziki Özellikler",
    soruMetni:
      "Haritada numaralandırılarak gösterilen göllerden hangisi doğal yollarla oluşmamış, bir akarsuyun önüne yapılan barajın gerisinde biriken sularla oluşmuştur?",
    gorselSvg: turkiyeHaritasi({
      noktalar: [
        { etiket: "I", boylam: 42.9, enlem: 38.65 }, // Van Golu
        { etiket: "II", boylam: 33.4, enlem: 38.75 }, // Tuz Golu
        { etiket: "III", boylam: 31.5, enlem: 37.75 }, // Beysehir Golu
        { etiket: "IV", boylam: 30.85, enlem: 38.0 }, // Egirdir Golu
        { etiket: "V", boylam: 39.2, enlem: 38.85 }, // Keban Baraj Golu
      ],
    }),
    secenekler: ["I", "II", "III", "IV", "V"],
    dogruCevap: 4,
    aciklama:
      "V numaralı Keban Baraj Gölü, Fırat Nehri üzerine kurulan Keban Barajı'nın gerisinde oluşmuş yapay bir göldür. I Van Gölü volkanik set, II Tuz Gölü tektonik, III Beyşehir ve IV Eğirdir gölleri ise karstik-tektonik kökenli doğal göllerdir.",
  },
  {
    ders: "COGRAFYA",
    konu: "Tarım",
    soruMetni:
      "Haritada taralı olarak gösterilen illerde yetiştirilen ve Türkiye üretiminin büyük bölümünün karşılandığı; yetişme dönemi boyunca bol ve düzenli yağış, asitli topraklar isteyen tarım ürünü aşağıdakilerden hangisidir?",
    gorselSvg: turkiyeHaritasi({ taraliIller: ["Rize", "Artvin"] }),
    secenekler: ["Fındık", "Çay", "Pamuk", "Zeytin", "Turunçgil"],
    dogruCevap: 1,
    aciklama:
      "Taralı iller Rize ve Artvin'dir. Her mevsim yağışlı Doğu Karadeniz kıyılarında yetişen çay, Türkiye'de en çok Rize'de üretilir. Fındık daha çok Ordu, Giresun ve Samsun'da; pamuk, zeytin ve turunçgiller ise kurak yazlı bölgelerde yetiştirilir.",
  },
  {
    ders: "COGRAFYA",
    konu: "İklim ve Bitki Örtüsü",
    soruMetni:
      "Grafiklerde bir meteoroloji istasyonuna ait uzun yıllar aylık ortalama sıcaklık ve aylık ortalama yağış değerleri verilmiştir.\n\nBu istasyonun bulunduğu yöreyle ilgili aşağıdakilerden hangisi söylenemez?",
    // MGM, Erzurum uzun yillar (1929-2025) aylik ortalamalari.
    gorselSvg: iklimGrafigi(
      [-9.1, -7.6, -2.3, 5.4, 10.7, 14.9, 19.2, 19.6, 14.8, 8.2, 1.2, -5.7],
      [21.3, 25.3, 35.4, 55.1, 73.3, 48.2, 28.8, 17.5, 23.9, 46.9, 33.0, 21.8],
    ),
    secenekler: [
      "Kışlar uzun ve çok soğuk geçer.",
      "Yıllık sıcaklık farkı fazladır.",
      "En fazla yağış ilkbahar sonunda düşer.",
      "Yaz kuraklığına uyum sağlamış maki toplulukları yaygındır.",
      "Kış aylarında yağışlar daha çok kar biçiminde düşer.",
    ],
    dogruCevap: 3,
    aciklama:
      "Grafikte kış ortalamaları 0 °C'nin altında, yıllık sıcaklık farkı yaklaşık 29 °C ve en yağışlı ay mayıstır; bu, Doğu Anadolu'da görülen sert karasal iklimdir (veriler: MGM, Erzurum 1929-2025). Maki, kışları ılık geçen Akdeniz ikliminin bitki örtüsüdür.",
  },
  {
    ders: "COGRAFYA",
    konu: "Fiziki Özellikler",
    soruMetni: "Çukurova, Bafra ve Çarşamba ovalarının oluşumunda etkili olan temel süreç aşağıdakilerden hangisidir?",
    secenekler: [
      "Rüzgârların taşıdığı kumların birikmesi",
      "Volkanik lavların yayılarak soğuması",
      "Kalkerli arazilerde suyun eritme etkisi",
      "Akarsuların taşıdığı alüvyonları denize döküldükleri yerde biriktirmesi",
      "Buzulların aşındırarak oluşturduğu çanakların dolması",
    ],
    dogruCevap: 3,
    aciklama:
      "Çukurova (Seyhan ve Ceyhan), Bafra (Kızılırmak) ve Çarşamba (Yeşilırmak) ovaları, akarsuların denize döküldükleri yerde biriktirdiği alüvyonlarla oluşmuş delta ovalarıdır.",
  },
  {
    ders: "COGRAFYA",
    konu: "Nüfus ve Yerleşme",
    soruMetni: "Doğu Anadolu Bölgesi'nin genelinde nüfusun seyrek olmasında aşağıdakilerden hangisinin etkisi yoktur?",
    secenekler: [
      "Ortalama yükseltinin fazla olması",
      "Ormanlık alanların çok geniş yer kaplaması",
      "Kışların uzun ve sert geçmesi",
      "Engebeli yer şekilleri nedeniyle ulaşımın zor olması",
      "Sanayinin yeterince gelişmemiş olması",
    ],
    dogruCevap: 1,
    aciklama:
      "Doğu Anadolu'da ormanlar geniş yer kaplamaz; doğal bitki örtüsü daha çok bozkır ve yüksek kesimlerde çayırlardır. Yükselti, sert kışlar, ulaşım zorluğu ve sanayinin az gelişmesi ise nüfusun seyrek olmasının nedenleridir.",
  },
  {
    ders: "COGRAFYA",
    konu: "Nüfus ve Yerleşme",
    soruMetni:
      "Her yıl ilkbahar ve yaz aylarında Güneydoğu Anadolu'dan pek çok aile; Çukurova, Ege ve İç Anadolu'daki tarım alanlarına çalışmak için gider, hasat bitince de yaşadıkları yerlere geri döner.\n\nBu durum aşağıdaki göç türlerinden hangisine örnektir?",
    secenekler: ["Mevsimlik (geçici) göç", "Beyin göçü", "Zorunlu göç (mübadele)", "Dış göç", "Kırdan kente kalıcı göç"],
    dogruCevap: 0,
    aciklama: "Belirli bir dönem için yapılan ve sonunda geri dönülen tarım işçisi göçü, mevsimlik (geçici) iç göçtür.",
  },
  {
    ders: "COGRAFYA",
    konu: "İklim ve Bitki Örtüsü",
    soruMetni: "Türkiye'de Akdeniz kıyı kuşağında, yazların sıcak ve kurak geçmesine uyum sağlamış; kısa boylu, sert yapraklı ve her mevsim yeşil kalan çalılardan oluşan doğal bitki örtüsü aşağıdakilerden hangisidir?",
    secenekler: ["Bozkır", "Geniş yapraklı orman", "Alpin çayır", "Tundra", "Maki"],
    dogruCevap: 4,
    aciklama: "Maki, Akdeniz ikliminin yaz kuraklığına uyum sağlamış, kızılçam ormanlarının tahrip edildiği alanlarda yayılan, her dem yeşil sert yapraklı çalılardır (kocayemiş, mersin, defne vb.).",
  },
  {
    ders: "COGRAFYA",
    konu: "Hayvancılık",
    soruMetni:
      "Uzun ve parlak tüyleri (tiftik) dokumacılıkta değerli bir ham madde olan Ankara keçisinin yetiştiriciliği, en çok hangi bölgemizde yaygındır?",
    secenekler: ["Karadeniz", "Akdeniz", "İç Anadolu", "Ege", "Marmara"],
    dogruCevap: 2,
    aciklama:
      "Ankara (tiftik) keçisi, karasal iklimin ve bozkır bitki örtüsünün hâkim olduğu İç Anadolu'da, özellikle Ankara, Eskişehir ve Konya çevresinde yetiştirilir.",
  },
  {
    ders: "COGRAFYA",
    konu: "Madenler ve Enerji Kaynakları",
    soruMetni:
      "Dünya bor rezervlerinin büyük bölümü Türkiye'de bulunur.\n\nAşağıdaki illerden hangisinde bor minerali çıkarılmaz?",
    secenekler: ["Zonguldak", "Eskişehir", "Balıkesir", "Kütahya", "Bursa"],
    dogruCevap: 0,
    aciklama:
      "Bor; Eskişehir (Kırka), Balıkesir (Bigadiç), Kütahya (Emet) ve Bursa'da (Mustafakemalpaşa-Kestelek) çıkarılır. Zonguldak ise taş kömürü havzasıyla tanınır.",
  },
  {
    ders: "COGRAFYA",
    konu: "Sanayi",
    soruMetni:
      "Türkiye'de şeker fabrikaları, genellikle şeker pancarı tarımının yapıldığı alanların yakınına kurulmuştur.\n\nBunun temel nedeni aşağıdakilerden hangisidir?",
    secenekler: [
      "Enerji kaynaklarına yakın olma isteği",
      "Liman kentlerine kolay ulaşılması",
      "Ham maddenin hacimli olması ve uzun süre bekletildiğinde bozulması",
      "Tüketim pazarlarının bu alanlarda yoğunlaşması",
      "Kalifiye iş gücünün yalnızca bu alanlarda bulunması",
    ],
    dogruCevap: 2,
    aciklama:
      "Şeker pancarı hacimli ve ağır bir ham maddedir; uzun mesafeye taşınması pahalıdır ve bekledikçe şeker oranı düşer. Bu nedenle fabrikalar ham maddeye yakın kurulur.",
  },
  {
    ders: "COGRAFYA",
    konu: "Fiziki Özellikler",
    soruMetni: "Doğu Karadeniz Bölümü'nde heyelanların sık yaşanmasında aşağıdakilerden hangisinin etkisi yoktur?",
    secenekler: [
      "Yamaç eğiminin fazla olması",
      "Yağış miktarının fazla olması",
      "Killi ve suya doyan toprakların yaygın olması",
      "Yamaçlarda yapılan yanlış yol ve yapılaşma çalışmaları",
      "Yaz kuraklığının uzun sürmesi",
    ],
    dogruCevap: 4,
    aciklama:
      "Doğu Karadeniz her mevsim yağışlıdır; yaz kuraklığı görülmez. Heyelanları eğim, bol yağış, suya doyan killi topraklar ve yamaçlardaki yanlış yapılaşma tetikler.",
  },
  {
    ders: "COGRAFYA",
    konu: "Ticaret",
    soruMetni: "Aşağıdaki gümrük kapılarından hangisi Türkiye ile Gürcistan arasındadır?",
    secenekler: ["Kapıkule", "Habur", "Gürbulak", "Sarp", "Cilvegözü"],
    dogruCevap: 3,
    aciklama: "Sarp Gümrük Kapısı Artvin'de, Gürcistan sınırındadır. Kapıkule (Edirne) Bulgaristan, Habur (Şırnak) Irak, Gürbulak (Ağrı) İran, Cilvegözü (Hatay) ise Suriye sınırındaki kapılardır.",
  },
  {
    ders: "COGRAFYA",
    konu: "Turizm",
    soruMetni: "Rize'deki Ayder ve Pokut ile Trabzon'daki Uzungöl, daha çok aşağıdaki turizm türlerinden hangisiyle öne çıkar?",
    secenekler: ["Kıyı (deniz) turizmi", "Yayla turizmi", "İnanç turizmi", "Termal turizm", "Kış (kayak) turizmi"],
    dogruCevap: 1,
    aciklama:
      "Doğu Karadeniz'in serin, yeşil ve yüksek kesimlerindeki Ayder, Pokut ve Uzungöl yayla turizminin önemli merkezleridir.",
  },
  {
    ders: "COGRAFYA",
    konu: "Coğrafi Konum",
    soruMetni: "Türkiye 26° ve 45° doğu meridyenleri arasında yer alır.\n\nBuna göre Türkiye'nin en doğusu ile en batısı arasındaki yerel saat farkı kaç dakikadır?",
    secenekler: ["19", "38", "57", "64", "76"],
    dogruCevap: 4,
    aciklama: "İki meridyen arasındaki yerel saat farkı 4 dakikadır. 45° − 26° = 19 meridyen farkı ⇒ 19 · 4 = 76 dakika.",
  },
  {
    ders: "COGRAFYA",
    konu: "Ulaşım",
    soruMetni: "Karadeniz kıyıları ile iç kesimler arasında ulaşımın zor olmasının temel nedeni aşağıdakilerden hangisidir?",
    secenekler: [
      "Dağların kıyıya paralel uzanması",
      "Nüfusun kıyıda seyrek olması",
      "Akarsuların ulaşıma elverişli olması",
      "Kıyı çizgisinin çok girintili çıkıntılı olması",
      "Kış aylarında denizin donması",
    ],
    dogruCevap: 0,
    aciklama:
      "Kuzey Anadolu Dağları kıyıya paralel uzandığı için kıyıdan iç kesimlere ulaşım ancak geçitler ve vadiler boyunca sağlanabilir. Karadeniz kıyıları ise çok girintili çıkıntılı değildir.",
  },
  {
    ders: "COGRAFYA",
    konu: "Madenler ve Enerji Kaynakları",
    soruMetni: "Karabük ve Karadeniz Ereğli demir-çelik fabrikalarının kuruluş yerinin seçiminde etkili olan temel faktör aşağıdakilerden hangisidir?",
    secenekler: [
      "Demir madenlerine yakınlık",
      "Turizm merkezlerine yakınlık",
      "Zonguldak taş kömürü havzasına yakınlık",
      "Tarımsal ham maddeye yakınlık",
      "Nüfusun en kalabalık olduğu kentlere yakınlık",
    ],
    dogruCevap: 2,
    aciklama:
      "Demir-çelik üretiminde yüksek ısı için çok miktarda kok kömürü gerekir. Bu fabrikalar Zonguldak taş kömürü havzasına yakın kurulmuştur; demir cevheri ise Divriği gibi uzak yerlerden getirilir.",
  },

  // ---- VATANDAŞLIK (9) ----
  {
    ders: "VATANDASLIK",
    konu: "Temel Hukuk Kavramları",
    soruMetni: "Aşağıdakilerden hangisi Türk hukukunda yazılı asli (bağlayıcı) hukuk kaynakları arasında yer almaz?",
    secenekler: ["Anayasa", "Kanun", "Cumhurbaşkanlığı kararnamesi", "Bilimsel görüşler (doktrin)", "Yönetmelik"],
    dogruCevap: 3,
    aciklama:
      "Anayasa, kanun, Cumhurbaşkanlığı kararnamesi ve yönetmelik yazılı asli kaynaklardır. Bilimsel görüşler (doktrin) ve yargı kararları ise hâkime yol gösteren yardımcı kaynaklardır.",
  },
  {
    ders: "VATANDASLIK",
    konu: "Temel Hukuk Kavramları",
    soruMetni:
      "Türk Medeni Kanunu'na göre fiil ehliyetine sahip olmak için;\nI. ayırt etme gücüne sahip olmak,\nII. ergin olmak,\nIII. kısıtlı olmamak,\nIV. Türk vatandaşı olmak\nkoşullarından hangileri gereklidir?",
    secenekler: ["I ve II", "I, II ve III", "I, II ve IV", "II, III ve IV", "I, II, III ve IV"],
    dogruCevap: 1,
    aciklama:
      "Türk Medeni Kanunu'na göre ayırt etme gücüne sahip, ergin ve kısıtlı olmayan her insanın fiil ehliyeti vardır. Vatandaşlık fiil ehliyetinin koşulu değildir.",
  },
  {
    ders: "VATANDASLIK",
    konu: "Temel Hukuk Kavramları",
    soruMetni: "Aşağıdakilerden hangisi kamu hukukunun dallarından biri değildir?",
    secenekler: ["Anayasa hukuku", "İdare hukuku", "Ceza hukuku", "Vergi hukuku", "Ticaret hukuku"],
    dogruCevap: 4,
    aciklama: "Ticaret hukuku, kişiler arasındaki ilişkileri eşitlik esasına göre düzenleyen özel hukukun dalıdır. Anayasa, idare, ceza ve vergi hukuku ise devletin taraf olduğu ilişkileri düzenleyen kamu hukuku dallarıdır.",
  },
  {
    ders: "VATANDASLIK",
    konu: "Yasama",
    soruMetni: "2017 değişikliği sonrasında 1982 Anayasası'na göre Türkiye Büyük Millet Meclisi ile ilgili aşağıdakilerden hangisi yanlıştır?",
    secenekler: [
      "Milletvekili seçilebilmek için 25 yaşını doldurmuş olmak gerekir.",
      "TBMM 600 milletvekilinden oluşur.",
      "TBMM seçimleri beş yılda bir yapılır.",
      "TBMM ve Cumhurbaşkanlığı seçimleri aynı gün yapılır.",
      "Kanun koymak, değiştirmek ve kaldırmak TBMM'nin görevidir.",
    ],
    dogruCevap: 0,
    aciklama: "2017 değişikliğiyle milletvekili seçilme yaşı 18'e indirilmiştir; 25 yaş şartı yoktur. Diğer ifadeler doğrudur.",
  },
  {
    ders: "VATANDASLIK",
    konu: "Yürütme",
    soruMetni: "2017 değişikliği sonrasında 1982 Anayasası'na göre Cumhurbaşkanlığı seçimi ile ilgili aşağıdakilerden hangisi yanlıştır?",
    secenekler: [
      "Aday olabilmek için kırk yaşını doldurmuş olmak gerekir.",
      "Aday olabilmek için yükseköğrenim yapmış olmak gerekir.",
      "Aday olabilmek için TBMM üyesi olmak gerekir.",
      "Bir kişi en fazla iki defa Cumhurbaşkanı seçilebilir.",
      "Cumhurbaşkanının görev süresi beş yıldır.",
    ],
    dogruCevap: 2,
    aciklama:
      "Cumhurbaşkanı, kırk yaşını doldurmuş, yükseköğrenim yapmış ve milletvekili seçilme yeterliliğine sahip Türk vatandaşları arasından halk tarafından seçilir; TBMM üyesi olma şartı yoktur.",
  },
  {
    ders: "VATANDASLIK",
    konu: "Yargı",
    soruMetni: "Aşağıdakilerden hangisi 1982 Anayasası'nın “Yüksek Mahkemeler” bölümünde düzenlenen yargı organlarından biri değildir?",
    secenekler: ["Anayasa Mahkemesi", "Yargıtay", "Danıştay", "Uyuşmazlık Mahkemesi", "Sayıştay"],
    dogruCevap: 4,
    aciklama:
      "Anayasa'da yüksek mahkemeler Anayasa Mahkemesi, Yargıtay, Danıştay ve Uyuşmazlık Mahkemesidir. Sayıştay, TBMM adına kamu kaynaklarını denetleyen bir kurum olarak “Mali hükümler” kısmında düzenlenmiştir.",
  },
  {
    ders: "VATANDASLIK",
    konu: "İdare Hukuku",
    soruMetni: "Aşağıdakilerden hangisi merkezî yönetimin taşra teşkilatında yer alır?",
    secenekler: ["Kaymakamlık", "Belediye", "İl özel idaresi", "Köy", "Türkiye Radyo-Televizyon Kurumu"],
    dogruCevap: 0,
    aciklama:
      "Merkezî yönetimin taşra teşkilatı il ve ilçe idarelerinden (valilik, kaymakamlık) oluşur. Belediye, il özel idaresi ve köy yer yönünden; TRT ise hizmet yönünden yerinden yönetim kuruluşudur.",
  },
  {
    ders: "VATANDASLIK",
    konu: "Yürütme",
    soruMetni: "1982 Anayasası'na göre aşağıdakilerden hangisi Cumhurbaşkanının görev ve yetkilerinden biri değildir?",
    secenekler: ["Kanunları yayımlamak", "Bakanları atamak ve görevlerine son vermek", "Milletlerarası antlaşmaları onaylamak ve yayımlamak", "Kanun teklif etmek", "Üst kademe kamu yöneticilerini atamak"],
    dogruCevap: 3,
    aciklama: "Anayasa'nın 88. maddesine göre kanun teklif etmeye yalnızca milletvekilleri yetkilidir. Kanunları yayımlamak, bakanları ve üst kademe kamu yöneticilerini atamak, milletlerarası antlaşmaları onaylayıp yayımlamak Cumhurbaşkanının yetkileridir.",
  },
  {
    ders: "VATANDASLIK",
    konu: "İdare Hukuku",
    soruMetni:
      "5393 sayılı Belediye Kanunu'na göre;\nI. belediye meclisi,\nII. belediye encümeni,\nIII. belediye başkanı,\nIV. il genel meclisi\nkurullarından ve makamlarından hangileri belediyenin organlarıdır?",
    secenekler: ["Yalnız I", "I ve II", "II ve III", "I, II ve III", "I, II, III ve IV"],
    dogruCevap: 3,
    aciklama: "Belediyenin organları belediye meclisi, belediye encümeni ve belediye başkanıdır. İl genel meclisi ise il özel idaresinin organıdır.",
  },

  // ---- GÜNCEL BİLGİLER (6) ----
  {
    ders: "GUNCEL",
    konu: "Güncel Bilgiler",
    soruMetni:
      "2025 Nobel Kimya Ödülü, Susumu Kitagawa, Richard Robson ve Omar M. Yaghi'ye aşağıdaki alanlardan hangisindeki çalışmaları nedeniyle verilmiştir?",
    secenekler: [
      "Protein yapılarının yapay zekâyla tahmin edilmesi",
      "Lityum-iyon pillerin geliştirilmesi",
      "Metal-organik kafeslerin (MOF) geliştirilmesi",
      "CRISPR gen düzenleme yönteminin bulunması",
      "Kuantum noktalarının keşfi ve sentezi",
    ],
    dogruCevap: 2,
    aciklama:
      "Ödül, gazları ve diğer kimyasalları depolayabilen gözenekli yapılar olan metal-organik kafeslerin (MOF) geliştirilmesi nedeniyle verilmiştir. Diğer seçenekler 2024, 2019, 2020 ve 2023 Nobel Kimya ödüllerinin konularıdır.",
  },
  {
    ders: "GUNCEL",
    konu: "Güncel Bilgiler",
    soruMetni:
      "Eylül 2025'te Tayland'da düzenlenen FIVB Kadınlar Voleybol Dünya Şampiyonası'nda finale yükselen A Millî Kadın Voleybol Takımı'mızı 3-2 yenerek şampiyon olan ülke aşağıdakilerden hangisidir?",
    secenekler: ["Brezilya", "Japonya", "ABD", "Sırbistan", "İtalya"],
    dogruCevap: 4,
    aciklama: "7 Eylül 2025'te Bangkok'ta oynanan finalde İtalya, Türkiye'yi 3-2 yenerek şampiyon olmuş; millî takımımız gümüş madalya kazanmıştır.",
  },
  {
    ders: "GUNCEL",
    konu: "Güncel Bilgiler",
    soruMetni: "Aralık 2025'te UNESCO İnsanlığın Somut Olmayan Kültürel Mirası Temsilî Listesi'ne Türkiye adına kaydedilen unsur aşağıdakilerden hangisidir?",
    secenekler: ["Antep işi nakışı", "Ebru sanatı", "Hüsn-i hat", "Türk kahvesi kültürü ve geleneği", "Geleneksel Türk okçuluğu"],
    dogruCevap: 0,
    aciklama:
      "Antep işi nakışı, 11 Aralık 2025'te listeye alınmıştır. Ebru (2014), Hüsn-i hat (2021), Türk kahvesi kültürü (2013) ve geleneksel Türk okçuluğu (2019) daha önce kaydedilmiştir.",
  },
  {
    ders: "GUNCEL",
    konu: "Güncel Bilgiler",
    soruMetni: "TEKNOFEST kapsamında 1-4 Mayıs 2025 tarihlerinde Eski Ercan Havalimanı'nda düzenlenen festivale ev sahipliği yapan ülke aşağıdakilerden hangisidir?",
    secenekler: ["Azerbaycan", "Kazakistan", "Özbekistan", "Kuzey Kıbrıs Türk Cumhuriyeti", "Gürcistan"],
    dogruCevap: 3,
    aciklama: "TEKNOFEST KKTC, 1-4 Mayıs 2025'te Lefkoşa'daki Eski Ercan Havalimanı'nda düzenlenmiştir.",
  },
  {
    ders: "GUNCEL",
    konu: "Güncel Bilgiler",
    soruMetni: "Haziran-Temmuz 2026'da düzenlenen ve tarihte ilk kez 48 takımın katıldığı FIFA Dünya Kupası'na ev sahipliği yapan ülkeler aşağıdakilerin hangisinde birlikte verilmiştir?",
    secenekler: ["Fas, İspanya ve Portekiz", "ABD, Kanada ve Meksika", "Brezilya ve Arjantin", "Suudi Arabistan", "Almanya ve Fransa"],
    dogruCevap: 1,
    aciklama: "2026 FIFA Dünya Kupası 11 Haziran-19 Temmuz 2026 tarihlerinde ABD, Kanada ve Meksika'nın ortak ev sahipliğinde düzenlenmiştir. 2030 turnuvası Fas, İspanya ve Portekiz'de, 2034 turnuvası Suudi Arabistan'da yapılacaktır.",
  },
  {
    ders: "GUNCEL",
    konu: "Güncel Bilgiler",
    soruMetni: "Slovakya'nın Trenčín kentiyle birlikte 2026 yılı Avrupa Kültür Başkenti seçilen Oulu kenti hangi ülkededir?",
    secenekler: ["İsveç", "Norveç", "Finlandiya", "Estonya", "Danimarka"],
    dogruCevap: 2,
    aciklama: "Oulu, Finlandiya'nın kuzeyinde yer alan bir kenttir ve Trenčín (Slovakya) ile birlikte 2026 Avrupa Kültür Başkenti unvanını taşımaktadır.",
  },
];

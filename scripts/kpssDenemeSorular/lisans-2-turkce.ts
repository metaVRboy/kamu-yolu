/**
 * KPSS Lisans 2. parti - Türkçe (30). Sıra KONU_DAGILIMI.LISANS.TURKCE ile aynı.
 * Sözel mantık cevapları betikle (tüm olası diziliş taranarak) doğrulandı.
 */
import { type SeedSoru } from "../kpssDenemeOrtak";

const BELLEK =
  "Belleği, yaşadıklarımızın olduğu gibi saklandığı bir arşive benzetmek yaygın bir alışkanlıktır. Oysa bir anıyı her hatırlayışımızda onu raftan indirilen bir dosya gibi açmayız; parçalarını yeniden bir araya getirir, eksik kalan yerleri o anki bilgimiz, duygularımız ve beklentilerimizle doldururuz. Bu yüzden en canlı ve en emin olduğumuz anılar bile zaman içinde, biz fark etmeden değişebilir. Aynı olayı yaşamış iki kardeşin, yıllar sonra o günü birbirinden oldukça farklı anlatması da bundandır. Bu durum belleğin bir kusuru gibi görünse de aslında bir esneklik göstergesidir: Geçmişi bugünün ihtiyaçlarına göre yeniden yorumlayabilmek, insanın yeni koşullara uyum sağlamasını kolaylaştırır. Ne var ki aynı esneklik, tanıklıklara dayanan yargılarda büyük bir dikkat gerektirir; çünkü kendinden emin bir tanık, yanılmayan bir tanık demek değildir.";

const CAN_SIKINTISI =
  "Çocukluğumuzun uzun yaz öğleden sonralarını hatırlayalım: Yapacak hiçbir şeyin olmadığı, saatlerin geçmek bilmediği o boş saatleri. Bugünün anne babaları, çocuklarının böyle bir boşluğa düşmemesi için ellerinden geleni yapıyor; haftanın her günü bir kursla, her boş an bir ekranla dolduruluyor. Oysa can sıkıntısı, sanıldığı kadar zararlı bir şey değildir. Hiçbir şeyin dikkatimizi çekmediği o anlarda zihin, kendi kendini oyalamanın yollarını aramaya başlar: Bir karton kutu bir uzay gemisine, bahçedeki taşlar bir kalenin surlarına dönüşür. Her boşluğu dışarıdan doldurulan çocuk ise bu yolu hiç keşfetmez; sıkıldığı anda yüzünü yeniden birinin ona bir şey sunmasına çevirir. Elbette bu, çocukları büsbütün kendi hâllerine bırakmak gerektiği anlamına gelmez; ama onlara biraz da hiçbir şey yapmama hakkı tanımak gerekir.";

const APARTMAN =
  "Katları aşağıdan yukarıya doğru 1'den 5'e kadar numaralandırılmış beş katlı bir apartmanın her katında bir aile oturmaktadır. Aksoy, Bulut, Çelik, Demir ve Eren ailelerinin oturduğu katlarla ilgili şunlar bilinmektedir:\n- Aksoy ailesi, Bulut ailesinin hemen bir üst katında oturmaktadır.\n- Çelik ailesi en üst katta oturmamaktadır.\n- Eren ailesi, Çelik ailesinden daha üst bir katta oturmaktadır.\n- Demir ailesi ile Eren ailesinin oturduğu katlar arasında en az bir kat bulunmaktadır.\n- Demir ailesi 1. katta oturmamaktadır.";

const KURS =
  "Ferhat, Gül, Hakan ve İpek adlı dört arkadaştan her biri; Almanca, Fransızca, İspanyolca ve Rusça kurslarından farklı birine katılmaktadır. Bu kurslar pazartesi, salı, çarşamba ve perşembe günlerinde, her gün yalnızca bir kurs olacak biçimde yapılmaktadır. Kurslarla ilgili şunlar bilinmektedir:\n- Rusça kursu, Almanca kursunun hemen ertesi günü yapılmaktadır.\n- İspanyolca kursu perşembe günü yapılmaktadır.\n- Gül, Fransızca ya da Rusça kursuna katılmamaktadır.\n- Ferhat'ın kursu, Gül'ünkünden daha önceki bir gündedir.\n- İpek'in kursu pazartesi günü değildir ve İpek İspanyolca öğrenmemektedir.\n- Hakan, Almanca kursuna katılmamaktadır ve onun kursu da pazartesi günü değildir.";

export const SORULAR: SeedSoru[] = [
  {
    ders: "TURKCE",
    konu: "Sözcükte Anlam",
    soruMetni:
      "Yaşlı usta, tezgâhın başında saatlerce eğilip bükülmüş (I) demirleri sabırla düzeltirdi. Çıraklık yıllarımda ondan duyduğum en sert (II) söz, aceleyle yapılan işin ömrünün kısa olacağıydı. O zamanlar bu öğütler bana ağır (III) gelirdi; ustanın her işi ağırdan aldığını, zamanı boşa harcadığını düşünürdüm. Yıllar sonra kendi atölyemi açtığımda, onun soğuk (IV) gibi görünen bakışlarının ardında ne derin (V) bir sevgi yattığını anladım.\n\nBu parçadaki numaralanmış sözcüklerden hangisi gerçek anlamıyla kullanılmıştır?",
    secenekler: ["I", "II", "III", "IV", "V"],
    dogruCevap: 0,
    aciklama:
      "\"Bükülmüş demirler\" sözünde sözcük, somut bir nesnenin biçiminin değiştirilmesini anlattığından gerçek anlamdadır. \"Sert söz\", \"ağır gelmek\", \"soğuk bakış\" ve \"derin sevgi\" söyleyişlerinde sözcükler mecaz anlamda kullanılmıştır.",
  },
  {
    ders: "TURKCE",
    konu: "Cümlede Anlam",
    soruMetni: "Aşağıdaki cümlelerin hangisinde amaç-sonuç ilişkisi vardır?",
    secenekler: [
      "Yol kapalı olduğu için başka bir güzergâh kullanmak zorunda kaldık.",
      "Hava kararmak üzere olduğundan kampa dönmeye karar verdik.",
      "Komşular rahatsız olmasın diye müziğin sesini kıstı.",
      "Çok yorgunum diye bu akşamki davete katılmadı.",
      "Kitabı bitirdiğimden kütüphaneye iade ettim.",
    ],
    dogruCevap: 2,
    aciklama:
      "C'de müziğin sesinin kısılması, komşuların rahatsız olmaması amacıyla yapılmıştır; amaç-sonuç ilişkisi vardır. A, B, D ve E'de ise yargı bir nedene bağlanmıştır. D'deki \"diye\" burada amaç değil neden bildirir: Davete katılmamasının nedeni yorgunluğudur.",
  },
  {
    ders: "TURKCE",
    konu: "Cümlede Anlam",
    soruMetni:
      "(I) Kasabanın girişindeki taş köprü, ilk bakışta sıradan bir yapı gibi görünse de bölgenin en etkileyici eseridir. (II) Beş gözlü köprünün orta kemeri, yan kemerlerden daha yüksektir. (III) Yaklaşık iki yüz yıllık olan yapı, sağlamlığıyla iki yüz yıl daha ayakta kalacakmış gibi duruyor. (IV) Kemerlerin üzerindeki oymalar, onu yapan ustaların ne denli ince bir zevke sahip olduğunu gösteriyor. (V) Akşamüstü suya düşen gölgesi ise köprüyü olduğundan da görkemli kılıyor.\n\nBu parçadaki numaralanmış cümlelerden hangisi nesnel bir yargı bildirmektedir?",
    secenekler: ["I", "II", "III", "IV", "V"],
    dogruCevap: 1,
    aciklama:
      "II. cümledeki kemerlerin yükseklik farkı, gözlemle doğrulanabilecek bir bilgidir; nesneldir. I'de \"en etkileyici\", III'te \"ayakta kalacakmış gibi duruyor\" (kişisel izlenim), IV'te \"ince bir zevk\", V'te \"olduğundan da görkemli\" ifadeleri kişisel değerlendirme içerir. III'teki yaş bilgisi cümlenin asıl yargısı değildir.",
  },
  {
    ders: "TURKCE",
    konu: "Cümlede Anlam",
    soruMetni:
      "\"Bir şeyin değeri, çoğu zaman yokluğunda anlaşılır.\"\n\nAşağıdakilerden hangisi bu cümleyle anlamca en yakındır?",
    secenekler: [
      "İnsan, elindekinin kıymetini çoğunlukla onu yitirdiğinde fark eder.",
      "Değerli şeyler, genellikle bulunması en zor olanlardır.",
      "Bir şeye sahip olmak, onu korumayı da gerektirir.",
      "İnsan, sahip olmadığı şeylere her zaman daha çok imrenir.",
      "Yitirilen şeylerin yerini zamanla yenileri doldurur.",
    ],
    dogruCevap: 0,
    aciklama:
      "Verilen cümle, değerin ancak kayıptan sonra anlaşıldığını söyler; A aynı yargıyı taşır. D'de sahip olunmayan şeye duyulan imrenme, B'de değerli şeylerin azlığı, C'de koruma, E'de kaybın telafisi anlatılır; bunlar farklı yargılardır.",
  },
  {
    ders: "TURKCE",
    konu: "Sözcük Türleri",
    soruMetni:
      "Sahafın tozlu raflarında bu (I) kitaplar yıllardır alıcısını bekliyordu. Kimi (II) okurlar onları eskimiş bulur, şöyle bir karıştırıp yerine bırakırdı. Öteki (III) raflardaki yeni baskılar ise birkaç hafta içinde tükenirdi. Bir gün yaşlı bir kadın gelip eski kitapların hepsini (IV) satın aldı; giderken de çantasından çıkardığı birkaç (V) kitabı sahafa hediye etti.\n\nBu parçadaki numaralanmış sözcüklerden hangisi zamirdir?",
    secenekler: ["I", "II", "III", "IV", "V"],
    dogruCevap: 3,
    aciklama:
      "\"Hepsini\" sözcüğü bir adın yerini tutan belgisiz zamirdir. \"Bu kitaplar\" (işaret sıfatı), \"kimi okurlar\", \"öteki raflar\" ve \"birkaç kitap\" (belgisiz sıfatlar) söyleyişlerinde sözcükler bir adı nitelediği için sıfattır.",
  },
  {
    ders: "TURKCE",
    konu: "Sözcük Türleri",
    soruMetni: "Aşağıdaki cümlelerin hangisinde \"ile\" sözcüğü bağlaç olarak kullanılmıştır?",
    secenekler: [
      "Annesiyle her hafta semt pazarına giderdi.",
      "Mektubu kurşun kalemle yazmayı tercih etmişti.",
      "Masanın üstünde yalnızca bir kalemle bir defter duruyordu.",
      "Gürültüyle uyandığında saat üçü geçiyordu.",
      "Yaşlı adam, bastonuyla yokuşu ağır ağır çıkıyordu.",
    ],
    dogruCevap: 2,
    aciklama:
      "C'de \"ile\" yerine \"ve\" getirilebilir (bir kalem ve bir defter); eş görevli iki sözcüğü bağladığından bağlaçtır. A'da birliktelik, B ve E'de araç, D'de neden bildiren edattır; bu cümlelerde \"ve\" getirilemez.",
  },
  {
    ders: "TURKCE",
    konu: "Sözcükte Yapı ve Ekler",
    soruMetni:
      "Gözlükçü (I), kapıdan giren yaşlı adama başını kaldırıp baktı. Adam, cebinden çıkardığı kırık çerçeveyi (II) tezgâhın üzerine bıraktı; ardından yorgun (III) bir sesle bunun annesinden kalma bir hatıra olduğunu anlattı. Gözlükçü, çerçeveyi büyüteçle (IV) uzun uzun inceledi ve onarımın (V) birkaç gün süreceğini söyledi.\n\nBu parçadaki numaralanmış sözcüklerden hangisi yapı bakımından ötekilerden farklıdır?",
    secenekler: ["I", "II", "III", "IV", "V"],
    dogruCevap: 1,
    aciklama:
      "\"Çerçeve\" yapım eki almamış basit bir sözcüktür. \"Göz-lük-çü\", \"yor-gun\", \"büyü-t-eç\" ve \"onar-ım\" yapım eki almış türemiş sözcüklerdir.",
  },
  {
    ders: "TURKCE",
    konu: "Cümlenin Ögeleri",
    soruMetni:
      "\"Ödülü alan genç yönetmen, sahneye çıktığında ilk olarak yıllardır kendisine destek veren ailesine teşekkür etti.\"\n\nBu cümlenin ögeleri aşağıdakilerin hangisinde sırasıyla verilmiştir?",
    secenekler: [
      "Özne - Zarf tümleci - Zarf tümleci - Dolaylı tümleç - Yüklem",
      "Özne - Dolaylı tümleç - Zarf tümleci - Nesne - Yüklem",
      "Nesne - Özne - Zarf tümleci - Dolaylı tümleç - Yüklem",
      "Özne - Zarf tümleci - Zarf tümleci - Nesne - Yüklem",
      "Özne - Zarf tümleci - Dolaylı tümleç - Dolaylı tümleç - Yüklem",
    ],
    dogruCevap: 0,
    aciklama:
      "\"Ödülü alan genç yönetmen\" (özne), \"sahneye çıktığında\" (zarf tümleci), \"ilk olarak\" (zarf tümleci), \"yıllardır kendisine destek veren ailesine\" (dolaylı tümleç), \"teşekkür etti\" (yüklem). \"Ödülü\" ve \"sahneye\" sözcükleri ayrı öge değil, söz öbeklerinin parçasıdır.",
  },
  {
    ders: "TURKCE",
    konu: "Ses Olayları",
    soruMetni: "Aşağıdaki cümlelerin hangisinde hem ünlü düşmesi hem de ünsüz yumuşaması vardır?",
    secenekler: [
      "Burnunu soğuktan korumak için atkısını yüzüne doladı.",
      "Ağzını açmadan kitabını okumaya devam etti.",
      "Oğlunun karnesini görünce gözleri doldu.",
      "Ağacın dalındaki kuşu uzun süre izledi.",
      "Şehrin gürültüsünden uzaklaşıp köyüne döndü.",
    ],
    dogruCevap: 1,
    aciklama:
      "B'de \"ağzını\" (ağız) sözcüğünde ünlü düşmesi, \"kitabını\" (kitap) sözcüğünde ünsüz yumuşaması vardır. A'da (burun), C'de (oğul) ve E'de (şehir) yalnızca ünlü düşmesi; D'de (ağaç) yalnızca ünsüz yumuşaması vardır.",
  },
  {
    ders: "TURKCE",
    konu: "Yazım Kuralları",
    soruMetni: "Aşağıdaki cümlelerin hangisinde yazım yanlışı yapılmıştır?",
    secenekler: [
      "Sınavı kazandığını duyunca o da sevincinden ağladı.",
      "Herhâlde bu akşam eve geç kalacağım.",
      "Yarın ki toplantıda bütçe konusu yeniden ele alınacak.",
      "Kardeşim, dünkü maçı hiç kimseyle konuşmak istemedi.",
      "Bu kitabı birkaç kez okuduğu hâlde hiçbir ayrıntısını hatırlamıyor.",
    ],
    dogruCevap: 2,
    aciklama:
      "Zaman bildiren sözcüklere gelen ilgi eki \"-ki\" bitişik yazılır; C'deki \"Yarın ki\" sözcüğü \"yarınki\" biçiminde yazılmalıdır. A'daki bağlaç \"da\" ayrı, B'de \"galiba\" anlamındaki \"herhâlde\" bitişik, D'de \"dünkü\" bitişik, \"hiç kimse\" ayrı; E'de \"birkaç\" ve \"hiçbir\" bitişik, \"hâlde\" ayrı yazılmıştır.",
  },
  {
    ders: "TURKCE",
    konu: "Paragraf",
    soruMetni:
      "(I) Zeytin ağacı, kurak yazlara ve kayalık topraklara dayanabilen sayılı meyve ağaçlarındandır. (II) Derinlere uzanan kökleri, yüzeyde nem kalmadığında bile toprağın alt katmanlarındaki suya ulaşabilir. (III) Dar ve sert yapraklarının alt yüzünü kaplayan ince tüyler ise buharlaşmayla yitirilen suyu azaltır. (IV) Zeytinyağı, Akdeniz mutfağında hem çiğ hem de pişirilerek kullanılan temel bir üründür. (V) Bu uyum yetenekleri sayesinde zeytin, yağışın yıl içinde düzensiz dağıldığı bölgelerde bile ürün verebilir.\n\nBu parçadaki numaralanmış cümlelerden hangisi düşüncenin akışını bozmaktadır?",
    secenekler: ["I", "II", "III", "IV", "V"],
    dogruCevap: 3,
    aciklama:
      "Parça, zeytin ağacının kuraklığa uyumunu anlatır; V. cümledeki \"Bu uyum yetenekleri\" ifadesi II ve III'e gönderme yapar. IV. cümle ise zeytinyağının mutfakta kullanımına geçerek akışı bozar.",
  },
  {
    ders: "TURKCE",
    konu: "Paragraf",
    soruMetni:
      "(I) Ne var ki bu yöntem, kitapların hızla çoğaldığı büyük kütüphanelerde yetersiz kalmaya başladı.\n(II) Eskiden kütüphanelerde kitaplar, rafa geliş sırasına göre dizilirdi.\n(III) Bu sorunu çözmek için kitapları konularına göre sınıflandıran sistemler geliştirildi.\n(IV) Böylece okur, aradığı konudaki kitapların hepsini aynı bölümde bulabilir hâle geldi.\n(V) Çünkü okur, aynı konudaki kitaplara ulaşmak için bütün rafları dolaşmak zorunda kalıyordu.\n\nNumaralanmış cümlelerle anlamlı bir paragraf oluşturulduğunda baştan üçüncü cümle hangisi olur?",
    secenekler: ["I", "II", "III", "IV", "V"],
    dogruCevap: 4,
    aciklama:
      "Doğru sıralama II - I - V - III - IV'tür: Eski düzen (II), bu düzenin yetersiz kalması (I), yetersizliğin nedeni (V), soruna çözüm (III) ve çözümün sonucu (IV). Üçüncü cümle V'tir.",
  },
  {
    ders: "TURKCE",
    konu: "Paragraf",
    soruMetni:
      "Bir dili öğrenmeye çalışan yetişkinlerin çoğu, dil bilgisi kurallarını ezberlemekle işe başlar ve ilk konuşma denemesini, kuralları kusursuz biçimde öğrendiklerine inandıkları güne erteler. Oysa çocuklar hiçbir kural bilmeden, yanlış yapmaktan çekinmeden konuşmaya başlar; düzeltildikçe de dili kendiliğinden doğru kullanmayı öğrenirler. Yetişkinleri asıl geride bırakan, öğrenme yeteneğinin yaşla birlikte azalması değil, ----.\n\nBu parçada boş bırakılan yere aşağıdakilerden hangisi getirilmelidir?",
    secenekler: [
      "yanlış yapma kaygısıyla dili kullanmayı sürekli ertelemeleridir",
      "dil bilgisi kurallarını çocuklardan daha hızlı kavramalarıdır",
      "öğrendikleri dilin konuşulduğu ülkelere gitme olanaklarının az olmasıdır",
      "ana dillerinin kurallarını yeni dile aktarmalarıdır",
      "dil öğrenmek için çocuklardan farklı olarak ders kitaplarına gereksinim duymalarıdır",
    ],
    dogruCevap: 0,
    aciklama:
      "Parça, yetişkinlerin konuşmayı kuralları kusursuz öğrenecekleri güne ertelediğini, çocukların ise yanlış yapmaktan çekinmediğini karşılaştırır. Bu karşıtlığın vardığı yargı, yetişkinlerin yanlış yapma kaygısıyla dili kullanmayı ertelemesidir. Diğer seçenekler parçada sözü edilmeyen etkenlere dayanır.",
  },
  {
    ders: "TURKCE",
    konu: "Paragraf",
    soruMetni:
      "Bir şehre ilk kez gelen gezgin, çoğu zaman rehber kitaplarda yıldızla işaretlenmiş yerleri dolaşır: en ünlü müze, en eski cami, en yüksek seyir terası. Akşam otele döndüğünde ise elinde, aynı yerleri gezen binlerce kişininkinden farksız fotoğraflar vardır. Oysa bir şehri tanımak, onun vitrinine bakmakla değil, sakinlerinin gündelik ritmine karışmakla mümkündür: sabah fırının önünde sıra beklemek, bir semt pazarında pazarlık etmek, yağmurda bir kahvehanenin saçağı altına sığınmak... Şehir, kendini ancak acele etmeyen ve kalabalığın izlediği yoldan ayrılmayı göze alan yolcuya açar.\n\nBu parçada asıl anlatılmak istenen aşağıdakilerden hangisidir?",
    secenekler: [
      "Rehber kitaplar, gezginlerin şehirleri tanımasını büsbütün engeller.",
      "Bir şehri gerçekten tanımak, turistik güzergâhın dışına çıkıp onun gündelik yaşamına katılmayı gerektirir.",
      "Ünlü müzeler ve tarihî yapılar, bir şehrin en az ilgi çekici yerleridir.",
      "Gezginlerin çektiği fotoğraflar, şehirlerin tanıtımına katkı sağlamaz.",
      "Şehirler, yalnızca orada uzun yıllar yaşayanlarca anlaşılabilir.",
    ],
    dogruCevap: 1,
    aciklama:
      "Yazar, ünlü yerleri dolaşmanın şehri tanıtmadığını, şehrin sakinlerinin gündelik ritmine karışan ve kalabalığın yolundan ayrılan yolcuya açıldığını söyler. A ve E aşırı genellemedir; C ve D parçada yer almayan yargılardır.",
  },
  {
    ders: "TURKCE",
    konu: "Paragraf",
    soruMetni:
      "Güneş ışığının hiç ulaşmadığı mağaraların derinliklerinde yaşayan canlılar, bu koşullara şaşırtıcı uyumlar geliştirmiştir. Pek çok mağara türünde gözler körelmiş, vücut rengi solmuştur; çünkü karanlıkta görmenin ve renkli olmanın bir yararı yoktur. Bunun yerine bu canlıların dokunma ve koku duyuları gelişmiştir. Besinin son derece kıt olduğu bu ortamda metabolizmaları yavaşlamış, uzun süre aç kalabilir hâle gelmişlerdir. Mağaradaki besin zincirinin önemli bir bölümü ise dışarıdan gelen organik maddelere, örneğin yarasaların bıraktığı dışkılara ya da sızan sularla taşınan bitki kalıntılarına dayanır.\n\nBu parçada mağara canlılarıyla ilgili aşağıdakilerden hangisine değinilmemiştir?",
    secenekler: [
      "Görme organlarının işlevini yitirdiğine",
      "Bazı duyularının güçlendiğine",
      "Enerji harcamalarının yavaşladığına",
      "Besin kaynaklarının bir bölümünün mağara dışından geldiğine",
      "Ömürlerinin yüzeyde yaşayan canlılarınkinden daha uzun olduğuna",
    ],
    dogruCevap: 4,
    aciklama:
      "Parçada gözlerin körelmesine, dokunma ve koku duyularının gelişmesine, metabolizmanın yavaşlamasına ve dışarıdan gelen besinlere değinilmiştir. Ömür uzunluğuna ilişkin bir bilgi yoktur.",
  },
  {
    ders: "TURKCE",
    konu: "Paragraf",
    soruMetni:
      "Büyük kentlerin merkezleri, çevrelerindeki kırsal alanlara göre özellikle geceleri belirgin biçimde daha sıcaktır. Bu farkın başlıca nedeni, asfalt ve beton gibi yüzeylerin gün boyunca güneş ışığını emip depolaması, akşam olunca da bu ısıyı yavaş yavaş havaya geri vermesidir. Bitki örtüsünün azlığı da durumu ağırlaştırır; çünkü ağaçlar hem gölge yapar hem de yapraklarından buharlaşan suyla çevrelerini serinletir. Araçların ve klimaların dışarı verdiği atık ısı ise bu tabloya eklenen bir başka etkendir. Kimi kentlerin çatıları bitkilendirmeye ve açık renkli kaplamalar kullanmaya yönelmesi, bu sorunun çözümsüz olmadığını gösteriyor.\n\nBu parçaya göre aşağıdakilerden hangisi söylenemez?",
    secenekler: [
      "Kent ile kır arasındaki sıcaklık farkı geceleri daha belirgindir.",
      "Kentlerdeki yapay yüzeyler, gün içinde biriktirdikleri ısıyı akşam saatlerinde salar.",
      "Kentlerdeki sıcaklık artışının başlıca nedeni araçlardan çıkan atık ısıdır.",
      "Ağaçlar, kentlerdeki ısınmayı hafifleten bir etki yapar.",
      "Klimaların kullanımı, kentlerin ısınmasına katkıda bulunabilir.",
    ],
    dogruCevap: 2,
    aciklama:
      "Parçada başlıca neden olarak asfalt ve beton yüzeylerin ısıyı depolaması gösterilmiş; atık ısı ise \"bir başka etken\" olarak eklenmiştir. Bu yüzden C söylenemez; diğer yargılar parçada açıkça yer alır.",
  },
  {
    ders: "TURKCE",
    konu: "Paragraf",
    soruMetni:
      "Usta bir marangoz, ağacın damarını okumadan rendeyi eline almaz. Her tahtanın lifleri farklı yönlere uzanır; damarın tersine işleyen rende, yüzeyi düzeltmek yerine lifleri koparır ve tahtayı yaralar. Çırak, bu yüzden ilk yıllarını çoğu zaman tahtaya dokunmadan, ustasının ellerini izleyerek geçirir. Yaşamda da zanaatta olduğu gibi \"damarına göre rendelemek\" gerekir.\n\nBu parçada geçen \"damarına göre rendelemek\" sözüyle anlatılmak istenen aşağıdakilerden hangisidir?",
    secenekler: [
      "Bir işe başlamadan önce gerekli araçları eksiksiz hazırlamak",
      "Ele alınan şeyin yapısını tanıyıp ona uygun davranmak",
      "Ustaların deneyimini sorgulamadan benimsemek",
      "Hatalı bir işi baştan sona yeniden yapmak",
      "Zor işleri başkalarına bırakıp kolay olanlarla yetinmek",
    ],
    dogruCevap: 1,
    aciklama:
      "Marangoz, tahtanın liflerinin yönünü bilip ona göre çalışmazsa tahtayı yaralar. Söz, yaşama aktarıldığında, karşılaşılan şeyin ya da kişinin doğasını tanıyıp ona uygun davranmayı anlatır. Çırağın ustayı izlemesi sözün anlamı değil, bu bilginin nasıl edinildiğidir.",
  },
  {
    ders: "TURKCE",
    konu: "Paragraf",
    soruMetni:
      "Bir zamanlar film izlemek için sinemaya gidilir, salonun karanlığında iki saat boyunca başka hiçbir şeyle ilgilenilmezdi. Bugün ise filmler telefon ekranlarında, bir yandan mesajlara yanıt verilirken, bir yandan yemek yenirken izleniyor. Yapımcılar da buna uyum sağlamış durumda: İzleyici dikkatini kaybetmesin diye diyaloglarda olaylar tekrar tekrar özetleniyor, sessiz ve uzun planlar kurgu masasında acımasızca kısaltılıyor. Böylece seyirciye güvenmeyen filmler, seyirciyi de giderek daha az dikkat gösteren birine dönüştürüyor.\n\nBu parçada yazarın yakındığı durum aşağıdakilerden hangisidir?",
    secenekler: [
      "Sinema salonlarının sayısının giderek azalması",
      "Filmleri telefonda izleyebilmek için ek ücret ödenmesi",
      "Uzun filmlerin izleyicilerce daha çok tercih edilmesi",
      "Yapımcıların bölünmüş dikkate uyum sağlayarak anlatımı yüzeyselleştirmesi",
      "Diyalogların, oyuncuların yetersizliği yüzünden anlaşılmaz hâle gelmesi",
    ],
    dogruCevap: 3,
    aciklama:
      "Yazar, yapımcıların dağınık dikkatle izleyen seyirciye göre olayları tekrar tekrar özetlemesinden ve uzun planları kısaltmasından, bunun da seyircinin dikkatini daha da azaltmasından yakınır. Diğer seçeneklerdeki durumlara parçada değinilmemiştir.",
  },
  {
    ders: "TURKCE",
    konu: "Paragraf",
    soruMetni:
      "(I) Pişirme, insanlık tarihindeki köklü dönüşümlerden birini başlattı. (II) Isıl işlem görmüş besinler daha kolay çiğnenip sindirildiğinden insanlar, aynı besinden daha çok enerji elde etmeye başladı. (III) Bu da sindirim için harcanan zamanı ve enerjiyi azalttı; uzun saatler süren çiğneme, yerini kısa öğünlere bıraktı. (IV) Ateşin çevresinde toplanan topluluklar ise yemeği paylaşırken birbirleriyle daha çok iletişim kurdu. (V) Geriye kalan zaman, alet yapımı gibi başka işlere ayrılabildi.\n\nBu parçadaki numaralanmış cümlelerden hangi ikisinin yeri değiştirilirse düşüncenin akışı sağlanır?",
    secenekler: ["I ve II", "II ve III", "III ve IV", "IV ve V", "I ve V"],
    dogruCevap: 3,
    aciklama:
      "V. cümledeki \"Geriye kalan zaman\" ifadesi, III. cümlede sözü edilen kazanılan zamana gönderme yapar; bu yüzden V, III'ün hemen ardından gelmelidir. Ateş çevresindeki toplumsal etkileşimi anlatan ve \"ise\" ile yeni bir boyuta geçen IV ise sona yerleşmelidir.",
  },
  {
    ders: "TURKCE",
    konu: "Paragraf",
    soruMetni:
      "Şiirlerini yıllarca hiçbir dergiye göndermeden çekmecesinde biriktiren şair, ilk kitabını ancak elli yaşını geçtikten sonra yayımladı. Gösterişli imgelerden, süslü sözcüklerden kaçındı; dizelerini gündelik konuşma dilinin sadeliğiyle kurdu. Şiirlerinde büyük kentleri değil, doğup büyüdüğü kıyı kasabasının balıkçılarını, rüzgârını, tuzlu havasını anlattı. Eleştirmenlerin ilgisizliğine aldırmadı; ölümünden sonra ise genç şairlerin en çok başvurduğu adlardan biri oldu.\n\nBu parçada sözü edilen şairle ilgili aşağıdakilerden hangisine ulaşılamaz?",
    secenekler: [
      "Yaşadığı dönemde eleştirmenlerin büyük ilgisini görmüştür.",
      "Şiirlerini yayımlamakta acele etmemiştir.",
      "Yalın bir şiir dili benimsemiştir.",
      "Şiirlerinde kendi yaşam çevresinden beslenmiştir.",
      "Sonraki kuşak şairler üzerinde etkili olmuştur.",
    ],
    dogruCevap: 0,
    aciklama:
      "Parçada şairin \"eleştirmenlerin ilgisizliğine aldırmadığı\" belirtilir; yani yaşarken eleştirmenlerin ilgisini görmemiştir. Diğer yargılar sırasıyla geç yayımlama, sade dil, kıyı kasabası ve genç şairlerin ona başvurması bilgilerinden çıkarılır.",
  },
  {
    ders: "TURKCE",
    konu: "Paragraf",
    grupId: "l2-turkce-bellek",
    soruMetni: `${BELLEK}\n\nBu parçaya göre anıların zamanla değişmesinin nedeni aşağıdakilerden hangisidir?`,
    secenekler: [
      "Belleğin, yaş ilerledikçe zayıflaması",
      "Bellekte yalnızca önemli anıların saklanması",
      "Hatırlama sırasında anının eksik parçalarının o anki bilgi ve duygularla tamamlanması",
      "İnsanların geçmişi bilinçli olarak çarpıtma eğiliminde olması",
      "Aynı olayın farklı kişilerce yaşanması",
    ],
    dogruCevap: 2,
    aciklama:
      "Parçaya göre her hatırlayışta anının parçaları yeniden bir araya getirilir ve eksik yerler o anki bilgi, duygu ve beklentilerle doldurulur; anılar bu yüzden değişir. D yanlıştır, çünkü değişim \"biz fark etmeden\" gerçekleşir. E ise değişimin nedeni değil, sonucunun bir örneğidir.",
  },
  {
    ders: "TURKCE",
    konu: "Paragraf",
    grupId: "l2-turkce-bellek",
    soruMetni: `${BELLEK}\n\nBu parçadan aşağıdakilerden hangisi çıkarılamaz?`,
    secenekler: [
      "Bir anıdan emin olmak, onun doğru olduğunu kanıtlamaz.",
      "Belleğin yeniden kurgulayan yapısı, insanın uyum sağlamasını da kolaylaştırır.",
      "Tanıklığa dayalı kararlarda anıların değişebilirliği göz önünde tutulmalıdır.",
      "Aynı olaya ilişkin anlatılar kişiden kişiye farklılık gösterebilir.",
      "Canlı biçimde hatırlanan anılar, bellekte değişmeden kalan anılardır.",
    ],
    dogruCevap: 4,
    aciklama:
      "Parçada \"en canlı ve en emin olduğumuz anılar bile\" değişebilir denir; E bu yargıyla çelişir. A ve C son cümleden, B esneklik vurgusundan, D kardeş örneğinden çıkarılır.",
  },
  {
    ders: "TURKCE",
    konu: "Paragraf",
    grupId: "l2-turkce-can-sikintisi",
    soruMetni: `${CAN_SIKINTISI}\n\nBu parçada yazarın asıl vurgulamak istediği düşünce aşağıdakilerden hangisidir?`,
    secenekler: [
      "Çocukların bütün zamanı, kurslar ve etkinliklerle önceden planlanmalıdır.",
      "Ekranlar, çocukların hayal gücünü tümüyle yok eder.",
      "Çocuklar, kendi hâllerine bırakıldıklarında daha mutlu olur.",
      "Geçmiş dönemlerin çocukları, bugünkülerden daha yaratıcıydı.",
      "Can sıkıntısına alan tanımak, çocuğun kendini oyalayacak yaratıcı yollar bulmasına olanak verir.",
    ],
    dogruCevap: 4,
    aciklama:
      "Yazar, boş anlarda zihnin kendi kendini oyalamanın yollarını aradığını ve her boşluğu dışarıdan doldurulan çocuğun bu yolu keşfedemediğini söyler. A parçayla çelişir; B ve D parçada olmayan aşırı yargılardır; C'yi ise yazar \"büsbütün kendi hâllerine bırakmak\" gerekmediğini söyleyerek dışarıda bırakır.",
  },
  {
    ders: "TURKCE",
    konu: "Paragraf",
    grupId: "l2-turkce-can-sikintisi",
    soruMetni: `${CAN_SIKINTISI}\n\nBu parçada geçen \"yüzünü yeniden birinin ona bir şey sunmasına çevirir\" sözüyle anlatılmak istenen aşağıdakilerden hangisidir?`,
    secenekler: [
      "Çocuğun oyalanmak için sürekli dışarıdan gelecek bir uyarana bağımlı kalması",
      "Çocuğun anne babasından daha fazla ilgi görmek istemesi",
      "Çocuğun yeni arkadaşlıklar kurmaya istekli olması",
      "Çocuğun kendisine sunulan etkinlikleri beğenmemesi",
      "Çocuğun sıkıntısını başkalarından gizlemeye çalışması",
    ],
    dogruCevap: 0,
    aciklama:
      "Söz, boşluğu hep dışarıdan doldurulan çocuğun, sıkıldığında kendi yolunu bulmak yerine yine başkasının ona bir uğraş sunmasını beklediğini anlatır; yani dışarıdan gelecek bir uyarana bağımlılığı.",
  },
  {
    ders: "TURKCE",
    konu: "Paragrafta Anlatım Biçimleri",
    soruMetni:
      "Kar, sabaha karşı başlamıştı. Postacı Hasan, çantasını omzuna asıp köyün yolunu tuttuğunda kar dizlerine kadar çıkmıştı. Yarı yolda soluklanmak için durdu, eldivenlerini çıkarıp avuçlarını hohladı. Sonra yeniden yürümeye koyuldu. Köyün ilk evine vardığında güneş çoktan tepeye dikilmişti. Kapıyı açan yaşlı kadın, oğlundan gelen mektubu görünce gözyaşlarını tutamadı.\n\nBu parçanın anlatımıyla ilgili aşağıdakilerden hangisi söylenemez?",
    secenekler: [
      "Olaylar oluş sırasına göre aktarılmıştır.",
      "Olaylar, olay dışındaki bir anlatıcı tarafından üçüncü kişi ağzından aktarılmıştır.",
      "Kişilerin konuşmalarına doğrudan yer verilmiştir.",
      "Zaman ve mekân unsurları belirtilmiştir.",
      "Öyküleyici anlatımdan yararlanılmıştır.",
    ],
    dogruCevap: 2,
    aciklama:
      "Parçada hiçbir kişinin sözü doğrudan aktarılmamıştır; diyalog yoktur. Olaylar zaman sırasıyla, dışarıdan bir anlatıcı tarafından üçüncü kişi ağzından anlatılmış; \"sabaha karşı\", \"köyün yolu\" gibi zaman ve mekân unsurlarına yer verilmiştir.",
  },
  {
    ders: "TURKCE",
    konu: "Paragrafta Anlatım Biçimleri",
    soruMetni:
      "Biyoçeşitlilik, belirli bir bölgedeki canlı türlerinin, bu türlerin taşıdığı genetik zenginliğin ve bu canlıların oluşturduğu ekosistemlerin bütününe verilen addır. Tek tür ürünün yetiştirildiği geniş bir tarla ile yüzlerce bitki ve hayvan türünü barındıran bir orman kıyaslandığında, ikincisinin hastalıklara ve iklim değişikliklerine karşı çok daha dayanıklı olduğu görülür. Örneğin bir tarlaya bulaşan zararlı, tek tür üründen oluşan bütün ekini kısa sürede yok edebilir; ormanda ise bu zararlıdan etkilenmeyen türler, tek bir taşı çekildiğinde yıkılmayan sağlam bir duvar gibi ekosistemi ayakta tutar.\n\nBu parçada düşünceyi geliştirme yollarından hangisine başvurulmamıştır?",
    secenekler: ["Tanımlama", "Karşılaştırma", "Örneklendirme", "Benzetme", "Tanık gösterme"],
    dogruCevap: 4,
    aciklama:
      "İlk cümlede biyoçeşitlilik tanımlanmış, tarla ile orman karşılaştırılmış, \"Örneğin\" ile örnek verilmiş, ekosistem sağlam bir duvara benzetilmiştir. Parçada herhangi bir kişinin ya da kaynağın görüşüne başvurulmadığından tanık gösterme yoktur.",
  },
  {
    ders: "TURKCE",
    konu: "Sözel Mantık",
    grupId: "l2-turkce-mantik-apartman",
    soruMetni: `${APARTMAN}\n\nBuna göre aşağıdakilerden hangisi kesinlikle yanlıştır?`,
    secenekler: [
      "Aksoy ailesi 2. katta oturmaktadır.",
      "Demir ailesi en üst katta oturmaktadır.",
      "Eren ailesi 2. katta oturmaktadır.",
      "Çelik ailesi 3. katta oturmaktadır.",
      "Bulut ailesi 1. katta oturmaktadır.",
    ],
    dogruCevap: 3,
    aciklama:
      "Koşulları sağlayan üç yerleşim vardır (1. kattan 5. kata): Bulut-Aksoy-Demir-Çelik-Eren, Çelik-Demir-Bulut-Aksoy-Eren ve Çelik-Eren-Bulut-Aksoy-Demir. Çelik ailesi ya 1. ya da 4. kattadır; hiçbir yerleşimde 3. katta oturamaz. Diğer seçeneklerin her biri en az bir yerleşimde gerçekleşir.",
  },
  {
    ders: "TURKCE",
    konu: "Sözel Mantık",
    grupId: "l2-turkce-mantik-apartman",
    soruMetni: `${APARTMAN}\n\nÇelik ailesinin 1. katta oturduğu biliniyorsa aşağıdakilerden hangisi kesinlikle doğrudur?`,
    secenekler: [
      "Demir ailesi 2. katta oturmaktadır.",
      "Eren ailesi en üst katta oturmaktadır.",
      "Bulut ailesi 2. katta oturmaktadır.",
      "Eren ailesi, Aksoy ailesinden daha üst bir katta oturmaktadır.",
      "Aksoy ailesi 4. katta oturmaktadır.",
    ],
    dogruCevap: 4,
    aciklama:
      "Çelik 1. kattaysa olası yerleşimler Çelik-Demir-Bulut-Aksoy-Eren ve Çelik-Eren-Bulut-Aksoy-Demir'dir. İkisinde de Bulut 3., Aksoy 4. kattadır; Demir ile Eren'in 2. ve 5. katlardaki yerleri ise kesin değildir.",
  },
  {
    ders: "TURKCE",
    konu: "Sözel Mantık",
    grupId: "l2-turkce-mantik-kurs",
    soruMetni: `${KURS}\n\nBuna göre aşağıdakilerden hangisi kesinlikle doğrudur?`,
    secenekler: [
      "Gül'ün kursu perşembe günüdür.",
      "Ferhat'ın kursu pazartesi günüdür.",
      "Hakan'ın kursu çarşamba günüdür.",
      "İpek Rusça öğrenmektedir.",
      "Gül İspanyolca öğrenmektedir.",
    ],
    dogruCevap: 1,
    aciklama:
      "İspanyolca perşembe olduğundan Almanca-Rusça ardışık çifti ya pazartesi-salı ya da salı-çarşamba günlerindedir. Koşulları sağlayan dört dağılım vardır: Ferhat (Pzt, Fransızca), Gül (Salı, Almanca), İpek (Çarş, Rusça), Hakan (Perş, İspanyolca); Ferhat (Pzt, Almanca), Hakan (Salı, Rusça), İpek (Çarş, Fransızca), Gül (Perş, İspanyolca); Ferhat (Pzt, Almanca), İpek (Salı, Rusça), Hakan (Çarş, Fransızca), Gül (Perş, İspanyolca); Ferhat (Pzt, Fransızca), İpek (Salı, Almanca), Hakan (Çarş, Rusça), Gül (Perş, İspanyolca). Dördünde de Ferhat pazartesi günü kursa gider; diğer seçenekler en az bir dağılımda yanlıştır.",
  },
  {
    ders: "TURKCE",
    konu: "Sözel Mantık",
    grupId: "l2-turkce-mantik-kurs",
    soruMetni: `${KURS}\n\nHakan'ın Fransızca kursuna katıldığı biliniyorsa İpek'in kursa gittiği gün ve katıldığı kurs aşağıdakilerden hangisidir?`,
    secenekler: [
      "Çarşamba - Rusça",
      "Salı - Almanca",
      "Çarşamba - Fransızca",
      "Salı - Rusça",
      "Perşembe - Rusça",
    ],
    dogruCevap: 3,
    aciklama:
      "Hakan Fransızca öğreniyorsa tek dağılım kalır: Ferhat pazartesi Almanca, İpek salı Rusça, Hakan çarşamba Fransızca, Gül perşembe İspanyolca. Olası dört dağılımdan diğer üçünde Hakan Fransızca öğrenmediği için bunlar elenir.",
  },
];

/**
 * KPSS Ortaöğretim (LISE) 2. parti - Türkçe (30) + Matematik (30). Sıra KONU_DAGILIMI.LISE ile aynı.
 * Matematik cevapları ve sözel mantık çözümü betikle (tüm dizilişler taranarak) doğrulandı.
 */
import { type SeedSoru, sutunGrafigi } from "../kpssDenemeOrtak";

const ONARIM =
  "Büyükannelerimizin kuşağı, bozulan bir eşyayı atmak yerine onarmayı alışkanlık hâline getirmişti. Delinen çoraplar yamanır, sapı kırılan tencereye yeni bir sap takılır, duran saat ustaya götürülürdü. Bugün ise pek çok eşya, onarılması hiç düşünülmeden tasarlanıyor: Pili değiştirilemeyen telefonlar, yedek parçası bulunmayan ev aletleri kısa sürede çöpe gidiyor. Bunun bedelini yalnızca cebimiz değil, doğa da ödüyor; her yıl milyonlarca ton elektronik atık oluşuyor ve bunların önemli bir bölümü, içindeki zararlı maddelerle toprağa ve suya karışabiliyor. Son yıllarda bazı ülkelerde üreticilere yedek parça ve onarım bilgisi sağlama yükümlülüğü getiren düzenlemeler yapılması bu yüzden umut vericidir. Ne var ki yasalar tek başına yetmez; eşyalarımızla kurduğumuz ilişkiyi de değiştirmemiz, yenisini almadan önce eskisinin onarılıp onarılamayacağını sormayı yeniden öğrenmemiz gerekir.";

const KITAPCI =
  "Kasabanın tek kitapçısı Rıza Efendi, dükkânını kırk yıl önce açtığı günkü gibi her sabah saat yedide açardı. Raflar tavana kadar kitapla doluydu; ama o, hangi kitabın nerede durduğunu bir bakışta söyleyebilirdi. Son yıllarda dükkâna uğrayanlar azalmıştı. Gençler kitaplarını internetten sipariş ediyor, kapının önünden başlarını telefonlarından kaldırmadan geçiyordu. Yine de Rıza Efendi, her akşam vitrine yeni bir kitap koymaktan vazgeçmedi. Bir gün okul çantası omzunda bir kız çocuğu vitrinin önünde durdu, uzun uzun içeri baktı ve sonunda kapıyı itti. Rıza Efendi gözlüğünü düzeltip gülümsedi; kırk yılın yorgunluğu bir anda omuzlarından kalkmış gibiydi.";

const RAF =
  "Bir kitaplığın tek rafında soldan sağa 1'den 6'ya kadar numaralandırılmış altı bölme vardır. Bu bölmelere tarih, roman, şiir, deneme, sözlük ve atlas olmak üzere altı farklı kitap, her bölmeye bir kitap gelecek biçimde yerleştirilecektir. Yerleştirmeyle ilgili şunlar bilinmektedir:\n- Deneme kitabı 4. bölmededir.\n- Sözlük, atlasın hemen solundaki bölmededir.\n- Roman, şiir kitabından daha soldaki bir bölmededir.\n- Şiir kitabı ile deneme kitabı yan yana bölmelerde değildir.\n- Tarih kitabı 1. bölmede değildir.";

const OTOPARK =
  "Bir otoparkın ücret tarifesi şöyledir:\n- İlk 1 saat için 60 TL ödenir.\n- İlk saatten sonraki her saat ve tamamlanmamış her saat dilimi için 25 TL eklenir.\n- Bir aracın bir günde ödeyeceği ücret 250 TL'yi geçemez.";

const DENEME = "Bir öğrencinin girdiği beş deneme sınavında yaptığı net sayıları aşağıdaki sütun grafiğinde gösterilmiştir.";
const DENEME_GRAFIGI = sutunGrafigi(["1. deneme", "2. deneme", "3. deneme", "4. deneme", "5. deneme"], [40, 60, 50, 70, 80], 90, 10, "Net sayısı");

const LIG =
  "Altı takımın katıldığı bir futbol liginde her takım, diğer takımların her biriyle yalnızca bir kez karşılaşmaktadır. Bir maçı kazanan takım 3, kaybeden takım 0 puan almakta; berabere biten maçlarda ise iki takım da 1'er puan almaktadır.";

export const SORULAR: SeedSoru[] = [
  // ---- TÜRKÇE (30) ----
  {
    ders: "TURKCE",
    konu: "Sözcükte Anlam",
    soruMetni: "“Kırmak” sözcüğü aşağıdaki cümlelerin hangisinde “bir miktarı azaltmak, indirim yapmak” anlamında kullanılmıştır?",
    secenekler: [
      "Bardağı elinden düşürüp kırdı.",
      "Söyledikleriyle arkadaşını çok kırdı.",
      "Satıcı, ısrarımız üzerine fiyattan yüz lira kırdı.",
      "Şoför, direksiyonu sola kırarak kazadan son anda kurtuldu.",
      "Genç atlet, yıllardır kimsenin geçemediği rekoru bu yarışta kırdı.",
    ],
    dogruCevap: 2,
    aciklama:
      "C'de “fiyattan kırmak” fiyatı indirmek anlamındadır. A'da “parçalamak”, B'de “gücendirmek”, D'de “yönünü değiştirmek”, E'de “rekoru kırmak” deyimiyle “önceki dereceyi geçmek” anlamında kullanılmıştır.",
  },
  {
    ders: "TURKCE",
    konu: "Sözcükte Anlam",
    soruMetni:
      "Yazar, ilk romanlarında olayları ---- bir dille anlatırken son kitaplarında okuru düşündüren, yoruma açık bir anlatımı ----.\n\nBu cümlede boş bırakılan yerlere sırasıyla aşağıdakilerden hangisi getirilmelidir?",
    secenekler: ["süslü - reddetmiştir", "kapalı - seçmiştir", "karmaşık - bırakmıştır", "örtük - tercih etmiştir", "yalın - benimsemiştir"],
    dogruCevap: 4,
    aciklama:
      "“-ken” eki iki dönem arasında karşıtlık kurar: Son kitaplardaki “yoruma açık” anlatımın karşıtı ilk romanlardaki “yalın” dildir; yazar bu yeni anlatımı “benimsemiştir”. A ve C'de ikinci sözcük yazarın bu anlatıma yöneldiğiyle çelişir; B ve D'deki “kapalı, örtük” ise “yoruma açık” ile karşıtlık oluşturmaz.",
  },
  {
    ders: "TURKCE",
    konu: "Cümlede Anlam",
    soruMetni: "Aşağıdaki cümlelerin hangisinde amaç-sonuç ilişkisi vardır?",
    secenekler: [
      "Yağmur yağdığı için maç ertelendi.",
      "Sınavı kazanmak için her gün düzenli çalışıyor.",
      "Erken yola çıkarsan trafiğe takılmazsın.",
      "Hava kararınca sokak lambaları yandı.",
      "Çok yorulduğundan erkenden uyudu.",
    ],
    dogruCevap: 1,
    aciklama:
      "B'de düzenli çalışma, “sınavı kazanmak” amacına yöneliktir; amaç henüz gerçekleşmemiştir. A ve E'de neden-sonuç (A'daki “için” neden bildirir), C'de koşul-sonuç, D'de zaman ilişkisi vardır.",
  },
  {
    ders: "TURKCE",
    konu: "Cümlede Anlam",
    soruMetni: "“Bu kitabı okuyan herkes, kendinden bir şeyler bulacak.”\n\nAşağıdakilerden hangisi bu cümleyle anlamca en yakındır?",
    secenekler: [
      "Kitap, okurların büyük çoğunluğunun beğenisini kazanacak.",
      "Kitabın konusu, yazarın kendi yaşamından alınmıştır.",
      "Bu kitap, herkesin okuması gereken bir eserdir.",
      "Her okur, bu kitapta kendi yaşamından ve duygularından izlere rastlayacak.",
      "Okurlar, kitabı okuduktan sonra yazarı daha iyi anlayacak.",
    ],
    dogruCevap: 3,
    aciklama:
      "“Kendinden bir şeyler bulmak”, okurun kitapta kendi yaşantısına, duygularına benzer şeyler görmesidir; D bu anlamı karşılar. A beğeniden, B yazarın yaşamından, C okunma gerekliliğinden, E yazarı anlamaktan söz eder.",
  },
  {
    ders: "TURKCE",
    konu: "Dil Bilgisi",
    soruMetni: "Aşağıdaki cümlelerin hangisinde sıfat-fiil (ortaç) kullanılmamıştır?",
    secenekler: [
      "Akşam olunca bahçeye çıkıp çay içtik.",
      "Gelen misafirleri kapıda karşıladık.",
      "Okuduğum kitabı kardeşime hediye ettim.",
      "Kırılan camı hemen değiştirdiler.",
      "Yazılacak raporu yarına yetiştirmeliyiz.",
    ],
    dogruCevap: 0,
    aciklama:
      "A'daki “olunca” ve “çıkıp” zarf-fiildir; cümlede sıfat-fiil yoktur. B'de “gelen”, C'de “okuduğum”, D'de “kırılan”, E'de “yazılacak” sıfat-fiildir.",
  },
  {
    ders: "TURKCE",
    konu: "Dil Bilgisi",
    soruMetni: "Aşağıdaki cümlelerin hangisinde zarf tümleci yoktur?",
    secenekler: [
      "Dün akşam eski bir arkadaşımla karşılaştım.",
      "Kardeşim mektubu annesine verdi.",
      "Toplantı beklenenden çok uzun sürdü.",
      "Çocuklar bahçede neşeyle oynuyordu.",
      "Misafirler sabaha kadar sohbet etti.",
    ],
    dogruCevap: 1,
    aciklama:
      "B'nin ögeleri: “Kardeşim” özne, “mektubu” belirtili nesne, “annesine” dolaylı tümleç, “verdi” yüklem; zarf tümleci yoktur. A'da “dün akşam”, C'de “beklenenden çok uzun”, D'de “neşeyle”, E'de “sabaha kadar” zarf tümlecidir.",
  },
  {
    ders: "TURKCE",
    konu: "Dil Bilgisi",
    soruMetni: "Aşağıdaki cümlelerin hangisinde “ile” (-la, -le) bağlaç olarak kullanılmıştır?",
    secenekler: [
      "Annemle babam bu yaz Karadeniz'e gidecek.",
      "Mektubu kurşun kalemle yazmıştı.",
      "Kardeşiyle her hafta sinemaya gider.",
      "Haberi büyük bir sevinçle karşıladı.",
      "Okula her gün otobüsle gidiyor.",
    ],
    dogruCevap: 0,
    aciklama:
      "A'da “ile”, görevce eş iki sözcüğü bağlar ve yerine “ve” getirilebilir (annem ve babam); bağlaçtır. B ve E'de araç, C'de birliktelik, D'de durum bildiren edattır.",
  },
  {
    ders: "TURKCE",
    konu: "Ses Bilgisi",
    soruMetni: "Aşağıdaki cümlelerin hangisinde hem ünlü düşmesi hem de ünsüz yumuşaması vardır?",
    secenekler: [
      "Burnunu kapıya çarpınca canı yandı.",
      "Ağzının tadı kaçınca hiçbir şey yiyemedi.",
      "Kitabını çantasına koyup okula gitti.",
      "Oğlunun sesini duyunca kapıya koştu.",
      "Ağacın gölgesinde biraz dinlendik.",
    ],
    dogruCevap: 1,
    aciklama:
      "B'de ağız → ağzı (ünlü düşmesi), tat → tadı (ünsüz yumuşaması) vardır. A'da burun → burnu ve D'de oğul → oğlu yalnızca ünlü düşmesi; C'de kitap → kitabı ve E'de ağaç → ağacın yalnızca ünsüz yumuşamasıdır.",
  },
  {
    ders: "TURKCE",
    konu: "Yazım Kuralları",
    soruMetni: "Aşağıdaki cümlelerin hangisinde yazım yanlışı yapılmıştır?",
    secenekler: [
      "Toplantı 3 Mart 2025 Pazartesi günü yapılacak.",
      "Bu soruyu sen de çözebilirsin.",
      "Kardeşim ilkokulu Ankara'da bitirdi.",
      "Hiçbir şey eskisi gibi değildi.",
      "Bu yarışmaya sende katılmalısın.",
    ],
    dogruCevap: 4,
    aciklama:
      "E'deki “de” “da” bağlacıdır (“sen de katılmalısın”) ve ayrı yazılmalıdır. Belirli bir tarih bildiren gün adı büyük harfle başlar (A); “hiçbir” bitişik yazılır (D).",
  },
  {
    ders: "TURKCE",
    konu: "Noktalama İşaretleri",
    soruMetni: "Aşağıdaki cümlelerin hangisinde kesme işaretiyle ilgili bir yanlışlık yapılmıştır?",
    secenekler: [
      "Bu yaz Antalya'da tatil yapacağız.",
      "Türk Dil Kurumunun yeni sözlüğü yayımlandı.",
      "Türkçe'nin söz varlığı oldukça zengindir.",
      "Yunus Emre'nin şiirlerini çok severim.",
      "Toplantı ayın 15'inde yapılacak.",
    ],
    dogruCevap: 2,
    aciklama:
      "Özel adlardan yapım ekiyle türetilen “Türkçe” sözcüğüne gelen çekim eki kesmeyle ayrılmaz: “Türkçenin”. Kurum adlarına gelen ekler de kesmeyle ayrılmaz (B); yer ve kişi adlarına (A, D) ve rakamlara (E) gelen ekler kesmeyle ayrılır.",
  },
  {
    ders: "TURKCE",
    konu: "Anlatım Bozuklukları",
    soruMetni: "Aşağıdaki cümlelerin hangisinde gereksiz sözcük kullanımından kaynaklanan bir anlatım bozukluğu vardır?",
    secenekler: [
      "Toplantıda herkes görüşlerini özgürce dile getirdi.",
      "Kardeşim her sabah parkta yürüyüş yapıyor.",
      "Bu kitabı okuduktan sonra yazarın diğer eserlerini de merak ettim.",
      "Konsere yaklaşık olarak beş yüz kadar kişi katıldı.",
      "Yarınki sınav için bütün konuları yeniden gözden geçirdim.",
    ],
    dogruCevap: 3,
    aciklama:
      "D'de “yaklaşık olarak” ile “kadar” aynı anlamı (tahmini sayıyı) karşılar; biri gereksizdir: “Konsere yaklaşık beş yüz kişi katıldı.” Diğer cümlelerde anlatım bozukluğu yoktur.",
  },
  {
    ders: "TURKCE",
    konu: "Paragraf",
    soruMetni:
      "I. Pek çok meyve ve sebzenin ürün verebilmesi de büyük ölçüde arıların bu taşıma işine bağlıdır.\nII. Uzmanlar, bilinçsiz tarım ilacı kullanımını arı kayıplarının başlıca nedenleri arasında gösteriyor.\nIII. Arılar, bal üretmelerinin yanı sıra bitkilerin tozlaşmasında da önemli bir rol üstlenir.\nIV. Çiçekten çiçeğe konan bir arı, üzerine yapışan polenleri taşıyarak bitkilerin döllenmesine yardım eder.\nV. Bu nedenle arıların azalması, yalnızca bal üretimini değil, sofralarımıza gelen pek çok besini de tehdit eder.\n\nBu cümlelerle anlamlı bir paragraf oluşturulduğunda baştan üçüncü cümle hangisi olur?",
    secenekler: ["I", "II", "III", "IV", "V"],
    dogruCevap: 0,
    aciklama:
      "Sıralama III - IV - I - V - II'dir: Arıların tozlaşmadaki rolü (III), arının polenleri taşıyarak döllenmeye yardım etmesi (IV), ürünlerin “bu taşıma işine” bağlı olması (I), “Bu nedenle” arıların azalmasının tehdidi (V) ve kayıpların nedeni (II). Baştan üçüncü cümle I'dir.",
  },
  {
    ders: "TURKCE",
    konu: "Paragraf",
    soruMetni:
      "İyi bir konuşmacı olmanın yolu, sanıldığının aksine, iyi bir dinleyici olmaktan geçer. Karşısındakini dinlemeyen biri ne kadar akıcı konuşursa konuşsun, söylediklerini muhatabının ilgisine, bilgisine ve duygularına göre ayarlayamaz; bu yüzden sözleri çoğu zaman hedefine ulaşmaz. Dinlemek de yalnızca susmak değil, karşıdakinin ne demek istediğini anlamaya çalışmaktır. En etkili konuşmacıların, konuşmaya başlamadan önce en uzun süre dinleyenler olması bu yüzden şaşırtıcı değildir.\n\nBu parçada asıl anlatılmak istenen aşağıdakilerden hangisidir?",
    secenekler: [
      "Akıcı konuşan herkes, iyi bir konuşmacı sayılır.",
      "Dinlemek, yalnızca susmaktan ibarettir.",
      "Konuşmacılar, söyleyeceklerini kısa tutmalıdır.",
      "İnsanlar, karşısındakinin duygularını çoğu zaman önemsemez.",
      "Etkili konuşabilmek, iyi dinleyebilmeye bağlıdır.",
    ],
    dogruCevap: 4,
    aciklama:
      "Parça, iyi konuşmacı olmanın iyi dinleyici olmaktan geçtiğini ilk cümlede söyler ve bunu gerekçelendirir. A ve B parçadaki yargıların tersidir; C ve D'ye değinilmemiştir.",
  },
  {
    ders: "TURKCE",
    konu: "Paragraf",
    soruMetni:
      "(I) Şanlıurfa'daki Göbeklitepe, bilinen en eski anıtsal yapılar arasında gösterilen bir ören yeridir. (II) Burada ortaya çıkarılan T biçimli dikilitaşların üzerinde tilki, yaban domuzu ve yılan gibi hayvanların kabartmaları yer alır. (III) Bu yapıların, insanların henüz tarıma dayalı yerleşik hayata geçmediği bir dönemde inşa edilmiş olması bilim dünyasında büyük şaşkınlık yaratmıştır. (IV) Şanlıurfa, Balıklıgöl'ü ve tarihî çarşılarıyla da yılın her mevsiminde çok sayıda ziyaretçi ağırlar. (V) Çünkü uzun süre, böylesi anıtsal yapıların ancak yerleşik tarım toplumlarınca inşa edilebileceği düşünülüyordu.\n\nBu parçada numaralanmış cümlelerden hangisi düşüncenin akışını bozmaktadır?",
    secenekler: ["I", "II", "III", "IV", "V"],
    dogruCevap: 3,
    aciklama:
      "Parça Göbeklitepe'yi ve yapıldığı dönemin yarattığı şaşkınlığı anlatır. IV. cümle Şanlıurfa'nın turizmine geçerek akışı bozar; V. cümledeki “Çünkü” de III. cümleye bağlanır.",
  },
  {
    ders: "TURKCE",
    konu: "Paragraf",
    soruMetni:
      "Ebru, kitre adı verilen bitkisel bir maddeyle koyulaştırılmış suyun yüzeyine, içine birkaç damla öd karıştırılmış toprak boyaların fırçayla serpilmesiyle yapılır. Boyalar suyun yüzünde dağılmadan yüzer; sanatçı bunları biz ya da tarak gibi araçlarla şekillendirir. Ardından su yüzeyine bir kâğıt yatırılır ve desen bu kâğıda geçer. Ebrunun en dikkat çekici özelliği, her desenin yalnızca bir kez kâğıda aktarılabilmesidir: Aynı deseni ikinci kez elde etmek mümkün değildir.\n\nBu parçada ebruyla ilgili aşağıdakilerden hangisine değinilmemiştir?",
    secenekler: [
      "Yapımında kullanılan malzemelere",
      "Desenin kâğıda nasıl aktarıldığına",
      "Bu sanatın ilk ortaya çıktığı yere",
      "Boyaların şekillendirilmesinde kullanılan araçlara",
      "Aynı desenin ikinci kez elde edilemeyişine",
    ],
    dogruCevap: 2,
    aciklama:
      "Parçada malzemeler (kitre, öd, toprak boya), araçlar (fırça, biz, tarak), desenin kâğıda geçirilişi ve desenin tekrarlanamayışı anlatılır; ebrunun nerede ortaya çıktığından söz edilmez.",
  },
  {
    ders: "TURKCE",
    konu: "Paragraf",
    soruMetni:
      "Bir bilim insanının vardığı sonuç ne kadar çarpıcı olursa olsun, başka araştırmacılar aynı deneyi tekrarlayıp aynı sonuca ulaşamıyorsa bu sonuç bilim dünyasında kabul görmez. Çünkü tek bir deneyin sonucunu ölçüm hataları, rastlantılar ya da araştırmacının farkında olmadan yaptığı yanlışlar etkilemiş olabilir. Bu nedenle ----\n\nBu parça, düşüncenin akışına göre aşağıdakilerden hangisiyle tamamlanmalıdır?",
    secenekler: [
      "bilim insanları deney yapmaktan kaçınmalıdır.",
      "bilimde bir bulgunun güvenilirliği, başka araştırmacılarca yeniden elde edilebilmesine bağlıdır.",
      "çarpıcı sonuçlara ulaşan bilim insanları her zaman yanılır.",
      "deneyler yalnızca bir kez yapılmalıdır.",
      "bilim insanları, deneylerinin ayrıntılarını gizli tutmalıdır.",
    ],
    dogruCevap: 1,
    aciklama:
      "Parça, tek bir deneyin yanıltıcı olabileceğini ve sonucun ancak başkalarınca tekrarlanınca kabul gördüğünü anlatır; “Bu nedenle” ile bu düşüncenin sonucu olan B gelir. D ve E parçayla çelişir; A ve C aşırı genellemedir.",
  },
  {
    ders: "TURKCE",
    konu: "Paragraf",
    soruMetni:
      "Kasabanın girişindeki çınar, gövdesi ancak beş kişinin el ele verip sarabileceği kadar kalındı. Öğle güneşinde yaprakları gümüşî bir yeşille parlar, dallarının gölgesi kahvehanenin önündeki tahta masaların üzerine serin bir örtü gibi yayılırdı. Gövdesindeki derin kovuk, yılların bıraktığı kara bir yara izini andırıyordu; köklerinden biri toprağı yararak kaldırımın taşlarını yerinden oynatmıştı.\n\nBu parçada ağırlıklı olarak kullanılan anlatım biçimi aşağıdakilerden hangisidir?",
    secenekler: ["Betimleme", "Öyküleme", "Tartışma", "Açıklama", "Diyalog"],
    dogruCevap: 0,
    aciklama:
      "Parçada çınarın gövdesi, yaprakları, gölgesi, kovuğu ve kökü; renk, büyüklük ve görünüş ayrıntılarıyla okurun gözünde canlandırılmıştır. Bu, betimleyici anlatımdır; birbirini izleyen bir olay dizisi yoktur.",
  },
  {
    ders: "TURKCE",
    konu: "Paragraf",
    soruMetni:
      "Fotoğraf makinelerinin film kullandığı yıllarda her kare para demekti; bir rulo filmle genellikle yirmi dört ya da otuz altı fotoğraf çekilebiliyordu. Bu yüzden insanlar deklanşöre basmadan önce uzun uzun düşünür, kadrajı özenle kurardı. Bugün telefonlarımızla bir günde yüzlerce fotoğraf çekebiliyoruz; ancak bu bolluk, fotoğraflara verdiğimiz değeri azaltmış görünüyor. Çektiğimiz karelerin çoğuna bir daha bakmıyor, onları telefonun belleğinde unutup gidiyoruz.\n\nBu parçadan aşağıdakilerden hangisi çıkarılamaz?",
    secenekler: [
      "Film kullanılan dönemde fotoğraf çekmek maliyetliydi.",
      "Eskiden fotoğraf çekilmeden önce kadraja daha çok özen gösterilirdi.",
      "Teknolojideki gelişmeler, çekilebilen fotoğraf sayısını artırmıştır.",
      "Bugün çekilen fotoğrafların önemli bir bölümüne bir daha bakılmamaktadır.",
      "Dijital fotoğrafların görüntü kalitesi, film fotoğraflarınınkinden düşüktür.",
    ],
    dogruCevap: 4,
    aciklama:
      "Parçada iki dönem fotoğrafın maliyeti, çekim özeni, sayısı ve değeri bakımından karşılaştırılır; görüntü kalitesinden hiç söz edilmez. A “her kare para demekti”, B “kadrajı özenle kurardı”, C “yüzlerce fotoğraf”, D “çoğuna bir daha bakmıyor” ifadelerinden çıkarılır.",
  },
  {
    ders: "TURKCE",
    konu: "Paragraf",
    soruMetni:
      "Uzun yıllar boyunca uykunun yalnızca bedeni dinlendiren bir süreç olduğu düşünüldü. ---- Gün boyunca öğrenilen bilgiler uyku sırasında pekiştirilir, önemsiz ayrıntılar ise ayıklanır. Bu yüzden sınavdan önceki geceyi uykusuz geçiren bir öğrenci, çalıştığı konuları beklediğinden çok daha çabuk unutabilir.\n\nBu parçada boş bırakılan yere düşüncenin akışına göre aşağıdakilerden hangisi getirilmelidir?",
    secenekler: [
      "Yetişkinlerin her gece yedi-sekiz saat uyuması önerilir.",
      "Bazı hayvanlar kış aylarını uykuda geçirir.",
      "Oysa son araştırmalar, uykunun beynin öğrenme süreci için de büyük önem taşıdığını gösteriyor.",
      "Uykusuzluk, bağışıklık sistemini de zayıflatabilir.",
      "Öğrenciler, sınav dönemlerinde daha fazla kahve tüketir.",
    ],
    dogruCevap: 2,
    aciklama:
      "Boşluktan önce eski bir görüş, sonra uykunun öğrenmeye katkısı anlatılır. Bu iki bölümü “Oysa” ile karşıtlık kurup uykunun öğrenmedeki rolünü tanıtan C bağlar; diğerleri konudan uzaklaşır.",
  },
  {
    ders: "TURKCE",
    konu: "Paragraf",
    grupId: "l2o-turkce-onarim",
    soruMetni: `${ONARIM}\n\nBu parçada asıl anlatılmak istenen aşağıdakilerden hangisidir?`,
    secenekler: [
      "Eski kuşaklar, yeni kuşaklardan daha tutumlu insanlardı.",
      "Eşyaları onarma alışkanlığı, hem yasal düzenlemelerle hem de bireysel tutum değişikliğiyle yeniden kazanılmalıdır.",
      "Elektronik atık sorunu, yalnızca yasal düzenlemelerle çözülebilir.",
      "Teknolojik ürünlerin fiyatları her geçen yıl artmaktadır.",
      "Onarım kılavuzlarını tüketicilerin çoğu okumamaktadır.",
    ],
    dogruCevap: 1,
    aciklama:
      "Yazar onarım kültürünün kaybolmasının bedelini anlatır; yasal düzenlemeleri umut verici bulur ama tek başına yeterli görmez ve eşyalarla kurduğumuz ilişkinin de değişmesi gerektiğini vurgular. C parçadaki “yasalar tek başına yetmez” yargısıyla çelişir; D ve E'ye değinilmemiştir.",
  },
  {
    ders: "TURKCE",
    konu: "Paragraf",
    grupId: "l2o-turkce-onarim",
    soruMetni: `${ONARIM}\n\nBu parçaya göre aşağıdakilerden hangisi söylenemez?`,
    secenekler: [
      "Günümüzde bazı ürünler, onarılmaları düşünülmeden üretilmektedir.",
      "Elektronik atıklar çevreye zarar verebilmektedir.",
      "Bazı ülkelerde üreticilere onarımı kolaylaştıracak yükümlülükler getirilmiştir.",
      "Onarım alışkanlığının yeniden kazanılması için yasal düzenlemeler tek başına yeterlidir.",
      "Eski kuşaklar, bozulan eşyalarını onarmayı alışkanlık edinmişti.",
    ],
    dogruCevap: 3,
    aciklama:
      "Parçanın son cümlesinde “yasalar tek başına yetmez” denir; D bununla çelişir. A, B, C ve E sırasıyla parçanın üçüncü, dördüncü, beşinci ve ilk cümlelerinde dile getirilmiştir.",
  },
  {
    ders: "TURKCE",
    konu: "Paragraf",
    grupId: "l2o-turkce-kitapci",
    soruMetni: `${KITAPCI}\n\nBu parçada Rıza Efendi'yle ilgili aşağıdaki yargılardan hangisine ulaşılamaz?`,
    secenekler: [
      "Dükkânını kapatmayı düşünmektedir.",
      "İşine bağlı biridir.",
      "Dükkânındaki kitapların yerini çok iyi bilir.",
      "Müşterilerinin azalmasına karşın umudunu yitirmemiştir.",
      "Kız çocuğunun dükkâna girmesi onu sevindirmiştir.",
    ],
    dogruCevap: 0,
    aciklama:
      "Rıza Efendi'nin kırk yıldır dükkânını her sabah aynı saatte açması (B), kitapların yerini bir bakışta söyleyebilmesi (C), vitrine kitap koymaktan vazgeçmemesi (D) ve kız içeri girince gülümsemesi (E) anlatılır. Dükkânı kapatmayı düşündüğüne dair bir ifade yoktur.",
  },
  {
    ders: "TURKCE",
    konu: "Paragraf",
    grupId: "l2o-turkce-kitapci",
    soruMetni: `${KITAPCI}\n\nBu parçadaki “kırk yılın yorgunluğu bir anda omuzlarından kalkmış gibiydi” sözüyle anlatılmak istenen aşağıdakilerden hangisidir?`,
    secenekler: [
      "Rıza Efendi'nin emekli olmaya karar verdiği",
      "Rıza Efendi'nin yorgunluktan yakındığı",
      "Dükkânın yeniden eski kalabalığına kavuştuğu",
      "Kız çocuğunun dükkânda çalışmaya başlayacağı",
      "Rıza Efendi'nin, yıllardır süren çabasının boşa gitmediğini hissederek ferahladığı",
    ],
    dogruCevap: 4,
    aciklama:
      "Her akşam vitrine kitap koyan Rıza Efendi, vitrinden etkilenip içeri giren çocuğu görünce emeğinin karşılık bulduğunu hisseder ve rahatlar. Dükkânın kalabalıklaştığı, emeklilik ya da çocuğun dükkânda çalışacağı söylenmez.",
  },
  {
    ders: "TURKCE",
    konu: "Paragraf",
    grupId: "l2o-turkce-kitapci",
    soruMetni: `${KITAPCI}\n\nBu parçanın anlatımıyla ilgili aşağıdakilerden hangisi söylenemez?`,
    secenekler: [
      "Olaylar, olayların dışında kalan bir anlatıcı tarafından aktarılmıştır.",
      "Betimlemelere yer verilmiştir.",
      "Kişiler arasındaki karşılıklı konuşmalara yer verilmiştir.",
      "Öyküleyici anlatımdan yararlanılmıştır.",
      "Benzetmeye başvurulmuştur.",
    ],
    dogruCevap: 2,
    aciklama:
      "Parçada hiçbir karakter konuşturulmaz; karşılıklı konuşma yoktur. Olaylar üçüncü kişi ağzından anlatılır (A), rafların ve çocuğun görünüşü betimlenir (B), olaylar zaman sırasıyla aktarılır (D) ve “kalkmış gibiydi” ifadesinde benzetme vardır (E).",
  },
  {
    ders: "TURKCE",
    konu: "Paragraf",
    soruMetni:
      "Bir yörenin iklimine ve toprağına yüzyıllar içinde uyum sağlamış yerel tohumlar, bu uyum sayesinde kuraklığa ve hastalıklara karşı çoğu zaman dayanıklıdır. Ne var ki yüksek verim için geliştirilmiş tohumların yaygınlaşmasıyla bu çeşitlerin pek çoğu tarlalardan çekildi; bazılarından ise yalnızca birkaç yaşlı çiftçinin kilerinde birer avuç tohum kaldı. Bugün bazı köylerde gönüllüler, bu tohumları toplayıp çoğaltarak ve yeniden ekilmeleri için çiftçilere dağıtarak bu mirası yaşatmaya çalışıyor.\n\nBu parçaya getirilebilecek en uygun başlık aşağıdakilerden hangisidir?",
    secenekler: [
      "Yüksek Verimli Tohumların Yararları",
      "Kuraklıkla Mücadelede Sulama Yöntemleri",
      "Köyden Kente Göçün Nedenleri",
      "Kaybolmaya Yüz Tutmuş Bir Miras: Yerel Tohumlar",
      "Gönüllülük Nedir?",
    ],
    dogruCevap: 3,
    aciklama:
      "Parça, yerel tohumların değerini, tarlalardan çekilerek yok olma tehlikesine girmesini ve korunma çabalarını anlatır; bu bütünü D karşılar. A, B, C ve E ya parçadaki bir ayrıntıya dayanır ya da parçada hiç geçmez.",
  },
  {
    ders: "TURKCE",
    konu: "Paragraf",
    soruMetni:
      "Pek çok müzede çocuklar, camekânların ardındaki nesnelere yalnızca uzaktan bakabiliyor; her köşede “Dokunmayınız!” uyarısıyla karşılaşıyor. Oysa çocuklar dünyayı dokunarak, deneyerek, kurcalayarak tanır. Eserlerin korunması elbette önemlidir; ama bunun, müze gezisini çocuklar için sıkıcı bir koridor yürüyüşüne dönüştürmeden de sağlanabileceğini gösteren örnekler az değildir. Bazı müzelerin özgün eserlerin dokunulabilir kopyalarını sergilemesi ya da çocuklara yönelik atölyeler düzenlemesi bunlardan yalnızca birkaçıdır.\n\nBu parçada yazarın eleştirdiği durum aşağıdakilerden hangisidir?",
    secenekler: [
      "Eserlerin korunmasına gereken önemin verilmemesi",
      "Pek çok müzenin, çocukların sergilenen nesnelerle etkileşim kurmasına olanak tanımaması",
      "Müzelerde çok sayıda kopya eser sergilenmesi",
      "Ailelerin çocuklarını müzelere götürmemesi",
      "Müze giriş ücretlerinin yüksek olması",
    ],
    dogruCevap: 1,
    aciklama:
      "Yazar, çocukların müzelerde nesnelere yalnızca uzaktan bakabilmesini ve dokunmanın yasaklanmasını eleştirir. Eserlerin korunmasını önemli bulur (A), dokunulabilir kopyaları olumlu örnek gösterir (C); D ve E'ye değinmez.",
  },
  {
    ders: "TURKCE",
    konu: "Sözel Mantık",
    grupId: "l2o-turkce-raf",
    soruMetni: `${RAF}\n\nBuna göre kitaplar rafa kaç farklı biçimde yerleştirilebilir?`,
    secenekler: ["2", "3", "4", "5", "6"],
    dogruCevap: 2,
    aciklama:
      "Deneme 4. bölmede olduğundan şiir 3. ve 5. bölmede olamaz; romanın solunda olamayacağı için 1. bölmede de olamaz. Sözlük-atlas ikilisi 1-2, 2-3 ya da 5-6. bölmelere yerleşebilir. Tüm durumlar denendiğinde (soldan sağa) yalnızca şu dört diziliş koşulları sağlar: roman-şiir-tarih-deneme-sözlük-atlas, roman-sözlük-atlas-deneme-tarih-şiir, sözlük-atlas-tarih-deneme-roman-şiir, sözlük-atlas-roman-deneme-tarih-şiir.",
  },
  {
    ders: "TURKCE",
    konu: "Sözel Mantık",
    grupId: "l2o-turkce-raf",
    soruMetni: `${RAF}\n\nBuna göre aşağıdakilerden hangisi kesinlikle yanlıştır?`,
    secenekler: [
      "Şiir kitabı 5. bölmededir.",
      "Roman 3. bölmededir.",
      "Tarih kitabı 5. bölmededir.",
      "Atlas 2. bölmededir.",
      "Sözlük 5. bölmededir.",
    ],
    dogruCevap: 0,
    aciklama:
      "Şiir, 4. bölmedeki denemeyle yan yana olamayacağı için 5. bölmede bulunamaz; dört olası dizilişte şiir 2. ya da 6. bölmededir. B, C, D ve E en az bir dizilişte gerçekleşir (ör. sözlük-atlas-roman-deneme-tarih-şiir dizilişinde roman 3., tarih 5., atlas 2. bölmededir; sözlük ise roman-şiir-tarih-deneme-sözlük-atlas dizilişinde 5. bölmededir).",
  },
  {
    ders: "TURKCE",
    konu: "Sözel Mantık",
    grupId: "l2o-turkce-raf",
    soruMetni: `${RAF}\n\nŞiir kitabı 2. bölmede ise 5. bölmede hangi kitap vardır?`,
    secenekler: ["Tarih", "Roman", "Deneme", "Atlas", "Sözlük"],
    dogruCevap: 4,
    aciklama:
      "Şiirin 2. bölmede olduğu tek diziliş roman-şiir-tarih-deneme-sözlük-atlas'tır. Bu dizilişte 5. bölmede sözlük vardır.",
  },
  {
    ders: "TURKCE",
    konu: "Sözel Mantık",
    grupId: "l2o-turkce-raf",
    soruMetni: `${RAF}\n\nAtlas, tarih kitabının hemen solundaki bölmede ise 5. bölmede hangi kitap vardır?`,
    secenekler: ["Tarih", "Roman", "Şiir", "Sözlük", "Atlas"],
    dogruCevap: 1,
    aciklama:
      "Atlasın tarih kitabının hemen solunda olduğu tek diziliş sözlük-atlas-tarih-deneme-roman-şiir'dir. Bu dizilişte 5. bölmede roman vardır.",
  },

  // ---- MATEMATİK (30) ----
  {
    ders: "MATEMATIK",
    konu: "Temel Kavramlar",
    soruMetni: "x ve y pozitif tam sayılardır.\n\nx · y = 36\n\nolduğuna göre x + y toplamı kaç farklı değer alabilir?",
    secenekler: ["4", "5", "6", "8", "9"],
    dogruCevap: 1,
    aciklama:
      "36'nın çarpanlarına göre (x, y) ikilileri, sıra gözetilmeksizin (1, 36), (2, 18), (3, 12), (4, 9) ve (6, 6)'dır. Toplamlar 37, 20, 15, 13 ve 12 olur; sıralamanın değişmesi toplamı değiştirmez. 5 farklı değer vardır.",
  },
  {
    ders: "MATEMATIK",
    konu: "Temel Kavramlar",
    soruMetni: "AB ve BA iki basamaklı doğal sayılardır.\n\nAB + BA = 132\nAB − BA = 36\n\nolduğuna göre A · B çarpımı kaçtır?",
    secenekler: ["20", "24", "27", "28", "32"],
    dogruCevap: 4,
    aciklama:
      "AB + BA = 11(A + B) = 132 ⇒ A + B = 12. AB − BA = 9(A − B) = 36 ⇒ A − B = 4. Buradan A = 8, B = 4 ve A · B = 32.",
  },
  {
    ders: "MATEMATIK",
    konu: "Rasyonel Sayılar",
    soruMetni: "{3/4 − 1/6|5/12} + {1,2|0,4}\n\nişleminin sonucu kaçtır?",
    secenekler: ["3,8", "4", "4,2", "4,4", "5"],
    dogruCevap: 3,
    aciklama: "3/4 − 1/6 = 9/12 − 2/12 = 7/12 ve {7/12|5/12} = 7/5 = 1,4. {1,2|0,4} = {12|4} = 3. Sonuç 1,4 + 3 = 4,4.",
  },
  {
    ders: "MATEMATIK",
    konu: "Rasyonel Sayılar",
    soruMetni: "a = 13/14, b = 15/16, c = 11/12\n\nolduğuna göre aşağıdaki sıralamalardan hangisi doğrudur?",
    secenekler: ["c < a < b", "a < b < c", "a < c < b", "b < a < c", "c < b < a"],
    dogruCevap: 0,
    aciklama:
      "a = 1 − 1/14, b = 1 − 1/16, c = 1 − 1/12'dir. 1'den çıkarılan kesir küçüldükçe sayı büyür: 1/16 < 1/14 < 1/12 olduğundan c < a < b.",
  },
  {
    ders: "MATEMATIK",
    konu: "Köklü Sayılar",
    soruMetni: "{√50 + √18|√8} + √0,09\n\nişleminin sonucu kaçtır?",
    secenekler: ["3,7", "4", "4,3", "4,5", "5"],
    dogruCevap: 2,
    aciklama: "√50 = 5√2, √18 = 3√2, √8 = 2√2 olduğundan kesir {8√2|2√2} = 4'tür. √0,09 = 0,3. Sonuç 4 + 0,3 = 4,3.",
  },
  {
    ders: "MATEMATIK",
    konu: "Üslü Sayılar",
    soruMetni: "3ˣ⁺² − 3ˣ = 72\n\nolduğuna göre 2ˣ kaçtır?",
    secenekler: ["4", "6", "8", "9", "16"],
    dogruCevap: 0,
    aciklama: "3ˣ⁺² − 3ˣ = 3ˣ · (9 − 1) = 8 · 3ˣ = 72 ⇒ 3ˣ = 9 ⇒ x = 2. 2ˣ = 2² = 4.",
  },
  {
    ders: "MATEMATIK",
    konu: "Matematiksel İlişkilerden Yararlanma",
    soruMetni: "{a|3} = {b|4} = {c|6}\n\n2a + b − c = 24\n\nolduğuna göre a + b + c toplamı kaçtır?",
    secenekler: ["60", "66", "72", "78", "84"],
    dogruCevap: 3,
    aciklama: "a = 3k, b = 4k, c = 6k olsun. 6k + 4k − 6k = 4k = 24 ⇒ k = 6. a + b + c = 13k = 78.",
  },
  {
    ders: "MATEMATIK",
    konu: "Matematiksel İlişkilerden Yararlanma",
    soruMetni: "x ve y gerçek sayılar olmak üzere\n\n−3 < x < 2\n1 < y < 4\n\nolduğuna göre 2x − y ifadesinin alabileceği en büyük tam sayı değeri kaçtır?",
    secenekler: ["1", "2", "3", "4", "5"],
    dogruCevap: 1,
    aciklama:
      "−6 < 2x < 4 ve −4 < −y < −1'dir. Taraf tarafa toplanırsa −10 < 2x − y < 3 bulunur. İfade 3'e eşit olamayacağından alabileceği en büyük tam sayı değeri 2'dir.",
  },
  {
    ders: "MATEMATIK",
    konu: "Matematiksel İlişkilerden Yararlanma",
    soruMetni: "|x − 3| ≤ 5\n|x + 1| > 2\n\neşitsizliklerinin ikisini birden sağlayan x tam sayılarının toplamı kaçtır?",
    secenekler: ["27", "29", "30", "33", "35"],
    dogruCevap: 4,
    aciklama:
      "|x − 3| ≤ 5 ⇒ −2 ≤ x ≤ 8. |x + 1| > 2 ⇒ x > 1 ya da x < −3. Ortak tam sayılar 2, 3, 4, 5, 6, 7 ve 8'dir; toplamları 35.",
  },
  {
    ders: "MATEMATIK",
    konu: "Matematiksel İlişkilerden Yararlanma",
    soruMetni:
      "Birbirinden farklı 5 matematik ve 3 tarih kitabı bir rafa yan yana dizilecektir.\n\nTarih kitapları birbirinden ayrılmamak koşuluyla bu kitaplar kaç farklı biçimde dizilebilir?",
    secenekler: ["720", "1440", "2160", "4320", "8640"],
    dogruCevap: 3,
    aciklama:
      "3 tarih kitabı tek bir kitap gibi düşünülürse 6 nesne 6! = 720 farklı biçimde dizilir. Tarih kitapları kendi aralarında 3! = 6 farklı biçimde sıralanır. Toplam 720 · 6 = 4320.",
  },
  {
    ders: "MATEMATIK",
    konu: "Matematiksel İlişkilerden Yararlanma",
    soruMetni: "1'den 20'ye kadar numaralandırılmış 20 kart arasından rastgele bir kart çekiliyor.\n\nÇekilen kartın üzerindeki sayının 3'e ya da 5'e tam bölünebilme olasılığı kaçtır?",
    secenekler: ["2/5", "9/20", "1/2", "11/20", "3/5"],
    dogruCevap: 1,
    aciklama:
      "3'ün katları 6 tane (3, 6, …, 18), 5'in katları 4 tanedir (5, 10, 15, 20). 15 her ikisinde de sayıldığından istenen sayılar 6 + 4 − 1 = 9 tanedir. Olasılık 9/20.",
  },
  {
    ders: "MATEMATIK",
    konu: "Matematiksel İlişkilerden Yararlanma",
    soruMetni: "a bir gerçek sayı olmak üzere\n\nf(x) = 2x + a\nf(3) = 11\n\nolduğuna göre f(f(1)) kaçtır?",
    secenekler: ["19", "21", "23", "25", "27"],
    dogruCevap: 0,
    aciklama: "f(3) = 6 + a = 11 ⇒ a = 5 ve f(x) = 2x + 5. f(1) = 7, f(f(1)) = f(7) = 14 + 5 = 19.",
  },
  {
    ders: "MATEMATIK",
    konu: "Problemler",
    soruMetni:
      "Bir sınıftaki öğrenciler sıralara ikişer ikişer oturduğunda 5 öğrenci ayakta kalıyor. Öğrenciler üçer üçer oturduğunda ise bütün öğrenciler oturabiliyor ve 3 sıra tamamen boş kalıyor.\n\nBuna göre sınıfta kaç öğrenci vardır?",
    secenekler: ["21", "24", "27", "30", "33"],
    dogruCevap: 4,
    aciklama: "Sıra sayısı s olsun. Öğrenci sayısı 2s + 5 = 3(s − 3) ⇒ 2s + 5 = 3s − 9 ⇒ s = 14. Öğrenci sayısı 2 · 14 + 5 = 33.",
  },
  {
    ders: "MATEMATIK",
    konu: "Problemler",
    soruMetni:
      "Bir mağaza, bir ceketin etiket fiyatı üzerinden %20 indirim yapıyor. Bir hafta sonra indirimli fiyat üzerinden %25 daha indirim yapılınca ceket 1080 TL'ye satılıyor.\n\nBuna göre ceketin etiket fiyatı kaç TL'dir?",
    secenekler: ["1500", "1600", "1800", "2000", "2160"],
    dogruCevap: 2,
    aciklama: "Etiket fiyatı x olsun. İki indirimden sonra fiyat x · 0,80 · 0,75 = 0,6x olur. 0,6x = 1080 ⇒ x = 1800 TL.",
  },
  {
    ders: "MATEMATIK",
    konu: "Problemler",
    soruMetni:
      "Bir babanın yaşı, oğlunun yaşının 4 katıdır. 5 yıl önce babanın yaşı, oğlunun o zamanki yaşının 7 katıydı.\n\nBuna göre kaç yıl sonra babanın yaşı, oğlunun yaşının 2 katı olur?",
    secenekler: ["10", "12", "15", "20", "25"],
    dogruCevap: 3,
    aciklama:
      "Oğul k, baba 4k yaşında olsun. 4k − 5 = 7(k − 5) ⇒ 3k = 30 ⇒ k = 10; baba 40 yaşındadır. 40 + t = 2(10 + t) ⇒ t = 20.",
  },
  {
    ders: "MATEMATIK",
    konu: "Problemler",
    soruMetni:
      "Bir işi Selin tek başına 12 günde, Kerem tek başına 18 günde bitirebilmektedir. İkisi birlikte 3 gün çalıştıktan sonra Selin işi bırakıyor.\n\nBuna göre işin kalanını Kerem tek başına kaç günde bitirir?",
    secenekler: ["10", "10,5", "11", "11,5", "12"],
    dogruCevap: 1,
    aciklama:
      "İkisi birlikte günde 1/12 + 1/18 = 5/36'sını yapar; 3 günde 15/36 biter, 21/36 kalır. Kerem günde 2/36'sını yaptığından kalan işi {21|2} = 10,5 günde bitirir.",
  },
  {
    ders: "MATEMATIK",
    konu: "Problemler",
    soruMetni:
      "Bir araç A kentinden B kentine saatte 60 km hızla gidip aynı yoldan saatte 90 km hızla geri dönüyor. Gidiş ve dönüş toplam 5 saat sürüyor.\n\nBuna göre A ile B kentleri arasındaki yol kaç km'dir?",
    secenekler: ["180", "200", "216", "240", "270"],
    dogruCevap: 0,
    aciklama: "Yol x km olsun. {x|60} + {x|90} = 5 ⇒ {3x + 2x|180} = 5 ⇒ x = 180 km.",
  },
  {
    ders: "MATEMATIK",
    konu: "Problemler",
    soruMetni:
      "Şeker oranı %20 olan 300 gramlık şekerli suya bir miktar şeker ekleniyor ve karışımın şeker oranı %40'a çıkıyor.\n\nBuna göre karışıma kaç gram şeker eklenmiştir?",
    secenekler: ["60", "80", "100", "120", "150"],
    dogruCevap: 2,
    aciklama: "Başlangıçta 300 · 0,20 = 60 g şeker vardır. x g şeker eklenirse 60 + x = 0,40 · (300 + x) ⇒ 0,6x = 60 ⇒ x = 100 g.",
  },
  {
    ders: "MATEMATIK",
    konu: "Problemler",
    grupId: "l2o-mat-otopark",
    soruMetni: `${OTOPARK}\n\nBuna göre bu otoparkta 4 saat 20 dakika kalan bir aracın sahibi kaç TL öder?`,
    secenekler: ["120", "135", "145", "150", "160"],
    dogruCevap: 4,
    aciklama:
      "İlk saat 60 TL'dir. Kalan 3 saat 20 dakika, 3 tam saat ve 1 tamamlanmamış saat dilimi yani 4 dilimdir: 4 · 25 = 100 TL. Toplam 60 + 100 = 160 TL.",
  },
  {
    ders: "MATEMATIK",
    konu: "Problemler",
    grupId: "l2o-mat-otopark",
    soruMetni: `${OTOPARK}\n\nAynı gün otoparka giren araçlardan biri 2 saat 10 dakika, diğeri 9 saat 45 dakika kalmıştır. Buna göre iki aracın ödediği ücretlerin toplamı kaç TL'dir?`,
    secenekler: ["360", "375", "385", "395", "410"],
    dogruCevap: 0,
    aciklama:
      "Birinci araç: 60 + 2 · 25 = 110 TL (1 saat 10 dakika, 2 dilim). İkinci araç: 60 + 9 · 25 = 285 TL eder (8 saat 45 dakika, 9 dilim); ancak günlük üst sınır 250 TL olduğundan 250 TL öder. Toplam 110 + 250 = 360 TL.",
  },
  {
    ders: "MATEMATIK",
    konu: "Tablo ve Grafik",
    grupId: "l2o-mat-deneme",
    soruMetni: `${DENEME}\n\nBuna göre öğrencinin en yüksek neti, beş denemedeki net ortalamasından kaç fazladır?`,
    gorselSvg: DENEME_GRAFIGI,
    secenekler: ["5", "10", "15", "20", "25"],
    dogruCevap: 3,
    aciklama: "Grafikten netler 40, 60, 50, 70 ve 80 okunur. Toplam 300, ortalama 300 / 5 = 60'tır. En yüksek net 80 olduğundan fark 80 − 60 = 20.",
  },
  {
    ders: "MATEMATIK",
    konu: "Tablo ve Grafik",
    grupId: "l2o-mat-deneme",
    soruMetni: `${DENEME}\n\nÖğrenci 6. bir denemeye daha girmiş ve altı denemenin net ortalaması 65 olmuştur. Buna göre öğrencinin 6. denemedeki neti, 2. denemedeki netinden yüzde kaç fazladır?`,
    gorselSvg: DENEME_GRAFIGI,
    secenekler: ["40", "50", "60", "75", "80"],
    dogruCevap: 1,
    aciklama:
      "Altı denemenin net toplamı 6 · 65 = 390'dır. İlk beş denemenin toplamı 300 olduğundan 6. denemedeki net 90'dır. 2. denemedeki net 60'tır: {90 − 60|60} · 100 = %50.",
  },
  {
    ders: "MATEMATIK",
    konu: "Tablo ve Grafik",
    soruMetni:
      "Bir ilçe halk kütüphanesinden 2020-2024 yıllarında ödünç alınan kitap sayıları aşağıdaki grafikte bin adet cinsinden verilmiştir.\n\nBuna göre ödünç alınan kitap sayısının bir önceki yıla göre yüzde olarak en çok arttığı yılda artış oranı yüzde kaçtır?",
    gorselSvg: sutunGrafigi(["2020", "2021", "2022", "2023", "2024"], [20, 24, 36, 8, 16], 40, 4, "Ödünç alınan kitap sayısı (bin adet)"),
    secenekler: ["20", "25", "50", "75", "100"],
    dogruCevap: 4,
    aciklama:
      "Grafikten değerler 20, 24, 36, 8 ve 16 bin okunur. Artışlar: 2021'de 4/20 = %20, 2022'de 12/24 = %50, 2024'te 8/8 = %100; 2023'te azalma vardır. Sayıca en büyük artış 2022'de olsa da yüzde olarak en büyük artış 2024'tedir: %100.",
  },
  {
    ders: "MATEMATIK",
    konu: "Sayısal Mantık",
    soruMetni:
      "Bir sayı dizisinde üçüncü terimden başlayarak her terim, kendisinden önceki iki terimin toplamının 1 eksiğine eşittir. Bu dizinin 1. terimi 3, 4. terimi 11'dir.\n\nBuna göre dizinin 6. terimi kaçtır?",
    secenekler: ["23", "25", "27", "29", "31"],
    dogruCevap: 2,
    aciklama:
      "2. terim x olsun. 3. terim 3 + x − 1 = x + 2, 4. terim x + (x + 2) − 1 = 2x + 1 = 11 ⇒ x = 5. Dizi 3, 5, 7, 11, 17, 27 biçiminde ilerler; 6. terim 27'dir.",
  },
  {
    ders: "MATEMATIK",
    konu: "Sayısal Mantık",
    grupId: "l2o-mat-lig",
    soruMetni: `${LIG}\n\nLigdeki 5 maçının hepsini oynayan bir takım toplam 7 puan topladığına göre bu takımın kaybettiği maç sayısı en çok kaçtır?`,
    secenekler: ["0", "1", "2", "3", "4"],
    dogruCevap: 2,
    aciklama:
      "Galibiyet g, beraberlik b olsun: 3g + b = 7 ve g + b ≤ 5. g = 1 ise b = 4 ve yenilgi 0; g = 2 ise b = 1 ve yenilgi 2'dir (g = 0 için b = 7 > 5 olur). Kaybedilen maç sayısı en çok 2'dir.",
  },
  {
    ders: "MATEMATIK",
    konu: "Sayısal Mantık",
    grupId: "l2o-mat-lig",
    soruMetni: `${LIG}\n\nLig sonunda bütün takımların topladığı puanların toplamı 41 olduğuna göre ligde kaç maç berabere bitmiştir?`,
    secenekler: ["0", "1", "2", "3", "4"],
    dogruCevap: 4,
    aciklama:
      "Altı takım birbiriyle birer kez karşılaştığından {6 · 5|2} = 15 maç oynanır. Galibiyetle biten maç toplama 3, berabere biten maç 2 puan ekler. Hepsi galibiyetle bitseydi 45 puan olurdu; her beraberlik toplamı 1 azaltır: 45 − 41 = 4 beraberlik.",
  },
  {
    ders: "MATEMATIK",
    konu: "Sayısal Mantık",
    soruMetni: "Bir merdiveni her adımda 1 ya da 2 basamak çıkarak tırmanan biri, 6 basamaklı bir merdivenin en üst basamağına kaç farklı biçimde çıkabilir?",
    secenekler: ["8", "10", "12", "13", "21"],
    dogruCevap: 3,
    aciklama:
      "n. basamağa ya (n − 1). basamaktan 1 adımla ya da (n − 2). basamaktan 2 adımla gelinir; yol sayıları önceki ikisinin toplamıdır. 1. basamak: 1, 2.: 2, 3.: 3, 4.: 5, 5.: 8, 6.: 13.",
  },
  // -- Temel Geometri (3, gorselli) --
  {
    ders: "MATEMATIK",
    konu: "Temel Geometri",
    geometri: true,
    soruMetni: "Şekildeki ABC üçgeninde [AD], A açısının açıortayıdır. m(ABC) = 70° ve m(ACB) = 30°'dir.\n\nBuna göre m(ADC) = x kaç derecedir?",
    gorselSvg:
      '<svg viewBox="0 0 360 270" xmlns="http://www.w3.org/2000/svg" font-family="Arial, sans-serif" fill="#1e293b"><polygon points="90.4,101.6 40,240 330,240" fill="none" stroke="#1e293b" stroke-width="2.5"/><line x1="90.4" y1="101.6" x2="140.7" y2="240" stroke="#1e293b" stroke-width="2"/><path d="M 82.2,124.2 A 24,24 0 0,0 98.6,124.2" fill="none" stroke="#dc2626" stroke-width="1.8"/><path d="M 100.7,129.8 A 30,30 0 0,0 116.4,116.6" fill="none" stroke="#dc2626" stroke-width="1.8"/><path d="M 58,240 A 18,18 0 0,0 46.2,223.1" fill="none" stroke="#2563eb" stroke-width="1.8"/><path d="M 306,240 A 24,24 0 0,1 309.2,228" fill="none" stroke="#2563eb" stroke-width="1.8"/><path d="M 160.7,240 A 20,20 0 0,0 133.9,221.2" fill="none" stroke="#dc2626" stroke-width="1.8"/><text x="82" y="94" font-size="15">A</text><text x="22" y="256" font-size="15">B</text><text x="334" y="256" font-size="15">C</text><text x="134" y="258" font-size="15">D</text><text x="62" y="230" font-size="13" fill="#2563eb">70°</text><text x="276" y="234" font-size="13" fill="#2563eb">30°</text><text x="158" y="228" font-size="14" fill="#dc2626">x</text></svg>',
    secenekler: ["100", "105", "110", "115", "120"],
    dogruCevap: 2,
    aciklama:
      "m(BAC) = 180° − 70° − 30° = 80°; açıortay bu açıyı ikiye böldüğünden m(BAD) = 40°. ADC açısı ABD üçgeninin dış açısıdır: x = m(ABD) + m(BAD) = 70° + 40° = 110°.",
  },
  {
    ders: "MATEMATIK",
    konu: "Temel Geometri",
    geometri: true,
    soruMetni: "Şekildeki ABCD dikdörtgeninde |AB| = 8 cm, |BC| = 6 cm ve [DE] ⊥ [AC]'dir.\n\nBuna göre |DE| kaç cm'dir?",
    gorselSvg:
      '<svg viewBox="0 0 340 260" xmlns="http://www.w3.org/2000/svg" font-family="Arial, sans-serif" fill="#1e293b"><rect x="50" y="40" width="240" height="180" fill="none" stroke="#1e293b" stroke-width="2.5"/><line x1="50" y1="220" x2="290" y2="40" stroke="#1e293b" stroke-width="2"/><line x1="50" y1="40" x2="136.4" y2="155.2" stroke="#1e293b" stroke-width="2"/><polyline points="144.4,149.2 138.4,141.2 130.4,147.2" fill="none" stroke="#dc2626" stroke-width="1.5"/><text x="32" y="238" font-size="15">A</text><text x="296" y="238" font-size="15">B</text><text x="296" y="36" font-size="15">C</text><text x="32" y="36" font-size="15">D</text><text x="138" y="176" font-size="15">E</text><text x="166" y="240" font-size="13" fill="#dc2626">8</text><text x="298" y="134" font-size="13" fill="#dc2626">6</text></svg>',
    secenekler: ["4", "4,2", "4,5", "4,8", "5"],
    dogruCevap: 3,
    aciklama:
      "ADC dik üçgeninde |AD| = 6, |DC| = 8 ve Pisagor'dan |AC| = 10 cm'dir. |DE| = h olsun; üçgenin alanı iki yoldan yazılır: {6 · 8|2} = {10 · h|2} ⇒ h = 4,8 cm.",
  },
  {
    ders: "MATEMATIK",
    konu: "Temel Geometri",
    geometri: true,
    soruMetni:
      "Şekildeki O merkezli çemberde [AB] çaptır ve C noktası çember üzerindedir. |AC| = 6 cm ve |BC| = 8 cm'dir.\n\nBuna göre taralı bölgenin alanı kaç cm²'dir? (π = 3 alınız.)",
    gorselSvg:
      '<svg viewBox="0 0 320 260" xmlns="http://www.w3.org/2000/svg" font-family="Arial, sans-serif" fill="#1e293b"><circle cx="160" cy="140" r="100" fill="#dbeafe" stroke="#1e293b" stroke-width="2.5"/><polygon points="60,140 260,140 132,44" fill="#ffffff" stroke="#1e293b" stroke-width="2"/><polyline points="126,52 134,58 140,50" fill="none" stroke="#dc2626" stroke-width="1.5"/><circle cx="160" cy="140" r="2.5" fill="#1e293b"/><text x="40" y="146" font-size="15">A</text><text x="266" y="146" font-size="15">B</text><text x="124" y="36" font-size="15">C</text><text x="154" y="160" font-size="15">O</text><text x="82" y="88" font-size="13" fill="#dc2626">6</text><text x="204" y="86" font-size="13" fill="#dc2626">8</text></svg>',
    secenekler: ["51", "54", "57", "60", "75"],
    dogruCevap: 0,
    aciklama:
      "Çapı gören çevre açı 90° olduğundan ACB dik üçgendir; |AB| = √(6² + 8²) = 10 cm ve yarıçap 5 cm'dir. Dairenin alanı 3 · 5² = 75 cm², üçgenin alanı {6 · 8|2} = 24 cm². Taralı alan 75 − 24 = 51 cm².",
  },
];

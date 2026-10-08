/**
 * KPSS deneme sinavi soru havuzu - Ortaogretim duzeyi (enum LISE), ilk parti (120 soru).
 * Her soru AI tarafindan ozgun olarak yazildi (gercek OSYM sorusu degildir).
 * Bicim ve zorluk, kullanicinin sagladigi gercek Ortaogretim KPSS kitapcigina
 * gore kalibre edildi: Turkce 1-25 tek soru (sozcuk/cumle anlami, dil bilgisi,
 * paragraf), 26-27 ortak metin, 28-30 nobet cizelgesi sozel mantigi;
 * Matematik 31-52 islem/problem (hiz-zaman grafigi dahil), 53-57 ortak bilgili
 * gruplar (kibrit oruntusu, zeytin), 58-60 geometri (gorselli). Genel Kultur
 * Lisans/Onlisans havuzlarindan farkli konularla; harita ve iklim grafigi
 * gercek veriyle (Natural Earth, MGM).
 */
import { iklimGrafigi, sutunGrafigi, turkiyeHaritasi, type SeedSoru } from "./kpssDenemeOrtak";

/** Kibrit copleriyle yan yana `n` kare: ust/alt yatay + n+1 dikey cop, uclarinda kirmizi bas. */
function kibritKareleri(x0: number, n: number) {
  const kenar = 40;
  const y0 = 30;
  const cop = (x1: number, y1: number, x2: number, y2: number) =>
    `<line x1="${x1 + (x2 > x1 ? 3 : 0)}" y1="${y1 + (y2 > y1 ? 3 : 0)}" x2="${x2 - (x2 > x1 ? 3 : 0)}" y2="${y2 - (y2 > y1 ? 3 : 0)}" stroke="#d97706" stroke-width="4" stroke-linecap="round"/><circle cx="${x2 - (x2 > x1 ? 4 : 0)}" cy="${y2 - (y2 > y1 ? 4 : 0)}" r="3.5" fill="#dc2626"/>`;
  let s = "";
  for (let i = 0; i < n; i++) {
    s += cop(x0 + kenar * i, y0, x0 + kenar * (i + 1), y0) + cop(x0 + kenar * i, y0 + kenar, x0 + kenar * (i + 1), y0 + kenar);
  }
  for (let i = 0; i <= n; i++) s += cop(x0 + kenar * i, y0, x0 + kenar * i, y0 + kenar);
  return s + `<text x="${x0 + (kenar * n) / 2}" y="${y0 + kenar + 26}" font-size="12" text-anchor="middle" fill="#475569">${n}. şekil</text>`;
}

const KIBRIT_GORSELI = `<svg viewBox="0 0 360 110" xmlns="http://www.w3.org/2000/svg" font-family="Arial, sans-serif" fill="#1e293b">${kibritKareleri(20, 1)}${kibritKareleri(100, 2)}${kibritKareleri(220, 3)}</svg>`;

// Hiz-zaman grafigi: 0-2 sa 60 km/sa, 2-3 sa 90 km/sa, 3-5 sa 45 km/sa (toplam yol 300 km).
const HIZ_GRAFIGI =
  '<svg viewBox="0 0 390 250" xmlns="http://www.w3.org/2000/svg" font-family="Arial, sans-serif" fill="#1e293b">' +
  '<line x1="50" y1="210" x2="370" y2="210" stroke="#1e293b" stroke-width="1.5"/><line x1="50" y1="210" x2="50" y2="30" stroke="#1e293b" stroke-width="1.5"/>' +
  '<line x1="50" y1="60" x2="230" y2="60" stroke="#94a3b8" stroke-dasharray="4 4"/><line x1="50" y1="110" x2="170" y2="110" stroke="#94a3b8" stroke-dasharray="4 4"/><line x1="50" y1="135" x2="350" y2="135" stroke="#94a3b8" stroke-dasharray="4 4"/>' +
  '<line x1="170" y1="60" x2="170" y2="210" stroke="#94a3b8" stroke-dasharray="4 4"/><line x1="230" y1="60" x2="230" y2="210" stroke="#94a3b8" stroke-dasharray="4 4"/><line x1="350" y1="135" x2="350" y2="210" stroke="#94a3b8" stroke-dasharray="4 4"/>' +
  '<polyline points="50,110 170,110" fill="none" stroke="#2563eb" stroke-width="3"/><polyline points="170,60 230,60" fill="none" stroke="#2563eb" stroke-width="3"/><polyline points="230,135 350,135" fill="none" stroke="#2563eb" stroke-width="3"/>' +
  '<text x="42" y="64" font-size="11" text-anchor="end">90</text><text x="42" y="114" font-size="11" text-anchor="end">60</text><text x="42" y="139" font-size="11" text-anchor="end">45</text><text x="42" y="214" font-size="11" text-anchor="end">0</text>' +
  '<text x="110" y="226" font-size="11" text-anchor="middle">1</text><text x="170" y="226" font-size="11" text-anchor="middle">2</text><text x="230" y="226" font-size="11" text-anchor="middle">3</text><text x="290" y="226" font-size="11" text-anchor="middle">4</text><text x="350" y="226" font-size="11" text-anchor="middle">5</text>' +
  '<text x="54" y="22" font-size="12" font-weight="700">Hız (km/sa)</text><text x="370" y="244" font-size="12" font-weight="700" text-anchor="end">Zaman (saat)</text></svg>';

const NOBET =
  "Bir okulda pazartesiden cumaya kadar her gün bir öğretmen nöbet tutacaktır. Nöbet tutacak öğretmenler Ahmet, Berk, Ceren, Deniz ve Elif'tir; her öğretmen yalnızca bir gün nöbet tutar. Nöbet çizelgesine ilişkin bilinenler şunlardır:\n- Ceren çarşamba günü nöbet tutar.\n- Ahmet, Berk'ten önceki bir günde nöbet tutar.\n- Deniz pazartesi ya da cuma günü nöbet tutar.\n- Elif ile Ceren ardışık günlerde nöbet tutmaz.";

const SINAN =
  "Mimar Sinan, XVI. yüzyılda başkent İstanbul'da ve imparatorluğun dört bir yanında yüzlerce yapıya imza atmıştır. Camiler, medreseler, hamamlar, köprüler ve kervansaraylar onun ustalığını taşır. Sinan, yapılarında taşıyıcı sistemi gizlemek yerine estetiğin bir parçası hâline getirmiş; kubbenin ağırlığını ayaklara ve yarım kubbelere dağıtarak geniş, aydınlık iç mekânlar yaratmıştır. Kendisi Şehzade Camii'ni çıraklık, Süleymaniye Camii'ni kalfalık, Edirne'deki Selimiye Camii'ni ise ustalık eseri olarak nitelendirmiştir. Bugün bu yapıların büyük bölümü hâlâ kullanılmakta ve yüzyıllar boyunca yaşanan depremlere karşın ayakta durmaktadır.";

const KIBRIT =
  "Aşağıda kibrit çöpleriyle yan yana kareler oluşturularak bir örüntünün ilk üç şekli verilmiştir. Her şekilde bir önceki şeklin sağına yeni bir kare eklenmektedir.";

const ZEYTIN =
  "Bir üretici bahçesinden 1500 kg zeytin toplamıştır. Üretici zeytinin bir bölümünü sofralık olarak kilogramı 120 TL'den satmakta, kalanından ise yağ elde ederek litresini 400 TL'den satmaktadır. 5 kg zeytinden 1 litre zeytinyağı elde edilmektedir.";

export const ORTAOGRETIM_SORULARI: SeedSoru[] = [
  // ---- TÜRKÇE (30) ----
  {
    ders: "TURKCE",
    konu: "Sözcükte Anlam",
    soruMetni: "Aşağıdaki cümlelerin hangisinde “tutmak” sözcüğü “kiralamak” anlamında kullanılmıştır?",
    secenekler: [
      "Yağmur başlayınca şemsiyesini sıkıca tuttu.",
      "Tatil için deniz kenarında bir ev tuttuk.",
      "Bu kumaş boyayı pek iyi tutmuyor.",
      "Yolculuk sırasında onu deniz tuttu.",
      "Verdiği sözü her zaman tutar.",
    ],
    dogruCevap: 1,
    aciklama:
      "B'de “ev tutmak” evi kiralamak anlamındadır. A'da “elde bulundurmak”, C'de “boyayı üzerinde barındırmak”, D'de “bulantı vermek”, E'de “yerine getirmek” anlamında kullanılmıştır.",
  },
  {
    ders: "TURKCE",
    konu: "Sözcükte Anlam",
    soruMetni:
      "Yaşlı balıkçı, denizin ne zaman kabaracağını bulutların rengine bakarak ----; yıllarca denizde geçen ömrü ona bu sezgiyi kazandırmıştı.\n\nBu cümlede boş bırakılan yere aşağıdakilerden hangisi getirilmelidir?",
    secenekler: ["kestirirdi", "unuturdu", "gizlerdi", "değiştirirdi", "ertelerdi"],
    dogruCevap: 0,
    aciklama:
      "Cümlede balıkçının deneyimle kazandığı sezgiden söz edildiği için denizin ne zaman kabaracağını önceden tahmin ettiği, yani “kestirdiği” anlatılmaktadır.",
  },
  {
    ders: "TURKCE",
    konu: "Paragraf",
    soruMetni:
      "I. Bu yüzden ilk kez bisiklete binen çocuklara genellikle yardımcı tekerlek takılır.\nII. Bisiklet sürmek, bedenin sürekli küçük dengeleme hareketleri yapmasını gerektirir.\nIII. Yardımcı tekerlekler bu süreçte çocuğun düşmesini önler ama dengeyi onun yerine kurar.\nIV. Bu hareketleri öğrenmek ise başlangıçta oldukça zordur.\nV. Bu nedenle uzmanlar, yardımcı tekerleklerin olabildiğince kısa süre kullanılmasını öneriyor.\n\nBu cümlelerle anlamlı bir paragraf oluşturulduğunda sonuncu cümle hangisi olur?",
    secenekler: ["I", "II", "III", "IV", "V"],
    dogruCevap: 4,
    aciklama:
      "Sıralama II - IV - I - III - V'tir: Genel bilgi (II), bunun zorluğu (IV), “Bu yüzden” yardımcı tekerlek (I), tekerleğin dengeyi çocuğun yerine kurması (III) ve “Bu nedenle” uzmanların önerisi (V). Sonuncu cümle V'tir.",
  },
  {
    ders: "TURKCE",
    konu: "Paragraf",
    soruMetni: "Bir kenti tanımanın en iyi yolu, onu haritadan değil, sokaklarında yürüyerek öğrenmektir. Haritalar size yolların nereye çıktığını gösterir ama bir fırından yayılan ekmek kokusunu, bir avluda oynayan çocukların sesini ya da bir çeşmenin başında sohbet eden yaşlıları göstermez. Kent, kâğıt üzerindeki çizgilerden çok, içinde yaşayan insanların gündelik hayatıyla anlam kazanır.\n\nBu parçada anlatılmak istenen aşağıdakilerden hangisidir?",
    secenekler: ["Haritalar, bir kentte yol bulmayı kolaylaştırır.", "Kentlerdeki eski yapılar korunmalıdır.", "Kent yaşamı, kırsal yaşamdan daha hareketlidir.", "Bir kent, ancak içinde yaşanan gündelik hayat yakından gözlemlenerek tanınabilir.", "Haritalar, kentlerin tarihini öğrenmek için yeterli değildir."],
    dogruCevap: 3,
    aciklama: "Parça, kentin haritadaki çizgilerle değil sokaklarında yaşanan gündelik hayatla tanınabileceğini vurgular. A'daki bilgi parçada geçer ama ana düşünce değildir; B, C ve E'ye değinilmemiştir.",
  },
  {
    ders: "TURKCE",
    konu: "Cümlede Anlam",
    soruMetni: "“Bu yıl da festivale katılamadım.” cümlesinden aşağıdakilerden hangisi kesin olarak çıkarılabilir?",
    secenekler: [
      "Festival her yıl aynı kentte yapılır.",
      "Konuşan kişi festivali sevmez.",
      "Konuşan kişi daha önce de festivale katılamadığı olmuştur.",
      "Festival bu yıl iptal edilmiştir.",
      "Konuşan kişi gelecek yıl festivale katılacaktır.",
    ],
    dogruCevap: 2,
    aciklama:
      "“da” bağlacı, durumun daha önce de yaşandığını gösterir; konuşan kişi geçmişte de festivale katılamamıştır. Diğer yargılar cümleden kesin olarak çıkarılamaz.",
  },
  {
    ders: "TURKCE",
    konu: "Anlatım Bozuklukları",
    soruMetni: "Aşağıdaki cümlelerin hangisinde anlatım bozukluğu vardır?",
    secenekler: [
      "Toplantıya katılan herkes görüşünü açıkça dile getirdi.",
      "Öğrenciler, öğretmenin anlattıklarını dikkatle dinledi.",
      "Bu kitabı okumanızı ve arkadaşlarınıza da önermenizi isterim.",
      "Kardeşim hem okula gidiyor hem de bir kafede çalışıyor.",
      "Sporun sağlığa yararlı olduğunu ve düzenli yapılmalıdır.",
    ],
    dogruCevap: 4,
    aciklama:
      "E'de “sporun sağlığa yararlı olduğunu” ögesinin bağlanacağı bir yüklem (ör. “biliyoruz”) yoktur; “ve” ile bağlanan iki yargının yapısı da uyuşmaz. Doğrusu: “Sporun sağlığa yararlı olduğunu biliyoruz, bu yüzden spor düzenli yapılmalıdır.”",
  },
  {
    ders: "TURKCE",
    konu: "Ses Bilgisi",
    soruMetni:
      "Ağacın dalında bir kuş ötüyor,\nGönlüm bu sesle yeniden doğuyor.\nAkşamın rengi suya düşerken\nSokakta yolumu bekleyen gözler yaşarken\n\nBu dizelerde aşağıdaki ses olaylarından hangisi yoktur?",
    secenekler: ["Ünsüz yumuşaması", "Ünlü düşmesi", "Ünlü daralması", "Kaynaştırma", "Ünsüz benzeşmesi"],
    dogruCevap: 2,
    aciklama:
      "Ağaç → ağacın, renk → rengi (ünsüz yumuşaması); gönül → gönlüm (ünlü düşmesi); bekle-y-en (kaynaştırma); sokak-ta (ünsüz benzeşmesi) vardır. Ünlü daralmasına (ör. bekle-yor → bekliyor) örnek yoktur.",
  },
  {
    ders: "TURKCE",
    konu: "Dil Bilgisi",
    soruMetni: "Aşağıdaki cümlelerin hangisinde ögelerin dizilişi “özne - dolaylı tümleç - nesne - yüklem” biçimindedir?",
    secenekler: [
      "Dün akşam misafirler eve geldi.",
      "Öğretmen sınav kâğıtlarını bize dağıttı.",
      "Kitabı masanın üstüne bıraktım.",
      "Annem bahçeye yeni çiçekler dikti.",
      "Çocuklar parkta saatlerce oynadı.",
    ],
    dogruCevap: 3,
    aciklama:
      "D'de “Annem” özne, “bahçeye” dolaylı tümleç, “yeni çiçekler” belirtisiz nesne, “dikti” yüklemdir. A: zarf tümleci - özne - dolaylı tümleç - yüklem; B: özne - nesne - dolaylı tümleç - yüklem; C: nesne - dolaylı tümleç - yüklem; E: özne - dolaylı tümleç - zarf tümleci - yüklem.",
  },
  {
    ders: "TURKCE",
    konu: "Dil Bilgisi",
    soruMetni: "Aşağıdaki cümlelerin hangisinde birleşik yapılı bir sözcük kullanılmıştır?",
    secenekler: [
      "Bahçedeki ağaçlar meyve vermeye başladı.",
      "Akşam olunca hanımeli kokusu bahçeyi sardı.",
      "Kardeşim bu yıl liseye başladı.",
      "Pencereden içeri serin bir rüzgâr esiyordu.",
      "Kitaplığı baştan sona yeniden düzenledik.",
    ],
    dogruCevap: 1,
    aciklama: "“Hanımeli” (hanım + eli), iki sözcüğün birleşip yeni bir varlığa (bitki) ad olmasıyla oluşmuş birleşik bir sözcüktür. Diğer cümlelerde birleşik yapılı sözcük yoktur.",
  },
  {
    ders: "TURKCE",
    konu: "Dil Bilgisi",
    soruMetni: "Aşağıdaki cümlelerin hangisinde belirtili ad tamlaması özne görevinde kullanılmıştır?",
    secenekler: [
      "Okulun bahçesi çiçeklerle doldu.",
      "Kapının kolunu yavaşça çevirdi.",
      "Evin önünde onu bekliyorduk.",
      "Kitap kapağı yırtılmıştı.",
      "Çocuğun sesini uzaktan duyduk.",
    ],
    dogruCevap: 0,
    aciklama:
      "A'da belirtili ad tamlaması “okulun bahçesi” öznedir. B ve E'de belirtili tamlama nesne, C'de dolaylı tümleç görevindedir; D'deki “kitap kapağı” ise belirtisiz ad tamlamasıdır.",
  },
  {
    ders: "TURKCE",
    konu: "Yazım Kuralları",
    soruMetni: "Aşağıdaki sözcüklerden hangisinin yazımı yanlıştır?",
    secenekler: ["birkaç", "pek çok", "hiçbir", "yalnız", "herkez"],
    dogruCevap: 4,
    aciklama: "Doğru yazım “herkes”tir. “Birkaç” ve “hiçbir” bitişik, “pek çok” ayrı yazılır; “yalnız” da doğru yazılmıştır.",
  },
  {
    ders: "TURKCE",
    konu: "Noktalama İşaretleri",
    soruMetni:
      "Çırak, ustasının yıllar önce söylediği sözleri hâlâ hatırlıyordu ( I ) Usta ona üç şey öğütlemişti ( II ) sabır ( III ) dikkat ve dürüstlük ( IV ) Bu öğütler ( V ) çırağın bütün hayatına yön vermişti.\n\nBu parçada numaralanmış yerlerden hangisine iki nokta (:) getirilmelidir?",
    secenekler: ["I", "II", "III", "IV", "V"],
    dogruCevap: 1,
    aciklama:
      "Kendisinden sonra örnek ya da açıklama verilecek söze iki nokta konur: “üç şey öğütlemişti: sabır, dikkat ve dürüstlük”. I ve IV'e nokta, III'e virgül getirilir; V'e işaret gerekmez.",
  },
  {
    ders: "TURKCE",
    konu: "Paragraf",
    soruMetni:
      "Bir fidanı dikip ertesi gün meyve beklemek ne kadar boşunaysa, bir beceriyi birkaç günde kazanmayı ummak da o kadar boşunadır. Müzik aleti çalmayı, yabancı bir dil konuşmayı ya da resim yapmayı öğrenen herkes, ilk haftalarda ilerlemediği duygusuna kapılır. Oysa bu dönemde atılan küçük adımlar zamanla birikerek büyük bir değişime dönüşür. Vazgeçenler genellikle yeteneksiz olanlar değil, sonucu erken görmek isteyenlerdir.\n\nBu parçada vurgulanmak istenen düşünce aşağıdakilerden hangisidir?",
    secenekler: [
      "Bir beceri kazanmak sabır ve zaman ister.",
      "Müzik aleti çalmak yabancı dil öğrenmekten zordur.",
      "Yeteneği olmayanlar hiçbir beceriyi öğrenemez.",
      "Fidan dikmek sabır gerektiren bir uğraştır.",
      "Yeni bir beceriyi öğrenmek için en uygun dönem çocukluktur.",
    ],
    dogruCevap: 0,
    aciklama:
      "Parça, küçük adımların zamanla birikerek değişim yarattığını ve vazgeçenlerin sonucu erken görmek isteyenler olduğunu söyleyerek beceri kazanmanın sabır gerektirdiğini vurgular. C parçadaki yargının tersidir.",
  },
  {
    ders: "TURKCE",
    konu: "Paragraf",
    soruMetni:
      "(I) Kutup ayıları, kalın yağ tabakaları ve yoğun kürkleri sayesinde dondurucu soğuklarda yaşayabilir. (II) Avlarının büyük bölümünü deniz buzu üzerinde, nefes almak için su yüzüne çıkan foklardan sağlarlar. (III) Ne var ki deniz buzunun her yıl daha erken erimesi, avlanabildikleri süreyi kısaltıyor. (IV) Penguenler ise kutup ayılarından farklı olarak Güney Yarım Küre'de yaşar. (V) Bu durum, pek çok kutup ayısının yaz aylarında aç kalmasına yol açıyor.\n\nBu parçada numaralanmış cümlelerden hangisi düşüncenin akışını bozmaktadır?",
    secenekler: ["I", "II", "III", "IV", "V"],
    dogruCevap: 3,
    aciklama:
      "Parça kutup ayılarının avlanmasını ve buzların erimesinin onları nasıl etkilediğini anlatır. IV. cümle penguenlere geçerek akışı bozar; V. cümledeki “Bu durum” da III. cümleye bağlanır.",
  },
  {
    ders: "TURKCE",
    konu: "Paragraf",
    soruMetni:
      "(I) Kâğıt, bugün kullandığımız biçimiyle ilk kez Çin'de üretilmiştir. (II) Ağaç kabuğu, kenevir ve eski kumaş parçalarının suda ezilip ince bir tabaka hâline getirilmesiyle elde edilen bu malzeme, yazıyı çok daha ucuz ve yaygın kılmıştır. (III) Kâğıt yapım tekniği, VIII. yüzyılda Semerkant üzerinden İslam dünyasına geçmiştir. (IV) Kanımca kâğıt, insanlık tarihinin en önemli buluşlarından biridir. (V) Bugün dijital ekranların yaygınlaşmasına karşın kâğıt, gündelik yaşamdaki yerini korumaktadır.\n\nBu parçadaki numaralanmış cümlelerle ilgili aşağıdakilerden hangisi yanlıştır?",
    secenekler: [
      "I. cümlede bir bilgi aktarılmıştır.",
      "II. cümlede bir malzemenin nasıl elde edildiği anlatılmıştır.",
      "III. cümlede bir tekniğin yayılmasından söz edilmiştir.",
      "IV. cümlede kişisel bir görüş dile getirilmiştir.",
      "V. cümlede kâğıdın gelecekte tamamen ortadan kalkacağı öngörülmüştür.",
    ],
    dogruCevap: 4,
    aciklama: "V. cümlede kâğıdın dijital ekranlara karşın yerini koruduğu belirtilir; ortadan kalkacağına dair bir öngörü yoktur. Diğer seçenekler cümlelerin içeriğiyle örtüşür.",
  },
  {
    ders: "TURKCE",
    konu: "Paragraf",
    soruMetni:
      "Zeytinyağı, Akdeniz mutfağının vazgeçilmez ögesidir. Hasat edilen zeytinler bekletilmeden sıkılırsa yağın kalitesi artar; uzun süre bekleyen zeytinlerden elde edilen yağın asitliği yükselir. Yağ, ışık ve havayla temas ettikçe bozulduğu için koyu renkli şişelerde ve serin yerde saklanmalıdır. Uzmanlar, ağızda hafif acımsı ve yakıcı bir tat bırakmasını iyi bir zeytinyağının işareti olarak görür.\n\nBu parçada zeytinyağıyla ilgili aşağıdakilerden hangisine değinilmemiştir?",
    secenekler: [
      "Nasıl saklanması gerektiğine",
      "Kalitesini etkileyen etkenlere",
      "Tadından kalitesine ilişkin ipucuna",
      "En çok hangi ülkede üretildiğine",
      "Asitliğinin artma nedenine",
    ],
    dogruCevap: 3,
    aciklama: "Parçada saklama koşulları, bekletmenin kaliteye ve asitliğe etkisi ile tadın kaliteye işaret etmesi anlatılır; üretim yapılan ülkelerden söz edilmez.",
  },
  {
    ders: "TURKCE",
    konu: "Paragraf",
    soruMetni:
      "Eskiden köylerde ekmek, haftada bir ya da iki kez yakılan taş fırınlarda topluca pişirilirdi. Komşular sırayla hamurlarını getirir, fırının başında hem ekmeklerinin pişmesini bekler hem de sohbet ederdi. Böylece fırın, yalnızca ekmeğin değil, dostlukların da piştiği bir yere dönüşürdü.\n\nBu parçanın konusu aşağıdakilerden hangisidir?",
    secenekler: [
      "Ekmek yapımının aşamaları",
      "Taş fırınların yapım tekniği",
      "Köylerdeki ortak fırınların toplumsal işlevi",
      "Köy hayatının zorlukları",
      "Ekmeğin beslenmedeki yeri",
    ],
    dogruCevap: 2,
    aciklama: "Parça, ortak fırınların ekmek pişirmenin yanında komşuluk ve dostluk ilişkilerini de güçlendiren bir buluşma yeri olduğunu anlatır.",
  },
  {
    ders: "TURKCE",
    konu: "Paragraf",
    soruMetni:
      "Haritalar, dünyayı olduğu gibi değil, onu çizenin seçtiği yöntemle gösterir. Küre biçimindeki dünyayı düz bir kâğıda aktarmak, bazı bölgelerin olduğundan büyük, bazılarının da olduğundan küçük görünmesine yol açar. Örneğin yaygın olarak kullanılan bazı haritalarda Grönland, kendisinden kat kat büyük olan Afrika kadar geniş görünür. Bu nedenle ----\n\nBu parça, düşüncenin akışına göre aşağıdakilerden hangisiyle tamamlanmalıdır?",
    secenekler: [
      "Grönland'ın gerçekte Afrika'dan büyük olduğu kabul edilmelidir.",
      "bir haritaya bakarken onun dünyanın kusursuz bir kopyası olmadığını unutmamak gerekir.",
      "haritalar artık hiç kullanılmamalıdır.",
      "her ülke kendi haritasını kendisi çizmelidir.",
      "küre biçimli haritalar yasaklanmalıdır.",
    ],
    dogruCevap: 1,
    aciklama: "Parça, düz haritaların alanları bozarak gösterdiğini anlatır; bundan çıkan sonuç, haritaların dünyanın kusursuz bir kopyası olmadığının bilinmesi gerektiğidir. A parçadaki bilgiyle çelişir; C, D ve E aşırı ve ilgisiz yargılardır.",
  },
  {
    ders: "TURKCE",
    konu: "Paragraf",
    soruMetni:
      "(I) Türkiye, dünyada en fazla kiraz üreten ülkedir. (II) Kirazın büyük bölümü Konya, Afyonkarahisar, Manisa, İzmir ve Isparta gibi illerde yetiştirilir. (III) Üretilen kirazın önemli bir kısmı da başta Rusya ve Avrupa ülkeleri olmak üzere pek çok ülkeye ihraç edilir. (IV) Kiraz, sağlık açısından da oldukça değerli bir meyvedir. (V) İçerdiği antioksidanlar ve vitaminler, bağışıklık sisteminin güçlenmesine katkı sağlar.\n\nBu parça iki paragrafa ayrılmak istense ikinci paragraf hangi cümleyle başlar?",
    secenekler: ["I", "II", "III", "IV", "V"],
    dogruCevap: 3,
    aciklama: "I-III. cümleler kirazın üretimi ve ihracatını, IV-V. cümleler ise sağlığa yararlarını anlatır. Konu IV. cümlede değiştiği için ikinci paragraf IV. cümleyle başlar.",
  },
  {
    ders: "TURKCE",
    konu: "Paragraf",
    soruMetni:
      "Kapı çaldığında Ayşe Hanım mutfakta çorbayı karıştırıyordu. Elini önlüğüne silip kapıya koştu. Karşısında yıllardır görmediği kardeşini bulunca bir an ne diyeceğini bilemedi; sonra ona sarılıp ağlamaya başladı.\n\nBu parçada ağırlıklı olarak kullanılan anlatım biçimi aşağıdakilerden hangisidir?",
    secenekler: ["Öyküleme", "Betimleme", "Tartışma", "Açıklama", "Karşılaştırma"],
    dogruCevap: 0,
    aciklama: "Parçada kişi, yer ve zaman unsurlarıyla birbirini izleyen olaylar anlatılmıştır; bu, öyküleyici anlatımdır.",
  },
  {
    ders: "TURKCE",
    konu: "Paragraf",
    soruMetni:
      "Bazı anne babalar, çocuklarının boş zamanını kurslar, etütler ve özel derslerle doldurarak onlara iyilik yaptığını düşünüyor. Oysa oyun oynamaya, sıkılmaya, hayal kurmaya vakit bulamayan çocuk, kendi ilgi alanlarını keşfetme fırsatını da yitiriyor. Her saati önceden planlanmış bir çocukluk, başarılı ama mutsuz yetişkinler yetiştirme tehlikesi taşıyor.\n\nBu parçada yazarın eleştirdiği durum aşağıdakilerden hangisidir?",
    secenekler: [
      "Çocukların ders çalışmayı ihmal etmesi",
      "Okullarda kurs sayısının az olması",
      "Çocukların boş zamanlarının tümüyle planlı etkinliklerle doldurulması",
      "Çocukların çok fazla oyun oynaması",
      "Anne babaların çocuklarıyla hiç ilgilenmemesi",
    ],
    dogruCevap: 2,
    aciklama: "Yazar, boş zamanı kurs ve derslerle doldurulan çocuğun oyun ve hayal kurmaya vakit bulamadığını, bunun mutsuz yetişkinler yetiştirebileceğini söyleyerek bu durumu eleştirir.",
  },
  {
    ders: "TURKCE",
    konu: "Cümlede Anlam",
    soruMetni: "Aşağıdaki cümlelerin hangisinde öznel bir yargı vardır?",
    secenekler: [
      "Ankara, 13 Ekim 1923'te başkent ilan edilmiştir.",
      "Bu romanın en etkileyici bölümü kesinlikle son bölümüdür.",
      "Kitap üç yüz yirmi sayfadan oluşuyor.",
      "Toplantı saat onda başlayacak.",
      "Köprünün yapımı iki yıl sürdü.",
    ],
    dogruCevap: 1,
    aciklama: "B'deki “en etkileyici bölüm” yargısı kişiden kişiye değişir, kanıtlanamaz; bu nedenle özneldir. Diğer cümleler doğruluğu araştırılabilen nesnel yargılardır.",
  },
  {
    ders: "TURKCE",
    konu: "Sözel Mantık",
    grupId: "ort-turkce-nobet",
    soruMetni: `${NOBET}\n\nBuna göre bu nöbet çizelgesi kaç farklı biçimde oluşturulabilir?`,
    secenekler: ["2", "3", "4", "5", "6"],
    dogruCevap: 0,
    aciklama: "Ceren çarşamba nöbet tuttuğundan Elif salı ve perşembe tutamaz; Elif pazartesi ya da cuma tutar. Deniz de pazartesi ya da cuma tuttuğundan bu iki gün Deniz ile Elif'e kalır. Salı ve perşembe Ahmet ile Berk'indir; Ahmet Berk'ten önce olduğundan Ahmet salı, Berk perşembe tutar. Yalnızca Deniz ile Elif yer değiştirebilir ⇒ 2 farklı çizelge.",
  },
  {
    ders: "TURKCE",
    konu: "Paragraf",
    soruMetni:
      "Göç eden kuşların bir bölümü, uzun yolculuklarında hiç durmadan binlerce kilometre uçabilir. Örneğin kıyı çamurçulluğu adlı kuşun Alaska'dan Yeni Zelanda'ya, on bin kilometreyi aşan yolu günlerce hiç konmadan uçtuğu belirlenmiştir. Bu kuşlar yolculuktan önce bol bol beslenerek vücut ağırlıklarını neredeyse ikiye katlar; yol boyunca da depoladıkları yağı enerji olarak kullanır.\n\nBu parçaya göre aşağıdakilerden hangisi söylenemez?",
    secenekler: [
      "Bazı göçmen kuşlar yolculuk boyunca hiç konmadan uçabilir.",
      "Kıyı çamurçulluğu göç sırasında on bin kilometreyi aşan bir yol kat eder.",
      "Bazı kuşlar göçten önce vücutlarında yağ depolar.",
      "Göçmen kuşların tamamı yolculuk boyunca hiç dinlenmeden uçar.",
      "Depolanan yağ, yolculukta enerji kaynağı olarak kullanılır.",
    ],
    dogruCevap: 3,
    aciklama: "Parçada hiç durmadan uçabilenlerin göçmen kuşların “bir bölümü” olduğu söylenir; tamamının dinlenmeden uçtuğu söylenemez.",
  },
  {
    ders: "TURKCE",
    konu: "Paragraf",
    soruMetni:
      "Yeni bir şehre taşındığımızda ilk günlerde her sokak bize aynı görünür; kaybolmamak için telefondaki haritaya sıkı sıkıya bağlanırız. Oysa birkaç hafta sonra fırının köşesini, tabelası eğik dükkânı, önünden geçerken selam verdiğimiz kapıcıyı tanımaya başlarız. İşte o zaman şehir, haritadaki çizgilerden çıkıp bizim için anlamı olan bir yere dönüşür.\n\nBu parçada anlatılmak istenen aşağıdakilerden hangisidir?",
    secenekler: [
      "Büyük şehirlerde kaybolmak kolaydır.",
      "Bir yer, onunla kişisel bağlar kurulduğunda anlam kazanır.",
      "Telefondaki haritalar güvenilir değildir.",
      "Yeni bir şehre alışmak imkânsızdır.",
      "Mahalle esnafı şehrin en önemli parçasıdır.",
    ],
    dogruCevap: 1,
    aciklama: "Parça, şehrin tanıdık mekânlar ve insanlarla kurulan bağlar sayesinde kişi için anlamlı bir yere dönüştüğünü anlatır.",
  },
  {
    ders: "TURKCE",
    konu: "Paragraf",
    grupId: "ort-turkce-sinan",
    soruMetni: `${SINAN}\n\nBu parçaya göre Mimar Sinan'ın ustalık eseri olarak nitelendirdiği yapı aşağıdakilerden hangisidir?`,
    secenekler: ["Şehzade Camii", "Süleymaniye Camii", "Selimiye Camii", "Sultanahmet Camii", "Mihrimah Sultan Camii"],
    dogruCevap: 2,
    aciklama: "Parçada Sinan'ın Şehzade Camii'ni çıraklık, Süleymaniye Camii'ni kalfalık, Edirne'deki Selimiye Camii'ni ise ustalık eseri olarak nitelendirdiği belirtilmiştir.",
  },
  {
    ders: "TURKCE",
    konu: "Paragraf",
    grupId: "ort-turkce-sinan",
    soruMetni: `${SINAN}\n\nBu parçada aşağıdakilerden hangisine değinilmemiştir?`,
    secenekler: [
      "Sinan'ın yaptığı yapı türlerine",
      "Kubbenin ağırlığını nasıl dağıttığına",
      "Yapılarının depremlere dayanıklılığına",
      "Sinan'ın kendi eserlerini nasıl değerlendirdiğine",
      "Sinan'ın mimarlığı nerede ve kimden öğrendiğine",
    ],
    dogruCevap: 4,
    aciklama: "Parçada yapı türleri, kubbe ağırlığının dağıtılması, yapıların depremlere karşın ayakta durması ve Sinan'ın eserlerini çıraklık-kalfalık-ustalık diye nitelemesi anlatılır; eğitiminden söz edilmez.",
  },
  {
    ders: "TURKCE",
    konu: "Sözel Mantık",
    grupId: "ort-turkce-nobet",
    soruMetni: `${NOBET}\n\nBuna göre aşağıdakilerden hangisi kesinlikle doğrudur?`,
    secenekler: [
      "Ahmet salı günü nöbet tutar.",
      "Deniz pazartesi günü nöbet tutar.",
      "Elif cuma günü nöbet tutar.",
      "Berk cuma günü nöbet tutar.",
      "Elif pazartesi günü nöbet tutar.",
    ],
    dogruCevap: 0,
    aciklama:
      "Elif, Ceren'le (çarşamba) ardışık olamayacağı için salı ve perşembe tutamaz; Elif ve Deniz pazartesi ile cumayı paylaşır. Kalan salı ve perşembede Ahmet, Berk'ten önce olacağından Ahmet salı, Berk perşembe nöbet tutar. Deniz ile Elif'in günleri kesin değildir.",
  },
  {
    ders: "TURKCE",
    konu: "Sözel Mantık",
    grupId: "ort-turkce-nobet",
    soruMetni: `${NOBET}\n\nDeniz cuma günü nöbet tutarsa pazartesi günü kim nöbet tutar?`,
    secenekler: ["Ahmet", "Berk", "Ceren", "Deniz", "Elif"],
    dogruCevap: 4,
    aciklama: "Olası iki çizelge Deniz-Ahmet-Ceren-Berk-Elif ve Elif-Ahmet-Ceren-Berk-Deniz'dir. Deniz cuma nöbet tutuyorsa pazartesi Elif nöbet tutar.",
  },
  {
    ders: "TURKCE",
    konu: "Sözel Mantık",
    grupId: "ort-turkce-nobet",
    soruMetni: `${NOBET}\n\nBuna göre Elif'in nöbet tutabileceği günler aşağıdakilerin hangisinde birlikte verilmiştir?`,
    secenekler: ["Yalnız pazartesi", "Yalnız cuma", "Pazartesi ve cuma", "Salı ve perşembe", "Pazartesi, salı ve cuma"],
    dogruCevap: 2,
    aciklama: "Elif, Ceren'in nöbet tuttuğu çarşambanın komşusu olan salı ve perşembe günleri nöbet tutamaz. Salı ve perşembe Ahmet ile Berk'e kaldığından Elif pazartesi ya da cuma nöbet tutabilir.",
  },

  // ---- MATEMATİK (30) ----
  {
    ders: "MATEMATIK",
    konu: "Rasyonel Sayılar",
    soruMetni: "{1/2 + 1/3|1/2 − 1/3}\n\nişleminin sonucu kaçtır?",
    secenekler: ["3", "5", "6", "7", "9"],
    dogruCevap: 1,
    aciklama: "Pay: 1/2 + 1/3 = 5/6. Payda: 1/2 − 1/3 = 1/6. Sonuç {5/6|1/6} = 5.",
  },
  {
    ders: "MATEMATIK",
    konu: "Rasyonel Sayılar",
    soruMetni: "{0,6 · 0,5|0,03}\n\nişleminin sonucu kaçtır?",
    secenekler: ["0,1", "1", "5", "10", "100"],
    dogruCevap: 3,
    aciklama: "0,6 · 0,5 = 0,3 ve 0,3/0,03 = 10.",
  },
  {
    ders: "MATEMATIK",
    konu: "Köklü Sayılar",
    soruMetni: "√48 − √27 + √12\n\nişleminin sonucu kaçtır?",
    secenekler: ["3√3", "2√3", "4√3", "5√3", "9√3"],
    dogruCevap: 0,
    aciklama: "√48 = 4√3, √27 = 3√3, √12 = 2√3 olduğundan sonuç 4√3 − 3√3 + 2√3 = 3√3.",
  },
  {
    ders: "MATEMATIK",
    konu: "Üslü Sayılar",
    soruMetni: "4ˣ = 8ˣ⁻¹ olduğuna göre x kaçtır?",
    secenekler: ["1", "2", "3", "4", "6"],
    dogruCevap: 2,
    aciklama: "4ˣ = 2²ˣ ve 8ˣ⁻¹ = 2³ˣ⁻³ olduğundan 2x = 3x − 3 ⇒ x = 3.",
  },
  {
    ders: "MATEMATIK",
    konu: "Matematiksel İlişkilerden Yararlanma",
    soruMetni: "−2 < x ≤ 4 eşitsizliğini sağlayan x tam sayılarının toplamı kaçtır?",
    secenekler: ["5", "6", "7", "8", "9"],
    dogruCevap: 4,
    aciklama: "x tam sayıları −1, 0, 1, 2, 3 ve 4'tür (−2 dahil değil, 4 dahil). Toplamları 9.",
  },
  {
    ders: "MATEMATIK",
    konu: "Matematiksel İlişkilerden Yararlanma",
    soruMetni: "|2x − 1| = 5 denkleminin çözüm kümesi aşağıdakilerden hangisidir?",
    secenekler: ["{−3, 2}", "{−2, 3}", "{2, 3}", "{−2}", "{3}"],
    dogruCevap: 1,
    aciklama: "2x − 1 = 5 ⇒ x = 3 ya da 2x − 1 = −5 ⇒ x = −2. Çözüm kümesi {−2, 3}.",
  },
  {
    ders: "MATEMATIK",
    konu: "Sayısal Mantık",
    soruMetni: "Bir duvar saati her saat başında akrebin gösterdiği sayı kadar, her buçukta ise bir kez çalmaktadır.\n\nBuna göre bu saat, 10.15 ile 13.45 arasında toplam kaç kez çalar?",
    secenekler: ["28", "29", "30", "31", "32"],
    dogruCevap: 0,
    aciklama: "Saat başları: 11.00'de 11, 12.00'de 12, 13.00'te akrep 1'i gösterdiğinden 1 kez ⇒ 24. Buçuklar: 10.30, 11.30, 12.30, 13.30 ⇒ 4. Toplam 24 + 4 = 28.",
  },
  {
    ders: "MATEMATIK",
    konu: "Matematiksel İlişkilerden Yararlanma",
    soruMetni: "n bir doğal sayı olmak üzere\n\n{(n + 1)!|(n − 1)!} = 56\n\nolduğuna göre n kaçtır?",
    secenekler: ["4", "5", "6", "7", "8"],
    dogruCevap: 3,
    aciklama: "{(n + 1)!|(n − 1)!} = (n + 1) · n = 56 = 8 · 7 ⇒ n = 7.",
  },
  {
    ders: "MATEMATIK",
    konu: "Matematiksel İlişkilerden Yararlanma",
    soruMetni:
      "30 kişilik bir sınıfta futbol oynayan 18, basketbol oynayan 14 öğrenci vardır. Bu sporlardan hiçbirini oynamayan 5 öğrenci bulunmaktadır.\n\nBuna göre her iki sporu da oynayan kaç öğrenci vardır?",
    secenekler: ["5", "6", "7", "8", "9"],
    dogruCevap: 2,
    aciklama: "En az bir spor oynayan 30 − 5 = 25 öğrencidir. 18 + 14 − x = 25 ⇒ x = 7.",
  },
  {
    ders: "MATEMATIK",
    konu: "Temel Kavramlar",
    soruMetni: "7²³ sayısının birler basamağındaki rakam kaçtır?",
    secenekler: ["1", "3", "5", "7", "9"],
    dogruCevap: 1,
    aciklama: "7'nin kuvvetlerinin birler basamağı 7, 9, 3, 1 biçiminde dörder dörder tekrar eder. 23'ün 4'e bölümünden kalan 3 olduğundan birler basamağı, dizideki üçüncü rakam olan 3'tür.",
  },
  {
    ders: "MATEMATIK",
    konu: "Problemler",
    soruMetni:
      "Boyu 20 cm olan bir mum 4 saatte, boyu 15 cm olan başka bir mum ise 5 saatte tamamen eriyor. Mumlar sabit hızla eriyor ve aynı anda yakılıyor.\n\nBuna göre kaç saat sonra mumların boyları eşit olur?",
    secenekler: ["1", "1,5", "2", "2,5", "3"],
    dogruCevap: 3,
    aciklama: "Birinci mum saatte 5 cm, ikinci mum saatte 3 cm kısalır. 20 − 5t = 15 − 3t ⇒ t = 2,5 saat. Bu anda iki mumun boyu da 7,5 cm'dir.",
  },
  {
    ders: "MATEMATIK",
    konu: "Tablo ve Grafik",
    soruMetni: "Bir fidanlıkta 2020-2024 yılları arasında her yıl dikilen fidan sayıları aşağıdaki grafikte bin adet cinsinden verilmiştir.\n\nBuna göre bu beş yılda yılda ortalama kaç bin fidan dikilmiştir?",
    gorselSvg: sutunGrafigi(["2020", "2021", "2022", "2023", "2024"], [12, 15, 9, 18, 24], 27, 3, "Dikilen fidan sayısı (bin adet)"),
    secenekler: ["15,6", "16", "16,4", "17", "17,2"],
    dogruCevap: 0,
    aciklama: "Grafikten değerler 12, 15, 9, 18 ve 24 bin okunur. Toplam 78 bin ⇒ ortalama 78 / 5 = 15,6 bin fidan.",
  },
  {
    ders: "MATEMATIK",
    konu: "Tablo ve Grafik",
    soruMetni: "Bir lisenin sınıf düzeylerine göre kız ve erkek öğrenci sayıları aşağıdaki tabloda verilmiştir.\n\nBuna göre kız öğrenci sayısının erkek öğrenci sayısından fazla olduğu sınıf düzeylerindeki toplam öğrenci sayısı, okuldaki tüm öğrencilerin yüzde kaçıdır?",
    gorselSvg: '<svg viewBox="0 0 360 170" xmlns="http://www.w3.org/2000/svg" font-family="Arial, sans-serif" fill="#1e293b"><rect x="20" y="10" width="120" height="30" fill="#dbeafe" stroke="#1e293b" stroke-width="1"/><text x="80" y="30" font-size="13" text-anchor="middle" font-weight="700">Sınıf</text><rect x="140" y="10" width="100" height="30" fill="#dbeafe" stroke="#1e293b" stroke-width="1"/><text x="190" y="30" font-size="13" text-anchor="middle" font-weight="700">Kız</text><rect x="240" y="10" width="100" height="30" fill="#dbeafe" stroke="#1e293b" stroke-width="1"/><text x="290" y="30" font-size="13" text-anchor="middle" font-weight="700">Erkek</text><rect x="20" y="40" width="120" height="30" fill="#fff" stroke="#1e293b" stroke-width="1"/><text x="80" y="60" font-size="13" text-anchor="middle">9</text><rect x="140" y="40" width="100" height="30" fill="#fff" stroke="#1e293b" stroke-width="1"/><text x="190" y="60" font-size="13" text-anchor="middle">70</text><rect x="240" y="40" width="100" height="30" fill="#fff" stroke="#1e293b" stroke-width="1"/><text x="290" y="60" font-size="13" text-anchor="middle">60</text><rect x="20" y="70" width="120" height="30" fill="#fff" stroke="#1e293b" stroke-width="1"/><text x="80" y="90" font-size="13" text-anchor="middle">10</text><rect x="140" y="70" width="100" height="30" fill="#fff" stroke="#1e293b" stroke-width="1"/><text x="190" y="90" font-size="13" text-anchor="middle">50</text><rect x="240" y="70" width="100" height="30" fill="#fff" stroke="#1e293b" stroke-width="1"/><text x="290" y="90" font-size="13" text-anchor="middle">55</text><rect x="20" y="100" width="120" height="30" fill="#fff" stroke="#1e293b" stroke-width="1"/><text x="80" y="120" font-size="13" text-anchor="middle">11</text><rect x="140" y="100" width="100" height="30" fill="#fff" stroke="#1e293b" stroke-width="1"/><text x="190" y="120" font-size="13" text-anchor="middle">45</text><rect x="240" y="100" width="100" height="30" fill="#fff" stroke="#1e293b" stroke-width="1"/><text x="290" y="120" font-size="13" text-anchor="middle">45</text><rect x="20" y="130" width="120" height="30" fill="#fff" stroke="#1e293b" stroke-width="1"/><text x="80" y="150" font-size="13" text-anchor="middle">12</text><rect x="140" y="130" width="100" height="30" fill="#fff" stroke="#1e293b" stroke-width="1"/><text x="190" y="150" font-size="13" text-anchor="middle">35</text><rect x="240" y="130" width="100" height="30" fill="#fff" stroke="#1e293b" stroke-width="1"/><text x="290" y="150" font-size="13" text-anchor="middle">40</text></svg>',
    secenekler: ["25", "27,5", "30", "31,25", "32,5"],
    dogruCevap: 4,
    aciklama: "Okuldaki toplam öğrenci: kız 200 + erkek 200 = 400. Kız sayısının erkekten fazla olduğu tek düzey 9. sınıftır (70 > 60); 11. sınıfta sayılar eşittir. 9. sınıf 130 öğrencidir ⇒ 130 / 400 = %32,5.",
  },
  {
    ders: "MATEMATIK",
    konu: "Problemler",
    soruMetni: "Ali'nin parası Veli'nin parasının 3 katıdır. Ali, Veli'ye 40 TL verirse paraları eşit oluyor.\n\nBuna göre Ali'nin başlangıçta kaç TL'si vardır?",
    secenekler: ["40", "60", "80", "100", "120"],
    dogruCevap: 4,
    aciklama: "Veli'nin parası v olsun. 3v − 40 = v + 40 ⇒ v = 40. Ali'nin parası 3 · 40 = 120 TL.",
  },
  {
    ders: "MATEMATIK",
    konu: "Problemler",
    soruMetni:
      "Bir manav, sabah domatesinin 1/3'ünü, öğleden sonra ise kalan domatesin 1/4'ünü satıyor. Akşam manavda 30 kg domates kalıyor.\n\nBuna göre manavın başlangıçta kaç kg domatesi vardır?",
    secenekler: ["40", "50", "60", "72", "90"],
    dogruCevap: 2,
    aciklama: "Sabah satıştan sonra 2/3'ü, öğleden sonra kalanın 3/4'ü kalır: x · 2/3 · 3/4 = x/2 = 30 ⇒ x = 60 kg.",
  },
  {
    ders: "MATEMATIK",
    konu: "Problemler",
    soruMetni:
      "Bir annenin bugünkü yaşı, iki çocuğunun yaşları toplamının 3 katıdır. 6 yıl sonra annenin yaşı, çocuklarının o zamanki yaşları toplamının 2 katı olacaktır.\n\nBuna göre annenin bugünkü yaşı kaçtır?",
    secenekler: ["54", "48", "45", "42", "36"],
    dogruCevap: 0,
    aciklama: "Çocukların yaşları toplamı s olsun. 6 yıl sonra anne 3s + 6, çocuklar toplamı s + 12 olur (iki çocuk). 3s + 6 = 2(s + 12) ⇒ s = 18. Annenin yaşı 54.",
  },
  {
    ders: "MATEMATIK",
    konu: "Tablo ve Grafik",
    soruMetni: "Bir aracın hızının zamana göre değişimi aşağıdaki grafikte verilmiştir.\n\nBuna göre araç 5 saatte toplam kaç km yol almıştır?",
    gorselSvg: HIZ_GRAFIGI,
    secenekler: ["240", "260", "280", "300", "320"],
    dogruCevap: 3,
    aciklama: "Alınan yol = hız · zaman: ilk 2 saatte 60 · 2 = 120 km, sonraki 1 saatte 90 · 1 = 90 km, son 2 saatte 45 · 2 = 90 km. Toplam 300 km.",
  },
  {
    ders: "MATEMATIK",
    konu: "Problemler",
    soruMetni:
      "Bir kırtasiyeci tanesini 40 TL'den aldığı 50 kalemin 30'unu %25 kârla, kalanını ise %10 zararla satıyor.\n\nBuna göre kırtasiyecinin bu satıştaki kâr ya da zararı aşağıdakilerden hangisidir?",
    secenekler: ["180 TL kâr", "220 TL kâr", "250 TL kâr", "220 TL zarar", "180 TL zarar"],
    dogruCevap: 1,
    aciklama: "Maliyet 50 · 40 = 2000 TL. Satış: 30 · 50 = 1500 TL ve 20 · 36 = 720 TL, toplam 2220 TL. Kâr 2220 − 2000 = 220 TL.",
  },
  {
    ders: "MATEMATIK",
    konu: "Matematiksel İlişkilerden Yararlanma",
    soruMetni:
      "5 kişilik bir ailede yalnızca anne ile babanın ehliyeti vardır. Aile, 5 koltuklu otomobillerine sürücü koltuğunda ehliyeti olan biri oturacak biçimde yerleşecektir.\n\nBuna göre aile otomobile kaç farklı biçimde oturabilir?",
    secenekler: ["12", "24", "36", "42", "48"],
    dogruCevap: 4,
    aciklama: "Sürücü koltuğuna ehliyetli 2 kişiden biri 2 farklı biçimde oturur. Kalan 4 kişi diğer 4 koltuğa 4! = 24 farklı biçimde oturur. Toplam 2 · 24 = 48.",
  },
  {
    ders: "MATEMATIK",
    konu: "Temel Kavramlar",
    soruMetni: "Bir duraktan A otobüsü 12 dakikada bir, B otobüsü 18 dakikada bir kalkmaktadır. İki otobüs saat 08.00'de bu duraktan birlikte kalkmıştır.\n\nBuna göre iki otobüs bu duraktan ilk kez saat kaçta yeniden birlikte kalkar?",
    secenekler: ["08.18", "08.30", "08.36", "08.54", "09.12"],
    dogruCevap: 2,
    aciklama: "Birlikte kalkış aralığı EKOK(12, 18) = 36 dakikadır. Otobüsler 08.36'da yeniden birlikte kalkar.",
  },
  {
    ders: "MATEMATIK",
    konu: "Matematiksel İlişkilerden Yararlanma",
    soruMetni: "Bir torbada 3 kırmızı, 5 beyaz ve 2 mavi bilye vardır.\n\nTorbadan rastgele çekilen bir bilyenin mavi olmama olasılığı kaçtır?",
    secenekler: ["4/5", "3/5", "1/2", "3/10", "1/5"],
    dogruCevap: 0,
    aciklama: "Toplam 10 bilyeden 8'i mavi değildir. Olasılık 8/10 = 4/5.",
  },
  {
    ders: "MATEMATIK",
    konu: "Sayısal Mantık",
    soruMetni: "Gerçek sayılar kümesinde ∗ işlemi a ∗ b = a · b − a + b biçiminde tanımlanıyor.\n\nBuna göre (2 ∗ 3) ∗ 1 işleminin sonucu kaçtır?",
    secenekler: ["−2", "−1", "0", "1", "2"],
    dogruCevap: 3,
    aciklama: "2 ∗ 3 = 6 − 2 + 3 = 7. 7 ∗ 1 = 7 − 7 + 1 = 1.",
  },
  {
    ders: "MATEMATIK",
    konu: "Sayısal Mantık",
    grupId: "ort-mat-kibrit",
    soruMetni: `${KIBRIT}\n\nBuna göre bu örüntünün 10. şeklinde kaç kibrit çöpü kullanılır?`,
    gorselSvg: KIBRIT_GORSELI,
    secenekler: ["27", "28", "29", "30", "31"],
    dogruCevap: 4,
    aciklama: "1. şekilde 4, 2. şekilde 7, 3. şekilde 10 çöp vardır; her yeni kare 3 çöp ekler. n. şekilde 3n + 1 çöp kullanılır: 3 · 10 + 1 = 31.",
  },
  {
    ders: "MATEMATIK",
    konu: "Sayısal Mantık",
    grupId: "ort-mat-kibrit",
    soruMetni: `${KIBRIT}\n\nElinde 64 kibrit çöpü olan biri bu örüntüye uygun olarak en fazla kaçıncı şekli oluşturabilir?`,
    gorselSvg: KIBRIT_GORSELI,
    secenekler: ["20", "21", "22", "23", "24"],
    dogruCevap: 1,
    aciklama: "n. şekil için 3n + 1 çöp gerekir. 3n + 1 ≤ 64 ⇒ n ≤ 21. 21. şekil için 64 çöp gerekir; en fazla 21. şekil oluşturulabilir.",
  },
  {
    ders: "MATEMATIK",
    konu: "Problemler",
    grupId: "ort-mat-zeytin",
    soruMetni: `${ZEYTIN}\n\nÜretici zeytinin 900 kg'ını yağ yapımına ayırırsa kaç litre zeytinyağı elde eder?`,
    secenekler: ["120", "150", "180", "200", "225"],
    dogruCevap: 2,
    aciklama: "5 kg zeytinden 1 litre yağ elde edildiğinden 900 kg zeytinden 900/5 = 180 litre yağ elde edilir.",
  },
  {
    ders: "MATEMATIK",
    konu: "Problemler",
    grupId: "ort-mat-zeytin",
    soruMetni: `${ZEYTIN}\n\nZeytinin tamamını sofralık olarak satmak, tamamından yağ elde edip satmaya göre kaç TL daha fazla gelir sağlar?`,
    secenekler: ["60.000", "40.000", "30.000", "20.000", "10.000"],
    dogruCevap: 0,
    aciklama: "Tamamı sofralık: 1500 · 120 = 180.000 TL. Tamamı yağ: 1500/5 = 300 litre, 300 · 400 = 120.000 TL. Fark 60.000 TL.",
  },
  {
    ders: "MATEMATIK",
    konu: "Problemler",
    grupId: "ort-mat-zeytin",
    soruMetni: `${ZEYTIN}\n\nÜretici zeytinin bir bölümünü sofralık olarak satıp kalanından yağ elde ederek toplam 162.000 TL gelir elde ettiğine göre sofralık olarak satılan zeytin kaç kg'dır?`,
    secenekler: ["750", "850", "900", "1050", "1200"],
    dogruCevap: 3,
    aciklama:
      "Sofralık zeytin s kg olsun. Gelir 120s + {1500 − s|5} · 400 = 120s + 80(1500 − s) = 120.000 + 40s = 162.000 ⇒ s = 1050 kg.",
  },
  // -- Geometri (3, gorselli) --
  {
    ders: "MATEMATIK",
    konu: "Temel Geometri",
    geometri: true,
    soruMetni: "Şekilde d₁ ∥ d₂'dir.\n\nBuna göre x kaç derecedir?",
    gorselSvg:
      '<svg viewBox="0 0 360 270" xmlns="http://www.w3.org/2000/svg" font-family="Arial, sans-serif" fill="#1e293b"><line x1="30" y1="80" x2="330" y2="80" stroke="#1e293b" stroke-width="2.5"/><line x1="30" y1="200" x2="330" y2="200" stroke="#1e293b" stroke-width="2.5"/><line x1="100" y1="250" x2="260" y2="30" stroke="#1e293b" stroke-width="2.5"/><text x="336" y="85" font-size="15">d₁</text><text x="336" y="205" font-size="15">d₂</text><path d="M 290,74 l 8,6 l -8,6" fill="none" stroke="#1e293b" stroke-width="2"/><path d="M 290,194 l 8,6 l -8,6" fill="none" stroke="#1e293b" stroke-width="2"/><path d="M 199.6,80 A 24,24 0 0,0 209.5,99.4" fill="none" stroke="#dc2626" stroke-width="1.8"/><path d="M 160.4,200 A 24,24 0 0,0 150.5,180.6" fill="none" stroke="#dc2626" stroke-width="1.8"/><text x="138" y="108" font-size="14" fill="#dc2626">3x + 10°</text><text x="166" y="188" font-size="14" fill="#dc2626">2x + 40°</text></svg>',
    secenekler: ["10", "15", "20", "25", "30"],
    dogruCevap: 4,
    aciklama: "Paralel iki doğruyu kesen doğrunun oluşturduğu iç ters açılar eşittir: 3x + 10 = 2x + 40 ⇒ x = 30°.",
  },
  {
    ders: "MATEMATIK",
    konu: "Temel Geometri",
    geometri: true,
    soruMetni:
      "Şekildeki taralı bölge, ABCD dikdörtgeni ile [AB] çaplı yarım daireden oluşmaktadır. |AB| = 8 cm ve |BC| = 5 cm'dir.\n\nBuna göre taralı bölgenin alanı kaç cm²'dir? (π = 3 alınız.)",
    gorselSvg:
      '<svg viewBox="0 70 320 260" xmlns="http://www.w3.org/2000/svg" font-family="Arial, sans-serif" fill="#1e293b"><path d="M60,95 L260,95 L260,220 A100,100 0 0,1 60,220 Z" fill="#dbeafe" stroke="#1e293b" stroke-width="2.5"/><line x1="60" y1="220" x2="260" y2="220" stroke="#1e293b" stroke-width="1.5" stroke-dasharray="6 4"/><text x="44" y="90" font-size="15">D</text><text x="264" y="90" font-size="15">C</text><text x="40" y="226" font-size="15">A</text><text x="266" y="226" font-size="15">B</text><text x="156" y="212" font-size="13" fill="#dc2626">8</text><text x="268" y="162" font-size="13" fill="#dc2626">5</text></svg>',
    secenekler: ["58", "64", "70", "76", "88"],
    dogruCevap: 1,
    aciklama: "Dikdörtgenin alanı 8 · 5 = 40 cm². Yarım dairenin yarıçapı 4 cm, alanı {π · 4²|2} = {3 · 16|2} = 24 cm². Toplam 40 + 24 = 64 cm².",
  },
  {
    ders: "MATEMATIK",
    konu: "Temel Geometri",
    geometri: true,
    soruMetni:
      "Taban yarıçapı 3 cm ve yüksekliği 10 cm olan dik dairesel silindir biçimindeki bir bardak, yüksekliğinin 2/3'üne kadar suyla doludur.\n\nBuna göre bardaktaki suyun hacmi kaç cm³'tür? (π = 3 alınız.)",
    gorselSvg:
      '<svg viewBox="0 0 320 290" xmlns="http://www.w3.org/2000/svg" font-family="Arial, sans-serif" fill="#1e293b"><path d="M90,117 L90,250 A70,18 0 0,0 230,250 L230,117 Z" fill="#7dd3fc"/><ellipse cx="160" cy="117" rx="70" ry="18" fill="#bae6fd" stroke="#0284c7" stroke-width="1.2"/><ellipse cx="160" cy="50" rx="70" ry="18" fill="none" stroke="#1e293b" stroke-width="2"/><line x1="90" y1="50" x2="90" y2="250" stroke="#1e293b" stroke-width="2"/><line x1="230" y1="50" x2="230" y2="250" stroke="#1e293b" stroke-width="2"/><path d="M90,250 A70,18 0 0,0 230,250" fill="none" stroke="#1e293b" stroke-width="2"/><path d="M90,250 A70,18 0 0,1 230,250" fill="none" stroke="#1e293b" stroke-width="1.2" stroke-dasharray="5 4"/><line x1="160" y1="50" x2="230" y2="50" stroke="#dc2626" stroke-width="1.5"/><circle cx="160" cy="50" r="2.5" fill="#1e293b"/><text x="188" y="44" font-size="13" fill="#dc2626">3</text><line x1="252" y1="50" x2="252" y2="250" stroke="#dc2626" stroke-width="1.2"/><text x="258" y="155" font-size="13" fill="#dc2626">10</text></svg>',
    secenekler: ["120", "150", "180", "210", "270"],
    dogruCevap: 2,
    aciklama: "Bardağın hacmi π · r² · h = 3 · 9 · 10 = 270 cm³. Suyun hacmi bunun 2/3'ü: 270 · 2/3 = 180 cm³.",
  },

  // ---- TARİH (27) ----
  {
    ders: "TARIH",
    konu: "İlk Türk Devletleri",
    soruMetni:
      "İslamiyet öncesi Türk devletlerinde kurultay kararları ve toplumun gelenek, görenek ve ahlak kurallarından oluşan; hükümdar dâhil herkesin uymak zorunda olduğu yazısız hukuk kurallarına ne ad verilir?",
    secenekler: ["Kut", "Yasa", "Töre", "Ülüş", "Yarlığ"],
    dogruCevap: 2,
    aciklama:
      "Bu kurallar töredir. Kut hükümdarlık yetkisinin Tanrı tarafından verildiği inancı, Yasa Cengiz Han'ın kanunları, ülüş ülkenin hanedan üyeleri arasında paylaştırılması, yarlığ ise hükümdarın yazılı buyruğudur.",
  },
  {
    ders: "TARIH",
    konu: "Osmanlı Devleti",
    soruMetni: "Osmanlı Devleti'nde Lale Devri'nde (1718-1730) gerçekleştirilen yeniliklerden biri aşağıdakilerden hangisidir?",
    secenekler: ["İlk Türk matbaasının kurulması", "Nizam-ı Cedid ordusunun kurulması", "Tanzimat Fermanı'nın ilan edilmesi", "Mekteb-i Harbiye'nin açılması", "Kanun-ı Esasi'nin ilan edilmesi"],
    dogruCevap: 0,
    aciklama: "İlk Türk matbaası, Lale Devri'nde İbrahim Müteferrika ve Said Mehmet Çelebi tarafından kurulmuştur (1727). Nizam-ı Cedid III. Selim, Mekteb-i Harbiye II. Mahmud, Tanzimat Fermanı Abdülmecid, Kanun-ı Esasi II. Abdülhamid dönemine aittir.",
  },
  {
    ders: "TARIH",
    konu: "Atatürk İlke ve İnkılapları",
    soruMetni: "Aşağıdakilerden hangisi toplumsal hayatın düzenlenmesine yönelik inkılaplardan biri değildir?",
    secenekler: ["Şapka Kanunu'nun kabulü", "Soyadı Kanunu'nun kabulü", "Tekke ve zaviyelerin kapatılması", "Takvim, saat ve ölçülerde yapılan değişiklikler", "Saltanatın kaldırılması"],
    dogruCevap: 4,
    aciklama: "Saltanatın kaldırılması (1 Kasım 1922), siyasi alanda yapılan bir inkılaptır. Diğer seçeneklerdeki düzenlemeler toplumsal hayatın çağdaşlaştırılmasına yöneliktir.",
  },
  {
    ders: "TARIH",
    konu: "Türk-İslam Devletleri",
    soruMetni: "Satuk Buğra Han döneminde İslamiyet'i kabul ederek bu dini resmî din hâline getiren ilk Türk devleti aşağıdakilerden hangisidir?",
    secenekler: ["Gazneliler", "Karahanlılar", "Büyük Selçuklular", "Tolunoğulları", "İhşidiler"],
    dogruCevap: 1,
    aciklama: "Karahanlılar, Satuk Buğra Han'ın Müslüman olmasının ardından İslamiyet'i resmî din olarak kabul eden ilk Türk devletidir.",
  },
  {
    ders: "TARIH",
    konu: "Türk-İslam Devletleri",
    soruMetni:
      "Alp Arslan ve Melikşah dönemlerinde Büyük Selçuklu Devleti'nin veziri olan; Nizamiye medreselerini kuran ve devlet yönetimine ilişkin görüşlerini Siyasetname adlı eserinde toplayan devlet adamı aşağıdakilerden hangisidir?",
    secenekler: ["Kaşgarlı Mahmut", "Yusuf Has Hacip", "Ahmet Yesevi", "Nizamülmülk", "Edip Ahmet Yükneki"],
    dogruCevap: 3,
    aciklama: "Nizamiye medreseleri ve Siyasetname, Büyük Selçuklu veziri Nizamülmülk'e aittir.",
  },
  {
    ders: "TARIH",
    konu: "Atatürk İlke ve İnkılapları",
    soruMetni: "Devletin, özel girişimin yetersiz kaldığı alanlarda ekonomik hayatı düzenlemesini ve gerektiğinde doğrudan yatırımcı olmasını öngören Atatürk ilkesi aşağıdakilerden hangisidir?",
    secenekler: ["Cumhuriyetçilik", "Devletçilik", "Laiklik", "Milliyetçilik", "İnkılapçılık"],
    dogruCevap: 1,
    aciklama: "Devletçilik ilkesi, özel teşebbüsün yetersiz kaldığı alanlarda devletin ekonomiye müdahalesini ve yatırım yapmasını öngörür. I. Beş Yıllık Sanayi Planı (1934) bu ilkenin uygulamasıdır.",
  },
  {
    ders: "TARIH",
    konu: "Atatürk İlke ve İnkılapları",
    soruMetni: "Türk Tarih Kurumu (1931) ve Türk Dil Kurumunun (1932) kurulması, en çok aşağıdaki Atatürk ilkelerinden hangisiyle ilişkilidir?",
    secenekler: ["Devletçilik", "Halkçılık", "Laiklik", "Milliyetçilik", "Cumhuriyetçilik"],
    dogruCevap: 3,
    aciklama: "Türk tarihini ve Türk dilini bilimsel yöntemlerle araştırıp millî bilinci güçlendirmeyi amaçlayan bu kurumlar, milliyetçilik ilkesiyle doğrudan ilişkilidir.",
  },
  {
    ders: "TARIH",
    konu: "Osmanlı Devleti",
    soruMetni:
      "Döneminde İznik'te ilk Osmanlı medresesi açılan, “yaya ve müsellem” adıyla ilk düzenli ordu kurulan ve ilk Osmanlı parası bastırılan hükümdar aşağıdakilerden hangisidir?",
    secenekler: ["Orhan Bey", "Osman Bey", "I. Murat", "Yıldırım Bayezid", "Çelebi Mehmet"],
    dogruCevap: 0,
    aciklama: "İlk medrese (İznik), ilk düzenli ordu (yaya ve müsellem) ve ilk gümüş para (akçe) Orhan Bey dönemine aittir.",
  },
  {
    ders: "TARIH",
    konu: "Osmanlı Devleti",
    soruMetni: "Aşağıdakilerden hangisi Ankara Savaşı'nın (1402) sonuçlarından biri değildir?",
    secenekler: [
      "Osmanlı Devleti'nde Fetret Devri'nin başlaması",
      "Anadolu Türk siyasi birliğinin bozulması",
      "İstanbul'un fethinin gecikmesi",
      "Timur'un Anadolu'daki beylikleri yeniden kurması",
      "Osmanlı Devleti'nin İstanbul'u fethetmesi",
    ],
    dogruCevap: 4,
    aciklama: "İstanbul 1453'te fethedilmiştir; Ankara yenilgisi ise fethi geciktirmiştir. Diğer seçenekler Ankara Savaşı'nın sonuçlarıdır.",
  },
  {
    ders: "TARIH",
    konu: "Osmanlı Devleti",
    soruMetni:
      "1571'de Osmanlı donanmasının Haçlı donanmasına yenildiği; ancak Osmanlı Devleti'nin bir yıl içinde yeni bir donanma kurarak gücünü göstermesiyle sonuçlanan deniz savaşı aşağıdakilerden hangisidir?",
    secenekler: ["Preveze Deniz Savaşı", "Cerbe Deniz Savaşı", "İnebahtı Deniz Savaşı", "Çeşme Baskını", "Navarin Baskını"],
    dogruCevap: 2,
    aciklama: "İnebahtı (1571) Osmanlı donanmasının ilk büyük yenilgisidir. Preveze (1538) ve Cerbe (1560) Osmanlı zaferleri, Çeşme (1770) ve Navarin (1827) ise sonraki dönemlere ait baskınlardır.",
  },
  {
    ders: "TARIH",
    konu: "Osmanlı Devleti",
    soruMetni:
      "II. Mahmut ile ayanlar arasında 1808'de imzalanan; padişahın yetkilerinin ilk kez sınırlandırıldığı ve ayanların varlığının devletçe resmen tanındığı belge aşağıdakilerden hangisidir?",
    secenekler: ["Tanzimat Fermanı", "Islahat Fermanı", "Kanun-i Esasi", "Mecelle", "Sened-i İttifak"],
    dogruCevap: 4,
    aciklama: "Sened-i İttifak, Osmanlı'da padişah yetkilerini sınırlayan ilk belgedir ve demokratikleşme sürecinin başlangıcı sayılır.",
  },
  {
    ders: "TARIH",
    konu: "Osmanlı Devleti",
    soruMetni:
      "Kırım'ın bağımsız olduğu, Rusya'nın Osmanlı topraklarındaki Ortodoksların koruyuculuğunu üstlendiği ve Osmanlı Devleti'nin ilk kez savaş tazminatı ödediği antlaşma aşağıdakilerden hangisidir?",
    secenekler: ["Karlofça Antlaşması", "Pasarofça Antlaşması", "Küçük Kaynarca Antlaşması", "Yaş Antlaşması", "Bükreş Antlaşması"],
    dogruCevap: 2,
    aciklama: "Küçük Kaynarca Antlaşması (1774) ile Kırım bağımsız olmuş, Rusya Ortodoksların hamiliği hakkını elde etmiş ve Osmanlı ilk kez savaş tazminatı ödemiştir.",
  },
  {
    ders: "TARIH",
    konu: "Osmanlı Devleti",
    soruMetni: "Osmanlı Devleti'nin 1856'da Islahat Fermanı'nı ilan etmesindeki temel amaç aşağıdakilerden hangisidir?",
    secenekler: [
      "Kapitülasyonları tamamen kaldırmak",
      "Avrupa devletlerinin gayrimüslimleri bahane ederek iç işlerine karışmasını önlemek",
      "Meşrutiyet yönetimine geçmek",
      "Merkezî otoriteyi zayıflatmak",
      "Yeniçeri Ocağı'nı kaldırmak",
    ],
    dogruCevap: 1,
    aciklama: "Islahat Fermanı gayrimüslimlere yeni haklar tanıyarak Paris Konferansı öncesinde Avrupa devletlerinin bu konuyu bahane edip iç işlere karışmasını önlemeyi amaçlamıştır.",
  },
  {
    ders: "TARIH",
    konu: "Osmanlı Devleti",
    soruMetni: "II. Meşrutiyet döneminde etkili olan fikir akımlarından Türkçülüğün önde gelen temsilcisi aşağıdakilerden hangisidir?",
    secenekler: ["Namık Kemal", "Prens Sabahattin", "Abdullah Cevdet", "Ziya Gökalp", "Mehmet Akif Ersoy"],
    dogruCevap: 3,
    aciklama: "Ziya Gökalp Türkçülüğün, Namık Kemal Osmanlıcılığın, Abdullah Cevdet Batıcılığın, Mehmet Akif Ersoy İslamcılığın temsilcisidir; Prens Sabahattin ise adem-i merkeziyetçi görüşleriyle tanınır.",
  },
  {
    ders: "TARIH",
    konu: "Osmanlı Devleti",
    soruMetni:
      "I. Dünya Savaşı'nda Osmanlı Devleti'nin, İngiltere'nin Hindistan ile bağlantısını kesmek ve Mısır'ı geri almak amacıyla açtığı cephe aşağıdakilerden hangisidir?",
    secenekler: ["Kanal Cephesi", "Kafkas Cephesi", "Çanakkale Cephesi", "Galiçya Cephesi", "Irak Cephesi"],
    dogruCevap: 0,
    aciklama: "Süveyş Kanalı'nı hedef alan Kanal Cephesi, İngiltere'nin sömürge yolunu kesmek ve Mısır'ı geri almak amacıyla açılmıştır.",
  },
  {
    ders: "TARIH",
    konu: "Kurtuluş Savaşı",
    soruMetni: "Aşağıdakilerden hangisi Mondros Ateşkes Antlaşması'ndan sonra kurulan millî (yararlı) cemiyetlerden biri değildir?",
    secenekler: [
      "Wilson Prensipleri Cemiyeti",
      "Müdafaa-i Hukuk cemiyetleri",
      "Redd-i İlhak Cemiyeti",
      "Trakya-Paşaeli Müdafaa Heyet-i Osmaniyesi",
      "Kilikyalılar Cemiyeti",
    ],
    dogruCevap: 0,
    aciklama: "Wilson Prensipleri Cemiyeti, Amerikan mandasını savunduğu için millî cemiyetler arasında sayılmaz. Diğerleri işgallere karşı kurulan millî cemiyetlerdir.",
  },
  {
    ders: "TARIH",
    konu: "Kurtuluş Savaşı",
    soruMetni:
      "Mustafa Kemal'in Samsun'a çıktıktan kısa süre sonra yayımladığı; işgallerin mitinglerle protesto edilmesini ve halkın millî bilincinin uyandırılmasını isteyen belge aşağıdakilerden hangisidir?",
    secenekler: ["Amasya Genelgesi", "Amasya Görüşmeleri", "Misak-ı Millî", "Havza Genelgesi", "Sivas Kongresi kararları"],
    dogruCevap: 3,
    aciklama: "Havza Genelgesi (28-29 Mayıs 1919), işgallerin mitinglerle protesto edilmesini istemiş; millî bilinci uyandırmaya yönelik ilk adımlardan biri olmuştur.",
  },
  {
    ders: "TARIH",
    konu: "Kurtuluş Savaşı",
    soruMetni:
      "23 Nisan 1920'de açılan Türkiye Büyük Millet Meclisi ile ilgili;\nI. Olağanüstü yetkilere sahip bir meclistir.\nII. Güçler birliği ilkesini benimsemiştir.\nIII. Padişahın onayıyla toplanmıştır.\nifadelerinden hangileri doğrudur?",
    secenekler: ["Yalnız I", "Yalnız II", "I ve II", "II ve III", "I, II ve III"],
    dogruCevap: 2,
    aciklama: "TBMM olağanüstü yetkilerle donatılmış, yasama ve yürütmeyi kendinde toplayarak güçler birliği ilkesini benimsemiştir. Padişahın onayıyla değil, millî irade ile toplanmıştır.",
  },
  {
    ders: "TARIH",
    konu: "Çağdaş Türk ve Dünya Tarihi",
    soruMetni: "Türkiye'nin 18 Şubat 1952'de üye olduğu askerî ittifak aşağıdakilerden hangisidir?",
    secenekler: ["Varşova Paktı", "Bağdat Paktı", "Balkan Paktı", "Sadabat Paktı", "NATO"],
    dogruCevap: 4,
    aciklama: "Türkiye, Yunanistan ile birlikte 18 Şubat 1952'de NATO'ya üye olmuştur. Varşova Paktı Doğu Bloku'nun ittifakıdır; Bağdat Paktı 1955'te, Balkan Paktı 1953'te kurulmuş, Sadabat Paktı ise 1937'de imzalanmıştır.",
  },
  {
    ders: "TARIH",
    konu: "Çağdaş Türk ve Dünya Tarihi",
    soruMetni: "1962 Küba Füze Krizi'nin çözümü kapsamında ABD'nin Türkiye'den çektiği füzeler aşağıdakilerden hangisidir?",
    secenekler: ["Patriot", "Jüpiter", "Tomahawk", "Scud", "Stinger"],
    dogruCevap: 1,
    aciklama: "Krizin çözümünde SSCB füzelerini Küba'dan çekmiş; ABD de Türkiye'deki Jüpiter füzelerini 1963'te sökmüştür. Türkiye'ye danışılmadan alınan bu karar, Türk dış politikasında ABD'ye güvenin sorgulanmasına yol açmıştır.",
  },
  {
    ders: "TARIH",
    konu: "Atatürk İlke ve İnkılapları",
    soruMetni:
      "Lozan Konferansı'nda çözülemeyip İngiltere ile ikili görüşmelere bırakılan; 1926 Ankara Antlaşması ile Irak'a bırakılan toprak aşağıdakilerden hangisidir?",
    secenekler: ["Hatay", "Batı Trakya", "Musul", "Oniki Ada", "Kıbrıs"],
    dogruCevap: 2,
    aciklama: "Musul sorunu Lozan'da çözülemedi; 1926 Ankara Antlaşması ile Musul, İngiliz mandasındaki Irak'a bırakıldı.",
  },
  {
    ders: "TARIH",
    konu: "Atatürk İlke ve İnkılapları",
    soruMetni: "29 Ekim 1923'te cumhuriyetin ilan edilmesiyle doğrudan çözüme kavuşturulan sorun aşağıdakilerden hangisidir?",
    secenekler: ["Halifelik sorunu", "Musul sorunu", "Boğazlar sorunu", "Dış borçlar sorunu", "Devlet başkanlığı ve rejimin adı sorunu"],
    dogruCevap: 4,
    aciklama: "Saltanatın kaldırılmasından sonra devlet başkanının kim olacağı ve yönetimin adı belirsizdi; cumhuriyetin ilanı ve Mustafa Kemal'in cumhurbaşkanı seçilmesiyle bu sorun çözüldü.",
  },
  {
    ders: "TARIH",
    konu: "Atatürk İlke ve İnkılapları",
    soruMetni: "Harf İnkılabı'nın (1928) ardından okuma yazma bilmeyen yetişkinlere yeni Türk harflerini öğretmek amacıyla açılan kurumlar aşağıdakilerden hangisidir?",
    secenekler: ["Millet Mektepleri", "Köy Enstitüleri", "Halkevleri", "Darülfünun", "Mekteb-i Mülkiye"],
    dogruCevap: 0,
    aciklama: "Millet Mektepleri 1928'de açılmıştır. Halkevleri 1932'de, Köy Enstitüleri 1940'ta kurulmuştur; Darülfünun ve Mekteb-i Mülkiye Osmanlı dönemi kurumlarıdır.",
  },
  {
    ders: "TARIH",
    konu: "Atatürk İlke ve İnkılapları",
    soruMetni:
      "Türk kadınının siyasi haklarını kazanma sürecindeki;\nI. milletvekili seçme ve seçilme hakkı,\nII. belediye seçimlerinde seçme ve seçilme hakkı,\nIII. muhtarlık seçimlerinde seçme ve seçilme hakkı\ngelişmelerinin kronolojik sıralaması aşağıdakilerden hangisidir?",
    secenekler: ["I, II, III", "II, III, I", "III, II, I", "II, I, III", "III, I, II"],
    dogruCevap: 1,
    aciklama: "Kadınlar 1930'da belediye, 1933'te muhtarlık, 1934'te milletvekili seçimlerinde seçme ve seçilme hakkı kazanmıştır: II, III, I.",
  },
  {
    ders: "TARIH",
    konu: "Atatürk İlke ve İnkılapları",
    soruMetni:
      "Lozan görüşmelerinin kesintiye uğradığı Şubat 1923'te toplanan; Misak-ı İktisadi'nin kabul edildiği ve millî ekonominin esaslarının belirlendiği kongre aşağıdakilerden hangisidir?",
    secenekler: ["Sivas Kongresi", "Erzurum Kongresi", "Balıkesir Kongresi", "İzmir İktisat Kongresi", "Maarif Kongresi"],
    dogruCevap: 3,
    aciklama: "İzmir İktisat Kongresi'nde (17 Şubat - 4 Mart 1923) Misak-ı İktisadi kabul edilmiş ve ekonomide millîleşme hedefi benimsenmiştir.",
  },
  {
    ders: "TARIH",
    konu: "Atatürk İlke ve İnkılapları",
    soruMetni: "Türkiye'nin 1932'de davet üzerine üye olduğu, I. Dünya Savaşı'ndan sonra dünya barışını korumak amacıyla kurulan uluslararası örgüt aşağıdakilerden hangisidir?",
    secenekler: ["Milletler Cemiyeti", "Birleşmiş Milletler", "NATO", "Avrupa Konseyi", "Balkan Antantı"],
    dogruCevap: 0,
    aciklama: "Türkiye, 1932'de Milletler Cemiyeti'ne davet üzerine üye olmuştur. Birleşmiş Milletler 1945'te, NATO 1949'da kurulmuştur.",
  },
  {
    ders: "TARIH",
    konu: "Çağdaş Türk ve Dünya Tarihi",
    soruMetni: "Türkiye'nin 1974'te Kıbrıs Barış Harekâtı'nı gerçekleştirmesinin hukuki dayanağı aşağıdakilerden hangisidir?",
    secenekler: [
      "Lozan Barış Antlaşması",
      "Paris Barış Antlaşması",
      "1960 Garanti Antlaşması'ndan doğan garantörlük hakkı",
      "NATO üyeliği",
      "Montrö Boğazlar Sözleşmesi",
    ],
    dogruCevap: 2,
    aciklama: "1960'ta Kıbrıs Cumhuriyeti kurulurken imzalanan Garanti Antlaşması, Türkiye'ye garantör ülke olarak müdahale hakkı tanımıştır; 1974 harekâtı bu hakka dayanır.",
  },

  // ---- COĞRAFYA (18) ----
  {
    ders: "COGRAFYA",
    konu: "Fiziki Özellikler",
    soruMetni: "Aşağıdaki yer şekillerinden hangisi rüzgâr aşındırmasıyla oluşur?",
    secenekler: ["Kanyon", "Dolin", "Lapya", "Moren", "Mantarkaya"],
    dogruCevap: 4,
    aciklama: "Mantarkaya, rüzgârın taşıdığı kum tanelerinin kayaları alt kısımdan daha fazla aşındırmasıyla oluşur. Kanyon akarsu, dolin ve lapya karstik çözünme, moren ise buzul biriktirmesiyle oluşan şekillerdir.",
  },
  {
    ders: "COGRAFYA",
    konu: "Coğrafi Konum",
    soruMetni: "Yerel öğle vaktinde ölçüldüğünde, yıl boyunca cisimlerin gölge boyunun Türkiye'de en kısa olduğu il aşağıdakilerden hangisidir?",
    secenekler: ["Sinop", "Edirne", "Iğdır", "Hatay", "Artvin"],
    dogruCevap: 3,
    aciklama: "Güneş ışınları Ekvator'a yaklaştıkça daha dik açıyla gelir ve gölge boyu kısalır. Türkiye'nin en güney noktası Hatay'dadır (Yayladağı); bu nedenle gölge boyu en kısa Hatay'da olur.",
  },
  {
    ders: "COGRAFYA",
    konu: "Ekonomik Özellikler",
    soruMetni:
      "Haritada numaralandırılarak gösterilen enerji santralleri ile kullandıkları enerji kaynakları eşleştirilmiştir.\n\nBu eşleştirmelerden hangisi yanlıştır?",
    gorselSvg: turkiyeHaritasi({
      noktalar: [
        { etiket: "I", boylam: 38.32, enlem: 37.48 }, // Ataturk Baraji
        { etiket: "II", boylam: 37.05, enlem: 38.35 }, // Afsin-Elbistan
        { etiket: "III", boylam: 27.6, enlem: 37.87 }, // Germencik
        { etiket: "IV", boylam: 33.53, enlem: 36.14 }, // Akkuyu
        { etiket: "V", boylam: 38.75, enlem: 38.8 }, // Keban
      ],
    }),
    secenekler: ["I - Hidroelektrik", "II - Linyit (termik)", "III - Jeotermal", "IV - Nükleer", "V - Rüzgâr"],
    dogruCevap: 4,
    aciklama:
      "I Atatürk Barajı (Fırat) hidroelektrik, II Afşin-Elbistan linyitle çalışan termik, III Germencik (Aydın) jeotermal, IV Akkuyu (Mersin) nükleer santraldir. V numaralı Keban Barajı da Fırat üzerinde bir hidroelektrik santralidir; rüzgâr santrali değildir.",
  },
  {
    ders: "COGRAFYA",
    konu: "İklim ve Bitki Örtüsü",
    soruMetni: "Haritada taralı olarak gösterilen alanda yaygın olan doğal bitki örtüsü aşağıdakilerden hangisidir?",
    gorselSvg: turkiyeHaritasi({ taraliIller: ["Konya", "Aksaray", "Ankara", "Kırşehir"] }),
    secenekler: ["Bozkır", "Maki", "Gür (nemli) orman", "Alpin çayır", "Garig"],
    dogruCevap: 0,
    aciklama: "Taralı iller (Konya, Aksaray, Ankara, Kırşehir) İç Anadolu'dadır. Yaz kuraklığının belirgin olduğu karasal iklimde ilkbahar yağışlarıyla yeşerip yazın kuruyan bozkır yaygındır.",
  },
  {
    ders: "COGRAFYA",
    konu: "İklim ve Bitki Örtüsü",
    soruMetni:
      "Grafiklerde bir meteoroloji istasyonuna ait uzun yıllar aylık ortalama sıcaklık ve aylık ortalama yağış değerleri verilmiştir.\n\nBu istasyonda görülen iklim tipi aşağıdakilerden hangisidir?",
    // MGM, Rize uzun yillar (1927-2025) aylik ortalamalari.
    gorselSvg: iklimGrafigi(
      [6.9, 6.8, 8.2, 11.7, 16.0, 20.4, 22.9, 23.3, 20.4, 16.5, 12.4, 8.8],
      [231.2, 186.1, 159.8, 97.6, 96.5, 133.9, 150.9, 193.1, 256.6, 293.8, 250.4, 241.8],
    ),
    secenekler: ["Akdeniz iklimi", "Karadeniz iklimi", "Karasal iklim", "Marmara (geçiş) iklimi", "Muson iklimi"],
    dogruCevap: 1,
    aciklama:
      "Kışlar ılık (en soğuk ay ortalaması 0 °C'nin üzerinde), yazlar serin ve her mevsim bol yağışlı, en fazla yağış sonbaharda: Karadeniz iklimi (veriler: MGM, Rize 1927-2025). Akdeniz ikliminde yazlar kurak, karasal iklimde kışlar soğuktur.",
  },
  {
    ders: "COGRAFYA",
    konu: "Fiziki Özellikler",
    soruMetni: "Aşağıdaki yer şekillerinden hangisi akarsuların aşındırmasıyla oluşmuştur?",
    secenekler: ["Kumul", "Moren", "Falez", "Lapya", "Kanyon vadi"],
    dogruCevap: 4,
    aciklama: "Kanyon vadi, akarsuyun yatağını derine doğru aşındırmasıyla oluşur. Kumul rüzgâr, moren buzul, falez dalga birikimi ya da aşındırması; lapya ise karstik erime sonucudur.",
  },
  {
    ders: "COGRAFYA",
    konu: "Fiziki Özellikler",
    soruMetni: "Merkez üsleri Kahramanmaraş'ın Pazarcık ve Elbistan ilçeleri olan 6 Şubat 2023 depremleri hangi fay hattı üzerinde meydana gelmiştir?",
    secenekler: ["Kuzey Anadolu Fay Hattı", "Batı Anadolu fay sistemi", "Doğu Anadolu Fay Hattı", "Ölü Deniz Fayı", "Tuz Gölü Fayı"],
    dogruCevap: 2,
    aciklama: "6 Şubat 2023 Kahramanmaraş depremleri, Doğu Anadolu Fay Hattı ve ona bağlı kollar üzerinde meydana gelmiş; on bir ili etkilemiştir.",
  },
  {
    ders: "COGRAFYA",
    konu: "Beşeri Özellikler",
    soruMetni: "Türkiye'de 2007'den bu yana nüfus bilgileri, herkesin evde beklediği sayım günleri yerine hangi sistemle belirlenmektedir?",
    secenekler: [
      "Adrese Dayalı Nüfus Kayıt Sistemi",
      "Seçmen kütüklerinin sayımı",
      "Örnekleme yoluyla yapılan anketler",
      "On yılda bir yapılan genel nüfus sayımı",
      "Okul kayıtlarının birleştirilmesi",
    ],
    dogruCevap: 0,
    aciklama: "2007'den beri nüfus, kişilerin yerleşim yeri adresleriyle eşleştirildiği Adrese Dayalı Nüfus Kayıt Sistemi (ADNKS) ile yıllık olarak belirlenmektedir.",
  },
  {
    ders: "COGRAFYA",
    konu: "Beşeri Özellikler",
    soruMetni: "Türkiye'de doğum oranlarının düşmesiyle nüfus giderek yaşlanmaktadır.\n\nAşağıdakilerden hangisi bu sürecin sonuçlarından biri değildir?",
    secenekler: [
      "Sağlık harcamalarının artması",
      "Emekli nüfusun çalışan nüfusa oranının yükselmesi",
      "Bakım ve huzurevi hizmetlerine ihtiyacın artması",
      "Okul ve öğretmen ihtiyacının artması",
      "Ortanca yaşın yükselmesi",
    ],
    dogruCevap: 3,
    aciklama: "Doğumların azalması çocuk ve genç nüfusu azaltır; okul ve öğretmen ihtiyacı artmaz, azalır. Diğer seçenekler yaşlanan nüfusun sonuçlarıdır.",
  },
  {
    ders: "COGRAFYA",
    konu: "Beşeri Özellikler",
    soruMetni: "Toroslarda yaşayan Yörüklerin, hayvanlarını otlatmak için yaz ve kış farklı yerlere taşıdıkları çadırlardan oluşan geçici yerleşmelere ne ad verilir?",
    secenekler: ["Mezra", "Kom", "Oba", "Divan", "Dam"],
    dogruCevap: 2,
    aciklama: "Göçebe Yörüklerin çadırlardan kurduğu geçici yerleşmelere oba denir. Mezra ve kom Doğu ve Güneydoğu Anadolu'da tarım ve hayvancılığa bağlı yerleşmeler, divan Kastamonu-Bolu çevresinde köyden büyük bucaktan küçük yerleşmedir.",
  },
  {
    ders: "COGRAFYA",
    konu: "Ekonomik Özellikler",
    soruMetni: "Zeytin, Türkiye'de kıyı bölgelerinde yaygın olarak yetiştirilirken İç Anadolu'da tarımı yapılmaz.\n\nBunun temel nedeni aşağıdakilerden hangisidir?",
    secenekler: [
      "Yaz yağışlarının fazla olması",
      "Kışların soğuk geçmesi",
      "Toprakların verimsiz olması",
      "Nüfusun az olması",
      "Sulama olanaklarının fazla olması",
    ],
    dogruCevap: 1,
    aciklama: "Zeytin, kışları ılık geçen Akdeniz iklimi bitkisidir ve dondan zarar görür; kışları soğuk geçen İç Anadolu'da yetişmez.",
  },
  {
    ders: "COGRAFYA",
    konu: "Ekonomik Özellikler",
    soruMetni: "Dut yaprağıyla beslenen ipek böceğinin yetiştiriciliği ve ipek dokumacılığı Türkiye'de en çok hangi ilde yapılmaktadır?",
    secenekler: ["Erzurum", "Rize", "Konya", "Van", "Bursa"],
    dogruCevap: 4,
    aciklama: "İpek böcekçiliği, dut ağaçlarının yaygın olduğu Bursa'da (ve çevresinde Bilecik, Balıkesir) yoğunlaşmıştır; Bursa ipekçiliğiyle tarih boyunca ün kazanmıştır.",
  },
  {
    ders: "COGRAFYA",
    konu: "Ekonomik Özellikler",
    soruMetni: "Sivas'ın Divriği ilçesi, Türkiye'nin hangi madeninin en önemli çıkarım alanlarından biridir?",
    secenekler: ["Demir", "Bakır", "Krom", "Bor", "Linyit"],
    dogruCevap: 0,
    aciklama: "Divriği demir yataklarıyla tanınır; buradan çıkarılan cevher Karabük, Ereğli ve İskenderun demir-çelik fabrikalarında işlenir.",
  },
  {
    ders: "COGRAFYA",
    konu: "Ekonomik Özellikler",
    soruMetni: "Türkiye'de rüzgâr enerjisi santralleri en çok Ege ve Marmara bölgelerinin kıyı kesimlerinde kurulmuştur.\n\nBunun temel nedeni aşağıdakilerden hangisidir?",
    secenekler: [
      "Güneşlenme süresinin uzun olması",
      "Nüfusun kalabalık olması",
      "Yer altı sularının bol olması",
      "Rüzgâr hızının yüksek ve sürekli olması",
      "Akarsuların düzenli akması",
    ],
    dogruCevap: 3,
    aciklama: "Rüzgâr santralleri, rüzgârın yıl boyunca yüksek hızda ve sürekli estiği yerlere kurulur; Ege ve Marmara kıyıları (Çanakkale, İzmir, Balıkesir) bu bakımdan en elverişli alanlardır.",
  },
  {
    ders: "COGRAFYA",
    konu: "Ekonomik Özellikler",
    soruMetni: "İstanbul Boğazı'nın altından geçerek Asya ile Avrupa yakalarını demir yoluyla birbirine bağlayan proje aşağıdakilerden hangisidir?",
    secenekler: ["Avrasya Tüneli", "Yavuz Sultan Selim Köprüsü", "Marmaray", "Osmangazi Köprüsü", "1915 Çanakkale Köprüsü"],
    dogruCevap: 2,
    aciklama: "Marmaray, Boğaz'ın altından geçen demir yolu tüp tünelidir. Avrasya Tüneli karayolu tünelidir; diğerleri köprüdür ve Osmangazi ile 1915 Çanakkale köprüleri İstanbul Boğazı'nda değildir.",
  },
  {
    ders: "COGRAFYA",
    konu: "Ekonomik Özellikler",
    soruMetni: "UNESCO Dünya Mirası Listesi'nde yer alan bazı alanlar ile bulundukları iller eşleştirilmiştir.\n\nBu eşleştirmelerden hangisi yanlıştır?",
    secenekler: ["Pamukkale - Denizli", "Göreme Millî Parkı - Nevşehir", "Nemrut Dağı - Adıyaman", "Safranbolu - Karabük", "Çatalhöyük - Kayseri"],
    dogruCevap: 4,
    aciklama: "Neolitik dönem yerleşmesi Çatalhöyük, Konya'nın Çumra ilçesindedir. Diğer eşleştirmeler doğrudur.",
  },
  {
    ders: "COGRAFYA",
    konu: "Ekonomik Özellikler",
    soruMetni: "Türkiye'de ayçiçeği üretiminin en fazla yapıldığı yöre aşağıdakilerden hangisidir?",
    secenekler: ["Trakya (Ergene Havzası)", "Çukurova", "Harran Ovası", "Iğdır Ovası", "Muş Ovası"],
    dogruCevap: 0,
    aciklama: "Ayçiçeği üretiminin büyük bölümü Trakya'da (Tekirdağ, Edirne, Kırklareli) Ergene Havzası'nda yapılır.",
  },
  {
    ders: "COGRAFYA",
    konu: "Fiziki Özellikler",
    soruMetni: "Çukur bir alanda kurulmuş kentlerde kış aylarında hava kirliliğinin artmasının doğal nedeni aşağıdakilerden hangisidir?",
    secenekler: [
      "Yağışların fazla olması",
      "Sıcaklık terselmesi (inversiyon)",
      "Rüzgârın sürekli esmesi",
      "Denize yakın olunması",
      "Bitki örtüsünün gür olması",
    ],
    dogruCevap: 1,
    aciklama: "Kışın soğuk ve ağır hava çukur alanlarda birikir, üstündeki daha sıcak hava tabakası dikey hava hareketini engeller (inversiyon); kirleticiler dağılamaz. Yağış ve rüzgâr ise kirliliği azaltır.",
  },

  // ---- VATANDAŞLIK (9) ----
  {
    ders: "VATANDASLIK",
    konu: "Temel Hukuk Kavramları",
    soruMetni: "Hukuka aykırı bir idari işlemin, idare mahkemesi kararıyla hüküm ve sonuçlarıyla birlikte ortadan kaldırılmasına ne ad verilir?",
    secenekler: ["Ceza", "Tazminat", "İptal", "Cebri icra", "Disiplin cezası"],
    dogruCevap: 2,
    aciklama: "Hukuka aykırı idari işlemlerin yargı kararıyla ortadan kaldırılması iptal yaptırımıdır.",
  },
  {
    ders: "VATANDASLIK",
    konu: "Temel Hukuk Kavramları",
    soruMetni: "Aşağıdakilerden hangisi özel hukukun dallarından biridir?",
    secenekler: ["Anayasa hukuku", "İdare hukuku", "Ceza hukuku", "Vergi hukuku", "Ticaret hukuku"],
    dogruCevap: 4,
    aciklama: "Ticaret hukuku kişiler arasındaki ilişkileri düzenleyen özel hukuk dalıdır. Anayasa, idare, ceza ve vergi hukuku devletin taraf olduğu kamu hukuku dallarıdır.",
  },
  {
    ders: "VATANDASLIK",
    konu: "Temel Hukuk Kavramları",
    soruMetni: "Türk Medeni Kanunu'na göre bir küçük, kendi isteği ve velisinin rızasıyla en erken kaç yaşını doldurduğunda mahkeme kararıyla ergin kılınabilir?",
    secenekler: ["15", "16", "17", "18", "21"],
    dogruCevap: 0,
    aciklama: "Türk Medeni Kanunu'nun 12. maddesine göre on beş yaşını dolduran küçük, kendi isteği ve velisinin rızasıyla mahkeme kararıyla ergin kılınabilir.",
  },
  {
    ders: "VATANDASLIK",
    konu: "Yasama-Yürütme-Yargı",
    soruMetni: "1982 Anayasası'na göre Türkiye Büyük Millet Meclisi ve Cumhurbaşkanlığı seçimleri kaç yılda bir yapılır?",
    secenekler: ["2", "3", "4", "5", "6"],
    dogruCevap: 3,
    aciklama: "2017 Anayasa değişikliğiyle TBMM ve Cumhurbaşkanlığı seçimlerinin beş yılda bir aynı gün yapılması kabul edilmiştir.",
  },
  {
    ders: "VATANDASLIK",
    konu: "Yasama-Yürütme-Yargı",
    soruMetni: "Aşağıdakilerden hangisi 1982 Anayasası'nda sayılan seçim ilkelerinden biri değildir?",
    secenekler: ["Serbest seçim", "Açık oy", "Eşit oy", "Tek dereceli seçim", "Genel oy"],
    dogruCevap: 1,
    aciklama: "Anayasa'ya göre seçimler serbest, eşit, gizli, tek dereceli, genel oy, açık sayım ve döküm esaslarına göre yapılır. Oy açık değil gizlidir.",
  },
  {
    ders: "VATANDASLIK",
    konu: "Yasama-Yürütme-Yargı",
    soruMetni: "2017 değişikliği sonrasında 1982 Anayasası'na göre bakanlar kim tarafından atanır?",
    secenekler: ["TBMM", "Anayasa Mahkemesi", "Danıştay", "TBMM Başkanı", "Cumhurbaşkanı"],
    dogruCevap: 4,
    aciklama: "Bakanlar, milletvekilliğine seçilme yeterliliğine sahip olanlar arasından Cumhurbaşkanı tarafından atanır ve görevden alınır.",
  },
  {
    ders: "VATANDASLIK",
    konu: "Yasama-Yürütme-Yargı",
    soruMetni: "1982 Anayasası'na göre Hâkimler ve Savcılar Kurulunun başkanı aşağıdakilerden hangisidir?",
    secenekler: ["Adalet Bakanı", "Yargıtay Birinci Başkanı", "Danıştay Başkanı", "Cumhurbaşkanı", "Anayasa Mahkemesi Başkanı"],
    dogruCevap: 0,
    aciklama: "Anayasa'nın 159. maddesine göre Hâkimler ve Savcılar Kurulunun başkanı Adalet Bakanı, tabii üyesi ise Adalet Bakanı Yardımcısıdır.",
  },
  {
    ders: "VATANDASLIK",
    konu: "İdare Hukuku",
    soruMetni: "İl düzeyinde devletin ve Cumhurbaşkanının temsilcisi olan, merkezî yönetimin il idaresindeki en yetkili amiri aşağıdakilerden hangisidir?",
    secenekler: ["Belediye başkanı", "Kaymakam", "Vali", "Muhtar", "İl genel meclisi başkanı"],
    dogruCevap: 2,
    aciklama: "Vali, ilde devletin ve Cumhurbaşkanının temsilcisidir. Kaymakam ilçede merkezî yönetimin amiridir; belediye başkanı ve muhtar ise yerel yönetim organlarıdır.",
  },
  {
    ders: "VATANDASLIK",
    konu: "İdare Hukuku",
    soruMetni: "İdarenin işleyişiyle ilgili şikâyetleri inceleyen ve Türkiye Büyük Millet Meclisi Başkanlığına bağlı olarak kurulan kurum aşağıdakilerden hangisidir?",
    secenekler: ["Sayıştay", "Danıştay", "Devlet Denetleme Kurulu", "Kamu Denetçiliği Kurumu", "Hâkimler ve Savcılar Kurulu"],
    dogruCevap: 3,
    aciklama: "Kamu Denetçiliği Kurumu (Ombudsmanlık), Anayasa'nın 74. maddesi uyarınca TBMM Başkanlığına bağlı olarak kurulmuş ve idarenin işleyişiyle ilgili şikâyetleri inceler.",
  },

  // ---- GÜNCEL BİLGİLER (6) ----
  {
    ders: "GUNCEL",
    konu: "Güncel Bilgiler",
    soruMetni: "2025 Nobel Fizik Ödülü, John Clarke, Michel H. Devoret ve John M. Martinis'e aşağıdaki çalışmalardan hangisi nedeniyle verilmiştir?",
    secenekler: [
      "Yapay sinir ağlarıyla makine öğrenmesinin temellerinin atılması",
      "Bir elektrik devresinde makroskobik kuantum tünelleme ve enerji kuantizasyonunun keşfi",
      "Elektron hareketini incelemek için attosaniyelik ışık atımlarının üretilmesi",
      "Kara deliklerin oluşumuna ilişkin keşifler",
      "Kütle çekim dalgalarının gözlenmesi",
    ],
    dogruCevap: 1,
    aciklama: "Ödül, elektrik devresinde makroskobik kuantum tünelleme ve enerji kuantizasyonunun keşfi için verilmiştir. Diğer seçenekler 2024, 2023, 2020 ve 2017 Nobel Fizik ödüllerinin konularıdır.",
  },
  {
    ders: "GUNCEL",
    konu: "Güncel Bilgiler",
    soruMetni: "2025 Nobel Fizyoloji veya Tıp Ödülü, Mary E. Brunkow, Fred Ramsdell ve Shimon Sakaguchi'ye hangi alandaki keşifleri nedeniyle verilmiştir?",
    secenekler: [
      "MikroRNA'nın keşfi",
      "mRNA aşılarının geliştirilmesi",
      "Sıcaklık ve dokunma reseptörlerinin keşfi",
      "Periferik bağışıklık toleransı (düzenleyici T hücreleri)",
      "Hepatit C virüsünün keşfi",
    ],
    dogruCevap: 3,
    aciklama: "Ödül, bağışıklık sisteminin vücuda saldırmasını önleyen periferik immün tolerans ve düzenleyici T hücrelerine ilişkin keşifler için verilmiştir. Diğer seçenekler 2024, 2023, 2021 ve 2020 ödüllerinin konularıdır.",
  },
  {
    ders: "GUNCEL",
    konu: "Güncel Bilgiler",
    soruMetni: "Mart 2026'da düzenlenen 98. Akademi (Oscar) Ödülleri'nde “En İyi Film” ödülünü kazanan yapım aşağıdakilerden hangisidir?",
    secenekler: ["Savaş Üstüne Savaş (One Battle After Another)", "Anora", "Oppenheimer", "Her Şey Her Yerde Aynı Anda", "CODA"],
    dogruCevap: 0,
    aciklama: "Paul Thomas Anderson'ın yönettiği “Savaş Üstüne Savaş” en iyi film dahil 6 Oscar kazanmıştır. Diğer seçenekler önceki yılların (97-94. tören) en iyi film ödüllerini kazanan yapımlardır.",
  },
  {
    ders: "GUNCEL",
    konu: "Güncel Bilgiler",
    soruMetni: "Birleşmiş Milletler İklim Değişikliği Çerçeve Sözleşmesi'nin 30. Taraflar Konferansı (COP30) 2025'te nerede düzenlenmiştir?",
    secenekler: ["Bakü - Azerbaycan", "Dubai - Birleşik Arap Emirlikleri", "Şarm El-Şeyh - Mısır", "Glasgow - Birleşik Krallık", "Belém - Brezilya"],
    dogruCevap: 4,
    aciklama: "COP30, Kasım 2025'te Brezilya'nın Belém kentinde düzenlenmiştir. Bakü COP29, Dubai COP28, Şarm El-Şeyh COP27, Glasgow ise COP26'ya ev sahipliği yapmıştır.",
  },
  {
    ders: "GUNCEL",
    konu: "Güncel Bilgiler",
    soruMetni: "6-22 Şubat 2026 tarihlerinde düzenlenen Kış Olimpiyat Oyunları'na ev sahipliği yapan kent ve ülke aşağıdakilerden hangisidir?",
    secenekler: ["Pekin - Çin", "Pyeongchang - Güney Kore", "Milano-Cortina - İtalya", "Soçi - Rusya", "Vancouver - Kanada"],
    dogruCevap: 2,
    aciklama: "2026 Kış Olimpiyatları İtalya'da Milano ve Cortina d'Ampezzo'da yapılmıştır. Pekin 2022, Pyeongchang 2018, Soçi 2014, Vancouver ise 2010 Kış Olimpiyatlarına ev sahipliği yapmıştır.",
  },
  {
    ders: "GUNCEL",
    konu: "Güncel Bilgiler",
    soruMetni: "28-31 Ağustos 2025 tarihlerinde İstanbul Tersanesi'nde düzenlenen TEKNOFEST etkinliğinin adı aşağıdakilerden hangisidir?",
    secenekler: ["TEKNOFEST Gök Vatan", "TEKNOFEST Mavi Vatan", "TEKNOFEST Yeşil Vatan", "TEKNOFEST Kızılelma", "TEKNOFEST Çelik Kubbe"],
    dogruCevap: 1,
    aciklama: "Denizcilik ve deniz teknolojilerine odaklanan etkinlik, “TEKNOFEST Mavi Vatan” adıyla İstanbul Tersanesi'nde düzenlenmiştir.",
  },
];

/**
 * KPSS Önlisans 2. parti - Tarih (27), Coğrafya (18), Vatandaşlık (9), Güncel (6).
 * Haritalar gerçek koordinat/sınır verisiyle, iklim grafiği MGM Konya (1927-2025)
 * normalleriyle; Anayasa soruları 2017 değişikliği sonrası metne (mevzuat.gov.tr) göre;
 * güncel bilgiler 2026-10-14 itibarıyla web kaynaklarından doğrulandı.
 */
import { type SeedSoru, turkiyeHaritasi, iklimGrafigi } from "../kpssDenemeOrtak";

export const SORULAR: SeedSoru[] = [
  // ---- TARİH (27) ----
  {
    ders: "TARIH",
    konu: "İslamiyet Öncesi Türk Kültür ve Medeniyeti",
    soruMetni: "Orhun (Göktürk) Yazıtları ile ilgili aşağıdakilerden hangisi yanlıştır?",
    secenekler: [
      "Uygur Kağanlığı döneminde, Maniheizm'in yayılması amacıyla yazılmıştır.",
      "Türk adının geçtiği ilk Türkçe yazılı belgeler arasındadır.",
      "Kül Tigin, Bilge Kağan ve Tonyukuk adına dikilmiştir.",
      "Göktürk (Köktürk) alfabesiyle yazılmıştır.",
      "Danimarkalı dil bilimci Vilhelm Thomsen tarafından 1893'te okunmuştur.",
    ],
    dogruCevap: 0,
    aciklama:
      "Orhun Yazıtları VIII. yüzyılın ilk yarısında II. Göktürk (Kutluk) Devleti döneminde dikilmiştir; Uygurlarla ve Maniheizm'le ilgisi yoktur. Yazıtlar Göktürk alfabesiyle yazılmış, Türk adının geçtiği ilk Türkçe belgeler arasındadır ve 1893'te Vilhelm Thomsen tarafından çözülmüştür.",
  },
  {
    ders: "TARIH",
    konu: "İlk Türk-İslam Devletleri",
    soruMetni:
      "Büyük Selçuklu Sultanı Tuğrul Bey, 1055'te Bağdat'a girerek Abbasi halifesini Şii Büveyhoğullarının baskısından kurtarmış; halife de Tuğrul Bey'e “Doğunun ve Batının Sultanı” unvanını vermiştir.\n\nBu gelişmenin en önemli sonucu aşağıdakilerden hangisidir?",
    secenekler: [
      "İslam dünyasının siyasi liderliğinin Türklere geçmesi",
      "Anadolu'nun kapılarının Türklere açılması",
      "Türklerle Bizans arasında ilk kez savaş yapılması",
      "Haçlı Seferleri'nin başlaması",
      "Gaznelilerin yıkılarak Horasan'ın Selçuklulara geçmesi",
    ],
    dogruCevap: 0,
    aciklama:
      "Halifenin korunmasıyla Selçuklu sultanları İslam dünyasının siyasi liderliğini üstlenmiştir. Anadolu'nun kapılarının açılması Malazgirt (1071), Bizans'la ilk savaş Pasinler (1048), Horasan'ın alınması Dandanakan (1040) ile ilgilidir; Haçlı Seferleri ise 1096'da başlamıştır.",
  },
  {
    ders: "TARIH",
    konu: "İlk Türk-İslam Kültür ve Medeniyeti",
    soruMetni:
      "Büyük Selçuklu veziri Nizamülmülk, XI. yüzyılın ikinci yarısında Bağdat başta olmak üzere birçok şehirde masrafları devlet ve vakıflarca karşılanan Nizamiye Medreselerini kurdurmuştur.\n\nBu medreselerin kurulma amaçları arasında;\n\nI. Sünni İslam anlayışını güçlendirmek ve Batıni propagandasına karşı koymak,\nII. devletin ihtiyaç duyduğu yetişmiş bilgin ve memurları yetiştirmek,\nIII. Haçlı ordularına karşı düzenli bir askerî birlik oluşturmak\n\nhangileri gösterilebilir?",
    secenekler: ["Yalnız I", "I ve II", "I ve III", "II ve III", "I, II ve III"],
    dogruCevap: 1,
    aciklama:
      "Nizamiye Medreseleri Sünni düşünceyi yaymak, Batınilik gibi akımlara karşı fikrî mücadele vermek ve devlete nitelikli bilgin ve memur yetiştirmek amacıyla kurulmuş eğitim kurumlarıdır. Askerî birlik oluşturmak bu kurumların amacı değildir.",
  },
  {
    ders: "TARIH",
    konu: "İlk Türk-İslam Kültür ve Medeniyeti",
    soruMetni:
      "Büyük Selçuklu Devleti'nde devlet işleri, vezirin başkanlığındaki Büyük Divan'a bağlı alt divanlar tarafından yürütülürdü.\n\nAşağıdaki divan - görev eşleştirmelerinden hangisi yanlıştır?",
    secenekler: [
      "Divan-ı İstifa - Devletin mali işlerini yürütmek",
      "Divan-ı Arz - Ordunun ihtiyaçlarını karşılamak ve asker işlerine bakmak",
      "Divan-ı İşraf - Devletin iç ve dış yazışmalarını yürütmek",
      "Divan-ı Tuğra (İnşa) - Sultanın fermanlarını hazırlamak ve yazışmaları düzenlemek",
      "Divan-ı Mezalim - Halkın şikâyetlerini dinleyip karara bağlamak",
    ],
    dogruCevap: 2,
    aciklama:
      "Divan-ı İşraf, devlet kurumlarının ve görevlilerin denetlenmesinden (teftiş) sorumludur. Devletin iç ve dış yazışmaları Divan-ı Tuğra (Divan-ı İnşa) tarafından yürütülürdü.",
  },
  {
    ders: "TARIH",
    konu: "Osmanlı Kuruluş ve Yükselme",
    soruMetni:
      "Barbaros Hayreddin Paşa komutasındaki Osmanlı donanmasının 1538'de Haçlı donanmasını yendiği Preveze Deniz Savaşı ile ilgili;\n\nI. Akdeniz'de Osmanlı deniz üstünlüğü kesinleşmiştir.\nII. Kanuni Sultan Süleyman döneminde gerçekleşmiştir.\nIII. Osmanlı donanmasının yakılmasıyla sonuçlanmıştır.\n\nifadelerinden hangileri doğrudur?",
    secenekler: ["Yalnız I", "Yalnız II", "Yalnız III", "I ve II", "II ve III"],
    dogruCevap: 3,
    aciklama:
      "Preveze zaferi (1538) Kanuni döneminde kazanılmış ve Akdeniz'de Osmanlı deniz üstünlüğünü kesinleştirmiştir. Osmanlı donanmasının yakılması İnebahtı (1571) ve Çeşme (1770) olaylarıyla ilgilidir.",
  },
  {
    ders: "TARIH",
    konu: "Osmanlı Duraklama (XVII. yy)",
    soruMetni: "1639'da Osmanlı Devleti ile Safeviler arasında imzalanan Kasr-ı Şirin Antlaşması ile ilgili aşağıdakilerden hangisi yanlıştır?",
    secenekler: [
      "Osmanlı Devleti'nin Batı'da ilk kez toprak kaybettiği antlaşmadır.",
      "IV. Murat döneminde imzalanmıştır.",
      "Bağdat Osmanlı Devleti'nde kalmıştır.",
      "Bugünkü Türkiye-İran sınırı büyük ölçüde bu antlaşmayla belirlenmiştir.",
      "İran ile uzun süre devam edecek bir barış dönemi başlamıştır.",
    ],
    dogruCevap: 0,
    aciklama:
      "Kasr-ı Şirin, IV. Murat'ın Bağdat Seferi'nin ardından İran ile imzalanmış; Bağdat Osmanlı'da kalmış, bugünkü Türkiye-İran sınırı büyük ölçüde çizilmiş ve uzun bir barış dönemi başlamıştır. Osmanlı'nın Batı'da büyük çapta toprak kaybettiği ilk antlaşma Karlofça'dır (1699).",
  },
  {
    ders: "TARIH",
    konu: "Osmanlı Gerileme (XVIII. yy)",
    soruMetni: "Aşağıdakilerden hangisi Lale Devri'nde (1718-1730) gerçekleştirilen yeniliklerden biri değildir?",
    secenekler: [
      "İbrahim Müteferrika'nın çabalarıyla ilk Türk matbaasının kurulması",
      "Avrupa başkentlerinde sürekli (daimî) elçiliklerin açılması",
      "Yangınlarla mücadele için Tulumbacı Ocağı'nın kurulması",
      "Paris'e Yirmisekiz Mehmed Çelebi'nin geçici elçi olarak gönderilmesi",
      "Çiçek hastalığına karşı aşı uygulamasının başlatılması",
    ],
    dogruCevap: 1,
    aciklama:
      "Lale Devri'nde Avrupa'ya yalnızca geçici elçiler gönderilmiştir. Avrupa başkentlerinde sürekli elçiliklerin açılması III. Selim döneminde (XVIII. yüzyılın sonu) gerçekleşmiştir. Matbaa, Tulumbacı Ocağı ve çiçek aşısı Lale Devri yeniliklerindendir.",
  },
  {
    ders: "TARIH",
    konu: "Osmanlı Dağılma (XIX. yy)",
    soruMetni:
      "Mısır Valisi Mehmet Ali Paşa İsyanı'nın (1831-1840) sonuçları arasında;\n\nI. Hünkâr İskelesi Antlaşması ile Rusya'nın Boğazlar üzerindeki etkisinin artması,\nII. 1841 Londra Boğazlar Sözleşmesi ile Osmanlı barış içindeyken Boğazların bütün yabancı savaş gemilerine kapatılması,\nIII. Osmanlı Devleti'nin Kırım'ı yeniden topraklarına katması\n\nhangileri gösterilebilir?",
    secenekler: ["Yalnız I", "Yalnız II", "I ve II", "I ve III", "II ve III"],
    dogruCevap: 2,
    aciklama:
      "Mehmet Ali Paşa karşısında Rusya'dan yardım alan Osmanlı, 1833'te Hünkâr İskelesi Antlaşması'nı imzalamış; 1841 Londra Boğazlar Sözleşmesi ile Boğazlar barış zamanında yabancı savaş gemilerine kapatılarak uluslararası bir statü kazanmıştır. Kırım 1783'te Rusya'ya katılmış ve bir daha Osmanlı'ya dönmemiştir.",
  },
  {
    ders: "TARIH",
    konu: "XX. Yüzyılda Osmanlı",
    soruMetni:
      "I. Kafkas Cephesi\nII. Kanal Cephesi\nIII. Çanakkale Cephesi\nIV. Galiçya Cephesi\n\nOsmanlı Devleti'nin I. Dünya Savaşı'nda açtığı yukarıdaki cephelerden hangileri taarruz (saldırı) amacıyla açılmıştır?",
    secenekler: ["I ve II", "I ve III", "II ve IV", "III ve IV", "I, II ve IV"],
    dogruCevap: 0,
    aciklama:
      "Kafkas Cephesi Rusya'ya karşı Turan idealiyle ve kaybedilen toprakları geri almak için, Kanal Cephesi ise İngilizlerin Hindistan ile bağlantısını kesmek ve Mısır'ı geri almak için taarruz amaçlı açılmıştır. Çanakkale savunma, Galiçya ise müttefiklere yardım amaçlı cephedir.",
  },
  {
    ders: "TARIH",
    konu: "Osmanlı Kültür ve Medeniyeti",
    soruMetni:
      "Osmanlı Devleti'nde dirlikler yıllık gelirlerine göre sınıflandırılırdı.\n\nI. Yıllık geliri 15.000 akçe olan bir dirliğin sahibi sipahi\nII. Yıllık geliri 60.000 akçe olan bir dirliğin sahibi alaybeyi\nIII. Yıllık geliri 250.000 akçe olan bir dirliğin sahibi beylerbeyi\n\nYukarıdaki görevlilerin sahip olduğu dirlik türleri sırasıyla aşağıdakilerin hangisinde verilmiştir?",
    secenekler: [
      "Tımar - Has - Zeamet",
      "Zeamet - Tımar - Has",
      "Tımar - Zeamet - Has",
      "Has - Zeamet - Tımar",
      "Zeamet - Has - Tımar",
    ],
    dogruCevap: 2,
    aciklama:
      "Yıllık geliri 3.000-20.000 akçe olan dirlik tımar, 20.000-100.000 akçe olan zeamet, 100.000 akçeden fazla olan ise hastır. Buna göre 15.000 akçe tımar, 60.000 akçe zeamet, 250.000 akçe hastır.",
  },
  {
    ders: "TARIH",
    konu: "Osmanlı Kültür ve Medeniyeti",
    soruMetni:
      "Osmanlı Devleti'nde esnaf ve zanaatkârlar lonca adı verilen meslek örgütlerinde bir araya gelirdi.\n\nLonca teşkilatı ile ilgili;\n\nI. Üretilen malların kalitesi ve satış fiyatları denetlenirdi.\nII. Çıraklıktan kalfalığa ve ustalığa geçiş belirli kurallara ve törenlere bağlıydı.\nIII. Sınırsız rekabet ve kârın en üst düzeye çıkarılması teşvik edilirdi.\n\nifadelerinden hangileri doğrudur?",
    secenekler: ["Yalnız I", "Yalnız III", "I ve III", "II ve III", "I ve II"],
    dogruCevap: 4,
    aciklama:
      "Loncalar mal kalitesini ve fiyatları denetler, meslekte çıraklık-kalfalık-ustalık hiyerarşisini törenlerle sürdürürdü. Lonca anlayışı haksız rekabeti ve aşırı kârı önlemeye dayandığından III. ifade yanlıştır.",
  },
  {
    ders: "TARIH",
    konu: "Osmanlı Kültür ve Medeniyeti",
    grupId: "o2-osmanli-vakif",
    soruMetni:
      "Osmanlı Devleti'nde vakıflar; cami, medrese, imaret, kervansaray, çeşme, köprü ve darüşşifa gibi yapıların kurulmasını ve işletilmesini üstlenmiştir. Vakıf kurucusu, vakfettiği mülkün gelirlerinin hangi amaçlarla harcanacağını vakfiye adı verilen belgede ayrıntılı biçimde belirlerdi. Vakfın yönetimi mütevelli tarafından yürütülür, kadılar da vakıfların vakfiyeye uygun işletilip işletilmediğini denetlerdi.\n\nBu parçaya göre Osmanlı vakıflarıyla ilgili aşağıdakilerden hangisi söylenebilir?",
    secenekler: [
      "Vakıfların yönetimini doğrudan padişah yürütürdü.",
      "Vakıf gelirleri, mütevellinin isteğine göre her alanda harcanabilirdi.",
      "Vakıflar yalnızca dinî nitelikteki yapıların inşasıyla ilgilenirdi.",
      "Günümüzde devletin üstlendiği bazı kamu hizmetleri vakıflar eliyle karşılanırdı.",
      "Vakıfların denetimi sadrazam tarafından yapılırdı.",
    ],
    dogruCevap: 3,
    aciklama:
      "Parçada vakıfların köprü, çeşme, kervansaray ve darüşşifa gibi bugün devletin ve belediyelerin sağladığı hizmetleri üstlendiği belirtilmiştir. Yönetim mütevelliye, denetim kadıya aittir; gelirler vakfiyedeki amaçlara bağlıdır ve hizmetler dinî yapılarla sınırlı değildir.",
  },
  {
    ders: "TARIH",
    konu: "Osmanlı Kültür ve Medeniyeti",
    grupId: "o2-osmanli-vakif",
    soruMetni:
      "Osmanlı Devleti'nde vakıflar; cami, medrese, imaret, kervansaray, çeşme, köprü ve darüşşifa gibi yapıların kurulmasını ve işletilmesini üstlenmiştir. Vakıf kurucusu, vakfettiği mülkün gelirlerinin hangi amaçlarla harcanacağını vakfiye adı verilen belgede ayrıntılı biçimde belirlerdi. Vakfın yönetimi mütevelli tarafından yürütülür, kadılar da vakıfların vakfiyeye uygun işletilip işletilmediğini denetlerdi.\n\nParçada vakıfları denetlediği belirtilen kadılar, Osmanlı taşra yönetiminde aşağıdaki görevlerden hangisini üstlenmezdi?",
    secenekler: [
      "Davalara bakıp karar vermek",
      "Narh (fiyat) belirlemek ve esnafı denetlemek",
      "Evlenme, boşanma ve miras işlemlerini kayda geçirmek",
      "Sancağın askerî yönetimini ve tımarlı sipahilerin komutasını yürütmek",
      "Merkezden gönderilen fermanların uygulanmasını sağlamak",
    ],
    dogruCevap: 3,
    aciklama:
      "Kadı; yargı, belediye (narh, esnaf denetimi), noterlik ve yönetim işlerini yürütürdü. Sancağın askerî yönetimi ve tımarlı sipahilerin komutası sancakbeyinin görevidir.",
  },
  {
    ders: "TARIH",
    konu: "Millî Mücadele",
    soruMetni:
      "22 Haziran 1919'da yayımlanan Amasya Genelgesi'nde yer alan;\n\nI. Vatanın bütünlüğü, milletin bağımsızlığı tehlikededir.\nII. İstanbul Hükûmeti üzerine aldığı sorumluluğun gereğini yerine getirememektedir.\nIII. Milletin bağımsızlığını yine milletin azim ve kararı kurtaracaktır.\n\nkararlarından hangisinde millî egemenlik anlayışı ilk kez açıkça ortaya konmuştur?",
    secenekler: ["Yalnız I", "Yalnız II", "Yalnız III", "I ve II", "II ve III"],
    dogruCevap: 2,
    aciklama:
      "“Milletin bağımsızlığını yine milletin azim ve kararı kurtaracaktır.” kararı, kurtuluşun padişah veya İstanbul Hükûmetinden değil milletten beklendiğini göstererek millî egemenlik anlayışını ilk kez ortaya koymuştur. I. karar Millî Mücadele'nin gerekçesini, II. karar ise İstanbul Hükûmetine güvensizliği yansıtır.",
  },
  {
    ders: "TARIH",
    konu: "Millî Mücadele",
    soruMetni: "Aşağıdakilerden hangisi Erzurum Kongresi'nin (23 Temmuz-7 Ağustos 1919) özelliklerinden biri değildir?",
    secenekler: [
      "Toplanış bakımından bölgesel, aldığı kararlar bakımından ulusal nitelikte olması",
      "Manda ve himayenin kabul edilemeyeceğinin ilk kez kesin olarak belirtilmesi",
      "Temsil Heyeti'nin seçilmesi",
      "Millî sınırlar içinde vatanın bir bütün olduğu ve parçalanamayacağının vurgulanması",
      "Ali Fuat Paşa'nın Batı Anadolu Kuvayımilliye Komutanlığına atanmasına karar verilmesi",
    ],
    dogruCevap: 4,
    aciklama:
      "Ali Fuat Paşa'nın Batı Anadolu Kuvayımilliye Komutanlığına atanması Sivas Kongresi'nde kararlaştırılmıştır. Diğer seçenekler Erzurum Kongresi'nin özellikleridir.",
  },
  {
    ders: "TARIH",
    konu: "Millî Mücadele",
    soruMetni:
      "23 Nisan 1920'de açılan Türkiye Büyük Millet Meclisi ile ilgili;\n\nI. Yasama ve yürütme yetkilerini kendisinde toplamıştır.\nII. Meclis Hükûmeti sistemini uygulamıştır.\nIII. Açılışıyla birlikte saltanatın kaldırıldığını ilan etmiştir.\n\nifadelerinden hangileri doğrudur?",
    secenekler: ["Yalnız I", "I ve II", "I ve III", "II ve III", "I, II ve III"],
    dogruCevap: 1,
    aciklama:
      "I. TBMM güçler birliği ilkesine dayanmış, yasama ve yürütme yetkilerini kendinde toplamış ve bakanları (vekilleri) kendi üyeleri arasından seçerek Meclis Hükûmeti sistemini uygulamıştır. Saltanat ise 1 Kasım 1922'de kaldırılmıştır.",
  },
  {
    ders: "TARIH",
    konu: "Millî Mücadele",
    soruMetni: "Aşağıdakilerden hangisi Sakarya Meydan Muharebesi'nin (23 Ağustos-13 Eylül 1921) sonuçlarından biri değildir?",
    secenekler: [
      "Mustafa Kemal'e TBMM tarafından mareşal rütbesi ve gazi unvanı verilmesi",
      "Fransa ile Ankara Antlaşması'nın imzalanması",
      "Kafkas cumhuriyetleriyle Kars Antlaşması'nın imzalanması",
      "Başkomutanlık Kanunu'nun çıkarılması",
      "Türk ordusunun savunmadan taarruza geçme sürecinin başlaması",
    ],
    dogruCevap: 3,
    aciklama:
      "Başkomutanlık Kanunu, Kütahya-Eskişehir Savaşları'ndaki yenilgiden sonra, Sakarya'dan önce 5 Ağustos 1921'de çıkarılmıştır. Gazilik ve mareşallik, Kars Antlaşması (13 Ekim 1921) ve Ankara Antlaşması (20 Ekim 1921) Sakarya zaferinin sonuçlarıdır.",
  },
  {
    ders: "TARIH",
    konu: "İnkılap Tarihi",
    soruMetni:
      "I. Halifeliğin kaldırılması\nII. Cumhuriyetin ilan edilmesi\nIII. Saltanatın kaldırılması\nIV. Kadınlara milletvekili seçme ve seçilme hakkının tanınması\n\nYukarıdaki gelişmelerin kronolojik sıralaması aşağıdakilerden hangisidir?",
    secenekler: ["II - III - I - IV", "III - II - I - IV", "III - I - II - IV", "II - I - III - IV", "III - II - IV - I"],
    dogruCevap: 1,
    aciklama:
      "Saltanat 1 Kasım 1922'de kaldırılmış, Cumhuriyet 29 Ekim 1923'te ilan edilmiş, halifelik 3 Mart 1924'te kaldırılmış, kadınlara milletvekili seçme ve seçilme hakkı ise 5 Aralık 1934'te tanınmıştır.",
  },
  {
    ders: "TARIH",
    konu: "İnkılap Tarihi",
    soruMetni:
      "Türkiye'de laikleşme süreciyle ilgili;\n\nI. 1928'de “Devletin dini, din-i İslam'dır.” ifadesi Anayasa'dan çıkarılmıştır.\nII. Laiklik ilkesi 1937'de Anayasa'ya girmiştir.\nIII. Halifeliğin kaldırılması bu sürecin önemli adımlarından biridir.\n\nifadelerinden hangileri doğrudur?",
    secenekler: ["Yalnız I", "I ve II", "I ve III", "II ve III", "I, II ve III"],
    dogruCevap: 4,
    aciklama:
      "1924 Anayasası'ndaki devletin dinine ilişkin hüküm 1928'de çıkarılmış, laiklik 1937'de diğer ilkelerle birlikte Anayasa'ya girmiştir. 1924'te halifeliğin kaldırılması da din ve devlet işlerinin ayrılması yolunda önemli bir adımdır.",
  },
  {
    ders: "TARIH",
    konu: "İnkılap Tarihi",
    soruMetni: "17 Şubat-4 Mart 1923 tarihleri arasında toplanan İzmir İktisat Kongresi ile ilgili aşağıdakilerden hangisi söylenemez?",
    secenekler: [
      "Devletçilik ilkesine geçilerek Birinci Beş Yıllık Sanayi Planı'nın uygulanmasına karar verilmiştir.",
      "Lozan Barış Konferansı'ndaki görüşmelerin kesintiye uğradığı dönemde toplanmıştır.",
      "Çiftçi, tüccar, sanayici ve işçi temsilcileri katılmıştır.",
      "Misak-ı İktisadi (Ekonomik Ant) kabul edilmiştir.",
      "Yerli malı kullanımının yaygınlaştırılması kararlaştırılmıştır.",
    ],
    dogruCevap: 0,
    aciklama:
      "İzmir İktisat Kongresi'nde özel girişimciliği destekleyen bir ekonomi modeli benimsenmiştir. Devletçilik politikasına 1929 Dünya Ekonomik Bunalımı'nın ardından 1930'larda geçilmiş, Birinci Beş Yıllık Sanayi Planı 1934'te uygulamaya konmuştur.",
  },
  {
    ders: "TARIH",
    konu: "İnkılap Tarihi",
    soruMetni: "Aşağıdakilerden hangisi toplumsal hayatın düzenlenmesi alanında yapılan inkılaplardan biri değildir?",
    secenekler: [
      "Şapka Kanunu'nun kabulü",
      "Soyadı Kanunu'nun kabulü",
      "Ölçüler Kanunu'nun kabulü",
      "Bazı Kisvelerin Giyilemeyeceğine Dair Kanun'un kabulü",
      "Türk Ticaret Kanunu'nun kabulü",
    ],
    dogruCevap: 4,
    aciklama:
      "Türk Ticaret Kanunu (1926), ticari hayatı düzenleyen bir hukuk inkılabıdır. Şapka Kanunu (1925), Ölçüler Kanunu (1931), Soyadı Kanunu ve kılık kıyafete ilişkin kanun (1934) toplumsal hayatı düzenleyen inkılaplardır.",
  },
  {
    ders: "TARIH",
    konu: "İnkılap Tarihi",
    soruMetni:
      "1 Kasım 1928'de kabul edilen Türk Harflerinin Kabul ve Tatbiki Hakkında Kanun'un ardından, 1929 başından itibaren okuma yazma bilmeyen yetişkinlere yeni harfleri öğretmek amacıyla ülke genelinde Millet Mektepleri açılmıştır.\n\nBu uygulamayla ilgili;\n\nI. Okuryazar oranının kısa sürede artırılması amaçlanmıştır.\nII. Eğitimin yalnızca okul çağındaki çocuklarla sınırlı tutulmadığını gösterir.\nIII. Bütün eğitim ve öğretim kurumlarının Maarif Vekâletine bağlanmasını sağlamıştır.\n\nyargılarından hangilerine ulaşılabilir?",
    secenekler: ["Yalnız I", "Yalnız II", "Yalnız III", "I ve II", "II ve III"],
    dogruCevap: 3,
    aciklama:
      "Millet Mektepleri yeni harflerin halka hızla öğretilmesi ve okuryazar oranının artırılması için açılmış; yetişkinleri de kapsadığından eğitimin okul çağıyla sınırlı olmadığını göstermiştir. Eğitim kurumlarının Maarif Vekâletine bağlanması ise 3 Mart 1924'te kabul edilen Tevhid-i Tedrisat Kanunu ile gerçekleşmiştir.",
  },
  {
    ders: "TARIH",
    konu: "Atatürk Dönemi İç ve Dış Politika",
    soruMetni:
      "I. Türkiye'nin Milletler Cemiyeti'ne üye olması\nII. Montrö Boğazlar Sözleşmesi'nin imzalanması\nIII. Balkan Antantı'nın kurulması\nIV. Sadabat Paktı'nın imzalanması\n\nAtatürk dönemi dış politikasına ait yukarıdaki gelişmelerin kronolojik sıralaması aşağıdakilerden hangisidir?",
    secenekler: ["I - II - III - IV", "III - I - II - IV", "I - III - IV - II", "I - III - II - IV", "III - I - IV - II"],
    dogruCevap: 3,
    aciklama:
      "Türkiye 1932'de Milletler Cemiyeti'ne üye olmuş, Balkan Antantı 1934'te kurulmuş, Montrö Boğazlar Sözleşmesi Temmuz 1936'da, Sadabat Paktı ise Temmuz 1937'de imzalanmıştır.",
  },
  {
    ders: "TARIH",
    konu: "Çağdaş Türk ve Dünya Tarihi",
    soruMetni:
      "Türkiye, II. Dünya Savaşı boyunca tarafsızlığını korumaya çalışmış; ancak 23 Şubat 1945'te Almanya ve Japonya'ya savaş ilan etmiştir.\n\nTürkiye'nin savaşın sonlarında bu kararı almasının temel nedeni aşağıdakilerden hangisidir?",
    secenekler: [
      "Birleşmiş Milletlerin kuruluş konferansına katılma hakkı elde etmek",
      "Hatay'ı Türkiye topraklarına katmak",
      "Boğazların yönetimini yeniden düzenlemek",
      "NATO'ya üye olabilmek",
      "Marshall Planı'ndan yararlanabilmek",
    ],
    dogruCevap: 0,
    aciklama:
      "Yalta Konferansı'nda, 1 Mart 1945'e kadar Mihver Devletleri'ne savaş ilan eden devletlerin San Francisco'daki kuruluş konferansına çağrılması kararlaştırılmıştı. Türkiye bu nedenle savaş ilan etmiş ve BM'nin kurucu üyeleri arasında yer almıştır. Hatay 1939'da katılmış, Montrö 1936'da imzalanmış, Marshall Planı 1948'de başlamış, NATO üyeliği 1952'de gerçekleşmiştir.",
  },
  {
    ders: "TARIH",
    konu: "Çağdaş Türk ve Dünya Tarihi",
    soruMetni:
      "1962'de Sovyetler Birliği'nin Küba'ya nükleer füze yerleştirmesiyle başlayan Küba Füze Bunalımı, ABD ile SSCB arasındaki bir uzlaşmayla sona ermiştir.\n\nBu bunalımın Türkiye'yi doğrudan etkileyen sonucu aşağıdakilerden hangisidir?",
    secenekler: [
      "Türkiye'nin NATO'ya üye olması",
      "Türkiye'deki Jüpiter füzelerinin sökülmesi",
      "ABD'nin Türkiye'ye silah ambargosu uygulaması",
      "Türkiye'nin Bağdat Paktı'na katılması",
      "Truman Doktrini kapsamında Türkiye'ye yardım yapılması",
    ],
    dogruCevap: 1,
    aciklama:
      "Bunalım, SSCB'nin Küba'daki füzeleri, ABD'nin de Türkiye'deki Jüpiter füzelerini sökmesiyle çözülmüştür. Bu gelişme, Türkiye'de ABD'ye karşı güven sorgulamasına ve çok yönlü dış politika arayışına yol açmıştır. Diğer seçenekler farklı dönemlere aittir (1952, 1975, 1955, 1947).",
  },
  {
    ders: "TARIH",
    konu: "Çağdaş Türk ve Dünya Tarihi",
    soruMetni:
      "Kıbrıs sorunuyla ilgili;\n\nI. Türkiye, 1974'te 1960 Garanti Antlaşması'ndan doğan garantör devlet hakkına dayanarak Kıbrıs Barış Harekâtı'nı düzenlemiştir.\nII. Harekâtın ardından ABD, Türkiye'ye silah ambargosu uygulamıştır.\nIII. Kuzey Kıbrıs Türk Cumhuriyeti harekâtın hemen ardından 1974'te ilan edilmiştir.\n\nifadelerinden hangileri doğrudur?",
    secenekler: ["Yalnız I", "Yalnız II", "I ve II", "I ve III", "II ve III"],
    dogruCevap: 2,
    aciklama:
      "Kıbrıs Barış Harekâtı 20 Temmuz 1974'te garantörlük hakkına dayanılarak başlatılmış, ABD 1975-1978 arasında Türkiye'ye silah ambargosu uygulamıştır. Harekâttan sonra 1975'te Kıbrıs Türk Federe Devleti kurulmuş, KKTC ise 15 Kasım 1983'te ilan edilmiştir.",
  },
  {
    ders: "TARIH",
    konu: "Çağdaş Türk ve Dünya Tarihi",
    soruMetni: "Aşağıdakilerden hangisi Soğuk Savaş döneminin sona erdiğini gösteren gelişmelerden biri değildir?",
    secenekler: [
      "Kuzey Atlantik Antlaşması Örgütünün (NATO) kurulması",
      "Berlin Duvarı'nın yıkılması",
      "Doğu ve Batı Almanya'nın birleşmesi",
      "Varşova Paktı'nın dağılması",
      "Sovyetler Birliği'nin dağılması",
    ],
    dogruCevap: 0,
    aciklama:
      "NATO 1949'da, Soğuk Savaş'ın başlangıç döneminde kurulmuştur. Berlin Duvarı'nın yıkılması (1989), Almanya'nın birleşmesi (1990), Varşova Paktı'nın ve SSCB'nin dağılması (1991) Soğuk Savaş'ın sona erdiğini gösterir.",
  },

  // ---- COĞRAFYA (18) ----
  {
    ders: "COGRAFYA",
    konu: "Coğrafi Konum",
    soruMetni:
      "Haritada Türkiye'deki bazı merkezler numaralandırılarak gösterilmiştir.\n\nBu merkezlerden 21 Haziran'da gündüz süresinin en uzun olduğu, öğle vakti Güneş ışınlarının yıl boyunca en büyük açıyla geldiği ve yerel saatin en ileri olduğu merkezler sırasıyla hangileridir?",
    gorselSvg: turkiyeHaritasi({
      noktalar: [
        { etiket: "I", boylam: 26.56, enlem: 41.68 }, // Edirne
        { etiket: "II", boylam: 35.15, enlem: 42.03 }, // Sinop
        { etiket: "III", boylam: 44.04, enlem: 39.92 }, // Igdir
        { etiket: "IV", boylam: 30.7, enlem: 36.89 }, // Antalya
        { etiket: "V", boylam: 36.16, enlem: 36.2 }, // Antakya
      ],
    }),
    secenekler: ["I - IV - III", "II - V - III", "II - IV - V", "I - V - II", "III - V - I"],
    dogruCevap: 1,
    aciklama:
      "Kuzey Yarım Küre'de 21 Haziran'da kuzeye gidildikçe gündüz uzar; en kuzeydeki II (Sinop, yaklaşık 42° K) en uzun gündüzü yaşar. Dönencenin kuzeyinde Güneş ışınları güneye gidildikçe daha dik gelir; en güneydeki V (Antakya, yaklaşık 36° K) en büyük açıyı alır. Yerel saat doğuya gidildikçe ilerler; en doğudaki III (Iğdır, yaklaşık 44° D) en ileri yerel saate sahiptir.",
  },
  {
    ders: "COGRAFYA",
    konu: "Coğrafi Konum",
    soruMetni:
      "Türkiye'de görülen;\n\nI. Kuzey Anadolu Dağları'nın kıyıya paralel uzanması nedeniyle Karadeniz kıyılarında yağışın fazla olması,\nII. Güneş ışınlarının yıl içinde hiçbir yere dik açıyla gelmemesi,\nIII. Doğudan batıya gidildikçe yerel saatin geri kalması,\nIV. Asya ile Avrupa arasında köprü konumunda olması\n\ndurumlarından hangileri Türkiye'nin matematik (mutlak) konumunun sonucudur?",
    secenekler: ["I ve II", "I ve IV", "II ve III", "III ve IV", "II, III ve IV"],
    dogruCevap: 2,
    aciklama:
      "Işınların dik gelmemesi Türkiye'nin Yengeç Dönencesi'nin kuzeyinde olmasıyla (enlem), yerel saat farkı ise boylamla ilgili olduğundan matematik konumun sonuçlarıdır. Dağların uzanışına bağlı yağış (yer şekilleri) ve kıtalar arası köprü olma ise özel konumla ilgilidir.",
  },
  {
    ders: "COGRAFYA",
    konu: "İklim ve Bitki Örtüsü",
    soruMetni:
      "Grafiklerde bir meteoroloji istasyonuna ait uzun yıllar aylık ortalama sıcaklık ve aylık ortalama yağış değerleri verilmiştir.\n\nBu istasyonla ilgili;\n\nI. Yıllık sıcaklık farkı 20 °C'den fazladır.\nII. En az yağış yaz aylarında düşer.\nIII. Yıllık toplam yağış 600 mm'nin üzerindedir.\nIV. Doğal bitki örtüsü bozkırdır.\n\nifadelerinden hangileri doğrudur?",
    // MGM, Konya uzun yillar (1927-2025) aylik ortalamalari.
    gorselSvg: iklimGrafigi(
      [-0.1, 1.4, 5.6, 11.1, 15.8, 20.2, 23.6, 23.4, 18.9, 12.8, 6.6, 1.8],
      [37.3, 28.1, 29.2, 31.4, 43.4, 25.4, 7.6, 6.2, 13.6, 29.1, 32.1, 43.0],
    ),
    secenekler: ["I ve II", "II ve III", "I, II ve III", "I, II ve IV", "II, III ve IV"],
    dogruCevap: 3,
    aciklama:
      "Grafikte en sıcak ay yaklaşık 24 °C, en soğuk ay yaklaşık 0 °C olduğundan yıllık sıcaklık farkı 20 °C'yi aşar (I doğru). En az yağış temmuz-ağustosta düşer (II doğru). Aylık yağışların hiçbiri 50 mm'ye ulaşmaz; yıllık toplam yaklaşık 326 mm'dir (III yanlış). Bu, İç Anadolu'daki karasal iklimdir ve doğal bitki örtüsü bozkırdır (IV doğru). Veriler: MGM, Konya 1927-2025.",
  },
  {
    ders: "COGRAFYA",
    konu: "İklim ve Bitki Örtüsü",
    soruMetni:
      "Doğu Karadeniz kıyısından Kaçkar Dağları'nın zirvesine doğru çıkan bir araştırmacının sırasıyla karşılaştığı doğal bitki örtüsü kuşakları aşağıdakilerden hangisinde doğru verilmiştir?",
    secenekler: [
      "Geniş yapraklı orman - Karışık orman - İğne yapraklı orman - Alpin çayır",
      "İğne yapraklı orman - Geniş yapraklı orman - Karışık orman - Alpin çayır",
      "Maki - Geniş yapraklı orman - İğne yapraklı orman - Bozkır",
      "Karışık orman - Geniş yapraklı orman - Alpin çayır - İğne yapraklı orman",
      "Geniş yapraklı orman - Alpin çayır - Karışık orman - İğne yapraklı orman",
    ],
    dogruCevap: 0,
    aciklama:
      "Yükseldikçe sıcaklık azaldığından Doğu Karadeniz'de kıyıdan itibaren nemli ve ılıman koşulları seven geniş yapraklı ormanlar, ardından karışık ormanlar, daha soğuk kesimlerde iğne yapraklı ormanlar yer alır. Orman üst sınırının üzerinde ise yaz yağışlarıyla yeşeren alpin çayırlar görülür.",
  },
  {
    ders: "COGRAFYA",
    konu: "Fiziki Özellikler",
    soruMetni: "Haritada numaralandırılarak gösterilen dağlardan hangisi oluşumu bakımından diğerlerinden farklıdır?",
    gorselSvg: turkiyeHaritasi({
      noktalar: [
        { etiket: "I", boylam: 35.45, enlem: 38.53 }, // Erciyes
        { etiket: "II", boylam: 34.17, enlem: 38.13 }, // Hasan Dagi
        { etiket: "III", boylam: 42.23, enlem: 38.65 }, // Nemrut Dagi (Bitlis)
        { etiket: "IV", boylam: 29.22, enlem: 40.07 }, // Uludag
        { etiket: "V", boylam: 44.3, enlem: 39.7 }, // Agri Dagi
      ],
    }),
    secenekler: ["I", "II", "III", "IV", "V"],
    dogruCevap: 3,
    aciklama:
      "I Erciyes, II Hasan Dağı, III Nemrut Dağı ve V Ağrı Dağı volkanik dağlardır. IV Uludağ ise kırılma (faylanma) ile yükselmiş bir kütle dağıdır; volkanik değildir.",
  },
  {
    ders: "COGRAFYA",
    konu: "Fiziki Özellikler",
    soruMetni:
      "Kalker, jips ve kaya tuzu gibi kolay eriyebilen kayaçların bulunduğu alanlarda suyun kimyasal eritme etkisiyle karstik şekiller oluşur.\n\nAşağıdakilerden hangisi karstik aşınım şekillerinden biri değildir?",
    secenekler: ["Peri bacası", "Lapya", "Dolin", "Uvala", "Polye"],
    dogruCevap: 0,
    aciklama:
      "Lapya, dolin, uvala ve polye suyun kalkerli arazilerde eritmesiyle oluşan karstik aşınım şekilleridir. Peri bacaları ise volkanik tüflerin sel suları ve rüzgâr tarafından farklı aşındırılmasıyla oluşur.",
  },
  {
    ders: "COGRAFYA",
    konu: "Fiziki Özellikler",
    soruMetni: "Aşağıdaki kıyı tipi - Türkiye'deki örnek eşleştirmelerinden hangisi yanlıştır?",
    secenekler: [
      "Fiyort kıyı - Doğu Karadeniz kıyıları",
      "Enine kıyı - Ege kıyıları",
      "Boyuna kıyı - Karadeniz kıyıları",
      "Ria kıyı - İstanbul Boğazı ve Haliç",
      "Dalmaçya kıyı - Antalya'nın batısındaki Kaş-Kekova kıyıları",
    ],
    dogruCevap: 0,
    aciklama:
      "Fiyortlar, buzul vadilerinin deniz suları altında kalmasıyla oluşur ve Türkiye'de görülmez (Norveç kıyıları gibi). Doğu Karadeniz kıyıları, dağların kıyıya paralel uzandığı boyuna kıyılardır.",
  },
  {
    ders: "COGRAFYA",
    konu: "Fiziki Özellikler",
    soruMetni: "Aşağıdaki yörelerden hangisinde deprem riskinin diğerlerine göre daha az olması beklenir?",
    secenekler: [
      "Kuzey Anadolu Fay Hattı üzerindeki Bolu-Düzce çevresi",
      "Ege'deki Büyük ve Küçük Menderes grabenleri",
      "Doğu Anadolu Fay Hattı üzerindeki Malatya-Kahramanmaraş çevresi",
      "Konya-Karaman çevresi",
      "İzmit Körfezi çevresi",
    ],
    dogruCevap: 3,
    aciklama:
      "Konya-Karaman çevresi büyük ve aktif fay hatlarından uzak olduğundan Türkiye'de deprem riskinin en düşük olduğu yöreler arasındadır. Diğer seçeneklerdeki yöreler Kuzey Anadolu, Doğu Anadolu ve Ege graben sistemlerindeki aktif faylar üzerindedir.",
  },
  {
    ders: "COGRAFYA",
    konu: "Nüfus ve Yerleşme",
    soruMetni:
      "Tunceli, Türkiye'de nüfus yoğunluğu en az olan illerden biridir.\n\nBu durumun nedenleri arasında;\n\nI. arazinin engebeli ve ortalama yükseltinin fazla olması,\nII. sanayi ve iş olanaklarının sınırlı olması,\nIII. kışların uzun ve sert geçmesi,\nIV. denize kıyısı olmasına rağmen limanının bulunmaması\n\nhangileri gösterilebilir?",
    secenekler: ["I ve II", "II ve IV", "I, II ve III", "I, III ve IV", "II, III ve IV"],
    dogruCevap: 2,
    aciklama:
      "Tunceli'de engebeli ve yüksek arazi, sert karasal kışlar ve sınırlı iş olanakları nüfusun seyrek olmasına yol açar. Tunceli Doğu Anadolu'da, denize kıyısı olmayan bir ildir; bu nedenle IV. ifade geçersizdir.",
  },
  {
    ders: "COGRAFYA",
    konu: "Nüfus ve Yerleşme",
    soruMetni: "Doğu Karadeniz Bölümü'nde kırsal yerleşmelerin genellikle dağınık bir görünüm sergilemesinin temel nedeni aşağıdakilerden hangisidir?",
    secenekler: [
      "Yaz kuraklığı nedeniyle su kaynaklarının çevresinde toplanma gereği",
      "Geniş ve düz tarım alanlarının bulunması",
      "Arazinin engebeli olması, su kaynaklarının bol olması ve tarım alanlarının parçalı olması",
      "Sanayi tesislerinin kırsal alanlara dağılmış olması",
      "Güvenlik kaygısıyla evlerin birbirine yakın yapılması",
    ],
    dogruCevap: 2,
    aciklama:
      "Doğu Karadeniz'de her mevsim yağışlı iklim nedeniyle su her yerde kolayca bulunur; engebeli arazide küçük ve dağınık tarım alanları bulunduğundan evler tarlaların ve bahçelerin yanına dağınık biçimde kurulur. Kuraklık ve güvenlik kaygısı ise toplu yerleşmeye yol açar.",
  },
  {
    ders: "COGRAFYA",
    konu: "Tarım",
    soruMetni: "Aşağıdaki tarım ürünü - üretimin yoğunlaştığı yöre eşleştirmelerinden hangisi yanlıştır?",
    secenekler: [
      "Şeker pancarı - Rize ve Artvin kıyıları",
      "Ayçiçeği - Trakya (Ergene Havzası)",
      "Fındık - Karadeniz kıyıları",
      "Muz - Anamur ve Alanya çevresi",
      "Haşhaş - Afyonkarahisar çevresi",
    ],
    dogruCevap: 0,
    aciklama:
      "Şeker pancarı, karasal iklimin görüldüğü İç Anadolu (özellikle Konya) ve geçiş bölgelerinde yetiştirilir. Her mevsim yağışlı Rize ve Artvin kıyılarında ise çay tarımı yaygındır.",
  },
  {
    ders: "COGRAFYA",
    konu: "Hayvancılık",
    soruMetni:
      "İç Anadolu'da küçükbaş hayvancılık, Erzurum-Kars Platosu'nda ise büyükbaş hayvancılık daha yaygındır.\n\nBu farklılığın temel nedeni aşağıdakilerden hangisidir?",
    secenekler: [
      "Nüfus yoğunluklarının farklı olması",
      "Doğal bitki örtüsünün bozkır ve gür çayırlar şeklinde farklılaşması",
      "Pazara uzaklıklarının farklı olması",
      "Sanayileşme düzeylerinin farklı olması",
      "Deniz etkisinin farklı olması",
    ],
    dogruCevap: 1,
    aciklama:
      "İç Anadolu'da yazın kuruyan cılız bozkırlar daha az otla yetinebilen küçükbaş hayvanlar için uygundur. Erzurum-Kars Platosu'nda yaz yağışlarıyla yeşeren gür çayırlar ise büyükbaş hayvancılığa elverişlidir.",
  },
  {
    ders: "COGRAFYA",
    konu: "Madenler ve Enerji Kaynakları",
    soruMetni:
      "Haritada taralı olarak gösterilen illerde kurulan büyük termik santrallerde yakıt olarak ağırlıklı biçimde kullanılan enerji kaynağı aşağıdakilerden hangisidir?",
    gorselSvg: turkiyeHaritasi({ taraliIller: ["Kahramanmaraş", "Manisa", "Kütahya", "Muğla"] }),
    secenekler: ["Taş kömürü", "Doğal gaz", "Petrol", "Jeotermal enerji", "Linyit"],
    dogruCevap: 4,
    aciklama:
      "Taralı iller Kahramanmaraş (Afşin-Elbistan), Manisa (Soma), Kütahya (Tunçbilek, Seyitömer) ve Muğla'dır (Yatağan, Yeniköy, Kemerköy). Bu illerdeki termik santraller yakınlarındaki linyit yataklarından beslenir. Taş kömürü Zonguldak havzasında çıkarılır.",
  },
  {
    ders: "COGRAFYA",
    konu: "Madenler ve Enerji Kaynakları",
    soruMetni:
      "Türkiye'de jeotermal enerji ile ilgili;\n\nI. Türkiye'nin ilk jeotermal elektrik santrali Denizli'nin Sarayköy ilçesindeki Kızıldere'de kurulmuştur.\nII. Jeotermal kaynaklar, fay hatlarının yoğun olduğu Ege Bölgesi'nde yaygındır.\nIII. Jeotermal enerji, yenilenemeyen fosil bir enerji kaynağıdır.\n\nifadelerinden hangileri doğrudur?",
    secenekler: ["Yalnız I", "I ve II", "I ve III", "II ve III", "I, II ve III"],
    dogruCevap: 1,
    aciklama:
      "Türkiye'nin ilk jeotermal elektrik santrali Kızıldere'de (Denizli-Sarayköy) kurulmuştur. Jeotermal kaynaklar faylarla parçalanmış Ege'de yaygındır. Jeotermal enerji yer ısısından yararlanan yenilenebilir bir kaynaktır; fosil yakıt değildir.",
  },
  {
    ders: "COGRAFYA",
    konu: "Sanayi",
    soruMetni: "Aşağıdakilerden hangisi Türkiye'de sanayinin Marmara Bölgesi'nde yoğunlaşmasının nedenlerinden biri değildir?",
    secenekler: [
      "Yer altı kaynakları bakımından Türkiye'nin en zengin bölgesi olması",
      "Ulaşım olanaklarının gelişmiş olması",
      "Tüketim pazarının büyük olması",
      "Sermaye birikiminin fazla olması",
      "Nitelikli iş gücünün bol olması",
    ],
    dogruCevap: 0,
    aciklama:
      "Marmara Bölgesi, maden ve enerji kaynakları bakımından Türkiye'nin en zengin bölgesi değildir; sanayi ham maddeyi büyük ölçüde başka bölgelerden ve dışarıdan sağlar. Gelişmiş ulaşım, büyük pazar, sermaye ve nitelikli iş gücü ise yoğunlaşmanın temel nedenleridir.",
  },
  {
    ders: "COGRAFYA",
    konu: "Ulaşım",
    soruMetni:
      "Bakü-Tiflis-Ceyhan (BTC) Ham Petrol Boru Hattı'nın geçtiği ülkeler ve hattın Türkiye'deki son noktasının bulunduğu il aşağıdakilerin hangisinde birlikte doğru verilmiştir?",
    secenekler: [
      "Azerbaycan, Ermenistan, Türkiye - Adana",
      "Azerbaycan, Gürcistan, Türkiye - Mersin",
      "Rusya, Gürcistan, Türkiye - Hatay",
      "Azerbaycan, İran, Türkiye - Adana",
      "Azerbaycan, Gürcistan, Türkiye - Adana",
    ],
    dogruCevap: 4,
    aciklama:
      "BTC boru hattı Azerbaycan'ın başkenti Bakü'den başlar, Gürcistan'ın başkenti Tiflis'ten geçer ve Adana'nın Ceyhan ilçesindeki Yumurtalık terminalinde sona erer.",
  },
  {
    ders: "COGRAFYA",
    konu: "Ticaret",
    soruMetni:
      "Türkiye'nin dış ticaretiyle ilgili;\n\nI. Dış ticarette en büyük pay deniz yoluyla taşınır.\nII. İthalatın değeri genellikle ihracatın değerinden fazladır.\nIII. İhracatta tarım ürünlerinin payı sanayi ürünlerinin payından fazladır.\n\nifadelerinden hangileri doğrudur?",
    secenekler: ["Yalnız I", "Yalnız III", "I ve II", "I ve III", "II ve III"],
    dogruCevap: 2,
    aciklama:
      "Türkiye'nin dış ticaretinde en büyük pay deniz yoluna aittir ve ülke genellikle dış ticaret açığı verir (ithalat ihracattan fazladır). İhracatın büyük bölümünü ise sanayi ürünleri oluşturur; III. ifade yanlıştır.",
  },
  {
    ders: "COGRAFYA",
    konu: "Turizm",
    soruMetni: "Aşağıdaki turizm türü - Türkiye'deki merkez eşleştirmelerinden hangisi yanlıştır?",
    secenekler: [
      "Kış turizmi - Palandöken (Erzurum)",
      "Termal turizm - Pamukkale (Denizli)",
      "İnanç turizmi - Meryem Ana Evi (İzmir)",
      "Kültür turizmi - Göbeklitepe (Şanlıurfa)",
      "Kıyı turizmi - Sarıkamış (Kars)",
    ],
    dogruCevap: 4,
    aciklama:
      "Sarıkamış, Kars'ta denize kıyısı olmayan bir ilçedir ve kayak merkeziyle kış turizminde öne çıkar. Diğer eşleştirmeler doğrudur.",
  },

  // ---- VATANDAŞLIK (9) ----
  {
    ders: "VATANDASLIK",
    konu: "Temel Hukuk Kavramları",
    soruMetni:
      "Türk Medeni Kanunu'na göre;\n\nI. Kişilik, çocuğun sağ olarak tamamen doğduğu anda başlar ve ölümle sona erer.\nII. Çocuk, hak ehliyetini sağ doğmak koşuluyla ana rahmine düştüğü andan başlayarak elde eder.\nIII. Hak ehliyetine sahip olmak için ayırt etme gücüne sahip olmak gerekir.\n\nifadelerinden hangileri doğrudur?",
    secenekler: ["Yalnız I", "Yalnız II", "I ve II", "II ve III", "I, II ve III"],
    dogruCevap: 2,
    aciklama:
      "Türk Medeni Kanunu'nun 28. maddesine göre kişilik sağ ve tam doğumla başlar, ölümle sona erer; cenin de sağ doğmak koşuluyla ana rahmine düştüğü andan itibaren hak ehliyetine sahiptir. Her insan hak ehliyetine sahiptir; ayırt etme gücü hak ehliyetinin değil fiil ehliyetinin koşuludur.",
  },
  {
    ders: "VATANDASLIK",
    konu: "Temel Hukuk Kavramları",
    soruMetni:
      "I. Borcunu ödemeyen bir kişinin malları haczedilip satılarak alacaklının alacağının ödenmesi\nII. Hukuka aykırı bir idari işlemin idare mahkemesi kararıyla ortadan kaldırılması\nIII. Başkasına haksız yere zarar veren kişinin bu zararı parayla karşılamaya mahkûm edilmesi\n\nYukarıdaki durumlarda uygulanan yaptırım türleri sırasıyla aşağıdakilerin hangisinde verilmiştir?",
    secenekler: [
      "Ceza - İptal - Tazminat",
      "Cebri icra - Hükümsüzlük - Ceza",
      "Tazminat - İptal - Cebri icra",
      "Cebri icra - İptal - Tazminat",
      "Cebri icra - Tazminat - İptal",
    ],
    dogruCevap: 3,
    aciklama:
      "Borcun devlet gücüyle zorla yerine getirilmesi cebri icra, hukuka aykırı idari işlemin yargı kararıyla ortadan kaldırılması iptal, hukuka aykırı eylemle verilen zararın giderilmesi ise tazminattır.",
  },
  {
    ders: "VATANDASLIK",
    konu: "Temel Hukuk Kavramları",
    soruMetni: "Herkese karşı ileri sürülebilen haklara mutlak haklar denir.\n\nAşağıdakilerden hangisi mutlak haklardan biri değildir?",
    secenekler: ["Mülkiyet hakkı", "Kişilik hakkı", "Fikrî hak (telif hakkı)", "İpotek hakkı", "Alacak hakkı"],
    dogruCevap: 4,
    aciklama:
      "Alacak hakkı yalnızca borçluya karşı ileri sürülebildiğinden nispi bir haktır. Mülkiyet ve ipotek gibi ayni haklar, kişilik hakları ve fikrî haklar herkese karşı ileri sürülebilen mutlak haklardır.",
  },
  {
    ders: "VATANDASLIK",
    konu: "Yasama",
    soruMetni: "1982 Anayasası'na göre aşağıdakilerden hangisi Türkiye Büyük Millet Meclisinin görev ve yetkilerinden biri değildir?",
    secenekler: [
      "Bütçe ve kesin hesap kanun tekliflerini görüşmek ve kabul etmek",
      "Para basılmasına ve savaş ilanına karar vermek",
      "Milletlerarası antlaşmaların onaylanmasını uygun bulmak",
      "Olağanüstü hâl ilan etmek",
      "Üye tam sayısının beşte üç çoğunluğunun kararıyla genel ve özel af ilanına karar vermek",
    ],
    dogruCevap: 3,
    aciklama:
      "Anayasa'nın 119. maddesine göre olağanüstü hâli Cumhurbaşkanı ilan eder; karar aynı gün TBMM'nin onayına sunulur. Diğer seçenekler 87. maddede sayılan TBMM görev ve yetkileridir.",
  },
  {
    ders: "VATANDASLIK",
    konu: "Yürütme",
    soruMetni: "1982 Anayasası'nın güncel hâline göre Cumhurbaşkanlığı kararnameleriyle ilgili aşağıdakilerden hangisi yanlıştır?",
    secenekler: [
      "Cumhurbaşkanı, yürütme yetkisine ilişkin konularda Cumhurbaşkanlığı kararnamesi çıkarabilir.",
      "Temel haklar, kişi hakları ve ödevleri ile siyasi haklar ve ödevler Cumhurbaşkanlığı kararnamesiyle düzenlenemez.",
      "TBMM'nin aynı konuda kanun çıkarması durumunda Cumhurbaşkanlığı kararnamesi yürürlüğünü korur.",
      "Kanunda açıkça düzenlenen konularda Cumhurbaşkanlığı kararnamesi çıkarılamaz.",
      "Cumhurbaşkanlığı kararnamesi ile kanunlarda farklı hükümler bulunması hâlinde kanun hükümleri uygulanır.",
    ],
    dogruCevap: 2,
    aciklama:
      "Anayasa'nın 104. maddesine göre TBMM'nin aynı konuda kanun çıkarması durumunda Cumhurbaşkanlığı kararnamesi hükümsüz hâle gelir. Diğer ifadeler aynı maddede yer alır.",
  },
  {
    ders: "VATANDASLIK",
    konu: "Yürütme",
    soruMetni: "1982 Anayasası'na göre Cumhurbaşkanı yardımcıları ve bakanlarla ilgili aşağıdakilerden hangisi yanlıştır?",
    secenekler: [
      "Milletvekili seçilme yeterliliğine sahip olanlar arasından Cumhurbaşkanı tarafından atanır ve görevden alınır.",
      "Bakan olarak atanan milletvekilinin TBMM üyeliği devam eder.",
      "TBMM önünde ant içerler.",
      "Cumhurbaşkanına karşı sorumludurlar.",
      "Cumhurbaşkanının hastalık gibi sebeplerle geçici olarak görevinden ayrılması hâlinde Cumhurbaşkanı yardımcısı Cumhurbaşkanına vekâlet eder.",
    ],
    dogruCevap: 1,
    aciklama:
      "Anayasa'nın 106. maddesine göre TBMM üyeleri Cumhurbaşkanı yardımcısı veya bakan olarak atanırlarsa üyelikleri sona erer. Diğer ifadeler aynı maddede yer alır.",
  },
  {
    ders: "VATANDASLIK",
    konu: "Yargı",
    soruMetni: "1982 Anayasası'nın güncel hâline göre Anayasa Mahkemesiyle ilgili aşağıdakilerden hangisi yanlıştır?",
    secenekler: [
      "On beş üyeden oluşur.",
      "Üyelerinin üçünü TBMM, on ikisini Cumhurbaşkanı seçer.",
      "Üyeler on iki yıl için seçilir ve bir kimse iki defa üye seçilemez.",
      "Kararları kesindir; yasama, yürütme ve yargı organlarını bağlar.",
      "İptal kararları geriye yürür.",
    ],
    dogruCevap: 4,
    aciklama:
      "Anayasa'nın 153. maddesine göre iptal kararları geriye yürümez. 2017 değişikliğiyle askerî yüksek mahkemelerin kaldırılması üzerine üye sayısı 17'den 15'e inmiş; üç üyeyi TBMM, on iki üyeyi Cumhurbaşkanı seçer. Üyeler on iki yıl için seçilir ve iki defa seçilemez.",
  },
  {
    ders: "VATANDASLIK",
    konu: "İdare Hukuku",
    soruMetni:
      "Bir belediye başkanı, kamu yararı gözetmeksizin yalnızca kişisel husumet beslediği bir kişiyi zarara uğratmak amacıyla onun işyerinin ruhsatını iptal etmiştir.\n\nBu işlem, idari işlemin hangi unsuru bakımından hukuka aykırıdır?",
    secenekler: ["Yetki", "Şekil", "Sebep", "Konu", "Amaç (maksat)"],
    dogruCevap: 4,
    aciklama:
      "İdari işlemlerin amacı her zaman kamu yararıdır. Kişisel husumetle, kamu yararı dışındaki bir amaçla yapılan işlem amaç (maksat) unsuru bakımından hukuka aykırıdır ve yetki saptırması olarak adlandırılır.",
  },
  {
    ders: "VATANDASLIK",
    konu: "İdare Hukuku",
    soruMetni:
      "1982 Anayasası'na göre İçişleri Bakanı, görevleriyle ilgili bir suç sebebiyle hakkında soruşturma veya kovuşturma açılan mahallî idare organlarını ya da bu organların üyelerini, geçici bir tedbir olarak kesin hükme kadar görevden uzaklaştırabilir.\n\nMerkezî idareye tanınan bu yetki aşağıdaki kavramlardan hangisiyle ilgilidir?",
    secenekler: ["Hiyerarşi", "İdari vesayet", "Yetki genişliği", "Yetki devri", "Kamu hizmeti"],
    dogruCevap: 1,
    aciklama:
      "Merkezî idarenin, kendisine hiyerarşiyle bağlı olmayan yerinden yönetim kuruluşları üzerinde kanunla tanınan sınırlı denetim yetkisine idari vesayet denir (Anayasa m. 127). Hiyerarşi ise merkezî idare içindeki üst-ast ilişkisini ifade eder.",
  },

  // ---- GÜNCEL BİLGİLER (6) ----
  // Her bilgi 2026-10-14 itibarıyla web kaynaklarından doğrulandı.
  {
    ders: "GUNCEL",
    konu: "Güncel Bilgiler",
    soruMetni: "2026 Nobel Fizik Ödülü'ne layık görülen Belçika asıllı fizikçi Francis Halzen'in ödüle konu olan çalışmaları aşağıdakilerden hangisiyle ilgilidir?",
    secenekler: [
      "Kütle çekim dalgalarının gözlenmesi",
      "Yapay sinir ağlarıyla makine öğrenmesinin temellerinin atılması",
      "Güney Kutbu'ndaki IceCube Gözlemevi ile astrofiziksel kökenli yüksek enerjili nötrinoların keşfi",
      "Attosaniyelik ışık atımlarının üretilmesi",
      "Galaksimizin merkezindeki süper kütleli kara deliğin keşfi",
    ],
    dogruCevap: 2,
    aciklama:
      "Ödül, 6 Ekim 2026'da Francis Halzen'e IceCube Nötrino Gözlemevi'ne yaptığı belirleyici katkılar ve astrofiziksel kökenli yüksek enerjili nötrinoların keşfi nedeniyle verilmiştir. Diğer seçenekler 2017, 2024, 2023 ve 2020 Nobel Fizik ödüllerinin konularıdır.",
  },
  {
    ders: "GUNCEL",
    konu: "Güncel Bilgiler",
    soruMetni:
      "2026 Nobel ödülleriyle ilgili;\n\nI. Tıp Ödülü, ışıkla etkinleşen iyon kanalları ve optogenetik alanındaki keşifleri nedeniyle Karl Deisseroth, Peter Hegemann ve Georg Nagel'e verilmiştir.\nII. Kimya Ödülü, asimetrik organik sentezde doğrusal olmayan etkiler ve otokatalizin keşfi nedeniyle Henri Kagan ve Kenso Soai'ye verilmiştir.\nIII. İktisat Ödülü, kurumların nasıl oluştuğu ve refahı nasıl etkilediğine ilişkin çalışmaları nedeniyle Daron Acemoğlu'na verilmiştir.\n\nifadelerinden hangileri doğrudur?",
    secenekler: ["Yalnız I", "Yalnız III", "I ve III", "I ve II", "II ve III"],
    dogruCevap: 3,
    aciklama:
      "2026 Tıp Ödülü 5 Ekim'de optogenetik çalışmaları nedeniyle Deisseroth, Hegemann ve Nagel'e; Kimya Ödülü 7 Ekim'de Kagan ve Soai'ye verilmiştir. 2026 İktisat Ödülü ise 12 Ekim'de makroekonomik istikrar politikalarına yönelik çalışmaları nedeniyle Robert E. Hall ve Michael Woodford'a verilmiştir; Daron Acemoğlu bu ödülü 2024'te almıştır.",
  },
  {
    ders: "GUNCEL",
    konu: "Güncel Bilgiler",
    soruMetni:
      "Kasım 2026'da Türkiye'nin ev sahipliğinde düzenlenecek Birleşmiş Milletler İklim Değişikliği Çerçeve Sözleşmesi 31. Taraflar Konferansı (COP31) ile ilgili;\n\nI. Antalya'da yapılacaktır.\nII. Müzakerelere başkanlık görevini Avustralya yürütecektir.\nIII. Bir önceki konferans (COP30) Brezilya'nın Belém kentinde yapılmıştır.\n\nifadelerinden hangileri doğrudur?",
    secenekler: ["Yalnız I", "I ve II", "I ve III", "II ve III", "I, II ve III"],
    dogruCevap: 4,
    aciklama:
      "COP30'da (Belém, Kasım 2025) varılan uzlaşmaya göre COP31, 9-20 Kasım 2026'da Antalya'da Türkiye'nin ev sahipliğinde düzenlenecek; müzakere başkanlığını ise Avustralya üstlenecektir.",
  },
  {
    ders: "GUNCEL",
    konu: "Güncel Bilgiler",
    soruMetni: "20 Mayıs 2026'da İstanbul'daki Beşiktaş Stadyumu'nda oynanan UEFA Avrupa Ligi finalinde SC Freiburg'u 3-0 yenerek kupayı kazanan takım aşağıdakilerden hangisidir?",
    secenekler: ["Tottenham Hotspur", "Aston Villa", "Atalanta", "Manchester United", "Roma"],
    dogruCevap: 1,
    aciklama: "Aston Villa, 20 Mayıs 2026'da İstanbul'da oynanan finalde Freiburg'u 3-0 yenerek ilk kez UEFA Avrupa Ligi şampiyonu olmuştur.",
  },
  {
    ders: "GUNCEL",
    konu: "Güncel Bilgiler",
    soruMetni: "6-22 Şubat 2026 tarihlerinde düzenlenen XXV. Kış Olimpiyat Oyunları'na ev sahipliği yapan şehirler aşağıdakilerin hangisinde verilmiştir?",
    secenekler: [
      "Pekin (Çin)",
      "Pyeongchang (Güney Kore)",
      "Fransız Alpleri (Fransa)",
      "Soçi (Rusya)",
      "Milano ve Cortina d'Ampezzo (İtalya)",
    ],
    dogruCevap: 4,
    aciklama:
      "2026 Kış Olimpiyat Oyunları İtalya'da, Milano ve Cortina d'Ampezzo'nun ortak ev sahipliğinde düzenlenmiştir. Pekin 2022, Pyeongchang 2018, Soçi 2014 oyunlarına ev sahipliği yapmış; 2030 oyunları Fransız Alpleri'nde yapılacaktır.",
  },
  {
    ders: "GUNCEL",
    konu: "Güncel Bilgiler",
    soruMetni: "TEKNOFEST 2026'nın ana festivali, 30 Eylül-4 Ekim 2026 tarihlerinde aşağıdaki illerden hangisinde düzenlenmiştir?",
    secenekler: ["Diyarbakır", "Şanlıurfa", "Gaziantep", "Mardin", "Malatya"],
    dogruCevap: 1,
    aciklama: "TEKNOFEST 2026, 30 Eylül-4 Ekim 2026 tarihlerinde Şanlıurfa GAP Havalimanı'nda “TEKNOFEST Güneydoğu” adıyla düzenlenmiştir.",
  },
];

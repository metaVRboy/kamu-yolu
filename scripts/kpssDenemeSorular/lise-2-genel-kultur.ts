import { type SeedSoru, turkiyeHaritasi, iklimGrafigi } from "../kpssDenemeOrtak";

// KPSS Ortaöğretim 2. parti: Tarih (27), Coğrafya (18), Vatandaşlık (9), Güncel Bilgiler (6).
export const SORULAR: SeedSoru[] = [
  // ---- TARİH (27) ----
  {
    ders: "TARIH",
    konu: "İlk Türk Devletleri",
    soruMetni:
      "Asya Hun Devleti ile ilgili;\nI. Mete Han döneminde ordu, onlu sisteme göre teşkilatlandırılmıştır.\nII. Çinliler, Hun akınlarından korunmak amacıyla Çin Seddi'ni inşa etmiştir.\nIII. “Türk” adını devletin resmî adı olarak kullanan ilk Türk devletidir.\nifadelerinden hangileri doğrudur?",
    secenekler: ["Yalnız I", "Yalnız III", "I ve II", "II ve III", "I, II ve III"],
    dogruCevap: 2,
    aciklama:
      "Onlu sistem Mete Han döneminde kurulmuş, Çin Seddi Hun akınlarına karşı yapılmıştır. “Türk” adını resmî devlet adı olarak ilk kullanan devlet ise Göktürklerdir; III yanlıştır.",
  },
  {
    ders: "TARIH",
    konu: "Türk-İslam Devletleri",
    soruMetni:
      "751'de Abbasiler ile Çin arasında yapılan ve Karlukların Abbasileri desteklemesiyle Çin'in yenilgisiyle sonuçlanan Talas Savaşı ile ilgili aşağıdakilerden hangisi söylenemez?",
    secenekler: [
      "Türklerin İslamiyet'e geçiş süreci hızlanmıştır.",
      "Çin'in Orta Asya'daki ilerleyişi durdurulmuştur.",
      "Kâğıt yapım tekniği İslam dünyasına geçmiştir.",
      "Türk-Arap ilişkilerinde yakınlaşma dönemi başlamıştır.",
      "Anadolu'nun kapıları Türklere kesin olarak açılmıştır.",
    ],
    dogruCevap: 4,
    aciklama:
      "Anadolu'nun kapılarının Türklere açılması, Büyük Selçukluların Bizans'ı yendiği Malazgirt Savaşı'nın (1071) sonucudur. Diğer seçenekler Talas Savaşı'nın sonuçlarıdır.",
  },
  {
    ders: "TARIH",
    konu: "Türk-İslam Devletleri",
    soruMetni:
      "Büyük Selçuklu Devleti'nde uygulanan ikta sistemiyle;\nI. devlet hazinesine yük olmadan büyük bir ordu beslenmesi,\nII. toprakta üretimin kesintisiz sürmesi,\nIII. ülke topraklarının hanedan üyeleri arasında paylaştırılması\namaçlarından hangilerine ulaşılmak istenmiştir?",
    secenekler: ["Yalnız I", "I ve II", "Yalnız III", "I ve III", "II ve III"],
    dogruCevap: 1,
    aciklama:
      "İkta sisteminde vergi geliri, karşılığında asker beslemek şartıyla görevlilere bırakılır; böylece hazineye yük olmadan ordu beslenir ve toprak boş bırakılmaz. Ülkenin hanedan üyeleri arasında paylaştırılması ikta değil, “ülke hanedanın ortak malıdır” anlayışıdır.",
  },
  {
    ders: "TARIH",
    konu: "Osmanlı Devleti",
    soruMetni:
      "Osmanlı Devleti'nin kuruluş döneminde yaptığı;\nI. Sırpsındığı Savaşı,\nII. Koyunhisar (Bafeus) Savaşı,\nIII. I. Kosova Savaşı,\nIV. Niğbolu Savaşı\nsavaşlarının kronolojik sıralaması aşağıdakilerden hangisidir?",
    secenekler: ["I, II, III, IV", "I, III, II, IV", "II, III, I, IV", "II, I, III, IV", "III, II, IV, I"],
    dogruCevap: 3,
    aciklama:
      "Koyunhisar (1302) Bizans ile yapılan ilk savaştır. Bunu Sırpsındığı (1364), I. Kosova (1389) ve Niğbolu (1396) izler: II, I, III, IV.",
  },
  {
    ders: "TARIH",
    konu: "Osmanlı Devleti",
    soruMetni:
      "Fatih Sultan Mehmet dönemiyle ilgili;\nI. Kanunname-i Âl-i Osman ile devlet teşkilatına ilişkin kurallar yazılı hâle getirilmiştir.\nII. Trabzon Rum İmparatorluğu'na son verilmiştir.\nIII. Mısır alınarak halifelik Osmanlı hanedanına geçmiştir.\nifadelerinden hangileri doğrudur?",
    secenekler: ["Yalnız I", "Yalnız II", "I ve II", "I ve III", "I, II ve III"],
    dogruCevap: 2,
    aciklama:
      "Kanunname-i Âl-i Osman ve Trabzon'un alınması (1461) Fatih dönemine aittir. Mısır Seferi (1516-1517) ve halifeliğin Osmanlılara geçmesi ise Yavuz Sultan Selim dönemindedir.",
  },
  {
    ders: "TARIH",
    konu: "Osmanlı Devleti",
    soruMetni:
      "Klasik dönem Osmanlı dirlik sisteminde, yıllık geliri 20.000 ile 100.000 akçe arasında olan ve genellikle orta dereceli yönetici ve kumandanlara verilen dirliğe ne ad verilir?",
    secenekler: ["Tımar", "Has", "Mülk", "Vakıf", "Zeamet"],
    dogruCevap: 4,
    aciklama:
      "Dirlikler gelirine göre üçe ayrılır: tımar 3.000-20.000, zeamet 20.000-100.000, has 100.000 akçe üzeri. Mülk ve vakıf ise dirlik değil, farklı arazi statüleridir.",
  },
  {
    ders: "TARIH",
    konu: "Osmanlı Devleti",
    soruMetni: "Divan-ı Hümayun üyeleri ile görevleri eşleştirilmiştir.\n\nBu eşleştirmelerden hangisi yanlıştır?",
    secenekler: [
      "Defterdar - Padişah fermanlarına tuğra çekmek",
      "Kazasker - Adalet ve eğitim işlerine bakmak",
      "Nişancı - Tımar ve arazi kayıtlarını tutmak",
      "Kaptan-ı derya - Donanma işlerinden sorumlu olmak",
      "Sadrazam - Padişahın mutlak vekili olarak Divan'a başkanlık etmek",
    ],
    dogruCevap: 0,
    aciklama:
      "Defterdar mali işlerden (bütçe, gelir-gider) sorumludur. Fermanlara tuğra çekmek nişancının görevidir; diğer eşleştirmeler doğrudur.",
  },
  {
    ders: "TARIH",
    konu: "Osmanlı Devleti",
    soruMetni:
      "Osmanlı Devleti'nin ilk kez büyük çapta toprak kaybettiği ve Avrupa karşısındaki üstünlüğünü yitirerek savunma politikasına geçtiği antlaşma aşağıdakilerden hangisidir?",
    secenekler: ["Zitvatorok Antlaşması", "Karlofça Antlaşması", "Prut Antlaşması", "Pasarofça Antlaşması", "Belgrad Antlaşması"],
    dogruCevap: 1,
    aciklama:
      "II. Viyana Kuşatması'nın ardından imzalanan Karlofça Antlaşması (1699) ile Osmanlı ilk kez büyük toprak kaybı yaşamıştır. Zitvatorok (1606) eşitlik, Prut (1711) ve Belgrad (1739) ise kazanç getiren antlaşmalardır; Pasarofça (1718) Karlofça'dan sonradır.",
  },
  {
    ders: "TARIH",
    konu: "Osmanlı Devleti",
    soruMetni:
      "I. Takvim-i Vekayi gazetesinin çıkarılması\nII. Avrupa başkentlerinde daimî elçilikler açılması\nIII. Mühendishane-i Berri Hümayun'un açılması\n\nYukarıdaki gelişmelerden hangileri III. Selim döneminde gerçekleşmiştir?",
    secenekler: ["Yalnız I", "Yalnız II", "I ve III", "II ve III", "I, II ve III"],
    dogruCevap: 3,
    aciklama:
      "III. Selim döneminde Londra'dan başlayarak daimî elçilikler açılmış (1793) ve Mühendishane-i Berri Hümayun kurulmuştur (1795). İlk resmî gazete Takvim-i Vekayi ise II. Mahmut döneminde (1831) çıkarılmıştır.",
  },
  {
    ders: "TARIH",
    konu: "Osmanlı Devleti",
    soruMetni: "Aşağıdakilerden hangisi 1839'da ilan edilen Tanzimat Fermanı'nın getirdiği yeniliklerden biri değildir?",
    secenekler: [
      "Halkın seçtiği temsilcilerden oluşan bir meclisin açılması",
      "Herkesin can, mal ve namus güvenliğinin devlet güvencesine alınması",
      "Yargılamanın açık yapılması ve mahkeme kararı olmadan kimseye ceza verilmemesi",
      "Vergilerin herkesin gelirine göre alınması",
      "Kanun üstünlüğü ilkesinin kabul edilmesi",
    ],
    dogruCevap: 0,
    aciklama:
      "Halkın temsilcilerinden oluşan meclis (Meclis-i Mebusan), Kanun-ı Esasi ile ilan edilen I. Meşrutiyet döneminde (1876-1877) açılmıştır. Diğer seçenekler Tanzimat Fermanı'nın hükümleridir.",
  },
  {
    ders: "TARIH",
    konu: "Osmanlı Devleti",
    soruMetni:
      "Kırım Savaşı'nın ardından imzalanan 1856 Paris Antlaşması ile ilgili;\nI. Karadeniz tarafsız hâle getirilmiştir.\nII. Osmanlı Devleti, Avrupa devleti sayılmış ve Avrupa hukukundan yararlanma hakkı kazanmıştır.\nIII. Kırım, yeniden Osmanlı Devleti'ne bağlanmıştır.\nifadelerinden hangileri doğrudur?",
    secenekler: ["Yalnız I", "Yalnız II", "I ve II", "I ve III", "II ve III"],
    dogruCevap: 2,
    aciklama:
      "Paris Antlaşması ile Karadeniz tarafsızlaştırılmış ve Osmanlı Devleti Avrupa devleti kabul edilmiştir. Kırım 1783'te Rusya'ya katılmıştır ve Paris Antlaşması ile Osmanlı'ya geri verilmemiştir.",
  },
  {
    ders: "TARIH",
    konu: "Osmanlı Devleti",
    soruMetni:
      "Trablusgarp Savaşı'nın ardından 1912'de imzalanan; Trablusgarp ve Bingazi'nin İtalya'ya bırakıldığı, Oniki Ada'nın ise geçici olarak İtalya'nın yönetiminde kaldığı antlaşma aşağıdakilerden hangisidir?",
    secenekler: ["Uşi (Ouchy) Antlaşması", "Londra Antlaşması", "Bükreş Antlaşması", "Atina Antlaşması", "İstanbul Antlaşması"],
    dogruCevap: 0,
    aciklama:
      "Uşi Antlaşması (1912) ile Trablusgarp ve Bingazi İtalya'ya bırakılmıştır. Londra, Bükreş, Atina ve İstanbul antlaşmaları Balkan Savaşları sonrasında imzalanmıştır.",
  },
  {
    ders: "TARIH",
    konu: "Kurtuluş Savaşı",
    soruMetni: "Aşağıdakilerden hangisi Sivas Kongresi'nde alınıp Erzurum Kongresi kararlarında yer almayan kararlardandır?",
    secenekler: [
      "Manda ve himaye kabul edilemez.",
      "Millî sınırlar içinde vatan bir bütündür, parçalanamaz.",
      "Kuvâ-yı Millîye'yi etken, millî iradeyi hâkim kılmak esastır.",
      "Bütün millî cemiyetler “Anadolu ve Rumeli Müdafaa-i Hukuk Cemiyeti” adı altında birleştirilmiştir.",
      "Kongre adına çalışmak üzere bir Temsil Heyeti seçilmiştir.",
    ],
    dogruCevap: 3,
    aciklama:
      "Millî cemiyetlerin tek çatı altında birleştirilmesi Sivas Kongresi'nin kararıdır. Manda ve himayenin reddi, vatanın bütünlüğü, Kuvâ-yı Millîye'nin etken kılınması ve Temsil Heyeti'nin seçilmesi Erzurum Kongresi'nde de yer almıştır.",
  },
  {
    ders: "TARIH",
    konu: "Kurtuluş Savaşı",
    soruMetni:
      "Doğu Cephesi'nde Ermenilere karşı kazanılan başarının ardından imzalanan ve TBMM'nin uluslararası alanda imzaladığı ilk antlaşma olan antlaşma aşağıdakilerden hangisidir?",
    secenekler: ["Moskova Antlaşması", "Ankara Antlaşması", "Kars Antlaşması", "Mudanya Ateşkes Antlaşması", "Gümrü Antlaşması"],
    dogruCevap: 4,
    aciklama:
      "Gümrü Antlaşması (3 Aralık 1920), TBMM'nin imzaladığı ilk uluslararası antlaşmadır. Moskova (Mart 1921), Ankara (Ekim 1921), Kars (Ekim 1921) ve Mudanya (Ekim 1922) daha sonradır.",
  },
  {
    ders: "TARIH",
    konu: "Kurtuluş Savaşı",
    soruMetni: "Aşağıdakilerden hangisi Sakarya Meydan Muharebesi'nin sonuçlarından biri değildir?",
    secenekler: [
      "TBMM tarafından Mustafa Kemal'e mareşal rütbesi ve gazi unvanı verilmesi",
      "Başkomutanlık Kanunu'nun çıkarılması",
      "Fransa ile Ankara Antlaşması'nın imzalanması",
      "Kafkas cumhuriyetleriyle Kars Antlaşması'nın imzalanması",
      "Türk ordusunun 1683'ten beri süren geri çekilişinin sona ermesi",
    ],
    dogruCevap: 1,
    aciklama:
      "Başkomutanlık Kanunu, Kütahya-Eskişehir yenilgisinin ardından 5 Ağustos 1921'de, yani Sakarya Muharebesi'nden önce çıkarılmıştır. Diğer seçenekler Sakarya zaferinin sonuçlarıdır.",
  },
  {
    ders: "TARIH",
    konu: "Atatürk İlke ve İnkılapları",
    soruMetni:
      "1934'te çıkarılan bir kanunla “ağa, hacı, hafız, efendi, bey, paşa” gibi lakap ve unvanların kaldırılması, en çok aşağıdaki Atatürk ilkelerinden hangisiyle ilişkilidir?",
    secenekler: ["Halkçılık", "Devletçilik", "Laiklik", "Milliyetçilik", "İnkılapçılık"],
    dogruCevap: 0,
    aciklama:
      "Lakap ve unvanların kaldırılması, toplumda sınıf ve ayrıcalık farklarını ortadan kaldırıp kanun önünde eşitliği hedeflediği için halkçılık ilkesiyle ilişkilidir.",
  },
  {
    ders: "TARIH",
    konu: "Atatürk İlke ve İnkılapları",
    soruMetni:
      "I. Halifeliğin kaldırılması\nII. “Devletin dini İslam'dır.” ifadesinin anayasadan çıkarılması\nIII. Laiklik ilkesinin anayasaya girmesi\nIV. Tekke, zaviye ve türbelerin kapatılması\n\nLaikleşme sürecindeki yukarıdaki gelişmelerin kronolojik sıralaması aşağıdakilerden hangisidir?",
    secenekler: ["I, II, IV, III", "IV, I, II, III", "I, II, III, IV", "II, I, IV, III", "I, IV, II, III"],
    dogruCevap: 4,
    aciklama:
      "Halifelik 3 Mart 1924'te kaldırılmış, tekke ve zaviyeler 1925'te kapatılmış, “Devletin dini İslam'dır.” ifadesi 1928'de anayasadan çıkarılmış, laiklik 1937'de anayasaya girmiştir: I, IV, II, III.",
  },
  {
    ders: "TARIH",
    konu: "Atatürk İlke ve İnkılapları",
    soruMetni: "Aşağıdakilerden hangisi 1926'da kabul edilen Türk Medeni Kanunu ile sağlanan haklardan biri değildir?",
    secenekler: [
      "Resmî nikâh zorunluluğunun getirilmesi ve tek eşliliğin esas alınması",
      "Mirasta kadın ve erkeğe eşit pay verilmesi",
      "Kadınlara milletvekili seçme ve seçilme hakkının tanınması",
      "Boşanma hakkının kadına da tanınması",
      "Mahkemede kadının tanıklığının erkeğinkiyle eşit sayılması",
    ],
    dogruCevap: 2,
    aciklama:
      "Kadınlar milletvekili seçme ve seçilme hakkını 5 Aralık 1934'te yapılan anayasa değişikliğiyle kazanmıştır. Diğer seçenekler Türk Medeni Kanunu'nun aile ve kadın haklarına ilişkin düzenlemeleridir.",
  },
  {
    ders: "TARIH",
    konu: "Atatürk İlke ve İnkılapları",
    soruMetni:
      "3 Mart 1924'te kabul edilen; ülkedeki bütün eğitim ve öğretim kurumlarını Maarif Vekâletine bağlayarak eğitimde birliği sağlayan kanun aşağıdakilerden hangisidir?",
    secenekler: ["Takrir-i Sükûn Kanunu", "Teşkilât-ı Esasiye Kanunu", "Hıyanet-i Vataniye Kanunu", "Soyadı Kanunu", "Tevhid-i Tedrisat Kanunu"],
    dogruCevap: 4,
    aciklama:
      "Tevhid-i Tedrisat (Öğretim Birliği) Kanunu ile medreseler kapatılmış, tüm okullar Maarif Vekâletine bağlanmıştır. Aynı gün halifelik de kaldırılmıştır.",
  },
  {
    ders: "TARIH",
    konu: "Atatürk İlke ve İnkılapları",
    soruMetni:
      "1926'da çıkarılan ve Türk karasularında yük ile yolcu taşıma, kılavuzluk gibi hakları yalnızca Türk vatandaşlarına ve Türk gemilerine tanıyarak denizcilikteki yabancı ayrıcalıklarına son veren kanun aşağıdakilerden hangisidir?",
    secenekler: ["Teşvik-i Sanayi Kanunu", "Kabotaj Kanunu", "Aşar Vergisinin Kaldırılması Kanunu", "Ölçüler Kanunu", "Tevhid-i Tedrisat Kanunu"],
    dogruCevap: 1,
    aciklama:
      "Kabotaj Kanunu 1 Temmuz 1926'da yürürlüğe girmiş, karasularındaki taşımacılık hakkını Türk gemilerine vermiştir; 1 Temmuz bu nedenle Denizcilik ve Kabotaj Bayramı olarak kutlanır.",
  },
  {
    ders: "TARIH",
    konu: "Atatürk İlke ve İnkılapları",
    soruMetni:
      "1936'da imzalanan Montrö Boğazlar Sözleşmesi ile ilgili;\nI. Boğazlar Komisyonu kaldırılmış, yetkileri Türkiye'ye devredilmiştir.\nII. Türkiye, Boğazlar bölgesinde asker bulundurma ve bölgeyi silahlandırma hakkı kazanmıştır.\nIII. Hatay sorunu bu sözleşmeyle Türkiye lehine çözülmüştür.\nifadelerinden hangileri doğrudur?",
    secenekler: ["Yalnız I", "I ve II", "I ve III", "II ve III", "I, II ve III"],
    dogruCevap: 1,
    aciklama:
      "Montrö ile Lozan'da kurulan Boğazlar Komisyonu kaldırılmış ve Türkiye Boğazlar üzerinde tam egemenlik kazanmıştır. Hatay ise 1939'da Hatay Meclisinin kararıyla Türkiye'ye katılmıştır; Montrö'yle ilgisi yoktur.",
  },
  {
    ders: "TARIH",
    konu: "Atatürk İlke ve İnkılapları",
    soruMetni:
      "Çok partili hayata geçiş denemeleri kapsamında Atatürk'ün isteğiyle Ali Fethi (Okyar) Bey tarafından 1930'da kurulan ve aynı yıl içinde kendini feshederek siyasi hayattan çekilen parti aşağıdakilerden hangisidir?",
    secenekler: [
      "Terakkiperver Cumhuriyet Fırkası",
      "Ahali Cumhuriyet Fırkası",
      "Millî Kalkınma Partisi",
      "Serbest Cumhuriyet Fırkası",
      "Demokrat Parti",
    ],
    dogruCevap: 3,
    aciklama:
      "Serbest Cumhuriyet Fırkası Ağustos 1930'da kurulmuş, Kasım 1930'da kendini feshetmiştir. Terakkiperver Cumhuriyet Fırkası 1924-1925 yıllarında, Millî Kalkınma Partisi 1945'te, Demokrat Parti 1946'da kurulmuştur.",
  },
  {
    ders: "TARIH",
    konu: "Atatürk İlke ve İnkılapları",
    grupId: "l2o-tarih-1921-anayasa",
    soruMetni:
      "20 Ocak 1921'de kabul edilen Teşkilât-ı Esasiye Kanunu'nda egemenliğin kayıtsız şartsız millete ait olduğu belirtilmiş, yasama ve yürütme yetkileri Türkiye Büyük Millet Meclisinde toplanmıştır. Kanunda devletin adı “Türkiye Devleti” olarak geçmiş, ancak saltanat ve halifelik makamlarına hiç değinilmemiştir. Ayrıca illere yerel işlerde geniş yetkiler tanınmış, yargıya ilişkin bir düzenlemeye yer verilmemiştir. Olağanüstü savaş koşullarında hazırlanan bu kanun, 1924 Anayasası kabul edilinceye kadar yürürlükte kalmıştır.\n\nBu parçaya göre 1921 Anayasası ile ilgili aşağıdakilerden hangisi söylenebilir?",
    secenekler: [
      "Kuvvetler ayrılığı ilkesini esas almıştır.",
      "Saltanatın kaldırıldığını ilan etmiştir.",
      "Yargı bağımsızlığını güvence altına almıştır.",
      "Millî egemenlik anlayışını temel almıştır.",
      "Merkezî yönetimin yetkilerini artırmıştır.",
    ],
    dogruCevap: 3,
    aciklama:
      "Egemenliğin kayıtsız şartsız millete ait olması millî egemenlik anlayışıdır. Yasama ve yürütme mecliste toplandığı için güçler birliği vardır; saltanata ve yargıya değinilmemiş, illere geniş yetki verilerek yerinden yönetim güçlendirilmiştir.",
  },
  {
    ders: "TARIH",
    konu: "Atatürk İlke ve İnkılapları",
    grupId: "l2o-tarih-1921-anayasa",
    soruMetni:
      "20 Ocak 1921'de kabul edilen Teşkilât-ı Esasiye Kanunu'nda egemenliğin kayıtsız şartsız millete ait olduğu belirtilmiş, yasama ve yürütme yetkileri Türkiye Büyük Millet Meclisinde toplanmıştır. Kanunda devletin adı “Türkiye Devleti” olarak geçmiş, ancak saltanat ve halifelik makamlarına hiç değinilmemiştir. Ayrıca illere yerel işlerde geniş yetkiler tanınmış, yargıya ilişkin bir düzenlemeye yer verilmemiştir. Olağanüstü savaş koşullarında hazırlanan bu kanun, 1924 Anayasası kabul edilinceye kadar yürürlükte kalmıştır.\n\nBu parçadaki bilgilerden hareketle aşağıdakilerden hangisine ulaşılamaz?",
    secenekler: [
      "Devletin yönetim biçiminin cumhuriyet olduğu belirtilmiştir.",
      "Yasama ve yürütme yetkileri tek bir organda birleştirilmiştir.",
      "Yerinden yönetim anlayışına yer verilmiştir.",
      "Dönemin olağanüstü koşulları kanunun hazırlanmasında etkili olmuştur.",
      "Saltanat ve halifelik konusunda açık bir hüküm içermemektedir.",
    ],
    dogruCevap: 0,
    aciklama:
      "Parçada yönetim biçiminin adı geçmez; cumhuriyet 29 Ekim 1923'te ilan edilmiştir. Güçler birliği, illere tanınan geniş yetkiler, olağanüstü koşullar ve saltanat-halifelik konusundaki sessizlik parçada açıkça yer alır.",
  },
  {
    ders: "TARIH",
    konu: "Çağdaş Türk ve Dünya Tarihi",
    soruMetni:
      "II. Dünya Savaşı'ndan sonra SSCB'nin Boğazlar ve Doğu Anadolu üzerindeki taleplerine karşı Türkiye ve Yunanistan'a askerî ve ekonomik yardım yapılmasını öngören 1947 tarihli ABD politikası aşağıdakilerden hangisidir?",
    secenekler: ["Truman Doktrini", "Marshall Planı", "Eisenhower Doktrini", "Monroe Doktrini", "Brejnev Doktrini"],
    dogruCevap: 0,
    aciklama:
      "Truman Doktrini (Mart 1947) Türkiye ve Yunanistan'a yardımı öngörür. Marshall Planı Avrupa'nın ekonomik kalkınmasına, Eisenhower Doktrini (1957) Orta Doğu'ya yöneliktir; Monroe Doktrini 19. yüzyıl ABD politikası, Brejnev Doktrini ise SSCB politikasıdır.",
  },
  {
    ders: "TARIH",
    konu: "Çağdaş Türk ve Dünya Tarihi",
    soruMetni:
      "I. Berlin Duvarı'nın yıkılması\nII. SSCB'nin dağılması\nIII. Kore Savaşı'nın başlaması\nIV. Varşova Paktı'nın kurulması\n\nYukarıdaki gelişmelerin kronolojik sıralaması aşağıdakilerden hangisidir?",
    secenekler: ["IV, III, I, II", "III, I, IV, II", "III, IV, I, II", "IV, III, II, I", "III, IV, II, I"],
    dogruCevap: 2,
    aciklama:
      "Kore Savaşı 1950'de başlamış, Varşova Paktı 1955'te kurulmuş, Berlin Duvarı 1989'da yıkılmış, SSCB 1991'de dağılmıştır: III, IV, I, II.",
  },
  {
    ders: "TARIH",
    konu: "Çağdaş Türk ve Dünya Tarihi",
    soruMetni:
      "Türkiye ile Avrupa Ekonomik Topluluğu (AET) arasında ortaklık ilişkisi kuran ve 1963'te imzalanan antlaşma aşağıdakilerden hangisidir?",
    secenekler: ["Roma Antlaşması", "Maastricht Antlaşması", "Lizbon Antlaşması", "Helsinki Nihai Senedi", "Ankara Antlaşması"],
    dogruCevap: 4,
    aciklama:
      "Ankara Antlaşması (12 Eylül 1963) Türkiye-AET ortaklığını kurmuş, Gümrük Birliği'ne (1996) giden süreci başlatmıştır. Roma Antlaşması (1957) AET'yi kurmuş, Maastricht (1992) Avrupa Birliği'ni oluşturmuş, Lizbon (2007) AB'yi yeniden düzenlemiştir; Helsinki Nihai Senedi (1975) ise AGİK belgesidir.",
  },

  // ---- COĞRAFYA (18) ----
  {
    ders: "COGRAFYA",
    konu: "Coğrafi Konum",
    soruMetni:
      "Türkiye, 26°-45° doğu meridyenleri ile 36°-42° kuzey paralelleri arasında yer alır.\n\nBu bilgiye göre;\nI. Türkiye'nin en doğu ve en batı uçları arasında 76 dakikalık yerel saat farkı vardır.\nII. Türkiye'nin hiçbir yerinde Güneş ışınları yıl boyunca dik açıyla düşmez.\nIII. Türkiye'de yerel saati en ileri olan yer, en batıdaki noktadır.\nifadelerinden hangileri doğrudur?",
    secenekler: ["Yalnız I", "Yalnız II", "I ve II", "II ve III", "I, II ve III"],
    dogruCevap: 2,
    aciklama:
      "Meridyen farkı 45 - 26 = 19°, her meridyen 4 dakika: 19 · 4 = 76 dakika (I doğru). Türkiye Yengeç Dönencesi'nin (23°27' K) kuzeyinde olduğu için ışınlar hiçbir zaman dik gelmez (II doğru). Güneş doğudan doğduğu için yerel saati en ileri olan yer en doğudaki noktadır (III yanlış).",
  },
  {
    ders: "COGRAFYA",
    konu: "İklim ve Bitki Örtüsü",
    soruMetni:
      "Grafiklerde bir meteoroloji istasyonuna ait uzun yıllar aylık ortalama sıcaklık ve aylık ortalama yağış değerleri verilmiştir.\n\nBu grafiklere göre istasyonla ilgili aşağıdakilerden hangisi söylenemez?",
    // MGM, Antalya uzun yillar (1930-2025) aylik ortalamalari.
    gorselSvg: iklimGrafigi(
      [10.1, 10.7, 12.9, 16.4, 20.7, 25.4, 28.6, 28.5, 25.3, 20.6, 15.6, 11.7],
      [225.5, 148.1, 90.8, 48.5, 33.3, 10.7, 4.7, 4.3, 16.7, 70.6, 127.7, 250.9],
    ),
    secenekler: [
      "Yaz kuraklığı belirgindir.",
      "Yıllık toplam yağış 500 mm'nin altındadır.",
      "En yağışlı mevsim kıştır.",
      "Hiçbir ayın ortalama sıcaklığı 0 °C'nin altına düşmez.",
      "Yıllık sıcaklık farkı 20 °C'nin altındadır.",
    ],
    dogruCevap: 1,
    aciklama:
      "Aylık yağışların toplamı yaklaşık 1032 mm'dir; 500 mm'nin çok üzerindedir. Yaz ayları neredeyse yağışsız, en çok yağış kışın; en soğuk ay 10,1 °C, sıcaklık farkı 28,6 - 10,1 = 18,5 °C'dir. Grafik Akdeniz iklimine (MGM, Antalya 1930-2025) aittir.",
  },
  {
    ders: "COGRAFYA",
    konu: "İklim ve Bitki Örtüsü",
    soruMetni:
      "Akdeniz ikliminin görüldüğü kıyı kuşağında, kızılçam ormanlarının tahrip edildiği alanlarda ortaya çıkan; yaz kuraklığına dayanıklı, her mevsim yeşil kalabilen sert yapraklı bodur ağaç ve çalılardan oluşan bitki topluluğuna ne ad verilir?",
    secenekler: ["Bozkır", "Garig", "Psödomaki", "Maki", "Alpin çayır"],
    dogruCevap: 3,
    aciklama:
      "Bu bitki topluluğu makidir. Garig makinin de tahrip edildiği yerlerde oluşan daha cılız topluluk, psödomaki Karadeniz kıyılarında görülen ve kışın yaprağını döken türleri de içeren topluluktur; bozkır ve alpin çayır ise ot topluluklarıdır.",
  },
  {
    ders: "COGRAFYA",
    konu: "Fiziki Özellikler",
    soruMetni: "Bazı yer şekilleri ile bunları oluşturan dış kuvvetler eşleştirilmiştir.\n\nBu eşleştirmelerden hangisi yanlıştır?",
    secenekler: ["Traverten - Karstik süreçler", "Menderes - Akarsu", "Kumul - Rüzgâr", "Tombolo - Dalga ve akıntılar", "Sirk - Rüzgâr"],
    dogruCevap: 4,
    aciklama:
      "Sirk, buzulların dağ yamaçlarında oluşturduğu çanak biçimli aşınım çukurudur; rüzgârla ilgisi yoktur. Diğer eşleştirmeler doğrudur.",
  },
  {
    ders: "COGRAFYA",
    konu: "Fiziki Özellikler",
    soruMetni:
      "Haritada numaralandırılarak gösterilen göller ile oluşum türleri eşleştirilmiştir.\n\nBu eşleştirmelerden hangisi yanlıştır?",
    gorselSvg: turkiyeHaritasi({
      noktalar: [
        { etiket: "I", boylam: 42.9, enlem: 38.65 }, // Van Golu
        { etiket: "II", boylam: 33.4, enlem: 38.75 }, // Tuz Golu
        { etiket: "III", boylam: 41.65, enlem: 40.65 }, // Tortum Golu
        { etiket: "IV", boylam: 27.52, enlem: 37.5 }, // Bafa Golu
        { etiket: "V", boylam: 30.87, enlem: 38.05 }, // Egirdir Golu
      ],
    }),
    secenekler: ["I - Buzul gölü", "II - Tektonik göl", "III - Heyelan set gölü", "IV - Alüvyal set gölü", "V - Tektonik göl"],
    dogruCevap: 0,
    aciklama:
      "I Van Gölü, Nemrut Dağı'ndan çıkan lavların bir çanağın önünü kapatmasıyla oluşmuş volkanik set gölüdür; buzul gölü değildir. II Tuz Gölü ve V Eğirdir tektonik, III Tortum heyelan set, IV Bafa ise Büyük Menderes'in alüvyonlarıyla oluşan alüvyal set gölüdür.",
  },
  {
    ders: "COGRAFYA",
    konu: "Fiziki Özellikler",
    soruMetni: "Türkiye'deki akarsuların büyük bölümünde ulaşım yapılamamasının temel nedeni aşağıdakilerden hangisidir?",
    secenekler: [
      "Akarsuların genellikle kapalı havzalara dökülmesi",
      "Akarsu boylarında nüfusun seyrek olması",
      "Yatak eğimlerinin fazla ve rejimlerinin düzensiz olması",
      "Akarsuların kışın donması",
      "Akarsuların taşıdığı alüvyon miktarının az olması",
    ],
    dogruCevap: 2,
    aciklama:
      "Türkiye yüksek ve engebeli olduğundan akarsuların yatak eğimi fazla, akış hızı yüksektir; yağış rejimine bağlı olarak su miktarı da yıl içinde çok değişir. Bu durum ulaşımı engeller, buna karşılık hidroelektrik potansiyelini artırır.",
  },
  {
    ders: "COGRAFYA",
    konu: "Fiziki Özellikler",
    soruMetni: "Ege Bölgesi'nde dağların kıyıya dik uzanmasıyla aşağıdakilerden hangisi arasında doğrudan bir ilişki kurulamaz?",
    secenekler: [
      "Deniz etkisinin iç kesimlere kadar sokulabilmesi",
      "Kıyı ile iç kesimler arasında ulaşımın kolay olması",
      "Kıyıların girintili çıkıntılı olup doğal limanların fazla olması",
      "Kıyı ovalarının dar olup kıyıya paralel biçimde uzanması",
      "Kıyı ile iç kesimler arasında iklim farkının az olması",
    ],
    dogruCevap: 3,
    aciklama:
      "Ege'de dağlar arasındaki grabenler (Gediz, Büyük ve Küçük Menderes) kıyıdan içeri doğru uzanır; dar ve kıyıya paralel ovalar, dağların kıyıya paralel uzandığı Karadeniz ve Akdeniz kıyılarının özelliğidir. Diğer seçenekler dağların kıyıya dik uzanmasının sonuçlarıdır.",
  },
  {
    ders: "COGRAFYA",
    konu: "Beşeri Özellikler",
    soruMetni:
      "Nüfusu 1.200.000, yüzölçümü 15.000 km², tarım alanı 4.000 km² olan K ilinde tarımla uğraşan nüfus 300.000 kişidir.\n\nBuna göre K iliyle ilgili;\nI. Aritmetik nüfus yoğunluğu km²ye 80 kişidir.\nII. Fizyolojik nüfus yoğunluğu km²ye 300 kişidir.\nIII. Tarımsal nüfus yoğunluğu km²ye 60 kişidir.\nifadelerinden hangileri doğrudur?",
    secenekler: ["Yalnız I", "I ve II", "I ve III", "II ve III", "I, II ve III"],
    dogruCevap: 1,
    aciklama:
      "Aritmetik yoğunluk = nüfus / yüzölçümü = 1.200.000 / 15.000 = 80. Fizyolojik yoğunluk = nüfus / tarım alanı = 1.200.000 / 4.000 = 300. Tarımsal yoğunluk = tarımla uğraşan nüfus / tarım alanı = 300.000 / 4.000 = 75; III yanlıştır.",
  },
  {
    ders: "COGRAFYA",
    konu: "Beşeri Özellikler",
    soruMetni: "Aşağıdakilerden hangisi geçici (mevsimlik) göçe örnektir?",
    secenekler: [
      "İş bulmak amacıyla kırsal kesimden sanayileşmiş büyük kentlere yerleşilmesi",
      "Emekli olan bir kişinin ılıman iklimli bir kıyı kentine yerleşmesi",
      "Baraj gölü altında kalan bir köyün halkının başka bir yere yerleştirilmesi",
      "Nüfus mübadelesiyle Yunanistan'daki Türklerin Türkiye'ye getirilmesi",
      "Fındık hasadı için Doğu ve Güneydoğu Anadolu'dan Karadeniz kıyılarına tarım işçilerinin gitmesi",
    ],
    dogruCevap: 4,
    aciklama:
      "Fındık hasadı için yapılan göçte işçiler hasat bitince geri döner; bu, mevsimlik göçtür. Diğer seçeneklerde yerleşim yeri kalıcı olarak değişmektedir.",
  },
  {
    ders: "COGRAFYA",
    konu: "Beşeri Özellikler",
    soruMetni: "Aşağıdakilerden hangisi Doğu Karadeniz kıyı kuşağında kırsal yerleşmelerin dağınık olmasının nedenlerinden biri değildir?",
    secenekler: [
      "Yaz kuraklığı nedeniyle su kaynaklarının kıt olması",
      "Arazinin engebeli olması",
      "Tarım alanlarının küçük ve parçalı olması",
      "Su kaynaklarının hemen her yerde bulunması",
      "Her mevsim yağışlı bir iklimin görülmesi",
    ],
    dogruCevap: 0,
    aciklama:
      "Suyun kıt olması, insanları sınırlı su kaynakları çevresinde toplanmaya iter ve toplu yerleşmeye yol açar. Doğu Karadeniz'de ise her mevsim yağış görülür, su her yerde bulunur; engebeli arazi ve parçalı tarım alanlarıyla birlikte dağınık yerleşme oluşur.",
  },
  {
    ders: "COGRAFYA",
    konu: "Ekonomik Özellikler",
    soruMetni:
      "Haritada numaralandırılarak gösterilen maden çıkarım alanları ile buralardan çıkarılan başlıca madenler eşleştirilmiştir.\n\nBu eşleştirmelerden hangisi yanlıştır?",
    gorselSvg: turkiyeHaritasi({
      noktalar: [
        { etiket: "I", boylam: 30.53, enlem: 39.29 }, // Kirka (Eskisehir)
        { etiket: "II", boylam: 31.85, enlem: 37.42 }, // Seydisehir (Konya)
        { etiket: "III", boylam: 31.79, enlem: 41.45 }, // Zonguldak
        { etiket: "IV", boylam: 39.82, enlem: 38.45 }, // Guleman (Elazig)
        { etiket: "V", boylam: 41.56, enlem: 41.27 }, // Murgul (Artvin)
      ],
    }),
    secenekler: ["I - Bor", "II - Demir", "III - Taş kömürü", "IV - Krom", "V - Bakır"],
    dogruCevap: 1,
    aciklama:
      "II Seydişehir (Konya) boksit yataklarıyla ve alüminyum tesisiyle tanınır; demir yatağı değildir. I Kırka (Eskişehir) bor, III Zonguldak taş kömürü, IV Guleman (Elazığ) krom, V Murgul (Artvin) bakır çıkarım alanıdır.",
  },
  {
    ders: "COGRAFYA",
    konu: "Ekonomik Özellikler",
    soruMetni:
      "Güneydoğu Anadolu Projesi (GAP) kapsamında Atatürk Barajı'ndan Şanlıurfa tünelleriyle getirilen suyla Harran Ovası sulamaya açılmış ve Şanlıurfa, bir sanayi bitkisinin üretiminde Türkiye'de ilk sıraya yükselmiştir.\n\nBu sanayi bitkisi aşağıdakilerden hangisidir?",
    secenekler: ["Çay", "Fındık", "Tütün", "Pamuk", "Haşhaş"],
    dogruCevap: 3,
    aciklama:
      "Sulamayla birlikte sıcak ve uzun yaz mevsimine sahip Harran Ovası'nda pamuk üretimi hızla artmış, Şanlıurfa pamukta ilk sıraya yerleşmiştir. Çay ve fındık Karadeniz, haşhaş Afyonkarahisar çevresi, tütün ise ağırlıkla Ege ürünüdür.",
  },
  {
    ders: "COGRAFYA",
    konu: "Ekonomik Özellikler",
    soruMetni: "Doğu Anadolu'nun Erzurum-Kars Bölümü'nde büyükbaş hayvancılığın gelişmiş olmasının temel nedeni aşağıdakilerden hangisidir?",
    secenekler: [
      "Yaz yağışlarıyla gür çayırların oluşması",
      "Kışların ılık geçmesi",
      "Geniş ve verimli tarım alanlarının bulunması",
      "Sanayinin gelişmiş olması",
      "Nüfusun yoğun olması",
    ],
    dogruCevap: 0,
    aciklama:
      "Yükseltisi fazla olan Erzurum-Kars yöresinde yazın düşen yağışlar gür çayır ve meraları besler; bu da büyükbaş hayvancılığa elverişli ortam oluşturur. Bölümde kışlar çok soğuktur, sanayi ve nüfus yoğunluğu ise düşüktür.",
  },
  {
    ders: "COGRAFYA",
    konu: "Ekonomik Özellikler",
    soruMetni: "Türkiye'den geçen bazı boru hatları ile taşıdıkları enerji kaynakları eşleştirilmiştir.\n\nBu eşleştirmelerden hangisi yanlıştır?",
    secenekler: [
      "Bakü-Tiflis-Ceyhan - Ham petrol",
      "Kerkük-Yumurtalık - Ham petrol",
      "TANAP - Ham petrol",
      "Mavi Akım - Doğal gaz",
      "TürkAkım - Doğal gaz",
    ],
    dogruCevap: 2,
    aciklama:
      "TANAP (Trans Anadolu Doğal Gaz Boru Hattı), Azerbaycan doğal gazını Türkiye üzerinden Avrupa'ya taşır; ham petrol taşımaz. Diğer eşleştirmeler doğrudur.",
  },
  {
    ders: "COGRAFYA",
    konu: "Ekonomik Özellikler",
    soruMetni: "Şeker fabrikalarının genellikle şeker pancarı tarımının yapıldığı alanlara yakın kurulmasının temel nedeni aşağıdakilerden hangisidir?",
    secenekler: [
      "Pazara yakın olmak istenmesi",
      "Enerji kaynaklarına yakın olunması",
      "İş gücünün ucuz olması",
      "Liman ve demir yollarına yakın olunması",
      "Hammaddenin çabuk bozulması ve taşıma maliyetinin yüksek olması",
    ],
    dogruCevap: 4,
    aciklama:
      "Hasat edilen pancar kısa sürede şeker oranını kaybeder; ağır ve hacimli olduğundan uzağa taşınması da pahalıdır. Bu nedenle şeker fabrikaları hammadde kaynağına yakın kurulur.",
  },
  {
    ders: "COGRAFYA",
    konu: "Ekonomik Özellikler",
    soruMetni: "Aşağıdakilerden hangisi Türkiye'nin enerjide dışa bağımlılığını azaltmaya yönelik bir uygulama değildir?",
    secenekler: [
      "Rüzgâr ve güneş enerjisi santrallerinin yaygınlaştırılması",
      "Doğal gaz ithalatının artırılması",
      "Akkuyu Nükleer Güç Santrali'nin inşa edilmesi",
      "Karadeniz'de keşfedilen doğal gazın üretime alınması",
      "Yerli linyit kaynaklarının elektrik üretiminde kullanılması",
    ],
    dogruCevap: 1,
    aciklama:
      "İthalatın artırılması dışa bağımlılığı azaltmaz, artırır. Yenilenebilir kaynaklar, nükleer enerji, Karadeniz (Sakarya Gaz Sahası) doğal gazı ve yerli linyit ise yerli üretimi artırarak bağımlılığı azaltır.",
  },
  {
    ders: "COGRAFYA",
    konu: "Ekonomik Özellikler",
    soruMetni: "Türkiye'de avlanan deniz balıklarının büyük bölümünün Karadeniz'den sağlanmasının temel nedeni aşağıdakilerden hangisidir?",
    secenekler: [
      "Kıyılarının girintili çıkıntılı olması",
      "Kıta sahanlığının geniş olması",
      "Suyunun tuzluluk oranının yüksek olması",
      "Akarsuların taşıdığı besin maddeleri sayesinde planktonun bol olması",
      "Su sıcaklığının yıl boyunca yüksek olması",
    ],
    dogruCevap: 3,
    aciklama:
      "Karadeniz'e dökülen çok sayıda akarsu, balıkların besini olan planktonun gelişmesini sağlayan besin maddeleri taşır. Karadeniz'in kıyıları düz, kıta sahanlığı dar, tuzluluğu ise düşüktür.",
  },
  {
    ders: "COGRAFYA",
    konu: "Ekonomik Özellikler",
    soruMetni:
      "Tarım alanının bir yıl ekilip bir yıl boş bırakılarak dinlendirilmesine nadas denir.\n\nTürkiye'de nadas uygulamasının en yaygın olduğu bölge ve bunun temel nedeni aşağıdakilerin hangisinde birlikte verilmiştir?",
    secenekler: [
      "Karadeniz - Toprakların asitli olması",
      "Akdeniz - Sıcaklıkların yüksek olması",
      "İç Anadolu - Yağışın yetersiz olması",
      "Doğu Anadolu - Vejetasyon süresinin kısa olması",
      "Marmara - Tarım alanlarının dar olması",
    ],
    dogruCevap: 2,
    aciklama:
      "Yağışın az olduğu İç Anadolu'da toprağın nem biriktirmesi için tarlalar bir yıl boş bırakılır; nadas en çok bu bölgede uygulanır.",
  },

  // ---- VATANDAŞLIK (9) ----
  {
    ders: "VATANDASLIK",
    konu: "Temel Hukuk Kavramları",
    soruMetni: "Aşağıdakilerden hangisi hukukun yardımcı (tali) kaynakları arasında yer alır?",
    secenekler: ["Kanun", "Cumhurbaşkanlığı kararnamesi", "Yönetmelik", "Örf ve âdet hukuku", "Bilimsel görüşler (doktrin)"],
    dogruCevap: 4,
    aciklama:
      "Hukukun yardımcı kaynakları yargı kararları ve bilimsel görüşlerdir (doktrin). Kanun, Cumhurbaşkanlığı kararnamesi ve yönetmelik yazılı asli kaynak; örf ve âdet hukuku ise yazısız asli kaynaktır.",
  },
  {
    ders: "VATANDASLIK",
    konu: "Temel Hukuk Kavramları",
    soruMetni:
      "Türk Medeni Kanunu'na göre;\nI. Çocuk, hak ehliyetini ana rahmine düştüğü andan başlayarak sağ doğmak koşuluyla elde eder.\nII. Ayırt etme gücüne sahip olan, ergin olan ve kısıtlı bulunmayan her insanın fiil ehliyeti vardır.\nIII. Erginlik yalnızca on sekiz yaşın doldurulmasıyla kazanılır; evlenme kişiyi ergin kılmaz.\nifadelerinden hangileri doğrudur?",
    secenekler: ["Yalnız I", "Yalnız II", "I ve II", "I ve III", "II ve III"],
    dogruCevap: 2,
    aciklama:
      "I (TMK m. 28) ve II (TMK m. 10) doğrudur. TMK m. 11'e göre erginlik on sekiz yaşın doldurulmasıyla başlar, ancak evlenme de kişiyi ergin kılar; ayrıca mahkeme kararıyla erginlik de mümkündür. III yanlıştır.",
  },
  {
    ders: "VATANDASLIK",
    konu: "Temel Hukuk Kavramları",
    soruMetni:
      "Borcunu vadesinde ödemeyen bir kişinin, alacaklının başvurusu üzerine malları devlet gücüyle haczedilip satılmış ve elde edilen parayla alacak ödenmiştir.\n\nBu durumda uygulanan hukuki yaptırım türü aşağıdakilerden hangisidir?",
    secenekler: ["Cebri icra", "Tazminat", "Ceza", "İptal", "Kesin hükümsüzlük"],
    dogruCevap: 0,
    aciklama:
      "Yükümlülüğünü kendiliğinden yerine getirmeyen kişinin bu yükümlülüğü devlet zoruyla yerine getirtilmesi cebri icradır. Tazminat verilen zararın giderilmesi, iptal hukuka aykırı idari işlemin ortadan kaldırılması, kesin hükümsüzlük ise işlemin baştan geçersiz sayılmasıdır.",
  },
  {
    ders: "VATANDASLIK",
    konu: "Yasama-Yürütme-Yargı",
    soruMetni:
      "1982 Anayasası'na göre;\nI. Türkiye Büyük Millet Meclisi, genel oyla seçilen 600 milletvekilinden oluşur.\nII. On sekiz yaşını dolduran her Türk milletvekili seçilebilir.\nIII. Milletvekili seçilebilmek için yükseköğrenim görmüş olmak şarttır.\nifadelerinden hangileri doğrudur?",
    secenekler: ["Yalnız I", "I ve II", "I ve III", "II ve III", "I, II ve III"],
    dogruCevap: 1,
    aciklama:
      "2017 değişikliğiyle milletvekili sayısı 600'e çıkarılmış ve seçilme yaşı 18'e indirilmiştir (m. 75 ve 76). Anayasa'ya göre ilköğrenimini tamamlamış olmak yeterlidir (m. 76); yükseköğrenim şartı yoktur.",
  },
  {
    ders: "VATANDASLIK",
    konu: "Yasama-Yürütme-Yargı",
    soruMetni: "1982 Anayasası'na göre Cumhurbaşkanlığı kararnameleri ile ilgili aşağıdakilerden hangisi yanlıştır?",
    secenekler: [
      "Cumhurbaşkanı, yürütme yetkisine ilişkin konularda Cumhurbaşkanlığı kararnamesi çıkarabilir.",
      "Temel haklar, kişi hakları ve ödevleri ile siyasi haklar ve ödevler Cumhurbaşkanlığı kararnamesiyle düzenlenemez.",
      "Kanunda açıkça düzenlenen konularda Cumhurbaşkanlığı kararnamesi çıkarılamaz.",
      "Olağan dönemde çıkarılan Cumhurbaşkanlığı kararnameleri TBMM'nin onayına sunulmadıkça yürürlüğe girmez.",
      "Cumhurbaşkanlığı kararnamesi ile kanunlarda farklı hükümler bulunması hâlinde kanun hükümleri uygulanır.",
    ],
    dogruCevap: 3,
    aciklama:
      "Anayasa'nın 104. maddesine göre olağan dönem Cumhurbaşkanlığı kararnameleri TBMM onayına bağlı değildir. TBMM onayı, 119. madde uyarınca olağanüstü hâl döneminde çıkarılan kararnameler için öngörülmüştür. Diğer seçenekler 104. maddede yer alır.",
  },
  {
    ders: "VATANDASLIK",
    konu: "Yasama-Yürütme-Yargı",
    soruMetni:
      "1982 Anayasası'na göre Anayasa Mahkemesi ile ilgili;\nI. On beş üyeden oluşur.\nII. Üyeleri on iki yıllık süre için seçilir.\nIII. Üyelerinden üçü Türkiye Büyük Millet Meclisi tarafından seçilir.\nifadelerinden hangileri doğrudur?",
    secenekler: ["Yalnız I", "I ve II", "I ve III", "II ve III", "I, II ve III"],
    dogruCevap: 4,
    aciklama:
      "Anayasa Mahkemesi on beş üyeden oluşur; üyelerin üçünü TBMM, on ikisini Cumhurbaşkanı seçer (m. 146). Üyeler on iki yıl için seçilir ve bir kişi iki defa seçilemez (m. 147). Üç ifade de doğrudur.",
  },
  {
    ders: "VATANDASLIK",
    konu: "Yasama-Yürütme-Yargı",
    soruMetni:
      "1982 Anayasası'na göre adli ve idari yargı mercileri arasındaki görev ve hüküm uyuşmazlıklarını kesin olarak çözmeye yetkili yüksek mahkeme aşağıdakilerden hangisidir?",
    secenekler: ["Uyuşmazlık Mahkemesi", "Yargıtay", "Danıştay", "Anayasa Mahkemesi", "Sayıştay"],
    dogruCevap: 0,
    aciklama:
      "Anayasa'nın 158. maddesine göre adli ve idari yargı mercileri arasındaki görev ve hüküm uyuşmazlıklarını kesin olarak çözümlemeye Uyuşmazlık Mahkemesi yetkilidir.",
  },
  {
    ders: "VATANDASLIK",
    konu: "İdare Hukuku",
    soruMetni: "Aşağıdakilerden hangisi hizmet yönünden yerinden yönetim kuruluşudur?",
    secenekler: ["İl özel idaresi", "Belediye", "Köy", "Devlet üniversitesi", "Valilik"],
    dogruCevap: 3,
    aciklama:
      "Devlet üniversiteleri belirli bir kamu hizmetini (yükseköğretim) özerk olarak yürüten hizmet yönünden yerinden yönetim kuruluşlarıdır. İl özel idaresi, belediye ve köy yer yönünden yerinden yönetim (mahallî idare); valilik ise merkezî yönetimin taşra teşkilatıdır.",
  },
  {
    ders: "VATANDASLIK",
    konu: "İdare Hukuku",
    soruMetni:
      "1982 Anayasası'na göre mahallî idarelerle ilgili;\nI. Mahallî idarelerin seçimleri beş yılda bir yapılır.\nII. Görevleriyle ilgili bir suç sebebiyle hakkında soruşturma veya kovuşturma açılan mahallî idare organlarını İçişleri Bakanı, geçici bir tedbir olarak kesin hükme kadar görevden uzaklaştırabilir.\nIII. Merkezî idare, mahallî idareler üzerinde hiyerarşi yetkisine sahiptir.\nifadelerinden hangileri doğrudur?",
    secenekler: ["Yalnız I", "Yalnız II", "I ve II", "I ve III", "II ve III"],
    dogruCevap: 2,
    aciklama:
      "I ve II, Anayasa'nın 127. maddesinde yer alır. Merkezî idarenin mahallî idareler üzerindeki yetkisi hiyerarşi değil, kanunla sınırları çizilen idari vesayet yetkisidir; III yanlıştır.",
  },

  // ---- GÜNCEL BİLGİLER (6) ----
  // Her bilgi 2026-10-14 itibarıyla web kaynaklarından doğrulandı.
  {
    ders: "GUNCEL",
    konu: "Güncel Bilgiler",
    soruMetni:
      "30 Mayıs 2026'da Budapeşte'deki Puskás Aréna'da oynanan UEFA Şampiyonlar Ligi finalinde Arsenal'i penaltı atışlarıyla yenerek üst üste ikinci kez şampiyon olan takım aşağıdakilerden hangisidir?",
    secenekler: ["Real Madrid", "Paris Saint-Germain", "Bayern Münih", "Inter", "Barcelona"],
    dogruCevap: 1,
    aciklama:
      "Paris Saint-Germain, uzatmalar dahil 1-1 biten finalde Arsenal'i penaltılarda 4-3 yenmiş ve 2025'ten sonra ikinci kez Şampiyonlar Ligi kupasını kazanmıştır.",
  },
  {
    ders: "GUNCEL",
    konu: "Güncel Bilgiler",
    soruMetni:
      "16 Mayıs 2026'da Avusturya'nın başkenti Viyana'da finali yapılan 70. Eurovision Şarkı Yarışması'nı “Bangaranga” adlı şarkıyla kazanan ülke aşağıdakilerden hangisidir?",
    secenekler: ["İsrail", "Bulgaristan", "Finlandiya", "İsveç", "Avusturya"],
    dogruCevap: 1,
    aciklama: "Yarışmayı Bulgaristan, Dara'nın seslendirdiği “Bangaranga” şarkısıyla kazanmıştır. Final Viyana'daki Wiener Stadthalle'de yapılmıştır.",
  },
  {
    ders: "GUNCEL",
    konu: "Güncel Bilgiler",
    soruMetni:
      "NASA'nın Artemis II görevi ile ilgili;\nI. Görev Nisan 2026'da gerçekleştirilmiş, Orion kapsülü Ay'ın çevresinde dolaşarak Dünya'ya dönmüştür.\nII. Görevde mürettebat Ay yüzeyine iniş yapmıştır.\nIII. Dört kişilik mürettebatta Kanadalı bir astronot da yer almıştır.\nifadelerinden hangileri doğrudur?",
    secenekler: ["Yalnız I", "Yalnız II", "I ve III", "II ve III", "I, II ve III"],
    dogruCevap: 2,
    aciklama:
      "Artemis II, 1 Nisan 2026'da fırlatılmış, Ay'ın çevresinde dolaşmış ve 10 Nisan 2026'da (ABD saatiyle) okyanusa inmiştir. Görevde Ay'a iniş yapılmamıştır. Mürettebat Reid Wiseman, Victor Glover, Christina Koch ve Kanadalı Jeremy Hansen'den oluşmuştur.",
  },
  {
    ders: "GUNCEL",
    konu: "Güncel Bilgiler",
    soruMetni:
      "19 Eylül-4 Ekim 2026 tarihlerinde düzenlenen 20. Asya Oyunları ile ilgili;\nI. Japonya'nın Aichi ve Nagoya bölgesinde düzenlenmiştir.\nII. Madalya sıralamasında Çin ilk sırada yer almıştır.\nIII. Japonya, Asya Oyunları'na ilk kez ev sahipliği yapmıştır.\nifadelerinden hangileri doğrudur?",
    secenekler: ["Yalnız I", "Yalnız II", "Yalnız III", "I ve II", "I, II ve III"],
    dogruCevap: 3,
    aciklama:
      "2026 Asya Oyunları Aichi-Nagoya'da yapılmış ve Çin madalya sıralamasında ilk sırayı almıştır. Japonya daha önce 1958 (Tokyo) ve 1994 (Hiroşima) Asya Oyunları'na da ev sahipliği yapmıştır; III yanlıştır. Sonraki oyunlar 2030'da Doha'da düzenlenecektir.",
  },
  {
    ders: "GUNCEL",
    konu: "Güncel Bilgiler",
    soruMetni:
      "TÜİK'in açıkladığı 2025 yılı Adrese Dayalı Nüfus Kayıt Sistemi sonuçlarına göre;\nI. Türkiye'nin nüfusu 86 milyonu aşmıştır.\nII. Yıllık nüfus artış hızı bir önceki yıla göre düşmüştür.\nIII. Ortanca yaş bir önceki yıla göre yükselmiştir.\nifadelerinden hangileri doğrudur?",
    secenekler: ["Yalnız I", "Yalnız II", "I ve II", "II ve III", "I ve III"],
    dogruCevap: 4,
    aciklama:
      "31 Aralık 2025 itibarıyla Türkiye'nin nüfusu 86.092.168 kişidir (I doğru). Yıllık nüfus artış hızı 2024'te binde 3,4 iken 2025'te binde 5'e yükselmiştir (II yanlış). Ortanca yaş 34,4'ten 34,9'a çıkmıştır (III doğru).",
  },
  {
    ders: "GUNCEL",
    konu: "Güncel Bilgiler",
    soruMetni: "2026 yılında Avrupa Kültür Başkenti unvanını taşıyan şehirler aşağıdakilerin hangisinde birlikte verilmiştir?",
    secenekler: [
      "Oulu (Finlandiya) - Trenčín (Slovakya)",
      "Chemnitz (Almanya) - Nova Gorica (Slovenya)",
      "Tartu (Estonya) - Bodø (Norveç)",
      "Veszprém (Macaristan) - Timişoara (Romanya)",
      "Kaunas (Litvanya) - Novi Sad (Sırbistan)",
    ],
    dogruCevap: 0,
    aciklama:
      "2026 Avrupa Kültür Başkentleri Finlandiya'nın Oulu ve Slovakya'nın Trenčín kentleridir. Diğer seçeneklerdeki şehirler unvanı önceki yıllarda taşımıştır: Chemnitz ve Nova Gorica 2025, Tartu ve Bodø 2024 (Bad Ischl ile), Veszprém ve Timişoara 2023 (Elefsina ile), Kaunas ve Novi Sad 2022 (Esch-sur-Alzette ile).",
  },
];

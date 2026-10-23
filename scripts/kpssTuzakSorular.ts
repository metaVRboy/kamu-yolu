/**
 * Kontrolcu (dogrulayici) olcumu icin bilerek kusurlu yazilmis sorular + 2 temiz kontrol sorusu.
 * kusur: dogrulayicinin yakalamasi gereken sorun; null = gecmesi gereken temiz soru. Havuza girmez.
 */
export type Tuzak = { ad: string; kusur: string | null; ders: "TURKCE" | "TARIH" | "VATANDASLIK" | "COGRAFYA"; konu: string; soruMetni: string; secenekler: string[]; dogruCevap: number; aciklama: string };

export const TUZAKLAR: Tuzak[] = [
  {
    ad: "iki-dogru",
    kusur: "İki şık doğru (C ve E ikisi de Osmanlı'nın kuruluş dönemi beyleri)",
    ders: "TARIH",
    konu: "Osmanlı Siyasi Tarihi",
    soruMetni: "Aşağıdakilerden hangisi Osmanlı Devleti'nin kuruluş döneminde (1299-1453) hüküm süren padişahlardan biri değildir?",
    secenekler: ["Orhan Bey", "I. Murat", "Yavuz Sultan Selim", "Yıldırım Bayezid", "Kanuni Sultan Süleyman"],
    dogruCevap: 2,
    aciklama: "Yavuz Sultan Selim 1512-1520 arasında hüküm sürmüştür.",
  },
  {
    ad: "yanlis-anahtar",
    kusur: "Anahtar yanlış: Lozan 24 Temmuz 1923'te imzalandı, Mudanya 1922",
    ders: "TARIH",
    konu: "Atatürk Dönemi İç ve Dış Politika",
    soruMetni:
      "Kurtuluş Savaşı'nın askerî safhasını sona erdiren ve Doğu Trakya'nın savaşa girmeden Türk tarafına bırakılmasını sağlayan antlaşma aşağıdakilerden hangisidir?",
    secenekler: ["Lozan Barış Antlaşması", "Mudanya Ateşkes Antlaşması", "Ankara Antlaşması", "Gümrü Antlaşması", "Moskova Antlaşması"],
    dogruCevap: 0,
    aciklama: "Lozan Barış Antlaşması ile Doğu Trakya savaşsız alınmıştır.",
  },
  {
    ad: "olgu-hatasi",
    kusur: "Öncülde olgu hatası: TBMM 23 Nisan 1920'de açıldı (1921 yazılmış)",
    ders: "TARIH",
    konu: "Kurtuluş Savaşı Hazırlık Dönemi",
    soruMetni:
      "23 Nisan 1921'de Ankara'da açılan Büyük Millet Meclisi, ilk günlerinde güçler birliği ilkesini benimsemiştir. Bu durumun temel nedeni aşağıdakilerden hangisidir?",
    secenekler: [
      "Olağanüstü savaş koşullarında hızlı karar alma ihtiyacı",
      "Saltanatın kaldırılmış olması",
      "Cumhuriyetin ilan edilmiş olması",
      "Çok partili hayata geçilmesi",
      "Anayasa Mahkemesinin kurulmuş olması",
    ],
    dogruCevap: 0,
    aciklama: "Savaş koşulları hızlı karar almayı gerektirdiği için güçler birliği benimsenmiştir.",
  },
  {
    ad: "dil-hatasi",
    kusur: "Dil hataları: 'diplomasik', 'üyelliğinden', 'okyanosu', 'yayınıcılık'",
    ders: "TURKCE",
    konu: "Paragraf",
    soruMetni:
      "Dijital yayınıcılık, bilgi okyanosunda kaybolan okura yeni bir rehberlik sunuyor. Ne var ki algoritmaların önerdiği içerikler, okurun ilgi alanını genişletmek yerine daraltabiliyor; bu da diplomasik bir dengeyle çözülmesi gereken bir sorun olarak görülüyor. Okurun kendi seçimlerine yeniden alan açmak, yayın kuruluşlarının birlik üyelliğinden bile önemli hâle geliyor. Bu parçada asıl anlatılmak istenen aşağıdakilerden hangisidir?",
    secenekler: [
      "Algoritmaların okurun ilgi alanını daraltma riski dengelenmelidir.",
      "Dijital yayıncılık basılı yayıncılığın yerini tamamen almıştır.",
      "Okurlar algoritmaların önerilerini hiç kullanmamalıdır.",
      "Yayın kuruluşları birlik üyeliğinden çıkmalıdır.",
      "Bilgiye erişim dijital çağda zorlaşmıştır.",
    ],
    dogruCevap: 0,
    aciklama: "Parçada algoritmaların ilgi alanını daraltabileceği ve bunun dengelenmesi gerektiği vurgulanmıştır.",
  },
  {
    ad: "cok-kolay",
    kusur: "KPSS için çok kolay: cevap parçadaki cümlenin aynısı, çeldiriciler saçma",
    ders: "TURKCE",
    konu: "Paragraf",
    soruMetni:
      "Düzenli spor yapmak kalp sağlığını korur. Parçaya göre düzenli spor yapmanın faydası aşağıdakilerden hangisidir?",
    secenekler: ["Kalp sağlığını korur.", "Saçları uzatır.", "Gözleri maviye çevirir.", "Boyu kısaltır.", "Uykuyu yok eder."],
    dogruCevap: 0,
    aciklama: "Parçada açıkça belirtilmiştir.",
  },
  {
    ad: "uydurma-alinti",
    kusur: "Gerçek kişiye uydurma alıntı atfı (Ahmet Hamdi Tanpınar'a ait olmayan söz)",
    ders: "TURKCE",
    konu: "Paragraf",
    soruMetni:
      "Ahmet Hamdi Tanpınar bir söyleşisinde \"Roman, yazarın kendi çocukluğunu değil okurun geleceğini anlatmalıdır; bu yüzden ben hiçbir romanımda geçmişe dönmedim.\" demiştir. Bu sözden hareketle Tanpınar'ın roman anlayışıyla ilgili aşağıdakilerden hangisi söylenebilir?",
    secenekler: [
      "Romanın geleceğe yönelmesi gerektiğini düşünür.",
      "Romanda yalnızca çocukluk anılarına yer verir.",
      "Romanın okurla ilgisi olmadığını savunur.",
      "Tarihî romanı tek geçerli tür olarak görür.",
      "Romanın şiirden üstün olduğunu ileri sürer.",
    ],
    dogruCevap: 0,
    aciklama: "Tanpınar romanın okurun geleceğini anlatması gerektiğini söylemiştir.",
  },
  {
    ad: "belirsiz-ana-fikir",
    kusur: "İki şık da ana düşünce olarak savunulabilir (A ve D), tek doğru yok",
    ders: "TURKCE",
    konu: "Paragraf",
    soruMetni:
      "Şehirlerdeki eski çarşılar yalnızca alışveriş yapılan yerler değildir; esnafın kuşaktan kuşağa aktardığı zanaat bilgisi, komşuluk ilişkileri ve kentin ortak belleği de bu dar sokaklarda yaşar. Bu çarşılar yıkılıp yerlerine alışveriş merkezleri yapıldığında yalnızca binalar değil, bir yaşama biçimi de ortadan kalkar. Bu nedenle eski çarşıların korunması, kentin kimliğinin korunması anlamına gelir. Bu parçanın ana düşüncesi aşağıdakilerden hangisidir?",
    secenekler: [
      "Eski çarşılar kentin kimliğini taşıdığı için korunmalıdır.",
      "Alışveriş merkezleri ekonomik açıdan daha verimlidir.",
      "Zanaat bilgisi yalnızca okullarda öğretilebilir.",
      "Eski çarşıların yıkılması bir yaşama biçiminin de yok olması demektir.",
      "Komşuluk ilişkileri modern kentlerde güçlenmiştir.",
    ],
    dogruCevap: 0,
    aciklama: "Parçanın son cümlesi ana düşünceyi verir.",
  },
  {
    ad: "eskimis-bilgi",
    kusur: "Eskimiş/yanlış bilgi: Bakanlar Kurulu 2017 değişikliğiyle kaldırıldı; yürütme yetkisi Cumhurbaşkanında",
    ders: "VATANDASLIK",
    konu: "Yürütme",
    soruMetni: "1982 Anayasası'nın güncel hâline göre yürütme yetkisi ve görevi aşağıdakilerden hangisine aittir?",
    secenekler: ["Cumhurbaşkanı ve Bakanlar Kurulu", "Türkiye Büyük Millet Meclisi", "Anayasa Mahkemesi", "Başbakan", "Danıştay"],
    dogruCevap: 0,
    aciklama: "Yürütme yetkisi Cumhurbaşkanı ve Bakanlar Kurulu tarafından kullanılır.",
  },
  {
    ad: "temiz-tarih",
    kusur: null,
    ders: "TARIH",
    konu: "Kurtuluş Savaşı Hazırlık Dönemi",
    soruMetni:
      "Amasya Genelgesi'nde yer alan \"Milletin bağımsızlığını yine milletin azim ve kararı kurtaracaktır.\" ifadesi, aşağıdakilerden hangisinin ilk kez dile getirildiğini gösterir?",
    secenekler: [
      "Kurtuluş Savaşı'nın gerekçesi ve yöntemi",
      "Saltanatın kaldırılacağı",
      "Manda ve himayenin kabul edileceği",
      "Cumhuriyetin ilan edileceği",
      "Halifeliğin kaldırılacağı",
    ],
    dogruCevap: 0,
    aciklama: "Bu ifadeyle milletin bağımsızlığı için mücadele gerekçesi ve bunun milletin iradesiyle yapılacağı (yöntem) belirtilmiştir.",
  },
  {
    ad: "temiz-cografya",
    kusur: null,
    ders: "COGRAFYA",
    konu: "Yer Şekilleri ve Su Varlığı",
    soruMetni:
      "Türkiye'de akarsuların rejimi düzensiz, akış hızı yüksek ve genellikle denize ulaşmadan önce derin vadiler içinde akan bir yapıdadır. Bu durumun temel nedenleri arasında aşağıdakilerden hangisi gösterilemez?",
    secenekler: [
      "Yağışın mevsimlere göre dengesiz dağılması",
      "Ortalama yükseltinin fazla olması",
      "Eğimin fazla olması",
      "Arazinin genel olarak engebeli olması",
      "Ülke yüzölçümünün büyük kısmının ova olması",
    ],
    dogruCevap: 4,
    aciklama: "Türkiye engebeli, yüksek ve eğimli bir ülkedir; yüzölçümünün büyük kısmı ova değildir. Diğer şıklar düzensiz rejim ve yüksek akış hızının nedenleridir.",
  },
];

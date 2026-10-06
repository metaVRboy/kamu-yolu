/**
 * KPSS deneme sinavi soru havuzu - Lisans duzeyi, ilk parti.
 * Her soru AI tarafindan ozgun olarak yazildi (gercek OSYM sorusu degildir).
 * secenekler: 5 sik (A-E sirayla), dogruCevap: 0-4 index.
 *
 * Soru tipleri ve zorluk seviyesi, kullanicinin sagladigi gercek KPSS deneme
 * kitapciklarinin (lisans/onlisans/ortaogretim) formatina gore kalibre
 * edildi: uzun/numarali (I-V) ifadeli paragraflar, ortak metinli soru
 * ciftleri, oge dizilisi, tanimli ozel islem/kavram sorulari, basamak-harf
 * problemleri; geometri ve cografya sorularinda inline SVG gorseller.
 *
 * Turkce (30) ve Matematik (30) alt konu dagilimi, ÖSYM'nin resmi KPSS
 * Genel Yetenek konu dagilimina uygun hazirlandi:
 *  - Turkce: Paragraf/okuma 11, Numarali ifade paragrafi 3, Sozel Mantik 4,
 *    Sozcukte Anlam 1, Cumlede Anlam 2, Sozcuk Turleri 1, Sozcukte Yapi 2,
 *    Oge Dizilisi 1, Fiilimsi 1, Ses Bilgisi 1, Yazim Kurallari 1,
 *    Noktalama/boslukla tamamlama 1, Anlatim Bozuklugu 1 (toplam 30)
 *  - Matematik: Temel Kavramlar 2, Rasyonel Sayilar 2, Basit Esitsizlikler 1,
 *    Mutlak Deger 1, Uslu Sayilar 2, Koklu Sayilar 1, Carpanlara Ayirma 1,
 *    Oran-Oranti 1, Denklem Cozme 1, Problemler 6, Kumeler 1, Fonksiyonlar 1,
 *    Sayisal Mantik/tanimli islem 3, Permutasyon-Kombinasyon 1, Olasilik 1,
 *    Geometri 4 - gorselli (toplam 30)
 *  - Genel Kultur (2022 KPSS GK kitapcigi + 2026 lisans/onlisans ornekleri
 *    referans alinarak): Tarih 27 (Islamiyet oncesi -> cagdas, resmi konu
 *    sirasiyla; oncullu, kisi/yer/olay/kavram, parca, eslestirme, kronoloji;
 *    sadece tarih soran soru yok), Cografya 18 (4 gercek Turkiye haritasi +
 *    MGM verili iklim grafigi), Vatandaslik 9 (2017 sonrasi 1982 Anayasasi),
 *    Guncel 6 (her bilgi web'den dogrulandi).
 */
import { HARITA_VIEWBOX, projeksiyon, TURKIYE_SINIRI, GOLLER, IL_SINIRLARI } from "./turkiyeHaritaVerisi";

export type SeedSoru = {
  ders: "TURKCE" | "MATEMATIK" | "TARIH" | "COGRAFYA" | "VATANDASLIK" | "GUNCEL";
  soruMetni: string;
  // Ortak metinli (bir parca/bilgi + birden fazla soru) bloklarda kardes
  // sorulara ayni grupId verilir - "X-Y. sorular..." basligi METNE
  // GOMULMEZ, gercek sinav sirasina gore arayuzde dinamik hesaplanir.
  grupId?: string;
  geometri?: boolean;
  gorselSvg?: string;
  secenekler: [string, string, string, string, string];
  dogruCevap: number;
  aciklama: string;
};

type HaritaNoktasi = { etiket: string; boylam: number; enlem: number };

/**
 * Gercek sinir verisiyle (Natural Earth, bkz. turkiyeHaritaVerisi.ts) Turkiye
 * haritasi: gercek boylam/enlemdeki numarali kirmizi noktalar ve/veya tarali iller.
 */
function turkiyeHaritasi({ noktalar = [], taraliIller = [] }: { noktalar?: HaritaNoktasi[]; taraliIller?: string[] }) {
  const taraliYol = taraliIller
    .map((il) => {
      if (!IL_SINIRLARI[il]) throw new Error(`Harita verisinde il yok: ${il}`);
      return IL_SINIRLARI[il];
    })
    .join("");
  const isaretler = noktalar
    .map(({ etiket, boylam, enlem }) => {
      const [x, y] = projeksiyon(boylam, enlem);
      return `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="3.6" fill="#dc2626" stroke="#7f1d1d" stroke-width="0.8"/><text x="${(x + 5).toFixed(1)}" y="${(y - 4).toFixed(1)}" font-size="12" font-weight="700">${etiket}</text>`;
    })
    .join("");
  return (
    `<svg viewBox="${HARITA_VIEWBOX}" xmlns="http://www.w3.org/2000/svg" font-family="Arial, sans-serif" fill="#1e293b">` +
    `<defs><pattern id="tarali" patternUnits="userSpaceOnUse" width="4" height="4" patternTransform="rotate(45)"><line x1="0" y1="0" x2="0" y2="4" stroke="#1e293b" stroke-width="1.4"/></pattern></defs>` +
    `<path d="${TURKIYE_SINIRI}" fill="#e2e8f0" stroke="#1e293b" stroke-width="1.1" stroke-linejoin="round"/>` +
    (taraliYol ? `<path d="${taraliYol}" fill="url(#tarali)" stroke="#1e293b" stroke-width="0.6"/>` : "") +
    `<path d="${GOLLER}" fill="#7dd3fc" stroke="#1e293b" stroke-width="0.6"/>` +
    isaretler +
    `</svg>`
  );
}

const AY_HARFLERI = ["O", "Ş", "M", "N", "M", "H", "T", "A", "E", "E", "K", "A"];

/** Iki panelli iklim grafigi: ustte aylik ortalama sicaklik (cizgi), altta aylik ortalama yagis (sutun). */
function iklimGrafigi(sicaklik: number[], yagis: number[]) {
  const sol = 44;
  const genislik = 360;
  const yukseklik = 110;
  const ayX = (i: number) => sol + (genislik * (i + 0.5)) / 12;
  const panel = (ust: number, max: number, adim: number, baslik: string, ciz: (y: (v: number) => number) => string) => {
    const y = (v: number) => ust + yukseklik - (v / max) * yukseklik;
    let s = `<text x="${sol}" y="${ust - 10}" font-size="12" font-weight="700">${baslik}</text>`;
    for (let v = 0; v <= max; v += adim) {
      s += `<line x1="${sol}" y1="${y(v)}" x2="${sol + genislik}" y2="${y(v)}" stroke="#cbd5e1" stroke-width="0.7"/><text x="${sol - 6}" y="${y(v) + 4}" font-size="10" text-anchor="end" fill="#475569">${v}</text>`;
    }
    s += ciz(y);
    s += `<line x1="${sol}" y1="${ust + yukseklik}" x2="${sol + genislik}" y2="${ust + yukseklik}" stroke="#1e293b" stroke-width="1.2"/>`;
    return s + AY_HARFLERI.map((a, i) => `<text x="${ayX(i)}" y="${ust + yukseklik + 15}" font-size="10" text-anchor="middle" fill="#475569">${a}</text>`).join("");
  };
  const nokta = (y: (v: number) => number, v: number, i: number) => `${ayX(i).toFixed(1)},${y(v).toFixed(1)}`;
  const sicaklikPaneli = panel(28, 30, 10, "Aylık ortalama sıcaklık (°C)", (y) =>
    `<polyline points="${sicaklik.map((v, i) => nokta(y, v, i)).join(" ")}" fill="none" stroke="#dc2626" stroke-width="2"/>` +
    sicaklik.map((v, i) => `<circle cx="${ayX(i).toFixed(1)}" cy="${y(v).toFixed(1)}" r="3" fill="#dc2626"/>`).join(""),
  );
  const yagisPaneli = panel(196, 300, 100, "Aylık ortalama yağış (mm)", (y) =>
    yagis.map((v, i) => `<rect x="${(ayX(i) - 10).toFixed(1)}" y="${y(v).toFixed(1)}" width="20" height="${(y(0) - y(v)).toFixed(1)}" fill="#2563eb"/>`).join(""),
  );
  return `<svg viewBox="0 0 420 340" xmlns="http://www.w3.org/2000/svg" font-family="Arial, sans-serif" fill="#1e293b">${sicaklikPaneli}${yagisPaneli}</svg>`;
}

// Matematik 52-53 ortak bilgisi: 360 kitap -> roman 120°, tarih 90°, bilim 60°, şiir 90°.
const DAIRE_GRAFIGI =
  '<svg viewBox="0 0 300 280" xmlns="http://www.w3.org/2000/svg" font-family="Arial, sans-serif" fill="#1e293b" font-size="13">' +
  '<path d="M150,140 L150,40 A100,100 0 0,1 236.6,190 Z" fill="#bfdbfe" stroke="#1e293b" stroke-width="2"/>' +
  '<path d="M150,140 L236.6,190 A100,100 0 0,1 100,226.6 Z" fill="#fde68a" stroke="#1e293b" stroke-width="2"/>' +
  '<path d="M150,140 L100,226.6 A100,100 0 0,1 50,140 Z" fill="#bbf7d0" stroke="#1e293b" stroke-width="2"/>' +
  '<path d="M150,140 L50,140 A100,100 0 0,1 150,40 Z" fill="#fecaca" stroke="#1e293b" stroke-width="2"/>' +
  '<text x="178" y="104">Roman</text><text x="186" y="120">120°</text>' +
  '<text x="146" y="196">Tarih</text><text x="152" y="212">90°</text>' +
  '<text x="76" y="166">Bilim</text><text x="82" y="182">60°</text>' +
  '<text x="92" y="98">Şiir</text><text x="92" y="114">90°</text></svg>';

export const LISANS_SORULARI: SeedSoru[] = [
  // ---- TÜRKÇE (30) ----
  // Gercek kitapcik sirasi: 1-9 sozcuk/cumle anlami ve dil bilgisi (parca
  // icine gomulu), 10-19 paragraf, 20-26 ortak metinli paragraflar,
  // 27-30 ortak bilgili sozel mantik.
  {
    ders: "TURKCE",
    soruMetni:
      '(I) Göçmen kuşlar, binlerce kilometre öteden gelip her yıl aynı sulak alana döner (geri gelmek). (II) Bu dönüş davranışının, kuşların yıldızları ve manyetik alanı kullanarak yön bulmasıyla açıklandığı söylenir (bir görüşle temellendirmek). (III) Bazı araştırmacılar ise kuşların koku duyusunu da kullandığını öne sürer (önceki görüşü tamamen reddetmek). (IV) Yapılan deneyler, her iki yeteneğin de yön bulmada rol oynayabileceğini göstermiştir (kanıt sunmak). (V) Bu bulgular, göç davranışının tek bir mekanizmayla açıklanamayacağını ortaya koymaktadır (sonuca bağlamak).\n\nBu parçadaki numaralı cümlelerden hangisinin anlamı parantez içinde verilen açıklamayla uyuşmamaktadır?',
    secenekler: ["I", "II", "III", "IV", "V"],
    dogruCevap: 2,
    aciklama:
      "III. cümlede araştırmacılar önceki görüşü reddetmez, ona ek bir açıklama öne sürer; bu yüzden 'reddetmek' ifadesiyle uyuşmaz.",
  },
  {
    ders: "TURKCE",
    soruMetni:
      "Antik kentlerin büyük bölümü, yüzyıllar boyunca toprak altında kalarak bugüne ulaşmıştır. Kazı çalışmaları bu kentlerin sokak düzenini ve anıtsal yapılarını gün yüzüne çıkarsa da sıradan insanların gündelik yaşamına ilişkin ayrıntılar çoğu zaman ---- kalır. ---- son yıllarda geliştirilen yer radarı ve uydu görüntüleme teknikleri, kazı yapılmadan bile toprağın altındaki konutların ve atölyelerin haritalanmasına olanak tanıyor.\n\nBu parçada boş bırakılan yerlere aşağıdakilerden hangisi sırasıyla getirilmelidir?",
    secenekler: ["aydınlık - Üstelik", "karanlıkta - Ancak", "ortada - Nitekim", "görünür - Böylece", "bilinir - Örneğin"],
    dogruCevap: 1,
    aciklama:
      "Birinci boşlukta ayrıntıların bilinmediği anlatıldığından \"karanlıkta\" uygundur. İkinci cümle, bu bilinmezliğe karşın yeni tekniklerin sunduğu olanağı anlattığı için karşıtlık bildiren \"Ancak\" getirilmelidir. Diğer seçeneklerde ya ilk sözcük \"bilinmeme\" anlamı taşımaz ya da bağlaç karşıtlık bildirmez.",
  },
  {
    ders: "TURKCE",
    soruMetni:
      "(I) Kentlerin hafızası, çoğu zaman resmî belgelerden çok sokaklarda dolaşan sıradan insanların anlatılarında saklıdır. (II) Eski bir çarşıda kuşaklar boyu dükkân işleten esnafın anıları, o mekânın yalnızca ticari değil toplumsal geçmişini de aydınlatır. (III) Bu anlatıları kayıt altına almak isteyen sözlü tarih çalışmaları, görüşmecinin güvenini kazanmayı, soruları yönlendirmeden sormayı ve kayıtları özenle arşivlemeyi gerektirir. (IV) Ne var ki bu çalışmalar, kişisel hatıraların zamanla değişebileceği gerekçesiyle bazı tarihçilerce kuşkuyla karşılanır. (V) Yine de belgelerin sustuğu yerde konuşan bu tanıklıklar, geçmişin eksik kalan parçalarını tamamlamak için vazgeçilmezdir.\n\nBu parçadaki numaralanmış cümlelerle ilgili aşağıdakilerden hangisi yanlıştır?",
    secenekler: [
      "I. cümlede, kentlerin geçmişine ilişkin bilginin nerede bulunduğuna dair bir yargı ileri sürülmüştür.",
      "II. cümlede, I. cümledeki yargı bir örnekle somutlaştırılmıştır.",
      "III. cümlede, sözlü tarih çalışmalarının gerektirdikleri sıralanmıştır.",
      "IV. cümlede, sözlü tarih çalışmalarına yöneltilen bir eleştiri gerekçesiyle birlikte aktarılmıştır.",
      "V. cümlede, sözlü tanıklıkların yazılı belgelerden daha güvenilir olduğu kanıtlanmıştır.",
    ],
    dogruCevap: 4,
    aciklama:
      "V. cümlede sözlü tanıklıkların belgelerin eksik kaldığı yerde vazgeçilmez olduğu belirtilmiştir; belgelerden daha güvenilir olduklarına dair bir yargı ya da kanıt yoktur. Diğer seçenekler cümlelerin içeriğiyle örtüşür.",
  },
  {
    ders: "TURKCE",
    soruMetni:
      "I. Mektup, yüzyıllar boyunca insanların uzaktaki yakınlarıyla duygu ve düşüncelerini paylaşmalarının en önemli aracı olmuştur.\nII. Anlık mesajlaşma uygulamalarının yaygınlaştığı günümüzde, birkaç sayfalık bir mektubun özenle yazılıp haftalarca beklenmesi pek çok kişiye anlamsız görünmektedir.\n\nYukarıda verilen II numaralı cümleyle ilgili aşağıdakilerden hangisi söylenebilir?",
    secenekler: [
      "I. cümlede sözü edilen aracın günümüzdeki konumunun değiştiği belirtilmektedir.",
      "I. cümledeki yargının hiçbir dönemde geçerli olmadığı öne sürülmektedir.",
      "I. cümlede sözü edilen aracın üstünlükleri sıralanmaktadır.",
      "I. cümledeki durumun ortaya çıkış nedenleri açıklanmaktadır.",
      "I. cümledeki yargıyı destekleyen tarihsel bir örnek verilmektedir.",
    ],
    dogruCevap: 0,
    aciklama:
      "II. cümle, I. cümlede geçmişteki önemi vurgulanan mektubun, anlık mesajlaşmanın yaygınlaştığı günümüzde eski konumunu yitirdiğini anlatır. Cümle I'deki yargıyı geçmiş için reddetmez, mektubun üstünlüklerini sıralamaz ve bir örnek vermez.",
  },
  {
    ders: "TURKCE",
    soruMetni: "Aşağıdaki cümlelerin hangisinde, kısaltmaya getirilen ekin yazımında yanlışlık yapılmıştır?",
    secenekler: [
      "Yasa teklifi bu hafta TBMM'ye sunulacakmış.",
      "Bu ürünler bir süre KDV'den muaf tutulmuştu.",
      "Türkiye, 1952 yılında NATO'ya üye oldu.",
      "Sözcüğün doğru yazımını TDK'ya danıştık.",
      "Ağabeyim yıllarca ODTÜ'de ders verdi.",
    ],
    dogruCevap: 3,
    aciklama:
      "Kısaltmalara getirilen ekler kısaltmanın okunuşuna uyar. TDK \"te-de-ke\" diye okunduğundan ek \"TDK'ye\" biçiminde yazılmalıdır. TBMM'ye (te-be-me-me), KDV'den (ka-de-ve), NATO'ya (nato) ve ODTÜ'de (odtü) doğru yazılmıştır.",
  },
  {
    ders: "TURKCE",
    soruMetni:
      "Genç kuşağın en üretken şairlerinden biri olan Selin Aksoy ( I ) ilk kitabı Kırık Saatler'den sonra Gece Kuşları'yla da okurlarını şaşırtmayı başardı ( II ) Aksoy bu kitabında ( III ) doğa ( IV ) kent ve yalnızlık temalarını bir araya getiriyor ( V ) yine de ilk kitabındaki içten sesi korumayı ihmal etmiyor.\n\nBu parçada numaralanmış yerlerden hangisine herhangi bir noktalama işareti getirilemez?",
    secenekler: ["I", "II", "III", "IV", "V"],
    dogruCevap: 2,
    aciklama:
      "I'e uzun özneden sonra virgül, II'ye cümle sonu olduğu için nokta, IV'e sıralı kelimeleri ayırmak için virgül, V'e ise ögeleri arasında virgül bulunan sıralı cümleleri ayırmak için noktalı virgül getirilir. III'te \"bu kitabında doğa...\" arasında hiçbir işaret gerekmez.",
  },
  {
    ders: "TURKCE",
    soruMetni:
      "Karadeniz kıyısındaki küçük kasabamızda sonbahar, ağaçların yapraklarını döktüğü sessiz bir mevsimdir. Oğlum her sabah okula giderken yol kenarındaki kestane ağacının altında durur, yere düşen kestaneleri cebine doldururdu. Akşamüstü eve döndüğünde ise bu küçük hazineyi annesine gösterip uzun uzun anlatırdı.\n\nBu parçada aşağıdaki ses olaylarından hangisi yoktur?",
    secenekler: ["Ünlü daralması", "Ünsüz yumuşaması", "Ünlü düşmesi", "Ünsüz benzeşmesi", "Kaynaştırma"],
    dogruCevap: 0,
    aciklama:
      "\"ağacının, cebine\" sözcüklerinde ünsüz yumuşaması, \"oğlum\" (oğul-um) sözcüğünde ünlü düşmesi, \"döktüğü\" sözcüğünde ünsüz benzeşmesi, \"kıyısındaki, annesine\" sözcüklerinde kaynaştırma vardır. Parçada -yor ekiyle oluşan ünlü daralması yoktur.",
  },
  {
    ders: "TURKCE",
    soruMetni:
      "Sabah erkenden kalkıp (I) koşuya çıkan Mert, parkta koşarken (II) gördüğü yaşlı adamla sohbet etti. Adam, gençliğinde yazdığı (III) şiirlerden söz ederken gözleri parlıyordu. Mert, bu şiirleri bir gün okumayı (IV) kendine hedef koydu ve eve dönerken (V) bu karşılaşmayı hiç unutmayacağını düşündü.\n\nNumaralanmış fiilimsilerden hangisi sıfat-fiil (sıfat göreviyle kullanılmış fiilimsi)dir?",
    secenekler: ["I", "II", "III", "IV", "V"],
    dogruCevap: 2,
    aciklama: '"Yazdığı" (-dığı eki) burada "şiirler" sözcüğünü niteleyen bir sıfat-fiildir; diğerleri bağ-fiil (I, II, V) veya isim-fiildir (IV).',
  },
  {
    ders: "TURKCE",
    soruMetni: "Aşağıdaki cümlelerin hangisinde bir anlatım bozukluğu vardır?",
    secenekler: [
      "Yeni yönetmelik, öğrencilerin hem derse devamını hem de başarısını artırması bekleniyor.",
      "Yazar, son romanında hem çocukluk anılarına hem de kentin değişen yüzüne geniş yer vermiş.",
      "Toplantıya katılan herkes, alınan kararların hemen uygulanması gerektiği konusunda hemfikirdi.",
      "Bu konuda uzmanların görüşüne başvurmadan kesin bir karar vermemeliyiz.",
      "Kitabı okuduktan sonra yazarın neden bu kadar övüldüğünü daha iyi anladım.",
    ],
    dogruCevap: 0,
    aciklama:
      "\"artırması bekleniyor\" yapısındaki iyelik eki, tamlayanın \"Yeni yönetmeliğin\" biçiminde olmasını gerektirir. Tamlayan eki eksik olduğundan cümlede yapı bozukluğu vardır; doğrusu \"Yeni yönetmeliğin ... artırması bekleniyor.\" olmalıdır.",
  },
  {
    ders: "TURKCE",
    soruMetni:
      "(I) Bal arıları, çiçekten topladıkları nektarı kovana taşıyarak bal üretimine başlar. (II) Bu süreçte arılar, nektarı ağız organlarıyla işleyerek enzimler katar. (III) Petek gözlerine yerleştirilen bu karışım, suyunu kaybederek koyulaşır. (IV) Arı sokması, vücutta şişlik ve kızarıklığa yol açabilen bir savunma mekanizmasıdır. (V) Son aşamada işçi arılar, peteği ince bir balmumu tabakasıyla kapatarak balı olgunlaştırır.\n\nBu parçadaki numaralı cümlelerden hangisi düşüncenin akışını bozmaktadır?",
    secenekler: ["I", "II", "III", "IV", "V"],
    dogruCevap: 3,
    aciklama: "Diğer cümleler bal üretim sürecini sırayla anlatırken IV. cümle konu dışına çıkıp arı sokmasından söz eder.",
  },
  {
    ders: "TURKCE",
    soruMetni:
      "(I) İnsan uykusu, birbirini izleyen ve yaklaşık doksan dakika süren döngülerden oluşur. (II) Her döngüde beyin, hafif uykudan derin uykuya, oradan da rüyaların görüldüğü REM evresine geçer. (III) Derin uyku bedenin onarıldığı, REM evresi ise öğrenilen bilgilerin belleğe yerleştirildiği dönem olarak bilinir. (IV) Ne var ki modern yaşamın getirdiği alışkanlıklar, bu döngülerin kesintisiz sürmesini giderek zorlaştırıyor. (V) Yatmadan önce uzun süre ekrana bakmak, beyni uykuya hazırlayan hormonun salgılanmasını geciktiriyor. (VI) Düzensiz çalışma saatleri ise biyolojik saatin şaşmasına yol açıyor.\n\nBu parça iki paragrafa ayrılmak istense ikinci paragraf hangi cümleyle başlar?",
    secenekler: ["II", "III", "IV", "V", "VI"],
    dogruCevap: 2,
    aciklama:
      "İlk üç cümle uykunun döngüsel yapısını ve evrelerin işlevini anlatır. IV. cümlede \"Ne var ki\" ile konu, modern yaşamın bu döngüyü bozmasına geçer; V ve VI bu durumun örnekleridir. Bu nedenle ikinci paragraf IV. cümleyle başlar.",
  },
  {
    ders: "TURKCE",
    soruMetni:
      "Çeviri, yalnızca sözcüklerin bir dilden ötekine aktarılması değildir; her dil, dünyayı kendine özgü biçimde parçalara ayırır ve adlandırır. Bu yüzden bir şiiri çeviren kişi, sözcüklerin sözlük anlamlarından çok o dilin okurunda uyandırdığı çağrışımların peşine düşmek zorundadır. Kimi çevirmenler aslına sadık kalmayı her şeyin önünde tutar ve ortaya doğru ama cansız metinler çıkar. Kimileri ise şiirin ruhunu yakalamak uğruna metinden uzaklaşır; okur bu kez güzel ama başka bir şiirle karşılaşır. Usta çevirmen, bu iki uç arasında dengeyi kurabilendir.\n\nBu parçadan aşağıdakilerin hangisine ulaşılabilir?",
    secenekler: [
      "Şiir çevirisinde başarı, kaynak metne bağlılık ile şiirsel etkiyi koruma arasında denge kurmaya bağlıdır.",
      "Bir şiiri ancak şairin kendisi doğru biçimde çevirebilir.",
      "Diller arasındaki farklar, şiir çevirisini tümüyle olanaksız kılar.",
      "İyi bir şiir çevirisi, sözcüklerin sözlük anlamlarını eksiksiz aktaran çeviridir.",
      "Aslından uzaklaşan çeviriler okurlar tarafından daha çok beğenilir.",
    ],
    dogruCevap: 0,
    aciklama:
      "Yazar, yalnızca sadakatin cansız, yalnızca ruhu yakalama çabasının ise başka bir şiir ortaya çıkardığını belirtip usta çevirmeni bu iki uç arasında denge kurabilen kişi olarak tanımlar. Diğer seçenekler parçada yer almayan ya da parçayla çelişen yargılardır.",
  },
  {
    ders: "TURKCE",
    soruMetni:
      "Bir kentin tarihî dokusunu korumak, yalnızca eski yapıları yıkılmaktan kurtarmak anlamına gelmez. Son yıllarda pek çok kentte, restorasyon adı altında konaklar aslına uygun olmayan malzemelerle yeniden yapılıyor; cepheleri parlatılan bu yapıların içleri kafe ve hediyelik eşya dükkânlarıyla dolduruluyor. Böylece bir zamanlar içinde yaşanan evler, yalnızca fotoğraf çekilecek dekorlara dönüşüyor. Oysa bir mahalleyi yaşatan, duvarlarından çok o duvarların arasında süren gündelik hayattır.\n\nBu parçada yazarın eleştirdiği tutum aşağıdakilerden hangisidir?",
    secenekler: [
      "Tarihî yapıların bakımsızlık nedeniyle yıkılmaya terk edilmesi",
      "Eski mahallelerde turizm faaliyetlerinin hiç desteklenmemesi",
      "Restorasyon çalışmalarında yerel halkın görüşüne başvurulması",
      "Tarihî kent dokusunun belgelenmesi için fotoğraf çekilmesi",
      "Tarihî yapıların gündelik yaşamdan koparılarak yalnızca görsel bir dekora dönüştürülmesi",
    ],
    dogruCevap: 4,
    aciklama:
      "Yazar, aslına uygun olmayan restorasyonlarla içi ticari işletmelerle doldurulan yapıların \"fotoğraf çekilecek dekorlara\" dönüşmesini eleştirir ve mahalleyi yaşatanın gündelik hayat olduğunu vurgular.",
  },
  {
    ders: "TURKCE",
    soruMetni:
      "Göç eden kuşlar gibi bazı kelebek türleri de binlerce kilometrelik yolculuklar yapar. Kuzey Amerika'daki kral kelebekleri sonbaharda Kanada ve ABD'den Meksika'daki dağ ormanlarına uçar ve kışı orada geçirir. İlkbaharda başlayan kuzeye dönüş ise birkaç kuşak sürer; yolculuğu tamamlayanlar, yola çıkanların torunlarıdır. Şaşırtıcı olan, sonbaharda yeniden güneye uçan kuşağın daha önce hiç görmediği ormanları şaşmadan bulmasıdır. Bilim insanları, kelebeklerin yön bulmada güneşin konumundan ve yeryüzünün manyetik alanından yararlandığını düşünmektedir.\n\nBu parçadan aşağıdakilerden hangisine ulaşılamaz?",
    secenekler: [
      "Kuzeye dönüş yolculuğu tek bir kuşağın ömrüne sığmaz.",
      "Kral kelebekleri göç boyunca hiç beslenmeden uçar.",
      "Güneye uçan kuşak, kışı geçireceği ormanları önceden görmemiştir.",
      "Kelebeklerin yön bulma biçimine ilişkin bilimsel bir görüş bulunmaktadır.",
      "Uzun mesafeli göç yalnızca kuşlara özgü bir davranış değildir.",
    ],
    dogruCevap: 1,
    aciklama:
      "Parçada kelebeklerin göç sırasında beslenip beslenmediğine dair bir bilgi yoktur. Diğer yargılar parçada açıkça ya da dolaylı olarak yer alır.",
  },
  {
    ders: "TURKCE",
    soruMetni:
      "Çocuklara kitap okuma alışkanlığı kazandırmak için çoğu zaman onlara ne okumaları gerektiği söylenir; listeler hazırlanır, okunacak sayfa sayıları belirlenir. Oysa zorunluluk duygusuyla elden ele geçen kitap, çocuğun gözünde bir ödevden farksızdır. Okumayı seven çocukların çoğu, evinde kitap okuyan yetişkinler gören, kitaplarla oyuncaklar kadar kolay haşır neşir olabilen çocuklardır. Kısacası okuma sevgisi buyrukla değil, örnek olmakla ve uygun ortamı hazırlamakla kazandırılır.\n\nBu parçada asıl anlatılmak istenen aşağıdakilerden hangisidir?",
    secenekler: [
      "Çocuklar için yaşlarına uygun okuma listeleri hazırlanmalıdır.",
      "Çocuklarda okuma sevgisi, zorlamayla değil yetişkinlerin örnek olması ve uygun ortamla gelişir.",
      "Çocuklar oyuncaklarla kitaplardan daha çok ilgilenir.",
      "Okulların verdiği okuma ödevleri azaltılmalıdır.",
      "Kitap okuma alışkanlığı yalnızca erken yaşta kazanılabilir.",
    ],
    dogruCevap: 1,
    aciklama:
      "Parçanın son cümlesi ana düşünceyi özetler: Okuma sevgisi buyrukla değil, örnek olmak ve uygun ortamı hazırlamakla kazandırılır. Diğer seçenekler ya parçada yer almaz ya da yardımcı ayrıntılardır.",
  },
  {
    ders: "TURKCE",
    soruMetni:
      "Dünyadaki suyun yaklaşık yüzde doksan yedisi okyanuslarda tuzlu su olarak bulunur; geriye kalan tatlı suyun da büyük bölümü buzullarda ve yer altında hapsolmuştur. Başka bir deyişle, insanlığın göllerden ve akarsulardan doğrudan kullanabildiği su, kabaca bir küvet dolusu suyun içindeki bir çay kaşığı kadardır. Bu yüzden suyu, bir musluktan akan sınırsız bir kaynak gibi değil, bir hesaptaki kısıtlı bir bakiye gibi düşünmek gerekir.\n\nBu parçada düşünceyi geliştirme yollarından hangileri kullanılmıştır?",
    secenekler: [
      "Tanık gösterme - Örneklendirme",
      "Karşılaştırma - Tanımlama",
      "Tanımlama - Tanık gösterme",
      "Örneklendirme - Karşılaştırma",
      "Sayısal verilerden yararlanma - Benzetme",
    ],
    dogruCevap: 4,
    aciklama:
      "\"yüzde doksan yedisi\" ifadesiyle sayısal veriden yararlanılmış; kullanılabilir su \"küvetteki bir çay kaşığı\"na, su kaynakları da \"hesaptaki kısıtlı bir bakiye\"ye benzetilmiştir. Parçada tanık gösterme ve tanımlama yoktur.",
  },
  {
    ders: "TURKCE",
    soruMetni:
      "Son yıllarda yayımlanan kişisel gelişim kitaplarının çoğu, başarıyı birkaç basit kurala indirgiyor: Erken kalk, hedeflerini yaz, olumlu düşün. Bu kurallar bazı okurlara yol gösterebilir; ancak bu kitapların, başarının ekonomik koşullar, eğitim olanakları ya da şans gibi bireyin denetimi dışındaki etkenlerden bağımsız olduğunu ima etmeleri sorunludur. Başarısız olan herkes, böylece suçu yalnızca kendinde aramaya başlar.\n\nBu parçada yazarın kişisel gelişim kitaplarına yönelik tutumu aşağıdakilerden hangisidir?",
    secenekler: [
      "Bu kitapların herkes tarafından mutlaka okunmasını önerir.",
      "Tümüyle reddetmeden, başarıyı yalnızca bireysel çabaya bağlamalarını eleştirir.",
      "Hiçbir yararları olmadığını ve tümüyle yanıltıcı olduklarını savunur.",
      "Önerdikleri kuralların bilimsel olarak kanıtlandığını belirtir.",
      "Yazarlarının yalnızca ticari kaygıyla hareket ettiğini belgeler.",
    ],
    dogruCevap: 1,
    aciklama:
      "Yazar, kuralların \"bazı okurlara yol gösterebilir\" olduğunu kabul eder; ancak başarıyı bireyin denetimi dışındaki etkenlerden bağımsızmış gibi göstermelerini sorunlu bulur. Bu, ölçülü bir eleştiri tutumudur.",
  },
  {
    ders: "TURKCE",
    soruMetni:
      "Eskiden bir semtin fırını, kasabı ve manavı yalnızca alışveriş yapılan yerler değildi; mahalleli buralarda karşılaşır, haberleşir, birbirinin derdine ortak olurdu. ---- Büyük alışveriş merkezlerinin yaygınlaşmasıyla bu küçük dükkânlar birer birer kapandı ve onlarla birlikte mahallenin buluşma noktaları da kayboldu.\n\nBu parçada boş bırakılan yere aşağıdakilerden hangisi getirilmelidir?",
    secenekler: [
      "Bu dükkânlar, bir bakıma mahallenin sosyal hayatını bir arada tutan düğüm noktalarıydı.",
      "Alışveriş merkezleri ise geniş otoparklarıyla tüketicilere büyük kolaylık sağlar.",
      "Fırınlarda ekmeğin taş fırında pişirilmesi lezzetini artırır.",
      "Kasaplar, et fiyatlarındaki artış nedeniyle zor günler geçiriyordu.",
      "Manavlar, mevsim sebzelerini çoğu zaman tarladan doğrudan getirirdi.",
    ],
    dogruCevap: 0,
    aciklama:
      "Boşluktan önce dükkânların toplumsal işlevi anlatılmış, sonra bu dükkânlarla birlikte \"buluşma noktalarının\" kaybolduğu söylenmiştir. Bu iki cümleyi bağlayan, dükkânların mahallenin sosyal hayatındaki yerini özetleyen A seçeneğidir.",
  },
  {
    ders: "TURKCE",
    soruMetni:
      "Anadolu'nun geleneksel kilimlerinde her motif bir anlam taşır: Elibelinde motifi bereketi ve anneliği, koçboynuzu gücü ve kahramanlığı, su yolu ise hayatın sürekliliğini simgeler. Dokuyucular bu motifleri çoğu zaman bir desen kitabından değil, annelerinden ve ninelerinden öğrenir; böylece her kilim, kuşaklar boyu aktarılan bir dilin cümlelerine dönüşür. Kök boyalarla renklendirilen yünler ise yıllar geçtikçe solmak yerine daha yumuşak tonlar kazanır.\n\nBu parçada geleneksel kilimlerle ilgili aşağıdakilerden hangisine değinilmemiştir?",
    secenekler: [
      "Motiflerin simgesel anlamlar taşıdığına",
      "Motif bilgisinin kuşaktan kuşağa aktarıldığına",
      "Boyanmasında doğal boyalar kullanıldığına",
      "Renklerinin zamanla değişime uğradığına",
      "Bir kilimin dokunmasının ne kadar sürdüğüne",
    ],
    dogruCevap: 4,
    aciklama:
      "Parçada motiflerin anlamlarına, bu bilginin anneden kıza aktarılmasına, kök boyalara ve renklerin zamanla yumuşamasına değinilmiş; dokuma süresine ilişkin bir bilgi verilmemiştir.",
  },
  {
    ders: "TURKCE",
    soruMetni:
      "Bir romancının başarısı, yalnızca kurduğu olay örgüsüyle değil, okuru kurmaca dünyanın içine çekebilme becerisiyle de ölçülür. Kimi yazarlar, karakterlerini baştan sona kusursuz çizmeye çalışırken onları gerçeklikten uzaklaştırır; oysa okur, kahramanın zaaflarıyla, tereddütleriyle, hatalarıyla özdeşleşir. Bu yüzden deneyimli bir yazar, karakterine kusursuzluk değil, inandırıcılık kazandırmayı önceler. Anlatılan dünyanın gerçekliği, yazarın kelime seçiminden çok, insana dair çelişkileri ne kadar dürüstçe yansıttığıyla ilgilidir. Bir romanın yıllar sonra bile okunması, genellikle bu dürüstlükten kaynaklanır.\n\nBu parçaya göre bir romanın okur üzerinde kalıcı etki bırakmasının temel nedeni aşağıdakilerden hangisidir?",
    grupId: "turkce-parca-roman",
    secenekler: [
      "Yazarın özenli kelime seçimleri",
      "Olay örgüsünün karmaşıklığı",
      "İnsana dair çelişkilerin dürüstçe yansıtılması",
      "Karakterlerin kusursuz çizilmesi",
      "Anlatılan dünyanın gerçeklikten tamamen kopuk olması",
    ],
    dogruCevap: 2,
    aciklama: "Parça, kalıcılığın 'insana dair çelişkileri dürüstçe yansıtmak'tan kaynaklandığını açıkça belirtir.",
  },
  {
    ders: "TURKCE",
    soruMetni:
      "Bir romancının başarısı, yalnızca kurduğu olay örgüsüyle değil, okuru kurmaca dünyanın içine çekebilme becerisiyle de ölçülür. Kimi yazarlar, karakterlerini baştan sona kusursuz çizmeye çalışırken onları gerçeklikten uzaklaştırır; oysa okur, kahramanın zaaflarıyla, tereddütleriyle, hatalarıyla özdeşleşir. Bu yüzden deneyimli bir yazar, karakterine kusursuzluk değil, inandırıcılık kazandırmayı önceler. Anlatılan dünyanın gerçekliği, yazarın kelime seçiminden çok, insana dair çelişkileri ne kadar dürüstçe yansıttığıyla ilgilidir. Bir romanın yıllar sonra bile okunması, genellikle bu dürüstlükten kaynaklanır.\n\nBu parçadan hareketle aşağıdakilerden hangisine ulaşılamaz?",
    grupId: "turkce-parca-roman",
    secenekler: [
      "Okur, kahramanın zaaflarıyla özdeşleşebilir.",
      "Kusursuz çizilen karakterler gerçeklikten uzaklaşabilir.",
      "Deneyimli yazarlar inandırıcılığı önceler.",
      "Bir romanın başarısı yalnızca olay örgüsüyle ölçülür.",
      "Kelime seçimi, gerçekliği yansıtmada tek belirleyici unsur değildir.",
    ],
    dogruCevap: 3,
    aciklama: "Parça 'yalnızca olay örgüsüyle değil' diyerek bunun tam tersini söyler; bu nedenle D'ye ulaşılamaz.",
  },
  {
    ders: "TURKCE",
    soruMetni:
      "Şehirlerin büyümesiyle birlikte toplu taşıma sistemlerine olan bağımlılık da artıyor. Ancak yalnızca metro ve otobüs hatlarını çoğaltmak, trafik sorununu kalıcı olarak çözmüyor. Kentlerin, yayalaştırılmış bölgeleri artırması, bisiklet yollarını güvenli hâle getirmesi ve farklı ulaşım türlerini birbirine entegre etmesi gerekiyor. Aksi hâlde yeni açılan her yol kısa süre içinde yeniden tıkanıyor; çünkü artan kapasite, zamanla daha fazla özel araç kullanımını teşvik ediyor. Bu nedenle sürdürülebilir bir ulaşım politikası, yalnızca yeni yol ve hat inşasına değil, davranış değişikliğine de odaklanmalıdır.\n\nBu parçanın ana düşüncesi aşağıdakilerden hangisidir?",
    grupId: "turkce-parca-ulasim",
    secenekler: [
      "Metro hatları trafik sorununu tek başına çözer.",
      "Sürdürülebilir ulaşım için yol inşasının yanında davranış değişikliği de gereklidir.",
      "Bisiklet yolları şehir trafiğini tamamen ortadan kaldırır.",
      "Özel araç kullanımı hiçbir koşulda azaltılamaz.",
      "Kentlerde yaya bölgeleri ekonomik kayba yol açar.",
    ],
    dogruCevap: 1,
    aciklama: "Parçanın son cümlesi bu ana düşünceyi doğrudan özetler.",
  },
  {
    ders: "TURKCE",
    soruMetni:
      "Şehirlerin büyümesiyle birlikte toplu taşıma sistemlerine olan bağımlılık da artıyor. Ancak yalnızca metro ve otobüs hatlarını çoğaltmak, trafik sorununu kalıcı olarak çözmüyor. Kentlerin, yayalaştırılmış bölgeleri artırması, bisiklet yollarını güvenli hâle getirmesi ve farklı ulaşım türlerini birbirine entegre etmesi gerekiyor. Aksi hâlde yeni açılan her yol kısa süre içinde yeniden tıkanıyor; çünkü artan kapasite, zamanla daha fazla özel araç kullanımını teşvik ediyor. Bu nedenle sürdürülebilir bir ulaşım politikası, yalnızca yeni yol ve hat inşasına değil, davranış değişikliğine de odaklanmalıdır.\n\nBu parçaya göre aşağıdakilerden hangisi söylenemez?",
    grupId: "turkce-parca-ulasim",
    secenekler: [
      "Yeni yollar bazen kısa sürede yeniden tıkanabilir.",
      "Artan yol kapasitesi özel araç kullanımını teşvik edebilir.",
      "Ulaşım türlerinin entegrasyonu önemlidir.",
      "Sadece yol ve hat inşası trafik sorununu kalıcı olarak çözer.",
      "Yayalaştırma, sürdürülebilir ulaşım politikasının bir parçasıdır.",
    ],
    dogruCevap: 3,
    aciklama: "Parça, yalnızca yol/hat inşasının yeterli olmadığını açıkça belirtir; bu yüzden D söylenemez.",
  },
  {
    ders: "TURKCE",
    grupId: "turkce-parca-sanat",
    soruMetni:
      "Bir sanat yapıtının değeri, çoğu zaman yapıldığı dönemde değil, ondan sonra gelen kuşakların onunla kurduğu ilişkide ortaya çıkar. Kendi zamanında anlaşılmamış nice ressam ve besteci yüzyıllar sonra ustalığıyla anılır; buna karşılık bir dönemin en çok alkışlanan adları kimi zaman yalnızca ansiklopedilerin dipnotlarında kalır. Bu durum, çağdaşların yargısının yanıltıcı olabileceğini gösterir. Çünkü çağdaş izleyici, yapıtı kendi alışkanlıklarının süzgecinden geçirerek değerlendirir; alışılmışın dışına çıkan her yenilik önce bir yanlışlık gibi görünür. Zaman ise bu alışkanlıkları törpüler, yapıtı kendi koşullarında görmemizi sağlar. Ne var ki zamanın her yapıtı adil biçimde tarttığını söylemek de bir yanılsamadır: Kimi yapıtlar yeniden keşfedilmek için kendilerine kapı aralayacak bir eleştirmeni ya da yayıncıyı bekler; kimisi de bu şansı hiç bulamadan unutulur gider.\n\nBu parçaya göre çağdaş izleyicinin yeni yapıtları yanlış değerlendirmesinin nedeni aşağıdakilerden hangisidir?",
    secenekler: [
      "Sanatçıların yapıtlarını yeterince tanıtamaması",
      "Yapıtları kendi alışkanlıklarına göre yargılaması",
      "Eleştirmenlerin yapıtlar hakkında yazmaktan kaçınması",
      "Sanat yapıtlarına ulaşmanın zor olması",
      "Ansiklopedilerin yalnızca ünlü adlara yer vermesi",
    ],
    dogruCevap: 1,
    aciklama:
      "Parçada çağdaş izleyicinin yapıtı \"kendi alışkanlıklarının süzgecinden geçirerek\" değerlendirdiği ve bu yüzden yeniliğin önce yanlışlık gibi göründüğü açıkça belirtilmiştir.",
  },
  {
    ders: "TURKCE",
    grupId: "turkce-parca-sanat",
    soruMetni:
      "Bir sanat yapıtının değeri, çoğu zaman yapıldığı dönemde değil, ondan sonra gelen kuşakların onunla kurduğu ilişkide ortaya çıkar. Kendi zamanında anlaşılmamış nice ressam ve besteci yüzyıllar sonra ustalığıyla anılır; buna karşılık bir dönemin en çok alkışlanan adları kimi zaman yalnızca ansiklopedilerin dipnotlarında kalır. Bu durum, çağdaşların yargısının yanıltıcı olabileceğini gösterir. Çünkü çağdaş izleyici, yapıtı kendi alışkanlıklarının süzgecinden geçirerek değerlendirir; alışılmışın dışına çıkan her yenilik önce bir yanlışlık gibi görünür. Zaman ise bu alışkanlıkları törpüler, yapıtı kendi koşullarında görmemizi sağlar. Ne var ki zamanın her yapıtı adil biçimde tarttığını söylemek de bir yanılsamadır: Kimi yapıtlar yeniden keşfedilmek için kendilerine kapı aralayacak bir eleştirmeni ya da yayıncıyı bekler; kimisi de bu şansı hiç bulamadan unutulur gider.\n\nBu parçada yazarın, zamanın her yapıtı adil biçimde tarttığı düşüncesine yönelik tutumu aşağıdakilerden hangisidir?",
    secenekler: [
      "Bu düşünceyi tümüyle benimser ve örneklerle destekler.",
      "Bu düşüncenin yalnızca resim sanatı için geçerli olduğunu belirtir.",
      "Bu düşüncenin her zaman geçerli olmadığını, rastlantıların da belirleyici olabileceğini savunur.",
      "Bu düşünceyi ilk kez kendisinin ortaya attığını vurgular.",
      "Bu düşünceye ilişkin bir yargıda bulunmaktan kaçınır.",
    ],
    dogruCevap: 2,
    aciklama:
      "Yazar bu düşünceyi \"bir yanılsama\" olarak niteler ve kimi yapıtların bir eleştirmen ya da yayıncının kapı aralamasını beklediğini, kimisinin de bu şansı bulamadan unutulduğunu söyler. Yani değerlendirmede rastlantının da payı vardır.",
  },
  {
    ders: "TURKCE",
    grupId: "turkce-parca-sanat",
    soruMetni:
      "Bir sanat yapıtının değeri, çoğu zaman yapıldığı dönemde değil, ondan sonra gelen kuşakların onunla kurduğu ilişkide ortaya çıkar. Kendi zamanında anlaşılmamış nice ressam ve besteci yüzyıllar sonra ustalığıyla anılır; buna karşılık bir dönemin en çok alkışlanan adları kimi zaman yalnızca ansiklopedilerin dipnotlarında kalır. Bu durum, çağdaşların yargısının yanıltıcı olabileceğini gösterir. Çünkü çağdaş izleyici, yapıtı kendi alışkanlıklarının süzgecinden geçirerek değerlendirir; alışılmışın dışına çıkan her yenilik önce bir yanlışlık gibi görünür. Zaman ise bu alışkanlıkları törpüler, yapıtı kendi koşullarında görmemizi sağlar. Ne var ki zamanın her yapıtı adil biçimde tarttığını söylemek de bir yanılsamadır: Kimi yapıtlar yeniden keşfedilmek için kendilerine kapı aralayacak bir eleştirmeni ya da yayıncıyı bekler; kimisi de bu şansı hiç bulamadan unutulur gider.\n\nBu parçadan aşağıdakilerden hangisi çıkarılamaz?",
    secenekler: [
      "Bir yapıtın değeri farklı dönemlerde farklı algılanabilir.",
      "Eleştirmen ve yayıncılar, unutulmuş yapıtların yeniden keşfedilmesini sağlayabilir.",
      "Yenilikçi yapıtlar ilk ortaya çıktıklarında yadırganabilir.",
      "Kimi yapıtlar hiç keşfedilmeden kaybolup gider.",
      "Kendi döneminde ilgi gören sanatçıların yapıtları sonraki kuşaklarca mutlaka unutulur.",
    ],
    dogruCevap: 4,
    aciklama:
      "Parçada çok alkışlanan adların \"kimi zaman\" dipnotlarda kaldığı söylenir; bunun her zaman, \"mutlaka\" olduğu söylenmez. Diğer yargılar parçadan çıkarılabilir.",
  },
  {
    ders: "TURKCE",
    grupId: "turkce-mantik-sunum",
    soruMetni:
      "Ahmet, Burcu, Cem, Derya ve Emre adlı beş arkadaş, pazartesiden cumaya kadar her gün yalnızca birinin sunum yapacağı biçimde birer sunum yapacaktır. Sunum günlerine ilişkin bilinenler şunlardır:\n- Cem, Derya'dan daha önceki bir günde sunum yapacaktır.\n- Burcu ile Emre ardışık iki günde sunum yapacaktır.\n- Ahmet çarşamba, Derya ise cuma günü sunum yapmayacaktır.\n- Emre, Ahmet'ten daha sonraki bir günde sunum yapacaktır.\n- Burcu pazartesi günü sunum yapmayacaktır.\n\nBuna göre aşağıdakilerden hangisi kesinlikle doğrudur?",
    secenekler: [
      "Ahmet pazartesi günü sunum yapacaktır.",
      "Cem salı günü sunum yapacaktır.",
      "Burcu perşembe günü sunum yapacaktır.",
      "Emre cuma günü sunum yapacaktır.",
      "Derya çarşamba günü sunum yapacaktır.",
    ],
    dogruCevap: 4,
    aciklama:
      "Koşulları sağlayan dört sıralama vardır: Ahmet-Cem-Derya-Burcu-Emre, Ahmet-Cem-Derya-Emre-Burcu, Cem-Ahmet-Derya-Burcu-Emre ve Cem-Ahmet-Derya-Emre-Burcu. Hepsinde Derya çarşamba sunum yapar; diğer seçenekler bazı sıralamalarda doğru değildir.",
  },
  {
    ders: "TURKCE",
    grupId: "turkce-mantik-sunum",
    soruMetni:
      "Ahmet, Burcu, Cem, Derya ve Emre adlı beş arkadaş, pazartesiden cumaya kadar her gün yalnızca birinin sunum yapacağı biçimde birer sunum yapacaktır. Sunum günlerine ilişkin bilinenler şunlardır:\n- Cem, Derya'dan daha önceki bir günde sunum yapacaktır.\n- Burcu ile Emre ardışık iki günde sunum yapacaktır.\n- Ahmet çarşamba, Derya ise cuma günü sunum yapmayacaktır.\n- Emre, Ahmet'ten daha sonraki bir günde sunum yapacaktır.\n- Burcu pazartesi günü sunum yapmayacaktır.\n\nBuna göre;\nI. Ahmet\nII. Cem\nIII. Emre\nkişilerinden hangileri pazartesi günü sunum yapabilir?",
    secenekler: ["Yalnız I", "Yalnız II", "Yalnız III", "I ve II", "II ve III"],
    dogruCevap: 3,
    aciklama:
      "Olası dört sıralamada pazartesi günü ya Ahmet ya da Cem sunum yapar. Emre, Ahmet'ten sonra sunum yapmak zorunda olduğundan pazartesi sunum yapamaz.",
  },
  {
    ders: "TURKCE",
    grupId: "turkce-mantik-sunum",
    soruMetni:
      "Ahmet, Burcu, Cem, Derya ve Emre adlı beş arkadaş, pazartesiden cumaya kadar her gün yalnızca birinin sunum yapacağı biçimde birer sunum yapacaktır. Sunum günlerine ilişkin bilinenler şunlardır:\n- Cem, Derya'dan daha önceki bir günde sunum yapacaktır.\n- Burcu ile Emre ardışık iki günde sunum yapacaktır.\n- Ahmet çarşamba, Derya ise cuma günü sunum yapmayacaktır.\n- Emre, Ahmet'ten daha sonraki bir günde sunum yapacaktır.\n- Burcu pazartesi günü sunum yapmayacaktır.\n\nCem pazartesi günü sunum yapacağına göre aşağıdakilerden hangisi kesinlikle doğrudur?",
    secenekler: [
      "Ahmet salı günü sunum yapacaktır.",
      "Burcu perşembe günü sunum yapacaktır.",
      "Emre cuma günü sunum yapacaktır.",
      "Burcu cuma günü sunum yapacaktır.",
      "Emre perşembe günü sunum yapacaktır.",
    ],
    dogruCevap: 0,
    aciklama:
      "Cem pazartesi ise Derya çarşamba, Burcu ile Emre perşembe-cuma günlerini paylaşır; geriye kalan salı günü Ahmet'indir. Burcu ile Emre'nin hangi gün sunum yapacağı kesin değildir.",
  },
  {
    ders: "TURKCE",
    grupId: "turkce-mantik-sunum",
    soruMetni:
      "Ahmet, Burcu, Cem, Derya ve Emre adlı beş arkadaş, pazartesiden cumaya kadar her gün yalnızca birinin sunum yapacağı biçimde birer sunum yapacaktır. Sunum günlerine ilişkin bilinenler şunlardır:\n- Cem, Derya'dan daha önceki bir günde sunum yapacaktır.\n- Burcu ile Emre ardışık iki günde sunum yapacaktır.\n- Ahmet çarşamba, Derya ise cuma günü sunum yapmayacaktır.\n- Emre, Ahmet'ten daha sonraki bir günde sunum yapacaktır.\n- Burcu pazartesi günü sunum yapmayacaktır.\n\nBuna göre Ahmet ile Emre'nin sunum yapacağı günlerin arasında en fazla kaç gün bulunabilir?",
    secenekler: ["0", "1", "2", "3", "4"],
    dogruCevap: 3,
    aciklama:
      "Ahmet pazartesi, Emre cuma sunum yaparsa (Ahmet-Cem-Derya-Burcu-Emre) aralarında salı, çarşamba ve perşembe olmak üzere 3 gün bulunur; bu, olası en büyük farktır.",
  },

  // ---- MATEMATİK (30) ----
  // Sira: islem (kesir/uslu/koklu/faktoriyel) -> temel kavramlar ->
  // denklem/esitsizlik -> problemler -> kumeler/fonksiyon/moduler ->
  // perm/olasilik -> ortak bilgili gruplar -> geometri (en sonda).
  {
    ders: "MATEMATIK",
    soruMetni: "[(2 + 1/2) - (1 - 1/2)] / [(3/2) ÷ (3/4)] + 1 işleminin sonucu kaçtır?",
    secenekler: ["2", "2,5", "3", "3,5", "4"],
    dogruCevap: 0,
    aciklama: "Birinci köşeli parantez: 2,5-0,5=2. İkinci köşeli parantez: (3/2)÷(3/4)=2. Sonuç: 2/2+1=2.",
  },
  {
    ders: "MATEMATIK",
    soruMetni: "(2⁻² + 1/2) × 4 - 3⁻¹ × 6 işleminin sonucu kaçtır?",
    secenekler: ["0", "1", "2", "3", "4"],
    dogruCevap: 1,
    aciklama: "2⁻²+1/2 = 1/4+1/2 = 3/4; 3/4×4=3. 3⁻¹×6 = 6/3=2. Sonuç: 3-2=1.",
  },
  {
    ders: "MATEMATIK",
    soruMetni: "(10 + √12 + √27) / (2 + √3) işleminin sonucu kaçtır?",
    secenekler: ["1", "2", "3", "4", "5"],
    dogruCevap: 4,
    aciklama: "√12=2√3, √27=3√3 olduğundan pay 10+5√3=5(2+√3) olur; paydaya bölününce sonuç 5'tir.",
  },
  {
    ders: "MATEMATIK",
    soruMetni: "2ˣ⁺¹ + 2ˣ⁺³ = 320 olduğuna göre 3ˣ⁻³ ifadesinin değeri kaçtır?",
    secenekler: ["9", "18", "27", "36", "81"],
    dogruCevap: 0,
    aciklama: "2ˣ⁺¹ + 2ˣ⁺³ = 2ˣ⁺¹(1 + 4) = 5 · 2ˣ⁺¹ = 320 ⇒ 2ˣ⁺¹ = 64 = 2⁶ ⇒ x = 5. Buna göre 3ˣ⁻³ = 3² = 9.",
  },
  {
    ders: "MATEMATIK",
    soruMetni: "(n + 1)! − n! = 25 · (n − 1)! olduğuna göre n! / (n − 2)! ifadesinin değeri kaçtır?",
    secenekler: ["12", "20", "30", "42", "56"],
    dogruCevap: 1,
    aciklama:
      "(n + 1)! − n! = n!(n + 1 − 1) = n · n! = n · n · (n − 1)!. Buna göre n² · (n − 1)! = 25 · (n − 1)! ⇒ n = 5. n!/(n − 2)! = 5!/3! = 5 · 4 = 20.",
  },
  {
    ders: "MATEMATIK",
    soruMetni:
      "A ve B birer rakam olmak üzere dört basamaklı 3A5B sayısı hem 4 hem de 9 ile tam bölünebilmektedir.\n\nBuna göre A'nın alabileceği değerlerin toplamı kaçtır?",
    secenekler: ["4", "6", "8", "10", "12"],
    dogruCevap: 4,
    aciklama:
      "4 ile bölünebilme için 5B iki basamaklısı 4'ün katı olmalı: B = 2 veya B = 6. 9 ile bölünebilme için 3 + A + 5 + B, 9'un katı olmalı. B = 2 ⇒ A + 10 ⇒ A = 8; B = 6 ⇒ A + 14 ⇒ A = 4. A'nın değerleri toplamı 8 + 4 = 12.",
  },
  {
    ders: "MATEMATIK",
    soruMetni:
      "İki basamaklı bir sayının \"ayna sayısı\", o sayının rakamlarının yer değiştirmesiyle elde edilen sayı olarak tanımlanıyor. Örneğin 24 sayısının ayna sayısı 42'dir.\n\nBuna göre, bir sayı ile ayna sayısının toplamı 121 olan iki basamaklı kaç farklı sayı vardır?",
    secenekler: ["6", "7", "8", "9", "10"],
    dogruCevap: 2,
    aciklama:
      "Sayı 10a+b, ayna sayısı 10b+a ise toplamları 11(a+b)=121, yani a+b=11. a,b birer basamak (a≥1) olduğundan (a,b) için 8 farklı çözüm vardır (29, 38, 47, 56, 65, 74, 83, 92).",
  },
  {
    ders: "MATEMATIK",
    soruMetni:
      "Ayrıt uzunlukları 84 cm, 126 cm ve 210 cm olan dikdörtgenler prizması biçimindeki bir kutu, hiç boşluk kalmayacak biçimde birbirinin aynısı olan küplerle doldurulacaktır.\n\nBuna göre bu iş için en az kaç küp gerekir?",
    secenekler: ["24", "30", "36", "42", "60"],
    dogruCevap: 1,
    aciklama:
      "En az küp için küpün ayrıtı en büyük olmalıdır: EBOB(84, 126, 210) = 42. Küp sayısı (84/42) · (126/42) · (210/42) = 2 · 3 · 5 = 30.",
  },
  {
    ders: "MATEMATIK",
    soruMetni: "|2x − 5| < 7 eşitsizliğini sağlayan x tam sayılarının toplamı kaçtır?",
    secenekler: ["10", "12", "14", "15", "21"],
    dogruCevap: 3,
    aciklama: "−7 < 2x − 5 < 7 ⇒ −2 < 2x < 12 ⇒ −1 < x < 6. Tam sayılar 0, 1, 2, 3, 4, 5; toplamları 15.",
  },
  {
    ders: "MATEMATIK",
    soruMetni:
      "x ≠ −3, x ≠ 2 ve x ≠ 3 olmak üzere\n\n[(x² − 9) / (x² + x − 6)] ÷ [(x² − 6x + 9) / (x² − 4x + 4)]\n\nifadesinin en sade biçimi aşağıdakilerden hangisidir?",
    secenekler: ["(x − 2) / (x − 3)", "(x + 3) / (x − 2)", "(x − 3) / (x − 2)", "(x + 2) / (x + 3)", "1"],
    dogruCevap: 0,
    aciklama:
      "(x² − 9)/(x² + x − 6) = (x − 3)(x + 3)/[(x + 3)(x − 2)] = (x − 3)/(x − 2). Bölen (x − 3)²/(x − 2)² olduğundan ifade (x − 3)/(x − 2) · (x − 2)²/(x − 3)² = (x − 2)/(x − 3) olur.",
  },
  {
    ders: "MATEMATIK",
    soruMetni: "a/3 = b/5 = c/7 ve 2a + b − c = 16 olduğuna göre a + b + c toplamı kaçtır?",
    secenekler: ["40", "45", "50", "55", "60"],
    dogruCevap: 4,
    aciklama: "a = 3k, b = 5k, c = 7k ⇒ 6k + 5k − 7k = 4k = 16 ⇒ k = 4. a + b + c = 15k = 60.",
  },
  {
    ders: "MATEMATIK",
    soruMetni: "x + y = 7 ve x · y = 10 olduğuna göre x³ + y³ ifadesinin değeri kaçtır?",
    secenekler: ["103", "113", "123", "133", "143"],
    dogruCevap: 3,
    aciklama: "x³ + y³ = (x + y)³ − 3xy(x + y) = 343 − 3 · 10 · 7 = 343 − 210 = 133.",
  },
  {
    ders: "MATEMATIK",
    soruMetni:
      "Bir kütüphanedeki kitapların başlangıçta %60'ı roman, geri kalanı ise bilimsel içerikli kitaplardan oluşmaktadır. Kütüphaneye bir ay içinde yalnızca bilimsel içerikli 40 kitap daha eklenmiş ve bu eklemeden sonra bilimsel kitapların oranı tüm kitapların %50'sine yükselmiştir.\n\nBuna göre kütüphanedeki başlangıç kitap sayısı kaçtır?",
    secenekler: ["200", "220", "240", "250", "300"],
    dogruCevap: 0,
    aciklama:
      "Başlangıç toplamı T olsun; bilimsel kitap sayısı 0,4T idi. 0,4T+40 = 0,5(T+40) ⟹ 0,4T+40=0,5T+20 ⟹ 20=0,1T ⟹ T=200.",
  },
  {
    ders: "MATEMATIK",
    soruMetni:
      "İki basamaklı AB sayısının 4 katı, yine iki basamaklı BA sayısının 3 katına 14 fazladır. A ve B birbirinden farklı rakamlar olduğuna göre A + B toplamı kaçtır?",
    secenekler: ["10", "12", "14", "16", "18"],
    dogruCevap: 2,
    aciklama:
      "4(10A+B) = 3(10B+A)+14 ⟹ 37A-26B=14 denklemini sağlayan tek basamak çifti A=6, B=8'dir (4×68=272, 3×86+14=272); A+B=14.",
  },
  {
    ders: "MATEMATIK",
    soruMetni:
      "Boş bir havuzu A musluğu tek başına 12 saatte, B musluğu tek başına 18 saatte doldurmaktadır. Havuzun tabanındaki C musluğu ise dolu havuzu tek başına 9 saatte boşaltmaktadır. Boş havuzu doldurmak için A ve B muslukları birlikte açılıyor; 4 saat sonra C musluğu da açılıyor ve üç musluk havuz dolana kadar açık kalıyor.\n\nBuna göre havuz, A ve B muslukları açıldıktan kaç saat sonra tamamen dolar?",
    secenekler: ["14", "16", "18", "20", "24"],
    dogruCevap: 3,
    aciklama:
      "A ve B birlikte saatte 1/12 + 1/18 = 5/36 doldurur; 4 saatte 20/36 dolar, 16/36 kalır. Üçü birlikte saatte 5/36 − 4/36 = 1/36 doldurur; kalan kısım 16 saatte dolar. Toplam 4 + 16 = 20 saat.",
  },
  {
    ders: "MATEMATIK",
    soruMetni:
      "Bir anne ile iki çocuğunun bugünkü yaşları toplamı 60'tır. 4 yıl önce annenin yaşı, çocuklarının o zamanki yaşları toplamının 3 katıydı. Çocuklardan büyüğü küçüğünden 4 yaş büyüktür.\n\nBuna göre büyük çocuk bugün kaç yaşındadır?",
    secenekler: ["11", "12", "13", "14", "15"],
    dogruCevap: 1,
    aciklama:
      "Çocukların yaşları toplamı c, annenin yaşı 60 − c olsun. 4 yıl önce: 56 − c = 3(c − 8) ⇒ 4c = 80 ⇒ c = 20. Çocuklar x ve x + 4 ise 2x + 4 = 20 ⇒ x = 8; büyük çocuk 12 yaşındadır.",
  },
  {
    ders: "MATEMATIK",
    soruMetni:
      "40 kişilik bir sınıfta İngilizce bilen 23, Almanca bilen 15 öğrenci vardır. Bu iki dilden hiçbirini bilmeyen 8 öğrenci olduğuna göre bu dillerden yalnızca birini bilen kaç öğrenci vardır?",
    secenekler: ["20", "22", "24", "26", "32"],
    dogruCevap: 3,
    aciklama:
      "En az bir dil bilen 40 − 8 = 32 öğrencidir. İki dili de bilen 23 + 15 − 32 = 6 öğrencidir. Yalnız birini bilen (23 − 6) + (15 − 6) = 17 + 9 = 26 öğrencidir.",
  },
  {
    ders: "MATEMATIK",
    soruMetni: "f(2x − 1) = 4x + 3 olduğuna göre f(5) + f⁻¹(15) toplamı kaçtır?",
    secenekler: ["20", "22", "24", "25", "30"],
    dogruCevap: 0,
    aciklama: "2x − 1 = t ⇒ x = (t + 1)/2 ⇒ f(t) = 2(t + 1) + 3 = 2t + 5. f(5) = 15; f(a) = 15 ⇒ 2a + 5 = 15 ⇒ f⁻¹(15) = 5. Toplam 20.",
  },
  {
    ders: "MATEMATIK",
    soruMetni:
      "6 ile bölündüğünde 4, 8 ile bölündüğünde 6 kalanını veren iki basamaklı en büyük doğal sayının rakamları toplamı kaçtır?",
    secenekler: ["5", "7", "9", "11", "13"],
    dogruCevap: 4,
    aciklama:
      "Her iki durumda kalan bölenden 2 eksiktir; sayının 2 fazlası hem 6'ya hem 8'e, yani EKOK(6, 8) = 24'e bölünür. Sayı 24k − 2 biçimindedir; iki basamaklı en büyüğü 96 − 2 = 94. Rakamları toplamı 13.",
  },
  {
    ders: "MATEMATIK",
    soruMetni:
      "ANKARA kelimesinin harfleri kullanılarak, A harflerinden hiçbiri yan yana gelmeyecek biçimde altı harfli, anlamlı ya da anlamsız kaç farklı kelime yazılabilir?",
    secenekler: ["12", "18", "24", "36", "120"],
    dogruCevap: 2,
    aciklama:
      "Önce N, K, R harfleri 3! = 6 farklı biçimde dizilir. Bu üç harfin arasında ve iki ucunda oluşan 4 boşluktan 3'üne A harfleri yerleştirilir: C(4, 3) = 4. Toplam 6 · 4 = 24.",
  },
  {
    ders: "MATEMATIK",
    soruMetni:
      "Bir torbada 4 kırmızı ve 3 mavi top vardır. Torbadan geri atılmamak üzere art arda iki top çekiliyor.\n\nÇekilen toplardan birinin kırmızı, diğerinin mavi olma olasılığı kaçtır?",
    secenekler: ["3/7", "4/7", "5/7", "6/7", "1"],
    dogruCevap: 1,
    aciklama: "Önce kırmızı sonra mavi: (4/7)(3/6) = 2/7; önce mavi sonra kırmızı: (3/7)(4/6) = 2/7. Toplam olasılık 4/7.",
  },
  {
    ders: "MATEMATIK",
    grupId: "mat-daire-grafigi",
    soruMetni:
      "Bir okul kütüphanesindeki 360 kitabın türlerine göre dağılımı aşağıdaki daire grafiğinde verilmiştir. (Sorular birbirinden bağımsızdır.)\n\nKütüphaneye yalnızca bilim kitabı alındıktan sonra hazırlanan yeni grafikte bilim kitaplarını gösteren dilimin merkez açısı 90° olduğuna göre kütüphaneye kaç bilim kitabı alınmıştır?",
    gorselSvg: DAIRE_GRAFIGI,
    secenekler: ["20", "25", "30", "36", "40"],
    dogruCevap: 4,
    aciklama:
      "360 kitap 360°'ye karşılık geldiğinden her derece 1 kitaptır; bilim kitabı 60 tanedir. x kitap alınınca (60 + x)/(360 + x) = 90/360 = 1/4 ⇒ 240 + 4x = 360 + x ⇒ x = 40.",
  },
  {
    ders: "MATEMATIK",
    grupId: "mat-daire-grafigi",
    soruMetni:
      "Bir okul kütüphanesindeki 360 kitabın türlerine göre dağılımı aşağıdaki daire grafiğinde verilmiştir. (Sorular birbirinden bağımsızdır.)\n\nBaşlangıçtaki roman kitaplarının yarısı başka bir kütüphaneye bağışlanırsa yeni grafikte tarih kitaplarını gösteren dilimin merkez açısı kaç derece olur?",
    gorselSvg: DAIRE_GRAFIGI,
    secenekler: ["96", "100", "104", "108", "120"],
    dogruCevap: 3,
    aciklama:
      "Roman 120, tarih 90 kitaptır. 60 roman bağışlanınca toplam 300 kitap kalır. Tarih diliminin açısı (90/300) · 360° = 108° olur.",
  },
  {
    ders: "MATEMATIK",
    soruMetni:
      "1'den 15'e kadar olan doğal sayılarla numaralandırılmış 15 top üç ayrı gruba (I, II, III) ayrılmaktadır; her sayı tam olarak bir grupta yer almaktadır. I. gruptaki topların numaraları toplamı 20, II. gruptaki topların numaraları toplamı 40'tır.\n\nBuna göre III. gruptaki topların numaraları toplamı kaçtır?",
    grupId: "mat-top-gruplari",
    secenekler: ["50", "55", "60", "65", "70"],
    dogruCevap: 2,
    aciklama: "1'den 15'e kadar sayıların toplamı 120'dir. III = 120 - (20+40) = 60.",
  },
  {
    ders: "MATEMATIK",
    soruMetni:
      "1'den 15'e kadar olan doğal sayılarla numaralandırılmış 15 top üç ayrı gruba (I, II, III) ayrılmaktadır; her sayı tam olarak bir grupta yer almaktadır. I. gruptaki topların numaraları toplamı 20, II. gruptaki topların numaraları toplamı 40'tır.\n\nBuna göre I. ve III. gruplardaki topların numaraları toplamı kaçtır?",
    grupId: "mat-top-gruplari",
    secenekler: ["70", "75", "80", "85", "90"],
    dogruCevap: 2,
    aciklama: "I + III = 120 - II = 120 - 40 = 80.",
  },
  {
    ders: "MATEMATIK",
    soruMetni:
      "1'den 15'e kadar olan doğal sayılarla numaralandırılmış 15 top üç ayrı gruba (I, II, III) ayrılmaktadır; her sayı tam olarak bir grupta yer almaktadır. I. gruptaki topların numaraları toplamı 20, II. gruptaki topların numaraları toplamı 40'tır.\n\nI. grupta birbirinden farklı numaralı toplar bulunduğuna göre, bu grupta en fazla kaç top olabilir?",
    grupId: "mat-top-gruplari",
    secenekler: ["3", "4", "5", "6", "7"],
    dogruCevap: 2,
    aciklama:
      "Toplam sayıyı en çok parçaya bölmek için en küçük farklı sayılar kullanılmalıdır: 1+2+3+4+5=15, 6 sayı eklenince (1+2+3+4+5+6=21) toplam 20'yi aşar; 5 top ile (ör. 1+2+3+4+10=20) sağlanabilir, bu yüzden en fazla 5 top olabilir.",
  },
  // -- Geometri (4, gorselli, cok adimli) --
  {
    ders: "MATEMATIK",
    geometri: true,
    soruMetni:
      "Şekildeki ABC üçgeninde [DE] ∥ [BC], |AD| = 4 cm ve |DB| = 6 cm'dir.\n\nADE üçgeninin alanı 12 cm² olduğuna göre taralı DBCE dörtgeninin alanı kaç cm²'dir?",
    gorselSvg:
      '<svg viewBox="0 0 330 280" xmlns="http://www.w3.org/2000/svg" font-family="Arial, sans-serif" fill="#1e293b"><polygon points="112,118 40,250 290,250 212,118" fill="#dbeafe"/><polygon points="160,30 40,250 290,250" fill="none" stroke="#1e293b" stroke-width="2.5"/><line x1="112" y1="118" x2="212" y2="118" stroke="#1e293b" stroke-width="2.5"/><text x="154" y="22" font-size="15">A</text><text x="24" y="268" font-size="15">B</text><text x="292" y="268" font-size="15">C</text><text x="94" y="120" font-size="15">D</text><text x="218" y="120" font-size="15">E</text><text x="122" y="76" font-size="13" fill="#dc2626">4</text><text x="62" y="190" font-size="13" fill="#dc2626">6</text></svg>',
    secenekler: ["48", "54", "60", "63", "75"],
    dogruCevap: 3,
    aciklama:
      "DE ∥ BC olduğundan ADE ~ ABC ve benzerlik oranı |AD|/|AB| = 4/10 = 2/5'tir. Alanlar oranı (2/5)² = 4/25 ⇒ Alan(ABC) = 12 · 25/4 = 75. Alan(DBCE) = 75 − 12 = 63 cm².",
  },
  {
    ders: "MATEMATIK",
    geometri: true,
    soruMetni:
      "Şekildeki ABC üçgeninde [AB] ⊥ [AC] ve [AH] ⊥ [BC]'dir. |BH| = 4 cm ve |HC| = 9 cm'dir.\n\nBuna göre ABC üçgeninin alanı kaç cm²'dir?",
    gorselSvg:
      '<svg viewBox="0 0 350 270" xmlns="http://www.w3.org/2000/svg" font-family="Arial, sans-serif" fill="#1e293b"><polygon points="119.2,96.2 30,230 320,230" fill="none" stroke="#1e293b" stroke-width="2.5"/><line x1="119.2" y1="96.2" x2="119.2" y2="230" stroke="#1e293b" stroke-width="2" stroke-dasharray="6 4"/><polyline points="119.2,220 129.2,220 129.2,230" fill="none" stroke="#1e293b" stroke-width="1.5"/><polyline points="112.5,106.2 122.5,112.9 129.2,102.9" fill="none" stroke="#1e293b" stroke-width="1.5"/><text x="113" y="88" font-size="15">A</text><text x="14" y="246" font-size="15">B</text><text x="322" y="246" font-size="15">C</text><text x="113" y="250" font-size="15">H</text><text x="70" y="250" font-size="13" fill="#dc2626">4</text><text x="215" y="250" font-size="13" fill="#dc2626">9</text></svg>',
    secenekler: ["36", "39", "42", "45", "52"],
    dogruCevap: 1,
    aciklama:
      "Dik üçgende hipotenüse ait yükseklik için Öklid bağıntısı: |AH|² = |BH| · |HC| = 4 · 9 = 36 ⇒ |AH| = 6. |BC| = 13 olduğundan Alan(ABC) = 13 · 6 / 2 = 39 cm².",
  },
  {
    ders: "MATEMATIK",
    geometri: true,
    soruMetni:
      "Şekilde P noktasından O merkezli çembere çizilen [PA] teğet; P noktasından geçen doğru ise çemberi B ve C noktalarında kesmektedir. |PA| = 12 cm ve |PB| = 8 cm'dir.\n\nBuna göre |BC| kaç cm'dir?",
    gorselSvg:
      '<svg viewBox="0 0 360 270" xmlns="http://www.w3.org/2000/svg" font-family="Arial, sans-serif" fill="#1e293b"><circle cx="140" cy="150" r="70" fill="#eff6ff" stroke="#1e293b" stroke-width="2.5"/><circle cx="140" cy="150" r="3" fill="#1e293b"/><text x="132" y="146" font-size="14">O</text><line x1="330" y1="150" x2="165.8" y2="84.9" stroke="#1e293b" stroke-width="2"/><line x1="330" y1="150" x2="87.4" y2="196.2" stroke="#1e293b" stroke-width="2"/><circle cx="165.8" cy="84.9" r="3.5" fill="#dc2626"/><circle cx="205.9" cy="173.6" r="3.5" fill="#dc2626"/><circle cx="87.4" cy="196.2" r="3.5" fill="#dc2626"/><circle cx="330" cy="150" r="3.5" fill="#1e293b"/><text x="160" y="76" font-size="15">A</text><text x="204" y="194" font-size="15">B</text><text x="72" y="214" font-size="15">C</text><text x="336" y="155" font-size="15">P</text></svg>',
    secenekler: ["10", "12", "14", "16", "18"],
    dogruCevap: 0,
    aciklama: "Bir noktanın çembere göre kuvveti: |PA|² = |PB| · |PC| ⇒ 144 = 8 · |PC| ⇒ |PC| = 18. |BC| = |PC| − |PB| = 18 − 8 = 10 cm.",
  },
  {
    ders: "MATEMATIK",
    geometri: true,
    soruMetni:
      "Dik koordinat düzleminde 2x − y = 0 ve x + y = 9 doğruları ile x ekseninin sınırladığı üçgensel bölgenin alanı kaç birimkaredir?",
    secenekler: ["15", "18", "21", "24", "27"],
    dogruCevap: 4,
    aciklama:
      "2x − y = 0 doğrusu x eksenini (0, 0)'da, x + y = 9 doğrusu (9, 0)'da keser. İki doğrunun kesişimi: y = 2x ve x + 2x = 9 ⇒ (3, 6). Taban 9, yükseklik 6 ⇒ Alan = 9 · 6 / 2 = 27 birimkare.",
  },

  // ---- TARİH (27) ----
  // Resmi konu sirasi: Islamiyet oncesi -> Turk-Islam -> Osmanli siyasi/kultur
  // -> XX. yy basi -> Milli Mucadele -> inkilaplar -> Ataturk donemi -> cagdas.
  {
    ders: "TARIH",
    soruMetni:
      "İslamiyet öncesi Türk devletlerinde hükümdarlık yetkisinin (kut) Tanrı tarafından hükümdar ailesine verildiğine inanılırdı. Bu anlayışa göre ülke, hanedan üyelerinin ortak malı sayılır; tahta geçişte belirli bir veraset kuralı bulunmaz ve hanedanın her erkek üyesi hükümdar olmayı kendi hakkı olarak görürdü.\n\nBu anlayışın İslamiyet öncesi Türk devletleri üzerindeki etkisi aşağıdakilerden hangisidir?",
    secenekler: [
      "Merkezî otoritenin uzun süre güçlü kalmasını sağlamıştır.",
      "Hükümdarın yetkilerinin kurultay tarafından sınırlandırılmasına neden olmuştur.",
      "Devlet yönetiminde dinî liderlerin söz sahibi olmasını sağlamıştır.",
      "Çin'in Türk devletleri üzerindeki etkisini tamamen ortadan kaldırmıştır.",
      "Taht kavgalarına ve devletlerin kısa sürede parçalanmasına zemin hazırlamıştır.",
    ],
    dogruCevap: 4,
    aciklama:
      "Ülkenin hanedanın ortak malı sayılması ve belirli bir veraset kuralının olmaması, hükümdarın ölümünden sonra taht kavgalarına yol açmış; bu durum İslamiyet öncesi Türk devletlerinin kısa sürede bölünüp yıkılmasının başlıca nedenlerinden biri olmuştur.",
  },
  {
    ders: "TARIH",
    soruMetni:
      "Uygurlarla ilgili;\n\nI. Mani dinini benimsemelerinin etkisiyle yerleşik hayata geçmişlerdir.\nII. Kendilerine özgü bir alfabe kullanarak yazılı eserler vermişlerdir.\nIII. \"Türk\" adını ilk kez resmî devlet adı olarak kullanmışlardır.\n\nbilgilerinden hangileri doğrudur?",
    secenekler: ["Yalnız I", "Yalnız II", "I ve II", "II ve III", "I, II ve III"],
    dogruCevap: 2,
    aciklama:
      "Uygurlar Maniheizm'in etkisiyle yerleşik hayata geçmiş ve Uygur alfabesini kullanarak yazılı eserler vermişlerdir. \"Türk\" adını ilk kez resmî devlet adı olarak kullananlar ise Göktürklerdir; bu nedenle III yanlıştır.",
  },
  {
    ders: "TARIH",
    soruMetni:
      "Karahanlılar döneminde yazılan; Türkçenin Arapça kadar zengin bir dil olduğunu kanıtlamak ve Araplara Türkçeyi öğretmek amacıyla hazırlanan, Türk boylarının yaşadığı yerleri gösteren bir dünya haritasını da içeren eser aşağıdakilerden hangisidir?",
    secenekler: ["Kutadgu Bilig", "Atabetü'l-Hakayık", "Divan-ı Hikmet", "Divan-ı Lügati't-Türk", "Muhakemetü'l-Lügateyn"],
    dogruCevap: 3,
    aciklama:
      "Kaşgarlı Mahmud'un Divan-ı Lügati't-Türk'ü, Araplara Türkçeyi öğretmek amacıyla yazılmış bir sözlüktür ve Türk boylarının yerleşim yerlerini gösteren bir dünya haritası içerir. Kutadgu Bilig siyasetname, Divan-ı Hikmet tasavvufi şiir kitabı, Muhakemetü'l-Lügateyn ise Timurlu döneminde Ali Şir Nevai'nin eseridir.",
  },
  {
    ders: "TARIH",
    soruMetni:
      "Büyük Selçukluların Gaznelilere karşı kazandığı; Horasan'daki egemenliklerini kesinleştirerek devletin resmen kurulmasını sağlayan savaş aşağıdakilerden hangisidir?",
    secenekler: ["Dandanakan Savaşı", "Pasinler Savaşı", "Malazgirt Savaşı", "Katvan Savaşı", "Miryokefalon Savaşı"],
    dogruCevap: 0,
    aciklama:
      "1040 Dandanakan Savaşı'nda Gazneliler yenilmiş ve Büyük Selçuklu Devleti resmen kurulmuştur. Pasinler (1048) Bizans'a karşı kazanılan ilk büyük zafer, Malazgirt (1071) Anadolu'nun kapılarını açan savaş, Katvan (1141) Karahıtaylara karşı alınan yenilgi, Miryokefalon (1176) ise Türkiye Selçuklularının Bizans'a karşı kazandığı savaştır.",
  },
  {
    ders: "TARIH",
    soruMetni:
      "1243 yılında Moğollara karşı kaybedilen; Türkiye Selçuklu Devleti'nin Moğol (İlhanlı) egemenliğine girmesine, Anadolu'daki siyasi birliğin bozularak beyliklerin güçlenmesine yol açan savaş aşağıdakilerden hangisidir?",
    secenekler: ["Miryokefalon Savaşı", "Yassıçemen Savaşı", "Malazgirt Savaşı", "Ankara Savaşı", "Kösedağ Savaşı"],
    dogruCevap: 4,
    aciklama:
      "Kösedağ Savaşı (1243) sonrasında Türkiye Selçuklu Devleti Moğolların denetimine girmiş, merkezî otorite zayıflamış ve Anadolu'da beyliklerin güçlenmesinin zemini hazırlanmıştır. Yassıçemen (1230) Harezmşahlara karşı kazanılmış, Ankara Savaşı (1402) ise Osmanlı ile Timur arasında yapılmıştır.",
  },
  {
    ders: "TARIH",
    soruMetni:
      "Osmanlı Beyliği'nin kısa sürede büyüyerek bir devlete dönüşmesinde;\n\nI. Bizans İmparatorluğu'nun iç karışıklıklar nedeniyle zayıflamış olması,\nII. Anadolu'daki Türk beylikleriyle uzun süre mücadele etmek yerine fetihleri Bizans ve Balkanlar yönünde sürdürmesi,\nIII. Ahiler, dervişler ve ilim adamlarından destek görmesi\n\ndurumlarından hangileri etkili olmuştur?",
    secenekler: ["Yalnız I", "Yalnız II", "I ve III", "II ve III", "I, II ve III"],
    dogruCevap: 4,
    aciklama:
      "Bizans'ın zayıflığı, fetihlerin Rumeli'ye yöneltilmesi ve Ahi, derviş ve âlimlerin desteği, Osmanlı'nın kısa sürede büyümesinin başlıca nedenleri arasındadır.",
  },
  {
    ders: "TARIH",
    soruMetni:
      "Döneminde Mohaç Meydan Muharebesi kazanılarak Macaristan'ın büyük bölümü Osmanlı egemenliğine girmiş, Barbaros Hayreddin Paşa komutasındaki donanma Preveze'de Haçlı donanmasını yenmiş ve Akdeniz'de Osmanlı üstünlüğü sağlanmıştır.\n\nBu bilgiler aşağıdaki padişahlardan hangisinin dönemine aittir?",
    secenekler: ["Fatih Sultan Mehmet", "Kanuni Sultan Süleyman", "Yavuz Sultan Selim", "II. Bayezid", "II. Selim"],
    dogruCevap: 1,
    aciklama:
      "Mohaç (1526) ve Preveze (1538) zaferleri Kanuni Sultan Süleyman dönemindedir. Yavuz döneminde Çaldıran ve Mısır seferi, II. Selim döneminde ise Kıbrıs'ın fethi ve İnebahtı yenilgisi yaşanmıştır.",
  },
  {
    ders: "TARIH",
    soruMetni:
      "Osmanlı Devleti'nde, belirli bir bölgenin vergilerini toplama hakkının açık artırma yoluyla ve peşin para karşılığında, genellikle bir ile üç yıl gibi kısa süreler için kişilere verilmesi uygulaması aşağıdakilerden hangisidir?",
    secenekler: ["Tımar", "İltizam", "Müsadere", "Malikâne", "Esham"],
    dogruCevap: 1,
    aciklama:
      "İltizam, vergi toplama hakkının kısa süreli olarak ve peşin para karşılığında mültezimlere verilmesidir. Malikâne bu hakkın ömür boyu verilmesi, esham vergi gelirine dayalı iç borçlanma senedi, müsadere devlet görevlilerinin mallarına el konulması, tımar ise hizmet karşılığı verilen dirliktir.",
  },
  {
    ders: "TARIH",
    soruMetni:
      "Osmanlı Devleti'nde Divan-ı Hümayun'da görev alan devlet adamları ile sorumlu oldukları alanlar eşleştirilmiştir.\n\nBu eşleştirmelerden hangisi yanlıştır?",
    secenekler: [
      "Sadrazam – Padişahın mutlak vekili olarak devlet işlerini yürütme",
      "Kazasker – Adalet ve eğitim işleri, kadı ve müderrislerin atanması",
      "Defterdar – Mali işler ve devlet bütçesi",
      "Nişancı – Fermanlara tuğra çekme ve toprak kayıtlarını tutma",
      "Kaptan-ı Derya – Yabancı devletlerle yazışmalar ve elçilik işleri",
    ],
    dogruCevap: 4,
    aciklama:
      "Kaptan-ı Derya donanmanın komutanıdır. Yabancı devletlerle yazışmalardan Reisülküttap sorumludur; bu görev zamanla Hariciye Nazırlığına dönüşmüştür.",
  },
  {
    ders: "TARIH",
    soruMetni:
      "Osmanlı Devleti'nde esnaf ve zanaatkârlar loncalar hâlinde örgütlenmişti. Loncalar; malın kalitesini ve satış fiyatını denetler, hammaddenin üyeler arasında adil dağıtılmasını sağlar, üretimin ihtiyaç kadar yapılmasını gözetirdi. Çıraklıktan kalfalığa, kalfalıktan ustalığa belirli bir eğitim ve sınav sürecinden geçmeyen kimse dükkân açamazdı.\n\nBu bilgilere göre lonca teşkilatıyla ilgili aşağıdakilerden hangisi söylenemez?",
    secenekler: [
      "Serbest rekabete dayalı bir üretim anlayışını desteklediği",
      "Tüketicinin korunmasına önem verildiği",
      "Mesleki eğitimin belirli bir düzen içinde verildiği",
      "Üretimde kalite standardının gözetildiği",
      "Üretim miktarının ihtiyaca göre düzenlendiği",
    ],
    dogruCevap: 0,
    aciklama:
      "Fiyat, kalite ve üretim miktarının denetlenmesi serbest rekabeti değil, denetimli ve dengeli bir üretim düzenini yansıtır. Diğer seçenekler parçadaki bilgilerle doğrulanır.",
  },
  {
    ders: "TARIH",
    soruMetni:
      "XVII. yüzyılda saltanat süren; içki ve tütünü yasaklayarak sert önlemlerle devlet otoritesini yeniden kurmaya çalışan, Bağdat'ı Safevilerden geri alan ve imzalanan Kasr-ı Şirin Antlaşması ile bugünkü Türkiye-İran sınırının temelinin atılmasını sağlayan padişah aşağıdakilerden hangisidir?",
    secenekler: ["II. Osman", "I. Ahmed", "IV. Murad", "IV. Mehmed", "III. Ahmed"],
    dogruCevap: 2,
    aciklama:
      "IV. Murad, Bağdat Seferi (1638) ve Kasr-ı Şirin Antlaşması (1639) ile tanınır; bu antlaşmayla çizilen sınır bugünkü Türkiye-İran sınırının temelini oluşturur. II. Osman Yeniçeri Ocağını kaldırmak isterken öldürülmüş, III. Ahmed dönemi ise Lale Devri olarak bilinir.",
  },
  {
    ders: "TARIH",
    soruMetni:
      "Lale Devri'nde;\n\nI. İbrahim Müteferrika ile Said Mehmed Efendi tarafından ilk Türk matbaasının kurulması,\nII. İstanbul'da yangınlarla mücadele için Tulumbacı Ocağı'nın oluşturulması,\nIII. Avrupa başkentlerinde ilk kez sürekli (daimî) elçiliklerin açılması\n\ngelişmelerinden hangileri gerçekleşmiştir?",
    secenekler: ["Yalnız I", "Yalnız II", "Yalnız III", "I ve II", "II ve III"],
    dogruCevap: 3,
    aciklama:
      "Matbaa (1727) ve Tulumbacı Ocağı Lale Devri'nin yeniliklerindendir; bu dönemde Avrupa'ya yalnızca geçici elçiler gönderilmiştir. Daimî elçilikler ilk kez III. Selim döneminde açılmıştır.",
  },
  {
    ders: "TARIH",
    soruMetni:
      "Osmanlı Devleti'nde ilk anayasa olan Kanun-i Esasi'nin ilan edildiği; Ayan ve Mebusan meclislerinden oluşan Meclis-i Umumi'nin açılarak halkın yönetime ilk kez seçilmiş temsilcileri aracılığıyla katıldığı gelişme aşağıdakilerden hangisidir?",
    secenekler: [
      "Sened-i İttifak'ın imzalanması",
      "Tanzimat Fermanı'nın ilanı",
      "Islahat Fermanı'nın ilanı",
      "I. Meşrutiyet'in ilanı",
      "II. Meşrutiyet'in ilanı",
    ],
    dogruCevap: 3,
    aciklama:
      "Kanun-i Esasi 1876'da ilan edilmiş ve Meclis-i Umumi açılmıştır; bu süreç I. Meşrutiyet olarak adlandırılır. Sened-i İttifak padişahla ayanlar arasındaki bir sözleşme, Tanzimat ve Islahat fermanları ise anayasa niteliği taşımayan reform belgeleridir; II. Meşrutiyet'te (1908) anayasa yeniden yürürlüğe konmuştur.",
  },
  {
    ders: "TARIH",
    soruMetni:
      "Mısır Valisi Kavalalı Mehmet Ali Paşa'nın isyanı sırasında Osmanlı Devleti'nin Rusya'dan yardım almasının ardından imzalanan; Rusya bir saldırıya uğradığında Osmanlı Devleti'nin Boğazları Rus savaş gemileri dışındaki yabancı savaş gemilerine kapatmasını öngören antlaşma aşağıdakilerden hangisidir?",
    secenekler: [
      "Kütahya Antlaşması",
      "Hünkâr İskelesi Antlaşması",
      "Balta Limanı Ticaret Antlaşması",
      "Londra Boğazlar Sözleşmesi",
      "Edirne Antlaşması",
    ],
    dogruCevap: 1,
    aciklama:
      "1833 Hünkâr İskelesi Antlaşması ile Rusya Boğazlar üzerinde ayrıcalıklı bir konum elde etmiştir. Kütahya (1833) Mehmet Ali Paşa ile yapılan anlaşma, Balta Limanı (1838) İngiltere ile ticaret antlaşması, Londra Boğazlar Sözleşmesi (1841) ise Boğazları uluslararası denetime açan sözleşmedir.",
  },
  {
    ders: "TARIH",
    soruMetni:
      "Osmanlı Devleti'nin İtalya ile yaptığı ve Balkan Savaşları'nın başlaması üzerine sona erdirmek zorunda kaldığı Trablusgarp Savaşı'nın ardından imzalanan; Osmanlı Devleti'nin Kuzey Afrika'daki son toprağını kaybetmesiyle sonuçlanan antlaşma aşağıdakilerden hangisidir?",
    secenekler: ["Uşi Antlaşması", "Londra Antlaşması", "Bükreş Antlaşması", "Atina Antlaşması", "İstanbul Antlaşması"],
    dogruCevap: 0,
    aciklama:
      "1912 Uşi (Ouchy) Antlaşması ile Trablusgarp ve Bingazi İtalya'ya bırakılmıştır. Londra (1913) I. Balkan Savaşı'nı, Bükreş (1913) II. Balkan Savaşı'nı sona erdirmiş; Atina ve İstanbul antlaşmaları ise Balkan Savaşları'ndan sonra Yunanistan ve Bulgaristan ile imzalanmıştır.",
  },
  {
    ders: "TARIH",
    soruMetni:
      "I. Dünya Savaşı'nda Çanakkale Cephesi'nde kazanılan başarının sonuçları arasında;\n\nI. İtilaf Devletleri'nin Rusya'ya yardım ulaştıramaması nedeniyle Rusya'da Bolşevik İhtilali'nin kolaylaşması,\nII. I. Dünya Savaşı'nın uzaması,\nIII. Bulgaristan'ın İtilaf Devletleri'nin yanında savaşa katılması\n\ndurumlarından hangileri yer alır?",
    secenekler: ["Yalnız I", "Yalnız II", "I ve II", "I ve III", "II ve III"],
    dogruCevap: 2,
    aciklama:
      "Çanakkale başarısıyla Boğazlar kapalı kalmış, Rusya'ya yardım ulaştırılamamış ve bu durum Bolşevik İhtilali'ni kolaylaştırmış; savaş da uzamıştır. Bulgaristan ise bu başarının da etkisiyle İttifak Devletleri'nin yanında savaşa girmiştir.",
  },
  {
    ders: "TARIH",
    soruMetni:
      "Mondros Ateşkes Antlaşması'nın aşağıdaki hükümlerinden hangisi, İtilaf Devletleri'ne Anadolu'nun herhangi bir yerini işgal etme olanağı vermiştir?",
    secenekler: [
      "Boğazların açılması ve Çanakkale ile İstanbul istihkâmlarının İtilaf Devletleri'nce işgal edilmesi",
      "Osmanlı ordusunun terhis edilmesi",
      "Toros tünellerinin İtilaf Devletleri'nce işgal edilmesi",
      "İtilaf Devletleri'nin güvenliklerini tehdit eden bir durum çıkması hâlinde herhangi bir stratejik noktayı işgal edebilmesi",
      "Doğu Anadolu'daki altı ilde karışıklık çıkması hâlinde bu illerin işgal edilebilmesi",
    ],
    dogruCevap: 3,
    aciklama:
      "Mondros'un 7. maddesi, güvenliklerini tehdit eden bir durum çıkması hâlinde İtilaf Devletleri'ne herhangi bir stratejik noktayı işgal hakkı tanıyarak Anadolu'nun tamamını işgale açık hâle getirmiştir. 24. madde ise yalnızca altı doğu ilini (Vilayet-i Sitte) kapsar.",
  },
  {
    ders: "TARIH",
    soruMetni:
      "Erzurum Kongresi'nde alınan kararlar arasında;\n\nI. Millî sınırlar içinde vatan bir bütündür, parçalanamaz.\nII. Manda ve himaye kabul olunamaz.\nIII. Bütün millî cemiyetler Anadolu ve Rumeli Müdafaa-i Hukuk Cemiyeti adı altında birleştirilmiştir.\n\nifadelerinden hangileri yer alır?",
    secenekler: ["Yalnız I", "Yalnız III", "I ve II", "I ve III", "II ve III"],
    dogruCevap: 2,
    aciklama:
      "\"Millî sınırlar içinde vatan bir bütündür\" ve \"Manda ve himaye kabul olunamaz\" kararları Erzurum Kongresi'nde alınmıştır. Bütün cemiyetlerin tek çatı altında birleştirilmesi ise Sivas Kongresi kararıdır.",
  },
  {
    ders: "TARIH",
    soruMetni:
      "Amasya Genelgesi'nde yer alan \"Milletin istiklalini yine milletin azim ve kararı kurtaracaktır.\" ifadesiyle aşağıdakilerden hangisi vurgulanmıştır?",
    secenekler: [
      "Kurtuluşun ancak millî irade ve kararlılıkla gerçekleşebileceği",
      "Manda yönetiminin kabul edilmesi gerektiği",
      "Saltanat ve halifeliğin kaldırılacağı",
      "İstanbul Hükümeti'nin millî mücadeleye öncülük edeceği",
      "Düzenli ordunun kurulduğu",
    ],
    dogruCevap: 0,
    aciklama:
      "Bu ifade, kurtuluşun dış yardımla ya da İstanbul Hükümeti eliyle değil, millî irade ile gerçekleşeceğini vurgular ve millî egemenlik anlayışının ilk işaretlerinden biridir.",
  },
  {
    ders: "TARIH",
    soruMetni:
      "Sakarya Meydan Muharebesi'nden sonra imzalanan; Güney Cephesi'nde savaşın sona ermesini sağlayan ve TBMM'nin bir İtilaf devletiyle imzaladığı ilk antlaşma olma özelliği taşıyan antlaşma aşağıdakilerden hangisidir?",
    secenekler: [
      "Gümrü Antlaşması",
      "Moskova Antlaşması",
      "Kars Antlaşması",
      "Ankara Antlaşması",
      "Mudanya Ateşkes Antlaşması",
    ],
    dogruCevap: 3,
    aciklama:
      "1921 Ankara Antlaşması ile Fransa TBMM'yi tanımış ve Güney Cephesi kapanmıştır; bu, TBMM'nin bir İtilaf devletiyle yaptığı ilk antlaşmadır. Gümrü (1920) Ermenistan ile, Moskova (1921) Sovyet Rusya ile, Kars (1921) Kafkas cumhuriyetleriyle imzalanmıştır; Mudanya ise Büyük Taarruz sonrasındaki ateşkestir.",
  },
  {
    ders: "TARIH",
    soruMetni:
      "Sakarya Meydan Muharebesi'nin kazanılmasının ardından TBMM tarafından Mustafa Kemal Paşa'ya verilen rütbe ve unvan aşağıdakilerden hangisidir?",
    secenekler: [
      "Başkomutanlık yetkisi",
      "Mareşal rütbesi ve Gazi unvanı",
      "Ferik rütbesi ve Paşa unvanı",
      "TBMM Başkanlığı",
      "Cumhurbaşkanlığı",
    ],
    dogruCevap: 1,
    aciklama:
      "Sakarya zaferinden sonra (19 Eylül 1921) TBMM, Mustafa Kemal'e Mareşal rütbesi ve Gazi unvanı vermiştir. Başkomutanlık yetkisi ise muharebeden önce, Başkomutanlık Kanunu ile verilmiştir.",
  },
  {
    ders: "TARIH",
    soruMetni:
      "Lozan Barış Antlaşması'nda;\n\nI. kapitülasyonların tamamen kaldırılması,\nII. Osmanlı Devleti'nin borçlarının Osmanlı'dan ayrılan devletler arasında paylaştırılması,\nIII. Musul meselesinin Türkiye ile İngiltere arasında yapılacak ikili görüşmelere bırakılması\n\nkonularından hangileri karara bağlanmıştır?",
    secenekler: ["Yalnız I", "Yalnız II", "I ve II", "II ve III", "I, II ve III"],
    dogruCevap: 4,
    aciklama:
      "Lozan'da kapitülasyonlar kaldırılmış, Osmanlı borçları ayrılan devletler arasında paylaştırılmış ve Musul sorunu Türkiye ile İngiltere arasında çözülmek üzere ikili görüşmelere bırakılmıştır.",
  },
  {
    ders: "TARIH",
    soruMetni:
      "I. Yeni Türk harflerinin kabul edilmesi\nII. Tevhid-i Tedrisat Kanunu'nun kabul edilmesi\nIII. Soyadı Kanunu'nun kabul edilmesi\n\nYukarıdaki inkılapların kronolojik sıralaması aşağıdakilerden hangisinde doğru verilmiştir?",
    secenekler: ["I, II, III", "I, III, II", "II, I, III", "II, III, I", "III, II, I"],
    dogruCevap: 2,
    aciklama:
      "Tevhid-i Tedrisat Kanunu 1924'te, yeni Türk harfleri 1928'de, Soyadı Kanunu ise 1934'te kabul edilmiştir.",
  },
  {
    ders: "TARIH",
    soruMetni: "Aşağıdaki gelişmelerden hangisi doğrudan laiklik ilkesiyle ilişkilendirilemez?",
    secenekler: [
      "Aşar vergisinin kaldırılması",
      "Halifeliğin kaldırılması",
      "Tevhid-i Tedrisat Kanunu'nun kabulü",
      "Türk Medeni Kanunu'nun kabulü",
      "Şer'iye ve Evkaf Vekâleti'nin kaldırılması",
    ],
    dogruCevap: 0,
    aciklama:
      "Aşar vergisinin 1925'te kaldırılması köylünün ekonomik yükünü hafifletmeye yönelik olup halkçılık ilkesiyle ilgilidir. Halifeliğin ve Şer'iye Vekâleti'nin kaldırılması, eğitimin birleştirilmesi ve Medeni Kanun ise devlet ve toplum yaşamının laikleşmesini sağlamıştır.",
  },
  {
    ders: "TARIH",
    soruMetni:
      "Mustafa Kemal'in isteğiyle, çok partili hayata geçiş denemesi olarak 1930'da Ali Fethi (Okyar) Bey tarafından kurulan; kısa sürede halktan büyük ilgi görmesine rağmen yaklaşık üç ay sonra kendini feshederek siyasi hayattan çekilen parti aşağıdakilerden hangisidir?",
    secenekler: [
      "Terakkiperver Cumhuriyet Fırkası",
      "Serbest Cumhuriyet Fırkası",
      "Demokrat Parti",
      "Millî Kalkınma Partisi",
      "Halk Fırkası",
    ],
    dogruCevap: 1,
    aciklama:
      "Serbest Cumhuriyet Fırkası 1930'da Ali Fethi Bey tarafından kurulmuş ve aynı yıl kendini feshetmiştir. Terakkiperver Cumhuriyet Fırkası 1924'te Kâzım Karabekir ve arkadaşlarınca kurulmuş, 1925'te kapatılmıştır; Millî Kalkınma Partisi (1945) ve Demokrat Parti (1946) Atatürk sonrası döneme aittir.",
  },
  {
    ders: "TARIH",
    soruMetni:
      "Atatürk'ün \"şahsi meselem\" olarak nitelendirdiği; Ankara Antlaşması (1921) ile Fransız mandası altındaki Suriye sınırları içinde kalan, 1938'de bağımsız bir devlet olduktan sonra 1939'da kendi meclisinin kararıyla Türkiye'ye katılan yer aşağıdakilerden hangisidir?",
    secenekler: ["Musul", "Kerkük", "Batum", "Hatay", "Kars"],
    dogruCevap: 3,
    aciklama:
      "Hatay, 1921 Ankara Antlaşması ile özel bir yönetimle Suriye'ye bırakılmış; 1938'de bağımsız Hatay Devleti kurulmuş ve 1939'da Hatay Meclisi'nin kararıyla Türkiye'ye katılmıştır. Musul ve Kerkük Irak'ta kalmış, Batum Moskova Antlaşması ile Gürcistan'a bırakılmış, Kars ise 1921'de Türkiye sınırlarına dâhil edilmiştir.",
  },
  {
    ders: "TARIH",
    soruMetni:
      "İkinci Dünya Savaşı'ndan sonra Sovyetler Birliği'nin Boğazlar ve Doğu Anadolu üzerindeki taleplerine karşı Batı bloğuna yakınlaşan Türkiye;\n\nI. Truman Doktrini kapsamında ABD'nin askerî ve ekonomik yardımından yararlanma,\nII. Marshall Planı'na dâhil olma,\nIII. Varşova Paktı'na üye olma\n\ngelişmelerinden hangilerini yaşamıştır?",
    secenekler: ["Yalnız I", "Yalnız II", "I ve II", "I ve III", "II ve III"],
    dogruCevap: 2,
    aciklama:
      "Türkiye, SSCB tehdidine karşı Truman Doktrini (1947) ve Marshall Planı (1948) yardımlarından yararlanmış, 1952'de NATO'ya katılmıştır. Varşova Paktı ise SSCB önderliğindeki Doğu bloğunun askerî örgütüdür.",
  },

  // ---- COĞRAFYA (18) ----
  // Sira: konum -> yer sekilleri -> iklim -> bitki/su -> nufus/yerlesme ->
  // ekonomi (tarim, hayvancilik, maden, enerji, turizm). Haritalar gercek
  // sinir verisiyle, iklim grafigi MGM verisiyle cizilir.
  {
    ders: "COGRAFYA",
    soruMetni: "Türkiye'ye ait aşağıdaki özelliklerden hangisi matematik (mutlak) konumunun doğrudan bir sonucudur?",
    secenekler: [
      "Güneye bakan yamaçların, kuzeye bakan yamaçlara göre daha sıcak olması",
      "Kıyıdan iç kesimlere doğru gidildikçe karasallığın artması",
      "Doğudan batıya doğru gidildikçe ortalama yükseltinin azalması",
      "Üç tarafının denizlerle çevrili olması",
      "Asya ile Avrupa arasında köprü konumunda bulunması",
    ],
    dogruCevap: 0,
    aciklama:
      "Türkiye Kuzey Yarım Küre'nin orta kuşağında yer aldığından güneş ışınları güneyden gelir; bu nedenle güneye bakan yamaçlar daha sıcaktır (bakı etkisi). Bu, matematik konumun sonucudur. Diğer seçenekler özel (göreceli) konumla ilgilidir.",
  },
  {
    ders: "COGRAFYA",
    soruMetni:
      "Türkiye'nin en doğu ucu ile en batı ucu arasında yaklaşık 19 boylam (meridyen) farkı bulunmaktadır.\n\nBu durumun sonuçları arasında aşağıdakilerden hangisi yer almaz?",
    secenekler: [
      "Doğu ve batı uçları arasında yaklaşık 76 dakikalık yerel saat farkı olması",
      "Güneşin Iğdır'da Edirne'den daha önce doğması",
      "Ülke genelinde ortak bir ulusal saat uygulamasına ihtiyaç duyulması",
      "Kuzey ve güney kıyıları arasında gündüz sürelerinin farklı olması",
      "Güneşin batıdaki illerde, doğudaki illere göre daha geç batması",
    ],
    dogruCevap: 3,
    aciklama:
      "Her 1° boylam farkı 4 dakikalık yerel saat farkı oluşturur (19 × 4 ≈ 76 dk); bu nedenle Güneş doğuda daha erken doğar, batıda daha geç batar ve ortak saat kullanımı gerekir. Kuzey ile güney arasında gündüz sürelerinin farklı olması ise enlem farkının sonucudur.",
  },
  {
    ders: "COGRAFYA",
    soruMetni:
      "Ege Bölgesi'nde dağlar kıyıya dik uzanır; dağların arasında yer alan çöküntü ovaları (grabenler) denizden iç kesimlere doğru sokulur.\n\nBu durumun bir sonucu olarak Ege Bölgesi'nde aşağıdakilerden hangisinin görülmesi beklenmez?",
    secenekler: [
      "Deniz etkisinin iç kesimlere kadar sokulması",
      "Kıyı ile iç kesimler arasında iklim özelliklerinin belirgin biçimde farklılaşması",
      "Kıyıdan iç kesimlere ulaşımın kolay olması",
      "Kıyı çizgisinin girintili çıkıntılı olması",
      "Kıyıda çok sayıda körfez ve yarımada bulunması",
    ],
    dogruCevap: 1,
    aciklama:
      "Enine kıyılarda deniz etkisi vadiler boyunca iç kesimlere sokulduğundan kıyı ile iç kesimler arasındaki iklim farkı, dağların kıyıya paralel uzandığı Karadeniz ve Akdeniz'e göre azdır. Diğer seçenekler enine kıyı tipinin sonuçlarıdır.",
  },
  {
    ders: "COGRAFYA",
    soruMetni: "Haritada numaralandırılarak gösterilen dağlardan hangisi volkanik kökenli değildir?",
    gorselSvg: turkiyeHaritasi({
      noktalar: [
        { etiket: "I", boylam: 34.17, enlem: 38.13 }, // Hasan Dagi
        { etiket: "II", boylam: 29.22, enlem: 40.07 }, // Uludag
        { etiket: "III", boylam: 35.45, enlem: 38.53 }, // Erciyes
        { etiket: "IV", boylam: 42.23, enlem: 38.65 }, // Nemrut (Bitlis)
        { etiket: "V", boylam: 44.3, enlem: 39.7 }, // Agri Dagi
      ],
    }),
    secenekler: ["I", "II", "III", "IV", "V"],
    dogruCevap: 1,
    aciklama:
      "I Hasan Dağı, III Erciyes, IV Nemrut ve V Ağrı Dağı volkanik kökenlidir. II numaralı Bursa'daki Uludağ ise volkanik değil, kırılma hareketleriyle yükselmiş granit çekirdekli bir kütle dağıdır.",
  },
  {
    ders: "COGRAFYA",
    soruMetni:
      "Kalker, jips ve kaya tuzu gibi kolay eriyebilen kayaçların yaygın olduğu alanlarda, suyun kimyasal çözme (eritme) etkisiyle karstik şekiller oluşur.\n\nAşağıdakilerden hangisi bu şekillerden biri değildir?",
    secenekler: ["Polye", "Lapya", "Dolin", "Traverten", "Peribacası"],
    dogruCevap: 4,
    aciklama:
      "Polye, lapya ve dolin karstik aşınım; traverten (ör. Pamukkale) ise karstik birikim şeklidir. Peribacaları, volkanik tüflerin akarsu ve sel sularıyla aşındırılmasıyla oluşur ve karstik değildir.",
  },
  {
    ders: "COGRAFYA",
    soruMetni:
      "Türkiye'nin en aktif fay hatlarından biri olan Kuzey Anadolu Fay Hattı, Marmara Denizi'nden Doğu Anadolu'ya kadar uzanır ve bu hat üzerinde tarih boyunca çok sayıda yıkıcı deprem meydana gelmiştir.\n\nAşağıdaki illerden hangisi bu fay hattı üzerinde yer almaz?",
    secenekler: ["Düzce", "Bolu", "Konya", "Erzincan", "Tokat"],
    dogruCevap: 2,
    aciklama:
      "Düzce, Bolu, Tokat (Niksar-Erbaa) ve Erzincan Kuzey Anadolu Fay Hattı üzerinde yer alır. Konya ise bu hattın oldukça güneyinde, deprem riski görece düşük bir alanda bulunur.",
  },
  {
    ders: "COGRAFYA",
    soruMetni:
      "Birbirine yakın enlemlerde bulunan Rize ile Kars'ta ocak ayı ortalama sıcaklıkları arasında 15 °C'yi aşan bir fark bulunur; kışlar Rize'de ılık, Kars'ta ise çok soğuk geçer.\n\nBu farkın temel nedenleri aşağıdakilerin hangisinde birlikte verilmiştir?",
    secenekler: [
      "Yükselti ve denize olan uzaklık",
      "Enlem ve boylam farkı",
      "Bakı ve bitki örtüsü",
      "Nüfus yoğunluğu ve sanayileşme",
      "Toprak türü ve akarsu rejimi",
    ],
    dogruCevap: 0,
    aciklama:
      "MGM uzun yıllar verilerine göre ocak ortalaması Rize'de 6,9 °C, Kars'ta -10,7 °C'dir. Rize deniz kıyısında ve alçakta, Kars ise denizden uzak ve yaklaşık 1750 m yükseltidedir; yükselti arttıkça sıcaklık düşer, denizden uzaklaştıkça karasallık artar.",
  },
  {
    ders: "COGRAFYA",
    soruMetni:
      "Haritada numaralandırılarak gösterilen merkezlerden hangisinde, yaz mevsiminde de bol yağış görüldüğü için tarımda sulamaya en az ihtiyaç duyulur?",
    gorselSvg: turkiyeHaritasi({
      noktalar: [
        { etiket: "I", boylam: 27.14, enlem: 38.42 }, // Izmir
        { etiket: "II", boylam: 32.48, enlem: 37.87 }, // Konya
        { etiket: "III", boylam: 40.23, enlem: 37.91 }, // Diyarbakir
        { etiket: "IV", boylam: 40.52, enlem: 41.02 }, // Rize
        { etiket: "V", boylam: 30.7, enlem: 36.89 }, // Antalya
      ],
    }),
    secenekler: ["I", "II", "III", "IV", "V"],
    dogruCevap: 3,
    aciklama:
      "IV numaralı merkez Rize'dir. Karadeniz ikliminin görüldüğü Rize her mevsim yağışlıdır ve yaz kuraklığı yaşanmaz. İzmir ve Antalya'da (Akdeniz iklimi) yazlar kurak, Konya ve Diyarbakır'da (karasal iklim) ise yazlar sıcak ve kuraktır.",
  },
  {
    ders: "COGRAFYA",
    soruMetni:
      "Grafiklerde bir meteoroloji istasyonuna ait uzun yıllar aylık ortalama sıcaklık ve aylık ortalama yağış değerleri verilmiştir.\n\nBu istasyonun bulunduğu yörede aşağıdakilerden hangisinin görülmesi beklenmez?",
    // MGM, Antalya uzun yillar (1930-2025) aylik ortalamalari.
    gorselSvg: iklimGrafigi(
      [10.1, 10.7, 12.9, 16.4, 20.7, 25.4, 28.6, 28.5, 25.3, 20.6, 15.6, 11.7],
      [225.5, 148.1, 90.8, 48.5, 33.3, 10.7, 4.7, 4.3, 16.7, 70.6, 127.7, 250.9],
    ),
    secenekler: [
      "Doğal bitki örtüsünün maki olması",
      "Yaz aylarında sulama ihtiyacının artması",
      "Kış aylarında don olaylarının ve kar yağışının sık yaşanması",
      "Seracılık faaliyetlerinin yaygın olması",
      "Turizm sezonunun uzun sürmesi",
    ],
    dogruCevap: 2,
    aciklama:
      "Grafikte kışlar ılık (en soğuk ay ortalaması 10 °C'nin üzerinde) ve yağışlı, yazlar sıcak ve kurak olduğundan Akdeniz iklimi görülmektedir (veriler: MGM, Antalya 1930-2025). Bu iklimde don ve kar yağışı nadirdir; maki, yaz kuraklığına bağlı sulama ihtiyacı, seracılık ve uzun turizm sezonu ise beklenen özelliklerdir.",
  },
  {
    ders: "COGRAFYA",
    soruMetni:
      "Türkiye'deki doğal bitki örtüsü türleri ile yaygın oldukları alanlar eşleştirilmiştir:\n\nI. Maki – Akdeniz ve Ege kıyı kuşağı\nII. Bozkır – İç Anadolu'nun alçak düzlükleri\nIII. Gür (nemli) orman – Doğu Karadeniz kıyı kuşağı\nIV. Alpin çayır – Ergene Havzası\n\nBu eşleştirmelerden hangileri doğrudur?",
    secenekler: ["Yalnız I", "I ve II", "I, II ve III", "II, III ve IV", "I, II, III ve IV"],
    dogruCevap: 2,
    aciklama:
      "Maki Akdeniz ikliminin, bozkır yarı kurak İç Anadolu'nun, gür ormanlar her mevsim yağışlı Doğu Karadeniz'in bitki örtüsüdür. Alpin çayırlar ise yüksek dağlarda orman üst sınırının üzerinde görülür; Ergene Havzası alçak bir düzlüktür.",
  },
  {
    ders: "COGRAFYA",
    soruMetni:
      "Türkiye'deki akarsuların büyük bölümünün akım miktarı yıl içinde büyük değişiklikler gösterir; bu akarsular ilkbaharda taşar, yaz sonunda ise suları oldukça azalır.\n\nTürkiye'deki akarsuların rejimlerinin genellikle düzensiz olmasının temel nedeni aşağıdakilerden hangisidir?",
    secenekler: [
      "Yer şekillerinin engebeli olması",
      "Yağışların mevsimlere dağılışının düzensiz olması",
      "Akarsu boylarının kısa olması",
      "Bitki örtüsünün cılız olması",
      "Kapalı havzaların bulunması",
    ],
    dogruCevap: 1,
    aciklama:
      "Akarsuların rejimi büyük ölçüde onları besleyen yağışa bağlıdır. Türkiye'de yağışın mevsimlere dağılışı düzensiz olduğundan (özellikle yaz kuraklığı) akarsuların çoğu düzensiz rejimlidir; her mevsim yağış alan Karadeniz'deki akarsular ise daha düzenlidir.",
  },
  {
    ders: "COGRAFYA",
    soruMetni:
      "Türkiye'de özellikle 1950'den sonra kırsal kesimden kentlere yoğun göçler yaşanmıştır.\n\nAşağıdakilerden hangisi bu göçlerin nedenlerinden biri değildir?",
    secenekler: [
      "Tarımda makineleşmenin artması",
      "Kentlerde sanayinin gelişmesi",
      "Miras yoluyla tarım arazilerinin küçülmesi",
      "Eğitim ve sağlık hizmetlerinin kentlerde yoğunlaşması",
      "Kırsal kesimde nüfus artış hızının düşük olması",
    ],
    dogruCevap: 4,
    aciklama:
      "Tarımda makineleşme, arazilerin miras yoluyla bölünmesi, kentlerdeki iş olanakları ve hizmetler göçü hızlandırmıştır. O dönemde kırsal kesimde nüfus artış hızı düşük değil, yüksekti; toprağın artan nüfusu besleyememesi göçü artırmıştır.",
  },
  {
    ders: "COGRAFYA",
    soruMetni:
      "Doğu Karadeniz Bölümü'nde kırsal yerleşmeler genellikle dağınık bir görünüm sunar; evler birbirinden uzak, kendi bahçe ve tarlalarının içinde kurulmuştur.\n\nBu durumun ortaya çıkmasında;\n\nI. arazinin çok engebeli olması,\nII. yağışın bol olması nedeniyle su kaynaklarına hemen her yerde ulaşılabilmesi,\nIII. tarım alanlarının küçük ve parçalı olması,\nIV. büyük ölçekli sanayi tesislerinin yaygın olması\n\ndurumlarından hangileri etkili olmuştur?",
    secenekler: ["I ve II", "I, II ve III", "I, III ve IV", "II, III ve IV", "I, II, III ve IV"],
    dogruCevap: 1,
    aciklama:
      "Engebeli arazi, su kaynaklarının her yerde bulunması ve küçük, parçalı tarım alanları evlerin dağınık kurulmasına yol açmıştır. Büyük sanayi tesislerinin varlığı ise dağınık kırsal yerleşmenin değil, toplu kentsel yerleşmenin nedenidir.",
  },
  {
    ders: "COGRAFYA",
    soruMetni: "Haritada taralı olarak gösterilen illerin tamamında yaygın olarak yetiştirilen tarım ürünü aşağıdakilerden hangisidir?",
    gorselSvg: turkiyeHaritasi({ taraliIller: ["Şanlıurfa", "Aydın", "Adana", "Hatay"] }),
    secenekler: ["Çay", "Fındık", "Pamuk", "Şeker pancarı", "Haşhaş"],
    dogruCevap: 2,
    aciklama:
      "Taralı iller Şanlıurfa (Harran Ovası), Aydın (Büyük Menderes - Söke Ovası), Adana (Çukurova) ve Hatay'dır (Amik Ovası). Yetişme döneminde bol sıcaklık ve sulama isteyen pamuk bu ovaların başlıca ürünüdür. Çay ve fındık Karadeniz'de, şeker pancarı İç Anadolu'da, haşhaş ise Afyonkarahisar çevresinde yoğunlaşır.",
  },
  {
    ders: "COGRAFYA",
    soruMetni:
      "Erzurum-Kars Bölümü'nde büyükbaş hayvancılık, ekonominin en önemli faaliyetlerinden biridir.\n\nBu bölümde büyükbaş hayvancılığın gelişmiş olmasının temel nedeni aşağıdakilerden hangisidir?",
    secenekler: [
      "Yaz yağışlarıyla gür çayırların oluşması",
      "Kışların uzun ve sert geçmesi",
      "Tarım alanlarının geniş olması",
      "Nüfusun az olması",
      "Ulaşım olanaklarının gelişmiş olması",
    ],
    dogruCevap: 0,
    aciklama:
      "Erzurum-Kars Platosu'nda ilkbahar ve yaz başında düşen yağışlarla gür çayırlar ve meralar oluşur; bu doğal otlaklar büyükbaş hayvancılığın temel kaynağıdır. Uzun ve sert kışlar tarımı kısıtlar, hayvancılığın nedeni değildir.",
  },
  {
    ders: "COGRAFYA",
    soruMetni:
      "Haritada numaralandırılarak gösterilen yerler ile bu yerlerde çıkarılan başlıca maden ve enerji kaynakları eşleştirilmiştir.\n\nBu eşleştirmelerden hangisi yanlıştır?",
    gorselSvg: turkiyeHaritasi({
      noktalar: [
        { etiket: "I", boylam: 28.13, enlem: 39.39 }, // Balikesir-Bigadic
        { etiket: "II", boylam: 31.79, enlem: 41.45 }, // Zonguldak
        { etiket: "III", boylam: 37.0, enlem: 38.25 }, // Afsin-Elbistan
        { etiket: "IV", boylam: 39.86, enlem: 38.47 }, // Elazig-Guleman
        { etiket: "V", boylam: 41.13, enlem: 37.89 }, // Batman
      ],
    }),
    secenekler: ["I – Bor", "II – Taş kömürü", "III – Linyit", "IV – Krom", "V – Bakır"],
    dogruCevap: 4,
    aciklama:
      "I Balıkesir-Bigadiç (bor), II Zonguldak (taş kömürü), III Kahramanmaraş Afşin-Elbistan (linyit), IV Elazığ-Guleman (krom) doğru eşleşmelerdir. V numaralı Batman ise bakırla değil, petrol üretimiyle öne çıkar; Türkiye'de bakır daha çok Artvin-Murgul ve Kastamonu-Küre'de çıkarılır.",
  },
  {
    ders: "COGRAFYA",
    soruMetni:
      "Türkiye'de jeotermal enerji santralleri büyük ölçüde Denizli, Aydın ve Manisa gibi Ege Bölgesi illerinde yoğunlaşmıştır.\n\nBu yoğunlaşmanın temel nedeni aşağıdakilerden hangisidir?",
    secenekler: [
      "Kırıklı (faylı) yapının yaygın olması",
      "Güneşlenme süresinin uzun olması",
      "Akarsuların düzenli rejimli olması",
      "Nüfus yoğunluğunun fazla olması",
      "Sanayinin gelişmiş olması",
    ],
    dogruCevap: 0,
    aciklama:
      "Jeotermal kaynaklar, yer altındaki sıcak suların kırık (fay) hatları boyunca yüzeye yaklaştığı alanlarda bulunur. Ege'de horst-graben sistemine bağlı fay hatlarının yaygın olması jeotermal potansiyeli artırmıştır.",
  },
  {
    ders: "COGRAFYA",
    soruMetni:
      "Türkiye'de inanç turizmi açısından önemli bazı yapılar ile bulundukları iller eşleştirilmiştir.\n\nBu eşleştirmelerden hangisi yanlıştır?",
    secenekler: [
      "Meryem Ana Evi – İzmir",
      "Sümela Manastırı – Trabzon",
      "Mevlâna Müzesi – Konya",
      "Akdamar Kilisesi – Bitlis",
      "Aziz Nikolaos Kilisesi – Antalya",
    ],
    dogruCevap: 3,
    aciklama:
      "Akdamar Kilisesi, Van Gölü'ndeki Akdamar Adası'nda, Van ilinde yer alır. Meryem Ana Evi İzmir'in Selçuk ilçesinde, Sümela Manastırı Trabzon'un Maçka ilçesinde, Aziz Nikolaos Kilisesi Antalya'nın Demre ilçesindedir.",
  },

  // ---- VATANDAŞLIK (9) ----
  {
    ders: "VATANDASLIK",
    soruMetni:
      "Ahmet ile Mehmet arasında, kanunun emredici bir hükmüne aykırı içerikte bir sözleşme yapılmıştır.\n\nBu sözleşmeye uygulanacak hukuki yaptırım aşağıdakilerden hangisidir?",
    secenekler: ["Cebri icra", "Tazminat", "Kesin hükümsüzlük (butlan)", "İptal edilebilirlik", "Disiplin cezası"],
    dogruCevap: 2,
    aciklama:
      "Kanunun emredici hükümlerine, kamu düzenine veya ahlaka aykırı sözleşmeler kesin hükümsüzdür; baştan itibaren hiçbir hüküm doğurmaz. İptal edilebilirlik yanılma, aldatma veya korkutma gibi irade sakatlıklarında; cebri icra borcun zorla yerine getirilmesinde; tazminat ise zararın giderilmesinde söz konusudur.",
  },
  {
    ders: "VATANDASLIK",
    soruMetni:
      "Türk Medeni Kanunu'na göre hak ehliyeti ile ilgili;\n\nI. Sağ doğmak koşuluyla ana rahmine düşülen andan itibaren kazanılır.\nII. Ayırt etme gücüne sahip olmayı ve ergin olmayı gerektirir.\nIII. Bütün insanlar, hukuk düzeninin sınırları içinde haklara ve borçlara ehil olmada eşittir.\n\nifadelerinden hangileri doğrudur?",
    secenekler: ["Yalnız I", "Yalnız II", "I ve II", "I ve III", "II ve III"],
    dogruCevap: 3,
    aciklama:
      "Çocuk, sağ doğmak koşuluyla ana rahmine düştüğü andan itibaren hak ehliyetine sahip olur (TMK md. 28) ve herkes hak ehliyetinde eşittir (TMK md. 8). Ayırt etme gücü ve erginlik ise fiil ehliyetinin koşullarıdır.",
  },
  {
    ders: "VATANDASLIK",
    soruMetni:
      "Türk anayasa tarihinde \"Hâkimiyet bilakaydüşart milletindir.\" (Egemenlik kayıtsız şartsız milletindir.) ilkesine ilk kez yer veren anayasa aşağıdakilerden hangisidir?",
    secenekler: [
      "1876 Kanun-i Esasi",
      "1921 Teşkilat-ı Esasiye Kanunu",
      "1924 Teşkilat-ı Esasiye Kanunu",
      "1961 Anayasası",
      "1982 Anayasası",
    ],
    dogruCevap: 1,
    aciklama:
      "Millî egemenlik ilkesi ilk kez 1921 Teşkilat-ı Esasiye Kanunu'nun 1. maddesinde yer almıştır. 1876 Kanun-i Esasi'de egemenlik padişaha aitti; 1924, 1961 ve 1982 anayasaları bu ilkeyi korumuştur.",
  },
  {
    ders: "VATANDASLIK",
    soruMetni:
      "2017 Anayasa değişikliği sonrasında 1982 Anayasası'na göre Cumhurbaşkanlığı kararnameleri ile ilgili aşağıdakilerden hangisi yanlıştır?",
    secenekler: [
      "Anayasaya aykırılığı iddiasıyla Danıştayda iptal davası açılır.",
      "Yürütme yetkisine ilişkin konularda çıkarılabilir.",
      "Temel haklar, kişi hakları ve siyasi haklar Cumhurbaşkanlığı kararnamesiyle düzenlenemez.",
      "Kanunda açıkça düzenlenen konularda Cumhurbaşkanlığı kararnamesi çıkarılamaz.",
      "Kararname ile kanunlarda farklı hükümler bulunması hâlinde kanun hükümleri uygulanır.",
    ],
    dogruCevap: 0,
    aciklama:
      "Anayasa md. 104'e göre Cumhurbaşkanlığı kararnameleri yürütme yetkisine ilişkin konularda çıkarılır; temel haklar, kişi hakları ve siyasi haklar bunlarla düzenlenemez, kanunda açıkça düzenlenen konularda kararname çıkarılamaz ve çatışma hâlinde kanun uygulanır. Anayasaya aykırılık iddiasıyla iptal davası ise Danıştayda değil, Anayasa Mahkemesinde açılır (md. 148).",
  },
  {
    ders: "VATANDASLIK",
    soruMetni:
      "2017 Anayasa değişikliğiyle TBMM'nin bilgi edinme ve denetim yollarında değişikliğe gidilmiştir.\n\nAşağıdakilerden hangisi bu değişiklikle kaldırılan denetim yollarından biridir?",
    secenekler: ["Meclis araştırması", "Genel görüşme", "Meclis soruşturması", "Yazılı soru", "Gensoru"],
    dogruCevap: 4,
    aciklama:
      "Yürütmenin Cumhurbaşkanlığı hükûmet sistemiyle tek başlı hâle gelmesi üzerine gensoru ve sözlü soru kaldırılmıştır. TBMM; meclis araştırması, genel görüşme, meclis soruşturması ve yazılı soru yollarıyla denetim yetkisini kullanmaya devam eder (md. 98).",
  },
  {
    ders: "VATANDASLIK",
    soruMetni: "1982 Anayasası'na göre Anayasa Mahkemesi ile ilgili aşağıdaki ifadelerden hangisi yanlıştır?",
    secenekler: [
      "On beş üyeden oluşur.",
      "Üyelerinden üçünü TBMM, on ikisini Cumhurbaşkanı seçer.",
      "Üyeler on iki yıl için seçilir ve bir kimse iki defa üye seçilemez.",
      "Kararlarına karşı Yargıtaya itiraz edilebilir.",
      "Yüce Divan sıfatıyla Cumhurbaşkanını, TBMM Başkanını, Cumhurbaşkanı yardımcılarını ve bakanları yargılar.",
    ],
    dogruCevap: 3,
    aciklama:
      "Anayasa Mahkemesi kararları kesindir; bu kararlara karşı başka bir yargı merciine başvurulamaz (md. 153). Mahkeme 15 üyeden oluşur, üyelerin 3'ünü TBMM, 12'sini Cumhurbaşkanı seçer; üyeler 12 yıl için seçilir ve iki kez seçilemez.",
  },
  {
    ders: "VATANDASLIK",
    soruMetni: "Aşağıdakilerden hangisi hizmet yönünden yerinden yönetim kuruluşlarına örnektir?",
    secenekler: ["Belediye", "İl özel idaresi", "Devlet üniversitesi", "Köy", "Valilik"],
    dogruCevap: 2,
    aciklama:
      "Belli bir kamu hizmetini yürütmek için kurulan, tüzel kişiliğe ve özerkliğe sahip devlet üniversiteleri hizmet yönünden yerinden yönetim kuruluşudur. Belediye, il özel idaresi ve köy yer yönünden yerinden yönetim (mahallî idare), valilik ise merkezî yönetimin taşra teşkilatıdır.",
  },
  {
    ders: "VATANDASLIK",
    soruMetni: "Aşağıdakilerden hangisi idari işlemlerin özelliklerinden biri değildir?",
    secenekler: [
      "İdarenin tek yanlı iradesiyle yapılması",
      "Yargı denetimi dışında kalması",
      "Kamu gücüne dayanması",
      "Hukuka uygun olduğunun varsayılması",
      "İdare tarafından doğrudan (re'sen) uygulanabilmesi",
    ],
    dogruCevap: 1,
    aciklama:
      "Anayasa md. 125'e göre idarenin her türlü eylem ve işlemine karşı yargı yolu açıktır; bu nedenle idari işlemler yargı denetimine tabidir. Tek yanlılık, kamu gücüne dayanma, hukuka uygunluk karinesi ve re'sen uygulanabilme idari işlemlerin temel özellikleridir.",
  },
  {
    ders: "VATANDASLIK",
    soruMetni:
      "1982 Anayasası'nda temel hak ve ödevler; kişinin hakları ve ödevleri, sosyal ve ekonomik haklar ve ödevler, siyasi haklar ve ödevler olmak üzere üç grupta düzenlenmiştir.\n\nAşağıdakilerden hangisi siyasi haklar ve ödevler arasında yer alır?",
    secenekler: ["Dilekçe hakkı", "Mülkiyet hakkı", "Eğitim ve öğrenim hakkı", "Konut dokunulmazlığı", "Sendika kurma hakkı"],
    dogruCevap: 0,
    aciklama:
      "Dilekçe hakkı (md. 74) siyasi haklar ve ödevler bölümünde düzenlenmiştir. Mülkiyet hakkı ve konut dokunulmazlığı kişinin hakları; eğitim ve öğrenim hakkı ile sendika kurma hakkı ise sosyal ve ekonomik haklar arasındadır.",
  },

  // ---- GÜNCEL BİLGİLER (6) ----
  // Her bilgi 2026-10 itibariyla web kaynaklarindan dogrulandi.
  {
    ders: "GUNCEL",
    soruMetni:
      "Birleşmiş Milletler İklim Değişikliği Çerçeve Sözleşmesi'nin 31. Taraflar Konferansı (COP31) ile ilgili aşağıdaki bilgilerden hangisi doğrudur?",
    secenekler: [
      "Brezilya'nın Belem kentinde düzenlenmiştir.",
      "Paris İklim Anlaşması'nın kabul edildiği konferanstır.",
      "Azerbaycan'ın başkenti Bakü'de düzenlenmiştir.",
      "Kasım 2026'da Türkiye'nin ev sahipliğinde Antalya'da düzenlenecek; müzakerelerin başkanlığını Avustralya üstlenecektir.",
      "Mısır'ın Şarm El-Şeyh kentinde düzenlenmiştir.",
    ],
    dogruCevap: 3,
    aciklama:
      "COP30'da (Belem, 2025) varılan uzlaşıyla COP31'in 9-20 Kasım 2026'da Türkiye'nin ev sahipliğinde Antalya'da yapılması, müzakere başkanlığının ise Avustralya'da olması kararlaştırılmıştır. COP29 Bakü'de (2024), COP27 Şarm El-Şeyh'te (2022) yapılmış; Paris Anlaşması COP21'de (2015) kabul edilmiştir.",
  },
  {
    ders: "GUNCEL",
    soruMetni:
      "Temmuz 2025'te UNESCO Dünya Mirası Listesi'ne alınan; dünyada ilk madeni paranın basıldığı Lidya Krallığı'nın başkenti olan antik kent ile bu kente ait Bin Tepe tümülüslerinin (mezar tepelerinin) bulunduğu il aşağıdakilerden hangisidir?",
    secenekler: ["Aydın", "Denizli", "Manisa", "Uşak", "İzmir"],
    dogruCevap: 2,
    aciklama:
      "\"Sardes Antik Kenti ve Bin Tepe Lidya Tümülüsleri\", UNESCO Dünya Miras Komitesi'nin Paris'teki 47. oturumunda (Temmuz 2025) listeye alınarak Türkiye'nin 22. dünya mirası olmuştur. Sardes, Manisa'nın Salihli ilçesi sınırlarındadır.",
  },
  {
    ders: "GUNCEL",
    soruMetni:
      "\"Sátántangó\" romanıyla tanınan ve 2025 Nobel Edebiyat Ödülü'ne layık görülen Macar yazar aşağıdakilerden hangisidir?",
    secenekler: ["Han Kang", "Jon Fosse", "Annie Ernaux", "Imre Kertész", "László Krasznahorkai"],
    dogruCevap: 4,
    aciklama:
      "2025 Nobel Edebiyat Ödülü Macar yazar László Krasznahorkai'ye verilmiştir. Han Kang 2024'te, Jon Fosse 2023'te, Annie Ernaux 2022'de bu ödülü almış; Imre Kertész ise 2002'de ödülü kazanan ilk Macar yazardır.",
  },
  {
    ders: "GUNCEL",
    soruMetni:
      "Eylül 2025'te Letonya'nın başkenti Riga'da oynanan Avrupa Basketbol Şampiyonası (EuroBasket 2025) finalinde Türkiye A Millî Erkek Basketbol Takımı'nı yenerek şampiyon olan ülke aşağıdakilerden hangisidir?",
    secenekler: ["Almanya", "Sırbistan", "Yunanistan", "Fransa", "İspanya"],
    dogruCevap: 0,
    aciklama:
      "EuroBasket 2025 finalinde Almanya, Türkiye'yi 88-83 yenerek ikinci kez Avrupa şampiyonu olmuştur. Türkiye gümüş madalya kazanarak 2001'deki en iyi derecesini tekrarlamıştır.",
  },
  {
    ders: "GUNCEL",
    soruMetni:
      "2025 Nobel Barış Ödülü, ülkesinde demokratik hakların korunması ve diktatörlükten demokrasiye barışçıl bir geçiş için yürüttüğü mücadele nedeniyle María Corina Machado'ya verilmiştir.\n\nMachado aşağıdaki ülkelerden hangisinin muhalefet lideridir?",
    secenekler: ["Belarus", "Venezuela", "İran", "Rusya", "Myanmar"],
    dogruCevap: 1,
    aciklama:
      "María Corina Machado, Venezuela'daki demokrasi hareketinin lideridir; 2025 Nobel Barış Ödülü kendisine Venezuela halkının demokratik hakları için verdiği mücadele nedeniyle verilmiştir.",
  },
  {
    ders: "GUNCEL",
    soruMetni:
      "2025 yılının \"Aile Yılı\" olarak ilan edilmesinin ardından Cumhurbaşkanı Recep Tayyip Erdoğan, 2026-2035 dönemi için yeni bir ilanda bulunmuştur.\n\nBu dönem için yapılan ilan aşağıdakilerden hangisidir?",
    secenekler: [
      "Aile ve Gençlik 10 Yılı",
      "Aile ve Eğitim 10 Yılı",
      "Aile ve Kalkınma 10 Yılı",
      "Aile ve Nüfus 10 Yılı",
      "Aile ve Toplum 10 Yılı",
    ],
    dogruCevap: 3,
    aciklama:
      "2025'in \"Aile Yılı\" ilan edilmesinin ardından 2026-2035 dönemi \"Aile ve Nüfus 10 Yılı\" olarak ilan edilmiştir; dönemin öncelikleri arasında doğurganlık oranının artırılması ve aile kurumunun güçlendirilmesi yer alır.",
  },
];

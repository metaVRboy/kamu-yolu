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

export const LISANS_SORULARI: SeedSoru[] = [
  // ---- TÜRKÇE (30) ----

  // -- Ortak metinli soru çiftleri (2 parça × 2 soru = 4) --
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

  // -- Numaralı (I-V) ifade/paragraf soruları (3) --
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
      "(I) Bal arıları, çiçekten topladıkları nektarı kovana taşıyarak bal üretimine başlar. (II) Bu süreçte arılar, nektarı ağız organlarıyla işleyerek enzimler katar. (III) Petek gözlerine yerleştirilen bu karışım, suyunu kaybederek koyulaşır. (IV) Arı sokması, vücutta şişlik ve kızarıklığa yol açabilen bir savunma mekanizmasıdır. (V) Son aşamada işçi arılar, peteği ince bir balmumu tabakasıyla kapatarak balı olgunlaştırır.\n\nBu parçadaki numaralı cümlelerden hangisi düşüncenin akışını bozmaktadır?",
    secenekler: ["I", "II", "III", "IV", "V"],
    dogruCevap: 3,
    aciklama: "Diğer cümleler bal üretim sürecini sırayla anlatırken IV. cümle konu dışına çıkıp arı sokmasından söz eder.",
  },
  {
    ders: "TURKCE",
    soruMetni:
      "Bitkiler güneş ışığını kullanarak fotosentez yapar ve bu süreçte oksijen üretir. Ancak her bitki bu süreci aynı verimlilikte gerçekleştirmez; yaprak yüzey alanı, klorofil miktarı ve ışık yoğunluğu fotosentez hızını doğrudan etkiler. Kurak bölgelerde yetişen bazı bitkiler, su kaybını azaltmak için gözeneklerini gün boyunca kapalı tutar ve fotosentezi gece gerçekleştirir.\n\nBu parçaya göre,\nI. Fotosentez hızı yalnızca ışık miktarına bağlıdır.\nII. Bazı bitkiler su kaybını önlemek için farklı stratejiler geliştirmiştir.\nIII. Tüm bitkiler fotosentezi aynı verimlilikte yapar.\nIV. Yaprak yüzey alanı fotosentez hızını etkileyen etkenlerden biridir.\n\nyargılarından hangilerine ulaşılabilir?",
    secenekler: ["I ve II", "I ve III", "II ve III", "II ve IV", "III ve V"],
    dogruCevap: 3,
    aciklama: "Parça I ve III'ü (yalnızca/tüm gibi aşırı genellemeleri) desteklemez; II ve IV parçayla doğrudan uyumludur.",
  },

  // -- Sözel Mantık (4) --
  {
    ders: "TURKCE",
    soruMetni:
      "Ali, Veli, Can ve Deniz'in boyları karşılaştırılıyor: Ali, Veli'den uzundur. Deniz, Ali'den uzundur. Can, Veli'den uzun fakat Ali'den kısadır. Buna göre boy sıralamasında en kısa olan kişi kimdir?",
    secenekler: ["Ali", "Veli", "Can", "Deniz", "Belirlenemez"],
    dogruCevap: 1,
    aciklama: "Verilenlerden Veli < Can < Ali < Deniz sıralaması çıkar; en kısa kişi Veli'dir.",
  },
  {
    ders: "TURKCE",
    soruMetni:
      "Ayşe, Burak ve Ceren'in meslekleri doktor, mühendis ve öğretmendir (sırasız, her biri farklı bir meslektedir). Ayşe doktor değildir. Burak mühendis değildir. Doktor olan kişi Ceren değildir. Buna göre Burak'ın mesleği nedir?",
    secenekler: ["Doktor", "Mühendis", "Öğretmen", "Hem doktor hem mühendis", "Belirlenemez"],
    dogruCevap: 0,
    aciklama: "Doktor, Ayşe ve Ceren olamayacağına göre doktor Burak'tır; bu, 'Burak mühendis değildir' ifadesiyle de çelişmez.",
  },
  {
    ders: "TURKCE",
    soruMetni: "Bir sayı dizisi şu şekilde ilerliyor: 3, 7, 15, 31, ... Bu diziye göre bir sonraki terim kaçtır?",
    secenekler: ["47", "55", "63", "71", "79"],
    dogruCevap: 2,
    aciklama: "Her terim bir öncekinin 2 katının 1 fazlasıdır (31×2+1=63): 3→7→15→31→63.",
  },
  {
    ders: "TURKCE",
    soruMetni:
      "Bir toplantı, Salı gününden iki gün sonra yapılacaktır. Toplantının yapılacağı günden bir gün sonra ise resmî tatil vardır. Buna göre resmî tatil haftanın hangi günündedir?",
    secenekler: ["Çarşamba", "Perşembe", "Cuma", "Cumartesi", "Pazar"],
    dogruCevap: 2,
    aciklama: "Salı'dan iki gün sonrası Perşembe'dir (toplantı günü); Perşembe'den bir gün sonrası Cuma'dır.",
  },

  // -- Sözcükte Anlam (1) --
  {
    ders: "TURKCE",
    soruMetni: '"Hukuk" sözcüğü aşağıdaki cümlelerin hangisinde terim anlamıyla kullanılmıştır?',
    secenekler: [
      "Onunla eski bir hukukumuz var.",
      "Hukuk Fakültesinden yeni mezun oldu.",
      "Komşuluk hukukuna uymalıyız.",
      "Aramızdaki dostluk hukuku bozulmasın.",
      "Yıllara dayanan bir hukukumuz vardı.",
    ],
    dogruCevap: 1,
    aciklama: '"Hukuk Fakültesi" ifadesinde hukuk, bir bilim dalının adı olarak terim anlamında kullanılmıştır; diğerlerinde "dostluk, bağ" anlamındadır.',
  },

  // -- Cümlede Anlam (2) --
  {
    ders: "TURKCE",
    soruMetni: "Aşağıdaki cümlelerin hangisi öznel bir yargı bildirir?",
    secenekler: [
      "Bu şehirde yılda ortalama 800 mm yağış düşer.",
      "Roman 300 sayfadan oluşuyor.",
      "Bence bu, yazarın en güzel eseri.",
      "Toplantı saat 10.00'da başladı.",
      "Türkiye'nin başkenti Ankara'dır.",
    ],
    dogruCevap: 2,
    aciklama: '"Bence" ifadesiyle kişisel görüş belirtildiği için bu cümle öznel (kanıtlanamaz) bir yargı taşır.',
  },
  {
    ders: "TURKCE",
    soruMetni: "Aşağıdaki cümlelerin hangisi şart (koşul) anlamı taşır?",
    secenekler: [
      "Çalışırsan başarırsın.",
      "Çalıştı ve başardı.",
      "Çalışmadığı hâlde başardı.",
      "Çalışırken müzik dinler.",
      "Çalışmak için erken kalktı.",
    ],
    dogruCevap: 0,
    aciklama: '"-sa/-se" şart ekiyle kurulan "Çalışırsan başarırsın" cümlesi koşul bildirir.',
  },

  // -- Sözcük Türleri (1) --
  {
    ders: "TURKCE",
    soruMetni: 'Aşağıdaki cümlelerin hangisinde "ile" sözcüğü bağlaç görevindedir?',
    secenekler: [
      "Kalemle yazı yazdı.",
      "Ahmet ile Mehmet okula gitti.",
      "Trenle şehre gitti.",
      "Bıçakla ekmek kesti.",
      "Arabayla geldi.",
    ],
    dogruCevap: 1,
    aciklama: '"Ahmet ile Mehmet" iki ismi bağladığı için "ile" burada bağlaç görevindedir; diğerlerinde araç bildiren çekim edatıdır.',
  },

  // -- Sözcükte Yapı (2) --
  {
    ders: "TURKCE",
    soruMetni: "Aşağıdaki sözcüklerden hangisi yapı bakımından türemiş sözcüktür?",
    secenekler: ["Kitaplık", "Çocuk", "Masa", "Kalem", "Deniz"],
    dogruCevap: 0,
    aciklama: '"Kitaplık" kök (kitap) ve yapım eki (-lık) içerdiği için türemiş sözcüktür; diğerleri basit (kök hâlinde) sözcüktür.',
  },
  {
    ders: "TURKCE",
    soruMetni: "Aşağıdaki sözcüklerden hangisi birleşik sözcüktür?",
    secenekler: ["Gözlük", "Başarı", "Hanımeli", "Kalemlik", "Sevgi"],
    dogruCevap: 2,
    aciklama: '"Hanımeli", "hanım" ve "eli" sözcüklerinin kalıplaşarak birleşmesiyle oluşmuş bir birleşik sözcüktür (bir bitki adı); diğerleri yapım ekiyle türemiştir.',
  },

  // -- Öge Dizilişi (1) --
  {
    ders: "TURKCE",
    soruMetni:
      '"Öğretmen, sınava hazırlanan öğrencilere son tavsiyelerini verdi." cümlesiyle öge dizilişi (özne - dolaylı tümleç - nesne - yüklem) bakımından aynı yapıya sahip cümle aşağıdakilerden hangisidir?',
    secenekler: [
      "Çocuk, markete giden babasına çantasını uzattı.",
      "Anne, çantasını odada unutan çocuğu azarladı.",
      "Yorgun öğrenciler erkenden evlerine döndü.",
      "Komşumuz, bahçesindeki çiçekleri her sabah sular.",
      "Çocuklar bahçede neşeyle oynuyordu.",
    ],
    dogruCevap: 0,
    aciklama:
      '"Çocuk (özne), markete giden babasına (dolaylı tümleç), çantasını (nesne) uzattı (yüklem)" aynı öge sırasını taşır; diğer seçeneklerde öge dizilişi farklıdır.',
  },

  // -- Fiilimsi (1) --
  {
    ders: "TURKCE",
    soruMetni:
      "Sabah erkenden kalkıp (I) koşuya çıkan Mert, parkta koşarken (II) gördüğü yaşlı adamla sohbet etti. Adam, gençliğinde yazdığı (III) şiirlerden söz ederken gözleri parlıyordu. Mert, bu şiirleri bir gün okumayı (IV) kendine hedef koydu ve eve dönerken (V) bu karşılaşmayı hiç unutmayacağını düşündü.\n\nNumaralanmış fiilimsilerden hangisi sıfat-fiil (sıfat göreviyle kullanılmış fiilimsi)dir?",
    secenekler: ["I", "II", "III", "IV", "V"],
    dogruCevap: 2,
    aciklama: '"Yazdığı" (-dığı eki) burada "şiirler" sözcüğünü niteleyen bir sıfat-fiildir; diğerleri bağ-fiil (I, II, V) veya isim-fiildir (IV).',
  },

  // -- Ses Bilgisi (1) --
  {
    ders: "TURKCE",
    soruMetni:
      "Ağaçtan ağaca konan bir kelebek, burnuna değil dokunma kıllarına güvenerek çiçeğin kokusunu algılar. Kelebek, ağacın dallarında uzun süre bekliyor ve en uygun çiçeği seçmeye çalışıyor.\n\nBu parçada aşağıdaki ses olaylarından hangisi yoktur?",
    secenekler: ["Ünsüz yumuşaması", "Ünlü daralması", "Ünsüz benzeşmesi", "Ünlü düşmesi", "Büyük ünlü uyumuna aykırılık"],
    dogruCevap: 4,
    aciklama:
      '"Çiçeğin/ağacın" ünsüz yumuşaması, "bekliyor" ünlü daralması, "ağaçtan" ünsüz benzeşmesi, "burnuna" ünlü düşmesi örnekleridir; parçadaki sözcüklerin hiçbiri büyük ünlü uyumuna aykırı değildir.',
  },

  // -- İki boşluklu tamamlama (1) --
  {
    ders: "TURKCE",
    soruMetni:
      "Bilim insanları uzun süre, beynin yalnızca çocukluk döneminde yeni bağlantılar kurabildiğini düşünüyordu. ---- yapılan yeni araştırmalar, yetişkin beyninin de öğrenme yoluyla fiziksel olarak değişebildiğini gösterdi. Bu bulgu, ---- yetişkinlikte yeni bir beceri öğrenmenin beyin yapısını etkileyebileceği anlamına geliyor.\n\nBu parçada boş bırakılan yerlere sırasıyla aşağıdakilerden hangisi getirilmelidir?",
    secenekler: ["Ancak - aslında", "Çünkü - asla", "Böylece - hiçbir zaman", "Nitekim - kesinlikle", "Üstelik - nadiren"],
    dogruCevap: 0,
    aciklama: '"Ancak" eski görüşle yeni bulgu arasında karşıtlık kurar; "aslında" ise sonuç cümlesindeki olasılık ifadesiyle uyumludur.',
  },

  // -- Yazım Kuralları (1) --
  {
    ders: "TURKCE",
    soruMetni: "Aşağıdaki cümlelerin hangisinde yazım yanlışı vardır?",
    secenekler: [
      "Yarın akşam size geleceğim.",
      "Bu konuda haklısın.",
      "Okula zamanında yetiş.",
      "Kitabı masanın üzerine bırakdı.",
      "Hava bugün çok soğuk.",
    ],
    dogruCevap: 3,
    aciklama: '"Bırakdı" yanlıştır; ünsüz benzeşmesi kuralınca "bırak-tı" > "bıraktı" olmalıdır.',
  },

  // -- Noktalama İşaretleri (1) --
  {
    ders: "TURKCE",
    soruMetni: "Noktalama işaretlerinin kullanımıyla ilgili aşağıdaki cümlelerin hangisinde yanlışlık vardır?",
    secenekler: [
      "Ali, Veli ve Ahmet geldi.",
      "Geldin mi?",
      "Ne kadar güzel bir manzara!",
      "Annem dedi ki, yarın misafirimiz var.",
      "Kitabı, defteri ve kalemi aldım.",
    ],
    dogruCevap: 3,
    aciklama: '"Dedi ki" den sonra virgül değil doğrudan aktarılan söz gelmeli; doğrusu "Annem dedi ki: Yarın misafirimiz var." biçimindedir.',
  },

  // -- Anlatım Bozuklukları (1) --
  {
    ders: "TURKCE",
    soruMetni: "Aşağıdaki cümlelerin hangisinde bir anlatım bozukluğu vardır?",
    secenekler: [
      "Bu kitabı okudum ve çok beğendim.",
      "Sınava hazırlanıyor ve ders çalışıyordu.",
      "Hem çalışkan hem de dürüst bir insandır.",
      "Dün akşam eve geç geldim.",
      "Yağmur yağıyor ve ıslanıyoruz.",
    ],
    dogruCevap: 1,
    aciklama: '"Sınava hazırlanıyor ve ders çalışıyordu" cümlesinde zaman uyumsuzluğu vardır (biri şimdiki, biri geçmiş zaman).',
  },

  // -- Kalan paragraf soruları (7) --
  {
    ders: "TURKCE",
    soruMetni:
      "Güneş enerjisi, yenilenebilir enerji kaynakları arasında en hızlı büyüyen alanlardan biridir. Güneş panellerinin maliyetinin son on yılda önemli ölçüde düşmesi, bu teknolojinin daha geniş kitlelere ulaşmasını sağlamıştır. Ayrıca güneş enerjisi, fosil yakıtların aksine sera gazı salımına neden olmadığından iklim değişikliğiyle mücadelede önemli bir rol üstlenmektedir. Ancak güneş panellerinin üretimi sırasında da bir miktar çevresel etki oluştuğu unutulmamalıdır.\n\nBu parçaya göre aşağıdakilerden hangisi söylenemez?",
    secenekler: [
      "Güneş panellerinin maliyeti zamanla azalmıştır.",
      "Güneş enerjisi iklim değişikliğiyle mücadelede rol oynar.",
      "Güneş panellerinin üretiminin hiçbir çevresel etkisi yoktur.",
      "Güneş enerjisi yenilenebilir bir kaynaktır.",
      "Fosil yakıtlar sera gazı salımına neden olur.",
    ],
    dogruCevap: 2,
    aciklama: "Parça, panel üretiminin bir miktar çevresel etkisi olduğunu açıkça belirtir; bu yüzden 'hiçbir etkisi yok' yargısı söylenemez.",
  },
  {
    ders: "TURKCE",
    soruMetni:
      "Ahtapotlar, omurgasızlar arasında en zeki canlılardan biri olarak kabul edilir. Karmaşık problemleri çözebilir, kavanoz kapaklarını açabilir ve hatta bazı deneylerde basit araçlar kullanabildikleri gözlemlenmiştir. Üç kalbi ve mavi kanı olan bu canlılar, renk değiştirme yetenekleriyle de dikkat çeker.\n\nBu parçaya en uygun başlık aşağıdakilerden hangisidir?",
    secenekler: [
      "Denizlerin Kirlenmesi",
      "Ahtapotların Şaşırtıcı Zekâsı ve Özellikleri",
      "Omurgasızların Sınıflandırılması",
      "Renk Değiştiren Bitki Türleri",
      "Deniz Canlılarının Beslenme Şekli",
    ],
    dogruCevap: 1,
    aciklama: "Parça baştan sona ahtapotların zekâsını ve ilginç özelliklerini konu alır.",
  },
  {
    ders: "TURKCE",
    soruMetni:
      "Bir orkestrada onlarca müzisyen aynı anda farklı çalgılar çalar, ancak ortaya uyumlu bir eser çıkar. Bunun sırrı, her müzisyenin kendi payına düşen görevi en iyi şekilde yerine getirirken aynı zamanda şefin yönlendirmesine kulak vermesinde yatar. Bireysel yetenek önemlidir, fakat ortak bir hedefe hizmet eden uyum olmadan başarılı bir performans ortaya çıkmaz.\n\nBu parçadan hareketle aşağıdaki yargılardan hangisine ulaşılabilir?",
    secenekler: [
      "Orkestrada yalnızca şefin yeteneği önemlidir.",
      "Başarılı bir sonuç için bireysel yetenek kadar uyum da gereklidir.",
      "Müzisyenlerin bireysel yetenekleri hiçbir fark yaratmaz.",
      "Orkestra müziği diğer müzik türlerinden üstündür.",
      "Şefin yönlendirmesi olmadan da tam uyum sağlanabilir.",
    ],
    dogruCevap: 1,
    aciklama: "Parça, bireysel yetenek kadar uyumun da gerekli olduğunu vurgular; bu doğrudan B seçeneğiyle örtüşür.",
  },
  {
    ders: "TURKCE",
    soruMetni:
      "Yapay zekâ teknolojilerinin günlük hayata entegrasyonu hızla artıyor. Akıllı asistanlardan öneri sistemlerine kadar pek çok alanda karşımıza çıkan bu teknolojiler hayatımızı kolaylaştırırken bazı etik soruları da beraberinde getiriyor. Verilerimizin nasıl kullanıldığı, kararların ne ölçüde şeffaf olduğu gibi konular, teknolojinin gelişimi kadar tartışılması gereken başlıklar arasında yer almalı.\n\nYazarın bu parçadaki temel amacı aşağıdakilerden hangisidir?",
    secenekler: [
      "Yapay zekâ teknolojisinin tamamen durdurulması gerektiğini savunmak.",
      "Yapay zekânın faydalarının yanı sıra etik tartışmaların önemine dikkat çekmek.",
      "Akıllı asistanların teknik çalışma prensibini açıklamak.",
      "Veri güvenliği yasalarının tarihsel gelişimini anlatmak.",
      "Yapay zekânın hiçbir riski olmadığını kanıtlamak.",
    ],
    dogruCevap: 1,
    aciklama: "Yazar, yapay zekânın kolaylıklarını kabul etmekle birlikte etik tartışmaların da önemsenmesi gerektiğini vurgular.",
  },
  {
    ders: "TURKCE",
    soruMetni:
      "Bal arıları, bir kovanda karmaşık bir iş bölümü içinde yaşar. İşçi arılar yiyecek toplama, kovanı temizleme ve larvaları besleme gibi görevleri üstlenirken, erkek arılar yalnızca kraliçeyle çiftleşmek amacıyla var olur. Kraliçe arı ise kovanın tek üreyen bireyi olarak günde binlerce yumurta bırakabilir. Bu düzenli iş bölümü sayesinde koloni, mevsimler boyunca varlığını sürdürebilir.\n\nBu parçadan aşağıdakilerin hangisi çıkarılamaz?",
    secenekler: [
      "İşçi arılar birden fazla görevi yerine getirir.",
      "Kraliçe arı kovandaki tek üreyen bireydir.",
      "Erkek arılar kovanın temizliğinden de sorumludur.",
      "Arı kolonisinde belirgin bir iş bölümü vardır.",
      "Kraliçe arı günde çok sayıda yumurta bırakabilir.",
    ],
    dogruCevap: 2,
    aciklama: "Parçaya göre erkek arılar yalnızca çiftleşme amacıyla vardır; temizlik işçi arılara aittir, bu yüzden C çıkarılamaz.",
  },
  {
    ders: "TURKCE",
    soruMetni:
      "İnsan beyni yaklaşık 86 milyar nöron içerir ve bu nöronlar birbirleriyle trilyonlarca bağlantı kurar. Bu karmaşık ağ bir şehrin elektrik şebekesine benzetilebilir; nasıl ki şehirdeki her ev farklı hatlarla ana güç kaynağına bağlıysa beyindeki her nöron da sinapslar aracılığıyla diğer nöronlara bağlanarak bilgi akışını sağlar.\n\nBu parçada düşünceyi geliştirme yollarından öncelikle hangisine başvurulmuştur?",
    secenekler: ["Örnekleme", "Tanık gösterme", "Benzetme", "Karşıtlıklardan yararlanma", "Tanımlama"],
    dogruCevap: 2,
    aciklama: "Beynin şehir elektrik şebekesine benzetilmesi, açık bir benzetme (analoji) örneğidir.",
  },
  // ---- MATEMATİK (30) ----
  // Gercek KPSS kitapciklarinda Matematik bolumu once karmasik (kesir+uslu+
  // koklu+faktoriyel ic ice) islem sorulariyla acilir, ortasinda uzun
  // senaryolu problemler ve ortak bilgiye dayali (bir setup + birkac soru)
  // bloklar yer alir, EN SONDA ise her zaman geometri sorulari gelir - bu
  // sira burada da aynen korunuyor (bkz. getBugununDenemesi: artik rastgele
  // karistirilmiyor, yazim sirasi esas aliniyor).

  // -- Karmaşık işlemler: kesir + üslü + köklü + faktöriyel (5) --
  {
    ders: "MATEMATIK",
    soruMetni: "[(2 + 1/2) - (1 - 1/2)] / [(3/2) ÷ (3/4)] + 1 işleminin sonucu kaçtır?",
    secenekler: ["1", "1,5", "2", "2,5", "3"],
    dogruCevap: 2,
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
    secenekler: ["3", "4", "5", "6", "7"],
    dogruCevap: 2,
    aciklama: "√12=2√3, √27=3√3 olduğundan pay 10+5√3=5(2+√3) olur; paydaya bölününce sonuç 5'tir.",
  },
  {
    ders: "MATEMATIK",
    soruMetni: "7! / (5! × 2!) işleminin sonucu kaçtır?",
    secenekler: ["15", "18", "21", "24", "28"],
    dogruCevap: 2,
    aciklama: "7!=5040, 5!=120, 2!=2 olduğundan 5040/(120×2)=5040/240=21.",
  },
  {
    ders: "MATEMATIK",
    soruMetni: "√(3⁴ × 2²) işleminin sonucu kaçtır?",
    secenekler: ["12", "15", "18", "21", "24"],
    dogruCevap: 2,
    aciklama: "3⁴×2²=81×4=324 ve √324=18.",
  },

  // -- Temel Kavramlar (2) --
  {
    ders: "MATEMATIK",
    soruMetni: "240 sayısının kaç farklı asal çarpanı vardır?",
    secenekler: ["2", "3", "4", "5", "6"],
    dogruCevap: 1,
    aciklama: "240 = 2⁴×3×5 olduğundan farklı asal çarpanlar 2, 3 ve 5'tir; toplam 3 tanedir.",
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

  // -- Basit Eşitsizlikler (1) --
  {
    ders: "MATEMATIK",
    soruMetni: "2x - 3 < 7 eşitsizliğini sağlayan en büyük tam sayı x kaçtır?",
    secenekler: ["3", "4", "5", "6", "7"],
    dogruCevap: 1,
    aciklama: "2x < 10 ⟹ x < 5; bu eşitsizliği sağlayan en büyük tam sayı 4'tür.",
  },

  // -- Mutlak Değer (1) --
  {
    ders: "MATEMATIK",
    soruMetni: "|x - 3| = 5 denklemini sağlayan x değerlerinin toplamı kaçtır?",
    secenekler: ["2", "4", "6", "8", "10"],
    dogruCevap: 2,
    aciklama: "x-3=5 ⟹ x=8 veya x-3=-5 ⟹ x=-2; toplamları 8+(-2)=6'dır.",
  },

  // -- Çarpanlara Ayırma (1) --
  {
    ders: "MATEMATIK",
    soruMetni: "x² - 9 ifadesinin çarpanlarına ayrılmış hâli aşağıdakilerden hangisidir?",
    secenekler: ["(x-3)(x+3)", "(x-9)(x+1)", "(x-3)²", "(x+3)²", "(x-9)(x+9)"],
    dogruCevap: 0,
    aciklama: "İki kare farkı özdeşliğine göre x²-9 = (x-3)(x+3).",
  },

  // -- Oran-Orantı (1) --
  {
    ders: "MATEMATIK",
    soruMetni: "3 kalemin fiyatı 18 TL ise 7 kalemin fiyatı kaç TL'dir?",
    secenekler: ["36", "38", "40", "42", "44"],
    dogruCevap: 3,
    aciklama: "Bir kalem 18/3=6 TL; 7 kalem 7×6=42 TL.",
  },

  // -- Denklem Çözme (1) --
  {
    ders: "MATEMATIK",
    soruMetni: "3(x-2) + 4 = 2(x+3) - 1 denklemine göre x kaçtır?",
    secenekler: ["5", "6", "7", "8", "9"],
    dogruCevap: 2,
    aciklama: "3x-6+4=3x-2 ve 2x+6-1=2x+5 olduğundan 3x-2=2x+5 ⟹ x=7.",
  },

  // -- Problemler (uzun senaryolu, 4) --
  {
    ders: "MATEMATIK",
    soruMetni:
      "Bir kütüphanedeki kitapların başlangıçta %60'ı roman, geri kalanı ise bilimsel içerikli kitaplardan oluşmaktadır. Kütüphaneye bir ay içinde yalnızca bilimsel içerikli 40 kitap daha eklenmiş ve bu eklemeden sonra bilimsel kitapların oranı tüm kitapların %50'sine yükselmiştir.\n\nBuna göre kütüphanedeki başlangıç kitap sayısı kaçtır?",
    secenekler: ["150", "180", "200", "220", "240"],
    dogruCevap: 2,
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
      "Bir havuzu bir musluk tek başına 6 saatte, başka bir musluk tek başına 3 saatte dolduruyor. İki musluk birlikte açılırsa havuz kaç saatte dolar?",
    secenekler: ["1", "1,5", "2", "2,5", "3"],
    dogruCevap: 2,
    aciklama: "Saatlik doldurma oranları toplanır: 1/6 + 1/3 = 1/2; havuz 2 saatte dolar.",
  },
  {
    ders: "MATEMATIK",
    soruMetni: "İki sayının toplamı 50, farkı 10'dur. Bu iki sayıdan büyük olanı kaçtır?",
    secenekler: ["20", "25", "28", "30", "35"],
    dogruCevap: 3,
    aciklama: "Büyük sayı = (toplam+fark)/2 = (50+10)/2 = 30.",
  },

  // -- Kümeler (1) --
  {
    ders: "MATEMATIK",
    soruMetni: "A = {1,2,3,4,5} ve B = {3,4,5,6,7} kümeleri için A∩B kümesinin eleman sayısı kaçtır?",
    secenekler: ["2", "3", "4", "5", "6"],
    dogruCevap: 1,
    aciklama: "A∩B = {3,4,5} olduğundan eleman sayısı 3'tür.",
  },

  // -- Fonksiyonlar (1) --
  {
    ders: "MATEMATIK",
    soruMetni: "f(x) = 2x + 3 fonksiyonuna göre f(4) kaçtır?",
    secenekler: ["7", "8", "9", "10", "11"],
    dogruCevap: 4,
    aciklama: "f(4) = 2×4+3 = 11.",
  },

  // -- Modüler Aritmetik (1) --
  {
    ders: "MATEMATIK",
    soruMetni: "17 sayısının 5'e bölümünden kalan kaçtır?",
    secenekler: ["0", "1", "2", "3", "4"],
    dogruCevap: 2,
    aciklama: "17 = 3×5 + 2 olduğundan kalan 2'dir.",
  },

  // -- Permütasyon-Kombinasyon (1) --
  {
    ders: "MATEMATIK",
    soruMetni: "4 farklı kitap bir rafa yan yana kaç farklı şekilde dizilebilir?",
    secenekler: ["12", "16", "20", "24", "28"],
    dogruCevap: 3,
    aciklama: "4 farklı nesnenin sıralama sayısı 4! = 24'tür.",
  },

  // -- Olasılık (1) --
  {
    ders: "MATEMATIK",
    soruMetni: "Hileli olmayan bir zarın bir kez atılmasında çift sayı gelme olasılığı kaçtır?",
    secenekler: ["1/6", "1/3", "1/2", "2/3", "5/6"],
    dogruCevap: 2,
    aciklama: "Çift sayılar {2,4,6} olduğundan olasılık 3/6=1/2'dir.",
  },

  // -- Ortak bilgili sorular: tanımlı işlem (2) --
  {
    ders: "MATEMATIK",
    soruMetni:
      "Gerçel sayılar kümesinde ⊕ işlemi,\na ⊕ b = 2a - b  (a ≥ b ise)\na ⊕ b = a + b²  (a < b ise)\nbiçiminde tanımlanıyor.\n\nBuna göre (5 ⊕ 3) işleminin sonucu kaçtır?",
    grupId: "mat-delta-islemi",
    secenekler: ["5", "6", "7", "8", "9"],
    dogruCevap: 2,
    aciklama: "5 ≥ 3 olduğundan birinci kural uygulanır: 2×5-3=7.",
  },
  {
    ders: "MATEMATIK",
    soruMetni:
      "Gerçel sayılar kümesinde ⊕ işlemi,\na ⊕ b = 2a - b  (a ≥ b ise)\na ⊕ b = a + b²  (a < b ise)\nbiçiminde tanımlanıyor.\n\nBuna göre (2 ⊕ 6) işleminin sonucu kaçtır?",
    grupId: "mat-delta-islemi",
    secenekler: ["30", "34", "36", "38", "40"],
    dogruCevap: 3,
    aciklama: "2 < 6 olduğundan ikinci kural uygulanır: 2+6²=2+36=38.",
  },

  // -- Ortak bilgili sorular: grup dağıtımı (3) --
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

  // -- Geometri (4, görselli, çok adımlı) --
  {
    ders: "MATEMATIK",
    geometri: true,
    soruMetni:
      "Şekildeki ABCD dikdörtgeninde E noktası [AB] kenarı üzerindedir ve |AE| = 2·|EB|'dir. Dikdörtgenin alanı 36 cm² olduğuna göre taralı ADE üçgeninin alanı kaç cm²'dir?",
    gorselSvg:
      '<svg viewBox="0 0 350 260" xmlns="http://www.w3.org/2000/svg"><rect x="50" y="60" width="250" height="160" fill="none" stroke="#1e293b" stroke-width="2.5"/><polygon points="50,220 50,60 217,220" fill="#fde68a" stroke="#1e293b" stroke-width="1.5"/><text x="28" y="65" font-size="16" fill="#1e293b">D</text><text x="305" y="65" font-size="16" fill="#1e293b">C</text><text x="28" y="235" font-size="16" fill="#1e293b">A</text><text x="305" y="235" font-size="16" fill="#1e293b">B</text><circle cx="217" cy="220" r="3" fill="#1e293b"/><text x="212" y="240" font-size="15" fill="#1e293b">E</text></svg>',
    secenekler: ["9", "10", "12", "15", "18"],
    dogruCevap: 2,
    aciklama:
      "Dikdörtgenin kenarları w,h ise alanı w·h=36. |AE|=(2/3)w olduğundan ADE üçgeninin alanı (1/2)·h·(2/3)w = (1/3)·36 = 12 cm²'dir.",
  },
  {
    ders: "MATEMATIK",
    geometri: true,
    soruMetni:
      "Şekildeki ABC üçgeni ikizkenar üçgendir; |AB| = |AC| = 13 cm, |BC| = 10 cm'dir. A köşesinden [BC] kenarına indirilen dikmenin ayağı D noktasıdır.\n\nBuna göre ABC üçgeninin alanı kaç cm²'dir?",
    gorselSvg:
      '<svg viewBox="0 0 300 260" xmlns="http://www.w3.org/2000/svg"><polygon points="150,40 40,230 260,230" fill="none" stroke="#1e293b" stroke-width="2.5"/><line x1="150" y1="40" x2="150" y2="230" stroke="#1e293b" stroke-width="1.5" stroke-dasharray="4,3"/><rect x="142" y="222" width="16" height="8" fill="none" stroke="#1e293b" stroke-width="1.5"/><text x="140" y="32" font-size="16" fill="#1e293b">A</text><text x="18" y="245" font-size="16" fill="#1e293b">B</text><text x="265" y="245" font-size="16" fill="#1e293b">C</text><text x="155" y="250" font-size="13" fill="#1e293b">D</text><text x="65" y="140" font-size="14" fill="#2563eb">13 cm</text><text x="195" y="140" font-size="14" fill="#2563eb">13 cm</text><text x="135" y="250" font-size="13" fill="#2563eb">10 cm</text></svg>',
    secenekler: ["48", "54", "60", "65", "72"],
    dogruCevap: 2,
    aciklama:
      "İkizkenar üçgende apexten inen dikme tabanı ortalar: |BD|=|DC|=5 cm. Pisagor ile |AD|=√(13²-5²)=√144=12 cm. Alan=(1/2)×10×12=60 cm².",
  },
  {
    ders: "MATEMATIK",
    geometri: true,
    soruMetni:
      "Şekildeki merkezi O olan çemberin yarıçapı 10 cm'dir. Merkezin [KL] kirişine olan uzaklığı 6 cm olduğuna göre |KL| kaç cm'dir?",
    gorselSvg:
      '<svg viewBox="0 0 300 300" xmlns="http://www.w3.org/2000/svg"><circle cx="150" cy="150" r="100" fill="#eff6ff" stroke="#1e293b" stroke-width="2.5"/><circle cx="150" cy="150" r="3" fill="#1e293b"/><text x="136" y="140" font-size="15" fill="#1e293b">O</text><line x1="150" y1="150" x2="150" y2="210" stroke="#1e293b" stroke-width="1.5" stroke-dasharray="3,3"/><text x="155" y="185" font-size="13" fill="#2563eb">6 cm</text><line x1="70" y1="210" x2="230" y2="210" stroke="#dc2626" stroke-width="2.5"/><text x="55" y="226" font-size="14" fill="#1e293b">K</text><text x="235" y="226" font-size="14" fill="#1e293b">L</text></svg>',
    secenekler: ["12", "14", "16", "18", "20"],
    dogruCevap: 2,
    aciklama:
      "Merkezden kirişe inilen dikme kirişi ortalar; yarı kiriş = √(10²-6²) = √64 = 8 cm olduğundan |KL| = 2×8 = 16 cm.",
  },
  {
    ders: "MATEMATIK",
    geometri: true,
    soruMetni:
      "Dik koordinat düzleminde kenarları eksenlere paralel olan bir dikdörtgenin karşılıklı köşeleri A(2, 3) ve C(8, 11) noktalarıdır.\n\nBuna göre bu dikdörtgenin alanı kaç birimkaredir?",
    gorselSvg:
      '<svg viewBox="0 0 320 300" xmlns="http://www.w3.org/2000/svg"><line x1="40" y1="260" x2="300" y2="260" stroke="#64748b" stroke-width="1.5"/><line x1="40" y1="260" x2="40" y2="20" stroke="#64748b" stroke-width="1.5"/><text x="295" y="278" font-size="13" fill="#64748b">x</text><text x="22" y="22" font-size="13" fill="#64748b">y</text><rect x="90" y="80" width="140" height="160" fill="#eff6ff" stroke="#1e293b" stroke-width="2.5"/><circle cx="90" cy="240" r="3.5" fill="#dc2626"/><text x="55" y="256" font-size="13" fill="#1e293b">A(2, 3)</text><circle cx="230" cy="80" r="3.5" fill="#dc2626"/><text x="235" y="76" font-size="13" fill="#1e293b">C(8, 11)</text></svg>',
    secenekler: ["36", "40", "42", "48", "54"],
    dogruCevap: 3,
    aciklama: "Kenarlar eksenlere paralel olduğundan genişlik=8-2=6, yükseklik=11-3=8; alan=6×8=48 birimkare.",
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

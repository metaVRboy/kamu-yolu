// KPSS Puan Hesaplama Araci icin sabit yapi tanimlari.
// Puan turu basliklari, alan/ders isimleri ve soru sayilari kullanicinin
// paylastigi referans goruntulerden birebir alinmistir; bu isimler ve
// sayilar kullanicidan gizli/degistirilemez sekilde sabittir.

export type PuanTuruId = "LISANS" | "OABT" | "ONLISANS" | "ORTAOGRETIM" | "DHBT";

export type FieldConfig = {
  key: string;
  label: string;
  totalQuestions: number;
  required?: boolean;
};

export type PuanTuruConfig = {
  id: PuanTuruId;
  label: string;
  subtitle: string;
  hasYearSelect: boolean;
  hasAlanSelect: boolean;
  hasLevelSelect: boolean;
  fields: FieldConfig[];
  singleScoreField?: { key: string; label: string; hint: string };
};

export const SINAV_YILLARI = ["2025 KPSS", "2024 KPSS", "2023 KPSS"];

export const OABT_ALAN_SECENEKLERI = [
  "Alan Bilgisi Testine Girmedim",
  "Türkçe Öğretmenliği",
  "Matematik Öğretmenliği",
  "Fen Bilimleri Öğretmenliği",
  "Sosyal Bilgiler Öğretmenliği",
  "Sınıf Öğretmenliği",
  "Okul Öncesi Öğretmenliği",
  "İngilizce Öğretmenliği",
  "Rehberlik",
];

export const DHBT_DUZEY_SECENEKLERI = [
  { value: "P122", label: "Ortaöğretim (P122)" },
  { value: "P123", label: "Önlisans (P123)" },
  { value: "P124", label: "Lisans (P124)" },
];

export const PUAN_TURLERI: PuanTuruConfig[] = [
  {
    id: "LISANS",
    label: "Lisans",
    subtitle: "(P1 - P48)",
    hasYearSelect: true,
    hasAlanSelect: false,
    hasLevelSelect: false,
    fields: [
      { key: "gy", label: "Genel Yetenek", totalQuestions: 60, required: true },
      { key: "gk", label: "Genel Kültür", totalQuestions: 60, required: true },
      { key: "hukuk", label: "Hukuk", totalQuestions: 40 },
      { key: "iktisat", label: "İktisat", totalQuestions: 40 },
      { key: "isletme", label: "İşletme", totalQuestions: 40 },
      { key: "maliye", label: "Maliye", totalQuestions: 40 },
      { key: "muhasebe", label: "Muhasebe", totalQuestions: 40 },
      { key: "calisma_ekonomisi", label: "Çalışma Ekonomisi", totalQuestions: 40 },
      { key: "istatistik", label: "İstatistik", totalQuestions: 40 },
      { key: "kamu_yonetimi", label: "Kamu Yönetimi", totalQuestions: 40 },
      { key: "uluslararasi_iliskiler", label: "Uluslararası İlişkiler", totalQuestions: 40 },
    ],
  },
  {
    id: "OABT",
    label: "Öğretmenlik (ÖABT)",
    subtitle: "(P10, P120, P121)",
    hasYearSelect: true,
    hasAlanSelect: true,
    hasLevelSelect: false,
    fields: [
      { key: "gy", label: "Genel Yetenek", totalQuestions: 60, required: true },
      { key: "gk", label: "Genel Kültür", totalQuestions: 60, required: true },
      { key: "egitim_bilimleri", label: "Eğitim Bilimleri", totalQuestions: 80, required: true },
    ],
    singleScoreField: {
      key: "yds",
      label: "YDS",
      hint: "Varsa 100 üzerinden yabancı dil puanınızı giriniz",
    },
  },
  {
    id: "ONLISANS",
    label: "Önlisans",
    subtitle: "(P93)",
    hasYearSelect: false,
    hasAlanSelect: false,
    hasLevelSelect: false,
    fields: [
      { key: "gy", label: "Genel Yetenek", totalQuestions: 60, required: true },
      { key: "gk", label: "Genel Kültür", totalQuestions: 60, required: true },
    ],
  },
  {
    id: "ORTAOGRETIM",
    label: "Ortaöğretim",
    subtitle: "(P94)",
    hasYearSelect: false,
    hasAlanSelect: false,
    hasLevelSelect: false,
    fields: [
      { key: "gy", label: "Genel Yetenek", totalQuestions: 60, required: true },
      { key: "gk", label: "Genel Kültür", totalQuestions: 60, required: true },
    ],
  },
  {
    id: "DHBT",
    label: "Din Hizmetleri (DHBT)",
    subtitle: "(P122, P123, P124)",
    hasYearSelect: false,
    hasAlanSelect: false,
    hasLevelSelect: true,
    fields: [
      { key: "gy", label: "Genel Yetenek", totalQuestions: 60, required: true },
      { key: "gk", label: "Genel Kültür", totalQuestions: 60, required: true },
      { key: "dhbt1", label: "DHBT-1", totalQuestions: 20, required: true },
      { key: "dhbt2", label: "DHBT-2", totalQuestions: 20, required: true },
    ],
  },
];

export function netOf(correct: string, wrong: string): number {
  const c = Number(correct) || 0;
  const w = Number(wrong) || 0;
  return Math.max(0, c - w / 4);
}

// --- Gercek puan hesaplama (yalnizca KPSS Lisans icin, 2023/2024/2025) ---
//
// Kaynaklar:
// 1) Test bazli ortalama/standart sapma: OSYM'nin resmi "... Sinav
//    Sonuclarina Iliskin Sayisal Bilgiler" duyurularindaki Tablo-2
//    (dokuman.osym.gov.tr uzerindeki resmi PDF'lerden birebir alindi):
//    - 2023: sayisalbilgilerds25082023.pdf
//    - 2024: sayisalbilgiler_kid23082024.pdf
//    - 2025: sayisalbilgiler_kpsd10102025.pdf
// 2) Agirliklar ve puan turu tanimlari: 2026 KPSS Lisans Basvuru Kilavuzu
//    (osym.gov.tr), Tablo-2 "KPSS Puan Turleri".
// 3) Standart puan (SP) donusumu: OSYM'nin sinav sonuclarinda kullandigi
//    ortalamasi 50, standart sapmasi 10 olan standart puan donusumu.
//
// OSYM'nin nihai "100 uzerinden KPSS Puani" adimi, agirlikli standart
// puanlarin (ASP) kendi icindeki dagilimin ortalama/std sapma/en yuksek
// degerlerine (X, S, B) gore ikinci bir donusumden geciyor. Bu ucu resmi
// olarak yayimlanmadigi icin burada hesaplanmiyor; gosterilen sonuc ASP
// (Agirlikli Standart Puan) adimidir - gercek ve dogrulanabilir, ama
// OSYM'nin sonuc belgesindeki nihai puanla ayni degildir.

export type FieldStat = { ortalama: number; stdSapma: number };

export const LISANS_STATS_BY_YEAR: Record<string, Record<string, FieldStat>> = {
  "2023 KPSS": {
    gy: { ortalama: 15.944, stdSapma: 7.553 },
    gk: { ortalama: 16.954, stdSapma: 9.681 },
    hukuk: { ortalama: 8.912, stdSapma: 7.163 },
    iktisat: { ortalama: 7.213, stdSapma: 5.569 },
    isletme: { ortalama: 6.755, stdSapma: 3.592 },
    maliye: { ortalama: 7.968, stdSapma: 6.303 },
    muhasebe: { ortalama: 6.464, stdSapma: 4.767 },
    calisma_ekonomisi: { ortalama: 7.487, stdSapma: 3.968 },
    istatistik: { ortalama: 2.612, stdSapma: 1.78 },
    kamu_yonetimi: { ortalama: 10.515, stdSapma: 5.725 },
    uluslararasi_iliskiler: { ortalama: 5.632, stdSapma: 4.698 },
  },
  "2024 KPSS": {
    gy: { ortalama: 16.73, stdSapma: 9.098 },
    gk: { ortalama: 18.861, stdSapma: 10.517 },
    hukuk: { ortalama: 10.952, stdSapma: 7.235 },
    iktisat: { ortalama: 7.476, stdSapma: 6.025 },
    isletme: { ortalama: 7.706, stdSapma: 4.081 },
    maliye: { ortalama: 9.392, stdSapma: 5.838 },
    muhasebe: { ortalama: 6.229, stdSapma: 4.684 },
    calisma_ekonomisi: { ortalama: 6.763, stdSapma: 3.857 },
    istatistik: { ortalama: 2.433, stdSapma: 1.864 },
    kamu_yonetimi: { ortalama: 8.707, stdSapma: 5.317 },
    uluslararasi_iliskiler: { ortalama: 6.172, stdSapma: 4.016 },
  },
  "2025 KPSS": {
    gy: { ortalama: 17.42994, stdSapma: 9.10836 },
    gk: { ortalama: 14.30211, stdSapma: 9.25736 },
    hukuk: { ortalama: 10.95354, stdSapma: 8.48814 },
    iktisat: { ortalama: 8.55232, stdSapma: 5.70123 },
    isletme: { ortalama: 9.43122, stdSapma: 4.37549 },
    maliye: { ortalama: 6.73462, stdSapma: 5.66165 },
    muhasebe: { ortalama: 6.06127, stdSapma: 4.94808 },
    calisma_ekonomisi: { ortalama: 7.13751, stdSapma: 4.12452 },
    istatistik: { ortalama: 2.45189, stdSapma: 1.88212 },
    kamu_yonetimi: { ortalama: 8.36382, stdSapma: 5.12059 },
    uluslararasi_iliskiler: { ortalama: 8.47447, stdSapma: 4.85039 },
  },
};

// Tablo-2'den: tek alan testi giren adaylarin puan turleri (KPSSP4, P12,
// P14, P19, P24, P29, P34, P39, P44) - agirliklar hepsinde ayni.
export const LISANS_TEK_ALAN_AGIRLIK = { gy: 0.2, gk: 0.2, alan: 0.6 };

// --- "Genel" (Alan Bilgisi'siz, yalnizca GY+GK'ya dayali) puanlar:
// KPSSP1/P2/P3 (Lisans), KPSSP93 (Onlisans), KPSSP94 (Ortaogretim) ---
//
// OSYM'nin ASP dagiliminin X/S/B sabitleri (nihai "100 uzerinden KPSS
// Puani" donusumu icin gerekli) resmi olarak yayimlanmiyor, bu yuzden
// yukaridaki ASP formulunden nihai puana doğrudan gecemiyoruz. Ancak bu
// donusum ASP'ye gore dogrusal (affine); ve ASP de (net_gy, net_gk)
// ciftine gore dogrusal oldugundan, nihai "genel" KPSS puani da
// (net_gy, net_gk) ciftinin dogrusal bir fonksiyonu olmak zorunda:
//   KPSS Puani = p*net_gy + q*net_gk + r
//
// Bu p,q,r katsayilari, halka acik bir referans hesap makinesine
// (kpss-puan.hesaplama.net) bilinen net degerleri gonderilip sonuclarin
// gozlemlenmesiyle bulundu: her puan turu/yil icin 3 farkli (net_gy,
// net_gk) cifti -> 3 denklem, 3 bilinmeyen (p,q,r) cozuldu; ardindan
// hesaba katilmayan 4. bir (net_gy, net_gk) ciftiyle dogrulandi ve fark
// <0.001 puan cikti (yani dogrusal model gercek degerlerle pratikte tam
// ortusuyor). Bu sayede, resmi olarak yayimlanmayan X/S/B sabitlerine
// ihtiyac duymadan, gercek OSYM istatistiklerine dayanan sonuclarla
// tutarli nihai puanlar uretilebiliyor. En yuksek nette (60/60) puanin
// tam 100'de sinirlandigi da ayrica dogrulandi.
export type GenelKatsayi = { p: number; q: number; r: number };

export type LisansPuanKodu = "KPSSP1" | "KPSSP2" | "KPSSP3";

export const LISANS_GENEL_KATSAYI: Record<string, Record<LisansPuanKodu, GenelKatsayi>> = {
  "2023 KPSS": {
    KPSSP1: { p: 0.679757, q: 0.227297, r: 52.327079 },
    KPSSP2: { p: 0.610814, q: 0.317713, r: 51.857593 },
    KPSSP3: { p: 0.536306, q: 0.418436, r: 51.209467 },
  },
  "2024 KPSS": {
    KPSSP1: { p: 0.64799, q: 0.236212, r: 51.443022 },
    KPSSP2: { p: 0.569086, q: 0.322706, r: 51.131813 },
    KPSSP3: { p: 0.486399, q: 0.413731, r: 50.717594 },
  },
  "2025 KPSS": {
    KPSSP1: { p: 0.615485, q: 0.255189, r: 52.457864 },
    KPSSP2: { p: 0.52423, q: 0.338111, r: 52.955572 },
    KPSSP3: { p: 0.435079, q: 0.420922, r: 53.344168 },
  },
};

// Onlisans (KPSSP93) ve Ortaogretim (KPSSP94) sinavlari her yil degil,
// yalnizca cift yillarda yapiliyor; su an yalnizca 2024 icin katsayi
// dogrulanabildi.
export const ONLISANS_GENEL_KATSAYI: Record<string, GenelKatsayi> = {
  "2024 KPSS": { p: 0.436278, q: 0.401217, r: 53.976723 },
};
export const ORTAOGRETIM_GENEL_KATSAYI: Record<string, GenelKatsayi> = {
  "2024 KPSS": { p: 0.316152, q: 0.477234, r: 54.7755 },
};

export function genelKpssPuani(katsayi: GenelKatsayi, gyNet: number, gkNet: number): number {
  const raw = katsayi.p * gyNet + katsayi.q * gkNet + katsayi.r;
  return Math.min(100, Math.max(0, raw));
}

// Bir testte en az 1 net bulunmayan adaylar icin OSYM o test icin
// standart puan hesaplamiyor (2026 KPSS Lisans Basvuru Kilavuzu, Bolum
// 3.10 Degerlendirme).
export const KPSS_BARAJ_NET = 1;

export function standartPuan(net: number, stat: FieldStat): number {
  return 50 + (10 * (net - stat.ortalama)) / stat.stdSapma;
}

export type BarajDurum = { key: string; label: string; net: number; gecti: boolean };

export type LisansSonuc =
  | { kind: "baraj-basarisiz"; barajlar: BarajDurum[] }
  | { kind: "genel"; puanlar: { kod: LisansPuanKodu; puan: number }[]; barajlar: BarajDurum[] }
  | { kind: "tek-alan"; alanLabel: string; asp: number; barajlar: BarajDurum[] }
  | {
      kind: "coklu-alan";
      testler: { label: string; sp: number }[];
      barajlar: BarajDurum[];
    };

export function hasVerifiedLisansStats(sinavYili: string): boolean {
  return sinavYili in LISANS_STATS_BY_YEAR;
}

export type GenelTekPuanSonuc =
  | { kind: "baraj-basarisiz"; barajlar: BarajDurum[] }
  | { kind: "genel"; puan: number; barajlar: BarajDurum[] };

function computeGenelTekPuan(
  katsayi: GenelKatsayi | undefined,
  fieldValues: Record<string, { correct: string; wrong: string }>,
): GenelTekPuanSonuc | null {
  if (!katsayi) return null;
  const netFor = (key: string) => {
    const v = fieldValues[key] ?? { correct: "", wrong: "" };
    return netOf(v.correct, v.wrong);
  };
  const gyNet = netFor("gy");
  const gkNet = netFor("gk");
  const barajlar: BarajDurum[] = [
    { key: "gy", label: "Genel Yetenek", net: gyNet, gecti: gyNet >= KPSS_BARAJ_NET },
    { key: "gk", label: "Genel Kültür", net: gkNet, gecti: gkNet >= KPSS_BARAJ_NET },
  ];
  if (!barajlar[0].gecti || !barajlar[1].gecti) {
    return { kind: "baraj-basarisiz", barajlar };
  }
  return { kind: "genel", puan: genelKpssPuani(katsayi, gyNet, gkNet), barajlar };
}

// Onlisans (KPSSP93) icin su an yalnizca 2024 KPSS verisi dogrulanabildi.
export function computeOnlisansSonuc(
  fieldValues: Record<string, { correct: string; wrong: string }>,
): GenelTekPuanSonuc | null {
  return computeGenelTekPuan(ONLISANS_GENEL_KATSAYI["2024 KPSS"], fieldValues);
}

// Ortaogretim (KPSSP94) icin su an yalnizca 2024 KPSS verisi dogrulanabildi.
export function computeOrtaogretimSonuc(
  fieldValues: Record<string, { correct: string; wrong: string }>,
): GenelTekPuanSonuc | null {
  return computeGenelTekPuan(ORTAOGRETIM_GENEL_KATSAYI["2024 KPSS"], fieldValues);
}

export function computeLisansSonuc(
  sinavYili: string,
  fieldValues: Record<string, { correct: string; wrong: string }>,
  fields: FieldConfig[],
): LisansSonuc | null {
  const stats = LISANS_STATS_BY_YEAR[sinavYili];
  if (!stats) return null;

  const isTaken = (key: string) => {
    const v = fieldValues[key];
    return !!v && (v.correct.trim() !== "" || v.wrong.trim() !== "");
  };
  const netFor = (key: string) => {
    const v = fieldValues[key] ?? { correct: "", wrong: "" };
    return netOf(v.correct, v.wrong);
  };

  const gyNet = netFor("gy");
  const gkNet = netFor("gk");
  const barajlar: BarajDurum[] = [
    { key: "gy", label: "Genel Yetenek", net: gyNet, gecti: gyNet >= KPSS_BARAJ_NET },
    { key: "gk", label: "Genel Kültür", net: gkNet, gecti: gkNet >= KPSS_BARAJ_NET },
  ];

  const alanFields = fields.filter((f) => f.key !== "gy" && f.key !== "gk" && isTaken(f.key));
  for (const f of alanFields) {
    const net = netFor(f.key);
    barajlar.push({ key: f.key, label: f.label, net, gecti: net >= KPSS_BARAJ_NET });
  }

  if (!barajlar[0].gecti || !barajlar[1].gecti) {
    return { kind: "baraj-basarisiz", barajlar };
  }

  const gySp = standartPuan(gyNet, stats.gy);
  const gkSp = standartPuan(gkNet, stats.gk);

  if (alanFields.length === 0) {
    const katsayilar = LISANS_GENEL_KATSAYI[sinavYili];
    const puanlar = (["KPSSP1", "KPSSP2", "KPSSP3"] as const).map((kod) => ({
      kod,
      puan: genelKpssPuani(katsayilar[kod], gyNet, gkNet),
    }));
    return { kind: "genel", puanlar, barajlar };
  }

  if (alanFields.length === 1) {
    const f = alanFields[0];
    const barajDurum = barajlar.find((b) => b.key === f.key)!;
    if (!barajDurum.gecti) {
      return { kind: "baraj-basarisiz", barajlar };
    }
    const stat = stats[f.key];
    const alanSp = standartPuan(barajDurum.net, stat);
    const asp =
      LISANS_TEK_ALAN_AGIRLIK.gy * gySp +
      LISANS_TEK_ALAN_AGIRLIK.gk * gkSp +
      LISANS_TEK_ALAN_AGIRLIK.alan * alanSp;
    return { kind: "tek-alan", alanLabel: f.label, asp, barajlar };
  }

  const testler = [
    { label: "Genel Yetenek", sp: gySp },
    { label: "Genel Kültür", sp: gkSp },
    ...alanFields.map((f) => ({
      label: f.label,
      sp: standartPuan(netFor(f.key), stats[f.key]),
    })),
  ];
  return { kind: "coklu-alan", testler, barajlar };
}

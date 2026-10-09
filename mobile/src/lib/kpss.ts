// Sitedeki src/lib/kpssDenemeSabitler.ts ve kpssDenemeAnaliz.ts (saf mantik, ayni kurallar).

export type Ders = "TURKCE" | "MATEMATIK" | "TARIH" | "COGRAFYA" | "VATANDASLIK" | "GUNCEL";
export type DenemeDuzeyi = "LISE" | "ONLISANS" | "LISANS";
export type Plan = "UCRETSIZ" | "PRO" | "PRO_PLUS";

export const SINAV_SURESI_DK = 130;
export const DERS_SIRASI: Ders[] = ["TURKCE", "MATEMATIK", "TARIH", "COGRAFYA", "VATANDASLIK", "GUNCEL"];
export const DERS_DAGILIMI: Record<Ders, number> = { TURKCE: 30, MATEMATIK: 30, TARIH: 27, COGRAFYA: 18, VATANDASLIK: 9, GUNCEL: 6 };
export const TOPLAM_SORU = Object.values(DERS_DAGILIMI).reduce((a, b) => a + b, 0);
export const ONERILEN_SURE_DK: Record<Ders, number> = { TURKCE: 32, MATEMATIK: 33, TARIH: 29, COGRAFYA: 19, VATANDASLIK: 10, GUNCEL: 7 };
export const DERS_LABEL: Record<Ders, string> = {
  TURKCE: "Türkçe",
  MATEMATIK: "Matematik",
  TARIH: "Tarih",
  COGRAFYA: "Coğrafya",
  VATANDASLIK: "Vatandaşlık",
  GUNCEL: "Güncel Bilgiler",
};
// Tailwind rose/blue/amber/emerald/violet/slate-500
export const DERS_RENGI: Record<Ders, string> = {
  TURKCE: "#f43f5e",
  MATEMATIK: "#3b82f6",
  TARIH: "#f59e0b",
  COGRAFYA: "#10b981",
  VATANDASLIK: "#8b5cf6",
  GUNCEL: "#64748b",
};
export const DENEME_DUZEYLERI: DenemeDuzeyi[] = ["LISE", "ONLISANS", "LISANS"];
export const DUZEY_LABEL: Record<string, string> = { ILKOGRETIM: "İlköğretim", LISE: "Ortaöğretim", ONLISANS: "Önlisans", LISANS: "Lisans", YUKSEK_LISANS: "Yüksek Lisans" };

// Sitedeki DUZEY_TEMA (emerald-teal / sky-blue / violet-indigo).
export const DUZEY_TEMA: Record<DenemeDuzeyi, { zemin: [string, string]; acik: string; metin: string; kenar: string; buton: string }> = {
  LISE: { zemin: ["#10b981", "#0d9488"], acik: "#ecfdf5", metin: "#047857", kenar: "#a7f3d0", buton: "#059669" },
  ONLISANS: { zemin: ["#0ea5e9", "#2563eb"], acik: "#f0f9ff", metin: "#0369a1", kenar: "#bae6fd", buton: "#0284c7" },
  LISANS: { zemin: ["#8b5cf6", "#4f46e5"], acik: "#f5f3ff", metin: "#6d28d9", kenar: "#ddd6fe", buton: "#7c3aed" },
};

export type ExamSoru = { id: string; ders: Ders; soruMetni: string; grupId: string | null; geometri: boolean; gorselSvg: string | null; secenekler: string[] };
export type SonucSorusu = ExamSoru & { dogruCevap: number; aciklama: string | null; konu: string | null };

/** Ortak metinli soruda numara yalniz son (asil soru) paragrafina eklenir. */
export function soruMetniNumarali(soruMetni: string, numara: number): string {
  const parcalar = soruMetni.split("\n\n");
  parcalar[parcalar.length - 1] = `${numara}. ${parcalar[parcalar.length - 1]}`;
  return parcalar.join("\n\n");
}

// --- Analiz (kpssDenemeAnaliz.ts) ---
type AnalizSorusu = { id: string; ders: Ders; konu: string | null; dogruCevap: number };
export type KonuDurumu = "kirmizi" | "sari" | "yesil";
type Sayim = { dogru: number; yanlis: number; bos: number };

const net = ({ dogru, yanlis }: Sayim) => dogru - yanlis / 4;

function say(sorular: AnalizSorusu[], cevaplar: Record<string, number>): Sayim {
  const s = { dogru: 0, yanlis: 0, bos: 0 };
  for (const soru of sorular) {
    const v = cevaplar[soru.id];
    if (v === undefined) s.bos++;
    else if (v === soru.dogruCevap) s.dogru++;
    else s.yanlis++;
  }
  return s;
}

export function dersKarnesi(sorular: AnalizSorusu[], cevaplar: Record<string, number>) {
  return DERS_SIRASI.map((ders) => {
    const sayim = say(sorular.filter((s) => s.ders === ders), cevaplar);
    return { ders, ...sayim, net: net(sayim), toplam: sayim.dogru + sayim.yanlis + sayim.bos };
  }).filter((d) => d.toplam > 0);
}

export function konuDurumu({ dogru, yanlis, bos }: Sayim): KonuDurumu {
  if (yanlis > dogru) return "kirmizi";
  if (yanlis === 0 && bos === 0) return "yesil";
  return "sari";
}

const ONCELIK: Record<KonuDurumu, number> = { kirmizi: 0, sari: 1, yesil: 2 };

export function konuAnalizi(sorular: AnalizSorusu[], cevaplar: Record<string, number>) {
  const gruplar = new Map<string, { ders: Ders; konu: string; sorular: AnalizSorusu[] }>();
  for (const s of sorular) {
    if (!s.konu) continue;
    const anahtar = `${s.ders}|${s.konu}`;
    const g = gruplar.get(anahtar) ?? { ders: s.ders, konu: s.konu, sorular: [] };
    g.sorular.push(s);
    gruplar.set(anahtar, g);
  }
  return [...gruplar.values()]
    .map(({ ders, konu, sorular: ks }) => {
      const sayim = say(ks, cevaplar);
      return { ders, konu, ...sayim, toplam: ks.length, durum: konuDurumu(sayim), soruIdler: ks.map((s) => s.id) };
    })
    .sort((a, b) => ONCELIK[a.durum] - ONCELIK[b.durum] || (b.yanlis + b.bos) / b.toplam - (a.yanlis + a.bos) / a.toplam || b.toplam - a.toplam);
}
export type KonuSonucu = ReturnType<typeof konuAnalizi>[number];

export const sayiFmt = (n: number) => n.toLocaleString("tr-TR", { maximumFractionDigits: 2 });

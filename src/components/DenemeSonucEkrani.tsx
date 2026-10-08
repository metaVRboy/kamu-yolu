"use client";

import { useRef, useState, type ReactNode } from "react";
import Link from "next/link";
import { ArrowDownRight, ArrowUpRight, CheckCircle2, TrendingUp, CircleAlert, ListChecks, MinusCircle, OctagonAlert, Target, X, XCircle } from "lucide-react";
import { DERS_LABEL, DUZEY_LABEL, DUZEY_TEMA, type DenemeDuzeyi, type ExamSoru } from "@/lib/kpssDenemeSabitler";
import { dersKarnesi, konuAnalizi, type KonuDurumu, type KonuSonucu } from "@/lib/kpssDenemeAnaliz";
import type { DenemeDers } from "@/generated/prisma/client";
import { KesirliMetin } from "@/components/KesirliMetin";
import { SoruGovdesi } from "@/components/SoruGovdesi";
import { SoruHaritasi } from "@/components/SoruHaritasi";
import { KilitliOzellik } from "@/components/KilitliOzellik";
import { cn } from "@/lib/utils";

type SonucSorusu = ExamSoru & { dogruCevap: number; aciklama: string | null; konu: string | null };

export type OncekiOzet = {
  tarihMetni: string;
  net: number;
  puan: number;
  dersNetleri: Partial<Record<string, number>>;
  konuDurumlari: Record<string, KonuDurumu>;
};

const DURUM_SINIFI = {
  dogru: "bg-emerald-500 text-white",
  yanlis: "bg-red-500 text-white",
  bos: "bg-slate-200 text-slate-600",
};

// Konu uyarilari: renk + ikon + etiket birlikte (renk tek basina anlam tasimaz).
const KONU_STIL: Record<KonuDurumu, { baslik: string; ikon: typeof CheckCircle2; kart: string; ikonRenk: string; rozet: string; mesaj: (k: string) => string }> = {
  kirmizi: {
    baslik: "Gözden geçir",
    ikon: OctagonAlert,
    kart: "border-red-200 bg-red-50/60",
    ikonRenk: "text-red-600",
    rozet: "bg-red-100 text-red-700",
    mesaj: (k) => `${k} konusunu gözden geçirmelisin.`,
  },
  sari: {
    baslik: "Dikkat",
    ikon: CircleAlert,
    kart: "border-amber-200 bg-amber-50/60",
    ikonRenk: "text-amber-600",
    rozet: "bg-amber-100 text-amber-800",
    mesaj: (k) => `${k} konusunda biraz daha dikkatli olmalısın.`,
  },
  yesil: {
    baslik: "Güçlü",
    ikon: CheckCircle2,
    kart: "border-emerald-200 bg-emerald-50/60",
    ikonRenk: "text-emerald-600",
    rozet: "bg-emerald-100 text-emerald-700",
    mesaj: (k) => `${k} konusunda eksiğin görünmüyor, böyle devam.`,
  },
};
const DURUM_ADI: Record<KonuDurumu, string> = { kirmizi: "kırmızı", sari: "sarı", yesil: "yeşil" };

const fmt = (n: number) => n.toLocaleString("tr-TR", { maximumFractionDigits: 2 });

function Fark({ deger, birim = "net" }: { deger: number; birim?: string }) {
  if (Math.abs(deger) < 0.005) return <span className="text-xs font-semibold text-slate-500">değişmedi</span>;
  const artti = deger > 0;
  const Ikon = artti ? ArrowUpRight : ArrowDownRight;
  return (
    <span className={cn("inline-flex items-center gap-0.5 text-xs font-bold", artti ? "text-emerald-600" : "text-red-600")}>
      <Ikon className="h-3.5 w-3.5" />
      {artti ? "+" : ""}
      {fmt(deger)} {birim}
    </span>
  );
}

/** Dogru/yanlis/bos orani tek serit (2px bosluklu dilimler). */
function Serit({ dogru, yanlis, bos, kalin = false }: { dogru: number; yanlis: number; bos: number; kalin?: boolean }) {
  const toplam = dogru + yanlis + bos || 1;
  return (
    <div className={cn("flex w-full gap-0.5 overflow-hidden rounded-full bg-slate-100", kalin ? "h-3" : "h-2")}>
      {dogru > 0 && <div className="bg-emerald-500" style={{ width: `${(dogru / toplam) * 100}%` }} />}
      {yanlis > 0 && <div className="bg-red-500" style={{ width: `${(yanlis / toplam) * 100}%` }} />}
      {bos > 0 && <div className="bg-slate-300" style={{ width: `${(bos / toplam) * 100}%` }} />}
    </div>
  );
}

function PuanHalkasi({ puan, renk }: { puan: number; renk: string }) {
  const r = 52;
  const cevre = 2 * Math.PI * r;
  return (
    <div className={cn("relative h-36 w-36 shrink-0", renk)}>
      <svg viewBox="0 0 128 128" className="h-full w-full -rotate-90" aria-hidden>
        <circle cx="64" cy="64" r={r} fill="none" stroke="currentColor" strokeOpacity="0.15" strokeWidth="11" />
        <circle
          cx="64"
          cy="64"
          r={r}
          fill="none"
          stroke="currentColor"
          strokeWidth="11"
          strokeLinecap="round"
          strokeDasharray={cevre}
          strokeDashoffset={cevre * (1 - Math.min(100, Math.max(0, puan)) / 100)}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-3xl font-bold text-slate-900 tabular-nums">{fmt(puan)}</span>
        <span className="text-xs font-medium text-muted-foreground">puan / 100</span>
      </div>
    </div>
  );
}

type Gelisim = {
  tarihMetni: string;
  netFark: number;
  puanFark: number;
  dersFarklari: { ders: string; fark: number }[];
  degisimler: { ders: string; konu: string; eski: KonuDurumu; yeni: KonuDurumu }[];
};

const DURUM_SIRASI: Record<KonuDurumu, number> = { kirmizi: 0, sari: 1, yesil: 2 };

// Kilitli onizleme icin ornek veri (gercek kullanici verisi degil).
const ORNEK_GELISIM: Gelisim = {
  tarihMetni: "1 Ekim",
  netFark: 6.25,
  puanFark: 5.2,
  dersFarklari: [
    { ders: "TURKCE", fark: 2.5 },
    { ders: "MATEMATIK", fark: 3.75 },
    { ders: "TARIH", fark: -0.5 },
  ],
  degisimler: [
    { ders: "MATEMATIK", konu: "Sayısal Mantık", eski: "kirmizi", yeni: "sari" },
    { ders: "TURKCE", konu: "Paragraf", eski: "sari", yeni: "yesil" },
    { ders: "TARIH", konu: "Osmanlı Siyasi Tarihi", eski: "yesil", yeni: "sari" },
  ],
};

// Kilitli konu degerlendirmesi onizlemesi: ornek sayimlar gercek analiz fonksiyonundan gecer
// ki gorunum rapordakiyle ayni olsun. [ders, konu, dogru, yanlis, bos]
const ORNEK_KONULAR = (() => {
  const ornek: [DenemeDers, string, number, number, number][] = [
    ["TURKCE", "Sözel Mantık", 1, 3, 0],
    ["MATEMATIK", "Sayısal Mantık", 1, 2, 1],
    ["TURKCE", "Paragraf", 10, 3, 1],
    ["TARIH", "Osmanlı Siyasi Tarihi", 3, 1, 2],
    ["COGRAFYA", "İklim ve Bitki Örtüsü", 2, 0, 1],
    ["MATEMATIK", "Problemler", 4, 0, 0],
    ["VATANDASLIK", "Yürütme", 2, 0, 0],
    ["TARIH", "İnkılap Tarihi", 3, 0, 0],
  ];
  const sorular: { id: string; ders: DenemeDers; konu: string; dogruCevap: number }[] = [];
  const cevaplar: Record<string, number> = {};
  for (const [ders, konu, dogru, yanlis, bos] of ornek) {
    for (let i = 0; i < dogru + yanlis + bos; i++) {
      const id = `ornek-${sorular.length}`;
      sorular.push({ id, ders, konu, dogruCevap: 0 });
      if (i < dogru) cevaplar[id] = 0;
      else if (i < dogru + yanlis) cevaplar[id] = 1;
    }
  }
  return konuAnalizi(sorular, cevaplar);
})();

/** Konu gelisim takibi: gecen denemeye gore net/puan farki ve durumu degisen konular. */
function GelisimBolumu({ gelisim }: { gelisim: Gelisim | null }) {
  return (
    <section className="rounded-3xl border border-primary/10 bg-white p-6 shadow-sm">
      <h2 className="flex items-center gap-2 font-sans text-base font-bold text-slate-900">
        <TrendingUp className="h-5 w-5 text-primary" />
        Konu gelişim takibi
      </h2>
      {!gelisim ? (
        <p className="mt-2 text-sm text-muted-foreground">Bu düzeydeki ilk denemen; bir sonraki denemenden itibaren gelişimin burada görünecek.</p>
      ) : (
        <>
          <p className="mt-1 text-sm text-slate-600">
            Geçen denemene göre ({gelisim.tarihMetni}): <Fark deger={gelisim.netFark} /> · <Fark deger={gelisim.puanFark} birim="puan" />
          </p>
          <div className="mt-4 grid gap-4 md:grid-cols-2">
            <ul className="space-y-2">
              {gelisim.dersFarklari.map((d) => (
                <li key={d.ders} className="flex items-center justify-between rounded-xl bg-slate-50 px-3 py-2 text-sm">
                  <span className="font-medium text-slate-800">{DERS_LABEL[d.ders as keyof typeof DERS_LABEL]}</span>
                  <Fark deger={d.fark} />
                </li>
              ))}
            </ul>
            <ul className="space-y-2">
              {gelisim.degisimler.length === 0 && <li className="text-sm text-muted-foreground">Konu durumlarında değişiklik yok.</li>}
              {gelisim.degisimler.map((k) => {
                const ilerledi = DURUM_SIRASI[k.yeni] > DURUM_SIRASI[k.eski];
                return (
                  <li key={`${k.ders}|${k.konu}`} className={cn("rounded-xl border px-3 py-2 text-sm", KONU_STIL[k.yeni].kart)}>
                    <span className="font-semibold text-slate-900">{k.konu}</span>{" "}
                    <span className={cn("text-xs font-bold", ilerledi ? "text-emerald-700" : "text-red-700")}>
                      {DURUM_ADI[k.eski]} → {DURUM_ADI[k.yeni]} ({ilerledi ? "ilerledi" : "geriledi"})
                    </span>
                  </li>
                );
              })}
            </ul>
          </div>
        </>
      )}
    </section>
  );
}

export function DenemeSonucEkrani({
  sorular,
  cevaplar,
  dogruSayisi,
  yanlisSayisi,
  bosSayisi,
  puan,
  duzey,
  onceki,
  plan,
}: {
  /** UCRETSIZ'de sunucu ornek (sahte cevapli) veri gonderir; rapor bulanik onizlemedir. */
  sorular: SonucSorusu[];
  cevaplar: Record<string, number>;
  dogruSayisi: number;
  yanlisSayisi: number;
  bosSayisi: number;
  puan: number;
  duzey: DenemeDuzeyi;
  /** Yalniz Pro+'da dolu (konu gelisim takibi). */
  onceki: OncekiOzet | null;
  plan: "UCRETSIZ" | "PRO" | "PRO_PLUS";
}) {
  const [incelenenIndex, setIncelenenIndex] = useState(Math.max(0, sorular.findIndex((s) => durum(s) === "yanlis")));
  const [secilenKonu, setSecilenKonu] = useState<KonuSonucu | null>(null);
  const incelemeAlani = useRef<HTMLDivElement>(null);
  const tema = DUZEY_TEMA[duzey];
  const net = dogruSayisi - yanlisSayisi / 4;
  const incelenen = sorular[incelenenIndex];
  const verilenCevap = cevaplar[incelenen.id];
  const karne = dersKarnesi(sorular, cevaplar);
  const konular = konuAnalizi(sorular, cevaplar);
  // Konu bazli degerlendirme + gelisim Pro+; digerlerinde ornek veriyle bulanik gosterilir
  // (sunucu Pro+ disinda sorularin konu bilgisini zaten gondermez).
  const konuKilitli = plan !== "PRO_PLUS";
  const gosterilenKonular = konuKilitli ? ORNEK_KONULAR : konular;
  const oncelikliler = gosterilenKonular.filter((k) => k.durum !== "yesil").slice(0, 3);
  const gelisim: Gelisim | null = onceki && {
    tarihMetni: onceki.tarihMetni,
    netFark: net - onceki.net,
    puanFark: puan - onceki.puan,
    dersFarklari: karne.flatMap((d) => (onceki.dersNetleri[d.ders] === undefined ? [] : [{ ders: d.ders, fark: d.net - onceki.dersNetleri[d.ders]! }])),
    degisimler: konular.flatMap((k) => {
      const eski = onceki.konuDurumlari[`${k.ders}|${k.konu}`];
      return eski && eski !== k.durum ? [{ ders: k.ders, konu: k.konu, eski, yeni: k.durum }] : [];
    }),
  };
  // Ucretsiz: raporun tamami tek kilit altinda (gercek duzen, ornek veri).
  const raporuSar = (icerik: ReactNode) =>
    plan === "UCRETSIZ" ? (
      <KilitliOzellik
        mevcutPlan={plan}
        gerekenPlan="PRO"
        kaynak="rapor"
        uzun
        baslik="Sınav sonu raporun"
        ozellikler={[
          "Pro: ders karnesi (her derste doğru, yanlış, boş ve net)",
          "Pro: soruların doğru cevapları ve açıklamaları",
          "Pro+: konu bazlı değerlendirme (kırmızı, sarı, yeşil uyarılar)",
          "Pro+: önceki denemene göre gelişimin",
        ]}
      >
        {icerik}
      </KilitliOzellik>
    ) : (
      icerik
    );
  // Pro: ders karnesi ve cozumler acik, konu degerlendirmesi + gelisim Pro+ kilidinde.
  const konuSar = (icerik: ReactNode) =>
    plan === "PRO" ? (
      <KilitliOzellik
        mevcutPlan={plan}
        gerekenPlan="PRO_PLUS"
        kaynak="gelisim"
        uzun
        baslik="Konu bazlı değerlendirme Pro+'da"
        ozellikler={[
          "Hangi konuyu gözden geçirmen gerektiği: kırmızı, sarı, yeşil uyarılar",
          "Önce çalışman gereken 3 konu",
          "Önceki denemene göre net, puan ve konu gelişimin",
          "Sınırsız deneme",
        ]}
      >
        {icerik}
      </KilitliOzellik>
    ) : (
      icerik
    );

  function durum(s: SonucSorusu): "dogru" | "yanlis" | "bos" {
    const verilen = cevaplar[s.id];
    if (verilen === undefined) return "bos";
    return verilen === s.dogruCevap ? "dogru" : "yanlis";
  }

  /** Konuya tiklayinca o konunun sorulari haritada vurgulanir ve ilki acilir. */
  function konuyaGit(k: KonuSonucu) {
    setSecilenKonu(k);
    setIncelenenIndex(sorular.findIndex((s) => s.id === k.soruIdler[0]));
    incelemeAlani.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  return (
    <div className="mx-auto max-w-6xl space-y-6 px-4 py-8 sm:px-6">
      {/* Ozet: puan halkasi + sayilar + onceki denemeyle fark */}
      <section className="overflow-hidden rounded-3xl border border-primary/10 bg-white shadow-sm">
        <div className={cn("h-2 bg-gradient-to-r", tema.zemin)} />
        <div className="flex flex-col gap-6 p-6 sm:flex-row sm:items-center sm:p-8">
          <PuanHalkasi puan={puan} renk={tema.metin} />
          <div className="min-w-0 flex-1">
            <p className={cn("text-xs font-bold tracking-widest uppercase", tema.metin)}>{DUZEY_LABEL[duzey]} · Bugünün denemesi</p>
            <h1 className="mt-1 font-sans text-2xl font-bold tracking-tight text-slate-900">Sınav sonucun</h1>
            <dl className="mt-4 grid grid-cols-4 gap-3 text-center">
              {[
                { ad: "Doğru", deger: dogruSayisi, renk: "text-emerald-600" },
                { ad: "Yanlış", deger: yanlisSayisi, renk: "text-red-600" },
                { ad: "Boş", deger: bosSayisi, renk: "text-slate-500" },
                { ad: "Net", deger: net, renk: "text-slate-900" },
              ].map((s) => (
                <div key={s.ad} className="rounded-2xl bg-slate-50 py-2.5">
                  <dd className={cn("text-xl font-bold tabular-nums", s.renk)}>{fmt(s.deger)}</dd>
                  <dt className="text-xs text-muted-foreground">{s.ad}</dt>
                </div>
              ))}
            </dl>
            <div className="mt-4">
              <Serit dogru={dogruSayisi} yanlis={yanlisSayisi} bos={bosSayisi} kalin />
            </div>
          </div>
        </div>
        <p className="border-t border-primary/5 px-6 py-3 text-xs text-muted-foreground sm:px-8">
          Bu puan resmi ÖSYM puanı değildir; net üzerinden (doğru − yanlış/4) hesaplanan 100 üzerinden pratik bir deneme puanıdır.
        </p>
      </section>

      {raporuSar(
      <div className="space-y-6">
      {/* Ders karnesi */}
      <section className="rounded-3xl border border-primary/10 bg-white p-6 shadow-sm">
        <h2 className="flex items-center gap-2 font-sans text-base font-bold text-slate-900">
          <ListChecks className="h-5 w-5 text-primary" />
          Ders karnesi
        </h2>
        <ul className="mt-4 divide-y divide-primary/5">
          {karne.map((d) => (
            <li key={d.ders} className="grid grid-cols-[7rem_minmax(0,1fr)] items-center gap-x-4 gap-y-1 py-3 sm:grid-cols-[9rem_minmax(0,1fr)_9rem_6rem]">
              <span className="text-sm font-semibold text-slate-800">{DERS_LABEL[d.ders]}</span>
              <Serit dogru={d.dogru} yanlis={d.yanlis} bos={d.bos} />
              <span className="col-start-2 text-xs text-muted-foreground sm:col-start-auto">
                {d.dogru} D · {d.yanlis} Y · {d.bos} B
              </span>
              <span className="col-start-2 text-sm font-bold text-slate-900 tabular-nums sm:col-start-auto sm:text-right">
                {fmt(d.net)} net
                {onceki?.dersNetleri[d.ders] !== undefined && (
                  <span className="ml-1.5">
                    <Fark deger={d.net - onceki.dersNetleri[d.ders]!} birim="" />
                  </span>
                )}
              </span>
            </li>
          ))}
        </ul>
      </section>

      {konuSar(
      <div className="space-y-6">
      {/* Konu analizi - konusu etiketli soru varsa */}
      {gosterilenKonular.length > 0 && (
        <>
          {oncelikliler.length > 0 && (
            <section className="rounded-3xl border border-primary/10 bg-white p-6 shadow-sm">
              <h2 className="flex items-center gap-2 font-sans text-base font-bold text-slate-900">
                <Target className="h-5 w-5 text-primary" />
                Önce bunlara çalış
              </h2>
              <ol className="mt-4 grid gap-3 sm:grid-cols-3">
                {oncelikliler.map((k, i) => {
                  const stil = KONU_STIL[k.durum];
                  return (
                    <li key={`${k.ders}|${k.konu}`} className={cn("flex flex-col rounded-2xl border p-4", stil.kart)}>
                      <span className="text-xs font-bold text-muted-foreground">{i + 1}. öncelik · {DERS_LABEL[k.ders]}</span>
                      <span className="mt-1 font-semibold text-slate-900">{k.konu}</span>
                      <span className="mt-1 text-sm text-slate-600">{stil.mesaj(k.konu)}</span>
                      <button type="button" onClick={() => konuyaGit(k)} className="mt-3 self-start text-sm font-semibold text-primary hover:underline">
                        Soruları incele →
                      </button>
                    </li>
                  );
                })}
              </ol>
            </section>
          )}

          <section className="rounded-3xl border border-primary/10 bg-white p-6 shadow-sm">
            <h2 className="font-sans text-base font-bold text-slate-900">Konu analizi</h2>
            <p className="mt-1 text-sm text-muted-foreground">Bir konuya tıklayınca o konudaki sorular aşağıda vurgulanır.</p>
            <div className="mt-4 grid gap-4 lg:grid-cols-3">
              {(["kirmizi", "sari", "yesil"] as const).map((d) => {
                const stil = KONU_STIL[d];
                const liste = gosterilenKonular.filter((k) => k.durum === d);
                return (
                  <div key={d}>
                    <p className="mb-2 flex items-center gap-1.5 text-sm font-bold text-slate-800">
                      <stil.ikon className={cn("h-4 w-4", stil.ikonRenk)} />
                      {stil.baslik}
                      <span className={cn("rounded-full px-2 py-0.5 text-xs", stil.rozet)}>{liste.length}</span>
                    </p>
                    {/* ~60 konu var: uzun sutun sayfayi uzatmasin, kendi icinde kaysin (p-1: secili halka kirpilmasin). */}
                    <ul className="-m-1 max-h-[36rem] space-y-2 overflow-y-auto p-1">
                      {liste.map((k) => {
                        const eski = onceki?.konuDurumlari[`${k.ders}|${k.konu}`];
                        return (
                          <li key={`${k.ders}|${k.konu}`}>
                            <button
                              type="button"
                              onClick={() => konuyaGit(k)}
                              className={cn(
                                "w-full rounded-2xl border p-3 text-left transition-shadow hover:shadow-md",
                                stil.kart,
                                secilenKonu?.konu === k.konu && secilenKonu.ders === k.ders && "ring-2 ring-primary",
                              )}
                            >
                              <span className="flex items-start justify-between gap-2">
                                <span className="text-sm font-semibold text-slate-900">{k.konu}</span>
                                <span className="shrink-0 text-xs text-muted-foreground">{DERS_LABEL[k.ders]}</span>
                              </span>
                              <span className="mt-0.5 block text-xs text-slate-600">{stil.mesaj(k.konu)}</span>
                              <span className="mt-1.5 block text-xs font-medium text-slate-500">
                                {k.dogru} D · {k.yanlis} Y · {k.bos} B
                                {eski && eski !== d && <> · geçen sefer {DURUM_ADI[eski]}</>}
                              </span>
                            </button>
                          </li>
                        );
                      })}
                      {liste.length === 0 && <li className="text-xs text-muted-foreground">Bu grupta konu yok.</li>}
                    </ul>
                  </div>
                );
              })}
            </div>
          </section>
        </>
      )}
      <GelisimBolumu gelisim={konuKilitli ? ORNEK_GELISIM : gelisim} />
      </div>,
      )}

      {/* Soru inceleme */}
      <div ref={incelemeAlani} className="scroll-mt-24">
        {secilenKonu ? (
          <p className="mb-2 flex flex-wrap items-center gap-2 text-sm font-medium text-slate-700">
            <span className="rounded-full bg-primary/10 px-3 py-1 text-primary">
              {secilenKonu.konu} · {secilenKonu.toplam} soru haritada vurgulandı
            </span>
            <button type="button" onClick={() => setSecilenKonu(null)} className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-slate-900">
              <X className="h-3.5 w-3.5" /> Vurguyu kaldır
            </button>
          </p>
        ) : (
          <p className="mb-2 text-xs font-medium text-muted-foreground">Haritada bir soruya tıklayarak doğru cevabı ve açıklamasını görebilirsin.</p>
        )}
        <div className="lg:grid lg:grid-cols-[minmax(0,1fr)_17rem] lg:items-start lg:gap-4">
          <div className="rounded-3xl border border-primary/10 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>
                Soru {incelenenIndex + 1} / {sorular.length}
              </span>
              <span className="flex flex-wrap justify-end gap-1.5">
                {incelenen.konu && <span className="rounded-full bg-slate-100 px-2.5 py-0.5 font-medium text-slate-600">{incelenen.konu}</span>}
                <span className="rounded-full bg-primary/10 px-2.5 py-0.5 font-medium text-primary">{DERS_LABEL[incelenen.ders]}</span>
              </span>
            </div>
            <SoruGovdesi sorular={sorular} index={incelenenIndex} />
            <div className="mt-4 space-y-2">
              {incelenen.secenekler.map((secenek, i) => {
                const dogruMu = i === incelenen.dogruCevap;
                const verilenMi = i === verilenCevap;
                return (
                  <div
                    key={i}
                    className={`flex items-center gap-2.5 rounded-lg border px-3.5 py-2.5 text-sm ${
                      dogruMu
                        ? "border-emerald-500 bg-emerald-50 text-emerald-800"
                        : verilenMi
                          ? "border-red-500 bg-red-50 text-red-800"
                          : "border-primary/10 text-slate-600"
                    }`}
                  >
                    <span className="font-semibold">{String.fromCharCode(65 + i)})</span>
                    <span className="flex-1">
                      <KesirliMetin metin={secenek} />
                    </span>
                    {dogruMu && <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600" />}
                    {!dogruMu && verilenMi && <XCircle className="h-4 w-4 shrink-0 text-red-600" />}
                  </div>
                );
              })}
              {verilenCevap === undefined && (
                <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <MinusCircle className="h-3.5 w-3.5" /> Bu soruyu boş bıraktın.
                </p>
              )}
            </div>
            {incelenen.aciklama && (
              <p className="mt-3 rounded-lg bg-slate-50 p-3 text-sm text-slate-600">
                <KesirliMetin metin={incelenen.aciklama} />
              </p>
            )}
          </div>
          <aside className="mt-4 lg:sticky lg:top-20 lg:mt-0 lg:max-h-[calc(100vh-6rem)] lg:overflow-y-auto">
            <SoruHaritasi
              sorular={sorular}
              aktifIndex={incelenenIndex}
              onSec={setIncelenenIndex}
              butonSinifi={(i) =>
                cn(
                  DURUM_SINIFI[durum(sorular[i])],
                  secilenKonu && !secilenKonu.soruIdler.includes(sorular[i].id) && "opacity-25",
                )
              }
              aciklamalar={[
                { etiket: "Doğru", sinif: DURUM_SINIFI.dogru },
                { etiket: "Yanlış", sinif: DURUM_SINIFI.yanlis },
                { etiket: "Boş", sinif: DURUM_SINIFI.bos },
              ]}
            />
          </aside>
        </div>
      </div>
      </div>,
      )}

      <p className="text-center text-sm">
        <Link href="/kpss-denemesi" className="font-semibold text-primary hover:underline">
          ← Deneme sayfasına dön
        </Link>
      </p>
    </div>
  );
}

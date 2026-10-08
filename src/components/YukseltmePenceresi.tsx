"use client";

import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from "react";
import Image from "next/image";
import Link from "next/link";
import { BellRing, Check, CheckCircle2, Crown, Loader2, Minus, ShieldCheck, Sparkles, X } from "lucide-react";
import { useAuthModal } from "@/components/AuthModal";
import {
  KAYNAK_METNI,
  KARSILASTIRMA,
  PLAN_ADI,
  PLAN_FIYATI,
  tl,
  yillikBedavaAy,
  yillikTasarruf,
  type Plan,
  type UcretliPlan,
  type YukseltmeKaynagi,
} from "@/lib/planlar";
import { cn } from "@/lib/utils";

type Ac = (secenek?: { plan?: UcretliPlan; kaynak?: YukseltmeKaynagi }) => void;
const YukseltmeContext = createContext<Ac | null>(null);

/** Herhangi bir yerden uyelik yukseltme penceresini acmak icin. */
export function useYukseltme(): Ac {
  const ctx = useContext(YukseltmeContext);
  if (!ctx) throw new Error("useYukseltme, YukseltmeProvider icinde kullanilmali.");
  return ctx;
}

/** Sunucu bilesenlerinde kullanilabilen yukseltme butonu. */
export function YukseltButonu({
  plan,
  kaynak,
  className,
  children,
}: {
  plan?: UcretliPlan;
  kaynak?: YukseltmeKaynagi;
  className?: string;
  children: ReactNode;
}) {
  const ac = useYukseltme();
  return (
    <button type="button" onClick={() => ac({ plan, kaynak })} className={className}>
      {children}
    </button>
  );
}

const EK = { PRO: "'ya", PRO_PLUS: "'ya" } as const; // "Pro'ya", "Pro+'ya"

// Secili plana gore sol panel ve buton renkleri.
const TEMA: Record<UcretliPlan, { zemin: string; buton: string; halka: string; metin: string; acik: string }> = {
  PRO: {
    zemin: "from-blue-600 via-indigo-600 to-sky-500",
    buton: "from-blue-600 to-indigo-600 shadow-blue-600/30",
    halka: "ring-blue-500",
    metin: "text-blue-700",
    acik: "bg-blue-50",
  },
  PRO_PLUS: {
    zemin: "from-violet-600 via-fuchsia-600 to-indigo-700",
    buton: "from-violet-600 to-fuchsia-600 shadow-violet-600/30",
    halka: "ring-violet-500",
    metin: "text-violet-700",
    acik: "bg-violet-50",
  },
};

type Ozet = {
  girisli: boolean;
  plan: Plan | null;
  talep: { plan: UcretliPlan; yillik: boolean } | null;
  aktifIlan: number;
  haftalikDeneme: number;
};

export function YukseltmeProvider({ children }: { children: ReactNode }) {
  const [acik, setAcik] = useState<{ plan?: UcretliPlan; kaynak: YukseltmeKaynagi } | null>(null);
  const ac = useCallback<Ac>((s) => setAcik({ plan: s?.plan, kaynak: s?.kaynak ?? "genel" }), []);
  return (
    <YukseltmeContext.Provider value={ac}>
      {children}
      {/* key: her acilista durum sifirlanir (secili plan, basari ekrani). */}
      {acik && <Pencere key={`${acik.kaynak}-${acik.plan}`} baslangicPlani={acik.plan} kaynak={acik.kaynak} kapat={() => setAcik(null)} />}
    </YukseltmeContext.Provider>
  );
}

function Pencere({ baslangicPlani, kaynak, kapat }: { baslangicPlani?: UcretliPlan; kaynak: YukseltmeKaynagi; kapat: () => void }) {
  const authAc = useAuthModal();
  const [ozet, setOzet] = useState<Ozet | null>(null);
  const [secilen, setSecilen] = useState<UcretliPlan>(baslangicPlani ?? "PRO_PLUS");
  const [yillik, setYillik] = useState(false);
  const [durum, setDurum] = useState<"bos" | "gonderiliyor" | "tamam">("bos");
  const [hata, setHata] = useState<string | null>(null);

  useEffect(() => {
    let iptal = false;
    fetch("/api/yukseltme-talebi")
      .then((r) => r.json())
      .then((o: Ozet) => {
        if (iptal) return;
        setOzet(o);
        if (o.plan === "PRO") setSecilen("PRO_PLUS"); // Pro'nun yukselebilecegi tek plan
      })
      .catch(() => {});
    return () => {
      iptal = true;
    };
  }, []);

  useEffect(() => {
    const tus = (e: KeyboardEvent) => e.key === "Escape" && kapat();
    document.addEventListener("keydown", tus);
    const eskiTasma = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", tus);
      document.body.style.overflow = eskiTasma;
    };
  }, [kapat]);

  const tema = TEMA[secilen];
  const metin = KAYNAK_METNI[kaynak];
  const mevcut = ozet?.plan ?? null;
  const zatenListede = ozet?.talep?.plan === secilen && ozet.talep.yillik === yillik;

  async function haberVer() {
    setDurum("gonderiliyor");
    setHata(null);
    try {
      const res = await fetch("/api/yukseltme-talebi", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan: secilen, yillik, kaynak }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Kaydedilemedi.");
      setDurum("tamam");
    } catch (e) {
      setHata(e instanceof Error ? e.message : "Bir hata oluştu.");
      setDurum("bos");
    }
  }

  return (
    <div
      className="fixed inset-0 z-[200] flex items-end justify-center bg-slate-950/70 backdrop-blur-sm sm:items-center sm:p-4"
      onClick={(e) => e.target === e.currentTarget && kapat()}
      role="dialog"
      aria-modal="true"
      aria-labelledby="yukseltme-baslik"
    >
      <div className="animate-yukselt-ac relative grid max-h-[94vh] w-full max-w-4xl overflow-hidden rounded-t-3xl bg-white shadow-2xl sm:rounded-3xl md:grid-cols-[minmax(0,5fr)_minmax(0,7fr)]">
        <button
          type="button"
          onClick={kapat}
          aria-label="Kapat"
          className="absolute top-3 right-3 z-20 flex h-8 w-8 items-center justify-center rounded-full bg-white/90 text-slate-600 shadow-md transition-colors hover:text-slate-900"
        >
          <X className="h-4 w-4" />
        </button>

        {/* Sol: plan renginde canli panel */}
        <div className="relative overflow-hidden px-6 pt-8 pb-6 text-white md:p-8">
          {(["PRO", "PRO_PLUS"] as const).map((p) => (
            <div
              key={p}
              aria-hidden
              className={cn("absolute inset-0 bg-gradient-to-br transition-opacity duration-500", TEMA[p].zemin, secilen === p ? "opacity-100" : "opacity-0")}
            />
          ))}
          <div aria-hidden className="absolute inset-0 opacity-20 [background-image:radial-gradient(circle,white_1px,transparent_1.5px)] [background-size:18px_18px]" />
          <Image
            src="/brand/kamu-yolu-emblem.png"
            alt=""
            width={420}
            height={420}
            className="pointer-events-none absolute -right-16 -bottom-16 h-72 w-72 opacity-10 brightness-0 invert"
          />
          <div className="relative">
            <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/15 shadow-[0_0_40px_rgba(255,255,255,0.35)] ring-1 ring-white/30">
              <Crown className="animate-tac-suzul h-7 w-7 text-amber-300" />
            </span>
            <p className="mt-5 text-xs font-bold tracking-widest text-white/75 uppercase">Kamu Yolu {PLAN_ADI[secilen]}</p>
            <h2 id="yukseltme-baslik" className="mt-1 font-sans text-2xl font-bold tracking-tight md:text-3xl">
              {metin.baslik}
            </h2>
            <p className="mt-2 text-sm text-white/85">{metin.alt}</p>

            {/* Gercek sayilar (uydurma yorum/kullanici sayisi yok) */}
            <div className="mt-5 flex flex-wrap gap-2 text-xs font-semibold">
              {ozet ? (
                <>
                  <span className="rounded-full bg-white/15 px-3 py-1 ring-1 ring-white/25">Şu an {ozet.aktifIlan.toLocaleString("tr-TR")} aktif kamu ilanı</span>
                  {/* Kucuk sayi sosyal kanit degil, tersine calisir: anlamli olunca goster. */}
                  {ozet.haftalikDeneme >= 50 && (
                    <span className="rounded-full bg-white/15 px-3 py-1 ring-1 ring-white/25">
                      Bu hafta {ozet.haftalikDeneme.toLocaleString("tr-TR")} KPSS denemesi çözüldü
                    </span>
                  )}
                </>
              ) : (
                <span className="h-6 w-48 animate-pulse rounded-full bg-white/15" />
              )}
            </div>

            <ul className="mt-6 hidden space-y-2 text-sm text-white/90 md:block">
              {["İstediğin an iptal et", "İptal edersen dönem sonuna kadar kullanmaya devam edersin", "Kart bilgilerin bizde saklanmaz"].map((g) => (
                <li key={g} className="flex items-start gap-2">
                  <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-emerald-300" />
                  {g}
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Sag: plan secimi, karsilastirma, eylem */}
        <div className="overflow-y-auto p-5 md:p-7">
          {durum === "tamam" ? (
            <div className="flex min-h-80 flex-col items-center justify-center text-center">
              <span className={cn("flex h-16 w-16 items-center justify-center rounded-full", tema.acik)}>
                <CheckCircle2 className={cn("h-9 w-9", tema.metin)} />
              </span>
              <p className="mt-4 font-sans text-xl font-bold text-slate-900">Harika, yerin ayrıldı!</p>
              <p className="mt-2 max-w-sm text-sm text-slate-600">
                Ödeme altyapımız açıldığında <strong>{PLAN_ADI[secilen]} · {yillik ? "yıllık" : "aylık"}</strong> için ilk sana e-posta
                göndereceğiz.
              </p>
              <button type="button" onClick={kapat} className="mt-6 rounded-full bg-slate-900 px-6 py-2.5 text-sm font-semibold text-white hover:bg-slate-800">
                Tamam
              </button>
            </div>
          ) : (
            <>
              <p className="flex items-center gap-2 rounded-2xl bg-amber-50 px-3.5 py-2.5 text-xs font-medium text-amber-800">
                <Sparkles className="h-4 w-4 shrink-0" />
                Ödeme altyapımız çok yakında açılıyor. Şimdi yerini ayır, açıldığında ilk sen haberdar ol.
              </p>

              {/* Aylik / Yillik */}
              <div className="mt-4 flex justify-center">
                <div className="inline-flex rounded-full bg-slate-100 p-1 text-sm font-semibold">
                  {[false, true].map((y) => (
                    <button
                      key={String(y)}
                      type="button"
                      onClick={() => setYillik(y)}
                      className={cn("relative rounded-full px-5 py-1.5 transition-all", yillik === y ? "bg-white text-slate-900 shadow" : "text-slate-500")}
                    >
                      {y ? "Yıllık" : "Aylık"}
                      {y && (
                        <span className="absolute -top-2.5 -right-3 rounded-full bg-emerald-500 px-1.5 py-0.5 text-[10px] font-bold text-white">
                          {yillikBedavaAy} ay bedava
                        </span>
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* Plan kartlari */}
              <div className="mt-5 grid grid-cols-2 gap-3">
                {(["PRO", "PRO_PLUS"] as const).map((p) => {
                  const f = PLAN_FIYATI[p];
                  const sahip = mevcut === p || (mevcut === "PRO_PLUS" && p === "PRO");
                  const secili = secilen === p && !sahip;
                  const kart = (
                    <button
                      type="button"
                      disabled={sahip}
                      onClick={() => setSecilen(p)}
                      className={cn(
                        "relative flex h-full w-full flex-col rounded-[1.1rem] bg-white p-4 text-left transition-all",
                        secili ? cn("ring-2", TEMA[p].halka) : "ring-1 ring-slate-200 hover:ring-slate-300",
                        sahip && "cursor-not-allowed opacity-60",
                      )}
                    >
                      <span className="flex items-center justify-between">
                        <span className="font-sans font-bold text-slate-900">{PLAN_ADI[p]}</span>
                        <span
                          className={cn(
                            "flex h-5 w-5 items-center justify-center rounded-full border-2",
                            secili ? cn("border-transparent bg-gradient-to-br text-white", TEMA[p].buton) : "border-slate-300",
                          )}
                        >
                          {secili && <Check className="h-3 w-3" />}
                        </span>
                      </span>
                      <span className="mt-2 font-sans text-2xl font-bold text-slate-900 tabular-nums">
                        {tl(yillik ? f.yillik : f.aylik)}
                        <span className="text-xs font-medium text-muted-foreground"> / {yillik ? "yıl" : "ay"}</span>
                      </span>
                      <span className={cn("mt-1 text-xs font-semibold", TEMA[p].metin)}>
                        {yillik
                          ? `Aylık ${tl(f.yillik / 12)}'ye denk · %${yillikTasarruf(p)} tasarruf`
                          : `Günde ${tl(f.aylik / 30)}, bir çaydan ucuz`}
                      </span>
                      {sahip && <span className="mt-2 text-xs font-semibold text-slate-500">Mevcut planın</span>}
                    </button>
                  );
                  // Pro+ karti akan renkli cerceveyle one cikar.
                  return p === "PRO_PLUS" ? (
                    <div key={p} className="relative rounded-[1.25rem] bg-gradient-to-r from-violet-500 via-fuchsia-500 to-amber-400 p-[2px] animate-cerceve-akis">
                      <span className="absolute -top-2.5 left-1/2 z-10 -translate-x-1/2 rounded-full bg-gradient-to-r from-violet-600 to-fuchsia-600 px-2.5 py-0.5 text-[10px] font-bold whitespace-nowrap text-white shadow">
                        En çok değer
                      </span>
                      {kart}
                    </div>
                  ) : (
                    <div key={p} className="p-[2px]">
                      {kart}
                    </div>
                  );
                })}
              </div>

              {/* Karsilastirma: tiklanan ozellik satiri vurgulu */}
              <div className="mt-5 overflow-hidden rounded-2xl border border-slate-200">
                <div className="grid grid-cols-[minmax(0,1fr)_3.5rem_3.5rem_3.5rem] bg-slate-50 px-3 py-2 text-[11px] font-bold text-slate-500">
                  <span>Özellik</span>
                  {(["UCRETSIZ", "PRO", "PRO_PLUS"] as const).map((p) => (
                    <span key={p} className={cn("text-center", p === secilen && TEMA[secilen].metin)}>
                      {p === "UCRETSIZ" ? "Ücretsiz" : PLAN_ADI[p]}
                    </span>
                  ))}
                </div>
                {KARSILASTIRMA.map((s) => {
                  const vurgulu = s.kaynak === kaynak;
                  return (
                    <div
                      key={s.ozellik}
                      className={cn(
                        "grid grid-cols-[minmax(0,1fr)_3.5rem_3.5rem_3.5rem] items-center border-t border-slate-100 px-3 py-1.5 text-xs",
                        vurgulu && "bg-amber-50",
                      )}
                    >
                      <span className="text-slate-700">
                        {s.ozellik}
                        {vurgulu && <span className="ml-1.5 rounded-full bg-amber-200 px-1.5 py-px text-[10px] font-bold text-amber-900">bunun için buradasın</span>}
                      </span>
                      {(["UCRETSIZ", "PRO", "PRO_PLUS"] as const).map((p) => {
                        const d = s.degerler[p];
                        return (
                          <span key={p} className={cn("flex justify-center", p === secilen && cn("rounded", TEMA[secilen].acik))}>
                            {typeof d === "string" ? (
                              <span className="font-bold text-slate-800">{d}</span>
                            ) : d ? (
                              <Check className={cn("h-4 w-4", p === "UCRETSIZ" ? "text-slate-400" : TEMA[secilen].metin)} />
                            ) : (
                              <Minus className="h-4 w-4 text-slate-300" />
                            )}
                          </span>
                        );
                      })}
                    </div>
                  );
                })}
              </div>

              {/* Eylem */}
              <div className="mt-5">
                {mevcut === "PRO_PLUS" ? (
                  <p className={cn("flex items-center justify-center gap-2 rounded-2xl px-5 py-3.5 text-sm font-semibold", tema.acik, tema.metin)}>
                    <Crown className="h-5 w-5" />
                    Zaten en kapsamlı plan olan Pro+&apos;dasın.
                  </p>
                ) : ozet && !ozet.girisli ? (
                  <button
                    type="button"
                    onClick={() => {
                      kapat();
                      authAc("kayit");
                    }}
                    className={cn("flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r px-5 py-3.5 text-base font-bold text-white shadow-lg transition-transform hover:scale-[1.01]", tema.buton)}
                  >
                    Önce ücretsiz hesabını oluştur
                  </button>
                ) : zatenListede ? (
                  <p className={cn("flex items-center justify-center gap-2 rounded-2xl px-5 py-3.5 text-sm font-semibold", tema.acik, tema.metin)}>
                    <CheckCircle2 className="h-5 w-5" />
                    Bu seçim için zaten listedesin; ödeme açılınca haber vereceğiz.
                  </p>
                ) : (
                  <button
                    type="button"
                    onClick={haberVer}
                    disabled={durum === "gonderiliyor" || !ozet}
                    className={cn(
                      "flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r px-5 py-3.5 text-base font-bold text-white shadow-lg transition-transform hover:scale-[1.01] disabled:opacity-70",
                      tema.buton,
                    )}
                  >
                    {durum === "gonderiliyor" ? <Loader2 className="h-5 w-5 animate-spin" /> : <BellRing className="h-5 w-5" />}
                    {PLAN_ADI[secilen]}
                    {EK[secilen]} geç · Açılınca haber ver
                  </button>
                )}
                {hata && <p className="mt-2 text-center text-sm text-destructive">{hata}</p>}
                <button type="button" onClick={kapat} className="mt-2 w-full py-1.5 text-sm font-medium text-muted-foreground hover:text-slate-800">
                  Şimdi değil
                </button>
                <p className="mt-2 text-center text-[11px] text-muted-foreground">
                  Ödeme açıldığında{" "}
                  <Link href="/on-bilgilendirme-formu" onClick={kapat} className="underline">
                    Ön Bilgilendirme Formu
                  </Link>{" "}
                  ve{" "}
                  <Link href="/mesafeli-satis-sozlesmesi" onClick={kapat} className="underline">
                    Mesafeli Satış Sözleşmesi
                  </Link>{" "}
                  onayın ayrıca alınır. Fiyatlar KDV dahildir.
                </p>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { ArrowLeftRight, BellRing, CalendarClock, Check, Crown, Flame, GraduationCap, Infinity as Sonsuz, Sparkles, TrendingUp, X } from "lucide-react";
import { useYukseltme } from "@/components/YukseltmePenceresi";
import { kalanSureMetni, tl, type FiyatTablosu, type KampanyaOzeti, type Plan, type UcretliPlan, type YukseltmeKaynagi } from "@/lib/planlar";
import { cn } from "@/lib/utils";

type Veri = {
  plan: Plan | null;
  aktifIlan: number;
  haftalikDeneme: number;
  becayisTalep: number;
  fiyat: { tablo: FiyatTablosu; kampanya: KampanyaOzeti };
  bolum: { ad: string; aktif: number; buHafta: number; yakindaBiten: number } | null;
};

// Kullanicinin istegi: her sayfada, sekme gorunurken 10 sn gezindikten sonra; sonra 10 dk'da bir.
const ARALIK_MS = 10 * 60_000;
const GEZINME_SN = 10;
const SON_ANAHTAR = "kyTanitimSon";
const SIRA_ANAHTAR = "kyTanitimSira";
// Sinav ekrani, admin, giris/sifre akislari ve zaten plan sayfasi: pencere burada kesintiye yol acar.
const HARIC = [/^\/admin/, /^\/kpss-denemesi\/[^/]+/, /^\/giris/, /^\/kayit-ol/, /^\/sifre/, /^\/profilim\/abonelik/];
const DONUSUM: YukseltmeKaynagi[] = ["tanitim-ilan", "tanitim-kpss", "tanitim-becayis"];

// localStorage gizli modda/engellenmisse atabilir; o zaman bellekte tutulur (sayfa yenilenince sifirlanir).
const bellek: Record<string, string> = {};
const oku = (k: string) => {
  try {
    return localStorage.getItem(k) ?? bellek[k] ?? null;
  } catch {
    return bellek[k] ?? null;
  }
};
const yaz = (k: string, v: string) => {
  bellek[k] = v;
  try {
    localStorage.setItem(k, v);
  } catch {}
};

const sayi = (n: number) => n.toLocaleString("tr-TR");

/**
 * Periyodik Pro / Pro+ tanitim penceresi (yalniz site). Misafir ve ucretsiz uye iki plani,
 * Pro uye yalniz Pro+'i gorur; Pro+ uyeye layout bu bileseni hic koymaz. Buton mevcut yukseltme
 * penceresini (haber ver / giris / plan secimi) secilen planla acar.
 */
export function YukseltmeTanitimi() {
  const yukseltmeAc = useYukseltme();
  const pathname = usePathname();
  const yolRef = useRef(pathname);
  const [acik, setAcik] = useState<{ veri: Veri; kaynak: YukseltmeKaynagi } | null>(null);
  const acikRef = useRef(false);

  useEffect(() => {
    yolRef.current = pathname;
  }, [pathname]);

  useEffect(() => {
    let gorunurSn = 0;
    let bekliyor = false;
    // En az bir etkilesim (kaydirma/tiklama/tus) beklenir: tarayici "en buyuk icerik" (LCP) olcumunu
    // ilk etkilesimde kapatir; aksi halde 10. sn'de acilan pencere sayfanin LCP'si sayilir, SEO puani duser.
    let etkilesim = false;
    const isaretle = () => (etkilesim = true);
    const olaylar = ["pointerdown", "keydown", "scroll", "wheel", "touchstart"] as const;
    for (const o of olaylar) window.addEventListener(o, isaretle, { passive: true, once: true });
    const t = setInterval(async () => {
      if (document.hidden) return;
      gorunurSn++;
      if (gorunurSn < GEZINME_SN || !etkilesim || acikRef.current || bekliyor) return;
      if (HARIC.some((r) => r.test(yolRef.current))) return;
      if (document.querySelector('[aria-modal="true"]')) return; // baska pencere acikken araya girme
      if (Date.now() - Number(oku(SON_ANAHTAR) ?? 0) < ARALIK_MS) return;
      bekliyor = true;
      // Istekten once yazilir: veri alinamazsa her saniye yeniden istek atilmasin, 10 dk sonra tekrar denenir.
      yaz(SON_ANAHTAR, String(Date.now()));
      try {
        const veri: Veri = await fetch("/api/yukseltme-tanitim").then((r) => (r.ok ? r.json() : Promise.reject()));
        if (veri.plan === "PRO_PLUS") return;
        const sira = Number(oku(SIRA_ANAHTAR) ?? 0);
        yaz(SIRA_ANAHTAR, String(sira + 1));
        acikRef.current = true;
        setAcik({ veri, kaynak: veri.plan === "PRO" ? "tanitim-proplus" : DONUSUM[sira % DONUSUM.length] });
      } catch {
        // Veri alinamadi: bu tur atlanir.
      } finally {
        bekliyor = false;
      }
    }, 1000);
    return () => {
      clearInterval(t);
      for (const o of olaylar) window.removeEventListener(o, isaretle);
    };
  }, []);

  function kapat() {
    acikRef.current = false;
    setAcik(null);
  }

  if (!acik) return null;
  return (
    <Pencere
      veri={acik.veri}
      kaynak={acik.kaynak}
      kapat={kapat}
      sec={(plan) => {
        kapat();
        yukseltmeAc({ plan, kaynak: acik.kaynak });
      }}
    />
  );
}

/** Donusumlu manset: her biri gercek sayilarla; sayi anlamsiz kucukse sayisiz metin. */
function manset(v: Veri, kaynak: YukseltmeKaynagi): { ust: string; baslik: ReactNode; alt: string; cipler: { ikon: typeof Flame; metin: string }[] } {
  const vurgu = (s: ReactNode) => <span className="bg-gradient-to-r from-amber-200 to-yellow-100 bg-clip-text text-transparent">{s}</span>;
  if (kaynak === "tanitim-proplus") {
    return {
      ust: "Pro'dan bir adım öteye",
      baslik: <>Sınırsız hazırlığa {vurgu("Pro+ ile")} geç</>,
      alt: "Haftalık deneme sınırı kalkar, her konuda nerede olduğunu ve gelişimini görürsün.",
      cipler: [
        ...(v.haftalikDeneme >= 50 ? [{ ikon: TrendingUp, metin: `Bu hafta ${sayi(v.haftalikDeneme)} deneme çözüldü` }] : []),
        { ikon: Sonsuz, metin: "Sınırsız KPSS denemesi" },
      ],
    };
  }
  if (kaynak === "tanitim-kpss") {
    return {
      ust: "KPSS hazırlığı",
      baslik: v.haftalikDeneme >= 50 ? <>Bu hafta {vurgu(`${sayi(v.haftalikDeneme)} deneme`)} çözüldü. Sen ne durumdasın?</> : <>KPSS&apos;ye {vurgu("her gün")} daha güçlü hazırlan</>,
      alt: "Pro'da ders karnen ve her sorunun çözümü, Pro+'da konu bazlı değerlendirme ve gelişim takibi.",
      cipler: [
        { ikon: GraduationCap, metin: "Gerçek KPSS formatında günlük deneme" },
        { ikon: TrendingUp, metin: "Ders ders netin ve gelişimin" },
      ],
    };
  }
  if (kaynak === "tanitim-becayis") {
    return {
      ust: "Becayiş",
      baslik: v.becayisTalep > 0 ? <>{vurgu(`${sayi(v.becayisTalep)} aktif becayiş talebi`)} eşini arıyor</> : <>Becayiş eşini {vurgu("Kamu Yolu'nda")} bul</>,
      alt: "Pro ile talebini yayımla, ilgilenenlerle iletişim bilgin gizli kalarak site içinden mesajlaş.",
      cipler: [
        { ikon: ArrowLeftRight, metin: "Talep oluştur ve mesajlaş" },
        { ikon: BellRing, metin: "Mesaj gelince bildirim ve SMS" },
      ],
    };
  }
  const b = v.bolum;
  return {
    ust: b ? b.ad : "Kamu ilanları",
    baslik:
      b && b.aktif > 0 ? (
        <>
          Bölümüne uygun şu an {vurgu(`${sayi(b.aktif)} aktif ilan`)} var
        </>
      ) : (
        <>Şu an {vurgu(`${sayi(v.aktifIlan)} aktif kamu ilanı`)} var</>
      ),
    alt: "Pro ile bölümüne uygun yeni ilan çıktığı an SMS ve bildirimle herkesten önce öğren.",
    cipler: b
      ? [
          ...(b.buHafta > 0 ? [{ ikon: Sparkles, metin: `${sayi(b.buHafta)} tanesi bu hafta yayımlandı` }] : []),
          ...(b.yakindaBiten > 0 ? [{ ikon: CalendarClock, metin: `${sayi(b.yakindaBiten)} tanesinin başvurusu 7 gün içinde bitiyor` }] : []),
          ...(b.buHafta + b.yakindaBiten === 0 ? [{ ikon: BellRing, metin: "Yenisi çıkınca anında haberin olsun" }] : []),
        ]
      : [{ ikon: BellRing, metin: "Profiline bölümünü ekle, sana uygun ilanları ilk sen gör" }],
  };
}

const PLAN_KART: Record<UcretliPlan, { ad: string; rozet: string; maddeler: string[]; kart: string; buton: string; vurgu: string }> = {
  PRO: {
    ad: "Pro",
    rozet: "En popüler",
    maddeler: ["Bölümüne uygun yeni ilan çıkınca anında SMS", "Sana özel ilanlar tek listede", "Becayiş talebi oluştur ve mesajlaş", "Haftada 3 KPSS denemesi + ders karnesi ve çözümler"],
    kart: "border-blue-200 bg-gradient-to-b from-blue-50/80 to-white",
    buton: "from-blue-600 to-indigo-600 shadow-blue-600/30",
    vurgu: "text-blue-700",
  },
  PRO_PLUS: {
    ad: "Pro+",
    rozet: "En kapsamlı",
    maddeler: ["Pro'daki her şey", "Sınırsız KPSS denemesi", "Konu bazlı değerlendirme ve gelişim takibi", "Reklamsız deneyim ve öncelikli destek"],
    kart: "border-violet-300 bg-gradient-to-b from-violet-50 to-white ring-2 ring-violet-200/60",
    buton: "from-violet-600 to-fuchsia-600 shadow-violet-600/30",
    vurgu: "text-violet-700",
  },
};

function Pencere({ veri, kaynak, kapat, sec }: { veri: Veri; kaynak: YukseltmeKaynagi; kapat: () => void; sec: (p: UcretliPlan) => void }) {
  useEffect(() => {
    const tus = (e: KeyboardEvent) => e.key === "Escape" && kapat();
    document.addEventListener("keydown", tus);
    const eski = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", tus);
      document.body.style.overflow = eski;
    };
  }, [kapat]);

  const m = manset(veri, kaynak);
  const planlar: UcretliPlan[] = veri.plan === "PRO" ? ["PRO_PLUS"] : ["PRO", "PRO_PLUS"];
  const kampanya = veri.fiyat.kampanya;

  return (
    <div
      className="fixed inset-0 z-[190] flex items-end justify-center bg-slate-950/70 backdrop-blur-sm sm:items-center sm:p-4"
      onClick={(e) => e.target === e.currentTarget && kapat()}
      role="dialog"
      aria-modal="true"
      aria-labelledby="tanitim-baslik"
    >
      <div className="animate-yukselt-ac relative max-h-[94vh] w-full max-w-3xl overflow-y-auto rounded-t-3xl bg-white shadow-2xl shadow-indigo-950/40 sm:rounded-3xl">
        <button
          type="button"
          onClick={kapat}
          aria-label="Kapat"
          className="absolute top-3 right-3 z-20 flex h-9 w-9 items-center justify-center rounded-full bg-white/20 text-white ring-1 ring-white/40 backdrop-blur transition-colors hover:bg-white/30"
        >
          <X className="h-4 w-4" />
        </button>

        {/* Ust: marka renklerinde manset */}
        <div className="relative overflow-hidden bg-gradient-to-br from-indigo-700 via-blue-600 to-violet-600 px-5 pt-6 pb-5 text-white sm:px-10 sm:pt-8 sm:pb-7">
          <div aria-hidden className="absolute inset-0 opacity-20 [background-image:radial-gradient(circle,white_1px,transparent_1.5px)] [background-size:18px_18px]" />
          <div aria-hidden className="absolute -top-24 -left-16 h-64 w-64 rounded-full bg-fuchsia-400/30 blur-3xl" />
          <div aria-hidden className="absolute -right-10 -bottom-28 h-72 w-72 rounded-full bg-sky-300/30 blur-3xl" />
          <Image src="/brand/kamu-yolu-emblem.png" alt="" width={300} height={300} loading="eager" className="pointer-events-none absolute -right-10 -bottom-12 h-56 w-56 opacity-10 brightness-0 invert" />

          <div className="relative">
            <div className="flex flex-wrap items-center gap-2">
              <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/15 shadow-[0_0_40px_rgba(255,255,255,0.35)] ring-1 ring-white/30">
                <Crown className="animate-tac-suzul h-6 w-6 text-amber-300" />
              </span>
              <span className="rounded-full bg-white/15 px-3 py-1 text-[11px] font-bold tracking-widest uppercase ring-1 ring-white/25">{m.ust}</span>
              {kampanya && (
                <span className="flex items-center gap-1.5 rounded-full bg-gradient-to-r from-rose-500 to-orange-500 px-3 py-1 text-[11px] font-bold shadow-lg shadow-rose-900/30">
                  <Flame className="h-3.5 w-3.5" />
                  {kampanya.ad} · {kalanSureMetni(kampanya.kalanMs)}
                </span>
              )}
            </div>
            <h2 id="tanitim-baslik" className="mt-3 max-w-xl pr-6 font-sans text-xl leading-tight font-extrabold tracking-tight sm:mt-4 sm:text-[2rem]">
              {m.baslik}
            </h2>
            <p className="mt-1.5 max-w-xl text-[13px] text-white/85 sm:mt-2 sm:text-base">{m.alt}</p>
            <div className="mt-3 flex flex-wrap gap-1.5 sm:mt-4 sm:gap-2">
              {m.cipler.map(({ ikon: Ikon, metin }) => (
                <span key={metin} className="flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1.5 text-xs font-semibold ring-1 ring-white/20">
                  <Ikon className="h-3.5 w-3.5 text-amber-200" />
                  {metin}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Alt: plan kartlari */}
        <div className={cn("grid gap-4 p-4 pt-5 sm:p-7", planlar.length === 2 && "sm:grid-cols-2")}>
          {planlar.map((p) => {
            const k = PLAN_KART[p];
            const aylik = veri.fiyat.tablo[p].aylik;
            const yillik = veri.fiyat.tablo[p].yillik;
            return (
              <div key={p} className={cn("relative flex flex-col rounded-2xl border p-4 pt-5 shadow-sm sm:p-5 sm:pt-6", k.kart)}>
                <span className={cn("absolute -top-3 left-5 rounded-full bg-gradient-to-r px-3 py-1 text-[11px] font-bold text-white shadow-md", k.buton)}>{k.rozet}</span>
                <p className="flex items-center gap-1.5 font-sans text-lg font-extrabold text-slate-900">
                  {k.ad}
                  {p === "PRO_PLUS" && <Sparkles className="h-4 w-4 text-violet-500" />}
                </p>
                <p className="mt-1 flex items-baseline gap-1.5">
                  <span className={cn("font-sans text-3xl font-extrabold tracking-tight tabular-nums", k.vurgu)}>{tl(Math.round((aylik.odenecek / 30) * 100) / 100)}</span>
                  <span className="text-sm font-semibold text-slate-500">/ gün</span>
                </p>
                <p className="text-xs text-slate-500">
                  {aylik.odenecek < aylik.liste && <s className="mr-1">{tl(aylik.liste)}</s>}
                  aylık {tl(aylik.odenecek)} · yıllıkta günde {tl(Math.round((yillik.odenecek / 365) * 100) / 100)}
                </p>
                <ul className="mt-3 flex-1 space-y-1.5 sm:mt-4 sm:space-y-2">
                  {k.maddeler.map((md) => (
                    <li key={md} className="flex items-start gap-2 text-[13px] text-slate-700 sm:text-sm">
                      <span className={cn("mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-gradient-to-br text-white", k.buton)}>
                        <Check className="h-3 w-3" strokeWidth={3} />
                      </span>
                      {md}
                    </li>
                  ))}
                </ul>
                <button
                  type="button"
                  onClick={() => sec(p)}
                  className={cn("mt-4 w-full rounded-xl bg-gradient-to-r px-4 py-3 text-sm font-bold text-white shadow-lg transition-transform hover:scale-[1.02] active:scale-[0.99]", k.buton)}
                >
                  {k.ad}&apos;ya geç
                </button>
              </div>
            );
          })}
        </div>

        <div className="flex flex-wrap items-center justify-between gap-2 border-t border-slate-100 px-5 py-4 text-xs text-slate-500 sm:px-7">
          <p>Ödeme altyapısı çok yakında açılıyor; şimdi yerini ayır, açıldığında ilk sen haberdar ol.</p>
          <button type="button" onClick={kapat} className="font-semibold text-slate-600 hover:text-slate-900">
            Şimdi değil
          </button>
        </div>
      </div>
    </div>
  );
}

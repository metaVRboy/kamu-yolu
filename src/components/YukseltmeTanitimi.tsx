"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { SABLONLAR } from "@/lib/whatsappSablonlari";
import Image from "next/image";
import { usePathname } from "next/navigation";
import {
  ArrowLeftRight,
  BellRing,
  BriefcaseBusiness,
  CalendarClock,
  Check,
  ChevronLeft,
  ChevronRight,
  ClipboardList,
  Crown,
  Flame,
  GraduationCap,
  Headset,
  Infinity as Sonsuz,
  MessageSquareText,
  Smartphone,
  Sparkles,
  Target,
  TrendingUp,
  X,
} from "lucide-react";
import { useYukseltme } from "@/components/YukseltmePenceresi";
import { DERS_SIRASI, SINAV_SURESI_DK, TOPLAM_SORU } from "@/lib/kpssDenemeSabitler";
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
// Sinav ekrani, admin, giris/sifre akislari ve zaten plan sayfasi: pencere burada kesintiye yol acar.
const HARIC = [/^\/admin/, /^\/kpss-denemesi\/[^/]+/, /^\/giris/, /^\/kayit-ol/, /^\/sifre/, /^\/profilim\/abonelik/];
const OTOMATIK_GECIS_MS = 6000;

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

// Sekme oturumu boyunca (sessionStorage): sekme kapaninca normal siklik geri gelir.
const REKLAM_OTURUMU = "kyReklamOturumu";
function reklamOturumuMu() {
  try {
    if (/[?&](utm_source|gclid|fbclid|ttclid)=/.test(location.search)) sessionStorage.setItem(REKLAM_OTURUMU, "1");
    return !!sessionStorage.getItem(REKLAM_OTURUMU);
  } catch {
    return false;
  }
}

/**
 * Periyodik Pro / Pro+ tanitim penceresi (yalniz site). Misafir ve ucretsiz uye iki plani,
 * Pro uye yalniz Pro+'i gorur; Pro+ uyeye layout bu bileseni hic koymaz. Buton mevcut yukseltme
 * penceresini (haber ver / giris / plan secimi) secilen planla acar.
 */
export function YukseltmeTanitimi() {
  const yukseltmeAc = useYukseltme();
  const pathname = usePathname();
  const yolRef = useRef(pathname);
  const [acik, setAcik] = useState<Veri | null>(null);
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
    // Reklamdan ilk kez gelen ziyaretci once siteyi tanisin: o sekme oturumunda pencere acilmaz.
    const reklamOturumu = reklamOturumuMu();
    const t = setInterval(async () => {
      if (document.hidden || reklamOturumu) return;
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
        acikRef.current = true;
        setAcik(veri);
        fetch("/api/yukseltme-tanitim", { method: "POST" }).catch(() => {}); // gosterim sayaci
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
      veri={acik}
      kapat={kapat}
      sec={(plan, kaynak) => {
        kapat();
        yukseltmeAc({ plan, kaynak });
      }}
    />
  );
}

type Slayt = {
  kaynak: YukseltmeKaynagi; // CTA'ya basildiginda gorunen slayt kaydedilir: hangi ozellik ikna ediyor olculur
  ikon: typeof Flame;
  ust: string;
  baslik: ReactNode;
  alt: string;
  cipler: { ikon: typeof Flame; metin: string }[];
  gorsel?: ReactNode;
};

const vurgu = (s: ReactNode) => <span className="bg-gradient-to-r from-amber-200 to-yellow-100 bg-clip-text text-transparent">{s}</span>;

/**
 * Kaydirilabilir ozellik slaytlari: once SMS, sonra ilanlar, KPSS, becayis, Pro+ farki. Tum sayilar
 * gercek; anlamsiz kucukse sayisiz metin. Pro uye yalniz Pro+'in kattiklarini gorur.
 */
function slaytlar(v: Veri): Slayt[] {
  const b = v.bolum;
  const denemeCipi = v.haftalikDeneme >= 50 ? [{ ikon: TrendingUp, metin: `Bu hafta ${sayi(v.haftalikDeneme)} deneme çözüldü` }] : [];
  const konu: Slayt = {
    kaynak: "tanitim-proplus",
    ikon: Target,
    ust: "Pro+ · Konu analizi",
    baslik: <>Hangi {vurgu("konuyu")} çalışman gerektiğini gör</>,
    alt: "Her denemeden sonra konu konu nerede olduğunu ve önceki denemene göre gelişimini adım adım izle.",
    cipler: [
      { ikon: Target, metin: "Konu bazlı değerlendirme" },
      { ikon: TrendingUp, metin: "Deneme deneme gelişim takibi" },
    ],
  };
  const destek: Slayt = {
    kaynak: "tanitim-proplus",
    ikon: Headset,
    ust: "Pro+ · Öncelikli destek",
    baslik: <>Sorun olursa {vurgu("önce sen")} yanıt al</>,
    alt: "Destek talebin sıranın önüne geçer; sınırsız deneme ve konu analiziyle hazırlığın hiç yarıda kalmaz.",
    cipler: [
      { ikon: Headset, metin: "Öncelikli destek" },
      { ikon: Sonsuz, metin: "Sınırsız KPSS denemesi" },
    ],
  };
  const kpssGorsel = (
    <div className="grid grid-cols-3 gap-2">
      {[
        [String(TOPLAM_SORU), "soru"],
        [String(SINAV_SURESI_DK), "dakika"],
        [String(DERS_SIRASI.length), "ders"],
      ].map(([s, e]) => (
        <div key={e} className="rounded-2xl bg-white/15 px-3 py-2.5 text-center ring-1 ring-white/25 sm:px-4 sm:py-3">
          <p className="font-sans text-2xl font-extrabold tabular-nums sm:text-3xl">{s}</p>
          <p className="text-[11px] font-semibold text-white/75">{e}</p>
        </div>
      ))}
    </div>
  );

  if (v.plan === "PRO") {
    return [
      {
        kaynak: "tanitim-proplus",
        ikon: Sonsuz,
        ust: "Pro+ · Sınırsız deneme",
        baslik: <>Haftalık sınır yok, {vurgu("istediğin kadar")} çöz</>,
        alt: "Pro'da haftada 3 deneme hakkın var; Pro+ ile sınır kalkar, hazırlığın hiç yarıda kalmaz.",
        cipler: [...denemeCipi, { ikon: GraduationCap, metin: "Ders karnesi ve çözümler dahil" }],
        gorsel: kpssGorsel,
      },
      konu,
      destek,
    ];
  }

  // Ornek mesaj: metin whatsapp.ts'teki ILAN sablonunun aynisi; sayi bolumun bu haftaki gercek ilan sayisi.
  const ornekSayi = b && b.buHafta > 0 ? b.buHafta : 1;
  return [
    {
      kaynak: "tanitim-ilan",
      ikon: MessageSquareText,
      ust: "WhatsApp ile ilan bildirimi",
      baslik: <>Yeni ilan çıktığı an {vurgu("WhatsApp'tan")} haberin olsun</>,
      alt: "Bölümüne uygun bir ilan yayımlandığında siteye girmeni beklemeden haber veririz; başvuru süresini kaçırmazsın.",
      cipler: [
        { ikon: Smartphone, metin: "Zaten kullandığın WhatsApp'a gelir" },
        { ikon: BellRing, metin: "Site içi bildirim de gelir" },
      ],
      gorsel: (
        <div className="w-full max-w-xs rounded-2xl bg-white/95 p-3 text-slate-800 shadow-xl shadow-indigo-950/30 ring-1 ring-white/60">
          <div className="flex items-center gap-2 text-[11px] text-slate-500">
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#25D366] text-white">
              <MessageSquareText className="h-3 w-3" />
            </span>
            <b className="text-slate-700">Kamu Yolu</b>
            <span className="ml-auto">örnek</span>
          </div>
          <p className="mt-1.5 text-[13px] leading-snug">
            {SABLONLAR.ILAN.govde.replace("{{1}}", String(ornekSayi))}
          </p>
          <p className="mt-2 border-t border-slate-200 pt-1.5 text-center text-[13px] font-semibold text-[#027eb5]">{SABLONLAR.ILAN.buton.metin}</p>
        </div>
      ),
    },
    {
      kaynak: "tanitim-ilan",
      ikon: BriefcaseBusiness,
      ust: b ? `Sana özel ilanlar · ${b.ad}` : "Sana özel ilanlar",
      baslik:
        b && b.aktif > 0 ? (
          <>
            Bölümüne uygun şu an {vurgu(`${sayi(b.aktif)} aktif ilan`)} var
          </>
        ) : (
          <>Şu an {vurgu(`${sayi(v.aktifIlan)} aktif kamu ilanı`)} var</>
        ),
      alt: "Bölümüne ve öğrenim düzeyine uygun ilanlar tek listede; yüzlerce ilan arasında kaybolmazsın.",
      cipler: b
        ? [
            ...(b.buHafta > 0 ? [{ ikon: Sparkles, metin: `${sayi(b.buHafta)} tanesi bu hafta yayımlandı` }] : []),
            ...(b.yakindaBiten > 0 ? [{ ikon: CalendarClock, metin: `${sayi(b.yakindaBiten)} tanesinin başvurusu 7 gün içinde bitiyor` }] : []),
            ...(b.buHafta + b.yakindaBiten === 0 ? [{ ikon: BellRing, metin: "Yenisi çıkınca anında haberin olsun" }] : []),
          ]
        : [{ ikon: BellRing, metin: "Profiline bölümünü ekle, sana uygun ilanları ilk sen gör" }],
    },
    {
      kaynak: "tanitim-kpss",
      ikon: GraduationCap,
      ust: "KPSS denemeleri",
      baslik: v.haftalikDeneme >= 50 ? <>Bu hafta {vurgu(`${sayi(v.haftalikDeneme)} deneme`)} çözüldü. Sen ne durumdasın?</> : <>KPSS&apos;ye {vurgu("gerçek formatta")} hazırlan</>,
      alt: "Pro'da haftada 3 deneme, ders ders netin ve her sorunun açıklamalı çözümü; Pro+'da sınırsız deneme.",
      cipler: [
        { ikon: ClipboardList, metin: "Ders karnesi ve çözümler" },
        { ikon: Sonsuz, metin: "Pro+ ile sınırsız" },
      ],
      gorsel: kpssGorsel,
    },
    {
      kaynak: "tanitim-becayis",
      ikon: ArrowLeftRight,
      ust: "Becayiş",
      baslik: v.becayisTalep > 0 ? <>{vurgu(`${sayi(v.becayisTalep)} aktif becayiş talebi`)} eşini arıyor</> : <>Becayiş eşini {vurgu("Kamu Yolu'nda")} bul</>,
      alt: "Talebini yayımla, ilgilenenlerle iletişim bilgin gizli kalarak site içinden mesajlaş.",
      cipler: [
        { ikon: ArrowLeftRight, metin: "Talep oluştur ve mesajlaş" },
        { ikon: BellRing, metin: "Mesaj gelince bildirim ve WhatsApp" },
      ],
    },
    konu,
    destek,
  ];
}

const PLAN_KART: Record<UcretliPlan, { ad: string; rozet: string; maddeler: string[]; kart: string; buton: string; vurgu: string }> = {
  PRO: {
    ad: "Pro",
    rozet: "Önerilen", // satis yokken "en populer" ispatlanamaz bir iddia
    maddeler: ["Bölümüne uygun yeni ilan çıkınca anında WhatsApp mesajı", "Sana özel ilanlar tek listede", "Becayiş talebi oluştur ve mesajlaş", "Haftada 3 KPSS denemesi + ders karnesi ve çözümler"],
    kart: "border-blue-200 bg-gradient-to-b from-blue-50/80 to-white",
    buton: "from-blue-600 to-indigo-600 shadow-blue-600/30",
    vurgu: "text-blue-700",
  },
  PRO_PLUS: {
    ad: "Pro+",
    rozet: "En kapsamlı",
    maddeler: ["Pro'daki her şey", "Sınırsız KPSS denemesi", "Konu bazlı değerlendirme ve gelişim takibi", "Öncelikli destek"],
    kart: "border-violet-300 bg-gradient-to-b from-violet-50 to-white ring-2 ring-violet-200/60",
    buton: "from-violet-600 to-fuchsia-600 shadow-violet-600/30",
    vurgu: "text-violet-700",
  },
};

/** Seridi i. slayta kaydirir; sondan sonra basa, bastan once sona sarar. */
const kaydir = (el: HTMLDivElement | null, i: number, n: number) => el?.scrollTo({ left: ((i + n) % n) * el.clientWidth, behavior: "smooth" });

function Pencere({ veri, kapat, sec }: { veri: Veri; kapat: () => void; sec: (p: UcretliPlan, k: YukseltmeKaynagi) => void }) {
  const slayt = slaytlar(veri);
  const [aktif, setAktif] = useState(0);
  const [durdu, setDurdu] = useState(false);
  const seritRef = useRef<HTMLDivElement>(null);
  const git = (i: number) => kaydir(seritRef.current, i, slayt.length);

  // Kullanici dokunana kadar slaytlar kendiliginden doner; hareket azaltma tercihinde hic donmez.
  useEffect(() => {
    if (durdu || matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const t = setTimeout(() => kaydir(seritRef.current, aktif + 1, slayt.length), OTOMATIK_GECIS_MS);
    return () => clearTimeout(t);
  }, [durdu, aktif, slayt.length]);

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

        {/* Ust: marka renklerinde, kaydirilabilir ozellik slaytlari. Ilk dokunusta otomatik gecis durur. */}
        <div
          className="relative overflow-hidden bg-gradient-to-br from-indigo-700 via-blue-600 to-violet-600 pt-6 pb-4 text-white sm:pt-8 sm:pb-5"
          onPointerDown={() => setDurdu(true)}
          onWheel={() => setDurdu(true)}
          onTouchStart={() => setDurdu(true)}
          onKeyDown={() => setDurdu(true)}
        >
          <div aria-hidden className="absolute inset-0 opacity-20 [background-image:radial-gradient(circle,white_1px,transparent_1.5px)] [background-size:18px_18px]" />
          <div aria-hidden className="absolute -top-24 -left-16 h-64 w-64 rounded-full bg-fuchsia-400/30 blur-3xl" />
          <div aria-hidden className="absolute -right-10 -bottom-28 h-72 w-72 rounded-full bg-sky-300/30 blur-3xl" />
          <Image src="/brand/kamu-yolu-emblem.png" alt="" width={300} height={300} loading="eager" className="pointer-events-none absolute -right-10 -bottom-12 h-56 w-56 opacity-10 brightness-0 invert" />

          <div className="relative flex flex-wrap items-center gap-2 px-5 pr-14 sm:px-14">
            <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white/15 shadow-[0_0_40px_rgba(255,255,255,0.35)] ring-1 ring-white/30">
              <Crown className="animate-tac-suzul h-5 w-5 text-amber-300" />
            </span>
            <h2 id="tanitim-baslik" className="font-sans text-base font-extrabold sm:text-lg">
              {veri.plan === "PRO" ? "Pro+ ile neler kazanırsın?" : "Pro ile neler kazanırsın?"}
            </h2>
            {kampanya && (
              <span className="flex items-center gap-1.5 rounded-full bg-gradient-to-r from-rose-500 to-orange-500 px-3 py-1 text-[11px] font-bold shadow-lg shadow-rose-900/30">
                <Flame className="h-3.5 w-3.5" />
                {kampanya.ad} · {kalanSureMetni(kampanya.kalanMs)}
              </span>
            )}
          </div>

          <div className="relative mt-4 sm:mt-5">
            <div
              ref={seritRef}
              onScroll={(e) => setAktif(Math.round(e.currentTarget.scrollLeft / e.currentTarget.clientWidth))}
              className="flex snap-x snap-mandatory overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
            >
              {slayt.map((s, i) => (
                <section key={i} aria-roledescription="slayt" aria-label={`${i + 1} / ${slayt.length}`} className="w-full shrink-0 snap-center px-5 sm:px-14">
                  <div className="grid h-full content-start gap-4 sm:content-center sm:items-center sm:grid-cols-[1fr_auto] sm:gap-6">
                    <div>
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1 text-[11px] font-bold tracking-wider uppercase ring-1 ring-white/25">
                        <s.ikon className="h-3.5 w-3.5 text-amber-200" />
                        {s.ust}
                      </span>
                      <h3 className="mt-2.5 font-sans text-xl leading-tight font-extrabold tracking-tight sm:text-[1.75rem]">{s.baslik}</h3>
                      <p className="mt-1.5 text-[13px] text-white/85 sm:mt-2 sm:text-[15px]">{s.alt}</p>
                      <div className="mt-3 flex flex-wrap gap-1.5 sm:gap-2">
                        {s.cipler.map(({ ikon: Ikon, metin }) => (
                          <span key={metin} className="flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1.5 text-xs font-semibold ring-1 ring-white/20">
                            <Ikon className="h-3.5 w-3.5 text-amber-200" />
                            {metin}
                          </span>
                        ))}
                      </div>
                    </div>
                    {s.gorsel && <div className="sm:w-72">{s.gorsel}</div>}
                  </div>
                </section>
              ))}
            </div>
            {[
              { yon: -1, Ikon: ChevronLeft, yer: "left-2", ad: "Önceki özellik" },
              { yon: 1, Ikon: ChevronRight, yer: "right-2", ad: "Sonraki özellik" },
            ].map(({ yon, Ikon, yer, ad }) => (
              <button
                key={yon}
                type="button"
                onClick={() => git(aktif + yon)}
                aria-label={ad}
                className={cn("absolute top-1/2 hidden h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-white/15 ring-1 ring-white/30 backdrop-blur transition-colors hover:bg-white/30 sm:flex", yer)}
              >
                <Ikon className="h-5 w-5" />
              </button>
            ))}
          </div>

          <div className="relative mt-4 flex justify-center gap-1.5">
            {slayt.map((s, i) => (
              <button
                key={i}
                type="button"
                onClick={() => git(i)}
                aria-label={`${i + 1}. özellik: ${s.ust}`}
                aria-current={i === aktif}
                className={cn("h-2 rounded-full transition-all", i === aktif ? "w-6 bg-white" : "w-2 bg-white/40 hover:bg-white/70")}
              />
            ))}
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
                  onClick={() => sec(p, slayt[aktif].kaynak)}
                  className={cn("mt-4 w-full rounded-xl bg-gradient-to-r px-4 py-3 text-sm font-bold text-white shadow-lg transition-transform hover:scale-[1.02] active:scale-[0.99]", k.buton)}
                >
                  {k.ad}&apos;ya geç
                </button>
              </div>
            );
          })}
        </div>

        <div className="flex flex-wrap items-center justify-between gap-2 border-t border-slate-100 px-5 py-4 text-xs text-slate-500 sm:px-7">
          <p>Ödeme altyapısı çok yakında açılıyor; şimdi listeye katıl, açıldığında ilk sen haberdar ol.</p>
          <button type="button" onClick={kapat} className="font-semibold text-slate-600 hover:text-slate-900">
            Şimdi değil
          </button>
        </div>
      </div>
    </div>
  );
}

import type { ReactNode } from "react";
import Link from "next/link";
import Image from "next/image";
import { Check, Crown, Lock } from "lucide-react";
import { YukseltButonu } from "@/components/YukseltmePenceresi";
import { ROZET_RENGI, type RozetRengi } from "@/lib/rozetRenkleri";
import { cn } from "@/lib/utils";

export type ProfilKartiVerisi = {
  adSoyad: string;
  fotoUrl: string | null;
  /** "Bölüm · Düzey" ya da bolum secilmediyse uyari. */
  altSatir: string;
  seriGun: number;
  denemeSayisi: number;
  rozetSayisi: number;
  rozetler: { id: string; ad: string; renk: RozetRengi }[];
  plan: string;
  planAdi: string;
  /** Sureli Pro icin sunucunun hesapladigi kalan gun. */
  kalanGun: number | null;
};

/**
 * Plana ozel gorunum: ucretli uye kartinda kendini ozel hissetsin (kapak, avatar halkasi, tacli rozet, ayricaliklar).
 * Ayricaliklar planlar.ts KARSILASTIRMA'daki gercek ozelliklerdir.
 */
const PLAN_TEMASI: Record<string, { kapak: string; halka: string; rozet: string; yazi: string; ayricalik: string[] } | undefined> = {
  PRO: {
    kapak: "bg-gradient-to-br from-blue-600 via-indigo-600 to-sky-500",
    halka: "bg-gradient-to-br from-sky-300 via-blue-500 to-indigo-600",
    rozet: "bg-gradient-to-r from-blue-600 to-indigo-600 shadow-[0_4px_14px_-2px_rgba(79,70,229,0.55)]",
    yazi: "bg-gradient-to-r from-blue-700 to-indigo-600",
    ayricalik: ["Bana özel ilanlar ve anında bildirim", "Ders karnesi ve soru çözümleri", "Seri koruması (ayda 2 dondurma)"],
  },
  PRO_PLUS: {
    kapak: "bg-gradient-to-br from-violet-700 via-fuchsia-600 to-indigo-700",
    halka: "bg-gradient-to-br from-amber-200 via-fuchsia-400 to-violet-600",
    rozet: "bg-gradient-to-r from-violet-600 to-fuchsia-600 shadow-[0_4px_14px_-2px_rgba(192,38,211,0.55)]",
    yazi: "bg-gradient-to-r from-violet-700 to-fuchsia-600",
    ayricalik: ["Sınırsız KPSS denemesi", "Konu konu eksik analizi ve gelişim", "Bana özel ilanlar ve anında bildirim"],
  },
};

function basHarfler(ad: string) {
  return ad
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]!.toLocaleUpperCase("tr"))
    .join("");
}

/** Kapak: ucretli planda gradyan + yildiz dokusu + silik tac; ucretsizde duz marka mavisi. */
function Kapak({ v, className, children }: { v: ProfilKartiVerisi; className?: string; children?: ReactNode }) {
  const tema = PLAN_TEMASI[v.plan];
  return (
    <div className={cn("relative overflow-hidden", tema?.kapak ?? "bg-primary", className)}>
      {tema && (
        <>
          <div aria-hidden className="absolute inset-0 opacity-40 [background-image:radial-gradient(rgba(255,255,255,0.9)_1px,transparent_1.3px)] [background-size:14px_14px] [mask-image:linear-gradient(to_left,black,transparent_70%)]" />
          <Crown aria-hidden className="absolute -right-3 -bottom-5 h-20 w-20 rotate-12 text-white/15" />
        </>
      )}
      {children}
    </div>
  );
}

function Avatar({ v, buyuk }: { v: ProfilKartiVerisi; buyuk?: boolean }) {
  const tema = PLAN_TEMASI[v.plan];
  const boyut = buyuk ? "h-20 w-20 text-2xl sm:h-24 sm:w-24 sm:text-3xl" : "h-20 w-20 text-2xl";
  const kayma = buyuk ? "-mt-10 sm:-mt-12" : "-mt-10";
  const ic = v.fotoUrl ? (
    <Image src={v.fotoUrl} alt="" width={96} height={96} unoptimized className={cn("rounded-full border-4 border-white object-cover", boyut)} />
  ) : (
    <div className={cn("flex items-center justify-center rounded-full border-4 border-white bg-blue-100 font-bold text-primary", boyut)}>{basHarfler(v.adSoyad)}</div>
  );
  // Ucretli planda avatarin cevresinde plan renginde halka.
  return <div className={cn("relative w-fit shrink-0 rounded-full", kayma, tema && cn("p-[3px] shadow-lg", tema.halka))}>{ic}</div>;
}

/** Isim yanindaki plan rozeti: tacli, gradyan, hafif parilti (yalniz ucretli planda). */
function PlanRozeti({ v }: { v: ProfilKartiVerisi }) {
  const tema = PLAN_TEMASI[v.plan];
  if (!tema) return null;
  return (
    <span className={cn("plan-rozeti relative inline-flex items-center gap-1 overflow-hidden rounded-full px-2.5 py-0.5 align-middle text-[11px] font-extrabold tracking-wider text-white", tema.rozet)}>
      <Crown className="h-3.5 w-3.5 text-amber-200" aria-hidden />
      {v.planAdi.toLocaleUpperCase("tr")}
    </span>
  );
}

function Sayilar({ v }: { v: ProfilKartiVerisi }) {
  return (
    <div className="grid grid-cols-3 gap-2 text-center">
      <div className="rounded-xl bg-amber-50 px-1 py-2">
        <p className="text-xl font-bold text-amber-700">{v.seriGun}</p>
        <p className="text-[11px] text-amber-900">gün seri</p>
      </div>
      <div className="rounded-xl bg-primary/10 px-1 py-2">
        <p className="text-xl font-bold text-primary">{v.denemeSayisi}</p>
        <p className="text-[11px] text-primary">deneme</p>
      </div>
      <Link href="/profilim/rozetler" className="rounded-xl bg-emerald-50 px-1 py-2 hover:bg-emerald-100">
        <p className="text-xl font-bold text-emerald-700">{v.rozetSayisi}</p>
        <p className="text-[11px] text-emerald-800">rozet</p>
      </Link>
    </div>
  );
}

/** Kazanilan rozetler; "Pro üye" rozeti plan rozetiyle tekrar etmesin diye cipte gosterilmez. */
function Rozetler({ v }: { v: ProfilKartiVerisi }) {
  const liste = v.rozetler.filter((r) => r.id !== "pro");
  if (!liste.length) return null;
  return (
    <div className="flex flex-wrap gap-1.5">
      {liste.map((r) => (
        <span key={r.id} className={cn("rounded-full px-2.5 py-1 text-xs font-semibold", ROZET_RENGI[r.renk])}>
          {r.ad}
        </span>
      ))}
    </div>
  );
}

/** Ucretli uyenin ayricaliklari (kartin bos alanini anlamli doldurur). */
function Ayricaliklar({ v }: { v: ProfilKartiVerisi }) {
  const tema = PLAN_TEMASI[v.plan];
  if (!tema) {
    // Ucretsiz uye: ayni yerde Pro ayricaliklari kilitli ve soluk (bos alan yerine yumusak tesvik).
    return (
      <div>
        <p className="text-[11px] font-bold tracking-wider text-slate-400 uppercase">Pro&apos;da seni bekleyenler</p>
        <ul className="mt-1.5 space-y-1.5 text-[13px] text-slate-400">
          {PLAN_TEMASI.PRO!.ayricalik.map((a) => (
            <li key={a} className="flex items-start gap-2">
              <Lock className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden />
              {a}
            </li>
          ))}
        </ul>
      </div>
    );
  }
  return (
    <ul className="space-y-1.5 text-[13px] text-slate-600">
      {tema.ayricalik.map((a) => (
        <li key={a} className="flex items-start gap-2">
          <span className={cn("mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full text-white", tema.rozet)}>
            <Check className="h-2.5 w-2.5" strokeWidth={3} aria-hidden />
          </span>
          {a}
        </li>
      ))}
    </ul>
  );
}

function Uyelik({ v }: { v: ProfilKartiVerisi }) {
  const tema = PLAN_TEMASI[v.plan];
  if (tema) {
    return (
      <div className="flex items-center justify-between gap-3 text-sm">
        <span className="flex flex-col leading-tight">
          <span className={cn("bg-clip-text font-bold text-transparent", tema.yazi)}>{v.planAdi} üyesin</span>
          {v.kalanGun !== null && <span className="mt-0.5 text-xs text-muted-foreground">{v.kalanGun} gün kaldı</span>}
        </span>
        {v.plan === "PRO" && (
          <YukseltButonu plan="PRO_PLUS" kaynak="genel" className="shrink-0 font-semibold whitespace-nowrap text-violet-700 hover:underline">
            Pro+&apos;ya geç
          </YukseltButonu>
        )}
      </div>
    );
  }
  return (
    <div className="flex items-center justify-between gap-3 text-sm">
      <span className="text-muted-foreground">
        Üyelik: <span className="font-semibold text-slate-800">{v.planAdi}</span>
      </span>
      <YukseltButonu kaynak="genel" className="font-semibold text-primary hover:underline">
        Yükselt
      </YukseltButonu>
    </div>
  );
}

/**
 * Uye profil karti: ana sayfada arama yaninda dikey, /profilim'de sayfa basligi olarak yatay (aksiyonlar ve e-posta ile).
 * Gorunum tek yerde: iki sayfa hep ayni kalir.
 */
export function ProfilKarti({ v, yatay, eposta, aksiyonlar }: { v: ProfilKartiVerisi; yatay?: boolean; eposta?: string; aksiyonlar?: ReactNode }) {
  if (!yatay) {
    return (
      <aside className="flex min-w-0 flex-[1_1_300px] flex-col overflow-hidden rounded-3xl border border-primary/10 bg-white shadow-sm">
        <Kapak v={v} className="h-16" />
        <div className="flex flex-1 flex-col gap-3 px-5 pb-5">
          <Avatar v={v} />
          <div>
            <p className="flex flex-wrap items-center gap-2 text-lg font-bold text-slate-900">
              {v.adSoyad}
              <PlanRozeti v={v} />
            </p>
            <p className="text-sm text-muted-foreground">{v.altSatir}</p>
          </div>
          <Sayilar v={v} />
          <Rozetler v={v} />
          <Ayricaliklar v={v} />
          <div className="mt-auto border-t border-border pt-3">
            <Uyelik v={v} />
          </div>
        </div>
      </aside>
    );
  }
  return (
    <section className="overflow-hidden rounded-3xl border border-primary/10 bg-white shadow-sm">
      {/* Aksiyonlar kapagin sag ustunde: dar sutunda da avatar satirini itmez. */}
      <Kapak v={v} className="h-14 sm:h-16">
        <div className="relative flex h-full items-start justify-end gap-2 p-3">{aksiyonlar}</div>
      </Kapak>
      <div className="flex flex-wrap items-end gap-x-5 gap-y-3 px-5 sm:px-6">
        <Avatar v={v} buyuk />
        <div className="min-w-0 flex-[1_1_220px] pt-3">
          <h1 className="flex flex-wrap items-center gap-2 text-xl font-bold text-slate-900">
            {v.adSoyad}
            <PlanRozeti v={v} />
          </h1>
          <p className="text-sm text-muted-foreground">{v.altSatir}</p>
          {eposta && <p className="truncate text-xs text-muted-foreground">{eposta}</p>}
        </div>
      </div>
      <div className="mt-5 grid gap-4 border-t border-border px-5 py-4 sm:grid-cols-[18rem_minmax(0,1fr)] sm:items-center sm:px-6">
        <Sayilar v={v} />
        <div className="space-y-3">
          <Rozetler v={v} />
          <Uyelik v={v} />
        </div>
      </div>
    </section>
  );
}

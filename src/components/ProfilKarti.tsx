import type { ReactNode } from "react";
import Link from "next/link";
import Image from "next/image";
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

function basHarfler(ad: string) {
  return ad
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]!.toLocaleUpperCase("tr"))
    .join("");
}

function Avatar({ v, buyuk }: { v: ProfilKartiVerisi; buyuk?: boolean }) {
  const boyut = buyuk ? "h-24 w-24 -mt-12 text-3xl" : "h-20 w-20 -mt-10 text-2xl";
  return v.fotoUrl ? (
    <Image src={v.fotoUrl} alt="" width={96} height={96} unoptimized className={cn("relative shrink-0 rounded-full border-4 border-white object-cover", boyut)} />
  ) : (
    <div className={cn("relative flex shrink-0 items-center justify-center rounded-full border-4 border-white bg-blue-100 font-bold text-primary", boyut)}>{basHarfler(v.adSoyad)}</div>
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

function Rozetler({ v }: { v: ProfilKartiVerisi }) {
  if (!v.rozetler.length) return <p className="text-sm text-muted-foreground">Henüz rozetin yok. Günün sorularını çöz, ilk rozetini kazan.</p>;
  return (
    <div className="flex flex-wrap gap-1.5">
      {v.rozetler.map((r) => (
        <span key={r.id} className={cn("rounded-full px-2.5 py-1 text-xs font-semibold", ROZET_RENGI[r.renk])}>
          {r.ad}
        </span>
      ))}
    </div>
  );
}

function Uyelik({ v }: { v: ProfilKartiVerisi }) {
  return (
    <div className="flex items-center justify-between gap-3 text-sm">
      <span className="text-muted-foreground">
        Üyelik: <span className="font-semibold text-slate-800">{v.planAdi}</span>
        {v.kalanGun !== null && <span> · {v.kalanGun} gün kaldı</span>}
      </span>
      {v.plan !== "PRO_PLUS" && (
        <YukseltButonu kaynak="genel" className="font-semibold text-primary hover:underline">
          Yükselt
        </YukseltButonu>
      )}
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
        <div className="h-16 bg-primary" />
        <div className="flex flex-1 flex-col gap-3 px-5 pb-5">
          <Avatar v={v} />
          <div>
            <p className="text-lg font-bold text-slate-900">{v.adSoyad}</p>
            <p className="text-sm text-muted-foreground">{v.altSatir}</p>
          </div>
          <Sayilar v={v} />
          {v.rozetler.length > 0 && <Rozetler v={v} />}
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
      <div className="relative flex h-20 items-start justify-end gap-2 bg-primary p-3 sm:h-24 sm:p-4">{aksiyonlar}</div>
      <div className="flex flex-wrap items-end gap-x-5 gap-y-3 px-5 sm:px-6">
        <Avatar v={v} buyuk />
        <div className="min-w-0 flex-[1_1_220px] pt-3">
          <h1 className="text-xl font-bold text-slate-900">{v.adSoyad}</h1>
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

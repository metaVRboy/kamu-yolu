"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { CalendarCheck, Flame, Gift, Sparkles } from "lucide-react";
import { useAuthModal } from "@/components/AuthModal";
import { useYukseltme } from "@/components/YukseltmePenceresi";
import { toast } from "@/components/ui/toast";
import { useUyeOzeti } from "@/lib/uyeOzetiIstemci";
import { ROZET_RENGI } from "@/lib/rozetRenkleri";
import { cn } from "@/lib/utils";

const SERI_HEDEFI = 7;

function basHarfler(ad: string) {
  return ad
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]!.toLocaleUpperCase("tr"))
    .join("");
}

/** Ana sayfa: arama kutusunun yanindaki uye profil karti. Misafirde hic yer kaplamaz. */
export function UyeProfilKarti() {
  const veri = useUyeOzeti();
  const yukselt = useYukseltme();
  const u = veri?.uye;
  if (!u) return null;
  const kalanGun = u.planKalanGun;
  return (
    <aside className="flex min-w-0 flex-[1_1_300px] flex-col overflow-hidden rounded-3xl border border-primary/10 bg-white shadow-sm">
      <div className="h-16 bg-primary" />
      <div className="flex flex-1 flex-col gap-3 px-5 pb-5">
        {u.fotoUrl ? (
          <Image src={u.fotoUrl} alt="" width={80} height={80} unoptimized className="relative -mt-10 h-20 w-20 rounded-full border-4 border-white object-cover" />
        ) : (
          <div className="relative -mt-10 flex h-20 w-20 items-center justify-center rounded-full border-4 border-white bg-blue-100 text-2xl font-bold text-primary">{basHarfler(u.adSoyad)}</div>
        )}
        <div>
          <p className="text-lg font-bold text-slate-900">{u.adSoyad}</p>
          <p className="text-sm text-muted-foreground">{[u.bolum, u.duzey].filter(Boolean).join(" · ") || "Bölümünü henüz seçmedin"}</p>
        </div>
        <div className="grid grid-cols-3 gap-2 text-center">
          <div className="rounded-xl bg-amber-50 px-1 py-2">
            <p className="text-xl font-bold text-amber-700">{u.seri.gun}</p>
            <p className="text-[11px] text-amber-900">gün seri</p>
          </div>
          <div className="rounded-xl bg-primary/10 px-1 py-2">
            <p className="text-xl font-bold text-primary">{u.denemeSayisi}</p>
            <p className="text-[11px] text-primary">deneme</p>
          </div>
          <Link href="/profilim/rozetler" className="rounded-xl bg-emerald-50 px-1 py-2 hover:bg-emerald-100">
            <p className="text-xl font-bold text-emerald-700">{u.rozetSayisi}</p>
            <p className="text-[11px] text-emerald-800">rozet</p>
          </Link>
        </div>
        {u.rozetler.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {u.rozetler.map((r) => (
              <span key={r.id} className={cn("rounded-full px-2.5 py-1 text-xs font-semibold", ROZET_RENGI[r.renk])}>
                {r.ad}
              </span>
            ))}
          </div>
        )}
        <div className="mt-auto flex items-center justify-between border-t border-border pt-3 text-sm">
          <span className="text-muted-foreground">
            Üyelik: <span className="font-semibold text-slate-800">{u.planAdi}</span>
            {kalanGun !== null && <span> · {kalanGun} gün kaldı</span>}
          </span>
          {u.plan !== "PRO_PLUS" && (
            <button type="button" onClick={() => yukselt({ kaynak: "genel" })} className="font-semibold text-primary hover:underline">
              Yükselt
            </button>
          )}
        </div>
      </div>
    </aside>
  );
}

/** Arama kutusunun altindaki uc kart: gunun sorulari (seri), bugun senin icin, KPSS denemesi. Misafire genel hali. */
export function GunlukSerit() {
  const veri = useUyeOzeti();
  const authAc = useAuthModal();
  const u = veri?.uye;
  const ozet = veri?.ozet;
  const seri = u?.seri;
  // Haftalik hedef: 7 gunluk seride 1 gun Pro hediye.
  const dolu = seri ? (seri.gun > 0 && seri.gun % SERI_HEDEFI === 0 && seri.bugunCozuldu ? SERI_HEDEFI : seri.gun % SERI_HEDEFI) : 0;
  const hediyeyeKalan = SERI_HEDEFI - dolu;

  return (
    // data-yol-gecis: sitenin altin yolu karsi kenara bu opak kartlarin arkasindan gecer (eski KPSS bandinin gorevi).
    <section data-yol-gecis className="mt-6 flex flex-wrap gap-4">
      <div className="flex min-w-0 flex-[1_1_340px] flex-col gap-3 rounded-3xl bg-slate-900 p-6 text-white">
        <p className="flex items-center gap-2 font-semibold">
          <Flame className="h-5 w-5 text-orange-400" aria-hidden />
          {seri && seri.gun > 0 ? `${seri.gun} günlük seri` : "Serini başlat"}
        </p>
        <h2 className="text-xl font-bold">Günün 5 sorusu</h2>
        <div className="flex gap-1.5" aria-label={`Haftalık hedef: ${dolu}/${SERI_HEDEFI} gün`}>
          {Array.from({ length: SERI_HEDEFI }, (_, i) => (
            <span key={i} className={cn("h-2 flex-1 rounded", i < dolu ? "bg-orange-400" : "bg-slate-700")} />
          ))}
        </div>
        <p className="text-sm text-slate-300">
          {!u
            ? "Türkçe, Matematik, Tarih, Coğrafya, Vatandaşlık. Üye ol, serini başlat: 7. günde 1 gün Pro hediye."
            : seri?.bugunCozuldu
              ? `Bugünü tamamladın. ${hediyeyeKalan === 0 ? "1 gün Pro hediyeni kazandın!" : `Pro hediyeye ${hediyeyeKalan} gün kaldı.`}`
              : `Türkçe, Matematik, Tarih, Coğrafya, Vatandaşlık. Pro hediyeye ${hediyeyeKalan} gün kaldı.`}
        </p>
        <Link href="/gunun-sorulari" className="mt-auto rounded-xl bg-orange-400 py-3 text-center font-bold text-slate-900 transition-colors hover:bg-orange-300">
          {seri?.bugunCozuldu ? "Sonuçlarını gör" : seri && seri.gun > 0 ? "Devam et" : "Çözmeye başla"}
        </Link>
      </div>

      <div className="flex min-w-0 flex-[1_1_260px] flex-col gap-2 rounded-3xl border border-primary/10 bg-white p-6 shadow-sm">
        <p className="text-xs font-bold tracking-wide text-primary">BUGÜN SENİN İÇİN</p>
        {ozet ? (
          <>
            <p className="text-lg font-bold text-slate-900">{ozet.yeni7 > 0 ? `Bu hafta ${ozet.yeni7} yeni ilan eşleşti` : `${ozet.aktif} uygun ilan açık`}</p>
            <p className="text-sm text-muted-foreground">
              {ozet.bolumAdi}
              {ozet.yaklasan > 0 && ` · ${ozet.yaklasan} ilanın son başvurusu 3 gün içinde`}
            </p>
            <Link href={`/bolum/${ozet.bolumSlug}`} className="mt-auto rounded-xl border border-primary py-2.5 text-center font-bold text-primary transition-colors hover:bg-primary/5">
              İlanlarını gör
            </Link>
          </>
        ) : u ? (
          <>
            <p className="text-lg font-bold text-slate-900">Bölümünü seç</p>
            <p className="text-sm text-muted-foreground">Bölümüne uygun yeni ilanları ve son başvurusu yaklaşanları burada gösterelim.</p>
            <Link href="/profilim/ayarlar" className="mt-auto rounded-xl border border-primary py-2.5 text-center font-bold text-primary transition-colors hover:bg-primary/5">
              Bölümümü seç
            </Link>
          </>
        ) : (
          <>
            <p className="text-lg font-bold text-slate-900">Sana uygun ilanlar</p>
            <p className="text-sm text-muted-foreground">Üye ol, bölümünü seç: yeni eşleşen ve son başvurusu yaklaşan ilanların her gün burada.</p>
            <button type="button" onClick={() => authAc("kayit")} className="mt-auto rounded-xl border border-primary py-2.5 text-center font-bold text-primary transition-colors hover:bg-primary/5">
              Ücretsiz üye ol
            </button>
          </>
        )}
      </div>

      <div className="flex min-w-0 flex-[1_1_260px] flex-col gap-2 rounded-3xl border border-primary/10 bg-white p-6 shadow-sm">
        <p className="flex items-center gap-1.5 text-xs font-bold tracking-wide text-violet-700">
          <CalendarCheck className="h-4 w-4" aria-hidden />
          KPSS DENEMESİ
        </p>
        <p className="text-lg font-bold text-slate-900">Bugünün denemesi hazır</p>
        <p className="text-sm text-muted-foreground">
          {veri?.sonDeneme?.siralama
            ? `Son deneme sıralaman: en iyi %${Math.max(1, 100 - veri.sonDeneme.siralama.yuzde)} (${veri.sonDeneme.siralama.katilimci} katılımcı).`
            : "120 soru, 130 dakika: gerçek sınav formatında, her gün yeni deneme."}
        </p>
        <Link href="/kpss-denemesi" className="mt-auto rounded-xl bg-violet-700 py-2.5 text-center font-bold text-white transition-colors hover:bg-violet-800">
          Denemeye başla
        </Link>
      </div>
    </section>
  );
}

/** Uyeye davet bandi: link ilk tiklamada uretilip panoya kopyalanir. */
export function DavetBandi() {
  const veri = useUyeOzeti();
  const [yukleniyor, setYukleniyor] = useState(false);
  if (!veri?.uye) return null;

  async function kopyala() {
    setYukleniyor(true);
    try {
      const res = await fetch("/api/davet");
      const d = await res.json();
      if (!res.ok) return toast.error("Davet linki alınamadı.");
      await navigator.clipboard.writeText(d.link);
      toast.success("Davet linkin kopyalandı.", "Arkadaşın üye olup bölümünü seçince ikinize de 1 hafta Pro tanımlanır.");
    } catch {
      toast.error("Kopyalanamadı.", "Davet sayfasından linki elle kopyalayabilirsin.");
    } finally {
      setYukleniyor(false);
    }
  }

  return (
    <section className="mt-16 flex flex-wrap items-center justify-between gap-4 rounded-3xl bg-slate-800 p-7 text-white">
      <div className="flex items-start gap-3">
        <Gift className="mt-1 h-6 w-6 shrink-0 text-amber-300" aria-hidden />
        <div>
          <p className="text-lg font-bold">Arkadaşını davet et, ikiniz de 1 hafta Pro kazanın</p>
          <p className="mt-1 text-sm text-slate-300">Arkadaşın davet linkinle üye olup bölümünü seçince Pro ikinize de açılır.</p>
        </div>
      </div>
      <div className="flex flex-wrap gap-2">
        <button type="button" onClick={kopyala} disabled={yukleniyor} className="rounded-xl bg-white px-4 py-2.5 font-bold text-slate-900 hover:bg-slate-100 disabled:opacity-70">
          Davet linkini kopyala
        </button>
        <Link href="/profilim/davet" className="flex items-center gap-1 rounded-xl px-3 py-2.5 text-sm font-semibold text-slate-200 hover:bg-white/10">
          <Sparkles className="h-4 w-4" aria-hidden />
          Davetlerim
        </Link>
      </div>
    </section>
  );
}

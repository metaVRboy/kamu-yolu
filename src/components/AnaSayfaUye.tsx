"use client";

import { useState } from "react";
import Link from "next/link";
import { CalendarCheck, Flame, Gift, Sparkles } from "lucide-react";
import { useAuthModal } from "@/components/AuthModal";
import { ProfilKarti } from "@/components/ProfilKarti";
import { YukseltButonu } from "@/components/YukseltmePenceresi";
import { toast } from "@/components/ui/toast";
import { useUyeOzeti } from "@/lib/uyeOzetiIstemci";
import { cn } from "@/lib/utils";

const SERI_HEDEFI = 7;

/** Ana sayfa: arama kutusunun yanindaki uye profil karti. Misafirde hic yer kaplamaz. */
export function UyeProfilKarti() {
  const veri = useUyeOzeti();
  const u = veri?.uye;
  if (!u) return null;
  return (
    <ProfilKarti
      v={{
        adSoyad: u.adSoyad,
        fotoUrl: u.fotoUrl,
        altSatir: [u.bolum, u.duzey].filter(Boolean).join(" · ") || "Bölümünü henüz seçmedin",
        seriGun: u.seri.gun,
        denemeSayisi: u.denemeSayisi,
        rozetSayisi: u.rozetSayisi,
        rozetler: u.rozetler,
        plan: u.plan,
        planAdi: u.planAdi,
        kalanGun: u.planKalanGun,
      }}
    />
  );
}

type SeriBilgisi = { gun: number; bugunCozuldu: boolean; enIyi: number; dondurmaKalan: number | null };

/**
 * Seri dondurma (Pro ayricaligi) satiri: seri bozulmak uzereyken Pro'ya kalan hak, ucretsize uyari; seri bozulduysa
 * ucretsize "Pro'da ayda 2 dondurma". Koyu zemin icin (seri karti ve gunun sorulari ozeti).
 */
export function SeriKoruma({ seri }: { seri: SeriBilgisi | null | undefined }) {
  if (!seri || seri.bugunCozuldu) return null;
  const pro = seri.dondurmaKalan !== null;
  if (seri.gun > 0) {
    return (
      <p className="flex flex-wrap items-center gap-x-2 rounded-xl bg-white/10 px-3 py-2 text-xs text-slate-200">
        {pro ? (
          seri.dondurmaKalan ? (
            <>Seri koruması açık: bu ay {seri.dondurmaKalan} dondurma hakkın var; bir gün kaçırsan da serin sürer.</>
          ) : (
            <>Bu ayki dondurma hakların bitti; serini korumak için bugün çöz.</>
          )
        ) : (
          <>
            Bugün çözmezsen serin bozulur.
            <YukseltButonu plan="PRO" kaynak="seri" className="font-semibold text-orange-300 underline">
              Pro&apos;da seri korunur
            </YukseltButonu>
          </>
        )}
      </p>
    );
  }
  if (!pro && seri.enIyi >= 2) {
    return (
      <p className="flex flex-wrap items-center gap-x-2 rounded-xl bg-white/10 px-3 py-2 text-xs text-slate-200">
        {seri.enIyi} günlük serin bozuldu. Pro&apos;da ayda 2 seri dondurma hakkın olur.
        <YukseltButonu plan="PRO" kaynak="seri" className="font-semibold text-orange-300 underline">
          Pro&apos;yu incele
        </YukseltButonu>
      </p>
    );
  }
  return null;
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
        <SeriKoruma seri={seri} />
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

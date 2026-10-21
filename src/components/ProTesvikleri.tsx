"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { BellPlus, BellRing, CalendarX2, Loader2, Lock, Sparkles } from "lucide-react";
import { ProCagri, usePlanaGore } from "@/components/ProCagri";
import { useAuthModal } from "@/components/AuthModal";
import { YukseltButonu } from "@/components/YukseltmePenceresi";
import { toast } from "@/components/ui/toast";
import { apiHatasi } from "@/lib/utils";
import { useOturumPlani } from "@/lib/oturumIstemci";

/**
 * Alim duyurusu sayfasi: "bu kurumun ilani yayimlaninca haber ver" (madde 5). Takip herkese, bildirim Pro'da.
 * Duyurular ilandan haftalar once cikar: "ilk ben bileyim" istegi en yuksek oldugu yer.
 */
export function KurumTakipKarti({ kurum }: { kurum: string }) {
  const authAc = useAuthModal();
  const [d, setD] = useState<{ girisli: boolean; takipte: boolean; pro: boolean } | null>(null);
  const [isleniyor, setIsleniyor] = useState(false);
  useEffect(() => {
    fetch(`/api/kurum-takip?kurum=${encodeURIComponent(kurum)}`)
      .then((r) => r.json())
      .then(setD)
      .catch(() => setD({ girisli: false, takipte: false, pro: false }));
  }, [kurum]);

  async function degistir() {
    if (!d?.girisli) return authAc("kayit");
    setIsleniyor(true);
    try {
      const res = await fetch("/api/kurum-takip", { method: d.takipte ? "DELETE" : "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ kurum }) });
      const j = await res.json().catch(() => null);
      if (!res.ok) return toast.error(apiHatasi(j, res.status));
      setD({ ...d, takipte: j.takipte });
      if (j.takipte) toast.success(`${kurum} takipte.`, d.pro ? "İlanı yayımlanınca hemen haber vereceğiz." : "Bildirim Pro üyelere gider.");
    } finally {
      setIsleniyor(false);
    }
  }

  return (
    <section className="mt-5 flex flex-col gap-3 rounded-2xl border border-primary/15 bg-white p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-start gap-2.5">
        <BellRing className="mt-0.5 h-5 w-5 shrink-0 text-primary" aria-hidden />
        <div className="text-sm">
          <p className="font-semibold text-slate-900">{kurum} ilanı yayımlanınca ilk sen öğren</p>
          <p className="text-muted-foreground">
            {d?.takipte && !d.pro ? (
              <>
                Takiptesin. İlan yayımlandığında bildirim Pro&apos;da gelir.{" "}
                <YukseltButonu plan="PRO" kaynak="duyuru-takip" className="font-semibold text-primary underline">
                  Bildirimi aç
                </YukseltButonu>
              </>
            ) : d?.takipte ? (
              "Takiptesin: ilan yayımlandığında sana hemen bildirim gelecek."
            ) : (
              "Duyurular ilandan önce çıkar. Kurumu takip et, ilan yayımlanınca haber verelim."
            )}
          </p>
        </div>
      </div>
      <button
        type="button"
        onClick={degistir}
        disabled={!d || isleniyor}
        aria-pressed={!!d?.takipte}
        className={
          d?.takipte
            ? "flex shrink-0 items-center gap-2 rounded-xl border border-primary/30 px-4 py-2.5 text-sm font-semibold text-primary hover:bg-primary/5"
            : "flex shrink-0 items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-bold text-primary-foreground hover:bg-primary/90"
        }
      >
        {isleniyor ? <Loader2 className="h-4 w-4 animate-spin" /> : <BellPlus className="h-4 w-4" aria-hidden />}
        {d?.takipte ? "Takibi bırak" : "Kurumu takip et"}
      </button>
    </section>
  );
}

/**
 * Suresi dolmus ilan sayfasi (Google'dan cogunlukla buraya dusulur): ziyaretci gec kaldigini goruyor; "bir dahakini
 * ilk sen ogren" tam bu anda. Misafire uyelik, ucretsize Pro, Pro'ya bilgi.
 */
export function SuresiDolanIlanCagrisi({ bolumAdi, bolumSlug }: { bolumAdi?: string; bolumSlug?: string }) {
  const hedef = bolumAdi ? `${bolumAdi} için` : "bölümüne uygun";
  const metin = usePlanaGore({
    misafir: `${bolumAdi ? `${bolumAdi} için yeni` : "Bölümüne uygun yeni"} ilan çıkınca ilk sen öğren: ücretsiz üye ol, bölümünü seç.`,
    ucretsiz: `Bir dahakini kaçırma: Pro'da ${hedef} yeni ilan çıktığı an haberin olur.`,
    sahip: `${hedef[0].toLocaleUpperCase("tr") + hedef.slice(1)} yeni ilan çıkınca sana bildirim gelecek.`,
  });
  return (
    <section className="mt-6 flex flex-col gap-4 rounded-3xl border border-amber-200 bg-amber-50 p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6">
      <div className="flex items-start gap-3">
        <CalendarX2 className="mt-0.5 h-6 w-6 shrink-0 text-amber-700" aria-hidden />
        <div>
          <p className="font-bold text-amber-950">Bu ilanın başvuru süresi doldu.</p>
          {metin && <p className="mt-0.5 text-sm text-amber-900">{metin}</p>}
        </div>
      </div>
      <div className="flex flex-wrap gap-2">
        <ProCagri kaynak="kacirilan" uyeEtiket="Bir daha kaçırma" />
        {bolumSlug && (
          <Link href={`/bolum/${bolumSlug}`} className="rounded-xl border border-amber-300 bg-white px-4 py-2.5 text-sm font-semibold text-amber-950 hover:bg-amber-100">
            Açık ilanlara bak
          </Link>
        )}
      </div>
    </section>
  );
}

/**
 * Ilanlar listesi: "Yalniz bana uygun" (madde 8). Pro: kisisel listeye (profil > bana ozel ilanlar) gider;
 * ucretsiz: yukseltme; misafir: uyelik. Listeyi suzmuyor, ozel listeye goturur (sayfa onbellekli kalir).
 */
export function BanaUygunDugmesi() {
  const oturum = useOturumPlani();
  const authAc = useAuthModal();
  const sinif = "inline-flex items-center gap-1.5 rounded-full border border-primary/30 bg-white px-3.5 py-2 text-sm font-semibold text-primary shadow-sm hover:bg-primary/5";
  if (!oturum) return null;
  if (!oturum.girisli) {
    return (
      <button type="button" onClick={() => authAc("kayit")} className={sinif}>
        <Sparkles className="h-4 w-4" aria-hidden />
        Yalnız bana uygun olanlar
      </button>
    );
  }
  if (oturum.plan === "UCRETSIZ") {
    return (
      <YukseltButonu plan="PRO" kaynak="ozel-ilanlar" className={sinif}>
        <Sparkles className="h-4 w-4" aria-hidden />
        Yalnız bana uygun olanlar
        <Lock className="h-3.5 w-3.5" aria-label="Pro" />
      </YukseltButonu>
    );
  }
  return (
    <Link href="/profilim#bana-ozel" className={sinif}>
      <Sparkles className="h-4 w-4" aria-hidden />
      Yalnız bana uygun olanlar
    </Link>
  );
}

/** Bolum sayfasi ust bilgi seridi: gercek istatistik + takip cagrisi (madde 7). */
export function BolumIstatistikSeridi({ bolumAdi, son30, ortalamaGun }: { bolumAdi: string; son30: number; ortalamaGun: number | null }) {
  return (
    <section className="flex flex-col gap-3 rounded-2xl border border-primary/15 bg-primary/5 p-4 sm:flex-row sm:items-center sm:justify-between">
      <p className="flex items-start gap-2 text-sm text-slate-700">
        <BellRing className="mt-0.5 h-4 w-4 shrink-0 text-primary" aria-hidden />
        <span>
          {bolumAdi} için son 30 günde <strong>{son30} ilan</strong> yayımlandı
          {ortalamaGun !== null && (
            <>
              ; ilanlar ortalama <strong>{ortalamaGun} gün</strong> açık kalıyor
            </>
          )}
          . Yeni ilanı ilk günden yakala.
        </span>
      </p>
      <ProCagri kaynak="bildirim" uyeEtiket="Yeni ilanda haber ver" className="py-2" />
    </section>
  );
}

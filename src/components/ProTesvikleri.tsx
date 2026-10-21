"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Bell, BellPlus, Eye, Loader2, Lock, Sparkles } from "lucide-react";
import { ProCagri, usePlanaGore } from "@/components/ProCagri";
import { TesvikKarti } from "@/components/TesvikKarti";
import { useAuthModal } from "@/components/AuthModal";
import { YukseltButonu } from "@/components/YukseltmePenceresi";
import { toast } from "@/components/ui/toast";
import { apiHatasi } from "@/lib/utils";
import { useOturumPlani } from "@/lib/oturumIstemci";
import { TESVIK_IKINCIL } from "@/lib/tesvik";

/**
 * Alim duyurusu sayfasi: "bu kurumun ilani yayimlaninca haber ver" (madde 5). Takip herkese, bildirim Pro'da.
 * Duyurular ilandan haftalar once cikar: "ilk ben bileyim" istegi en yuksek oldugu yer. Sinyal temasi.
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

  const ikon = isleniyor ? <Loader2 className="h-4 w-4 animate-spin" /> : <BellPlus className="h-4 w-4" aria-hidden />;
  return (
    <TesvikKarti
      tema="sinyal"
      className="mt-5"
      iyi={!!d?.takipte && d.pro}
      baslik={`${kurum} ilanı yayımlanınca ilk sen öğren`}
      metin={
        d?.takipte && !d.pro
          ? "Takiptesin. İlan yayımlandığında bildirim Pro'da gelir."
          : d?.takipte
            ? "Takiptesin: ilan yayımlandığında sana hemen bildirim gelecek."
            : "Duyurular ilandan önce çıkar. Kurumu takip et, ilan yayımlanınca haber verelim."
      }
      aksiyon={
        d?.takipte ? (
          <>
            {!d.pro && (
              <YukseltButonu plan="PRO" kaynak="duyuru-takip" className="tsv-btn">
                <Bell className="h-4 w-4" aria-hidden />
                Bildirimi aç
              </YukseltButonu>
            )}
            <button type="button" onClick={degistir} disabled={isleniyor} aria-pressed className={TESVIK_IKINCIL}>
              Takibi bırak
            </button>
          </>
        ) : (
          <button type="button" onClick={degistir} disabled={!d || isleniyor} aria-pressed={false} className="tsv-btn">
            {ikon}
            Kurumu takip et
          </button>
        )
      }
    />
  );
}

/**
 * Suresi dolmus ilan sayfasi (Google'dan cogunlukla buraya dusulur): ziyaretci gec kaldigini goruyor; "bir dahakini
 * ilk sen ogren" tam bu anda. Misafire uyelik, ucretsize Pro, Pro'ya bilgi. Sis temasi.
 */
export function SuresiDolanIlanCagrisi({ bolumAdi, bolumSlug }: { bolumAdi?: string; bolumSlug?: string }) {
  const hedef = bolumAdi ? `${bolumAdi} için` : "bölümüne uygun";
  const metin = usePlanaGore({
    misafir: `${bolumAdi ? `${bolumAdi} için yeni` : "Bölümüne uygun yeni"} ilan çıkınca ilk sen öğren: ücretsiz üye ol, bölümünü seç.`,
    ucretsiz: `Bir dahakini kaçırma: Pro'da ${hedef} yeni ilan çıktığı an haberin olur.`,
    sahip: `${hedef[0].toLocaleUpperCase("tr") + hedef.slice(1)} yeni ilan çıkınca sana bildirim gelecek.`,
  });
  const sahip = usePlanaGore({ misafir: false, ucretsiz: false, sahip: true });
  return (
    <TesvikKarti
      tema="sis"
      className="mt-6"
      iyi={!!sahip}
      baslik="Bu ilanın başvuru süresi doldu."
      metin={metin}
      aksiyon={
        <>
          <ProCagri kaynak="kacirilan" uyeEtiket="Bir daha kaçırma" className="tsv-btn" ikon={<Eye className="h-4 w-4" aria-hidden />} />
          {bolumSlug && (
            <Link href={`/bolum/${bolumSlug}`} className={TESVIK_IKINCIL}>
              Açık ilanlara bak
            </Link>
          )}
        </>
      }
    />
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

/** Bolum sayfasi ust bilgi seridi: gercek istatistik + takip cagrisi (madde 7). Sinyal temasi; Pro'da iyi hal. */
export function BolumIstatistikSeridi({ bolumAdi, son30, ortalamaGun }: { bolumAdi: string; son30: number; ortalamaGun: number | null }) {
  const sahip = usePlanaGore({ misafir: false, ucretsiz: false, sahip: true });
  return (
    <TesvikKarti
      tema="sinyal"
      iyi={!!sahip}
      baslik={`${bolumAdi} için son 30 günde ${son30} ilan yayımlandı`}
      metin={`${ortalamaGun !== null ? `İlanlar ortalama ${ortalamaGun} gün açık kalıyor. ` : ""}Yeni ilanı ilk günden yakala.`}
      aksiyon={<ProCagri kaynak="bildirim" uyeEtiket="Yeni ilanda haber ver" className="tsv-btn" ikon={<Bell className="h-4 w-4" aria-hidden />} />}
    />
  );
}

"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { CircleAlert, CircleCheck, CircleHelp, UserRoundCheck } from "lucide-react";
import type { UygunlukCevabi, UygunlukDurumu } from "@/app/api/ilan/[id]/uygunluk/route";
import { cn } from "@/lib/utils";

const STIL: Record<UygunlukDurumu, { ikon: typeof CircleCheck; renk: string }> = {
  uygun: { ikon: CircleCheck, renk: "text-emerald-600" },
  "sart-yok": { ikon: CircleCheck, renk: "text-emerald-600" },
  "uygun-degil": { ikon: CircleAlert, renk: "text-amber-600" },
  bilinmiyor: { ikon: CircleHelp, renk: "text-slate-400" },
};

function Satir({ durum, children }: { durum: UygunlukDurumu; children: React.ReactNode }) {
  const { ikon: Ikon, renk } = STIL[durum];
  return (
    <li className="flex items-start gap-2.5 text-sm text-slate-700">
      <Ikon className={cn("mt-0.5 h-4 w-4 shrink-0", renk)} />
      <span>{children}</span>
    </li>
  );
}

/**
 * "Bu ilan sana uygun mu?" - profildeki bolum ve ogrenim duzeyi ilanla
 * karsilastirilir. Kesin hukum degil yonlendirmedir; asil sart resmi ilandadir.
 */
export function IlanUygunluk({ ilanId }: { ilanId: string }) {
  const [cevap, setCevap] = useState<UygunlukCevabi | null>(null);

  useEffect(() => {
    let iptal = false;
    fetch(`/api/ilan/${ilanId}/uygunluk`)
      .then((r) => (r.ok ? r.json() : null))
      .then((j) => !iptal && setCevap(j))
      .catch(() => {});
    return () => {
      iptal = true;
    };
  }, [ilanId]);

  if (!cevap) return null;

  return (
    <section className="rounded-2xl border border-primary/15 bg-gradient-to-br from-primary/[0.04] to-white p-5">
      <h2 className="flex items-center gap-2 text-sm font-semibold text-slate-800">
        <UserRoundCheck className="h-4 w-4 text-primary" />
        Bu ilan sana uygun mu?
      </h2>
      {!cevap.giris ? (
        <p className="mt-2 text-sm text-slate-600">
          <Link href="/giris" className="font-semibold text-primary hover:underline">
            Giriş yap
          </Link>
          , profilindeki bölüm ve öğrenim düzeyine göre bu ilana uygunluğunu gösterelim.
        </p>
      ) : (
        <>
          <ul className="mt-3 space-y-2">
            <Satir durum={cevap.bolum.durum}>
              {cevap.bolum.durum === "sart-yok" && "Bu ilanda bölüm şartı yok."}
              {cevap.bolum.durum === "uygun" && <>Bölümün (<strong>{cevap.bolum.profilBolumu}</strong>) bu ilanın aradığı bölümler arasında.</>}
              {cevap.bolum.durum === "uygun-degil" && "Profilindeki bölüm, bu ilanın aradığı bölümler arasında görünmüyor."}
              {cevap.bolum.durum === "bilinmiyor" && "Profilinde bölüm seçili değil."}
            </Satir>
            <Satir durum={cevap.duzey.durum}>
              {cevap.duzey.durum === "sart-yok" && "İlanda öğrenim düzeyi belirtilmemiş."}
              {cevap.duzey.durum === "uygun" && <>Öğrenim düzeyin (<strong>{cevap.duzey.profilDuzeyi}</strong>) ilanın istediği düzeyle uyuşuyor.</>}
              {cevap.duzey.durum === "uygun-degil" && (
                <>
                  İlan <strong>{cevap.duzey.istenen.join(", ")}</strong> mezunu arıyor; profilinde <strong>{cevap.duzey.profilDuzeyi}</strong> yazıyor.
                </>
              )}
              {cevap.duzey.durum === "bilinmiyor" && "Profilinde öğrenim düzeyi seçili değil."}
            </Satir>
          </ul>
          {(cevap.bolum.durum === "bilinmiyor" || cevap.duzey.durum === "bilinmiyor") && (
            <Link href="/profilim/ayarlar" className="mt-3 inline-block text-sm font-semibold text-primary hover:underline">
              Profilini tamamla →
            </Link>
          )}
          <p className="mt-3 text-xs text-muted-foreground">Bu bir ön değerlendirmedir; başvurmadan önce resmi ilandaki şartları mutlaka oku.</p>
        </>
      )}
    </section>
  );
}

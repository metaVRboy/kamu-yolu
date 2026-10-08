"use client";

import { useState } from "react";
import { Check, Flame } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { YukseltButonu } from "@/components/YukseltmePenceresi";
import { PLAN_ADI, kalanSureMetni, tl, type FiyatTablosu, type KampanyaOzeti, type Plan as PlanKey } from "@/lib/planlar";

// Fiyatlar admin panelden yonetilir (PlanFiyat + Kampanya); sayfa getFiyatlar() ile prop verir.
const PLANLAR: {
  key: PlanKey;
  ad: string;
  aciklama: string;
  populer?: boolean;
  ozellikler: string[];
}[] = [
  {
    key: "UCRETSIZ",
    ad: "Standart",
    aciklama: "Temel kullanım için.",
    ozellikler: [
      "Tüm ilanları görüntüleme",
      "Bölüm/seviyeye göre arama",
      "Becayiş ilanlarını görüntüleme",
      "Haftada toplam 1 KPSS denemesi (puan sonucu)",
    ],
  },
  {
    key: "PRO",
    ad: "Pro",
    aciklama: "Aktif iş arayanlar için.",
    populer: true,
    ozellikler: [
      "Standart'taki her şey",
      "Kişisel bildirimler: yeni ilan ve becayiş mesajı",
      "Bana özel ilanlar",
      "SMS ile anlık ilan bildirimi",
      "Becayiş talebi oluşturma",
      "Becayiş için site içi mesajlaşma",
      "Haftada toplam 3 KPSS denemesi, ders karnesi ve soru çözümleri",
    ],
  },
  {
    key: "PRO_PLUS",
    ad: "Pro+",
    aciklama: "En kapsamlı deneyim.",
    ozellikler: [
      "Pro'daki her şey",
      "Sınırsız KPSS denemesi, konu bazlı değerlendirme ve gelişim takibi",
      "Reklamsız deneyim",
      "Öncelikli destek",
    ],
  },
];

const PLAN_ETIKET = PLAN_ADI;
const SIRA: Record<PlanKey, number> = { UCRETSIZ: 0, PRO: 1, PRO_PLUS: 2 };

export function AbonelikPlanlari({ mevcutPlan, fiyat }: { mevcutPlan: PlanKey; fiyat: { tablo: FiyatTablosu; kampanya: KampanyaOzeti } }) {
  const [donem, setDonem] = useState<"aylik" | "yillik">("aylik");

  return (
    <div>
      {fiyat.kampanya && (
        <p className="mb-6 flex flex-wrap items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-rose-500 to-orange-500 px-4 py-3 text-center text-sm font-bold text-white shadow-md shadow-rose-500/20">
          <Flame className="h-4 w-4" />
          {fiyat.kampanya.ad}
          <span className="rounded-full bg-white/20 px-2 py-0.5 text-xs">{kalanSureMetni(fiyat.kampanya.kalanMs)}</span>
        </p>
      )}
      <div className="flex justify-center">
        <div className="inline-flex rounded-full border border-primary/20 bg-white p-1">
          <button
            type="button"
            onClick={() => setDonem("aylik")}
            className={cn(
              "rounded-full px-4 py-1.5 text-sm font-medium transition-colors",
              donem === "aylik" ? "bg-primary text-primary-foreground" : "text-muted-foreground",
            )}
          >
            Aylık
          </button>
          <button
            type="button"
            onClick={() => setDonem("yillik")}
            className={cn(
              "rounded-full px-4 py-1.5 text-sm font-medium transition-colors",
              donem === "yillik" ? "bg-primary text-primary-foreground" : "text-muted-foreground",
            )}
          >
            Yıllık
          </button>
        </div>
      </div>

      <div className="mt-12 grid grid-cols-1 gap-5 md:grid-cols-3">
        {PLANLAR.map((plan) => {
          const buPlanMevcut = plan.key === mevcutPlan;
          return (
            <div key={plan.key} className="relative">
              {plan.populer && (
                <Badge className="absolute -top-3 left-1/2 z-10 -translate-x-1/2 border-transparent bg-primary text-primary-foreground">
                  En Popüler
                </Badge>
              )}
              <Card
                className={cn(
                  "h-full gap-4 border-primary/20 bg-white p-6 shadow-sm",
                  plan.populer && "border-primary shadow-lg shadow-primary/20",
                )}
              >
                <div>
                  <h3 className="font-sans font-semibold text-slate-900">{plan.ad}</h3>
                  <p className="mt-0.5 text-sm text-muted-foreground">{plan.aciklama}</p>
                </div>

                <div>
                  {plan.key === "UCRETSIZ" ? (
                    <span className="text-2xl font-bold text-slate-900">Ücretsiz</span>
                  ) : (
                    (() => {
                      const d = fiyat.tablo[plan.key][donem];
                      return (
                        <>
                          {d.etiket && <span className="mb-1 block w-fit rounded-full bg-rose-100 px-2 py-0.5 text-[11px] font-bold text-rose-700">{d.etiket}</span>}
                          {d.odenecek < d.liste && <s className="mr-1.5 text-base font-semibold text-slate-400">{tl(d.liste)}</s>}
                          <span className="text-2xl font-bold text-slate-900">{tl(d.odenecek)}</span>
                          <span className="text-sm text-muted-foreground"> / {donem === "aylik" ? "ay" : "yıl"}</span>
                        </>
                      );
                    })()
                  )}
                </div>

                <ul className="space-y-2 text-sm text-slate-700">
                  {plan.ozellikler.map((o) => (
                    <li key={o} className="flex items-start gap-2">
                      <Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                      {o}
                    </li>
                  ))}
                </ul>

                {buPlanMevcut ? (
                  <div className="mt-auto rounded-xl border border-primary/25 bg-primary/10 px-4 py-2 text-center text-sm font-semibold text-primary">
                    Mevcut Planın
                  </div>
                ) : plan.key === "UCRETSIZ" || SIRA[plan.key] < SIRA[mevcutPlan] ? (
                  <button
                    type="button"
                    disabled
                    className="mt-auto w-full cursor-not-allowed rounded-xl bg-slate-200 px-4 py-2 text-sm font-semibold text-slate-500"
                  >
                    İndirgeme Yakında
                  </button>
                ) : (
                  <YukseltButonu
                    plan={plan.key}
                    kaynak="genel"
                    className={cn(
                      "mt-auto w-full rounded-xl bg-gradient-to-r px-4 py-2.5 text-sm font-bold text-white shadow-md transition-transform hover:scale-[1.02]",
                      plan.key === "PRO_PLUS" ? "from-violet-600 to-fuchsia-600" : "from-blue-600 to-indigo-600",
                    )}
                  >
                    {PLAN_ETIKET[plan.key]}&apos;ya Yükselt
                  </YukseltButonu>
                )}
              </Card>
            </div>
          );
        })}
      </div>

      <p className="mt-6 text-center text-xs text-muted-foreground">
        Ödeme altyapısı çok yakında açılıyor; şimdi yerini ayırırsan açıldığında ilk sen haberdar olursun.
      </p>
    </div>
  );
}

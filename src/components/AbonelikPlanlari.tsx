"use client";

import { useState } from "react";
import { Check } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { YukseltButonu } from "@/components/YukseltmePenceresi";
import { PLAN_ADI, PLAN_FIYATI, tl, type Plan as PlanKey } from "@/lib/planlar";

// Fiyatlar: rakip/pazar arastirmasina dayali oneri (becayis.net, kariyer.net,
// ihale takip siteleri kiyaslamasi) - odeme altyapisi henuz baglanmadigi
// icin "Yukseltme" butonlari hala pasif, ama fiyatlar artik gercek oneri
// degerleri (placeholder "Yakinda" degil).
const PLANLAR: {
  key: PlanKey;
  ad: string;
  aylikFiyat: string;
  yillikFiyat: string;
  aciklama: string;
  populer?: boolean;
  ozellikler: string[];
}[] = [
  {
    key: "UCRETSIZ",
    ad: "Standart",
    aylikFiyat: "Ücretsiz",
    yillikFiyat: "Ücretsiz",
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
    aylikFiyat: tl(PLAN_FIYATI.PRO.aylik),
    yillikFiyat: tl(PLAN_FIYATI.PRO.yillik),
    aciklama: "Aktif iş arayanlar için.",
    populer: true,
    ozellikler: [
      "Standart'taki her şey",
      "Bölümüne uygun yeni ilan çıktığında öncelikli bildirim",
      "Bana özel ilanlar",
      "SMS ile anlık ilan bildirimi",
      "Becayiş için site içi mesajlaşma",
      "Haftada toplam 3 KPSS denemesi ve sınav sonu rapor",
    ],
  },
  {
    key: "PRO_PLUS",
    ad: "Pro+",
    aylikFiyat: tl(PLAN_FIYATI.PRO_PLUS.aylik),
    yillikFiyat: tl(PLAN_FIYATI.PRO_PLUS.yillik),
    aciklama: "En kapsamlı deneyim.",
    ozellikler: [
      "Pro'daki her şey",
      "Sınırsız KPSS denemesi, rapor ve konu gelişim takibi",
      "Reklamsız deneyim",
      "Öncelikli destek",
    ],
  },
];

const PLAN_ETIKET = PLAN_ADI;
const SIRA: Record<PlanKey, number> = { UCRETSIZ: 0, PRO: 1, PRO_PLUS: 2 };

export function AbonelikPlanlari({ mevcutPlan }: { mevcutPlan: PlanKey }) {
  const [donem, setDonem] = useState<"aylik" | "yillik">("aylik");

  return (
    <div>
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
                  <span className="text-2xl font-bold text-slate-900">
                    {donem === "aylik" ? plan.aylikFiyat : plan.yillikFiyat}
                  </span>
                  {plan.key !== "UCRETSIZ" && (
                    <span className="text-sm text-muted-foreground">
                      {" "}
                      / {donem === "aylik" ? "ay" : "yıl"}
                    </span>
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

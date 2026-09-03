"use client";

import { useState } from "react";
import { Check } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

type PlanKey = "UCRETSIZ" | "PRO" | "PRO_PLUS";

// Fiyat ve ozellikler henuz kesinlesmedi - burasi sadece arayuz iskeleti.
// Gercek degerler belirlenince bu dizi guncellenecek.
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
    ad: "Ücretsiz",
    aylikFiyat: "₺0",
    yillikFiyat: "₺0",
    aciklama: "Temel kullanım için.",
    ozellikler: [
      "Tüm ilanları görüntüleme",
      "Bölüm/seviyeye göre arama",
      "Yeni ilan bildirimleri",
    ],
  },
  {
    key: "PRO",
    ad: "Pro",
    aylikFiyat: "Yakında",
    yillikFiyat: "Yakında",
    aciklama: "Aktif iş arayanlar için.",
    populer: true,
    ozellikler: [
      "Ücretsiz'deki her şey",
      "Bana özel ilanlar",
      "SMS ile anlık ilan bildirimi",
    ],
  },
  {
    key: "PRO_PLUS",
    ad: "Pro+",
    aylikFiyat: "Yakında",
    yillikFiyat: "Yakında",
    aciklama: "En kapsamlı deneyim.",
    ozellikler: [
      "Pro'daki her şey",
      "Öncelikli destek",
      "Ek özellikler (yakında)",
    ],
  },
];

const PLAN_ETIKET: Record<PlanKey, string> = {
  UCRETSIZ: "Ücretsiz",
  PRO: "Pro",
  PRO_PLUS: "Pro+",
};

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
                  <h3 className="font-semibold text-slate-900">{plan.ad}</h3>
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
                ) : (
                  <button
                    type="button"
                    disabled
                    className="mt-auto w-full cursor-not-allowed rounded-xl bg-slate-200 px-4 py-2 text-sm font-semibold text-slate-500"
                  >
                    {plan.key === "UCRETSIZ" ? "İndirgeme Yakında" : `${PLAN_ETIKET[plan.key]}'e Yükselt`}
                  </button>
                )}
              </Card>
            </div>
          );
        })}
      </div>

      <p className="mt-6 text-center text-xs text-muted-foreground">
        Fiyatlar ve özellikler henüz kesinleşmedi, yakında güncellenecek. Yükseltme
        işlemleri şu anda kullanıma açık değil.
      </p>
    </div>
  );
}

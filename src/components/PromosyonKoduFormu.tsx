"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Ticket } from "lucide-react";
import { toast } from "@/components/ui/toast";
import { PLAN_ADI, type Plan } from "@/lib/planlar";

const TARIH = new Intl.DateTimeFormat("tr-TR", { day: "numeric", month: "long", year: "numeric", timeZone: "Europe/Istanbul" });

/** Aboneligim: promosyon kodu girilince plan hemen acilir. */
export function PromosyonKoduFormu() {
  const router = useRouter();
  const [kod, setKod] = useState("");
  const [hata, setHata] = useState<string | null>(null);
  const [gonderiliyor, setGonderiliyor] = useState(false);

  return (
    <form
      className="mt-6 rounded-3xl border border-primary/10 bg-white p-5 shadow-sm sm:p-6"
      onSubmit={async (e) => {
        e.preventDefault();
        setHata(null);
        setGonderiliyor(true);
        try {
          const res = await fetch("/api/profil/promosyon", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ kod }) });
          const data = await res.json().catch(() => ({}));
          if (!res.ok) return setHata(data.error ?? "Kod kullanılamadı, tekrar dene.");
          toast.success(`${PLAN_ADI[data.plan as Plan]} planın açıldı`, `${TARIH.format(new Date(data.bitis))} tarihine kadar geçerli.`);
          setKod("");
          router.refresh();
        } finally {
          setGonderiliyor(false);
        }
      }}
    >
      <label htmlFor="promosyon-kodu" className="flex items-center gap-2 font-bold text-slate-900">
        <Ticket className="h-5 w-5 text-primary" />
        Promosyon kodun var mı?
      </label>
      <div className="mt-3 flex flex-col gap-2 sm:flex-row">
        <input
          id="promosyon-kodu"
          value={kod}
          onChange={(e) => setKod(e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, ""))}
          maxLength={20}
          autoComplete="off"
          placeholder="KODU YAZ"
          className="w-full rounded-xl border border-primary/20 bg-white px-3 py-2.5 text-sm font-semibold tracking-wider uppercase focus:border-primary/50 focus:outline-none sm:max-w-xs"
        />
        <button type="submit" disabled={kod.length < 3 || gonderiliyor} className="inline-flex items-center justify-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-bold text-primary-foreground disabled:opacity-50">
          {gonderiliyor && <Loader2 className="h-4 w-4 animate-spin" />}
          Kullan
        </button>
      </div>
      {hata && <p className="mt-2 text-sm text-destructive">{hata}</p>}
    </form>
  );
}

"use client";

import { useEffect, useState } from "react";
import { Copy, Loader2, Share2 } from "lucide-react";
import { toast } from "@/components/ui/toast";

type Davet = { link: string; katilan: number; odul: number; kazanilanGun: number; kalanOdul: number };

/** Davet linki, paylasma ve sonuclar. */
export function DavetPaneli() {
  const [d, setD] = useState<Davet | null>(null);
  useEffect(() => {
    fetch("/api/davet")
      .then((r) => r.json())
      .then(setD)
      .catch(() => toast.error("Davet bilgisi alınamadı."));
  }, []);

  if (!d) {
    return (
      <div className="mt-6 flex justify-center py-10 text-muted-foreground">
        <Loader2 className="h-5 w-5 animate-spin" />
      </div>
    );
  }

  async function kopyala() {
    try {
      await navigator.clipboard.writeText(d!.link);
      toast.success("Davet linkin kopyalandı.");
    } catch {
      toast.error("Kopyalanamadı.", "Linki seçip elle kopyalayabilirsin.");
    }
  }
  async function paylas() {
    try {
      await navigator.share({ title: "Kamu Yolu", text: "Bölümüne uygun kamu ilanlarını ve günlük KPSS sorularını Kamu Yolu'nda bul:", url: d!.link });
    } catch {}
  }

  return (
    <div className="mt-6 space-y-5">
      <section className="rounded-3xl bg-slate-800 p-6 text-white">
        <p className="text-lg font-bold">Davet linkin</p>
        <p className="mt-1 text-sm text-slate-300">Arkadaşın bu linkle üye olup bölümünü seçince ikinize de 1 hafta Pro tanımlanır.</p>
        <div className="mt-4 flex flex-wrap gap-2">
          <label className="min-w-0 flex-[1_1_260px]">
            <span className="sr-only">Davet linki</span>
            <input readOnly value={d.link} onFocus={(e) => e.currentTarget.select()} className="w-full rounded-xl bg-white/10 px-3.5 py-2.5 text-sm text-white" />
          </label>
          <button type="button" onClick={kopyala} className="flex items-center gap-2 rounded-xl bg-white px-4 py-2.5 font-bold text-slate-900 hover:bg-slate-100">
            <Copy className="h-4 w-4" aria-hidden />
            Kopyala
          </button>
          {typeof navigator !== "undefined" && "share" in navigator && (
            <button type="button" onClick={paylas} className="flex items-center gap-2 rounded-xl bg-white/10 px-4 py-2.5 font-semibold hover:bg-white/20">
              <Share2 className="h-4 w-4" aria-hidden />
              Paylaş
            </button>
          )}
        </div>
      </section>

      <section className="grid grid-cols-3 gap-3 text-center">
        {[
          { ad: "Linkle üye olan", deger: d.katilan },
          { ad: "Kazandığın Pro", deger: `${d.kazanilanGun} gün` },
          { ad: "Kalan ödül hakkı", deger: d.kalanOdul },
        ].map((s) => (
          <div key={s.ad} className="rounded-2xl border border-primary/10 bg-white p-4 shadow-sm">
            <p className="text-2xl font-bold text-primary">{s.deger}</p>
            <p className="text-xs text-muted-foreground">{s.ad}</p>
          </div>
        ))}
      </section>

      <section className="rounded-2xl border border-primary/10 bg-white p-5 text-sm text-slate-700 shadow-sm">
        <p className="font-semibold text-slate-900">Nasıl çalışır?</p>
        <ul className="mt-2 list-disc space-y-1 pl-5">
          <li>Arkadaşın linkine tıklayıp 30 gün içinde e-posta ya da Google ile üye olur.</li>
          <li>Profilinde bölümünü seçince ikinize de 1 hafta Pro tanımlanır; zaten Pro iseniz süreniz uzar.</li>
          <li>Bir üye davetle en fazla 10 kez ödül kazanabilir.</li>
        </ul>
      </section>
    </div>
  );
}

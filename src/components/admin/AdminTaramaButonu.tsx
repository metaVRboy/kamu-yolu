"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Play } from "lucide-react";
import { toast } from "@/components/ui/toast";

const ETIKET: Record<string, string> = {
  postingsFound: "ilan",
  positionsProcessed: "kadro",
  unmatchedCount: "eşleşmeyen",
  staleDeactivated: "kaldırılan",
  bulunan: "bulunan",
  eklenen: "eklenen",
  degistirilen: "değiştirilen",
  atlanan: "zaten olan",
  toplamLead: "aday",
  yeniLead: "yeni aday",
  dogrulanan: "doğrulanan",
  eklenenHaber: "eklenen haber",
  degistirilenHaber: "değiştirilen haber",
};

/** Cron uc noktasini admin oturumuyla elle calistirir (1-3 dk surebilir). */
export function AdminTaramaButonu({ yol, etiket }: { yol: string; etiket: string }) {
  const router = useRouter();
  const [calisiyor, setCalisiyor] = useState(false);
  return (
    <button
      type="button"
      disabled={calisiyor}
      onClick={async () => {
        setCalisiyor(true);
        try {
          const res = await fetch(yol, { method: "POST" });
          const data = await res.json().catch(() => ({}));
          if (!res.ok || !data.ok) throw new Error(data.error ?? `Hata (${res.status})`);
          const sayilar = Object.entries(data.summary ?? data).filter(([, v]) => typeof v === "number");
          toast.success("Tamamlandı", sayilar.map(([k, v]) => `${ETIKET[k] ?? k}: ${v}`).join(" · "));
          router.refresh();
        } catch (e) {
          toast.error(e instanceof Error ? e.message : "Çalıştırılamadı.");
        } finally {
          setCalisiyor(false);
        }
      }}
      className="inline-flex items-center gap-2 rounded-xl border border-primary/15 px-3 py-2.5 text-sm font-semibold text-slate-800 hover:bg-slate-50 disabled:opacity-60"
    >
      {calisiyor ? <Loader2 className="h-4 w-4 animate-spin text-primary" /> : <Play className="h-4 w-4 text-primary" />}
      {calisiyor ? "Çalışıyor, 1-3 dk sürebilir…" : etiket}
    </button>
  );
}

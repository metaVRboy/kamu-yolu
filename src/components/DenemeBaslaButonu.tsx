"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Play } from "lucide-react";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { cn } from "@/lib/utils";

/** "Sinava Basla": sure kazayla baslamasin diye once onay penceresi acilir. */
export function DenemeBaslaButonu({ duzeySlug, renk }: { duzeySlug: string; renk: string }) {
  const router = useRouter();
  const [onay, setOnay] = useState(false);
  const [yukleniyor, setYukleniyor] = useState(false);
  const [hata, setHata] = useState<string | null>(null);

  async function baslat() {
    setYukleniyor(true);
    setHata(null);
    try {
      const res = await fetch("/api/kpss-denemesi/basla", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ duzey: duzeySlug.toUpperCase() }),
      });
      const data = await res.json();
      if (!res.ok) {
        setHata(data.error ?? "Sınav başlatılamadı.");
        setYukleniyor(false);
        setOnay(false);
        return;
      }
      router.refresh();
    } catch {
      setHata("Bir hata oluştu, tekrar deneyin.");
      setYukleniyor(false);
      setOnay(false);
    }
  }

  return (
    <div>
      <button
        type="button"
        onClick={() => setOnay(true)}
        disabled={yukleniyor}
        className={cn(
          "inline-flex w-full items-center justify-center gap-2 rounded-full px-8 py-3.5 text-base font-bold text-white shadow-lg transition-colors disabled:opacity-60 sm:w-auto",
          renk,
        )}
      >
        <Play className="h-5 w-5 fill-current" />
        {yukleniyor ? "Başlatılıyor…" : "Sınava Başla"}
      </button>
      {hata && <p className="mt-2 text-sm text-destructive">{hata}</p>}
      <ConfirmDialog
        open={onay}
        onOpenChange={setOnay}
        title="Hazır mısın?"
        description="Süre, başlattığın anda işlemeye başlar ve durdurulamaz. Bu düzeyde bugün yalnızca bir kez sınava girebilirsin."
        onConfirm={baslat}
        loading={yukleniyor}
        onayEtiketi="Başlat"
        tehlikeli={false}
      />
    </div>
  );
}

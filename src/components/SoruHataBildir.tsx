"use client";

import { useState } from "react";
import { Flag, Loader2 } from "lucide-react";
import { toast } from "@/components/ui/toast";

/** Cozum ekraninda "Bu soruda hata var" - acilir kisa form. */
export function SoruHataBildir({ soruId }: { soruId: string }) {
  const [acik, setAcik] = useState(false);
  const [aciklama, setAciklama] = useState("");
  const [gonderiliyor, setGonderiliyor] = useState(false);
  const [gonderildi, setGonderildi] = useState(false);

  if (gonderildi) {
    return <p className="mt-3 text-xs text-emerald-700">Bildirimin alındı, teşekkürler! Soruyu inceleyip düzelteceğiz.</p>;
  }
  if (!acik) {
    return (
      <button type="button" onClick={() => setAcik(true)} className="mt-3 inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-red-600">
        <Flag className="h-3.5 w-3.5" /> Bu soruda hata var
      </button>
    );
  }
  return (
    <form
      className="mt-3 space-y-2 rounded-xl border border-primary/10 p-3"
      onSubmit={async (e) => {
        e.preventDefault();
        setGonderiliyor(true);
        const res = await fetch("/api/kpss-denemesi/hata", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ soruId, aciklama }) });
        const data = await res.json().catch(() => ({}));
        setGonderiliyor(false);
        if (!res.ok) return toast.error(data.error ?? "Gönderilemedi.");
        setGonderildi(true);
      }}
    >
      <textarea
        value={aciklama}
        onChange={(e) => setAciklama(e.target.value)}
        rows={2}
        maxLength={1000}
        placeholder="Ne hatalı? Örn: doğru cevap B olmalı, çünkü…"
        className="w-full rounded-lg border border-primary/15 px-3 py-2 text-sm"
      />
      <div className="flex justify-end gap-2">
        <button type="button" onClick={() => setAcik(false)} className="rounded-lg px-3 py-1.5 text-xs font-semibold text-slate-600">
          Vazgeç
        </button>
        <button type="submit" disabled={gonderiliyor || aciklama.trim().length < 5} className="inline-flex items-center gap-1 rounded-lg bg-primary px-3 py-1.5 text-xs font-bold text-primary-foreground disabled:opacity-50">
          {gonderiliyor && <Loader2 className="h-3 w-3 animate-spin" />} Gönder
        </button>
      </div>
    </form>
  );
}

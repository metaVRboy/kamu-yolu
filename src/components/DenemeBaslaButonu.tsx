"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function DenemeBaslaButonu({ duzeySlug }: { duzeySlug: string }) {
  const router = useRouter();
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
        return;
      }
      router.refresh();
    } catch {
      setHata("Bir hata oluştu, tekrar deneyin.");
      setYukleniyor(false);
    }
  }

  return (
    <div>
      <button
        type="button"
        onClick={baslat}
        disabled={yukleniyor}
        className="inline-flex items-center justify-center rounded-lg bg-primary px-6 py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary/90 disabled:opacity-60"
      >
        {yukleniyor ? "Başlatılıyor…" : "Sınava Başla"}
      </button>
      {hata && <p className="mt-2 text-sm text-destructive">{hata}</p>}
    </div>
  );
}

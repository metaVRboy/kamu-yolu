"use client";

import { useState } from "react";
import { Check, Link2 } from "lucide-react";
import { cn } from "@/lib/utils";

const pillClass =
  "rounded-full border border-primary/20 bg-white px-3 py-1.5 text-xs font-medium text-primary transition-colors hover:bg-primary/10";

export function HaberPaylas({ baslik, url, etiket = "Haberi paylaş:" }: { baslik: string; url: string; etiket?: string }) {
  const [kopyalandi, setKopyalandi] = useState(false);
  const metin = encodeURIComponent(baslik);
  const link = encodeURIComponent(url);

  async function kopyala() {
    try {
      await navigator.clipboard.writeText(url);
      setKopyalandi(true);
      setTimeout(() => setKopyalandi(false), 2000);
    } catch {
      // Panoya erisim engellenmisse (ör. izin yok) sessizce yok say -
      // kritik bir islev degil.
    }
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="text-sm font-medium text-muted-foreground">{etiket}</span>
      <a
        href={`https://wa.me/?text=${metin}%20${link}`}
        target="_blank"
        rel="noopener noreferrer"
        className={pillClass}
      >
        WhatsApp
      </a>
      <a
        href={`https://t.me/share/url?url=${link}&text=${metin}`}
        target="_blank"
        rel="noopener noreferrer"
        className={pillClass}
      >
        Telegram
      </a>
      <a
        href={`https://twitter.com/intent/tweet?text=${metin}&url=${link}`}
        target="_blank"
        rel="noopener noreferrer"
        className={pillClass}
      >
        X
      </a>
      <button type="button" onClick={kopyala} className={cn(pillClass, "flex items-center gap-1")}>
        {kopyalandi ? <Check className="h-3.5 w-3.5" /> : <Link2 className="h-3.5 w-3.5" />}
        {kopyalandi ? "Kopyalandı" : "Bağlantıyı kopyala"}
      </button>
    </div>
  );
}

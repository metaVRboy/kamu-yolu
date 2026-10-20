"use client";

import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/toast";
import { bildirimDurumu, bildirimleriAc, bildirimleriKapat, type BildirimDurumu } from "@/lib/pushIstemci";

const METIN: Record<BildirimDurumu, string> = {
  acik: "Bu cihazda tarayıcı bildirimleri açık.",
  kapali: "Bu cihazda tarayıcı bildirimleri kapalı.",
  engelli: "Tarayıcı bu site için bildirimleri engelliyor. Tarayıcı ayarlarından kamuyolu.com için izin verebilirsin.",
  desteklenmiyor: "Bu tarayıcı bildirimleri desteklemiyor. iPhone'da siteyi ana ekrana ekleyip oradan açınca kullanılabilir.",
};

/** Bu cihazin Web Push aboneligi: ac / kapat. */
export function TarayiciBildirimi() {
  const [durum, setDurum] = useState<BildirimDurumu | null>(null);
  const [isleniyor, setIsleniyor] = useState(false);
  useEffect(() => {
    bildirimDurumu().then(setDurum);
  }, []);

  async function degistir() {
    setIsleniyor(true);
    try {
      if (durum === "acik") {
        await bildirimleriKapat();
        setDurum("kapali");
      } else {
        const yeni = await bildirimleriAc();
        setDurum(yeni);
        if (yeni === "acik") toast.success("Tarayıcı bildirimleri açıldı.");
      }
    } catch {
      toast.error("İşlem tamamlanamadı.");
    } finally {
      setIsleniyor(false);
    }
  }

  if (!durum) return <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />;
  return (
    <div className="flex flex-wrap items-center justify-between gap-3">
      <p className="text-sm text-slate-700">{METIN[durum]}</p>
      {(durum === "acik" || durum === "kapali") && (
        <Button type="button" variant={durum === "acik" ? "outline" : "default"} onClick={degistir} disabled={isleniyor}>
          {isleniyor && <Loader2 className="h-4 w-4 animate-spin" />}
          {durum === "acik" ? "Kapat" : "Aç"}
        </Button>
      )}
    </div>
  );
}

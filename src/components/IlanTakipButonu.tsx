"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { BellPlus, BellRing, Loader2 } from "lucide-react";
import { useAuthModal } from "@/components/AuthModal";
import { YukseltButonu } from "@/components/YukseltmePenceresi";
import { buttonVariants } from "@/components/ui/button";
import { toast } from "@/components/ui/toast";
import { apiHatasi, cn } from "@/lib/utils";

type Durum = { girisli: boolean; takipte: boolean; pro: boolean };

/** Takip ettiklerim listesindeki "Takibi bırak" (durum bilindigi icin ayrica sorgulamaz). */
export function TakibiBirakButonu({ ilanId }: { ilanId: string }) {
  const router = useRouter();
  const [isleniyor, setIsleniyor] = useState(false);
  return (
    <button
      type="button"
      disabled={isleniyor}
      onClick={async () => {
        setIsleniyor(true);
        const res = await fetch(`/api/ilan/${ilanId}/takip`, { method: "DELETE" });
        setIsleniyor(false);
        if (res.ok) router.refresh();
        else toast.error("Takip bırakılamadı.");
      }}
      className="shrink-0 rounded-lg px-2.5 py-1.5 text-xs font-semibold text-muted-foreground hover:bg-slate-100 hover:text-slate-800 disabled:opacity-50"
    >
      Takibi bırak
    </button>
  );
}

/** Ilani takibe al: herkese acik; son basvuruya 3 gun ve 1 gun kala hatirlatma Pro'da. */
export function IlanTakipButonu({ ilanId }: { ilanId: string }) {
  const authAc = useAuthModal();
  const [durum, setDurum] = useState<Durum | null>(null);
  const [isleniyor, setIsleniyor] = useState(false);

  useEffect(() => {
    fetch(`/api/ilan/${ilanId}/takip`)
      .then((r) => r.json())
      .then(setDurum)
      .catch(() => setDurum({ girisli: false, takipte: false, pro: false }));
  }, [ilanId]);

  async function degistir() {
    if (!durum?.girisli) return authAc("giris");
    setIsleniyor(true);
    try {
      const res = await fetch(`/api/ilan/${ilanId}/takip`, { method: durum.takipte ? "DELETE" : "POST" });
      const d = await res.json().catch(() => null);
      if (!res.ok) return toast.error(apiHatasi(d, res.status));
      setDurum({ ...durum, takipte: d.takipte });
      if (d.takipte) toast.success("İlan takibe alındı.", durum.pro ? "Son başvuruya 3 gün ve 1 gün kala hatırlatacağız." : "Takip ettiklerin profilinde listelenir.");
    } finally {
      setIsleniyor(false);
    }
  }

  return (
    <div className="space-y-1.5">
      <button
        type="button"
        onClick={degistir}
        disabled={!durum || isleniyor}
        aria-pressed={!!durum?.takipte}
        className={buttonVariants({ variant: durum?.takipte ? "default" : "outline", className: "w-full rounded-full" })}
      >
        {isleniyor ? <Loader2 className="h-4 w-4 animate-spin" /> : durum?.takipte ? <BellRing className="h-4 w-4" /> : <BellPlus className="h-4 w-4" />}
        {durum?.takipte ? "Takip ediliyor" : "İlanı takip et"}
      </button>
      {durum?.takipte && !durum.pro && (
        <p className={cn("text-center text-xs text-muted-foreground")}>
          Son gün hatırlatması Pro&apos;da.{" "}
          <YukseltButonu plan="PRO" kaynak="ilan-takip" className="font-semibold text-primary underline">
            Aç
          </YukseltButonu>
        </p>
      )}
    </div>
  );
}

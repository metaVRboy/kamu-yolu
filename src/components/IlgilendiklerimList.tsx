"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ChevronDown, MapPin, Send } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type Mesaj = {
  id: string;
  gonderenId: string;
  mesaj: string;
  createdAt: string;
  okundu: boolean;
};

type IlgilenilenTalep = {
  id: string;
  meslek: string;
  mevcutIl: string;
  mevcutIlce: string | null;
  istenenIller: string[];
  isActive: boolean;
  ilanSahibiAdSoyad: string;
  mesajlar: Mesaj[];
  okunmamisSayisi: number;
};

function IlgilenilenTalepCard({ talep, currentUserId }: { talep: IlgilenilenTalep; currentUserId: string }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [cevap, setCevap] = useState("");
  const [sending, setSending] = useState(false);

  async function handleOpen() {
    const next = !open;
    setOpen(next);
    if (next && talep.okunmamisSayisi > 0) {
      await fetch("/api/becayis/mesaj/okundu", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ talepId: talep.id, karsiId: currentUserId }),
      });
      router.refresh();
    }
  }

  async function handleReply() {
    if (!cevap.trim()) return;
    setSending(true);
    try {
      await fetch("/api/becayis/mesaj", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ talepId: talep.id, mesaj: cevap }),
      });
      setCevap("");
      router.refresh();
    } finally {
      setSending(false);
    }
  }

  return (
    <Card className="gap-0 border-primary/20 bg-white p-0 shadow-sm">
      <button
        type="button"
        onClick={handleOpen}
        className="flex w-full items-center justify-between gap-3 px-5 py-4 text-left"
      >
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="font-semibold text-slate-900">{talep.meslek}</h3>
            {!talep.isActive && (
              <span className="rounded-full bg-slate-200 px-2.5 py-1 text-xs text-slate-600">Pasif</span>
            )}
          </div>
          <p className="mt-0.5 text-xs text-muted-foreground">İlan sahibi: {talep.ilanSahibiAdSoyad}</p>
          <div className="mt-1 flex items-center gap-1.5 text-xs text-muted-foreground">
            <MapPin className="h-3.5 w-3.5" />
            {talep.mevcutIl}
            {talep.mevcutIlce ? ` / ${talep.mevcutIlce}` : ""} → {talep.istenenIller.join(", ")}
          </div>
        </div>
        <span className="flex shrink-0 items-center gap-2">
          {talep.okunmamisSayisi > 0 && (
            <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-primary px-1.5 text-xs font-semibold text-primary-foreground">
              {talep.okunmamisSayisi}
            </span>
          )}
          <ChevronDown className={cn("h-4 w-4 text-muted-foreground transition-transform", open && "rotate-180")} />
        </span>
      </button>

      {open && (
        <div className="space-y-2 border-t border-primary/10 p-4">
          {talep.mesajlar.map((m) => (
            <div
              key={m.id}
              className={cn(
                "max-w-[85%] rounded-2xl px-3 py-2 text-sm",
                m.gonderenId === currentUserId
                  ? "ml-auto bg-primary text-primary-foreground"
                  : "bg-slate-100 text-slate-800",
              )}
            >
              {m.mesaj}
            </div>
          ))}
          <div className="flex gap-2 pt-1">
            <input
              value={cevap}
              onChange={(e) => setCevap(e.target.value)}
              placeholder="Cevap yaz..."
              className="h-9 flex-1 rounded-xl border border-primary/20 bg-white px-3 text-sm"
            />
            <Button type="button" size="sm" onClick={handleReply} disabled={sending || !cevap.trim()}>
              <Send className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>
      )}
    </Card>
  );
}

export function IlgilendiklerimList({
  talepler,
  currentUserId,
}: {
  talepler: IlgilenilenTalep[];
  currentUserId: string;
}) {
  if (talepler.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        Henüz bir ilana mesaj göndermedin. Becayiş ilanlarını incelemek için{" "}
        <Link href="/becayis" className="font-medium text-primary hover:underline">
          Becayiş İlanları
        </Link>{" "}
        sayfasına göz atabilirsin.
      </p>
    );
  }

  return (
    <div className="space-y-3">
      {talepler.map((talep) => (
        <IlgilenilenTalepCard key={talep.id} talep={talep} currentUserId={currentUserId} />
      ))}
    </div>
  );
}

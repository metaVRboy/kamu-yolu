"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronDown, MapPin, Send, Trash2 } from "lucide-react";
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

type Thread = {
  karsiId: string;
  karsiAdSoyad: string;
  mesajlar: Mesaj[];
  okunmamisSayisi: number;
};

type Talep = {
  id: string;
  meslek: string;
  mevcutIl: string;
  mevcutIlce: string | null;
  istenenIller: string[];
  isActive: boolean;
  threads: Thread[];
};

function ThreadPanel({ talepId, thread, currentUserId }: { talepId: string; thread: Thread; currentUserId: string }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [cevap, setCevap] = useState("");
  const [sending, setSending] = useState(false);

  async function handleOpen() {
    const next = !open;
    setOpen(next);
    if (next && thread.okunmamisSayisi > 0) {
      await fetch("/api/becayis/mesaj/okundu", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ talepId, karsiId: thread.karsiId }),
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
        body: JSON.stringify({ talepId, konusmaKarsiId: thread.karsiId, mesaj: cevap }),
      });
      setCevap("");
      router.refresh();
    } finally {
      setSending(false);
    }
  }

  async function handleDelete() {
    if (!window.confirm("Bu sohbeti silmek istediğinize emin misiniz?")) return;
    await fetch("/api/becayis/mesaj", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ talepId, konusmaKarsiId: thread.karsiId }),
    });
    router.refresh();
  }

  return (
    <div className="rounded-xl border border-primary/15 bg-white">
      <div className="flex items-center justify-between px-3.5 py-2.5">
        <button type="button" onClick={handleOpen} className="flex flex-1 items-center justify-between text-left text-sm">
          <span className="font-medium text-slate-800">{thread.karsiAdSoyad}</span>
          <span className="flex items-center gap-2">
            {thread.okunmamisSayisi > 0 && (
              <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-primary px-1.5 text-xs font-semibold text-primary-foreground">
                {thread.okunmamisSayisi}
              </span>
            )}
            <ChevronDown className={cn("h-4 w-4 text-muted-foreground transition-transform", open && "rotate-180")} />
          </span>
        </button>
        <button
          type="button"
          onClick={handleDelete}
          title="Sohbeti sil"
          className="ml-2 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-muted-foreground hover:bg-red-50 hover:text-red-600"
        >
          <Trash2 className="h-3.5 w-3.5" />
        </button>
      </div>

      {open && (
        <div className="space-y-2 border-t border-primary/10 p-3">
          {thread.mesajlar.map((m) => (
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
    </div>
  );
}

function TalepCard({ talep, currentUserId }: { talep: Talep; currentUserId: string }) {
  const router = useRouter();

  async function handleDeleteAll() {
    if (!window.confirm("Bu ilana ait tüm sohbetleri silmek istediğinize emin misiniz?")) return;
    await fetch("/api/becayis/mesaj", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ talepId: talep.id }),
    });
    router.refresh();
  }

  return (
    <Card className="gap-3 border-primary/20 bg-white p-5 shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h3 className="font-semibold text-slate-900">{talep.meslek}</h3>
        <div className="flex items-center gap-2">
          {!talep.isActive && (
            <span className="rounded-full bg-slate-200 px-2.5 py-1 text-xs text-slate-600">Pasif</span>
          )}
          {talep.threads.length > 0 && (
            <button
              type="button"
              onClick={handleDeleteAll}
              className="flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-medium text-muted-foreground hover:bg-red-50 hover:text-red-600"
            >
              <Trash2 className="h-3.5 w-3.5" />
              Tümünü sil
            </button>
          )}
        </div>
      </div>
      <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
        <MapPin className="h-3.5 w-3.5" />
        {talep.mevcutIl}
        {talep.mevcutIlce ? ` / ${talep.mevcutIlce}` : ""} → {talep.istenenIller.join(", ")}
      </div>

      {talep.threads.length === 0 ? (
        <p className="text-sm text-muted-foreground">Henüz mesaj gelmedi.</p>
      ) : (
        <div className="space-y-2">
          {talep.threads.map((thread) => (
            <ThreadPanel key={thread.karsiId} talepId={talep.id} thread={thread} currentUserId={currentUserId} />
          ))}
        </div>
      )}
    </Card>
  );
}

export function TaleplerimList({ talepler, currentUserId }: { talepler: Talep[]; currentUserId: string }) {
  if (talepler.length === 0) {
    return <p className="text-sm text-muted-foreground">Henüz bir becayiş talebin yok.</p>;
  }

  return (
    <div className="space-y-4">
      {talepler.map((talep) => (
        <TalepCard key={talep.id} talep={talep} currentUserId={currentUserId} />
      ))}
    </div>
  );
}

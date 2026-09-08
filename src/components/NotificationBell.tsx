"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Bell, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";

type Duyuru = { id: string; baslik: string; icerik: string; createdAt: string };
type Bildirim = { id: string; baslik: string; icerik: string | null; link: string | null; createdAt: string; okundu: boolean };

const POLL_MS = 30000;

export function NotificationBell({ isLoggedIn }: { isLoggedIn: boolean }) {
  const [open, setOpen] = useState(false);
  const [tab, setTab] = useState<"genel" | "ozel">("genel");
  const [genel, setGenel] = useState<Duyuru[]>([]);
  const [banaOzel, setBanaOzel] = useState<Bildirim[]>([]);
  const [okunmamisSayisi, setOkunmamisSayisi] = useState(0);
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function handleClickOutside(e: MouseEvent) {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open]);

  async function fetchData() {
    try {
      const res = await fetch("/api/bildirimler");
      if (!res.ok) return;
      const data = await res.json();
      setGenel(data.genel);
      setBanaOzel(data.banaOzel);
      setOkunmamisSayisi(data.okunmamisSayisi);
    } catch {
      // Sessizce yok say - 30sn sonraki periyodik denemede tekrar dener.
    }
  }

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, POLL_MS);
    return () => clearInterval(interval);
  }, []);

  async function handleOpen() {
    const next = !open;
    setOpen(next);
    if (next && isLoggedIn && okunmamisSayisi > 0) {
      await fetch("/api/bildirimler/okundu", { method: "POST" });
      setOkunmamisSayisi(0);
    }
  }

  async function handleDeleteOne(id: string) {
    setBanaOzel((prev) => prev.filter((b) => b.id !== id));
    await fetch(`/api/bildirimler/${id}`, { method: "DELETE" });
  }

  async function handleDeleteAll() {
    setBanaOzel([]);
    await fetch("/api/bildirimler", { method: "DELETE" });
  }

  return (
    <div className="relative" ref={panelRef}>
      <button
        type="button"
        onClick={handleOpen}
        aria-label="Bildirimler"
        className="relative flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 text-primary transition-colors hover:bg-primary hover:text-white"
      >
        <Bell className="h-4.5 w-4.5" />
        {okunmamisSayisi > 0 && (
          <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-red-500" />
        )}
      </button>

      {open && (
        <div className="absolute top-full right-0 z-50 mt-2 w-80 overflow-hidden rounded-2xl border border-primary/20 bg-white shadow-2xl shadow-primary/20">
          <div className="flex border-b border-primary/10">
            <button
              type="button"
              onClick={() => setTab("genel")}
              className={cn(
                "flex-1 px-4 py-2.5 text-sm font-medium",
                tab === "genel" ? "border-b-2 border-primary text-primary" : "text-muted-foreground",
              )}
            >
              Genel
            </button>
            <button
              type="button"
              onClick={() => setTab("ozel")}
              className={cn(
                "flex-1 px-4 py-2.5 text-sm font-medium",
                tab === "ozel" ? "border-b-2 border-primary text-primary" : "text-muted-foreground",
              )}
            >
              Bana Özel
            </button>
          </div>

          <div className="max-h-80 overflow-y-auto p-2">
            {tab === "genel" &&
              (genel.length === 0 ? (
                <p className="p-3 text-sm text-muted-foreground">Henüz duyuru yok.</p>
              ) : (
                genel.map((d) => (
                  <div key={d.id} className="rounded-xl p-3 hover:bg-primary/5">
                    <p className="text-sm font-medium text-slate-900">{d.baslik}</p>
                    <p className="mt-0.5 text-xs text-muted-foreground">{d.icerik}</p>
                  </div>
                ))
              ))}

            {tab === "ozel" &&
              (!isLoggedIn ? (
                <p className="p-3 text-sm text-muted-foreground">
                  Kişisel bildirimleri görmek için{" "}
                  <Link href="/giris" className="font-medium text-primary hover:underline">
                    giriş yap
                  </Link>
                  .
                </p>
              ) : banaOzel.length === 0 ? (
                <p className="p-3 text-sm text-muted-foreground">Henüz bildirimin yok.</p>
              ) : (
                <>
                  <div className="flex justify-end px-1 pb-1">
                    <button
                      type="button"
                      onClick={handleDeleteAll}
                      className="text-xs font-medium text-muted-foreground hover:text-red-600"
                    >
                      Tümünü sil
                    </button>
                  </div>
                  {banaOzel.map((b) => {
                    const content = (
                      <div className={cn("rounded-xl p-3 pr-2 hover:bg-primary/5", !b.okundu && "bg-primary/5")}>
                        <p className="text-sm font-medium text-slate-900">{b.baslik}</p>
                        {b.icerik && <p className="mt-0.5 text-xs text-muted-foreground">{b.icerik}</p>}
                      </div>
                    );
                    return (
                      <div key={b.id} className="flex items-center gap-1">
                        {b.link ? (
                          <Link href={b.link} className="min-w-0 flex-1">
                            {content}
                          </Link>
                        ) : (
                          <div className="min-w-0 flex-1">{content}</div>
                        )}
                        <button
                          type="button"
                          onClick={() => handleDeleteOne(b.id)}
                          aria-label="Bildirimi sil"
                          className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-muted-foreground hover:bg-red-50 hover:text-red-600"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    );
                  })}
                </>
              ))}
          </div>
        </div>
      )}
    </div>
  );
}

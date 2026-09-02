"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { MessageCircle, Send, X } from "lucide-react";
import { Button } from "@/components/ui/button";

export function MessageWidget({
  talepId,
  talepBaslik,
  isLoggedIn,
}: {
  talepId: string;
  talepBaslik: string;
  isLoggedIn: boolean;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [mesaj, setMesaj] = useState("");
  const [sent, setSent] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function handleTriggerClick() {
    if (!isLoggedIn) {
      router.push(`/giris?sonra=/becayis/${talepId}`);
      return;
    }
    setOpen((v) => !v);
  }

  async function handleSend() {
    if (!mesaj.trim()) return;
    setSending(true);
    setError(null);
    try {
      const res = await fetch("/api/becayis/mesaj", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ talepId, mesaj }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Mesaj gönderilemedi.");
        return;
      }
      setSent(true);
      setMesaj("");
    } finally {
      setSending(false);
    }
  }

  return (
    <>
      <Button type="button" onClick={handleTriggerClick} className="w-full sm:w-auto sm:px-8">
        <MessageCircle className="h-4 w-4" />
        Mesaj Gönder
      </Button>

      {open && (
        <div className="fixed right-4 bottom-4 z-50 w-[calc(100%-2rem)] max-w-sm overflow-hidden rounded-2xl border border-primary/20 bg-white shadow-2xl shadow-primary/20 sm:right-6 sm:bottom-6">
          <div className="flex items-center justify-between bg-primary px-4 py-3 text-primary-foreground">
            <p className="line-clamp-1 text-sm font-semibold">{talepBaslik}</p>
            <button type="button" onClick={() => setOpen(false)} aria-label="Kapat">
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className="p-4">
            {sent ? (
              <p className="text-sm text-emerald-600">
                Mesajın gönderildi! Cevap gelirse bildirim alacaksın.
              </p>
            ) : (
              <>
                <textarea
                  value={mesaj}
                  onChange={(e) => setMesaj(e.target.value)}
                  rows={4}
                  placeholder="Mesajını yaz..."
                  className="w-full rounded-xl border border-primary/20 bg-white px-3 py-2 text-sm"
                />
                {error && <p className="mt-1.5 text-xs text-destructive">{error}</p>}
                <Button
                  type="button"
                  onClick={handleSend}
                  disabled={sending || !mesaj.trim()}
                  className="mt-2 w-full"
                  size="sm"
                >
                  <Send className="h-3.5 w-3.5" />
                  Gönder
                </Button>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}

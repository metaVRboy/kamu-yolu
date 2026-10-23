"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Send } from "lucide-react";
import { toast } from "@/components/ui/toast";

/** Sohbet cevabi + yeni mesajlar icin 20 sn'de bir sayfa yenileme. pencereAcik: son gelen mesajin uzerinden 24 saat gecmedi. */
export function AdminWhatsappCevap({ telefon, pencereAcik }: { telefon: string; pencereAcik: boolean }) {
  const router = useRouter();
  const [metin, setMetin] = useState("");
  const [gonderiliyor, setGonderiliyor] = useState(false);

  useEffect(() => {
    // Menu rozeti sayfa mesajlari okundu yapmadan once sayilir: sohbet acilinca bir kez yenile.
    router.refresh();
    const zamanlayici = setInterval(() => router.refresh(), 20_000);
    return () => clearInterval(zamanlayici);
  }, [router, telefon]);

  if (!pencereAcik) {
    return (
      <p className="rounded-xl border border-amber-200 bg-amber-50 p-3 text-xs text-amber-900">
        Kullanıcının son mesajının üzerinden 24 saat geçti. Meta kuralı gereği serbest mesaj gönderilemez; kullanıcı tekrar yazınca cevap verebilirsin.
      </p>
    );
  }
  return (
    <form
      className="flex items-end gap-2"
      onSubmit={async (e) => {
        e.preventDefault();
        setGonderiliyor(true);
        const res = await fetch("/api/admin/whatsapp", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ telefon, metin }) });
        const data = await res.json().catch(() => ({}));
        setGonderiliyor(false);
        if (!res.ok) return toast.error(typeof data.error === "string" ? data.error : "Gönderilemedi.");
        setMetin("");
        router.refresh();
      }}
    >
      <textarea
        value={metin}
        onChange={(e) => setMetin(e.target.value)}
        rows={2}
        maxLength={4000}
        placeholder="Cevabın (WhatsApp'tan gider)"
        className="min-w-0 flex-1 rounded-xl border border-primary/15 px-3 py-2 text-sm"
      />
      <button type="submit" disabled={gonderiliyor || !metin.trim()} className="inline-flex h-10 items-center gap-1.5 rounded-xl bg-emerald-600 px-4 text-sm font-bold text-white disabled:opacity-50">
        {gonderiliyor ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />} Gönder
      </button>
    </form>
  );
}

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Send } from "lucide-react";
import { toast } from "@/components/ui/toast";

/** Destek mesajina e-postayla yanit. */
export function AdminDestekYanit({ id }: { id: string }) {
  const router = useRouter();
  const [yanit, setYanit] = useState("");
  const [gonderiliyor, setGonderiliyor] = useState(false);
  return (
    <form
      className="mt-3 space-y-2"
      onSubmit={async (e) => {
        e.preventDefault();
        setGonderiliyor(true);
        const res = await fetch("/api/admin/destek", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ islem: "yanitla", id, yanit }) });
        const data = await res.json().catch(() => ({}));
        setGonderiliyor(false);
        if (!res.ok) return toast.error(data.error ?? "Gönderilemedi.");
        toast.success("Yanıt e-postayla gönderildi.");
        setYanit("");
        router.refresh();
      }}
    >
      <textarea value={yanit} onChange={(e) => setYanit(e.target.value)} rows={3} maxLength={5000} placeholder="Yanıtın (üyenin e-postasına gider)" className="w-full rounded-xl border border-primary/15 px-3 py-2 text-sm" />
      <button type="submit" disabled={gonderiliyor || yanit.trim().length < 2} className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-3 py-1.5 text-xs font-bold text-primary-foreground disabled:opacity-50">
        {gonderiliyor ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Send className="h-3.5 w-3.5" />} Yanıtla
      </button>
    </form>
  );
}

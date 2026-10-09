"use client";

import { useState } from "react";
import { Flag } from "lucide-react";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { toast } from "@/components/ui/toast";
import { cn } from "@/lib/utils";

/** Becayis sohbetindeki tek mesaj; karsi tarafin mesaji admin'e "uygunsuz" diye sikayet edilebilir. */
export function BecayisMesajBalonu({ m, benim }: { m: { id: string; mesaj: string; sikayetEdildi?: Date | string | null }; benim: boolean }) {
  const [sikayetli, setSikayetli] = useState(!!m.sikayetEdildi);
  const [onay, setOnay] = useState(false);
  const [gonderiliyor, setGonderiliyor] = useState(false);

  async function sikayetEt() {
    setGonderiliyor(true);
    const res = await fetch("/api/becayis/mesaj/sikayet", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ mesajId: m.id }) });
    setGonderiliyor(false);
    setOnay(false);
    if (!res.ok) return toast.error("Şikayet gönderilemedi.");
    setSikayetli(true);
    toast.success("Şikayetin iletildi.", "Ekibimiz mesajı inceleyecek.");
  }

  return (
    <div className={cn("group max-w-[85%]", benim && "ml-auto")}>
      <div className={cn("rounded-2xl px-3 py-2 text-sm", benim ? "bg-primary text-primary-foreground" : "bg-slate-100 text-slate-800")}>{m.mesaj}</div>
      {!benim &&
        (sikayetli ? (
          <p className="mt-0.5 px-1 text-[11px] text-muted-foreground">Şikayet edildi</p>
        ) : (
          <button type="button" onClick={() => setOnay(true)} className="mt-0.5 inline-flex items-center gap-1 px-1 text-[11px] text-muted-foreground hover:text-red-600">
            <Flag className="h-3 w-3" /> Şikayet et
          </button>
        ))}
      <ConfirmDialog
        open={onay}
        onOpenChange={setOnay}
        title="Bu mesaj şikayet edilsin mi?"
        description="Hakaret, taciz, dolandırıcılık ya da reklam içeren mesajları bildir. Mesaj Kamu Yolu ekibine iletilir; gönderen kim olduğunu görmez."
        onConfirm={sikayetEt}
        loading={gonderiliyor}
        onayEtiketi="Şikayet et"
      />
    </div>
  );
}

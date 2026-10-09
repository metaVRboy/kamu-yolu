"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { toast } from "@/components/ui/toast";
import { cn } from "@/lib/utils";

/** Admin listelerinde tek tik islem: POST yol + govde; onay verilirse once onay penceresi acar. */
export function AdminIslemButonu({
  yol,
  govde,
  etiket,
  onay,
  tehlikeli = false,
}: {
  yol: string;
  govde: object;
  etiket: string;
  onay?: { baslik: string; aciklama: string };
  tehlikeli?: boolean;
}) {
  const router = useRouter();
  const [acik, setAcik] = useState(false);
  const [yukleniyor, setYukleniyor] = useState(false);

  async function calistir() {
    setYukleniyor(true);
    try {
      const res = await fetch(yol, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(govde) });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error ?? "İşlem yapılamadı.");
      toast.success("İşlem tamamlandı.");
      router.refresh();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "İşlem yapılamadı.");
    } finally {
      setYukleniyor(false);
      setAcik(false);
    }
  }

  return (
    <>
      <button
        type="button"
        disabled={yukleniyor}
        onClick={() => (onay ? setAcik(true) : calistir())}
        className={cn(
          "rounded-lg border px-2.5 py-1.5 text-xs font-semibold disabled:opacity-50",
          tehlikeli ? "border-red-200 text-red-700 hover:bg-red-50" : "border-primary/15 text-slate-700 hover:bg-slate-50",
        )}
      >
        {etiket}
      </button>
      {onay && <ConfirmDialog open={acik} onOpenChange={setAcik} title={onay.baslik} description={onay.aciklama} onConfirm={calistir} loading={yukleniyor} onayEtiketi={etiket} />}
    </>
  );
}

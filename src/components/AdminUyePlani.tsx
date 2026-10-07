"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/toast";

type Plan = "UCRETSIZ" | "PRO" | "PRO_PLUS";

/** Admin uye listesindeki tek satirin plan/bitis formu. */
export function AdminUyePlani({ userId, plan, bitis }: { userId: string; plan: Plan; bitis: string | null }) {
  const router = useRouter();
  const [secilen, setSecilen] = useState<Plan>(plan);
  const [tarih, setTarih] = useState(bitis ?? "");
  const [yukleniyor, setYukleniyor] = useState(false);

  async function kaydet() {
    setYukleniyor(true);
    try {
      const res = await fetch(`/api/admin/uyeler/${userId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ abonelikPlani: secilen, abonelikBitis: secilen === "UCRETSIZ" ? null : tarih || null }),
      });
      if (!res.ok) return toast.error("Plan güncellenemedi.", (await res.json().catch(() => null))?.error);
      toast.success("Plan güncellendi.");
      router.refresh();
    } finally {
      setYukleniyor(false);
    }
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      <select
        value={secilen}
        onChange={(e) => setSecilen(e.target.value as Plan)}
        aria-label="Plan"
        className="h-9 rounded-xl border border-primary/20 bg-white px-2 text-sm"
      >
        <option value="UCRETSIZ">Ücretsiz</option>
        <option value="PRO">Pro</option>
        <option value="PRO_PLUS">Pro+</option>
      </select>
      {secilen !== "UCRETSIZ" && (
        <input
          type="date"
          value={tarih}
          onChange={(e) => setTarih(e.target.value)}
          aria-label="Bitiş tarihi (boş = süresiz)"
          title="Boş bırakırsan süresiz"
          className="h-9 rounded-xl border border-primary/20 bg-white px-2 text-sm"
        />
      )}
      <Button type="button" size="sm" disabled={yukleniyor} onClick={kaydet}>
        {yukleniyor ? "Kaydediliyor..." : "Kaydet"}
      </Button>
    </div>
  );
}

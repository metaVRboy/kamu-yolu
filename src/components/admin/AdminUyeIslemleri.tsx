"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Ban, LogOut, ShieldCheck, ShieldOff, UserCheck } from "lucide-react";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { toast } from "@/components/ui/toast";

type Islem = { islem: "askiya-al"; neden?: string } | { islem: "askidan-cikar" } | { islem: "oturumlari-kapat" } | { islem: "admin"; deger: boolean };

const buton = "inline-flex w-full items-center gap-2 rounded-xl border border-primary/15 px-3 py-2.5 text-sm font-semibold text-slate-800 hover:bg-slate-50 disabled:opacity-50";

export function AdminUyeIslemleri({ userId, askida, admin, kendisi, acikOturum }: { userId: string; askida: boolean; admin: boolean; kendisi: boolean; acikOturum: number }) {
  const router = useRouter();
  const [neden, setNeden] = useState("");
  const [onay, setOnay] = useState<{ baslik: string; aciklama: string; islem: Islem } | null>(null);
  const [yukleniyor, setYukleniyor] = useState(false);

  async function uygula(islem: Islem) {
    setYukleniyor(true);
    try {
      const res = await fetch(`/api/admin/uyeler/${userId}/islem`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(islem) });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "İşlem yapılamadı.");
      toast.success("İşlem tamamlandı.");
      router.refresh();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "İşlem yapılamadı.");
    } finally {
      setYukleniyor(false);
      setOnay(null);
    }
  }

  return (
    <div className="space-y-2">
      {askida ? (
        <button type="button" className={buton} disabled={yukleniyor} onClick={() => uygula({ islem: "askidan-cikar" })}>
          <UserCheck className="h-4 w-4 text-emerald-600" /> Askıdan çıkar
        </button>
      ) : (
        <div className="space-y-2 rounded-xl border border-red-100 p-3">
          <input value={neden} onChange={(e) => setNeden(e.target.value)} maxLength={300} placeholder="Askıya alma nedeni (üyeye gösterilir)" className="w-full rounded-lg border border-primary/15 px-3 py-2 text-sm" />
          <button
            type="button"
            className={buton}
            disabled={yukleniyor || kendisi}
            onClick={() => setOnay({ baslik: "Üye askıya alınsın mı?", aciklama: "Tüm oturumları kapanır ve giriş yapamaz. Dilediğinde askıdan çıkarabilirsin.", islem: { islem: "askiya-al", neden } })}
          >
            <Ban className="h-4 w-4 text-red-600" /> Askıya al
          </button>
        </div>
      )}
      <button
        type="button"
        className={buton}
        disabled={yukleniyor || acikOturum === 0}
        onClick={() => setOnay({ baslik: "Tüm oturumlar kapatılsın mı?", aciklama: "Üye tüm cihazlarda çıkış yapmış olur, tekrar giriş yapması gerekir.", islem: { islem: "oturumlari-kapat" } })}
      >
        <LogOut className="h-4 w-4" /> Tüm oturumlarını kapat ({acikOturum} açık)
      </button>
      <button
        type="button"
        className={buton}
        disabled={yukleniyor || (kendisi && admin)}
        onClick={() =>
          setOnay({
            baslik: admin ? "Admin yetkisi kaldırılsın mı?" : "Admin yetkisi verilsin mi?",
            aciklama: admin ? "Üye admin paneline erişemez." : "Üye admin paneline tam erişim kazanır: fiyat, üye ve içerik yönetimi.",
            islem: { islem: "admin", deger: !admin },
          })
        }
      >
        {admin ? <ShieldOff className="h-4 w-4 text-amber-600" /> : <ShieldCheck className="h-4 w-4 text-primary" />}
        {admin ? "Admin yetkisini kaldır" : "Admin yap"}
      </button>
      {kendisi && <p className="text-xs text-muted-foreground">Kendi hesabını askıya alamaz, admin yetkini kaldıramazsın.</p>}

      <ConfirmDialog
        open={!!onay}
        onOpenChange={(a) => !a && setOnay(null)}
        title={onay?.baslik ?? ""}
        description={onay?.aciklama ?? ""}
        onConfirm={() => onay && uygula(onay.islem)}
        loading={yukleniyor}
        onayEtiketi="Onayla"
      />
    </div>
  );
}

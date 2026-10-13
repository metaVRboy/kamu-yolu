"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Pause, Play, Ticket, Trash2 } from "lucide-react";
import { AdminKart } from "@/components/admin/AdminUI";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { toast } from "@/components/ui/toast";
import { PLAN_ADI, UCRETLI_PLANLAR, type UcretliPlan } from "@/lib/planlar";
import { cn } from "@/lib/utils";

type KodKaydi = { id: string; kod: string; ozet: string; kullanim: string; sonTarih: string; aktif: boolean; durum: "aktif" | "durduruldu" | "bitti" };

const DURUM = {
  aktif: { ad: "Aktif", sinif: "bg-emerald-100 text-emerald-700" },
  durduruldu: { ad: "Durduruldu", sinif: "bg-slate-100 text-slate-600" },
  bitti: { ad: "Bitti", sinif: "bg-slate-100 text-slate-400" },
};

const alan = "mt-1 w-full rounded-xl border border-primary/15 bg-white px-3 py-2 text-sm focus:border-primary/40 focus:outline-none";

async function istek(url: string, method: string, govde?: unknown) {
  const res = await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: govde ? JSON.stringify(govde) : undefined });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error ?? "İşlem yapılamadı.");
}

export function AdminPromosyonPanel({ kodlar }: { kodlar: KodKaydi[] }) {
  const router = useRouter();
  const [kod, setKod] = useState("");
  const [plan, setPlan] = useState<UcretliPlan>("PRO");
  const [gun, setGun] = useState(30);
  const [limit, setLimit] = useState("");
  const [bitis, setBitis] = useState("");
  const [olusturuluyor, setOlusturuluyor] = useState(false);
  const [silinecek, setSilinecek] = useState<KodKaydi | null>(null);

  async function olustur() {
    setOlusturuluyor(true);
    try {
      await istek("/api/admin/promosyon", "POST", { kod, plan, gun, limit: limit ? Number(limit) : null, bitis: bitis || null });
      toast.success("Promosyon kodu oluşturuldu.", `${kod} → ${PLAN_ADI[plan]} ${gun} gün`);
      setKod("");
      router.refresh();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Oluşturulamadı.");
    } finally {
      setOlusturuluyor(false);
    }
  }

  async function islem(k: KodKaydi, method: "PATCH" | "DELETE") {
    try {
      await istek(`/api/admin/promosyon/${k.id}`, method, method === "PATCH" ? { aktif: !k.aktif } : undefined);
      toast.success(method === "DELETE" ? "Kod silindi." : k.aktif ? "Kod durduruldu." : "Kod yeniden açıldı.");
      router.refresh();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "İşlem yapılamadı.");
    }
  }

  return (
    <>
      <AdminKart baslik="Yeni promosyon kodu" aciklama="Her üye bir kodu bir kez kullanır. Aynı planı süreli kullanan üyenin süresi uzatılır; daha üst planı olan üye kodu kullanamaz.">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          <label className="block text-sm font-medium text-slate-700">
            Kod
            <input value={kod} onChange={(e) => setKod(e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, ""))} maxLength={20} className={cn(alan, "uppercase")} placeholder="KPSS30" />
          </label>
          <label className="block text-sm font-medium text-slate-700">
            Plan
            <select value={plan} onChange={(e) => setPlan(e.target.value as UcretliPlan)} className={alan}>
              {UCRETLI_PLANLAR.map((p) => (
                <option key={p} value={p}>
                  {PLAN_ADI[p]}
                </option>
              ))}
            </select>
          </label>
          <label className="block text-sm font-medium text-slate-700">
            Süre (gün)
            <input type="number" min={1} max={365} value={gun} onChange={(e) => setGun(Number(e.target.value))} className={cn(alan, "tabular-nums")} />
          </label>
          <label className="block text-sm font-medium text-slate-700">
            Kullanım limiti <span className="font-normal text-muted-foreground">(boş = sınırsız)</span>
            <input type="number" min={1} value={limit} onChange={(e) => setLimit(e.target.value)} className={cn(alan, "tabular-nums")} placeholder="100" />
          </label>
          <label className="block text-sm font-medium text-slate-700">
            Son kullanım <span className="font-normal text-muted-foreground">(boş = süresiz)</span>
            <input type="date" value={bitis} onChange={(e) => setBitis(e.target.value)} className={alan} />
          </label>
        </div>
        <button
          type="button"
          onClick={olustur}
          disabled={kod.length < 3 || gun < 1 || olusturuluyor}
          className="mt-4 inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2 text-sm font-bold text-primary-foreground disabled:opacity-50"
        >
          {olusturuluyor ? <Loader2 className="h-4 w-4 animate-spin" /> : <Ticket className="h-4 w-4" />}
          Kodu oluştur
        </button>
      </AdminKart>

      <AdminKart baslik="Promosyon kodları">
        <ul className="divide-y divide-primary/10">
          {kodlar.length === 0 && <li className="py-6 text-center text-sm text-muted-foreground">Henüz promosyon kodu yok.</li>}
          {kodlar.map((k) => (
            <li key={k.id} className="flex flex-wrap items-center justify-between gap-3 py-3">
              <div className="min-w-0">
                <p className="flex flex-wrap items-center gap-2 text-sm font-semibold text-slate-900">
                  <code className="rounded bg-slate-100 px-1.5 py-0.5 text-xs text-slate-800">{k.kod}</code>
                  {k.ozet}
                  <span className={cn("rounded-full px-2 py-0.5 text-[11px] font-bold", DURUM[k.durum].sinif)}>{DURUM[k.durum].ad}</span>
                </p>
                <p className="mt-0.5 text-xs text-muted-foreground tabular-nums">
                  Kullanım {k.kullanim} · Son kullanım: {k.sonTarih}
                </p>
              </div>
              <div className="flex gap-1.5">
                {k.durum !== "bitti" && (
                  <button type="button" onClick={() => islem(k, "PATCH")} className="inline-flex items-center gap-1 rounded-lg border border-primary/15 px-2.5 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50">
                    {k.aktif ? <Pause className="h-3.5 w-3.5" /> : <Play className="h-3.5 w-3.5" />}
                    {k.aktif ? "Durdur" : "Aç"}
                  </button>
                )}
                <button type="button" onClick={() => setSilinecek(k)} aria-label="Sil" className="rounded-lg p-1.5 text-muted-foreground hover:bg-red-50 hover:text-red-600">
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </li>
          ))}
        </ul>
      </AdminKart>

      <ConfirmDialog
        open={!!silinecek}
        onOpenChange={(a) => !a && setSilinecek(null)}
        title="Kod silinsin mi?"
        description={`“${silinecek?.kod ?? ""}” kalıcı olarak silinecek. Kullananların açılan planları aynen kalır. Geçici kapatmak için “Durdur” yeterli.`}
        onConfirm={async () => {
          if (silinecek) await islem(silinecek, "DELETE");
          setSilinecek(null);
        }}
        onayEtiketi="Sil"
      />
    </>
  );
}

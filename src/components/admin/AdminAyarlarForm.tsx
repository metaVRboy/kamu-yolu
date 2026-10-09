"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Save } from "lucide-react";
import { toast } from "@/components/ui/toast";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import type { SiteAyarlari } from "@/lib/siteAyarlari";
import { DuyuruSeridi } from "@/components/DuyuruSeridi";
import { cn } from "@/lib/utils";

const alan = "mt-1 w-full rounded-xl border border-primary/15 bg-white px-3 py-2 text-sm focus:border-primary/40 focus:outline-none";
const TUR_ADI = { bilgi: "Bilgi (mavi)", uyari: "Uyarı (sarı)", kampanya: "Kampanya (mor)" } as const;

export function AdminAyarlarForm({ baslangic }: { baslangic: SiteAyarlari }) {
  const router = useRouter();
  const [a, setA] = useState(baslangic);
  const [kaydediliyor, setKaydediliyor] = useState(false);
  const [bakimOnayi, setBakimOnayi] = useState(false);
  const set = <K extends keyof SiteAyarlari>(k: K, v: SiteAyarlari[K]) => setA((x) => ({ ...x, [k]: v }));

  async function kaydet() {
    setKaydediliyor(true);
    try {
      const res = await fetch("/api/admin/ayarlar", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...a, bakimMesaji: a.bakimMesaji || null, seritMetni: a.seritMetni || null, seritLink: a.seritLink || null }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Kaydedilemedi.");
      toast.success("Ayarlar kaydedildi.", "Sitede hemen geçerli.");
      router.refresh();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Kaydedilemedi.");
    } finally {
      setKaydediliyor(false);
      setBakimOnayi(false);
    }
  }

  // Bakim modunu ACMAK siteyi ziyaretcilere kapatir: ayrica onay istenir.
  const bakimAciliyor = a.bakimModu && !baslangic.bakimModu;

  return (
    <div className="space-y-6">
      <section className={cn("rounded-3xl border p-5 shadow-sm sm:p-6", a.bakimModu ? "border-amber-300 bg-amber-50" : "border-primary/10 bg-white")}>
        <label className="flex items-center justify-between gap-4">
          <span>
            <span className="block font-bold text-slate-900">Bakım modu</span>
            <span className="text-xs text-muted-foreground">Açıkken ziyaretçiler sayfalar yerine bakım mesajını görür. Sen admin olarak siteyi normal kullanırsın.</span>
          </span>
          <input type="checkbox" checked={a.bakimModu} onChange={(e) => set("bakimModu", e.target.checked)} className="h-6 w-6 shrink-0 accent-amber-500" />
        </label>
        <label className="mt-4 block text-sm font-medium text-slate-700">
          Bakım mesajı (boşsa varsayılan mesaj)
          <textarea rows={2} value={a.bakimMesaji ?? ""} onChange={(e) => set("bakimMesaji", e.target.value)} maxLength={500} className={alan} />
        </label>
      </section>

      <section className="rounded-3xl border border-primary/10 bg-white p-5 shadow-sm sm:p-6">
        <p className="font-bold text-slate-900">Duyuru şeridi</p>
        <p className="text-xs text-muted-foreground">Tüm sayfaların en üstünde ince bir şerit. Boş bırakırsan görünmez. Ziyaretçi kapatırsa, metin değişene kadar ona bir daha gösterilmez.</p>
        <label className="mt-4 block text-sm font-medium text-slate-700">
          Metin
          <input value={a.seritMetni ?? ""} onChange={(e) => set("seritMetni", e.target.value)} maxLength={200} placeholder="Örn: KPSS 2026 tercih kılavuzu yayımlandı" className={alan} />
        </label>
        <div className="mt-3 grid gap-3 sm:grid-cols-[minmax(0,1fr)_12rem]">
          <label className="block text-sm font-medium text-slate-700">
            Bağlantı (isteğe bağlı)
            <input value={a.seritLink ?? ""} onChange={(e) => set("seritLink", e.target.value)} placeholder="/kpss-denemesi ya da https://…" className={alan} />
          </label>
          <label className="block text-sm font-medium text-slate-700">
            Renk
            <select value={a.seritTur} onChange={(e) => set("seritTur", e.target.value as SiteAyarlari["seritTur"])} className={alan}>
              {Object.entries(TUR_ADI).map(([k, ad]) => (
                <option key={k} value={k}>
                  {ad}
                </option>
              ))}
            </select>
          </label>
        </div>
        {a.seritMetni && (
          <div className="mt-4 overflow-hidden rounded-xl border border-primary/10">
            <p className="bg-slate-50 px-3 py-1 text-[11px] font-semibold text-muted-foreground">Önizleme</p>
            <DuyuruSeridi key={a.seritMetni + a.seritTur} metin={a.seritMetni} link={a.seritLink || null} tur={a.seritTur} />
          </div>
        )}
      </section>

      <div className="flex justify-end">
        <button
          type="button"
          disabled={kaydediliyor}
          onClick={() => (bakimAciliyor ? setBakimOnayi(true) : kaydet())}
          className="inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-bold text-primary-foreground disabled:opacity-50"
        >
          {kaydediliyor ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          Kaydet
        </button>
      </div>

      <ConfirmDialog
        open={bakimOnayi}
        onOpenChange={setBakimOnayi}
        title="Bakım modu açılsın mı?"
        description="Site ziyaretçilere kapanır, yalnızca bakım mesajı görünür. İşin bitince buradan kapatmayı unutma."
        onConfirm={kaydet}
        loading={kaydediliyor}
        onayEtiketi="Bakım modunu aç"
      />
    </div>
  );
}

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Save } from "lucide-react";
import { toast } from "@/components/ui/toast";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { cn } from "@/lib/utils";

type Soru = { soruMetni: string; secenekler: string[]; dogruCevap: number; aciklama: string | null; konu: string | null };

const alan = "mt-1 w-full rounded-xl border border-primary/15 bg-white px-3 py-2 text-sm focus:border-primary/40 focus:outline-none";

/** KPSS soru duzeltme. Dogru cevap degisirse kayit oncesi ayrica onay ister (eski sonuclar yeniden puanlanir). */
export function AdminSoruForm({ soruId, baslangic, katilimSayisi }: { soruId: string; baslangic: Soru; katilimSayisi: number }) {
  const router = useRouter();
  const [s, setS] = useState(baslangic);
  const [kaydediliyor, setKaydediliyor] = useState(false);
  const [onay, setOnay] = useState(false);
  const set = <K extends keyof Soru>(k: K, v: Soru[K]) => setS((x) => ({ ...x, [k]: v }));
  const cevapDegisti = s.dogruCevap !== baslangic.dogruCevap;

  async function kaydet() {
    setKaydediliyor(true);
    try {
      const res = await fetch(`/api/admin/kpss/soru/${soruId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...s, aciklama: s.aciklama || null, konu: s.konu || null }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Kaydedilemedi.");
      toast.success("Soru güncellendi.", data.yenidenPuanlanan ? `${data.yenidenPuanlanan} deneme sonucu yeniden puanlandı.` : undefined);
      router.refresh();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Kaydedilemedi.");
    } finally {
      setKaydediliyor(false);
      setOnay(false);
    }
  }

  return (
    <div className="space-y-4">
      <label className="block text-sm font-medium text-slate-700">
        Soru metni
        <textarea rows={6} value={s.soruMetni} onChange={(e) => set("soruMetni", e.target.value)} className={alan} />
      </label>
      <fieldset className="space-y-2">
        <legend className="text-sm font-medium text-slate-700">Şıklar (doğru olanı işaretle)</legend>
        {s.secenekler.map((sec, i) => (
          <label key={i} className={cn("flex items-center gap-2 rounded-xl border px-3 py-1.5", i === s.dogruCevap ? "border-emerald-400 bg-emerald-50" : "border-primary/10")}>
            <input type="radio" name="dogru" checked={i === s.dogruCevap} onChange={() => set("dogruCevap", i)} className="h-4 w-4 accent-emerald-600" />
            <span className="w-5 text-sm font-bold">{String.fromCharCode(65 + i)})</span>
            <input value={sec} onChange={(e) => set("secenekler", s.secenekler.map((x, j) => (j === i ? e.target.value : x)))} className="flex-1 bg-transparent py-1 text-sm focus:outline-none" />
          </label>
        ))}
      </fieldset>
      <label className="block text-sm font-medium text-slate-700">
        Çözüm açıklaması
        <textarea rows={4} value={s.aciklama ?? ""} onChange={(e) => set("aciklama", e.target.value)} className={alan} />
      </label>
      <label className="block text-sm font-medium text-slate-700">
        Konu
        <input value={s.konu ?? ""} onChange={(e) => set("konu", e.target.value)} className={alan} />
      </label>
      {cevapDegisti && (
        <p className="rounded-xl bg-amber-50 px-3 py-2 text-sm text-amber-800">
          Doğru cevabı değiştiriyorsun: bu soruyu içeren {katilimSayisi} bitmiş denemenin neti ve puanı yeniden hesaplanacak.
        </p>
      )}
      <div className="flex justify-end">
        <button
          type="button"
          disabled={kaydediliyor}
          onClick={() => (cevapDegisti && katilimSayisi > 0 ? setOnay(true) : kaydet())}
          className="inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-bold text-primary-foreground disabled:opacity-50"
        >
          {kaydediliyor ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          Kaydet
        </button>
      </div>
      <ConfirmDialog
        open={onay}
        onOpenChange={setOnay}
        title="Cevap anahtarı değişsin mi?"
        description={`${katilimSayisi} öğrencinin bu denemedeki neti ve puanı yeni cevaba göre yeniden hesaplanır.`}
        onConfirm={kaydet}
        loading={kaydediliyor}
        onayEtiketi="Kaydet ve yeniden puanla"
      />
    </div>
  );
}

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Save, X } from "lucide-react";
import { toast } from "@/components/ui/toast";
import { INSTITUTION_TYPE_LABEL, LEVEL_LABEL } from "@/lib/labels";
import { cn } from "@/lib/utils";

export type IlanFormDegeri = {
  title: string;
  institutionName: string;
  institutionType: string;
  applicationEnd: string | null; // YYYY-MM-DD
  educationLevels: string[];
  isDepartmentRestricted: boolean;
  departmentIds: string[];
  sourceUrl?: string;
};

type Bolum = { id: string; name: string; level: string };

const alan = "w-full rounded-xl border border-primary/15 bg-white px-3 py-2 text-sm focus:border-primary/40 focus:outline-none";
const DUZEYLER = ["LISE", "ONLISANS", "LISANS", "YUKSEK_LISANS"];

/** Ilan duzenleme / elle ekleme formu. ilanId yoksa yeni ilan olusturur. */
export function AdminIlanForm({ ilanId, baslangic, bolumler }: { ilanId?: string; baslangic: IlanFormDegeri; bolumler: Bolum[] }) {
  const router = useRouter();
  const [d, setD] = useState(baslangic);
  const [arama, setArama] = useState("");
  const [kaydediliyor, setKaydediliyor] = useState(false);
  const set = <K extends keyof IlanFormDegeri>(k: K, v: IlanFormDegeri[K]) => setD((x) => ({ ...x, [k]: v }));

  const secili = new Set(d.departmentIds);
  const aramaSonucu = arama.trim().length >= 2 ? bolumler.filter((b) => b.name.toLocaleLowerCase("tr").includes(arama.trim().toLocaleLowerCase("tr"))).slice(0, 12) : [];

  async function kaydet() {
    setKaydediliyor(true);
    try {
      const res = await fetch(ilanId ? `/api/admin/ilanlar/${ilanId}` : "/api/admin/ilanlar", {
        method: ilanId ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(ilanId ? { duzenle: { ...d, sourceUrl: undefined } } : d),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Kaydedilemedi.");
      toast.success(ilanId ? "İlan güncellendi." : "İlan eklendi.");
      router.push(ilanId ? "/admin/ilanlar" : `/admin/ilanlar/${data.id}`);
      router.refresh();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Kaydedilemedi.");
    } finally {
      setKaydediliyor(false);
    }
  }

  return (
    <div className="space-y-4">
      <label className="block text-sm font-medium text-slate-700">
        İlan başlığı
        <input value={d.title} onChange={(e) => set("title", e.target.value)} className={cn(alan, "mt-1")} />
      </label>
      <div className="grid gap-4 sm:grid-cols-[minmax(0,1fr)_12rem]">
        <label className="block text-sm font-medium text-slate-700">
          Kurum
          <input value={d.institutionName} onChange={(e) => set("institutionName", e.target.value)} className={cn(alan, "mt-1")} />
        </label>
        <label className="block text-sm font-medium text-slate-700">
          Kurum türü
          <select value={d.institutionType} onChange={(e) => set("institutionType", e.target.value)} className={cn(alan, "mt-1")}>
            {Object.entries(INSTITUTION_TYPE_LABEL).map(([k, ad]) => (
              <option key={k} value={k}>
                {ad}
              </option>
            ))}
          </select>
        </label>
      </div>
      {d.sourceUrl !== undefined && (
        <label className="block text-sm font-medium text-slate-700">
          Resmi ilan bağlantısı
          <input value={d.sourceUrl} onChange={(e) => set("sourceUrl", e.target.value)} placeholder="https://…" className={cn(alan, "mt-1")} />
        </label>
      )}
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block text-sm font-medium text-slate-700">
          Son başvuru tarihi
          <input type="date" value={d.applicationEnd ?? ""} onChange={(e) => set("applicationEnd", e.target.value || null)} className={cn(alan, "mt-1")} />
        </label>
        <fieldset className="text-sm font-medium text-slate-700">
          Öğrenim düzeyi
          <div className="mt-2 flex flex-wrap gap-3">
            {DUZEYLER.map((l) => (
              <label key={l} className="flex items-center gap-1.5 font-normal">
                <input
                  type="checkbox"
                  checked={d.educationLevels.includes(l)}
                  onChange={(e) => set("educationLevels", e.target.checked ? [...d.educationLevels, l] : d.educationLevels.filter((x) => x !== l))}
                  className="h-4 w-4 accent-primary"
                />
                {LEVEL_LABEL[l]}
              </label>
            ))}
          </div>
        </fieldset>
      </div>

      <div className="rounded-2xl border border-primary/10 p-4">
        <label className="flex items-center gap-2 text-sm font-medium text-slate-700">
          <input type="checkbox" checked={d.isDepartmentRestricted} onChange={(e) => set("isDepartmentRestricted", e.target.checked)} className="h-4 w-4 accent-primary" />
          Bölüm şartı var (yalnızca seçilen bölümler başvurabilir)
        </label>
        <p className="mt-3 text-sm font-medium text-slate-700">Bölümler ({d.departmentIds.length})</p>
        <div className="mt-2 flex flex-wrap gap-1.5">
          {d.departmentIds.map((id) => (
            <span key={id} className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2.5 py-1 text-xs font-semibold text-primary">
              {bolumler.find((b) => b.id === id)?.name ?? id}
              <button type="button" aria-label="Kaldır" onClick={() => set("departmentIds", d.departmentIds.filter((x) => x !== id))}>
                <X className="h-3 w-3" />
              </button>
            </span>
          ))}
          {d.departmentIds.length === 0 && <span className="text-xs text-muted-foreground">Bölüm seçilmedi.</span>}
        </div>
        <input value={arama} onChange={(e) => setArama(e.target.value)} placeholder="Bölüm ara ve ekle (en az 2 harf)" className={cn(alan, "mt-3")} />
        {aramaSonucu.length > 0 && (
          <ul className="mt-1 max-h-56 overflow-y-auto rounded-xl border border-primary/10">
            {aramaSonucu.map((b) => (
              <li key={b.id}>
                <button
                  type="button"
                  disabled={secili.has(b.id)}
                  onClick={() => set("departmentIds", [...d.departmentIds, b.id])}
                  className="flex w-full justify-between px-3 py-2 text-left text-sm hover:bg-slate-50 disabled:opacity-40"
                >
                  {b.name}
                  <span className="text-xs text-muted-foreground">{LEVEL_LABEL[b.level]}</span>
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="flex justify-end">
        <button type="button" onClick={kaydet} disabled={kaydediliyor} className="inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-bold text-primary-foreground disabled:opacity-50">
          {kaydediliyor ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          {ilanId ? "Kaydet" : "İlanı ekle"}
        </button>
      </div>
    </div>
  );
}

/** Listede tek tikla gizle/goster ya da taramaya geri birak. */
export function AdminIlanIslem({ ilanId, islem, etiket }: { ilanId: string; islem: "gizle" | "goster" | "taramaya-birak"; etiket: string }) {
  const router = useRouter();
  const [yukleniyor, setYukleniyor] = useState(false);
  return (
    <button
      type="button"
      disabled={yukleniyor}
      onClick={async () => {
        setYukleniyor(true);
        const res = await fetch(`/api/admin/ilanlar/${ilanId}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ islem }) });
        setYukleniyor(false);
        if (!res.ok) return toast.error("İşlem yapılamadı.");
        router.refresh();
      }}
      className="rounded-lg border border-primary/15 px-2.5 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-50"
    >
      {etiket}
    </button>
  );
}

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, X } from "lucide-react";
import { toast } from "@/components/ui/toast";
import { LEVEL_LABEL } from "@/lib/labels";

const alan = "h-9 rounded-lg border border-primary/15 bg-white px-3 text-sm";

async function gonder(govde: object) {
  const res = await fetch("/api/admin/eslestirme", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(govde) });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error ?? "İşlem yapılamadı.");
  return data as { baglanan: number };
}

function useIslem() {
  const router = useRouter();
  const [yukleniyor, setYukleniyor] = useState(false);
  async function calistir(govde: object, sonra?: () => void) {
    setYukleniyor(true);
    try {
      const { baglanan } = await gonder(govde);
      toast.success(baglanan > 0 ? `Kaydedildi, ${baglanan} ilan bağlandı.` : "Kaydedildi.");
      sonra?.();
      router.refresh();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "İşlem yapılamadı.");
    } finally {
      setYukleniyor(false);
    }
  }
  return { yukleniyor, calistir };
}

/** Tek bolumun es anlamli ifadeleri: sil / ekle. */
export function BolumIfadeleri({ departmentId, aliases }: { departmentId: string; aliases: { id: string; alias: string }[] }) {
  const [yeni, setYeni] = useState("");
  const { yukleniyor, calistir } = useIslem();
  return (
    <div className="mt-2 flex flex-wrap items-center gap-1.5">
      {aliases.map((a) => (
        <span key={a.id} className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2.5 py-1 text-xs text-slate-700">
          {a.alias}
          <button type="button" aria-label="Sil" disabled={yukleniyor} onClick={() => calistir({ islem: "alias-sil", aliasId: a.id })}>
            <X className="h-3 w-3" />
          </button>
        </span>
      ))}
      <form
        className="flex gap-1"
        onSubmit={(e) => {
          e.preventDefault();
          calistir({ islem: "alias-ekle", departmentId, alias: yeni }, () => setYeni(""));
        }}
      >
        <input value={yeni} onChange={(e) => setYeni(e.target.value)} placeholder="Yeni ifade" className={`${alan} h-7 w-44 text-xs`} />
        <button type="submit" disabled={yukleniyor || yeni.trim().length < 2} aria-label="Ekle" className="rounded-lg bg-primary px-2 text-primary-foreground disabled:opacity-40">
          <Plus className="h-3.5 w-3.5" />
        </button>
      </form>
    </div>
  );
}

/** Listede hic olmayan bolumu ekle. */
export function YeniBolumFormu() {
  const [name, setName] = useState("");
  const [level, setLevel] = useState("LISANS");
  const [aliases, setAliases] = useState("");
  const { yukleniyor, calistir } = useIslem();
  return (
    <form
      className="flex flex-wrap gap-2"
      onSubmit={(e) => {
        e.preventDefault();
        const liste = aliases.split(",").map((a) => a.trim()).filter(Boolean);
        calistir({ islem: "bolum-ekle", name, level, aliases: liste }, () => {
          setName("");
          setAliases("");
        });
      }}
    >
      <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Bölüm adı" className={`${alan} min-w-48 flex-1`} />
      <select value={level} onChange={(e) => setLevel(e.target.value)} className={alan}>
        {["LISE", "ONLISANS", "LISANS", "YUKSEK_LISANS"].map((l) => (
          <option key={l} value={l}>
            {LEVEL_LABEL[l]}
          </option>
        ))}
      </select>
      <input value={aliases} onChange={(e) => setAliases(e.target.value)} placeholder="Eş anlamlılar (virgülle)" className={`${alan} min-w-48 flex-1`} />
      <button type="submit" disabled={yukleniyor || name.trim().length < 2} className="h-9 rounded-lg bg-primary px-4 text-sm font-semibold text-primary-foreground disabled:opacity-40">
        Bölüm ekle
      </button>
    </form>
  );
}

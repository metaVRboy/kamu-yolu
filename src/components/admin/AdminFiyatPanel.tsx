"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { BadgePercent, Loader2, Pause, Play, Save, Trash2 } from "lucide-react";
import { AdminKart } from "@/components/admin/AdminUI";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { toast } from "@/components/ui/toast";
import { PLAN_ADI, UCRETLI_PLANLAR, indirimliFiyat, tl, type FiyatTablosu, type UcretliPlan } from "@/lib/planlar";
import { cn } from "@/lib/utils";

export type KampanyaKaydi = {
  id: string;
  ad: string;
  indirim: string;
  kapsam: string;
  aralik: string;
  kuponKodu: string | null;
  aktif: boolean;
  durum: "aktif" | "kuponlu" | "planlandi" | "durduruldu" | "bitti";
};

type Liste = Record<UcretliPlan, { aylik: number; yillik: number }>;

const DURUM = {
  aktif: { ad: "Sitede aktif", sinif: "bg-emerald-100 text-emerald-700" },
  kuponlu: { ad: "Kuponla geçerli", sinif: "bg-sky-100 text-sky-700" },
  planlandi: { ad: "Planlandı", sinif: "bg-amber-100 text-amber-800" },
  durduruldu: { ad: "Durduruldu", sinif: "bg-slate-100 text-slate-600" },
  bitti: { ad: "Bitti", sinif: "bg-slate-100 text-slate-400" },
};

const alan = "w-full rounded-xl border border-primary/15 bg-white px-3 py-2 text-sm focus:border-primary/40 focus:outline-none";

async function istek(url: string, method: string, govde?: unknown) {
  const res = await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: govde ? JSON.stringify(govde) : undefined });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error ?? "İşlem yapılamadı.");
}

export function AdminFiyatPanel({ liste, sitedeki, aktifKampanya, kampanyalar }: { liste: Liste; sitedeki: FiyatTablosu; aktifKampanya: string | null; kampanyalar: KampanyaKaydi[] }) {
  const router = useRouter();
  const [fiyatlar, setFiyatlar] = useState(liste);
  const [kaydediliyor, setKaydediliyor] = useState(false);

  // Kampanya formu
  const [ad, setAd] = useState("");
  const [indirimTuru, setIndirimTuru] = useState<"yuzde" | "tutar">("yuzde");
  const [deger, setDeger] = useState(20);
  const [planlar, setPlanlar] = useState<UcretliPlan[]>(["PRO", "PRO_PLUS"]);
  const [aylik, setAylik] = useState(true);
  const [yillik, setYillik] = useState(true);
  const [baslangic, setBaslangic] = useState("");
  const [bitis, setBitis] = useState("");
  const [kupon, setKupon] = useState("");
  const [olusturuluyor, setOlusturuluyor] = useState(false);
  const [silinecek, setSilinecek] = useState<KampanyaKaydi | null>(null);

  async function fiyatKaydet() {
    setKaydediliyor(true);
    try {
      await istek("/api/admin/fiyatlar", "PUT", fiyatlar);
      toast.success("Fiyatlar güncellendi.", "Sitedeki tüm fiyatlar ve sözleşmeler yenilendi.");
      router.refresh();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Kaydedilemedi.");
    } finally {
      setKaydediliyor(false);
    }
  }

  async function kampanyaOlustur() {
    setOlusturuluyor(true);
    try {
      await istek("/api/admin/kampanyalar", "POST", { ad, indirimTuru, deger, planlar, aylik, yillik, baslangic, bitis, kuponKodu: kupon || null });
      toast.success("Kampanya oluşturuldu.");
      setAd("");
      setKupon("");
      router.refresh();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Oluşturulamadı.");
    } finally {
      setOlusturuluyor(false);
    }
  }

  async function kampanyaIslem(k: KampanyaKaydi, method: "PATCH" | "DELETE") {
    try {
      await istek(`/api/admin/kampanyalar/${k.id}`, method, method === "PATCH" ? { aktif: !k.aktif } : undefined);
      toast.success(method === "DELETE" ? "Kampanya silindi." : k.aktif ? "Kampanya durduruldu." : "Kampanya yeniden başlatıldı.");
      router.refresh();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "İşlem yapılamadı.");
    }
  }

  const indirim = { yuzde: indirimTuru === "yuzde" ? deger : null, tutar: indirimTuru === "tutar" ? deger : null };
  const kampanyaHazir = ad.trim().length >= 2 && deger > 0 && planlar.length > 0 && (aylik || yillik) && baslangic && bitis;
  const degisti = UCRETLI_PLANLAR.some((p) => fiyatlar[p].aylik !== liste[p].aylik || fiyatlar[p].yillik !== liste[p].yillik);

  return (
    <>
      <div className="grid gap-6 xl:grid-cols-2">
        <AdminKart baslik="Liste fiyatları" aciklama="TL, KDV dahil. Yıllık fiyat aylığın 12 katından düşük olmalı ki yıllık seçenek cazip kalsın.">
          <div className="space-y-4">
            {UCRETLI_PLANLAR.map((p) => (
              <div key={p} className="grid grid-cols-[4rem_1fr_1fr] items-end gap-3">
                <span className="pb-2 font-sans font-bold text-slate-900">{PLAN_ADI[p]}</span>
                {(["aylik", "yillik"] as const).map((d) => (
                  <label key={d} className="text-xs font-medium text-muted-foreground">
                    {d === "aylik" ? "Aylık" : "Yıllık"}
                    <input
                      type="number"
                      min={1}
                      value={fiyatlar[p][d]}
                      onChange={(e) => setFiyatlar((f) => ({ ...f, [p]: { ...f[p], [d]: Number(e.target.value) } }))}
                      className={cn(alan, "mt-1 tabular-nums")}
                    />
                  </label>
                ))}
              </div>
            ))}
            <div className="flex items-center justify-between gap-3 border-t border-primary/10 pt-4">
              <p className="text-xs text-muted-foreground">
                {UCRETLI_PLANLAR.map((p) => `${PLAN_ADI[p]} yıllıkta %${Math.max(0, Math.round((1 - fiyatlar[p].yillik / (fiyatlar[p].aylik * 12)) * 100))} tasarruf`).join(" · ")}
              </p>
              <button
                type="button"
                onClick={fiyatKaydet}
                disabled={!degisti || kaydediliyor}
                className="inline-flex shrink-0 items-center gap-2 rounded-full bg-primary px-5 py-2 text-sm font-bold text-primary-foreground disabled:opacity-50"
              >
                {kaydediliyor ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                Kaydet
              </button>
            </div>
          </div>
        </AdminKart>

        <AdminKart baslik="Sitede şu an görünen" aciklama={aktifKampanya ? `Aktif kampanya: ${aktifKampanya}` : "Şu an aktif kampanya yok."}>
          <table className="w-full text-sm">
            <thead className="text-xs text-muted-foreground">
              <tr>
                <th className="py-1.5 text-left font-medium">Plan</th>
                <th className="py-1.5 text-right font-medium">Aylık</th>
                <th className="py-1.5 text-right font-medium">Yıllık</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-primary/5">
              {UCRETLI_PLANLAR.map((p) => (
                <tr key={p}>
                  <td className="py-2 font-semibold text-slate-900">{PLAN_ADI[p]}</td>
                  {(["aylik", "yillik"] as const).map((d) => {
                    const f = sitedeki[p][d];
                    return (
                      <td key={d} className="py-2 text-right tabular-nums">
                        {f.odenecek < f.liste && <s className="mr-1.5 text-xs text-slate-400">{tl(f.liste)}</s>}
                        <span className="font-semibold text-slate-900">{tl(f.odenecek)}</span>
                        {f.etiket && <span className="ml-1.5 rounded-full bg-rose-100 px-1.5 py-0.5 text-[10px] font-bold text-rose-700">{f.etiket}</span>}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </AdminKart>
      </div>

      <AdminKart baslik="Yeni kampanya" aciklama="Kupon kodu boş bırakılırsa kampanya tarih aralığında sitede otomatik görünür (üstü çizili fiyat ve indirim rozeti).">
        <div className="grid gap-4 md:grid-cols-2">
          <label className="block text-sm font-medium text-slate-700">
            Kampanya adı <span className="font-normal text-muted-foreground">(sitede görünür)</span>
            <input value={ad} onChange={(e) => setAd(e.target.value)} maxLength={80} className={cn(alan, "mt-1")} placeholder="Ör. KPSS'ye özel %20 indirim" />
          </label>
          <div className="grid grid-cols-[1fr_7rem] gap-3">
            <label className="block text-sm font-medium text-slate-700">
              İndirim türü
              <select value={indirimTuru} onChange={(e) => setIndirimTuru(e.target.value as "yuzde" | "tutar")} className={cn(alan, "mt-1")}>
                <option value="yuzde">Yüzde (%)</option>
                <option value="tutar">Tutar (TL)</option>
              </select>
            </label>
            <label className="block text-sm font-medium text-slate-700">
              {indirimTuru === "yuzde" ? "Yüzde" : "TL"}
              <input type="number" min={1} max={indirimTuru === "yuzde" ? 90 : undefined} value={deger} onChange={(e) => setDeger(Number(e.target.value))} className={cn(alan, "mt-1 tabular-nums")} />
            </label>
          </div>
          <fieldset className="text-sm font-medium text-slate-700">
            Planlar
            <div className="mt-2 flex flex-wrap gap-3">
              {UCRETLI_PLANLAR.map((p) => (
                <label key={p} className="flex items-center gap-2 font-normal">
                  <input type="checkbox" checked={planlar.includes(p)} onChange={(e) => setPlanlar((s) => (e.target.checked ? [...s, p] : s.filter((x) => x !== p)))} className="h-4 w-4 accent-primary" />
                  {PLAN_ADI[p]}
                </label>
              ))}
              <span className="mx-1 text-slate-300">|</span>
              <label className="flex items-center gap-2 font-normal">
                <input type="checkbox" checked={aylik} onChange={(e) => setAylik(e.target.checked)} className="h-4 w-4 accent-primary" />
                Aylık
              </label>
              <label className="flex items-center gap-2 font-normal">
                <input type="checkbox" checked={yillik} onChange={(e) => setYillik(e.target.checked)} className="h-4 w-4 accent-primary" />
                Yıllık
              </label>
            </div>
          </fieldset>
          <label className="block text-sm font-medium text-slate-700">
            Kupon kodu <span className="font-normal text-muted-foreground">(isteğe bağlı)</span>
            <input value={kupon} onChange={(e) => setKupon(e.target.value.toUpperCase())} maxLength={20} className={cn(alan, "mt-1 uppercase")} placeholder="KPSS2026" />
          </label>
          <label className="block text-sm font-medium text-slate-700">
            Başlangıç
            <input type="datetime-local" value={baslangic} onChange={(e) => setBaslangic(e.target.value)} className={cn(alan, "mt-1")} />
          </label>
          <label className="block text-sm font-medium text-slate-700">
            Bitiş
            <input type="datetime-local" value={bitis} onChange={(e) => setBitis(e.target.value)} className={cn(alan, "mt-1")} />
          </label>
        </div>

        <div className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-slate-50 px-4 py-3">
          <p className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-slate-700">
            <BadgePercent className="h-4 w-4 text-primary" />
            {planlar.flatMap((p) =>
              (["aylik", "yillik"] as const)
                .filter((d) => (d === "aylik" ? aylik : yillik))
                .map((d) => (
                  <span key={`${p}-${d}`} className="tabular-nums">
                    {PLAN_ADI[p]} {d === "aylik" ? "aylık" : "yıllık"}: <s className="text-slate-400">{tl(liste[p][d])}</s> → <strong>{tl(indirimliFiyat(liste[p][d], indirim))}</strong>
                  </span>
                )),
            )}
          </p>
          <button
            type="button"
            onClick={kampanyaOlustur}
            disabled={!kampanyaHazir || olusturuluyor}
            className="inline-flex shrink-0 items-center gap-2 rounded-full bg-gradient-to-r from-rose-500 to-orange-500 px-5 py-2 text-sm font-bold text-white shadow-sm disabled:opacity-50"
          >
            {olusturuluyor ? <Loader2 className="h-4 w-4 animate-spin" /> : <BadgePercent className="h-4 w-4" />}
            Kampanyayı oluştur
          </button>
        </div>
      </AdminKart>

      <AdminKart baslik="Kampanyalar">
        <ul className="divide-y divide-primary/10">
          {kampanyalar.length === 0 && <li className="py-6 text-center text-sm text-muted-foreground">Henüz kampanya yok.</li>}
          {kampanyalar.map((k) => (
            <li key={k.id} className="flex flex-wrap items-center justify-between gap-3 py-3">
              <div className="min-w-0">
                <p className="flex flex-wrap items-center gap-2 text-sm font-semibold text-slate-900">
                  {k.ad}
                  <span className="rounded-full bg-rose-100 px-2 py-0.5 text-[11px] font-bold text-rose-700">{k.indirim}</span>
                  <span className={cn("rounded-full px-2 py-0.5 text-[11px] font-bold", DURUM[k.durum].sinif)}>{DURUM[k.durum].ad}</span>
                  {k.kuponKodu && <code className="rounded bg-slate-100 px-1.5 py-0.5 text-[11px] text-slate-700">{k.kuponKodu}</code>}
                </p>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  {k.kapsam} · {k.aralik}
                </p>
              </div>
              <div className="flex gap-1.5">
                {k.durum !== "bitti" && (
                  <button type="button" onClick={() => kampanyaIslem(k, "PATCH")} className="inline-flex items-center gap-1 rounded-lg border border-primary/15 px-2.5 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50">
                    {k.aktif ? <Pause className="h-3.5 w-3.5" /> : <Play className="h-3.5 w-3.5" />}
                    {k.aktif ? "Durdur" : "Başlat"}
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
        title="Kampanya silinsin mi?"
        description={`“${silinecek?.ad ?? ""}” kalıcı olarak silinecek. Geçici durdurmak için “Durdur” yeterli.`}
        onConfirm={async () => {
          if (silinecek) await kampanyaIslem(silinecek, "DELETE");
          setSilinecek(null);
        }}
        onayEtiketi="Sil"
      />
    </>
  );
}

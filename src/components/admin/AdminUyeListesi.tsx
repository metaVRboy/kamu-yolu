"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { toast } from "@/components/ui/toast";
import { cn } from "@/lib/utils";

export type UyeSatiri = {
  id: string;
  adSoyad: string;
  email: string;
  rozetler: { ad: string; renk: string }[];
  sag: string; // kayit tarihi ya da "bitiş … · N gün"
};

type Islem = "plan" | "askiya-al" | "askidan-cikar" | "oturumlari-kapat" | "bildirim";
const ISLEMLER: [Islem, string][] = [
  ["plan", "Plan ver"],
  ["bildirim", "Bildirim gönder"],
  ["askiya-al", "Askıya al"],
  ["askidan-cikar", "Askıdan çıkar"],
  ["oturumlari-kapat", "Oturumlarını kapat"],
];
const PLAN_ADI = { UCRETSIZ: "Ücretsiz", PRO: "Pro", PRO_PLUS: "Pro+" } as const;
const alan = "h-9 rounded-xl border border-primary/20 bg-white px-2 text-sm";

/**
 * Admin uye listesi: satir/sayfa secimi, "filtredeki tum N uyeyi sec" ve secilenlere
 * toplu plan / bildirim / askiya alma / oturum kapatma (POST /api/admin/uyeler/toplu).
 */
export function AdminUyeListesi({ uyeler, toplam, filtre, q }: { uyeler: UyeSatiri[]; toplam: number; filtre: string; q: string }) {
  const router = useRouter();
  const [secili, setSecili] = useState<Set<string>>(new Set());
  const [tumFiltre, setTumFiltre] = useState(false);
  const [islem, setIslem] = useState<Islem>("plan");
  const [plan, setPlan] = useState<keyof typeof PLAN_ADI>("PRO");
  const [bitis, setBitis] = useState("");
  const [neden, setNeden] = useState("");
  const [baslik, setBaslik] = useState("");
  const [icerik, setIcerik] = useState("");
  const [link, setLink] = useState("");
  const [onay, setOnay] = useState(false);
  const [yukleniyor, setYukleniyor] = useState(false);

  const sayfaSecili = uyeler.length > 0 && uyeler.every((u) => secili.has(u.id));
  const adet = tumFiltre ? toplam : secili.size;

  function degistir(id: string) {
    setTumFiltre(false);
    setSecili((s) => {
      const y = new Set(s);
      if (y.has(id)) y.delete(id);
      else y.add(id);
      return y;
    });
  }

  function sayfayiDegistir() {
    setTumFiltre(false);
    setSecili((s) => {
      const y = new Set(s);
      for (const u of uyeler) {
        if (sayfaSecili) y.delete(u.id);
        else y.add(u.id);
      }
      return y;
    });
  }

  function temizle() {
    setSecili(new Set());
    setTumFiltre(false);
  }

  const islemGovdesi = () =>
    islem === "plan"
      ? { islem, abonelikPlani: plan, abonelikBitis: plan === "UCRETSIZ" ? null : bitis || null }
      : islem === "askiya-al"
        ? { islem, neden }
        : islem === "bildirim"
          ? { islem, baslik, icerik, link }
          : { islem };

  const onayMetni =
    islem === "plan"
      ? `${adet} üyenin planı ${PLAN_ADI[plan]}${plan !== "UCRETSIZ" ? (bitis ? ` (${bitis} gününe kadar)` : " (süresiz)") : ""} yapılacak.`
      : islem === "bildirim"
        ? `${adet} üyeye “${baslik}” bildirimi gönderilecek. Bildirim zilin “Bana Özel” sekmesinde her plandaki üyeye görünür.`
        : islem === "askiya-al"
          ? `${adet} üye askıya alınacak; tüm oturumları kapanır ve giriş yapamazlar. Kendi hesabın hariç tutulur.`
          : islem === "askidan-cikar"
            ? `${adet} üye askıdan çıkarılacak.`
            : `${adet} üyenin tüm oturumları kapanacak. Kendi hesabın hariç tutulur.`;

  async function uygula() {
    setYukleniyor(true);
    try {
      const res = await fetch("/api/admin/uyeler/toplu", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ secim: tumFiltre ? { filtre, q } : { ids: [...secili] }, islem: islemGovdesi() }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error ?? "İşlem yapılamadı.");
      toast.success(`${data.adet} üyeye uygulandı.`);
      temizle();
      if (islem === "bildirim") {
        setBaslik("");
        setIcerik("");
        setLink("");
      }
      router.refresh();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "İşlem yapılamadı.");
    } finally {
      setYukleniyor(false);
      setOnay(false);
    }
  }

  const eksik = islem === "bildirim" && baslik.trim().length < 3;

  return (
    <>
      <div className="mt-4 flex flex-wrap items-center gap-3 text-xs">
        <label className="flex items-center gap-2 font-semibold text-slate-700">
          <input type="checkbox" checked={sayfaSecili} onChange={sayfayiDegistir} className="h-4 w-4 accent-primary" />
          Bu sayfadakilerin tümünü seç
        </label>
        <span className="font-semibold text-muted-foreground">{toplam.toLocaleString("tr-TR")} üye</span>
      </div>
      {sayfaSecili && !tumFiltre && toplam > uyeler.length && (
        <p className="mt-2 rounded-xl bg-primary/5 px-3 py-2 text-xs text-slate-700">
          Bu sayfadaki {uyeler.length} üye seçildi.{" "}
          <button type="button" onClick={() => setTumFiltre(true)} className="font-bold text-primary hover:underline">
            Filtredeki tüm {toplam.toLocaleString("tr-TR")} üyeyi seç
          </button>
        </p>
      )}
      {tumFiltre && (
        <p className="mt-2 rounded-xl bg-primary/10 px-3 py-2 text-xs font-semibold text-primary">
          Filtredeki tüm {toplam.toLocaleString("tr-TR")} üye seçili.{" "}
          <button type="button" onClick={temizle} className="underline">
            Seçimi temizle
          </button>
        </p>
      )}

      <ul className="mt-2 divide-y divide-primary/10">
        {uyeler.map((u) => (
          <li key={u.id} className={cn("flex items-center gap-2 rounded-xl px-2", (tumFiltre || secili.has(u.id)) && "bg-primary/5")}>
            <input
              type="checkbox"
              checked={tumFiltre || secili.has(u.id)}
              onChange={() => degistir(u.id)}
              aria-label={`${u.adSoyad} seç`}
              className="h-4 w-4 shrink-0 accent-primary"
            />
            <Link href={`/admin/uyeler/${u.id}`} className="flex min-w-0 flex-1 flex-wrap items-center justify-between gap-3 rounded-xl px-1 py-3 hover:bg-slate-50">
              <span className="min-w-0">
                <span className="flex flex-wrap items-center gap-1.5 text-sm font-semibold text-slate-900">
                  {u.adSoyad}
                  {u.rozetler.map((r) => (
                    <span key={r.ad} className={cn("rounded-full px-2 py-0.5 text-[11px] font-bold", r.renk)}>
                      {r.ad}
                    </span>
                  ))}
                </span>
                <span className="block truncate text-xs text-muted-foreground">{u.email}</span>
              </span>
              <span className="text-xs text-muted-foreground">{u.sag}</span>
            </Link>
          </li>
        ))}
        {uyeler.length === 0 && <li className="py-6 text-center text-sm text-muted-foreground">Sonuç yok.</li>}
      </ul>

      {adet > 0 && (
        <div className="sticky bottom-3 z-20 mt-4 space-y-2 rounded-2xl border border-primary/20 bg-white p-3 shadow-xl shadow-primary/10">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-sm font-bold text-slate-900">{adet.toLocaleString("tr-TR")} üye seçildi</span>
            <select value={islem} onChange={(e) => setIslem(e.target.value as Islem)} aria-label="Toplu işlem" className={alan}>
              {ISLEMLER.map(([k, ad]) => (
                <option key={k} value={k}>
                  {ad}
                </option>
              ))}
            </select>
            {islem === "plan" && (
              <>
                <select value={plan} onChange={(e) => setPlan(e.target.value as keyof typeof PLAN_ADI)} aria-label="Plan" className={alan}>
                  {Object.entries(PLAN_ADI).map(([k, ad]) => (
                    <option key={k} value={k}>
                      {ad}
                    </option>
                  ))}
                </select>
                {plan !== "UCRETSIZ" && (
                  <input type="date" value={bitis} onChange={(e) => setBitis(e.target.value)} title="Boş bırakırsan süresiz" aria-label="Bitiş tarihi" className={alan} />
                )}
              </>
            )}
            {islem === "askiya-al" && (
              <input value={neden} onChange={(e) => setNeden(e.target.value)} maxLength={300} placeholder="Neden (üyeye gösterilir)" className={cn(alan, "min-w-48 flex-1")} />
            )}
            <button
              type="button"
              disabled={yukleniyor || eksik}
              onClick={() => setOnay(true)}
              className="h-9 rounded-xl bg-primary px-4 text-sm font-semibold text-primary-foreground disabled:opacity-50"
            >
              Uygula
            </button>
            <button type="button" onClick={temizle} className="h-9 px-2 text-sm text-muted-foreground hover:text-slate-900">
              Vazgeç
            </button>
          </div>
          {islem === "bildirim" && (
            <div className="grid gap-2 sm:grid-cols-2">
              <input value={baslik} onChange={(e) => setBaslik(e.target.value)} maxLength={120} placeholder="Başlık (zorunlu)" className={alan} />
              <input value={link} onChange={(e) => setLink(e.target.value)} maxLength={300} placeholder="Bağlantı (isteğe bağlı, ör. /kpss-denemesi)" className={alan} />
              <textarea
                value={icerik}
                onChange={(e) => setIcerik(e.target.value)}
                maxLength={500}
                rows={2}
                placeholder="Mesaj (isteğe bağlı)"
                className="rounded-xl border border-primary/20 bg-white px-2 py-1.5 text-sm sm:col-span-2"
              />
            </div>
          )}
        </div>
      )}

      <ConfirmDialog
        open={onay}
        onOpenChange={setOnay}
        title="Toplu işlem uygulansın mı?"
        description={onayMetni}
        onConfirm={uygula}
        loading={yukleniyor}
        onayEtiketi="Uygula"
        tehlikeli={islem === "askiya-al" || islem === "oturumlari-kapat"}
      />
    </>
  );
}

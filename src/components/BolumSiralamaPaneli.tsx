"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { ArrowUpDown, SlidersHorizontal, X } from "lucide-react";
import type { BolumSiralamaSatiri } from "@/lib/kpssIstatistik";
import { DUZEY_TEMA } from "@/lib/kpssDenemeSabitler";
import { LEVEL_LABEL } from "@/lib/labels";
import { cn } from "@/lib/utils";

const TUMU = "__tumu__";
const DUZEY_SEKMELERI = [
  [TUMU, "Tümü"],
  ["LISE", "Lise"],
  ["ONLISANS", "Önlisans"],
  ["LISANS", "Lisans"],
] as const;

export function BolumSiralamaPaneli({
  siralama,
  ilkYil,
  sonYil,
  seciliBolumId,
}: {
  siralama: BolumSiralamaSatiri[];
  ilkYil: number;
  sonYil: number;
  seciliBolumId?: string;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const listRef = useRef<HTMLOListElement>(null);

  const uygulananBaslangic = searchParams.get("siraBaslangic") ?? TUMU;
  const uygulananBitis = searchParams.get("siraBitis") ?? TUMU;
  const uygulananDuzey = searchParams.get("siraDuzey") ?? TUMU;

  const [filtreAcik, setFiltreAcik] = useState(false);
  // Taslak secimler - "Uygula"ya basilana kadar URL'e (dolayisiyla sorguya) yansimaz.
  const [taslakBaslangic, setTaslakBaslangic] = useState(uygulananBaslangic);
  const [taslakBitis, setTaslakBitis] = useState(uygulananBitis);

  // Siralama yonu sayfa yenilemeden, tamamen client-side degisir (sunucudan
  // gelen liste zaten "azalan" sirali - "artan" icin sadece ters ceviriyoruz).
  const [siraYon, setSiraYon] = useState<"cok" | "az">("cok");
  const siraliListe = useMemo(() => {
    if (siraYon === "cok") return siralama;
    return [...siralama].sort((a, b) => a.toplam - b.toplam);
  }, [siralama, siraYon]);

  const yillar = Array.from({ length: sonYil - ilkYil + 1 }, (_, i) => ilkYil + i);
  const filtreAktif = uygulananBaslangic !== TUMU || uygulananBitis !== TUMU;

  const efektifBaslangic = uygulananBaslangic === TUMU ? ilkYil : Number(uygulananBaslangic);
  const efektifBitis = uygulananBitis === TUMU ? sonYil : Number(uygulananBitis);
  const yilAraligiMetni =
    efektifBaslangic === efektifBitis ? `${efektifBaslangic}` : `${efektifBaslangic}-${efektifBitis}`;

  function filtreyiAc() {
    setTaslakBaslangic(uygulananBaslangic);
    setTaslakBitis(uygulananBitis);
    setFiltreAcik((v) => !v);
  }

  function parametreleriYaz(degistir: (params: URLSearchParams) => void) {
    const params = new URLSearchParams(searchParams.toString());
    degistir(params);
    router.push(`${pathname}?${params.toString()}`, { scroll: false });
  }

  function bolumHref(id: string) {
    const params = new URLSearchParams(searchParams.toString());
    params.set("bolum", id);
    return `${pathname}?${params.toString()}#bolum-analizi`;
  }

  function uygula() {
    parametreleriYaz((params) => {
      if (taslakBaslangic === TUMU) params.delete("siraBaslangic");
      else params.set("siraBaslangic", taslakBaslangic);
      if (taslakBitis === TUMU) params.delete("siraBitis");
      else params.set("siraBitis", taslakBitis);
    });
    setFiltreAcik(false);
  }

  // Bir bolum secildiginde (ör. KPSS arama kutusundan), siralama listesinde
  // o bolumun satirina otomatik kaydir ve vurgula. Sadece liste kayar -
  // scrollIntoView tum sayfayi da asagidaki tabloya kaydirirdi.
  useEffect(() => {
    const liste = listRef.current;
    if (!seciliBolumId || !liste) return;
    const satir = liste.querySelector<HTMLElement>(`[data-bolum-id="${CSS.escape(seciliBolumId)}"]`);
    if (satir) liste.scrollTop = satir.offsetTop - liste.clientHeight / 2;
  }, [seciliBolumId]);

  return (
    <div className="rounded-3xl border border-primary/10 bg-white p-6 shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h3 className="font-sans text-base font-bold text-slate-900">En Çok Atama Yapılan Bölümler</h3>
        <div className="flex items-center gap-1.5">
          <div className="relative">
            <select
              value={siraYon}
              onChange={(e) => setSiraYon(e.target.value === "az" ? "az" : "cok")}
              aria-label="Sırala"
              className="appearance-none rounded-lg border border-primary/20 bg-white py-1 pl-2 pr-6 text-xs font-medium text-slate-600"
            >
              <option value="cok">Azalan</option>
              <option value="az">Artan</option>
            </select>
            <ArrowUpDown className="pointer-events-none absolute right-1.5 top-1/2 h-3 w-3 -translate-y-1/2 text-slate-400" />
          </div>
          <button
            type="button"
            onClick={filtreyiAc}
            aria-label="Yıl filtresi"
            className={`relative flex h-7 w-7 items-center justify-center rounded-lg border ${
              filtreAktif ? "border-primary/40 bg-primary/10 text-primary" : "border-primary/20 text-slate-500"
            } hover:text-primary`}
          >
            <SlidersHorizontal className="h-3.5 w-3.5" />
            {filtreAktif && <span className="absolute -right-0.5 -top-0.5 h-1.5 w-1.5 rounded-full bg-primary" />}
          </button>
        </div>
      </div>

      {filtreAcik && (
        <div className="mt-2 flex flex-wrap items-end gap-2 rounded-lg border border-primary/15 bg-white p-2.5">
          <label className="flex flex-col gap-1 text-[11px] text-muted-foreground">
            Başlangıç
            <select
              value={taslakBaslangic}
              onChange={(e) => setTaslakBaslangic(e.target.value)}
              className="rounded-lg border border-primary/20 px-1.5 py-1 text-xs"
            >
              <option value={TUMU}>Tümü</option>
              {yillar.map((y) => (
                <option key={y} value={y}>
                  {y}
                </option>
              ))}
            </select>
          </label>
          <label className="flex flex-col gap-1 text-[11px] text-muted-foreground">
            Bitiş
            <select
              value={taslakBitis}
              onChange={(e) => setTaslakBitis(e.target.value)}
              className="rounded-lg border border-primary/20 px-1.5 py-1 text-xs"
            >
              <option value={TUMU}>Tümü</option>
              {yillar.map((y) => (
                <option key={y} value={y}>
                  {y}
                </option>
              ))}
            </select>
          </label>
          <button
            type="button"
            onClick={uygula}
            className="rounded-lg bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground hover:bg-primary/90"
          >
            Uygula
          </button>
          <button
            type="button"
            onClick={() => setFiltreAcik(false)}
            aria-label="Kapat"
            className="ml-auto flex h-7 w-7 items-center justify-center text-muted-foreground hover:text-foreground"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      )}

      {/* Duzey sekmeleri KPSS denemesindeki duzey renklerinde; tiklayinca hemen uygulanir. */}
      <div className="mt-3 flex flex-wrap gap-1.5" role="tablist" aria-label="Öğrenim düzeyi">
        {DUZEY_SEKMELERI.map(([deger, etiket]) => {
          const secili = uygulananDuzey === deger;
          return (
            <button
              key={deger}
              type="button"
              role="tab"
              aria-selected={secili}
              onClick={() =>
                parametreleriYaz((params) => (deger === TUMU ? params.delete("siraDuzey") : params.set("siraDuzey", deger)))
              }
              className={cn(
                "rounded-full border px-3.5 py-1.5 text-xs font-semibold transition-colors",
                !secili && "border-primary/15 text-slate-600 hover:bg-slate-50",
                secili && deger === TUMU && "border-primary bg-primary text-primary-foreground",
                secili && deger !== TUMU && [DUZEY_TEMA[deger].acik, DUZEY_TEMA[deger].metin, DUZEY_TEMA[deger].kenar],
              )}
            >
              {etiket}
            </button>
          );
        })}
      </div>

      <div className="mt-3 flex items-center justify-between gap-2 rounded-t-xl border border-b-0 border-primary/15 bg-slate-50 px-3 py-1.5 text-[11px] font-semibold text-slate-500">
        <span>Bölüm Adı</span>
        <span>Yıl Aralığı: {yilAraligiMetni}</span>
        <span>Alım Sayısı</span>
      </div>
      <ol
        ref={listRef}
        className="relative max-h-96 space-y-0.5 overflow-y-auto rounded-b-xl border border-primary/15 p-1 text-sm"
      >
        {siraliListe.length === 0 && (
          <p className="py-2 text-xs text-muted-foreground">Seçilen aralıkta veri bulunamadı.</p>
        )}
        {siraliListe.map((b, i) => (
          <li key={b.id} data-bolum-id={b.id}>
            {/* Tiklayinca bolum karnesi acilir; karne tablonun ustunde oldugu icin #bolum-analizi'ne kayar. */}
            <Link
              href={bolumHref(b.id)}
              aria-current={b.id === seciliBolumId ? "true" : undefined}
              className={`group flex items-center justify-between gap-2 rounded-lg px-2 py-1.5 ${
                b.id === seciliBolumId ? "bg-primary/10 ring-1 ring-primary/30" : "hover:bg-slate-50"
              }`}
            >
              <span className="flex min-w-0 items-center gap-2 text-slate-700">
                <span className="w-7 shrink-0 text-right text-xs text-muted-foreground tabular-nums">{i + 1}.</span>
                <span
                  title={LEVEL_LABEL[b.ogrenimDuzeyi]}
                  className={cn("h-2 w-2 shrink-0 rounded-full bg-gradient-to-br", DUZEY_TEMA[b.ogrenimDuzeyi].zemin)}
                />
                <span className="truncate group-hover:text-primary group-hover:underline">{b.ad}</span>
              </span>
              <span className="shrink-0 font-medium text-primary">{b.toplam.toLocaleString("tr-TR")}</span>
            </Link>
          </li>
        ))}
      </ol>
    </div>
  );
}

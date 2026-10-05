"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { ArrowUpDown, SlidersHorizontal, X } from "lucide-react";
import type { BolumSiralamaSatiri } from "@/lib/kpssIstatistik";

const TUMU = "__tumu__";

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
  const [taslakDuzey, setTaslakDuzey] = useState(uygulananDuzey);

  // Siralama yonu sayfa yenilemeden, tamamen client-side degisir (sunucudan
  // gelen liste zaten "azalan" sirali - "artan" icin sadece ters ceviriyoruz).
  const [siraYon, setSiraYon] = useState<"cok" | "az">("cok");
  const siraliListe = useMemo(() => {
    if (siraYon === "cok") return siralama;
    return [...siralama].sort((a, b) => a.toplam - b.toplam);
  }, [siralama, siraYon]);

  const yillar = Array.from({ length: sonYil - ilkYil + 1 }, (_, i) => ilkYil + i);
  const filtreAktif = uygulananBaslangic !== TUMU || uygulananBitis !== TUMU || uygulananDuzey !== TUMU;

  const efektifBaslangic = uygulananBaslangic === TUMU ? ilkYil : Number(uygulananBaslangic);
  const efektifBitis = uygulananBitis === TUMU ? sonYil : Number(uygulananBitis);
  const yilAraligiMetni =
    efektifBaslangic === efektifBitis ? `${efektifBaslangic}` : `${efektifBaslangic}-${efektifBitis}`;

  function filtreyiAc() {
    setTaslakBaslangic(uygulananBaslangic);
    setTaslakBitis(uygulananBitis);
    setTaslakDuzey(uygulananDuzey);
    setFiltreAcik((v) => !v);
  }

  function uygula() {
    const params = new URLSearchParams(searchParams.toString());
    if (taslakBaslangic === TUMU) params.delete("siraBaslangic");
    else params.set("siraBaslangic", taslakBaslangic);
    if (taslakBitis === TUMU) params.delete("siraBitis");
    else params.set("siraBitis", taslakBitis);
    if (taslakDuzey === TUMU) params.delete("siraDuzey");
    else params.set("siraDuzey", taslakDuzey);
    router.push(`${pathname}?${params.toString()}`);
    setFiltreAcik(false);
  }

  // Bir bolum secildiginde (ör. KPSS arama kutusundan), siralama listesinde
  // o bolumun satirina otomatik kaydir ve vurgula.
  useEffect(() => {
    if (!seciliBolumId || !listRef.current) return;
    const satir = listRef.current.querySelector(`[data-bolum-id="${CSS.escape(seciliBolumId)}"]`);
    satir?.scrollIntoView({ block: "center" });
  }, [seciliBolumId]);

  return (
    <div className="rounded-xl border border-primary/15 bg-slate-50/60 p-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h3 className="text-sm font-semibold text-slate-700">En Çok Atama Yapılan Bölümler</h3>
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
          <label className="flex flex-col gap-1 text-[11px] text-muted-foreground">
            Öğrenim Düzeyi
            <select
              value={taslakDuzey}
              onChange={(e) => setTaslakDuzey(e.target.value)}
              className="rounded-lg border border-primary/20 px-1.5 py-1 text-xs"
            >
              <option value={TUMU}>Tümü</option>
              <option value="LISE">Lise</option>
              <option value="ONLISANS">Önlisans</option>
              <option value="LISANS">Lisans</option>
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

      <div className="mt-2.5 flex items-center justify-between gap-2 rounded-t-lg border border-b-0 border-primary/15 bg-slate-100 px-2 py-1 text-[11px] font-semibold text-slate-500">
        <span>Bölüm Adı</span>
        <span>Yıl Aralığı: {yilAraligiMetni}</span>
        <span>Alım Sayısı</span>
      </div>
      <ol
        ref={listRef}
        className="max-h-72 space-y-1 overflow-y-auto rounded-b-lg border border-primary/15 p-1 pr-1 text-sm"
      >
        {siraliListe.length === 0 && (
          <p className="py-2 text-xs text-muted-foreground">Seçilen aralıkta veri bulunamadı.</p>
        )}
        {siraliListe.map((b, i) => (
          <li
            key={b.id}
            data-bolum-id={b.id}
            className={`flex items-baseline justify-between gap-2 rounded-lg px-2 py-1 ${
              b.id === seciliBolumId ? "bg-primary/10 ring-1 ring-primary/30" : ""
            }`}
          >
            <span className="truncate text-slate-700">
              <span className="text-muted-foreground">{i + 1}.</span> {b.ad}
            </span>
            <span className="shrink-0 font-medium text-primary">{b.toplam.toLocaleString("tr-TR")}</span>
          </li>
        ))}
      </ol>
    </div>
  );
}

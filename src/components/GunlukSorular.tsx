"use client";

import { useEffect, useState } from "react";
import { BellRing, CheckCircle2, Flame, Gift, Loader2, XCircle } from "lucide-react";
import { useAuthModal } from "@/components/AuthModal";
import { SoruGovdesi } from "@/components/SoruGovdesi";
import { KesirliMetin } from "@/components/KesirliMetin";
import { toast } from "@/components/ui/toast";
import { DERS_LABEL, DUZEY_LABEL, type ExamSoru } from "@/lib/kpssDenemeSabitler";
import { bildirimDurumu, bildirimleriAc, type BildirimDurumu } from "@/lib/pushIstemci";
import { uyeOzetiniTazele } from "@/lib/uyeOzetiIstemci";
import { useOturumPlani } from "@/lib/oturumIstemci";
import { YukseltButonu } from "@/components/YukseltmePenceresi";
import { apiHatasi, cn } from "@/lib/utils";

type Duzey = "LISE" | "ONLISANS" | "LISANS";
type CozumluSoru = ExamSoru & { dogruCevap: number; aciklama: string | null; secilen: number | null; dogruYuzde: number | null };
type Seri = { gun: number; bugunCozuldu: boolean } | null;
type Yanit =
  | { duzey: Duzey; cozuldu: false; sorular: ExamSoru[]; seri: Seri; bugunBaskaDuzeyde: boolean }
  | { duzey: Duzey; cozuldu: true; sorular: CozumluSoru[]; seri: Seri; dogru: number; hediye: boolean };

const DUZEYLER: Duzey[] = ["LISE", "ONLISANS", "LISANS"];

/** Gunun 5 sorusu: tek ekranda cozulur, gonderince dogru cevap, aciklama ve uyelerin dogru yuzdesi acilir. */
export function GunlukSorular({ girisli }: { girisli: boolean }) {
  const authAc = useAuthModal();
  const oturum = useOturumPlani();
  const [duzey, setDuzey] = useState<Duzey | null>(null);
  const [veri, setVeri] = useState<Yanit | null>(null);
  const [cevaplar, setCevaplar] = useState<Record<string, number>>({});
  const [gonderiliyor, setGonderiliyor] = useState(false);
  const [bildirim, setBildirim] = useState<BildirimDurumu>("desteklenmiyor");

  useEffect(() => {
    let iptal = false;
    fetch(`/api/gunluk-sorular${duzey ? `?duzey=${duzey}` : ""}`)
      .then((r) => r.json())
      .then((d: Yanit) => {
        if (iptal) return;
        setVeri(d);
        setCevaplar({});
        if (!duzey) setDuzey(d.duzey);
      });
    bildirimDurumu().then((b) => !iptal && setBildirim(b));
    return () => {
      iptal = true;
    };
  }, [duzey]);

  async function gonder() {
    if (!veri) return;
    setGonderiliyor(true);
    try {
      const res = await fetch("/api/gunluk-sorular", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ duzey: veri.duzey, cevaplar }) });
      const d = await res.json().catch(() => null);
      if (!res.ok) return toast.error(apiHatasi(d, res.status));
      setVeri(d);
      uyeOzetiniTazele();
      if (d.hediye) toast.success(`${d.seri.gun} günlük seri!`, "1 gün Pro hesabına tanımlandı.");
      window.scrollTo({ top: 0, behavior: "smooth" });
    } finally {
      setGonderiliyor(false);
    }
  }

  async function hatirlat() {
    const sonuc = await bildirimleriAc();
    setBildirim(sonuc);
    if (sonuc === "acik") toast.success("Hatırlatma açık.", "Her akşam, günün sorularını çözmediysen tarayıcına bildirim gelir.");
    else if (sonuc === "engelli") toast.error("Bildirim izni engelli.", "Tarayıcı ayarlarından kamuyolu.com için bildirimlere izin ver.");
  }

  if (!veri) {
    return (
      <div className="mt-8 flex justify-center py-16 text-muted-foreground">
        <Loader2 className="h-6 w-6 animate-spin" />
      </div>
    );
  }
  const sorular = veri.sorular as ExamSoru[];
  const tumuCevapli = sorular.every((s) => cevaplar[s.id] !== undefined);

  return (
    <div className="mt-6 space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div role="tablist" aria-label="Öğrenim düzeyi" className="flex gap-1 rounded-2xl border border-primary/15 bg-white p-1">
          {DUZEYLER.map((d) => (
            <button
              key={d}
              type="button"
              role="tab"
              aria-selected={veri.duzey === d}
              onClick={() => setDuzey(d)}
              className={cn("rounded-xl px-3.5 py-2 text-sm font-semibold transition-colors", veri.duzey === d ? "bg-primary text-primary-foreground" : "text-slate-600 hover:bg-primary/5")}
            >
              {DUZEY_LABEL[d]}
            </button>
          ))}
        </div>
        {veri.seri && (
          <p className="flex items-center gap-1.5 rounded-full bg-amber-50 px-3 py-1.5 text-sm font-bold text-amber-800">
            <Flame className="h-4 w-4" aria-hidden />
            {veri.seri.gun} günlük seri
          </p>
        )}
      </div>

      {veri.cozuldu && (
        <div className="rounded-3xl bg-slate-900 p-6 text-white">
          <p className="text-2xl font-bold">
            {veri.dogru}/{sorular.length} doğru
          </p>
          <p className="mt-1 text-sm text-slate-300">
            {girisli
              ? veri.seri?.bugunCozuldu
                ? "Bugünkü serin sayıldı. Yarın yeni 5 soru seni bekliyor."
                : "Bugün başka bir düzeyde çözdüğün için serin zaten sayıldı; bu çözüm alıştırma."
              : "Üye olursan her gün çözdüğün sorular serine eklenir; 7 günde 1 gün Pro hediye."}
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            {!girisli && (
              <button type="button" onClick={() => authAc("kayit")} className="rounded-xl bg-orange-400 px-4 py-2.5 font-bold text-slate-900 hover:bg-orange-300">
                Ücretsiz üye ol, serini başlat
              </button>
            )}
            {bildirim === "kapali" && (
              <button type="button" onClick={hatirlat} className="flex items-center gap-2 rounded-xl bg-white/10 px-4 py-2.5 font-semibold hover:bg-white/20">
                <BellRing className="h-4 w-4" aria-hidden />
                Her akşam hatırlat
              </button>
            )}
            {veri.hediye && (
              <p className="flex items-center gap-2 rounded-xl bg-amber-400/20 px-4 py-2.5 font-semibold text-amber-200">
                <Gift className="h-4 w-4" aria-hidden />1 gün Pro hediye kazandın
              </p>
            )}
          </div>
          {oturum?.girisli && oturum.plan !== "PRO_PLUS" && veri.dogru < sorular.length && (
            <p className="mt-4 border-t border-white/10 pt-4 text-sm text-slate-300">
              Bugün {sorular.length - veri.dogru} yanlışın var. Hangi konularda eksiğin olduğunu KPSS denemelerinde Pro+ konu konu gösterir.{" "}
              <YukseltButonu plan="PRO_PLUS" kaynak="zayif-konu" className="font-semibold text-orange-300 underline hover:text-orange-200">
                Eksik konularını gör
              </YukseltButonu>
            </p>
          )}
        </div>
      )}

      {!veri.cozuldu && veri.bugunBaskaDuzeyde && (
        <p className="rounded-2xl bg-amber-50 px-4 py-3 text-sm text-amber-900">Bugün başka bir düzeyde çözdün; serin sayıldı. Bu düzeyi alıştırma olarak çözebilirsin.</p>
      )}

      {sorular.map((s, i) => {
        const cozum = veri.cozuldu ? (s as CozumluSoru) : null;
        return (
          <article key={s.id} className="rounded-3xl border border-primary/10 bg-white p-5 shadow-sm sm:p-6">
            <div className="flex items-center justify-between gap-2 text-xs font-semibold">
              <span className="text-muted-foreground">
                Soru {i + 1}/{sorular.length}
              </span>
              <span className="rounded-full bg-primary/10 px-2.5 py-0.5 text-primary">{DERS_LABEL[s.ders]}</span>
            </div>
            <SoruGovdesi sorular={sorular} index={i} />
            <div className="mt-4 space-y-2">
              {s.secenekler.map((secenek, j) => {
                const dogru = cozum && j === cozum.dogruCevap;
                const yanlisSecim = cozum && j === cozum.secilen && j !== cozum.dogruCevap;
                return (
                  <button
                    key={j}
                    type="button"
                    disabled={!!cozum}
                    aria-pressed={cozum ? j === cozum.secilen : cevaplar[s.id] === j}
                    onClick={() => setCevaplar((c) => ({ ...c, [s.id]: j }))}
                    className={cn(
                      "flex w-full items-start gap-2.5 rounded-xl border px-3.5 py-2.5 text-left text-sm transition-colors",
                      dogru
                        ? "border-emerald-500 bg-emerald-50 text-emerald-900"
                        : yanlisSecim
                          ? "border-red-400 bg-red-50 text-red-900"
                          : !cozum && cevaplar[s.id] === j
                            ? "border-primary bg-primary/10 text-primary"
                            : "border-primary/15 text-slate-700 hover:bg-slate-50 disabled:hover:bg-transparent",
                    )}
                  >
                    <span className="font-semibold">{String.fromCharCode(65 + j)})</span>
                    <span className="flex-1">
                      <KesirliMetin metin={secenek} />
                    </span>
                    {dogru && <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" aria-label="Doğru cevap" />}
                    {yanlisSecim && <XCircle className="mt-0.5 h-4 w-4 shrink-0 text-red-500" aria-label="Senin cevabın" />}
                  </button>
                );
              })}
            </div>
            {cozum && (
              <div className="mt-4 space-y-2 rounded-2xl bg-slate-50 p-4 text-sm text-slate-700">
                {cozum.dogruYuzde !== null && <p className="font-semibold text-slate-900">Üyeler arasında doğru cevap oranı: %{cozum.dogruYuzde}</p>}
                {cozum.aciklama && (
                  <p className="whitespace-pre-line">
                    <KesirliMetin metin={cozum.aciklama} />
                  </p>
                )}
              </div>
            )}
          </article>
        );
      })}

      {!veri.cozuldu && (
        <div className="sticky bottom-4 flex justify-center">
          <button
            type="button"
            onClick={gonder}
            disabled={!tumuCevapli || gonderiliyor}
            className="flex items-center gap-2 rounded-2xl bg-slate-900 px-6 py-3.5 font-bold text-white shadow-lg transition-colors hover:bg-slate-800 disabled:opacity-60"
          >
            {gonderiliyor && <Loader2 className="h-4 w-4 animate-spin" />}
            {tumuCevapli ? "Cevaplarımı gönder" : `${Object.keys(cevaplar).length}/${sorular.length} cevaplandı`}
          </button>
        </div>
      )}
    </div>
  );
}

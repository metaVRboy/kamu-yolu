"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Clock } from "lucide-react";
import { DERS_LABEL, type ExamSoru } from "@/lib/kpssDenemeSabitler";
import { SoruGovdesi } from "@/components/SoruGovdesi";

export function DenemeSinavi({
  katilimId,
  ilkKalanMs,
  sorular,
  ilkCevaplar,
}: {
  katilimId: string;
  ilkKalanMs: number;
  sorular: ExamSoru[];
  ilkCevaplar: Record<string, number>;
}) {
  const router = useRouter();
  // Bitis ani, sunucunun verdigi KALAN sureden cihazin kendi saatinde bir kez
  // kurulur - baslangic zamanindan hesaplansaydi cihaz saati kayiksa sayac da kayardi.
  const [bitisZamaniMs] = useState(() => Date.now() + ilkKalanMs);

  const [index, setIndex] = useState(0);
  const [cevaplar, setCevaplar] = useState<Record<string, number>>(ilkCevaplar);
  const [kalanMs, setKalanMs] = useState(ilkKalanMs);
  const bittiRef = useRef(false);

  const bitir = useCallback(async () => {
    if (bittiRef.current) return;
    bittiRef.current = true;
    await fetch("/api/kpss-denemesi/bitir", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ katilimId }),
    }).catch(() => {});
    router.refresh();
  }, [katilimId, router]);

  useEffect(() => {
    const zamanlayici = setInterval(() => {
      const kalan = bitisZamaniMs - Date.now();
      setKalanMs(kalan);
      if (kalan <= 0) {
        clearInterval(zamanlayici);
        bitir();
      }
    }, 1000);
    return () => clearInterval(zamanlayici);
  }, [bitisZamaniMs, bitir]);

  const soru = sorular[index];

  async function cevapSec(secenekIndex: number) {
    setCevaplar((onceki) => ({ ...onceki, [soru.id]: secenekIndex }));
    await fetch("/api/kpss-denemesi/cevap", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ katilimId, soruId: soru.id, secenekIndex }),
    }).catch(() => {});
  }

  function sinaviBitirTiklandi() {
    const cevaplananSayisi = Object.keys(cevaplar).length;
    const bosSayisi = sorular.length - cevaplananSayisi;
    const onay = window.confirm(
      bosSayisi > 0
        ? `${bosSayisi} soruyu boş bıraktınız. Sınavı yine de bitirmek istiyor musunuz?`
        : "Sınavı bitirmek istediğinize emin misiniz?",
    );
    if (onay) bitir();
  }

  const sureAzaldiMi = kalanMs < 5 * 60_000;

  return (
    <div className="mx-auto max-w-4xl px-4 py-6 sm:px-6">
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-primary/15 bg-slate-50/60 px-4 py-3">
        <div
          className={`flex items-center gap-1.5 font-mono text-lg font-semibold ${sureAzaldiMi ? "text-destructive" : "text-primary"}`}
        >
          <Clock className="h-5 w-5" />
          {new Date(Math.max(0, kalanMs)).toISOString().slice(11, 19)}
        </div>
        <button
          type="button"
          onClick={sinaviBitirTiklandi}
          className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary/90"
        >
          Sınavı Bitir
        </button>
      </div>

      <div className="mt-4 rounded-xl border border-primary/15 bg-white p-5">
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>
            Soru {index + 1} / {sorular.length}
          </span>
          <span className="rounded-full bg-primary/10 px-2.5 py-0.5 font-medium text-primary">{DERS_LABEL[soru.ders]}</span>
        </div>
        <SoruGovdesi sorular={sorular} index={index} />
        <div className="mt-4 space-y-2">
          {soru.secenekler.map((secenek, i) => (
            <button
              key={i}
              type="button"
              onClick={() => cevapSec(i)}
              className={`flex w-full items-start gap-2.5 rounded-lg border px-3.5 py-2.5 text-left text-sm transition-colors ${
                cevaplar[soru.id] === i
                  ? "border-primary bg-primary/10 text-primary"
                  : "border-primary/15 text-slate-700 hover:bg-slate-50"
              }`}
            >
              <span className="font-semibold">{String.fromCharCode(65 + i)})</span>
              <span>{secenek}</span>
            </button>
          ))}
        </div>

        <div className="mt-5 flex items-center justify-between">
          <button
            type="button"
            onClick={() => setIndex((i) => Math.max(0, i - 1))}
            disabled={index === 0}
            className="rounded-lg border border-primary/20 px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50 disabled:opacity-40"
          >
            Önceki
          </button>
          <button
            type="button"
            onClick={() => setIndex((i) => Math.min(sorular.length - 1, i + 1))}
            disabled={index === sorular.length - 1}
            className="rounded-lg border border-primary/20 px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50 disabled:opacity-40"
          >
            Sonraki
          </button>
        </div>
      </div>

      <div className="mt-4 rounded-xl border border-primary/15 bg-white p-4">
        <p className="mb-2 text-xs font-medium text-muted-foreground">
          Soru numarasına tıklayarak o soruya gidebilir, cevabını değiştirebilirsin.
        </p>
        <div className="grid grid-cols-10 gap-1.5 sm:grid-cols-12">
          {sorular.map((s, i) => {
            const cevaplandi = cevaplar[s.id] !== undefined;
            const aktif = i === index;
            return (
              <button
                key={s.id}
                type="button"
                onClick={() => setIndex(i)}
                className={`flex h-8 w-8 items-center justify-center rounded-md text-xs font-medium transition-colors ${
                  aktif
                    ? "ring-2 ring-primary ring-offset-1"
                    : ""
                } ${cevaplandi ? "bg-primary text-primary-foreground" : "bg-slate-100 text-slate-500 hover:bg-slate-200"}`}
              >
                {i + 1}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

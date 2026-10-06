"use client";

import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from "react";
import { useRouter } from "next/navigation";
import { Clock, Flag } from "lucide-react";
import { DERS_LABEL, type ExamSoru } from "@/lib/kpssDenemeSabitler";
import { SoruGovdesi } from "@/components/SoruGovdesi";
import { SoruHaritasi } from "@/components/SoruHaritasi";

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
  // "Sonra doneceğim" isaretleri sadece bu tarayicida, bu katilima ozel tutulur.
  const isaretAnahtari = `deneme-isaret-${katilimId}`;
  const isaretJson = useSyncExternalStore(
    (bildir) => {
      window.addEventListener("storage", bildir);
      return () => window.removeEventListener("storage", bildir);
    },
    () => {
      try {
        return localStorage.getItem(isaretAnahtari) ?? "[]";
      } catch {
        return "[]";
      }
    },
    () => "[]",
  );
  const isaretliler: string[] = JSON.parse(isaretJson);

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

  function isaretDegistir() {
    const yeni = isaretliler.includes(soru.id) ? isaretliler.filter((id) => id !== soru.id) : [...isaretliler, soru.id];
    try {
      localStorage.setItem(isaretAnahtari, JSON.stringify(yeni));
      // Ayni sekmedeki yazma "storage" olayini tetiklemez - store'u elle uyar.
      window.dispatchEvent(new Event("storage"));
    } catch {}
  }

  const sureAzaldiMi = kalanMs < 5 * 60_000;
  const isaretliMi = isaretliler.includes(soru.id);

  return (
    <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6">
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-primary/15 bg-white px-4 py-3">
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

      <div className="mt-4 lg:grid lg:grid-cols-[minmax(0,1fr)_17rem] lg:items-start lg:gap-4">
      <div className="rounded-xl border border-primary/15 bg-white p-5">
        <div className="flex items-center justify-between gap-2 text-xs text-muted-foreground">
          <span>
            Soru {index + 1} / {sorular.length}
          </span>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={isaretDegistir}
              className={`flex items-center gap-1 rounded-full border px-2.5 py-0.5 font-medium transition-colors ${
                isaretliMi ? "border-amber-400 bg-amber-50 text-amber-700" : "border-primary/20 text-slate-600 hover:bg-slate-50"
              }`}
            >
              <Flag className="h-3.5 w-3.5" />
              {isaretliMi ? "İşareti kaldır" : "İşaretle"}
            </button>
            <span className="rounded-full bg-primary/10 px-2.5 py-0.5 font-medium text-primary">{DERS_LABEL[soru.ders]}</span>
          </div>
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

      <aside className="mt-4 lg:sticky lg:top-20 lg:mt-0 lg:max-h-[calc(100vh-6rem)] lg:overflow-y-auto">
        <SoruHaritasi
          sorular={sorular}
          aktifIndex={index}
          onSec={setIndex}
          butonSinifi={(i) =>
            `${cevaplar[sorular[i].id] !== undefined ? "bg-primary text-primary-foreground" : "bg-slate-100 text-slate-600 hover:bg-slate-200"} ${
              isaretliler.includes(sorular[i].id) ? "outline-2 outline-amber-400" : ""
            }`
          }
          aciklamalar={[
            { etiket: "Cevaplanmış", sinif: "bg-primary" },
            { etiket: "İşaretli", sinif: "bg-white outline-2 outline-amber-400" },
            { etiket: "Boş", sinif: "bg-slate-100" },
          ]}
        />
      </aside>
      </div>
    </div>
  );
}

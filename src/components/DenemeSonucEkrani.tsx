"use client";

import { useState } from "react";
import { CheckCircle2, XCircle, MinusCircle } from "lucide-react";
import { DERS_LABEL, type ExamSoru } from "@/lib/kpssDenemeSabitler";
import { SoruGovdesi } from "@/components/SoruGovdesi";
import { SoruHaritasi } from "@/components/SoruHaritasi";

type SonucSorusu = ExamSoru & { dogruCevap: number; aciklama: string | null };

const DURUM_SINIFI = {
  dogru: "bg-emerald-500 text-white",
  yanlis: "bg-red-500 text-white",
  bos: "bg-slate-200 text-slate-600",
};

export function DenemeSonucEkrani({
  sorular,
  cevaplar,
  dogruSayisi,
  yanlisSayisi,
  bosSayisi,
  puan,
}: {
  sorular: SonucSorusu[];
  cevaplar: Record<string, number>;
  dogruSayisi: number;
  yanlisSayisi: number;
  bosSayisi: number;
  puan: number;
}) {
  const [incelenenIndex, setIncelenenIndex] = useState(Math.max(0, sorular.findIndex((s) => durum(s) === "yanlis")));
  const net = dogruSayisi - yanlisSayisi / 4;
  const incelenen = sorular[incelenenIndex];
  const verilenCevap = cevaplar[incelenen.id];

  function durum(s: SonucSorusu): "dogru" | "yanlis" | "bos" {
    const verilen = cevaplar[s.id];
    if (verilen === undefined) return "bos";
    return verilen === s.dogruCevap ? "dogru" : "yanlis";
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6">
      <div className="rounded-xl border border-primary/15 bg-slate-50/60 p-5">
        <h2 className="text-lg font-semibold text-slate-800">Sınav Sonucun</h2>
        <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-5">
          <div className="rounded-lg bg-white p-3 text-center">
            <p className="text-2xl font-bold text-emerald-600">{dogruSayisi}</p>
            <p className="text-xs text-muted-foreground">Doğru</p>
          </div>
          <div className="rounded-lg bg-white p-3 text-center">
            <p className="text-2xl font-bold text-red-600">{yanlisSayisi}</p>
            <p className="text-xs text-muted-foreground">Yanlış</p>
          </div>
          <div className="rounded-lg bg-white p-3 text-center">
            <p className="text-2xl font-bold text-slate-500">{bosSayisi}</p>
            <p className="text-xs text-muted-foreground">Boş</p>
          </div>
          <div className="rounded-lg bg-white p-3 text-center">
            <p className="text-2xl font-bold text-slate-700">{net.toFixed(2)}</p>
            <p className="text-xs text-muted-foreground">Net</p>
          </div>
          <div className="rounded-lg bg-white p-3 text-center">
            <p className="text-2xl font-bold text-primary">{puan.toFixed(2)}</p>
            <p className="text-xs text-muted-foreground">Puan</p>
          </div>
        </div>
        <p className="mt-3 text-xs text-muted-foreground">
          Bu puan, resmi ÖSYM &quot;P puanı&quot; değildir; sadece net üzerinden (doğru − yanlış/4) hesaplanan,
          100 üzerinden basit bir pratik deneme puanıdır.
        </p>
      </div>

      <p className="mt-4 text-xs font-medium text-muted-foreground">
        Haritada bir soruya tıklayarak doğru cevabı ve açıklamasını görebilirsin.
      </p>
      <div className="mt-2 lg:grid lg:grid-cols-[minmax(0,1fr)_17rem] lg:items-start lg:gap-4">
      <div className="rounded-xl border border-primary/15 bg-white p-5">
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>
            Soru {incelenenIndex + 1} / {sorular.length}
          </span>
          <span className="rounded-full bg-primary/10 px-2.5 py-0.5 font-medium text-primary">
            {DERS_LABEL[incelenen.ders]}
          </span>
        </div>
        <SoruGovdesi sorular={sorular} index={incelenenIndex} />
        <div className="mt-4 space-y-2">
          {incelenen.secenekler.map((secenek, i) => {
            const dogruMu = i === incelenen.dogruCevap;
            const verilenMi = i === verilenCevap;
            return (
              <div
                key={i}
                className={`flex items-start gap-2.5 rounded-lg border px-3.5 py-2.5 text-sm ${
                  dogruMu
                    ? "border-emerald-500 bg-emerald-50 text-emerald-800"
                    : verilenMi
                      ? "border-red-500 bg-red-50 text-red-800"
                      : "border-primary/10 text-slate-600"
                }`}
              >
                <span className="font-semibold">{String.fromCharCode(65 + i)})</span>
                <span className="flex-1">{secenek}</span>
                {dogruMu && <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600" />}
                {!dogruMu && verilenMi && <XCircle className="h-4 w-4 shrink-0 text-red-600" />}
              </div>
            );
          })}
          {verilenCevap === undefined && (
            <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <MinusCircle className="h-3.5 w-3.5" /> Bu soruyu boş bıraktın.
            </p>
          )}
        </div>
        {incelenen.aciklama && (
          <p className="mt-3 rounded-lg bg-slate-50 p-3 text-sm text-slate-600">{incelenen.aciklama}</p>
        )}
      </div>
      <aside className="mt-4 lg:sticky lg:top-20 lg:mt-0 lg:max-h-[calc(100vh-6rem)] lg:overflow-y-auto">
        <SoruHaritasi
          sorular={sorular}
          aktifIndex={incelenenIndex}
          onSec={setIncelenenIndex}
          butonSinifi={(i) => DURUM_SINIFI[durum(sorular[i])]}
          aciklamalar={[
            { etiket: "Doğru", sinif: DURUM_SINIFI.dogru },
            { etiket: "Yanlış", sinif: DURUM_SINIFI.yanlis },
            { etiket: "Boş", sinif: DURUM_SINIFI.bos },
          ]}
        />
      </aside>
      </div>
    </div>
  );
}

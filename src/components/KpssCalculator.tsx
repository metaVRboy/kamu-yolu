"use client";

import { useState } from "react";
import { Info } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
  DHBT_DUZEY_SECENEKLERI,
  OABT_ALAN_SECENEKLERI,
  PUAN_TURLERI,
  SINAV_YILLARI,
  netOf,
  type PuanTuruId,
} from "@/lib/kpss";
import { cn } from "@/lib/utils";

type FieldValues = Record<string, { correct: string; wrong: string }>;

function emptyValues(): FieldValues {
  return {};
}

export function KpssCalculator() {
  const [puanTuruId, setPuanTuruId] = useState<PuanTuruId>("LISANS");
  const [values, setValues] = useState<FieldValues>(emptyValues());
  const [ydsValue, setYdsValue] = useState("");
  const [sinavYili, setSinavYili] = useState(SINAV_YILLARI[0]);
  const [oabtAlan, setOabtAlan] = useState(OABT_ALAN_SECENEKLERI[0]);
  const [dhbtDuzey, setDhbtDuzey] = useState(DHBT_DUZEY_SECENEKLERI[0].value);
  const [showResults, setShowResults] = useState(false);

  const puanTuru = PUAN_TURLERI.find((p) => p.id === puanTuruId)!;

  function selectPuanTuru(id: PuanTuruId) {
    setPuanTuruId(id);
    setValues(emptyValues());
    setYdsValue("");
    setShowResults(false);
  }

  function updateField(key: string, patch: Partial<{ correct: string; wrong: string }>) {
    setValues((prev) => ({
      ...prev,
      [key]: { correct: prev[key]?.correct ?? "", wrong: prev[key]?.wrong ?? "", ...patch },
    }));
  }

  function handleClear() {
    setValues(emptyValues());
    setYdsValue("");
    setShowResults(false);
  }

  function handleCalculate() {
    setShowResults(true);
  }

  const results = puanTuru.fields.map((f) => {
    const v = values[f.key] ?? { correct: "", wrong: "" };
    return { ...f, net: netOf(v.correct, v.wrong) };
  });
  const gyGkNet = results
    .filter((r) => r.key === "gy" || r.key === "gk")
    .reduce((sum, r) => sum + r.net, 0);
  const alanResults = results.filter((r) => r.key !== "gy" && r.key !== "gk" && r.net > 0);

  return (
    <div className="space-y-5">
      <Card className="gap-4 border-primary/20 bg-white/70 p-5 backdrop-blur-md">
        <div>
          <p className="mb-2 text-sm font-semibold text-slate-900">
            <span className="text-destructive">*</span> Puan Türü
          </p>
          <div className="flex flex-col gap-2">
            {PUAN_TURLERI.map((p) => (
              <label
                key={p.id}
                className={cn(
                  "flex cursor-pointer items-center gap-2.5 rounded-xl border px-3 py-2.5 text-sm transition-colors",
                  puanTuruId === p.id
                    ? "border-primary/40 bg-primary/10"
                    : "border-transparent hover:bg-primary/5",
                )}
              >
                <input
                  type="radio"
                  name="puan-turu"
                  checked={puanTuruId === p.id}
                  onChange={() => selectPuanTuru(p.id)}
                  className="h-4 w-4 accent-primary"
                />
                <span className="font-medium text-slate-800">{p.label}</span>
                <span className="text-xs text-muted-foreground">{p.subtitle}</span>
              </label>
            ))}
          </div>
        </div>

        {puanTuru.hasAlanSelect && (
          <div>
            <Label className="mb-1.5 text-sm font-semibold text-slate-900">ÖABT Alan</Label>
            <select
              value={oabtAlan}
              onChange={(e) => setOabtAlan(e.target.value)}
              className="h-10 w-full rounded-xl border border-primary/20 bg-white px-3 text-sm"
            >
              {OABT_ALAN_SECENEKLERI.map((a) => (
                <option key={a} value={a}>
                  {a}
                </option>
              ))}
            </select>
          </div>
        )}

        {puanTuru.hasLevelSelect && (
          <div>
            <p className="mb-2 text-sm font-semibold text-slate-900">
              <span className="text-destructive">*</span> KPSS Düzey
            </p>
            <div className="flex flex-wrap gap-3">
              {DHBT_DUZEY_SECENEKLERI.map((d) => (
                <label key={d.value} className="flex cursor-pointer items-center gap-1.5 text-sm">
                  <input
                    type="radio"
                    name="dhbt-duzey"
                    checked={dhbtDuzey === d.value}
                    onChange={() => setDhbtDuzey(d.value)}
                    className="h-4 w-4 accent-primary"
                  />
                  {d.label}
                </label>
              ))}
            </div>
          </div>
        )}

        {puanTuru.hasYearSelect && (
          <div>
            <Label className="mb-1.5 text-sm font-semibold text-slate-900">Sınav Yılı</Label>
            <select
              value={sinavYili}
              onChange={(e) => setSinavYili(e.target.value)}
              className="h-10 w-full rounded-xl border border-primary/20 bg-white px-3 text-sm sm:w-48"
            >
              {SINAV_YILLARI.map((y) => (
                <option key={y} value={y}>
                  {y}
                </option>
              ))}
            </select>
          </div>
        )}

        <div className="grid grid-cols-[1fr_auto_auto] items-center gap-x-3 gap-y-1 text-xs font-medium text-muted-foreground">
          <span />
          <span className="text-center">Doğru</span>
          <span className="text-center">Yanlış</span>
        </div>

        <div className="divide-y divide-primary/10">
          {puanTuru.fields.map((f) => (
            <div key={f.key} className="grid grid-cols-[1fr_auto_auto] items-center gap-3 py-2.5">
              <span className="text-sm text-slate-800">
                {f.required && <span className="mr-1 text-destructive">*</span>}
                {f.label}
                <span className="ml-1.5 text-xs text-muted-foreground">
                  {f.totalQuestions} Soru
                </span>
              </span>
              <Input
                type="number"
                min={0}
                max={f.totalQuestions}
                inputMode="numeric"
                value={values[f.key]?.correct ?? ""}
                onChange={(e) => updateField(f.key, { correct: e.target.value })}
                className="w-16 border-primary/20 bg-white text-center"
              />
              <Input
                type="number"
                min={0}
                max={f.totalQuestions}
                inputMode="numeric"
                value={values[f.key]?.wrong ?? ""}
                onChange={(e) => updateField(f.key, { wrong: e.target.value })}
                className="w-16 border-primary/20 bg-white text-center"
              />
            </div>
          ))}
        </div>

        {puanTuru.singleScoreField && (
          <div>
            <Label className="mb-1.5 text-sm font-semibold text-slate-900">
              {puanTuru.singleScoreField.label}
            </Label>
            <Input
              type="number"
              min={0}
              max={100}
              inputMode="numeric"
              value={ydsValue}
              onChange={(e) => setYdsValue(e.target.value)}
              placeholder={puanTuru.singleScoreField.hint}
              className="w-40 border-primary/20 bg-white"
            />
            <p className="mt-1 text-xs text-muted-foreground">
              {puanTuru.singleScoreField.hint}
            </p>
          </div>
        )}

        <div className="flex gap-3">
          <Button type="button" onClick={handleCalculate} className="flex-1 sm:flex-none sm:px-8">
            Hesapla
          </Button>
          <Button type="button" variant="outline" onClick={handleClear} className="border-primary/25">
            Temizle
          </Button>
        </div>
      </Card>

      {showResults && (
        <Card className="gap-3 border-primary/20 bg-primary/10 p-6 backdrop-blur-md">
          <div className="flex items-start gap-2 text-xs text-amber-800">
            <Info className="mt-0.5 h-3.5 w-3.5 shrink-0" />
            <p>
              Şu an yalnızca <strong>net</strong> gösterilebiliyor. Kesin KPSS
              puanı, ÖSYM&apos;nin o sınav dönemine özel ortalama/standart
              sapma değerlerine göre hesaplanır; bu resmi istatistikleri
              doğrulamadan bir puan tahmini göstermek yanıltıcı olur, bu
              yüzden bilerek eklemedik.
            </p>
          </div>

          <div className="mt-2 grid gap-3 sm:grid-cols-2">
            <div className="rounded-xl bg-white/70 p-4 text-center">
              <p className="text-xs text-muted-foreground">Genel Yetenek + Genel Kültür Net</p>
              <p className="text-2xl font-bold text-primary">{gyGkNet.toFixed(2)}</p>
            </div>
            {alanResults.map((r) => (
              <div key={r.key} className="rounded-xl bg-white/70 p-4 text-center">
                <p className="text-xs text-muted-foreground">{r.label} Net</p>
                <p className="text-2xl font-bold text-primary">{r.net.toFixed(2)}</p>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}

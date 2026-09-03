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
  computeLisansSonuc,
  computeOnlisansSonuc,
  computeOrtaogretimSonuc,
  hasVerifiedLisansStats,
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

  function updateField(
    key: string,
    totalQuestions: number,
    patch: Partial<{ correct: string; wrong: string }>,
  ) {
    setValues((prev) => {
      const current = { correct: prev[key]?.correct ?? "", wrong: prev[key]?.wrong ?? "" };
      const merged = { ...current, ...patch };

      const clamp = (raw: string) => {
        if (raw.trim() === "") return "";
        const n = Number(raw);
        if (Number.isNaN(n)) return "";
        return String(Math.min(Math.max(Math.round(n), 0), totalQuestions));
      };

      let correct = clamp(merged.correct);
      let wrong = clamp(merged.wrong);

      // Dogru + yanlis toplami soru sayisini asamaz.
      if ((Number(correct) || 0) + (Number(wrong) || 0) > totalQuestions) {
        if (patch.correct !== undefined) {
          wrong = String(Math.max(totalQuestions - (Number(correct) || 0), 0));
        } else {
          correct = String(Math.max(totalQuestions - (Number(wrong) || 0), 0));
        }
      }

      return { ...prev, [key]: { correct, wrong } };
    });
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

  const isVerifiedLisansYili = puanTuruId === "LISANS" && hasVerifiedLisansStats(sinavYili);
  const lisansSonuc = isVerifiedLisansYili
    ? computeLisansSonuc(sinavYili, values, puanTuru.fields)
    : null;
  const genelTekSonuc =
    puanTuruId === "ONLISANS"
      ? computeOnlisansSonuc(values)
      : puanTuruId === "ORTAOGRETIM"
        ? computeOrtaogretimSonuc(values)
        : null;

  // Lisans (alan girilmemisse), Onlisans, Ortaogretim: hepsi GY+GK'ya
  // dayali "genel" sonuc ekranini kullanir.
  const isGenelIkiTest =
    puanTuruId === "ONLISANS" ||
    puanTuruId === "ORTAOGRETIM" ||
    (puanTuruId === "LISANS" && lisansSonuc?.kind !== "tek-alan" && lisansSonuc?.kind !== "coklu-alan");
  const genelYilGosterim = puanTuruId === "LISANS" ? sinavYili : "2024 KPSS";
  const barajlar = lisansSonuc?.barajlar ?? genelTekSonuc?.barajlar ?? null;
  const gyNetGosterim = results.find((r) => r.key === "gy")?.net ?? 0;
  const gkNetGosterim = results.find((r) => r.key === "gk")?.net ?? 0;
  const gyToplamSoru = puanTuru.fields.find((f) => f.key === "gy")?.totalQuestions ?? 60;
  const gkToplamSoru = puanTuru.fields.find((f) => f.key === "gk")?.totalQuestions ?? 60;
  const genelToplamSoru = gyToplamSoru + gkToplamSoru;
  const genelToplamNet = gyNetGosterim + gkNetGosterim;

  return (
    <div className="space-y-5">
      <Card className="gap-4 border-primary/20 bg-white p-5 shadow-sm">
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
                onChange={(e) => updateField(f.key, f.totalQuestions, { correct: e.target.value })}
                className="w-16 border-primary/20 bg-white text-center"
              />
              <Input
                type="number"
                min={0}
                max={f.totalQuestions}
                inputMode="numeric"
                value={values[f.key]?.wrong ?? ""}
                onChange={(e) => updateField(f.key, f.totalQuestions, { wrong: e.target.value })}
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
        <Card className="gap-4 border-primary/20 bg-primary/5 p-6">
          <div className="w-fit rounded-full bg-slate-100 px-4 py-1.5 text-sm font-semibold text-slate-800">
            Hesaplama Sonuçları
          </div>

          {isGenelIkiTest && (
            <div className="space-y-1.5 rounded-xl bg-white p-4 text-sm text-slate-800">
              <p>
                <strong>Genel Yetenek:</strong> {gyNetGosterim.toFixed(2)} net (%
                {((gyNetGosterim / gyToplamSoru) * 100).toFixed(2)})
              </p>
              <p>
                <strong>Genel Kültür:</strong> {gkNetGosterim.toFixed(2)} net (%
                {((gkNetGosterim / gkToplamSoru) * 100).toFixed(2)})
              </p>
              <p>
                <strong>KPSS Toplam:</strong> {genelToplamNet.toFixed(2)} net / {genelToplamSoru} soru
                (%{((genelToplamNet / genelToplamSoru) * 100).toFixed(2)})
              </p>
              <p>
                <strong>Sınav Yılı:</strong> {genelYilGosterim.replace(" KPSS", "")}
              </p>

              {lisansSonuc?.kind === "genel" &&
                lisansSonuc.puanlar.map((pl) => (
                  <p key={pl.kod}>
                    <strong>{pl.kod}:</strong> {pl.puan.toFixed(2)}
                  </p>
                ))}
              {puanTuruId === "ONLISANS" && genelTekSonuc?.kind === "genel" && (
                <p>
                  <strong>KPSSP93:</strong> {genelTekSonuc.puan.toFixed(2)}
                </p>
              )}
              {puanTuruId === "ORTAOGRETIM" && genelTekSonuc?.kind === "genel" && (
                <p>
                  <strong>KPSSP94:</strong> {genelTekSonuc.puan.toFixed(2)}
                </p>
              )}
            </div>
          )}

          {puanTuruId === "LISANS" && lisansSonuc?.kind === "tek-alan" && (
            <div className="rounded-xl bg-white p-5 text-center">
              <p className="text-xs text-muted-foreground">
                Ağırlıklı Standart Puanınız (ASP) — {lisansSonuc.alanLabel}
              </p>
              <p className="text-3xl font-bold text-primary">{lisansSonuc.asp.toFixed(3)}</p>
            </div>
          )}

          {puanTuruId === "LISANS" && lisansSonuc?.kind === "coklu-alan" && (
            <div className="grid gap-3 sm:grid-cols-2">
              {lisansSonuc.testler.map((t) => (
                <div key={t.label} className="rounded-xl bg-white p-4 text-center">
                  <p className="text-xs text-muted-foreground">{t.label} Standart Puan</p>
                  <p className="text-2xl font-bold text-primary">{t.sp.toFixed(2)}</p>
                </div>
              ))}
            </div>
          )}

          {barajlar?.some((b) => !b.gecti) && (
            <div className="rounded-xl bg-white p-4 text-center text-sm text-slate-800">
              Girdiğiniz netlere göre en az bir zorunlu testte baraj (1 net)
              sağlanamadığı için puan hesaplanamıyor.
            </div>
          )}

          {!isGenelIkiTest && !lisansSonuc && !genelTekSonuc && (
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="rounded-xl bg-white p-4 text-center">
                <p className="text-xs text-muted-foreground">Genel Yetenek + Genel Kültür Net</p>
                <p className="text-2xl font-bold text-primary">{gyGkNet.toFixed(2)}</p>
              </div>
              {alanResults.map((r) => (
                <div key={r.key} className="rounded-xl bg-white p-4 text-center">
                  <p className="text-xs text-muted-foreground">{r.label} Net</p>
                  <p className="text-2xl font-bold text-primary">{r.net.toFixed(2)}</p>
                </div>
              ))}
            </div>
          )}

          <div className="space-y-2 border-t border-primary/15 pt-3">
            {puanTuruId === "LISANS" && lisansSonuc?.kind === "genel" && (
              <div className="flex items-start gap-2 text-xs text-slate-700">
                <Info className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary" />
                <p>
                  KPSSP1/P2/P3, ÖSYM&apos;nin {sinavYili} Lisans sınavı için
                  açıkladığı resmi test ortalaması/standart sapması ve resmi
                  puan türü ağırlıkları (Tablo-2) kullanılarak hesaplanmıştır.
                  ÖSYM&apos;nin nihai puana çevirirken kullandığı ASP
                  dağılımının ortalama/standart sapma/en yüksek değerleri
                  resmi olarak yayımlanmadığından, bu adım halka açık bir
                  referans hesap makinesiyle (kpss-puan.hesaplama.net)
                  eşleştirilerek kalibre edildi; birden fazla bağımsız
                  test noktasında fark 0,01 puanın altında ölçüldü.
                </p>
              </div>
            )}

            {(puanTuruId === "ONLISANS" || puanTuruId === "ORTAOGRETIM") && genelTekSonuc?.kind === "genel" && (
              <div className="flex items-start gap-2 text-xs text-slate-700">
                <Info className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary" />
                <p>
                  Bu puan, yukarıdaki Lisans hesaplamasıyla aynı yöntemle,
                  ancak şu an yalnızca <strong>2024 KPSS</strong> için
                  kalibre edildi. {puanTuruId === "ONLISANS" ? "Önlisans" : "Ortaöğretim"}{" "}
                  KPSS sınavı yalnızca çift yıllarda yapıldığından diğer
                  yıllar için henüz hesaplama sunamıyoruz.
                </p>
              </div>
            )}

            {puanTuruId === "LISANS" &&
              (lisansSonuc?.kind === "tek-alan" || lisansSonuc?.kind === "coklu-alan") && (
                <div className="flex items-start gap-2 text-xs text-slate-700">
                  <Info className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary" />
                  <p>
                    Alan Bilgisi testi girdiğiniz için gösterilen değer,
                    resmi test istatistikleri ve ağırlıklarıyla
                    hesaplanmış <strong>Ağırlıklı Standart Puan (ASP)</strong>
                    &apos;dir; alan kombinasyonlarında hangi resmi puan
                    kodunun uygulanacağını güvenilir şekilde
                    eşleştiremediğimiz için bunu nihai &quot;100 üzerinden&quot;
                    puana çeviremiyoruz.
                  </p>
                </div>
              )}

            {!isGenelIkiTest && !lisansSonuc && !genelTekSonuc && (
              <div className="flex items-start gap-2 text-xs text-amber-800">
                <Info className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                <p>
                  Şu an yalnızca <strong>net</strong> gösterilebiliyor. Bu
                  puan türü için resmi istatistikleri henüz doğrulayamadık;
                  doğrulanmamış sayılarla puan hesaplamak yanıltıcı olur, bu
                  yüzden eklemedik.
                </p>
              </div>
            )}

            <div className="flex items-start gap-2 text-xs text-slate-600">
              <Info className="mt-0.5 h-3.5 w-3.5 shrink-0" />
              <p>
                <strong>Önemli Bilgi:</strong> Bir KPSS puanının
                hesaplanabilmesi için, o puanın hesaplanmasında yer alan
                testlerin her birinden en az 1 nete sahip olunması
                gerekmektedir; aksi takdirde ilgili KPSS puanı ÖSYM
                tarafından hesaplanmamaktadır (2026 KPSS Lisans Başvuru
                Kılavuzu, Bölüm 3.10 Değerlendirme).
                {barajlar?.some((b) => !b.gecti) && (
                  <>
                    {" "}
                    Girdiğiniz netlere göre{" "}
                    {barajlar
                      .filter((b) => !b.gecti)
                      .map((b) => b.label)
                      .join(", ")}{" "}
                    testinde/testlerinde bu baraj sağlanamıyor.
                  </>
                )}
              </p>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}

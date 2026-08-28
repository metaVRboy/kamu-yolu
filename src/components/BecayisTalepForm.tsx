"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { TURKIYE_ILLERI } from "@/lib/iller";
import { ilceSecenekleri } from "@/lib/ilceler";
import { KURUM_TURLERI, meslekSecenekleri } from "@/lib/kurumMeslek";

export function BecayisTalepForm() {
  const router = useRouter();
  const [kurumTuru, setKurumTuru] = useState("");
  const [meslek, setMeslek] = useState("");
  const [mevcutIl, setMevcutIl] = useState("");
  const [mevcutIlce, setMevcutIlce] = useState("");
  const [istenenIller, setIstenenIller] = useState<string[]>([]);
  const [aciklama, setAciklama] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const meslekler = kurumTuru ? meslekSecenekleri(kurumTuru) : [];
  const ilceler = mevcutIl ? ilceSecenekleri(mevcutIl) : [];

  function handleKurumTuruChange(value: string) {
    setKurumTuru(value);
    setMeslek("");
  }

  function handleMevcutIlChange(value: string) {
    setMevcutIl(value);
    setMevcutIlce("");
  }

  function toggleIstenenIl(il: string) {
    setIstenenIller((prev) => (prev.includes(il) ? prev.filter((i) => i !== il) : [...prev, il]));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!kurumTuru || !meslek || !mevcutIl || istenenIller.length === 0) {
      setError("Kurum türü, meslek, mevcut il ve en az bir istenen il zorunludur.");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/becayis/talepler", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          kurumTuru,
          meslek,
          mevcutIl,
          mevcutIlce: mevcutIlce || undefined,
          istenenIller,
          aciklama: aciklama || undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Bir şeyler ters gitti.");
        return;
      }
      router.push("/becayis/taleplerim");
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card className="gap-4 border-primary/20 bg-white/70 p-6 backdrop-blur-md">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <Label className="mb-1.5"><span className="text-destructive">*</span> Kurum Türü</Label>
          <select
            value={kurumTuru}
            onChange={(e) => handleKurumTuruChange(e.target.value)}
            className="h-10 w-full rounded-xl border border-primary/20 bg-white px-3 text-sm"
          >
            <option value="">Seçiniz</option>
            {KURUM_TURLERI.map((k) => (
              <option key={k} value={k}>{k}</option>
            ))}
          </select>
        </div>
        <div>
          <Label className="mb-1.5"><span className="text-destructive">*</span> Meslek / Unvan</Label>
          <select
            value={meslek}
            onChange={(e) => setMeslek(e.target.value)}
            disabled={!kurumTuru}
            className="h-10 w-full rounded-xl border border-primary/20 bg-white px-3 text-sm disabled:opacity-50"
          >
            <option value="">{kurumTuru ? "Seçiniz" : "Önce kurum türü seçin"}</option>
            {meslekler.map((m) => (
              <option key={m} value={m}>{m}</option>
            ))}
          </select>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <Label className="mb-1.5"><span className="text-destructive">*</span> Mevcut İl</Label>
            <select
              value={mevcutIl}
              onChange={(e) => handleMevcutIlChange(e.target.value)}
              disabled={!meslek}
              className="h-10 w-full rounded-xl border border-primary/20 bg-white px-3 text-sm disabled:opacity-50"
            >
              <option value="">{meslek ? "Seçiniz" : "Önce meslek seçin"}</option>
              {TURKIYE_ILLERI.map((il) => (
                <option key={il} value={il}>{il}</option>
              ))}
            </select>
          </div>
          <div>
            <Label className="mb-1.5">Mevcut İlçe</Label>
            <select
              value={mevcutIlce}
              onChange={(e) => setMevcutIlce(e.target.value)}
              disabled={!mevcutIl}
              className="h-10 w-full rounded-xl border border-primary/20 bg-white px-3 text-sm disabled:opacity-50"
            >
              <option value="">{mevcutIl ? "Seçiniz" : "Önce il seçin"}</option>
              {ilceler.map((ilce) => (
                <option key={ilce} value={ilce}>{ilce}</option>
              ))}
            </select>
          </div>
        </div>
        <div>
          <Label className="mb-1.5"><span className="text-destructive">*</span> İstenen İl(ler)</Label>
          {mevcutIl ? (
            <>
              <div className="max-h-48 overflow-y-auto rounded-xl border border-primary/20 bg-white p-3">
                <div className="grid grid-cols-2 gap-1.5 sm:grid-cols-3">
                  {TURKIYE_ILLERI.map((il) => (
                    <label key={il} className="flex items-center gap-1.5 text-sm">
                      <input
                        type="checkbox"
                        checked={istenenIller.includes(il)}
                        onChange={() => toggleIstenenIl(il)}
                        className="h-3.5 w-3.5 accent-primary"
                      />
                      {il}
                    </label>
                  ))}
                </div>
              </div>
              {istenenIller.length > 0 && (
                <p className="mt-1.5 text-xs text-muted-foreground">Seçilenler: {istenenIller.join(", ")}</p>
              )}
            </>
          ) : (
            <div className="rounded-xl border border-primary/20 bg-white/50 p-3 text-sm text-muted-foreground">
              Önce mevcut il seçin
            </div>
          )}
        </div>
        <div>
          <Label className="mb-1.5">Açıklama</Label>
          <textarea
            value={aciklama}
            onChange={(e) => setAciklama(e.target.value)}
            rows={4}
            placeholder="Eklemek istediğin başka bir şey var mı?"
            className="w-full rounded-xl border border-primary/20 bg-white px-3 py-2 text-sm"
          />
        </div>
        {error && <p className="text-sm text-destructive">{error}</p>}
        <Button type="submit" disabled={loading} className="w-full sm:w-auto sm:px-8">
          {loading ? "Kaydediliyor..." : "Talebi Yayınla"}
        </Button>
      </form>
    </Card>
  );
}

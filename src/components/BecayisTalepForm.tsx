"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { TURKIYE_ILLERI } from "@/lib/iller";

export function BecayisTalepForm() {
  const router = useRouter();
  const [meslek, setMeslek] = useState("");
  const [kurumTuru, setKurumTuru] = useState("");
  const [mevcutIl, setMevcutIl] = useState("");
  const [mevcutIlce, setMevcutIlce] = useState("");
  const [istenenIller, setIstenenIller] = useState<string[]>([]);
  const [aciklama, setAciklama] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  function toggleIstenenIl(il: string) {
    setIstenenIller((prev) => (prev.includes(il) ? prev.filter((i) => i !== il) : [...prev, il]));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!mevcutIl || istenenIller.length === 0 || !meslek.trim()) {
      setError("Meslek, mevcut il ve en az bir istenen il zorunludur.");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/becayis/talepler", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          meslek,
          kurumTuru: kurumTuru || undefined,
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
          <Label className="mb-1.5"><span className="text-destructive">*</span> Meslek / Unvan</Label>
          <Input
            value={meslek}
            onChange={(e) => setMeslek(e.target.value)}
            placeholder="Örn: Öğretmen, Hemşire, Zabıta Memuru"
            className="border-primary/20 bg-white"
          />
        </div>
        <div>
          <Label className="mb-1.5">Kurum Türü</Label>
          <Input
            value={kurumTuru}
            onChange={(e) => setKurumTuru(e.target.value)}
            placeholder="Örn: Milli Eğitim Bakanlığı"
            className="border-primary/20 bg-white"
          />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <Label className="mb-1.5"><span className="text-destructive">*</span> Mevcut İl</Label>
            <select
              value={mevcutIl}
              onChange={(e) => setMevcutIl(e.target.value)}
              className="h-10 w-full rounded-xl border border-primary/20 bg-white px-3 text-sm"
            >
              <option value="">Seçiniz</option>
              {TURKIYE_ILLERI.map((il) => (
                <option key={il} value={il}>{il}</option>
              ))}
            </select>
          </div>
          <div>
            <Label className="mb-1.5">Mevcut İlçe</Label>
            <Input
              value={mevcutIlce}
              onChange={(e) => setMevcutIlce(e.target.value)}
              className="border-primary/20 bg-white"
            />
          </div>
        </div>
        <div>
          <Label className="mb-1.5"><span className="text-destructive">*</span> İstenen İl(ler)</Label>
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

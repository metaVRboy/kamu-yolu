"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { passwordRequirementIssues } from "@/lib/authValidation";
import { PasswordRequirementsHint } from "@/components/SifreSifirlaForm";

export function SifreDegistirForm() {
  const [mevcutSifre, setMevcutSifre] = useState("");
  const [yeniSifre, setYeniSifre] = useState("");
  const [yeniSifreTekrar, setYeniSifreTekrar] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [basarili, setBasarili] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setBasarili(false);

    if (passwordRequirementIssues(yeniSifre).length > 0) {
      setError("Yeni şifre gereksinimleri karşılanmıyor.");
      return;
    }
    if (yeniSifre !== yeniSifreTekrar) {
      setError("Yeni şifreler birbiriyle eşleşmiyor.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/profil/sifre-degistir", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mevcutSifre, yeniSifre }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Bir şeyler ters gitti.");
        return;
      }
      setBasarili(true);
      setMevcutSifre("");
      setYeniSifre("");
      setYeniSifreTekrar("");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label className="mb-1.5">Mevcut Şifre</Label>
        <Input
          type="password"
          value={mevcutSifre}
          onChange={(e) => setMevcutSifre(e.target.value)}
          required
          className="border-primary/20 bg-white"
        />
      </div>
      <div>
        <Label className="mb-1.5">Yeni Şifre</Label>
        <Input
          type="password"
          value={yeniSifre}
          onChange={(e) => setYeniSifre(e.target.value)}
          required
          className="border-primary/20 bg-white"
        />
        <PasswordRequirementsHint password={yeniSifre} />
      </div>
      <div>
        <Label className="mb-1.5">Yeni Şifre (Tekrar)</Label>
        <Input
          type="password"
          value={yeniSifreTekrar}
          onChange={(e) => setYeniSifreTekrar(e.target.value)}
          required
          className="border-primary/20 bg-white"
        />
      </div>
      {error && <p className="text-sm text-destructive">{error}</p>}
      {basarili && <p className="text-sm text-emerald-600">Şifren güncellendi.</p>}
      <Button type="submit" disabled={loading}>
        {loading ? "Güncelleniyor..." : "Şifreyi Güncelle"}
      </Button>
    </form>
  );
}

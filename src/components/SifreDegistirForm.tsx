"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { PasswordInput } from "@/components/ui/password-input";
import { toast } from "@/components/ui/toast";
import { passwordRequirementIssues } from "@/lib/authValidation";
import { PasswordRequirementsHint } from "@/components/SifreSifirlaForm";

export function SifreDegistirForm() {
  const router = useRouter();
  const [mevcutSifre, setMevcutSifre] = useState("");
  const [yeniSifre, setYeniSifre] = useState("");
  const [yeniSifreTekrar, setYeniSifreTekrar] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

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
        body: JSON.stringify({ mevcutSifre, yeniSifre, yeniSifreTekrar }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Bir şeyler ters gitti.");
        return;
      }

      toast.success(
        "Şifren güncellendi.",
        "Güvenliğin için oturumun kapatıldı. Yeni şifrenle tekrar giriş yapman gerekiyor.",
      );
      router.push("/giris");
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label className="mb-1.5">Mevcut Şifre</Label>
        <PasswordInput
          value={mevcutSifre}
          onChange={(e) => setMevcutSifre(e.target.value)}
          required
          className="border-primary/20 bg-white"
        />
      </div>
      <div>
        <Label className="mb-1.5">Yeni Şifre</Label>
        <PasswordInput
          value={yeniSifre}
          onChange={(e) => setYeniSifre(e.target.value)}
          required
          className="border-primary/20 bg-white"
        />
        <PasswordRequirementsHint password={yeniSifre} />
      </div>
      <div>
        <Label className="mb-1.5">Yeni Şifre (Tekrar)</Label>
        <PasswordInput
          value={yeniSifreTekrar}
          onChange={(e) => setYeniSifreTekrar(e.target.value)}
          required
          aria-invalid={yeniSifreTekrar.length > 0 && yeniSifreTekrar !== yeniSifre}
          className="border-primary/20 bg-white"
        />
        {yeniSifreTekrar.length > 0 && yeniSifreTekrar !== yeniSifre && (
          <p className="mt-1 text-xs text-destructive">Şifreler eşleşmiyor.</p>
        )}
      </div>
      {error && <p className="text-sm text-destructive">{error}</p>}
      <Button type="submit" disabled={loading}>
        {loading ? "Güncelleniyor..." : "Şifreyi Güncelle"}
      </Button>
    </form>
  );
}

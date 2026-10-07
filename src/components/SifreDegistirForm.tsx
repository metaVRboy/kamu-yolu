"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { PasswordInput } from "@/components/ui/password-input";
import { toast } from "@/components/ui/toast";
import { passwordRequirementIssues } from "@/lib/authValidation";
import { PasswordRequirementsHint } from "@/components/SifreSifirlaForm";

/** sifreVar=false: yalniz Google ile acilmis hesap - mevcut sifre sorulmaz, "sifre belirle" olur. */
export function SifreDegistirForm({ sifreVar }: { sifreVar: boolean }) {
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
        body: JSON.stringify({ mevcutSifre: sifreVar ? mevcutSifre : undefined, yeniSifre, yeniSifreTekrar }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Bir şeyler ters gitti.");
        return;
      }

      toast.success(
        sifreVar ? "Şifren güncellendi." : "Şifren belirlendi.",
        "Güvenliğin için diğer cihazlardaki oturumların kapatıldı.",
      );
      setMevcutSifre("");
      setYeniSifre("");
      setYeniSifreTekrar("");
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {sifreVar ? (
        <div>
          <Label className="mb-1.5">Mevcut Şifre</Label>
          <PasswordInput
            value={mevcutSifre}
            onChange={(e) => setMevcutSifre(e.target.value)}
            required
            autoComplete="current-password"
            className="border-primary/20 bg-white"
          />
        </div>
      ) : (
        <p className="text-sm text-muted-foreground">
          Hesabına Google ile giriş yapıyorsun. Bir şifre belirlersen e-posta adresin ve şifrenle de giriş yapabilirsin.
        </p>
      )}
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
        {loading ? "Kaydediliyor..." : sifreVar ? "Şifreyi Güncelle" : "Şifre Belirle"}
      </Button>
    </form>
  );
}

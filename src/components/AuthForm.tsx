"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { passwordRequirementIssues } from "@/lib/authValidation";
import { PasswordRequirementsHint } from "@/components/SifreSifirlaForm";

export function AuthForm({ mode }: { mode: "kayit" | "giris" }) {
  const router = useRouter();
  const [adSoyad, setAdSoyad] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [kvkkOnay, setKvkkOnay] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (mode === "kayit") {
      if (passwordRequirementIssues(password).length > 0) {
        setError("Şifre gereksinimleri karşılanmıyor.");
        return;
      }
      if (!kvkkOnay) {
        setError("Devam etmek için KVKK Aydınlatma Metni'ni onaylamalısın.");
        return;
      }
    }

    setLoading(true);
    try {
      const res = await fetch(mode === "kayit" ? "/api/auth/register" : "/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(
          mode === "kayit" ? { adSoyad, email, password, kvkkOnay } : { email, password },
        ),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Bir şeyler ters gitti.");
        return;
      }
      router.push("/profilim");
      router.refresh();
    } catch {
      setError("Bağlantı hatası, tekrar deneyin.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card className="mx-auto max-w-sm gap-4 border-primary/20 bg-white/70 p-6 backdrop-blur-md">
      <h1 className="text-xl font-bold text-slate-900">
        {mode === "kayit" ? "Kayıt Ol" : "Giriş Yap"}
      </h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        {mode === "kayit" && (
          <div>
            <Label className="mb-1.5">Ad Soyad</Label>
            <Input
              value={adSoyad}
              onChange={(e) => setAdSoyad(e.target.value)}
              required
              minLength={2}
              className="border-primary/20 bg-white"
            />
          </div>
        )}
        <div>
          <Label className="mb-1.5">E-posta</Label>
          <Input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="border-primary/20 bg-white"
          />
        </div>
        <div>
          <div className="flex items-center justify-between">
            <Label className="mb-1.5">Şifre</Label>
            {mode === "giris" && (
              <Link href="/sifremi-unuttum" className="text-xs font-medium text-primary hover:underline">
                Şifremi unuttum
              </Link>
            )}
          </div>
          <Input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={mode === "kayit" ? 8 : 1}
            className="border-primary/20 bg-white"
          />
          {mode === "kayit" && <PasswordRequirementsHint password={password} />}
        </div>
        {mode === "kayit" && (
          <label className="flex items-start gap-2 text-xs text-slate-600">
            <input
              type="checkbox"
              checked={kvkkOnay}
              onChange={(e) => setKvkkOnay(e.target.checked)}
              className="mt-0.5 h-3.5 w-3.5 accent-primary"
            />
            <span>
              <Link href="/kvkk" target="_blank" className="font-medium text-primary hover:underline">
                KVKK Aydınlatma Metni ve Kullanım Şartları
              </Link>
              &apos;nı okudum, kabul ediyorum.
            </span>
          </label>
        )}
        {error && <p className="text-sm text-destructive">{error}</p>}
        <Button type="submit" disabled={loading} className="w-full">
          {loading ? "Bekleyin..." : mode === "kayit" ? "Kayıt Ol" : "Giriş Yap"}
        </Button>
      </form>
    </Card>
  );
}

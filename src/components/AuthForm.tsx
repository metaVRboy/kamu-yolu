"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export function AuthForm({ mode }: { mode: "kayit" | "giris" }) {
  const router = useRouter();
  const [adSoyad, setAdSoyad] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await fetch(mode === "kayit" ? "/api/auth/register" : "/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(
          mode === "kayit" ? { adSoyad, email, password } : { email, password },
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
          <Label className="mb-1.5">Şifre</Label>
          <Input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={6}
            className="border-primary/20 bg-white"
          />
        </div>
        {error && <p className="text-sm text-destructive">{error}</p>}
        <Button type="submit" disabled={loading} className="w-full">
          {loading ? "Bekleyin..." : mode === "kayit" ? "Kayıt Ol" : "Giriş Yap"}
        </Button>
      </form>
    </Card>
  );
}

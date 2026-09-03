"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Check, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { passwordRequirementIssues } from "@/lib/authValidation";
import { cn } from "@/lib/utils";

const REQUIREMENTS = [
  { key: "En az 8 karakter", test: (p: string) => p.length >= 8 },
  { key: "En az bir harf", test: (p: string) => /[A-Za-zÇĞİÖŞÜçğıöşü]/.test(p) },
  { key: "En az bir rakam", test: (p: string) => /[0-9]/.test(p) },
];

export function PasswordRequirementsHint({ password }: { password: string }) {
  return (
    <ul className="mt-1.5 space-y-0.5 text-xs">
      {REQUIREMENTS.map((r) => {
        const ok = r.test(password);
        return (
          <li
            key={r.key}
            className={cn("flex items-center gap-1.5", ok ? "text-emerald-600" : "text-muted-foreground")}
          >
            {ok ? <Check className="h-3 w-3" /> : <X className="h-3 w-3" />}
            {r.key}
          </li>
        );
      })}
    </ul>
  );
}

export function SifreSifirlaForm({ token }: { token: string }) {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (passwordRequirementIssues(password).length > 0) {
      setError("Şifre gereksinimleri karşılanmıyor.");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/auth/sifre-sifirla", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Bir şeyler ters gitti.");
        return;
      }
      router.push("/profilim");
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card className="mx-auto max-w-sm gap-4 border-primary/20 bg-white p-6 shadow-sm">
      <h1 className="text-xl font-bold text-slate-900">Yeni Şifre Belirle</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <Label className="mb-1.5">Yeni Şifre</Label>
          <Input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="border-primary/20 bg-white"
          />
          <PasswordRequirementsHint password={password} />
        </div>
        {error && <p className="text-sm text-destructive">{error}</p>}
        <Button type="submit" disabled={loading} className="w-full">
          {loading ? "Kaydediliyor..." : "Şifreyi Güncelle"}
        </Button>
      </form>
    </Card>
  );
}

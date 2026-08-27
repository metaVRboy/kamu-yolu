"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export function SifremiUnuttumForm() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      await fetch("/api/auth/sifremi-unuttum", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      setSent(true);
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card className="mx-auto max-w-sm gap-4 border-primary/20 bg-white/70 p-6 backdrop-blur-md">
      <h1 className="text-xl font-bold text-slate-900">Şifremi Unuttum</h1>
      {sent ? (
        <p className="text-sm text-emerald-600">
          Eğer bu e-posta ile bir hesap varsa, şifre sıfırlama bağlantısı gönderildi. Gelen
          kutunu (ve spam klasörünü) kontrol et.
        </p>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
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
          <Button type="submit" disabled={loading} className="w-full">
            {loading ? "Gönderiliyor..." : "Sıfırlama Bağlantısı Gönder"}
          </Button>
        </form>
      )}
    </Card>
  );
}

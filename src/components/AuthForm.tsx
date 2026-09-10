"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { PasswordInput } from "@/components/ui/password-input";
import { toast } from "@/components/ui/toast";
import { passwordRequirementIssues } from "@/lib/authValidation";
import { PasswordRequirementsHint } from "@/components/SifreSifirlaForm";

const KOD_GECERLILIK_SANIYE = 120;

export function AuthForm({ mode }: { mode: "kayit" | "giris" }) {
  const router = useRouter();
  const [adSoyad, setAdSoyad] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [kvkkOnay, setKvkkOnay] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [kodAsamasi, setKodAsamasi] = useState(false);
  const [kod, setKod] = useState("");
  const [kalanSaniye, setKalanSaniye] = useState(KOD_GECERLILIK_SANIYE);

  useEffect(() => {
    if (!kodAsamasi || kalanSaniye <= 0) return;
    const interval = setInterval(() => setKalanSaniye((s) => Math.max(0, s - 1)), 1000);
    return () => clearInterval(interval);
  }, [kodAsamasi, kalanSaniye]);

  async function handleGirisSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
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

  async function kodGonder() {
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/auth/kayit-kod-gonder", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ adSoyad, email, password, kvkkOnay }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Bir şeyler ters gitti.");
        return;
      }
      setKodAsamasi(true);
      setKod("");
      setKalanSaniye(KOD_GECERLILIK_SANIYE);
      toast.success("Doğrulama kodu gönderildi.", `${email} adresine 6 haneli bir kod gönderdik.`);
    } catch {
      setError("Bağlantı hatası, tekrar deneyin.");
    } finally {
      setLoading(false);
    }
  }

  async function handleKayitSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (passwordRequirementIssues(password).length > 0) {
      setError("Şifre gereksinimleri karşılanmıyor.");
      return;
    }
    if (!kvkkOnay) {
      setError("Devam etmek için KVKK Aydınlatma Metni'ni onaylamalısın.");
      return;
    }

    await kodGonder();
  }

  async function handleKodDogrula(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/auth/kayit-dogrula", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, code: kod }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Bir şeyler ters gitti.");
        return;
      }
      toast.success("Hesabın oluşturuldu.");
      router.push("/profilim");
      router.refresh();
    } catch {
      setError("Bağlantı hatası, tekrar deneyin.");
    } finally {
      setLoading(false);
    }
  }

  if (mode === "kayit" && kodAsamasi) {
    const dakika = Math.floor(kalanSaniye / 60);
    const saniye = kalanSaniye % 60;
    return (
      <Card className="mx-auto max-w-sm gap-4 border-primary/20 bg-white p-6 shadow-sm">
        <h1 className="font-sans text-xl font-bold text-primary">E-postanı Doğrula</h1>
        <p className="text-sm text-muted-foreground">
          <strong>{email}</strong> adresine 6 haneli bir doğrulama kodu gönderdik.
        </p>
        <form onSubmit={handleKodDogrula} className="space-y-4">
          <div>
            <Label className="mb-1.5">Doğrulama Kodu</Label>
            <Input
              value={kod}
              onChange={(e) => setKod(e.target.value.replace(/\D/g, "").slice(0, 6))}
              required
              inputMode="numeric"
              maxLength={6}
              placeholder="000000"
              className="border-primary/20 bg-white text-center text-lg tracking-[0.5em]"
            />
            <p className="mt-1.5 text-xs text-muted-foreground">
              {kalanSaniye > 0
                ? `Kodun süresi: ${dakika}:${saniye.toString().padStart(2, "0")}`
                : "Kodun süresi doldu, yeni bir kod iste."}
            </p>
          </div>
          {error && <p className="text-sm text-destructive">{error}</p>}
          <Button type="submit" disabled={loading || kod.length !== 6} className="w-full">
            {loading ? "Doğrulanıyor..." : "Doğrula ve Hesabı Oluştur"}
          </Button>
          <div className="flex items-center justify-between text-xs">
            <button
              type="button"
              onClick={() => setKodAsamasi(false)}
              className="font-medium text-muted-foreground hover:text-foreground"
            >
              E-postayı değiştir
            </button>
            <button
              type="button"
              onClick={kodGonder}
              disabled={loading || kalanSaniye > 0}
              className="font-medium text-primary hover:underline disabled:pointer-events-none disabled:opacity-50"
            >
              Kodu Tekrar Gönder
            </button>
          </div>
        </form>
      </Card>
    );
  }

  return (
    <Card className="mx-auto max-w-sm gap-4 border-primary/20 bg-white p-6 shadow-sm">
      <h1 className="font-sans text-xl font-bold text-primary">
        {mode === "kayit" ? "Kayıt Ol" : "Giriş Yap"}
      </h1>
      <form onSubmit={mode === "kayit" ? handleKayitSubmit : handleGirisSubmit} className="space-y-4">
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
          <PasswordInput
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
          {loading ? "Bekleyin..." : mode === "kayit" ? "Devam Et" : "Giriş Yap"}
        </Button>
      </form>
    </Card>
  );
}

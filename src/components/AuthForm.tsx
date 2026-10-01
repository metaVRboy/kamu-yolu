"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { PasswordInput } from "@/components/ui/password-input";
import { toast } from "@/components/ui/toast";
import { passwordRequirementIssues } from "@/lib/authValidation";
import { PasswordRequirementsHint } from "@/components/SifreSifirlaForm";
import { TurnstileWidget } from "@/components/TurnstileWidget";

const KOD_GECERLILIK_SANIYE = 120;
// Site key tanimli degilse (ör. yerel gelistirme ortaminda henuz
// ayarlanmadiysa) formu tamamen kilitlememek icin dogrulamayi atla.
const TURNSTILE_ETKIN = !!process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;

const GOOGLE_HATA_MESAJLARI: Record<string, string> = {
  google: "Google ile giriş başarısız oldu. Lütfen tekrar deneyin.",
  "google-email": "Google hesabının e-postası doğrulanmamış görünüyor.",
  "google-yapilandirma": "Google ile giriş şu anda kullanılamıyor.",
};

function GoogleIcon() {
  return (
    <svg viewBox="0 0 48 48" className="h-4 w-4" aria-hidden>
      <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3c-1.6 4.7-6.1 8-11.3 8-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.9 1.1 8 3l5.7-5.7C34.6 6.1 29.6 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.7-.4-3.5z" />
      <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.6 15.9 18.9 13 24 13c3.1 0 5.9 1.1 8 3l5.7-5.7C34.6 6.1 29.6 4 24 4 16.3 4 9.7 8.3 6.3 14.7z" />
      <path fill="#4CAF50" d="M24 44c5.5 0 10.4-2.1 14.1-5.6l-6.5-5.5C29.5 34.6 26.9 35.5 24 35.5c-5.2 0-9.6-3.3-11.2-7.9l-6.5 5C9.6 39.6 16.3 44 24 44z" />
      <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.3-2.2 4.2-4.1 5.6l6.5 5.5C40.9 36.4 44 30.9 44 24c0-1.3-.1-2.7-.4-3.5z" />
    </svg>
  );
}

export function AuthForm({ mode }: { mode: "kayit" | "giris" }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [adSoyad, setAdSoyad] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordTekrar, setPasswordTekrar] = useState("");
  const [kvkkOnay, setKvkkOnay] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [kodAsamasi, setKodAsamasi] = useState(false);
  const [kod, setKod] = useState("");
  const [kalanSaniye, setKalanSaniye] = useState(KOD_GECERLILIK_SANIYE);
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null);

  useEffect(() => {
    const hata = searchParams.get("hata");
    if (hata) {
      toast.error(GOOGLE_HATA_MESAJLARI[hata] ?? "Bir şeyler ters gitti.");
      router.replace(mode === "kayit" ? "/kayit-ol" : "/giris");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
        body: JSON.stringify({ email, password, turnstileToken }),
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
        body: JSON.stringify({ adSoyad, email, password, kvkkOnay, turnstileToken }),
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
    if (password !== passwordTekrar) {
      setError("Şifreler eşleşmiyor.");
      return;
    }
    if (!kvkkOnay) {
      setError("Devam etmek için KVKK Aydınlatma Metni ve Kullanım Koşulları'nı onaylamalısın.");
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

      <a
        href="/api/auth/google"
        className="flex items-center justify-center gap-2.5 rounded-xl border border-border bg-white px-4 py-2.5 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50"
      >
        <GoogleIcon />
        Google ile {mode === "kayit" ? "Kayıt Ol" : "Giriş Yap"}
      </a>
      {mode === "kayit" && (
        <p className="-mt-2 text-center text-xs text-muted-foreground">
          Google ile devam ederek{" "}
          <Link href="/kvkk" target="_blank" className="underline hover:text-foreground">
            KVKK
          </Link>{" "}
          ve{" "}
          <Link href="/kullanim-kosullari" target="_blank" className="underline hover:text-foreground">
            Kullanım Koşulları
          </Link>
          &apos;nı kabul etmiş olursun.
        </p>
      )}

      <div className="flex items-center gap-3">
        <div className="h-px flex-1 bg-border" />
        <span className="text-xs text-muted-foreground">veya e-posta ile</span>
        <div className="h-px flex-1 bg-border" />
      </div>

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
          <div>
            <Label className="mb-1.5">Şifre (Tekrar)</Label>
            <PasswordInput
              value={passwordTekrar}
              onChange={(e) => setPasswordTekrar(e.target.value)}
              required
              aria-invalid={passwordTekrar.length > 0 && passwordTekrar !== password}
              className="border-primary/20 bg-white"
            />
            {passwordTekrar.length > 0 && passwordTekrar !== password && (
              <p className="mt-1 text-xs text-destructive">Şifreler eşleşmiyor.</p>
            )}
          </div>
        )}
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
                KVKK Aydınlatma Metni
              </Link>
              {" "}ve{" "}
              <Link href="/kullanim-kosullari" target="_blank" className="font-medium text-primary hover:underline">
                Kullanım Koşulları
              </Link>
              &apos;nı okudum, kabul ediyorum.
            </span>
          </label>
        )}
        <TurnstileWidget onVerify={setTurnstileToken} />
        {error && <p className="text-sm text-destructive">{error}</p>}
        <Button
          type="submit"
          disabled={
            loading ||
            (TURNSTILE_ETKIN && !turnstileToken) ||
            (mode === "kayit" && password !== passwordTekrar)
          }
          className="w-full"
        >
          {loading ? "Bekleyin..." : mode === "kayit" ? "Devam Et" : "Giriş Yap"}
        </Button>
      </form>
    </Card>
  );
}

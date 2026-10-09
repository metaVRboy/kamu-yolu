"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, Loader2, Send } from "lucide-react";
import { TurnstileWidget } from "@/components/TurnstileWidget";
import { DESTEK_KONULARI } from "@/lib/destek";

const alan = "mt-1 w-full rounded-xl border border-primary/20 bg-white px-3 py-2.5 text-sm focus:border-primary/50 focus:outline-none";

export function DestekFormu({ uye }: { uye: { adSoyad: string; email: string } | null }) {
  const router = useRouter();
  const [ad, setAd] = useState(uye?.adSoyad ?? "");
  const [email, setEmail] = useState(uye?.email ?? "");
  const [konu, setKonu] = useState<string>(DESTEK_KONULARI[0]);
  const [mesaj, setMesaj] = useState("");
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null);
  const [hata, setHata] = useState<string | null>(null);
  const [gonderiliyor, setGonderiliyor] = useState(false);
  const [gonderildi, setGonderildi] = useState(false);

  if (gonderildi) {
    return (
      <div className="rounded-3xl border border-emerald-200 bg-emerald-50 p-6 text-center">
        <CheckCircle2 className="mx-auto h-10 w-10 text-emerald-600" />
        <p className="mt-3 font-bold text-emerald-900">Mesajın bize ulaştı</p>
        <p className="mt-1 text-sm text-emerald-800">Yanıtımızı {email} adresine e-postayla göndereceğiz{uye && "; bu sayfada da görebilirsin"}.</p>
        <button type="button" onClick={() => setGonderildi(false)} className="mt-4 text-sm font-semibold text-emerald-800 underline">
          Yeni mesaj yaz
        </button>
      </div>
    );
  }

  return (
    <form
      className="space-y-4 rounded-3xl border border-primary/10 bg-white p-5 shadow-sm sm:p-6"
      onSubmit={async (e) => {
        e.preventDefault();
        setHata(null);
        setGonderiliyor(true);
        try {
          const res = await fetch("/api/destek", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ad, email, konu, mesaj, turnstileToken }) });
          const data = await res.json().catch(() => ({}));
          if (!res.ok) return setHata(data.error ?? "Gönderilemedi, lütfen tekrar dene.");
          setMesaj("");
          setGonderildi(true);
          router.refresh();
        } finally {
          setGonderiliyor(false);
        }
      }}
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block text-sm font-medium text-slate-700">
          Ad soyad
          <input value={ad} onChange={(e) => setAd(e.target.value)} required maxLength={100} className={alan} />
        </label>
        <label className="block text-sm font-medium text-slate-700">
          E-posta (yanıtı buraya göndeririz)
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required className={alan} />
        </label>
      </div>
      <label className="block text-sm font-medium text-slate-700">
        Konu
        <select value={konu} onChange={(e) => setKonu(e.target.value)} className={alan}>
          {DESTEK_KONULARI.map((k) => (
            <option key={k}>{k}</option>
          ))}
        </select>
      </label>
      <label className="block text-sm font-medium text-slate-700">
        Mesajın
        <textarea value={mesaj} onChange={(e) => setMesaj(e.target.value)} required minLength={10} maxLength={4000} rows={6} className={alan} />
      </label>
      {!uye && <TurnstileWidget onVerify={setTurnstileToken} />}
      {hata && <p className="text-sm text-destructive">{hata}</p>}
      <button type="submit" disabled={gonderiliyor} className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-primary px-5 py-3 text-sm font-bold text-primary-foreground disabled:opacity-50 sm:w-auto">
        {gonderiliyor ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
        Gönder
      </button>
    </form>
  );
}

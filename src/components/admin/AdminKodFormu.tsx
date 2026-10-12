"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

/** /admin-dogrula: kod iste -> e-postadaki 6 haneli kodu gir. */
export function AdminKodFormu() {
  const router = useRouter();
  const [gonderildi, setGonderildi] = useState(false);
  const [kod, setKod] = useState("");
  const [hata, setHata] = useState<string | null>(null);
  const [yukleniyor, setYukleniyor] = useState(false);

  async function istek(govde: object) {
    setHata(null);
    setYukleniyor(true);
    try {
      const res = await fetch("/api/admin/dogrula", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(govde) });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setHata(data.error ?? "Bir şeyler ters gitti.");
        return false;
      }
      return true;
    } finally {
      setYukleniyor(false);
    }
  }

  if (!gonderildi) {
    return (
      <div className="mt-5 space-y-3">
        {hata && <p className="text-sm text-destructive">{hata}</p>}
        <Button type="button" className="w-full" disabled={yukleniyor} onClick={async () => (await istek({ islem: "gonder" })) && setGonderildi(true)}>
          {yukleniyor ? "Gönderiliyor..." : "Kodu e-postama gönder"}
        </Button>
      </div>
    );
  }

  return (
    <form
      className="mt-5 space-y-3"
      onSubmit={async (e) => {
        e.preventDefault();
        if (await istek({ islem: "dogrula", kod })) {
          router.replace("/admin");
          router.refresh();
        }
      }}
    >
      <input
        required
        inputMode="numeric"
        autoComplete="one-time-code"
        maxLength={6}
        value={kod}
        onChange={(e) => setKod(e.target.value.replace(/\D/g, ""))}
        aria-label="Doğrulama kodu"
        className="h-12 w-full rounded-xl border border-primary/20 bg-white text-center text-xl tracking-[0.5em]"
      />
      {hata && <p className="text-sm text-destructive">{hata}</p>}
      <Button type="submit" className="w-full" disabled={yukleniyor || kod.length !== 6}>
        {yukleniyor ? "Doğrulanıyor..." : "Doğrula ve panele gir"}
      </Button>
      <button type="button" disabled={yukleniyor} onClick={() => istek({ islem: "gonder" })} className="w-full text-xs font-semibold text-primary disabled:opacity-50">
        Kodu tekrar gönder
      </button>
    </form>
  );
}

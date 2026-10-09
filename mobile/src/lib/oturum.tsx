import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from "react";
import { api } from "@/lib/api";
import type { Plan } from "@/lib/kpss";

export type Kullanici = { id: string; adSoyad: string; email: string; isAdmin: boolean; plan: Plan };

type OturumDegeri = {
  // undefined: henuz bilinmiyor (ilk acilis), null: giris yok.
  kullanici: Kullanici | null | undefined;
  yenile: () => Promise<void>;
  cikis: () => Promise<void>;
};

const OturumBaglami = createContext<OturumDegeri | null>(null);

const oku = () => api<{ user: Kullanici | null }>("/api/auth/me").then((c) => c.user, () => null);

/** Sitedeki oturum: /api/auth/me ile okunur, cerez cihazda saklanir. */
export function OturumSaglayici({ children }: { children: ReactNode }) {
  const [kullanici, setKullanici] = useState<Kullanici | null | undefined>(undefined);

  const yenile = useCallback(async () => setKullanici(await oku()), []);

  const cikis = useCallback(async () => {
    await api("/api/auth/logout", { method: "POST" }).catch(() => {});
    setKullanici(null);
  }, []);

  useEffect(() => {
    oku().then(setKullanici);
  }, []);

  return <OturumBaglami.Provider value={{ kullanici, yenile, cikis }}>{children}</OturumBaglami.Provider>;
}

export function useOturum() {
  const d = useContext(OturumBaglami);
  if (!d) throw new Error("OturumSaglayici eksik.");
  return d;
}

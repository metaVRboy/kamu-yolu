"use client";

import { Suspense, createContext, useCallback, useContext, useState } from "react";
import { X } from "lucide-react";
import { AuthForm } from "@/components/AuthForm";
import { AuthSplitPanel, GirisBasligi } from "@/components/AuthSplitPanel";

type Mod = "giris" | "kayit";

const AuthModalContext = createContext<((mod: Mod) => void) | null>(null);

/** Herhangi bir yerden giris/kayit modal'ini acmak icin. */
export function useAuthModal(): (mod: Mod) => void {
  const ctx = useContext(AuthModalContext);
  if (!ctx) throw new Error("useAuthModal, AuthModalProvider icinde kullanilmali.");
  return ctx;
}

const PANEL_METNI: Record<Mod, { baslik: React.ReactNode; aciklama: string }> = {
  giris: {
    baslik: <GirisBasligi />,
    aciklama: "Hesabına giriş yap, bölümüne uygun ilanları ve bildirimleri kaldığın yerden takip et.",
  },
  kayit: {
    baslik: "Bölümüne uygun ilanları kaçırma.",
    aciklama: "Ücretsiz hesap oluştur; bölümüne göre eşleşen ilanları ve haberleri tek yerden takip et.",
  },
};

export function AuthModalProvider({ children }: { children: React.ReactNode }) {
  const [mod, setMod] = useState<Mod | null>(null);
  const ac = useCallback((m: Mod) => setMod(m), []);
  const kapat = useCallback(() => setMod(null), []);

  return (
    <AuthModalContext.Provider value={ac}>
      {children}
      {mod && (
        <div
          className="fixed inset-0 z-[200] flex items-center justify-center overflow-y-auto bg-slate-950/70 p-4 backdrop-blur-sm"
          onClick={(e) => {
            // Sadece arka plana (karanlik alana) tiklandiginda kapat -
            // modal icerigine tiklamalar buraya hic ulasmaz (event bubbling
            // target === currentTarget kontroluyle ayirt edilir).
            if (e.target === e.currentTarget) kapat();
          }}
        >
          <div className="relative w-full max-w-4xl">
            <button
              type="button"
              onClick={kapat}
              aria-label="Kapat"
              className="absolute -top-3 -right-3 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-white text-slate-600 shadow-lg transition-colors hover:text-slate-900"
            >
              <X className="h-4 w-4" />
            </button>
            <div className="overflow-hidden rounded-3xl shadow-2xl">
              <AuthSplitPanel baslik={PANEL_METNI[mod].baslik} aciklama={PANEL_METNI[mod].aciklama}>
                <Suspense fallback={null}>
                  <AuthForm mode={mod} onBasarili={kapat} />
                </Suspense>
                <p className="mt-4 text-center text-sm text-muted-foreground">
                  {mod === "giris" ? (
                    <>
                      Hesabın yok mu?{" "}
                      <button
                        type="button"
                        onClick={() => setMod("kayit")}
                        className="font-medium text-primary hover:underline"
                      >
                        Kayıt ol
                      </button>
                    </>
                  ) : (
                    <>
                      Zaten hesabın var mı?{" "}
                      <button
                        type="button"
                        onClick={() => setMod("giris")}
                        className="font-medium text-primary hover:underline"
                      >
                        Giriş yap
                      </button>
                    </>
                  )}
                </p>
              </AuthSplitPanel>
            </div>
          </div>
        </div>
      )}
    </AuthModalContext.Provider>
  );
}

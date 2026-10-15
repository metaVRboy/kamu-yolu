"use client";

import { Suspense, createContext, useCallback, useContext, useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { X } from "lucide-react";
import { AuthForm } from "@/components/AuthForm";
import { AuthSplitPanel, GirisBasligi } from "@/components/AuthSplitPanel";

type Mod = "giris" | "kayit";
type Ac = (mod: Mod, sonra?: string) => void;

const AuthModalContext = createContext<Ac | null>(null);

/** Girissiz acilinca sunucuda /giris'e yonlenen sayfalar: linkleri sayfa yerine pencereyi acar. */
const KORUMALI = ["/profilim", "/becayis/talep-olustur", "/becayis/taleplerim", "/becayis/ilgilendiklerim"];

/** Herhangi bir yerden giris/kayit modal'ini acmak icin. sonra: girisen sonra gidilecek site ici yol. */
export function useAuthModal(): Ac {
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

/**
 * linkleriYakala: sitedeki /giris, /kayit-ol ve (girissizken) KORUMALI sayfa linkleri yeni sayfa acmaz,
 * bulunulan sayfanin ustunde bu pencereyi acar. /giris ve /kayit-ol adresleri dogrudan ziyaret ve
 * sunucu yonlendirmeleri icin sayfa olarak kalir.
 */
export function AuthModalProvider({
  children,
  linkleriYakala = false,
  girisli = false,
}: {
  children: React.ReactNode;
  linkleriYakala?: boolean;
  girisli?: boolean;
}) {
  const [durum, setDurum] = useState<{ mod: Mod; sonra?: string } | null>(null);
  const router = useRouter();
  const yol = usePathname();
  const ac = useCallback<Ac>((mod, sonra) => setDurum({ mod, sonra }), []);
  const kapat = useCallback(() => setDurum(null), []);
  const mod = durum?.mod;
  const setMod = (m: Mod) => setDurum((d) => ({ ...d, mod: m }));

  useEffect(() => {
    if (!linkleriYakala || yol === "/giris" || yol === "/kayit-ol") return;
    function tiklama(e: MouseEvent) {
      if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      const a = (e.target as Element | null)?.closest?.("a");
      if (!a?.href || (a.target && a.target !== "_self")) return;
      const u = new URL(a.href);
      if (u.origin !== location.origin) return;
      const sonra = u.searchParams.get("sonra") ?? undefined;
      let hedef: { mod: Mod; sonra?: string } | null = null;
      if (u.pathname === "/giris") hedef = { mod: "giris", sonra };
      else if (u.pathname === "/kayit-ol") hedef = { mod: "kayit", sonra };
      else if (!girisli && KORUMALI.some((k) => u.pathname === k || u.pathname.startsWith(k + "/"))) hedef = { mod: "giris", sonra: u.pathname + u.search };
      if (!hedef) return;
      e.preventDefault();
      setDurum(hedef);
    }
    // window capture: document'taki yakalayicilardan (sayfa yukleme cizgisi, Next Link) once calisir.
    window.addEventListener("click", tiklama, true);
    return () => window.removeEventListener("click", tiklama, true);
  }, [linkleriYakala, girisli, yol]);

  // Acikken Esc kapatir, arkadaki sayfa kaymaz.
  useEffect(() => {
    if (!mod) return;
    const tus = (e: KeyboardEvent) => e.key === "Escape" && kapat();
    const onceki = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", tus);
    return () => {
      document.body.style.overflow = onceki;
      window.removeEventListener("keydown", tus);
    };
  }, [mod, kapat]);

  function basarili() {
    const sonra = durum?.sonra;
    kapat();
    if (sonra?.startsWith("/") && !sonra.startsWith("//")) router.push(sonra);
  }

  return (
    <AuthModalContext.Provider value={ac}>
      {children}
      {mod && (
        <div
          // aria-modal: erisilebilirlik + tanitim penceresi kayit/giris formunun ustune acilmasin (YukseltmeTanitimi bunu kontrol eder).
          role="dialog"
          aria-modal="true"
          aria-label={mod === "giris" ? "Giriş yap" : "Kayıt ol"}
          className="fixed inset-0 z-[200] flex items-center justify-center overflow-y-auto bg-slate-950/45 p-4 backdrop-blur-md"
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
              <AuthSplitPanel baslik={PANEL_METNI[mod].baslik} aciklama={PANEL_METNI[mod].aciklama} ucretsizler={mod === "kayit"}>
                <Suspense fallback={null}>
                  <AuthForm mode={mod} onBasarili={basarili} />
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

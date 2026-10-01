import Image from "next/image";
import { ShieldCheck, FileCheck2 } from "lucide-react";

export function AuthSplitPanel({
  baslik,
  aciklama,
  children,
}: {
  baslik: string;
  aciklama: string;
  children: React.ReactNode;
}) {
  return (
    <div className="mx-auto my-8 grid max-w-4xl overflow-hidden rounded-3xl border border-border bg-white shadow-xl sm:my-14 md:grid-cols-2">
      <div className="relative hidden flex-col justify-between bg-slate-900 p-8 text-white md:flex">
        <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute -top-16 -left-16 h-56 w-56 rounded-full bg-primary/25 blur-3xl" />
        </div>

        <div className="relative">
          <Image
            src="/brand/kamu-yolu-logo.png"
            alt="Kamu Yolu"
            width={160}
            height={120}
            className="h-9 w-auto brightness-0 invert"
          />
        </div>

        <div className="relative">
          <h2 className="font-sans text-2xl font-bold leading-tight tracking-tight">{baslik}</h2>
          <p className="mt-2 text-sm text-slate-300">{aciklama}</p>

          <div className="mt-8 space-y-3">
            <div className="flex items-start gap-3 rounded-xl bg-white/5 p-3">
              <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
              <div>
                <p className="text-sm font-semibold">Güvenli oturum</p>
                <p className="text-xs text-slate-400">
                  Şifren tersine çevrilemeyecek şekilde saklanır, bağlantılar şifrelidir.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3 rounded-xl bg-white/5 p-3">
              <FileCheck2 className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
              <div>
                <p className="text-sm font-semibold">Şeffaf yasal metinler</p>
                <p className="text-xs text-slate-400">
                  KVKK, gizlilik ve kullanım koşullarına her zaman erişebilirsin.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-center p-6 sm:p-10">{children}</div>
    </div>
  );
}

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
    <div className="mx-auto grid w-full max-w-4xl overflow-hidden rounded-3xl bg-white md:grid-cols-2">
      <div className="relative hidden flex-col justify-end bg-slate-900 p-8 text-white md:flex">
        <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
          {/* Logo kendi orijinal (koyu lacivert/altin) renkleriyle
              kullanildigi icin koyu panel uzerinde kaybolmamasi adina
              arkasinda beyaz bir isik humesi var. */}
          <div className="absolute -top-16 -left-16 h-64 w-64 rounded-full bg-white/25 blur-3xl" />
          <div className="absolute -bottom-20 -right-10 h-48 w-48 rounded-full bg-primary/10 blur-3xl" />
          <Image
            src="/brand/kamu-yolu-emblem.png"
            alt=""
            width={360}
            height={360}
            className="absolute -top-10 -right-14 h-72 w-72 opacity-[0.06] brightness-0 invert"
          />
        </div>

        {/* Logo, panelin icerik akisindan bagimsiz, her zaman sol-ust koseye
            sabit - icerik kisa/uzun olsun degismez. */}
        <Image
          src="/brand/kamu-yolu-logo-premium.png"
          alt="Kamu Yolu"
          width={300}
          height={300}
          className="absolute left-6 top-6 h-40 w-auto"
        />

        <div className="relative">
          <h2 className="font-sans text-2xl font-bold leading-tight tracking-tight">{baslik}</h2>
          <p className="mt-2 text-sm text-slate-300">{aciklama}</p>

          <div className="mt-8 space-y-3">
            <div className="flex items-start gap-3 rounded-xl bg-white/5 p-3">
              <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
              <div>
                <p className="text-sm font-semibold">Güvenli oturum</p>
                <p className="text-xs text-slate-400">
                  Şifreni biz dahil kimse göremez; tüm bağlantılar şifreli iletilir.
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

          <p className="mt-6 text-xs leading-relaxed text-slate-500">
            Kamu Yolu, kamu personelinin bölümüne uygun ilan ve haberlere erişimini düzenli,
            ölçülü ve güven odaklı bir deneyimle sunar.
          </p>
        </div>
      </div>

      <div className="flex items-center justify-center p-6 sm:p-10">
        <div className="w-full max-w-sm">{children}</div>
      </div>
    </div>
  );
}

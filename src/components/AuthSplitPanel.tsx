import Image from "next/image";
import { ShieldCheck, FileCheck2 } from "lucide-react";

// Logodaki gercek altin rengi (kamu-yolu-logo-orijinal.png'den piksel
// ornegiyle bulundu: #C0A050) - UI'da baska bir sari/amber uydurmak
// yerine aciklik/koyuluk/parlaklik varyasyonlari BU renkten turetildi.
const LOGO_ALTIN_PARLAK = "#FCEFC7";
const LOGO_ALTIN_ACIK = "#F0D98C";
const LOGO_ALTIN = "#C0A050";
const LOGO_ALTIN_KOYU = "#8C7128";

/** Giris modunun baslik metni - "kamuyolu.com" kismi logonun gercek altin rengiyle/gloss efektli. */
export function GirisBasligi() {
  return (
    <>
      <span
        className="bg-clip-text text-transparent"
        style={{
          backgroundImage: `linear-gradient(to bottom, ${LOGO_ALTIN_PARLAK}, ${LOGO_ALTIN_ACIK} 35%, ${LOGO_ALTIN} 65%, ${LOGO_ALTIN_KOYU})`,
        }}
      >
        kamuyolu.com
      </span>
      &apos;a
      <br />
      Hoşgeldin.
    </>
  );
}

export function AuthSplitPanel({
  baslik,
  aciklama,
  children,
}: {
  baslik: React.ReactNode;
  aciklama: string;
  children: React.ReactNode;
}) {
  // Yuvarlatma/kirpma (rounded-3xl + overflow-hidden) kasitli olarak
  // burada degil, bu bileseni saran DISARIDAKI kapsayicida (AuthModal
  // veya /giris, /kayit-ol sayfalari) uygulanir - ikisi de ayni radius'u
  // tekrar uygularsa iki ayri yuvarlatma kosede ust uste binip ince bir
  // beyaz/isikli kenar (antialiasing dikisi) birakiyordu.
  // bg-white kasitli olarak kok elemanda degil - kirpilan (rounded)
  // disaridaki kapsayicida kok elemanin kendi arka plan rengi, yuvarlak
  // kosenin antialiasing kenarindan "sizip" beyaz bir taşma gibi
  // gorunuyordu. Her yarim artik SADECE kendi arka planini tasiyor.
  return (
    <div className="mx-auto grid w-full max-w-4xl md:grid-cols-2">
      <div className="relative hidden flex-col justify-end bg-slate-900 p-8 text-white md:flex">
        <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
          {/* Logo kendi orijinal (koyu lacivert/altin) renkleriyle
              kullanildigi icin koyu panel uzerinde kaybolmamasi adina
              arkasinda beyaz bir isik humesi var. */}
          <div className="absolute -top-16 -left-16 h-64 w-64 rounded-full bg-white/25 blur-3xl" />
          {/* brightness-0 -> amblemi duz siyah siluete cevirir (invert
              UYGULANMAZ, aksi halde beyaz olur) - siyah, arka plandaki
              slate-900'den koyu oldugu icin panelde ondan daha koyu bir
              lacivert/siyah leke olarak gorunur. */}
          <Image
            src="/brand/kamu-yolu-emblem.png"
            alt=""
            width={360}
            height={360}
            className="absolute -top-10 -right-14 h-72 w-72 opacity-30 brightness-0"
          />
        </div>

        {/* Logo, panelin icerik akisindan bagimsiz, her zaman sol-ust koseye
            sabit - icerik kisa/uzun olsun degismez. */}
        <Image
          src="/brand/kamu-yolu-logo-premium.png"
          alt="Kamu Yolu"
          width={300}
          height={300}
          className="absolute left-8 top-2 h-40 w-auto"
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
            Kamu Yolu, kullanıcının bölümüne uygun ilan ve haberlere düzenli, ölçülü ve güven
            odaklı bir deneyimle erişmesini sağlar.
          </p>
        </div>
      </div>

      <div className="flex items-center justify-center bg-white p-6 sm:p-10">
        <div className="w-full max-w-sm">{children}</div>
      </div>
    </div>
  );
}

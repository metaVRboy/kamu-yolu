"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Camera, LogOut, Monitor, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PasswordInput } from "@/components/ui/password-input";
import { toast } from "@/components/ui/toast";
import { SILME_ONAY_METNI } from "@/lib/authValidation";
import { cn } from "@/lib/utils";

const SEKMELER = [
  { href: "/profilim/ayarlar", label: "Hesap" },
  { href: "/profilim/ayarlar/guvenlik", label: "Güvenlik" },
  { href: "/profilim/ayarlar/gizlilik", label: "Gizlilik ve KVKK" },
];

export function AyarlarSekmeleri() {
  const pathname = usePathname();
  return (
    <nav aria-label="Ayarlar bölümleri" className="mt-6 flex gap-1 overflow-x-auto rounded-2xl border border-primary/15 bg-white p-1.5 shadow-sm">
      {SEKMELER.map((s) => (
        <Link
          key={s.href}
          href={s.href}
          aria-current={pathname === s.href ? "page" : undefined}
          className={cn(
            "rounded-xl px-4 py-2 text-sm font-semibold whitespace-nowrap transition-colors",
            pathname === s.href ? "bg-primary text-primary-foreground" : "text-slate-600 hover:bg-primary/10 hover:text-primary",
          )}
        >
          {s.label}
        </Link>
      ))}
    </nav>
  );
}

/** JSON hata metnini ya da varsayilani dondurur. */
async function hataMetni(res: Response) {
  return (await res.json().catch(() => null))?.error ?? "Bir şeyler ters gitti.";
}

const FOTO_BOYUT = 256;

/** Secilen gorseli kare kirpip 256px WebP'ye cevirir (sunucuya ~10-30 KB gider). */
async function kareWebp(dosya: File): Promise<string> {
  const bitmap = await createImageBitmap(dosya);
  const kenar = Math.min(bitmap.width, bitmap.height);
  const tuval = document.createElement("canvas");
  tuval.width = tuval.height = FOTO_BOYUT;
  tuval.getContext("2d")!.drawImage(bitmap, (bitmap.width - kenar) / 2, (bitmap.height - kenar) / 2, kenar, kenar, 0, 0, FOTO_BOYUT, FOTO_BOYUT);
  bitmap.close();
  return tuval.toDataURL("image/webp", 0.85);
}

export function ProfilFotografi({ adSoyad, ilkUrl }: { adSoyad: string; ilkUrl: string | null }) {
  const router = useRouter();
  const [url, setUrl] = useState(ilkUrl);
  const [yukleniyor, setYukleniyor] = useState(false);
  const girdi = useRef<HTMLInputElement>(null);
  const basHarfler = adSoyad
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]!.toLocaleUpperCase("tr-TR"))
    .join("");

  async function yukle(dosya: File | undefined) {
    if (!dosya) return;
    setYukleniyor(true);
    try {
      const res = await fetch("/api/profil/fotograf", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ veri: await kareWebp(dosya) }),
      });
      if (!res.ok) return toast.error("Fotoğraf yüklenemedi.", await hataMetni(res));
      setUrl((await res.json()).url);
      router.refresh();
    } catch {
      toast.error("Fotoğraf okunamadı.", "Lütfen başka bir görsel dene.");
    } finally {
      setYukleniyor(false);
      if (girdi.current) girdi.current.value = "";
    }
  }

  async function kaldir() {
    setYukleniyor(true);
    try {
      const res = await fetch("/api/profil/fotograf", { method: "DELETE" });
      if (!res.ok) return toast.error("Fotoğraf kaldırılamadı.", await hataMetni(res));
      setUrl(null);
      router.refresh();
    } finally {
      setYukleniyor(false);
    }
  }

  return (
    <div className="flex items-center gap-4">
      {url ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={url} alt="Profil fotoğrafın" className="h-20 w-20 rounded-full object-cover ring-2 ring-primary/15" />
      ) : (
        <span className="flex h-20 w-20 items-center justify-center rounded-full bg-primary/10 text-2xl font-bold text-primary ring-2 ring-primary/15">
          {basHarfler || "?"}
        </span>
      )}
      <div className="flex flex-wrap gap-2">
        <input ref={girdi} type="file" accept="image/jpeg,image/png,image/webp" hidden onChange={(e) => yukle(e.target.files?.[0])} />
        <Button type="button" variant="outline" disabled={yukleniyor} onClick={() => girdi.current?.click()}>
          <Camera className="mr-1.5" />
          {yukleniyor ? "Yükleniyor..." : url ? "Değiştir" : "Fotoğraf yükle"}
        </Button>
        {url && (
          <Button type="button" variant="ghost" disabled={yukleniyor} onClick={kaldir}>
            Kaldır
          </Button>
        )}
      </div>
    </div>
  );
}

export function EpostaDegistirForm({ email, sifreVar }: { email: string; sifreVar: boolean }) {
  const router = useRouter();
  const [adim, setAdim] = useState<"kapali" | "form" | "kod">("kapali");
  const [yeniEmail, setYeniEmail] = useState("");
  const [sifre, setSifre] = useState("");
  const [kod, setKod] = useState("");
  const [hata, setHata] = useState<string | null>(null);
  const [yukleniyor, setYukleniyor] = useState(false);

  async function istek(url: string, govde: object) {
    setHata(null);
    setYukleniyor(true);
    try {
      const res = await fetch(url, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(govde) });
      if (!res.ok) {
        setHata(await hataMetni(res));
        return false;
      }
      return true;
    } finally {
      setYukleniyor(false);
    }
  }

  async function kodGonder(e: React.FormEvent) {
    e.preventDefault();
    if (await istek("/api/profil/eposta", { yeniEmail, sifre: sifre || undefined })) setAdim("kod");
  }

  async function dogrula(e: React.FormEvent) {
    e.preventDefault();
    if (await istek("/api/profil/eposta/dogrula", { kod })) {
      toast.success("E-posta adresin güncellendi.", `Artık ${yeniEmail} ile giriş yapacaksın.`);
      setAdim("kapali");
      setSifre("");
      setKod("");
      router.refresh();
    }
  }

  if (adim === "kapali") {
    return (
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm font-medium text-slate-800">{email}</p>
        <Button type="button" variant="outline" onClick={() => setAdim("form")}>
          E-postayı değiştir
        </Button>
      </div>
    );
  }

  return adim === "form" ? (
    <form onSubmit={kodGonder} className="space-y-4">
      <div>
        <Label className="mb-1.5">Yeni e-posta adresi</Label>
        <Input type="email" required value={yeniEmail} onChange={(e) => setYeniEmail(e.target.value)} autoComplete="email" className="border-primary/20 bg-white" />
      </div>
      {sifreVar && (
        <div>
          <Label className="mb-1.5">Mevcut şifren</Label>
          <PasswordInput required value={sifre} onChange={(e) => setSifre(e.target.value)} autoComplete="current-password" className="border-primary/20 bg-white" />
        </div>
      )}
      {hata && <p className="text-sm text-destructive">{hata}</p>}
      <div className="flex gap-2">
        <Button type="submit" disabled={yukleniyor}>{yukleniyor ? "Gönderiliyor..." : "Doğrulama kodu gönder"}</Button>
        <Button type="button" variant="ghost" onClick={() => setAdim("kapali")}>Vazgeç</Button>
      </div>
    </form>
  ) : (
    <form onSubmit={dogrula} className="space-y-4">
      <p className="text-sm text-muted-foreground">
        <strong className="text-slate-800">{yeniEmail}</strong> adresine 6 haneli bir kod gönderdik. Kod 10 dakika geçerli.
      </p>
      <div>
        <Label className="mb-1.5">Doğrulama kodu</Label>
        <Input
          required
          inputMode="numeric"
          autoComplete="one-time-code"
          maxLength={6}
          value={kod}
          onChange={(e) => setKod(e.target.value.replace(/\D/g, ""))}
          className="max-w-40 border-primary/20 bg-white text-center text-lg tracking-[0.4em]"
        />
      </div>
      {hata && <p className="text-sm text-destructive">{hata}</p>}
      <div className="flex gap-2">
        <Button type="submit" disabled={yukleniyor || kod.length !== 6}>{yukleniyor ? "Doğrulanıyor..." : "Onayla"}</Button>
        <Button type="button" variant="ghost" onClick={() => setAdim("form")}>Geri</Button>
      </div>
    </form>
  );
}

export function GoogleBaglantisi({ bagli, sifreVar }: { bagli: boolean; sifreVar: boolean }) {
  const router = useRouter();
  const [onay, setOnay] = useState(false);
  const [yukleniyor, setYukleniyor] = useState(false);

  async function kaldir() {
    setYukleniyor(true);
    try {
      const res = await fetch("/api/profil/google", { method: "DELETE" });
      if (!res.ok) return toast.error("Bağlantı kaldırılamadı.", await hataMetni(res));
      toast.success("Google bağlantısı kaldırıldı.", "Artık e-posta ve şifrenle giriş yapacaksın.");
      setOnay(false);
      router.refresh();
    } finally {
      setYukleniyor(false);
    }
  }

  if (!bagli) {
    return (
      <p className="text-sm text-muted-foreground">
        Hesabına bağlı bir Google hesabı yok. Giriş sayfasında “Google ile devam et”i seçersen, aynı e-posta adresli Google hesabın otomatik olarak bağlanır.
      </p>
    );
  }
  return (
    <div className="flex flex-wrap items-center justify-between gap-3">
      <p className="text-sm text-slate-700">
        <span className="font-semibold text-emerald-700">Bağlı.</span> Google hesabınla giriş yapabilirsin.
        {!sifreVar && <span className="block text-muted-foreground">Bağlantıyı kaldırmak için önce yukarıdan bir şifre belirlemelisin.</span>}
      </p>
      {sifreVar && (
        <Button type="button" variant="outline" onClick={() => setOnay(true)}>
          Bağlantıyı kaldır
        </Button>
      )}
      <ConfirmDialog
        open={onay}
        onOpenChange={setOnay}
        title="Google bağlantısı kaldırılsın mı?"
        description="Bundan sonra yalnızca e-posta adresin ve şifrenle giriş yapabilirsin."
        onConfirm={kaldir}
        loading={yukleniyor}
        onayEtiketi="Kaldır"
      />
    </div>
  );
}

export type OturumSatiri = { id: string; cihaz: string; olusturma: string; sonGorulme: string; buCihaz: boolean };

export function OturumListesi({ oturumlar }: { oturumlar: OturumSatiri[] }) {
  const router = useRouter();
  const [kapatilacak, setKapatilacak] = useState<OturumSatiri | "tumu" | null>(null);
  const [yukleniyor, setYukleniyor] = useState(false);

  async function kapat() {
    if (!kapatilacak) return;
    setYukleniyor(true);
    try {
      const res = await fetch(kapatilacak === "tumu" ? "/api/profil/oturumlar" : `/api/profil/oturumlar/${kapatilacak.id}`, { method: "DELETE" });
      if (!res.ok) return toast.error("Oturum kapatılamadı.", await hataMetni(res));
      toast.success(kapatilacak === "tumu" ? "Diğer tüm cihazlardan çıkış yapıldı." : "Oturum kapatıldı.");
      setKapatilacak(null);
      router.refresh();
    } finally {
      setYukleniyor(false);
    }
  }

  return (
    <div className="space-y-3">
      <ul className="divide-y divide-primary/10 rounded-xl border border-primary/15">
        {oturumlar.map((o) => (
          <li key={o.id} className="flex items-center gap-3 px-4 py-3">
            <Monitor className="h-5 w-5 shrink-0 text-primary/70" />
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold text-slate-800">
                {o.cihaz}
                {o.buCihaz && <span className="ml-2 rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-semibold text-emerald-700">Bu cihaz</span>}
              </p>
              <p className="text-xs text-muted-foreground">
                Giriş: {o.olusturma} · Son etkinlik: {o.sonGorulme}
              </p>
            </div>
            {!o.buCihaz && (
              <Button type="button" variant="ghost" size="sm" onClick={() => setKapatilacak(o)}>
                Kapat
              </Button>
            )}
          </li>
        ))}
      </ul>
      <Button type="button" variant="outline" onClick={() => setKapatilacak("tumu")}>
        <LogOut className="mr-1.5" />
        Diğer tüm cihazlardan çıkış yap
      </Button>
      <ConfirmDialog
        open={kapatilacak !== null}
        onOpenChange={(acik) => !acik && setKapatilacak(null)}
        title={kapatilacak === "tumu" ? "Diğer tüm cihazlardan çıkış yapılsın mı?" : "Bu oturum kapatılsın mı?"}
        description={
          kapatilacak === "tumu"
            ? "Bu cihaz dışındaki tüm tarayıcı ve telefonlarda oturumun kapanır; oralarda yeniden giriş yapman gerekir."
            : `${kapatilacak?.cihaz ?? ""} cihazındaki oturumun kapanır.`
        }
        onConfirm={kapat}
        loading={yukleniyor}
        onayEtiketi="Çıkış yap"
      />
    </div>
  );
}

export function HesapSilForm({ sifreVar }: { sifreVar: boolean }) {
  const router = useRouter();
  const [deger, setDeger] = useState("");
  const [onay, setOnay] = useState(false);
  const [hata, setHata] = useState<string | null>(null);
  const [yukleniyor, setYukleniyor] = useState(false);

  async function sil() {
    setHata(null);
    setYukleniyor(true);
    try {
      const res = await fetch("/api/profil", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(sifreVar ? { sifre: deger } : { onayMetni: deger }),
      });
      if (!res.ok) {
        setHata(await hataMetni(res));
        setOnay(false);
        return;
      }
      toast.success("Hesabın silindi.", "Kamu Yolu'nu kullandığın için teşekkür ederiz.");
      router.push("/");
      router.refresh();
    } finally {
      setYukleniyor(false);
    }
  }

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        setOnay(true);
      }}
      className="space-y-4"
    >
      <ul className="list-disc space-y-1 pl-5 text-sm text-slate-600">
        <li>Profil bilgilerin, fotoğrafın, becayiş ilanların, bildirimlerin ve KPSS deneme sonuçların kalıcı olarak silinir.</li>
        <li>Başkalarının ilanlarına gönderdiğin mesajlar, karşı tarafın sohbeti bozulmasın diye “Silinmiş kullanıcı” adıyla kalır.</li>
        <li>Bu işlem geri alınamaz. İstersen önce yukarıdan verilerini indirebilirsin.</li>
      </ul>
      <div>
        <Label className="mb-1.5">{sifreVar ? "Onaylamak için şifreni gir" : `Onaylamak için “${SILME_ONAY_METNI}” yaz`}</Label>
        {sifreVar ? (
          <div className="max-w-sm">
            <PasswordInput required value={deger} onChange={(e) => setDeger(e.target.value)} autoComplete="current-password" className="border-primary/20 bg-white" />
          </div>
        ) : (
          <Input required value={deger} onChange={(e) => setDeger(e.target.value)} className="max-w-sm border-primary/20 bg-white" />
        )}
      </div>
      {hata && <p className="text-sm text-destructive">{hata}</p>}
      <Button type="submit" variant="destructive" disabled={yukleniyor || !deger}>
        <Trash2 className="mr-1.5" />
        Hesabımı kalıcı olarak sil
      </Button>
      <ConfirmDialog
        open={onay}
        onOpenChange={setOnay}
        title="Hesabın kalıcı olarak silinsin mi?"
        description="Bu işlem geri alınamaz. Tüm verilerin silinecek ve oturumun kapanacak."
        onConfirm={sil}
        loading={yukleniyor}
        onayEtiketi="Hesabımı sil"
      />
    </form>
  );
}

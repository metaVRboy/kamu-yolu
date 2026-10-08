"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { sayfaYuklemesiniBaslat } from "@/components/SayfaYuklemeCizgisi";
import { UserRound, Settings, CreditCard, Repeat, LogOut, Shield } from "lucide-react";
import { cn } from "@/lib/utils";

const ADMIN_LINKLERI = [
  { href: "/admin/uyeler", label: "Üyeler ve planlar" },
  { href: "/admin/sms", label: "SMS kayıtları" },
  { href: "/admin/duyurular", label: "Duyurular" },
  { href: "/admin/haberler", label: "Haberler" },
];

export function ProfileMenu({
  adSoyad,
  abonelikPlani,
  fotografUrl,
  isAdmin,
}: {
  adSoyad: string;
  abonelikPlani: "UCRETSIZ" | "PRO" | "PRO_PLUS";
  fotografUrl: string | null;
  isAdmin: boolean;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function handleClickOutside(e: MouseEvent) {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open]);

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    sayfaYuklemesiniBaslat("/");
    router.push("/");
    router.refresh();
  }

  const proRozeti =
    abonelikPlani === "PRO_PLUS" ? "PRO+" : abonelikPlani === "PRO" ? "PRO" : null;

  return (
    <div className="relative" ref={panelRef}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex h-9 items-center gap-1.5 rounded-lg border border-border bg-white px-2.5 text-sm font-medium text-slate-600 transition-colors hover:border-primary/30 hover:text-primary"
      >
        {fotografUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={fotografUrl} alt="" className="h-6 w-6 rounded-full object-cover" />
        ) : (
          <UserRound className="h-4 w-4" />
        )}
        <span className="hidden sm:inline">{adSoyad}</span>
        {proRozeti && (
          <span className="rounded-full bg-primary px-1.5 py-0.5 text-[10px] font-bold text-primary-foreground">
            {proRozeti}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute top-full right-0 z-50 mt-2 w-56 overflow-hidden rounded-2xl border border-primary/20 bg-white py-1.5 shadow-2xl shadow-primary/20">
          <Link
            href="/profilim/ayarlar"
            onClick={() => setOpen(false)}
            className="flex items-center gap-2.5 px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-primary/10 hover:text-slate-900"
          >
            <Settings className="h-4 w-4" />
            Ayarlar
          </Link>
          <Link
            href="/profilim/abonelik"
            onClick={() => setOpen(false)}
            className="flex items-center gap-2.5 px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-primary/10 hover:text-slate-900"
          >
            <CreditCard className="h-4 w-4" />
            Aboneliğim
          </Link>
          <Link
            href="/becayis/taleplerim"
            onClick={() => setOpen(false)}
            className="flex items-center gap-2.5 px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-primary/10 hover:text-slate-900"
          >
            <Repeat className="h-4 w-4" />
            Becayiş Sayfam
          </Link>
          {isAdmin && (
            <div className="my-1 border-y border-primary/10 py-1">
              <p className="px-4 pt-1 pb-0.5 text-[11px] font-bold tracking-wider text-muted-foreground uppercase">Yönetim</p>
              {ADMIN_LINKLERI.map((l) => (
                <Link
                  key={l.href}
                  href={l.href}
                  onClick={() => setOpen(false)}
                  className="flex items-center gap-2.5 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-primary/10 hover:text-slate-900"
                >
                  <Shield className="h-4 w-4" />
                  {l.label}
                </Link>
              ))}
            </div>
          )}
          <button
            type="button"
            onClick={handleLogout}
            className={cn(
              "flex w-full items-center gap-2.5 px-4 py-2.5 text-left text-sm font-medium text-slate-700 hover:bg-primary/10 hover:text-slate-900",
            )}
          >
            <LogOut className="h-4 w-4" />
            Çıkış Yap
          </button>
        </div>
      )}
    </div>
  );
}

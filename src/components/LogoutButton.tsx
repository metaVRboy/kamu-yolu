"use client";

import { useRouter } from "next/navigation";
import { sayfaYuklemesiniBaslat } from "@/components/SayfaYuklemeCizgisi";
import { LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";

/** kapakta: profil kartinin mavi kapagi uzerinde (beyaz, yari saydam). */
export function LogoutButton({ kapakta = false }: { kapakta?: boolean }) {
  const router = useRouter();

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    sayfaYuklemesiniBaslat("/");
    router.push("/");
    router.refresh();
  }

  if (kapakta) {
    return (
      <button
        type="button"
        onClick={handleLogout}
        className="inline-flex h-8 items-center gap-1.5 rounded-full bg-white px-3 text-sm font-semibold text-primary transition-colors hover:bg-blue-50"
      >
        <LogOut className="h-3.5 w-3.5" aria-hidden />
        Çıkış Yap
      </button>
    );
  }
  return (
    <Button type="button" variant="outline" size="sm" onClick={handleLogout} className="border-primary/25">
      <LogOut className="h-3.5 w-3.5" />
      Çıkış Yap
    </Button>
  );
}

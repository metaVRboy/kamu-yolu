"use client";

import { UserRound } from "lucide-react";
import { useAuthModal } from "@/components/AuthModal";

export function HeaderAuthButton() {
  const acModal = useAuthModal();

  return (
    <button
      type="button"
      onClick={() => acModal("giris")}
      className="flex h-9 items-center justify-center gap-1.5 rounded-lg border border-border bg-white px-2.5 text-sm font-medium text-slate-600 transition-colors hover:border-primary/30 hover:text-primary sm:px-4"
    >
      <UserRound className="h-4 w-4 sm:hidden" />
      <span className="hidden sm:inline">Giriş Yap</span>
    </button>
  );
}

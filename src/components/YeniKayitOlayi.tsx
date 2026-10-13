"use client";

import { useEffect } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { olay } from "@/lib/olcum";

/** Kayittan sonra (/profilim?yeni=1, e-posta ve Google ortak): donusum olayini bir kez atar, parametreyi temizler. */
export function YeniKayitOlayi() {
  const params = useSearchParams();
  const router = useRouter();
  const yol = usePathname();
  useEffect(() => {
    if (params.get("yeni") !== "1") return;
    olay("sign_up");
    router.replace(yol, { scroll: false });
  }, [params, router, yol]);
  return null;
}

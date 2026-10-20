"use client";

import { useEffect, useState } from "react";
import type { KisiselOzet } from "@/lib/kisiselOzet";
import type { RozetRengi } from "@/lib/rozetRenkleri";

export type UyeOzeti = {
  uye: {
    adSoyad: string;
    fotoUrl: string | null;
    bolum: string | null;
    duzey: string | null;
    plan: "UCRETSIZ" | "PRO" | "PRO_PLUS";
    planAdi: string;
    planKalanGun: number | null;
    seri: { gun: number; bugunCozuldu: boolean; enIyi: number; toplamGun: number };
    denemeSayisi: number;
    rozetSayisi: number;
    rozetler: { id: string; ad: string; renk: RozetRengi }[];
  } | null;
  ozet?: KisiselOzet | null;
  sonDeneme?: { puan: number | null; siralama: { yuzde: number; katilimci: number } | null } | null;
};

const TAZELIK_MS = 60_000;
let onbellek: { zaman: number; istek: Promise<UyeOzeti> } | null = null;

/** Ana sayfadaki uye parcalari tek istegi paylasir (profil karti, gunluk serit, davet bandi). Yuklenirken undefined. */
export function useUyeOzeti(): UyeOzeti | undefined {
  const [veri, setVeri] = useState<UyeOzeti>();
  useEffect(() => {
    if (!onbellek || Date.now() - onbellek.zaman > TAZELIK_MS) {
      onbellek = {
        zaman: Date.now(),
        istek: fetch("/api/benim-ozetim")
          .then((r) => (r.ok ? r.json() : { uye: null }))
          .catch(() => ({ uye: null })),
      };
    }
    let iptal = false;
    onbellek.istek.then((v) => !iptal && setVeri(v));
    return () => {
      iptal = true;
    };
  }, []);
  return veri;
}

/** Gunun sorulari cozulunce ozet (seri, rozet) yeniden cekilsin. */
export const uyeOzetiniTazele = () => {
  onbellek = null;
};

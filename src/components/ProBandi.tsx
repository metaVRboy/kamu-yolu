"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { X } from "lucide-react";
import { useAuthModal } from "@/components/AuthModal";
import { useYukseltme } from "@/components/YukseltmePenceresi";
import type { BantMesaji } from "@/app/api/pro-bandi/route";

const KAPALI_MS = 24 * 3_600_000;
const anahtar = (tur: string) => `kyBant:${tur}`;

/** Bant gosterilmeyen yerler: odak gereken (sinav, giris/kayit/sifre) ve zaten yukseltme/yonetim sayfalari. */
function gizliSayfa(yol: string) {
  return (
    yol.startsWith("/admin") ||
    /^\/kpss-denemesi\/[^/]+/.test(yol) ||
    ["/giris", "/kayit-ol", "/sifremi-unuttum", "/profilim/abonelik"].includes(yol) ||
    yol.startsWith("/sifre-sifirla")
  );
}

function kapatildi(tur: string) {
  try {
    return Date.now() - Number(localStorage.getItem(anahtar(tur)) ?? 0) < KAPALI_MS;
  } catch {
    return false;
  }
}

/**
 * Header'in alt kenarinda sabit Pro bandi. Mesaj sunucuda uyenin gercek durumundan secilir (/api/pro-bandi);
 * kapatilan mesaj turu 24 saat gorunmez. Pro+ uyeye gelmez.
 */
export function ProBandi() {
  const yol = usePathname();
  const [mesaj, setMesaj] = useState<BantMesaji>(null);
  const yukselt = useYukseltme();
  const authAc = useAuthModal();

  useEffect(() => {
    let iptal = false;
    fetch("/api/pro-bandi")
      .then((r) => (r.ok ? r.json() : { mesaj: null }))
      .then((d: { mesaj: BantMesaji }) => !iptal && setMesaj(d.mesaj && !kapatildi(d.mesaj.tur) ? d.mesaj : null))
      .catch(() => {});
    return () => {
      iptal = true;
    };
  }, []);

  if (!mesaj || gizliSayfa(yol)) return null;

  function kapat() {
    try {
      localStorage.setItem(anahtar(mesaj!.tur), String(Date.now()));
    } catch {}
    setMesaj(null);
  }

  const dugmeSinifi = "shrink-0 rounded-lg bg-white px-3.5 py-1.5 text-sm font-bold text-teal-800 transition-colors hover:bg-teal-50";
  const { cta } = mesaj;
  return (
    <div className="bg-teal-700 text-white">
      <div className="mx-auto flex w-full max-w-6xl flex-wrap items-center gap-x-4 gap-y-2 px-4 py-2 text-sm sm:px-6">
        <p className="min-w-0 flex-[1_1_260px]">
          {mesaj.once}
          <strong>{mesaj.vurgu}</strong>
          {mesaj.sonra}
        </p>
        {cta.eylem === "link" ? (
          <Link href={cta.href!} className={dugmeSinifi}>
            {cta.etiket}
          </Link>
        ) : (
          <button type="button" className={dugmeSinifi} onClick={() => (cta.eylem === "kayit" ? authAc("kayit") : yukselt({ plan: cta.plan, kaynak: "bant" }))}>
            {cta.etiket}
          </button>
        )}
        <button type="button" onClick={kapat} aria-label="Bandı 24 saat gizle" className="-mr-2 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg hover:bg-white/15">
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}

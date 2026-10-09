"use client";

import { useSyncExternalStore, useState } from "react";
import Link from "next/link";
import { Megaphone, X } from "lucide-react";
import { cn } from "@/lib/utils";

const RENK = {
  bilgi: "bg-primary text-primary-foreground",
  uyari: "bg-amber-400 text-amber-950",
  kampanya: "bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white",
} as const;

const anahtar = (metin: string) => `serit-kapandi:${metin}`;

function kapatildiMi(metin: string) {
  try {
    return localStorage.getItem(anahtar(metin)) === "1";
  } catch {
    return false;
  }
}

/** Tum sayfalarin ustundeki admin duyuru seridi. Kapatilan metin o tarayicida bir daha gosterilmez (metin degisince yine gorunur). */
export function DuyuruSeridi({ metin, link, tur }: { metin: string; link: string | null; tur: keyof typeof RENK }) {
  // Sunucuda (ve ilk hidrasyonda) gorunur; tarayicida kapatilmissa gizlenir.
  const oncedenKapali = useSyncExternalStore(
    () => () => {},
    () => kapatildiMi(metin),
    () => false,
  );
  const [kapandi, setKapandi] = useState(false);
  if (oncedenKapali || kapandi) return null;

  const icerik = (
    <>
      <Megaphone className="h-4 w-4 shrink-0" />
      <span className="font-semibold">{metin}</span>
      {link && <span className="underline underline-offset-2">Ayrıntılar →</span>}
    </>
  );
  return (
    <div className={cn("relative flex items-center justify-center px-10 py-2 text-center text-sm", RENK[tur])}>
      {link ? (
        <Link href={link} className="flex items-center gap-2">
          {icerik}
        </Link>
      ) : (
        <p className="flex items-center gap-2">{icerik}</p>
      )}
      <button
        type="button"
        aria-label="Duyuruyu kapat"
        onClick={() => {
          setKapandi(true);
          try {
            localStorage.setItem(anahtar(metin), "1");
          } catch {}
        }}
        className="absolute right-3 rounded-full p-1 opacity-80 hover:opacity-100"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}

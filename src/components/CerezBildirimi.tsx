"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

const DEPOLAMA_ANAHTARI = "cerez-bildirimi-kabul";

export function CerezBildirimi() {
  const [gorunur, setGorunur] = useState(false);

  useEffect(() => {
    try {
      if (!localStorage.getItem(DEPOLAMA_ANAHTARI)) setGorunur(true);
    } catch {
      // localStorage kapalıysa (ör. gizli sekme kısıtlaması) bildirimi hiç gösterme.
    }
  }, []);

  function kabulEt() {
    setGorunur(false);
    try {
      localStorage.setItem(DEPOLAMA_ANAHTARI, "1");
    } catch {
      // Yazılamadıysa bir sonraki ziyarette tekrar gösterilir, sorun degil.
    }
  }

  if (!gorunur) return null;

  return (
    <div className="fixed inset-x-0 bottom-0 z-50 border-t border-primary/20 bg-white/95 px-4 py-4 shadow-2xl shadow-primary/10 backdrop-blur-xl sm:px-6">
      <div className="mx-auto flex max-w-6xl flex-col items-center gap-3 sm:flex-row sm:justify-between">
        <p className="text-sm text-slate-700">
          Bu site, çalışması için gerekli temel çerezleri kullanır. Detaylar için{" "}
          <Link href="/cerez-politikasi" className="font-medium text-primary hover:underline">
            Çerez Politikası
          </Link>
          &apos;nı inceleyebilirsin.
        </p>
        <Button type="button" size="sm" onClick={kabulEt} className="shrink-0">
          Anladım
        </Button>
      </div>
    </div>
  );
}

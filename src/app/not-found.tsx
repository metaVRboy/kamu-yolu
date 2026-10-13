import Link from "next/link";
import { SearchX } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export const metadata = { title: "Sayfa bulunamadı — Kamu Yolu" };

/** Markali 404: reklamdan/paylasimdan eski bir linkle gelen ziyaretci yolunu kaybetmesin. */
export default function NotFound() {
  return (
    <div className="mx-auto my-16 max-w-lg rounded-3xl border border-primary/10 bg-white p-8 text-center shadow-sm">
      <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
        <SearchX className="h-7 w-7" />
      </span>
      <h1 className="mt-4 text-2xl font-bold tracking-tight text-slate-900">Aradığın sayfa bulunamadı</h1>
      <p className="mt-2 text-sm leading-relaxed text-slate-600">
        İlanın süresi dolmuş ya da sayfa taşınmış olabilir. Güncel ilanlara aşağıdan ulaşabilirsin.
      </p>
      <div className="mt-6 flex flex-wrap justify-center gap-2">
        <Link href="/ilanlar" className={buttonVariants()}>
          Tüm ilanlar
        </Link>
        <Link href="/" className={cn(buttonVariants({ variant: "outline" }))}>
          Bölümünü ara
        </Link>
      </div>
    </div>
  );
}

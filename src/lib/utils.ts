import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/** API yanitindaki hata metni. Vercel Firewall'un 429'unda `error` nesnedir: ekrana nesne basilmasin. */
export function apiHatasi(veri: unknown, status: number, yedek = "Bir şeyler ters gitti.") {
  const e = (veri as { error?: unknown } | null)?.error
  if (typeof e === "string") return e
  return status === 429 ? "Çok fazla deneme yapıldı. Bir dakika bekleyip tekrar dene." : yedek
}

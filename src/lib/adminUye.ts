import type { Prisma } from "@/generated/prisma/client";
import { aktifProKosulu, proAktifMi } from "@/lib/sms";
import type { UyeSatiri } from "@/components/admin/AdminUyeListesi";

/** Liste satirindaki plan / admin / askida rozetleri. */
export function uyeRozetleri(u: { abonelikPlani: string; abonelikBitis: Date | null; isAdmin: boolean; askiyaAlindi: Date | null }): UyeSatiri["rozetler"] {
  const ucretli = proAktifMi(u);
  return [
    ...(ucretli ? [{ ad: u.abonelikPlani === "PRO_PLUS" ? "Pro+" : "Pro", renk: "bg-violet-100 text-violet-700" }] : []),
    ...(!ucretli && u.abonelikPlani !== "UCRETSIZ" ? [{ ad: "süresi doldu", renk: "bg-amber-50 text-amber-700" }] : []),
    ...(u.isAdmin ? [{ ad: "admin", renk: "bg-slate-900 text-white" }] : []),
    ...(u.askiyaAlindi ? [{ ad: "askıda", renk: "bg-red-100 text-red-700" }] : []),
  ];
}

/** Admin uye listesi filtreleri (liste sayfasi ve toplu islem ayni kurali kullanir). */
export const UYE_FILTRELERI = [
  ["hepsi", "Tümü"],
  ["ucretli", "Aktif ücretli"],
  ["pro", "Aktif Pro"],
  ["proplus", "Aktif Pro+"],
  ["ucretsiz", "Ücretsiz"],
  ["askida", "Askıda"],
  ["admin", "Adminler"],
] as const;
export type UyeFiltresi = (typeof UYE_FILTRELERI)[number][0];

export const uyeFiltresiMi = (f: unknown): f is UyeFiltresi => UYE_FILTRELERI.some(([k]) => k === f);

/** Filtre + arama metnine uyan uyeler. "Aktif" = plani ucretsiz degil ve suresi dolmamis. */
export function uyeKosulu(filtre: UyeFiltresi, q: string): Prisma.UserWhereInput {
  const f: Prisma.UserWhereInput =
    filtre === "ucretli"
      ? aktifProKosulu()
      : filtre === "pro"
        ? { ...aktifProKosulu(), abonelikPlani: "PRO" }
        : filtre === "proplus"
          ? { ...aktifProKosulu(), abonelikPlani: "PRO_PLUS" }
          : filtre === "ucretsiz"
            ? { NOT: aktifProKosulu() }
            : filtre === "askida"
              ? { askiyaAlindi: { not: null } }
              : filtre === "admin"
                ? { isAdmin: true }
                : {};
  // AND: aktifProKosulu da OR kullanir, arama OR'u onu ezmesin.
  return q ? { AND: [f, { OR: [{ email: { contains: q, mode: "insensitive" } }, { adSoyad: { contains: q, mode: "insensitive" } }] }] } : f;
}

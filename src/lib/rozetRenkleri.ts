export type RozetRengi = "mavi" | "turuncu" | "yesil" | "mor";

/** Rozet cipi renkleri (sunucu sayfasi ve istemci bileseni ortak). */
export const ROZET_RENGI: Record<RozetRengi, string> = {
  mavi: "bg-primary/10 text-primary",
  turuncu: "bg-amber-100 text-amber-900",
  yesil: "bg-emerald-50 text-emerald-800",
  mor: "bg-violet-100 text-violet-800",
};

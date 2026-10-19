/**
 * Kullanicinin ara ara gonderdigi sorular: konusuna gore ayristirilip duzeyine eklenir (bir soru birden
 * fazla duzeye uyuyorsa her birine). Tam parti olmak zorunda degil. Havuza yazma:
 * npx tsx scripts/kpssGonderilenEkle.ts  (uretim "gonderilen"; seed ve gece uretimi dokunmaz).
 */
import type { SeedSoru } from "../kpssDenemeOrtak";

export const GONDERILEN: Record<"LISANS" | "ONLISANS" | "LISE", SeedSoru[]> = {
  LISANS: [],
  ONLISANS: [],
  LISE: [],
};

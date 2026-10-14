/**
 * Ek deneme partileri: her dosya 120 soruluk tam bir deneme (KONU_DAGILIMI'na birebir uyar).
 * Ilk partiler kpssDenemeSoruVerisi*.ts dosyalarinda; yenisi eklenince buraya da eklenir.
 */
import type { SeedSoru } from "../kpssDenemeOrtak";

export const EK_PARTILER: Record<"LISANS" | "ONLISANS" | "LISE", SeedSoru[][]> = {
  LISANS: [],
  ONLISANS: [],
  LISE: [],
};

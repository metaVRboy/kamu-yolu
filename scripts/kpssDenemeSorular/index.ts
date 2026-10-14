/**
 * Ek deneme partileri: her dosya 120 soruluk tam bir deneme (KONU_DAGILIMI'na birebir uyar).
 * Ilk partiler kpssDenemeSoruVerisi*.ts dosyalarinda; yenisi eklenince buraya da eklenir.
 */
import type { SeedSoru } from "../kpssDenemeOrtak";
import { LISANS_2 } from "./lisans-2";
import { ONLISANS_2 } from "./onlisans-2";

export const EK_PARTILER: Record<"LISANS" | "ONLISANS" | "LISE", SeedSoru[][]> = {
  LISANS: [LISANS_2],
  ONLISANS: [ONLISANS_2],
  LISE: [],
};

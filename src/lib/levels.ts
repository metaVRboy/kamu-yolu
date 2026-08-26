import type { EducationLevel } from "@/generated/prisma/enums";

// URL'lerde kullanilan kisa/okunakli slug <-> Prisma enum degeri eslemesi.
export const LEVEL_SLUG_TO_ENUM: Record<string, EducationLevel> = {
  ilkogretim: "ILKOGRETIM",
  lise: "LISE",
  onlisans: "ONLISANS",
  lisans: "LISANS",
  "yuksek-lisans": "YUKSEK_LISANS",
};

export const LEVEL_ENUM_TO_SLUG: Record<EducationLevel, string> = {
  ILKOGRETIM: "ilkogretim",
  LISE: "lise",
  ONLISANS: "onlisans",
  LISANS: "lisans",
  YUKSEK_LISANS: "yuksek-lisans",
};

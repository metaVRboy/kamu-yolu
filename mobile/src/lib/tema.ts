// Sitenin tasarim degiskenleri (src/app/globals.css :root, OKLCH -> hex).
export const renk = {
  birincil: "#2466c3",
  birincilYazi: "#ffffff",
  // Basliklar: birincil %22 siyahla karisik (sitede color-mix(primary, black 22%)).
  baslik: "#16478b",
  zemin: "#edf0f5",
  kart: "#ffffff",
  yazi: "#0f172a", // slate-900
  yaziIkincil: "#475569", // slate-600
  soluk: "#67787c", // muted-foreground
  kenar: "#e3e7e8",
  birincilKenar: "rgba(36,102,195,0.12)",
  birincilZemin: "rgba(36,102,195,0.08)",
  hata: "#e7000b",
  kirmizi: "#dc2626",
  amber: "#fbbf24",
  amberKoyu: "#92400e",
  amberZemin: "#fffbeb",
  yesil: "#047857",
  yesilZemin: "#ecfdf5",
  griZemin: "#f1f5f9",
};

export const yazi = {
  normal: "Inter_400Regular",
  orta: "Inter_500Medium",
  yariKalin: "Inter_600SemiBold",
  kalin: "Inter_700Bold",
};

export const golge = {
  shadowColor: "#0f172a",
  shadowOpacity: 0.06,
  shadowRadius: 8,
  shadowOffset: { width: 0, height: 2 },
  elevation: 2,
};

// Sitedeki kurum turu temalari (IlanGorsel.tsx: from/via/to renkleri).
export const kurumTemasi: Record<string, [string, string, string]> = {
  UNIVERSITE: ["#4f46e5", "#7c3aed", "#7e22ce"],
  BAKANLIK: ["#1d4ed8", "#2563eb", "#0284c7"],
  HASTANE: ["#059669", "#0d9488", "#0e7490"],
  BELEDIYE: ["#f59e0b", "#f97316", "#f43f5e"],
  MUZE: ["#e11d48", "#db2777", "#a21caf"],
  KIT: ["#0369a1", "#0e7490", "#0f766e"],
  DIGER: ["#334155", "#475569", "#1d4ed8"],
};

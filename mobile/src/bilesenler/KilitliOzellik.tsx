import type { ReactNode } from "react";
import { Pressable, StyleSheet, View } from "react-native";
import { BlurView } from "expo-blur";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import { Crown, Lock } from "lucide-react-native";
import { T } from "@/bilesenler/ui";
import type { Plan } from "@/lib/kpss";
import { renk } from "@/lib/tema";

/** Yukseltme penceresini acar (sitedeki useYukseltme). */
export function yukseltmeAc(plan?: "PRO" | "PRO_PLUS", kaynak = "genel") {
  router.push({ pathname: "/yukselt", params: { ...(plan && { plan }), kaynak } });
}

/**
 * Sitedeki KilitliOzellik: icerik ekranda kalir ama bulanik ve dokunulamaz; ustunde
 * neyin acilacagi ve yukseltme secenekleri. Onizlemeye gizli veri konmaz (sunucu ornek veri yollar).
 */
export function KilitliOzellik({
  mevcutPlan,
  gerekenPlan,
  baslik,
  ozellikler,
  kaynak,
  children,
  uzun = false,
}: {
  mevcutPlan: Plan;
  gerekenPlan: "PRO" | "PRO_PLUS";
  baslik: string;
  ozellikler?: string[];
  kaynak: string;
  children: ReactNode;
  uzun?: boolean;
}) {
  const proSecenegi = gerekenPlan === "PRO" && mevcutPlan === "UCRETSIZ";
  return (
    // Uzun icerikte yalniz ust kismi (bir ekran) onizlenir: cok yuksek bulaniklik katmani hem
    // agir hem de (web'de) belli bir yukseklikten sonra cizilmiyor. Onizleme zaten ornek veri.
    <View style={uzun && { maxHeight: 760, overflow: "hidden", borderRadius: 24 }}>
      <View pointerEvents="none">{children}</View>
      <BlurView intensity={18} tint="light" style={[StyleSheet.absoluteFill, { borderRadius: 24, overflow: "hidden" }]} />
      {uzun && <LinearGradient colors={["rgba(237,240,245,0)", renk.zemin]} style={{ position: "absolute", left: 0, right: 0, bottom: 0, height: 120 }} pointerEvents="none" />}
      <View style={[StyleSheet.absoluteFill, { padding: 12, justifyContent: uzun ? "flex-start" : "center", paddingTop: uzun ? 32 : 12 }]}>
        <View style={s.kart}>
          <View style={s.kilit}>
            <Lock size={16} color={renk.birincil} />
          </View>
          <T w="yariKalin" style={{ marginTop: 8, fontSize: 16, textAlign: "center" }}>
            {baslik}
          </T>
          {!!ozellikler?.length && (
            <View style={{ marginTop: 8, gap: 4, alignSelf: "stretch" }}>
              {ozellikler.map((o) => (
                <View key={o} style={{ flexDirection: "row", gap: 6 }}>
                  <T style={{ color: renk.birincil, fontSize: 12 }}>•</T>
                  <T style={{ flex: 1, fontSize: 12, color: renk.yaziIkincil }}>{o}</T>
                </View>
              ))}
            </View>
          )}
          <View style={{ marginTop: 12, flexDirection: "row", flexWrap: "wrap", justifyContent: "center", gap: 8 }}>
            {proSecenegi && (
              <Pressable onPress={() => yukseltmeAc("PRO", kaynak)} style={[s.buton, { backgroundColor: renk.birincil }]}>
                <Crown size={16} color="#fff" />
                <T w="yariKalin" style={{ color: "#fff" }}>
                  Pro&apos;ya yükselt
                </T>
              </Pressable>
            )}
            <Pressable
              onPress={() => yukseltmeAc("PRO_PLUS", kaynak)}
              style={[s.buton, proSecenegi ? { backgroundColor: "#f5f3ff", borderWidth: 1, borderColor: "#c4b5fd" } : { backgroundColor: "#7c3aed" }]}
            >
              <Crown size={16} color={proSecenegi ? "#6d28d9" : "#fff"} />
              <T w="yariKalin" style={{ color: proSecenegi ? "#6d28d9" : "#fff" }}>
                Pro+&apos;ya yükselt
              </T>
            </Pressable>
          </View>
        </View>
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  kart: {
    alignSelf: "center",
    width: "100%",
    maxWidth: 420,
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.96)",
    borderRadius: 24,
    borderWidth: 1,
    borderColor: "rgba(36,102,195,0.2)",
    padding: 20,
    shadowColor: renk.birincil,
    shadowOpacity: 0.15,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 8 },
    elevation: 6,
  },
  kilit: { width: 36, height: 36, borderRadius: 18, backgroundColor: renk.birincilZemin, alignItems: "center", justifyContent: "center" },
  buton: { flexDirection: "row", alignItems: "center", gap: 6, borderRadius: 999, paddingHorizontal: 16, paddingVertical: 9 },
});

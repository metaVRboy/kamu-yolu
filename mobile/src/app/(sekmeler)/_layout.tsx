import type { ColorValue } from "react-native";
import { Tabs } from "expo-router";
import { GraduationCap, House, Newspaper, Search, UserRound, type LucideIcon } from "lucide-react-native";
import { useOturum } from "@/lib/oturum";
import { renk, yazi } from "@/lib/tema";

function ikon(Ikon: LucideIcon) {
  return function SekmeIkonu({ color, focused }: { color: ColorValue; focused: boolean }) {
    return <Ikon size={22} color={color as string} strokeWidth={focused ? 2.4 : 2} />;
  };
}

/** Alt sekmeler: sitedeki ana menu (Ana Sayfa, Ilanlar, KPSS, Haberler) + profil. */
export default function Sekmeler() {
  const { kullanici } = useOturum();
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: renk.birincil,
        tabBarInactiveTintColor: "#64748b",
        tabBarLabelStyle: { fontFamily: yazi.yariKalin, fontSize: 11 },
        tabBarStyle: { borderTopColor: renk.kenar },
        headerTitleStyle: { fontFamily: yazi.yariKalin, fontSize: 16, color: renk.yazi },
        headerShadowVisible: false,
        sceneStyle: { backgroundColor: renk.zemin },
      }}
    >
      <Tabs.Screen name="index" options={{ title: "Ana Sayfa", headerShown: false, tabBarIcon: ikon(House) }} />
      <Tabs.Screen name="ilanlar" options={{ title: "İlanlar", tabBarIcon: ikon(Search) }} />
      <Tabs.Screen name="kpss" options={{ title: "KPSS", tabBarIcon: ikon(GraduationCap) }} />
      <Tabs.Screen name="haberler" options={{ title: "Haberler", tabBarIcon: ikon(Newspaper) }} />
      <Tabs.Screen name="profil" options={{ title: kullanici ? "Profil" : "Giriş", headerTitle: "Profilim", tabBarIcon: ikon(UserRound) }} />
    </Tabs>
  );
}

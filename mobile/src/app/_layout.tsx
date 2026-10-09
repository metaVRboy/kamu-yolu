import { useEffect } from "react";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { StatusBar } from "expo-status-bar";
import { useFonts, Inter_400Regular, Inter_500Medium, Inter_600SemiBold, Inter_700Bold } from "@expo-google-fonts/inter";
import { OturumSaglayici } from "@/lib/oturum";
import { renk, yazi } from "@/lib/tema";

SplashScreen.preventAutoHideAsync();

export default function KokDuzen() {
  const [yuklendi] = useFonts({ Inter_400Regular, Inter_500Medium, Inter_600SemiBold, Inter_700Bold });

  useEffect(() => {
    if (yuklendi) SplashScreen.hideAsync();
  }, [yuklendi]);

  if (!yuklendi) return null;

  return (
    <OturumSaglayici>
      <StatusBar style="dark" />
      <Stack
        screenOptions={{
          headerTintColor: renk.birincil,
          headerTitleStyle: { fontFamily: yazi.yariKalin, color: renk.yazi, fontSize: 16 },
          headerBackButtonDisplayMode: "minimal",
          headerShadowVisible: false,
          headerStyle: { backgroundColor: "#fff" },
          contentStyle: { backgroundColor: renk.zemin },
        }}
      >
        <Stack.Screen name="(sekmeler)" options={{ headerShown: false }} />
        <Stack.Screen name="liste" options={{ title: "İlanlar" }} />
        <Stack.Screen name="ilan/[id]" options={{ title: "İlan" }} />
        <Stack.Screen name="haber/[slug]" options={{ title: "Haber" }} />
        <Stack.Screen name="giris" options={{ title: "Giriş Yap", presentation: "modal" }} />
        <Stack.Screen name="kayit" options={{ title: "Kayıt Ol", presentation: "modal" }} />
        <Stack.Screen name="sifremi-unuttum" options={{ title: "Şifremi Unuttum" }} />
        <Stack.Screen name="profil-duzenle" options={{ title: "Profil Bilgilerim" }} />
      </Stack>
    </OturumSaglayici>
  );
}

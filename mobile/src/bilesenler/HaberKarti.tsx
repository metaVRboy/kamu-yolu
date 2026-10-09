import { useState } from "react";
import { Pressable, StyleSheet, View, type StyleProp, type ViewStyle } from "react-native";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import { ArrowRight, CalendarDays, Landmark } from "lucide-react-native";
import { T } from "@/bilesenler/ui";
import { golge, renk } from "@/lib/tema";
import { tarihUzun } from "@/lib/bicim";
import type { HaberKartiVeri } from "@/lib/tipler";

/**
 * Sitedeki HaberGorsel: gorsel yoksa simgeli yer tutucu, kurum logosuysa ortalanmis;
 * altta beyaza donen serit + Kamu Yolu logosu (markaGizli: kucuk onizlemelerde yok).
 */
export function HaberGorsel({ h, style, markaGizli = false }: { h: Pick<HaberKartiVeri, "gorselUrl" | "gorselLogoMu">; style?: StyleProp<ViewStyle>; markaGizli?: boolean }) {
  const [hata, setHata] = useState(false);
  return (
    <View style={[{ aspectRatio: 16 / 9, borderRadius: 12, overflow: "hidden", backgroundColor: renk.birincilZemin }, style]}>
      {!h.gorselUrl || hata ? (
        <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
          <Landmark size={40} color="rgba(36,102,195,0.4)" />
        </View>
      ) : (
        <Image
          source={{ uri: h.gorselUrl }}
          contentFit={h.gorselLogoMu ? "contain" : "cover"}
          style={[{ flex: 1 }, h.gorselLogoMu && { margin: 24 }]}
          onError={() => setHata(true)}
          transition={150}
        />
      )}
      {!markaGizli && (
        <>
          <LinearGradient colors={["transparent", "rgba(255,255,255,0.7)", "#ffffff"]} style={s.serit} pointerEvents="none" />
          <Image source={require("../../assets/logo.png")} style={s.marka} contentFit="contain" />
        </>
      )}
    </View>
  );
}

/** Sitedeki HaberlerSection karti. */
export function HaberKarti({ h }: { h: HaberKartiVeri }) {
  const ac = () => router.push({ pathname: "/haber/[slug]", params: { slug: h.slug } });
  return (
    <Pressable onPress={ac} style={({ pressed }) => [s.kart, pressed && { opacity: 0.92 }]}>
      <View>
        <HaberGorsel h={h} />
        {h.yeni && (
          <View style={s.yeni}>
            <T w="kalin" style={{ color: "#fff", fontSize: 11 }}>
              YENİ
            </T>
          </View>
        )}
      </View>
      <View style={{ paddingHorizontal: 8, paddingBottom: 8, gap: 6 }}>
        <T w="yariKalin" style={{ fontSize: 16, lineHeight: 21 }}>
          {h.baslik}
        </T>
        <T numberOfLines={3} style={{ color: renk.soluk, lineHeight: 20 }}>
          {h.ozet}
        </T>
        <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginTop: 6 }}>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
            <CalendarDays size={14} color={renk.soluk} />
            <T style={{ fontSize: 12, color: renk.soluk }}>{tarihUzun(h.yayinTarihi)}</T>
          </View>
          <View style={s.devam}>
            <T w="orta" style={{ fontSize: 12 }}>
              Devamını Oku
            </T>
            <ArrowRight size={14} color={renk.yazi} />
          </View>
        </View>
      </View>
    </Pressable>
  );
}

/** Kenar listesi ("Benzer Haberler") satiri: kucuk gorsel + baslik + tarih. */
export function HaberSatiri({ h }: { h: HaberKartiVeri }) {
  return (
    <Pressable onPress={() => router.push({ pathname: "/haber/[slug]", params: { slug: h.slug } })} style={{ flexDirection: "row", gap: 12, paddingVertical: 6 }}>
      <HaberGorsel h={h} markaGizli style={{ width: 80, height: 56, aspectRatio: undefined, borderRadius: 8 }} />
      <View style={{ flex: 1 }}>
        <T w="yariKalin" numberOfLines={2}>
          {h.baslik}
        </T>
        <T style={{ marginTop: 4, fontSize: 12, color: renk.soluk }}>{tarihUzun(h.yayinTarihi)}</T>
      </View>
    </Pressable>
  );
}

const s = StyleSheet.create({
  kart: { backgroundColor: "#fff", borderRadius: 16, borderWidth: 1, borderColor: "rgba(36,102,195,0.2)", padding: 12, gap: 12, ...golge },
  yeni: { position: "absolute", top: 8, right: 8, backgroundColor: "#dc2626", borderRadius: 999, paddingHorizontal: 8, paddingVertical: 2 },
  devam: { flexDirection: "row", alignItems: "center", gap: 4, borderWidth: 1, borderColor: "rgba(36,102,195,0.25)", borderRadius: 8, paddingHorizontal: 10, paddingVertical: 6 },
  serit: { position: "absolute", left: 0, right: 0, bottom: 0, height: "40%" },
  marka: { position: "absolute", bottom: "3%", alignSelf: "center", width: 64, height: 40 },
});

import { useState } from "react";
import { Linking, Pressable, StyleSheet, View, type StyleProp, type ViewStyle } from "react-native";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import { ArrowRight, CalendarDays } from "lucide-react-native";
import { T } from "@/bilesenler/ui";
import { golge, renk } from "@/lib/tema";
import { tarihUzun } from "@/lib/bicim";
import type { HaberKartiVeri } from "@/lib/tipler";

/**
 * Sitedeki HaberGorsel: gorsel yoksa simgeli yer tutucu, kurum logosuysa ortalanmis;
 * altta beyaza donen serit + Kamu Yolu logosu (markaGizli: kucuk onizlemelerde yok).
 */
const DOLGU_KELIME = new Set(["t.c.", "tc", "ve", "ile", "türkiye", "cumhuriyeti"]);
/** "Sağlık Bakanlığı" -> "SB"; kurum yoksa basliktan. */
const basHarfler = (metin: string) =>
  metin
    .split(/\s+/)
    .filter((k) => k && !DOLGU_KELIME.has(k.toLocaleLowerCase("tr")) && /\p{L}/u.test(k))
    .slice(0, 2)
    .map((k) => k.match(/\p{L}/u)![0].toLocaleUpperCase("tr"))
    .join("");

/**
 * Sitedeki HaberKapak: gorseli olmayan haberde acik zeminde marka gradyanli monogram karosu, kurum adi ve kategori.
 * kapakUstte: yalniz karo, ustte (kaydirmada metin altta; kucuk onizlemede sigsin).
 */
function HaberKapak({ h, kapakUstte }: { h: Pick<HaberKartiVeri, "baslik" | "kurumAdi" | "kategori">; kapakUstte: boolean }) {
  const ad = h.kurumAdi?.trim() || null;
  const harf = basHarfler(ad ?? h.baslik) || "KY";
  return (
    <LinearGradient colors={["#f8fafc", "#ffffff", "#eff6ff"]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={[{ flex: 1, alignItems: "center", gap: 8 }, kapakUstte ? { justifyContent: "flex-start", paddingTop: "10%" } : { justifyContent: "center" }]}>
      <LinearGradient colors={[renk.birincil, "#4f46e5"]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={[s.monogram, kapakUstte && { width: 44, height: 44, borderRadius: 12 }]}>
        <T w="kalin" style={{ color: "#fff", fontSize: kapakUstte ? 15 : 19, letterSpacing: 0.5 }}>
          {harf}
        </T>
      </LinearGradient>
      {!kapakUstte && !!ad && (
        <T w="yariKalin" numberOfLines={2} style={{ maxWidth: "80%", textAlign: "center", color: "#1e293b", fontSize: 14 }}>
          {ad}
        </T>
      )}
      {!kapakUstte && !!h.kategori && (
        <View style={s.kategori}>
          <T w="kalin" style={{ fontSize: 10, letterSpacing: 0.6, color: renk.birincil }}>
            {h.kategori.toLocaleUpperCase("tr")}
          </T>
        </View>
      )}
    </LinearGradient>
  );
}

export function HaberGorsel({
  h,
  style,
  markaGizli = false,
  kapakUstte = false,
}: {
  h: Pick<HaberKartiVeri, "gorselUrl" | "gorselLogoMu" | "baslik" | "kurumAdi" | "kategori">;
  style?: StyleProp<ViewStyle>;
  markaGizli?: boolean;
  kapakUstte?: boolean;
}) {
  const [hata, setHata] = useState(false);
  const kapak = !h.gorselUrl || hata;
  return (
    <View style={[{ aspectRatio: 16 / 9, borderRadius: 12, overflow: "hidden", backgroundColor: renk.birincilZemin }, style]}>
      {kapak ? (
        <HaberKapak h={h} kapakUstte={kapakUstte} />
      ) : (
        <Image
          source={{ uri: h.gorselUrl ?? undefined }}
          contentFit={h.gorselLogoMu ? "contain" : "cover"}
          style={[{ flex: 1 }, h.gorselLogoMu && { margin: 24 }]}
          onError={() => setHata(true)}
          transition={150}
        />
      )}
      {!markaGizli && !kapak && (
        <>
          <LinearGradient colors={["transparent", "rgba(255,255,255,0.7)", "#ffffff"]} style={s.serit} pointerEvents="none" />
          <Image source={require("../../assets/logo.png")} style={s.marka} contentFit="contain" />
        </>
      )}
    </View>
  );
}

/** Sitedeki FotoKredisi: Unsplash kunyesi (API kosulu). acik: acik zeminde duz metin; varsayilan: gorsel ustunde etiket. */
export function FotoKredisi({ kredi, acik = false, style }: { kredi: HaberKartiVeri["gorselKredi"]; acik?: boolean; style?: StyleProp<ViewStyle> }) {
  if (!kredi) return null;
  const yazi = { fontSize: acik ? 12 : 10, color: acik ? renk.soluk : "rgba(255,255,255,0.9)" };
  return (
    <View style={[{ flexDirection: "row" }, !acik && s.kredi, style]}>
      <T style={yazi}>Fotoğraf: </T>
      <T style={yazi} onPress={() => Linking.openURL(kredi.profil)}>
        {kredi.ad}
      </T>
      <T style={yazi}> / </T>
      <T style={yazi} onPress={() => Linking.openURL(kredi.sayfa)}>
        Unsplash
      </T>
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
      <HaberGorsel h={h} markaGizli kapakUstte style={{ width: 80, height: 56, aspectRatio: undefined, borderRadius: 8 }} />
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
  monogram: { width: 60, height: 60, borderRadius: 16, alignItems: "center", justifyContent: "center", borderWidth: 3, borderColor: "#fff", shadowColor: "#2563eb", shadowOpacity: 0.35, shadowRadius: 10, shadowOffset: { width: 0, height: 6 }, elevation: 4 },
  kategori: { borderRadius: 999, borderWidth: 1, borderColor: "rgba(36,102,195,0.15)", backgroundColor: "rgba(255,255,255,0.85)", paddingHorizontal: 10, paddingVertical: 3 },
  marka: { position: "absolute", bottom: "3%", alignSelf: "center", width: 64, height: 40 },
  kredi: { borderRadius: 999, backgroundColor: "rgba(0,0,0,0.45)", paddingHorizontal: 10, paddingVertical: 2 },
});

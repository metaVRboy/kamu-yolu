import { useState } from "react";
import { Pressable, StyleSheet, View, type StyleProp, type ViewStyle } from "react-native";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import { ArrowRight, Briefcase, Building2, CalendarClock, Castle, Factory, GraduationCap, HeartPulse, Landmark, Layers, MapPin, type LucideIcon } from "lucide-react-native";
import { T } from "@/bilesenler/ui";
import { golge, kurumTemasi, renk } from "@/lib/tema";
import { tarihUzun } from "@/lib/bicim";
import type { IlanKartiVeri } from "@/lib/tipler";

const KURUM_IKONU: Record<string, LucideIcon> = {
  UNIVERSITE: GraduationCap,
  BAKANLIK: Landmark,
  HASTANE: HeartPulse,
  BELEDIYE: Building2,
  MUZE: Castle,
  KIT: Factory,
  DIGER: Briefcase,
};

/** Sitedeki IlanGorsel: kurum turu renkli zemin, buyuk soluk tur ikonu, ortada gercek kurum logosu. */
export function IlanGorsel({ logoUrl, kurumTuru, style }: { logoUrl: string | null; kurumTuru: string; style?: StyleProp<ViewStyle> }) {
  const [logoHatasi, setLogoHatasi] = useState(false);
  const Ikon = KURUM_IKONU[kurumTuru] ?? Briefcase;
  const logoVar = !!logoUrl && !logoHatasi;
  return (
    <LinearGradient colors={kurumTemasi[kurumTuru] ?? kurumTemasi.DIGER} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={[{ aspectRatio: 16 / 9, overflow: "hidden" }, style]}>
      <View style={{ position: "absolute", right: -24, bottom: -32, opacity: 0.1 }}>
        <Ikon size={176} color="#fff" strokeWidth={1.25} />
      </View>
      <View style={{ position: "absolute", top: -60, left: -40, width: 190, height: 190, borderRadius: 95, backgroundColor: "rgba(255,255,255,0.12)" }} />
      <View style={StyleSheet.absoluteFill}>
        <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
          {logoVar ? (
            <View style={s.logoKutu}>
              <Image source={{ uri: logoUrl }} contentFit="contain" style={{ width: "100%", height: "100%" }} onError={() => setLogoHatasi(true)} />
            </View>
          ) : (
            <View style={s.ikonKutu}>
              <Ikon size={40} color="#fff" />
            </View>
          )}
        </View>
      </View>
      <Image source={require("../../assets/logo.png")} style={s.marka} contentFit="contain" tintColor="#ffffff" />
    </LinearGradient>
  );
}

function ilanAc(ilan: IlanKartiVeri) {
  if (ilan.kurumAdiHam) router.push({ pathname: "/liste", params: { kapsam: "tum", kurumAdi: ilan.kurumAdiHam } });
  else router.push({ pathname: "/ilan/[id]", params: { id: ilan.id } });
}

/** Sitedeki IlanVitrinKarti. nitelikOzeti: liste sayfalarinda aranan nitelik metni. */
export function IlanKarti({ ilan, nitelikOzeti = false }: { ilan: IlanKartiVeri; nitelikOzeti?: boolean }) {
  const k = ilan.kalanGun;
  return (
    <Pressable onPress={() => ilanAc(ilan)} style={({ pressed }) => [s.kart, pressed && { opacity: 0.92 }]}>
      <View>
        <IlanGorsel logoUrl={ilan.logoUrl} kurumTuru={ilan.kurumTuru} />
        <View style={s.rozetler}>
          <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 6, flex: 1 }}>
            {ilan.yeni && (
              <View style={[s.rozet, { backgroundColor: "#dc2626" }]}>
                <T w="kalin" style={s.rozetYazi}>
                  YENİ
                </T>
              </View>
            )}
            <View style={[s.rozet, { backgroundColor: "rgba(0,0,0,0.25)" }]}>
              <T w="orta" style={s.rozetYazi}>
                {ilan.kurumTuruAdi}
              </T>
            </View>
          </View>
          {k !== null && k >= 0 && (
            <View style={[s.rozet, { backgroundColor: k <= 3 ? "#dc2626" : k <= 7 ? "#fbbf24" : "#fff" }]}>
              <T w="kalin" style={[s.rozetYazi, { color: k <= 3 ? "#fff" : k <= 7 ? "#451a03" : renk.birincil }]}>
                {k === 0 ? "Son gün" : `${k} gün kaldı`}
              </T>
            </View>
          )}
        </View>
      </View>

      <View style={{ padding: 16 }}>
        <T w="yariKalin" numberOfLines={1} style={{ fontSize: 12, color: renk.birincil, letterSpacing: 0.3 }}>
          {ilan.kurum}
        </T>
        <T w="yariKalin" numberOfLines={2} style={{ marginTop: 4, fontSize: 16, lineHeight: 21 }}>
          {ilan.kadro}
        </T>
        {ilan.kadroFazlasi > 0 && (
          <View style={s.satir}>
            <Layers size={14} color="#64748b" />
            <T w="orta" style={s.kucuk}>
              +{ilan.kadroFazlasi} farklı kadro daha
            </T>
          </View>
        )}
        {nitelikOzeti && !!ilan.nitelik && (
          <T numberOfLines={2} style={{ marginTop: 8, fontSize: 12, lineHeight: 18, color: "#64748b" }}>
            {ilan.nitelik}
          </T>
        )}
        <View style={{ marginTop: 12, gap: 6 }}>
          {!!ilan.duzeyler && <Bilgi ikon={GraduationCap} metin={ilan.duzeyler} />}
          {!!ilan.konum && <Bilgi ikon={MapPin} metin={ilan.konum} />}
          {!!ilan.sonBasvuru && <Bilgi ikon={CalendarClock} metin={`Son başvuru: ${tarihUzun(ilan.sonBasvuru)}`} />}
        </View>
        <View style={s.alt}>
          <T style={{ fontSize: 12, color: renk.soluk }}>{ilan.kaynak}</T>
          <View style={s.incele}>
            <T w="yariKalin" style={{ color: "#fff", fontSize: 12 }}>
              {ilan.ilanSayisi > 1 ? `${ilan.ilanSayisi} İlanı Gör` : "İlanı İncele"}
            </T>
            <ArrowRight size={14} color="#fff" />
          </View>
        </View>
      </View>
    </Pressable>
  );
}

function Bilgi({ ikon: Ikon, metin }: { ikon: LucideIcon; metin: string }) {
  return (
    <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
      <Ikon size={14} color="rgba(36,102,195,0.7)" />
      <T numberOfLines={1} style={{ fontSize: 12, color: renk.yaziIkincil, flex: 1 }}>
        {metin}
      </T>
    </View>
  );
}

const s = StyleSheet.create({
  kart: { backgroundColor: "#fff", borderRadius: 16, borderWidth: 1, borderColor: renk.birincilKenar, overflow: "hidden", ...golge },
  logoKutu: { width: 96, height: 96, borderRadius: 16, backgroundColor: "#fff", padding: 12, borderWidth: 4, borderColor: "rgba(255,255,255,0.3)" },
  ikonKutu: { width: 80, height: 80, borderRadius: 16, backgroundColor: "rgba(255,255,255,0.15)", borderWidth: 1, borderColor: "rgba(255,255,255,0.3)", alignItems: "center", justifyContent: "center" },
  marka: { position: "absolute", left: 12, bottom: 8, width: 48, height: 36, opacity: 0.9 },
  rozetler: { position: "absolute", top: 12, left: 12, right: 12, flexDirection: "row", alignItems: "flex-start", gap: 8 },
  rozet: { borderRadius: 999, paddingHorizontal: 10, paddingVertical: 3 },
  rozetYazi: { fontSize: 11, color: "#fff" },
  satir: { flexDirection: "row", alignItems: "center", gap: 4, marginTop: 6 },
  kucuk: { fontSize: 12, color: "#64748b" },
  alt: { marginTop: 14, paddingTop: 12, borderTopWidth: 1, borderTopColor: renk.birincilKenar, flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  incele: { flexDirection: "row", alignItems: "center", gap: 4, backgroundColor: renk.birincil, borderRadius: 999, paddingHorizontal: 14, paddingVertical: 7 },
});

import { useEffect, useState, type ReactNode } from "react";
import { Animated, Easing, Pressable, StyleSheet, Text, View, type StyleProp, type ViewStyle } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Bell, BellRing, Moon, type LucideIcon } from "lucide-react-native";
import { T } from "@/bilesenler/ui";
import { yazi } from "@/lib/tema";

export type TesvikTemasi = "sis" | "sinyal" | "gece";
export type TesvikCagrisi = { etiket: string; ikon?: LucideIcon; onPress: () => void };

const ATText = Animated.createAnimatedComponent(Text);

// [su an, Pro ile] renk ciftleri (sitedeki globals.css .tsv-* ile ayni).
const RENK: Record<TesvikTemasi, Record<"zemin" | "kenar" | "baslik" | "metin" | "btn" | "btnYazi" | "btnKenar", [string, string]>> = {
  sis: { zemin: ["#f1f5f9", "#f8fbff"], kenar: ["#e2e8f0", "#bfdbfe"], baslik: ["#334155", "#0f172a"], metin: ["#64748b", "#1e3a8a"], btn: ["#475569", "#2563eb"], btnYazi: ["#ffffff", "#ffffff"], btnKenar: ["#475569", "#2563eb"] },
  sinyal: { zemin: ["#f8fafc", "#eff6ff"], kenar: ["#cbd5e1", "#93c5fd"], baslik: ["#475569", "#0f172a"], metin: ["#64748b", "#1e3a8a"], btn: ["#ffffff", "#2563eb"], btnYazi: ["#334155", "#ffffff"], btnKenar: ["#cbd5e1", "#2563eb"] },
  gece: { zemin: ["#1e293b", "#fef3c7"], kenar: ["#334155", "#fcd34d"], baslik: ["#f1f5f9", "#1c1917"], metin: ["#cbd5e1", "#44403c"], btn: ["#334155", "#f59e0b"], btnYazi: ["#e2e8f0", "#1c1917"], btnKenar: ["#334155", "#f59e0b"] },
};

const ara = (t: Animated.Value, [a, b]: [string, string], giris: [number, number] = [0, 1]) => t.interpolate({ inputRange: giris, outputRange: [a, b], extrapolate: "clamp" });

/** Iki durum arasinda capraz gecis (ikon rengi animasyonla degismez: iki katman). */
function Gecis({ t, once, sonra, boyut }: { t: Animated.Value; once: ReactNode; sonra: ReactNode; boyut: number }) {
  return (
    <View style={{ width: boyut, height: boyut }}>
      <Animated.View style={[StyleSheet.absoluteFill, { opacity: t.interpolate({ inputRange: [0, 1], outputRange: [1, 0] }) }]}>{once}</Animated.View>
      <Animated.View style={[StyleSheet.absoluteFill, { opacity: t }]}>{sonra}</Animated.View>
    </View>
  );
}

/** Sis: soluk "suresi doldu" ilanlari -> renklenip duzelir, etiket "Zamaninda" olur. Kartin ustunde serit. */
function SisSahnesi({ t }: { t: Animated.Value }) {
  return (
    <View style={{ flexDirection: "row", gap: 8, height: 62, marginBottom: 14 }} aria-hidden>
      {[-4, 3, -2].map((aci, i) => (
        <Animated.View
          key={i}
          style={[
            s.mini,
            {
              marginTop: i === 1 ? 0 : 4,
              opacity: t.interpolate({ inputRange: [0, 1], outputRange: [0.45, 1] }),
              transform: [{ rotate: t.interpolate({ inputRange: [0, 1], outputRange: [`${aci}deg`, "0deg"] }) }],
            },
          ]}
        >
          <Animated.View style={[s.cizgi, { backgroundColor: ara(t, ["#cbd5e1", "#bfdbfe"]) }]} />
          <Animated.View style={[s.cizgi, { width: "58%", backgroundColor: ara(t, ["#cbd5e1", "#bfdbfe"]) }]} />
          <Animated.View style={[s.etiket, { backgroundColor: ara(t, ["#fee2e2", "#dbeafe"]) }]}>
            <ATText style={[s.etiketYazi, { color: "#991b1b", opacity: t.interpolate({ inputRange: [0, 1], outputRange: [1, 0] }) }]}>Süresi doldu</ATText>
            <ATText style={[s.etiketYazi, StyleSheet.absoluteFill, { color: "#1e40af", opacity: t }]}>Zamanında</ATText>
          </Animated.View>
        </Animated.View>
      ))}
    </View>
  );
}

/** Sinyal: ustu cizili sessiz zil, bos cubuklar -> zil mavi, dalgalar yayilir, cubuklar sirayla dolar. */
function SinyalSahnesi({ t, dalga }: { t: Animated.Value; dalga: Animated.Value }) {
  return (
    <View style={{ flexDirection: "row", alignItems: "flex-end", gap: 14, height: 62, marginBottom: 12 }} aria-hidden>
      <View style={{ width: 62, height: 62, alignItems: "center", justifyContent: "center" }}>
        {[0, 0.5].map((gecikme) => {
          const d = dalga.interpolate({ inputRange: [0, 1], outputRange: [gecikme, gecikme + 1] });
          const faz = Animated.modulo(d, 1);
          return (
            <Animated.View
              key={gecikme}
              style={[
                s.halka,
                {
                  opacity: Animated.multiply(t, faz.interpolate({ inputRange: [0, 1], outputRange: [0.7, 0] })),
                  transform: [{ scale: faz.interpolate({ inputRange: [0, 1], outputRange: [0.55, 1.35] }) }],
                },
              ]}
            />
          );
        })}
        <Gecis
          t={t}
          boyut={30}
          once={
            <View>
              <Bell size={30} color="#94a3b8" strokeWidth={1.8} />
              <View style={s.kesik} />
            </View>
          }
          sonra={<BellRing size={30} color="#2563eb" strokeWidth={1.8} />}
        />
      </View>
      <View style={{ flexDirection: "row", alignItems: "flex-end", gap: 4, paddingBottom: 6 }}>
        {[10, 16, 24, 32].map((h, i) => (
          <Animated.View
            key={h}
            style={{ width: 6, height: h, borderRadius: 2, backgroundColor: ara(t, [i === 0 ? "#94a3b8" : "#e2e8f0", "#2563eb"], [i * 0.12, i * 0.12 + 0.5]) }}
          />
        ))}
      </View>
    </View>
  );
}

/** Gece: yildizli lacivert -> gunes dogar, gokyuzu aydinlanir (arka plan). */
function GeceSahnesi({ t }: { t: Animated.Value }) {
  const gece = t.interpolate({ inputRange: [0, 1], outputRange: [1, 0] });
  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none" aria-hidden>
      <Animated.View style={[StyleSheet.absoluteFill, { opacity: t }]}>
        <LinearGradient colors={["#dbeafe", "#fef3c7", "#fde68a"]} style={StyleSheet.absoluteFill} />
      </Animated.View>
      {[
        [5, 60],
        [12, 80],
        [22, 68],
        [30, 88],
        [9, 72],
        [16, 54],
      ].map(([sag, ust]) => (
        <Animated.View key={`${sag}-${ust}`} style={[s.yildiz, { right: `${sag}%`, top: `${ust}%`, opacity: Animated.multiply(gece, 0.75) }]} />
      ))}
      <Animated.View style={{ position: "absolute", right: 18, bottom: 16, opacity: gece, transform: [{ translateY: t.interpolate({ inputRange: [0, 1], outputRange: [0, -20] }) }] }}>
        <Moon size={18} color="#cbd5e1" fill="#cbd5e1" />
      </Animated.View>
      <Animated.View style={[s.gunes, { transform: [{ translateY: t.interpolate({ inputRange: [0, 1], outputRange: [70, 0] }) }] }]} />
      <Animated.View style={[s.ufuk, { backgroundColor: ara(t, ["#0f172a", "#86efac"]) }]} />
    </View>
  );
}

/**
 * Sitedeki TesvikKarti: "su an kotu" sahnesi -> "Pro ile iyi" sahnesi. Telefonda hover yok: kart acilinca donusum
 * bir kez oynar, ana butona basinca da tetiklenir. `iyi`: ozelligin sahibi (Pro) karti hep iyi halde gorur.
 */
export function TesvikKarti({
  tema,
  baslik,
  metin,
  cagri,
  ikincil,
  iyi = false,
  kompakt = false,
  style,
}: {
  tema: TesvikTemasi;
  baslik: string;
  metin?: string | null;
  cagri?: TesvikCagrisi | null;
  ikincil?: { etiket: string; onPress: () => void } | null;
  iyi?: boolean;
  kompakt?: boolean;
  style?: StyleProp<ViewStyle>;
}) {
  const [t] = useState(() => new Animated.Value(iyi ? 1 : 0));
  const [dalga] = useState(() => new Animated.Value(0));
  const r = RENK[tema];

  useEffect(() => {
    const dongu = Animated.loop(Animated.timing(dalga, { toValue: 1, duration: 1800, easing: Easing.out(Easing.quad), useNativeDriver: false }));
    if (tema === "sinyal") dongu.start();
    return () => dongu.stop();
  }, [tema, dalga]);

  useEffect(() => {
    if (iyi) {
      t.setValue(1);
      return;
    }
    // Onizleme: kart acilinca bir kez "Pro ile" haline gecip geri doner.
    const oynat = Animated.sequence([
      Animated.delay(700),
      Animated.timing(t, { toValue: 1, duration: 800, useNativeDriver: false }),
      Animated.delay(1400),
      Animated.timing(t, { toValue: 0, duration: 700, useNativeDriver: false }),
    ]);
    oynat.start();
    return () => oynat.stop();
  }, [iyi, t]);

  const ac = () => {
    t.stopAnimation();
    Animated.timing(t, { toValue: 1, duration: 450, useNativeDriver: false }).start();
  };
  const geriAl = () => {
    if (!iyi) setTimeout(() => Animated.timing(t, { toValue: 0, duration: 700, useNativeDriver: false }).start(), 1200);
  };

  const Ikon = cagri?.ikon;
  return (
    <Animated.View
      style={[
        s.kart,
        kompakt && s.kompakt,
        { backgroundColor: tema === "gece" ? r.zemin[0] : ara(t, r.zemin), borderColor: ara(t, r.kenar), borderStyle: tema === "sinyal" && !iyi ? "dashed" : "solid" },
        style,
      ]}
    >
      {tema === "gece" && <GeceSahnesi t={t} />}
      {tema === "sis" && <SisSahnesi t={t} />}
      {tema === "sinyal" && <SinyalSahnesi t={t} dalga={dalga} />}
      <ATText style={{ fontFamily: yazi.kalin, fontSize: kompakt ? 14 : 16, lineHeight: kompakt ? 19 : 22, color: ara(t, r.baslik) }}>{baslik}</ATText>
      {!!metin && <ATText style={{ marginTop: 4, fontFamily: yazi.normal, fontSize: kompakt ? 12 : 14, lineHeight: kompakt ? 17 : 20, color: ara(t, r.metin) }}>{metin}</ATText>}
      {(!!cagri || !!ikincil) && (
        <View style={{ marginTop: kompakt ? 10 : 14, flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
          {!!cagri && (
            <Pressable onPressIn={ac} onPressOut={geriAl} onPress={cagri.onPress}>
              <Animated.View style={[s.btn, kompakt && s.btnKompakt, { backgroundColor: ara(t, r.btn), borderColor: ara(t, r.btnKenar) }]}>
                {!!Ikon && (
                  <Gecis t={t} boyut={16} once={<Ikon size={16} color={r.btnYazi[0]} />} sonra={<Ikon size={16} color={r.btnYazi[1]} />} />
                )}
                <ATText style={{ fontFamily: yazi.kalin, fontSize: kompakt ? 13 : 14, color: ara(t, r.btnYazi) }}>{cagri.etiket}</ATText>
              </Animated.View>
            </Pressable>
          )}
          {!!ikincil && (
            <Pressable onPress={ikincil.onPress} style={[s.btn, s.ikincil]}>
              <T w="yariKalin" style={{ color: "#334155" }}>
                {ikincil.etiket}
              </T>
            </Pressable>
          )}
        </View>
      )}
    </Animated.View>
  );
}

const s = StyleSheet.create({
  kart: { position: "relative", overflow: "hidden", borderRadius: 20, borderWidth: 1.5, padding: 18 },
  kompakt: { borderRadius: 14, padding: 12 },
  btn: { flexDirection: "row", alignItems: "center", gap: 8, borderRadius: 12, borderWidth: 1.5, paddingHorizontal: 16, paddingVertical: 11 },
  btnKompakt: { paddingHorizontal: 12, paddingVertical: 8 },
  ikincil: { backgroundColor: "#fff", borderColor: "#cbd5e1" },
  mini: { flex: 1, height: 54, borderRadius: 10, borderWidth: 1, borderColor: "#e2e8f0", backgroundColor: "#fff", padding: 7, gap: 4 },
  cizgi: { height: 6, borderRadius: 3, width: "100%" },
  etiket: { alignSelf: "flex-start", borderRadius: 999, paddingHorizontal: 6, paddingVertical: 2, marginTop: 2 },
  etiketYazi: { fontFamily: yazi.kalin, fontSize: 9, textAlign: "center", paddingHorizontal: 6, paddingVertical: 2 },
  halka: { position: "absolute", width: 58, height: 58, borderRadius: 29, borderWidth: 1.5, borderColor: "#2563eb" },
  kesik: { position: "absolute", left: 14, top: -3, width: 2.4, height: 36, borderRadius: 2, backgroundColor: "#94a3b8", transform: [{ rotate: "-45deg" }] },
  yildiz: { position: "absolute", width: 3, height: 3, borderRadius: 2, backgroundColor: "#e2e8f0" },
  gunes: { position: "absolute", right: 22, bottom: -26, width: 64, height: 64, borderRadius: 32, backgroundColor: "#f59e0b", borderWidth: 8, borderColor: "rgba(251,191,36,0.35)" },
  ufuk: { position: "absolute", left: 0, right: 0, bottom: 0, height: 6 },
});

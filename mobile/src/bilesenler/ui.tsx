import { useState, type ReactNode } from "react";
import { ActivityIndicator, Pressable, StyleSheet, Text, TextInput, View, type StyleProp, type TextProps, type TextStyle, type ViewStyle } from "react-native";
import { Check, Eye, EyeOff, type LucideIcon } from "lucide-react-native";
import { golge, renk, yazi } from "@/lib/tema";

type Agirlik = keyof typeof yazi;

/** Inter yazili metin (sitede her yer Inter). */
export function T({ w = "normal", style, ...p }: TextProps & { w?: Agirlik; style?: StyleProp<TextStyle> }) {
  return <Text {...p} style={[{ fontFamily: yazi[w], color: renk.yazi, fontSize: 14 }, style]} />;
}

/** Beyaz, ince birincil kenarli, golgeli kart (sitede rounded-3xl border-primary/10 bg-white shadow-sm). */
export function Kart({ children, style, yaricap = 24 }: { children: ReactNode; style?: StyleProp<ViewStyle>; yaricap?: number }) {
  return <View style={[s.kart, { borderRadius: yaricap }, style]}>{children}</View>;
}

export function Cip({
  etiket,
  ikon: Ikon,
  durum,
  onPress,
}: {
  etiket: string;
  ikon?: LucideIcon;
  durum?: "aktif" | "vurgu";
  onPress?: () => void;
}) {
  const r = durum === "aktif" ? s.cipAktif : durum === "vurgu" ? s.cipVurgu : s.cip;
  const yaziRengi = durum === "aktif" ? "#fff" : durum === "vurgu" ? renk.amberKoyu : renk.yazi;
  return (
    <Pressable onPress={onPress} disabled={!onPress} style={[s.cipTaban, r]}>
      {Ikon && <Ikon size={14} color={yaziRengi} />}
      <T w="yariKalin" style={{ fontSize: 12, color: yaziRengi }}>
        {etiket}
      </T>
    </Pressable>
  );
}

export function Buton({
  etiket,
  onPress,
  ikon: Ikon,
  tur = "dolu",
  yukleniyor = false,
  devreDisi = false,
  style,
}: {
  etiket: string;
  onPress: () => void;
  ikon?: LucideIcon;
  tur?: "dolu" | "cerceve" | "koyu";
  yukleniyor?: boolean;
  devreDisi?: boolean;
  style?: StyleProp<ViewStyle>;
}) {
  const zemin = tur === "dolu" ? renk.birincil : tur === "koyu" ? "#0f172a" : "#fff";
  const yaziRengi = tur === "cerceve" ? renk.yazi : "#fff";
  return (
    <Pressable
      onPress={onPress}
      disabled={devreDisi || yukleniyor}
      style={({ pressed }) => [
        s.buton,
        { backgroundColor: zemin, opacity: devreDisi ? 0.5 : pressed ? 0.85 : 1 },
        tur === "cerceve" && { borderWidth: 1, borderColor: renk.kenar },
        style,
      ]}
    >
      {yukleniyor ? <ActivityIndicator color={yaziRengi} /> : Ikon && <Ikon size={16} color={yaziRengi} />}
      <T w="yariKalin" style={{ color: yaziRengi, fontSize: 14 }}>
        {etiket}
      </T>
    </Pressable>
  );
}

/**
 * Sitedeki SayfaBasligi: solda mavi cizgili baslik + aciklama + bilgi cipleri.
 */
export function SayfaBasligi({ baslik, aciklama, cipler, sag }: { baslik: string; aciklama?: string; cipler?: ReactNode; sag?: ReactNode }) {
  return (
    <Kart style={{ padding: 20 }}>
      <View style={{ flexDirection: "row", gap: 12 }}>
        <View style={{ width: 4, borderRadius: 2, backgroundColor: renk.birincil }} />
        <View style={{ flex: 1 }}>
          <T w="kalin" style={{ fontSize: 24, color: renk.baslik, letterSpacing: -0.5 }}>
            {baslik}
          </T>
          {!!aciklama && <T style={{ marginTop: 6, color: renk.soluk, lineHeight: 20 }}>{aciklama}</T>}
        </View>
      </View>
      {cipler && <View style={{ marginTop: 14, flexDirection: "row", flexWrap: "wrap", gap: 8 }}>{cipler}</View>}
      {sag && <View style={{ marginTop: 14 }}>{sag}</View>}
    </Kart>
  );
}

/** Sitedeki BolumBasligi: kucuk etiket + baslik + "tumu" baglantisi. */
export function BolumBasligi({ etiket, baslik, tumu }: { etiket?: string; baslik: string; tumu?: { etiket: string; onPress: () => void } }) {
  return (
    <View style={{ flexDirection: "row", alignItems: "flex-end", justifyContent: "space-between", gap: 12 }}>
      <View style={{ flex: 1 }}>
        {!!etiket && (
          <T w="kalin" style={{ fontSize: 11, color: renk.birincil, letterSpacing: 1.2, textTransform: "uppercase" }}>
            {etiket}
          </T>
        )}
        <T w="kalin" style={{ fontSize: 20, marginTop: 2, letterSpacing: -0.3 }}>
          {baslik}
        </T>
      </View>
      {tumu && (
        <Pressable onPress={tumu.onPress} hitSlop={8}>
          <T w="yariKalin" style={{ color: renk.birincil, fontSize: 13 }}>
            {tumu.etiket} →
          </T>
        </Pressable>
      )}
    </View>
  );
}

export function Yukleniyor() {
  return (
    <View style={{ flex: 1, alignItems: "center", justifyContent: "center", padding: 40 }}>
      <ActivityIndicator color={renk.birincil} size="large" />
    </View>
  );
}

export function HataKutusu({ mesaj, tekrar }: { mesaj: string; tekrar: () => void }) {
  return (
    <View style={{ flex: 1, alignItems: "center", justifyContent: "center", padding: 32, gap: 16 }}>
      <T style={{ textAlign: "center", color: renk.yaziIkincil, lineHeight: 20 }}>{mesaj}</T>
      <Buton etiket="Tekrar dene" onPress={tekrar} />
    </View>
  );
}

/** Kesikli kenarli bos durum kutusu (sitede border-dashed bg-primary/5). */
export function Bos({ metin }: { metin: string }) {
  return (
    <View style={s.bos}>
      <T style={{ textAlign: "center", color: renk.soluk, lineHeight: 20 }}>{metin}</T>
    </View>
  );
}

const s = StyleSheet.create({
  kart: { backgroundColor: renk.kart, borderWidth: 1, borderColor: renk.birincilKenar, ...golge },
  cipTaban: { flexDirection: "row", alignItems: "center", gap: 6, borderRadius: 999, paddingHorizontal: 12, paddingVertical: 6, borderWidth: 1 },
  cip: { backgroundColor: "#f8fafc", borderColor: renk.birincilKenar },
  cipAktif: { backgroundColor: renk.birincil, borderColor: renk.birincil },
  cipVurgu: { backgroundColor: renk.amberZemin, borderColor: renk.amber },
  buton: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, borderRadius: 999, paddingHorizontal: 20, paddingVertical: 13 },
  bos: { borderWidth: 1, borderStyle: "dashed", borderColor: "rgba(36,102,195,0.25)", backgroundColor: renk.birincilZemin, borderRadius: 16, padding: 28 },
});

/** Etiketli metin kutusu (sitedeki Label + Input; sifre alaninda goster/gizle). */
export function Girdi({
  etiket,
  sag,
  sifre = false,
  ...p
}: import("react-native").TextInputProps & { etiket: string; sag?: ReactNode; sifre?: boolean }) {
  const [gizli, setGizli] = useState(sifre);
  return (
    <View>
      <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 6 }}>
        <T w="orta">{etiket}</T>
        {sag}
      </View>
      <View style={g.kutu}>
        <TextInput placeholderTextColor={renk.soluk} {...p} secureTextEntry={gizli} style={[g.girdi, p.style]} />
        {sifre && (
          <Pressable onPress={() => setGizli((x) => !x)} hitSlop={8}>
            {gizli ? <Eye size={18} color={renk.soluk} /> : <EyeOff size={18} color={renk.soluk} />}
          </Pressable>
        )}
      </View>
    </View>
  );
}

/** Onay kutusu satiri. */
export function Onay({ secili, degistir, children }: { secili: boolean; degistir: (v: boolean) => void; children: ReactNode }) {
  return (
    <Pressable onPress={() => degistir(!secili)} style={{ flexDirection: "row", alignItems: "flex-start", gap: 10 }}>
      <View style={[g.kare, secili && { backgroundColor: renk.birincil, borderColor: renk.birincil }]}>{secili && <Check size={14} color="#fff" />}</View>
      <View style={{ flex: 1 }}>{children}</View>
    </Pressable>
  );
}

const g = StyleSheet.create({
  kutu: { flexDirection: "row", alignItems: "center", gap: 8, borderWidth: 1, borderColor: "rgba(36,102,195,0.2)", borderRadius: 12, backgroundColor: "#fff", paddingHorizontal: 14 },
  girdi: { flex: 1, fontFamily: yazi.normal, fontSize: 15, color: renk.yazi, paddingVertical: 12 },
  kare: { width: 20, height: 20, borderRadius: 5, borderWidth: 1.5, borderColor: "#94a3b8", alignItems: "center", justifyContent: "center", marginTop: 1 },
});

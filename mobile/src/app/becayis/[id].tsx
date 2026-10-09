import { useState } from "react";
import { ScrollView, StyleSheet, TextInput, View } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { MapPin, MessageCircle, Send, User } from "lucide-react-native";
import { Buton, HataKutusu, Kart, T, Yukleniyor } from "@/bilesenler/ui";
import { KilitliOzellik } from "@/bilesenler/KilitliOzellik";
import { konumYazi } from "@/bilesenler/Becayis";
import { api, useVeri } from "@/lib/api";
import { useOturum } from "@/lib/oturum";
import { renk, yazi } from "@/lib/tema";
import type { BecayisDetay } from "@/lib/tipler";

/** Sitedeki /becayis/[id]: talep ayrintisi + talep sahibine mesaj (Pro). */
export default function BecayisDetayEkrani() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { kullanici } = useOturum();
  const { veri: t, hata, yenile } = useVeri<BecayisDetay>(kullanici === undefined ? null : `/api/mobil/becayis/${id}?u=${kullanici?.id ?? ""}`);
  if (hata && !t) return <HataKutusu mesaj={hata} tekrar={yenile} />;
  if (!t || kullanici === undefined) return <Yukleniyor />;
  const mesajButonu = <Buton etiket="Mesaj Gönder" ikon={MessageCircle} onPress={() => router.push("/giris")} />;

  return (
    <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 40 }} keyboardShouldPersistTaps="handled">
      <Kart style={{ padding: 20, gap: 14 }}>
        <T w="kalin" style={{ fontSize: 22, color: renk.birincil, letterSpacing: -0.4 }}>
          {t.meslek}
        </T>
        {!!t.kurumTuru && <T style={{ color: renk.soluk, marginTop: -8 }}>{t.kurumTuru}</T>}
        <View style={{ flexDirection: "row", flexWrap: "wrap", alignItems: "center", gap: 8 }}>
          <View style={[s.cip, { backgroundColor: renk.birincilZemin }]}>
            <MapPin size={13} color={renk.birincil} />
            <T style={{ color: renk.birincil, fontSize: 13 }}>Mevcut: {konumYazi(t)}</T>
          </View>
          <T style={{ color: renk.soluk }}>→</T>
          <View style={[s.cip, { backgroundColor: "#d1fae5", flexShrink: 1 }]}>
            <T style={{ color: renk.yesil, fontSize: 13 }}>İstenen: {t.istenenIller.join(", ")}</T>
          </View>
        </View>
        {!!t.aciklama && (
          <View style={{ backgroundColor: "rgba(36,102,195,0.05)", borderRadius: 12, padding: 12 }}>
            <T style={{ color: "#334155", lineHeight: 20 }}>{t.aciklama}</T>
          </View>
        )}
        <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
          <User size={14} color={renk.soluk} />
          <T style={{ fontSize: 12, color: renk.soluk }}>{t.sahipAd}</T>
        </View>

        {t.sahibi ? (
          <View style={{ backgroundColor: renk.amberZemin, borderRadius: 12, padding: 12 }}>
            <T style={{ color: renk.amberKoyu, lineHeight: 20 }}>Bu senin kendi talebin. Gelen mesajları &quot;Mevcut Taleplerim&quot; sayfandan görebilirsin.</T>
          </View>
        ) : !kullanici ? (
          mesajButonu
        ) : kullanici.plan === "UCRETSIZ" ? (
          <KilitliOzellik
            mevcutPlan={kullanici.plan}
            gerekenPlan="PRO"
            kaynak="becayis-mesaj"
            baslik="Becayiş mesajlaşması Pro'da"
            ozellikler={["Talep sahibine site içinden mesaj gönder", "Cevap gelince bildirim ve SMS ile haberdar ol"]}
          >
            <View style={{ minHeight: 300, justifyContent: "center" }}>{mesajButonu}</View>
          </KilitliOzellik>
        ) : (
          <MesajKutusu talepId={t.id} />
        )}
      </Kart>
    </ScrollView>
  );
}

/** Sitedeki MessageWidget: ilk mesaj; sonrasi "Ilgilendigim Ilanlar"da surer. */
function MesajKutusu({ talepId }: { talepId: string }) {
  const [mesaj, setMesaj] = useState("");
  const [gonderildi, setGonderildi] = useState(false);
  const [gonderiliyor, setGonderiliyor] = useState(false);
  const [hata, setHata] = useState<string | null>(null);

  async function gonder() {
    setGonderiliyor(true);
    setHata(null);
    try {
      await api("/api/becayis/mesaj", { govde: { talepId, mesaj } });
      setGonderildi(true);
      setMesaj("");
    } catch (e) {
      setHata(e instanceof Error ? e.message : "Mesaj gönderilemedi.");
    } finally {
      setGonderiliyor(false);
    }
  }

  if (gonderildi) {
    return (
      <View style={{ gap: 10 }}>
        <T style={{ color: "#059669" }}>Mesajın gönderildi! Cevap gelirse bildirim alacaksın.</T>
        <Buton tur="cerceve" etiket="İlgilendiğim İlanlar" onPress={() => router.push("/becayis/ilgilendiklerim")} />
      </View>
    );
  }
  return (
    <View style={{ gap: 8 }}>
      <TextInput value={mesaj} onChangeText={setMesaj} placeholder="Mesajını yaz..." placeholderTextColor={renk.soluk} multiline style={s.girdi} />
      {!!hata && <T style={{ fontSize: 12, color: renk.hata }}>{hata}</T>}
      <Buton etiket="Gönder" ikon={Send} onPress={gonder} yukleniyor={gonderiliyor} devreDisi={!mesaj.trim()} />
    </View>
  );
}

const s = StyleSheet.create({
  cip: { flexDirection: "row", alignItems: "center", gap: 4, borderRadius: 999, paddingHorizontal: 12, paddingVertical: 6 },
  girdi: { minHeight: 100, textAlignVertical: "top", borderWidth: 1, borderColor: "rgba(36,102,195,0.2)", borderRadius: 12, padding: 12, fontFamily: yazi.normal, fontSize: 15, color: renk.yazi },
});

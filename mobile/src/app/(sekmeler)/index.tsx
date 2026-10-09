import { useEffect, useRef, useState } from "react";
import { Pressable, RefreshControl, ScrollView, StyleSheet, useWindowDimensions, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import { ArrowRight, ArrowUpRight } from "lucide-react-native";
import { BolumBasligi, HataKutusu, Kart, T, Yukleniyor } from "@/bilesenler/ui";
import { BolumArama } from "@/bilesenler/BolumArama";
import { IlanKarti } from "@/bilesenler/IlanKarti";
import { HaberGorsel, HaberKarti } from "@/bilesenler/HaberKarti";
import { useVeri } from "@/lib/api";
import { sayi } from "@/lib/bicim";
import { renk } from "@/lib/tema";
import type { AnaSayfaVeri, HaberKartiVeri } from "@/lib/tipler";

export default function AnaSayfa() {
  const { veri, hata, yenileniyor, yenile } = useVeri<AnaSayfaVeri>("/api/mobil/ana-sayfa");
  const kaydirma = useRef<ScrollView>(null);

  return (
    <SafeAreaView edges={["top"]} style={{ flex: 1, backgroundColor: "#fff" }}>
      <View style={s.ust}>
        <Image source={require("../../../assets/logo.png")} style={{ width: 54, height: 40 }} contentFit="contain" />
      </View>
      {hata && !veri ? (
        <HataKutusu mesaj={hata} tekrar={yenile} />
      ) : !veri ? (
        <Yukleniyor />
      ) : (
        <ScrollView
          ref={kaydirma}
          style={{ backgroundColor: renk.zemin }}
          contentContainerStyle={{ padding: 16, paddingBottom: 32 }}
          keyboardShouldPersistTaps="handled"
          refreshControl={<RefreshControl refreshing={yenileniyor} onRefresh={yenile} tintColor={renk.birincil} />}
        >
          <Kart style={{ padding: 24, alignItems: "center" }}>
            <T w="yariKalin" style={{ fontSize: 24, lineHeight: 31, textAlign: "center", letterSpacing: -0.5 }}>
              Mezun olduğun bölüme uygun{" "}
              <T w="yariKalin" style={{ fontSize: 24, color: renk.birincil, fontStyle: "italic" }}>
                kamu ilanlarını
              </T>{" "}
              bul.
            </T>
            <T style={{ marginTop: 10, textAlign: "center", color: renk.yaziIkincil, lineHeight: 20 }}>Bölümünü seç, sana uygun güncel kamu ilanlarını hemen listeleyelim.</T>
            <View style={{ marginTop: 20, width: "100%" }}>
              <BolumArama bolumler={veri.bolumler} />
            </View>
            <View style={s.istatistik}>
              {[
                ["Aktif İlan", veri.istatistik.ilan],
                ["Kurum", veri.istatistik.kurum],
                ["Bölüm", veri.istatistik.bolum],
              ].map(([ad, n], i) => (
                <View key={ad} style={[{ flex: 1, alignItems: "center" }, i > 0 && { borderLeftWidth: 1, borderLeftColor: renk.kenar }]}>
                  <T w="kalin" style={{ fontSize: 22, color: renk.birincil }}>
                    {sayi(n as number)}
                  </T>
                  <T w="orta" style={{ fontSize: 12, color: renk.soluk, marginTop: 2 }}>
                    {ad}
                  </T>
                </View>
              ))}
            </View>
          </Kart>

          {veri.haberler.length > 0 && <HaberKaruseli haberler={veri.haberler} />}

          <View style={{ marginTop: 40, gap: 16 }}>
            <BolumBasligi etiket="Güncel" baslik="Haberler" tumu={{ etiket: `Tüm haberler (${veri.haberSayisi})`, onPress: () => router.navigate("/haberler") }} />
            {veri.haberler.map((h) => (
              <HaberKarti key={h.slug} h={h} />
            ))}
          </View>

          <View style={{ marginTop: 40, gap: 16 }}>
            <BolumBasligi
              etiket="Yeni eklenenler"
              baslik="Yeni Eklenen İlanlar"
              tumu={{ etiket: `Tüm ilanlar (${sayi(veri.istatistik.ilan)})`, onPress: () => router.navigate("/ilanlar") }}
            />
            {veri.ilanlar.map((i) => (
              <IlanKarti key={i.id} ilan={i} />
            ))}
          </View>

          <View style={s.kapanis}>
            <View style={s.amblemKutu}>
              <Image source={require("../../../assets/android-icon-monochrome.png")} style={{ width: 40, height: 40 }} tintColor="#fff" contentFit="contain" />
            </View>
            <T w="kalin" style={{ marginTop: 16, fontSize: 24, color: "#fff", textAlign: "center", letterSpacing: -0.5 }}>
              Bölümünü söyle, ilanını bul.
            </T>
            <T style={{ marginTop: 8, color: "rgba(255,255,255,0.8)", textAlign: "center" }}>İlan aramak ücretsizdir; kayıt gerektirmez.</T>
            <Pressable onPress={() => kaydirma.current?.scrollTo({ y: 0, animated: true })} style={s.kapanisButon}>
              <T w="yariKalin" style={{ color: renk.birincil, fontSize: 15 }}>
                Bölüme Göre Ara
              </T>
              <ArrowUpRight size={16} color={renk.birincil} />
            </Pressable>
          </View>
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

/** Sitedeki HeroHaberCarousel: tam gorselli haber slaytlari, 6 sn'de bir kendiliginden kayar. */
function HaberKaruseli({ haberler }: { haberler: HaberKartiVeri[] }) {
  const genislik = useWindowDimensions().width - 32;
  const ref = useRef<ScrollView>(null);
  const [aktif, setAktif] = useState(0);

  useEffect(() => {
    const t = setInterval(() => {
      setAktif((a) => {
        const sonraki = (a + 1) % haberler.length;
        ref.current?.scrollTo({ x: sonraki * genislik, animated: true });
        return sonraki;
      });
    }, 6000);
    return () => clearInterval(t);
  }, [haberler.length, genislik]);

  return (
    <View style={{ marginTop: 24, height: 380, borderRadius: 24, overflow: "hidden" }}>
      <ScrollView
        ref={ref}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={(e) => setAktif(Math.round(e.nativeEvent.contentOffset.x / genislik))}
      >
        {haberler.map((h) => (
          <Pressable key={h.slug} onPress={() => router.push({ pathname: "/haber/[slug]", params: { slug: h.slug } })} style={{ width: genislik, height: 380 }}>
            <HaberGorsel h={h} markaGizli style={[StyleSheet.absoluteFill, { aspectRatio: undefined, borderRadius: 0 }]} />
            <LinearGradient colors={["rgba(0,0,0,0.1)", "rgba(0,0,0,0.35)", "rgba(0,0,0,0.85)"]} style={StyleSheet.absoluteFill} />
            <View style={{ position: "absolute", left: 0, right: 0, bottom: 0, padding: 24, gap: 12 }}>
              {h.yeni && (
                <View style={{ alignSelf: "flex-start", backgroundColor: "#dc2626", borderRadius: 999, paddingHorizontal: 10, paddingVertical: 3 }}>
                  <T w="kalin" style={{ color: "#fff", fontSize: 11 }}>
                    YENİ
                  </T>
                </View>
              )}
              <T w="kalin" style={{ color: "#fff", fontSize: 20, lineHeight: 26 }}>
                {h.baslik}
              </T>
              <T numberOfLines={2} style={{ color: "rgba(255,255,255,0.8)", lineHeight: 20 }}>
                {h.ozet}
              </T>
              <View style={s.detayButon}>
                <T w="yariKalin" style={{ fontSize: 14 }}>
                  Detayları İncele
                </T>
                <ArrowRight size={16} color={renk.yazi} />
              </View>
            </View>
          </Pressable>
        ))}
      </ScrollView>
      <View style={{ position: "absolute", bottom: 12, right: 16, flexDirection: "row", gap: 6 }}>
        {haberler.map((h, i) => (
          <View key={h.slug} style={{ width: 20, height: 6, borderRadius: 3, backgroundColor: i === aktif ? "#fff" : "rgba(255,255,255,0.4)" }} />
        ))}
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  ust: { height: 56, justifyContent: "center", paddingHorizontal: 16, borderBottomWidth: 1, borderBottomColor: renk.kenar, backgroundColor: "#fff" },
  istatistik: { marginTop: 28, flexDirection: "row", width: "100%", borderTopWidth: 1, borderTopColor: renk.kenar, paddingTop: 18 },
  detayButon: { alignSelf: "flex-start", flexDirection: "row", alignItems: "center", gap: 8, backgroundColor: "#fff", borderRadius: 999, paddingHorizontal: 16, paddingVertical: 9, marginTop: 4 },
  kapanis: { marginTop: 40, borderRadius: 16, backgroundColor: renk.birincil, paddingHorizontal: 24, paddingVertical: 48, alignItems: "center" },
  amblemKutu: { width: 64, height: 64, borderRadius: 16, backgroundColor: "rgba(255,255,255,0.1)", alignItems: "center", justifyContent: "center" },
  kapanisButon: { marginTop: 24, flexDirection: "row", alignItems: "center", gap: 8, backgroundColor: "#fff", borderRadius: 999, paddingHorizontal: 24, paddingVertical: 14 },
});

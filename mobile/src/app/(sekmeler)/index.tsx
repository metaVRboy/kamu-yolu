import { useCallback, useEffect, useRef, useState } from "react";
import { Pressable, RefreshControl, ScrollView, StyleSheet, useWindowDimensions, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { router, useFocusEffect } from "expo-router";
import { ArrowRight, ArrowUpRight, Bell, Briefcase, Building2, GraduationCap } from "lucide-react-native";
import { BolumBasligi, HataKutusu, Kart, T, Yukleniyor } from "@/bilesenler/ui";
import { BolumArama } from "@/bilesenler/BolumArama";
import { IlanKarti } from "@/bilesenler/IlanKarti";
import { FotoKredisi, HaberGorsel, HaberKarti } from "@/bilesenler/HaberKarti";
import { useVeri } from "@/lib/api";
import { sayi } from "@/lib/bicim";
import { useOturum } from "@/lib/oturum";
import { renk } from "@/lib/tema";
import type { AnaSayfaVeri, HaberKartiVeri, UyeOzeti } from "@/lib/tipler";
import { ProBandi } from "@/bilesenler/ProTesvik";
import { DavetBandi, GunlukSerit, ProfilKarti } from "@/bilesenler/UyeKartlari";

export default function AnaSayfa() {
  const { veri, hata, yenileniyor, yenile } = useVeri<AnaSayfaVeri>("/api/mobil/ana-sayfa");
  const { kullanici } = useOturum();
  // Uye parcalari (profil karti, seri, bugun senin icin): misafirde { uye: null }. Gunun sorulari cozulup donunce tazelenir.
  const uye = useVeri<UyeOzeti>(kullanici === undefined ? null : `/api/benim-ozetim?u=${kullanici?.id ?? ""}`);
  const uyeYenile = uye.yenile;
  useFocusEffect(
    useCallback(() => {
      uyeYenile(false);
    }, [uyeYenile]),
  );
  const kaydirma = useRef<ScrollView>(null);
  const u = uye.veri?.uye;

  return (
    <SafeAreaView edges={["top"]} style={{ flex: 1, backgroundColor: "#fff" }}>
      <View style={s.ust}>
        <Image source={require("../../../assets/logo.png")} style={{ width: 54, height: 40 }} contentFit="contain" />
        <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
          {veri?.kpssGun != null && (
            <Pressable onPress={() => router.navigate("/kpss")} style={s.kpssCip}>
              <T w="yariKalin" style={{ fontSize: 12, color: renk.birincil }}>
                KPSS&apos;ye {veri.kpssGun} gün
              </T>
            </Pressable>
          )}
          <Zil />
        </View>
      </View>
      <ProBandi />
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
          refreshControl={
            <RefreshControl
              refreshing={yenileniyor}
              onRefresh={() => {
                yenile();
                uyeYenile(false);
              }}
              tintColor={renk.birincil}
            />
          }
        >
          {/* Sitedeki hero: vurgulu baslik, arama, en cok ilanli bolumler (sirali mini kartlar), ikonlu sayilar. */}
          <Kart style={{ padding: 22 }}>
            <T w="kalin" style={{ fontSize: 27, lineHeight: 34, letterSpacing: -0.6 }}>
              Mezun olduğun bölüme uygun{" "}
              <T w="kalin" style={{ fontSize: 27, color: renk.birincil, textDecorationLine: "underline", textDecorationColor: "rgba(36,102,195,0.3)" }}>
                kamu ilanlarını
              </T>{" "}
              bul.
            </T>
            <T style={{ marginTop: 10, color: renk.yaziIkincil, lineHeight: 21 }}>Bölümünü seç; başvurabileceğin güncel ilanları ve son başvuru tarihlerini tek listede gör.</T>
            <View style={{ marginTop: 18 }}>
              <BolumArama bolumler={veri.bolumler} />
            </View>
            <EnCokIlan bolumler={veri.bolumler} />
            <View style={s.istatistik}>
              {[
                { ad: "aktif ilan", n: veri.istatistik.ilan, ikon: Briefcase },
                { ad: "kurum", n: veri.istatistik.kurum, ikon: Building2 },
                { ad: "bölüm", n: veri.istatistik.bolum, ikon: GraduationCap },
              ].map((x) => (
                <View key={x.ad} style={{ flex: 1, gap: 8 }}>
                  <View style={s.istatistikIkon}>
                    <x.ikon size={19} color={renk.birincil} />
                  </View>
                  <View>
                    <T w="kalin" style={{ fontSize: 20 }}>
                      {sayi(x.n)}
                    </T>
                    <T w="orta" style={{ fontSize: 12, color: renk.soluk }}>
                      {x.ad}
                    </T>
                  </View>
                </View>
              ))}
            </View>
          </Kart>

          {/* Sitedeki duzen H: uyeye profil karti; herkese gunun sorulari / bugun senin icin / KPSS denemesi. */}
          <View style={{ marginTop: 16, gap: 12 }}>
            {!!u && (
              <ProfilKarti
                kompakt
                v={{
                  adSoyad: u.adSoyad,
                  fotoUrl: u.fotoUrl,
                  altSatir: [u.bolum, u.duzey].filter(Boolean).join(" · ") || "Bölümünü henüz seçmedin",
                  seriGun: u.seri.gun,
                  denemeSayisi: u.denemeSayisi,
                  rozetSayisi: u.rozetSayisi,
                  rozetler: u.rozetler,
                  plan: u.plan,
                  planAdi: u.planAdi,
                  kalanGun: u.planKalanGun,
                }}
              />
            )}
            {!!uye.veri && <GunlukSerit veri={uye.veri} />}
          </View>

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

          {!!u && (
            <View style={{ marginTop: 40 }}>
              <DavetBandi />
            </View>
          )}

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

/** En cok aktif ilani olan 4 bolum: sirali mini kartlar (2x2), gercek sayi ve goreli cubuk. */
function EnCokIlan({ bolumler }: { bolumler: AnaSayfaVeri["bolumler"] }) {
  const ilk = [...bolumler].sort((a, b) => b.ilanSayisi - a.ilanSayisi).filter((b) => b.ilanSayisi > 0).slice(0, 4);
  if (!ilk.length) return null;
  const enCok = ilk[0].ilanSayisi;
  return (
    <View style={{ marginTop: 20 }}>
      <T w="kalin" style={{ fontSize: 11, letterSpacing: 1.2, color: "#64748b" }}>
        EN ÇOK İLANI OLAN BÖLÜMLER
      </T>
      <View style={{ marginTop: 10, flexDirection: "row", flexWrap: "wrap", gap: 10 }}>
        {ilk.map((b, i) => (
          <Pressable
            key={b.slug}
            onPress={() => router.push({ pathname: "/liste", params: { kapsam: "bolum", deger: b.slug } })}
            style={({ pressed }) => [s.enCokKart, pressed && { borderColor: "rgba(36,102,195,0.35)", backgroundColor: renk.birincilZemin }]}
          >
            <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
              <View style={s.sira}>
                <T w="kalin" style={{ fontSize: 11, color: "#fff" }}>
                  {i + 1}
                </T>
              </View>
              <T w="kalin" style={{ fontSize: 14 }}>
                {b.ilanSayisi} <T style={{ fontSize: 12, color: renk.soluk }}>ilan</T>
              </T>
            </View>
            <T w="yariKalin" numberOfLines={2} style={{ fontSize: 13, lineHeight: 17, color: "#334155", minHeight: 34 }}>
              {b.ad}
            </T>
            <View style={{ height: 4, borderRadius: 2, backgroundColor: "#f1f5f9", overflow: "hidden" }}>
              <LinearGradient colors={[renk.birincil, "#6366f1"]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={{ height: "100%", width: `${Math.round((b.ilanSayisi / enCok) * 100)}%`, borderRadius: 2 }} />
            </View>
          </Pressable>
        ))}
      </View>
    </View>
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
            <HaberGorsel h={h} markaGizli kapakUstte style={[StyleSheet.absoluteFill, { aspectRatio: undefined, borderRadius: 0 }]} />
            <LinearGradient colors={["rgba(0,0,0,0.1)", "rgba(0,0,0,0.35)", "rgba(0,0,0,0.85)"]} style={StyleSheet.absoluteFill} />
            <FotoKredisi kredi={h.gorselKredi} style={{ position: "absolute", top: 12, right: 12 }} />
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

/** Sitedeki bildirim zili: okunmamis varsa kirmizi nokta; dokununca bildirimler ekrani. */
function Zil() {
  const { kullanici } = useOturum();
  const { veri, yenile } = useVeri<{ okunmamisSayisi: number }>(kullanici === undefined ? null : `/api/bildirimler?u=${kullanici?.id ?? ""}`);
  useFocusEffect(
    useCallback(() => {
      yenile(false);
    }, [yenile]),
  );
  return (
    <Pressable onPress={() => router.push("/bildirimler")} hitSlop={8} style={s.zil} accessibilityLabel="Bildirimler">
      <Bell size={19} color="#475569" />
      {!!veri?.okunmamisSayisi && <View style={s.nokta} />}
    </Pressable>
  );
}

const s = StyleSheet.create({
  kpssCip: { borderRadius: 999, backgroundColor: renk.birincilZemin, paddingHorizontal: 12, paddingVertical: 7 },
  zil: { width: 38, height: 38, borderRadius: 10, borderWidth: 1, borderColor: renk.kenar, alignItems: "center", justifyContent: "center" },
  nokta: { position: "absolute", top: 8, right: 9, width: 8, height: 8, borderRadius: 4, backgroundColor: "#ef4444" },
  ust: { height: 56, flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 16, borderBottomWidth: 1, borderBottomColor: renk.kenar, backgroundColor: "#fff" },
  istatistik: { marginTop: 22, flexDirection: "row", gap: 12, borderTopWidth: 1, borderTopColor: "#f1f5f9", paddingTop: 18 },
  enCokKart: { width: "47.5%", flexGrow: 1, gap: 9, borderRadius: 16, borderWidth: 1, borderColor: "#e2e8f0", backgroundColor: "#fff", padding: 12 },
  sira: { width: 24, height: 24, borderRadius: 8, backgroundColor: "#0f172a", alignItems: "center", justifyContent: "center" },
  istatistikIkon: { width: 40, height: 40, borderRadius: 12, backgroundColor: renk.birincilZemin, alignItems: "center", justifyContent: "center" },
  detayButon: { alignSelf: "flex-start", flexDirection: "row", alignItems: "center", gap: 8, backgroundColor: "#fff", borderRadius: 999, paddingHorizontal: 16, paddingVertical: 9, marginTop: 4 },
  kapanis: { marginTop: 40, borderRadius: 16, backgroundColor: renk.birincil, paddingHorizontal: 24, paddingVertical: 48, alignItems: "center" },
  amblemKutu: { width: 64, height: 64, borderRadius: 16, backgroundColor: "rgba(255,255,255,0.1)", alignItems: "center", justifyContent: "center" },
  kapanisButon: { marginTop: 24, flexDirection: "row", alignItems: "center", gap: 8, backgroundColor: "#fff", borderRadius: 999, paddingHorizontal: 24, paddingVertical: 14 },
});

import { useCallback } from "react";
import { Pressable, RefreshControl, ScrollView, StyleSheet, View } from "react-native";
import { Image } from "expo-image";
import { router, useFocusEffect } from "expo-router";
import { Briefcase, GraduationCap, LogIn, LogOut, Pencil, UserPlus, UserRound } from "lucide-react-native";
import { Bos, Buton, HataKutusu, Kart, T, Yukleniyor } from "@/bilesenler/ui";
import { IlanKarti } from "@/bilesenler/IlanKarti";
import { SITE, useVeri } from "@/lib/api";
import { useOturum } from "@/lib/oturum";
import { renk } from "@/lib/tema";
import type { ProfilVeri } from "@/lib/tipler";

const PLAN_RENGI = { UCRETSIZ: { zemin: renk.griZemin, yazi: "#475569" }, PRO: { zemin: "#e0f2fe", yazi: "#0369a1" }, PRO_PLUS: { zemin: "#ede9fe", yazi: "#6d28d9" } } as const;

/** Sitedeki /profilim ozeti. Giris yoksa giris/kayit daveti. */
export default function Profil() {
  const { kullanici, cikis } = useOturum();
  const { veri, hata, yenileniyor, yenile } = useVeri<ProfilVeri>(kullanici ? `/api/mobil/profil?u=${kullanici.id}` : null);
  // Profil duzenlemeden donunce guncel bilgi.
  useFocusEffect(
    useCallback(() => {
      if (kullanici) yenile(false);
    }, [kullanici, yenile]),
  );

  if (kullanici === undefined) return <Yukleniyor />;
  if (!kullanici) {
    return (
      <ScrollView contentContainerStyle={{ padding: 16 }}>
        <Kart style={{ padding: 24, alignItems: "center", gap: 12 }}>
          <View style={s.avatar}>
            <UserRound size={32} color={renk.birincil} />
          </View>
          <T w="kalin" style={{ fontSize: 20 }}>
            Kamu Yolu hesabın
          </T>
          <T style={{ textAlign: "center", color: renk.soluk, lineHeight: 20 }}>Giriş yap; bölümüne uygun ilanları, ilan uygunluk kontrolünü ve profilini kullan.</T>
          <Buton etiket="Giriş Yap" ikon={LogIn} onPress={() => router.push("/giris")} style={{ alignSelf: "stretch", marginTop: 8 }} />
          <Buton etiket="Kayıt Ol" tur="cerceve" ikon={UserPlus} onPress={() => router.push("/kayit")} style={{ alignSelf: "stretch" }} />
        </Kart>
      </ScrollView>
    );
  }
  if (hata && !veri) return <HataKutusu mesaj={hata} tekrar={yenile} />;
  if (!veri?.kullanici) return <Yukleniyor />;
  const k = veri.kullanici;
  const foto = k.fotografUrl && (k.fotografUrl.startsWith("/") ? SITE + k.fotografUrl : k.fotografUrl);
  const planRenk = PLAN_RENGI[k.plan];

  return (
    <ScrollView contentContainerStyle={{ padding: 16, gap: 16, paddingBottom: 32 }} refreshControl={<RefreshControl refreshing={yenileniyor} onRefresh={yenile} tintColor={renk.birincil} />}>
      <Kart style={{ padding: 20, flexDirection: "row", alignItems: "center", gap: 14 }}>
        <View style={s.avatar}>{foto ? <Image source={{ uri: foto }} style={{ width: "100%", height: "100%" }} /> : <T w="kalin" style={{ fontSize: 22, color: renk.birincil }}>{k.adSoyad.charAt(0)}</T>}</View>
        <View style={{ flex: 1 }}>
          <T w="kalin" style={{ fontSize: 18 }}>
            {k.adSoyad}
          </T>
          <T style={{ color: renk.soluk, fontSize: 13 }}>{k.email}</T>
          <View style={[s.plan, { backgroundColor: planRenk.zemin }]}>
            <T w="kalin" style={{ fontSize: 12, color: planRenk.yazi }}>
              {k.planAdi}
            </T>
          </View>
        </View>
      </Kart>

      <Kart style={{ padding: 20, gap: 12 }}>
        <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
          <T w="yariKalin" style={{ color: renk.birincil, fontSize: 15 }}>
            Profil Bilgilerim
          </T>
          <Pressable onPress={() => router.push("/profil-duzenle")} hitSlop={8} style={{ flexDirection: "row", alignItems: "center", gap: 4 }}>
            <Pencil size={14} color={renk.birincil} />
            <T w="yariKalin" style={{ color: renk.birincil }}>
              Düzenle
            </T>
          </Pressable>
        </View>
        <Satir ikon={GraduationCap} etiket="Bölüm" deger={k.bolum?.ad ?? "Seçilmedi"} />
        <Satir ikon={Briefcase} etiket="Öğrenim düzeyi" deger={k.duzeyAdi ?? "Seçilmedi"} />
      </Kart>

      <View style={{ gap: 16 }}>
        <T w="kalin" style={{ fontSize: 18 }}>
          Sana uygun ilanlar ({veri.kisiselIlanSayisi})
        </T>
        {veri.kisiselIlanlar.length === 0 ? (
          <Bos metin={k.bolum || k.duzey ? "Şu anda profiline uygun aktif ilan yok." : "Bölümünü ya da öğrenim düzeyini seçersen sana uygun ilanları burada gösteririz."} />
        ) : (
          veri.kisiselIlanlar.map((i) => <IlanKarti key={i.id} ilan={i} />)
        )}
        {veri.kisiselIlanSayisi > veri.kisiselIlanlar.length && (
          <Buton
            tur="cerceve"
            etiket="Tümünü gör"
            onPress={() =>
              router.push({
                pathname: "/liste",
                params: k.bolum ? { kapsam: "bolum", deger: k.bolum.slug } : { kapsam: "seviye", deger: (k.duzey ?? "").toLowerCase().replace("_", "-") },
              })
            }
          />
        )}
      </View>

      <Buton tur="cerceve" ikon={LogOut} etiket="Çıkış Yap" onPress={cikis} style={{ marginTop: 8 }} />
    </ScrollView>
  );
}

function Satir({ ikon: Ikon, etiket, deger }: { ikon: typeof GraduationCap; etiket: string; deger: string }) {
  return (
    <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
      <View style={s.satirIkon}>
        <Ikon size={18} color={renk.birincil} />
      </View>
      <View style={{ flex: 1 }}>
        <T style={{ fontSize: 12, color: renk.soluk }}>{etiket}</T>
        <T w="yariKalin">{deger}</T>
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  avatar: { width: 64, height: 64, borderRadius: 32, backgroundColor: renk.birincilZemin, alignItems: "center", justifyContent: "center", overflow: "hidden" },
  plan: { alignSelf: "flex-start", marginTop: 6, borderRadius: 999, paddingHorizontal: 10, paddingVertical: 3 },
  satirIkon: { width: 36, height: 36, borderRadius: 10, backgroundColor: renk.birincilZemin, alignItems: "center", justifyContent: "center" },
});

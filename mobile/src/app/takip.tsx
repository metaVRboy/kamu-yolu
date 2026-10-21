import { useCallback } from "react";
import { Alert, Pressable, RefreshControl, ScrollView, View } from "react-native";
import { router, useFocusEffect } from "expo-router";
import { Bos, Buton, HataKutusu, Kart, SayfaBasligi, T, Yukleniyor } from "@/bilesenler/ui";
import { GirisDaveti } from "@/bilesenler/GirisDaveti";
import { yukseltmeAc } from "@/bilesenler/KilitliOzellik";
import { api, useVeri } from "@/lib/api";
import { kalanGunRozeti, tarihUzun } from "@/lib/bicim";
import { useOturum } from "@/lib/oturum";
import { renk } from "@/lib/tema";

type Veri = { pro: boolean; ilanlar: { id: string; kadro: string; kurum: string; sonBasvuru: string | null; kalanGun: number | null }[] };

/** Sitedeki /profilim/takip: takibe alinan ilanlar, son basvurusu en yakin olandan. */
export default function Takip() {
  const { kullanici } = useOturum();
  const { veri, hata, yenileniyor, yenile } = useVeri<Veri>(kullanici ? `/api/mobil/takip?u=${kullanici.id}` : null);
  useFocusEffect(
    useCallback(() => {
      if (kullanici) yenile(false);
    }, [kullanici, yenile]),
  );
  if (kullanici === undefined) return <Yukleniyor />;
  if (!kullanici) return <GirisDaveti />;
  if (hata && !veri) return <HataKutusu mesaj={hata} tekrar={yenile} />;
  if (!veri) return <Yukleniyor />;

  const birak = (id: string) =>
    api(`/api/ilan/${id}/takip`, { method: "DELETE" }).then(
      () => yenile(false),
      () => Alert.alert("Takip bırakılamadı."),
    );

  return (
    <ScrollView contentContainerStyle={{ padding: 16, gap: 12, paddingBottom: 40 }} refreshControl={<RefreshControl refreshing={yenileniyor} onRefresh={yenile} tintColor={renk.birincil} />}>
      <SayfaBasligi baslik="Takip Ettiğim İlanlar" aciklama="Takibe aldığın ilanlar, son başvuru günü en yakın olandan başlayarak." />
      {!veri.pro && veri.ilanlar.length > 0 && (
        <View style={{ borderRadius: 16, borderWidth: 1, borderColor: "rgba(36,102,195,0.2)", backgroundColor: renk.birincilZemin, padding: 16, gap: 10 }}>
          <T style={{ color: "#334155", lineHeight: 20 }}>Pro&apos;da takip ettiğin her ilan için son başvuruya 3 gün ve 1 gün kala hatırlatma gelir.</T>
          <Buton etiket="Hatırlatmaları aç" onPress={() => yukseltmeAc("PRO", "ilan-takip")} style={{ alignSelf: "flex-start", paddingVertical: 10 }} />
        </View>
      )}
      {veri.ilanlar.length === 0 ? (
        <Bos metin="Henüz takip ettiğin ilan yok. Bir ilanın sayfasında “İlanı takip et” düğmesine bas." />
      ) : (
        veri.ilanlar.map((i) => {
          const r = kalanGunRozeti(i.kalanGun);
          return (
            <Kart key={i.id} style={{ padding: 16, gap: 10 }} yaricap={16}>
              <Pressable onPress={() => router.push({ pathname: "/ilan/[id]", params: { id: i.id } })}>
                <T w="yariKalin" style={{ fontSize: 15 }}>
                  {i.kadro}
                </T>
                <T style={{ marginTop: 2, fontSize: 13, color: renk.soluk }}>
                  {i.kurum}
                  {i.sonBasvuru ? ` · Son başvuru ${tarihUzun(i.sonBasvuru)}` : ""}
                </T>
              </Pressable>
              <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
                <View style={{ borderRadius: 999, backgroundColor: r.zemin, paddingHorizontal: 10, paddingVertical: 4 }}>
                  <T w="kalin" style={{ fontSize: 12, color: r.renk }}>
                    {r.metin}
                  </T>
                </View>
                <Pressable onPress={() => birak(i.id)} hitSlop={8}>
                  <T w="yariKalin" style={{ fontSize: 12, color: renk.soluk }}>
                    Takibi bırak
                  </T>
                </Pressable>
              </View>
            </Kart>
          );
        })
      )}
    </ScrollView>
  );
}

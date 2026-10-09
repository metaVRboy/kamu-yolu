import { useCallback } from "react";
import { RefreshControl, ScrollView, View } from "react-native";
import { router, useFocusEffect } from "expo-router";
import { MapPin } from "lucide-react-native";
import { Buton, Bos, HataKutusu, SayfaBasligi, T, Yukleniyor } from "@/bilesenler/ui";
import { SohbetPaneli, konumYazi } from "@/bilesenler/Becayis";
import { GirisDaveti } from "@/bilesenler/GirisDaveti";
import { api, useVeri } from "@/lib/api";
import { useOturum } from "@/lib/oturum";
import { renk } from "@/lib/tema";
import type { IlgilendiklerimVeri } from "@/lib/tipler";

/** Sitedeki /becayis/ilgilendiklerim: mesaj gonderilen baskalarinin talepleri ve sohbetleri. */
export default function Ilgilendiklerim() {
  const { kullanici } = useOturum();
  const { veri, hata, yenileniyor, yenile } = useVeri<IlgilendiklerimVeri>(kullanici ? `/api/mobil/becayis/ilgilendiklerim?u=${kullanici.id}` : null);
  useFocusEffect(
    useCallback(() => {
      if (kullanici) yenile(false);
    }, [kullanici, yenile]),
  );
  if (kullanici === undefined) return <Yukleniyor />;
  if (!kullanici) return <GirisDaveti />;
  if (hata && !veri) return <HataKutusu mesaj={hata} tekrar={yenile} />;
  if (!veri) return <Yukleniyor />;
  const benim = veri.kullaniciId;

  return (
    <ScrollView contentContainerStyle={{ padding: 16, gap: 12, paddingBottom: 40 }} refreshControl={<RefreshControl refreshing={yenileniyor} onRefresh={yenile} tintColor={renk.birincil} />}>
      <SayfaBasligi baslik="İlgilendiğim İlanlar" aciklama="Mesaj gönderdiğin becayiş ilanları ve o ilanlarla ilgili konuşmaların." />
      {veri.talepler.length === 0 && (
        <View style={{ gap: 12 }}>
          <Bos metin="Henüz bir ilana mesaj göndermedin. Becayiş ilanlarını incelemek için İlanlar sekmesindeki Becayiş İlanları'na göz atabilirsin." />
          <Buton tur="cerceve" etiket="Becayiş İlanları" onPress={() => router.navigate("/ilanlar")} />
        </View>
      )}
      {veri.talepler.map((t) => (
        <SohbetPaneli
          key={t.id}
          baslik={
            <View style={{ gap: 2 }}>
              <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
                <T w="yariKalin" style={{ flexShrink: 1, fontSize: 15 }}>
                  {t.meslek}
                </T>
                {!t.isActive && (
                  <View style={{ backgroundColor: "#e2e8f0", borderRadius: 999, paddingHorizontal: 8, paddingVertical: 2 }}>
                    <T style={{ fontSize: 11, color: "#475569" }}>Pasif</T>
                  </View>
                )}
              </View>
              <T style={{ fontSize: 12, color: renk.soluk }}>İlan sahibi: {t.ilanSahibiAdSoyad}</T>
              <View style={{ flexDirection: "row", alignItems: "center", gap: 4 }}>
                <MapPin size={12} color={renk.soluk} />
                <T style={{ flexShrink: 1, fontSize: 12, color: renk.soluk }}>
                  {konumYazi(t)} → {t.istenenIller.join(", ")}
                </T>
              </View>
            </View>
          }
          okunmamis={t.okunmamisSayisi}
          mesajlar={t.mesajlar}
          benimId={benim}
          okundu={() => api("/api/becayis/mesaj/okundu", { govde: { talepId: t.id, karsiId: benim } })}
          gonder={(mesaj) => api("/api/becayis/mesaj", { govde: { talepId: t.id, mesaj } })}
          silAciklama="Bu ilana ait sohbetin kalıcı olarak silinecek. Bu işlem geri alınamaz."
          sil={() => api("/api/becayis/mesaj", { method: "DELETE", govde: { talepId: t.id, konusmaKarsiId: benim } })}
          degisti={() => yenile(false)}
        />
      ))}
    </ScrollView>
  );
}

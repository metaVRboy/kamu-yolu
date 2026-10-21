import { RefreshControl, ScrollView, View } from "react-native";
import { Award, Lock } from "lucide-react-native";
import { HataKutusu, SayfaBasligi, T, Yukleniyor } from "@/bilesenler/ui";
import { GirisDaveti } from "@/bilesenler/GirisDaveti";
import { yukseltmeAc } from "@/bilesenler/KilitliOzellik";
import { ROZET_RENGI } from "@/bilesenler/UyeKartlari";
import { useVeri } from "@/lib/api";
import { useOturum } from "@/lib/oturum";
import { renk } from "@/lib/tema";
import type { RozetRengi } from "@/lib/tipler";

type Veri = { plan: string; rozetler: { id: string; ad: string; aciklama: string; renk: RozetRengi; kazanildi: boolean }[] };

/** Sitedeki /profilim/rozetler: rozetler deneme, gunun sorulari ve profil etkinliginden kendiliginden gelir. */
export default function Rozetler() {
  const { kullanici } = useOturum();
  const { veri, hata, yenileniyor, yenile } = useVeri<Veri>(kullanici ? `/api/mobil/rozetler?u=${kullanici.id}` : null);
  if (kullanici === undefined) return <Yukleniyor />;
  if (!kullanici) return <GirisDaveti />;
  if (hata && !veri) return <HataKutusu mesaj={hata} tekrar={yenile} />;
  if (!veri) return <Yukleniyor />;
  const kazanilan = veri.rozetler.filter((r) => r.kazanildi).length;

  return (
    <ScrollView contentContainerStyle={{ padding: 16, gap: 10, paddingBottom: 40 }} refreshControl={<RefreshControl refreshing={yenileniyor} onRefresh={yenile} tintColor={renk.birincil} />}>
      <SayfaBasligi
        baslik="Rozetlerim"
        aciklama={`${veri.rozetler.length} rozetten ${kazanilan} tanesini kazandın. Rozetler deneme, günün soruları ve profil etkinliğinden kendiliğinden gelir.`}
      />
      {veri.rozetler.map((r) => (
        <View
          key={r.id}
          style={{
            flexDirection: "row",
            gap: 12,
            borderRadius: 16,
            borderWidth: 1,
            padding: 14,
            ...(r.kazanildi ? { borderColor: renk.birincilKenar, backgroundColor: "#fff" } : { borderStyle: "dashed", borderColor: "#e2e8f0", backgroundColor: "#f8fafc" }),
          }}
        >
          <View style={{ width: 40, height: 40, borderRadius: 20, alignItems: "center", justifyContent: "center", backgroundColor: r.kazanildi ? ROZET_RENGI[r.renk].zemin : "#e2e8f0" }}>
            {r.kazanildi ? <Award size={20} color={ROZET_RENGI[r.renk].yazi} /> : <Lock size={16} color="#64748b" />}
          </View>
          <View style={{ flex: 1 }}>
            <T w="yariKalin" style={{ color: r.kazanildi ? renk.yazi : "#64748b" }} accessibilityLabel={`${r.ad}${r.kazanildi ? " (kazanıldı)" : " (henüz kazanılmadı)"}`}>
              {r.ad}
            </T>
            <T style={{ fontSize: 13, color: renk.soluk }}>{r.aciklama}</T>
            {r.id === "pro" && !r.kazanildi && (
              <T w="yariKalin" style={{ marginTop: 4, fontSize: 13, color: renk.birincil }} onPress={() => yukseltmeAc("PRO", "genel")}>
                Pro&apos;ya geç
              </T>
            )}
          </View>
        </View>
      ))}
    </ScrollView>
  );
}

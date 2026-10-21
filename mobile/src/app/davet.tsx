import { Pressable, RefreshControl, ScrollView, Share, View } from "react-native";
import { Share2 } from "lucide-react-native";
import { HataKutusu, Kart, SayfaBasligi, T, Yukleniyor } from "@/bilesenler/ui";
import { GirisDaveti } from "@/bilesenler/GirisDaveti";
import { useVeri } from "@/lib/api";
import { useOturum } from "@/lib/oturum";
import { renk } from "@/lib/tema";

type Davet = { link: string; katilan: number; odul: number; kazanilanGun: number; kalanOdul: number };

/** Sitedeki /profilim/davet: davet linki (paylas), sonuclar ve kurallar. */
export default function DavetEkrani() {
  const { kullanici } = useOturum();
  const { veri: d, hata, yenileniyor, yenile } = useVeri<Davet>(kullanici ? `/api/davet?u=${kullanici.id}` : null);
  if (kullanici === undefined) return <Yukleniyor />;
  if (!kullanici) return <GirisDaveti />;
  if (hata && !d) return <HataKutusu mesaj={hata} tekrar={yenile} />;
  if (!d) return <Yukleniyor />;
  const paylas = () => Share.share({ message: `Bölümüne uygun kamu ilanlarını ve günlük KPSS sorularını Kamu Yolu'nda bul:\n${d.link}` }).catch(() => {});

  return (
    <ScrollView contentContainerStyle={{ padding: 16, gap: 16, paddingBottom: 40 }} refreshControl={<RefreshControl refreshing={yenileniyor} onRefresh={yenile} tintColor={renk.birincil} />}>
      <SayfaBasligi baslik="Arkadaşını Davet Et" aciklama="Davet ettiğin her arkadaşın için ikinize de 1 hafta Pro." />
      <View style={{ borderRadius: 24, backgroundColor: "#1e293b", padding: 20, gap: 12 }}>
        <T w="kalin" style={{ color: "#fff", fontSize: 17 }}>
          Davet linkin
        </T>
        <T style={{ color: "#cbd5e1", lineHeight: 20 }}>Arkadaşın bu linkle üye olup bölümünü seçince ikinize de 1 hafta Pro tanımlanır.</T>
        <View style={{ borderRadius: 12, backgroundColor: "rgba(255,255,255,0.1)", paddingHorizontal: 14, paddingVertical: 11 }}>
          <T selectable style={{ color: "#fff", fontSize: 13 }}>
            {d.link}
          </T>
        </View>
        <Pressable onPress={paylas} style={({ pressed }) => [{ flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, borderRadius: 12, backgroundColor: "#fff", paddingVertical: 12 }, pressed && { opacity: 0.85 }]}>
          <Share2 size={16} color={renk.yazi} />
          <T w="kalin">Linki paylaş</T>
        </Pressable>
      </View>

      <View style={{ flexDirection: "row", gap: 10 }}>
        {[
          { ad: "Linkle üye olan", deger: String(d.katilan) },
          { ad: "Kazandığın Pro", deger: `${d.kazanilanGun} gün` },
          { ad: "Kalan ödül hakkı", deger: String(d.kalanOdul) },
        ].map((x) => (
          <Kart key={x.ad} style={{ flex: 1, padding: 12, alignItems: "center" }} yaricap={16}>
            <T w="kalin" style={{ fontSize: 20, color: renk.birincil }}>
              {x.deger}
            </T>
            <T style={{ fontSize: 11, color: renk.soluk, textAlign: "center" }}>{x.ad}</T>
          </Kart>
        ))}
      </View>

      <Kart style={{ padding: 18, gap: 8 }} yaricap={16}>
        <T w="yariKalin">Nasıl çalışır?</T>
        {[
          "Arkadaşın linkine tıklayıp 30 gün içinde e-posta ya da Google ile üye olur.",
          "Profilinde bölümünü seçince ikinize de 1 hafta Pro tanımlanır; zaten Pro iseniz süreniz uzar.",
          "Bir üye davetle en fazla 10 kez ödül kazanabilir.",
        ].map((m) => (
          <View key={m} style={{ flexDirection: "row", gap: 8 }}>
            <T style={{ color: renk.birincil }}>•</T>
            <T style={{ flex: 1, color: "#334155", lineHeight: 20 }}>{m}</T>
          </View>
        ))}
      </Kart>
    </ScrollView>
  );
}

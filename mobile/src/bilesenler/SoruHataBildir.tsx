import { useState } from "react";
import { Pressable, TextInput, View } from "react-native";
import { Flag } from "lucide-react-native";
import { Buton, T } from "@/bilesenler/ui";
import { api } from "@/lib/api";
import { renk, yazi } from "@/lib/tema";

/** Sitedeki SoruHataBildir: cozum ekraninda "Bu soruda hata var" (POST /api/kpss-denemesi/hata). */
export function SoruHataBildir({ soruId }: { soruId: string }) {
  const [acik, setAcik] = useState(false);
  const [aciklama, setAciklama] = useState("");
  const [gonderiliyor, setGonderiliyor] = useState(false);
  const [gonderildi, setGonderildi] = useState(false);
  const [hata, setHata] = useState<string | null>(null);

  if (gonderildi) return <T style={{ marginTop: 12, fontSize: 12, color: "#047857" }}>Bildirimin alındı, teşekkürler! Soruyu inceleyip düzelteceğiz.</T>;
  if (!acik) {
    return (
      <Pressable onPress={() => setAcik(true)} style={{ marginTop: 12, flexDirection: "row", alignItems: "center", gap: 4, alignSelf: "flex-start" }} hitSlop={6}>
        <Flag size={14} color={renk.soluk} />
        <T style={{ fontSize: 12, color: renk.soluk }}>Bu soruda hata var</T>
      </Pressable>
    );
  }
  return (
    <View style={{ marginTop: 12, gap: 8, borderWidth: 1, borderColor: "rgba(36,102,195,0.1)", borderRadius: 12, padding: 12 }}>
      <TextInput
        value={aciklama}
        onChangeText={setAciklama}
        multiline
        maxLength={1000}
        placeholder="Ne hatalı? Örn: doğru cevap B olmalı, çünkü…"
        placeholderTextColor={renk.soluk}
        style={{ minHeight: 60, borderWidth: 1, borderColor: "rgba(36,102,195,0.15)", borderRadius: 8, padding: 10, fontFamily: yazi.normal, fontSize: 14, textAlignVertical: "top" }}
      />
      {!!hata && <T style={{ fontSize: 12, color: renk.hata }}>{hata}</T>}
      <View style={{ flexDirection: "row", justifyContent: "flex-end", gap: 8 }}>
        <Buton tur="cerceve" etiket="Vazgeç" onPress={() => setAcik(false)} style={{ paddingVertical: 8 }} />
        <Buton
          etiket="Gönder"
          yukleniyor={gonderiliyor}
          devreDisi={aciklama.trim().length < 5}
          style={{ paddingVertical: 8 }}
          onPress={async () => {
            setGonderiliyor(true);
            setHata(null);
            try {
              await api("/api/kpss-denemesi/hata", { govde: { soruId, aciklama } });
              setGonderildi(true);
            } catch (e) {
              setHata(e instanceof Error ? e.message : "Gönderilemedi.");
            } finally {
              setGonderiliyor(false);
            }
          }}
        />
      </View>
    </View>
  );
}

import { useState } from "react";
import { Pressable, StyleSheet, View } from "react-native";
import { T } from "@/bilesenler/ui";
import { IlanListesi } from "@/bilesenler/IlanListesi";
import { BecayisListesi } from "@/bilesenler/Becayis";
import { renk } from "@/lib/tema";

/** Sitedeki "Ilanlar" menusu: Kamu Alim Ilanlari ve Becayis Ilanlari. */
export default function TumIlanlar() {
  const [becayis, setBecayis] = useState(false);
  return (
    <View style={{ flex: 1 }}>
      <View style={s.anahtar}>
        {["Kamu Alım İlanları", "Becayiş İlanları"].map((etiket, i) => {
          const aktif = becayis === (i === 1);
          return (
            <Pressable key={etiket} onPress={() => setBecayis(i === 1)} style={[s.secenek, aktif && s.aktif]}>
              <T w="yariKalin" style={{ fontSize: 13, color: aktif ? renk.birincil : renk.yaziIkincil }}>
                {etiket}
              </T>
            </Pressable>
          );
        })}
      </View>
      {becayis ? <BecayisListesi /> : <IlanListesi kapsam="tum" />}
    </View>
  );
}

const s = StyleSheet.create({
  anahtar: { flexDirection: "row", gap: 4, margin: 16, marginBottom: 0, padding: 4, borderRadius: 999, backgroundColor: "#fff", borderWidth: 1, borderColor: renk.birincilKenar },
  secenek: { flex: 1, alignItems: "center", borderRadius: 999, paddingVertical: 9 },
  aktif: { backgroundColor: renk.birincilZemin },
});

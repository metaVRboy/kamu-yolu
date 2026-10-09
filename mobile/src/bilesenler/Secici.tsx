import { useState } from "react";
import { FlatList, Modal, Pressable, StyleSheet, TextInput, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Check, ChevronDown, Search } from "lucide-react-native";
import { T } from "@/bilesenler/ui";
import { renk, yazi } from "@/lib/tema";

/**
 * Sitedeki <select> alani: dokununca alttan secenek listesi acilir (uzun listede arama kutusu).
 * coklu verilirse onay kutulu coklu secim (secilen tekrar dokununca kalkar).
 */
export function Secici({
  etiket,
  zorunlu = false,
  deger,
  secenekler,
  sec,
  yerTutucu = "Seçiniz",
  devreDisi = false,
  coklu,
}: {
  etiket: string;
  zorunlu?: boolean;
  deger: string;
  secenekler: readonly string[];
  sec: (v: string) => void;
  yerTutucu?: string;
  devreDisi?: boolean;
  coklu?: string[];
}) {
  const [acik, setAcik] = useState(false);
  const [arama, setArama] = useState("");
  const alt = useSafeAreaInsets().bottom;
  const q = arama.trim().toLocaleLowerCase("tr");
  const liste = q ? secenekler.filter((x) => x.toLocaleLowerCase("tr").includes(q)) : secenekler;

  function kapat() {
    setAcik(false);
    setArama("");
  }

  return (
    <View>
      <T w="orta" style={{ marginBottom: 6 }}>
        {zorunlu && <T style={{ color: renk.hata }}>* </T>}
        {etiket}
      </T>
      <Pressable onPress={() => setAcik(true)} disabled={devreDisi} style={[s.kutu, devreDisi && { opacity: 0.5 }]}>
        <T numberOfLines={1} style={{ flex: 1, fontSize: 15, color: deger ? renk.yazi : renk.soluk }}>
          {deger || yerTutucu}
        </T>
        <ChevronDown size={18} color={renk.soluk} />
      </Pressable>
      <Modal visible={acik} transparent animationType="slide" onRequestClose={kapat}>
        <Pressable style={s.perde} onPress={kapat} />
        <View style={[s.sayfa, { paddingBottom: alt + 12 }]}>
          <View style={s.tutamac} />
          <T w="yariKalin" style={{ paddingHorizontal: 16, paddingBottom: 8, fontSize: 16 }}>
            {etiket}
          </T>
          {secenekler.length > 12 && (
            <View style={s.arama}>
              <Search size={16} color={renk.soluk} />
              <TextInput value={arama} onChangeText={setArama} placeholder="Ara" placeholderTextColor={renk.soluk} style={s.aramaGirdi} />
            </View>
          )}
          <FlatList
            style={{ maxHeight: 440 }}
            data={liste}
            keyExtractor={(x) => x}
            keyboardShouldPersistTaps="handled"
            renderItem={({ item }) => {
              const aktif = coklu ? coklu.includes(item) : item === deger;
              return (
                <Pressable
                  onPress={() => {
                    sec(item);
                    if (!coklu) kapat();
                  }}
                  style={({ pressed }) => [s.satir, pressed && { backgroundColor: renk.birincilZemin }]}
                >
                  <T w={aktif ? "yariKalin" : "normal"} style={{ flex: 1, fontSize: 15, color: aktif ? renk.birincil : renk.yazi }}>
                    {item}
                  </T>
                  {aktif && <Check size={18} color={renk.birincil} />}
                </Pressable>
              );
            }}
          />
          {coklu && (
            <Pressable onPress={kapat} style={s.tamam}>
              <T w="yariKalin" style={{ color: "#fff" }}>
                Tamam ({coklu.length})
              </T>
            </Pressable>
          )}
        </View>
      </Modal>
    </View>
  );
}

const s = StyleSheet.create({
  kutu: { flexDirection: "row", alignItems: "center", gap: 8, borderWidth: 1, borderColor: "rgba(36,102,195,0.2)", borderRadius: 12, backgroundColor: "#fff", paddingHorizontal: 14, paddingVertical: 13 },
  perde: { flex: 1, backgroundColor: "rgba(15,23,42,0.4)" },
  sayfa: { backgroundColor: "#fff", borderTopLeftRadius: 24, borderTopRightRadius: 24, paddingTop: 8, paddingHorizontal: 8 },
  tutamac: { alignSelf: "center", width: 40, height: 4, borderRadius: 2, backgroundColor: renk.kenar, marginBottom: 8 },
  arama: { flexDirection: "row", alignItems: "center", gap: 8, marginHorizontal: 8, marginBottom: 6, borderWidth: 1, borderColor: renk.kenar, borderRadius: 12, paddingHorizontal: 12 },
  aramaGirdi: { flex: 1, fontFamily: yazi.normal, fontSize: 15, color: renk.yazi, paddingVertical: 10 },
  satir: { flexDirection: "row", alignItems: "center", paddingHorizontal: 16, paddingVertical: 14, borderRadius: 12 },
  tamam: { margin: 8, alignItems: "center", backgroundColor: renk.birincil, borderRadius: 999, paddingVertical: 13 },
});

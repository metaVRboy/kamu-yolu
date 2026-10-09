import { useMemo, useState } from "react";
import { Keyboard, Pressable, StyleSheet, TextInput, View } from "react-native";
import { router } from "expo-router";
import { Search } from "lucide-react-native";
import { T } from "@/bilesenler/ui";
import { renk, yazi } from "@/lib/tema";
import { DUZEY_ADI } from "@/lib/bicim";
import type { BolumSecenegi } from "@/lib/tipler";

const kucuk = (m: string) => m.trim().toLocaleLowerCase("tr-TR");

/** Sitedeki DepartmentSearch: yazdikca oneriler, secince bolumun ilan sayfasi. */
export function BolumArama({ bolumler }: { bolumler: BolumSecenegi[] }) {
  const [sorgu, setSorgu] = useState("");
  const [acik, setAcik] = useState(false);

  const oneriler = useMemo(() => {
    const q = kucuk(sorgu);
    return q ? bolumler.filter((b) => kucuk(b.ad).includes(q)).slice(0, 30) : bolumler.slice(0, 30);
  }, [sorgu, bolumler]);

  function git(b: BolumSecenegi) {
    Keyboard.dismiss();
    setAcik(false);
    setSorgu(b.ad);
    router.push({ pathname: "/liste", params: { kapsam: "bolum", deger: b.slug } });
  }

  function ara() {
    const q = kucuk(sorgu);
    if (!q) return;
    const hedef = bolumler.find((b) => kucuk(b.ad) === q) ?? oneriler[0];
    if (hedef) git(hedef);
  }

  return (
    <View style={{ width: "100%" }}>
      <View style={{ flexDirection: "row", gap: 8 }}>
        <View style={s.girdiKutu}>
          <Search size={16} color={renk.soluk} />
          <TextInput
            value={sorgu}
            onChangeText={(t) => {
              setSorgu(t);
              setAcik(true);
            }}
            onFocus={() => setAcik(true)}
            onSubmitEditing={ara}
            returnKeyType="search"
            placeholder="Bölümünü yaz (ör. Bilgisayar Mühendisliği)"
            placeholderTextColor={renk.soluk}
            style={s.girdi}
          />
        </View>
        <Pressable onPress={ara} style={[s.araButon, !sorgu.trim() && { opacity: 0.5 }]} disabled={!sorgu.trim()}>
          <Search size={18} color="#fff" />
        </Pressable>
      </View>

      {acik && (
        <View style={s.liste}>
          {oneriler.length === 0 ? (
            <T style={{ padding: 12, color: renk.soluk, fontSize: 13 }}>Bu isimde bir bölüm bulunamadı.</T>
          ) : (
            oneriler.map((b) => (
              <Pressable key={b.slug} onPress={() => git(b)} style={({ pressed }) => [s.oneri, pressed && { backgroundColor: renk.birincilZemin }]}>
                <T style={{ flex: 1 }}>{b.ad}</T>
                <View style={s.duzey}>
                  <T style={{ fontSize: 11, color: renk.birincil }}>{DUZEY_ADI[b.duzey] ?? b.duzey}</T>
                </View>
                <View style={s.sayi}>
                  <T w="yariKalin" style={{ fontSize: 11, color: "#fff" }}>
                    {b.ilanSayisi}
                  </T>
                </View>
              </Pressable>
            ))
          )}
        </View>
      )}
    </View>
  );
}

const s = StyleSheet.create({
  girdiKutu: { flex: 1, flexDirection: "row", alignItems: "center", gap: 8, height: 48, borderRadius: 16, borderWidth: 1, borderColor: "rgba(36,102,195,0.2)", backgroundColor: "#fff", paddingHorizontal: 14 },
  girdi: { flex: 1, fontFamily: yazi.normal, fontSize: 14, color: renk.yazi },
  araButon: { width: 48, height: 48, borderRadius: 16, backgroundColor: renk.birincil, alignItems: "center", justifyContent: "center" },
  liste: { marginTop: 8, maxHeight: 320, borderRadius: 16, borderWidth: 1, borderColor: "rgba(36,102,195,0.15)", backgroundColor: "#fff", padding: 4, overflow: "hidden" },
  oneri: { flexDirection: "row", alignItems: "center", gap: 6, paddingHorizontal: 12, paddingVertical: 10, borderRadius: 12 },
  duzey: { borderRadius: 999, backgroundColor: renk.birincilZemin, paddingHorizontal: 8, paddingVertical: 2 },
  sayi: { minWidth: 20, height: 20, borderRadius: 10, backgroundColor: renk.birincil, alignItems: "center", justifyContent: "center", paddingHorizontal: 6 },
});

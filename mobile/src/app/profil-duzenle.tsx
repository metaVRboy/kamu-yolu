import { useMemo, useState } from "react";
import { FlatList, Modal, Pressable, ScrollView, StyleSheet, TextInput, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { router } from "expo-router";
import { Check, ChevronDown, Search, X } from "lucide-react-native";
import { Buton, Girdi, Kart, T, Yukleniyor } from "@/bilesenler/ui";
import { api, useVeri } from "@/lib/api";
import { useOturum } from "@/lib/oturum";
import { DUZEY_ADI } from "@/lib/bicim";
import { renk, yazi } from "@/lib/tema";
import type { ProfilVeri } from "@/lib/tipler";

type Bolum = { id: string; ad: string; duzey: string };
const DUZEYLER = ["LISE", "ONLISANS", "LISANS", "YUKSEK_LISANS"];

/** Sitedeki profil formunun bolum/duzey/ad kismi (PATCH /api/profil). */
export default function ProfilDuzenle() {
  const { kullanici } = useOturum();
  const { veri } = useVeri<ProfilVeri>(kullanici ? `/api/mobil/profil?u=${kullanici.id}` : null);
  const { veri: bolumler } = useVeri<Bolum[]>("/api/mobil/bolumler");
  if (!veri?.kullanici || !bolumler) return <Yukleniyor />;
  return <Form k={veri.kullanici} bolumler={bolumler} />;
}

function Form({ k, bolumler }: { k: NonNullable<ProfilVeri["kullanici"]>; bolumler: Bolum[] }) {
  const { yenile: oturumuYenile } = useOturum();
  const [adSoyad, setAdSoyad] = useState(k.adSoyad);
  const [bolumId, setBolumId] = useState<string | null>(k.bolum?.id ?? null);
  const [duzey, setDuzey] = useState<string | null>(k.duzey);
  const [secici, setSecici] = useState(false);
  const [hata, setHata] = useState<string | null>(null);
  const [kaydediliyor, setKaydediliyor] = useState(false);
  const secilenBolum = bolumler.find((b) => b.id === bolumId);

  async function kaydet() {
    setKaydediliyor(true);
    setHata(null);
    try {
      await api("/api/profil", { method: "PATCH", govde: { adSoyad, departmentId: bolumId, educationLevel: duzey } });
      await oturumuYenile();
      router.back();
    } catch (e) {
      setHata(e instanceof Error ? e.message : "Kaydedilemedi.");
    } finally {
      setKaydediliyor(false);
    }
  }

  return (
    <ScrollView contentContainerStyle={{ padding: 16 }} keyboardShouldPersistTaps="handled">
      <Kart style={{ padding: 20, gap: 18 }}>
        <Girdi etiket="Ad Soyad" value={adSoyad} onChangeText={setAdSoyad} />
        <View>
          <T w="orta" style={{ marginBottom: 6 }}>
            Bölüm
          </T>
          <Pressable onPress={() => setSecici(true)} style={s.secici}>
            <T style={{ flex: 1, color: secilenBolum ? renk.yazi : renk.soluk }}>{secilenBolum?.ad ?? "Bölümünü seç"}</T>
            <ChevronDown size={18} color={renk.soluk} />
          </Pressable>
          {secilenBolum && (
            <T w="orta" style={{ marginTop: 6, fontSize: 12, color: renk.soluk }} onPress={() => setBolumId(null)}>
              Bölümü kaldır
            </T>
          )}
        </View>
        <View>
          <T w="orta" style={{ marginBottom: 8 }}>
            Öğrenim düzeyi
          </T>
          <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
            {DUZEYLER.map((d) => (
              <Pressable key={d} onPress={() => setDuzey(duzey === d ? null : d)} style={[s.duzey, duzey === d && { backgroundColor: renk.birincil, borderColor: renk.birincil }]}>
                <T w="orta" style={{ color: duzey === d ? "#fff" : renk.yazi }}>
                  {DUZEY_ADI[d]}
                </T>
              </Pressable>
            ))}
          </View>
        </View>
        {!!hata && <T style={{ color: renk.hata }}>{hata}</T>}
        <Buton etiket="Kaydet" onPress={kaydet} yukleniyor={kaydediliyor} devreDisi={adSoyad.trim().length < 2} />
      </Kart>
      <BolumSecici
        acik={secici}
        bolumler={bolumler}
        secili={bolumId}
        kapat={() => setSecici(false)}
        sec={(b) => {
          setBolumId(b.id);
          // Bolumun duzeyi profilde yoksa onu da doldur.
          if (!duzey) setDuzey(b.duzey);
          setSecici(false);
        }}
      />
    </ScrollView>
  );
}

function BolumSecici({ acik, bolumler, secili, kapat, sec }: { acik: boolean; bolumler: Bolum[]; secili: string | null; kapat: () => void; sec: (b: Bolum) => void }) {
  const [q, setQ] = useState("");
  const ust = useSafeAreaInsets().top;
  const liste = useMemo(() => {
    const k = q.trim().toLocaleLowerCase("tr-TR");
    return k ? bolumler.filter((b) => b.ad.toLocaleLowerCase("tr-TR").includes(k)) : bolumler;
  }, [q, bolumler]);
  return (
    <Modal visible={acik} animationType="slide" onRequestClose={kapat} presentationStyle="pageSheet">
      <View style={{ flex: 1, backgroundColor: "#fff", paddingTop: ust > 30 ? 12 : ust }}>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 10, padding: 16 }}>
          <View style={s.ara}>
            <Search size={16} color={renk.soluk} />
            <TextInput value={q} onChangeText={setQ} placeholder="Bölüm ara" placeholderTextColor={renk.soluk} style={{ flex: 1, fontFamily: yazi.normal, fontSize: 15, paddingVertical: 10 }} autoFocus />
          </View>
          <Pressable onPress={kapat} hitSlop={10}>
            <X size={22} color={renk.yazi} />
          </Pressable>
        </View>
        <FlatList
          data={liste}
          keyExtractor={(b) => b.id}
          keyboardShouldPersistTaps="handled"
          renderItem={({ item }) => (
            <Pressable onPress={() => sec(item)} style={({ pressed }) => [s.satir, pressed && { backgroundColor: renk.birincilZemin }]}>
              <T style={{ flex: 1 }}>{item.ad}</T>
              <T style={{ fontSize: 12, color: renk.soluk }}>{DUZEY_ADI[item.duzey]}</T>
              {item.id === secili && <Check size={18} color={renk.birincil} />}
            </Pressable>
          )}
        />
      </View>
    </Modal>
  );
}

const s = StyleSheet.create({
  secici: { flexDirection: "row", alignItems: "center", borderWidth: 1, borderColor: "rgba(36,102,195,0.2)", borderRadius: 12, paddingHorizontal: 14, paddingVertical: 13 },
  duzey: { borderWidth: 1, borderColor: "rgba(36,102,195,0.2)", borderRadius: 999, paddingHorizontal: 14, paddingVertical: 8 },
  ara: { flex: 1, flexDirection: "row", alignItems: "center", gap: 8, borderWidth: 1, borderColor: renk.kenar, borderRadius: 12, paddingHorizontal: 12 },
  satir: { flexDirection: "row", alignItems: "center", gap: 10, paddingHorizontal: 20, paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: "#f1f5f9" },
});

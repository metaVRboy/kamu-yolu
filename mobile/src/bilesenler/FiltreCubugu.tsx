import { useState } from "react";
import { Modal, Pressable, ScrollView, StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Check, ChevronDown, X } from "lucide-react-native";
import { T } from "@/bilesenler/ui";
import { renk } from "@/lib/tema";
import type { IlanListesiVeri } from "@/lib/tipler";

export type Filtre = { bolumSarti?: string; kurum?: string; ilanTuru?: string; il?: string };
type Secenek = { deger: string; ad: string };

/**
 * Sitedeki FilterBar: bolum sarti, kurum turu, ilan turu, il. Her biri telefonda
 * alttan acilan bir secim listesi; birden az secenek varsa (sitedeki gibi) gizli.
 */
export function FiltreCubugu({ secenekler, filtre, degistir }: { secenekler: IlanListesiVeri["filtreler"]; filtre: Filtre; degistir: (f: Filtre) => void }) {
  const [acik, setAcik] = useState<keyof Filtre | null>(null);
  const alanlar: { anahtar: keyof Filtre; tumu: string; secenekler: Secenek[] }[] = [
    { anahtar: "bolumSarti", tumu: "Bölüm Şartı: Tümü", secenekler: [{ deger: "var", ad: "Bölüm Şartı: Var" }, { deger: "yok", ad: "Bölüm Şartı: Yok" }] },
    ...(secenekler.kurumTurleri.length > 1 ? [{ anahtar: "kurum" as const, tumu: "Tüm kurum türleri", secenekler: secenekler.kurumTurleri }] : []),
    ...(secenekler.ilanTurleri.length > 1 ? [{ anahtar: "ilanTuru" as const, tumu: "Tüm ilan türleri", secenekler: secenekler.ilanTurleri.map((t) => ({ deger: t, ad: t })) }] : []),
    ...(secenekler.iller.length > 1 ? [{ anahtar: "il" as const, tumu: "Tüm iller", secenekler: secenekler.iller.map((t) => ({ deger: t, ad: t })) }] : []),
  ];
  const aktifAlan = alanlar.find((a) => a.anahtar === acik);
  const filtreVar = Object.values(filtre).some(Boolean);

  return (
    <View>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8, paddingVertical: 2 }}>
        {alanlar.map((a) => {
          const secili = a.secenekler.find((x) => x.deger === filtre[a.anahtar]);
          return (
            <Pressable key={a.anahtar} onPress={() => setAcik(a.anahtar)} style={[s.secici, secili && s.seciciAktif]}>
              <T w="orta" style={{ color: secili ? "#fff" : renk.yazi }}>
                {secili?.ad ?? a.tumu}
              </T>
              <ChevronDown size={16} color={secili ? "#fff" : renk.soluk} />
            </Pressable>
          );
        })}
        {filtreVar && (
          <Pressable onPress={() => degistir({})} style={[s.secici, { borderColor: "transparent" }]}>
            <X size={14} color={renk.soluk} />
            <T w="orta" style={{ color: renk.soluk }}>
              Filtreleri temizle
            </T>
          </Pressable>
        )}
      </ScrollView>

      <SecimListesi
        alan={aktifAlan}
        secili={acik ? filtre[acik] : undefined}
        kapat={() => setAcik(null)}
        sec={(deger) => {
          if (acik) degistir({ ...filtre, [acik]: deger });
          setAcik(null);
        }}
      />
    </View>
  );
}

function SecimListesi({
  alan,
  secili,
  kapat,
  sec,
}: {
  alan?: { tumu: string; secenekler: Secenek[] };
  secili?: string;
  kapat: () => void;
  sec: (deger: string | undefined) => void;
}) {
  const alt = useSafeAreaInsets().bottom;
  return (
    <Modal visible={!!alan} transparent animationType="slide" onRequestClose={kapat}>
      <Pressable style={s.perde} onPress={kapat} />
      <View style={[s.sayfa, { paddingBottom: alt + 12 }]}>
        <View style={s.tutamac} />
        <ScrollView style={{ maxHeight: 420 }}>
          {alan &&
            [{ deger: undefined, ad: alan.tumu }, ...alan.secenekler].map((x) => {
              const aktif = x.deger === secili;
              return (
                <Pressable key={x.deger ?? "__tumu"} onPress={() => sec(x.deger)} style={({ pressed }) => [s.satir, pressed && { backgroundColor: renk.birincilZemin }]}>
                  <T w={aktif ? "yariKalin" : "normal"} style={{ flex: 1, fontSize: 15, color: aktif ? renk.birincil : renk.yazi }}>
                    {x.ad}
                  </T>
                  {aktif && <Check size={18} color={renk.birincil} />}
                </Pressable>
              );
            })}
        </ScrollView>
      </View>
    </Modal>
  );
}

const s = StyleSheet.create({
  secici: { flexDirection: "row", alignItems: "center", gap: 6, borderRadius: 999, borderWidth: 1, borderColor: "rgba(36,102,195,0.2)", backgroundColor: "#fff", paddingHorizontal: 14, paddingVertical: 9 },
  seciciAktif: { backgroundColor: renk.birincil, borderColor: renk.birincil },
  perde: { flex: 1, backgroundColor: "rgba(15,23,42,0.4)" },
  sayfa: { backgroundColor: "#fff", borderTopLeftRadius: 24, borderTopRightRadius: 24, paddingTop: 8, paddingHorizontal: 8 },
  tutamac: { alignSelf: "center", width: 40, height: 4, borderRadius: 2, backgroundColor: renk.kenar, marginBottom: 8 },
  satir: { flexDirection: "row", alignItems: "center", paddingHorizontal: 16, paddingVertical: 14, borderRadius: 12 },
});

import { Modal, Pressable, ScrollView, StyleSheet, View } from "react-native";
import { SvgXml } from "react-native-svg";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { X } from "lucide-react-native";
import { T } from "@/bilesenler/ui";
import { KesirliMetin } from "@/bilesenler/KesirliMetin";
import { DERS_DAGILIMI, DERS_LABEL, DERS_RENGI, DERS_SIRASI, soruMetniNumarali, type ExamSoru } from "@/lib/kpss";
import { renk } from "@/lib/tema";

/** Sitedeki SoruGovdesi: ortak metin basligi + numarali soru metni + SVG sekil. */
export function SoruGovdesi({ sorular, index }: { sorular: ExamSoru[]; index: number }) {
  const soru = sorular[index];
  const ayniGrup = (s: ExamSoru) => s.grupId === soru.grupId;
  return (
    <View style={{ marginTop: 12, gap: 12 }}>
      {!!soru.grupId && (
        <T w="yariKalin" style={{ color: renk.birincil }}>
          {sorular.findIndex(ayniGrup) + 1}-{sorular.findLastIndex(ayniGrup) + 1}. soruları aşağıdaki {soru.ders === "MATEMATIK" ? "bilgiye" : "parçaya"} göre cevaplayınız.
        </T>
      )}
      <KesirliMetin w="orta" metin={soru.grupId ? soruMetniNumarali(soru.soruMetni, index + 1) : soru.soruMetni} style={{ fontSize: 16, lineHeight: 25 }} />
      {!!soru.gorselSvg && (
        <View style={{ alignItems: "center" }}>
          <SvgXml xml={soru.gorselSvg} width="100%" height={240} />
        </View>
      )}
    </View>
  );
}

/**
 * Sitedeki SoruHaritasi: derse gore gruplanmis numara izgarasi (geometri ayri grup).
 * Telefonda alttan acilan tam sayfa olarak gosterilir.
 */
export function SoruHaritasi({
  acik,
  kapat,
  sorular,
  aktifIndex,
  sec,
  kutuStili,
  aciklamalar,
}: {
  acik: boolean;
  kapat: () => void;
  sorular: ExamSoru[];
  aktifIndex: number;
  sec: (i: number) => void;
  kutuStili: (i: number) => { zemin: string; yazi: string; kenar?: string };
  aciklamalar: { etiket: string; zemin: string; kenar?: string }[];
}) {
  const alt = useSafeAreaInsets().bottom;
  const gruplar: { ad: string; indeksler: number[] }[] = [];
  sorular.forEach((s, i) => {
    const ad = s.geometri ? "Geometri" : DERS_LABEL[s.ders];
    const son = gruplar.at(-1);
    if (son?.ad === ad) son.indeksler.push(i);
    else gruplar.push({ ad, indeksler: [i] });
  });
  return (
    <Modal visible={acik} transparent animationType="slide" onRequestClose={kapat}>
      <Pressable style={{ flex: 1, backgroundColor: "rgba(15,23,42,0.4)" }} onPress={kapat} />
      <View style={[s.sayfa, { paddingBottom: alt + 12 }]}>
        <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 16, paddingVertical: 12 }}>
          <T w="yariKalin" style={{ fontSize: 16 }}>
            Soru Haritası
          </T>
          <Pressable onPress={kapat} hitSlop={10}>
            <X size={22} color={renk.yazi} />
          </Pressable>
        </View>
        <ScrollView contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 8 }}>
          {gruplar.map((g) => (
            <View key={g.indeksler[0]} style={{ marginBottom: 16 }}>
              <T w="yariKalin" style={{ fontSize: 12, color: renk.soluk, letterSpacing: 0.5, marginBottom: 8 }}>
                {g.ad.toLocaleUpperCase("tr-TR")} ({g.indeksler.length})
              </T>
              <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
                {g.indeksler.map((i) => {
                  const k = kutuStili(i);
                  return (
                    <Pressable
                      key={sorular[i].id}
                      onPress={() => {
                        sec(i);
                        kapat();
                      }}
                      style={[
                        s.kutu,
                        { backgroundColor: k.zemin, borderColor: k.kenar ?? "transparent" },
                        i === aktifIndex && { borderColor: renk.birincil, borderWidth: 2.5 },
                      ]}
                    >
                      <T w="orta" style={{ fontSize: 13, color: k.yazi }}>
                        {i + 1}
                      </T>
                    </Pressable>
                  );
                })}
              </View>
            </View>
          ))}
        </ScrollView>
        <View style={s.aciklamalar}>
          {aciklamalar.map((a) => (
            <View key={a.etiket} style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
              <View style={{ width: 14, height: 14, borderRadius: 3, backgroundColor: a.zemin, borderWidth: a.kenar ? 2 : 0, borderColor: a.kenar }} />
              <T style={{ fontSize: 12, color: renk.soluk }}>{a.etiket}</T>
            </View>
          ))}
        </View>
      </View>
    </Modal>
  );
}

/** Derslerin soru dagilimi seridi (+ etiketler); sitedeki DERS_RENGI seridi. */
export function DersSeridi({ etiketsiz = false }: { etiketsiz?: boolean }) {
  return (
    <View style={{ marginTop: etiketsiz ? 12 : 16 }}>
      <View style={{ flexDirection: "row", height: etiketsiz ? 10 : 8, gap: 2, borderRadius: 999, overflow: "hidden" }}>
        {DERS_SIRASI.map((d) => (
          <View key={d} style={{ flex: DERS_DAGILIMI[d], backgroundColor: DERS_RENGI[d] }} />
        ))}
      </View>
      {!etiketsiz && (
        <View style={{ marginTop: 8, flexDirection: "row", flexWrap: "wrap", columnGap: 12, rowGap: 4 }}>
          {DERS_SIRASI.map((d) => (
            <View key={d} style={{ flexDirection: "row", alignItems: "center", gap: 4 }}>
              <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: DERS_RENGI[d] }} />
              <T style={{ fontSize: 11, color: renk.soluk }}>
                {DERS_LABEL[d]} {DERS_DAGILIMI[d]}
              </T>
            </View>
          ))}
        </View>
      )}
    </View>
  );
}

const s = StyleSheet.create({
  sayfa: { maxHeight: "80%", backgroundColor: "#fff", borderTopLeftRadius: 24, borderTopRightRadius: 24 },
  kutu: { width: 46, height: 40, borderRadius: 8, alignItems: "center", justifyContent: "center", borderWidth: 2 },
  aciklamalar: { flexDirection: "row", flexWrap: "wrap", gap: 16, borderTopWidth: 1, borderTopColor: renk.kenar, paddingHorizontal: 16, paddingTop: 12 },
});

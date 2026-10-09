import { useCallback, useEffect, useRef, useState } from "react";
import { Alert, Pressable, ScrollView, StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { ChevronLeft, ChevronRight, Clock, Flag, LayoutGrid } from "lucide-react-native";
import { T } from "@/bilesenler/ui";
import { KesirliMetin } from "@/bilesenler/KesirliMetin";
import { SoruGovdesi, SoruHaritasi } from "@/bilesenler/SoruParcalari";
import { api } from "@/lib/api";
import { DERS_LABEL, type ExamSoru } from "@/lib/kpss";
import { golge, renk } from "@/lib/tema";

const sure = (ms: number) => new Date(Math.max(0, ms)).toISOString().slice(11, 19);

/**
 * Sitedeki DenemeSinavi. Bitis ani sunucunun verdigi KALAN sureden cihaz saatinde bir kez
 * kurulur (cihaz saati kayiksa sayac kaymasin). Isaretler bu cihazda, bu katilima ozel saklanir.
 */
export function DenemeSinavi({
  katilimId,
  ilkKalanMs,
  sorular,
  ilkCevaplar,
  bitti,
}: {
  katilimId: string;
  ilkKalanMs: number;
  sorular: ExamSoru[];
  ilkCevaplar: Record<string, number>;
  bitti: () => void;
}) {
  const [bitisMs] = useState(() => Date.now() + ilkKalanMs);
  const [index, setIndex] = useState(0);
  const [cevaplar, setCevaplar] = useState(ilkCevaplar);
  const [kalanMs, setKalanMs] = useState(ilkKalanMs);
  const [isaretliler, setIsaretliler] = useState<string[]>([]);
  const [harita, setHarita] = useState(false);
  const bittiRef = useRef(false);
  const kaydirma = useRef<ScrollView>(null);
  const alt = useSafeAreaInsets().bottom;
  const anahtar = `deneme-isaret-${katilimId}`;

  useEffect(() => {
    AsyncStorage.getItem(anahtar)
      .then((j) => j && setIsaretliler(JSON.parse(j)))
      .catch(() => {});
  }, [anahtar]);

  const bitir = useCallback(async () => {
    if (bittiRef.current) return;
    bittiRef.current = true;
    await api("/api/kpss-denemesi/bitir", { govde: { katilimId } }).catch(() => {});
    bitti();
  }, [katilimId, bitti]);

  useEffect(() => {
    const t = setInterval(() => {
      const kalan = bitisMs - Date.now();
      setKalanMs(kalan);
      if (kalan <= 0) {
        clearInterval(t);
        bitir();
      }
    }, 1000);
    return () => clearInterval(t);
  }, [bitisMs, bitir]);

  const soru = sorular[index];

  const git = setIndex;
  // Soru degisince yeni soru en ustten baslasin (render'dan sonra; once kaydirilirsa eski icerik boyunda kalir).
  useEffect(() => {
    kaydirma.current?.scrollTo({ y: 0, animated: false });
  }, [index]);

  async function cevapSec(secenek: number) {
    setCevaplar((o) => ({ ...o, [soru.id]: secenek }));
    try {
      await api("/api/kpss-denemesi/cevap", { govde: { katilimId, soruId: soru.id, secenekIndex: secenek } });
    } catch (e) {
      // 409: sure doldu ya da sinav baska yerden bitirildi.
      if ((e as { durum?: number }).durum === 409) bitir();
    }
  }

  function bitirSor() {
    const bos = sorular.length - Object.keys(cevaplar).length;
    Alert.alert(
      "Sınavı bitir",
      bos > 0 ? `${bos} soruyu boş bıraktınız. Sınavı yine de bitirmek istiyor musunuz?` : "Sınavı bitirmek istediğinize emin misiniz?",
      [
        { text: "Vazgeç", style: "cancel" },
        { text: "Bitir", style: "destructive", onPress: bitir },
      ],
    );
  }

  function isaretDegistir() {
    const yeni = isaretliler.includes(soru.id) ? isaretliler.filter((id) => id !== soru.id) : [...isaretliler, soru.id];
    setIsaretliler(yeni);
    AsyncStorage.setItem(anahtar, JSON.stringify(yeni)).catch(() => {});
  }

  const azaldi = kalanMs < 5 * 60_000;
  const isaretli = isaretliler.includes(soru.id);

  return (
    <View style={{ flex: 1 }}>
      <View style={s.ust}>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
          <Clock size={20} color={azaldi ? renk.hata : renk.birincil} />
          <T w="yariKalin" style={{ fontSize: 18, color: azaldi ? renk.hata : renk.birincil, fontVariant: ["tabular-nums"] }}>
            {sure(kalanMs)}
          </T>
        </View>
        <View style={{ flexDirection: "row", gap: 8 }}>
          <Pressable onPress={() => setHarita(true)} style={s.harita}>
            <LayoutGrid size={16} color={renk.yazi} />
            <T w="yariKalin" style={{ fontSize: 13 }}>
              Harita
            </T>
          </Pressable>
          <Pressable onPress={bitirSor} style={s.bitir}>
            <T w="yariKalin" style={{ color: "#fff", fontSize: 13 }}>
              Sınavı Bitir
            </T>
          </Pressable>
        </View>
      </View>

      <ScrollView ref={kaydirma} contentContainerStyle={{ padding: 16, paddingBottom: 100 }}>
        <View style={s.kart}>
          <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 8 }}>
            <T style={{ fontSize: 12, color: renk.soluk }}>
              Soru {index + 1} / {sorular.length}
            </T>
            <View style={{ flexDirection: "row", gap: 6 }}>
              <Pressable onPress={isaretDegistir} style={[s.isaret, isaretli && { borderColor: "#fbbf24", backgroundColor: "#fffbeb" }]}>
                <Flag size={14} color={isaretli ? "#b45309" : "#475569"} />
                <T w="orta" style={{ fontSize: 12, color: isaretli ? "#b45309" : "#475569" }}>
                  {isaretli ? "İşareti kaldır" : "İşaretle"}
                </T>
              </Pressable>
              <View style={s.ders}>
                <T w="orta" style={{ fontSize: 12, color: renk.birincil }}>
                  {DERS_LABEL[soru.ders]}
                </T>
              </View>
            </View>
          </View>
          <SoruGovdesi sorular={sorular} index={index} />
          <View style={{ marginTop: 16, gap: 8 }}>
            {soru.secenekler.map((secenek, i) => {
              const secili = cevaplar[soru.id] === i;
              return (
                <Pressable key={i} onPress={() => cevapSec(i)} style={[s.secenek, secili && { borderColor: renk.birincil, backgroundColor: renk.birincilZemin }]}>
                  <T w="yariKalin" style={{ color: secili ? renk.birincil : "#334155" }}>
                    {String.fromCharCode(65 + i)})
                  </T>
                  <KesirliMetin metin={secenek} renk={secili ? renk.birincil : "#334155"} style={{ flex: 1, lineHeight: 21 }} />
                </Pressable>
              );
            })}
          </View>
        </View>
      </ScrollView>

      <View style={[s.alt, { paddingBottom: alt + 10 }]}>
        <Pressable onPress={() => git(Math.max(0, index - 1))} disabled={index === 0} style={[s.gez, index === 0 && { opacity: 0.4 }]}>
          <ChevronLeft size={18} color="#475569" />
          <T w="orta" style={{ color: "#475569" }}>
            Önceki
          </T>
        </Pressable>
        <Pressable onPress={() => git(Math.min(sorular.length - 1, index + 1))} disabled={index === sorular.length - 1} style={[s.gez, index === sorular.length - 1 && { opacity: 0.4 }]}>
          <T w="orta" style={{ color: "#475569" }}>
            Sonraki
          </T>
          <ChevronRight size={18} color="#475569" />
        </Pressable>
      </View>

      <SoruHaritasi
        acik={harita}
        kapat={() => setHarita(false)}
        sorular={sorular}
        aktifIndex={index}
        sec={git}
        kutuStili={(i) => ({
          zemin: cevaplar[sorular[i].id] !== undefined ? renk.birincil : "#f1f5f9",
          yazi: cevaplar[sorular[i].id] !== undefined ? "#fff" : "#475569",
          kenar: isaretliler.includes(sorular[i].id) ? "#fbbf24" : undefined,
        })}
        aciklamalar={[
          { etiket: "Cevaplanmış", zemin: renk.birincil },
          { etiket: "İşaretli", zemin: "#fff", kenar: "#fbbf24" },
          { etiket: "Boş", zemin: "#f1f5f9" },
        ]}
      />
    </View>
  );
}

const s = StyleSheet.create({
  ust: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", backgroundColor: "#fff", borderBottomWidth: 1, borderBottomColor: renk.kenar, paddingHorizontal: 16, paddingVertical: 10 },
  harita: { flexDirection: "row", alignItems: "center", gap: 6, borderWidth: 1, borderColor: "rgba(36,102,195,0.2)", borderRadius: 10, paddingHorizontal: 12, paddingVertical: 8 },
  bitir: { backgroundColor: renk.birincil, borderRadius: 10, paddingHorizontal: 14, paddingVertical: 8 },
  kart: { backgroundColor: "#fff", borderRadius: 16, borderWidth: 1, borderColor: "rgba(36,102,195,0.15)", padding: 18, ...golge },
  isaret: { flexDirection: "row", alignItems: "center", gap: 4, borderWidth: 1, borderColor: "rgba(36,102,195,0.2)", borderRadius: 999, paddingHorizontal: 10, paddingVertical: 3 },
  ders: { backgroundColor: renk.birincilZemin, borderRadius: 999, paddingHorizontal: 10, paddingVertical: 3 },
  secenek: { flexDirection: "row", gap: 10, borderWidth: 1, borderColor: "rgba(36,102,195,0.15)", borderRadius: 12, paddingHorizontal: 14, paddingVertical: 12 },
  alt: { position: "absolute", left: 0, right: 0, bottom: 0, flexDirection: "row", justifyContent: "space-between", backgroundColor: "rgba(255,255,255,0.97)", borderTopWidth: 1, borderTopColor: renk.kenar, paddingHorizontal: 16, paddingTop: 10 },
  gez: { flexDirection: "row", alignItems: "center", gap: 4, borderWidth: 1, borderColor: "rgba(36,102,195,0.2)", borderRadius: 12, paddingHorizontal: 16, paddingVertical: 10 },
});

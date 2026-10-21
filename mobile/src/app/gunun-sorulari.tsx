import { useEffect, useRef, useState } from "react";
import { Alert, Pressable, ScrollView, StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { router } from "expo-router";
import { CheckCircle2, Flame, Gift, XCircle } from "lucide-react-native";
import { HataKutusu, Kart, T, Yukleniyor } from "@/bilesenler/ui";
import { KesirliMetin } from "@/bilesenler/KesirliMetin";
import { SoruGovdesi } from "@/bilesenler/SoruParcalari";
import { yukseltmeAc } from "@/bilesenler/KilitliOzellik";
import { api } from "@/lib/api";
import { DERS_LABEL, DUZEY_LABEL, type DenemeDuzeyi, type ExamSoru } from "@/lib/kpss";
import { useOturum } from "@/lib/oturum";
import { renk } from "@/lib/tema";
import type { SeriBilgisi } from "@/lib/tipler";

type CozumluSoru = ExamSoru & { dogruCevap: number; aciklama: string | null; secilen: number | null; dogruYuzde: number | null };
type Yanit =
  | { duzey: DenemeDuzeyi; cozuldu: false; sorular: ExamSoru[]; seri: SeriBilgisi | null; bugunBaskaDuzeyde: boolean }
  | { duzey: DenemeDuzeyi; cozuldu: true; sorular: CozumluSoru[]; seri: SeriBilgisi | null; dogru: number; hediye: boolean };

const DUZEYLER: DenemeDuzeyi[] = ["LISE", "ONLISANS", "LISANS"];

/** Sitedeki /gunun-sorulari: tek ekranda 5 soru; gonderince dogru cevap, aciklama ve uyelerin dogru yuzdesi acilir. */
export default function GununSorulari() {
  const { kullanici } = useOturum();
  const [duzey, setDuzey] = useState<DenemeDuzeyi | null>(null);
  const [veri, setVeri] = useState<Yanit | null>(null);
  const [hata, setHata] = useState<string | null>(null);
  const [surum, setSurum] = useState(0);
  const [cevaplar, setCevaplar] = useState<Record<string, number>>({});
  const [gonderiliyor, setGonderiliyor] = useState(false);
  const kaydirma = useRef<ScrollView>(null);
  const alt = useSafeAreaInsets().bottom;

  useEffect(() => {
    if (kullanici === undefined) return;
    let iptal = false;
    api<Yanit>(`/api/gunluk-sorular${duzey ? `?duzey=${duzey}` : ""}`).then(
      (d) => {
        if (iptal) return;
        setVeri(d);
        setHata(null);
        setCevaplar({});
        if (!duzey) setDuzey(d.duzey);
      },
      (e) => !iptal && setHata(e instanceof Error ? e.message : "Yüklenemedi."),
    );
    return () => {
      iptal = true;
    };
  }, [duzey, kullanici, surum]);

  if (hata && !veri) return <HataKutusu mesaj={hata} tekrar={() => setSurum((s) => s + 1)} />;
  if (!veri) return <Yukleniyor />;
  const sorular = veri.sorular as ExamSoru[];
  const cevapli = Object.keys(cevaplar).length;
  const tumuCevapli = cevapli === sorular.length;

  async function gonder() {
    setGonderiliyor(true);
    try {
      const d = await api<Yanit & { cozuldu: true }>("/api/gunluk-sorular", { govde: { duzey: veri!.duzey, cevaplar } });
      setVeri(d);
      if (d.hediye) Alert.alert(`${d.seri?.gun} günlük seri!`, "1 gün Pro hesabına tanımlandı.");
      kaydirma.current?.scrollTo({ y: 0, animated: true });
    } catch (e) {
      Alert.alert("Gönderilemedi.", e instanceof Error ? e.message : undefined);
    } finally {
      setGonderiliyor(false);
    }
  }

  return (
    <View style={{ flex: 1 }}>
      <ScrollView ref={kaydirma} contentContainerStyle={{ padding: 16, gap: 16, paddingBottom: veri.cozuldu ? 40 : 110 }}>
        <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 8 }}>
          <View style={s.sekmeler}>
            {DUZEYLER.map((d) => (
              <Pressable key={d} onPress={() => setDuzey(d)} style={[s.sekme, veri.duzey === d && { backgroundColor: renk.birincil }]}>
                <T w="yariKalin" style={{ fontSize: 13, color: veri.duzey === d ? "#fff" : renk.yaziIkincil }}>
                  {DUZEY_LABEL[d]}
                </T>
              </Pressable>
            ))}
          </View>
          {!!veri.seri && (
            <View style={s.seriCip}>
              <Flame size={14} color="#92400e" />
              <T w="kalin" style={{ fontSize: 13, color: "#92400e" }}>
                {veri.seri.gun} gün
              </T>
            </View>
          )}
        </View>

        {veri.cozuldu ? (
          <View style={s.sonuc}>
            <T w="kalin" style={{ fontSize: 26, color: "#fff" }}>
              {veri.dogru}/{sorular.length} doğru
            </T>
            <T style={{ color: "#cbd5e1", lineHeight: 20 }}>
              {kullanici
                ? veri.seri?.bugunCozuldu
                  ? "Bugünkü serin sayıldı. Yarın yeni 5 soru seni bekliyor."
                  : "Bugün başka bir düzeyde çözdüğün için serin zaten sayıldı; bu çözüm alıştırma."
                : "Üye olursan her gün çözdüğün sorular serine eklenir; 7 günde 1 gün Pro hediye."}
            </T>
            {!kullanici && (
              <Pressable onPress={() => router.push("/kayit")} style={s.turuncuButon}>
                <T w="kalin" style={{ color: "#0f172a" }}>
                  Ücretsiz üye ol, serini başlat
                </T>
              </Pressable>
            )}
            {veri.hediye && (
              <View style={{ flexDirection: "row", alignItems: "center", gap: 8, borderRadius: 12, backgroundColor: "rgba(251,191,36,0.2)", padding: 10 }}>
                <Gift size={16} color="#fde68a" />
                <T w="yariKalin" style={{ color: "#fde68a" }}>
                  1 gün Pro hediye kazandın
                </T>
              </View>
            )}
            {/* Yanlis varsa: hangi konularda eksik oldugunu KPSS denemelerinde Pro+ konu konu gosterir. */}
            {!!kullanici && kullanici.plan !== "PRO_PLUS" && veri.dogru < sorular.length && (
              <T style={{ borderTopWidth: 1, borderTopColor: "rgba(255,255,255,0.1)", paddingTop: 12, color: "#cbd5e1", fontSize: 13, lineHeight: 19 }}>
                Bugün {sorular.length - veri.dogru} yanlışın var. Hangi konularda eksiğin olduğunu KPSS denemelerinde Pro+ konu konu gösterir.{" "}
                <T w="yariKalin" style={{ color: "#fdba74", fontSize: 13, textDecorationLine: "underline" }} onPress={() => yukseltmeAc("PRO_PLUS", "zayif-konu")}>
                  Eksik konularını gör
                </T>
              </T>
            )}
          </View>
        ) : (
          veri.bugunBaskaDuzeyde && (
            <View style={{ borderRadius: 16, backgroundColor: renk.amberZemin, padding: 12 }}>
              <T style={{ color: renk.amberKoyu, lineHeight: 20 }}>Bugün başka bir düzeyde çözdün; serin sayıldı. Bu düzeyi alıştırma olarak çözebilirsin.</T>
            </View>
          )
        )}

        {sorular.map((soru, i) => {
          const cozum = veri.cozuldu ? (soru as CozumluSoru) : null;
          return (
            <Kart key={soru.id} style={{ padding: 18 }}>
              <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
                <T w="yariKalin" style={{ fontSize: 12, color: renk.soluk }}>
                  Soru {i + 1}/{sorular.length}
                </T>
                <View style={{ borderRadius: 999, backgroundColor: renk.birincilZemin, paddingHorizontal: 10, paddingVertical: 3 }}>
                  <T w="yariKalin" style={{ fontSize: 12, color: renk.birincil }}>
                    {DERS_LABEL[soru.ders]}
                  </T>
                </View>
              </View>
              <SoruGovdesi sorular={sorular} index={i} />
              <View style={{ marginTop: 14, gap: 8 }}>
                {soru.secenekler.map((secenek, j) => {
                  const dogru = !!cozum && j === cozum.dogruCevap;
                  const yanlisSecim = !!cozum && j === cozum.secilen && j !== cozum.dogruCevap;
                  const secili = !cozum && cevaplar[soru.id] === j;
                  return (
                    <Pressable
                      key={j}
                      disabled={!!cozum}
                      onPress={() => setCevaplar((c) => ({ ...c, [soru.id]: j }))}
                      accessibilityState={{ selected: cozum ? j === cozum.secilen : secili }}
                      style={[
                        s.secenek,
                        dogru ? { borderColor: "#10b981", backgroundColor: "#ecfdf5" } : yanlisSecim ? { borderColor: "#f87171", backgroundColor: "#fef2f2" } : secili ? { borderColor: renk.birincil, backgroundColor: "rgba(36,102,195,0.1)" } : null,
                      ]}
                    >
                      <T w="yariKalin" style={{ color: secili ? renk.birincil : renk.yazi }}>
                        {String.fromCharCode(65 + j)})
                      </T>
                      <View style={{ flex: 1 }}>
                        <KesirliMetin metin={secenek} style={{ color: dogru ? "#064e3b" : yanlisSecim ? "#7f1d1d" : secili ? renk.birincil : "#334155" }} />
                      </View>
                      {dogru && <CheckCircle2 size={16} color="#059669" />}
                      {yanlisSecim && <XCircle size={16} color="#ef4444" />}
                    </Pressable>
                  );
                })}
              </View>
              {!!cozum && (
                <View style={{ marginTop: 14, gap: 6, borderRadius: 14, backgroundColor: "#f8fafc", padding: 14 }}>
                  {cozum.dogruYuzde !== null && <T w="yariKalin">Üyeler arasında doğru cevap oranı: %{cozum.dogruYuzde}</T>}
                  {!!cozum.aciklama && <KesirliMetin metin={cozum.aciklama} style={{ color: "#334155", lineHeight: 21 }} />}
                </View>
              )}
            </Kart>
          );
        })}
      </ScrollView>

      {!veri.cozuldu && (
        <View style={[s.altCubuk, { paddingBottom: alt + 12 }]}>
          <Pressable onPress={gonder} disabled={!tumuCevapli || gonderiliyor} style={[s.gonder, (!tumuCevapli || gonderiliyor) && { opacity: 0.6 }]}>
            <T w="kalin" style={{ color: "#fff", fontSize: 15 }}>
              {gonderiliyor ? "Gönderiliyor..." : tumuCevapli ? "Cevaplarımı gönder" : `${cevapli}/${sorular.length} cevaplandı`}
            </T>
          </Pressable>
        </View>
      )}
    </View>
  );
}

const s = StyleSheet.create({
  sekmeler: { flexDirection: "row", gap: 4, borderRadius: 16, borderWidth: 1, borderColor: "rgba(36,102,195,0.15)", backgroundColor: "#fff", padding: 4 },
  sekme: { borderRadius: 12, paddingHorizontal: 12, paddingVertical: 8 },
  seriCip: { flexDirection: "row", alignItems: "center", gap: 4, borderRadius: 999, backgroundColor: "#fffbeb", paddingHorizontal: 10, paddingVertical: 6 },
  sonuc: { borderRadius: 24, backgroundColor: "#0f172a", padding: 20, gap: 12 },
  turuncuButon: { alignItems: "center", borderRadius: 12, backgroundColor: "#fb923c", paddingVertical: 12 },
  secenek: { flexDirection: "row", alignItems: "flex-start", gap: 10, borderRadius: 12, borderWidth: 1, borderColor: "rgba(36,102,195,0.15)", paddingHorizontal: 14, paddingVertical: 11 },
  altCubuk: { position: "absolute", left: 0, right: 0, bottom: 0, paddingHorizontal: 16, paddingTop: 12, backgroundColor: "rgba(237,240,245,0.95)" },
  gonder: { alignItems: "center", borderRadius: 16, backgroundColor: "#0f172a", paddingVertical: 15 },
});

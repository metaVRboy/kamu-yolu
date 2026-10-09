import { useCallback } from "react";
import { Pressable, RefreshControl, ScrollView, StyleSheet, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { router, useFocusEffect } from "expo-router";
import { BookOpen, Calculator, ChartColumnBig, Clock, GraduationCap, History, ListChecks, MousePointerClick, School, Timer, type LucideIcon } from "lucide-react-native";
import { Cip, HataKutusu, Kart, SayfaBasligi, T, Yukleniyor } from "@/bilesenler/ui";
import { KilitliOzellik, yukseltmeAc } from "@/bilesenler/KilitliOzellik";
import { DersSeridi } from "@/bilesenler/SoruParcalari";
import { useVeri } from "@/lib/api";
import { useOturum } from "@/lib/oturum";
import { DUZEY_LABEL, DUZEY_TEMA, SINAV_SURESI_DK, TOPLAM_SORU, sayiFmt, type DenemeDuzeyi, type Plan } from "@/lib/kpss";
import { renk } from "@/lib/tema";

type HubVeri = {
  plan: Plan | null;
  hak: { limit: number | null; kullanilan: number; doldu: boolean } | null;
  duzeyler: { duzey: DenemeDuzeyi; hazir: boolean; bugun: { durum: "bitti"; puan: number | null } | { durum: "suruyor" } | null }[];
  gecmis: { id: string; duzey: DenemeDuzeyi; tarih: string; dogru: number; yanlis: number; bos: number; net: number; puan: number }[];
};

const DUZEY_IKONU: Record<DenemeDuzeyi, LucideIcon> = { LISE: School, ONLISANS: BookOpen, LISANS: GraduationCap };
const TARIH = new Intl.DateTimeFormat("tr-TR", { day: "numeric", month: "short", year: "numeric", timeZone: "UTC" });
const ADIMLAR = [
  { ikon: MousePointerClick, baslik: "Düzeyini seç", metin: "Ortaöğretim, Önlisans ya da Lisans; her düzeyin kendi günlük denemesi var." },
  { ikon: Timer, baslik: `${SINAV_SURESI_DK} dakikada ${TOPLAM_SORU} soru`, metin: "Gerçek KPSS formatı ve süresi. Soruları işaretleyip sonra dönebilirsin." },
  { ikon: ChartColumnBig, baslik: "Raporunu al", metin: "Pro'da ders karnen ve soru çözümlerin, Pro+'da konu bazlı değerlendirme ve önceki denemene göre gelişimin hazır." },
];

/** Sitedeki /kpss-denemesi: duzey kartlari, haftalik hak, nasil calisir, son denemeler + puan hesaplama. */
export default function KpssEkrani() {
  const { kullanici } = useOturum();
  const { veri, hata, yenileniyor, yenile } = useVeri<HubVeri>(kullanici === undefined ? null : `/api/mobil/kpss?u=${kullanici?.id ?? ""}`);
  // Sinavdan donunce kartlardaki durum (suruyor/bitti) guncel olsun.
  useFocusEffect(
    useCallback(() => {
      yenile(false);
    }, [yenile]),
  );
  if (hata && !veri) return <HataKutusu mesaj={hata} tekrar={yenile} />;
  if (!veri) return <Yukleniyor />;
  const { plan, hak } = veri;

  return (
    <ScrollView contentContainerStyle={{ padding: 16, gap: 16, paddingBottom: 32 }} refreshControl={<RefreshControl refreshing={yenileniyor} onRefresh={yenile} tintColor={renk.birincil} />}>
      <SayfaBasligi
        baslik="KPSS Deneme Sınavı"
        aciklama="Her gün yenilenen, gerçek KPSS formatında deneme. O gün giren herkes aynı soruları görür; Pro'da ders karnen, Pro+'da konu bazlı çalışma tavsiyelerin hazırlanır."
        cipler={
          <>
            <Cip etiket={`${TOPLAM_SORU} soru`} ikon={ListChecks} />
            <Cip etiket={`${SINAV_SURESI_DK} dakika`} ikon={Clock} />
            <Cip etiket="Her gün yenilenir" durum="vurgu" />
          </>
        }
      />

      <Kart style={{ padding: 16, gap: 8 }} yaricap={16}>
        <T style={{ color: "#334155", lineHeight: 20 }}>
          {!plan ? (
            "Ücretsiz planda haftada toplam 1, Pro'da toplam 3 deneme; Pro+'da sınırsız. Ders karnesi Pro, konu değerlendirmesi Pro+ ile açılır."
          ) : hak?.limit === null ? (
            <>
              <T w="kalin">Pro+</T> · Sınırsız deneme, konu bazlı değerlendirme ve gelişim takibi açık.
            </>
          ) : (
            <>
              Bu hafta toplam{" "}
              <T w="kalin">
                {hak?.kullanilan}/{hak?.limit}
              </T>{" "}
              deneme hakkını kullandın (tüm düzeyler dahil){plan === "UCRETSIZ" ? " · Ders karnesi Pro'da" : " · Konu değerlendirmesi ve gelişim takibi Pro+'da"}. Hak pazartesi yenilenir.
            </>
          )}
        </T>
        {plan !== "PRO_PLUS" && (
          <T w="yariKalin" style={{ color: renk.birincil }} onPress={() => yukseltmeAc(plan === "PRO" ? "PRO_PLUS" : undefined, "deneme-hakki")}>
            Planları gör →
          </T>
        )}
      </Kart>

      {veri.duzeyler.map(({ duzey, hazir, bugun }) => {
        const tema = DUZEY_TEMA[duzey];
        const Ikon = DUZEY_IKONU[duzey];
        const ac = () => router.push({ pathname: "/kpss/[duzey]", params: { duzey: duzey.toLowerCase() } });
        const basla = (
          <Pressable onPress={ac} style={[s.buton, { backgroundColor: tema.buton }]}>
            <T w="kalin" style={{ color: "#fff" }}>
              Sınava Başla
            </T>
          </Pressable>
        );
        return (
          <Kart key={duzey} style={{ overflow: "hidden" }}>
            <LinearGradient colors={tema.zemin} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={{ padding: 20, overflow: "hidden" }}>
              <View style={{ position: "absolute", right: -20, bottom: -28, opacity: 0.15 }}>
                <Ikon size={128} color="#fff" strokeWidth={1.25} />
              </View>
              <View style={s.ikonKutu}>
                <Ikon size={24} color="#fff" />
              </View>
              <T w="kalin" style={{ marginTop: 12, fontSize: 24, color: "#fff", letterSpacing: -0.5 }}>
                {DUZEY_LABEL[duzey]}
              </T>
              <T w="yariKalin" style={{ marginTop: 2, fontSize: 12, color: "rgba(255,255,255,0.85)" }}>
                {hazir ? "Bugünün denemesi hazır" : "Soru havuzu hazırlanıyor"}
              </T>
            </LinearGradient>
            <View style={{ padding: 20 }}>
              <View style={{ flexDirection: "row", gap: 14 }}>
                <View style={s.satir}>
                  <ListChecks size={16} color={renk.yaziIkincil} />
                  <T style={{ color: renk.yaziIkincil }}>{TOPLAM_SORU} soru</T>
                </View>
                <View style={s.satir}>
                  <Clock size={16} color={renk.yaziIkincil} />
                  <T style={{ color: renk.yaziIkincil }}>{SINAV_SURESI_DK} dk</T>
                </View>
              </View>
              <DersSeridi />
              <View style={{ marginTop: 20 }}>
                {!hazir ? (
                  <View style={s.yakinda}>
                    <T w="orta" style={{ color: renk.soluk }}>
                      Yakında
                    </T>
                  </View>
                ) : bugun?.durum === "bitti" ? (
                  <View style={{ gap: 12 }}>
                    <View style={[s.puan, { backgroundColor: tema.acik }]}>
                      <T w="yariKalin" style={{ fontSize: 12, color: renk.yaziIkincil }}>
                        Bugünkü puanın
                      </T>
                      <T w="kalin" style={{ fontSize: 24, color: tema.metin }}>
                        {bugun.puan === null ? "—" : sayiFmt(bugun.puan)}
                      </T>
                    </View>
                    <Pressable onPress={ac} style={[s.buton, { borderWidth: 1, borderColor: "rgba(36,102,195,0.2)" }]}>
                      <T w="kalin">{plan === "UCRETSIZ" ? "Sonucunu gör" : "Raporunu gör"}</T>
                    </Pressable>
                  </View>
                ) : bugun?.durum === "suruyor" ? (
                  <Pressable onPress={ac} style={[s.buton, { backgroundColor: "#f59e0b" }]}>
                    <T w="kalin" style={{ color: "#fff" }}>
                      Süren işliyor · Devam et
                    </T>
                  </Pressable>
                ) : hak?.doldu && plan ? (
                  <KilitliOzellik mevcutPlan={plan} gerekenPlan={plan === "UCRETSIZ" ? "PRO" : "PRO_PLUS"} kaynak="deneme-hakki" baslik={`Haftalık toplam ${hak.limit} hakkın doldu`}>
                    <View style={{ minHeight: 170, justifyContent: "flex-end" }}>{basla}</View>
                  </KilitliOzellik>
                ) : (
                  basla
                )}
              </View>
            </View>
          </Kart>
        );
      })}

      <Pressable onPress={() => router.push("/kpss-puan")}>
        <Kart style={{ padding: 20, flexDirection: "row", alignItems: "center", gap: 14 }}>
          <View style={[s.ikonKutu, { backgroundColor: renk.birincilZemin, borderWidth: 0 }]}>
            <Calculator size={22} color={renk.birincil} />
          </View>
          <View style={{ flex: 1 }}>
            <T w="kalin" style={{ fontSize: 16 }}>
              KPSS Puan Hesaplama
            </T>
            <T style={{ marginTop: 2, color: renk.soluk, fontSize: 13 }}>Doğru/yanlış sayılarını gir, netini ve puanını hesapla.</T>
          </View>
          <T w="kalin" style={{ color: renk.birincil }}>
            →
          </T>
        </Kart>
      </Pressable>

      <View style={{ gap: 12, marginTop: 8 }}>
        <T w="kalin" style={{ fontSize: 20 }}>
          Nasıl çalışır?
        </T>
        {ADIMLAR.map(({ ikon: Ikon, baslik, metin }, i) => (
          <Kart key={baslik} style={{ padding: 16, flexDirection: "row", gap: 14 }}>
            <View style={[s.ikonKutu, { backgroundColor: renk.birincilZemin, borderWidth: 0 }]}>
              <Ikon size={20} color={renk.birincil} />
            </View>
            <View style={{ flex: 1 }}>
              <T w="kalin" style={{ fontSize: 12, color: renk.soluk }}>
                {i + 1}. adım
              </T>
              <T w="yariKalin">{baslik}</T>
              <T style={{ marginTop: 2, color: renk.yaziIkincil, fontSize: 13, lineHeight: 19 }}>{metin}</T>
            </View>
          </Kart>
        ))}
      </View>

      {veri.gecmis.length > 0 && (
        <View style={{ gap: 12, marginTop: 8 }}>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
            <History size={20} color={renk.birincil} />
            <T w="kalin" style={{ fontSize: 20 }}>
              Son denemelerin
            </T>
          </View>
          <Kart style={{ paddingVertical: 4 }}>
            {veri.gecmis.map((g, i) => {
              const tema = DUZEY_TEMA[g.duzey];
              return (
                <View key={g.id} style={[s.gecmis, i > 0 && { borderTopWidth: 1, borderTopColor: "rgba(36,102,195,0.05)" }]}>
                  <View style={{ flex: 1, gap: 4 }}>
                    <T style={{ color: "#334155" }}>{TARIH.format(new Date(g.tarih))}</T>
                    <View style={{ alignSelf: "flex-start", backgroundColor: tema.acik, borderRadius: 999, paddingHorizontal: 8, paddingVertical: 2 }}>
                      <T w="yariKalin" style={{ fontSize: 11, color: tema.metin }}>
                        {DUZEY_LABEL[g.duzey]}
                      </T>
                    </View>
                  </View>
                  <View style={{ alignItems: "flex-end", gap: 2 }}>
                    <T style={{ fontSize: 12, color: renk.yaziIkincil }}>
                      {g.dogru} / {g.yanlis} / {g.bos} · {sayiFmt(g.net)} net
                    </T>
                    <T w="kalin" style={{ fontSize: 16 }}>
                      {sayiFmt(g.puan)} puan
                    </T>
                  </View>
                </View>
              );
            })}
          </Kart>
        </View>
      )}

      <T style={{ marginTop: 8, fontSize: 12, color: renk.soluk, lineHeight: 18 }}>
        Sorular gerçek ÖSYM soruları değildir; Kamu Yolu tarafından KPSS formatına uygun olarak hazırlanan özgün deneme sorularıdır. Sınav sonundaki puan resmi ÖSYM puanı değildir; net üzerinden hesaplanan pratik bir deneme puanıdır.
      </T>
    </ScrollView>
  );
}

const s = StyleSheet.create({
  ikonKutu: { width: 44, height: 44, borderRadius: 16, backgroundColor: "rgba(255,255,255,0.15)", borderWidth: 1, borderColor: "rgba(255,255,255,0.3)", alignItems: "center", justifyContent: "center" },
  satir: { flexDirection: "row", alignItems: "center", gap: 6 },
  buton: { alignItems: "center", borderRadius: 999, paddingVertical: 12 },
  yakinda: { alignItems: "center", borderRadius: 999, borderWidth: 1, borderStyle: "dashed", borderColor: "rgba(36,102,195,0.25)", paddingVertical: 11 },
  puan: { flexDirection: "row", alignItems: "baseline", justifyContent: "space-between", borderRadius: 16, paddingHorizontal: 16, paddingVertical: 12 },
  gecmis: { flexDirection: "row", alignItems: "center", gap: 12, paddingHorizontal: 16, paddingVertical: 12 },
});

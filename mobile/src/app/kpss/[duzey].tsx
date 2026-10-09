import { useEffect, useState, type ReactNode } from "react";
import { Alert, Pressable, ScrollView, StyleSheet, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { router, useLocalSearchParams, useNavigation } from "expo-router";
import { CalendarCheck, Clock, Flag, GraduationCap, LayoutGrid, ListChecks, MinusCircle, Play, Target, type LucideIcon } from "lucide-react-native";
import { HataKutusu, Kart, T, Yukleniyor } from "@/bilesenler/ui";
import { KilitliOzellik } from "@/bilesenler/KilitliOzellik";
import { DersSeridi } from "@/bilesenler/SoruParcalari";
import { DenemeSinavi } from "@/bilesenler/DenemeSinavi";
import { DenemeSonuc, type OncekiOzet } from "@/bilesenler/DenemeSonuc";
import { api, useVeri } from "@/lib/api";
import { useOturum } from "@/lib/oturum";
import { DERS_DAGILIMI, DERS_LABEL, DERS_RENGI, DERS_SIRASI, DUZEY_LABEL, DUZEY_TEMA, ONERILEN_SURE_DK, SINAV_SURESI_DK, TOPLAM_SORU, type DenemeDuzeyi, type ExamSoru, type Plan, type SonucSorusu } from "@/lib/kpss";
import { renk } from "@/lib/tema";

type Durum =
  | { durum: "hazir-degil" }
  | { durum: "giris-yok" }
  | { durum: "baslamadi"; plan: Plan; hak: { limit: number | null; kullanilan: number; doldu: boolean } }
  | { durum: "suruyor"; katilimId: string; kalanMs: number; sorular: ExamSoru[]; cevaplar: Record<string, number> }
  | { durum: "bitti"; plan: Plan; sorular: SonucSorusu[]; cevaplar: Record<string, number>; dogru: number; yanlis: number; bos: number; puan: number; onceki: OncekiOzet | null };

const PLAN_ADI = { UCRETSIZ: "Ücretsiz", PRO: "Pro", PRO_PLUS: "Pro+" } as const;
const HAK: Record<Plan, number | null> = { UCRETSIZ: 1, PRO: 3, PRO_PLUS: null };
const GUN = new Intl.DateTimeFormat("tr-TR", { day: "numeric", month: "long", year: "numeric", weekday: "long", timeZone: "Europe/Istanbul" });

function hakMetni(plan: Plan | null) {
  if (!plan) return "Ücretsiz planda haftada toplam 1, Pro'da toplam 3 deneme hakkı var; Pro+'da sınırsız.";
  const limit = HAK[plan];
  return limit === null
    ? "Pro+ ile sınırsız deneme: her gün her düzeyin denemesini çözebilirsin."
    : `${PLAN_ADI[plan]} planında haftada toplam ${limit} deneme hakkın var (tüm düzeyler dahil); hak pazartesi yenilenir.`;
}

/** Sitedeki /kpss-denemesi/[duzey]: baslangic karti -> sinav -> rapor (durumu sunucu belirler). */
export default function DuzeyEkrani() {
  const slug = useLocalSearchParams<{ duzey: string }>().duzey ?? "";
  const duzey = slug.toUpperCase() as DenemeDuzeyi;
  const navigation = useNavigation();
  const { kullanici } = useOturum();
  const { veri, hata, yenile } = useVeri<Durum>(DUZEY_TEMA[duzey] && kullanici !== undefined ? `/api/mobil/kpss/${slug}?u=${kullanici?.id ?? ""}` : null);

  useEffect(() => {
    navigation.setOptions({ title: veri?.durum === "bitti" ? "Sınav Sonucun" : `${DUZEY_LABEL[duzey] ?? ""} Denemesi`, gestureEnabled: veri?.durum !== "suruyor" });
  }, [navigation, duzey, veri?.durum]);

  if (!DUZEY_TEMA[duzey]) return <HataKutusu mesaj="Düzey bulunamadı." tekrar={() => router.back()} />;
  if (hata && !veri) return <HataKutusu mesaj={hata} tekrar={yenile} />;
  if (!veri) return <Yukleniyor />;

  if (veri.durum === "hazir-degil") {
    return (
      <View style={{ padding: 32, alignItems: "center", gap: 8 }}>
        <T w="yariKalin" style={{ fontSize: 18, textAlign: "center" }}>
          {DUZEY_LABEL[duzey]} denemesi henüz hazır değil
        </T>
        <T style={{ color: renk.soluk, textAlign: "center" }}>Bu düzey için soru havuzu hazırlanıyor, çok yakında burada olacak.</T>
      </View>
    );
  }
  if (veri.durum === "suruyor") {
    return <DenemeSinavi katilimId={veri.katilimId} ilkKalanMs={veri.kalanMs} sorular={veri.sorular} ilkCevaplar={veri.cevaplar} bitti={() => yenile(false)} />;
  }
  if (veri.durum === "bitti") {
    return <DenemeSonuc {...veri} duzey={duzey} />;
  }

  const tema = DUZEY_TEMA[duzey];
  const plan = veri.durum === "baslamadi" ? veri.plan : null;
  return (
    <BaslangicKarti duzey={duzey} plan={plan}>
      {veri.durum === "giris-yok" ? (
        <View style={{ alignItems: "center", gap: 12 }}>
          <T w="orta" style={{ color: "#334155" }}>
            Sınava girebilmek için giriş yapmalısın.
          </T>
          <View style={{ flexDirection: "row", gap: 10 }}>
            <Pressable onPress={() => router.push("/giris")} style={[s.buton, { backgroundColor: tema.buton }]}>
              <T w="kalin" style={{ color: "#fff" }}>
                Giriş Yap
              </T>
            </Pressable>
            <Pressable onPress={() => router.push("/kayit")} style={[s.buton, { backgroundColor: "#fff", borderWidth: 1, borderColor: "rgba(36,102,195,0.2)" }]}>
              <T w="kalin" style={{ color: renk.birincil }}>
                Ücretsiz Kayıt Ol
              </T>
            </Pressable>
          </View>
        </View>
      ) : veri.hak.doldu ? (
        <View style={{ alignSelf: "stretch" }}>
          <KilitliOzellik
            mevcutPlan={veri.plan}
            gerekenPlan={veri.plan === "UCRETSIZ" ? "PRO" : "PRO_PLUS"}
            kaynak="deneme-hakki"
            baslik={`Bu haftaki toplam ${veri.hak.limit} deneme hakkını kullandın`}
            ozellikler={[
              "Hakkın pazartesi yenilenir",
              ...(veri.plan === "UCRETSIZ" ? ["Pro: haftada toplam 3 deneme ve ders karnesi"] : []),
              "Pro+: sınırsız deneme, konu bazlı değerlendirme ve gelişim takibi",
            ]}
          >
            <View style={{ minHeight: 280, alignItems: "center", justifyContent: "center" }}>
              <View style={[s.buton, { backgroundColor: tema.buton, paddingHorizontal: 32 }]}>
                <T w="kalin" style={{ color: "#fff", fontSize: 16 }}>
                  Sınava Başla
                </T>
              </View>
            </View>
          </KilitliOzellik>
        </View>
      ) : (
        <BaslaButonu duzey={duzey} renk={tema.buton} hak={veri.hak} basladi={() => yenile(false)} />
      )}
    </BaslangicKarti>
  );
}

/** "Sinava Basla": sure kazayla baslamasin diye once onay (sitedeki DenemeBaslaButonu). */
function BaslaButonu({ duzey, renk: r, hak, basladi }: { duzey: DenemeDuzeyi; renk: string; hak: { limit: number | null; kullanilan: number }; basladi: () => void }) {
  const [yukleniyor, setYukleniyor] = useState(false);
  const [hata, setHata] = useState<string | null>(null);
  function sor() {
    Alert.alert("Hazır mısın?", "Süre, başlattığın anda işlemeye başlar ve durdurulamaz. Bu düzeyde bugün yalnızca bir kez sınava girebilirsin.", [
      { text: "Vazgeç", style: "cancel" },
      {
        text: "Başlat",
        onPress: async () => {
          setYukleniyor(true);
          setHata(null);
          try {
            await api("/api/kpss-denemesi/basla", { govde: { duzey } });
            basladi();
          } catch (e) {
            setHata(e instanceof Error ? e.message : "Sınav başlatılamadı.");
            setYukleniyor(false);
          }
        },
      },
    ]);
  }
  return (
    <View style={{ alignItems: "center", gap: 8, alignSelf: "stretch" }}>
      <Pressable onPress={sor} disabled={yukleniyor} style={[s.basla, { backgroundColor: r, opacity: yukleniyor ? 0.6 : 1 }]}>
        <Play size={20} color="#fff" fill="#fff" />
        <T w="kalin" style={{ color: "#fff", fontSize: 16 }}>
          {yukleniyor ? "Başlatılıyor…" : "Sınava Başla"}
        </T>
      </Pressable>
      {!!hata && <T style={{ color: renk.hata }}>{hata}</T>}
      {hak.limit !== null && (
        <T w="orta" style={{ fontSize: 12, color: renk.yaziIkincil, textAlign: "center" }}>
          Bu hafta toplam {hak.kullanilan}/{hak.limit} deneme hakkını kullandın (tüm düzeyler dahil).
        </T>
      )}
    </View>
  );
}

/** Sitedeki BaslangicKarti: duzey renginde bant, bolum/sure tablosu, kurallar ve eylem alani. */
function BaslangicKarti({ duzey, plan, children }: { duzey: DenemeDuzeyi; plan: Plan | null; children: ReactNode }) {
  const tema = DUZEY_TEMA[duzey];
  const KURALLAR: { ikon: LucideIcon; metin: string }[] = [
    { ikon: Clock, metin: `${SINAV_SURESI_DK} dakika; süre başladıktan sonra durdurulamaz.` },
    { ikon: MinusCircle, metin: "4 yanlış 1 doğruyu götürür; emin olmadığın soruyu boş bırakabilirsin." },
    { ikon: CalendarCheck, metin: hakMetni(plan) },
    { ikon: Flag, metin: "Soruları işaretleyip sonra dönebilirsin." },
    { ikon: LayoutGrid, metin: "Soru haritasıyla bölümler arasında serbestçe gezinebilirsin." },
  ];
  return (
    <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 32 }}>
      <Kart style={{ overflow: "hidden" }}>
        <LinearGradient colors={tema.zemin} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={{ padding: 24, overflow: "hidden" }}>
          <View style={{ position: "absolute", right: -24, bottom: -40, opacity: 0.1 }}>
            <GraduationCap size={190} color="#fff" strokeWidth={1.25} />
          </View>
          <T w="kalin" style={{ fontSize: 11, letterSpacing: 1.5, color: "rgba(255,255,255,0.8)" }}>
            BUGÜNÜN DENEMESİ · {GUN.format(new Date()).toLocaleUpperCase("tr-TR")}
          </T>
          <T w="kalin" style={{ marginTop: 8, fontSize: 28, lineHeight: 34, color: "#fff", letterSpacing: -0.5 }}>
            {DUZEY_LABEL[duzey]} KPSS Denemesi
          </T>
          <View style={{ marginTop: 16, flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
            {[
              { ikon: ListChecks, metin: `${TOPLAM_SORU} soru` },
              { ikon: Clock, metin: `${SINAV_SURESI_DK} dakika` },
              { ikon: null, metin: "60 Genel Yetenek + 60 Genel Kültür" },
            ].map(({ ikon: Ikon, metin }) => (
              <View key={metin} style={s.bantCip}>
                {Ikon && <Ikon size={16} color="#fff" />}
                <T w="yariKalin" style={{ color: "#fff", fontSize: 13 }}>
                  {metin}
                </T>
              </View>
            ))}
          </View>
        </LinearGradient>

        <View style={{ padding: 20, gap: 24 }}>
          <View>
            <T w="kalin">Bölümler</T>
            <DersSeridi etiketsiz />
            <View style={{ marginTop: 8 }}>
              <View style={s.tabloSatir}>
                <T w="orta" style={[s.tabloEtiket, { flex: 1 }]}>
                  Ders
                </T>
                <T w="orta" style={[s.tabloEtiket, s.sayi]}>
                  Soru
                </T>
                <T w="orta" style={[s.tabloEtiket, s.sure]}>
                  Önerilen süre
                </T>
              </View>
              {DERS_SIRASI.map((d) => (
                <View key={d} style={[s.tabloSatir, { borderTopWidth: 1, borderTopColor: "rgba(36,102,195,0.05)" }]}>
                  <View style={{ flex: 1, flexDirection: "row", alignItems: "center", gap: 8 }}>
                    <View style={{ width: 10, height: 10, borderRadius: 5, backgroundColor: DERS_RENGI[d] }} />
                    <T w="orta">{DERS_LABEL[d]}</T>
                  </View>
                  <T style={s.sayi}>{DERS_DAGILIMI[d]}</T>
                  <T style={s.sure}>~{ONERILEN_SURE_DK[d]} dk</T>
                </View>
              ))}
              <View style={[s.tabloSatir, { borderTopWidth: 1, borderTopColor: "rgba(36,102,195,0.1)" }]}>
                <T w="kalin" style={{ flex: 1 }}>
                  Toplam
                </T>
                <T w="kalin" style={s.sayi}>
                  {TOPLAM_SORU}
                </T>
                <T w="kalin" style={s.sure}>
                  {SINAV_SURESI_DK} dk
                </T>
              </View>
            </View>
          </View>
          <View>
            <T w="kalin">Kurallar</T>
            <View style={{ marginTop: 12, gap: 12 }}>
              {KURALLAR.map(({ ikon: Ikon, metin }) => (
                <View key={metin} style={{ flexDirection: "row", gap: 10 }}>
                  <View style={[s.kuralIkon, { backgroundColor: tema.acik }]}>
                    <Ikon size={16} color={tema.metin} />
                  </View>
                  <T style={{ flex: 1, color: "#334155", lineHeight: 20 }}>{metin}</T>
                </View>
              ))}
            </View>
          </View>
        </View>

        <View style={[s.eylem, { borderTopColor: tema.kenar, backgroundColor: tema.acik }]}>
          {children}
          <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
            <Target size={14} color={tema.metin} />
            <T style={{ flex: 1, fontSize: 12, color: renk.yaziIkincil }}>
              {plan === "UCRETSIZ"
                ? "Sınav sonunda puanını görürsün; ders karnesi Pro'da, konu tavsiyeleri Pro+'da."
                : plan === "PRO"
                  ? "Sınav sonunda ders karnen ve soru çözümlerin hazırlanır; konu tavsiyeleri Pro+'da."
                  : "Sınav sonunda ders karnen ve konu bazlı çalışma tavsiyelerin hazırlanır."}
            </T>
          </View>
        </View>
      </Kart>
    </ScrollView>
  );
}

const s = StyleSheet.create({
  buton: { borderRadius: 999, paddingHorizontal: 22, paddingVertical: 11, alignItems: "center" },
  basla: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, alignSelf: "stretch", borderRadius: 999, paddingVertical: 15 },
  bantCip: { flexDirection: "row", alignItems: "center", gap: 6, backgroundColor: "rgba(255,255,255,0.15)", borderWidth: 1, borderColor: "rgba(255,255,255,0.25)", borderRadius: 999, paddingHorizontal: 12, paddingVertical: 5 },
  tabloSatir: { flexDirection: "row", alignItems: "center", paddingVertical: 8 },
  tabloEtiket: { fontSize: 12, color: renk.soluk },
  sayi: { width: 50, textAlign: "right" },
  sure: { width: 100, textAlign: "right" },
  kuralIkon: { width: 28, height: 28, borderRadius: 8, alignItems: "center", justifyContent: "center" },
  eylem: { alignItems: "center", gap: 12, borderTopWidth: 1, padding: 20 },
});

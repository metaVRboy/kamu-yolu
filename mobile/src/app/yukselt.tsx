import { useState } from "react";
import { Pressable, ScrollView, StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { Image } from "expo-image";
import * as WebBrowser from "expo-web-browser";
import { router, useLocalSearchParams } from "expo-router";
import { BellRing, Check, CheckCircle2, Crown, Flame, Minus, ShieldCheck, Sparkles, X } from "lucide-react-native";
import { T, Yukleniyor } from "@/bilesenler/ui";
import { api, SITE, useVeri } from "@/lib/api";
import type { Plan } from "@/lib/kpss";
import { KARSILASTIRMA, KAYNAK_METNI, PLAN_ADI, kalanSureMetni, tl, yillikBedavaAy, yillikTasarruf, type FiyatTablosu, type UcretliPlan } from "@/lib/planlar";
import { renk } from "@/lib/tema";

type Ozet = {
  girisli: boolean;
  plan: Plan | null;
  talep: { plan: UcretliPlan; yillik: boolean } | null;
  aktifIlan: number;
  haftalikDeneme: number;
  fiyat: { tablo: FiyatTablosu; kampanya: { ad: string; kalanMs: number } | null };
};

// Sitedeki TEMA: Pro mavi-indigo, Pro+ mor-fusya.
const TEMA: Record<UcretliPlan, { zemin: [string, string, string]; buton: [string, string]; metin: string; acik: string; halka: string }> = {
  PRO: { zemin: ["#2563eb", "#4f46e5", "#0ea5e9"], buton: ["#2563eb", "#4f46e5"], metin: "#1d4ed8", acik: "#eff6ff", halka: "#3b82f6" },
  PRO_PLUS: { zemin: ["#7c3aed", "#c026d3", "#4338ca"], buton: ["#7c3aed", "#c026d3"], metin: "#6d28d9", acik: "#f5f3ff", halka: "#8b5cf6" },
};

/** Sitedeki YukseltmePenceresi: odeme acilana kadar "Acilinca haber ver" (POST /api/yukseltme-talebi). */
export default function Yukselt() {
  const p = useLocalSearchParams<{ plan?: UcretliPlan; kaynak?: string }>();
  const kaynak = p.kaynak && KAYNAK_METNI[p.kaynak] ? p.kaynak : "genel";
  const { veri: ozet } = useVeri<Ozet>("/api/yukseltme-talebi");
  const [secilenIstek, setSecilen] = useState<UcretliPlan>(p.plan ?? "PRO_PLUS");
  const [yillik, setYillik] = useState(false);
  const [durum, setDurum] = useState<"bos" | "gonderiliyor" | "tamam">("bos");
  const [hata, setHata] = useState<string | null>(null);
  const ust = useSafeAreaInsets();

  if (!ozet) return <Yukleniyor />;
  // Pro'nun yukselebilecegi tek plan Pro+.
  const secilen: UcretliPlan = ozet.plan === "PRO" ? "PRO_PLUS" : secilenIstek;
  const tema = TEMA[secilen];
  const metin = KAYNAK_METNI[kaynak];
  const mevcut = ozet.plan;
  const zatenListede = ozet.talep?.plan === secilen && ozet.talep.yillik === yillik;
  const bedava = yillikBedavaAy(ozet.fiyat.tablo);

  async function haberVer() {
    setDurum("gonderiliyor");
    setHata(null);
    try {
      await api("/api/yukseltme-talebi", { govde: { plan: secilen, yillik, kaynak } });
      setDurum("tamam");
    } catch (e) {
      setHata(e instanceof Error ? e.message : "Bir hata oluştu.");
      setDurum("bos");
    }
  }

  return (
    <View style={{ flex: 1, backgroundColor: "#fff" }}>
      <ScrollView contentContainerStyle={{ paddingBottom: ust.bottom + 24 }}>
        <LinearGradient colors={tema.zemin} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={{ paddingHorizontal: 24, paddingTop: ust.top + 24, paddingBottom: 24, overflow: "hidden" }}>
          <Image source={require("../../assets/android-icon-monochrome.png")} tintColor="#ffffff" style={s.amblem} contentFit="contain" />
          <View style={s.tac}>
            <Crown size={28} color="#fcd34d" />
          </View>
          <T w="kalin" style={{ marginTop: 20, fontSize: 12, letterSpacing: 1.5, color: "rgba(255,255,255,0.75)" }}>
            KAMU YOLU {PLAN_ADI[secilen].toLocaleUpperCase("tr-TR")}
          </T>
          <T w="kalin" style={{ marginTop: 4, fontSize: 24, lineHeight: 30, color: "#fff", letterSpacing: -0.5 }}>
            {metin.baslik}
          </T>
          <T style={{ marginTop: 8, color: "rgba(255,255,255,0.85)", lineHeight: 20 }}>{metin.alt}</T>
          <View style={{ marginTop: 16, flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
            <View style={s.sayiCip}>
              <T w="yariKalin" style={{ fontSize: 12, color: "#fff" }}>
                Şu an {ozet.aktifIlan.toLocaleString("tr-TR")} aktif kamu ilanı
              </T>
            </View>
            {/* Kucuk sayi sosyal kanit degil: anlamli olunca goster (sitedeki gibi). */}
            {ozet.haftalikDeneme >= 50 && (
              <View style={s.sayiCip}>
                <T w="yariKalin" style={{ fontSize: 12, color: "#fff" }}>
                  Bu hafta {ozet.haftalikDeneme.toLocaleString("tr-TR")} KPSS denemesi çözüldü
                </T>
              </View>
            )}
          </View>
          <View style={{ marginTop: 16, gap: 6 }}>
            {["İstediğin an iptal et", "İptal edersen dönem sonuna kadar kullanmaya devam edersin", "Kart bilgilerin bizde saklanmaz"].map((g) => (
              <View key={g} style={{ flexDirection: "row", gap: 8 }}>
                <ShieldCheck size={16} color="#6ee7b7" />
                <T style={{ flex: 1, color: "rgba(255,255,255,0.9)", fontSize: 13 }}>{g}</T>
              </View>
            ))}
          </View>
        </LinearGradient>
        <Pressable onPress={() => router.back()} style={[s.kapat, { top: ust.top + 12 }]} hitSlop={8}>
          <X size={18} color="#475569" />
        </Pressable>

        <View style={{ padding: 20 }}>
          {durum === "tamam" ? (
            <View style={{ alignItems: "center", paddingVertical: 40 }}>
              <View style={[s.basari, { backgroundColor: tema.acik }]}>
                <CheckCircle2 size={36} color={tema.metin} />
              </View>
              <T w="kalin" style={{ marginTop: 16, fontSize: 20 }}>
                Harika, yerin ayrıldı!
              </T>
              <T style={{ marginTop: 8, textAlign: "center", color: renk.yaziIkincil, lineHeight: 20 }}>
                Ödeme altyapımız açıldığında{" "}
                <T w="kalin">
                  {PLAN_ADI[secilen]} · {yillik ? "yıllık" : "aylık"}
                </T>{" "}
                için ilk sana e-posta göndereceğiz.
              </T>
              <Pressable onPress={() => router.back()} style={s.tamam}>
                <T w="yariKalin" style={{ color: "#fff" }}>
                  Tamam
                </T>
              </Pressable>
            </View>
          ) : (
            <>
              {ozet.fiyat.kampanya && (
                <LinearGradient colors={["#f43f5e", "#f97316"]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={s.kampanya}>
                  <View style={{ flexDirection: "row", alignItems: "center", gap: 8, flex: 1 }}>
                    <Flame size={16} color="#fff" />
                    <T w="kalin" style={{ color: "#fff", flex: 1 }}>
                      {ozet.fiyat.kampanya.ad}
                    </T>
                  </View>
                  <View style={{ backgroundColor: "rgba(255,255,255,0.2)", borderRadius: 999, paddingHorizontal: 8, paddingVertical: 2 }}>
                    <T w="kalin" style={{ color: "#fff", fontSize: 12 }}>
                      {kalanSureMetni(ozet.fiyat.kampanya.kalanMs)}
                    </T>
                  </View>
                </LinearGradient>
              )}
              <View style={s.bilgi}>
                <Sparkles size={16} color="#92400e" />
                <T w="orta" style={{ flex: 1, fontSize: 12, color: "#92400e" }}>
                  Ödeme altyapımız çok yakında açılıyor. Şimdi yerini ayır, açıldığında ilk sen haberdar ol.
                </T>
              </View>

              <View style={{ marginTop: 18, alignItems: "center" }}>
                <View style={s.donem}>
                  {[false, true].map((y) => (
                    <Pressable key={String(y)} onPress={() => setYillik(y)} style={[s.donemBtn, yillik === y && s.donemSecili]}>
                      <T w="yariKalin" style={{ color: yillik === y ? renk.yazi : "#64748b" }}>
                        {y ? "Yıllık" : "Aylık"}
                      </T>
                      {y && bedava > 0 && (
                        <View style={s.bedava}>
                          <T w="kalin" style={{ fontSize: 10, color: "#fff" }}>
                            {bedava} ay bedava
                          </T>
                        </View>
                      )}
                    </Pressable>
                  ))}
                </View>
              </View>

              <View style={{ marginTop: 20, flexDirection: "row", gap: 10 }}>
                {(["PRO", "PRO_PLUS"] as const).map((pl) => {
                  const f = ozet.fiyat.tablo[pl];
                  const d = yillik ? f.yillik : f.aylik;
                  const sahip = mevcut === pl || (mevcut === "PRO_PLUS" && pl === "PRO");
                  const secili = secilen === pl && !sahip;
                  const kart = (
                    <Pressable
                      disabled={sahip}
                      onPress={() => setSecilen(pl)}
                      style={[s.planKart, { borderColor: secili ? TEMA[pl].halka : "#e2e8f0", borderWidth: secili ? 2 : 1, opacity: sahip ? 0.6 : 1 }]}
                    >
                      <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
                        <T w="kalin" style={{ fontSize: 16 }}>
                          {PLAN_ADI[pl]}
                        </T>
                        <View style={[s.radyo, secili && { backgroundColor: TEMA[pl].halka, borderColor: TEMA[pl].halka }]}>{secili && <Check size={12} color="#fff" />}</View>
                      </View>
                      {!!d.etiket && (
                        <View style={s.etiket}>
                          <T w="kalin" style={{ fontSize: 10, color: "#be123c" }}>
                            {d.etiket}
                          </T>
                        </View>
                      )}
                      <View style={{ marginTop: 6, flexDirection: "row", alignItems: "baseline", flexWrap: "wrap", gap: 4 }}>
                        {d.odenecek < d.liste && (
                          <T w="yariKalin" style={{ fontSize: 14, color: "#94a3b8", textDecorationLine: "line-through" }}>
                            {tl(d.liste)}
                          </T>
                        )}
                        <T w="kalin" style={{ fontSize: 22 }}>
                          {tl(d.odenecek)}
                        </T>
                        <T style={{ fontSize: 12, color: renk.soluk }}>/ {yillik ? "yıl" : "ay"}</T>
                      </View>
                      <T w="yariKalin" style={{ marginTop: 4, fontSize: 11, color: TEMA[pl].metin }}>
                        {yillik
                          ? `Aylık ${tl(Math.round((f.yillik.odenecek / 12) * 100) / 100)}'ye denk · %${yillikTasarruf(f)} tasarruf`
                          : `Günde ${tl(Math.round((f.aylik.odenecek / 30) * 100) / 100)}, bir çaydan ucuz`}
                      </T>
                      {sahip && (
                        <T w="yariKalin" style={{ marginTop: 6, fontSize: 12, color: "#64748b" }}>
                          Mevcut planın
                        </T>
                      )}
                    </Pressable>
                  );
                  return pl === "PRO_PLUS" ? (
                    <LinearGradient key={pl} colors={["#8b5cf6", "#d946ef", "#fbbf24"]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={s.cerceve}>
                      <View style={s.enCok}>
                        <T w="kalin" style={{ fontSize: 10, color: "#fff" }}>
                          En çok değer
                        </T>
                      </View>
                      {kart}
                    </LinearGradient>
                  ) : (
                    <View key={pl} style={{ flex: 1, padding: 2 }}>
                      {kart}
                    </View>
                  );
                })}
              </View>

              <View style={s.tablo}>
                <View style={[s.satir, { backgroundColor: "#f8fafc" }]}>
                  <T w="kalin" style={[s.ozellik, { fontSize: 11, color: "#64748b" }]}>
                    Özellik
                  </T>
                  {(["UCRETSIZ", "PRO", "PRO_PLUS"] as const).map((pl) => (
                    <T key={pl} w="kalin" style={[s.hucre, { fontSize: 11, color: pl === secilen ? tema.metin : "#64748b" }]}>
                      {pl === "UCRETSIZ" ? "Ücretsiz" : PLAN_ADI[pl]}
                    </T>
                  ))}
                </View>
                {KARSILASTIRMA.map((x) => {
                  const vurgulu = x.kaynak === kaynak;
                  return (
                    <View key={x.ozellik} style={[s.satir, { borderTopWidth: 1, borderTopColor: "#f1f5f9" }, vurgulu && { backgroundColor: "#fffbeb" }]}>
                      <View style={s.ozellik}>
                        <T style={{ fontSize: 12, color: "#334155" }}>{x.ozellik}</T>
                        {vurgulu && (
                          <View style={s.buradasin}>
                            <T w="kalin" style={{ fontSize: 10, color: "#78350f" }}>
                              bunun için buradasın
                            </T>
                          </View>
                        )}
                      </View>
                      {(["UCRETSIZ", "PRO", "PRO_PLUS"] as const).map((pl) => {
                        const d = x.degerler[pl];
                        return (
                          <View key={pl} style={[s.hucre, pl === secilen && { backgroundColor: tema.acik, borderRadius: 4 }]}>
                            {typeof d === "string" ? (
                              <T w="kalin" style={{ fontSize: 12 }}>
                                {d}
                              </T>
                            ) : d ? (
                              <Check size={16} color={pl === "UCRETSIZ" ? "#94a3b8" : tema.metin} />
                            ) : (
                              <Minus size={16} color="#cbd5e1" />
                            )}
                          </View>
                        );
                      })}
                    </View>
                  );
                })}
              </View>

              <View style={{ marginTop: 20 }}>
                {mevcut === "PRO_PLUS" ? (
                  <View style={[s.not, { backgroundColor: tema.acik }]}>
                    <Crown size={20} color={tema.metin} />
                    <T w="yariKalin" style={{ color: tema.metin }}>
                      Zaten en kapsamlı plan olan Pro+&apos;dasın.
                    </T>
                  </View>
                ) : !ozet.girisli ? (
                  <Pressable onPress={() => router.replace("/kayit")}>
                    <LinearGradient colors={tema.buton} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={s.eylem}>
                      <T w="kalin" style={{ color: "#fff", fontSize: 16 }}>
                        Önce ücretsiz hesabını oluştur
                      </T>
                    </LinearGradient>
                  </Pressable>
                ) : zatenListede ? (
                  <View style={[s.not, { backgroundColor: tema.acik }]}>
                    <CheckCircle2 size={20} color={tema.metin} />
                    <T w="yariKalin" style={{ flex: 1, color: tema.metin }}>
                      Bu seçim için zaten listedesin; ödeme açılınca haber vereceğiz.
                    </T>
                  </View>
                ) : (
                  <Pressable onPress={haberVer} disabled={durum === "gonderiliyor"}>
                    <LinearGradient colors={tema.buton} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={[s.eylem, durum === "gonderiliyor" && { opacity: 0.7 }]}>
                      <BellRing size={20} color="#fff" />
                      <T w="kalin" style={{ color: "#fff", fontSize: 16 }}>
                        {PLAN_ADI[secilen]}&apos;ya geç · Açılınca haber ver
                      </T>
                    </LinearGradient>
                  </Pressable>
                )}
                {!!hata && <T style={{ marginTop: 8, textAlign: "center", color: renk.hata }}>{hata}</T>}
                <Pressable onPress={() => router.back()} style={{ paddingVertical: 12, alignItems: "center" }}>
                  <T w="orta" style={{ color: renk.soluk }}>
                    Şimdi değil
                  </T>
                </Pressable>
                <T style={{ textAlign: "center", fontSize: 11, color: renk.soluk, lineHeight: 16 }}>
                  Ödeme açıldığında{" "}
                  <T style={{ fontSize: 11, color: renk.soluk, textDecorationLine: "underline" }} onPress={() => WebBrowser.openBrowserAsync(`${SITE}/on-bilgilendirme-formu`)}>
                    Ön Bilgilendirme Formu
                  </T>{" "}
                  ve{" "}
                  <T style={{ fontSize: 11, color: renk.soluk, textDecorationLine: "underline" }} onPress={() => WebBrowser.openBrowserAsync(`${SITE}/mesafeli-satis-sozlesmesi`)}>
                    Mesafeli Satış Sözleşmesi
                  </T>{" "}
                  onayın ayrıca alınır. Fiyatlar KDV dahildir.
                </T>
              </View>
            </>
          )}
        </View>
      </ScrollView>
    </View>
  );
}

const s = StyleSheet.create({
  amblem: { position: "absolute", right: -50, bottom: -50, width: 240, height: 240, opacity: 0.1 },
  tac: { width: 56, height: 56, borderRadius: 16, backgroundColor: "rgba(255,255,255,0.15)", borderWidth: 1, borderColor: "rgba(255,255,255,0.3)", alignItems: "center", justifyContent: "center" },
  sayiCip: { backgroundColor: "rgba(255,255,255,0.15)", borderWidth: 1, borderColor: "rgba(255,255,255,0.25)", borderRadius: 999, paddingHorizontal: 12, paddingVertical: 5 },
  kapat: { position: "absolute", right: 12, width: 32, height: 32, borderRadius: 16, backgroundColor: "rgba(255,255,255,0.9)", alignItems: "center", justifyContent: "center" },
  basari: { width: 64, height: 64, borderRadius: 32, alignItems: "center", justifyContent: "center" },
  tamam: { marginTop: 24, backgroundColor: "#0f172a", borderRadius: 999, paddingHorizontal: 28, paddingVertical: 11 },
  kampanya: { flexDirection: "row", alignItems: "center", gap: 8, borderRadius: 16, paddingHorizontal: 14, paddingVertical: 10, marginBottom: 8 },
  bilgi: { flexDirection: "row", alignItems: "center", gap: 8, backgroundColor: "#fffbeb", borderRadius: 16, paddingHorizontal: 14, paddingVertical: 10 },
  donem: { flexDirection: "row", backgroundColor: "#f1f5f9", borderRadius: 999, padding: 4 },
  donemBtn: { paddingHorizontal: 22, paddingVertical: 7, borderRadius: 999 },
  donemSecili: { backgroundColor: "#fff", shadowColor: "#000", shadowOpacity: 0.08, shadowRadius: 4, shadowOffset: { width: 0, height: 1 }, elevation: 2 },
  bedava: { position: "absolute", top: -10, right: -14, backgroundColor: "#10b981", borderRadius: 999, paddingHorizontal: 6, paddingVertical: 2 },
  planKart: { flex: 1, backgroundColor: "#fff", borderRadius: 18, padding: 14 },
  cerceve: { flex: 1, borderRadius: 20, padding: 2 },
  enCok: { position: "absolute", top: -10, alignSelf: "center", zIndex: 2, backgroundColor: "#7c3aed", borderRadius: 999, paddingHorizontal: 10, paddingVertical: 2 },
  radyo: { width: 20, height: 20, borderRadius: 10, borderWidth: 2, borderColor: "#cbd5e1", alignItems: "center", justifyContent: "center" },
  etiket: { alignSelf: "flex-start", marginTop: 8, backgroundColor: "#ffe4e6", borderRadius: 999, paddingHorizontal: 8, paddingVertical: 2 },
  tablo: { marginTop: 20, borderWidth: 1, borderColor: "#e2e8f0", borderRadius: 16, overflow: "hidden" },
  satir: { flexDirection: "row", alignItems: "center", paddingHorizontal: 10, paddingVertical: 7 },
  ozellik: { flex: 1, paddingRight: 6 },
  hucre: { width: 56, alignItems: "center", textAlign: "center", paddingVertical: 2 },
  buradasin: { alignSelf: "flex-start", marginTop: 3, backgroundColor: "#fde68a", borderRadius: 999, paddingHorizontal: 6, paddingVertical: 1 },
  not: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, borderRadius: 16, paddingHorizontal: 16, paddingVertical: 14 },
  eylem: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, borderRadius: 16, paddingHorizontal: 16, paddingVertical: 15 },
});

import { useCallback, useState } from "react";
import { Pressable, RefreshControl, ScrollView, StyleSheet, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useFocusEffect } from "expo-router";
import { Check, Crown, Flame } from "lucide-react-native";
import { HataKutusu, Kart, SayfaBasligi, T, Yukleniyor } from "@/bilesenler/ui";
import { yukseltmeAc } from "@/bilesenler/KilitliOzellik";
import { GirisDaveti } from "@/bilesenler/GirisDaveti";
import { useVeri } from "@/lib/api";
import type { Plan } from "@/lib/kpss";
import { useOturum } from "@/lib/oturum";
import { PLAN_ADI, kalanSureMetni, tl, type FiyatTablosu } from "@/lib/planlar";
import { renk } from "@/lib/tema";

type Veri = { plan: Plan; bitis: string | null; kalanGun: number | null; otomatikYenileme: boolean; fiyat: { tablo: FiyatTablosu; kampanya: { ad: string; kalanMs: number } | null } };

// Sitedeki AbonelikPlanlari (uygulamada reklam olmadigi icin "Reklamsiz deneyim" maddesi yok).
const PLANLAR: { key: Plan; aciklama: string; populer?: boolean; ozellikler: string[] }[] = [
  {
    key: "UCRETSIZ",
    aciklama: "Temel kullanım için.",
    ozellikler: ["Tüm ilanları görüntüleme", "Bölüm/seviyeye göre arama", "Becayiş ilanlarını görüntüleme", "Haftada toplam 1 KPSS denemesi (puan sonucu)"],
  },
  {
    key: "PRO",
    aciklama: "Aktif iş arayanlar için.",
    populer: true,
    ozellikler: [
      "Standart'taki her şey",
      "Kişisel bildirimler: yeni ilan ve becayiş mesajı",
      "Bana özel ilanlar",
      "SMS ile anlık ilan bildirimi",
      "Becayiş talebi oluşturma",
      "Becayiş için site içi mesajlaşma",
      "Haftada toplam 3 KPSS denemesi, ders karnesi ve soru çözümleri",
    ],
  },
  {
    key: "PRO_PLUS",
    aciklama: "En kapsamlı deneyim.",
    ozellikler: ["Pro'daki her şey", "Sınırsız KPSS denemesi, konu bazlı değerlendirme ve gelişim takibi", "Öncelikli destek"],
  },
];
const SIRA: Record<Plan, number> = { UCRETSIZ: 0, PRO: 1, PRO_PLUS: 2 };

/** Sitedeki /profilim/abonelik: mevcut plan + planlar (odeme acilana kadar "haber ver"). */
export default function Abonelik() {
  const { kullanici } = useOturum();
  const [donem, setDonem] = useState<"aylik" | "yillik">("aylik");
  const { veri, hata, yenileniyor, yenile } = useVeri<Veri>(kullanici ? `/api/mobil/abonelik?u=${kullanici.id}` : null);
  useFocusEffect(
    useCallback(() => {
      if (kullanici) yenile(false);
    }, [kullanici, yenile]),
  );
  if (kullanici === undefined) return <Yukleniyor />;
  if (!kullanici) return <GirisDaveti />;
  if (hata && !veri) return <HataKutusu mesaj={hata} tekrar={yenile} />;
  if (!veri) return <Yukleniyor />;
  const ucretli = veri.plan !== "UCRETSIZ";

  return (
    <ScrollView contentContainerStyle={{ padding: 16, gap: 16, paddingBottom: 40 }} refreshControl={<RefreshControl refreshing={yenileniyor} onRefresh={yenile} tintColor={renk.birincil} />}>
      <SayfaBasligi baslik="Aboneliğim" aciklama="Planını yönet, ihtiyacına göre yükselt." />

      <Kart style={{ padding: 20, gap: 12 }}>
        <View>
          <T w="yariKalin" style={{ fontSize: 12, color: renk.soluk }}>
            Mevcut planın
          </T>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 8, marginTop: 4 }}>
            <T w="kalin" style={{ fontSize: 20 }}>
              {PLAN_ADI[veri.plan]}
            </T>
            {ucretli && <Crown size={20} color="#f59e0b" />}
          </View>
          <T style={{ marginTop: 4, color: renk.yaziIkincil, lineHeight: 20 }}>
            {!ucretli
              ? "Ücretsiz plandasın. Pro ile SMS bildirimleri, becayiş mesajlaşması ve KPSS ders karnesi açılır."
              : veri.bitis
                ? `${veri.bitis} tarihine kadar geçerli (${veri.kalanGun} gün kaldı).`
                : "Süresiz (yönetici tarafından tanımlandı)."}
          </T>
        </View>
        {ucretli && (
          <View style={s.yenileme}>
            <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
              <T w="yariKalin">Otomatik yenileme</T>
              {/* Odeme altyapisi gelene kadar salt-okunur. */}
              <View style={[s.anahtar, { backgroundColor: veri.otomatikYenileme ? renk.birincil : "#cbd5e1" }]}>
                <View style={[s.top, { alignSelf: veri.otomatikYenileme ? "flex-end" : "flex-start" }]} />
              </View>
            </View>
            <T style={{ marginTop: 8, fontSize: 12, color: renk.soluk, lineHeight: 17 }}>
              Ödeme altyapısı aktif olunca buradan açıp kapatabileceksin. Kapatırsan aboneliğin hemen bitmez; ödediğin dönemin sonuna kadar tüm özellikleri kullanmaya devam edersin.
            </T>
          </View>
        )}
      </Kart>

      {veri.fiyat.kampanya && (
        <LinearGradient colors={["#f43f5e", "#f97316"]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={s.kampanya}>
          <Flame size={16} color="#fff" />
          <T w="kalin" style={{ color: "#fff" }}>
            {veri.fiyat.kampanya.ad}
          </T>
          <View style={{ backgroundColor: "rgba(255,255,255,0.2)", borderRadius: 999, paddingHorizontal: 8, paddingVertical: 2 }}>
            <T w="kalin" style={{ color: "#fff", fontSize: 12 }}>
              {kalanSureMetni(veri.fiyat.kampanya.kalanMs)}
            </T>
          </View>
        </LinearGradient>
      )}

      <View style={s.donem}>
        {(["aylik", "yillik"] as const).map((d) => (
          <Pressable key={d} onPress={() => setDonem(d)} style={[s.donemSecenek, donem === d && { backgroundColor: renk.birincil }]}>
            <T w="orta" style={{ color: donem === d ? "#fff" : renk.soluk }}>
              {d === "aylik" ? "Aylık" : "Yıllık"}
            </T>
          </Pressable>
        ))}
      </View>

      {PLANLAR.map((p) => {
        const d = p.key === "UCRETSIZ" ? null : veri.fiyat.tablo[p.key][donem];
        return (
          <View key={p.key} style={{ marginTop: p.populer ? 10 : 0 }}>
            <Kart style={[{ padding: 20, gap: 14 }, p.populer && { borderColor: renk.birincil, borderWidth: 1.5 }]}>
              <View>
                <T w="yariKalin" style={{ fontSize: 16 }}>
                  {PLAN_ADI[p.key]}
                </T>
                <T style={{ marginTop: 2, color: renk.soluk }}>{p.aciklama}</T>
              </View>
              {d ? (
                <View>
                  {!!d.etiket && (
                    <View style={{ alignSelf: "flex-start", backgroundColor: "#ffe4e6", borderRadius: 999, paddingHorizontal: 8, paddingVertical: 2, marginBottom: 4 }}>
                      <T w="kalin" style={{ fontSize: 11, color: "#be123c" }}>
                        {d.etiket}
                      </T>
                    </View>
                  )}
                  <T>
                    {d.odenecek < d.liste && (
                      <T w="yariKalin" style={{ fontSize: 16, color: "#94a3b8", textDecorationLine: "line-through" }}>
                        {tl(d.liste)}{" "}
                      </T>
                    )}
                    <T w="kalin" style={{ fontSize: 24 }}>
                      {tl(d.odenecek)}
                    </T>
                    <T style={{ color: renk.soluk }}> / {donem === "aylik" ? "ay" : "yıl"}</T>
                  </T>
                </View>
              ) : (
                <T w="kalin" style={{ fontSize: 24 }}>
                  Ücretsiz
                </T>
              )}
              <View style={{ gap: 8 }}>
                {p.ozellikler.map((o) => (
                  <View key={o} style={{ flexDirection: "row", gap: 8 }}>
                    <Check size={16} color={renk.birincil} style={{ marginTop: 2 }} />
                    <T style={{ flex: 1, color: "#334155", lineHeight: 20 }}>{o}</T>
                  </View>
                ))}
              </View>
              {p.key === veri.plan ? (
                <View style={[s.dugme, { backgroundColor: "rgba(36,102,195,0.1)", borderWidth: 1, borderColor: "rgba(36,102,195,0.25)" }]}>
                  <T w="yariKalin" style={{ color: renk.birincil }}>
                    Mevcut Planın
                  </T>
                </View>
              ) : p.key === "UCRETSIZ" || SIRA[p.key] < SIRA[veri.plan] ? (
                <View style={[s.dugme, { backgroundColor: "#e2e8f0" }]}>
                  <T w="yariKalin" style={{ color: "#64748b" }}>
                    İndirgeme Yakında
                  </T>
                </View>
              ) : (
                <Pressable onPress={() => yukseltmeAc(p.key as "PRO" | "PRO_PLUS", "genel")}>
                  <LinearGradient colors={p.key === "PRO_PLUS" ? ["#7c3aed", "#c026d3"] : ["#2563eb", "#4f46e5"]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={s.dugme}>
                    <T w="kalin" style={{ color: "#fff" }}>
                      {PLAN_ADI[p.key]}&apos;ya Yükselt
                    </T>
                  </LinearGradient>
                </Pressable>
              )}
            </Kart>
            {p.populer && (
              <View style={s.populer}>
                <T w="yariKalin" style={{ fontSize: 12, color: "#fff" }}>
                  En Popüler
                </T>
              </View>
            )}
          </View>
        );
      })}

      <T style={{ textAlign: "center", fontSize: 12, color: renk.soluk, lineHeight: 17 }}>Ödeme altyapısı çok yakında açılıyor; şimdi yerini ayırırsan açıldığında ilk sen haberdar olursun.</T>
    </ScrollView>
  );
}

const s = StyleSheet.create({
  yenileme: { borderWidth: 1, borderColor: renk.birincilKenar, backgroundColor: "#f8fafc", borderRadius: 16, padding: 14 },
  anahtar: { width: 44, height: 24, borderRadius: 12, padding: 2, opacity: 0.6 },
  top: { width: 20, height: 20, borderRadius: 10, backgroundColor: "#fff" },
  kampanya: { flexDirection: "row", flexWrap: "wrap", alignItems: "center", justifyContent: "center", gap: 8, borderRadius: 16, paddingHorizontal: 16, paddingVertical: 12 },
  donem: { alignSelf: "center", flexDirection: "row", borderWidth: 1, borderColor: "rgba(36,102,195,0.2)", backgroundColor: "#fff", borderRadius: 999, padding: 4 },
  donemSecenek: { borderRadius: 999, paddingHorizontal: 18, paddingVertical: 7 },
  dugme: { alignItems: "center", borderRadius: 12, paddingVertical: 12 },
  populer: { position: "absolute", top: -11, alignSelf: "center", backgroundColor: renk.birincil, borderRadius: 999, paddingHorizontal: 10, paddingVertical: 3 },
});

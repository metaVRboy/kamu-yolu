import { RefreshControl, ScrollView, Share, StyleSheet, View } from "react-native";
import * as WebBrowser from "expo-web-browser";
import { router, useLocalSearchParams } from "expo-router";
import { ArrowUpRight, Building2, CalendarClock, CalendarDays, GraduationCap, ListChecks, Share2, Users, type LucideIcon } from "lucide-react-native";
import { Buton, HataKutusu, Kart, T, Yukleniyor } from "@/bilesenler/ui";
import { HaberGorsel, HaberSatiri } from "@/bilesenler/HaberKarti";
import { useVeri } from "@/lib/api";
import { tarihUzun } from "@/lib/bicim";
import { renk } from "@/lib/tema";
import type { HaberDetayVeri } from "@/lib/tipler";

const KUTU_IKONU: Record<string, LucideIcon> = { Kurum: Building2, Kontenjan: Users, Eğitim: GraduationCap, "KPSS Şartı": ListChecks, "Son Başvuru": CalendarClock };

/** Sitedeki /haberler/[slug] sayfasi. */
export default function HaberDetay() {
  const { slug } = useLocalSearchParams<{ slug: string }>();
  const { veri: h, hata, yenileniyor, yenile } = useVeri<HaberDetayVeri>(`/api/mobil/haber/${slug}`);
  if (hata && !h) return <HataKutusu mesaj={hata} tekrar={yenile} />;
  if (!h) return <Yukleniyor />;

  return (
    <ScrollView contentContainerStyle={{ padding: 16, gap: 16, paddingBottom: 40 }} refreshControl={<RefreshControl refreshing={yenileniyor} onRefresh={yenile} tintColor={renk.birincil} />}>
      <Kart style={{ padding: 20 }} yaricap={16}>
        {h.suresiGecti && (
          <View style={s.uyari}>
            <T w="orta" style={{ color: "#78350f", lineHeight: 20 }}>
              Bu ilanın başvuru süresi sona erdi. Güncel ilanlar için{" "}
              <T w="yariKalin" style={{ color: "#78350f", textDecorationLine: "underline" }} onPress={() => router.navigate("/ilanlar")}>
                tüm ilanlara
              </T>{" "}
              göz atabilirsin.
            </T>
          </View>
        )}
        <View style={{ flexDirection: "row", flexWrap: "wrap", alignItems: "center", gap: 8 }}>
          {!!h.kategori && <Rozet metin={h.kategori} zemin={renk.birincil} />}
          {h.yeni && <Rozet metin="YENİ" zemin="#dc2626" />}
          <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
            <CalendarDays size={14} color={renk.soluk} />
            <T style={{ fontSize: 12, color: renk.soluk }}>{tarihUzun(h.yayinTarihi)}</T>
          </View>
        </View>
        <T w="kalin" style={{ marginTop: 12, fontSize: 24, lineHeight: 30, letterSpacing: -0.5 }}>
          {h.baslik}
        </T>
        <T style={{ marginTop: 8, color: renk.soluk }}>Kamu Yolu Haber Merkezi</T>

        <View style={s.ozet}>
          <T w="orta" style={{ color: "#64748b" }}>
            Haber Özeti
          </T>
          <T style={{ marginTop: 4, fontSize: 16, lineHeight: 24, color: "#1e293b" }}>{h.ozet}</T>
        </View>

        <HaberGorsel h={h} style={{ marginTop: 20, borderRadius: 16 }} />

        {h.bilgiKutulari.length > 0 && (
          <View style={{ marginTop: 20, flexDirection: "row", flexWrap: "wrap", gap: 10 }}>
            {h.bilgiKutulari.map((k) => {
              const Ikon = KUTU_IKONU[k.etiket] ?? Building2;
              return (
                <View key={k.etiket} style={[s.kutu, k.vurgu && { borderColor: "#fcd34d", backgroundColor: renk.amberZemin }]}>
                  <Ikon size={16} color={k.vurgu ? "#d97706" : renk.birincil} style={{ marginTop: 2 }} />
                  <View style={{ flex: 1 }}>
                    <T w="orta" style={{ fontSize: 12, color: k.vurgu ? "#b45309" : renk.soluk }}>
                      {k.etiket}
                    </T>
                    <T w="yariKalin" numberOfLines={2}>
                      {k.deger}
                    </T>
                  </View>
                </View>
              );
            })}
          </View>
        )}

        {h.tablo.length > 0 && (
          <View style={s.tablo}>
            <T w="yariKalin" style={s.tabloBaslik}>
              Haber Detay Tablosu
            </T>
            {h.tablo.map((r, i) => (
              <View key={r.etiket} style={[{ flexDirection: "row" }, i > 0 && { borderTopWidth: 1, borderTopColor: renk.kenar }]}>
                <T w="orta" style={s.tabloEtiket}>
                  {r.etiket}
                </T>
                <T w="yariKalin" style={{ flex: 1, padding: 12 }}>
                  {r.deger}
                </T>
              </View>
            ))}
          </View>
        )}

        {h.ayrintilar.length > 0 && (
          <View style={{ marginTop: 28, gap: 20 }}>
            <T w="kalin" style={{ fontSize: 18 }}>
              Haberin Ayrıntıları
            </T>
            {h.ayrintilar.map((b) => (
              <View key={b.baslik} style={{ borderLeftWidth: 2, borderLeftColor: "rgba(36,102,195,0.3)", paddingLeft: 14 }}>
                <T w="yariKalin" style={{ fontSize: 15 }}>
                  {b.baslik}
                </T>
                <T style={{ marginTop: 6, lineHeight: 21, color: "#334155" }}>{b.metin}</T>
              </View>
            ))}
          </View>
        )}

        {h.sss.length > 0 && (
          <View style={{ marginTop: 28, gap: 12 }}>
            <T w="kalin" style={{ fontSize: 18 }}>
              Sık Sorulan Sorular
            </T>
            {h.sss.map((x) => (
              <View key={x.soru} style={{ borderWidth: 1, borderColor: renk.kenar, borderRadius: 12, padding: 16 }}>
                <T w="yariKalin">{x.soru}</T>
                <T style={{ marginTop: 6, lineHeight: 21, color: renk.soluk }}>{x.cevap}</T>
              </View>
            ))}
          </View>
        )}

        {!!h.kaynakUrl && (
          <View style={s.kaynak}>
            <T w="yariKalin" style={{ color: "#fff" }}>
              Başvuru ve Resmî Kaynak
            </T>
            <T style={{ marginTop: 2, fontSize: 12, color: "#cbd5e1" }}>Başvuru tarihleri ve şartlar değişebileceğinden resmî ilanı kontrol edin.</T>
            <Buton tur="cerceve" ikon={ArrowUpRight} etiket="Resmî Kaynağa Git" onPress={() => WebBrowser.openBrowserAsync(h.kaynakUrl!)} style={{ marginTop: 14, borderRadius: 10 }} />
          </View>
        )}
        <Buton tur="cerceve" ikon={Share2} etiket="Paylaş" onPress={() => Share.share({ message: `${h.baslik}\n${h.paylasimUrl}` })} style={{ marginTop: 16 }} />
      </Kart>

      {h.benzerler.length > 0 && (
        <Kart style={{ padding: 16 }} yaricap={16}>
          <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 8 }}>
            <T w="yariKalin">Benzer Haberler</T>
            <T w="orta" style={{ fontSize: 12, color: renk.birincil }} onPress={() => router.navigate("/haberler")}>
              Tümünü Gör
            </T>
          </View>
          {h.benzerler.map((b) => (
            <HaberSatiri key={b.slug} h={b} />
          ))}
        </Kart>
      )}
    </ScrollView>
  );
}

function Rozet({ metin, zemin }: { metin: string; zemin: string }) {
  return (
    <View style={{ backgroundColor: zemin, borderRadius: 999, paddingHorizontal: 10, paddingVertical: 3 }}>
      <T w="yariKalin" style={{ color: "#fff", fontSize: 12 }}>
        {metin}
      </T>
    </View>
  );
}

const s = StyleSheet.create({
  uyari: { marginBottom: 16, borderRadius: 12, borderWidth: 1, borderColor: "#fcd34d", backgroundColor: renk.amberZemin, padding: 14 },
  ozet: { marginTop: 20, borderLeftWidth: 4, borderLeftColor: renk.birincil, backgroundColor: renk.birincilZemin, borderRadius: 12, padding: 16 },
  kutu: { width: "48%", flexDirection: "row", gap: 8, borderWidth: 1, borderColor: renk.kenar, borderRadius: 12, padding: 12, backgroundColor: "#fff" },
  tablo: { marginTop: 28, borderWidth: 1, borderColor: renk.kenar, borderRadius: 12, overflow: "hidden" },
  tabloBaslik: { backgroundColor: "#f8fafc", padding: 12, borderBottomWidth: 1, borderBottomColor: renk.kenar },
  tabloEtiket: { width: "38%", padding: 12, backgroundColor: "rgba(248,250,252,0.6)", color: renk.soluk },
  kaynak: { marginTop: 28, borderRadius: 16, backgroundColor: "#0f172a", padding: 20 },
});

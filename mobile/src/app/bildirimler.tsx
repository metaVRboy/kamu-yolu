import { useEffect, useState } from "react";
import { Pressable, RefreshControl, ScrollView, StyleSheet, View } from "react-native";
import { Trash2 } from "lucide-react-native";
import { Bos, HataKutusu, T, Yukleniyor } from "@/bilesenler/ui";
import { KilitliOzellik } from "@/bilesenler/KilitliOzellik";
import { GirisDaveti } from "@/bilesenler/GirisDaveti";
import { api, useVeri } from "@/lib/api";
import { siteLinkiAc } from "@/lib/baglanti";
import { useOturum } from "@/lib/oturum";
import type { Plan } from "@/lib/kpss";
import { renk } from "@/lib/tema";

type Duyuru = { id: string; baslik: string; icerik: string; link: string | null };
type Bildirim = { id: string; baslik: string; icerik: string | null; link: string | null; okundu: boolean };
type Veri = { genel: Duyuru[]; banaOzel: Bildirim[]; okunmamisSayisi: number; plan: Plan | null; banaOzelKilitli: boolean };

// Kilitli onizleme icin ornek (gercek kullanici verisi degil).
const ORNEK = [
  { baslik: "Bölümüne uygun yeni ilan", icerik: "Bölümünün başvurabildiği yeni bir kamu ilanı yayımlandı." },
  { baslik: "Yeni becayiş mesajınız var", icerik: "Talebinle ilgilenen biri sana mesaj gönderdi." },
  { baslik: "Bölümüne uygun yeni ilan", icerik: "Son başvuru tarihi yaklaşan bir ilan seni bekliyor." },
];

/** Sitedeki bildirim zili paneli: Genel (duyurular) ve Bana Ozel (Pro). Acilinca okundu sayilir. */
export default function Bildirimler() {
  const { kullanici } = useOturum();
  const [sekme, setSekme] = useState<"genel" | "ozel">("genel");
  const { veri, hata, yenileniyor, yenile } = useVeri<Veri>(kullanici === undefined ? null : `/api/bildirimler?u=${kullanici?.id ?? ""}`);
  const [silinen, setSilinen] = useState<string[] | "hepsi">([]);
  const okunmamis = veri?.okunmamisSayisi ?? 0;

  useEffect(() => {
    if (kullanici && okunmamis > 0) api("/api/bildirimler/okundu", { method: "POST" }).catch(() => {});
  }, [kullanici, okunmamis]);

  if (hata && !veri) return <HataKutusu mesaj={hata} tekrar={yenile} />;
  if (!veri) return <Yukleniyor />;
  const banaOzel = silinen === "hepsi" ? [] : veri.banaOzel.filter((b) => !silinen.includes(b.id));

  function sil(id: string) {
    setSilinen((o) => (o === "hepsi" ? o : [...o, id]));
    api(`/api/bildirimler/${id}`, { method: "DELETE" }).catch(() => {});
  }

  function hepsiniSil() {
    setSilinen("hepsi");
    api("/api/bildirimler", { method: "DELETE" }).catch(() => {});
  }

  return (
    <View style={{ flex: 1 }}>
      <View style={s.sekmeler}>
        {(["genel", "ozel"] as const).map((k) => (
          <Pressable key={k} onPress={() => setSekme(k)} style={[s.sekme, sekme === k && s.sekmeAktif]}>
            <T w="orta" style={{ color: sekme === k ? renk.birincil : renk.soluk }}>
              {k === "genel" ? "Genel" : "Bana Özel"}
            </T>
          </Pressable>
        ))}
      </View>
      {sekme === "ozel" && !kullanici ? (
        <GirisDaveti metin="Kişisel bildirimleri görmek için giriş yap." />
      ) : (
        <ScrollView contentContainerStyle={{ padding: 16, gap: 8, paddingBottom: 40 }} refreshControl={<RefreshControl refreshing={yenileniyor} onRefresh={yenile} tintColor={renk.birincil} />}>
          {sekme === "genel" ? (
            veri.genel.length === 0 ? (
              <Bos metin="Henüz duyuru yok." />
            ) : (
              veri.genel.map((d) => (
                <Pressable key={d.id} disabled={!d.link} onPress={() => d.link && siteLinkiAc(d.link)} style={s.kart}>
                  <T w="orta">{d.baslik}</T>
                  <T style={s.icerik}>{d.icerik}</T>
                  {!!d.link && (
                    <T w="yariKalin" style={{ marginTop: 4, fontSize: 12, color: renk.birincil }}>
                      Göz at →
                    </T>
                  )}
                </Pressable>
              ))
            )
          ) : veri.banaOzelKilitli ? (
            <KilitliOzellik mevcutPlan={veri.plan ?? "UCRETSIZ"} gerekenPlan="PRO" kaynak="bildirim" baslik="Kişisel bildirimler Pro'da">
              <View style={{ minHeight: 340, gap: 8 }}>
                {ORNEK.map((b, i) => (
                  <View key={i} style={[s.kart, { backgroundColor: renk.birincilZemin }]}>
                    <T w="orta">{b.baslik}</T>
                    <T style={s.icerik}>{b.icerik}</T>
                  </View>
                ))}
              </View>
            </KilitliOzellik>
          ) : banaOzel.length === 0 ? (
            <Bos metin="Henüz bildirimin yok." />
          ) : (
            <>
              <Pressable onPress={hepsiniSil} hitSlop={6} style={{ alignSelf: "flex-end" }}>
                <T w="orta" style={{ fontSize: 12, color: renk.soluk }}>
                  Tümünü sil
                </T>
              </Pressable>
              {banaOzel.map((b) => (
                <View key={b.id} style={[s.kart, { flexDirection: "row", alignItems: "center", gap: 8 }, !b.okundu && { backgroundColor: renk.birincilZemin }]}>
                  <Pressable disabled={!b.link} onPress={() => b.link && siteLinkiAc(b.link)} style={{ flex: 1 }}>
                    <T w="orta">{b.baslik}</T>
                    {!!b.icerik && <T style={s.icerik}>{b.icerik}</T>}
                  </Pressable>
                  <Pressable onPress={() => sil(b.id)} hitSlop={8}>
                    <Trash2 size={16} color={renk.soluk} />
                  </Pressable>
                </View>
              ))}
            </>
          )}
        </ScrollView>
      )}
    </View>
  );
}

const s = StyleSheet.create({
  sekmeler: { flexDirection: "row", backgroundColor: "#fff", borderBottomWidth: 1, borderBottomColor: renk.birincilKenar },
  sekme: { flex: 1, alignItems: "center", paddingVertical: 12, borderBottomWidth: 2, borderBottomColor: "transparent" },
  sekmeAktif: { borderBottomColor: renk.birincil },
  kart: { backgroundColor: "#fff", borderRadius: 14, borderWidth: 1, borderColor: renk.birincilKenar, padding: 14 },
  icerik: { marginTop: 2, fontSize: 13, color: renk.soluk, lineHeight: 18 },
});

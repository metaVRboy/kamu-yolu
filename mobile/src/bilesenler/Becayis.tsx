import { useState, type ReactNode } from "react";
import { Alert, FlatList, Pressable, RefreshControl, StyleSheet, TextInput, View } from "react-native";
import { router } from "expo-router";
import { ArrowUpRight, ChevronDown, Flag, Inbox, MapPin, Plus, Send, Trash2, Heart } from "lucide-react-native";
import { Bos, Cip, HataKutusu, Kart, SayfaBasligi, T, Yukleniyor, onayIste } from "@/bilesenler/ui";
import { api, useVeri } from "@/lib/api";
import { useOturum } from "@/lib/oturum";
import { renk, yazi } from "@/lib/tema";
import type { BecayisMesaj, BecayisOzet } from "@/lib/tipler";

export const konumYazi = (t: { mevcutIl: string; mevcutIlce: string | null }) => t.mevcutIl + (t.mevcutIlce ? ` / ${t.mevcutIlce}` : "");

/** Sitedeki /becayis: aktif talepler. */
export function BecayisListesi() {
  const { kullanici } = useOturum();
  const { veri, hata, yenileniyor, yenile } = useVeri<{ ilSayisi: number; talepler: BecayisOzet[] }>("/api/mobil/becayis");
  if (hata && !veri) return <HataKutusu mesaj={hata} tekrar={yenile} />;
  if (!veri) return <Yukleniyor />;
  const git = (yol: "/becayis/talep-olustur" | "/becayis/taleplerim" | "/becayis/ilgilendiklerim") => router.push(kullanici ? yol : "/giris");

  return (
    <FlatList
      data={veri.talepler}
      keyExtractor={(t) => t.id}
      contentContainerStyle={{ padding: 16, gap: 12, paddingBottom: 32 }}
      refreshControl={<RefreshControl refreshing={yenileniyor} onRefresh={yenile} tintColor={renk.birincil} />}
      ListHeaderComponent={
        <View style={{ gap: 12, marginBottom: 4 }}>
          <SayfaBasligi
            baslik="Becayiş İlanları"
            aciklama="Kamu personeli arasında il/ilçe değişimi talepleri. İletişim bilgileri gizli kalır, talep sahibine site üzerinden mesaj gönderilir."
            cipler={
              <>
                <Cip etiket={`${veri.talepler.length} aktif talep`} />
                {veri.ilSayisi > 0 && <Cip etiket={`${veri.ilSayisi} farklı ilden`} ikon={MapPin} />}
              </>
            }
          />
          <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
            <Cip etiket="Talep Oluştur" ikon={Plus} durum="aktif" onPress={() => git("/becayis/talep-olustur")} />
            <Cip etiket="Mevcut Taleplerim" ikon={Inbox} onPress={() => git("/becayis/taleplerim")} />
            <Cip etiket="İlgilendiğim İlanlar" ikon={Heart} onPress={() => git("/becayis/ilgilendiklerim")} />
          </View>
        </View>
      }
      ListEmptyComponent={<Bos metin="Henüz becayiş talebi yok." />}
      renderItem={({ item: t }) => (
        <Pressable onPress={() => router.push({ pathname: "/becayis/[id]", params: { id: t.id } })}>
          <Kart style={{ padding: 18, gap: 8 }} yaricap={16}>
            <View style={{ flexDirection: "row", justifyContent: "space-between", gap: 8 }}>
              <T w="yariKalin" style={{ flex: 1, fontSize: 15 }}>
                {t.meslek}
              </T>
              <View style={{ flexDirection: "row", alignItems: "center", gap: 2 }}>
                <ArrowUpRight size={14} color={renk.birincil} />
                <T style={{ fontSize: 12, color: renk.birincil }}>Detay</T>
              </View>
            </View>
            {!!t.kurumTuru && <T style={{ color: renk.soluk, fontSize: 13 }}>{t.kurumTuru}</T>}
            <IlSatiri t={t} />
          </Kart>
        </Pressable>
      )}
    />
  );
}

/** Mevcut il (mavi cip) → istenen iller. */
export function IlSatiri({ t }: { t: BecayisOzet }) {
  return (
    <View style={{ flexDirection: "row", flexWrap: "wrap", alignItems: "center", gap: 6 }}>
      <View style={s.ilCip}>
        <MapPin size={13} color={renk.birincil} />
        <T style={{ color: renk.birincil, fontSize: 13 }}>{konumYazi(t)}</T>
      </View>
      <T style={{ color: renk.soluk }}>→</T>
      <T style={{ color: renk.yaziIkincil, fontSize: 13, flexShrink: 1 }}>{t.istenenIller.join(", ")}</T>
    </View>
  );
}

/** Sitedeki BecayisMesajBalonu: karsi tarafin mesaji sikayet edilebilir. */
function MesajBalonu({ m, benim }: { m: BecayisMesaj; benim: boolean }) {
  const [sikayetli, setSikayetli] = useState(m.sikayetEdildi);

  function sikayetEt() {
    onayIste(
      "Bu mesaj şikayet edilsin mi?",
      "Hakaret, taciz, dolandırıcılık ya da reklam içeren mesajları bildir. Mesaj Kamu Yolu ekibine iletilir; gönderen kim olduğunu görmez.",
      "Şikayet et",
      () =>
        api("/api/becayis/mesaj/sikayet", { govde: { mesajId: m.id } }).then(
          () => {
            setSikayetli(true);
            Alert.alert("Şikayetin iletildi.", "Ekibimiz mesajı inceleyecek.");
          },
          () => Alert.alert("Şikayet gönderilemedi."),
        ),
    );
  }

  return (
    <View style={{ maxWidth: "85%", alignSelf: benim ? "flex-end" : "flex-start" }}>
      <View style={[s.balon, benim ? { backgroundColor: renk.birincil } : { backgroundColor: renk.griZemin }]}>
        <T style={{ color: benim ? "#fff" : "#1e293b", lineHeight: 20 }}>{m.mesaj}</T>
      </View>
      {!benim &&
        (sikayetli ? (
          <T style={s.balonAlt}>Şikayet edildi</T>
        ) : (
          <Pressable onPress={sikayetEt} hitSlop={6} style={{ flexDirection: "row", alignItems: "center", gap: 4, paddingHorizontal: 4, marginTop: 2 }}>
            <Flag size={11} color={renk.soluk} />
            <T style={{ fontSize: 11, color: renk.soluk }}>Şikayet et</T>
          </Pressable>
        ))}
    </View>
  );
}

/**
 * Sitedeki ThreadPanel: basliga dokununca acilir (okunmamis varsa okundu yapilir),
 * mesajlar + cevap kutusu; cop kutusu sohbeti siler. Her islemden sonra degisti() listeyi tazeler.
 */
export function SohbetPaneli({
  baslik,
  okunmamis,
  mesajlar,
  benimId,
  okundu,
  gonder,
  silAciklama,
  sil,
  degisti,
}: {
  baslik: ReactNode;
  okunmamis: number;
  mesajlar: BecayisMesaj[];
  benimId: string;
  okundu: () => Promise<unknown>;
  gonder: (mesaj: string) => Promise<unknown>;
  silAciklama: string;
  sil: () => Promise<unknown>;
  degisti: () => void;
}) {
  const [acik, setAcik] = useState(false);
  const [cevap, setCevap] = useState("");
  const [gonderiliyor, setGonderiliyor] = useState(false);

  async function ac() {
    setAcik(!acik);
    if (!acik && okunmamis > 0) {
      await okundu().catch(() => {});
      degisti();
    }
  }

  async function cevapla() {
    if (!cevap.trim()) return;
    setGonderiliyor(true);
    try {
      await gonder(cevap);
      setCevap("");
      degisti();
    } catch (e) {
      Alert.alert(e instanceof Error ? e.message : "Mesaj gönderilemedi.");
    } finally {
      setGonderiliyor(false);
    }
  }

  return (
    <View style={s.panel}>
      <View style={{ flexDirection: "row", alignItems: "center" }}>
        <Pressable onPress={ac} style={{ flex: 1, flexDirection: "row", alignItems: "center", gap: 8, padding: 12 }}>
          <View style={{ flex: 1 }}>{baslik}</View>
          {okunmamis > 0 && (
            <View style={s.rozet}>
              <T w="yariKalin" style={{ color: "#fff", fontSize: 12 }}>
                {okunmamis}
              </T>
            </View>
          )}
          <ChevronDown size={16} color={renk.soluk} style={acik && { transform: [{ rotate: "180deg" }] }} />
        </Pressable>
        <Pressable onPress={() => onayIste("Sohbeti sil", silAciklama, "Sil", () => sil().then(degisti, () => Alert.alert("Silinemedi.")))} hitSlop={6} style={{ padding: 12 }}>
          <Trash2 size={16} color={renk.soluk} />
        </Pressable>
      </View>
      {acik && (
        <View style={{ gap: 8, borderTopWidth: 1, borderTopColor: renk.birincilKenar, padding: 12 }}>
          {mesajlar.map((m) => (
            <MesajBalonu key={m.id} m={m} benim={m.gonderenId === benimId} />
          ))}
          <View style={{ flexDirection: "row", gap: 8, paddingTop: 4 }}>
            <TextInput value={cevap} onChangeText={setCevap} placeholder="Cevap yaz..." placeholderTextColor={renk.soluk} multiline style={s.cevap} />
            <Pressable onPress={cevapla} disabled={gonderiliyor || !cevap.trim()} style={[s.gonder, (gonderiliyor || !cevap.trim()) && { opacity: 0.5 }]}>
              <Send size={16} color="#fff" />
            </Pressable>
          </View>
        </View>
      )}
    </View>
  );
}

const s = StyleSheet.create({
  ilCip: { flexDirection: "row", alignItems: "center", gap: 4, backgroundColor: renk.birincilZemin, borderRadius: 999, paddingHorizontal: 10, paddingVertical: 4 },
  balon: { borderRadius: 16, paddingHorizontal: 12, paddingVertical: 8 },
  balonAlt: { fontSize: 11, color: renk.soluk, paddingHorizontal: 4, marginTop: 2 },
  panel: { borderWidth: 1, borderColor: "rgba(36,102,195,0.15)", borderRadius: 12, backgroundColor: "#fff" },
  rozet: { minWidth: 20, height: 20, borderRadius: 10, paddingHorizontal: 6, backgroundColor: renk.birincil, alignItems: "center", justifyContent: "center" },
  cevap: { flex: 1, maxHeight: 120, borderWidth: 1, borderColor: "rgba(36,102,195,0.2)", borderRadius: 12, paddingHorizontal: 12, paddingVertical: 9, fontFamily: yazi.normal, fontSize: 14, color: renk.yazi },
  gonder: { width: 42, borderRadius: 12, backgroundColor: renk.birincil, alignItems: "center", justifyContent: "center" },
});

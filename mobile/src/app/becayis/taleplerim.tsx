import { useCallback } from "react";
import { Alert, Pressable, RefreshControl, ScrollView, View } from "react-native";
import { router, useFocusEffect } from "expo-router";
import { Eye, Handshake, MapPin, Plus, Trash2 } from "lucide-react-native";
import { yukseltmeAc } from "@/bilesenler/KilitliOzellik";
import { Bos, Cip, HataKutusu, Kart, SayfaBasligi, T, Yukleniyor, onayIste } from "@/bilesenler/ui";
import { SohbetPaneli, konumYazi } from "@/bilesenler/Becayis";
import { GirisDaveti } from "@/bilesenler/GirisDaveti";
import { api, useVeri } from "@/lib/api";
import { useOturum } from "@/lib/oturum";
import { renk } from "@/lib/tema";
import type { TaleplerimVeri } from "@/lib/tipler";

/** Sitedeki /becayis/taleplerim: kullanicinin talepleri ve her talebe gelen sohbetler. */
export default function Taleplerim() {
  const { kullanici } = useOturum();
  const { veri, hata, yenileniyor, yenile } = useVeri<TaleplerimVeri>(kullanici ? `/api/mobil/becayis/taleplerim?u=${kullanici.id}` : null);
  useFocusEffect(
    useCallback(() => {
      if (kullanici) yenile(false);
    }, [kullanici, yenile]),
  );
  if (kullanici === undefined) return <Yukleniyor />;
  if (!kullanici) return <GirisDaveti />;
  if (hata && !veri) return <HataKutusu mesaj={hata} tekrar={yenile} />;
  if (!veri) return <Yukleniyor />;
  const degisti = () => yenile(false);
  const sil = (yol: string, talepId: string) => api(yol, { method: "DELETE", govde: { talepId } }).then(degisti, () => Alert.alert("Silinemedi."));
  const eslesenler = veri.talepler.flatMap((t) => t.eslesmeler.map((e) => ({ talep: t, e })));

  return (
    <ScrollView contentContainerStyle={{ padding: 16, gap: 16, paddingBottom: 40 }} refreshControl={<RefreshControl refreshing={yenileniyor} onRefresh={yenile} tintColor={renk.birincil} />}>
      <SayfaBasligi baslik="Mevcut Taleplerim" aciklama="Becayiş taleplerin ve sana gelen mesajlar." cipler={<Cip etiket="Talep Oluştur" ikon={Plus} durum="aktif" onPress={() => router.push("/becayis/talep-olustur")} />} />
      {/* Karsilikli eslesme: ayni meslek, iki taraf da birbirinin iline gitmek istiyor. Mesaj Pro'da. */}
      {eslesenler.length > 0 && (
        <View style={{ borderRadius: 20, borderWidth: 1, borderColor: "#a7f3d0", backgroundColor: renk.yesilZemin, padding: 16, gap: 10 }}>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
            <Handshake size={20} color="#064e3b" />
            <T w="kalin" style={{ flex: 1, color: "#064e3b" }}>
              Talebinle karşılıklı eşleşen {eslesenler.length} kişi var
            </T>
          </View>
          <T style={{ color: "#064e3b", fontSize: 13 }}>Aynı meslekte; o senin iline, sen onun iline gitmek istiyorsunuz.</T>
          {eslesenler.map(({ talep, e }) => (
            <View key={`${talep.id}-${e.id}`} style={{ borderRadius: 14, backgroundColor: "#fff", padding: 12, gap: 10 }}>
              <T style={{ lineHeight: 20 }}>
                <T w="kalin">{e.adSoyad}</T> · {e.meslek} · {e.mevcutIl}
                {e.mevcutIlce ? ` / ${e.mevcutIlce}` : ""} → {talep.mevcutIl}
              </T>
              <Pressable
                onPress={() => (veri.pro ? router.push({ pathname: "/becayis/[id]", params: { id: e.id } }) : yukseltmeAc("PRO", "becayis-mesaj"))}
                style={{ alignSelf: "flex-start", borderRadius: 10, backgroundColor: renk.yesil, paddingHorizontal: 12, paddingVertical: 8 }}
              >
                <T w="yariKalin" style={{ color: "#fff" }}>
                  {veri.pro ? "Talebi aç, mesaj at" : "Mesaj atmak için Pro"}
                </T>
              </Pressable>
            </View>
          ))}
        </View>
      )}
      {veri.talepler.length === 0 && <Bos metin="Henüz bir becayiş talebin yok." />}
      {veri.talepler.map((t) => (
        <Kart key={t.id} style={{ padding: 18, gap: 12 }} yaricap={16}>
          <View style={{ gap: 8 }}>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
              <T w="yariKalin" style={{ flex: 1, fontSize: 15 }}>
                {t.meslek}
              </T>
              {!t.isActive && (
                <View style={{ backgroundColor: "#e2e8f0", borderRadius: 999, paddingHorizontal: 10, paddingVertical: 3 }}>
                  <T style={{ fontSize: 12, color: "#475569" }}>Pasif</T>
                </View>
              )}
            </View>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
              <MapPin size={13} color={renk.soluk} />
              <T style={{ flex: 1, fontSize: 12, color: renk.soluk }}>
                {konumYazi(t)} → {t.istenenIller.join(", ")}
              </T>
              <Eye size={13} color={renk.soluk} />
              <T style={{ fontSize: 12, color: renk.soluk }}>{t.goruntulenme} görüntülenme</T>
            </View>
            <View style={{ flexDirection: "row", gap: 16 }}>
              {t.threads.length > 0 && (
                <SilDugmesi
                  etiket="Tümünü sil"
                  onPress={() => onayIste("Tüm sohbetleri sil", "Bu ilana ait tüm sohbetler kalıcı olarak silinecek. Bu işlem geri alınamaz.", "Sil", () => sil("/api/becayis/mesaj", t.id))}
                />
              )}
              <SilDugmesi
                etiket="İlanı sil"
                onPress={() => onayIste("İlanı sil", "Bu becayiş ilanı ve ilana ait tüm mesajlar kalıcı olarak silinecek. Bu işlem geri alınamaz.", "Sil", () => sil("/api/becayis/talepler", t.id))}
              />
            </View>
          </View>
          {t.threads.length === 0 ? (
            <T style={{ color: renk.soluk }}>Henüz mesaj gelmedi.</T>
          ) : (
            t.threads.map((th) => (
              <SohbetPaneli
                key={th.karsiId}
                baslik={<T w="orta">{th.karsiAdSoyad}</T>}
                okunmamis={th.okunmamisSayisi}
                mesajlar={th.mesajlar}
                benimId={veri.kullaniciId}
                okundu={() => api("/api/becayis/mesaj/okundu", { govde: { talepId: t.id, karsiId: th.karsiId } })}
                gonder={(mesaj) => api("/api/becayis/mesaj", { govde: { talepId: t.id, konusmaKarsiId: th.karsiId, mesaj } })}
                silAciklama={`"${th.karsiAdSoyad}" ile olan sohbet kalıcı olarak silinecek. Bu işlem geri alınamaz.`}
                sil={() => api("/api/becayis/mesaj", { method: "DELETE", govde: { talepId: t.id, konusmaKarsiId: th.karsiId } })}
                degisti={degisti}
              />
            ))
          )}
        </Kart>
      ))}
    </ScrollView>
  );
}

function SilDugmesi({ etiket, onPress }: { etiket: string; onPress: () => void }) {
  return (
    <Pressable onPress={onPress} hitSlop={6} style={{ flexDirection: "row", alignItems: "center", gap: 4 }}>
      <Trash2 size={14} color={renk.soluk} />
      <T w="orta" style={{ fontSize: 12, color: renk.soluk }}>
        {etiket}
      </T>
    </Pressable>
  );
}

import { FlatList, RefreshControl, View } from "react-native";
import { Cip, HataKutusu, SayfaBasligi, Yukleniyor, Bos } from "@/bilesenler/ui";
import { HaberKarti } from "@/bilesenler/HaberKarti";
import { useVeri } from "@/lib/api";
import { renk } from "@/lib/tema";
import type { HaberKartiVeri } from "@/lib/tipler";

/** Sitedeki /haberler sayfasi. */
export default function Haberler() {
  const { veri, hata, yenileniyor, yenile } = useVeri<{ buHafta: number; haberler: HaberKartiVeri[] }>("/api/mobil/haberler");
  if (hata && !veri) return <HataKutusu mesaj={hata} tekrar={yenile} />;
  if (!veri) return <Yukleniyor />;
  return (
    <FlatList
      style={{ backgroundColor: renk.zemin }}
      contentContainerStyle={{ padding: 16, gap: 16, paddingBottom: 32 }}
      data={veri.haberler}
      keyExtractor={(h) => h.slug}
      renderItem={({ item }) => <HaberKarti h={item} />}
      refreshControl={<RefreshControl refreshing={yenileniyor} onRefresh={yenile} tintColor={renk.birincil} />}
      ListHeaderComponent={
        <View>
          <SayfaBasligi
            baslik="Haberler"
            aciklama="Kamu personel alımları, toplu alım duyuruları ve gündemdeki gelişmeler. Başvuru süresi dolan haberler listeden otomatik kalkar."
            cipler={
              <>
                <Cip etiket={`${veri.haberler.length} güncel haber`} />
                {veri.buHafta > 0 && <Cip etiket={`${veri.buHafta} haber bu hafta eklendi`} durum="vurgu" />}
              </>
            }
          />
        </View>
      }
      ListEmptyComponent={<Bos metin="Henüz haber eklenmedi." />}
    />
  );
}

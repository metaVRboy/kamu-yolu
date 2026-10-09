import { useState } from "react";
import { FlatList, RefreshControl, View } from "react-native";
import { Building2, Hourglass } from "lucide-react-native";
import { Bos, BolumBasligi, Cip, HataKutusu, SayfaBasligi, Yukleniyor } from "@/bilesenler/ui";
import { IlanKarti } from "@/bilesenler/IlanKarti";
import { HaberKarti } from "@/bilesenler/HaberKarti";
import { FiltreCubugu, type Filtre } from "@/bilesenler/FiltreCubugu";
import { useVeri } from "@/lib/api";
import { renk } from "@/lib/tema";
import type { IlanListesiVeri } from "@/lib/tipler";

/**
 * Sitedeki /ilanlar, /seviye/[level] ve /bolum/[slug] sayfalari: baslik + bilgi cipleri
 * ("N ilan bu hafta bitiyor" filtresi dahil), filtre cubugu, ilan kartlari, bolumde ilgili haberler.
 */
export function IlanListesi({ kapsam, deger, kurumAdi: ilkKurum }: { kapsam: "tum" | "seviye" | "bolum"; deger?: string; kurumAdi?: string }) {
  const [filtre, setFiltre] = useState<Filtre>({});
  const [yakinda, setYakinda] = useState(false);
  const [kurumAdi, setKurumAdi] = useState(ilkKurum);

  const q = new URLSearchParams({ kapsam, ...(deger && { deger }), ...(kurumAdi && { kurumAdi }), ...(yakinda && { yakinda: "1" }) });
  for (const [k, v] of Object.entries(filtre)) if (v) q.set(k, v);
  const { veri, hata, yenileniyor, yenile } = useVeri<IlanListesiVeri>(`/api/mobil/ilanlar?${q}`);

  if (hata && !veri) return <HataKutusu mesaj={hata} tekrar={yenile} />;
  if (!veri) return <Yukleniyor />;

  const bos =
    kapsam === "bolum"
      ? "Seçtiğin kriterlere uyan aktif bir ilan bulunmuyor. Filtreleri değiştirmeyi veya daha sonra tekrar kontrol etmeyi deneyebilirsin."
      : kapsam === "seviye"
        ? "Şu anda bu düzeyde aktif bir ilan bulunmuyor. Daha sonra tekrar kontrol edebilirsin."
        : "Şu anda aktif bir ilan bulunmuyor. Daha sonra tekrar kontrol edebilirsin.";

  return (
    <FlatList
      style={{ backgroundColor: renk.zemin }}
      contentContainerStyle={{ padding: 16, gap: 16, paddingBottom: 32 }}
      data={veri.ilanlar}
      keyExtractor={(i) => i.id}
      renderItem={({ item }) => <IlanKarti ilan={item} nitelikOzeti />}
      refreshControl={<RefreshControl refreshing={yenileniyor} onRefresh={yenile} tintColor={renk.birincil} />}
      ListHeaderComponent={
        <View style={{ gap: 16 }}>
          <SayfaBasligi
            baslik={veri.baslik}
            aciklama={veri.aciklama}
            cipler={
              <>
                {!!kurumAdi && <Cip etiket={`Kurum: ${veri.ilanlar[0]?.kurum ?? kurumAdi} ✕`} durum="aktif" onPress={() => setKurumAdi(undefined)} />}
                <Cip etiket={`${veri.ilanSayisi} aktif ilan`} />
                <Cip etiket={`${veri.kurumSayisi} kurum`} ikon={Building2} />
                {veri.biteceklerSayisi > 0 && (
                  <Cip
                    etiket={yakinda ? "Yakında bitenler gösteriliyor ✕" : `${veri.biteceklerSayisi} ilan bu hafta bitiyor`}
                    ikon={Hourglass}
                    durum={yakinda ? "aktif" : "vurgu"}
                    onPress={() => setYakinda((y) => !y)}
                  />
                )}
              </>
            }
          />
          <FiltreCubugu secenekler={veri.filtreler} filtre={filtre} degistir={setFiltre} />
        </View>
      }
      ListEmptyComponent={<Bos metin={bos} />}
      ListFooterComponent={
        veri.haberler.length > 0 ? (
          <View style={{ marginTop: 24, gap: 16 }}>
            <BolumBasligi baslik="İlgili Haberler ve Duyurular" />
            {veri.haberler.map((h) => (
              <HaberKarti key={h.slug} h={h} />
            ))}
          </View>
        ) : null
      }
    />
  );
}

import { useState } from "react";
import { FlatList, RefreshControl, View } from "react-native";
import { router } from "expo-router";
import { Bell, Building2, Eye, Hourglass, Lock, Sparkles } from "lucide-react-native";
import { Bos, BolumBasligi, Cip, HataKutusu, SayfaBasligi, Yukleniyor } from "@/bilesenler/ui";
import { IlanKarti } from "@/bilesenler/IlanKarti";
import { HaberKarti } from "@/bilesenler/HaberKarti";
import { FiltreCubugu, type Filtre } from "@/bilesenler/FiltreCubugu";
import { yukseltmeAc } from "@/bilesenler/KilitliOzellik";
import { BolumIstatistikSeridi, planCagrisi, usePlanDurumu } from "@/bilesenler/ProTesvik";
import { TesvikKarti } from "@/bilesenler/TesvikKarti";
import { useVeri } from "@/lib/api";
import { DUZEY_ADI, SEVIYE_ENUM } from "@/lib/bicim";
import { renk } from "@/lib/tema";
import type { IlanListesiVeri } from "@/lib/tipler";

/**
 * Sitedeki bolum sayfasi bos durumu: bolumlerin cogunda cogu zaman ozel ilan yok; ziyaretci bos sayfada kalmasin.
 * Gercek sayilarla (son 30 gun, ortalama acik kalma) plana gore cagri.
 */
function BolumBosDurum({ b, planDurumu }: { b: NonNullable<IlanListesiVeri["bolum"]>; planDurumu: ReturnType<typeof usePlanDurumu> }) {
  const duzeyAdi = b.seviyeSlug ? DUZEY_ADI[SEVIYE_ENUM[b.seviyeSlug]] : undefined;
  if (!planDurumu) return null;
  const kacirilan = planDurumu !== "sahip" && b.son30 > 0;
  // Kacirilan varsa sis (kayip), yoksa sinyal (ilk sen ogren); Pro'da sinyal iyi halde.
  return (
    <TesvikKarti
      key={planDurumu}
      tema={kacirilan ? "sis" : "sinyal"}
      iyi={planDurumu === "sahip"}
      baslik={`Şu an ${b.ad} şartı arayan aktif bir ilan yok.`}
      metin={`${b.son30 > 0 ? `Son 30 günde bu bölüme ${b.son30} ilan yayımlandı ve süreleri doldu${b.ortalamaGun !== null ? `; ilanlar ortalama ${b.ortalamaGun} gün açık kalıyor` : ""}. ` : ""}${
        planDurumu === "misafir"
          ? "Üye ol, bölümünü seç: yeni ilan çıkınca ilk sen öğren."
          : planDurumu === "ucretsiz"
            ? "Yeni ilan yayımlandığında ilk senin haberin olsun: Pro'da bölümüne uygun her yeni ilanda anında bildirim."
            : "Bu bölüm profilindeyse yeni ilan çıkınca sana bildirim gelecek."
      } Bölüm şartı aramayan ilanlara da başvurabilirsin.`}
      cagri={planCagrisi(planDurumu, kacirilan ? "kacirilan" : "bildirim", "İlk ben haberdar olayım", kacirilan ? Eye : Bell)}
      ikincil={
        b.seviyeSlug && duzeyAdi
          ? { etiket: `${duzeyAdi} mezunlarının tüm ilanları`, onPress: () => router.push({ pathname: "/liste", params: { kapsam: "seviye", deger: b.seviyeSlug! } }) }
          : null
      }
    />
  );
}

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
  const planDurumu = usePlanDurumu();

  if (hata && !veri) return <HataKutusu mesaj={hata} tekrar={yenile} />;
  if (!veri) return <Yukleniyor />;
  const b = veri.bolum;

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
                {/* Sitedeki "Yalniz bana uygun": Pro'ya kisisel liste (profil), ucretsize yukseltme, misafire uyelik. */}
                {kapsam === "tum" && !!planDurumu && (
                  <Cip
                    etiket="Yalnız bana uygun olanlar"
                    ikon={planDurumu === "ucretsiz" ? Lock : Sparkles}
                    onPress={() => (planDurumu === "misafir" ? router.push("/kayit") : planDurumu === "ucretsiz" ? yukseltmeAc("PRO", "ozel-ilanlar") : router.navigate("/profil"))}
                  />
                )}
              </>
            }
          />
          <FiltreCubugu secenekler={veri.filtreler} filtre={filtre} degistir={setFiltre} />
          {!!b && veri.ilanlar.length > 0 && b.son30 > 0 && <BolumIstatistikSeridi bolumAdi={b.ad} son30={b.son30} ortalamaGun={b.ortalamaGun} />}
        </View>
      }
      ListEmptyComponent={b && veri.ilanSayisi === 0 ? <BolumBosDurum b={b} planDurumu={planDurumu} /> : <Bos metin={bos} />}
      ListFooterComponent={
        veri.haberler.length > 0 ? (
          <View style={{ marginTop: 24, gap: 16 }}>
            <BolumBasligi baslik="İlgili Haberler" />
            {veri.haberler.map((h) => (
              <HaberKarti key={h.slug} h={h} />
            ))}
          </View>
        ) : null
      }
    />
  );
}

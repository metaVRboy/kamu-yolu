import { useState } from "react";
import { ScrollView, StyleSheet, TextInput, View } from "react-native";
import { router } from "expo-router";
import { Buton, Girdi, Kart, SayfaBasligi, T, Yukleniyor } from "@/bilesenler/ui";
import { KilitliOzellik } from "@/bilesenler/KilitliOzellik";
import { Secici } from "@/bilesenler/Secici";
import { GirisDaveti } from "@/bilesenler/GirisDaveti";
import { api } from "@/lib/api";
import { TURKIYE_ILLERI } from "@/lib/iller";
import { ilceSecenekleri } from "@/lib/ilceler";
import { KURUM_TURLERI, isciAltMeslekleri, memurAltMeslekleri, meslekSecenekleri } from "@/lib/kurumMeslek";
import { useOturum } from "@/lib/oturum";
import { renk, yazi } from "@/lib/tema";

const DIGER = "Diğer";

/** Sitedeki /becayis/talep-olustur: Pro degilse form bulanik + yukseltme (API de kontrol eder). */
export default function TalepOlustur() {
  const { kullanici } = useOturum();
  if (kullanici === undefined) return <Yukleniyor />;
  if (!kullanici) return <GirisDaveti />;
  return (
    <ScrollView contentContainerStyle={{ padding: 16, gap: 16, paddingBottom: 40 }} keyboardShouldPersistTaps="handled">
      <SayfaBasligi
        baslik="Becayiş Talebi Oluştur"
        aciklama="Talebin herkese açık olarak listelenir; iletişim bilgilerin gizli kalır, ilgilenenler sana site üzerinden mesaj gönderir."
      />
      {kullanici.plan === "UCRETSIZ" ? (
        <KilitliOzellik
          mevcutPlan={kullanici.plan}
          gerekenPlan="PRO"
          kaynak="becayis-talep"
          uzun
          baslik="Becayiş talebi oluşturmak Pro'da"
          ozellikler={["Talebin herkese açık listelenir, iletişim bilgilerin gizli kalır", "İlgilenenlerle site içinden mesajlaş", "Yeni mesaj gelince bildirim ve SMS al"]}
        >
          <TalepFormu />
        </KilitliOzellik>
      ) : (
        <TalepFormu />
      )}
    </ScrollView>
  );
}

/** Sitedeki BecayisTalepForm: kurum → meslek (→ Isci/Memur alt unvani / Diger serbest metin) → il/ilce → istenen iller. */
function TalepFormu() {
  const [kurumTuru, setKurumTuru] = useState("");
  const [meslek, setMeslek] = useState("");
  const [altUnvan, setAltUnvan] = useState("");
  const [serbest, setSerbest] = useState("");
  const [mevcutIl, setMevcutIl] = useState("");
  const [mevcutIlce, setMevcutIlce] = useState("");
  const [istenenIller, setIstenenIller] = useState<string[]>([]);
  const [aciklama, setAciklama] = useState("");
  const [hata, setHata] = useState<string | null>(null);
  const [yukleniyor, setYukleniyor] = useState(false);

  const altUnvanlar = meslek === "İşçi" ? isciAltMeslekleri(kurumTuru) : meslek === "Memur" ? memurAltMeslekleri(kurumTuru) : [];
  const serbestGerekli = meslek === DIGER || altUnvan === DIGER;
  // Sunucuya "Isci"/"Memur" gibi genel baslik degil, secilen/yazilan somut unvan gider.
  const nihaiMeslek = serbestGerekli ? serbest.trim() : altUnvanlar.length > 0 ? altUnvan : meslek;

  async function gonder() {
    setHata(null);
    if (!kurumTuru || !meslek || !mevcutIl || istenenIller.length === 0) return setHata("Kurum türü, meslek, mevcut il ve en az bir istenen il zorunludur.");
    if (altUnvanlar.length > 0 && !altUnvan) return setHata("Lütfen unvanını daha spesifik olarak belirt.");
    if (serbestGerekli && !serbest.trim()) return setHata("Lütfen unvanını yaz.");
    setYukleniyor(true);
    try {
      await api("/api/becayis/talepler", {
        govde: { kurumTuru, meslek: nihaiMeslek, mevcutIl, mevcutIlce: mevcutIlce || undefined, istenenIller, aciklama: aciklama || undefined },
      });
      router.replace("/becayis/taleplerim");
    } catch (e) {
      setHata(e instanceof Error ? e.message : "Bir şeyler ters gitti.");
    } finally {
      setYukleniyor(false);
    }
  }

  return (
    <Kart style={{ padding: 20, gap: 16 }}>
      <Secici
        etiket="Kurum Türü"
        zorunlu
        deger={kurumTuru}
        secenekler={KURUM_TURLERI}
        sec={(v) => {
          setKurumTuru(v);
          setMeslek("");
          setAltUnvan("");
          setSerbest("");
        }}
      />
      <Secici
        etiket="Meslek / Unvan"
        zorunlu
        deger={meslek}
        secenekler={kurumTuru ? meslekSecenekleri(kurumTuru) : []}
        devreDisi={!kurumTuru}
        yerTutucu={kurumTuru ? "Seçiniz" : "Önce kurum türü seçin"}
        sec={(v) => {
          setMeslek(v);
          setAltUnvan("");
          setSerbest("");
        }}
      />
      {altUnvanlar.length > 0 && (
        <Secici
          etiket={`${meslek} Unvanını Belirt`}
          zorunlu
          deger={altUnvan}
          secenekler={altUnvanlar}
          sec={(v) => {
            setAltUnvan(v);
            setSerbest("");
          }}
        />
      )}
      {serbestGerekli && <Girdi etiket="* Unvanını Yaz" value={serbest} onChangeText={setSerbest} placeholder="Unvanını yaz" />}
      <Secici
        etiket="Mevcut İl"
        zorunlu
        deger={mevcutIl}
        secenekler={TURKIYE_ILLERI}
        devreDisi={!meslek}
        yerTutucu={meslek ? "Seçiniz" : "Önce meslek seçin"}
        sec={(v) => {
          setMevcutIl(v);
          setMevcutIlce("");
        }}
      />
      <Secici etiket="Mevcut İlçe" deger={mevcutIlce} secenekler={mevcutIl ? ilceSecenekleri(mevcutIl) : []} devreDisi={!mevcutIl} yerTutucu={mevcutIl ? "Seçiniz" : "Önce il seçin"} sec={setMevcutIlce} />
      <View>
        <Secici
          etiket="İstenen İl(ler)"
          zorunlu
          deger={istenenIller.length ? `${istenenIller.length} il seçildi` : ""}
          secenekler={TURKIYE_ILLERI}
          coklu={istenenIller}
          devreDisi={!mevcutIl}
          yerTutucu={mevcutIl ? "Seçiniz" : "Önce mevcut il seçin"}
          sec={(il) => setIstenenIller((o) => (o.includes(il) ? o.filter((x) => x !== il) : [...o, il]))}
        />
        {istenenIller.length > 0 && <T style={{ marginTop: 6, fontSize: 12, color: renk.soluk }}>Seçilenler: {istenenIller.join(", ")}</T>}
      </View>
      <View>
        <T w="orta" style={{ marginBottom: 6 }}>
          Açıklama
        </T>
        <TextInput value={aciklama} onChangeText={setAciklama} multiline placeholder="Eklemek istediğin başka bir şey var mı?" placeholderTextColor={renk.soluk} style={s.alan} />
      </View>
      {!!hata && <T style={{ color: renk.hata }}>{hata}</T>}
      <Buton etiket={yukleniyor ? "Kaydediliyor..." : "Talebi Yayınla"} onPress={gonder} yukleniyor={yukleniyor} />
    </Kart>
  );
}

const s = StyleSheet.create({
  alan: { minHeight: 100, textAlignVertical: "top", borderWidth: 1, borderColor: "rgba(36,102,195,0.2)", borderRadius: 12, padding: 12, fontFamily: yazi.normal, fontSize: 15, color: renk.yazi },
});

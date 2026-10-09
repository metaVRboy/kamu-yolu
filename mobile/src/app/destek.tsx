import { useState } from "react";
import { ScrollView, StyleSheet, TextInput, View } from "react-native";
import { CheckCircle2, Send } from "lucide-react-native";
import { Buton, Cip, Girdi, Kart, SayfaBasligi, T } from "@/bilesenler/ui";
import { Secici } from "@/bilesenler/Secici";
import { RobotDogrulama } from "@/bilesenler/GirisAraclari";
import { api, useVeri } from "@/lib/api";
import { DESTEK_KONULARI } from "@/lib/destek";
import { useOturum } from "@/lib/oturum";
import { renk, yazi } from "@/lib/tema";

type Gecmis = { id: string; konu: string; tarih: string; mesaj: string; yanit: string | null; yanitTarihi: string | null; kapatildi: boolean }[];

/** Sitedeki /destek: mesaj formu (uye degilse robot dogrulamasi) + uyenin onceki mesajlari. */
export default function Destek() {
  const { kullanici } = useOturum();
  const { veri, yenile } = useVeri<{ gecmis: Gecmis }>(kullanici === undefined ? null : `/api/mobil/destek?u=${kullanici?.id ?? ""}`);
  const uye = !!kullanici;

  return (
    <ScrollView contentContainerStyle={{ padding: 16, gap: 16, paddingBottom: 40 }} keyboardShouldPersistTaps="handled">
      <SayfaBasligi
        baslik="İletişim ve Destek"
        aciklama="Soru, öneri ya da bir hata mı buldun? Yaz, yanıtımızı e-postana gönderelim."
        cipler={
          <>
            <Cip etiket="Genelde 1-2 iş günü içinde yanıt" />
            <Cip etiket="Pro+ üyelere öncelikli destek" />
          </>
        }
      />
      {kullanici !== undefined && <DestekFormu key={kullanici?.id ?? "misafir"} uye={kullanici ? { adSoyad: kullanici.adSoyad, email: kullanici.email } : null} gonderildi={() => yenile(false)} />}
      {uye && !!veri?.gecmis.length && (
        <View style={{ gap: 12, marginTop: 8 }}>
          <T w="kalin" style={{ fontSize: 18 }}>
            Önceki mesajların
          </T>
          {veri.gecmis.map((m) => (
            <Kart key={m.id} style={{ padding: 16, gap: 6 }} yaricap={16}>
              <View style={{ flexDirection: "row", flexWrap: "wrap", justifyContent: "space-between", gap: 8 }}>
                <T w="yariKalin" style={{ fontSize: 12, color: "#334155" }}>
                  {m.konu}
                </T>
                <T style={{ fontSize: 12, color: renk.soluk }}>{m.tarih}</T>
              </View>
              <T style={{ color: "#334155", lineHeight: 20 }}>{m.mesaj}</T>
              {m.yanit ? (
                <View style={{ marginTop: 6, backgroundColor: "rgba(36,102,195,0.05)", borderRadius: 12, padding: 12 }}>
                  <T w="yariKalin" style={{ fontSize: 12, color: renk.birincil }}>
                    Kamu Yolu yanıtı · {m.yanitTarihi}
                  </T>
                  <T style={{ marginTop: 4, color: "#1e293b", lineHeight: 20 }}>{m.yanit}</T>
                </View>
              ) : (
                <T w="orta" style={{ marginTop: 4, fontSize: 12, color: "#b45309" }}>
                  {m.kapatildi ? "Kapatıldı" : "Yanıt bekleniyor"}
                </T>
              )}
            </Kart>
          ))}
        </View>
      )}
    </ScrollView>
  );
}

function DestekFormu({ uye, gonderildi: tazele }: { uye: { adSoyad: string; email: string } | null; gonderildi: () => void }) {
  const [ad, setAd] = useState(uye?.adSoyad ?? "");
  const [email, setEmail] = useState(uye?.email ?? "");
  const [konu, setKonu] = useState(DESTEK_KONULARI[0]);
  const [mesaj, setMesaj] = useState("");
  const [token, setToken] = useState<string | null>(null);
  const [hata, setHata] = useState<string | null>(null);
  const [gonderiliyor, setGonderiliyor] = useState(false);
  const [gonderildi, setGonderildi] = useState(false);

  async function gonder() {
    setHata(null);
    setGonderiliyor(true);
    try {
      await api("/api/destek", { govde: { ad, email, konu, mesaj, turnstileToken: token } });
      setMesaj("");
      setGonderildi(true);
      tazele();
    } catch (e) {
      setHata(e instanceof Error ? e.message : "Gönderilemedi, lütfen tekrar dene.");
    } finally {
      setGonderiliyor(false);
    }
  }

  if (gonderildi) {
    return (
      <View style={s.tamam}>
        <CheckCircle2 size={40} color="#059669" />
        <T w="kalin" style={{ marginTop: 12, color: "#064e3b" }}>
          Mesajın bize ulaştı
        </T>
        <T style={{ marginTop: 4, textAlign: "center", color: "#065f46", lineHeight: 20 }}>
          Yanıtımızı {email} adresine e-postayla göndereceğiz{uye ? "; bu sayfada da görebilirsin" : ""}.
        </T>
        <T w="yariKalin" style={{ marginTop: 14, color: "#065f46", textDecorationLine: "underline" }} onPress={() => setGonderildi(false)}>
          Yeni mesaj yaz
        </T>
      </View>
    );
  }

  return (
    <Kart style={{ padding: 20, gap: 16 }}>
      <Girdi etiket="Ad soyad" value={ad} onChangeText={setAd} maxLength={100} autoComplete="name" />
      <Girdi etiket="E-posta (yanıtı buraya göndeririz)" value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" autoComplete="email" />
      <Secici etiket="Konu" deger={konu} secenekler={DESTEK_KONULARI} sec={setKonu} />
      <View>
        <T w="orta" style={{ marginBottom: 6 }}>
          Mesajın
        </T>
        <TextInput value={mesaj} onChangeText={setMesaj} multiline maxLength={4000} style={s.alan} />
      </View>
      {!uye && <RobotDogrulama dogrulandi={setToken} />}
      {!!hata && <T style={{ color: renk.hata }}>{hata}</T>}
      <Buton etiket="Gönder" ikon={Send} onPress={gonder} yukleniyor={gonderiliyor} devreDisi={!ad.trim() || !email.trim() || mesaj.trim().length < 10 || (!uye && !token)} />
    </Kart>
  );
}

const s = StyleSheet.create({
  alan: { minHeight: 140, textAlignVertical: "top", borderWidth: 1, borderColor: "rgba(36,102,195,0.2)", borderRadius: 12, padding: 12, fontFamily: yazi.normal, fontSize: 15, color: renk.yazi },
  tamam: { alignItems: "center", borderWidth: 1, borderColor: "#a7f3d0", backgroundColor: renk.yesilZemin, borderRadius: 24, padding: 24 },
});

import { useState } from "react";
import { ScrollView } from "react-native";
import { Buton, Girdi, Kart, T } from "@/bilesenler/ui";
import { api } from "@/lib/api";
import { renk } from "@/lib/tema";

/** Sitedeki /sifremi-unuttum: sifirlama baglantisi e-postayla gider (sitede acilir). */
export default function SifremiUnuttum() {
  const [email, setEmail] = useState("");
  const [gonderildi, setGonderildi] = useState(false);
  const [yukleniyor, setYukleniyor] = useState(false);
  const [hata, setHata] = useState<string | null>(null);

  async function gonder() {
    setYukleniyor(true);
    setHata(null);
    try {
      await api("/api/auth/sifremi-unuttum", { govde: { email } });
      setGonderildi(true);
    } catch (e) {
      setHata(e instanceof Error ? e.message : "Gönderilemedi.");
    } finally {
      setYukleniyor(false);
    }
  }

  return (
    <ScrollView contentContainerStyle={{ padding: 16 }} keyboardShouldPersistTaps="handled">
      <Kart style={{ padding: 20, gap: 16 }}>
        <T w="kalin" style={{ fontSize: 20, color: renk.birincil }}>
          Şifremi Unuttum
        </T>
        {gonderildi ? (
          <T style={{ color: "#059669", lineHeight: 20 }}>Eğer bu e-posta ile bir hesap varsa, şifre sıfırlama bağlantısı gönderildi. Gelen kutunu (ve spam klasörünü) kontrol et.</T>
        ) : (
          <>
            <Girdi etiket="E-posta" value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" autoCorrect={false} />
            {!!hata && <T style={{ color: renk.hata }}>{hata}</T>}
            <Buton etiket={yukleniyor ? "Gönderiliyor..." : "Sıfırlama Bağlantısı Gönder"} onPress={gonder} yukleniyor={yukleniyor} devreDisi={!email.includes("@")} />
          </>
        )}
      </Kart>
    </ScrollView>
  );
}

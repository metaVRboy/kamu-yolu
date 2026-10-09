import { useEffect, useState } from "react";
import { KeyboardAvoidingView, Platform, ScrollView, View } from "react-native";
import * as WebBrowser from "expo-web-browser";
import { router } from "expo-router";
import { Check, X } from "lucide-react-native";
import { Buton, Girdi, Kart, Onay, T } from "@/bilesenler/ui";
import { GoogleButonu, RobotDogrulama } from "@/bilesenler/GirisAraclari";
import { api, SITE } from "@/lib/api";
import { useOturum } from "@/lib/oturum";
import { renk } from "@/lib/tema";

const KOD_GECERLILIK_SANIYE = 120;

// Sitedeki sifre standardi (src/lib/authValidation.ts).
const SIFRE_KURALLARI = [
  { ad: "En az 8 karakter", test: (s: string) => s.length >= 8 },
  { ad: "En az bir harf", test: (s: string) => /[A-Za-zÇĞİÖŞÜçğıöşü]/.test(s) },
  { ad: "En az bir rakam", test: (s: string) => /[0-9]/.test(s) },
];

const sayfaAc = (yol: string) => WebBrowser.openBrowserAsync(SITE + yol);

/** Sitedeki AuthForm: Google, e-posta ile giris; kayitta e-postaya gelen 6 haneli kodla dogrulama. */
export function GirisFormu({ mod }: { mod: "giris" | "kayit" }) {
  const { yenile } = useOturum();
  const [adSoyad, setAdSoyad] = useState("");
  const [email, setEmail] = useState("");
  const [sifre, setSifre] = useState("");
  const [sifreTekrar, setSifreTekrar] = useState("");
  const [kvkk, setKvkk] = useState(false);
  const [beniHatirla, setBeniHatirla] = useState(true);
  const [hata, setHata] = useState<string | null>(null);
  const [yukleniyor, setYukleniyor] = useState(false);
  const [kodAsamasi, setKodAsamasi] = useState(false);
  const [kod, setKod] = useState("");
  const [kalan, setKalan] = useState(KOD_GECERLILIK_SANIYE);
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    if (!kodAsamasi || kalan <= 0) return;
    const t = setInterval(() => setKalan((s) => Math.max(0, s - 1)), 1000);
    return () => clearInterval(t);
  }, [kodAsamasi, kalan]);

  async function tamam() {
    await yenile();
    if (router.canDismiss()) router.dismissAll();
    router.navigate("/profil");
  }

  async function calistir(is: () => Promise<void>) {
    setHata(null);
    setYukleniyor(true);
    try {
      await is();
    } catch (e) {
      setHata(e instanceof Error ? e.message : "Bir şeyler ters gitti.");
    } finally {
      setYukleniyor(false);
    }
  }

  const girisYap = () =>
    calistir(async () => {
      await api("/api/auth/login", { govde: { email, password: sifre, turnstileToken: token, beniHatirla } });
      await tamam();
    });

  const kodGonder = () =>
    calistir(async () => {
      await api("/api/auth/kayit-kod-gonder", { govde: { adSoyad, email, password: sifre, kvkkOnay: kvkk, turnstileToken: token } });
      setKodAsamasi(true);
      setKod("");
      setKalan(KOD_GECERLILIK_SANIYE);
    });

  function kayitOl() {
    setHata(null);
    if (SIFRE_KURALLARI.some((k) => !k.test(sifre))) return setHata("Şifre gereksinimleri karşılanmıyor.");
    if (sifre !== sifreTekrar) return setHata("Şifreler eşleşmiyor.");
    if (!kvkk) return setHata("Devam etmek için KVKK Aydınlatma Metni ve Kullanım Koşulları'nı onaylamalısın.");
    kodGonder();
  }

  const kodDogrula = () =>
    calistir(async () => {
      await api("/api/auth/kayit-dogrula", { govde: { email, code: kod } });
      await tamam();
    });

  return (
    <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} style={{ flex: 1 }}>
      <ScrollView contentContainerStyle={{ padding: 16 }} keyboardShouldPersistTaps="handled">
        <Kart style={{ padding: 20, gap: 16 }}>
          {mod === "kayit" && kodAsamasi ? (
            <>
              <T w="kalin" style={{ fontSize: 20, color: renk.birincil }}>
                E-postanı Doğrula
              </T>
              <T style={{ color: renk.soluk, lineHeight: 20 }}>
                <T w="kalin">{email}</T> adresine 6 haneli bir doğrulama kodu gönderdik.
              </T>
              <View>
                <Girdi
                  etiket="Doğrulama Kodu"
                  value={kod}
                  onChangeText={(t) => setKod(t.replace(/\D/g, "").slice(0, 6))}
                  keyboardType="number-pad"
                  textContentType="oneTimeCode"
                  placeholder="000000"
                  style={{ textAlign: "center", fontSize: 20, letterSpacing: 8 }}
                />
                <T style={{ marginTop: 6, fontSize: 12, color: renk.soluk }}>
                  {kalan > 0 ? `Kodun süresi: ${Math.floor(kalan / 60)}:${String(kalan % 60).padStart(2, "0")}` : "Kodun süresi doldu, yeni bir kod iste."}
                </T>
              </View>
              {!!hata && <T style={{ color: renk.hata }}>{hata}</T>}
              <Buton etiket={yukleniyor ? "Doğrulanıyor..." : "Doğrula ve Hesabı Oluştur"} onPress={kodDogrula} devreDisi={kod.length !== 6} yukleniyor={yukleniyor} />
              <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
                <T w="orta" style={{ fontSize: 13, color: renk.soluk }} onPress={() => setKodAsamasi(false)}>
                  E-postayı değiştir
                </T>
                <T w="orta" style={{ fontSize: 13, color: renk.birincil, opacity: kalan > 0 ? 0.5 : 1 }} onPress={kalan > 0 ? undefined : kodGonder}>
                  Kodu Tekrar Gönder
                </T>
              </View>
            </>
          ) : (
            <>
              <View>
                <T w="kalin" style={{ fontSize: 20 }}>
                  {mod === "kayit" ? "Kayıt Ol" : "Giriş Yap"}
                </T>
                <T style={{ marginTop: 2, color: renk.soluk }}>Devam etmek için bir yöntem seç.</T>
              </View>
              <GoogleButonu basarili={tamam} />
              <T style={{ marginTop: -8, textAlign: "center", fontSize: 12, color: renk.soluk, lineHeight: 18 }}>
                Sosyal hesapla devam ederken{" "}
                <T w="orta" style={{ fontSize: 12, color: renk.birincil, textDecorationLine: "underline" }} onPress={() => sayfaAc("/kullanim-kosullari")}>
                  Kullanım Koşulları
                </T>{" "}
                ve{" "}
                <T w="orta" style={{ fontSize: 12, color: renk.birincil, textDecorationLine: "underline" }} onPress={() => sayfaAc("/kvkk")}>
                  Gizlilik Politikası
                </T>{" "}
                hükümleri geçerlidir.
              </T>
              <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
                <View style={{ flex: 1, height: 1, backgroundColor: renk.kenar }} />
                <T style={{ fontSize: 12, color: renk.soluk }}>veya e-posta ile</T>
                <View style={{ flex: 1, height: 1, backgroundColor: renk.kenar }} />
              </View>

              {mod === "kayit" && <Girdi etiket="Ad Soyad" value={adSoyad} onChangeText={setAdSoyad} textContentType="name" autoComplete="name" />}
              <Girdi etiket="E-posta" value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" autoCorrect={false} textContentType="emailAddress" autoComplete="email" />
              <View>
                <Girdi
                  etiket="Şifre"
                  sifre
                  value={sifre}
                  onChangeText={setSifre}
                  textContentType={mod === "kayit" ? "newPassword" : "password"}
                  sag={
                    mod === "giris" && (
                      <T w="orta" style={{ fontSize: 12, color: renk.birincil }} onPress={() => router.push("/sifremi-unuttum")}>
                        Şifremi unuttum
                      </T>
                    )
                  }
                />
                {mod === "kayit" && (
                  <View style={{ marginTop: 6, gap: 2 }}>
                    {SIFRE_KURALLARI.map((k) => {
                      const ok = k.test(sifre);
                      return (
                        <View key={k.ad} style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
                          {ok ? <Check size={12} color="#059669" /> : <X size={12} color={renk.soluk} />}
                          <T style={{ fontSize: 12, color: ok ? "#059669" : renk.soluk }}>{k.ad}</T>
                        </View>
                      );
                    })}
                  </View>
                )}
              </View>
              {mod === "giris" && (
                <Onay secili={beniHatirla} degistir={setBeniHatirla}>
                  <T style={{ color: renk.yaziIkincil }}>Beni hatırla</T>
                </Onay>
              )}
              {mod === "kayit" && (
                <>
                  <View>
                    <Girdi etiket="Şifre (Tekrar)" sifre value={sifreTekrar} onChangeText={setSifreTekrar} textContentType="newPassword" />
                    {sifreTekrar.length > 0 && sifreTekrar !== sifre && <T style={{ marginTop: 4, fontSize: 12, color: renk.hata }}>Şifreler eşleşmiyor.</T>}
                  </View>
                  <Onay secili={kvkk} degistir={setKvkk}>
                    <T style={{ fontSize: 12, color: renk.yaziIkincil, lineHeight: 18 }}>
                      <T w="orta" style={{ fontSize: 12, color: renk.birincil }} onPress={() => sayfaAc("/kvkk")}>
                        KVKK Aydınlatma Metni
                      </T>{" "}
                      ve{" "}
                      <T w="orta" style={{ fontSize: 12, color: renk.birincil }} onPress={() => sayfaAc("/kullanim-kosullari")}>
                        Kullanım Koşulları
                      </T>
                      &apos;nı okudum, kabul ediyorum.
                    </T>
                  </Onay>
                </>
              )}
              <RobotDogrulama dogrulandi={setToken} />
              {!!hata && <T style={{ color: renk.hata }}>{hata}</T>}
              <Buton
                etiket={yukleniyor ? "Bekleyin..." : mod === "kayit" ? "Devam Et" : "Giriş Yap"}
                onPress={mod === "kayit" ? kayitOl : girisYap}
                yukleniyor={yukleniyor}
                devreDisi={!token || (mod === "kayit" && sifre !== sifreTekrar)}
              />
              <T style={{ textAlign: "center", color: renk.soluk }}>
                {mod === "kayit" ? "Zaten hesabın var mı? " : "Hesabın yok mu? "}
                <T w="yariKalin" style={{ color: renk.birincil }} onPress={() => router.replace(mod === "kayit" ? "/giris" : "/kayit")}>
                  {mod === "kayit" ? "Giriş yap" : "Kayıt ol"}
                </T>
              </T>
            </>
          )}
        </Kart>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

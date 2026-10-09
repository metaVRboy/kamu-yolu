import { useState, type ReactNode } from "react";
import { Alert, Platform, Pressable, RefreshControl, ScrollView, StyleSheet, View } from "react-native";
import { Image } from "expo-image";
import { router } from "expo-router";
import * as ImagePicker from "expo-image-picker";
import { manipulateAsync, SaveFormat } from "expo-image-manipulator";
import { File, Paths } from "expo-file-system";
import * as Sharing from "expo-sharing";
import * as WebBrowser from "expo-web-browser";
import { Camera, Download, LogOut, Monitor, Pencil, Trash2 } from "lucide-react-native";
import { Buton, Girdi, HataKutusu, Kart, Onay, T, Yukleniyor, onayIste } from "@/bilesenler/ui";
import { KilitliOzellik } from "@/bilesenler/KilitliOzellik";
import { GirisDaveti } from "@/bilesenler/GirisDaveti";
import { SIFRE_KURALLARI, SifreIpucu } from "@/bilesenler/GirisFormu";
import { api, SITE, useVeri } from "@/lib/api";
import { useOturum } from "@/lib/oturum";
import { PLAN_ADI } from "@/lib/planlar";
import { renk } from "@/lib/tema";
import type { AyarlarVeri, OturumSatiri } from "@/lib/tipler";

const SEKMELER = ["Hesap", "Güvenlik", "Bildirimler", "Gizlilik ve KVKK"] as const;
type Sekme = (typeof SEKMELER)[number];
const SILME_ONAY_METNI = "HESABIMI SİL";
const hataMetni = (e: unknown) => (e instanceof Error ? e.message : "Bir şeyler ters gitti.");

/** Sitedeki /profilim/ayarlar ve alt sekmeleri (Hesap / Guvenlik / Bildirimler / Gizlilik ve KVKK). */
export default function Ayarlar() {
  const { kullanici } = useOturum();
  const [sekme, setSekme] = useState<Sekme>("Hesap");
  const { veri, hata, yenileniyor, yenile } = useVeri<AyarlarVeri>(kullanici ? `/api/mobil/ayarlar?u=${kullanici.id}` : null);
  if (kullanici === undefined) return <Yukleniyor />;
  if (!kullanici) return <GirisDaveti />;
  if (hata && !veri) return <HataKutusu mesaj={hata} tekrar={yenile} />;
  if (!veri) return <Yukleniyor />;
  const degisti = () => yenile(false);

  return (
    <View style={{ flex: 1 }}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ flexGrow: 0, flexShrink: 0 }} contentContainerStyle={s.sekmeler}>
        {SEKMELER.map((k) => (
          <Pressable key={k} onPress={() => setSekme(k)} style={[s.sekme, sekme === k && { backgroundColor: renk.birincil }]}>
            <T w="yariKalin" style={{ fontSize: 13, color: sekme === k ? "#fff" : "#475569" }}>
              {k}
            </T>
          </Pressable>
        ))}
      </ScrollView>
      <ScrollView
        contentContainerStyle={{ padding: 16, paddingTop: 0, gap: 16, paddingBottom: 40 }}
        keyboardShouldPersistTaps="handled"
        refreshControl={<RefreshControl refreshing={yenileniyor} onRefresh={yenile} tintColor={renk.birincil} />}
      >
        {sekme === "Hesap" && <HesapSekmesi v={veri} degisti={degisti} />}
        {sekme === "Güvenlik" && <GuvenlikSekmesi v={veri} degisti={degisti} />}
        {sekme === "Bildirimler" && <BildirimSekmesi v={veri} degisti={degisti} />}
        {sekme === "Gizlilik ve KVKK" && <GizlilikSekmesi v={veri} />}
      </ScrollView>
    </View>
  );
}

function AyarKarti({ baslik, aciklama, tehlikeli, children }: { baslik: string; aciklama?: string; tehlikeli?: boolean; children: ReactNode }) {
  return (
    <Kart style={[{ padding: 20, gap: 14 }, tehlikeli && { borderColor: "rgba(231,0,11,0.3)" }]} yaricap={16}>
      <View>
        <T w="yariKalin" style={{ fontSize: 16, color: tehlikeli ? renk.hata : renk.birincil }}>
          {baslik}
        </T>
        {!!aciklama && <T style={{ marginTop: 4, fontSize: 13, color: renk.soluk, lineHeight: 19 }}>{aciklama}</T>}
      </View>
      {children}
    </Kart>
  );
}

function Hata({ metin }: { metin: string | null }) {
  return metin ? <T style={{ color: renk.hata }}>{metin}</T> : null;
}

/* ---------------- Hesap ---------------- */

function HesapSekmesi({ v, degisti }: { v: AyarlarVeri; degisti: () => void }) {
  return (
    <>
      <AyarKarti baslik="Profil fotoğrafı" aciklama="Fotoğrafın sitenin üst menüsünde adının yanında görünür.">
        <ProfilFotografi adSoyad={v.adSoyad} url={v.fotografUrl} degisti={degisti} />
      </AyarKarti>
      <AyarKarti baslik="Bilgilerim">
        <View style={{ gap: 8 }}>
          {[
            ["Ad Soyad", v.adSoyad],
            ["Telefon", v.telefon],
            ["Kurum türü", v.kamuCalisaniDegil ? "Kamu çalışanı değil" : v.kurumTuru],
            ["Meslek / Unvan", v.meslek],
          ].map(([etiket, deger]) => (
            <View key={etiket} style={{ flexDirection: "row", justifyContent: "space-between", gap: 12 }}>
              <T style={{ color: renk.soluk }}>{etiket}</T>
              <T w="yariKalin" style={{ flexShrink: 1, textAlign: "right" }}>
                {deger || "Seçilmedi"}
              </T>
            </View>
          ))}
        </View>
        <Buton tur="cerceve" ikon={Pencil} etiket="Bilgilerimi düzenle" onPress={() => router.push("/profil-duzenle")} />
      </AyarKarti>
      <AyarKarti baslik="E-posta adresi" aciklama="Giriş yapmak ve hesap bildirimlerini almak için kullanılır. Değiştirirken yeni adrese doğrulama kodu gönderilir.">
        <EpostaDegistir email={v.email} sifreVar={v.sifreVar} degisti={degisti} />
      </AyarKarti>
      <AyarKarti baslik="Üyelik bilgileri">
        <View style={{ gap: 10 }}>
          <Bilgi etiket="Üyelik tarihi" deger={v.uyelikTarihi} />
          <Bilgi etiket="Giriş yöntemi" deger={v.girisYontemleri} />
          <View>
            <T style={{ fontSize: 13, color: renk.soluk }}>Plan</T>
            <T w="yariKalin">
              {PLAN_ADI[v.plan]}{" "}
              <T w="orta" style={{ fontSize: 12, color: renk.birincil }} onPress={() => router.push("/abonelik")}>
                Planları gör
              </T>
            </T>
          </View>
        </View>
      </AyarKarti>
    </>
  );
}

function Bilgi({ etiket, deger }: { etiket: string; deger: string }) {
  return (
    <View>
      <T style={{ fontSize: 13, color: renk.soluk }}>{etiket}</T>
      <T w="yariKalin">{deger}</T>
    </View>
  );
}

/** Sitedeki ProfilFotografi: secilen gorsel kare kirpilip 256px'e kucultulur (sunucuya ~20 KB gider). */
function ProfilFotografi({ adSoyad, url, degisti }: { adSoyad: string; url: string | null; degisti: () => void }) {
  const [yukleniyor, setYukleniyor] = useState(false);
  const basHarfler = adSoyad
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]!.toLocaleUpperCase("tr-TR"))
    .join("");

  async function sec() {
    const sonuc = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ["images"], allowsEditing: true, aspect: [1, 1], quality: 1 });
    const a = sonuc.assets?.[0];
    if (sonuc.canceled || !a) return;
    setYukleniyor(true);
    try {
      const kenar = Math.min(a.width, a.height);
      const kare = await manipulateAsync(
        a.uri,
        [{ crop: { originX: (a.width - kenar) / 2, originY: (a.height - kenar) / 2, width: kenar, height: kenar } }, { resize: { width: 256, height: 256 } }],
        { compress: 0.85, format: SaveFormat.JPEG, base64: true },
      );
      await api("/api/profil/fotograf", { govde: { veri: `data:image/jpeg;base64,${kare.base64}` } });
      degisti();
    } catch (e) {
      Alert.alert("Fotoğraf yüklenemedi.", hataMetni(e));
    } finally {
      setYukleniyor(false);
    }
  }

  async function kaldir() {
    setYukleniyor(true);
    try {
      await api("/api/profil/fotograf", { method: "DELETE" });
      degisti();
    } catch (e) {
      Alert.alert("Fotoğraf kaldırılamadı.", hataMetni(e));
    } finally {
      setYukleniyor(false);
    }
  }

  return (
    <View style={{ flexDirection: "row", alignItems: "center", gap: 16 }}>
      <View style={s.foto}>
        {url ? (
          <Image source={{ uri: SITE + url }} style={{ width: "100%", height: "100%" }} />
        ) : (
          <T w="kalin" style={{ fontSize: 24, color: renk.birincil }}>
            {basHarfler || "?"}
          </T>
        )}
      </View>
      <View style={{ flex: 1, gap: 8 }}>
        <Buton tur="cerceve" ikon={Camera} etiket={yukleniyor ? "Yükleniyor..." : url ? "Değiştir" : "Fotoğraf yükle"} onPress={sec} devreDisi={yukleniyor} />
        {!!url && (
          <T w="orta" style={{ textAlign: "center", color: renk.soluk }} onPress={yukleniyor ? undefined : kaldir}>
            Kaldır
          </T>
        )}
      </View>
    </View>
  );
}

function EpostaDegistir({ email, sifreVar, degisti }: { email: string; sifreVar: boolean; degisti: () => void }) {
  const [adim, setAdim] = useState<"kapali" | "form" | "kod">("kapali");
  const [yeniEmail, setYeniEmail] = useState("");
  const [sifre, setSifre] = useState("");
  const [kod, setKod] = useState("");
  const [hata, setHata] = useState<string | null>(null);
  const [yukleniyor, setYukleniyor] = useState(false);

  async function istek(yol: string, govde: object) {
    setHata(null);
    setYukleniyor(true);
    try {
      await api(yol, { govde });
      return true;
    } catch (e) {
      setHata(hataMetni(e));
      return false;
    } finally {
      setYukleniyor(false);
    }
  }

  if (adim === "kapali") {
    return (
      <View style={{ gap: 10 }}>
        <T w="orta">{email}</T>
        <Buton tur="cerceve" etiket="E-postayı değiştir" onPress={() => setAdim("form")} />
      </View>
    );
  }
  if (adim === "form") {
    return (
      <View style={{ gap: 14 }}>
        <Girdi etiket="Yeni e-posta adresi" value={yeniEmail} onChangeText={setYeniEmail} keyboardType="email-address" autoCapitalize="none" autoComplete="email" />
        {sifreVar && <Girdi etiket="Mevcut şifren" sifre value={sifre} onChangeText={setSifre} autoComplete="current-password" />}
        <Hata metin={hata} />
        <Buton
          etiket={yukleniyor ? "Gönderiliyor..." : "Doğrulama kodu gönder"}
          yukleniyor={yukleniyor}
          devreDisi={!yeniEmail || (sifreVar && !sifre)}
          onPress={async () => (await istek("/api/profil/eposta", { yeniEmail, sifre: sifre || undefined })) && setAdim("kod")}
        />
        <T w="orta" style={{ textAlign: "center", color: renk.soluk }} onPress={() => setAdim("kapali")}>
          Vazgeç
        </T>
      </View>
    );
  }
  return (
    <View style={{ gap: 14 }}>
      <T style={{ color: renk.soluk, lineHeight: 20 }}>
        <T w="yariKalin">{yeniEmail}</T> adresine 6 haneli bir kod gönderdik. Kod 10 dakika geçerli.
      </T>
      <Girdi etiket="Doğrulama kodu" value={kod} onChangeText={(t) => setKod(t.replace(/\D/g, ""))} keyboardType="number-pad" maxLength={6} autoComplete="one-time-code" style={{ letterSpacing: 6, fontSize: 18 }} />
      <Hata metin={hata} />
      <Buton
        etiket={yukleniyor ? "Doğrulanıyor..." : "Onayla"}
        yukleniyor={yukleniyor}
        devreDisi={kod.length !== 6}
        onPress={async () => {
          if (!(await istek("/api/profil/eposta/dogrula", { kod }))) return;
          Alert.alert("E-posta adresin güncellendi.", `Artık ${yeniEmail} ile giriş yapacaksın.`);
          setAdim("kapali");
          setSifre("");
          setKod("");
          degisti();
        }}
      />
      <T w="orta" style={{ textAlign: "center", color: renk.soluk }} onPress={() => setAdim("form")}>
        Geri
      </T>
    </View>
  );
}

/* ---------------- Guvenlik ---------------- */

function GuvenlikSekmesi({ v, degisti }: { v: AyarlarVeri; degisti: () => void }) {
  return (
    <>
      <AyarKarti baslik={v.sifreVar ? "Şifre değiştir" : "Şifre belirle"} aciklama="Şifren değişince diğer cihazlardaki oturumların kapanır; bu cihazda oturumun açık kalır.">
        <SifreDegistir sifreVar={v.sifreVar} degisti={degisti} />
      </AyarKarti>
      <AyarKarti baslik="Google hesabı">
        <GoogleBaglantisi bagli={v.googleBagli} sifreVar={v.sifreVar} degisti={degisti} />
      </AyarKarti>
      <AyarKarti baslik="Aktif oturumlar" aciklama="Hesabına giriş yapılmış tarayıcı ve cihazlar. Tanımadığın bir oturum görürsen kapat ve şifreni değiştir.">
        <OturumListesi oturumlar={v.oturumlar} degisti={degisti} />
      </AyarKarti>
    </>
  );
}

function SifreDegistir({ sifreVar, degisti }: { sifreVar: boolean; degisti: () => void }) {
  const [mevcut, setMevcut] = useState("");
  const [yeni, setYeni] = useState("");
  const [tekrar, setTekrar] = useState("");
  const [hata, setHata] = useState<string | null>(null);
  const [yukleniyor, setYukleniyor] = useState(false);

  async function gonder() {
    setHata(null);
    if (SIFRE_KURALLARI.some((k) => !k.test(yeni))) return setHata("Yeni şifre gereksinimleri karşılanmıyor.");
    if (yeni !== tekrar) return setHata("Yeni şifreler birbiriyle eşleşmiyor.");
    setYukleniyor(true);
    try {
      await api("/api/profil/sifre-degistir", { govde: { mevcutSifre: sifreVar ? mevcut : undefined, yeniSifre: yeni, yeniSifreTekrar: tekrar } });
      Alert.alert(sifreVar ? "Şifren güncellendi." : "Şifren belirlendi.", "Güvenliğin için diğer cihazlardaki oturumların kapatıldı.");
      setMevcut("");
      setYeni("");
      setTekrar("");
      degisti();
    } catch (e) {
      setHata(hataMetni(e));
    } finally {
      setYukleniyor(false);
    }
  }

  return (
    <View style={{ gap: 14 }}>
      {sifreVar ? (
        <Girdi etiket="Mevcut Şifre" sifre value={mevcut} onChangeText={setMevcut} autoComplete="current-password" />
      ) : (
        <T style={{ color: renk.soluk, lineHeight: 20 }}>Hesabına Google ile giriş yapıyorsun. Bir şifre belirlersen e-posta adresin ve şifrenle de giriş yapabilirsin.</T>
      )}
      <View>
        <Girdi etiket="Yeni Şifre" sifre value={yeni} onChangeText={setYeni} textContentType="newPassword" />
        <SifreIpucu sifre={yeni} />
      </View>
      <View>
        <Girdi etiket="Yeni Şifre (Tekrar)" sifre value={tekrar} onChangeText={setTekrar} textContentType="newPassword" />
        {tekrar.length > 0 && tekrar !== yeni && <T style={{ marginTop: 4, fontSize: 12, color: renk.hata }}>Şifreler eşleşmiyor.</T>}
      </View>
      <Hata metin={hata} />
      <Buton
        etiket={yukleniyor ? "Kaydediliyor..." : sifreVar ? "Şifreyi Güncelle" : "Şifre Belirle"}
        onPress={gonder}
        yukleniyor={yukleniyor}
        devreDisi={!yeni || !tekrar || (sifreVar && !mevcut)}
      />
    </View>
  );
}

function GoogleBaglantisi({ bagli, sifreVar, degisti }: { bagli: boolean; sifreVar: boolean; degisti: () => void }) {
  if (!bagli) {
    return (
      <T style={{ color: renk.soluk, lineHeight: 20 }}>
        Hesabına bağlı bir Google hesabı yok. Giriş sayfasında “Google ile devam et”i seçersen, aynı e-posta adresli Google hesabın otomatik olarak bağlanır.
      </T>
    );
  }
  return (
    <View style={{ gap: 10 }}>
      <T style={{ color: "#334155", lineHeight: 20 }}>
        <T w="yariKalin" style={{ color: renk.yesil }}>
          Bağlı.
        </T>{" "}
        Google hesabınla giriş yapabilirsin.
      </T>
      {sifreVar ? (
        <Buton
          tur="cerceve"
          etiket="Bağlantıyı kaldır"
          onPress={() =>
            onayIste("Google bağlantısı kaldırılsın mı?", "Bundan sonra yalnızca e-posta adresin ve şifrenle giriş yapabilirsin.", "Kaldır", () =>
              api("/api/profil/google", { method: "DELETE" }).then(
                () => {
                  Alert.alert("Google bağlantısı kaldırıldı.", "Artık e-posta ve şifrenle giriş yapacaksın.");
                  degisti();
                },
                (e) => Alert.alert("Bağlantı kaldırılamadı.", hataMetni(e)),
              ),
            )
          }
        />
      ) : (
        <T style={{ color: renk.soluk }}>Bağlantıyı kaldırmak için önce yukarıdan bir şifre belirlemelisin.</T>
      )}
    </View>
  );
}

function OturumListesi({ oturumlar, degisti }: { oturumlar: OturumSatiri[]; degisti: () => void }) {
  function kapat(o: OturumSatiri | "tumu") {
    const tumu = o === "tumu";
    onayIste(
      tumu ? "Diğer tüm cihazlardan çıkış yapılsın mı?" : "Bu oturum kapatılsın mı?",
      tumu ? "Bu cihaz dışındaki tüm tarayıcı ve telefonlarda oturumun kapanır; oralarda yeniden giriş yapman gerekir." : `${o.cihaz} cihazındaki oturumun kapanır.`,
      "Çıkış yap",
      () =>
        api(tumu ? "/api/profil/oturumlar" : `/api/profil/oturumlar/${o.id}`, { method: "DELETE" }).then(
          () => {
            Alert.alert(tumu ? "Diğer tüm cihazlardan çıkış yapıldı." : "Oturum kapatıldı.");
            degisti();
          },
          (e) => Alert.alert("Oturum kapatılamadı.", hataMetni(e)),
        ),
    );
  }

  return (
    <View style={{ gap: 12 }}>
      <View style={s.liste}>
        {oturumlar.map((o, i) => (
          <View key={o.id} style={[s.oturum, i > 0 && { borderTopWidth: 1, borderTopColor: renk.birincilKenar }]}>
            <Monitor size={20} color="rgba(36,102,195,0.7)" />
            <View style={{ flex: 1, gap: 2 }}>
              <View style={{ flexDirection: "row", flexWrap: "wrap", alignItems: "center", gap: 6 }}>
                <T w="yariKalin">{o.cihaz}</T>
                {o.buCihaz && (
                  <View style={{ backgroundColor: renk.yesilZemin, borderRadius: 999, paddingHorizontal: 8, paddingVertical: 1 }}>
                    <T w="yariKalin" style={{ fontSize: 11, color: renk.yesil }}>
                      Bu cihaz
                    </T>
                  </View>
                )}
              </View>
              <T style={{ fontSize: 12, color: renk.soluk }}>
                Giriş: {o.olusturma} · Son etkinlik: {o.sonGorulme}
              </T>
            </View>
            {!o.buCihaz && (
              <T w="yariKalin" style={{ color: renk.birincil }} onPress={() => kapat(o)}>
                Kapat
              </T>
            )}
          </View>
        ))}
      </View>
      <Buton tur="cerceve" ikon={LogOut} etiket="Diğer tüm cihazlardan çıkış yap" onPress={() => kapat("tumu")} />
    </View>
  );
}

/* ---------------- Bildirimler (SMS) ---------------- */

const SMS_SECENEKLERI = [
  { alan: "smsIlanBildirimi", baslik: "Bölümüne uygun yeni ilanlar", aciklama: "Taramalardan sonra yeni ilanlar tek SMS'te toplanır; günde en fazla 3 SMS." },
  { alan: "smsBecayisBildirimi", baslik: "Becayiş mesajları", aciklama: "Becayiş ilanlarında sana yeni bir mesaj geldiğinde (30 dakikada en fazla 1 SMS)." },
] as const;
type SmsAlani = (typeof SMS_SECENEKLERI)[number]["alan"];

function BildirimSekmesi({ v, degisti }: { v: AyarlarVeri; degisti: () => void }) {
  const kartlar = (telefon: ReactNode, tercihler: ReactNode) => (
    <View style={{ gap: 16 }}>
      <AyarKarti baslik="Telefon numarası" aciklama="SMS bildirimleri yalnızca doğrulanmış numarana gönderilir.">
        {telefon}
      </AyarKarti>
      <AyarKarti baslik="SMS bildirimleri" aciklama="Hangi bildirimlerin SMS ile gelmesini istediğini seç. Site içi bildirimler her zaman açık.">
        {tercihler}
      </AyarKarti>
    </View>
  );

  if (!v.sms.pro) {
    // Ekran ayni kalir, bulanik ve dokunulamaz; API'ler de Pro kontrolu yapar.
    return (
      <KilitliOzellik
        mevcutPlan={v.plan}
        gerekenPlan="PRO"
        kaynak="sms"
        baslik="SMS bildirimleri Pro'da"
        ozellikler={["Bölümüne uygun yeni ilan çıkınca anında SMS", "Becayiş talebine mesaj gelince SMS", "Kişisel site içi bildirimler de Pro ile açılır", "Genel duyurular her planda açık"]}
      >
        {kartlar(<TelefonDogrulama dogrulanmis={null} degisti={degisti} />, <SmsTercihleri ilk={{ smsIlanBildirimi: true, smsBecayisBildirimi: true }} telefonDogrulandi={false} />)}
      </KilitliOzellik>
    );
  }
  if (v.sms.hazirDegil) {
    return (
      <AyarKarti baslik="SMS bildirimleri">
        <T style={{ color: "#334155", lineHeight: 20 }}>SMS altyapımızı kuruyoruz. Çok yakında bu sayfadan telefonunu doğrulayıp SMS bildirimlerini açabileceksin.</T>
      </AyarKarti>
    );
  }
  return kartlar(
    <TelefonDogrulama dogrulanmis={v.sms.dogrulanmisTelefon} degisti={degisti} />,
    <SmsTercihleri ilk={{ smsIlanBildirimi: v.sms.smsIlanBildirimi, smsBecayisBildirimi: v.sms.smsBecayisBildirimi }} telefonDogrulandi={!!v.sms.dogrulanmisTelefon} />,
  );
}

/** Telefonu SMS koduyla dogrular. Test modunda (saglayici yok) kod admine ekranda gosterilir. */
function TelefonDogrulama({ dogrulanmis, degisti }: { dogrulanmis: string | null; degisti: () => void }) {
  const [adim, setAdim] = useState<"bos" | "numara" | "kod">(dogrulanmis ? "bos" : "numara");
  const [telefon, setTelefon] = useState("");
  const [kod, setKod] = useState("");
  const [testKodu, setTestKodu] = useState<string | null>(null);
  const [hata, setHata] = useState<string | null>(null);
  const [yukleniyor, setYukleniyor] = useState(false);

  async function istek<R>(yol: string, govde: object): Promise<R | null> {
    setHata(null);
    setYukleniyor(true);
    try {
      return await api<R>(yol, { govde });
    } catch (e) {
      setHata(hataMetni(e));
      return null;
    } finally {
      setYukleniyor(false);
    }
  }

  if (adim === "bos" && dogrulanmis) {
    return (
      <View style={{ gap: 10 }}>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
          <T w="yariKalin">{dogrulanmis}</T>
          <View style={{ backgroundColor: renk.yesilZemin, borderRadius: 999, paddingHorizontal: 8, paddingVertical: 2 }}>
            <T w="yariKalin" style={{ fontSize: 11, color: renk.yesil }}>
              Doğrulandı
            </T>
          </View>
        </View>
        <Buton tur="cerceve" etiket="Numarayı değiştir" onPress={() => setAdim("numara")} />
      </View>
    );
  }
  if (adim === "kod") {
    return (
      <View style={{ gap: 14 }}>
        <T style={{ color: renk.soluk }}>Numarana 6 haneli bir kod gönderdik. Kod 10 dakika geçerli.</T>
        {!!testKodu && (
          <View style={{ borderWidth: 1, borderColor: "#fde68a", backgroundColor: renk.amberZemin, borderRadius: 12, padding: 12 }}>
            <T style={{ color: "#78350f", lineHeight: 20 }}>
              <T w="kalin">Test modu:</T> SMS sağlayıcısı henüz bağlı değil, gerçek SMS gönderilmedi. Kod: <T w="kalin">{testKodu}</T>
            </T>
          </View>
        )}
        <Girdi etiket="Doğrulama kodu" value={kod} onChangeText={(t) => setKod(t.replace(/\D/g, ""))} keyboardType="number-pad" maxLength={6} autoComplete="one-time-code" style={{ letterSpacing: 6, fontSize: 18 }} />
        <Hata metin={hata} />
        <Buton
          etiket={yukleniyor ? "Doğrulanıyor..." : "Doğrula"}
          yukleniyor={yukleniyor}
          devreDisi={kod.length !== 6}
          onPress={async () => {
            if (!(await istek("/api/profil/telefon/dogrula", { kod }))) return;
            Alert.alert("Telefon numaran doğrulandı.");
            setAdim("bos");
            setKod("");
            setTestKodu(null);
            degisti();
          }}
        />
        <T w="orta" style={{ textAlign: "center", color: renk.soluk }} onPress={() => setAdim("numara")}>
          Geri
        </T>
      </View>
    );
  }
  return (
    <View style={{ gap: 14 }}>
      <Girdi etiket="Cep telefonu" value={telefon} onChangeText={setTelefon} keyboardType="phone-pad" autoComplete="tel" placeholder="0532 123 45 67" />
      <Hata metin={hata} />
      <Buton
        etiket={yukleniyor ? "Gönderiliyor..." : "Doğrulama kodu gönder"}
        yukleniyor={yukleniyor}
        devreDisi={!telefon}
        onPress={async () => {
          const sonuc = await istek<{ testKodu?: string }>("/api/profil/telefon", { telefon });
          if (!sonuc) return;
          setTestKodu(sonuc.testKodu ?? null);
          setAdim("kod");
        }}
      />
      {!!dogrulanmis && (
        <T w="orta" style={{ textAlign: "center", color: renk.soluk }} onPress={() => setAdim("bos")}>
          Vazgeç
        </T>
      )}
    </View>
  );
}

function SmsTercihleri({ ilk, telefonDogrulandi }: { ilk: Record<SmsAlani, boolean>; telefonDogrulandi: boolean }) {
  const [tercih, setTercih] = useState(ilk);
  const [kaydediliyor, setKaydediliyor] = useState<SmsAlani | null>(null);

  async function degistir(alan: SmsAlani, deger: boolean) {
    // Iyimser guncelleme: kutu hemen degisir, sunucu reddederse geri alinir.
    setTercih((t) => ({ ...t, [alan]: deger }));
    setKaydediliyor(alan);
    try {
      await api("/api/profil/sms-tercihleri", { method: "PATCH", govde: { [alan]: deger } });
    } catch (e) {
      setTercih((t) => ({ ...t, [alan]: !deger }));
      Alert.alert("Tercih kaydedilemedi.", hataMetni(e));
    } finally {
      setKaydediliyor(null);
    }
  }

  return (
    <View style={{ gap: 10 }}>
      {SMS_SECENEKLERI.map((o) => (
        <View key={o.alan} style={[s.tercih, !telefonDogrulandi && { opacity: 0.6 }]} pointerEvents={!telefonDogrulandi || kaydediliyor === o.alan ? "none" : "auto"}>
          <Onay secili={tercih[o.alan]} degistir={(d) => degistir(o.alan, d)}>
            <T w="yariKalin">{o.baslik}</T>
            <T style={{ fontSize: 12, color: renk.soluk, lineHeight: 17 }}>{o.aciklama}</T>
          </Onay>
        </View>
      ))}
      <T style={{ fontSize: 12, color: renk.soluk, lineHeight: 17 }}>
        {telefonDogrulandi
          ? "İşaretlediğin bildirimlerin doğrulanmış numarana SMS ile gönderilmesine izin vermiş olursun; istediğin an kapatabilirsin. SMS'ler 09:00-21:00 arasında gönderilir."
          : "SMS bildirimlerini açmak için önce yukarıdan telefon numaranı doğrula."}
      </T>
    </View>
  );
}

/* ---------------- Gizlilik ve KVKK ---------------- */

function GizlilikSekmesi({ v }: { v: AyarlarVeri }) {
  const kvkk = () => WebBrowser.openBrowserAsync(SITE + "/kvkk");
  const [indiriliyor, setIndiriliyor] = useState(false);

  async function indir() {
    if (Platform.OS === "web") return void WebBrowser.openBrowserAsync(SITE + "/api/profil/verilerim");
    setIndiriliyor(true);
    try {
      const res = await fetch(SITE + "/api/profil/verilerim", { credentials: "include" });
      if (!res.ok) throw new Error("Verilerin hazırlanamadı.");
      const metin = await res.text();
      const dosya = new File(Paths.cache, "kamu-yolu-verilerim.json");
      if (dosya.exists) dosya.delete();
      dosya.create();
      dosya.write(metin);
      await Sharing.shareAsync(dosya.uri, { mimeType: "application/json", dialogTitle: "Verilerimi indir", UTI: "public.json" });
    } catch (e) {
      Alert.alert("Verilerin indirilemedi.", hataMetni(e));
    } finally {
      setIndiriliyor(false);
    }
  }

  return (
    <>
      <AyarKarti baslik="KVKK onayın">
        <T style={{ color: "#334155", lineHeight: 20 }}>
          {v.kvkkOnayTarihi ? (
            <>
              <T w="yariKalin" style={{ color: renk.birincil }} onPress={kvkk}>
                KVKK Aydınlatma Metni ve Gizlilik Politikası
              </T>
              &apos;nı <T w="kalin">{v.kvkkOnayTarihi}</T> tarihinde onayladın.
            </>
          ) : (
            <>
              Hesabın onay tarihinin kaydedilmeye başlandığı tarihten önce açıldığı için onay tarihi kayıtlı değil. Metne{" "}
              <T w="yariKalin" style={{ color: renk.birincil }} onPress={kvkk}>
                buradan
              </T>{" "}
              ulaşabilirsin.
            </>
          )}
        </T>
        <T style={{ fontSize: 13, color: renk.soluk, lineHeight: 19 }}>Onayını geri çekmek istersen aşağıdan hesabını silebilirsin; kişisel verilerinin işlenmesine son verilir.</T>
      </AyarKarti>
      <AyarKarti
        baslik="Verilerimi indir"
        aciklama="Hesabınla ilişkili tüm kişisel verileri (profil, becayiş ilanları ve mesajlar, deneme sonuçları, bildirimler, oturumlar) tek bir JSON dosyası olarak indir."
      >
        <Buton tur="cerceve" ikon={Download} etiket="Verilerimi indir" onPress={indir} yukleniyor={indiriliyor} />
      </AyarKarti>
      <AyarKarti baslik="Hesabı sil" tehlikeli>
        <HesapSil sifreVar={v.sifreVar} />
      </AyarKarti>
    </>
  );
}

function HesapSil({ sifreVar }: { sifreVar: boolean }) {
  const { yenile: oturumuYenile } = useOturum();
  const [deger, setDeger] = useState("");
  const [hata, setHata] = useState<string | null>(null);
  const [yukleniyor, setYukleniyor] = useState(false);

  async function sil() {
    setHata(null);
    setYukleniyor(true);
    try {
      await api("/api/profil", { method: "DELETE", govde: sifreVar ? { sifre: deger } : { onayMetni: deger } });
      Alert.alert("Hesabın silindi.", "Kamu Yolu'nu kullandığın için teşekkür ederiz.");
      await oturumuYenile();
      router.replace("/");
    } catch (e) {
      setHata(hataMetni(e));
    } finally {
      setYukleniyor(false);
    }
  }

  return (
    <View style={{ gap: 14 }}>
      <View style={{ gap: 6 }}>
        {[
          "Profil bilgilerin, fotoğrafın, becayiş ilanların, bildirimlerin ve KPSS deneme sonuçların kalıcı olarak silinir.",
          "Başkalarının ilanlarına gönderdiğin mesajlar, karşı tarafın sohbeti bozulmasın diye “Silinmiş kullanıcı” adıyla kalır.",
          "Bu işlem geri alınamaz. İstersen önce yukarıdan verilerini indirebilirsin.",
        ].map((m) => (
          <View key={m} style={{ flexDirection: "row", gap: 8 }}>
            <T style={{ color: renk.yaziIkincil }}>•</T>
            <T style={{ flex: 1, fontSize: 13, color: renk.yaziIkincil, lineHeight: 19 }}>{m}</T>
          </View>
        ))}
      </View>
      {sifreVar ? (
        <Girdi etiket="Onaylamak için şifreni gir" sifre value={deger} onChangeText={setDeger} autoComplete="current-password" />
      ) : (
        <Girdi etiket={`Onaylamak için “${SILME_ONAY_METNI}” yaz`} value={deger} onChangeText={setDeger} autoCapitalize="characters" />
      )}
      <Hata metin={hata} />
      <Pressable
        disabled={yukleniyor || !deger}
        onPress={() => onayIste("Hesabın kalıcı olarak silinsin mi?", "Bu işlem geri alınamaz. Tüm verilerin silinecek ve oturumun kapanacak.", "Hesabımı sil", sil)}
        style={[s.sil, (yukleniyor || !deger) && { opacity: 0.5 }]}
      >
        <Trash2 size={16} color="#fff" />
        <T w="yariKalin" style={{ color: "#fff" }}>
          Hesabımı kalıcı olarak sil
        </T>
      </Pressable>
    </View>
  );
}

const s = StyleSheet.create({
  sekmeler: { gap: 6, padding: 16 },
  sekme: { borderRadius: 12, paddingHorizontal: 16, paddingVertical: 9, backgroundColor: "#fff", borderWidth: 1, borderColor: renk.birincilKenar },
  foto: { width: 80, height: 80, borderRadius: 40, overflow: "hidden", backgroundColor: renk.birincilZemin, alignItems: "center", justifyContent: "center", borderWidth: 2, borderColor: "rgba(36,102,195,0.15)" },
  liste: { borderWidth: 1, borderColor: "rgba(36,102,195,0.15)", borderRadius: 12 },
  oturum: { flexDirection: "row", alignItems: "center", gap: 12, paddingHorizontal: 14, paddingVertical: 12 },
  tercih: { borderWidth: 1, borderColor: "rgba(36,102,195,0.15)", borderRadius: 12, padding: 14 },
  sil: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, borderRadius: 999, paddingVertical: 13, backgroundColor: renk.hata },
});

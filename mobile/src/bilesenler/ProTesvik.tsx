import { useEffect, useState } from "react";
import { ActivityIndicator, Alert, Pressable, View, type StyleProp, type ViewStyle } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { router } from "expo-router";
import { BellPlus, BellRing, CalendarX2, Crown, X } from "lucide-react-native";
import { Buton, T } from "@/bilesenler/ui";
import { yukseltmeAc } from "@/bilesenler/KilitliOzellik";
import { api } from "@/lib/api";
import { siteLinkiAc } from "@/lib/baglanti";
import { useOturum } from "@/lib/oturum";
import { renk } from "@/lib/tema";
import type { BantMesaji } from "@/lib/tipler";

type PlanDurumu = "misafir" | "ucretsiz" | "sahip";

/** Oturumdaki plana gore cagri durumu; henuz bilinmiyorsa undefined. Pro+ isteyen ozellikte Pro da "ucretsiz" sayilir. */
export function usePlanDurumu(gereken: "PRO" | "PRO_PLUS" = "PRO"): PlanDurumu | undefined {
  const { kullanici } = useOturum();
  if (kullanici === undefined) return undefined;
  if (!kullanici) return "misafir";
  return kullanici.plan === "PRO_PLUS" || (gereken === "PRO" && kullanici.plan === "PRO") ? "sahip" : "ucretsiz";
}

/** Sitedeki ProCagri: misafire uyelik, ucretsize yukseltme; ozelligin sahibine hicbir sey. */
export function ProCagri({
  kaynak,
  uyeEtiket,
  misafirEtiket = "Ücretsiz üye ol",
  gerekenPlan = "PRO",
  tur = "dolu",
  style,
}: {
  kaynak: string;
  uyeEtiket: string;
  misafirEtiket?: string;
  gerekenPlan?: "PRO" | "PRO_PLUS";
  tur?: "dolu" | "cerceve" | "koyu";
  style?: StyleProp<ViewStyle>;
}) {
  const durum = usePlanDurumu(gerekenPlan);
  if (!durum || durum === "sahip") return null;
  return durum === "misafir" ? (
    <Buton etiket={misafirEtiket} tur={tur} onPress={() => router.push("/kayit")} style={style} />
  ) : (
    <Buton etiket={uyeEtiket} ikon={Crown} tur={tur} onPress={() => yukseltmeAc(gerekenPlan, kaynak)} style={style} />
  );
}

const BANT_KAPALI_MS = 24 * 3_600_000;
const bantAnahtari = (tur: string) => `kyBant:${tur}`;

/**
 * Sitedeki Pro bandi (ana sayfanin ust cubugu altinda): mesaj sunucuda uyenin gercek durumundan secilir;
 * kapatilan mesaj turu 24 saat gorunmez. Pro+ uyeye gelmez.
 */
export function ProBandi() {
  const { kullanici } = useOturum();
  const [mesaj, setMesaj] = useState<BantMesaji>(null);

  useEffect(() => {
    if (kullanici === undefined) return;
    let iptal = false;
    api<{ mesaj: BantMesaji }>("/api/pro-bandi").then(
      async ({ mesaj: m }) => {
        const kapatma = m ? Number((await AsyncStorage.getItem(bantAnahtari(m.tur)).catch(() => null)) ?? 0) : 0;
        if (!iptal) setMesaj(m && Date.now() - kapatma >= BANT_KAPALI_MS ? m : null);
      },
      () => {},
    );
    return () => {
      iptal = true;
    };
  }, [kullanici]);

  if (!mesaj) return null;
  const { cta } = mesaj;
  const tikla = () => (cta.eylem === "kayit" ? router.push("/kayit") : cta.eylem === "yukselt" ? yukseltmeAc(cta.plan, "bant") : siteLinkiAc(cta.href ?? "/"));
  const kapat = () => {
    AsyncStorage.setItem(bantAnahtari(mesaj.tur), String(Date.now())).catch(() => {});
    setMesaj(null);
  };

  return (
    <View style={{ flexDirection: "row", alignItems: "center", gap: 10, backgroundColor: "#0f766e", paddingLeft: 16, paddingRight: 6, paddingVertical: 8 }}>
      <T style={{ flex: 1, color: "#fff", fontSize: 13, lineHeight: 18 }}>
        {mesaj.once}
        <T w="kalin" style={{ color: "#fff", fontSize: 13 }}>
          {mesaj.vurgu}
        </T>
        {mesaj.sonra}
      </T>
      <Pressable onPress={tikla} style={{ backgroundColor: "#fff", borderRadius: 8, paddingHorizontal: 10, paddingVertical: 6 }}>
        <T w="kalin" style={{ color: "#115e59", fontSize: 12 }}>
          {cta.etiket}
        </T>
      </Pressable>
      <Pressable onPress={kapat} hitSlop={8} accessibilityLabel="Bandı 24 saat gizle" style={{ padding: 6 }}>
        <X size={16} color="#fff" />
      </Pressable>
    </View>
  );
}

/**
 * Sitedeki SuresiDolanIlanCagrisi: suresi dolmus ilana gelen gec kaldigini gorur; "bir dahakini ilk sen ogren" tam bu an.
 */
export function SuresiDolanIlanKarti({ bolum }: { bolum?: { ad: string; slug: string } }) {
  const durum = usePlanDurumu();
  const hedef = bolum ? `${bolum.ad} için` : "bölümüne uygun";
  const metin =
    durum === "misafir"
      ? `${bolum ? `${bolum.ad} için yeni` : "Bölümüne uygun yeni"} ilan çıkınca ilk sen öğren: ücretsiz üye ol, bölümünü seç.`
      : durum === "ucretsiz"
        ? `Bir dahakini kaçırma: Pro'da ${hedef} yeni ilan çıktığı an haberin olur.`
        : durum === "sahip"
          ? `${hedef[0].toLocaleUpperCase("tr") + hedef.slice(1)} yeni ilan çıkınca sana bildirim gelecek.`
          : null;
  return (
    <View style={{ borderRadius: 20, borderWidth: 1, borderColor: "#fde68a", backgroundColor: renk.amberZemin, padding: 18, gap: 12 }}>
      <View style={{ flexDirection: "row", gap: 10 }}>
        <CalendarX2 size={22} color="#b45309" />
        <View style={{ flex: 1 }}>
          <T w="kalin" style={{ color: "#451a03", fontSize: 15 }}>
            Bu ilanın başvuru süresi doldu.
          </T>
          {!!metin && <T style={{ marginTop: 2, color: "#78350f", lineHeight: 20 }}>{metin}</T>}
        </View>
      </View>
      <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
        <ProCagri kaynak="kacirilan" uyeEtiket="Bir daha kaçırma" style={{ paddingVertical: 10 }} />
        {!!bolum && (
          <Buton tur="cerceve" etiket="Açık ilanlara bak" onPress={() => router.push({ pathname: "/liste", params: { kapsam: "bolum", deger: bolum.slug } })} style={{ paddingVertical: 10 }} />
        )}
      </View>
    </View>
  );
}

type TakipDurumu = { girisli: boolean; takipte: boolean; pro: boolean };

/**
 * Takip dugmesi (ilan: /api/ilan/[id]/takip, kurum: /api/kurum-takip): takip herkese, hatirlatma/bildirim Pro'da.
 * Misafir dokununca giris ekrani acilir.
 */
function useTakip(okuYolu: string, yaz: (sil: boolean) => Promise<{ takipte: boolean }>) {
  const { kullanici } = useOturum();
  const [d, setD] = useState<TakipDurumu | null>(null);
  const [isleniyor, setIsleniyor] = useState(false);
  useEffect(() => {
    if (kullanici === undefined) return;
    let iptal = false;
    api<TakipDurumu>(okuYolu).then(
      (v) => !iptal && setD(v),
      () => !iptal && setD({ girisli: false, takipte: false, pro: false }),
    );
    return () => {
      iptal = true;
    };
  }, [okuYolu, kullanici]);

  async function degistir(basari: (pro: boolean) => void) {
    if (!d?.girisli) return router.push("/giris");
    setIsleniyor(true);
    try {
      const { takipte } = await yaz(d.takipte);
      setD({ ...d, takipte });
      if (takipte) basari(d.pro);
    } catch (e) {
      Alert.alert("İşlem yapılamadı.", e instanceof Error ? e.message : undefined);
    } finally {
      setIsleniyor(false);
    }
  }
  return { d, isleniyor, degistir };
}

function TakipButonu({ takipte, isleniyor, hazir, etiket, onPress }: { takipte: boolean; isleniyor: boolean; hazir: boolean; etiket: [string, string]; onPress: () => void }) {
  const r = takipte ? "#fff" : renk.birincil;
  return (
    <Pressable
      onPress={onPress}
      disabled={!hazir || isleniyor}
      accessibilityState={{ selected: takipte }}
      style={{ flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, borderRadius: 999, paddingHorizontal: 18, paddingVertical: 12, borderWidth: 1, borderColor: renk.birincil, backgroundColor: takipte ? renk.birincil : "#fff" }}
    >
      {isleniyor ? <ActivityIndicator color={r} /> : takipte ? <BellRing size={16} color={r} /> : <BellPlus size={16} color={r} />}
      <T w="yariKalin" style={{ color: r }}>
        {takipte ? etiket[1] : etiket[0]}
      </T>
    </Pressable>
  );
}

/** Sitedeki IlanTakipButonu: son basvuruya 3 gun ve 1 gun kala hatirlatma Pro'da. */
export function IlanTakipDugmesi({ ilanId }: { ilanId: string }) {
  const yol = `/api/ilan/${ilanId}/takip`;
  const { d, isleniyor, degistir } = useTakip(yol, (sil) => api(yol, { method: sil ? "DELETE" : "POST" }));
  return (
    <View style={{ gap: 6 }}>
      <TakipButonu
        takipte={!!d?.takipte}
        isleniyor={isleniyor}
        hazir={!!d}
        etiket={["İlanı takip et", "Takip ediliyor"]}
        onPress={() =>
          degistir((pro) => Alert.alert("İlan takibe alındı.", pro ? "Son başvuruya 3 gün ve 1 gün kala hatırlatacağız." : "Takip ettiklerin profilinde listelenir."))
        }
      />
      {d?.takipte && !d.pro && (
        <T style={{ textAlign: "center", fontSize: 12, color: renk.soluk }}>
          Son gün hatırlatması Pro&apos;da.{" "}
          <T w="yariKalin" style={{ fontSize: 12, color: renk.birincil, textDecorationLine: "underline" }} onPress={() => yukseltmeAc("PRO", "ilan-takip")}>
            Aç
          </T>
        </T>
      )}
    </View>
  );
}

/** Sitedeki KurumTakipKarti (duyuru sayfasi): duyurular ilandan once cikar; kurumu takip et, ilan yayimlaninca haber verelim. */
export function KurumTakipKarti({ kurum }: { kurum: string }) {
  const yol = `/api/kurum-takip?kurum=${encodeURIComponent(kurum)}`;
  const { d, isleniyor, degistir } = useTakip(yol, (sil) => api("/api/kurum-takip", { method: sil ? "DELETE" : "POST", govde: { kurum } }));
  return (
    <View style={{ borderRadius: 16, borderWidth: 1, borderColor: "rgba(36,102,195,0.15)", backgroundColor: "#fff", padding: 16, gap: 12 }}>
      <View style={{ flexDirection: "row", gap: 10 }}>
        <BellRing size={20} color={renk.birincil} style={{ marginTop: 1 }} />
        <View style={{ flex: 1 }}>
          <T w="yariKalin">{kurum} ilanı yayımlanınca ilk sen öğren</T>
          <T style={{ marginTop: 2, color: renk.soluk, lineHeight: 20 }}>
            {d?.takipte && !d.pro ? (
              <>
                Takiptesin. İlan yayımlandığında bildirim Pro&apos;da gelir.{" "}
                <T w="yariKalin" style={{ color: renk.birincil, textDecorationLine: "underline" }} onPress={() => yukseltmeAc("PRO", "duyuru-takip")}>
                  Bildirimi aç
                </T>
              </>
            ) : d?.takipte ? (
              "Takiptesin: ilan yayımlandığında sana hemen bildirim gelecek."
            ) : (
              "Duyurular ilandan önce çıkar. Kurumu takip et, ilan yayımlanınca haber verelim."
            )}
          </T>
        </View>
      </View>
      <TakipButonu
        takipte={!!d?.takipte}
        isleniyor={isleniyor}
        hazir={!!d}
        etiket={["Kurumu takip et", "Takibi bırak"]}
        onPress={() => degistir((pro) => Alert.alert(`${kurum} takipte.`, pro ? "İlanı yayımlanınca hemen haber vereceğiz." : "Bildirim Pro üyelere gider."))}
      />
    </View>
  );
}

/** Sitedeki BolumIstatistikSeridi: gercek istatistik + "yeni ilanda haber ver" cagrisi. */
export function BolumIstatistikSeridi({ bolumAdi, son30, ortalamaGun }: { bolumAdi: string; son30: number; ortalamaGun: number | null }) {
  return (
    <View style={{ borderRadius: 16, borderWidth: 1, borderColor: "rgba(36,102,195,0.15)", backgroundColor: renk.birincilZemin, padding: 16, gap: 12 }}>
      <View style={{ flexDirection: "row", gap: 8 }}>
        <BellRing size={16} color={renk.birincil} style={{ marginTop: 2 }} />
        <T style={{ flex: 1, color: "#334155", lineHeight: 20 }}>
          {bolumAdi} için son 30 günde <T w="kalin">{son30} ilan</T> yayımlandı
          {ortalamaGun !== null && (
            <>
              ; ilanlar ortalama <T w="kalin">{ortalamaGun} gün</T> açık kalıyor
            </>
          )}
          . Yeni ilanı ilk günden yakala.
        </T>
      </View>
      <ProCagri kaynak="bildirim" uyeEtiket="Yeni ilanda haber ver" style={{ paddingVertical: 10, alignSelf: "flex-start" }} />
    </View>
  );
}

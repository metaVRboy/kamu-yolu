import { useEffect, useState } from "react";
import { ActivityIndicator, Alert, Pressable, View } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { router } from "expo-router";
import { Bell, BellPlus, BellRing, Eye, X, type LucideIcon } from "lucide-react-native";
import { T } from "@/bilesenler/ui";
import { yukseltmeAc } from "@/bilesenler/KilitliOzellik";
import { TesvikKarti, type TesvikCagrisi } from "@/bilesenler/TesvikKarti";
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

/** Sitedeki ProCagri, tesvik kartinin ana butonu olarak: misafire uyelik, ucretsize yukseltme; sahibine yok. */
export function planCagrisi(durum: PlanDurumu | undefined, kaynak: string, uyeEtiket: string, ikon: LucideIcon, misafirEtiket = "Ücretsiz üye ol"): TesvikCagrisi | null {
  if (durum === "misafir") return { etiket: misafirEtiket, ikon, onPress: () => router.push("/kayit") };
  if (durum === "ucretsiz") return { etiket: uyeEtiket, ikon, onPress: () => yukseltmeAc("PRO", kaynak) };
  return null;
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
  if (!durum) return null;
  return (
    <TesvikKarti
      key={durum}
      tema="sis"
      iyi={durum === "sahip"}
      baslik="Bu ilanın başvuru süresi doldu."
      metin={metin}
      cagri={planCagrisi(durum, "kacirilan", "Bir daha kaçırma", Eye)}
      ikincil={bolum ? { etiket: "Açık ilanlara bak", onPress: () => router.push({ pathname: "/liste", params: { kapsam: "bolum", deger: bolum.slug } }) } : null}
    />
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
  if (!d) return null;
  const takipEt = () => degistir((pro) => Alert.alert(`${kurum} takipte.`, pro ? "İlanı yayımlanınca hemen haber vereceğiz." : "Bildirim Pro üyelere gider."));
  // Sinyal temasi: takipte + Pro = iyi hal; takipte + ucretsiz = ana cagri "Bildirimi ac".
  return (
    <TesvikKarti
      key={`${d.takipte}-${d.pro}`}
      tema="sinyal"
      iyi={d.takipte && d.pro}
      baslik={`${kurum} ilanı yayımlanınca ilk sen öğren`}
      metin={
        d.takipte && !d.pro
          ? "Takiptesin. İlan yayımlandığında bildirim Pro'da gelir."
          : d.takipte
            ? "Takiptesin: ilan yayımlandığında sana hemen bildirim gelecek."
            : "Alım haberleri ilandan önce çıkar. Kurumu takip et, ilan yayımlanınca haber verelim."
      }
      cagri={
        !d.takipte
          ? { etiket: isleniyor ? "Kaydediliyor..." : "Kurumu takip et", ikon: BellPlus, onPress: takipEt }
          : !d.pro
            ? { etiket: "Bildirimi aç", ikon: Bell, onPress: () => yukseltmeAc("PRO", "duyuru-takip") }
            : null
      }
      ikincil={d.takipte ? { etiket: "Takibi bırak", onPress: takipEt } : null}
    />
  );
}

/** Sitedeki BolumIstatistikSeridi: gercek istatistik + "yeni ilanda haber ver" cagrisi. Sinyal temasi. */
export function BolumIstatistikSeridi({ bolumAdi, son30, ortalamaGun }: { bolumAdi: string; son30: number; ortalamaGun: number | null }) {
  const durum = usePlanDurumu();
  if (!durum) return null;
  return (
    <TesvikKarti
      key={durum}
      tema="sinyal"
      iyi={durum === "sahip"}
      baslik={`${bolumAdi} için son 30 günde ${son30} ilan yayımlandı`}
      metin={`${ortalamaGun !== null ? `İlanlar ortalama ${ortalamaGun} gün açık kalıyor. ` : ""}Yeni ilanı ilk günden yakala.`}
      cagri={planCagrisi(durum, "bildirim", "Yeni ilanda haber ver", Bell)}
    />
  );
}

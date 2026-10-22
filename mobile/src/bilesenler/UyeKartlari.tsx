import { useState, type ReactNode } from "react";
import { Alert, Pressable, Share, StyleSheet, View } from "react-native";
import { Image } from "expo-image";
import { router } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { CalendarCheck, Check, Crown, Flame, Gift, Lock, Sparkles, Sun } from "lucide-react-native";
import { TesvikKarti } from "@/bilesenler/TesvikKarti";
import { Kart, T } from "@/bilesenler/ui";
import { yukseltmeAc } from "@/bilesenler/KilitliOzellik";
import { SITE, api } from "@/lib/api";
import { renk } from "@/lib/tema";
import type { RozetOzet, RozetRengi, SeriBilgisi, UyeOzeti } from "@/lib/tipler";

const SERI_HEDEFI = 7;
const TURUNCU = "#fb923c";

export const ROZET_RENGI: Record<RozetRengi, { zemin: string; yazi: string }> = {
  mavi: { zemin: "rgba(36,102,195,0.1)", yazi: renk.birincil },
  turuncu: { zemin: "#fef3c7", yazi: "#78350f" },
  yesil: { zemin: "#ecfdf5", yazi: "#065f46" },
  mor: { zemin: "#ede9fe", yazi: "#5b21b6" },
};

export type ProfilKartiVerisi = {
  adSoyad: string;
  fotoUrl: string | null;
  /** "Bölüm · Düzey" ya da bolum secilmediyse uyari. */
  altSatir: string;
  seriGun: number;
  denemeSayisi: number;
  rozetSayisi: number;
  rozetler: RozetOzet[];
  plan: string;
  planAdi: string;
  kalanGun: number | null;
};

const basHarfler = (ad: string) =>
  ad
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]!.toLocaleUpperCase("tr"))
    .join("");

/**
 * Sitedeki ProfilKarti: mavi kapak, foto, bolum, seri/deneme/rozet sayilari, rozetler, uyelik. Profil sekmesinde tam;
 * ana sayfada kompakt (telefonda ekranin yarisini kaplamasin, dokununca profil sekmesi).
 */
type Renkler = [string, string, ...string[]];
/** Sitedeki PLAN_TEMASI: ucretli uye kartinda kendini ozel hissetsin. Ayricaliklar planlardaki gercek ozellikler. */
const PLAN_TEMASI: Record<string, { kapak: Renkler; halka: Renkler; rozet: Renkler; yazi: string; ayricalik: string[] } | undefined> = {
  PRO: {
    kapak: ["#2563eb", "#4f46e5", "#0ea5e9"],
    halka: ["#7dd3fc", "#3b82f6", "#4f46e5"],
    rozet: ["#2563eb", "#4f46e5"],
    yazi: "#4338ca",
    ayricalik: ["Bana özel ilanlar ve anında bildirim", "Ders karnesi ve soru çözümleri", "Seri koruması (ayda 2 dondurma)"],
  },
  PRO_PLUS: {
    kapak: ["#6d28d9", "#c026d3", "#4338ca"],
    halka: ["#fde68a", "#e879f9", "#7c3aed"],
    rozet: ["#7c3aed", "#c026d3"],
    yazi: "#7e22ce",
    ayricalik: ["Sınırsız KPSS denemesi", "Konu konu eksik analizi ve gelişim", "Bana özel ilanlar ve anında bildirim"],
  },
};

/** Isim yanindaki tacli plan rozeti (yalniz ucretli planda). */
function PlanRozeti({ v }: { v: ProfilKartiVerisi }) {
  const tema = PLAN_TEMASI[v.plan];
  if (!tema) return null;
  return (
    <LinearGradient colors={tema.rozet} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={s.planRozeti}>
      <Crown size={12} color="#fde68a" />
      <T w="kalin" style={{ fontSize: 11, letterSpacing: 0.8, color: "#fff" }}>
        {v.planAdi.toLocaleUpperCase("tr")}
      </T>
    </LinearGradient>
  );
}

/** Ucretli uyenin ayricaliklari; ucretsizde ayni yerde kilitli ve soluk "Pro'da seni bekleyenler". */
function Ayricaliklar({ v }: { v: ProfilKartiVerisi }) {
  const tema = PLAN_TEMASI[v.plan];
  const liste = (tema ?? PLAN_TEMASI.PRO!).ayricalik;
  return (
    <View style={{ gap: 6 }}>
      {!tema && (
        <T w="kalin" style={{ fontSize: 11, letterSpacing: 1, color: "#94a3b8" }}>
          PRO&apos;DA SENİ BEKLEYENLER
        </T>
      )}
      {liste.map((a) => (
        <View key={a} style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
          {tema ? (
            <LinearGradient colors={tema.rozet} style={s.tik}>
              <Check size={10} color="#fff" strokeWidth={3} />
            </LinearGradient>
          ) : (
            <Lock size={13} color="#94a3b8" />
          )}
          <T style={{ flex: 1, fontSize: 13, color: tema ? "#475569" : "#94a3b8" }}>{a}</T>
        </View>
      ))}
    </View>
  );
}

export function ProfilKarti({ v, eposta, kapakSag, kompakt }: { v: ProfilKartiVerisi; eposta?: string; kapakSag?: ReactNode; kompakt?: boolean }) {
  const foto = v.fotoUrl && (v.fotoUrl.startsWith("/") ? SITE + v.fotoUrl : v.fotoUrl);
  const tema = PLAN_TEMASI[v.plan];
  if (kompakt) {
    return (
      <Pressable onPress={() => router.navigate("/profil")}>
        <Kart style={{ padding: 14, gap: 12 }}>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
            <View style={[s.avatar, { marginTop: 0, width: 48, height: 48, borderWidth: 0 }]}>
              {foto ? (
                <Image source={{ uri: foto }} style={{ width: "100%", height: "100%" }} />
              ) : (
                <T w="kalin" style={{ fontSize: 17, color: renk.birincil }}>
                  {basHarfler(v.adSoyad)}
                </T>
              )}
            </View>
            <View style={{ flex: 1 }}>
              <T w="kalin" numberOfLines={1} style={{ fontSize: 16 }}>
                {v.adSoyad}
              </T>
              <T numberOfLines={1} style={{ color: renk.soluk, fontSize: 12 }}>
                {v.altSatir}
              </T>
            </View>
            <View style={{ alignItems: "flex-end", gap: 3 }}>
              {tema ? (
                <PlanRozeti v={v} />
              ) : (
                <T w="yariKalin" style={{ fontSize: 12 }}>
                  {v.planAdi}
                </T>
              )}
              {v.kalanGun !== null && <T style={{ fontSize: 11, color: renk.soluk }}>{v.kalanGun} gün kaldı</T>}
            </View>
          </View>
          <View style={{ flexDirection: "row", gap: 8 }}>
            <Sayac deger={v.seriGun} etiket="gün seri" zemin="#fffbeb" r="#b45309" yatay />
            <Sayac deger={v.denemeSayisi} etiket="deneme" zemin="rgba(36,102,195,0.1)" r={renk.birincil} yatay />
            <Sayac deger={v.rozetSayisi} etiket="rozet" zemin="#ecfdf5" r="#047857" yatay onPress={() => router.push("/rozetler")} />
          </View>
        </Kart>
      </Pressable>
    );
  }
  return (
    <Kart style={{ overflow: "hidden" }}>
      {tema ? (
        <LinearGradient colors={tema.kapak} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={s.kapak}>
          <Crown size={64} color="rgba(255,255,255,0.15)" style={{ position: "absolute", right: -6, bottom: -18, transform: [{ rotate: "12deg" }] }} />
          {kapakSag}
        </LinearGradient>
      ) : (
        <View style={s.kapak}>{kapakSag}</View>
      )}
      <View style={{ paddingHorizontal: 18, paddingBottom: 18, gap: 12 }}>
        {/* Ucretli planda avatarin cevresinde plan renginde halka. */}
        {tema ? (
          <LinearGradient colors={tema.halka} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={s.halka}>
            <View style={[s.avatar, { marginTop: 0 }]}>
              {foto ? (
                <Image source={{ uri: foto }} style={{ width: "100%", height: "100%" }} />
              ) : (
                <T w="kalin" style={{ fontSize: 22, color: renk.birincil }}>
                  {basHarfler(v.adSoyad)}
                </T>
              )}
            </View>
          </LinearGradient>
        ) : (
          <View style={s.avatar}>
            {foto ? (
              <Image source={{ uri: foto }} style={{ width: "100%", height: "100%" }} />
            ) : (
              <T w="kalin" style={{ fontSize: 22, color: renk.birincil }}>
                {basHarfler(v.adSoyad)}
              </T>
            )}
          </View>
        )}
        <View>
          <View style={{ flexDirection: "row", flexWrap: "wrap", alignItems: "center", gap: 8 }}>
            <T w="kalin" style={{ fontSize: 18 }}>
              {v.adSoyad}
            </T>
            <PlanRozeti v={v} />
          </View>
          <T style={{ color: renk.soluk, fontSize: 13 }}>{v.altSatir}</T>
          {!!eposta && <T style={{ color: renk.soluk, fontSize: 12, marginTop: 2 }}>{eposta}</T>}
        </View>
        <View style={{ flexDirection: "row", gap: 8 }}>
          <Sayac deger={v.seriGun} etiket="gün seri" zemin="#fffbeb" r="#b45309" />
          <Sayac deger={v.denemeSayisi} etiket="deneme" zemin="rgba(36,102,195,0.1)" r={renk.birincil} />
          <Sayac deger={v.rozetSayisi} etiket="rozet" zemin="#ecfdf5" r="#047857" onPress={() => router.push("/rozetler")} />
        </View>
        {/* "Pro üye" rozeti plan rozetiyle tekrar etmesin. */}
        {v.rozetler.some((r) => r.id !== "pro") && (
          <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 6 }}>
            {v.rozetler.filter((r) => r.id !== "pro").map((r) => (
              <View key={r.id} style={{ borderRadius: 999, paddingHorizontal: 10, paddingVertical: 4, backgroundColor: ROZET_RENGI[r.renk].zemin }}>
                <T w="yariKalin" style={{ fontSize: 12, color: ROZET_RENGI[r.renk].yazi }}>
                  {r.ad}
                </T>
              </View>
            ))}
          </View>
        )}
        <Ayricaliklar v={v} />
        <View style={s.uyelik}>
          {tema ? (
            <View style={{ flex: 1 }}>
              <T w="kalin" style={{ fontSize: 13, color: tema.yazi }}>
                {v.planAdi} üyesin
              </T>
              {v.kalanGun !== null && <T style={{ fontSize: 12, color: renk.soluk }}>{v.kalanGun} gün kaldı</T>}
            </View>
          ) : (
            <T style={{ flex: 1, fontSize: 13, color: renk.soluk }}>
              Üyelik: <T w="yariKalin" style={{ fontSize: 13 }}>{v.planAdi}</T>
            </T>
          )}
          {v.plan === "UCRETSIZ" ? (
            <T w="yariKalin" style={{ color: renk.birincil }} onPress={() => yukseltmeAc(undefined, "genel")}>
              Yükselt
            </T>
          ) : v.plan === "PRO" ? (
            <T w="yariKalin" style={{ color: "#6d28d9" }} onPress={() => yukseltmeAc("PRO_PLUS", "genel")}>
              Pro+&apos;ya geç
            </T>
          ) : null}
        </View>
      </View>
    </Kart>
  );
}

function Sayac({ deger, etiket, zemin, r, onPress, yatay }: { deger: number; etiket: string; zemin: string; r: string; onPress?: () => void; yatay?: boolean }) {
  return (
    <Pressable
      onPress={onPress}
      disabled={!onPress}
      style={[{ flex: 1, alignItems: "center", borderRadius: 12, backgroundColor: zemin, paddingVertical: 8 }, yatay && { flexDirection: "row", justifyContent: "center", gap: 5, paddingVertical: 6 }]}
    >
      <T w="kalin" style={{ fontSize: yatay ? 15 : 20, color: r }}>
        {deger}
      </T>
      <T style={{ fontSize: 11, color: r }}>{etiket}</T>
    </Pressable>
  );
}

/**
 * Seri dondurma (Pro ayricaligi) satiri: seri bozulmak uzereyken Pro'ya kalan hak, ucretsize uyari; seri bozulduysa
 * ucretsize "Pro'da ayda 2 dondurma". Koyu zemin icin.
 */
export function SeriKoruma({ seri }: { seri: SeriBilgisi | null | undefined }) {
  if (!seri || seri.bugunCozuldu) return null;
  const pro = seri.dondurmaKalan !== null;
  // Gece temasi: koruma yoksa gece, Pro'da hak varsa gun dogmus (iyi) hal.
  const cagri = (etiket: string) => ({ etiket, ikon: Sun, onPress: () => yukseltmeAc("PRO", "seri") });
  if (seri.gun > 0 && pro) {
    return seri.dondurmaKalan ? (
      <TesvikKarti tema="gece" kompakt iyi baslik="Seri koruması açık" metin={`Bu ay ${seri.dondurmaKalan} dondurma hakkın var; bir gün kaçırsan da serin sürer.`} />
    ) : (
      <TesvikKarti tema="gece" kompakt baslik="Bu ayki dondurma hakların bitti" metin="Serini korumak için bugün çöz." />
    );
  }
  if (seri.gun > 0) return <TesvikKarti tema="gece" kompakt baslik="Bugün çözmezsen serin bozulur." metin="Pro'da ayda 2 seri dondurma hakkın olur." cagri={cagri("Pro'da seri korunur")} />;
  if (!pro && seri.enIyi >= 2) return <TesvikKarti tema="gece" kompakt baslik={`${seri.enIyi} günlük serin bozuldu.`} metin="Pro'da ayda 2 seri dondurma hakkın olur." cagri={cagri("Pro'yu incele")} />;
  return null;
}

/** Sitedeki GunlukSerit: gunun sorulari (seri), bugun senin icin, KPSS denemesi. Telefonda alt alta. */
export function GunlukSerit({ veri }: { veri: UyeOzeti | null }) {
  const u = veri?.uye;
  const ozet = veri?.ozet;
  const seri = u?.seri;
  // Haftalik hedef: 7 gunluk seride 1 gun Pro hediye.
  const dolu = seri ? (seri.gun > 0 && seri.gun % SERI_HEDEFI === 0 && seri.bugunCozuldu ? SERI_HEDEFI : seri.gun % SERI_HEDEFI) : 0;
  const hediyeyeKalan = SERI_HEDEFI - dolu;

  return (
    <View style={{ gap: 12 }}>
      <View style={s.seriKarti}>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
          <Flame size={20} color={TURUNCU} />
          <T w="yariKalin" style={{ color: "#fff" }}>
            {seri && seri.gun > 0 ? `${seri.gun} günlük seri` : "Serini başlat"}
          </T>
        </View>
        <T w="kalin" style={{ color: "#fff", fontSize: 20 }}>
          Günün 5 sorusu
        </T>
        <View style={{ flexDirection: "row", gap: 6 }} accessibilityLabel={`Haftalık hedef: ${dolu}/${SERI_HEDEFI} gün`}>
          {Array.from({ length: SERI_HEDEFI }, (_, i) => (
            <View key={i} style={{ flex: 1, height: 8, borderRadius: 4, backgroundColor: i < dolu ? TURUNCU : "#334155" }} />
          ))}
        </View>
        <T style={{ color: "#cbd5e1", fontSize: 13, lineHeight: 19 }}>
          {!u
            ? "Türkçe, Matematik, Tarih, Coğrafya, Vatandaşlık. Üye ol, serini başlat: 7. günde 1 gün Pro hediye."
            : seri?.bugunCozuldu
              ? `Bugünü tamamladın. ${hediyeyeKalan === 0 ? "1 gün Pro hediyeni kazandın!" : `Pro hediyeye ${hediyeyeKalan} gün kaldı.`}`
              : `Türkçe, Matematik, Tarih, Coğrafya, Vatandaşlık. Pro hediyeye ${hediyeyeKalan} gün kaldı.`}
        </T>
        <SeriKoruma seri={seri} />
        <Pressable onPress={() => router.push("/gunun-sorulari")} style={({ pressed }) => [s.turuncuButon, pressed && { opacity: 0.85 }]}>
          <T w="kalin" style={{ color: "#0f172a", fontSize: 15 }}>
            {seri?.bugunCozuldu ? "Sonuçlarını gör" : seri && seri.gun > 0 ? "Devam et" : "Çözmeye başla"}
          </T>
        </Pressable>
      </View>

      <Kart style={{ padding: 18, gap: 6 }}>
        <T w="kalin" style={{ fontSize: 11, letterSpacing: 1, color: renk.birincil }}>
          BUGÜN SENİN İÇİN
        </T>
        {ozet ? (
          <>
            <T w="kalin" style={{ fontSize: 17 }}>
              {ozet.yeni7 > 0 ? `Bu hafta ${ozet.yeni7} yeni ilan eşleşti` : `${ozet.aktif} uygun ilan açık`}
            </T>
            <T style={{ color: renk.soluk, fontSize: 13 }}>
              {ozet.bolumAdi}
              {ozet.yaklasan > 0 && ` · ${ozet.yaklasan} ilanın son başvurusu 3 gün içinde`}
            </T>
            <CerceveButon etiket="İlanlarını gör" onPress={() => router.push({ pathname: "/liste", params: { kapsam: "bolum", deger: ozet.bolumSlug } })} />
          </>
        ) : u ? (
          <>
            <T w="kalin" style={{ fontSize: 17 }}>
              Bölümünü seç
            </T>
            <T style={{ color: renk.soluk, fontSize: 13 }}>Bölümüne uygun yeni ilanları ve son başvurusu yaklaşanları burada gösterelim.</T>
            <CerceveButon etiket="Bölümümü seç" onPress={() => router.push("/profil-duzenle")} />
          </>
        ) : (
          <>
            <T w="kalin" style={{ fontSize: 17 }}>
              Sana uygun ilanlar
            </T>
            <T style={{ color: renk.soluk, fontSize: 13 }}>Üye ol, bölümünü seç: yeni eşleşen ve son başvurusu yaklaşan ilanların her gün burada.</T>
            <CerceveButon etiket="Ücretsiz üye ol" onPress={() => router.push("/kayit")} />
          </>
        )}
      </Kart>

      <Kart style={{ padding: 18, gap: 6 }}>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
          <CalendarCheck size={15} color="#6d28d9" />
          <T w="kalin" style={{ fontSize: 11, letterSpacing: 1, color: "#6d28d9" }}>
            KPSS DENEMESİ
          </T>
        </View>
        <T w="kalin" style={{ fontSize: 17 }}>
          Bugünün denemesi hazır
        </T>
        <T style={{ color: renk.soluk, fontSize: 13 }}>
          {veri?.sonDeneme?.siralama
            ? `Son deneme sıralaman: en iyi %${Math.max(1, 100 - veri.sonDeneme.siralama.yuzde)} (${veri.sonDeneme.siralama.katilimci} katılımcı).`
            : "120 soru, 130 dakika: gerçek sınav formatında, her gün yeni deneme."}
        </T>
        <Pressable onPress={() => router.navigate("/kpss")} style={({ pressed }) => [s.morButon, pressed && { opacity: 0.85 }]}>
          <T w="kalin" style={{ color: "#fff" }}>
            Denemeye başla
          </T>
        </Pressable>
      </Kart>
    </View>
  );
}

function CerceveButon({ etiket, onPress }: { etiket: string; onPress: () => void }) {
  return (
    <Pressable onPress={onPress} style={({ pressed }) => [s.cerceveButon, pressed && { backgroundColor: renk.birincilZemin }]}>
      <T w="kalin" style={{ color: renk.birincil }}>
        {etiket}
      </T>
    </Pressable>
  );
}

/** Davet linkini paylasir (link ilk istekte uretilir). */
export async function davetPaylas() {
  try {
    const d = await api<{ link: string }>("/api/davet");
    await Share.share({ message: `Bölümüne uygun kamu ilanlarını ve günlük KPSS sorularını Kamu Yolu'nda bul:\n${d.link}` });
  } catch (e) {
    Alert.alert("Davet linki alınamadı.", e instanceof Error ? e.message : undefined);
  }
}

/** Sitedeki DavetBandi: arkadasini davet et, ikiniz de 1 hafta Pro. */
export function DavetBandi() {
  const [yukleniyor, setYukleniyor] = useState(false);
  return (
    <View style={s.davet}>
      <View style={{ flexDirection: "row", gap: 10 }}>
        <Gift size={24} color="#fcd34d" />
        <View style={{ flex: 1 }}>
          <T w="kalin" style={{ color: "#fff", fontSize: 16 }}>
            Arkadaşını davet et, ikiniz de 1 hafta Pro kazanın
          </T>
          <T style={{ marginTop: 4, color: "#cbd5e1", fontSize: 13, lineHeight: 19 }}>Arkadaşın davet linkinle üye olup bölümünü seçince Pro ikinize de açılır.</T>
        </View>
      </View>
      <View style={{ flexDirection: "row", gap: 8 }}>
        <Pressable
          disabled={yukleniyor}
          onPress={async () => {
            setYukleniyor(true);
            await davetPaylas();
            setYukleniyor(false);
          }}
          style={({ pressed }) => [s.beyazButon, (pressed || yukleniyor) && { opacity: 0.8 }]}
        >
          <T w="kalin">Davet linkini paylaş</T>
        </Pressable>
        <Pressable onPress={() => router.push("/davet")} style={{ flexDirection: "row", alignItems: "center", gap: 6, paddingHorizontal: 12 }}>
          <Sparkles size={16} color="#e2e8f0" />
          <T w="yariKalin" style={{ color: "#e2e8f0" }}>
            Davetlerim
          </T>
        </Pressable>
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  kapak: { height: 56, backgroundColor: renk.birincil, flexDirection: "row", justifyContent: "flex-end", alignItems: "flex-start", padding: 10, gap: 8 },
  avatar: { marginTop: -32, width: 64, height: 64, borderRadius: 32, borderWidth: 3, borderColor: "#fff", backgroundColor: "#dbeafe", alignItems: "center", justifyContent: "center", overflow: "hidden" },
  uyelik: { flexDirection: "row", alignItems: "center", gap: 12, borderTopWidth: 1, borderTopColor: renk.kenar, paddingTop: 12 },
  halka: { marginTop: -35, alignSelf: "flex-start", borderRadius: 999, padding: 3 },
  planRozeti: { flexDirection: "row", alignItems: "center", gap: 4, borderRadius: 999, paddingHorizontal: 9, paddingVertical: 3 },
  tik: { width: 16, height: 16, borderRadius: 8, alignItems: "center", justifyContent: "center" },
  seriKarti: { borderRadius: 24, backgroundColor: "#0f172a", padding: 20, gap: 12 },
  turuncuButon: { marginTop: 4, alignItems: "center", borderRadius: 12, backgroundColor: TURUNCU, paddingVertical: 13 },
  cerceveButon: { marginTop: 8, alignItems: "center", borderRadius: 12, borderWidth: 1, borderColor: renk.birincil, paddingVertical: 11 },
  morButon: { marginTop: 8, alignItems: "center", borderRadius: 12, backgroundColor: "#6d28d9", paddingVertical: 11 },
  davet: { borderRadius: 24, backgroundColor: "#1e293b", padding: 20, gap: 16 },
  beyazButon: { borderRadius: 12, backgroundColor: "#fff", paddingHorizontal: 16, paddingVertical: 11 },
});

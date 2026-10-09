import { useCallback, type ReactNode } from "react";
import { Pressable, RefreshControl, ScrollView, StyleSheet, View } from "react-native";
import { Image } from "expo-image";
import { router, useFocusEffect, type Href } from "expo-router";
import {
  BarChart3,
  Bell,
  Briefcase,
  ChevronRight,
  Crown,
  FilePlus2,
  GraduationCap,
  Heart,
  Inbox,
  LifeBuoy,
  LogOut,
  MessageCircle,
  Pencil,
  Repeat,
  Settings,
  type LucideIcon,
} from "lucide-react-native";
import { Buton, HataKutusu, Kart, T, Yukleniyor } from "@/bilesenler/ui";
import { IlanKarti } from "@/bilesenler/IlanKarti";
import { KilitliOzellik } from "@/bilesenler/KilitliOzellik";
import { GirisKarti } from "@/bilesenler/GirisDaveti";
import { SITE, useVeri } from "@/lib/api";
import { useOturum } from "@/lib/oturum";
import { renk } from "@/lib/tema";
import type { ProfilVeri } from "@/lib/tipler";

const PLAN_RENGI = { UCRETSIZ: { zemin: renk.griZemin, yazi: "#475569" }, PRO: { zemin: "#e0f2fe", yazi: "#0369a1" }, PRO_PLUS: { zemin: "#ede9fe", yazi: "#6d28d9" } } as const;

type Oge = { yol: Href; etiket: string; ikon: LucideIcon; rozet?: number };
// Giris gerektirmeyen sayfalar (sitede ust menude).
const GENEL: Oge[] = [
  { yol: "/bildirimler", etiket: "Bildirimler", ikon: Bell },
  { yol: "/analiz", etiket: "Alım Analizi", ikon: BarChart3 },
  { yol: "/destek", etiket: "İletişim ve Destek", ikon: LifeBuoy },
];

/** Sitedeki /profilim + profil kenar menusu. Giris yoksa giris/kayit daveti ve genel sayfalar. */
export default function Profil() {
  const { kullanici, cikis } = useOturum();
  const { veri, hata, yenileniyor, yenile } = useVeri<ProfilVeri>(kullanici ? `/api/mobil/profil?u=${kullanici.id}` : null);
  // Alt sayfalardan donunce guncel bilgi (okunmamislar, profil).
  useFocusEffect(
    useCallback(() => {
      if (kullanici) yenile(false);
    }, [kullanici, yenile]),
  );

  if (kullanici === undefined) return <Yukleniyor />;
  if (!kullanici) {
    return (
      <ScrollView contentContainerStyle={{ padding: 16, gap: 16 }}>
        <GirisKarti baslik="Kamu Yolu hesabın" metin="Giriş yap; bölümüne uygun ilanları, ilan uygunluk kontrolünü ve profilini kullan." />
        <Menu ogeler={GENEL} />
      </ScrollView>
    );
  }
  if (hata && !veri) return <HataKutusu mesaj={hata} tekrar={yenile} />;
  if (!veri?.kullanici) return <Yukleniyor />;
  const k = veri.kullanici;
  const foto = k.fotografUrl && (k.fotografUrl.startsWith("/") ? SITE + k.fotografUrl : k.fotografUrl);
  const planRenk = PLAN_RENGI[k.plan];
  const ilanlar = veri.kisiselIlanlar.map((i) => <IlanKarti key={i.id} ilan={i} />);

  return (
    <ScrollView contentContainerStyle={{ padding: 16, gap: 16, paddingBottom: 32 }} refreshControl={<RefreshControl refreshing={yenileniyor} onRefresh={yenile} tintColor={renk.birincil} />}>
      <Kart style={{ padding: 20, flexDirection: "row", alignItems: "center", gap: 14 }}>
        <View style={s.avatar}>{foto ? <Image source={{ uri: foto }} style={{ width: "100%", height: "100%" }} /> : <T w="kalin" style={{ fontSize: 22, color: renk.birincil }}>{k.adSoyad.charAt(0)}</T>}</View>
        <View style={{ flex: 1 }}>
          <T w="kalin" style={{ fontSize: 18 }}>
            {k.adSoyad}
          </T>
          <T style={{ color: renk.soluk, fontSize: 13 }}>{k.email}</T>
          <View style={[s.plan, { backgroundColor: planRenk.zemin }]}>
            <T w="kalin" style={{ fontSize: 12, color: planRenk.yazi }}>
              {k.planAdi}
            </T>
          </View>
        </View>
      </Kart>

      <Kart style={{ padding: 20, gap: 12 }}>
        <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
          <T w="yariKalin" style={{ color: renk.birincil, fontSize: 15 }}>
            Profil Bilgilerim
          </T>
          <Pressable onPress={() => router.push("/profil-duzenle")} hitSlop={8} style={{ flexDirection: "row", alignItems: "center", gap: 4 }}>
            <Pencil size={14} color={renk.birincil} />
            <T w="yariKalin" style={{ color: renk.birincil }}>
              Düzenle
            </T>
          </Pressable>
        </View>
        <Satir ikon={GraduationCap} etiket="Bölüm" deger={k.bolum?.ad ?? "Seçilmedi"} />
        <Satir ikon={Briefcase} etiket="Öğrenim düzeyi" deger={k.duzeyAdi ?? "Seçilmedi"} />
      </Kart>

      <Menu
        ogeler={[
          { yol: "/ayarlar", etiket: "Ayarlar", ikon: Settings },
          { yol: "/abonelik", etiket: "Aboneliğim", ikon: Crown },
          { yol: "/becayis/talep-olustur", etiket: "Becayiş Talebi Oluştur", ikon: FilePlus2 },
          { yol: "/becayis/taleplerim", etiket: "Mevcut Taleplerim", ikon: Inbox, rozet: veri.okunmamisMesaj },
          { yol: "/becayis/ilgilendiklerim", etiket: "İlgilendiğim İlanlar", ikon: Heart, rozet: veri.okunmamisIlgilendiklerim },
          ...GENEL,
        ]}
      />

      <Bolum ikon={Repeat} baslik="Aktif Becayiş İlanlarım">
        {veri.aktifTalepler.length === 0 ? (
          <View style={{ gap: 12, alignItems: "flex-start" }}>
            <T style={{ color: renk.soluk }}>Henüz aktif bir becayiş ilanın yok.</T>
            <Buton etiket="Talep Oluştur" onPress={() => router.push("/becayis/talep-olustur")} style={{ paddingVertical: 9 }} />
          </View>
        ) : (
          <>
            {veri.aktifTalepler.map((t) => (
              <Pressable key={t.id} onPress={() => router.push("/becayis/taleplerim")} style={s.kutu}>
                <T w="orta">{t.meslek}</T>
                <T style={{ fontSize: 12, color: renk.soluk }}>
                  {t.mevcutIl}
                  {t.mevcutIlce ? ` / ${t.mevcutIlce}` : ""}
                </T>
              </Pressable>
            ))}
            <TumunuGor />
          </>
        )}
      </Bolum>

      <Bolum ikon={Inbox} baslik="Gelen Mesajlarım" rozet={veri.okunmamisMesaj}>
        {veri.sonMesajlar.length === 0 ? (
          <T style={{ color: renk.soluk }}>Henüz bir mesajın yok.</T>
        ) : (
          <>
            {veri.sonMesajlar.map((m) => (
              <Pressable key={m.id} onPress={() => router.push("/becayis/taleplerim")} style={[s.kutu, { flexDirection: "row", gap: 8 }, !m.okundu && { backgroundColor: renk.birincilZemin }]}>
                <MessageCircle size={14} color={renk.soluk} style={{ marginTop: 2 }} />
                <View style={{ flex: 1 }}>
                  <T w="orta">{m.karsiAdSoyad}</T>
                  <T numberOfLines={1} style={{ fontSize: 12, color: renk.soluk }}>
                    {m.mesaj}
                  </T>
                </View>
              </Pressable>
            ))}
            <TumunuGor />
          </>
        )}
      </Bolum>

      <View style={{ gap: 12 }}>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
          <Briefcase size={16} color={renk.birincil} />
          <T w="yariKalin" style={{ fontSize: 16, color: renk.birincil }}>
            Bana Özel İlanlar
          </T>
        </View>
        <T style={{ color: renk.soluk, lineHeight: 20 }}>Profilinde belirttiğin bölüm/öğrenim düzeyine uygun ilanlar burada listelenir.</T>
        {veri.kisiselIlanSayisi === 0 ? (
          <T style={{ color: renk.soluk, lineHeight: 20 }}>
            Eşleşen ilan bulabilmemiz için{" "}
            <T w="orta" style={{ color: renk.birincil }} onPress={() => router.push("/profil-duzenle")}>
              profilindeki bölüm veya öğrenim düzeyi bilgini
            </T>{" "}
            tamamla.
          </T>
        ) : k.plan === "UCRETSIZ" ? (
          <KilitliOzellik
            mevcutPlan={k.plan}
            gerekenPlan="PRO"
            kaynak="ozel-ilanlar"
            uzun
            baslik={`Sana özel ${veri.kisiselIlanSayisi} ilan bulundu`}
            ozellikler={["Bölümüne ve öğrenim düzeyine uygun ilanlar tek listede", "Yeni ilan çıkınca öncelikli bildirim ve SMS"]}
          >
            <View style={{ gap: 16 }}>{ilanlar}</View>
          </KilitliOzellik>
        ) : (
          <>
            {ilanlar}
            {veri.kisiselIlanSayisi > veri.kisiselIlanlar.length && (
              <Buton
                tur="cerceve"
                etiket="Tümünü gör"
                onPress={() =>
                  router.push({
                    pathname: "/liste",
                    params: k.bolum ? { kapsam: "bolum", deger: k.bolum.slug } : { kapsam: "seviye", deger: (k.duzey ?? "").toLowerCase().replace("_", "-") },
                  })
                }
              />
            )}
          </>
        )}
      </View>

      <Buton tur="cerceve" ikon={LogOut} etiket="Çıkış Yap" onPress={cikis} style={{ marginTop: 8 }} />
    </ScrollView>
  );
}

function Menu({ ogeler }: { ogeler: Oge[] }) {
  return (
    <Kart style={{ paddingVertical: 6 }}>
      {ogeler.map((o, i) => (
        <Pressable key={o.etiket} onPress={() => router.push(o.yol)} style={({ pressed }) => [s.menu, i > 0 && { borderTopWidth: 1, borderTopColor: renk.birincilKenar }, pressed && { backgroundColor: renk.birincilZemin }]}>
          <o.ikon size={18} color={renk.birincil} />
          <T w="yariKalin" style={{ flex: 1 }}>
            {o.etiket}
          </T>
          {!!o.rozet && <Rozet n={o.rozet} />}
          <ChevronRight size={18} color={renk.soluk} />
        </Pressable>
      ))}
    </Kart>
  );
}

function Bolum({ ikon: Ikon, baslik, rozet, children }: { ikon: LucideIcon; baslik: string; rozet?: number; children: ReactNode }) {
  return (
    <Kart style={{ padding: 20, gap: 10 }}>
      <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
        <Ikon size={16} color={renk.birincil} />
        <T w="yariKalin" style={{ fontSize: 15, color: renk.birincil }}>
          {baslik}
        </T>
        {!!rozet && <Rozet n={rozet} />}
      </View>
      {children}
    </Kart>
  );
}

function TumunuGor() {
  return (
    <T w="orta" style={{ paddingTop: 4, color: renk.birincil }} onPress={() => router.push("/becayis/taleplerim")}>
      Tümünü gör »
    </T>
  );
}

function Rozet({ n }: { n: number }) {
  return (
    <View style={s.rozet}>
      <T w="yariKalin" style={{ color: "#fff", fontSize: 12 }}>
        {n}
      </T>
    </View>
  );
}

function Satir({ ikon: Ikon, etiket, deger }: { ikon: LucideIcon; etiket: string; deger: string }) {
  return (
    <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
      <View style={s.satirIkon}>
        <Ikon size={18} color={renk.birincil} />
      </View>
      <View style={{ flex: 1 }}>
        <T style={{ fontSize: 12, color: renk.soluk }}>{etiket}</T>
        <T w="yariKalin">{deger}</T>
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  avatar: { width: 64, height: 64, borderRadius: 32, backgroundColor: renk.birincilZemin, alignItems: "center", justifyContent: "center", overflow: "hidden" },
  plan: { alignSelf: "flex-start", marginTop: 6, borderRadius: 999, paddingHorizontal: 10, paddingVertical: 3 },
  satirIkon: { width: 36, height: 36, borderRadius: 10, backgroundColor: renk.birincilZemin, alignItems: "center", justifyContent: "center" },
  menu: { flexDirection: "row", alignItems: "center", gap: 12, paddingHorizontal: 18, paddingVertical: 14 },
  rozet: { minWidth: 20, height: 20, borderRadius: 10, paddingHorizontal: 6, backgroundColor: renk.birincil, alignItems: "center", justifyContent: "center" },
  kutu: { borderWidth: 1, borderColor: renk.birincilKenar, borderRadius: 12, paddingHorizontal: 12, paddingVertical: 9 },
});

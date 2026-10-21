import { useCallback, type ReactNode } from "react";
import { Pressable, RefreshControl, ScrollView, StyleSheet, View } from "react-native";
import { router, useFocusEffect, type Href } from "expo-router";
import {
  Award,
  BarChart3,
  Eye,
  Bell,
  BellRing,
  Briefcase,
  ChevronRight,
  Crown,
  FilePlus2,
  Flame,
  Gift,
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
import { KilitliOzellik, yukseltmeAc } from "@/bilesenler/KilitliOzellik";
import { GirisKarti } from "@/bilesenler/GirisDaveti";
import { ProfilKarti } from "@/bilesenler/UyeKartlari";
import { TesvikKarti } from "@/bilesenler/TesvikKarti";
import { useVeri } from "@/lib/api";
import { useOturum } from "@/lib/oturum";
import { renk } from "@/lib/tema";
import type { ProfilVeri } from "@/lib/tipler";

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
  const ilanlar = veri.kisiselIlanlar.map((i) => <IlanKarti key={i.id} ilan={i} />);
  const premium = k.plan !== "UCRETSIZ";

  return (
    <ScrollView contentContainerStyle={{ padding: 16, gap: 16, paddingBottom: 32 }} refreshControl={<RefreshControl refreshing={yenileniyor} onRefresh={yenile} tintColor={renk.birincil} />}>
      <ProfilKarti
        eposta={k.email}
        v={{
          adSoyad: k.adSoyad,
          fotoUrl: k.fotografUrl,
          altSatir: [k.bolum?.ad, k.duzeyAdi].filter(Boolean).join(" · ") || "Bölümünü henüz seçmedin",
          seriGun: veri.seriGun,
          denemeSayisi: veri.denemeSayisi,
          rozetSayisi: veri.rozetSayisi,
          rozetler: veri.rozetler,
          plan: k.plan,
          planAdi: k.planAdi,
          kalanGun: k.kalanGun,
        }}
        kapakSag={
          <Pressable onPress={() => router.push("/profil-duzenle")} style={s.kapakButon}>
            <Pencil size={13} color="#fff" />
            <T w="yariKalin" style={{ color: "#fff", fontSize: 13 }}>
              Profili düzenle
            </T>
          </Pressable>
        }
      />

      {/* Bolumu olmayan uye sitenin ana degerini goremez: ilk is bolum secimi. */}
      {!k.bolum && (
        <View style={[s.uyariKutu, { borderColor: "rgba(36,102,195,0.3)", backgroundColor: renk.birincilZemin }]}>
          <T w="yariKalin">Mezun olduğun bölümü seç</T>
          <T style={{ color: renk.yaziIkincil, lineHeight: 20 }}>Bölümüne uygun kamu ilanlarını ve yeni ilan bildirimlerini buna göre hazırlıyoruz.</T>
          <Buton etiket="Bölümümü seç" onPress={() => router.push("/profil-duzenle")} style={{ alignSelf: "flex-start", paddingVertical: 10 }} />
        </View>
      )}

      {/* Kacirilan ilanlar (ucretsiz uye): bolumune eslesip son 30 gunde son basvurusu gecmis gercek ilan sayisi. */}
      {veri.kacirilan30 > 0 && veri.kisiselIlanSayisi > 0 && (
        <TesvikKarti
          tema="sis"
          baslik={`Son 30 günde bölümüne uygun ${veri.kacirilan30} ilanın son başvurusu geçti`}
          metin="Pro'da bölümüne uygun yeni ilan çıkınca anında haberin olur; takip ettiğin ilanlar için son gün hatırlatması gelir."
          cagri={{ etiket: "Bir daha kaçırma", ikon: Eye, onPress: () => yukseltmeAc("PRO", "kacirilan") }}
        />
      )}

      <Menu
        ogeler={[
          { yol: "/ayarlar", etiket: "Ayarlar", ikon: Settings },
          { yol: "/abonelik", etiket: "Aboneliğim", ikon: Crown },
          { yol: "/gunun-sorulari", etiket: "Günün 5 Sorusu", ikon: Flame },
          { yol: "/takip", etiket: "Takip Ettiğim İlanlar", ikon: BellRing },
          { yol: "/rozetler", etiket: "Rozetlerim", ikon: Award },
          { yol: "/davet", etiket: "Arkadaşını Davet Et", ikon: Gift },
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
        {veri.kisiselIlanSayisi === 0 && !k.bolum && !k.duzey ? (
          <T style={{ color: renk.soluk, lineHeight: 20 }}>
            Eşleşen ilan bulabilmemiz için{" "}
            <T w="orta" style={{ color: renk.birincil }} onPress={() => router.push("/profil-duzenle")}>
              profilindeki bölüm veya öğrenim düzeyi bilgini
            </T>{" "}
            tamamla.
          </T>
        ) : veri.kisiselIlanSayisi === 0 ? (
          // Bolum girili ama su an acik ilan yok: kacirilan varsa sis, yoksa sinyal; Pro'da sinyal iyi halde.
          <TesvikKarti
            tema={!premium && veri.kacirilan30 > 0 ? "sis" : "sinyal"}
            iyi={premium}
            baslik={`Şu an ${k.bolum ? `${k.bolum.ad} için` : "bölümüne uygun"} açık ilan yok.`}
            metin={
              premium
                ? "Yeni ilan yayımlandığında sana hemen bildirim gelecek; bu sayfada da listelenecek."
                : veri.kacirilan30 > 0
                  ? `Son 30 günde bölümüne uygun ${veri.kacirilan30} ilan yayımlandı ve son başvuruları geçti. Pro ile bir sonraki ilan çıktığı an haberin olur.`
                  : "Yeni ilan yayımlandığında ilk senin haberin olsun: Pro'da bölümüne uygun her yeni ilanda anında bildirim alırsın."
            }
            cagri={
              premium
                ? null
                : veri.kacirilan30 > 0
                  ? { etiket: "Bir daha kaçırma", ikon: Eye, onPress: () => yukseltmeAc("PRO", "kacirilan") }
                  : { etiket: "İlk ben haberdar olayım", ikon: Bell, onPress: () => yukseltmeAc("PRO", "bildirim") }
            }
          />
        ) : k.plan === "UCRETSIZ" ? (
          <>
          <KilitliOzellik
            mevcutPlan={k.plan}
            gerekenPlan="PRO"
            kaynak="ozel-ilanlar"
            uzun
            baslik={`Sana özel ${veri.kisiselIlanSayisi} ilan bulundu`}
            ozellikler={["Bölümüne ve öğrenim düzeyine uygun ilanlar tek listede", "Yeni ilan çıkınca anında bildirim"]}
          >
            <View style={{ gap: 16 }}>{ilanlar}</View>
          </KilitliOzellik>
          {/* Kayit "bolumune uygun ilanlari takip et" vaat ediyor: bolum sayfasi herkese ucretsiz. */}
          {!!k.bolum && (
            <T style={{ color: renk.yaziIkincil, lineHeight: 20 }}>
              {k.bolum.ad} için tüm ilanları{" "}
              <T w="orta" style={{ color: renk.birincil }} onPress={() => router.push({ pathname: "/liste", params: { kapsam: "bolum", deger: k.bolum!.slug } })}>
                bölüm sayfasında ücretsiz görebilirsin
              </T>
              ; Pro ile bölümüne ve öğrenim düzeyine göre süzülmüş listeyi ve yeni ilan bildirimlerini alırsın.
            </T>
          )}
          </>
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

const s = StyleSheet.create({
  kapakButon: { flexDirection: "row", alignItems: "center", gap: 6, borderRadius: 999, borderWidth: 1, borderColor: "rgba(255,255,255,0.3)", backgroundColor: "rgba(255,255,255,0.15)", paddingHorizontal: 12, paddingVertical: 6 },
  uyariKutu: { borderWidth: 1, borderRadius: 16, padding: 16, gap: 8 },
  menu: { flexDirection: "row", alignItems: "center", gap: 12, paddingHorizontal: 18, paddingVertical: 14 },
  rozet: { minWidth: 20, height: 20, borderRadius: 10, paddingHorizontal: 6, backgroundColor: renk.birincil, alignItems: "center", justifyContent: "center" },
  kutu: { borderWidth: 1, borderColor: renk.birincilKenar, borderRadius: 12, paddingHorizontal: 12, paddingVertical: 9 },
});

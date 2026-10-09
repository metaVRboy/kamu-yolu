import type { ReactNode } from "react";
import { Linking, Pressable, RefreshControl, ScrollView, Share, StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import * as WebBrowser from "expo-web-browser";
import { router, useLocalSearchParams } from "expo-router";
import {
  ArrowUpRight,
  Building2,
  CalendarClock,
  CalendarPlus,
  CircleAlert,
  CircleCheck,
  CircleHelp,
  FileText,
  GraduationCap,
  Hourglass,
  MapPin,
  Share2,
  Tag,
  UserRoundCheck,
  type LucideIcon,
} from "lucide-react-native";
import { Buton, HataKutusu, Kart, T, Yukleniyor } from "@/bilesenler/ui";
import { IlanGorsel, IlanKarti } from "@/bilesenler/IlanKarti";
import { useVeri } from "@/lib/api";
import { kalanGunRozeti, tarihKisa, tarihUzun } from "@/lib/bicim";
import { useOturum } from "@/lib/oturum";
import { golge, renk } from "@/lib/tema";
import type { IlanDetayVeri, UygunlukDurumu, UygunlukVeri } from "@/lib/tipler";

/** Sitedeki /ilan/[id]/[slug] sayfasi. Resmi ilan butonu altta sabit (sitenin mobil gorunumu gibi). */
export default function IlanDetay() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { veri: i, hata, yenileniyor, yenile } = useVeri<IlanDetayVeri>(`/api/mobil/ilan/${id}`);
  const alt = useSafeAreaInsets().bottom;

  if (hata && !i) return <HataKutusu mesaj={hata} tekrar={yenile} />;
  if (!i) return <Yukleniyor />;
  const kalan = kalanGunRozeti(i.kalanGun);
  const resmiIlan = () => WebBrowser.openBrowserAsync(i.kaynakUrl);

  return (
    <View style={{ flex: 1 }}>
      <ScrollView contentContainerStyle={{ padding: 16, gap: 16, paddingBottom: 120 }} refreshControl={<RefreshControl refreshing={yenileniyor} onRefresh={yenile} tintColor={renk.birincil} />}>
        <Kart style={{ overflow: "hidden" }}>
          <IlanGorsel logoUrl={i.logoUrl} kurumTuru={i.kurumTuru} style={{ aspectRatio: undefined, height: 150 }} />
          <View style={{ padding: 20 }}>
            <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 6 }}>
              <Etiket metin={i.kurumTuruAdi} renk={renk.birincil} zemin={renk.birincilZemin} />
              {!!i.ilanTuru && <Etiket metin={i.ilanTuru} renk="#334155" zemin={renk.griZemin} />}
              {i.bolumSartiYok && <Etiket metin="Bölüm şartı yok" renk={renk.yesil} zemin={renk.yesilZemin} />}
              {!i.aktif && <Etiket metin="Artık aktif değil" renk="#475569" zemin="#e2e8f0" />}
            </View>
            <T w="kalin" style={{ marginTop: 12, fontSize: 24, lineHeight: 30, color: renk.baslik, letterSpacing: -0.5 }}>
              {i.kadro}
            </T>
            <View style={{ marginTop: 6, flexDirection: "row", alignItems: "center", gap: 6 }}>
              <Building2 size={16} color="rgba(36,102,195,0.7)" />
              <T w="orta" style={{ color: renk.yaziIkincil, flex: 1 }}>
                {i.kurum}
              </T>
            </View>
          </View>
        </Kart>

        <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 12 }}>
          <BilgiKutusu ikon={Hourglass} etiket="Kalan süre" vurgu={{ renk: kalan.renk, zemin: kalan.zemin }}>
            {kalan.metin}
          </BilgiKutusu>
          <BilgiKutusu ikon={CalendarClock} etiket="Son başvuru">
            {i.sonBasvuru ? tarihUzun(i.sonBasvuru) : "Belirtilmemiş"}
          </BilgiKutusu>
          <BilgiKutusu ikon={CalendarClock} etiket="Başvuru başlangıcı">
            {i.basvuruBaslangici ? tarihUzun(i.basvuruBaslangici) : "Belirtilmemiş"}
          </BilgiKutusu>
          <BilgiKutusu ikon={MapPin} etiket="Görev yeri">
            {i.konum ?? "Belirtilmemiş"}
          </BilgiKutusu>
          <BilgiKutusu ikon={GraduationCap} etiket="Öğrenim düzeyi">
            {i.duzeyler || "Belirtilmemiş"}
          </BilgiKutusu>
          <BilgiKutusu ikon={Tag} etiket="Kaynak">
            {i.kaynak}
          </BilgiKutusu>
        </View>

        {i.ilerleme !== null && !!i.basvuruBaslangici && !!i.sonBasvuru && (
          <Kart style={{ padding: 20 }}>
            <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
              <T w="yariKalin" style={s.kucukGri}>
                Başvuru başladı · {tarihKisa(i.basvuruBaslangici)}
              </T>
              <T w="yariKalin" style={s.kucukGri}>
                Son gün · {tarihKisa(i.sonBasvuru)}
              </T>
            </View>
            <View style={s.cubuk}>
              <View
                style={{
                  width: `${i.ilerleme}%`,
                  height: "100%",
                  borderRadius: 999,
                  backgroundColor: i.kalanGun !== null && i.kalanGun <= 3 ? "#ef4444" : i.kalanGun !== null && i.kalanGun <= 7 ? "#f59e0b" : renk.birincil,
                }}
              />
            </View>
            <T style={{ marginTop: 8, fontSize: 12, color: renk.soluk }}>
              {i.ilerleme >= 100 ? "Başvuru süresi sona erdi." : `Başvuru süresinin %${i.ilerleme}'i geride kaldı.`}
            </T>
          </Kart>
        )}

        <Uygunluk ilanId={i.id} />

        {i.maddeler.length > 0 && (
          <Bolum baslik="Aranan nitelikler" ikon={FileText}>
            <View style={{ gap: 10 }}>
              {i.maddeler.map((m, n) =>
                m.madde ? (
                  <View key={n} style={{ flexDirection: "row", gap: 10 }}>
                    <CircleCheck size={16} color={renk.birincil} style={{ marginTop: 2 }} />
                    <T style={{ flex: 1, lineHeight: 21, color: "#334155" }}>{m.metin}</T>
                  </View>
                ) : (
                  <T key={n} style={{ lineHeight: 21, color: "#334155" }}>
                    {m.metin}
                  </T>
                ),
              )}
            </View>
          </Bolum>
        )}

        {i.bolumler.length > 0 && (
          <Bolum baslik="Uygun bölümler" ikon={GraduationCap}>
            <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
              {i.bolumler.map((b) => (
                <Pressable key={b.slug} onPress={() => router.push({ pathname: "/liste", params: { kapsam: "bolum", deger: b.slug } })} style={s.bolumCipi}>
                  <T w="orta" style={{ color: renk.birincil }}>
                    {b.ad}
                  </T>
                </Pressable>
              ))}
            </View>
          </Bolum>
        )}

        <View style={{ gap: 12 }}>
          {!!i.takvimUrl && <Buton tur="cerceve" ikon={CalendarPlus} etiket="Son başvuru gününü takvime ekle" onPress={() => Linking.openURL(i.takvimUrl!)} />}
          <Buton tur="cerceve" ikon={Share2} etiket="Paylaş" onPress={() => Share.share({ message: `${i.kadro} — ${i.kurum}\n${i.paylasimUrl}` })} />
        </View>

        {i.benzerler.length > 0 && (
          <View style={{ marginTop: 16, gap: 16 }}>
            <View>
              <T w="kalin" style={{ fontSize: 20, letterSpacing: -0.3 }}>
                Benzer ilanlar
              </T>
              <T style={{ marginTop: 4, color: renk.soluk }}>Aynı bölüme ya da aynı kuruma ait diğer aktif ilanlar.</T>
            </View>
            {i.benzerler.map((b) => (
              <IlanKarti key={b.id} ilan={b} nitelikOzeti />
            ))}
          </View>
        )}
      </ScrollView>

      <View style={[s.altCubuk, { paddingBottom: alt + 12 }]}>
        <View style={{ flex: 1 }}>
          <T numberOfLines={1} style={{ fontSize: 12, color: renk.soluk }}>
            {i.sonBasvuru ? `Son başvuru ${tarihUzun(i.sonBasvuru)}` : "Son başvuru belirtilmemiş"}
          </T>
          <T w="kalin" style={{ color: kalan.renk }}>
            {kalan.metin}
          </T>
        </View>
        <Buton etiket="Resmi İlana Git" ikon={ArrowUpRight} onPress={resmiIlan} style={{ paddingHorizontal: 18 }} />
      </View>
    </View>
  );
}

function Etiket({ metin, renk: r, zemin }: { metin: string; renk: string; zemin: string }) {
  return (
    <View style={{ backgroundColor: zemin, borderRadius: 999, paddingHorizontal: 10, paddingVertical: 4 }}>
      <T w="yariKalin" style={{ fontSize: 12, color: r }}>
        {metin}
      </T>
    </View>
  );
}

function BilgiKutusu({ ikon: Ikon, etiket, children, vurgu }: { ikon: LucideIcon; etiket: string; children: ReactNode; vurgu?: { renk: string; zemin: string } }) {
  return (
    <View style={s.bilgiKutusu}>
      <View style={[s.bilgiIkon, { backgroundColor: vurgu?.zemin ?? renk.birincilZemin }]}>
        <Ikon size={20} color={vurgu?.renk ?? renk.birincil} />
      </View>
      <View style={{ flex: 1 }}>
        <T w="orta" style={{ fontSize: 12, color: renk.soluk }}>
          {etiket}
        </T>
        <T w="yariKalin" style={{ marginTop: 2, fontSize: 14, color: vurgu?.renk ?? "#1e293b" }}>
          {children}
        </T>
      </View>
    </View>
  );
}

function Bolum({ baslik, ikon: Ikon, children }: { baslik: string; ikon: LucideIcon; children: ReactNode }) {
  return (
    <Kart style={{ padding: 20 }}>
      <View style={{ flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 16 }}>
        <Ikon size={20} color={renk.birincil} />
        <T w="kalin" style={{ fontSize: 16 }}>
          {baslik}
        </T>
      </View>
      {children}
    </Kart>
  );
}

const UYGUNLUK: Record<UygunlukDurumu, { ikon: LucideIcon; renk: string }> = {
  uygun: { ikon: CircleCheck, renk: "#059669" },
  "sart-yok": { ikon: CircleCheck, renk: "#059669" },
  "uygun-degil": { ikon: CircleAlert, renk: "#d97706" },
  bilinmiyor: { ikon: CircleHelp, renk: "#94a3b8" },
};

function Satir({ durum, children }: { durum: UygunlukDurumu; children: ReactNode }) {
  const { ikon: Ikon, renk: r } = UYGUNLUK[durum];
  return (
    <View style={{ flexDirection: "row", gap: 10 }}>
      <Ikon size={16} color={r} style={{ marginTop: 2 }} />
      <T style={{ flex: 1, color: "#334155", lineHeight: 20 }}>{children}</T>
    </View>
  );
}

/** Sitedeki IlanUygunluk: profildeki bolum ve duzey ilanla karsilastirilir (mevcut /api/ilan/[id]/uygunluk). */
function Uygunluk({ ilanId }: { ilanId: string }) {
  const { kullanici } = useOturum();
  // Oturum degisince (giris/cikis) yeniden sorulsun.
  const { veri: c } = useVeri<UygunlukVeri>(kullanici === undefined ? null : `/api/ilan/${ilanId}/uygunluk?u=${kullanici?.id ?? ""}`);
  if (!c) return null;
  return (
    <View style={s.uygunluk}>
      <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
        <UserRoundCheck size={16} color={renk.birincil} />
        <T w="yariKalin">Bu ilan sana uygun mu?</T>
      </View>
      {!c.giris ? (
        <T style={{ marginTop: 8, color: renk.yaziIkincil, lineHeight: 20 }}>
          <T w="yariKalin" style={{ color: renk.birincil }} onPress={() => router.push("/giris")}>
            Giriş yap
          </T>
          , profilindeki bölüm ve öğrenim düzeyine göre bu ilana uygunluğunu gösterelim.
        </T>
      ) : (
        <View style={{ marginTop: 12, gap: 8 }}>
          <Satir durum={c.bolum.durum}>
            {c.bolum.durum === "sart-yok" && "Bu ilanda bölüm şartı yok."}
            {c.bolum.durum === "uygun" && (
              <>
                Bölümün (<T w="kalin">{c.bolum.profilBolumu}</T>) bu ilan için uygun.
              </>
            )}
            {c.bolum.durum === "uygun-degil" && "Profilindeki bölüm, bu ilanın aradığı bölümler arasında görünmüyor."}
            {c.bolum.durum === "bilinmiyor" && "Profilinde bölüm seçili değil."}
          </Satir>
          <Satir durum={c.duzey.durum}>
            {c.duzey.durum === "sart-yok" && "İlanda öğrenim düzeyi belirtilmemiş."}
            {c.duzey.durum === "uygun" && (
              <>
                Öğrenim düzeyin (<T w="kalin">{c.duzey.profilDuzeyi}</T>) ilanın istediği düzeyle uyuşuyor.
              </>
            )}
            {c.duzey.durum === "uygun-degil" && (
              <>
                İlan <T w="kalin">{c.duzey.istenen.join(", ")}</T> mezunu arıyor; profilinde <T w="kalin">{c.duzey.profilDuzeyi}</T> yazıyor.
              </>
            )}
            {c.duzey.durum === "bilinmiyor" && "Profilinde öğrenim düzeyi seçili değil."}
          </Satir>
          {(c.bolum.durum === "bilinmiyor" || c.duzey.durum === "bilinmiyor") && (
            <T w="yariKalin" style={{ color: renk.birincil }} onPress={() => router.push("/profil-duzenle")}>
              Profilini tamamla →
            </T>
          )}
          <T style={{ fontSize: 12, color: renk.soluk }}>Bu bir ön değerlendirmedir; başvurmadan önce resmi ilandaki şartları mutlaka oku.</T>
        </View>
      )}
    </View>
  );
}

const s = StyleSheet.create({
  kucukGri: { fontSize: 12, color: renk.yaziIkincil },
  cubuk: { marginTop: 12, height: 10, borderRadius: 999, backgroundColor: renk.griZemin, overflow: "hidden" },
  bilgiKutusu: { width: "47.8%", flexDirection: "row", gap: 10, backgroundColor: "#fff", borderRadius: 16, borderWidth: 1, borderColor: renk.birincilKenar, padding: 14, ...golge },
  bilgiIkon: { width: 40, height: 40, borderRadius: 12, alignItems: "center", justifyContent: "center" },
  bolumCipi: { borderRadius: 999, borderWidth: 1, borderColor: "rgba(36,102,195,0.2)", backgroundColor: renk.birincilZemin, paddingHorizontal: 12, paddingVertical: 7 },
  uygunluk: { borderRadius: 16, borderWidth: 1, borderColor: "rgba(36,102,195,0.15)", backgroundColor: "#f7f9fd", padding: 20 },
  altCubuk: { position: "absolute", left: 0, right: 0, bottom: 0, flexDirection: "row", alignItems: "center", gap: 12, backgroundColor: "rgba(255,255,255,0.97)", borderTopWidth: 1, borderTopColor: renk.birincilKenar, paddingHorizontal: 16, paddingTop: 12 },
});

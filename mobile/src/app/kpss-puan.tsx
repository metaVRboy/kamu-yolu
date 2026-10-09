import { useState, type ReactNode } from "react";
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, TextInput, View } from "react-native";
import { Info } from "lucide-react-native";
import { Buton, Cip, Kart, SayfaBasligi, T } from "@/bilesenler/ui";
import {
  DHBT_DUZEY_SECENEKLERI,
  OABT_ALAN_SECENEKLERI,
  PUAN_TURLERI,
  SINAV_YILLARI,
  computeLisansSonuc,
  computeOnlisansSonuc,
  computeOrtaogretimSonuc,
  hasVerifiedLisansStats,
  netOf,
  type PuanTuruId,
} from "@/lib/kpssPuan";
import { renk, yazi } from "@/lib/tema";

type Degerler = Record<string, { correct: string; wrong: string }>;

/** Sitedeki /kpss-puan-hesaplama (KpssCalculator): ayni hesap, ayni aciklamalar. */
export default function KpssPuan() {
  const [turId, setTurId] = useState<PuanTuruId>("LISANS");
  const [degerler, setDegerler] = useState<Degerler>({});
  const [yds, setYds] = useState("");
  const [yil, setYil] = useState(SINAV_YILLARI[0]);
  const [oabtAlan, setOabtAlan] = useState(OABT_ALAN_SECENEKLERI[0]);
  const [dhbt, setDhbt] = useState(DHBT_DUZEY_SECENEKLERI[0].value);
  const [sonucGoster, setSonucGoster] = useState(false);
  const tur = PUAN_TURLERI.find((p) => p.id === turId)!;

  function turSec(id: PuanTuruId) {
    setTurId(id);
    setDegerler({});
    setYds("");
    setSonucGoster(false);
  }

  function alanGuncelle(key: string, toplam: number, yama: Partial<{ correct: string; wrong: string }>) {
    setDegerler((onceki) => {
      const mevcut = { correct: onceki[key]?.correct ?? "", wrong: onceki[key]?.wrong ?? "" };
      const birlesik = { ...mevcut, ...yama };
      const sinirla = (ham: string) => {
        if (ham.trim() === "") return "";
        const n = Number(ham);
        if (Number.isNaN(n)) return "";
        return String(Math.min(Math.max(Math.round(n), 0), toplam));
      };
      let correct = sinirla(birlesik.correct);
      let wrong = sinirla(birlesik.wrong);
      // Dogru + yanlis toplami soru sayisini asamaz.
      if ((Number(correct) || 0) + (Number(wrong) || 0) > toplam) {
        if (yama.correct !== undefined) wrong = String(Math.max(toplam - (Number(correct) || 0), 0));
        else correct = String(Math.max(toplam - (Number(wrong) || 0), 0));
      }
      return { ...onceki, [key]: { correct, wrong } };
    });
  }

  const sonuclar = tur.fields.map((f) => {
    const v = degerler[f.key] ?? { correct: "", wrong: "" };
    return { ...f, net: netOf(v.correct, v.wrong) };
  });
  const gyGkNet = sonuclar.filter((r) => r.key === "gy" || r.key === "gk").reduce((t, r) => t + r.net, 0);
  const alanSonuclari = sonuclar.filter((r) => r.key !== "gy" && r.key !== "gk" && r.net > 0);
  const lisansSonuc = turId === "LISANS" && hasVerifiedLisansStats(yil) ? computeLisansSonuc(yil, degerler, tur.fields) : null;
  const genelTek = turId === "ONLISANS" ? computeOnlisansSonuc(degerler) : turId === "ORTAOGRETIM" ? computeOrtaogretimSonuc(degerler) : null;
  const genelIkiTest = turId === "ONLISANS" || turId === "ORTAOGRETIM" || (turId === "LISANS" && lisansSonuc?.kind !== "tek-alan" && lisansSonuc?.kind !== "coklu-alan");
  const genelYil = turId === "LISANS" ? yil : "2024 KPSS";
  const barajlar = lisansSonuc?.barajlar ?? genelTek?.barajlar ?? null;
  const gyNet = sonuclar.find((r) => r.key === "gy")?.net ?? 0;
  const gkNet = sonuclar.find((r) => r.key === "gk")?.net ?? 0;
  const gySoru = tur.fields.find((f) => f.key === "gy")?.totalQuestions ?? 60;
  const gkSoru = tur.fields.find((f) => f.key === "gk")?.totalQuestions ?? 60;
  const yuzde = (n: number, t: number) => ((n / t) * 100).toFixed(2);

  return (
    <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} style={{ flex: 1 }}>
      <ScrollView contentContainerStyle={{ padding: 16, gap: 16, paddingBottom: 40 }} keyboardShouldPersistTaps="handled">
        <SayfaBasligi
          baslik="KPSS Puan Hesaplama Aracı"
          aciklama="* Doldurulması zorunlu alanlar. Yanlış sayılarını boş bırakıp, doğru sayısı kutucuklarına netleri yazarak da hesaplama yapabilirsiniz."
          cipler={
            <>
              <Cip etiket="5 sınav türü" />
              <Cip etiket="4 yanlış 1 doğruyu götürür" />
              <Cip etiket="Ücretsiz" />
            </>
          }
        />

        <Kart style={{ padding: 18, gap: 16 }}>
          <View>
            <Etiket zorunlu>Puan Türü</Etiket>
            <View style={{ gap: 6 }}>
              {PUAN_TURLERI.map((p) => (
                <Pressable key={p.id} onPress={() => turSec(p.id)} style={[s.secenek, turId === p.id && { borderColor: "rgba(36,102,195,0.4)", backgroundColor: "rgba(36,102,195,0.1)" }]}>
                  <Radyo secili={turId === p.id} />
                  <T w="orta">{p.label}</T>
                  <T style={{ fontSize: 12, color: renk.soluk }}>{p.subtitle}</T>
                </Pressable>
              ))}
            </View>
          </View>

          {tur.hasAlanSelect && (
            <View>
              <Etiket>ÖABT Alan</Etiket>
              <Secimler secenekler={OABT_ALAN_SECENEKLERI.map((a) => ({ deger: a, ad: a }))} secili={oabtAlan} sec={setOabtAlan} />
            </View>
          )}
          {tur.hasLevelSelect && (
            <View>
              <Etiket zorunlu>KPSS Düzey</Etiket>
              <Secimler secenekler={DHBT_DUZEY_SECENEKLERI.map((d) => ({ deger: d.value, ad: d.label }))} secili={dhbt} sec={setDhbt} />
            </View>
          )}
          {tur.hasYearSelect && (
            <View>
              <Etiket>Sınav Yılı</Etiket>
              <Secimler secenekler={SINAV_YILLARI.map((y) => ({ deger: y, ad: y }))} secili={yil} sec={setYil} />
            </View>
          )}

          <View>
            <View style={[s.satir, { paddingVertical: 0 }]}>
              <View style={{ flex: 1 }} />
              <T w="orta" style={[s.baslikHucre]}>
                Doğru
              </T>
              <T w="orta" style={[s.baslikHucre]}>
                Yanlış
              </T>
            </View>
            {tur.fields.map((f, i) => (
              <View key={f.key} style={[s.satir, i > 0 && { borderTopWidth: 1, borderTopColor: "rgba(36,102,195,0.1)" }]}>
                <T style={{ flex: 1, color: "#1e293b" }}>
                  {f.required && <T style={{ color: renk.hata }}>* </T>}
                  {f.label}
                  <T style={{ fontSize: 12, color: renk.soluk }}> {f.totalQuestions} Soru</T>
                </T>
                <TextInput
                  value={degerler[f.key]?.correct ?? ""}
                  onChangeText={(t) => alanGuncelle(f.key, f.totalQuestions, { correct: t })}
                  keyboardType="number-pad"
                  maxLength={3}
                  style={s.girdi}
                />
                <TextInput
                  value={degerler[f.key]?.wrong ?? ""}
                  onChangeText={(t) => alanGuncelle(f.key, f.totalQuestions, { wrong: t })}
                  keyboardType="number-pad"
                  maxLength={3}
                  style={s.girdi}
                />
              </View>
            ))}
          </View>

          {tur.singleScoreField && (
            <View>
              <Etiket>{tur.singleScoreField.label}</Etiket>
              <TextInput value={yds} onChangeText={setYds} keyboardType="number-pad" maxLength={3} style={[s.girdi, { width: 120, textAlign: "left", paddingHorizontal: 12 }]} />
              <T style={{ marginTop: 4, fontSize: 12, color: renk.soluk }}>{tur.singleScoreField.hint}</T>
            </View>
          )}

          <View style={{ flexDirection: "row", gap: 10 }}>
            <Buton etiket="Hesapla" onPress={() => setSonucGoster(true)} style={{ flex: 1 }} />
            <Buton
              etiket="Temizle"
              tur="cerceve"
              onPress={() => {
                setDegerler({});
                setYds("");
                setSonucGoster(false);
              }}
            />
          </View>
        </Kart>

        {sonucGoster && (
          <View style={s.sonuc}>
            <View style={{ alignSelf: "flex-start", backgroundColor: "#f1f5f9", borderRadius: 999, paddingHorizontal: 14, paddingVertical: 5 }}>
              <T w="yariKalin">Hesaplama Sonuçları</T>
            </View>

            {genelIkiTest && (
              <View style={s.beyaz}>
                <Satir ad="Genel Yetenek">
                  {gyNet.toFixed(2)} net (%{yuzde(gyNet, gySoru)})
                </Satir>
                <Satir ad="Genel Kültür">
                  {gkNet.toFixed(2)} net (%{yuzde(gkNet, gkSoru)})
                </Satir>
                <Satir ad="KPSS Toplam">
                  {(gyNet + gkNet).toFixed(2)} net / {gySoru + gkSoru} soru (%{yuzde(gyNet + gkNet, gySoru + gkSoru)})
                </Satir>
                <Satir ad="Sınav Yılı">{genelYil.replace(" KPSS", "")}</Satir>
                {lisansSonuc?.kind === "genel" &&
                  lisansSonuc.puanlar.map((p) => (
                    <Satir key={p.kod} ad={p.kod}>
                      {p.puan.toFixed(2)}
                    </Satir>
                  ))}
                {turId === "ONLISANS" && genelTek?.kind === "genel" && <Satir ad="KPSSP93">{genelTek.puan.toFixed(2)}</Satir>}
                {turId === "ORTAOGRETIM" && genelTek?.kind === "genel" && <Satir ad="KPSSP94">{genelTek.puan.toFixed(2)}</Satir>}
              </View>
            )}

            {turId === "LISANS" && lisansSonuc?.kind === "tek-alan" && (
              <View style={[s.beyaz, { alignItems: "center" }]}>
                <T style={{ fontSize: 12, color: renk.soluk, textAlign: "center" }}>Ağırlıklı Standart Puanınız (ASP) — {lisansSonuc.alanLabel}</T>
                <T w="kalin" style={{ fontSize: 30, color: renk.birincil }}>
                  {lisansSonuc.asp.toFixed(3)}
                </T>
              </View>
            )}
            {turId === "LISANS" && lisansSonuc?.kind === "coklu-alan" && (
              <View style={{ gap: 10 }}>
                {lisansSonuc.testler.map((t) => (
                  <View key={t.label} style={[s.beyaz, { alignItems: "center" }]}>
                    <T style={{ fontSize: 12, color: renk.soluk }}>{t.label} Standart Puan</T>
                    <T w="kalin" style={{ fontSize: 24, color: renk.birincil }}>
                      {t.sp.toFixed(2)}
                    </T>
                  </View>
                ))}
              </View>
            )}
            {barajlar?.some((b) => !b.gecti) && (
              <View style={s.beyaz}>
                <T style={{ textAlign: "center", color: "#1e293b" }}>Girdiğiniz netlere göre en az bir zorunlu testte baraj (1 net) sağlanamadığı için puan hesaplanamıyor.</T>
              </View>
            )}
            {!genelIkiTest && !lisansSonuc && !genelTek && (
              <View style={{ gap: 10 }}>
                <View style={[s.beyaz, { alignItems: "center" }]}>
                  <T style={{ fontSize: 12, color: renk.soluk }}>Genel Yetenek + Genel Kültür Net</T>
                  <T w="kalin" style={{ fontSize: 24, color: renk.birincil }}>
                    {gyGkNet.toFixed(2)}
                  </T>
                </View>
                {alanSonuclari.map((r) => (
                  <View key={r.key} style={[s.beyaz, { alignItems: "center" }]}>
                    <T style={{ fontSize: 12, color: renk.soluk }}>{r.label} Net</T>
                    <T w="kalin" style={{ fontSize: 24, color: renk.birincil }}>
                      {r.net.toFixed(2)}
                    </T>
                  </View>
                ))}
              </View>
            )}

            <View style={{ gap: 8, borderTopWidth: 1, borderTopColor: "rgba(36,102,195,0.15)", paddingTop: 12 }}>
              {turId === "LISANS" && lisansSonuc?.kind === "genel" && (
                <Not>
                  KPSSP1/P2/P3, ÖSYM&apos;nin {yil} Lisans sınavı için açıkladığı resmi test ortalaması/standart sapması ve resmi puan türü ağırlıkları (Tablo-2) kullanılarak hesaplanmıştır. ÖSYM&apos;nin nihai puana çevirirken kullandığı ASP dağılımının ortalama/standart sapma/en yüksek değerleri resmi olarak yayımlanmadığından, bu adım halka açık bir referans hesap makinesiyle (kpss-puan.hesaplama.net) eşleştirilerek kalibre edildi; birden fazla bağımsız test noktasında fark 0,01 puanın altında ölçüldü.
                </Not>
              )}
              {(turId === "ONLISANS" || turId === "ORTAOGRETIM") && genelTek?.kind === "genel" && (
                <Not>
                  Bu puan, yukarıdaki Lisans hesaplamasıyla aynı yöntemle, ancak şu an yalnızca <T w="kalin" style={{ fontSize: 12 }}>2024 KPSS</T> için kalibre edildi. {turId === "ONLISANS" ? "Önlisans" : "Ortaöğretim"} KPSS sınavı yalnızca çift yıllarda yapıldığından diğer yıllar için henüz hesaplama sunamıyoruz.
                </Not>
              )}
              {turId === "LISANS" && (lisansSonuc?.kind === "tek-alan" || lisansSonuc?.kind === "coklu-alan") && (
                <Not>
                  Alan Bilgisi testi girdiğiniz için gösterilen değer, resmi test istatistikleri ve ağırlıklarıyla hesaplanmış <T w="kalin" style={{ fontSize: 12 }}>Ağırlıklı Standart Puan (ASP)</T>&apos;dir; alan kombinasyonlarında hangi resmi puan kodunun uygulanacağını güvenilir şekilde eşleştiremediğimiz için bunu nihai &quot;100 üzerinden&quot; puana çeviremiyoruz.
                </Not>
              )}
              {!genelIkiTest && !lisansSonuc && !genelTek && (
                <Not renk="#92400e">
                  Şu an yalnızca <T w="kalin" style={{ fontSize: 12, color: "#92400e" }}>net</T> gösterilebiliyor. Bu puan türü için resmi istatistikleri henüz doğrulayamadık; doğrulanmamış sayılarla puan hesaplamak yanıltıcı olur, bu yüzden eklemedik.
                </Not>
              )}
              <Not renk="#475569">
                <T w="kalin" style={{ fontSize: 12, color: "#475569" }}>
                  Önemli Bilgi:
                </T>{" "}
                Bir KPSS puanının hesaplanabilmesi için, o puanın hesaplanmasında yer alan testlerin her birinden en az 1 nete sahip olunması gerekmektedir; aksi takdirde ilgili KPSS puanı ÖSYM tarafından hesaplanmamaktadır (2026 KPSS Lisans Başvuru Kılavuzu, Bölüm 3.10 Değerlendirme).
                {barajlar?.some((b) => !b.gecti)
                  ? ` Girdiğiniz netlere göre ${barajlar
                      .filter((b) => !b.gecti)
                      .map((b) => b.label)
                      .join(", ")} testinde/testlerinde bu baraj sağlanamıyor.`
                  : ""}
              </Not>
            </View>
          </View>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

function Etiket({ children, zorunlu = false }: { children: ReactNode; zorunlu?: boolean }) {
  return (
    <T w="yariKalin" style={{ marginBottom: 8 }}>
      {zorunlu && <T style={{ color: renk.hata }}>* </T>}
      {children}
    </T>
  );
}

function Radyo({ secili }: { secili: boolean }) {
  return (
    <View style={{ width: 18, height: 18, borderRadius: 9, borderWidth: 2, borderColor: secili ? renk.birincil : "#94a3b8", alignItems: "center", justifyContent: "center" }}>
      {secili && <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: renk.birincil }} />}
    </View>
  );
}

function Secimler({ secenekler, secili, sec }: { secenekler: { deger: string; ad: string }[]; secili: string; sec: (d: string) => void }) {
  return (
    <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
      {secenekler.map((x) => (
        <Pressable key={x.deger} onPress={() => sec(x.deger)} style={[s.cip, secili === x.deger && { backgroundColor: renk.birincil, borderColor: renk.birincil }]}>
          <T w="orta" style={{ fontSize: 13, color: secili === x.deger ? "#fff" : renk.yazi }}>
            {x.ad}
          </T>
        </Pressable>
      ))}
    </View>
  );
}

function Satir({ ad, children }: { ad: string; children: ReactNode }) {
  return (
    <T style={{ color: "#1e293b", lineHeight: 22 }}>
      <T w="kalin">{ad}:</T> {children}
    </T>
  );
}

function Not({ children, renk: r = "#334155" }: { children: ReactNode; renk?: string }) {
  return (
    <View style={{ flexDirection: "row", gap: 8 }}>
      <Info size={14} color={r === "#334155" ? renk.birincil : r} style={{ marginTop: 2 }} />
      <T style={{ flex: 1, fontSize: 12, lineHeight: 18, color: r }}>{children}</T>
    </View>
  );
}

const s = StyleSheet.create({
  secenek: { flexDirection: "row", alignItems: "center", gap: 10, borderWidth: 1, borderColor: "transparent", borderRadius: 12, paddingHorizontal: 12, paddingVertical: 10 },
  satir: { flexDirection: "row", alignItems: "center", gap: 10, paddingVertical: 10 },
  baslikHucre: { width: 60, textAlign: "center", fontSize: 12, color: renk.soluk },
  girdi: { width: 60, height: 40, borderWidth: 1, borderColor: "rgba(36,102,195,0.2)", borderRadius: 10, textAlign: "center", fontFamily: yazi.orta, fontSize: 15, color: renk.yazi, backgroundColor: "#fff" },
  cip: { borderWidth: 1, borderColor: "rgba(36,102,195,0.2)", borderRadius: 999, paddingHorizontal: 12, paddingVertical: 7 },
  sonuc: { gap: 14, borderWidth: 1, borderColor: "rgba(36,102,195,0.2)", backgroundColor: "rgba(36,102,195,0.05)", borderRadius: 16, padding: 18 },
  beyaz: { backgroundColor: "#fff", borderRadius: 12, padding: 14, gap: 4 },
});

import { useRef, useState, type ReactNode } from "react";
import { Pressable, ScrollView, StyleSheet, View } from "react-native";
import Svg, { Circle } from "react-native-svg";
import { router } from "expo-router";
import {
  ArrowDownRight,
  ArrowUpRight,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  CircleAlert,
  LayoutGrid,
  ListChecks,
  MinusCircle,
  OctagonAlert,
  Target,
  TrendingUp,
  X,
  XCircle,
  type LucideIcon,
} from "lucide-react-native";
import { Kart, T } from "@/bilesenler/ui";
import { KesirliMetin } from "@/bilesenler/KesirliMetin";
import { KilitliOzellik } from "@/bilesenler/KilitliOzellik";
import { SoruGovdesi, SoruHaritasi } from "@/bilesenler/SoruParcalari";
import { SoruHataBildir } from "@/bilesenler/SoruHataBildir";
import { DERS_LABEL, DUZEY_LABEL, DUZEY_TEMA, dersKarnesi, konuAnalizi, sayiFmt, type DenemeDuzeyi, type Ders, type KonuDurumu, type KonuSonucu, type Plan, type SonucSorusu } from "@/lib/kpss";
import { renk } from "@/lib/tema";

export type OncekiOzet = { tarihMetni: string; net: number; puan: number; dersNetleri: Partial<Record<string, number>>; konuDurumlari: Record<string, KonuDurumu> };

const DURUM_RENGI = { dogru: { zemin: "#10b981", yazi: "#fff" }, yanlis: { zemin: "#ef4444", yazi: "#fff" }, bos: { zemin: "#e2e8f0", yazi: "#475569" } };

const KONU_STIL: Record<KonuDurumu, { baslik: string; ikon: LucideIcon; kenar: string; zemin: string; ikonRenk: string; rozetZemin: string; rozetYazi: string; mesaj: (k: string) => string }> = {
  kirmizi: { baslik: "Gözden geçir", ikon: OctagonAlert, kenar: "#fecaca", zemin: "rgba(254,242,242,0.6)", ikonRenk: "#dc2626", rozetZemin: "#fee2e2", rozetYazi: "#b91c1c", mesaj: (k) => `${k} konusunu gözden geçirmelisin.` },
  sari: { baslik: "Dikkat", ikon: CircleAlert, kenar: "#fde68a", zemin: "rgba(255,251,235,0.6)", ikonRenk: "#d97706", rozetZemin: "#fef3c7", rozetYazi: "#92400e", mesaj: (k) => `${k} konusunda biraz daha dikkatli olmalısın.` },
  yesil: { baslik: "Güçlü", ikon: CheckCircle2, kenar: "#a7f3d0", zemin: "rgba(236,253,245,0.6)", ikonRenk: "#059669", rozetZemin: "#d1fae5", rozetYazi: "#047857", mesaj: (k) => `${k} konusunda eksiğin görünmüyor, böyle devam.` },
};
const DURUM_ADI: Record<KonuDurumu, string> = { kirmizi: "kırmızı", sari: "sarı", yesil: "yeşil" };
const DURUM_SIRASI: Record<KonuDurumu, number> = { kirmizi: 0, sari: 1, yesil: 2 };

type Gelisim = { tarihMetni: string; netFark: number; puanFark: number; dersFarklari: { ders: string; fark: number }[]; degisimler: { ders: string; konu: string; eski: KonuDurumu; yeni: KonuDurumu }[] };

// Kilitli onizlemeler icin ornek veri (gercek kullanici verisi degil) - sitedekiyle ayni.
const ORNEK_GELISIM: Gelisim = {
  tarihMetni: "1 Ekim",
  netFark: 6.25,
  puanFark: 5.2,
  dersFarklari: [
    { ders: "TURKCE", fark: 2.5 },
    { ders: "MATEMATIK", fark: 3.75 },
    { ders: "TARIH", fark: -0.5 },
  ],
  degisimler: [
    { ders: "MATEMATIK", konu: "Sayısal Mantık", eski: "kirmizi", yeni: "sari" },
    { ders: "TURKCE", konu: "Paragraf", eski: "sari", yeni: "yesil" },
    { ders: "TARIH", konu: "Osmanlı Siyasi Tarihi", eski: "yesil", yeni: "sari" },
  ],
};
const ORNEK_KONULAR = (() => {
  const ornek: [Ders, string, number, number, number][] = [
    ["TURKCE", "Sözel Mantık", 1, 3, 0],
    ["MATEMATIK", "Sayısal Mantık", 1, 2, 1],
    ["TURKCE", "Paragraf", 10, 3, 1],
    ["TARIH", "Osmanlı Siyasi Tarihi", 3, 1, 2],
    ["COGRAFYA", "İklim ve Bitki Örtüsü", 2, 0, 1],
    ["MATEMATIK", "Problemler", 4, 0, 0],
    ["VATANDASLIK", "Yürütme", 2, 0, 0],
    ["TARIH", "İnkılap Tarihi", 3, 0, 0],
  ];
  const sorular: { id: string; ders: Ders; konu: string; dogruCevap: number }[] = [];
  const cevaplar: Record<string, number> = {};
  for (const [ders, konu, d, y, b] of ornek) {
    for (let i = 0; i < d + y + b; i++) {
      const id = `ornek-${sorular.length}`;
      sorular.push({ id, ders, konu, dogruCevap: 0 });
      if (i < d) cevaplar[id] = 0;
      else if (i < d + y) cevaplar[id] = 1;
    }
  }
  return konuAnalizi(sorular, cevaplar);
})();

function Fark({ deger, birim = "net" }: { deger: number; birim?: string }) {
  if (Math.abs(deger) < 0.005) return <T w="yariKalin" style={{ fontSize: 12, color: "#64748b" }}>değişmedi</T>;
  const artti = deger > 0;
  const Ikon = artti ? ArrowUpRight : ArrowDownRight;
  const r = artti ? "#059669" : "#dc2626";
  return (
    <View style={{ flexDirection: "row", alignItems: "center", gap: 2 }}>
      <Ikon size={14} color={r} />
      <T w="kalin" style={{ fontSize: 12, color: r }}>
        {artti ? "+" : ""}
        {sayiFmt(deger)} {birim}
      </T>
    </View>
  );
}

function Serit({ dogru, yanlis, bos, kalin = false }: { dogru: number; yanlis: number; bos: number; kalin?: boolean }) {
  return (
    <View style={{ flexDirection: "row", height: kalin ? 12 : 8, gap: 2, borderRadius: 999, overflow: "hidden", backgroundColor: "#f1f5f9" }}>
      {dogru > 0 && <View style={{ flex: dogru, backgroundColor: "#10b981" }} />}
      {yanlis > 0 && <View style={{ flex: yanlis, backgroundColor: "#ef4444" }} />}
      {bos > 0 && <View style={{ flex: bos, backgroundColor: "#cbd5e1" }} />}
    </View>
  );
}

function PuanHalkasi({ puan, renk: r }: { puan: number; renk: string }) {
  const yaricap = 52;
  const cevre = 2 * Math.PI * yaricap;
  return (
    <View style={{ width: 144, height: 144 }}>
      <Svg viewBox="0 0 128 128" width={144} height={144} style={{ transform: [{ rotate: "-90deg" }] }}>
        <Circle cx={64} cy={64} r={yaricap} fill="none" stroke={r} strokeOpacity={0.15} strokeWidth={11} />
        <Circle
          cx={64}
          cy={64}
          r={yaricap}
          fill="none"
          stroke={r}
          strokeWidth={11}
          strokeLinecap="round"
          strokeDasharray={`${cevre}`}
          strokeDashoffset={cevre * (1 - Math.min(100, Math.max(0, puan)) / 100)}
        />
      </Svg>
      <View style={[StyleSheet.absoluteFill, { alignItems: "center", justifyContent: "center" }]}>
        <T w="kalin" style={{ fontSize: 28 }}>
          {sayiFmt(puan)}
        </T>
        <T w="orta" style={{ fontSize: 12, color: renk.soluk }}>
          puan / 100
        </T>
      </View>
    </View>
  );
}

function Baslik({ ikon: Ikon, children }: { ikon?: LucideIcon; children: ReactNode }) {
  return (
    <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
      {Ikon && <Ikon size={20} color={renk.birincil} />}
      <T w="kalin" style={{ fontSize: 16 }}>
        {children}
      </T>
    </View>
  );
}

function GelisimBolumu({ g }: { g: Gelisim | null }) {
  return (
    <Kart style={{ padding: 20 }}>
      <Baslik ikon={TrendingUp}>Konu gelişim takibi</Baslik>
      {!g ? (
        <T style={{ marginTop: 8, color: renk.soluk }}>Bu düzeydeki ilk denemen; bir sonraki denemenden itibaren gelişimin burada görünecek.</T>
      ) : (
        <>
          <View style={{ marginTop: 6, flexDirection: "row", flexWrap: "wrap", alignItems: "center", gap: 6 }}>
            <T style={{ color: renk.yaziIkincil }}>Geçen denemene göre ({g.tarihMetni}):</T>
            <Fark deger={g.netFark} />
            <T style={{ color: renk.soluk }}>·</T>
            <Fark deger={g.puanFark} birim="puan" />
          </View>
          <View style={{ marginTop: 14, gap: 8 }}>
            {g.dersFarklari.map((d) => (
              <View key={d.ders} style={s.farkSatir}>
                <T w="orta">{DERS_LABEL[d.ders as Ders]}</T>
                <Fark deger={d.fark} />
              </View>
            ))}
          </View>
          <View style={{ marginTop: 12, gap: 8 }}>
            {g.degisimler.length === 0 && <T style={{ color: renk.soluk }}>Konu durumlarında değişiklik yok.</T>}
            {g.degisimler.map((k) => {
              const ilerledi = DURUM_SIRASI[k.yeni] > DURUM_SIRASI[k.eski];
              return (
                <View key={`${k.ders}|${k.konu}`} style={[s.konuKart, { borderColor: KONU_STIL[k.yeni].kenar, backgroundColor: KONU_STIL[k.yeni].zemin }]}>
                  <T w="yariKalin">{k.konu}</T>
                  <T w="kalin" style={{ fontSize: 12, color: ilerledi ? "#047857" : "#b91c1c" }}>
                    {DURUM_ADI[k.eski]} → {DURUM_ADI[k.yeni]} ({ilerledi ? "ilerledi" : "geriledi"})
                  </T>
                </View>
              );
            })}
          </View>
        </>
      )}
    </Kart>
  );
}

/** Sitedeki DenemeSonucEkrani (ucretsizde sunucu ornek veri yollar; rapor bulanik onizleme). */
export function DenemeSonuc({
  sorular,
  cevaplar,
  dogru,
  yanlis,
  bos,
  puan,
  duzey,
  onceki,
  plan,
}: {
  sorular: SonucSorusu[];
  cevaplar: Record<string, number>;
  dogru: number;
  yanlis: number;
  bos: number;
  puan: number;
  duzey: DenemeDuzeyi;
  onceki: OncekiOzet | null;
  plan: Plan;
}) {
  const durum = (soru: SonucSorusu): "dogru" | "yanlis" | "bos" => {
    const v = cevaplar[soru.id];
    return v === undefined ? "bos" : v === soru.dogruCevap ? "dogru" : "yanlis";
  };
  const [incelenen, setIncelenen] = useState(Math.max(0, sorular.findIndex((x) => durum(x) === "yanlis")));
  const [secilenKonu, setSecilenKonu] = useState<KonuSonucu | null>(null);
  const [harita, setHarita] = useState(false);
  const kaydirma = useRef<ScrollView>(null);
  const incelemeY = useRef(0);
  const tema = DUZEY_TEMA[duzey];
  const net = dogru - yanlis / 4;
  const soru = sorular[incelenen];
  const verilen = cevaplar[soru.id];
  const karne = dersKarnesi(sorular, cevaplar);
  const konular = konuAnalizi(sorular, cevaplar);
  const konuKilitli = plan !== "PRO_PLUS";
  const gosterilen = konuKilitli ? ORNEK_KONULAR : konular;
  const oncelikliler = gosterilen.filter((k) => k.durum !== "yesil").slice(0, 3);
  const gelisim: Gelisim | null = onceki && {
    tarihMetni: onceki.tarihMetni,
    netFark: net - onceki.net,
    puanFark: puan - onceki.puan,
    dersFarklari: karne.flatMap((d) => (onceki.dersNetleri[d.ders] === undefined ? [] : [{ ders: d.ders, fark: d.net - onceki.dersNetleri[d.ders]! }])),
    degisimler: konular.flatMap((k) => {
      const eski = onceki.konuDurumlari[`${k.ders}|${k.konu}`];
      return eski && eski !== k.durum ? [{ ders: k.ders, konu: k.konu, eski, yeni: k.durum }] : [];
    }),
  };

  function konuyaGit(k: KonuSonucu) {
    setSecilenKonu(k);
    setIncelenen(sorular.findIndex((x) => x.id === k.soruIdler[0]));
    kaydirma.current?.scrollTo({ y: incelemeY.current, animated: true });
  }

  const konuBolumu = (
      <View style={{ gap: 16 }}>
        {gosterilen.length > 0 && oncelikliler.length > 0 && (
          <Kart style={{ padding: 20 }}>
            <Baslik ikon={Target}>Önce bunlara çalış</Baslik>
            <View style={{ marginTop: 12, gap: 10 }}>
              {oncelikliler.map((k, i) => {
                const st = KONU_STIL[k.durum];
                return (
                  <View key={`${k.ders}|${k.konu}`} style={[s.konuKart, { borderColor: st.kenar, backgroundColor: st.zemin, padding: 14 }]}>
                    <T w="kalin" style={{ fontSize: 12, color: renk.soluk }}>
                      {i + 1}. öncelik · {DERS_LABEL[k.ders]}
                    </T>
                    <T w="yariKalin" style={{ marginTop: 2 }}>
                      {k.konu}
                    </T>
                    <T style={{ marginTop: 2, color: renk.yaziIkincil, fontSize: 13 }}>{st.mesaj(k.konu)}</T>
                    <T w="yariKalin" style={{ marginTop: 8, color: renk.birincil }} onPress={() => konuyaGit(k)}>
                      Soruları incele →
                    </T>
                  </View>
                );
              })}
            </View>
          </Kart>
        )}
        {gosterilen.length > 0 && (
          <Kart style={{ padding: 20 }}>
            <Baslik>Konu analizi</Baslik>
            <T style={{ marginTop: 4, color: renk.soluk, fontSize: 13 }}>Bir konuya dokununca o konudaki sorular aşağıda vurgulanır.</T>
            {(["kirmizi", "sari", "yesil"] as const).map((d) => {
              const st = KONU_STIL[d];
              const liste = gosterilen.filter((k) => k.durum === d);
              return (
                <View key={d} style={{ marginTop: 16 }}>
                  <View style={{ flexDirection: "row", alignItems: "center", gap: 6, marginBottom: 8 }}>
                    <st.ikon size={16} color={st.ikonRenk} />
                    <T w="kalin">{st.baslik}</T>
                    <View style={{ backgroundColor: st.rozetZemin, borderRadius: 999, paddingHorizontal: 8, paddingVertical: 1 }}>
                      <T w="kalin" style={{ fontSize: 12, color: st.rozetYazi }}>
                        {liste.length}
                      </T>
                    </View>
                  </View>
                  <View style={{ gap: 8 }}>
                    {liste.map((k) => {
                      const eski = onceki?.konuDurumlari[`${k.ders}|${k.konu}`];
                      const secili = secilenKonu?.konu === k.konu && secilenKonu.ders === k.ders;
                      return (
                        <Pressable
                          key={`${k.ders}|${k.konu}`}
                          onPress={() => konuyaGit(k)}
                          style={[s.konuKart, { borderColor: secili ? renk.birincil : st.kenar, borderWidth: secili ? 2 : 1, backgroundColor: st.zemin }]}
                        >
                          <View style={{ flexDirection: "row", justifyContent: "space-between", gap: 8 }}>
                            <T w="yariKalin" style={{ flex: 1 }}>
                              {k.konu}
                            </T>
                            <T style={{ fontSize: 12, color: renk.soluk }}>{DERS_LABEL[k.ders]}</T>
                          </View>
                          <T style={{ marginTop: 2, fontSize: 12, color: renk.yaziIkincil }}>{st.mesaj(k.konu)}</T>
                          <T w="orta" style={{ marginTop: 4, fontSize: 12, color: "#64748b" }}>
                            {k.dogru} D · {k.yanlis} Y · {k.bos} B{eski && eski !== d ? ` · geçen sefer ${DURUM_ADI[eski]}` : ""}
                          </T>
                        </Pressable>
                      );
                    })}
                    {liste.length === 0 && <T style={{ fontSize: 12, color: renk.soluk }}>Bu grupta konu yok.</T>}
                  </View>
                </View>
              );
            })}
          </Kart>
        )}
        <GelisimBolumu g={konuKilitli ? ORNEK_GELISIM : gelisim} />
      </View>
  );

  const rapor = (
    <View style={{ gap: 16 }}>
      <Kart style={{ padding: 20 }}>
        <Baslik ikon={ListChecks}>Ders karnesi</Baslik>
        <View style={{ marginTop: 12 }}>
          {karne.map((d, i) => (
            <View key={d.ders} style={[{ paddingVertical: 12, gap: 6 }, i > 0 && { borderTopWidth: 1, borderTopColor: "rgba(36,102,195,0.05)" }]}>
              <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
                <T w="yariKalin">{DERS_LABEL[d.ders]}</T>
                <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
                  <T w="kalin">{sayiFmt(d.net)} net</T>
                  {onceki?.dersNetleri[d.ders] !== undefined && <Fark deger={d.net - onceki.dersNetleri[d.ders]!} birim="" />}
                </View>
              </View>
              <Serit dogru={d.dogru} yanlis={d.yanlis} bos={d.bos} />
              <T style={{ fontSize: 12, color: renk.soluk }}>
                {d.dogru} D · {d.yanlis} Y · {d.bos} B
              </T>
            </View>
          ))}
        </View>
      </Kart>

      {plan === "PRO" ? (
        <KilitliOzellik
          mevcutPlan={plan}
          gerekenPlan="PRO_PLUS"
          kaynak="gelisim"
          uzun
          baslik="Konu bazlı değerlendirme Pro+'da"
          ozellikler={["Hangi konuyu gözden geçirmen gerektiği: kırmızı, sarı, yeşil uyarılar", "Önce çalışman gereken 3 konu", "Önceki denemene göre net, puan ve konu gelişimin", "Sınırsız deneme"]}
        >
          {konuBolumu}
        </KilitliOzellik>
      ) : (
        konuBolumu
      )}
    </View>
  );

  const inceleme = (
    <View
      onLayout={(e) => {
        incelemeY.current = e.nativeEvent.layout.y;
      }}
      style={{ gap: 10 }}
    >
      {secilenKonu ? (
        <View style={{ flexDirection: "row", flexWrap: "wrap", alignItems: "center", gap: 8 }}>
          <View style={{ backgroundColor: renk.birincilZemin, borderRadius: 999, paddingHorizontal: 12, paddingVertical: 4 }}>
            <T w="orta" style={{ color: renk.birincil, fontSize: 13 }}>
              {secilenKonu.konu} · {secilenKonu.toplam} soru haritada vurgulandı
            </T>
          </View>
          <Pressable onPress={() => setSecilenKonu(null)} style={{ flexDirection: "row", alignItems: "center", gap: 4 }}>
            <X size={14} color={renk.soluk} />
            <T style={{ fontSize: 12, color: renk.soluk }}>Vurguyu kaldır</T>
          </Pressable>
        </View>
      ) : (
        <T w="orta" style={{ fontSize: 12, color: renk.soluk }}>
          Haritada bir soruya dokunarak doğru cevabı ve açıklamasını görebilirsin.
        </T>
      )}
      <Kart style={{ padding: 18 }}>
        <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", gap: 8 }}>
          <T style={{ fontSize: 12, color: renk.soluk }}>
            Soru {incelenen + 1} / {sorular.length}
          </T>
          <View style={{ flexDirection: "row", flexWrap: "wrap", justifyContent: "flex-end", gap: 6, flex: 1 }}>
            {!!soru.konu && (
              <View style={{ backgroundColor: "#f1f5f9", borderRadius: 999, paddingHorizontal: 10, paddingVertical: 2 }}>
                <T w="orta" style={{ fontSize: 12, color: "#475569" }}>
                  {soru.konu}
                </T>
              </View>
            )}
            <View style={{ backgroundColor: renk.birincilZemin, borderRadius: 999, paddingHorizontal: 10, paddingVertical: 2 }}>
              <T w="orta" style={{ fontSize: 12, color: renk.birincil }}>
                {DERS_LABEL[soru.ders]}
              </T>
            </View>
          </View>
        </View>
        <SoruGovdesi sorular={sorular} index={incelenen} />
        <View style={{ marginTop: 16, gap: 8 }}>
          {soru.secenekler.map((secenek, i) => {
            const dogruMu = i === soru.dogruCevap;
            const verilenMi = i === verilen;
            const st = dogruMu ? { kenar: "#10b981", zemin: "#ecfdf5", yazi: "#065f46" } : verilenMi ? { kenar: "#ef4444", zemin: "#fef2f2", yazi: "#991b1b" } : { kenar: "rgba(36,102,195,0.1)", zemin: "#fff", yazi: "#475569" };
            return (
              <View key={i} style={[s.secenek, { borderColor: st.kenar, backgroundColor: st.zemin }]}>
                <T w="yariKalin" style={{ color: st.yazi }}>
                  {String.fromCharCode(65 + i)})
                </T>
                <KesirliMetin metin={secenek} renk={st.yazi} style={{ flex: 1, lineHeight: 21 }} />
                {dogruMu && <CheckCircle2 size={16} color="#059669" />}
                {!dogruMu && verilenMi && <XCircle size={16} color="#dc2626" />}
              </View>
            );
          })}
          {verilen === undefined && (
            <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
              <MinusCircle size={14} color={renk.soluk} />
              <T style={{ fontSize: 12, color: renk.soluk }}>Bu soruyu boş bıraktın.</T>
            </View>
          )}
        </View>
        {!!soru.aciklama && (
          <View style={{ marginTop: 12, backgroundColor: "#f8fafc", borderRadius: 10, padding: 12 }}>
            <KesirliMetin metin={soru.aciklama} renk="#475569" style={{ lineHeight: 21 }} />
          </View>
        )}
        <SoruHataBildir key={soru.id} soruId={soru.id} />
        <View style={{ marginTop: 14, flexDirection: "row", justifyContent: "space-between", gap: 8 }}>
          <Pressable onPress={() => setIncelenen((i) => Math.max(0, i - 1))} disabled={incelenen === 0} style={[s.gez, incelenen === 0 && { opacity: 0.4 }]}>
            <ChevronLeft size={16} color="#475569" />
          </Pressable>
          <Pressable onPress={() => setHarita(true)} style={[s.gez, { flex: 1, justifyContent: "center" }]}>
            <LayoutGrid size={16} color={renk.yazi} />
            <T w="yariKalin">Soru haritası</T>
          </Pressable>
          <Pressable onPress={() => setIncelenen((i) => Math.min(sorular.length - 1, i + 1))} disabled={incelenen === sorular.length - 1} style={[s.gez, incelenen === sorular.length - 1 && { opacity: 0.4 }]}>
            <ChevronRight size={16} color="#475569" />
          </Pressable>
        </View>
      </Kart>
    </View>
  );

  return (
    <ScrollView ref={kaydirma} contentContainerStyle={{ padding: 16, gap: 16, paddingBottom: 40 }}>
      <Kart style={{ overflow: "hidden" }}>
        <View style={{ height: 8, flexDirection: "row" }}>
          <View style={{ flex: 1, backgroundColor: tema.zemin[0] }} />
          <View style={{ flex: 1, backgroundColor: tema.zemin[1] }} />
        </View>
        <View style={{ padding: 20, alignItems: "center", gap: 16 }}>
          <PuanHalkasi puan={puan} renk={tema.metin} />
          <View style={{ alignSelf: "stretch" }}>
            <T w="kalin" style={{ fontSize: 12, letterSpacing: 1.2, color: tema.metin, textAlign: "center" }}>
              {DUZEY_LABEL[duzey].toLocaleUpperCase("tr-TR")} · BUGÜNÜN DENEMESİ
            </T>
            <T w="kalin" style={{ marginTop: 4, fontSize: 22, textAlign: "center" }}>
              Sınav sonucun
            </T>
            <View style={{ marginTop: 14, flexDirection: "row", gap: 8 }}>
              {[
                { ad: "Doğru", deger: dogru, r: "#059669" },
                { ad: "Yanlış", deger: yanlis, r: "#dc2626" },
                { ad: "Boş", deger: bos, r: "#64748b" },
                { ad: "Net", deger: net, r: renk.yazi },
              ].map((x) => (
                <View key={x.ad} style={s.sayi}>
                  <T w="kalin" style={{ fontSize: 18, color: x.r }}>
                    {sayiFmt(x.deger)}
                  </T>
                  <T style={{ fontSize: 12, color: renk.soluk }}>{x.ad}</T>
                </View>
              ))}
            </View>
            <View style={{ marginTop: 14 }}>
              <Serit dogru={dogru} yanlis={yanlis} bos={bos} kalin />
            </View>
          </View>
        </View>
        <T style={{ borderTopWidth: 1, borderTopColor: "rgba(36,102,195,0.05)", paddingHorizontal: 20, paddingVertical: 12, fontSize: 12, color: renk.soluk, lineHeight: 18 }}>
          Bu puan resmi ÖSYM puanı değildir; net üzerinden (doğru − yanlış/4) hesaplanan 100 üzerinden pratik bir deneme puanıdır.
        </T>
      </Kart>

      {plan === "UCRETSIZ" ? (
        <KilitliOzellik
          mevcutPlan={plan}
          gerekenPlan="PRO"
          kaynak="rapor"
          uzun
          baslik="Sınav sonu raporun"
          ozellikler={[
            "Pro: ders karnesi (her derste doğru, yanlış, boş ve net)",
            "Pro: soruların doğru cevapları ve açıklamaları",
            "Pro+: konu bazlı değerlendirme (kırmızı, sarı, yeşil uyarılar)",
            "Pro+: önceki denemene göre gelişimin",
          ]}
        >
          <View style={{ gap: 16 }}>
            {rapor}
            {inceleme}
          </View>
        </KilitliOzellik>
      ) : (
        <>
          {rapor}
          {inceleme}
        </>
      )}

      <T w="yariKalin" style={{ textAlign: "center", color: renk.birincil }} onPress={() => router.back()}>
        ← Deneme sayfasına dön
      </T>

      <SoruHaritasi
        acik={harita}
        kapat={() => setHarita(false)}
        sorular={sorular}
        aktifIndex={incelenen}
        sec={setIncelenen}
        kutuStili={(i) => {
          const d = DURUM_RENGI[durum(sorular[i])];
          const soluk = secilenKonu && !secilenKonu.soruIdler.includes(sorular[i].id);
          return { zemin: soluk ? "#f8fafc" : d.zemin, yazi: soluk ? "#cbd5e1" : d.yazi };
        }}
        aciklamalar={[
          { etiket: "Doğru", zemin: "#10b981" },
          { etiket: "Yanlış", zemin: "#ef4444" },
          { etiket: "Boş", zemin: "#e2e8f0" },
        ]}
      />
    </ScrollView>
  );
}

const s = StyleSheet.create({
  sayi: { flex: 1, alignItems: "center", backgroundColor: "#f8fafc", borderRadius: 16, paddingVertical: 10 },
  farkSatir: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", backgroundColor: "#f8fafc", borderRadius: 12, paddingHorizontal: 12, paddingVertical: 8 },
  konuKart: { borderWidth: 1, borderRadius: 16, padding: 12 },
  secenek: { flexDirection: "row", alignItems: "center", gap: 10, borderWidth: 1, borderRadius: 12, paddingHorizontal: 14, paddingVertical: 11 },
  gez: { flexDirection: "row", alignItems: "center", gap: 6, borderWidth: 1, borderColor: "rgba(36,102,195,0.2)", borderRadius: 12, paddingHorizontal: 14, paddingVertical: 10 },
});

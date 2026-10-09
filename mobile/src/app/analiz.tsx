import { useRef, useState, type ReactNode } from "react";
import { Pressable, RefreshControl, ScrollView, StyleSheet, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import * as WebBrowser from "expo-web-browser";
import {
  ArrowRight,
  ArrowUpDown,
  Award,
  BookOpenCheck,
  CalendarClock,
  GraduationCap,
  Landmark,
  Newspaper,
  Route,
  Sigma,
  SlidersHorizontal,
  Target,
  TrendingUp,
  Trophy,
  Users,
  type LucideIcon,
} from "lucide-react-native";
import { BolumBasligi, Cip, HataKutusu, Kart, SayfaBasligi, T, Yukleniyor } from "@/bilesenler/ui";
import { Secici } from "@/bilesenler/Secici";
import { useVeri } from "@/lib/api";
import { DUZEY_ADI, sayi } from "@/lib/bicim";
import { DUZEY_TEMA, type DenemeDuzeyi } from "@/lib/kpss";
import { renk } from "@/lib/tema";

type KpssBolum = { id: string; ad: string; ogrenimDuzeyi: DenemeDuzeyi };
type Veri = {
  resmiSeri: { yil: number; donem: string; toplamPersonel: number; netArtis: number | null }[];
  siralama: (KpssBolum & { toplam: number })[];
  ilkYil: number;
  sonYil: number;
  secili:
    | (KpssBolum & {
        yillik: { yil: number; kontenjan: number }[];
        minPuan: number | null;
        maxPuan: number | null;
        sira: number | null;
        duzeyBolumSayisi: number;
        acikOgretim: boolean;
        dgs: { lisansAdi: string; puanTuru: string }[];
        departmanSlug: string | null;
        aktifIlanSayisi: number;
        haberSayisi: number;
      })
    | null;
};

const TUMU = "Tümü";
const kpssGridAdimi = (max: number) => (max <= 50 ? 10 : max <= 200 ? 50 : max <= 1000 ? 200 : 1000);
const etiket = (b: KpssBolum) => `${b.ad} · ${DUZEY_ADI[b.ogrenimDuzeyi]}`;

/** Sitedeki /analiz: Turkiye geneli kamu istihdami, bolum karnesi ve en cok atama yapilan bolumler. */
export default function Analiz() {
  const [bolum, setBolum] = useState<string | null>(null);
  const [aralik, setAralik] = useState<{ bas: string; bit: string }>({ bas: TUMU, bit: TUMU });
  const [siraDuzey, setSiraDuzey] = useState<DenemeDuzeyi | null>(null);
  const q = new URLSearchParams();
  if (bolum) q.set("bolum", bolum);
  if (aralik.bas !== TUMU) q.set("siraBaslangic", aralik.bas);
  if (aralik.bit !== TUMU) q.set("siraBitis", aralik.bit);
  if (siraDuzey) q.set("siraDuzey", siraDuzey);
  const { veri, hata, yenileniyor, yenile } = useVeri<Veri>(`/api/mobil/analiz?${q}`);
  const { veri: bolumler } = useVeri<KpssBolum[]>("/api/mobil/analiz?liste=1");
  const kaydirma = useRef<ScrollView>(null);
  const karneY = useRef(0);

  if (hata && !veri) return <HataKutusu mesaj={hata} tekrar={yenile} />;
  if (!veri) return <Yukleniyor />;

  const seri = veri.resmiSeri;
  const ilk = seri[0];
  const son = seri[seri.length - 1];
  const sonNet = seri.findLast((s) => s.netArtis !== null);
  const artis = (son.toplamPersonel / ilk.toplamPersonel - 1) * 100;
  const sec = (id: string) => {
    setBolum(id);
    kaydirma.current?.scrollTo({ y: karneY.current, animated: true });
  };
  const etiketler = bolumler?.map(etiket) ?? [];

  return (
    <ScrollView ref={kaydirma} contentContainerStyle={{ padding: 16, gap: 16, paddingBottom: 40 }} refreshControl={<RefreshControl refreshing={yenileniyor} onRefresh={yenile} tintColor={renk.birincil} />}>
      <SayfaBasligi
        baslik="Kamu Alım Analizi"
        aciklama="Türkiye genelinde yıllara göre kamu istihdamı ve KPSS ile bölümüne göre yapılan alımlar."
        cipler={
          <>
            <Cip etiket="Strateji ve Bütçe Başkanlığı verisi" ikon={Landmark} />
            <Cip etiket="ÖSYM KPSS tercih kılavuzları" ikon={GraduationCap} />
            <Cip etiket="Bölüm bazlı yıllık karşılaştırma" />
          </>
        }
      />

      <View style={{ marginTop: 12, gap: 6 }}>
        <BolumBasligi baslik="Türkiye Geneli Kamu İstihdamı" />
        <T style={s.aciklama}>Cumhurbaşkanlığı Strateji ve Bütçe Başkanlığı verisi. Bölüm/kurum kırılımı içermez; Türkiye genelindeki toplam kamu personelini gösterir.</T>
      </View>
      <OzetKutusu ikon={Users} etiket="Toplam kamu personeli" deger={sayi(son.toplamPersonel)} alt={`${son.yil} · ${son.donem}`} />
      <View style={{ flexDirection: "row", gap: 12 }}>
        <OzetKutusu ikon={TrendingUp} etiket={`${ilk.yil}'den bu yana`} deger={`+%${artis.toLocaleString("tr-TR", { maximumFractionDigits: 1 })}`} alt={`${sayi(ilk.toplamPersonel)} → ${sayi(son.toplamPersonel)}`} />
        {sonNet?.netArtis != null && (
          <OzetKutusu ikon={CalendarClock} etiket="Son yıllık net artış" deger={`${sonNet.netArtis >= 0 ? "+" : ""}${sayi(sonNet.netArtis)}`} alt={`${sonNet.yil - 1} → ${sonNet.yil} (Aralık sonu)`} />
        )}
      </View>
      <Kart style={{ padding: 18 }} yaricap={24}>
        <T w="kalin" style={{ fontSize: 15 }}>
          Yıllara göre toplam kamu personeli
        </T>
        <View style={{ marginTop: 16 }}>
          <SutunGrafik
            veriler={seri.map((x) => ({
              yil: x.yil,
              deger: x.toplamPersonel,
              isaretli: x.donem !== "Aralık sonu",
              ek: [x.donem !== "Aralık sonu" ? `(${x.donem})` : "", x.netArtis !== null ? `+${sayi(x.netArtis)} (yıllık net artış)` : ""].filter(Boolean),
            }))}
            gridAdimi={1_000_000}
            milyon
            isaretliAciklama="Kesikli çubuk, henüz yıl sonu raporu yayımlanmamış ara dönem verisidir."
          />
        </View>
        <Tablo seri={seri} />
      </Kart>

      <View style={{ marginTop: 24, gap: 6 }} onLayout={(e) => (karneY.current = e.nativeEvent.layout.y)}>
        <BolumBasligi baslik="Bölümüne Göre KPSS Alımları" />
        <T style={s.aciklama}>ÖSYM merkezi KPSS tercih kılavuzlarındaki resmi kadro istatistikleri. Kurumsal alımlar, işçi alımları ve 2001/3001/4001 nitelik kolu kadroları dahil değildir.</T>
      </View>
      <Kart style={{ padding: 18, gap: 16 }} yaricap={24}>
        <Secici
          etiket="Bölüm ara"
          deger={veri.secili ? etiket(veri.secili) : ""}
          yerTutucu={bolumler ? "Bölüm adı yaz ya da seç" : "Bölümler yükleniyor..."}
          devreDisi={!bolumler}
          secenekler={etiketler}
          sec={(v) => bolumler && sec(bolumler[etiketler.indexOf(v)].id)}
        />
        {!veri.secili ? (
          <View style={s.bosKarne}>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
              <Target size={16} color={renk.birincil} />
              <T w="yariKalin" style={{ flex: 1 }}>
                Bölümünü seç, yıllara göre alım karnesini gör
              </T>
            </View>
            <T style={{ marginTop: 4, fontSize: 12, color: renk.soluk }}>En çok atama yapılan bölümlerden biriyle başlayabilirsin:</T>
            <View style={{ marginTop: 10, flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
              {veri.siralama.slice(0, 6).map((b) => (
                <Pressable key={b.id} onPress={() => sec(b.id)} style={s.oneri}>
                  <T w="orta" style={{ fontSize: 13, color: "#334155" }}>
                    {b.ad}
                  </T>
                  <T style={{ fontSize: 12, color: renk.soluk }}>{sayi(b.toplam)}</T>
                </Pressable>
              ))}
            </View>
          </View>
        ) : (
          <Karne b={veri.secili} />
        )}
      </Kart>
      {!!veri.secili?.yillik.length && <KarneAyrinti b={veri.secili} />}

      <SiralamaPaneli veri={veri} aralik={aralik} setAralik={setAralik} siraDuzey={siraDuzey} setSiraDuzey={setSiraDuzey} seciliId={bolum} sec={sec} />
    </ScrollView>
  );
}

function OzetKutusu({ ikon: Ikon, etiket, deger, alt }: { ikon: LucideIcon; etiket: string; deger: string; alt: string }) {
  return (
    <Kart style={{ flex: 1, padding: 16 }} yaricap={20}>
      <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 6 }}>
        <T w="yariKalin" style={{ flex: 1, fontSize: 12, color: renk.soluk }}>
          {etiket}
        </T>
        <View style={s.ikon}>
          <Ikon size={16} color={renk.birincil} />
        </View>
      </View>
      <T w="kalin" style={{ marginTop: 6, fontSize: 22, letterSpacing: -0.5, fontVariant: ["tabular-nums"] }}>
        {deger}
      </T>
      <T style={{ marginTop: 2, fontSize: 12, color: renk.soluk }}>{alt}</T>
    </Kart>
  );
}

function BilgiKutusu({ ikon: Ikon, etiket, children }: { ikon: LucideIcon; etiket: string; children: ReactNode }) {
  return (
    <Kart style={{ padding: 14, flexDirection: "row", gap: 12 }} yaricap={16}>
      <View style={[s.ikon, { width: 40, height: 40, borderRadius: 12 }]}>
        <Ikon size={20} color={renk.birincil} />
      </View>
      <View style={{ flex: 1 }}>
        <T w="orta" style={{ fontSize: 12, color: renk.soluk }}>
          {etiket}
        </T>
        <View style={{ marginTop: 2 }}>{children}</View>
      </View>
    </Kart>
  );
}

/**
 * Sitedeki YillikSutunGrafik: tek seri sutun grafigi. Son tamamlanmis yil koyu, ara donem kesikli;
 * en yuksek ve son yilin degeri her zaman yazar, cubuga dokununca o yilin ayrintisi gorunur.
 */
function SutunGrafik({ veriler, gridAdimi, milyon = false, isaretliAciklama }: { veriler: { yil: number; deger: number; isaretli?: boolean; ek?: string[] }[]; gridAdimi: number; milyon?: boolean; isaretliAciklama?: string }) {
  const [aktif, setAktif] = useState<number | null>(null);
  const tavan = Math.ceil(Math.max(...veriler.map((v) => v.deger), gridAdimi) / gridAdimi) * gridAdimi;
  const cizgiler = Array.from({ length: tavan / gridAdimi + 1 }, (_, i) => i * gridAdimi);
  const enYuksek = veriler.reduce((e, v, i) => (v.deger > veriler[e].deger ? i : e), 0);
  const sonIndex = veriler.findLastIndex((v) => !v.isaretli);
  const eksen = (n: number) => (milyon ? `${(n / 1_000_000).toLocaleString("tr-TR")}M` : sayi(n));
  const kisa = (n: number) => (milyon ? `${(n / 1_000_000).toLocaleString("tr-TR", { maximumFractionDigits: 2 })}M` : sayi(n));
  const a = aktif === null ? null : veriler[aktif];
  const YUK = 200;

  return (
    <View>
      <View style={s.detay}>
        {a ? (
          <T style={{ color: "#fff", fontSize: 12 }}>
            <T w="kalin" style={{ color: "#fff", fontSize: 12 }}>
              {a.yil}
            </T>
            {"  "}
            {sayi(a.deger)}
            {a.ek?.length ? `  ${a.ek.join(" · ")}` : ""}
          </T>
        ) : (
          <T style={{ color: "#cbd5e1", fontSize: 12 }}>Ayrıntı için bir çubuğa dokun</T>
        )}
      </View>
      <View style={{ height: YUK, marginTop: 18, paddingLeft: 40 }}>
        {cizgiler.map((d) => (
          <View key={d} style={[s.cizgi, { bottom: (d / tavan) * YUK }]}>
            <T style={s.eksen}>{eksen(d)}</T>
          </View>
        ))}
        <View style={{ flex: 1, flexDirection: "row", alignItems: "flex-end", gap: 2 }}>
          {veriler.map((v, i) => (
            <Pressable key={v.yil} onPress={() => setAktif(aktif === i ? null : i)} style={{ flex: 1, height: "100%", alignItems: "center", justifyContent: "flex-end" }}>
              {(i === enYuksek || i === veriler.length - 1 || i === aktif) && (
                // Dar sutuna sigmaz: cubugun ustunde, sutundan bagimsiz genislikte.
                <T w={i === sonIndex ? "kalin" : "orta"} style={[s.deger, { bottom: (v.deger / tavan) * YUK + 2, color: i === sonIndex ? renk.birincil : "#64748b" }]}>
                  {kisa(v.deger)}
                </T>
              )}
              <View
                style={[
                  { width: "100%", maxWidth: 28, height: (v.deger / tavan) * YUK, borderTopLeftRadius: 5, borderTopRightRadius: 5 },
                  v.isaretli
                    ? { borderWidth: 1.5, borderStyle: "dashed", borderColor: "rgba(36,102,195,0.6)", backgroundColor: "rgba(36,102,195,0.2)" }
                    : { backgroundColor: i === sonIndex ? renk.birincil : "rgba(36,102,195,0.45)" },
                  aktif === i && { opacity: 0.75 },
                ]}
              />
            </Pressable>
          ))}
        </View>
      </View>
      <View style={{ flexDirection: "row", gap: 2, paddingLeft: 40, marginTop: 4 }}>
        {veriler.map((v) => (
          <T key={v.yil} style={{ flex: 1, textAlign: "center", fontSize: 9, color: renk.soluk }}>
            &apos;{String(v.yil).slice(2)}
          </T>
        ))}
      </View>
      {!!isaretliAciklama && <T style={{ marginTop: 8, fontSize: 11, color: renk.soluk }}>{isaretliAciklama}</T>}
    </View>
  );
}

function Tablo({ seri }: { seri: Veri["resmiSeri"] }) {
  const [acik, setAcik] = useState(false);
  return (
    <View style={{ marginTop: 12 }}>
      <T w="yariKalin" style={{ fontSize: 12, color: renk.birincil }} onPress={() => setAcik(!acik)}>
        {acik ? "Tabloyu gizle" : "Tablo olarak görüntüle"}
      </T>
      {acik && (
        <View style={{ marginTop: 8 }}>
          <View style={[s.satir, { borderBottomColor: renk.birincilKenar }]}>
            {["Dönem", "Toplam", "Net artış"].map((b, i) => (
              <T key={b} style={[s.hucre, i > 0 && { textAlign: "right" }, { fontSize: 11, color: renk.soluk }]}>
                {b}
              </T>
            ))}
          </View>
          {seri.map((x) => (
            <View key={x.yil} style={s.satir}>
              <T style={[s.hucre, { fontSize: 12 }]}>
                {x.yil} {x.donem}
              </T>
              <T w="orta" style={[s.hucre, { textAlign: "right", fontSize: 12 }]}>
                {sayi(x.toplamPersonel)}
              </T>
              <T style={[s.hucre, { textAlign: "right", fontSize: 12, color: "#64748b" }]}>{x.netArtis !== null ? `${x.netArtis >= 0 ? "+" : ""}${sayi(x.netArtis)}` : "—"}</T>
            </View>
          ))}
          <T style={{ marginTop: 6, fontSize: 11, color: renk.soluk }}>Kaynak: SBB raporları</T>
        </View>
      )}
    </View>
  );
}

function Karne({ b }: { b: NonNullable<Veri["secili"]> }) {
  const tema = DUZEY_TEMA[b.ogrenimDuzeyi];
  const y = b.yillik;
  const enCok = y.reduce<(typeof y)[number] | null>((e, x) => (!e || x.kontenjan > e.kontenjan ? x : e), null);
  const son = y[y.length - 1];
  return (
    <View style={{ gap: 12 }}>
      <View style={{ flexDirection: "row", flexWrap: "wrap", alignItems: "center", gap: 8 }}>
        <T w="kalin" style={{ fontSize: 19, letterSpacing: -0.3 }}>
          {b.ad}
        </T>
        <View style={{ borderWidth: 1, borderColor: tema.kenar, backgroundColor: tema.acik, borderRadius: 999, paddingHorizontal: 10, paddingVertical: 2 }}>
          <T w="yariKalin" style={{ fontSize: 12, color: tema.metin }}>
            {DUZEY_ADI[b.ogrenimDuzeyi]}
          </T>
        </View>
      </View>
      {enCok && son ? (
        <>
          <View style={{ flexDirection: "row", gap: 12 }}>
            <OzetKutusu ikon={Sigma} etiket="Toplam KPSS alımı" deger={sayi(y.reduce((t, x) => t + x.kontenjan, 0))} alt={`${y[0].yil}–${son.yil} arası`} />
            <OzetKutusu ikon={Trophy} etiket="En çok alım yapılan yıl" deger={sayi(enCok.kontenjan)} alt={`${enCok.yil} yılında`} />
          </View>
          <View style={{ flexDirection: "row", gap: 12 }}>
            <OzetKutusu ikon={CalendarClock} etiket="Son yıl" deger={sayi(son.kontenjan)} alt={`${son.yil} tercih kılavuzu`} />
            <OzetKutusu ikon={Award} etiket="Sıralamadaki yeri" deger={b.sira ? `#${b.sira}` : "—"} alt={`${b.duzeyBolumSayisi} ${DUZEY_ADI[b.ogrenimDuzeyi].toLocaleLowerCase("tr-TR")} bölümü arasında`} />
          </View>
        </>
      ) : (
        <T style={{ color: renk.soluk }}>{b.ad} için KPSS kadro istatistiği bulunamadı.</T>
      )}
    </View>
  );
}

function KarneAyrinti({ b }: { b: NonNullable<Veri["secili"]> }) {
  return (
    <>
      <Kart style={{ padding: 18 }} yaricap={24}>
        <T w="kalin" style={{ fontSize: 15 }}>
          Yıllara göre KPSS alımı
        </T>
        <T style={{ marginTop: 4, fontSize: 12, color: renk.soluk, lineHeight: 17 }}>
          Her çubuk, o yılın ÖSYM KPSS tercih kılavuzunda {b.ad} mezunlarına açılan toplam kadro sayısıdır. Koyu çubuk son yıl.
        </T>
        <View style={{ marginTop: 14 }}>
          <SutunGrafik veriler={b.yillik.map((x) => ({ yil: x.yil, deger: x.kontenjan }))} gridAdimi={kpssGridAdimi(Math.max(1, ...b.yillik.map((x) => x.kontenjan)))} />
        </View>
      </Kart>
      <BilgiKutusu ikon={Target} etiket="KPSS puan aralığı">
        {b.minPuan !== null && b.maxPuan !== null ? (
          <>
            <T w="yariKalin">
              {b.minPuan.toLocaleString("tr-TR")} – {b.maxPuan.toLocaleString("tr-TR")}
            </T>
            <T style={{ fontSize: 12, color: renk.soluk }}>Geçmiş yıllarda bu bölümden atananların puanları</T>
          </>
        ) : (
          <T style={{ color: renk.soluk }}>Yeterli puan verisi yok</T>
        )}
      </BilgiKutusu>
      <BilgiKutusu ikon={BookOpenCheck} etiket="Açık öğretim">
        <View style={{ alignSelf: "flex-start", borderRadius: 999, paddingHorizontal: 8, paddingVertical: 1, backgroundColor: b.acikOgretim ? renk.yesilZemin : "#f1f5f9" }}>
          <T w="kalin" style={{ fontSize: 12, color: b.acikOgretim ? renk.yesil : "#475569" }}>
            {b.acikOgretim ? "Var" : "Yok"}
          </T>
        </View>
        <T style={{ marginTop: 4, fontSize: 12, color: renk.soluk }}>{b.acikOgretim ? "Anadolu Üniversitesi AÖF bünyesinde okunabilir." : "Bilinen AÖF program listesinde yer almıyor."}</T>
      </BilgiKutusu>
      <BilgiKutusu ikon={GraduationCap} etiket="Bu bölüme giriş">
        {b.ogrenimDuzeyi === "LISE" ? (
          <T style={{ fontSize: 12, color: "#475569" }}>Kadrolar lise mezunlarına açıktır; TYT/AYT puanı aranmaz.</T>
        ) : (
          <T style={{ fontSize: 12, color: "#475569", lineHeight: 17 }}>
            Üniversiteye <T w="kalin" style={{ fontSize: 12 }}>{b.ogrenimDuzeyi === "ONLISANS" ? "TYT" : "AYT"}</T> puanıyla girilir; güncel taban puanlar için{" "}
            <T w="yariKalin" style={{ fontSize: 12, color: renk.birincil }} onPress={() => WebBrowser.openBrowserAsync("https://yokatlas.yok.gov.tr/")}>
              YÖK Atlas
            </T>
            .
          </T>
        )}
      </BilgiKutusu>
      {b.departmanSlug ? (
        <Pressable onPress={() => router.push({ pathname: "/liste", params: { kapsam: "bolum", deger: b.departmanSlug! } })}>
          <View style={s.ilanDugme}>
            <View style={{ flex: 1 }}>
              <T w="kalin" style={{ fontSize: 16, color: "#fff" }}>
                {b.aktifIlanSayisi > 0 ? `${b.aktifIlanSayisi} aktif ilanı gör` : "Bölüm sayfasına git"}
              </T>
              <View style={{ flexDirection: "row", alignItems: "center", gap: 4, marginTop: 2 }}>
                <Newspaper size={13} color="rgba(255,255,255,0.8)" />
                <T style={{ fontSize: 12, color: "rgba(255,255,255,0.8)" }}>{b.aktifIlanSayisi > 0 ? `${b.haberSayisi} ilgili haber` : "Şu an aktif ilan yok"}</T>
              </View>
            </View>
            <ArrowRight size={20} color="#fff" />
          </View>
        </Pressable>
      ) : (
        <View style={[s.bosKarne, { padding: 14 }]}>
          <T style={{ fontSize: 12, color: renk.soluk }}>Bu bölüm sitemizdeki bölüm listesiyle eşleşmediği için aktif ilan bilgisi gösterilemiyor.</T>
        </View>
      )}
      {b.ogrenimDuzeyi === "ONLISANS" && (
        <Kart style={{ padding: 18, gap: 10 }} yaricap={24}>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
            <Route size={20} color={renk.birincil} />
            <T w="kalin" style={{ flex: 1, fontSize: 15 }}>
              DGS ile geçebileceğin lisans bölümleri
            </T>
          </View>
          {b.dgs.length > 0 ? (
            <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
              {b.dgs.map((h) => (
                <View key={h.lisansAdi} style={s.oneri}>
                  <T w="orta" style={{ fontSize: 12, color: "#334155" }}>
                    {h.lisansAdi} <T style={{ fontSize: 12, color: renk.soluk }}>({h.puanTuru})</T>
                  </T>
                </View>
              ))}
            </View>
          ) : (
            <T style={{ color: renk.soluk, lineHeight: 20 }}>
              Bu bölüm için DGS geçiş listesi bölüm adı eşleşmesiyle bulunamadı;{" "}
              <T style={{ color: renk.birincil }} onPress={() => WebBrowser.openBrowserAsync("https://www.osym.gov.tr/2026dgs-kilavuz-ve-basvuru-bilgileri")}>
                ÖSYM&apos;nin DGS kılavuzundaki Tablo-2&apos;den
              </T>{" "}
              kontrol edebilirsin.
            </T>
          )}
        </Kart>
      )}
    </>
  );
}

const DUZEY_SEKMELERI: [DenemeDuzeyi | null, string][] = [
  [null, "Tümü"],
  ["LISE", "Lise"],
  ["ONLISANS", "Önlisans"],
  ["LISANS", "Lisans"],
];
const SAYFA = 30;

/** Sitedeki BolumSiralamaPaneli: yil araligi + duzey filtresi, azalan/artan siralama; satira dokununca karne. */
function SiralamaPaneli({
  veri,
  aralik,
  setAralik,
  siraDuzey,
  setSiraDuzey,
  seciliId,
  sec,
}: {
  veri: Veri;
  aralik: { bas: string; bit: string };
  setAralik: (a: { bas: string; bit: string }) => void;
  siraDuzey: DenemeDuzeyi | null;
  setSiraDuzey: (d: DenemeDuzeyi | null) => void;
  seciliId: string | null;
  sec: (id: string) => void;
}) {
  const [artan, setArtan] = useState(false);
  const [filtreAcik, setFiltreAcik] = useState(false);
  const [taslak, setTaslak] = useState(aralik);
  const [adet, setAdet] = useState(SAYFA);
  const yillar = [TUMU, ...Array.from({ length: veri.sonYil - veri.ilkYil + 1 }, (_, i) => String(veri.ilkYil + i))];
  const liste = artan ? [...veri.siralama].sort((a, b) => a.toplam - b.toplam) : veri.siralama;
  const bas = aralik.bas === TUMU ? veri.ilkYil : Number(aralik.bas);
  const bit = aralik.bit === TUMU ? veri.sonYil : Number(aralik.bit);
  const filtreAktif = aralik.bas !== TUMU || aralik.bit !== TUMU;

  return (
    <Kart style={{ padding: 18, gap: 12, marginTop: 8 }} yaricap={24}>
      <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
        <T w="kalin" style={{ flex: 1, fontSize: 15 }}>
          En Çok Atama Yapılan Bölümler
        </T>
        <Pressable onPress={() => setArtan(!artan)} style={s.kucukDugme}>
          <ArrowUpDown size={12} color="#475569" />
          <T w="orta" style={{ fontSize: 12, color: "#475569" }}>
            {artan ? "Artan" : "Azalan"}
          </T>
        </Pressable>
        <Pressable
          onPress={() => {
            setTaslak(aralik);
            setFiltreAcik(!filtreAcik);
          }}
          style={[s.kucukDugme, filtreAktif && { borderColor: "rgba(36,102,195,0.4)", backgroundColor: renk.birincilZemin }]}
          accessibilityLabel="Yıl filtresi"
        >
          <SlidersHorizontal size={14} color={filtreAktif ? renk.birincil : "#64748b"} />
        </Pressable>
      </View>
      {filtreAcik && (
        <View style={s.filtre}>
          <View style={{ flexDirection: "row", gap: 10 }}>
            <View style={{ flex: 1 }}>
              <Secici etiket="Başlangıç" deger={taslak.bas} secenekler={yillar} sec={(v) => setTaslak({ ...taslak, bas: v })} />
            </View>
            <View style={{ flex: 1 }}>
              <Secici etiket="Bitiş" deger={taslak.bit} secenekler={yillar} sec={(v) => setTaslak({ ...taslak, bit: v })} />
            </View>
          </View>
          <Pressable
            onPress={() => {
              setAralik(taslak);
              setFiltreAcik(false);
            }}
            style={s.uygula}
          >
            <T w="yariKalin" style={{ color: "#fff" }}>
              Uygula
            </T>
          </Pressable>
        </View>
      )}
      <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 6 }}>
        {DUZEY_SEKMELERI.map(([d, ad]) => {
          const secili = siraDuzey === d;
          const t = d ? DUZEY_TEMA[d] : null;
          return (
            <Pressable
              key={ad}
              onPress={() => setSiraDuzey(d)}
              style={[s.duzey, secili && (t ? { backgroundColor: t.acik, borderColor: t.kenar } : { backgroundColor: renk.birincil, borderColor: renk.birincil })]}
            >
              <T w="yariKalin" style={{ fontSize: 12, color: secili ? (t ? t.metin : "#fff") : "#475569" }}>
                {ad}
              </T>
            </Pressable>
          );
        })}
      </View>
      <View>
        <View style={s.baslikSatiri}>
          <T w="yariKalin" style={s.baslikYazi}>
            Bölüm Adı
          </T>
          <T w="yariKalin" style={s.baslikYazi}>
            {bas === bit ? bas : `${bas}-${bit}`}
          </T>
          <T w="yariKalin" style={s.baslikYazi}>
            Alım Sayısı
          </T>
        </View>
        <View style={s.listeKutu}>
          {liste.length === 0 && <T style={{ padding: 8, fontSize: 12, color: renk.soluk }}>Seçilen aralıkta veri bulunamadı.</T>}
          {liste.slice(0, adet).map((b, i) => (
            <Pressable key={b.id} onPress={() => sec(b.id)} style={[s.bolumSatiri, b.id === seciliId && { backgroundColor: renk.birincilZemin }]}>
              <T style={{ width: 30, textAlign: "right", fontSize: 12, color: renk.soluk }}>{i + 1}.</T>
              <LinearGradient colors={DUZEY_TEMA[b.ogrenimDuzeyi].zemin} style={{ width: 8, height: 8, borderRadius: 4 }} />
              <T numberOfLines={1} style={{ flex: 1, color: "#334155" }}>
                {b.ad}
              </T>
              <T w="orta" style={{ color: renk.birincil }}>
                {sayi(b.toplam)}
              </T>
            </Pressable>
          ))}
          {liste.length > adet && (
            <Pressable onPress={() => setAdet(adet + 50)} style={{ alignItems: "center", paddingVertical: 10 }}>
              <T w="yariKalin" style={{ color: renk.birincil }}>
                Daha fazla göster ({sayi(liste.length - adet)})
              </T>
            </Pressable>
          )}
        </View>
      </View>
    </Kart>
  );
}

const s = StyleSheet.create({
  aciklama: { fontSize: 13, color: renk.soluk, lineHeight: 19 },
  ikon: { width: 32, height: 32, borderRadius: 10, backgroundColor: renk.birincilZemin, alignItems: "center", justifyContent: "center" },
  detay: { backgroundColor: "#0f172a", borderRadius: 10, paddingHorizontal: 10, paddingVertical: 7 },
  cizgi: { position: "absolute", left: 40, right: 0, borderTopWidth: 1, borderTopColor: "#f1f5f9" },
  eksen: { position: "absolute", left: -40, top: -7, width: 36, textAlign: "right", fontSize: 9, color: renk.soluk },
  deger: { position: "absolute", width: 60, fontSize: 9, textAlign: "center" },
  satir: { flexDirection: "row", gap: 8, paddingVertical: 5, borderBottomWidth: 1, borderBottomColor: "rgba(36,102,195,0.05)" },
  hucre: { flex: 1, color: "#1e293b" },
  bosKarne: { borderWidth: 1, borderStyle: "dashed", borderColor: "rgba(36,102,195,0.2)", backgroundColor: "rgba(36,102,195,0.03)", borderRadius: 16, padding: 16 },
  oneri: { flexDirection: "row", alignItems: "center", gap: 6, borderWidth: 1, borderColor: "rgba(36,102,195,0.15)", backgroundColor: "#fff", borderRadius: 999, paddingHorizontal: 12, paddingVertical: 6 },
  ilanDugme: { flexDirection: "row", alignItems: "center", gap: 12, borderRadius: 16, backgroundColor: renk.birincil, padding: 16 },
  kucukDugme: { flexDirection: "row", alignItems: "center", gap: 4, borderWidth: 1, borderColor: "rgba(36,102,195,0.2)", borderRadius: 8, paddingHorizontal: 8, paddingVertical: 6 },
  filtre: { gap: 10, borderWidth: 1, borderColor: "rgba(36,102,195,0.15)", borderRadius: 12, padding: 12 },
  uygula: { alignItems: "center", backgroundColor: renk.birincil, borderRadius: 10, paddingVertical: 10 },
  duzey: { borderWidth: 1, borderColor: "rgba(36,102,195,0.15)", borderRadius: 999, paddingHorizontal: 14, paddingVertical: 6 },
  baslikSatiri: { flexDirection: "row", justifyContent: "space-between", borderWidth: 1, borderBottomWidth: 0, borderColor: "rgba(36,102,195,0.15)", borderTopLeftRadius: 12, borderTopRightRadius: 12, backgroundColor: "#f8fafc", paddingHorizontal: 12, paddingVertical: 6 },
  baslikYazi: { fontSize: 11, color: "#64748b" },
  listeKutu: { borderWidth: 1, borderColor: "rgba(36,102,195,0.15)", borderBottomLeftRadius: 12, borderBottomRightRadius: 12, padding: 4 },
  bolumSatiri: { flexDirection: "row", alignItems: "center", gap: 8, borderRadius: 8, paddingHorizontal: 6, paddingVertical: 8 },
});

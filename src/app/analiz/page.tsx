import { Suspense, type ReactNode } from "react";
import Link from "next/link";
import {
  ArrowRight,
  Award,
  BarChart3,
  BookOpenCheck,
  CalendarClock,
  GraduationCap,
  Landmark,
  Newspaper,
  Route,
  Sigma,
  Target,
  TrendingUp,
  Trophy,
  Users,
  type LucideIcon,
} from "lucide-react";
import { prisma } from "@/lib/prisma";
import { getResmiIstihdamSerisi } from "@/lib/resmiIstihdamIstatistikleri";
import { getKpssBolumListesi, getKpssBolumVerisi, getKpssVeriAraligi, getBolumSiralamasi } from "@/lib/kpssIstatistik";
import { acikOgretimdeVarMi } from "@/lib/acikOgretimBolumleri";
import { getDgsHedefleri } from "@/lib/dgsGecis";
import { getPostingsForDepartment, normalize } from "@/lib/matching";
import { getHaberlerForDepartment } from "@/lib/haberler";
import { DUZEY_TEMA } from "@/lib/kpssDenemeSabitler";
import { LEVEL_LABEL } from "@/lib/labels";
import { cn } from "@/lib/utils";
import { ResmiIstihdamGrafik } from "@/components/ResmiIstihdamGrafik";
import { YillikSutunGrafik } from "@/components/YillikSutunGrafik";
import { KpssBolumSecici } from "@/components/KpssBolumSecici";
import { BolumSiralamaPaneli } from "@/components/BolumSiralamaPaneli";
import { SayfaBasligi } from "@/components/SayfaBasligi";
import { BolumBasligi } from "@/components/BolumBasligi";

export const metadata = { title: "Kamu Alım Analizi — Kamu Yolu" };

const sayi = (n: number) => n.toLocaleString("tr-TR");

function kpssGridAdimi(maxDeger: number): number {
  if (maxDeger <= 50) return 10;
  if (maxDeger <= 200) return 50;
  if (maxDeger <= 1000) return 200;
  return 1000;
}

/** Buyuk rakamli ozet kutucugu. */
function OzetKutusu({ ikon: Ikon, etiket, deger, alt }: { ikon: LucideIcon; etiket: string; deger: string; alt: string }) {
  return (
    <div className="rounded-3xl border border-primary/10 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between gap-2">
        <p className="text-xs font-semibold text-muted-foreground">{etiket}</p>
        <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-primary/10 text-primary">
          <Ikon className="h-4 w-4" />
        </span>
      </div>
      <p className="mt-2 font-sans text-2xl font-bold tracking-tight text-slate-900 tabular-nums">{deger}</p>
      <p className="mt-0.5 text-xs text-muted-foreground">{alt}</p>
    </div>
  );
}

/** Ikonlu bilgi kutucugu (ilan sayfasindaki kutucuklarla ayni dil). */
function BilgiKutusu({ ikon: Ikon, etiket, children }: { ikon: LucideIcon; etiket: string; children: ReactNode }) {
  return (
    <div className="flex items-start gap-3 rounded-2xl border border-primary/10 bg-white p-4 shadow-sm">
      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
        <Ikon className="h-5 w-5" />
      </span>
      <div className="min-w-0 text-sm text-slate-700">
        <p className="text-xs font-medium text-muted-foreground">{etiket}</p>
        <div className="mt-0.5">{children}</div>
      </div>
    </div>
  );
}

export default async function AnalizPage({
  searchParams,
}: {
  searchParams: Promise<{ bolum?: string; siraBaslangic?: string; siraBitis?: string; siraDuzey?: string }>;
}) {
  const { bolum, siraBaslangic, siraBitis, siraDuzey } = await searchParams;
  const resmiSeri = getResmiIstihdamSerisi();
  const gecerliDuzeyler = ["LISE", "ONLISANS", "LISANS"];

  // Siralama yonu (artan/azalan) tamamen client-side degistiriliyor (bkz.
  // BolumSiralamaPaneli) - burada her zaman "cok" (azalan) ile cekilir.
  const [bolumler, { ilkYil: siraIlkYil, sonYil: siraSonYil }, bolumSiralamasi] = await Promise.all([
    getKpssBolumListesi(),
    getKpssVeriAraligi(),
    getBolumSiralamasi({
      baslangicYil: siraBaslangic ? Number(siraBaslangic) : undefined,
      bitisYil: siraBitis ? Number(siraBitis) : undefined,
      ogrenimDuzeyi: gecerliDuzeyler.includes(siraDuzey ?? "") ? (siraDuzey as "LISE" | "ONLISANS" | "LISANS") : undefined,
      siralama: "cok",
    }),
  ]);

  const seciliBolum = bolum ? bolumler.find((b) => b.id === bolum) : undefined;

  let kpssVerisi: Awaited<ReturnType<typeof getKpssBolumVerisi>> = null;
  let duzeySiralamasi: Awaited<ReturnType<typeof getBolumSiralamasi>> = [];
  let eslesenDepartman: { id: string; name: string; slug: string } | null = null;
  let aktifIlanSayisi = 0;
  let haberSayisi = 0;
  let dgsHedefleri: Awaited<ReturnType<typeof getDgsHedefleri>> = [];

  if (seciliBolum) {
    const [veri, siralama, tumDepartmanlar, dgs] = await Promise.all([
      getKpssBolumVerisi(seciliBolum.id),
      // Karnedeki sira, bolumun kendi ogrenim duzeyindeki tum yillar toplamina gore.
      getBolumSiralamasi({ siralama: "cok", ogrenimDuzeyi: seciliBolum.ogrenimDuzeyi }),
      prisma.department.findMany({ select: { id: true, name: true, slug: true } }),
      seciliBolum.ogrenimDuzeyi === "ONLISANS" ? getDgsHedefleri(seciliBolum.ad) : [],
    ]);
    kpssVerisi = veri;
    duzeySiralamasi = siralama;
    dgsHedefleri = dgs;
    const norm = normalize(seciliBolum.ad);
    eslesenDepartman = tumDepartmanlar.find((d) => normalize(d.name) === norm) ?? null;

    if (eslesenDepartman) {
      const [ilanlar, haberler] = await Promise.all([
        getPostingsForDepartment(eslesenDepartman.id),
        getHaberlerForDepartment(eslesenDepartman),
      ]);
      aktifIlanSayisi = ilanlar.length;
      haberSayisi = haberler.length;
    }
  }

  // Turkiye geneli ozet: tamami SBB serisinden hesaplanir.
  const ilkKayit = resmiSeri[0];
  const sonKayit = resmiSeri[resmiSeri.length - 1];
  const sonNetArtis = resmiSeri.findLast((s) => s.netArtis !== null);
  const artisYuzdesi = (sonKayit.toplamPersonel / ilkKayit.toplamPersonel - 1) * 100;

  // Bolum karnesi
  const yillik = kpssVerisi?.yillikAlimlar ?? [];
  const enCokYil = yillik.reduce<(typeof yillik)[number] | null>((enIyi, y) => (!enIyi || y.kontenjan > enIyi.kontenjan ? y : enIyi), null);
  const sonYil = yillik[yillik.length - 1];
  const kendiSatiri = duzeySiralamasi.find((b) => b.id === seciliBolum?.id);
  // Esit toplamli bolumler ayni sirayi paylasir.
  const duzeyiciSira = kendiSatiri ? 1 + duzeySiralamasi.filter((b) => b.toplam > kendiSatiri.toplam).length : null;
  const tema = seciliBolum ? DUZEY_TEMA[seciliBolum.ogrenimDuzeyi] : null;

  const bolumHref = (id: string) => {
    const params = new URLSearchParams();
    if (siraBaslangic) params.set("siraBaslangic", siraBaslangic);
    if (siraBitis) params.set("siraBitis", siraBitis);
    if (siraDuzey) params.set("siraDuzey", siraDuzey);
    params.set("bolum", id);
    return `/analiz?${params.toString()}`;
  };

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
      <SayfaBasligi
        ikon={BarChart3}
        breadcrumb={[{ ad: "Ana Sayfa", href: "/" }, { ad: "Alım Analizi" }]}
        baslik="Kamu Alım Analizi"
        aciklama="Türkiye genelinde yıllara göre kamu istihdamı ve KPSS ile bölümüne göre yapılan alımlar."
        cipler={[
          { etiket: "Strateji ve Bütçe Başkanlığı verisi", ikon: Landmark },
          { etiket: "ÖSYM KPSS tercih kılavuzları", ikon: GraduationCap },
          { etiket: "Bölüm bazlı yıllık karşılaştırma" },
        ]}
      />

      {/* -- Turkiye geneli -- */}
      <section className="mt-12">
        <BolumBasligi
          baslik="Türkiye Geneli Kamu İstihdamı"
          aciklama="Cumhurbaşkanlığı Strateji ve Bütçe Başkanlığı verisi. Bölüm/kurum kırılımı içermez; Türkiye genelindeki toplam kamu personelini gösterir."
        />
        <div className="mt-6 grid gap-4 sm:grid-cols-3">
          <OzetKutusu
            ikon={Users}
            etiket="Toplam kamu personeli"
            deger={sayi(sonKayit.toplamPersonel)}
            alt={`${sonKayit.yil} · ${sonKayit.donem}`}
          />
          <OzetKutusu
            ikon={TrendingUp}
            etiket={`${ilkKayit.yil}'den bu yana`}
            deger={`+%${artisYuzdesi.toLocaleString("tr-TR", { maximumFractionDigits: 1 })}`}
            alt={`${sayi(ilkKayit.toplamPersonel)} → ${sayi(sonKayit.toplamPersonel)}`}
          />
          {sonNetArtis?.netArtis != null && (
            <OzetKutusu
              ikon={CalendarClock}
              etiket="Son yıllık net artış"
              deger={`${sonNetArtis.netArtis >= 0 ? "+" : ""}${sayi(sonNetArtis.netArtis)}`}
              alt={`${sonNetArtis.yil - 1} → ${sonNetArtis.yil} (Aralık sonu)`}
            />
          )}
        </div>

        <div className="mt-4 rounded-3xl border border-primary/10 bg-white p-6 shadow-sm">
          <h3 className="font-sans text-base font-bold text-slate-900">Yıllara göre toplam kamu personeli</h3>
          <div className="mt-5">
            <ResmiIstihdamGrafik seri={resmiSeri} />
          </div>
          <details className="mt-4">
            <summary className="cursor-pointer text-xs font-semibold text-primary hover:underline">Tablo olarak görüntüle</summary>
            <div className="mt-2 overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-primary/10 text-left text-xs text-muted-foreground">
                    <th className="py-1.5 pr-4 font-medium">Dönem</th>
                    <th className="py-1.5 pr-4 font-medium">Toplam Kamu Personeli</th>
                    <th className="py-1.5 pr-4 font-medium">Yıllık Net Artış</th>
                    <th className="py-1.5 font-medium">Kaynak</th>
                  </tr>
                </thead>
                <tbody>
                  {resmiSeri.map((s) => (
                    <tr key={s.yil} className="border-b border-primary/5 last:border-0">
                      <td className="py-1.5 pr-4 text-slate-800">
                        {s.yil} {s.donem}
                      </td>
                      <td className="py-1.5 pr-4 font-medium text-slate-900 tabular-nums">{sayi(s.toplamPersonel)}</td>
                      <td className="py-1.5 pr-4 text-slate-500 tabular-nums">
                        {s.netArtis !== null ? `${s.netArtis >= 0 ? "+" : ""}${sayi(s.netArtis)}` : "—"}
                      </td>
                      <td className="py-1.5 text-xs text-muted-foreground" title={s.kaynakDosya}>
                        SBB raporu
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </details>
        </div>
      </section>

      {/* -- Bolume gore -- */}
      <section id="bolum-analizi" className="mt-14 scroll-mt-24">
        <BolumBasligi
          baslik="Bölümüne Göre KPSS Alımları"
          aciklama="ÖSYM merkezi KPSS tercih kılavuzlarındaki resmi kadro istatistikleri. Kurumsal alımlar, işçi alımları ve 2001/3001/4001 nitelik kolu kadroları dahil değildir."
        />

        <div className="mt-6 rounded-3xl border border-primary/10 bg-white p-6 shadow-sm">
          <Suspense fallback={null}>
            {/* key: baska bolume gecince arama kutusu yeni bolum adiyla yeniden kurulur. */}
            <KpssBolumSecici key={seciliBolum?.id ?? "bos"} bolumler={bolumler} seciliAd={seciliBolum?.ad} />
          </Suspense>

          {!seciliBolum && (
            <div className="mt-6 rounded-2xl border border-dashed border-primary/20 bg-primary/[0.03] p-5">
              <p className="flex items-center gap-2 text-sm font-semibold text-slate-800">
                <Target className="h-4 w-4 text-primary" />
                Bölümünü seç, yıllara göre alım karnesini gör
              </p>
              <p className="mt-1 text-xs text-muted-foreground">En çok atama yapılan bölümlerden biriyle başlayabilirsin:</p>
              <div className="mt-3 flex flex-wrap gap-2">
                {bolumSiralamasi.slice(0, 6).map((b) => (
                  <Link
                    key={b.id}
                    href={bolumHref(b.id)}
                    scroll={false}
                    className="inline-flex items-center gap-1.5 rounded-full border border-primary/15 bg-white px-3.5 py-1.5 text-sm font-medium text-slate-700 shadow-sm transition-all hover:border-primary/40 hover:text-primary hover:shadow-md"
                  >
                    {b.ad}
                    <span className="text-xs text-muted-foreground tabular-nums">{sayi(b.toplam)}</span>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {seciliBolum && tema && (
            <div className="mt-6">
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="font-sans text-xl font-bold tracking-tight text-slate-900">{seciliBolum.ad}</h3>
                <span className={cn("rounded-full border px-2.5 py-0.5 text-xs font-semibold", tema.acik, tema.metin, tema.kenar)}>
                  {LEVEL_LABEL[seciliBolum.ogrenimDuzeyi]}
                </span>
              </div>
              {yillik.length > 0 && kpssVerisi && enCokYil && sonYil ? (
                <div className="mt-4 grid grid-cols-2 gap-3 lg:grid-cols-4">
                  <OzetKutusu
                    ikon={Sigma}
                    etiket="Toplam KPSS alımı"
                    deger={sayi(yillik.reduce((t, y) => t + y.kontenjan, 0))}
                    alt={`${yillik[0].yil}–${sonYil.yil} arası`}
                  />
                  <OzetKutusu ikon={Trophy} etiket="En çok alım yapılan yıl" deger={sayi(enCokYil.kontenjan)} alt={`${enCokYil.yil} yılında`} />
                  <OzetKutusu ikon={CalendarClock} etiket="Son yıl" deger={sayi(sonYil.kontenjan)} alt={`${sonYil.yil} tercih kılavuzu`} />
                  <OzetKutusu
                    ikon={Award}
                    etiket="Sıralamadaki yeri"
                    deger={duzeyiciSira ? `#${duzeyiciSira}` : "—"}
                    alt={`${duzeySiralamasi.length} ${LEVEL_LABEL[seciliBolum.ogrenimDuzeyi].toLocaleLowerCase("tr-TR")} bölümü arasında`}
                  />
                </div>
              ) : (
                <p className="mt-3 text-sm text-muted-foreground">{seciliBolum.ad} için KPSS kadro istatistiği bulunamadı.</p>
              )}
            </div>
          )}
        </div>

        {seciliBolum && yillik.length > 0 && kpssVerisi && (
          <>
            <div className="mt-4 grid gap-4 lg:grid-cols-[minmax(0,1fr)_20rem]">
              <div className="rounded-3xl border border-primary/10 bg-white p-6 shadow-sm">
                <h3 className="font-sans text-base font-bold text-slate-900">Yıllara göre KPSS alımı</h3>
                <p className="mt-1 text-xs text-muted-foreground">
                  Her çubuk, o yılın ÖSYM KPSS tercih kılavuzunda {seciliBolum.ad} mezunlarına açılan toplam kadro sayısıdır. Koyu
                  çubuk son yıl.
                </p>
                <div className="mt-6">
                  <YillikSutunGrafik
                    veriler={yillik.map((y) => ({ yil: y.yil, deger: y.kontenjan }))}
                    gridAdimi={kpssGridAdimi(Math.max(1, ...yillik.map((y) => y.kontenjan)))}
                    bicim="sayi"
                  />
                </div>
              </div>

              <div className="grid content-start gap-3">
                <BilgiKutusu ikon={Target} etiket="KPSS puan aralığı">
                  {kpssVerisi.minPuan !== null && kpssVerisi.maxPuan !== null ? (
                    <>
                      <p className="font-semibold text-slate-900 tabular-nums">
                        {kpssVerisi.minPuan.toLocaleString("tr-TR")} – {kpssVerisi.maxPuan.toLocaleString("tr-TR")}
                      </p>
                      <p className="text-xs text-muted-foreground">Geçmiş yıllarda bu bölümden atananların puanları</p>
                    </>
                  ) : (
                    <p className="text-muted-foreground">Yeterli puan verisi yok</p>
                  )}
                </BilgiKutusu>

                <BilgiKutusu ikon={BookOpenCheck} etiket="Açık öğretim">
                  {acikOgretimdeVarMi(seciliBolum.ad) ? (
                    <>
                      <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-bold text-emerald-700">Var</span>
                      <p className="mt-1 text-xs text-muted-foreground">Anadolu Üniversitesi AÖF bünyesinde okunabilir.</p>
                    </>
                  ) : (
                    <>
                      <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-bold text-slate-600">Yok</span>
                      <p className="mt-1 text-xs text-muted-foreground">Bilinen AÖF program listesinde yer almıyor.</p>
                    </>
                  )}
                </BilgiKutusu>

                <BilgiKutusu ikon={GraduationCap} etiket="Bu bölüme giriş">
                  {seciliBolum.ogrenimDuzeyi === "LISE" ? (
                    <p className="text-xs text-slate-600">Kadrolar lise mezunlarına açıktır; TYT/AYT puanı aranmaz.</p>
                  ) : (
                    <p className="text-xs text-slate-600">
                      Üniversiteye <strong className="text-slate-900">{seciliBolum.ogrenimDuzeyi === "ONLISANS" ? "TYT" : "AYT"}</strong> puanıyla
                      girilir; güncel taban puanlar için{" "}
                      <a href="https://yokatlas.yok.gov.tr/" target="_blank" rel="noopener noreferrer" className="font-semibold text-primary hover:underline">
                        YÖK Atlas
                      </a>
                      .
                    </p>
                  )}
                </BilgiKutusu>

                {eslesenDepartman ? (
                  <Link
                    href={`/bolum/${eslesenDepartman.slug}`}
                    className="group flex items-center justify-between gap-3 rounded-2xl bg-primary p-4 text-primary-foreground shadow-md shadow-primary/20 transition-all hover:shadow-lg hover:shadow-primary/30"
                  >
                    <span>
                      <span className="block text-base font-bold">
                        {aktifIlanSayisi > 0 ? `${aktifIlanSayisi} aktif ilanı gör` : "Bölüm sayfasına git"}
                      </span>
                      <span className="flex items-center gap-1 text-xs text-primary-foreground/80">
                        <Newspaper className="h-3.5 w-3.5" />
                        {aktifIlanSayisi > 0 ? `${haberSayisi} ilgili haber` : "Şu an aktif ilan yok"}
                      </span>
                    </span>
                    <ArrowRight className="h-5 w-5 shrink-0 transition-transform group-hover:translate-x-0.5" />
                  </Link>
                ) : (
                  <p className="rounded-2xl border border-dashed border-primary/20 p-4 text-xs text-muted-foreground">
                    Bu bölüm sitemizdeki bölüm listesiyle eşleşmediği için aktif ilan bilgisi gösterilemiyor.
                  </p>
                )}
              </div>
            </div>

            {seciliBolum.ogrenimDuzeyi === "ONLISANS" && (
              <div className="mt-4 rounded-3xl border border-primary/10 bg-white p-6 shadow-sm">
                <h3 className="flex items-center gap-2 font-sans text-base font-bold text-slate-900">
                  <Route className="h-5 w-5 text-primary" />
                  DGS ile geçebileceğin lisans bölümleri
                </h3>
                {dgsHedefleri.length > 0 ? (
                  <div className="mt-3 flex flex-wrap gap-2">
                    {dgsHedefleri.map((h) => (
                      <span key={h.lisansAdi} className="rounded-full border border-primary/15 bg-white px-3 py-1 text-xs font-medium text-slate-700">
                        {h.lisansAdi} <span className="text-muted-foreground">({h.puanTuru})</span>
                      </span>
                    ))}
                  </div>
                ) : (
                  <p className="mt-2 text-sm text-muted-foreground">
                    Bu bölüm için DGS geçiş listesi bölüm adı eşleşmesiyle bulunamadı;{" "}
                    <a
                      href="https://www.osym.gov.tr/2026dgs-kilavuz-ve-basvuru-bilgileri"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary hover:underline"
                    >
                      ÖSYM&apos;nin DGS kılavuzundaki Tablo-2&apos;den
                    </a>{" "}
                    kontrol edebilirsin.
                  </p>
                )}
              </div>
            )}
          </>
        )}

        <div className="mt-4">
          <Suspense fallback={null}>
            <BolumSiralamaPaneli
              siralama={bolumSiralamasi}
              ilkYil={siraIlkYil}
              sonYil={siraSonYil}
              seciliBolumId={seciliBolum?.id}
            />
          </Suspense>
        </div>
      </section>
    </div>
  );
}

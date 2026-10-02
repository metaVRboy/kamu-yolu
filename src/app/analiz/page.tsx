import { Suspense } from "react";
import Link from "next/link";
import { BarChart3, Landmark, GraduationCap } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { getResmiIstihdamSerisi } from "@/lib/resmiIstihdamIstatistikleri";
import { getKpssBolumListesi, getKpssBolumVerisi, type OgrenimDuzeyi } from "@/lib/kpssIstatistik";
import { acikOgretimdeVarMi } from "@/lib/acikOgretimBolumleri";
import { getPostingsForDepartment, normalize } from "@/lib/matching";
import { getHaberlerForDepartment } from "@/lib/haberler";
import { ResmiIstihdamGrafik } from "@/components/ResmiIstihdamGrafik";
import { YillikSutunGrafik } from "@/components/YillikSutunGrafik";
import { KpssBolumSecici } from "@/components/KpssBolumSecici";

export const metadata = { title: "Kamu Alım Analizi — Kamu Yolu" };

function kpssGridAdimi(maxDeger: number): number {
  if (maxDeger <= 50) return 10;
  if (maxDeger <= 200) return 50;
  if (maxDeger <= 1000) return 200;
  return 1000;
}

export default async function AnalizPage({
  searchParams,
}: {
  searchParams: Promise<{ bolum?: string; seviye?: string }>;
}) {
  const { bolum, seviye } = await searchParams;
  const resmiSeri = getResmiIstihdamSerisi();

  // memurlar.net disaridan cektigimiz bir kaynak - erisilemez olmasi
  // (yavas yanit, gecici engelleme, yapi degisikligi) bizim sayfamizi
  // 500'e dusurmemeli, sadece bolum secici bos/pasif gorunmeli.
  let bolumler: Awaited<ReturnType<typeof getKpssBolumListesi>> = [];
  let kpssErisilemiyor = false;
  try {
    bolumler = await getKpssBolumListesi();
  } catch {
    kpssErisilemiyor = true;
  }

  const seciliBolum =
    bolum && seviye
      ? bolumler.find((b) => b.id === bolum && b.ogrenimDuzeyi === (seviye as OgrenimDuzeyi))
      : undefined;

  let kpssVerisi: Awaited<ReturnType<typeof getKpssBolumVerisi>> | null = null;
  if (seciliBolum) {
    try {
      kpssVerisi = await getKpssBolumVerisi(seciliBolum.id, seciliBolum.ogrenimDuzeyi);
    } catch {
      kpssErisilemiyor = true;
    }
  }

  let eslesenDepartman: { id: string; name: string; slug: string } | null = null;
  let aktifIlanSayisi = 0;
  let haberSayisi = 0;

  if (seciliBolum) {
    const tumDepartmanlar = await prisma.department.findMany({
      select: { id: true, name: true, slug: true },
    });
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

  const kpssMaxDeger = kpssVerisi
    ? Math.max(1, ...kpssVerisi.yillikAlimlar.map((y) => y.kontenjan))
    : 1;

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6">
      <div className="flex items-center gap-2">
        <BarChart3 className="h-6 w-6 text-primary" />
        <h1 className="text-2xl font-bold tracking-tight">Kamu Alım Analizi</h1>
      </div>
      <p className="mt-2 text-sm text-muted-foreground">
        Türkiye genelinde yıllara göre kamu istihdamı ve KPSS ile bölümüne göre yapılan alımlar.
      </p>

      <div className="mt-6 rounded-2xl border border-primary/20 bg-white p-4">
        <div className="flex items-center gap-2">
          <Landmark className="h-5 w-5 text-primary" />
          <h2 className="text-sm font-semibold text-slate-700">
            Türkiye Geneli Kamu İstihdamı (Resmi Kaynak)
          </h2>
        </div>
        <p className="mt-1 text-xs text-muted-foreground">
          Cumhurbaşkanlığı Strateji ve Bütçe Başkanlığı verilerine dayanır; bölüm/kurum kırılımı
          içermez, sadece Türkiye genelinde toplam kamu personeli sayısını gösterir.
        </p>
        <div className="mt-4">
          <ResmiIstihdamGrafik seri={resmiSeri} />
        </div>

        <details className="mt-4">
          <summary className="cursor-pointer text-xs font-medium text-primary hover:underline">
            Tablo olarak görüntüle
          </summary>
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
                    <td className="py-1.5 pr-4 font-medium text-slate-900">
                      {s.toplamPersonel.toLocaleString("tr-TR")}
                    </td>
                    <td className="py-1.5 pr-4 text-slate-500">
                      {s.netArtis !== null ? `+${s.netArtis.toLocaleString("tr-TR")}` : "—"}
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

      <div className="mt-8 rounded-2xl border border-primary/20 bg-white p-4">
        <div className="flex items-center gap-2">
          <GraduationCap className="h-5 w-5 text-primary" />
          <h2 className="text-sm font-semibold text-slate-700">Bölümüne Göre KPSS İle Yapılan Alımlar</h2>
        </div>
        <p className="mt-1 text-xs text-muted-foreground">
          Kaynak: memurlar.net KPSS Kadro İstatistikleri (ÖSYM merkezi KPSS tercih kılavuzlarındaki
          kadrolar). Kurumsal alımlar, işçi alımları ve 2001/3001/4001 nitelik kolu kadroları dahil
          değildir.
        </p>

        {kpssErisilemiyor ? (
          <p className="mt-4 text-sm text-muted-foreground">
            KPSS kadro istatistikleri şu anda memurlar.net&apos;ten alınamıyor. Lütfen daha sonra
            tekrar dene.
          </p>
        ) : (
          <>
            <div className="mt-4">
              <Suspense fallback={null}>
                <KpssBolumSecici bolumler={bolumler} seciliAd={seciliBolum?.ad} />
              </Suspense>
            </div>

            {!seciliBolum && (
              <p className="mt-6 text-sm text-muted-foreground">
                Yıllara göre alım grafiğini görmek için yukarıdan bir bölüm seç.
              </p>
            )}
          </>
        )}

        {seciliBolum && kpssVerisi && kpssVerisi.yillikAlimlar.length > 0 && (
          <>
            <div className="mt-6">
              <YillikSutunGrafik
                veriler={kpssVerisi.yillikAlimlar.map((y) => ({ yil: y.yil, deger: y.kontenjan }))}
                gridAdimi={kpssGridAdimi(kpssMaxDeger)}
                bicim="sayi"
              />
            </div>

            <div className="mt-5 space-y-2 rounded-xl bg-primary/5 p-4 text-sm text-slate-700">
              <p>
                <span className="font-semibold">Nasıl okunur:</span> Her çubuk, o yıl ÖSYM KPSS
                tercih kılavuzlarında <span className="font-medium">{seciliBolum.ad}</span> mezunlarına
                açılan toplam kadro (kontenjan) sayısını gösterir.
              </p>
              <p>
                <span className="font-semibold">KPSS puan aralığı:</span>{" "}
                {kpssVerisi.minPuan !== null && kpssVerisi.maxPuan !== null
                  ? `Geçmiş yıllarda bu bölümden atananların puanları ${kpssVerisi.minPuan} – ${kpssVerisi.maxPuan} arasında değişmiştir.`
                  : "Bu bölüm için yeterli puan verisi bulunmuyor."}
              </p>
              <p>
                <span className="font-semibold">Açık öğretim imkanı:</span>{" "}
                {acikOgretimdeVarMi(seciliBolum.ad)
                  ? "Evet, Anadolu Üniversitesi Açıköğretim Fakültesi bünyesinde bu bölüm açık öğretimle okunabilir."
                  : "Bu bölüm, bilinen açıköğretim (AÖF) program listesinde yer almıyor."}
              </p>
              <p>
                <span className="font-semibold">Güncel durum:</span>{" "}
                {eslesenDepartman ? (
                  <>
                    Şu anda sitemizde bu bölümle ilgili{" "}
                    <Link href={`/bolum/${eslesenDepartman.slug}`} className="text-primary hover:underline">
                      {aktifIlanSayisi} aktif ilan
                    </Link>{" "}
                    ve {haberSayisi} haber bulunuyor.
                  </>
                ) : (
                  "Bu bölüm sitemizdeki bölüm listesiyle eşleşmediği için aktif ilan/haber bilgisi gösterilemiyor."
                )}
              </p>
              <p className="pt-1 text-xs text-muted-foreground">
                Bu bölüme üniversite ile girebilmek için gereken TYT/AYT taban puanı üniversiteden
                üniversiteye değişir; güncel taban puanlar için{" "}
                <a
                  href="https://memurlar.net/sinav/yks/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:underline"
                >
                  YKS Robotu
                </a>
                &apos;nu kullanabilirsin.
              </p>
            </div>
          </>
        )}

        {seciliBolum && kpssVerisi && kpssVerisi.yillikAlimlar.length === 0 && (
          <p className="mt-6 text-sm text-muted-foreground">
            {seciliBolum.ad} için KPSS kadro istatistiği bulunamadı.
          </p>
        )}
      </div>
    </div>
  );
}

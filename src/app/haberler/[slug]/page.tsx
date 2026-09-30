import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  ArrowUpRight,
  Building2,
  CalendarClock,
  CalendarDays,
  GraduationCap,
  ListChecks,
  Users,
} from "lucide-react";
import { getHaberBySlug, getLatestHaberler } from "@/lib/haberler";
import { getLatestPostings } from "@/lib/matching";
import { HaberGorsel } from "@/components/HaberGorsel";
import { HaberlerSection, isYeni } from "@/components/HaberlerSection";
import { HaberPaylas } from "@/components/HaberPaylas";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { LEVEL_LABEL } from "@/lib/labels";
import { slugify } from "@/lib/slug";
import { SITE_URL } from "@/lib/site";
import { cn } from "@/lib/utils";

export const revalidate = 300;

type HaberDetaylar = {
  neAciklandi: string | null;
  basvuruTakvimi: string | null;
  kimlerBasvurabilir: string | null;
  ozelSartlar: string | null;
  dikkatEdilmesiGerekenler: string | null;
  sss: { soru: string; cevap: string }[];
};

function tarihFormatla(d: Date): string {
  return d.toLocaleDateString("tr-TR", { day: "2-digit", month: "long", year: "numeric" });
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const haber = await getHaberBySlug(slug);
  if (!haber) return { title: "Haber Bulunamadı — Kamu Yolu" };

  return {
    title: `${haber.baslik} — Kamu Yolu`,
    description: haber.ozet,
    openGraph: {
      title: haber.baslik,
      description: haber.ozet,
      images: haber.gorselUrl ? [haber.gorselUrl] : undefined,
      type: "article",
      publishedTime: haber.yayinTarihi.toISOString(),
    },
  };
}

export default async function HaberDetayPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const haber = await getHaberBySlug(slug);
  if (!haber) notFound();

  const [digerHaberlerHam, guncelIlanlar] = await Promise.all([
    getLatestHaberler(6),
    getLatestPostings(5),
  ]);
  const digerHaberler = digerHaberlerHam.filter((h) => h.id !== haber.id).slice(0, 4);

  const detaylar = haber.detaylar as HaberDetaylar | null;
  const egitimLabel = haber.egitimSeviyeleri.length > 0
    ? haber.egitimSeviyeleri.map((l) => LEVEL_LABEL[l] ?? l).join(" / ")
    : null;

  const bilgiKutulari = [
    { icon: Building2, label: "Kurum", value: haber.kurumAdi },
    { icon: Users, label: "Kontenjan", value: haber.kontenjan ? `${haber.kontenjan} kişi` : null },
    { icon: GraduationCap, label: "Eğitim", value: egitimLabel },
    { icon: ListChecks, label: "KPSS Şartı", value: haber.kpssTuru },
    {
      icon: CalendarClock,
      label: "Son Başvuru",
      value: haber.basvuruBitis ? tarihFormatla(haber.basvuruBitis) : null,
      vurgu: true,
    },
  ].filter((k) => k.value);

  const tabloSatirlari = [
    { label: "Kurum", value: haber.kurumAdi },
    { label: "Kadro / Pozisyon", value: haber.kadroPozisyon },
    { label: "Kontenjan", value: haber.kontenjan ? `${haber.kontenjan} kişi` : null },
    { label: "Kategori", value: haber.kategori },
    { label: "İstihdam Türü", value: haber.istihdamTuru },
    { label: "Eğitim", value: egitimLabel },
    { label: "KPSS Türü", value: haber.kpssTuru },
    { label: "Üst Yaş", value: haber.ustYas ? String(haber.ustYas) : null },
    { label: "Başvuru Başlangıcı", value: haber.basvuruBaslangic ? tarihFormatla(haber.basvuruBaslangic) : null },
    { label: "Son Başvuru", value: haber.basvuruBitis ? tarihFormatla(haber.basvuruBitis) : null },
  ].filter((r) => r.value);

  const ayrintiBolumleri = [
    { id: "ne-aciklandi", baslik: "Ne Açıklandı?", metin: detaylar?.neAciklandi },
    { id: "basvuru-takvimi", baslik: "Başvuru Takvimi", metin: detaylar?.basvuruTakvimi },
    { id: "kimler-basvurabilir", baslik: "Kimler Başvurabilir?", metin: detaylar?.kimlerBasvurabilir },
    { id: "ozel-sartlar", baslik: "Özel Şartlar", metin: detaylar?.ozelSartlar },
    { id: "dikkat-edilmesi-gerekenler", baslik: "Dikkat Edilmesi Gerekenler", metin: detaylar?.dikkatEdilmesiGerekenler },
  ].filter((b): b is { id: string; baslik: string; metin: string } => !!b.metin);

  const sss = detaylar?.sss ?? [];
  const icindekiler = [
    ...ayrintiBolumleri.map((b) => ({ id: b.id, baslik: b.baslik })),
    ...(sss.length > 0 ? [{ id: "sss", baslik: "Sık Sorulan Sorular" }] : []),
  ];

  const haberUrl = `${SITE_URL}/haberler/${haber.slug}`;

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <nav className="flex flex-wrap items-center gap-1.5 text-sm text-muted-foreground">
        <Link href="/" className="hover:text-foreground">
          Ana Sayfa
        </Link>
        <span>›</span>
        <Link href="/haberler" className="hover:text-foreground">
          Haberler
        </Link>
        <span>›</span>
        <span className="truncate text-foreground">{haber.baslik}</span>
      </nav>

      <div className="mt-6 grid gap-8 lg:grid-cols-[minmax(0,1fr)_320px]">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2 text-xs">
            {haber.kategori && (
              <Badge className="border-transparent bg-primary text-primary-foreground">{haber.kategori}</Badge>
            )}
            {isYeni(haber.yayinTarihi.toISOString()) && (
              <Badge className="border-transparent bg-red-600 text-white">YENİ</Badge>
            )}
            <span className="flex items-center gap-1.5 text-muted-foreground">
              <CalendarDays className="h-3.5 w-3.5" />
              {tarihFormatla(haber.yayinTarihi)}
            </span>
          </div>

          <h1 className="mt-3 font-sans text-2xl font-bold leading-tight tracking-tight text-slate-900 sm:text-3xl">
            {haber.baslik}
          </h1>

          <p className="mt-2 text-sm text-muted-foreground">Kamu Yolu Haber Merkezi</p>

          <div className="mt-5 rounded-xl border-l-4 border-primary bg-primary/5 p-4">
            <p className="text-sm font-medium text-slate-500">Haber Özeti</p>
            <p className="mt-1 text-base leading-relaxed text-slate-800">{haber.ozet}</p>
          </div>

          <HaberGorsel
            src={haber.gorselUrl}
            alt={haber.baslik}
            logoMu={haber.gorselLogoMu}
            className="mt-6 aspect-[16/9] w-full rounded-2xl"
          />

          {bilgiKutulari.length > 0 && (
            <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3">
              {bilgiKutulari.map((k) => (
                <div
                  key={k.label}
                  className={cn(
                    "flex items-start gap-2.5 rounded-xl border p-3",
                    k.vurgu ? "border-amber-300 bg-amber-50" : "border-border bg-white",
                  )}
                >
                  <k.icon className={cn("mt-0.5 h-4 w-4 shrink-0", k.vurgu ? "text-amber-600" : "text-primary")} />
                  <div className="min-w-0">
                    <p className={cn("text-xs font-medium", k.vurgu ? "text-amber-700" : "text-muted-foreground")}>
                      {k.label}
                    </p>
                    <p className="truncate text-sm font-semibold text-slate-900">{k.value}</p>
                  </div>
                </div>
              ))}
            </div>
          )}

          {icindekiler.length > 0 && (
            <div className="mt-8 rounded-xl border border-border bg-slate-50 p-4">
              <p className="text-sm font-semibold text-slate-900">İçindekiler</p>
              <div className="mt-2 flex flex-wrap gap-2">
                {icindekiler.map((i) => (
                  <a
                    key={i.id}
                    href={`#${i.id}`}
                    className="rounded-full bg-white px-3 py-1.5 text-xs font-medium text-primary shadow-sm hover:bg-primary/10"
                  >
                    {i.baslik}
                  </a>
                ))}
              </div>
            </div>
          )}

          {tabloSatirlari.length > 0 && (
            <div className="mt-8 overflow-hidden rounded-xl border border-border">
              <p className="border-b border-border bg-slate-50 px-4 py-2.5 text-sm font-semibold text-slate-900">
                Haber Detay Tablosu
              </p>
              <table className="w-full text-sm">
                <tbody>
                  {tabloSatirlari.map((r) => (
                    <tr key={r.label} className="border-b border-border last:border-0">
                      <td className="w-1/3 bg-slate-50/60 px-4 py-2.5 font-medium text-muted-foreground">
                        {r.label}
                      </td>
                      <td className="px-4 py-2.5 font-semibold text-slate-900">{r.value}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {ayrintiBolumleri.length > 0 && (
            <div className="mt-8 space-y-6">
              <h2 className="font-sans text-lg font-bold text-slate-900">Haberin Ayrıntıları</h2>
              {ayrintiBolumleri.map((b) => (
                <div key={b.id} id={b.id} className="scroll-mt-24 border-l-2 border-primary/30 pl-4">
                  <h3 className="font-semibold text-slate-900">{b.baslik}</h3>
                  <p className="mt-1.5 text-sm leading-relaxed text-slate-700">{b.metin}</p>
                </div>
              ))}
            </div>
          )}

          {sss.length > 0 && (
            <div id="sss" className="mt-8 scroll-mt-24 space-y-4">
              <h2 className="font-sans text-lg font-bold text-slate-900">Sık Sorulan Sorular</h2>
              {sss.map((s) => (
                <div key={s.soru} className="rounded-xl border border-border bg-white p-4">
                  <p className="font-semibold text-slate-900">{s.soru}</p>
                  <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{s.cevap}</p>
                </div>
              ))}
            </div>
          )}

          {haber.kaynakUrl && (
            <div className="mt-10 flex flex-col gap-3 rounded-2xl bg-slate-900 p-5 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-sm font-semibold text-white">Başvuru ve Resmî Kaynak</p>
                <p className="mt-0.5 text-xs text-slate-300">
                  Başvuru tarihleri ve şartlar değişebileceğinden resmî ilanı kontrol edin.
                </p>
              </div>
              <a
                href={haber.kaynakUrl}
                target="_blank"
                rel="noopener noreferrer"
                className={cn(buttonVariants({ variant: "secondary" }), "shrink-0 bg-white text-slate-900 hover:bg-slate-100")}
              >
                Resmî Kaynağa Git
                <ArrowUpRight className="h-4 w-4" />
              </a>
            </div>
          )}

          <div className="mt-6">
            <HaberPaylas baslik={haber.baslik} url={haberUrl} />
          </div>
        </div>

        <aside className="space-y-6 lg:sticky lg:top-6 lg:self-start">
          {guncelIlanlar.length > 0 && (
            <div className="rounded-2xl border border-border bg-white p-4">
              <p className="text-sm font-semibold text-slate-900">Güncel İlanlar</p>
              <div className="mt-3 space-y-3">
                {guncelIlanlar.map((p) => (
                  <Link
                    key={p.id}
                    href={`/ilan/${p.id}/${slugify(p.title)}`}
                    className="block rounded-lg p-2 -mx-2 transition-colors hover:bg-primary/5"
                  >
                    <p className="text-xs font-medium text-primary">{p.institutionName}</p>
                    <p className="line-clamp-2 text-sm font-semibold text-slate-900">{p.title}</p>
                  </Link>
                ))}
              </div>
            </div>
          )}

          <div className="rounded-2xl border border-primary/20 bg-primary/5 p-4">
            <p className="text-sm font-semibold text-slate-900">Takipte Kal</p>
            <p className="mt-1 text-xs text-muted-foreground">
              Bölümüne uygun yeni ilan ve haberleri kaçırma.
            </p>
            <Link
              href="/profilim/abonelik"
              className={cn(buttonVariants({ size: "sm" }), "mt-3 w-full")}
            >
              Bildirimleri Aç
            </Link>
          </div>
        </aside>
      </div>

      {digerHaberler.length > 0 && (
        <div className="mt-16">
          <HaberlerSection
            haberler={digerHaberler.map((h) => ({ ...h, yayinTarihi: h.yayinTarihi.toISOString() }))}
            baslik="Diğer Güncel Haberler"
            aciklama="Kamu personel alımları ve gündemdeki diğer gelişmeler."
          />
        </div>
      )}

      <Link
        href="/haberler"
        className="mt-10 inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        Tüm haberler
      </Link>
    </div>
  );
}

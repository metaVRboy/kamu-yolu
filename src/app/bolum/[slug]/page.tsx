import { bolumIstatistigi } from "@/lib/kisiselOzet";
import { BolumIstatistikSeridi } from "@/components/ProTesvikleri";
import { TESVIK_IKINCIL } from "@/lib/tesvik";
import { TesvikKarti } from "@/components/TesvikKarti";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Bell, Eye, GraduationCap } from "lucide-react";
import { prisma } from "@/lib/prisma";
import {
  getAvailableFiltersForDepartment,
  getDepartmentPostingCounts,
  getPostingsForDepartment,
} from "@/lib/matching";
import { getHaberlerForDepartment } from "@/lib/haberler";
import { getCurrentUser } from "@/lib/auth";
import { IlanVitrinKarti } from "@/components/IlanVitrinKarti";
import { kurumLogolari, tekIlanKartlari, yakindaFiltresi } from "@/lib/ilanVitrin";
import { ilanCipleri, SayfaBasligi } from "@/components/SayfaBasligi";
import { BolumSecici } from "@/components/BolumSecici";
import { LEVEL_SLUG_TO_ENUM } from "@/lib/levels";
import { FilterBar } from "@/components/FilterBar";
import { HaberlerSection } from "@/components/HaberlerSection";
import { LEVEL_LABEL } from "@/lib/labels";
import { YukseltButonu } from "@/components/YukseltmePenceresi";

export const revalidate = 300;

// Reklam acilis sayfasi: bolume ozgu baslik/aciklama, utm'li linkler tek adreste toplansin (canonical).
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const d = await prisma.department.findUnique({ where: { slug }, select: { name: true, level: true } });
  if (!d) return {};
  const baslik = `${d.name} Mezunları İçin Kamu İlanları — Kamu Yolu`;
  const aciklama = `${d.name} (${LEVEL_LABEL[d.level] ?? d.level}) mezunlarının başvurabileceği güncel kamu personel ve memur ilanları, başvuru tarihleriyle.`;
  // openGraph burada tanimlanmaz: tanimlanirsa layout'taki paylasim gorseli (opengraph-image) duser.
  return { title: baslik, description: aciklama, alternates: { canonical: `/bolum/${slug}` } };
}

export default async function DepartmentResultsPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ kurum?: string; ilanTuru?: string; il?: string; bolumSarti?: string; yakinda?: string }>;
}) {
  const { slug } = await params;
  const { kurum, ilanTuru, il, bolumSarti, yakinda } = await searchParams;
  const departmentRequirement = bolumSarti === "var" || bolumSarti === "yok" ? bolumSarti : undefined;

  const department = await prisma.department.findUnique({ where: { slug } });
  if (!department) notFound();

  const [tumIlanlar, filterOptions, ilgiliHaberler, user, bolumSatirlari, bolumIlanSayilari, istatistik] = await Promise.all([
    getPostingsForDepartment(department.id, {
      institutionType: kurum,
      ilanTuru,
      il,
      departmentRequirement,
    }),
    getAvailableFiltersForDepartment(department.id),
    getHaberlerForDepartment(department),
    getCurrentUser(),
    prisma.department.findMany({ select: { id: true, slug: true, name: true, level: true }, orderBy: { name: "asc" } }),
    getDepartmentPostingCounts(),
    bolumIstatistigi(department.id),
  ]);
  const yakindaDurumu = yakindaFiltresi(tumIlanlar, `/bolum/${slug}`, { kurum, ilanTuru, il, bolumSarti, yakinda });
  const postings = yakindaDurumu.gosterilen;
  const bolumler = bolumSatirlari.map((d) => ({ slug: d.slug, name: d.name, level: d.level, ilanSayisi: bolumIlanSayilari.get(d.id) ?? 0 }));
  const seviyeSlug = Object.entries(LEVEL_SLUG_TO_ENUM).find(([, v]) => v === department.level)?.[0];
  const logolar = await kurumLogolari(postings);
  // SMS ile anlik ilan bildirimi Pro ozelligi (bkz. AbonelikPlanlari) - bu
  // yuzden Pro/Pro+ uyelere yukseltme kartini gostermiyoruz.
  const yukseltmeKartiGoster = user?.abonelikPlani !== "PRO" && user?.abonelikPlani !== "PRO_PLUS";

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <SayfaBasligi
        ikon={GraduationCap}
        breadcrumb={[
          { ad: "Ana Sayfa", href: "/" },
          { ad: `${LEVEL_LABEL[department.level] ?? department.level} Mezunları`, href: seviyeSlug ? `/seviye/${seviyeSlug}` : undefined },
          { ad: department.name, ozel: <BolumSecici aktifAd={department.name} departments={bolumler} /> },
        ]}
        baslik={`${department.name} mezunları için ilanlar`}
        aciklama="Sadece bu bölüme özel şart koşan güncel kamu ilanları listelenir."
        cipler={ilanCipleri(tumIlanlar, yakindaDurumu)}
        aksiyonlar={
          yukseltmeKartiGoster && (
            // Fareli cihazda yalniz zil; uzerine gelince ikon sola kayar, yazi acilir.
            // Dokunmatikte (hover yok) yazi bastan gorunur - yoksa ne ise yaradigi anlasilmaz.
            // Giris yapmamis kullaniciya da pencere acilir; pencere once hesap olusturmaya yonlendirir.
            <YukseltButonu
              plan="PRO"
              kaynak="sms"
              className="group/zil inline-flex h-9 items-center rounded-full bg-primary px-2.5 text-sm font-semibold text-primary-foreground shadow-sm transition-colors hover:bg-primary/90"
            >
              <Bell aria-hidden className="h-4 w-4 shrink-0 transition-transform group-hover/zil:-rotate-12" />
              <span className="max-w-56 overflow-hidden pl-1.5 whitespace-nowrap transition-all duration-300 ease-out [@media(hover:hover)]:max-w-0 [@media(hover:hover)]:pl-0 [@media(hover:hover)]:opacity-0 group-hover/zil:max-w-56 group-hover/zil:pl-1.5 group-hover/zil:opacity-100 group-focus-visible/zil:max-w-56 group-focus-visible/zil:pl-1.5 group-focus-visible/zil:opacity-100">
                Yeni ilan çıkınca haber ver
              </span>
            </YukseltButonu>
          )
        }
        mobilBaslik={`${department.name} ilanları`}
        filtreHedefi="#filtreler"
      />

      <div id="filtreler" className="mt-6 scroll-mt-32">
        <FilterBar options={filterOptions} />
      </div>

      {/* Gercek istatistik + yeni ilan cagrisi (ilan varken); ilan yokken bos durum kendisi soyler. */}
      {postings.length > 0 && istatistik.son30 > 0 && (
        <div className="mt-6">
          <BolumIstatistikSeridi bolumAdi={department.name} son30={istatistik.son30} ortalamaGun={istatistik.ortalamaGun} />
        </div>
      )}

      <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {postings.length === 0 &&
          (tumIlanlar.length === 0 ? (
            // Bolumlerin cogunda cogu zaman ozel ilan yok: ziyaretci bos sayfada kalmasin. Kacirilan varsa sis
            // (kayip), yoksa sinyal (ilk sen ogren); Pro'da sinyal iyi halde.
            <TesvikKarti
              tema={yukseltmeKartiGoster && istatistik.son30 > 0 ? "sis" : "sinyal"}
              className="sm:col-span-2 lg:col-span-3"
              iyi={!yukseltmeKartiGoster}
              baslik={`Şu an ${department.name} şartı arayan aktif bir ilan yok.`}
              metin={`${
                istatistik.son30 > 0
                  ? `Son 30 günde bu bölüme ${istatistik.son30} ilan yayımlandı ve süreleri doldu${istatistik.ortalamaGun !== null ? `; ilanlar ortalama ${istatistik.ortalamaGun} gün açık kalıyor` : ""}. `
                  : ""
              }${
                !user
                  ? "Üye ol, bölümünü seç: yeni ilan çıkınca ilk sen öğren."
                  : yukseltmeKartiGoster
                    ? "Yeni ilan yayımlandığında ilk senin haberin olsun: Pro'da bölümüne uygun her yeni ilanda anında bildirim."
                    : "Bu bölüm profilindeyse yeni ilan çıkınca sana bildirim gelecek."
              } Bölüm şartı aramayan ilanlara da başvurabilirsin.`}
              aksiyon={
                <>
                  {yukseltmeKartiGoster && (
                    <YukseltButonu plan="PRO" kaynak={istatistik.son30 > 0 ? "kacirilan" : "bildirim"} className="tsv-btn">
                      {istatistik.son30 > 0 ? <Eye className="h-4 w-4" aria-hidden /> : <Bell className="h-4 w-4" aria-hidden />}
                      {user ? "İlk ben haberdar olayım" : "Ücretsiz üye ol"}
                    </YukseltButonu>
                  )}
                  {seviyeSlug && (
                    <Link href={`/seviye/${seviyeSlug}`} className={TESVIK_IKINCIL}>
                      {LEVEL_LABEL[department.level] ?? department.level} mezunlarının tüm ilanları
                    </Link>
                  )}
                </>
              }
            />
          ) : (
            <div className="rounded-2xl border border-dashed border-primary/25 bg-primary/5 p-8 text-center text-sm text-muted-foreground sm:col-span-2 lg:col-span-3">
              Seçtiğin kriterlere uyan aktif bir ilan bulunmuyor. Filtreleri değiştirmeyi veya daha sonra tekrar kontrol etmeyi deneyebilirsin.
            </div>
          ))}
        {tekIlanKartlari(postings).map((grup) => (
          <IlanVitrinKarti
            key={grup.ilk.id}
            grup={grup}
            logoUrl={logolar.get(grup.ilk.institutionName) ?? null}
            nitelikOzeti
          />
        ))}
      </div>

      {ilgiliHaberler.length > 0 && (
        <div className="mt-16">
          <HaberlerSection
            haberler={ilgiliHaberler.map((h) => ({ ...h, yayinTarihi: h.yayinTarihi.toISOString() }))}
            showAllLink={false}
            baslik="İlgili Haberler"
            aciklama={`${department.name} ile ilgili gündemdeki haberler.`}
          />
        </div>
      )}
    </div>
  );
}

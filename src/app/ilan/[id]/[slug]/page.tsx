import { notFound, permanentRedirect } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import type { ReactNode } from "react";
import {
  ArrowUpRight,
  Building2,
  CalendarClock,
  CalendarPlus,
  ChevronRight,
  CircleCheck,
  FileText,
  GraduationCap,
  Hourglass,
  MapPin,
  Tag,
  type LucideIcon,
} from "lucide-react";
import { getBenzerIlanlar, getPostingById } from "@/lib/matching";
import { slugify } from "@/lib/slug";
import { INSTITUTION_TYPE_LABEL, LEVEL_LABEL } from "@/lib/labels";
import { SITE_URL } from "@/lib/site";
import {
  basvuruIlerlemesi,
  duzgunHarf,
  kadroAdi,
  kalanGunSayisi,
  konumMetni,
  kurumLogolari,
  nitelikMaddeleri,
  tekIlanKartlari,
} from "@/lib/ilanVitrin";
import { buttonVariants } from "@/components/ui/button";
import { GeriDonLinki } from "@/components/GeriDonLinki";
import { IlanGorsel } from "@/components/IlanGorsel";
import { IlanUygunluk } from "@/components/IlanUygunluk";
import { IlanVitrinKarti } from "@/components/IlanVitrinKarti";
import { HaberPaylas } from "@/components/HaberPaylas";
import { cn } from "@/lib/utils";

export const revalidate = 300;

type Params = { id: string; slug: string };

const TARIH = new Intl.DateTimeFormat("tr-TR", { day: "numeric", month: "long", year: "numeric", timeZone: "Europe/Istanbul" });
const KISA_TARIH = new Intl.DateTimeFormat("tr-TR", { day: "numeric", month: "short", timeZone: "Europe/Istanbul" });

// Kariyer Kapisi gibi bazi kaynaklarda title zaten kurum adini icinde
// barindiriyor (ör. "... — HATAY MUSTAFA KEMAL ÜNİVERSİTESİ REKTÖRLÜĞÜ") -
// boyle durumda kurum adini ayrica eklemek "X — X" gibi tekrara yol aciyor.
function baslikKurumuIceriyorMu(title: string, institutionName: string): boolean {
  return title.toLocaleUpperCase("tr-TR").includes(institutionName.toLocaleUpperCase("tr-TR"));
}

/** Kalan gune gore renk: 3 gun ve alti kirmizi, 7 gun ve alti turuncu, gecmisse gri. */
function kalanGunStili(kalan: number | null) {
  if (kalan === null) return { metin: "Belirtilmemiş", renk: "text-slate-600", zemin: "bg-slate-100" };
  if (kalan < 0) return { metin: "Süresi doldu", renk: "text-slate-600", zemin: "bg-slate-100" };
  if (kalan === 0) return { metin: "Son gün bugün", renk: "text-red-700", zemin: "bg-red-50" };
  return {
    metin: `${kalan} gün kaldı`,
    renk: kalan <= 3 ? "text-red-700" : kalan <= 7 ? "text-amber-700" : "text-emerald-700",
    zemin: kalan <= 3 ? "bg-red-50" : kalan <= 7 ? "bg-amber-50" : "bg-emerald-50",
  };
}

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>;
}): Promise<Metadata> {
  const { id } = await params;
  const posting = await getPostingById(id);
  if (!posting) return { title: "İlan Bulunamadı — Kamu Yolu" };

  const description = posting.departmentRequirementRaw
    ? posting.departmentRequirementRaw.slice(0, 155)
    : `${posting.institutionName} tarafından yayımlanan "${posting.title}" ilanının detaylarını Kamu Yolu'nda incele.`;

  const title = baslikKurumuIceriyorMu(posting.title, posting.institutionName)
    ? `${posting.title} | Kamu Yolu`
    : `${posting.title} — ${posting.institutionName} | Kamu Yolu`;

  return {
    title,
    description,
    alternates: { canonical: `/ilan/${id}/${slugify(posting.title)}` },
    // Demo/ornek veri arama sonuclarinda gercek ilan gibi indekslenmesin.
    robots: posting.isDemo ? { index: false, follow: false } : undefined,
  };
}

function BilgiKutusu({ ikon: Ikon, etiket, children, vurgu }: { ikon: LucideIcon; etiket: string; children: ReactNode; vurgu?: string }) {
  return (
    <div className="flex items-start gap-3 rounded-2xl border border-primary/10 bg-white p-4 shadow-sm">
      <span className={cn("flex h-10 w-10 shrink-0 items-center justify-center rounded-xl", vurgu ?? "bg-primary/10 text-primary")}>
        <Ikon className="h-5 w-5" />
      </span>
      <div className="min-w-0">
        <p className="text-xs font-medium text-muted-foreground">{etiket}</p>
        <p className="mt-0.5 text-sm font-semibold text-slate-800">{children}</p>
      </div>
    </div>
  );
}

function Bolum({ baslik, ikon: Ikon, children }: { baslik: string; ikon: LucideIcon; children: ReactNode }) {
  return (
    <section className="rounded-3xl border border-primary/10 bg-white p-6 shadow-sm">
      <h2 className="flex items-center gap-2 font-sans text-base font-bold text-slate-900">
        <Ikon className="h-5 w-5 text-primary" />
        {baslik}
      </h2>
      <div className="mt-4">{children}</div>
    </section>
  );
}

export default async function IlanDetayPage({
  params,
}: {
  params: Promise<Params>;
}) {
  const { id, slug } = await params;
  const posting = await getPostingById(id);
  if (!posting) notFound();

  // Google'in ayni ilani tek bir adreste gormesi (yinelenen icerik olmamasi)
  // ve URL'nin her zaman guncel basligi yansitmasi icin kanonik slug'a yonlendir.
  const canonicalSlug = slugify(posting.title);
  if (slug !== canonicalSlug) {
    permanentRedirect(`/ilan/${id}/${canonicalSlug}`);
  }

  const bolumler = posting.departments.map((d) => d.department);
  const kadro = kadroAdi(posting.title, posting.institutionName);
  const kurum = duzgunHarf(posting.institutionName);
  const konum = konumMetni(posting.iller, posting.institutionName);
  const duzeyler = posting.educationLevels.map((l) => LEVEL_LABEL[l] ?? l).join(", ");
  const kalan = kalanGunSayisi(posting.applicationEnd);
  const kalanStil = kalanGunStili(kalan);
  const ilerleme = basvuruIlerlemesi(posting.applicationStart, posting.applicationEnd);
  const maddeler = posting.departmentRequirementRaw ? nitelikMaddeleri(posting.departmentRequirementRaw) : [];
  const sayfaUrl = `${SITE_URL}/ilan/${id}/${canonicalSlug}`;
  const tekBolum = bolumler.length === 1 ? bolumler[0] : null;

  const benzerler = await getBenzerIlanlar(posting);
  const logolar = await kurumLogolari([posting, ...benzerler]);

  const jobPostingLd = {
    "@context": "https://schema.org",
    "@type": "JobPosting",
    title: posting.title,
    description:
      posting.departmentRequirementRaw ??
      `${posting.institutionName} tarafından yayımlanan resmi kamu personeli ilanı.`,
    datePosted: (posting.publishedAt ?? posting.createdAt).toISOString(),
    ...(posting.applicationEnd ? { validThrough: posting.applicationEnd.toISOString() } : {}),
    hiringOrganization: { "@type": "Organization", name: posting.institutionName },
    jobLocation:
      posting.iller.length > 0
        ? posting.iller.map((il) => ({
            "@type": "Place",
            address: { "@type": "PostalAddress", addressRegion: il, addressCountry: "TR" },
          }))
        : [{ "@type": "Place", address: { "@type": "PostalAddress", addressCountry: "TR" } }],
    directApply: false,
  };

  const resmiIlanButonu = (
    <a href={posting.sourceUrl} target="_blank" rel="noopener noreferrer" className={buttonVariants({ className: "w-full rounded-full" })}>
      Resmi İlana Git
      <ArrowUpRight className="h-4 w-4" />
    </a>
  );

  return (
    // Mobilde alttaki sabit basvuru cubugu icerigi ortmesin diye ekstra alt bosluk.
    <div className="mx-auto max-w-6xl px-4 pt-8 pb-28 sm:px-6 lg:pb-12">
      <div className="flex flex-wrap items-center justify-between gap-2">
        {/* Tek bolumlu ilanda dogrudan gelen kullanicinin donecegi yer o bolumun sayfasi. */}
        <GeriDonLinki
          yedekHref={tekBolum ? `/bolum/${tekBolum.slug}` : "/ilanlar"}
          yedekEtiket={tekBolum ? `${tekBolum.name} ilanlarına dön` : "Tüm ilanlara dön"}
          bolumler={bolumler.map((b) => ({ slug: b.slug, name: b.name }))}
        />
        <nav aria-label="Sayfa konumu" className="hidden items-center gap-1 text-xs text-muted-foreground sm:flex">
          <Link href="/" className="hover:text-primary hover:underline">
            Ana Sayfa
          </Link>
          <ChevronRight className="h-3 w-3" />
          <Link href={tekBolum ? `/bolum/${tekBolum.slug}` : "/ilanlar"} className="hover:text-primary hover:underline">
            {tekBolum?.name ?? "İlanlar"}
          </Link>
          <ChevronRight className="h-3 w-3" />
          <span className="font-medium text-slate-600">{kadro}</span>
        </nav>
      </div>

      {/* Ust bant: listelerdeki ilan kartiyla ayni gorsel dil (kurum turu rengi + gercek logo). */}
      <header className="mt-4 overflow-hidden rounded-3xl border border-primary/10 bg-white shadow-sm">
        <IlanGorsel logoUrl={logolar.get(posting.institutionName) ?? null} kurumTuru={posting.institutionType} kurumAdi={kurum} className="h-36 sm:h-44" />
        <div className="p-6 sm:p-8">
          <div className="flex flex-wrap items-center gap-1.5 text-xs font-semibold">
            <span className="rounded-full bg-primary/10 px-2.5 py-1 text-primary">{INSTITUTION_TYPE_LABEL[posting.institutionType] ?? "Kurum"}</span>
            {posting.ilanTuru && <span className="rounded-full bg-slate-100 px-2.5 py-1 text-slate-700">{posting.ilanTuru}</span>}
            {!posting.isDepartmentRestricted && <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-emerald-700">Bölüm şartı yok</span>}
            {!posting.isActive && <span className="rounded-full bg-slate-200 px-2.5 py-1 text-slate-600">Artık aktif değil</span>}
            {posting.isDemo && <span className="rounded-full bg-amber-100 px-2.5 py-1 text-amber-800">ÖRNEK VERİ — gerçek ilan değildir</span>}
          </div>
          <h1 className="mt-3 font-sans text-2xl font-bold tracking-tight text-[color-mix(in_oklch,var(--primary),black_22%)] sm:text-3xl">{kadro}</h1>
          <p className="mt-1.5 flex items-center gap-1.5 text-sm font-medium text-slate-600">
            <Building2 className="h-4 w-4 text-primary/70" />
            {kurum}
          </p>
        </div>
      </header>

      <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1fr)_20rem]">
        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-3 xl:grid-cols-3">
            <BilgiKutusu ikon={Hourglass} etiket="Kalan süre" vurgu={cn(kalanStil.zemin, kalanStil.renk)}>
              <span className={kalanStil.renk}>{kalanStil.metin}</span>
            </BilgiKutusu>
            <BilgiKutusu ikon={CalendarClock} etiket="Son başvuru">
              {posting.applicationEnd ? TARIH.format(posting.applicationEnd) : "Belirtilmemiş"}
            </BilgiKutusu>
            <BilgiKutusu ikon={CalendarClock} etiket="Başvuru başlangıcı">
              {posting.applicationStart ? TARIH.format(posting.applicationStart) : "Belirtilmemiş"}
            </BilgiKutusu>
            <BilgiKutusu ikon={MapPin} etiket="Görev yeri">
              {konum ?? "Belirtilmemiş"}
            </BilgiKutusu>
            <BilgiKutusu ikon={GraduationCap} etiket="Öğrenim düzeyi">
              {duzeyler || "Belirtilmemiş"}
            </BilgiKutusu>
            <BilgiKutusu ikon={Tag} etiket="Kaynak">
              {posting.sourceName}
            </BilgiKutusu>
          </div>

          {ilerleme !== null && posting.applicationStart && posting.applicationEnd && (
            <section className="rounded-3xl border border-primary/10 bg-white p-6 shadow-sm" aria-label="Başvuru takvimi">
              <div className="flex items-center justify-between text-xs font-semibold text-slate-600">
                <span>Başvuru başladı · {KISA_TARIH.format(posting.applicationStart)}</span>
                <span>Son gün · {KISA_TARIH.format(posting.applicationEnd)}</span>
              </div>
              <div className="relative mt-3 h-2.5 rounded-full bg-slate-100">
                <div
                  className={cn("h-full rounded-full", kalan !== null && kalan <= 3 ? "bg-red-500" : kalan !== null && kalan <= 7 ? "bg-amber-500" : "bg-primary")}
                  style={{ width: `${ilerleme}%` }}
                />
                {ilerleme > 0 && ilerleme < 100 && (
                  <span
                    aria-hidden
                    className="absolute top-1/2 h-4 w-4 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white bg-slate-900 shadow"
                    style={{ left: `${ilerleme}%` }}
                  />
                )}
              </div>
              <p className="mt-2 text-xs text-muted-foreground">
                {ilerleme >= 100 ? "Başvuru süresi sona erdi." : `Başvuru süresinin %${ilerleme}'i geride kaldı.`}
              </p>
            </section>
          )}

          <IlanUygunluk ilanId={posting.id} />

          {maddeler.length > 0 && (
            <Bolum baslik="Aranan nitelikler" ikon={FileText}>
              <ul className="space-y-2.5">
                {maddeler.map((m, i) =>
                  m.madde ? (
                    <li key={i} className="flex items-start gap-2.5 text-sm leading-relaxed text-slate-700">
                      <CircleCheck className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                      <span>{m.metin}</span>
                    </li>
                  ) : (
                    <li key={i} className="text-sm leading-relaxed text-slate-700">
                      {m.metin}
                    </li>
                  ),
                )}
              </ul>
            </Bolum>
          )}

          {bolumler.length > 0 && (
            <Bolum baslik="Uygun bölümler" ikon={GraduationCap}>
              <div className="flex flex-wrap gap-2">
                {bolumler.map((b) => (
                  <Link
                    key={b.slug}
                    href={`/bolum/${b.slug}`}
                    className="rounded-full border border-primary/20 bg-primary/5 px-3 py-1.5 text-sm font-medium text-primary transition-colors hover:bg-primary/10"
                  >
                    {b.name}
                  </Link>
                ))}
              </div>
            </Bolum>
          )}
        </div>

        {/* Masaustu: kaydirinca sabit kalan basvuru kutusu. */}
        <aside className="hidden lg:block">
          <div className="sticky top-24 space-y-4 rounded-3xl border border-primary/10 bg-white p-6 shadow-sm">
            <div>
              <p className="text-xs font-medium text-muted-foreground">Son başvuru</p>
              <p className="mt-0.5 text-lg font-bold text-slate-900">{posting.applicationEnd ? TARIH.format(posting.applicationEnd) : "Belirtilmemiş"}</p>
              <span className={cn("mt-2 inline-flex rounded-full px-2.5 py-1 text-xs font-bold", kalanStil.zemin, kalanStil.renk)}>{kalanStil.metin}</span>
            </div>
            {resmiIlanButonu}
            {posting.applicationEnd && (
              <a href={`/api/ilan/${posting.id}/takvim`} className={buttonVariants({ variant: "outline", className: "w-full rounded-full" })}>
                <CalendarPlus className="h-4 w-4" />
                Takvime ekle
              </a>
            )}
            <p className="text-xs text-muted-foreground">Başvurular {posting.sourceName} üzerinden yapılır; Kamu Yolu yalnızca ilanı derler.</p>
            <div className="border-t border-primary/10 pt-4">
              <HaberPaylas baslik={`${kadro} — ${kurum}`} url={sayfaUrl} etiket="Paylaş:" />
            </div>
          </div>
        </aside>
      </div>

      {/* Mobil: paylasim ve takvim icerigin sonunda, basvuru butonu altta sabit. */}
      <div className="mt-6 space-y-3 lg:hidden">
        {posting.applicationEnd && (
          <a href={`/api/ilan/${posting.id}/takvim`} className={buttonVariants({ variant: "outline", className: "w-full rounded-full" })}>
            <CalendarPlus className="h-4 w-4" />
            Son başvuru gününü takvime ekle
          </a>
        )}
        <HaberPaylas baslik={`${kadro} — ${kurum}`} url={sayfaUrl} etiket="Paylaş:" />
      </div>

      {benzerler.length > 0 && (
        <section className="mt-12">
          <h2 className="font-sans text-xl font-bold tracking-tight text-slate-900">Benzer ilanlar</h2>
          <p className="mt-1 text-sm text-muted-foreground">Aynı bölüme ya da aynı kuruma ait diğer aktif ilanlar.</p>
          <div className="mt-5 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {tekIlanKartlari(benzerler).map((grup) => (
              <IlanVitrinKarti key={grup.ilk.id} grup={grup} logoUrl={logolar.get(grup.ilk.institutionName) ?? null} nitelikOzeti />
            ))}
          </div>
        </section>
      )}

      <div className="fixed inset-x-0 bottom-0 z-30 border-t border-primary/10 bg-white/95 px-4 py-3 shadow-[0_-8px_24px_-12px_rgb(0_0_0/0.15)] backdrop-blur lg:hidden">
        <div className="mx-auto flex max-w-6xl items-center gap-3">
          <div className="min-w-0 flex-1">
            <p className="truncate text-xs text-muted-foreground">
              {posting.applicationEnd ? `Son başvuru ${TARIH.format(posting.applicationEnd)}` : "Son başvuru belirtilmemiş"}
            </p>
            <p className={cn("text-sm font-bold", kalanStil.renk)}>{kalanStil.metin}</p>
          </div>
          <div className="w-44 shrink-0">{resmiIlanButonu}</div>
        </div>
      </div>

      {!posting.isDemo && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jobPostingLd).replace(/</g, "\\u003c") }}
        />
      )}
    </div>
  );
}

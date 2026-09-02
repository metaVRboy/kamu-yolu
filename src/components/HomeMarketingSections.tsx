import Link from "next/link";
import {
  ArrowUpRight,
  Landmark,
  ListChecks,
  MessageCircle,
  RefreshCw,
  Wand2,
  Layers,
  ExternalLink,
} from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Card } from "@/components/ui/card";

export function ProblemSection() {
  return (
    <section className="rounded-3xl border border-primary/15 bg-gradient-to-br from-slate-900 via-slate-900 to-primary/40 px-6 py-14 text-center text-white shadow-xl sm:py-20">
      <div className="mx-auto max-w-2xl">
        <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">
          Kamu ilanları onlarca farklı yerde yayınlanıyor.
          <br className="hidden sm:block" /> Sana uygun olanı bulmak zaman
          alıyor.
        </h2>
        <p className="mt-4 text-sm text-slate-300 sm:text-base">
          Her kurum ilanını kendi sayfasında duyuruyor; hangisinin senin
          bölümüne uygun olduğunu, hangisinin süresinin dolmak üzere
          olduğunu tek tek takip etmek gerçekçi değil.
        </p>
        <div className="mt-6 flex flex-wrap items-center justify-center gap-2">
          {["İlanlar dağınık", "Bölüm uygunluğu belirsiz", "Güncelliği takip etmek zor"].map(
            (tag) => (
              <span
                key={tag}
                className="rounded-full border border-white/15 bg-white/5 px-3.5 py-1.5 text-xs font-medium text-slate-200"
              >
                {tag}
              </span>
            ),
          )}
        </div>
      </div>
    </section>
  );
}

const STEPS = [
  {
    who: "Sen",
    icon: MessageCircle,
    title: "Bölümünü ya da mesleğini söyle",
    description:
      "Yukarıdaki asistana sohbet eder gibi yaz: mezun olduğun bölümü, öğrenim düzeyini ya da ne aradığını.",
  },
  {
    who: "Kamu Yolu",
    icon: Wand2,
    title: "Yapay zeka anlıyor ve eşleştiriyor",
    description:
      "Bölümün veritabanımızda yoksa bile internetten araştırıp ne iş yaptığını öğrenir, kalıcı olarak ekler ve seninle eşleştirir.",
  },
  {
    who: "Kamu Yolu",
    icon: ListChecks,
    title: "Güncel ilanları listeliyoruz",
    description:
      "Bakanlık, üniversite, hastane, belediye ve daha fazlası — bölümüne uygun ya da bölüm şartı olmayan tüm açık ilanlar periyodik olarak taranır.",
  },
  {
    who: "Sen",
    icon: ExternalLink,
    title: "İlana tıkla, doğrudan başvur",
    description:
      "\"İlana Git\" butonuyla doğrudan kaynak kurumun resmi ilan sayfasına yönlendirilirsin — aracı yok.",
  },
] as const;

export function HowItWorksSection() {
  return (
    <section className="py-14 sm:py-20">
      <div className="mx-auto max-w-2xl text-center">
        <h2 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
          Bölümünü söyle, gerisini biz halledelim.
        </h2>
      </div>

      <div className="mx-auto mt-10 max-w-3xl space-y-4">
        {STEPS.map((step, i) => (
          <div
            key={step.title}
            className="flex items-start gap-4 rounded-2xl border border-primary/15 bg-white/70 p-5 shadow-sm shadow-primary/5 backdrop-blur-md sm:items-center sm:gap-6 sm:p-6"
          >
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 text-white shadow-md shadow-blue-500/25">
              <step.icon className="h-5 w-5" />
            </span>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-primary">
                  {i + 1}. {step.who}
                </span>
              </div>
              <h3 className="mt-0.5 font-semibold text-slate-900">{step.title}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{step.description}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

const TRUST_FEATURES = [
  {
    icon: RefreshCw,
    title: "Otomatik Tarama",
    description: "İlanlar günün her saati periyodik olarak taranır, yeni ilan çıktığında listeye eklenir.",
  },
  {
    icon: ExternalLink,
    title: "Resmi Kaynak",
    description: "Her ilan doğrudan kaynak kurumun resmi ilan sayfasına bağlanır — üçüncü şahıs yorumu yok.",
  },
  {
    icon: Layers,
    title: "Akıllı Eşleştirme",
    description: "Bölümün sistemde yoksa bile araştırılıp eklenir; bölüm şartı olmayan genel ilanlar da asla atlanmaz.",
  },
] as const;

export function TrustSection({
  postingCount,
  institutionCount,
}: {
  postingCount: number;
  institutionCount: number;
}) {
  return (
    <section className="rounded-3xl border border-primary/15 bg-gradient-to-br from-primary/8 via-white to-blue-50 px-6 py-14 sm:py-20">
      <div className="mx-auto max-w-2xl text-center">
        <h2 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
          Veriler resmi kaynaktan, otomatik olarak güncelleniyor.
        </h2>
        <p className="mt-3 text-sm text-muted-foreground sm:text-base">
          Şu anda sistemde {postingCount} aktif ilan, {institutionCount} farklı kurumdan
          derleniyor.
        </p>
      </div>

      <div className="mx-auto mt-10 grid max-w-4xl gap-4 sm:grid-cols-3">
        {TRUST_FEATURES.map((f) => (
          <Card
            key={f.title}
            className="gap-2 border-primary/15 bg-white/70 p-5 text-center backdrop-blur-md"
          >
            <span className="mx-auto flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <f.icon className="h-5 w-5" />
            </span>
            <h3 className="mt-1 text-sm font-semibold text-slate-900">{f.title}</h3>
            <p className="text-xs text-muted-foreground">{f.description}</p>
          </Card>
        ))}
      </div>
    </section>
  );
}

export function ClosingCtaSection() {
  return (
    <section className="rounded-2xl bg-primary px-6 py-14 text-center text-primary-foreground sm:py-16">
      <span className="mx-auto flex h-11 w-11 items-center justify-center rounded-xl bg-white/10">
        <Landmark className="h-5 w-5" />
      </span>
      <h2 className="mt-4 text-2xl font-bold tracking-tight sm:text-3xl">
        Bölümünü söyle, ilanını bul.
      </h2>
      <p className="mx-auto mt-2 max-w-md text-sm text-primary-foreground/80">
        Kamu Yolu tamamen ücretsizdir; kayıt gerektirmez.
      </p>
      <Link
        href="/bolum-ara"
        className={cn(
          buttonVariants({ size: "lg" }),
          "mt-6 bg-white text-primary hover:bg-white/90",
        )}
      >
        Bölüme Göre Ara
        <ArrowUpRight className="h-4 w-4" />
      </Link>
    </section>
  );
}

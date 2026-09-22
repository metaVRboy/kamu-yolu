"use client";

import Image from "next/image";
import Link from "next/link";
import {
  ArrowUpRight,
  ListChecks,
  MessageCircle,
  RefreshCw,
  Wand2,
  Layers,
  ExternalLink,
  Newspaper,
  Calculator,
  Repeat,
  Bell,
  UserRound,
  Sparkles,
  Gem,
  Smartphone,
  ShieldCheck,
  SlidersHorizontal,
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
    icon: MessageCircle,
    title: "Bölümünü ya da mesleğini yaz",
    description:
      "Ana sayfadaki arama kutusuna bölümünü yazmaya başla, çıkan öneriler arasından kendi bölümünü seç.",
  },
  {
    icon: Wand2,
    title: "Eşleşen ilanları buluruz",
    description:
      "Bölümüne özel açılmış ilanlar ile bölüm şartı olmayan, öğrenim düzeyine uygun genel ilanlar bir araya getirilir.",
  },
  {
    icon: ListChecks,
    title: "Güncel ilanları listeliyoruz",
    description:
      "Bakanlık, üniversite, hastane, belediye ve daha fazlası — bölümüne uygun ya da bölüm şartı olmayan tüm açık ilanlar periyodik olarak taranır.",
  },
  {
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
            className="flex items-start gap-4 rounded-2xl border border-primary/15 bg-white p-5 shadow-sm sm:items-center sm:gap-6 sm:p-6"
          >
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-md shadow-primary/25">
              <step.icon className="h-5 w-5" />
            </span>
            <div>
              <span className="text-xs font-semibold text-primary">Adım {i + 1}</span>
              <h3 className="mt-0.5 font-semibold text-slate-900">{step.title}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{step.description}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

const SITE_FEATURES = [
  {
    icon: SlidersHorizontal,
    title: "Bölüme ve Seviyeye Göre Arama",
    description:
      "Ana sayfadaki arama kutusuna bölümünü yaz; lise, önlisans veya lisans seviyesine göre de ayrı sayfalardan ilanlara ulaş.",
  },
  {
    icon: ListChecks,
    title: "Aktif İlanlar ve Filtreler",
    description:
      "Tüm güncel ilanları tek sayfada gör; kurum türü, il, ilan türü ve \"bölüm şartı var/yok\" filtreleriyle daralt.",
  },
  {
    icon: Newspaper,
    title: "Haberler",
    description:
      "Kamu personeli alımıyla ilgili güncel haberleri yapay zeka birden fazla kaynaktan araştırır; yayınlamadan önce her haberi resmi kaynağından (bakanlık, kurum sitesi, Resmi Gazete) doğrular.",
  },
  {
    icon: Calculator,
    title: "KPSS Puan Hesaplama",
    description: "Sınav sonuçlarını girerek KPSS puanını hızlıca hesapla.",
  },
  {
    icon: Repeat,
    title: "Becayiş İlanları",
    description:
      "Yer değiştirmek isteyen kamu çalışanları için talep oluştur, ilgi duyduğun talepleri takip et, site içi mesajlaşmayla doğrudan iletişime geç.",
  },
  {
    icon: Bell,
    title: "Bildirimler",
    description:
      "Genel duyurular herkese açık; bölümüne uygun yeni ilan çıktığında veya becayiş talebine mesaj geldiğinde ayrıca haberdar olursun.",
  },
  {
    icon: UserRound,
    title: "Hesap ve Profil",
    description:
      "E-posta doğrulamalı kayıt, güvenli giriş (insan doğrulamalı) ve profilinden bölüm/öğrenim düzeyi bilgini güncelleme.",
  },
  {
    icon: Sparkles,
    title: "Bana Özel İlanlar",
    description:
      "Profilinde belirttiğin bölüm veya öğrenim düzeyine uygun ilanlar, profil sayfanda otomatik olarak senin için listelenir.",
  },
  {
    icon: Gem,
    title: "Standart, Pro ve Pro+ Planları",
    description:
      "Temel kullanım her zaman ücretsizdir. Pro ve Pro+ planları becayiş mesajlaşması, bölümüne özel bildirim ve reklamsız deneyim gibi ek özellikler sunar.",
  },
  {
    icon: Smartphone,
    title: "Her Cihazda Uyumlu",
    description: "Telefon, tablet ve bilgisayarda aynı hızlı ve sade deneyim.",
  },
  {
    icon: ShieldCheck,
    title: "KVKK ve Gizlilik",
    description:
      "Kullanım şartları ve KVKK metni, çerez politikası ile hangi verinin ne amaçla kullanıldığı açıkça belirtilir.",
  },
] as const;

export function SiteFeaturesSection() {
  return (
    <section className="py-14 sm:py-20">
      <div className="mx-auto max-w-2xl text-center">
        <h2 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
          Sitede Neler Var? A&apos;dan Z&apos;ye
        </h2>
        <p className="mt-3 text-sm text-muted-foreground sm:text-base">
          Kamu Yolu&apos;nun sunduğu tüm özellikler tek bakışta.
        </p>
      </div>

      <div className="mx-auto mt-10 grid max-w-5xl gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {SITE_FEATURES.map((f) => (
          <Card key={f.title} className="gap-2 border-primary/15 bg-white p-5 shadow-sm">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
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
  departmentCount,
}: {
  postingCount: number;
  institutionCount: number;
  departmentCount?: number;
}) {
  return (
    <section className="rounded-3xl border border-primary/15 bg-primary/5 px-6 py-14 sm:py-20">
      <div className="mx-auto max-w-2xl text-center">
        <h2 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
          Veriler resmi kaynaktan, otomatik olarak güncelleniyor.
        </h2>
        <p className="mt-3 text-sm text-muted-foreground sm:text-base">
          Şu anda sistemde {postingCount} aktif ilan, {institutionCount} farklı kurumdan
          derleniyor{departmentCount ? ` ve ${departmentCount} bölüm tanımlı` : ""}.
        </p>
      </div>

      <div className="mx-auto mt-10 grid max-w-4xl gap-4 sm:grid-cols-3">
        {TRUST_FEATURES.map((f) => (
          <Card
            key={f.title}
            className="gap-2 border-primary/15 bg-white p-5 text-center shadow-sm"
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
      <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-white/10">
        <Image
          src="/brand/kamu-yolu-emblem.png"
          alt=""
          width={32}
          height={32}
          className="h-8 w-8 brightness-0 invert"
        />
      </span>
      <h2 className="mt-4 text-2xl font-bold tracking-tight sm:text-3xl">
        Bölümünü söyle, ilanını bul.
      </h2>
      <p className="mx-auto mt-2 max-w-md text-sm text-primary-foreground/80">
        Kamu Yolu tamamen ücretsizdir; kayıt gerektirmez.
      </p>
      <Link
        href="/"
        onClick={(e) => {
          if (window.location.pathname === "/") {
            e.preventDefault();
            window.scrollTo({ top: 0, behavior: "smooth" });
          }
        }}
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

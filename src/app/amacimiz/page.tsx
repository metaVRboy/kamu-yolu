import { Info } from "lucide-react";
import { getHomepageStats } from "@/lib/matching";
import { SayfaBasligi } from "@/components/SayfaBasligi";
import {
  HowItWorksSection,
  ProblemSection,
  SiteFeaturesSection,
  TrustSection,
} from "@/components/HomeMarketingSections";

export const revalidate = 300;

export const metadata = {
  title: "Hakkımızda — Kamu Yolu",
  description: "Kamu Yolu neden var, nasıl çalışır ve verileri nereden alıyor.",
};

export default async function AmacimizPage() {
  const stats = await getHomepageStats();

  return (
    <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6 sm:py-20">
      <SayfaBasligi
        ikon={Info}
        breadcrumb={[{ ad: "Ana Sayfa", href: "/" }, { ad: "Hakkımızda" }]}
        baslik="Hakkımızda"
        aciklama="Kamu Yolu'nu neden kurduk, nasıl çalışıyor ve verilerin doğruluğunu nasıl sağlıyoruz."
        cipler={[
          { etiket: `${stats.postingCount} aktif ilan` },
          { etiket: `${stats.institutionCount} kurum` },
          { etiket: `${stats.departmentCount} bölüm` },
        ]}
      />

      <div className="mt-12">
        <ProblemSection />
      </div>

      <HowItWorksSection />

      <SiteFeaturesSection />

      <TrustSection
        postingCount={stats.postingCount}
        institutionCount={stats.institutionCount}
        departmentCount={stats.departmentCount}
      />
    </div>
  );
}

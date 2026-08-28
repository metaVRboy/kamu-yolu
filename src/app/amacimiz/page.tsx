import { getHomepageStats } from "@/lib/matching";
import {
  HowItWorksSection,
  ProblemSection,
  TrustSection,
} from "@/components/HomeMarketingSections";

export const revalidate = 300;

export const metadata = {
  title: "Amacımız — Kamu Yolu",
  description: "Kamu Yolu neden var, nasıl çalışır ve verileri nereden alıyor.",
};

export default async function AmacimizPage() {
  const stats = await getHomepageStats();

  return (
    <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6 sm:py-20">
      <h1 className="text-center text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
        Amacımız
      </h1>
      <p className="mx-auto mt-2 max-w-xl text-center text-sm text-muted-foreground">
        Kamu Yolu&apos;nu neden kurduk, nasıl çalışıyor ve verilerin doğruluğunu nasıl
        sağlıyoruz.
      </p>

      <div className="mt-12">
        <ProblemSection />
      </div>

      <HowItWorksSection />

      <TrustSection postingCount={stats.postingCount} institutionCount={stats.institutionCount} />
    </div>
  );
}

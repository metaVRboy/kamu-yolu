import { getHomepageStats, getLatestPostings } from "@/lib/matching";
import { PostingCard } from "@/components/PostingCard";
import { PostingTicker } from "@/components/PostingTicker";
import { ChatBot } from "@/components/ChatBot";
import {
  ClosingCtaSection,
  HowItWorksSection,
  ProblemSection,
  TrustSection,
} from "@/components/HomeMarketingSections";

// Ilan verileri periyodik olarak degistigi icin sayfa build-time'da
// dondurulmamali; her birkac dakikada bir yeniden olusturulur.
export const revalidate = 300;

export default async function Home() {
  const [latestPostings, stats] = await Promise.all([
    getLatestPostings(6),
    getHomepageStats(),
  ]);

  return (
    <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6 sm:py-20">
      <ChatBot />

      <div className="mt-8">
        <PostingTicker
          items={latestPostings.map((p) => ({
            id: p.id,
            title: p.title,
            institutionName: p.institutionName,
          }))}
        />
      </div>

      <div className="mt-16">
        <ProblemSection />
      </div>

      <HowItWorksSection />

      <TrustSection
        postingCount={stats.postingCount}
        institutionCount={stats.institutionCount}
      />

      <section className="mt-16">
        <div className="flex items-baseline justify-between">
          <div>
            <h2 className="text-xl font-semibold text-foreground">
              Yeni Eklenen İlanlar
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Sisteme en son eklenen kamu ilanları.
            </p>
          </div>
        </div>
        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          {latestPostings.length === 0 && (
            <p className="text-sm text-muted-foreground">
              Henüz ilan bulunmuyor.
            </p>
          )}
          {latestPostings.map((posting) => (
            <PostingCard key={posting.id} posting={posting} />
          ))}
        </div>
      </section>

      <div className="mt-16">
        <ClosingCtaSection />
      </div>
    </div>
  );
}

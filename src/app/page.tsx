import { prisma } from "@/lib/prisma";
import { getLatestPostings } from "@/lib/matching";
import { DepartmentSearch } from "@/components/DepartmentSearch";
import { PostingCard } from "@/components/PostingCard";
import { ChatBot } from "@/components/ChatBot";
import { Badge } from "@/components/ui/badge";

// Ilan verileri periyodik olarak degistigi icin sayfa build-time'da
// dondurulmamali; her birkac dakikada bir yeniden olusturulur.
export const revalidate = 300;

export default async function Home() {
  const [departments, latestPostings] = await Promise.all([
    prisma.department.findMany({
      select: { slug: true, name: true, level: true },
      orderBy: { name: "asc" },
    }),
    getLatestPostings(6),
  ]);

  return (
    <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6 sm:py-20">
      <ChatBot />

      <section className="mx-auto mt-8 max-w-3xl rounded-3xl border border-primary/20 bg-primary/10 p-8 text-center shadow-xl shadow-primary/10 backdrop-blur-xl sm:p-12">
        <Badge className="border-transparent bg-primary/90 text-primary-foreground">
          Kamu personeli & memur ilanları
        </Badge>

        <h1 className="mt-5 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
          Mezun olduğun bölüme uygun kamu ilanlarını bul
        </h1>
        <p className="mx-auto mt-3 max-w-2xl text-balance text-slate-600">
          Bölümünü seç, sana uygun güncel kamu ilanlarını hemen listeleyelim.
        </p>
        <div className="mt-6 flex justify-center">
          <DepartmentSearch departments={departments} />
        </div>
      </section>

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
    </div>
  );
}

import { prisma } from "@/lib/prisma";
import { getLatestPostings } from "@/lib/matching";
import { DepartmentSearch } from "@/components/DepartmentSearch";
import { PostingCard } from "@/components/PostingCard";

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
    <div className="mx-auto max-w-5xl px-4 py-12">
      <section className="text-center">
        <h1 className="text-3xl font-bold tracking-tight text-neutral-900 sm:text-4xl">
          Mezun olduğun bölüme uygun kamu ilanlarını bul
        </h1>
        <p className="mx-auto mt-3 max-w-2xl text-neutral-600">
          Bölümünü seç; bakanlık, üniversite, hastane, müze ve diğer kamu
          kurumlarının o bölüme uygun veya bölüm şartı olmayan güncel
          sözleşmeli personel/memur ilanlarını listeleyelim.
        </p>
        <div className="mt-6 flex justify-center">
          <DepartmentSearch departments={departments} />
        </div>
      </section>

      <section className="mt-16">
        <h2 className="text-xl font-semibold text-neutral-900">
          Yeni Eklenen İlanlar
        </h2>
        <p className="mt-1 text-sm text-neutral-500">
          Sisteme en son eklenen kamu ilanları.
        </p>
        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          {latestPostings.length === 0 && (
            <p className="text-sm text-neutral-500">
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

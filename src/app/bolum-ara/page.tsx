import { prisma } from "@/lib/prisma";
import { DepartmentSearch } from "@/components/DepartmentSearch";
import { Badge } from "@/components/ui/badge";

export const revalidate = 300;

export const metadata = {
  title: "Bölüme Göre Ara — Kamu Yolu",
  description: "Mezun olduğun bölümü seç, sana uygun güncel kamu ilanlarını listeleyelim.",
};

export default async function BolumAraPage() {
  const departments = await prisma.department.findMany({
    select: { slug: true, name: true, level: true },
    orderBy: { name: "asc" },
  });

  return (
    <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6 sm:py-20">
      <section className="mx-auto max-w-3xl rounded-3xl border border-primary/20 bg-primary/10 p-8 text-center shadow-xl shadow-primary/10 backdrop-blur-xl sm:p-12">
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
    </div>
  );
}

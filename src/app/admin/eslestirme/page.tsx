import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { adminSayfasi } from "@/lib/admin";
import { AdminBaslik, AdminKart } from "@/components/admin/AdminUI";
import { BolumIfadeleri, YeniBolumFormu } from "@/components/admin/AdminEslestirme";
import { LEVEL_LABEL } from "@/lib/labels";

export const metadata = { title: "Bölüm eşleştirme — Admin" };

export default async function AdminEslestirmePage({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  await adminSayfasi();
  const q = (await searchParams).q?.trim() ?? "";
  const eslesmeyenKosul = { isActive: true, isDemo: false, isDepartmentRestricted: true, departments: { none: {} } } as const;

  const [eslesmeyenSayisi, eslesmeyenler, bolumler] = await Promise.all([
    prisma.posting.count({ where: eslesmeyenKosul }),
    prisma.posting.findMany({
      where: eslesmeyenKosul,
      orderBy: { createdAt: "desc" },
      take: 8,
      select: { id: true, title: true, institutionName: true, departmentRequirementRaw: true },
    }),
    q.length >= 2
      ? prisma.department.findMany({
          where: { OR: [{ name: { contains: q, mode: "insensitive" } }, { aliases: { some: { alias: { contains: q, mode: "insensitive" } } } }] },
          orderBy: { name: "asc" },
          take: 25,
          select: { id: true, name: true, level: true, aliases: { select: { id: true, alias: true }, orderBy: { alias: "asc" } }, _count: { select: { postings: true } } },
        })
      : Promise.resolve([]),
  ]);

  return (
    <>
      <AdminBaslik
        baslik="Bölüm eşleştirme"
        aciklama="Tarama, ilan metnindeki bölüm adlarını ve bu eş anlamlı ifadeleri arar. Eklediğin ifade mevcut ilanlara hemen uygulanır; sildiğin ifadenin bağladığı ilanlar çözülür. Elle düzenlenen ilanlara dokunulmaz."
      />

      <AdminKart
        baslik={`Bölüm şartı olup hiçbir bölüme bağlanamayan ilanlar · ${eslesmeyenSayisi}`}
        aciklama="Bu ilanlar hiçbir bölüm sayfasında görünmez. Metindeki bölüm ifadesini aşağıdan ekle ya da ilanı açıp bölümleri elle seç."
      >
        <ul className="space-y-3">
          {eslesmeyenler.map((i) => (
            <li key={i.id} className="rounded-2xl border border-primary/10 p-3">
              <Link href={`/admin/ilanlar/${i.id}`} className="text-sm font-semibold text-slate-900 hover:text-primary">
                {i.title}
              </Link>
              <p className="text-xs text-muted-foreground">{i.institutionName}</p>
              {i.departmentRequirementRaw && <p className="mt-1.5 line-clamp-3 text-xs text-slate-600">{i.departmentRequirementRaw}</p>}
            </li>
          ))}
          {eslesmeyenSayisi === 0 && <li className="text-sm text-muted-foreground">Eşleşmeyen ilan yok.</li>}
        </ul>
        {eslesmeyenSayisi > eslesmeyenler.length && (
          <Link href="/admin/ilanlar?filtre=eslesmeyen" className="mt-3 inline-block text-sm font-semibold text-primary">
            Tümünü gör →
          </Link>
        )}
      </AdminKart>

      <AdminKart baslik="Bölümler ve eş anlamlı ifadeler">
        <form className="flex gap-2">
          <input name="q" defaultValue={q} placeholder="Bölüm ya da ifade ara (en az 2 harf)" className="h-10 min-w-56 flex-1 rounded-xl border border-primary/20 bg-white px-3 text-sm" />
          <button type="submit" className="h-10 rounded-xl bg-primary px-4 text-sm font-semibold text-primary-foreground">
            Ara
          </button>
        </form>
        <ul className="mt-4 divide-y divide-primary/10">
          {bolumler.map((b) => (
            <li key={b.id} className="py-3">
              <p className="text-sm font-semibold text-slate-900">
                {b.name} <span className="font-normal text-muted-foreground">· {LEVEL_LABEL[b.level]} · {b._count.postings} ilan</span>
              </p>
              <BolumIfadeleri departmentId={b.id} aliases={b.aliases} />
            </li>
          ))}
          {q.length >= 2 && bolumler.length === 0 && <li className="py-4 text-sm text-muted-foreground">Bölüm bulunamadı. Listede yoksa aşağıdan ekle.</li>}
        </ul>
      </AdminKart>

      <AdminKart baslik="Yeni bölüm ekle" aciklama="Yalnızca listede hiç olmayan bölümler için. Eklenince mevcut ilanlar taranıp bağlanır.">
        <YeniBolumFormu />
      </AdminKart>
    </>
  );
}

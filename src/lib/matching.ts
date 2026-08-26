import { Prisma } from "@/generated/prisma/client";
import type { EducationLevel } from "@/generated/prisma/enums";
import { prisma } from "@/lib/prisma";
import { slugify } from "@/lib/slug";

export type PostingWithDepartments = Awaited<
  ReturnType<typeof getPostingsForDepartment>
>[number];

export type PostingFilters = {
  institutionType?: string;
  ilanTuru?: string;
  il?: string;
};

function buildFilterWhere(filters?: PostingFilters): Prisma.PostingWhereInput {
  const where: Prisma.PostingWhereInput = {};
  if (filters?.institutionType) {
    where.institutionType = filters.institutionType as Prisma.PostingWhereInput["institutionType"];
  }
  if (filters?.ilanTuru) {
    where.ilanTuru = filters.ilanTuru;
  }
  if (filters?.il) {
    where.iller = { has: filters.il };
  }
  return where;
}

/**
 * Bir bolum icin gosterilecek ilanlari getirir:
 * 1) o bolume acikca eslesmis (PostingDepartment) ilanlar
 * 2) bolum sarti olmayan (isDepartmentRestricted = false) ve bolumun ogrenim
 *    derecesine uyan "genel" ilanlar (ör. "lisans mezunu olmak" yeter)
 */
export async function getPostingsForDepartment(
  departmentId: string,
  filters?: PostingFilters,
) {
  const department = await prisma.department.findUniqueOrThrow({
    where: { id: departmentId },
  });

  const postings = await prisma.posting.findMany({
    where: {
      isActive: true,
      ...buildFilterWhere(filters),
      OR: [
        { departments: { some: { departmentId } } },
        {
          isDepartmentRestricted: false,
          educationLevels: { has: department.level },
        },
      ],
    },
    orderBy: [{ applicationEnd: "asc" }, { publishedAt: "desc" }],
    include: { departments: { include: { department: true } } },
  });

  return postings;
}

/** Bir bolumun (filtre uygulanmadan once) sonuc kumesindeki mevcut filtre secenekleri. */
export async function getAvailableFiltersForDepartment(departmentId: string) {
  const department = await prisma.department.findUniqueOrThrow({
    where: { id: departmentId },
  });

  const postings = await prisma.posting.findMany({
    where: {
      isActive: true,
      OR: [
        { departments: { some: { departmentId } } },
        {
          isDepartmentRestricted: false,
          educationLevels: { has: department.level },
        },
      ],
    },
    select: { institutionType: true, ilanTuru: true, iller: true },
  });

  return summarizeFilters(postings);
}

function summarizeFilters(
  postings: { institutionType: string; ilanTuru: string | null; iller: string[] }[],
) {
  const institutionTypes = new Set<string>();
  const ilanTurleri = new Set<string>();
  const iller = new Set<string>();

  for (const p of postings) {
    institutionTypes.add(p.institutionType);
    if (p.ilanTuru) ilanTurleri.add(p.ilanTuru);
    for (const il of p.iller) {
      if (il.trim()) iller.add(il.trim());
    }
  }

  return {
    institutionTypes: Array.from(institutionTypes).sort(),
    ilanTurleri: Array.from(ilanTurleri).sort(),
    iller: Array.from(iller).sort(),
  };
}

/**
 * Bolum sarti olmayan, sadece ogrenim derecesine gore acilan "genel"
 * ilanlari getirir (ör. lise mezunu olmak yeterli olan bir kadro).
 * Sohbet asistaninin ve /seviye/[level] sayfasinin ortak kaynagi.
 */
export async function getPostingsForLevel(
  level: EducationLevel,
  filters?: PostingFilters,
) {
  return prisma.posting.findMany({
    where: {
      isActive: true,
      isDepartmentRestricted: false,
      educationLevels: { has: level },
      ...buildFilterWhere(filters),
    },
    orderBy: [{ applicationEnd: "asc" }, { publishedAt: "desc" }],
  });
}

export async function getAvailableFiltersForLevel(level: EducationLevel) {
  const postings = await prisma.posting.findMany({
    where: {
      isActive: true,
      isDepartmentRestricted: false,
      educationLevels: { has: level },
    },
    select: { institutionType: true, ilanTuru: true, iller: true },
  });

  return summarizeFilters(postings);
}

export async function getLastSuccessfulScrapeAt(): Promise<Date | null> {
  const lastRun = await prisma.scrapeRun.findFirst({
    where: { status: "SUCCESS" },
    orderBy: { finishedAt: "desc" },
  });
  return lastRun?.finishedAt ?? null;
}

export async function getLatestPostings(limit = 12) {
  return prisma.posting.findMany({
    where: { isActive: true },
    orderBy: { publishedAt: "desc" },
    take: limit,
  });
}

export async function getHomepageStats() {
  const [postingCount, institutionCount, departmentCount] = await Promise.all([
    prisma.posting.count({ where: { isActive: true } }),
    prisma.posting
      .findMany({ where: { isActive: true }, select: { institutionName: true }, distinct: ["institutionName"] })
      .then((rows) => rows.length),
    prisma.department.count(),
  ]);
  return { postingCount, institutionCount, departmentCount };
}

/**
 * Bir ilanin ham "aranan nitelikler" metnini, bilinen bolum adi/alias'lariyla
 * karsilastirip eslesen bolumleri dondurur. Scraper pipeline'i tarafindan
 * her yeni ilan kaydedilirken cagrilir.
 */
export async function matchDepartmentsForText(rawText: string) {
  const normalized = normalize(rawText);
  const allAliases = await prisma.departmentAlias.findMany({
    include: { department: true },
  });
  const allDepartments = await prisma.department.findMany();

  const matches = new Map<string, { departmentId: string; matchedAlias: string }>();

  for (const dept of allDepartments) {
    if (normalized.includes(normalize(dept.name))) {
      matches.set(dept.id, { departmentId: dept.id, matchedAlias: dept.name });
    }
  }

  for (const alias of allAliases) {
    if (matches.has(alias.departmentId)) continue;
    if (normalized.includes(normalize(alias.alias))) {
      matches.set(alias.departmentId, {
        departmentId: alias.departmentId,
        matchedAlias: alias.alias,
      });
    }
  }

  return Array.from(matches.values());
}

/**
 * Chatbot'un net (Claude tarafindan zaten temizlenmis, tek bir bolum adi
 * gibi kisa) bir sorguyu bizim bolum listemizle eslestirmesi icin kullanilir.
 * matchDepartmentsForText'ten farkli olarak burada TEK bir en iyi eslesme
 * arandigi ve girdi zaten kisa/net oldugu icin daha siki bir kural uygulanir:
 * kisa/genel bir bolum adinin (ör. "İşletme"), aslinda FARKLI ve daha
 * spesifik bir alanin (ör. "Gemi Makineleri İşletme Mühendisliği") icinde
 * sirf bir kelimesi ustuste geldigi icin yanlislikla eslesmesini onlemek
 * icin, eslesen terimin sorgunun buyuk kismini kapsamasi sart kosulur.
 */
export async function matchDepartmentForQuery(
  query: string,
): Promise<{ departmentId: string; matchedAlias: string } | null> {
  const normalizedQuery = normalize(query);
  if (!normalizedQuery) return null;

  const allDepartments = await prisma.department.findMany();
  const allAliases = await prisma.departmentAlias.findMany();

  for (const dept of allDepartments) {
    if (normalize(dept.name) === normalizedQuery) {
      return { departmentId: dept.id, matchedAlias: dept.name };
    }
  }
  for (const alias of allAliases) {
    if (normalize(alias.alias) === normalizedQuery) {
      return { departmentId: alias.departmentId, matchedAlias: alias.alias };
    }
  }

  const MIN_COVERAGE_RATIO = 0.6;
  const candidates = [
    ...allDepartments.map((d) => ({ departmentId: d.id, term: d.name })),
    ...allAliases.map((a) => ({ departmentId: a.departmentId, term: a.alias })),
  ];

  let best: { departmentId: string; matchedAlias: string; ratio: number } | null = null;
  for (const c of candidates) {
    const normTerm = normalize(c.term);
    if (!normTerm || !normalizedQuery.includes(normTerm)) continue;
    const ratio = normTerm.length / normalizedQuery.length;
    if (ratio < MIN_COVERAGE_RATIO) continue;
    if (!best || ratio > best.ratio) {
      best = { departmentId: c.departmentId, matchedAlias: c.term, ratio };
    }
  }

  return best ? { departmentId: best.departmentId, matchedAlias: best.matchedAlias } : null;
}

export function normalize(text: string): string {
  return text
    .toLocaleLowerCase("tr-TR")
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "");
}

/**
 * Sohbet asistani, veritabaninda karsiligi olmayan bir bolumu internetten
 * arastirip ogrendiginde bunu kalici olarak eklemek icin kullanilir.
 * Ayni isimde bolum zaten varsa (ör. baska bir kullanicinin aninda once
 * eklemis olmasi) onu dondurur, ikinci kez olusturmaz.
 */
export async function createDepartmentFromResearch(input: {
  name: string;
  level: EducationLevel;
  aliases: string[];
}) {
  const slug = slugify(input.name);
  const existing = await prisma.department.findUnique({ where: { slug } });
  if (existing) return existing;

  const uniqueAliases = Array.from(
    new Set(
      input.aliases
        .map((a) => a.trim())
        .filter((a) => a && normalize(a) !== normalize(input.name)),
    ),
  );

  return prisma.department.create({
    data: {
      name: input.name,
      slug,
      level: input.level,
      aliases: { create: uniqueAliases.map((alias) => ({ alias })) },
    },
  });
}

/**
 * Yeni eklenen bir bolumu, mevcut aktif ilanlarin ham nitelik metinleriyle
 * geriye donuk olarak karsilastirip eslesenleri baglar. Boylece bolum
 * sohbet sirasinda "kesfedildiginde" halihazirda sistemde olan uygun
 * ilanlar da hemen gorunur hale gelir.
 */
export async function linkDepartmentToExistingPostings(
  departmentId: string,
): Promise<number> {
  const department = await prisma.department.findUniqueOrThrow({
    where: { id: departmentId },
    include: { aliases: true },
  });
  const terms = [department.name, ...department.aliases.map((a) => a.alias)];

  const postings = await prisma.posting.findMany({
    where: { isActive: true, departmentRequirementRaw: { not: null } },
    select: { id: true, departmentRequirementRaw: true },
  });

  let linked = 0;
  for (const posting of postings) {
    if (!posting.departmentRequirementRaw) continue;
    const normalizedText = normalize(posting.departmentRequirementRaw);
    const matchedTerm = terms.find((t) => normalizedText.includes(normalize(t)));
    if (!matchedTerm) continue;

    await prisma.postingDepartment.upsert({
      where: {
        postingId_departmentId: { postingId: posting.id, departmentId },
      },
      update: {},
      create: { postingId: posting.id, departmentId, matchedAlias: matchedTerm },
    });
    linked++;
  }

  return linked;
}

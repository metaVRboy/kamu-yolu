import { Prisma } from "@/generated/prisma/client";
import type { EducationLevel } from "@/generated/prisma/enums";
import { prisma } from "@/lib/prisma";

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

function normalize(text: string): string {
  return text
    .toLocaleLowerCase("tr-TR")
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "");
}

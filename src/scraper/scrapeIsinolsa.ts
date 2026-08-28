import { PrismaClient } from "@/generated/prisma/client";
import { EducationLevel } from "@/generated/prisma/enums";
import { fetchIsinolsaIlanlari } from "./isinolsaClient";
import { detectEducationLevels, detectInstitutionType } from "./parseRequirements";
import { matchDepartmentsForText } from "@/lib/matching";
import { notifyUsersForMatchedPosting } from "@/lib/notifications";

export const SOURCE_NAME = "İşin Olsa";

export type ScrapeSummary = {
  postingsFound: number;
  positionsProcessed: number;
  unmatchedCount: number;
  staleDeactivated: number;
};

/**
 * isinolsa.com'daki guncel kamu ilanlari listesini cekip veritabanini
 * gunceller. Kariyer Kapisi'nin aksine bu kaynak yalnizca kisa bir baslik
 * verir (ayrintili "aranan nitelikler" metni yok); bolum/ogrenim duzeyi
 * eslestirmesi bu yuzden baslik metninden yapilir - Kariyer Kapisi'ndaki
 * kadar kesin degildir ama hicbir bolume atanmayan ilanlar da "genel ilan"
 * akisindan gizlenmez, sadece siteye "genel" ilan olarak eklenir.
 */
export async function scrapeIsinolsa(prisma: PrismaClient): Promise<ScrapeSummary> {
  const run = await prisma.scrapeRun.create({
    data: { sourceName: SOURCE_NAME, status: "RUNNING" },
  });

  try {
    const ilanlar = await fetchIsinolsaIlanlari();
    const seenExternalIds = new Set<string>();
    let unmatchedCount = 0;

    for (const ilan of ilanlar) {
      seenExternalIds.add(ilan.externalId);

      const institutionType = detectInstitutionType(ilan.kurumAdi);
      const levels = detectEducationLevels(ilan.baslik);
      const educationLevels = levels.length > 0 ? levels : [EducationLevel.LISANS];

      const matches = await matchDepartmentsForText(ilan.baslik);
      if (matches.length === 0) unmatchedCount++;

      const existing = await prisma.posting.findUnique({
        where: { externalId: ilan.externalId },
        select: { id: true },
      });

      const posting = await prisma.posting.upsert({
        where: { externalId: ilan.externalId },
        update: {
          title: ilan.baslik,
          institutionName: ilan.kurumAdi,
          institutionType,
          sourceUrl: ilan.detayUrl,
          educationLevels,
          departmentRequirementRaw: ilan.baslik,
          isDepartmentRestricted: matches.length > 0,
          applicationStart: ilan.applicationStart,
          applicationEnd: ilan.applicationEnd,
          isActive: true,
          scrapedAt: new Date(),
        },
        create: {
          externalId: ilan.externalId,
          title: ilan.baslik,
          institutionName: ilan.kurumAdi,
          institutionType,
          sourceName: SOURCE_NAME,
          sourceUrl: ilan.detayUrl,
          educationLevels,
          departmentRequirementRaw: ilan.baslik,
          isDepartmentRestricted: matches.length > 0,
          applicationStart: ilan.applicationStart,
          applicationEnd: ilan.applicationEnd,
          publishedAt: ilan.applicationStart ?? new Date(),
          isActive: true,
        },
      });

      await prisma.postingDepartment.deleteMany({ where: { postingId: posting.id } });
      for (const match of matches) {
        await prisma.postingDepartment.create({
          data: {
            postingId: posting.id,
            departmentId: match.departmentId,
            matchedAlias: match.matchedAlias,
          },
        });
      }

      if (!existing && matches.length > 0) {
        const departments = await prisma.department.findMany({
          where: { id: { in: matches.map((m) => m.departmentId) } },
          select: { id: true, slug: true },
        });
        await notifyUsersForMatchedPosting({
          postingTitle: ilan.baslik,
          departments: departments.map((d) => ({ departmentId: d.id, slug: d.slug })),
        });
      }
    }

    const staleResult = await prisma.posting.updateMany({
      where: {
        sourceName: SOURCE_NAME,
        isActive: true,
        externalId: { notIn: Array.from(seenExternalIds) },
      },
      data: { isActive: false },
    });

    const summary: ScrapeSummary = {
      postingsFound: ilanlar.length,
      positionsProcessed: seenExternalIds.size,
      unmatchedCount,
      staleDeactivated: staleResult.count,
    };

    await prisma.scrapeRun.update({
      where: { id: run.id },
      data: {
        status: "SUCCESS",
        finishedAt: new Date(),
        postingsFound: summary.postingsFound,
        positionsProcessed: summary.positionsProcessed,
        unmatchedCount: summary.unmatchedCount,
        staleDeactivated: summary.staleDeactivated,
      },
    });

    return summary;
  } catch (err) {
    await prisma.scrapeRun.update({
      where: { id: run.id },
      data: {
        status: "FAILED",
        finishedAt: new Date(),
        errorMessage: err instanceof Error ? err.message : String(err),
      },
    });
    throw err;
  }
}

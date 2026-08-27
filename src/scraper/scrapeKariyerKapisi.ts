import { PrismaClient } from "@/generated/prisma/client";
import { EducationLevel } from "@/generated/prisma/enums";
import {
  fetchAltIlanlar,
  fetchIlanList,
  ilanDetayUrl,
} from "./kariyerKapisiClient";
import {
  detectEducationLevels,
  detectInstitutionType,
  isGenericNoRestriction,
  stripBbCode,
} from "./parseRequirements";
import { matchDepartmentsForText } from "@/lib/matching";
import { notifyUsersForMatchedPosting } from "@/lib/notifications";

export const SOURCE_NAME = "Kariyer Kapısı";

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export type ScrapeSummary = {
  postingsFound: number;
  positionsProcessed: number;
  unmatchedCount: number;
  staleDeactivated: number;
  unmatchedSamples: string[];
};

/**
 * Kariyer Kapisi'ndaki aktif ilanlari cekip veritabanini gunceller.
 * Her cagri icin bir ScrapeRun kaydi tutar, boylece otomatik/zamanlanmis
 * calismalarin basarili olup olmadigi ve ne zaman calistigi denetlenebilir.
 */
export async function scrapeKariyerKapisi(
  prisma: PrismaClient,
): Promise<ScrapeSummary> {
  const run = await prisma.scrapeRun.create({
    data: { sourceName: SOURCE_NAME, status: "RUNNING" },
  });

  try {
    const ilanList = await fetchIlanList();

    const seenExternalIds = new Set<string>();
    const unmatchedTexts: string[] = [];

    for (const ilan of ilanList) {
      if (ilan.sonDurumu !== "Aktif") continue;

      let altIlanlar;
      try {
        altIlanlar = await fetchAltIlanlar(ilan.guid);
      } catch (err) {
        console.error(`Alt ilan çekilemedi (${ilan.guid}):`, err);
        continue;
      }

      const institutionType = detectInstitutionType(ilan.kurumAdi);
      const sourceUrl = ilanDetayUrl(ilan.guid);

      for (let i = 0; i < altIlanlar.length; i++) {
        const alt = altIlanlar[i];
        const externalId = `kariyerkapisi:${ilan.guid}:${i}`;
        seenExternalIds.add(externalId);

        const requirementText = stripBbCode(alt.ilanMetni ?? "");
        const levels = detectEducationLevels(requirementText);
        const educationLevels =
          levels.length > 0 ? levels : [EducationLevel.LISANS];

        const matches = await matchDepartmentsForText(requirementText);
        const isDepartmentRestricted =
          matches.length > 0 || !isGenericNoRestriction(requirementText);
        if (matches.length === 0) {
          unmatchedTexts.push(requirementText.slice(0, 200));
        }

        const title = `${alt.unvan} — ${ilan.kurumAdi}`;
        const iller = Array.from(
          new Set((alt.kontenjanList ?? []).map((k) => k.il.trim()).filter(Boolean)),
        );

        const existing = await prisma.posting.findUnique({
          where: { externalId },
          select: { id: true },
        });

        const posting = await prisma.posting.upsert({
          where: { externalId },
          update: {
            title,
            institutionName: ilan.kurumAdi,
            institutionType,
            ilanTuru: ilan.ilanTuru ?? null,
            iller,
            sourceUrl,
            educationLevels,
            departmentRequirementRaw: requirementText,
            isDepartmentRestricted,
            applicationStart: ilan.basTarih ? new Date(ilan.basTarih) : null,
            applicationEnd: ilan.bitTarih ? new Date(ilan.bitTarih) : null,
            isActive: true,
            scrapedAt: new Date(),
          },
          create: {
            externalId,
            title,
            institutionName: ilan.kurumAdi,
            institutionType,
            ilanTuru: ilan.ilanTuru ?? null,
            iller,
            sourceName: SOURCE_NAME,
            sourceUrl,
            educationLevels,
            departmentRequirementRaw: requirementText,
            isDepartmentRestricted,
            applicationStart: ilan.basTarih ? new Date(ilan.basTarih) : null,
            applicationEnd: ilan.bitTarih ? new Date(ilan.bitTarih) : null,
            publishedAt: ilan.basTarih ? new Date(ilan.basTarih) : new Date(),
            isActive: true,
          },
        });

        await prisma.postingDepartment.deleteMany({
          where: { postingId: posting.id },
        });
        for (const match of matches) {
          await prisma.postingDepartment.create({
            data: {
              postingId: posting.id,
              departmentId: match.departmentId,
              matchedAlias: match.matchedAlias,
            },
          });
        }

        // Sadece yeni eklenen ilanlar icin bildirim gonder; her taramada
        // ayni aktif ilan icin tekrar tekrar bildirim gitmesin.
        if (!existing && matches.length > 0) {
          const departments = await prisma.department.findMany({
            where: { id: { in: matches.map((m) => m.departmentId) } },
            select: { id: true, slug: true },
          });
          await notifyUsersForMatchedPosting({
            postingTitle: title,
            departments: departments.map((d) => ({ departmentId: d.id, slug: d.slug })),
          });
        }
      }

      await sleep(300);
    }

    await prisma.posting.updateMany({
      where: { isDemo: true, isActive: true },
      data: { isActive: false },
    });

    const staleResult = await prisma.posting.updateMany({
      where: {
        sourceName: SOURCE_NAME,
        isActive: true,
        externalId: { notIn: Array.from(seenExternalIds) },
      },
      data: { isActive: false },
    });

    const summary: ScrapeSummary = {
      postingsFound: ilanList.length,
      positionsProcessed: seenExternalIds.size,
      unmatchedCount: unmatchedTexts.length,
      staleDeactivated: staleResult.count,
      unmatchedSamples: unmatchedTexts.slice(0, 15),
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
